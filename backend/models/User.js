const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, enum: ['farmer', 'admin'], default: 'farmer' },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: false },
    password: { type: String, required: true },
    location: { type: String, default: "Punjab, India" },
    locationObj: {
      formattedAddress: String,
      district: String,
      state: String,
      country: String,
      accuracy: Number
    },
    cropType: { type: String, default: "Wheat & Rice" },
    farmSizeHectares: { type: Number, default: 2.5 },
    farmProfile: {
      location: mongoose.Schema.Types.Mixed,
      land: mongoose.Schema.Types.Mixed,
      crops: [mongoose.Schema.Types.Mixed],
      primaryCrop: { type: String, default: "Wheat & Rice" },
      irrigation: [String],
      soilType: { type: String, default: "black" },
      season: { type: String, default: "kharif" },
      farmingMethod: { type: String, default: "Conventional" },
      goals: [String],
      hasLivestock: { type: Boolean, default: false },
      livestockTypes: [String]
    },
    preferredLanguage: { type: String, default: "English" },
    resetPasswordToken: { type: String, required: false },
    resetPasswordExpires: { type: Date, required: false },
    passwordChangedAt: { type: Date, required: false },
    sessionVersion: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date, required: false },
    fcmToken: { type: String, required: false },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", userSchema);
