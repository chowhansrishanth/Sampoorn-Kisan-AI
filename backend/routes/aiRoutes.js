const express = require("express");
const router = express.Router();
const asyncHandler = require("../middleware/asyncHandler");
const aiOrchestrator = require("../services/aiOrchestrator");
const conversationMemory = require("../services/conversationMemory");
const aiProvider = require("../services/aiProvider");
const AIRequestLog = require("../models/AIRequestLog");
const modelRegistry = require("../services/modelRegistry");

// ── Health Check ─────────────────────────────────────────────────────────────
router.get("/health", asyncHandler((req, res) => {
    res.json({
        status: "online",
        service: "Sampoorn Kisan Multi-Agent AI Engine",
        provider: aiProvider.provider,
        primary_model: aiProvider.primaryModel,
        fallback_model: aiProvider.fallbackModel,
        has_api_key: aiProvider.hasValidApiKey,
        timestamp: new Date().toISOString(),
        models: modelRegistry.getHealth()
    });
}));

router.use(require('../middleware/authMiddleware').requireAuth);
router.use((req, res, next) => {
  if (req.method === 'POST') {
    const body = req.body || {};
    if (typeof body.message !== 'string' || !body.message.trim() || body.message.length > 8000 || (body.sessionId != null && (typeof body.sessionId !== 'string' || body.sessionId.length > 128)) || (body.history != null && (!Array.isArray(body.history) || body.history.length > 50))) return res.status(400).json({ success: false, error: 'Invalid chat message or history.' });
    if (req.user?.farmProfile) conversationMemory.syncFarmProfileState(req.userId + ':' + (body.sessionId || 'default'), req.user.farmProfile);
    req.body = { ...body, userId: req.userId, sessionId: req.userId + ':' + (body.sessionId || 'default') };
  }
  next();
});
// ── Standard AI Chat Endpoint ────────────────────────────────────────────────
router.post("/chat", async (req, res) => {
    const requestId = "req_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    try {
        const { message, language = "EN", history = [], sessionId = "default_session", userId = null } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({
                success: false,
                error: "Message is required"
            });
        }

        const result = await aiOrchestrator.processQuery({
            message,
            language,
            history,
            sessionId,
            userId,
            decisionInputs: req.body.decisionInputs || {}
        });

        // Async log telemetry for observability
        try {
            if (AIRequestLog.db && AIRequestLog.db.readyState === 1) {
                AIRequestLog.create({
                    requestId,
                    sessionId,
                    userId,
                    intent: result.intent || "general",
                    agent: result.agent || "Sahayak AI",
                    modelUsed: result.modelUsed || "unavailable",
                    latencyMs: result.latencyMs || 0,
                    confidence: result.confidence ?? null,
                    validationStatus: result.success ? "VALID" : "FAILED",
                    sourcesCount: Array.isArray(result.sources) ? result.sources.length : 0
                }).catch(() => {});
            }
        } catch (e) {}

        return res.json({
            ...result,
            requestId
        });

    } catch (error) {
        console.error(`[AIRoutes Error ${requestId}]:`, error.stack || error.message);
        return res.status(500).json({
            success: false,
            agent: "Sahayak AI",
            response: "AI service is temporarily unavailable. Please try again.",
            error: "An internal AI orchestration error occurred.",
            requestId
        });
    }
});

// ── Server-Sent Events (SSE) AI Chat Stream Endpoint ─────────────────────────
router.post("/chat/stream", async (req, res) => {
    try {
        const { message, language = "EN", history = [], sessionId = "default_session", userId = null } = req.body;

        if (!message || !message.trim()) {
            return res.status(400).json({ error: "Message is required" });
        }

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        // Execute orchestration pipeline
        const result = await aiOrchestrator.processQuery({ message, language, history, sessionId, userId });

        // Send metadata chunk first
        res.write(`data: ${JSON.stringify({ type: "metadata", agent: result.agent, intent: result.intent, sources: result.sources, structured_memory: result.structured_memory })}\n\n`);

        // Stream text in chunks
        const text = result.response || "AI service is temporarily unavailable. Please try again.";
        const chunkSize = 25;
        for (let i = 0; i < text.length && !res.destroyed; i += chunkSize) {
            const chunk = text.slice(i, i + chunkSize);
            res.write(`data: ${JSON.stringify({ type: "text", chunk })}\n\n`);
            await new Promise(r => setTimeout(r, 15));
        }

        res.write(`data: ${JSON.stringify({ type: "done", success: true })}\n\n`);
        res.end();

    } catch (error) {
        console.error("SSE Stream Exception:", error.message);
        if (!res.headersSent) {
            return res.status(500).json({ error: "Streaming failed" });
        }
        res.write(`data: ${JSON.stringify({ type: "error", message: "AI service is temporarily unavailable. Please try again." })}\n\n`);
        res.end();
    }
});

// ── Memory Management Endpoints ─────────────────────────────────────────────
router.get("/memory/:sessionId", (req, res) => {
    const session = conversationMemory.getSession(req.userId + ':' + req.params.sessionId);
    res.json({
        sessionId: req.params.sessionId,
        structured_memory: session.structured,
        message_count: session.shortTerm.length
    });
});

router.delete("/memory/:sessionId", (req, res) => {
    conversationMemory.resetSession(req.userId + ':' + req.params.sessionId);
    res.json({ message: `Session memory for ${req.params.sessionId} cleared successfully.` });
});

module.exports = router;
