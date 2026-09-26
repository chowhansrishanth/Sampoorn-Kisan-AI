/**
 * Express router for Farm Location & GPS Reverse Geocoding API
 */

const express = require("express");
const router = express.Router();
const locationService = require("../services/locationService");
const asyncHandler = require("../middleware/asyncHandler");

// ── GET /api/location/reverse-geocode ────────────────────────────────────────
router.get("/reverse-geocode", asyncHandler(async (req, res) => {
    try {
        const { lat, lon, accuracy } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({
                success: false,
                error: "📍 Latitude and longitude are required query parameters."
            });
        }

        const result = await locationService.reverseGeocode(lat, lon, accuracy);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.json(result);

    } catch (error) {
        console.error("Reverse Geocode Endpoint Error:", error.stack || error.message);
        return res.status(500).json({
            success: false,
            error: "📍 Server failed to complete location reverse geocoding."
        });
    }
}));

// ── POST /api/location/parse-manual ─────────────────────────────────────────
router.post("/parse-manual", asyncHandler(async (req, res) => {
    try {
        const { location } = req.body;
        const result = locationService.parseManualLocation(location);

        if (!result.success) {
            return res.status(400).json(result);
        }

        return res.json(result);

    } catch (error) {
        return res.status(500).json({
            success: false,
            error: "📍 Failed to parse manual location string."
        });
    }
}));

module.exports = router;
