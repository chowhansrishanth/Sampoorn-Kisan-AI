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

const soilDataService = require("../services/soilDataService");
const weatherService = require("../services/weatherService");
const { optionalAuth } = require("../middleware/authMiddleware");

// ── GET & POST /api/location/agricultural-inputs ────────────────────────────
async function handleAgriculturalInputs(req, res) {
    try {
        const lat = Number(req.query.lat ?? req.body?.lat);
        const lon = Number(req.query.lon ?? req.body?.lon);
        const accuracy = Number(req.query.accuracy ?? req.body?.accuracy) || null;

        if (!Number.isFinite(lat) || !Number.isFinite(lon) || Math.abs(lat) > 90 || Math.abs(lon) > 180) {
            return res.status(400).json({
                success: false,
                error: "📍 Valid farm latitude (-90 to 90) and longitude (-180 to 180) are required."
            });
        }

        // 1. Reverse geocoding
        let locDetails = null;
        try {
            locDetails = await locationService.reverseGeocode(lat, lon, accuracy);
        } catch (e) {
            console.warn("Geocoding failed:", e.message);
        }

        // 2. Authoritative soil data (Priority: Verified SHC -> SoilGrids 0-5cm estimate -> Manual fallback)
        let soilDetails = null;
        try {
            soilDetails = await soilDataService.getSoilData(lat, lon, req.userId || null);
        } catch (e) {
            console.warn("Soil service failed:", e.message);
            soilDetails = {
                source: "Unavailable",
                status: "MANUAL_REQUIRED",
                statusLabel: "Location-based soil data could not be retrieved",
                depth: "0–5 cm",
                statistic: "none",
                retrievedAt: new Date().toISOString(),
                latitude: lat,
                longitude: lon,
                parameters: {
                    N: { value: null, unit: "kg/ha", status: "MANUAL_REQUIRED", statusLabel: "Manual input required" },
                    P: { value: null, unit: "kg/ha", status: "MANUAL_REQUIRED", statusLabel: "Manual input required", note: "Phosphorus: Soil test required" },
                    K: { value: null, unit: "kg/ha", status: "MANUAL_REQUIRED", statusLabel: "Manual input required", note: "Potassium: Soil test required" },
                    ph: { value: null, unit: "pH", status: "MANUAL_REQUIRED", statusLabel: "Manual input required" }
                }
            };
        }

        // 3. Authoritative weather data from Open-Meteo
        let weatherDetails = null;
        try {
            weatherDetails = await weatherService.fetchOpenMeteoWeather(lat, lon);
        } catch (e) {
            console.warn("Weather service failed:", e.message);
        }

        // 4. Construct normalized model inputs with strict honesty
        const soilParams = soilDetails?.parameters || {};
        const weatherTemp = weatherDetails?.temperature ?? null;
        const weatherHum = weatherDetails?.humidity ?? null;
        const weatherRain = weatherDetails?.rainfallAnalysis?.recent14DayRainfallMm ?? (weatherDetails?.precipitation ?? null);

        const modelInputs = {
            N: soilParams.N?.value ?? null,
            P: soilParams.P?.value ?? null,
            K: soilParams.K?.value ?? null,
            ph: soilParams.ph?.value ?? null,
            temperature: weatherTemp,
            humidity: weatherHum,
            rainfall: weatherRain
        };

        const missingFields = Object.entries(modelInputs)
            .filter(([, v]) => v === null || v === undefined || Number.isNaN(v))
            .map(([k]) => k);

        return res.json({
            success: true,
            disclaimer: "GPS identifies the farm location. Soil properties are retrieved from available soil datasets or verified soil-test records; GPS itself does not measure soil chemistry.",
            retrievedAt: new Date().toISOString(),
            location: {
                latitude: lat,
                longitude: lon,
                accuracy: accuracy,
                accuracyWarning: accuracy && accuracy > 5000 
                    ? `GPS accuracy is low (±${(accuracy / 1000).toFixed(1)} km). Soil estimates may be less precise.`
                    : null,
                village: locDetails?.village || null,
                district: locDetails?.district || "Unknown District",
                state: locDetails?.state || "Unknown State",
                country: locDetails?.country || "India",
                formattedAddress: locDetails?.formattedAddress || `${lat.toFixed(4)}, ${lon.toFixed(4)}`
            },
            soil: soilDetails,
            weather: weatherDetails ? {
                source: weatherDetails.source,
                retrievedAt: weatherDetails.retrievedAt,
                timestamp: weatherDetails.timestamp,
                condition: weatherDetails.condition,
                temperature: {
                    value: weatherDetails.temperature,
                    unit: "°C",
                    label: "Current Ambient Air Temperature",
                    source: "Open-Meteo Weather API",
                    status: "WEATHER_API",
                    statusLabel: "Weather API"
                },
                humidity: {
                    value: weatherDetails.humidity,
                    unit: "%",
                    label: "Current Relative Humidity",
                    source: "Open-Meteo Weather API",
                    status: "WEATHER_API",
                    statusLabel: "Weather API"
                },
                rainfall: {
                    value: weatherRain,
                    currentMm: weatherDetails.rainfallAnalysis?.currentPrecipitationMm ?? 0,
                    recent14DayMm: weatherDetails.rainfallAnalysis?.recent14DayRainfallMm ?? null,
                    forecast7DayMm: weatherDetails.rainfallAnalysis?.forecast7DayRainfallMm ?? null,
                    unit: "mm",
                    label: "Recent Precipitation (Past 14 Days)",
                    detail: weatherDetails.rainfallAnalysis?.label || "Open-Meteo observation",
                    source: "Open-Meteo Weather API",
                    status: "WEATHER_API",
                    statusLabel: "Weather API"
                }
            } : {
                source: "Unavailable",
                status: "MANUAL_REQUIRED",
                statusLabel: "Weather data could not be retrieved"
            },
            modelInputs,
            isComplete: missingFields.length === 0,
            missingFields
        });
    } catch (error) {
        console.error("Agricultural Inputs Handler Error:", error.stack || error.message);
        return res.status(500).json({
            success: false,
            error: "Failed to assemble agricultural inputs."
        });
    }
}

router.get("/agricultural-inputs", optionalAuth, asyncHandler(handleAgriculturalInputs));
router.post("/agricultural-inputs", optionalAuth, asyncHandler(handleAgriculturalInputs));

module.exports = router;
