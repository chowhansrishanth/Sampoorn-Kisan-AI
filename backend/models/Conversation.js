const mongoose = require("mongoose");

const conversationSchema = new mongoose.Schema({
    sessionId: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: false, index: true },
    shortTerm: [
        {
            sender: { type: String, enum: ["user", "bot"], required: true },
            text: { type: String, required: true },
            agent: { type: String, default: "Sahayak AI" },
            timestamp: { type: Date, default: Date.now }
        }
    ],
    structured: {
        location: { type: String, default: null },
        state: { type: String, default: null },
        district: { type: String, default: null },
        village: { type: String, default: null },
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
        accuracy: { type: Number, default: null },
        soil_type: { type: String, default: null },
        water_availability: { type: String, default: null },
        irrigation_method: { type: String, default: null },
        season: { type: String, default: null },
        current_crop: { type: String, default: null },
        previous_crop: { type: String, default: null },
        land_size: { type: String, default: null },
        budget_level: { type: String, default: null },
        farming_objective: { type: String, default: null },
        preferred_language: { type: String, default: "EN" },
        crops: [mongoose.Schema.Types.Mixed],
        last_updated: { type: String }
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Conversation", conversationSchema);
