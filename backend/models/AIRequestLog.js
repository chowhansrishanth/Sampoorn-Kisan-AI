const mongoose = require("mongoose");

const aiRequestLogSchema = new mongoose.Schema({
    requestId: { type: String, required: true, unique: true, index: true },
    sessionId: { type: String, required: true, index: true },
    userId: { type: String, required: false, index: true },
    intent: { type: String, required: true },
    agent: { type: String, required: true },
    modelUsed: { type: String, default: "gemini-2.5-flash" },
    latencyMs: { type: Number, required: true },
    confidence: { type: Number, default: 0.95 },
    validationStatus: { type: String, default: "VALID" },
    sourcesCount: { type: Number, default: 0 },
    error: { type: String, default: null },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("AIRequestLog", aiRequestLogSchema);
