const { GoogleGenAI } = require("@google/genai");
// Prompt dedup cache
let promptCache;
try {
    const lruMod = require('lru-cache');
    const LRUCtor = lruMod.LRUCache || lruMod;
    promptCache = new LRUCtor({ max: 500, ttl: 5000 });
} catch (_) {
    const _m = new Map();
    promptCache = {
        has: (k) => _m.has(k),
        get: (k) => _m.get(k),
        set: (k, v) => { _m.set(k, v); setTimeout(() => _m.delete(k), 5000); },
    };
}

class AIProvider {
    constructor() {
        this.provider = process.env.AI_PROVIDER || "gemini";
        this.primaryModel = process.env.AI_MODEL || "gemini-2.0-flash";
        this.fallbackModel = process.env.AI_FALLBACK_MODEL || "gemini-2.0-flash-lite";
        this.timeoutMs = parseInt(process.env.AI_TIMEOUT || "8000", 10);
        this.maxRetries = parseInt(process.env.AI_MAX_RETRIES || "1", 10);
        this.temperature = parseFloat(process.env.AI_TEMPERATURE || "0.3");

        const apiKey = process.env.AI_API_KEY || process.env.GEMINI_API_KEY || "";
        this.hasValidApiKey = Boolean(apiKey && apiKey.length > 10 && !apiKey.includes("dummy") && !apiKey.includes("your_key"));
        this.ai = this.hasValidApiKey ? new GoogleGenAI({ apiKey }) : null;
        this.unusableModels = new Set();
    }

    _isModelUnavailableError(err) {
        if (!err || !err.message) return false;
        const msg = err.message.toLowerCase();
        return (
            msg.includes("404") ||
            msg.includes("not found") ||
            msg.includes("no longer available") ||
            msg.includes("unsupported model")
        );
    }

    _isNonRetryableAuthError(err) {
        if (!err || !err.message) return false;
        const msg = err.message.toLowerCase();
        return (
            msg.includes("api key") ||
            msg.includes("unauthenticated") ||
            msg.includes("permission_denied") ||
            msg.includes("401") ||
            msg.includes("403")
        );
    }

    _isNonRetryableError(err) {
        return this._isModelUnavailableError(err) || this._isNonRetryableAuthError(err);
    }

    /**
     * Generates text content using configured primary and fallback models.
     * @param {string} prompt - Consolidated system + user prompt
     * @param {Object} options - Custom options (temperature, model override, timeout)
     * @returns {Promise<{text: string, modelUsed: string, latencyMs: number, error?: string}>}
     */
    async generateContent(prompt, options = {}) {
        const startTime = Date.now();

        if (!this.hasValidApiKey || !this.ai) {
            return {
                text: null,
                modelUsed: "none",
                latencyMs: Date.now() - startTime,
                error: "AI_API_KEY missing or invalid"
            };
        }

        // Check cache for identical prompt
        const cacheKey = prompt;
        if (promptCache.has(cacheKey)) {
            const cached = promptCache.get(cacheKey);
            return { ...cached, latencyMs: Date.now() - startTime };
        }

        // Primary -> Single verified fallback model
        const candidateModels = [
            options.model || this.primaryModel,
            this.fallbackModel
        ];

        // Deduplicate while preserving order and filtering known unusable/404 models
        const uniqueModels = [...new Set(candidateModels)].filter(m => !this.unusableModels.has(m));

        if (uniqueModels.length === 0) {
            return {
                text: null,
                modelUsed: "none",
                latencyMs: Date.now() - startTime,
                error: "All configured AI models marked unusable"
            };
        }

        for (const modelName of uniqueModels) {
            for (let attempt = 0; attempt <= this.maxRetries; attempt++) {
                try {
                    const result = await this._callWithTimeout(
                        this.ai.models.generateContent({
                            model: modelName,
                            contents: prompt,
                            config: {
                                temperature: options.temperature || this.temperature
                            }
                        }),
                        options.timeoutMs || this.timeoutMs
                    );

                    if (result && result.text && result.text.trim().length > 10) {
                        const response = {
                            text: result.text.trim(),
                            modelUsed: modelName,
                            latencyMs: Date.now() - startTime
                        };
                        // cache successful response
                        promptCache.set(cacheKey, { text: response.text, modelUsed: response.modelUsed, latencyMs: response.latencyMs });
                        return response;
                    }
                } catch (err) {
                    console.warn(`[AIProvider] Model '${modelName}' attempt ${attempt + 1} failed: ${err.message}`);

                    if (this._isModelUnavailableError(err)) {
                        this.unusableModels.add(modelName);
                        break;
                    }
                    if (this._isNonRetryableAuthError(err)) {
                        this.hasValidApiKey = false;
                        break;
                    }

                    if (attempt < this.maxRetries) {
                        await new Promise(r => setTimeout(r, 250 * (attempt + 1))); // Exponential backoff delay
                    }
                }
            }
        }

        return {
            text: null,
            modelUsed: "none",
            latencyMs: Date.now() - startTime,
            error: "All AI model attempts exhausted"
        };
    }

    _callWithTimeout(promise, ms) {
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => reject(new Error(`AI Request timed out after ${ms}ms`)), ms);
        });
        return Promise.race([promise, timeoutPromise]).finally(() => {
            if (timeoutId) clearTimeout(timeoutId);
        });
    }
}

module.exports = new AIProvider();

