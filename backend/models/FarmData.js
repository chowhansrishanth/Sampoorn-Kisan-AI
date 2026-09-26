const mongoose = require("mongoose");

const farmDataSchema = new mongoose.Schema({
    userId: { type: String, default: "demo_farmer" },
    nitrogen: { type: Number, required: true },
    phosphorus: { type: Number, required: true },
    potassium: { type: Number, required: true },
    soilMoisture: { type: Number, required: true },
    phLevel: { type: Number, required: true },
    temperature: { type: Number, required: true },
    humidity: { type: Number, required: true },
    rainfall: { type: Number, required: true },
    timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("FarmData", farmDataSchema);
