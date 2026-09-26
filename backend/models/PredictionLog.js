const mongoose = require("mongoose");

const predictionLogSchema = new mongoose.Schema({
    type: { type: String, enum: ["crop", "disease", "yield", "fl_round"], required: true },
    inputPayload: { type: Object },
    outputResponse: { type: Object },
    xaiMethod: { type: String, enum: ["SHAP", "LIME", "Grad-CAM", "FedAvg"], required: true },
    confidence: { type: Number },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("PredictionLog", predictionLogSchema);
