const express = require("express");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const axios = require("axios");
if (process.env.NODE_ENV !== "test") require("dotenv").config();
require("./config/security");

const { connectDB, getStatus: getDbStatus, isDbOperational } = require("./config/db");
const aiRoutes = require("./routes/aiRoutes");
const authRoutes = require("./routes/authRoutes");
const cropRoutes = require("./routes/cropRoutes");
const diseaseRoutes = require("./routes/diseaseRoutes");
const marketRoutes = require("./routes/marketRoutes");
const flRoutes = require("./routes/flRoutes");
const knowledgeRoutes = require("./routes/knowledgeRoutes");
const locationRoutes = require("./routes/locationRoutes");
const benchmarkRoutes = require("./routes/benchmarkRoutes");
const agentRoutes = require("./routes/agentRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const alertRoutes = require("./routes/alertRoutes");
const adminRoutes = require("./routes/adminRoutes");
const irrigationRoutes = require("./routes/irrigationRoutes");
const profitabilityRoutes = require("./routes/profitabilityRoutes");
const readinessConfig = require('./config/readiness');
const mandiForecastRoutes = require("./routes/mandiForecastRoutes");
const cropRotationRoutes = require("./routes/cropRotationRoutes");
const ledgerRoutes = require("./routes/ledgerRoutes");
const satelliteRoutes = require("./routes/satelliteRoutes");
const yieldPredictorRoutes = require("./routes/yieldPredictorRoutes");
const traceabilityRoutes = require("./routes/traceabilityRoutes");
const hireCenterRoutes = require("./routes/hireCenterRoutes");
const soilHealthRoutes = require("./routes/soilHealthRoutes");
const soilMeasurementRoutes = require("./routes/soilMeasurementRoutes");
const tankMixRoutes = require("./routes/tankMixRoutes");
const gddRadarRoutes = require("./routes/gddRadarRoutes");
const livestockRoutes = require("./routes/livestockRoutes");
const organicRoutes = require("./routes/organicRoutes");
const solarPumpRoutes = require("./routes/solarPumpRoutes");
const insuranceRoutes = require("./routes/insuranceRoutes");
const carbonRoutes = require("./routes/carbonRoutes");
const telemetryWs = require("./services/telemetryWs");
const httpClient = require("./services/httpClient");
const aiProvider = require("./services/aiProvider");

const app = express();
app.disable('x-powered-by');
// Set only to the actual trusted proxy addresses/subnets in production.
if (process.env.TRUST_PROXY) app.set('trust proxy', process.env.TRUST_PROXY.split(',').map(value => value.trim()));
const PYTHON_ML_SERVICE = process.env.PYTHON_ML_SERVICE || "http://localhost:8000";

// Ensure uploads directory exists for Multer
const uploadsDirectory = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDirectory)) {
  fs.mkdirSync(uploadsDirectory, { recursive: true });
}

// Allowed CORS origins
const allowedOrigins = (process.env.FRONTEND_ORIGINS || "http://localhost:5173,http://localhost:5174,http://localhost:3000,http://127.0.0.1:5173,http://127.0.0.1:5174,http://127.0.0.1:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

// Production Security Headers Middleware
app.use((req, res, next) => {
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-Frame-Options", "SAMEORIGIN");
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
  res.setHeader("Permissions-Policy", "camera=(), microphone=(), geolocation=(self)");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  if (req.secure || req.headers["x-forwarded-proto"] === "https") {
    res.setHeader("Strict-Transport-Security", "max-age=31536000; includeSubDomains");
  }
  next();
});

// CORS Configuration
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    if (process.env.NODE_ENV === "production") {
      return callback(Object.assign(new Error("Origin not allowed"), { status: 403 }));
    }
    return callback(null, true); // Allow during local development
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization", "Accept", "X-Requested-With", "x-test-rate-limit", "x-test-rate-limit-key"]
}));

const cookieParser = require("cookie-parser");

// Correlate requests without logging sensitive payloads.
app.use((req, res, next) => {
  const supplied = typeof req.headers['x-request-id'] === 'string' ? req.headers['x-request-id'].slice(0, 96) : '';
  req.requestId = supplied || `req_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
  res.setHeader('X-Request-Id', req.requestId);
  const started = Date.now();
  res.on('finish', () => console.info(JSON.stringify({ event: 'http_request', requestId: req.requestId, method: req.method, path: req.path, status: res.statusCode, durationMs: Date.now() - started })));
  next();
});

app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ extended: true, limit: "15mb" }));
app.use(cookieParser());
app.use('/api', require('./middleware/rateLimit').createRateLimiter({ max: 120 }));
app.use('/api/auth', (req, res, next) => {
  res.setHeader('Cache-Control', 'no-store');
  if (process.env.NODE_ENV === 'production' && !isDbOperational()) return res.status(503).json({ success: false, error: 'Account storage is temporarily unavailable.' });
  next();
});

// Uploaded images are temporary private inference inputs; never serve them publicly.

// Connect to MongoDB with graceful fallback
connectDB();

if (process.env.NODE_ENV === "production" && (!process.env.JWT_SECRET || process.env.JWT_SECRET.includes("super_secret") || process.env.JWT_SECRET.includes("your_jwt_secret"))) {
  console.error("🚨 CRITICAL SECURITY WARNING: Production mode requires a cryptographically strong, unique JWT_SECRET set in environment variables!");
} else if (!process.env.JWT_SECRET) {
  console.warn("⚠️  JWT_SECRET is not set. Using the development fallback. Set JWT_SECRET before production.");
}

app.get('/ready', (req, res) => {
  const ready = isDbOperational();
  res.status(ready ? 200 : 503).json({ ready, dependencies: { ...readinessConfig.getConfigurationStatus(), database: ready ? 'READY' : 'UNAVAILABLE' } });
});
let cachedHealth = { at: 0, value: null };

const getHealthDetails = async () => {
  const now = Date.now();
  if (cachedHealth.value && now - cachedHealth.at < 30_000) {
    return cachedHealth.value;
  }

  let aiStatus = aiProvider.hasValidApiKey ? "online" : "fallback_mode";
  let marketStatus = "online";
  let weatherStatus = "online";
  const dbStatus = getDbStatus() ? (isDbOperational() ? "online" : "restricted") : "in_memory_mode";

  try {
    const weatherCheck = await httpClient.get(
      "https://api.open-meteo.com/v1/forecast?latitude=17.3850&longitude=78.4867&current_weather=true",
      { timeout: 2000 }
    );
    if (!weatherCheck.data || !weatherCheck.data.current_weather) weatherStatus = "degraded";
  } catch {
    weatherStatus = "degraded";
  }

  try {
    const marketCheck = await httpClient.get("https://farmer.in/api/open/prices.json", { timeout: 2000 });
    if (!marketCheck.data) marketStatus = "degraded";
  } catch {
    marketStatus = "degraded";
  }

  const value = {
    status: "online",
    service: "Sampoorn Kisan AI Express Backend",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
    services: {
      ai: { status: aiStatus, provider: aiProvider.provider, model: aiProvider.primaryModel },
      market_api: { status: marketStatus, source: "Farmer.in Open Prices API" },
      weather_api: { status: weatherStatus, source: "Open-Meteo API" },
      database: { status: dbStatus, type: "MongoDB" },
    },
  };
  cachedHealth = { at: now, value };
  return value;
};

app.get("/health", async (req, res) => {
  const health = await getHealthDetails();
  res.json(health);
});

app.get("/api/health", async (req, res) => {
  const health = await getHealthDetails();
  res.json(health);
});

app.get("/", (req, res) => {
  res.json({
    message: "Sampoorn Kisan AI Backend Running",
    framework: "Federated Explainable AI (FL-XAI) for Smart Agriculture",
    endpoints: {
      health: "/health",
      ai_health: "/api/ai/health",
      auth: "/api/auth",
      ai_chat: "/api/ai/chat",
      crop_recommendation: "/api/crop/recommend",
      yield_prediction: "/api/crop/yield",
      fertilizer_recommendation: "/api/crop/fertilizer",
      disease_diagnosis: "/api/disease/diagnose",
      disease_uploads: "/api/disease/uploads",
      market_weather: "/api/market/weather & /api/market/mandi",
      federated_learning: "/api/fl/status",
      orchestrate_report: "/api/orchestrate-farm-report",
    },
  });
});

// Mount Routes
app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/crop", cropRoutes);
app.use("/api/disease", diseaseRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/fl", flRoutes);
app.use("/api/knowledge", knowledgeRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/benchmark", benchmarkRoutes);
app.use("/api/agents", agentRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/irrigation", irrigationRoutes);
app.use("/api/profitability", profitabilityRoutes);
app.use("/api/market-forecast", mandiForecastRoutes);
app.use("/api/rotation", cropRotationRoutes);
app.use("/api/ledger", ledgerRoutes);
app.use("/api/satellite", satelliteRoutes);
app.use("/api/yield", yieldPredictorRoutes);
app.use("/api/trace", traceabilityRoutes);
app.use("/api/hire", hireCenterRoutes);
app.use("/api/soil-health", soilHealthRoutes);
app.use("/api/soil", soilMeasurementRoutes);
app.use("/api/tank-mix", tankMixRoutes);
app.use("/api/gdd", gddRadarRoutes);
app.use("/api/livestock", livestockRoutes);
app.use("/api/organic", organicRoutes);
app.use("/api/solar-pump", solarPumpRoutes);
app.use("/api/insurance", insuranceRoutes);
app.use("/api/carbon", carbonRoutes);

app.post("/api/orchestrate-farm-report", async (req, res) => {
  try {
    const { farmer_id, soil_data, location } = req.body || {};

    if (!soil_data || !location || !Number.isFinite(location.lat) || Math.abs(location.lat) > 90 || !Number.isFinite(location.lon) || Math.abs(location.lon) > 180 || ['N','P','K','ph','rainfall'].some(key => !Number.isFinite(soil_data[key]) || soil_data[key] < 0) || soil_data.ph > 14) {
      return res.status(400).json({
        status: "error",
        message: "Missing required soil or location parameters.",
      });
    }

    let weatherData;
    try {
      const weatherService = require("./services/weatherService");
      weatherData = await weatherService.fetchOpenMeteoWeather(location.lat, location.lon);
    } catch {
      return res.status(503).json({ status: 'error', message: 'Weather is unavailable. A farm report cannot be calculated.' });
    }

    const mlPayload = {
      N: Number(soil_data.N),
      P: Number(soil_data.P),
      K: Number(soil_data.K),
      temperature: weatherData.temperature,
      humidity: weatherData.humidity,
      ph: Number(soil_data.ph),
      rainfall: Number(soil_data.rainfall || 600.0),
    };

    let mlRes;
    try { mlRes = await axios.post(`${PYTHON_ML_SERVICE}/predict/crop`, mlPayload, { timeout: 5000 }); }
    catch { return res.status(503).json({ status: 'error', message: 'Crop inference is temporarily unavailable. Please retry later.' }); }
    const mlData = mlRes.data?.data || mlRes.data;
    const recommended_crop = mlData?.recommended_crop;
    const xai_breakdown = mlData?.shap_explanation?.shap_values || mlData?.xai_breakdown || [];
    if (typeof recommended_crop !== 'string' || !recommended_crop.trim() || !Array.isArray(xai_breakdown)) return res.status(502).json({ status: 'error', message: 'Invalid crop inference response.' });

    const report = {
      farmer_id,
      timestamp: new Date().toISOString(),
      recommendation: {
        recommended_crop,
        weather_context: weatherData,
      },
      explainability: {
        summary: `Crop selected based on top factor: ${xai_breakdown[0]?.feature || "soil"} (${xai_breakdown[0]?.impact_percentage || 0}%)`,
        feature_breakdown: xai_breakdown,
      },
      grounded_advisory: [
        "Maintain soil moisture at 40% during the tillering stage.",
        "Apply Zinc Sulphate if leaf yellowing is observed.",
      ],
    };

    return res.json({ status: "success", farm_report: report });
  } catch (err) {
    console.error("Orchestration Error:", err.message);
    return res.status(500).json({
      status: "error",
      message: "Internal Orchestration Failure",
    });
  }
});

app.use((req, res) => {
  res.status(404).json({ success: false, error: "Endpoint not found" });
});

app.use((err, req, res, next) => {
  if (res.headersSent) return next(err);
  const status = err.status || err.statusCode || 500;
  console.error("Unhandled API error:", err.message);
  res.status(status).json({
    success: false,
    error: status >= 500 ? "Internal server error" : (err.message || "Request failed"),
  });
});

const PORT = process.env.PORT || 5000;
const HOST = process.env.HOST || "0.0.0.0";

if (process.env.NODE_ENV !== "test") {
  const server = app.listen(PORT, HOST, () => {
    console.log(`Sampoorn Kisan AI Backend running on http://localhost:${PORT}`);
    // Attach WebSocket IoT Telemetry Server to the same HTTP server
    telemetryWs.attach(server);
  });

  const handleGracefulShutdown = (signal) => {
    console.log(`\n🛑 Received ${signal}. Initiating graceful shutdown...`);
    telemetryWs.close();
    server.close(async () => {
      try {
        const mongoose = require("mongoose");
        if (mongoose.connection.readyState !== 0) {
          await mongoose.connection.close(false);
          console.log("📦 MongoDB connection cleanly closed.");
        }
      } catch (_) {}
      console.log("🌱 Sampoorn Kisan AI Backend shut down cleanly.");
      process.exit(0);
    });

    setTimeout(() => {
      console.error("⚠️ Forced shutdown after 10s timeout.");
      process.exit(1);
    }, 10000).unref();
  };

  process.on("SIGTERM", () => handleGracefulShutdown("SIGTERM"));
  process.on("SIGINT", () => handleGracefulShutdown("SIGINT"));
}

module.exports = app;
