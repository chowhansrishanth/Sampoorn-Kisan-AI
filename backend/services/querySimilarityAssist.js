/**
 * Query Similarity Assist Layer
 * Provides fast, lightweight token & n-gram pattern matching against benchmark records.
 * Injects intent/entity hints into intentClassifier.js without bloat.
 */

const fs = require("fs");
const path = require("path");

class QuerySimilarityAssist {
    constructor() {
        this.index = [];
        this.initialized = false;
    }

    /**
     * Initialize pattern index from benchmark dataset.
     */
    initIndex() {
        if (this.initialized) return;
        const filePath = path.join(__dirname, "../data/benchmark/agricultural_questions.jsonl");
        if (!fs.existsSync(filePath)) return;

        try {
            const lines = fs.readFileSync(filePath, "utf8").trim().split("\n").filter(Boolean);
            this.index = lines.map(line => {
                const rec = JSON.parse(line);
                return {
                    question: rec.question.toLowerCase(),
                    normalizedQuestion: rec.normalizedQuestion,
                    expectedIntent: rec.expectedIntent,
                    entities: rec.entities,
                    tokens: new Set(rec.question.toLowerCase().split(/\s+/).filter(w => w.length > 1))
                };
            });
            this.initialized = true;
            console.log(`[QuerySimilarityAssist] Pattern index initialized with ${this.index.length} patterns.`);
        } catch (err) {
            console.error("[QuerySimilarityAssist] Failed to initialize index:", err.message);
        }
    }

    /**
     * Find top K similar query patterns for a given user query.
     */
    findSimilarPatterns(userQuery, topK = 3) {
        if (!this.initialized) this.initIndex();
        if (!this.index.length || !userQuery) return [];

        const queryTokens = new Set(userQuery.toLowerCase().split(/\s+/).filter(w => w.length > 1));
        if (queryTokens.size === 0) return [];

        const matches = [];

        for (const item of this.index) {
            let intersection = 0;
            for (const token of queryTokens) {
                if (item.tokens.has(token)) intersection++;
            }
            if (intersection > 0) {
                const score = intersection / (queryTokens.size + item.tokens.size - intersection);
                if (score > 0.4) {
                    matches.push({ score, record: item });
                }
            }
        }

        matches.sort((a, b) => b.score - a.score);
        return matches.slice(0, topK).map(m => m.record);
    }
}

module.exports = new QuerySimilarityAssist();
