import { useState, useEffect, lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import AppShell from "./components/AppShell";
import LoginGate from "./pages/LoginGate";
import ResetPassword from "./pages/ResetPassword";
import api from "./api/client";
import ErrorBoundary from "./components/ErrorBoundary";
import LoadingSkeleton, { CardSkeleton } from "./components/ui/LoadingSkeleton";
import { ThemeProvider } from "./context/ThemeContext";
import { LanguageProvider } from "./context/LanguageContext";

// Route-level code splitting
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DiseaseDiagnosis = lazy(() => import("./pages/DiseaseDiagnosis"));
const XAIDashboard = lazy(() => import("./pages/XAIDashboard"));
const CropRecommendationTool = lazy(() => import("./pages/CropRecommendationTool"));
const KnowledgeHub = lazy(() => import("./pages/KnowledgeHub"));
const GovernmentSchemes = lazy(() => import("./pages/GovernmentSchemes"));
const BenchmarkDashboard = lazy(() => import("./pages/BenchmarkDashboard"));
const AIChat = lazy(() => import("./AIChat"));
const CropCalendar = lazy(() => import("./pages/CropCalendar"));
const FarmerAlerts = lazy(() => import("./pages/FarmerAlerts"));
const IoTTelemetry = lazy(() => import("./pages/IoTTelemetry"));
const AdminPanel = lazy(() => import("./pages/AdminPanel"));
const IrrigationScheduler = lazy(() => import("./pages/IrrigationScheduler"));
const FertilizerPlanner = lazy(() => import('./pages/FertilizerPlanner'));
const ProfitabilityAnalysis = lazy(() => import("./pages/ProfitabilityAnalysis"));
const CropRotationSimulator = lazy(() => import("./pages/CropRotationSimulator"));
const FarmLedger = lazy(() => import("./pages/FarmLedger"));
const SatelliteNDVI = lazy(() => import("./pages/SatelliteNDVI"));
const HireCenter = lazy(() => import("./pages/HireCenter"));
const SoilHealth = lazy(() => import("./pages/SoilHealth"));
const TankMixChecker = lazy(() => import("./pages/TankMixChecker"));
const FarmTraceability = lazy(() => import("./pages/FarmTraceability"));
const GDDRadar = lazy(() => import("./pages/GDDRadar"));
const YieldPredictor = lazy(() => import("./pages/YieldPredictor"));
const MandiForecast = lazy(() => import("./pages/MandiForecast"));
const LivestockAdvisor = lazy(() => import("./pages/LivestockAdvisor"));
const OrganicFarming = lazy(() => import("./pages/OrganicFarming"));
const SolarPump = lazy(() => import("./pages/SolarPump"));
const CropInsurance = lazy(() => import("./pages/CropInsurance"));
const CarbonCredits = lazy(() => import("./pages/CarbonCredits"));
const Weather = lazy(() => import("./pages/Weather"));
const MandiPrices = lazy(() => import("./pages/MandiPrices"));



// ─── localStorage helpers ───────────────────────────────────────────────────
const SESSION_KEY = "sampoorn_user_session";

const saveSession = (user, token) => {
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify({ user, token, savedAt: Date.now() }));
  } catch (e) { void e; /* localStorage unavailable in private mode */ }
};

const loadSession = () => {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const { user, token, savedAt } = JSON.parse(raw);
    // Expire after 7 days
    if (Date.now() - savedAt > 7 * 24 * 60 * 60 * 1000) {
      localStorage.removeItem(SESSION_KEY);
      return null;
    }
    return { user, token };
  } catch {
    return null;
  }
};

const clearSession = () => {
  try { localStorage.removeItem(SESSION_KEY); } catch (e) { void e; }
};
// ────────────────────────────────────────────────────────────────────────────

let restoringSession;
const restoreSession = () => restoringSession ||= api.get("/api/auth/me").finally(() => { restoringSession = null; });

function MainLayout() {
  const [user, setUser] = useState(() => loadSession()?.user || null);
  const [sessionChecked, setSessionChecked] = useState(false);

  // ── Restore session and verify with backend on mount ────────────────────
  useEffect(() => {
    const session = loadSession();
    // Verify session validity with backend (checks token expiration and password revocation)
    restoreSession()
      .then((res) => {
        if (res.data?.user) {
          setUser(res.data.user);
          saveSession(res.data.user, session?.token || "");
        }
      })
      .catch((err) => {
        if (err.response?.status === 401) {
          setUser(null);
          clearSession();
        }
      })
      .finally(() => {
        setSessionChecked(true);
      });
  }, []);

  const handleLoginSuccess = (userData, token) => {
    setUser(userData);
    saveSession(userData, token);
  };

  const handleLogout = async () => {
    try {
      await api.post("/api/auth/logout");
    } catch {
      // Ignore network error on logout
    }
    setUser(null);
    clearSession();
  };

  const handleUpdateUser = (updatedUser) => {
    setUser(updatedUser);
    const session = loadSession();
    saveSession(updatedUser, session?.token || "");
  };

  // ── PWA Install Banner ──────────────────────────────────────────────────
  const [pwaPrompt, setPwaPrompt] = useState(null);
  const [pwaVisible, setPwaVisible] = useState(false);
  useEffect(() => {
    const handler = (e) => { e.preventDefault(); setPwaPrompt(e); setPwaVisible(true); };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);
  const handlePwaInstall = async () => {
    if (!pwaPrompt) return;
    pwaPrompt.prompt();
    await pwaPrompt.userChoice;
    setPwaVisible(false);
    setPwaPrompt(null);
  };
  // ─────────────────────────────────────────────────────────────────────────

  if (!sessionChecked) return <div className="session-loading" role="status">Checking your session…</div>;

  // Dedicated unauthenticated access to Reset Password page
  if (typeof window !== "undefined" && window.location.pathname.startsWith("/reset-password")) {
    return (
      <ResetPassword
        onNavigateLogin={() => {
          window.location.href = "/";
        }}
      />
    );
  }

  if (!user) {
    return <LoginGate onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <AppShell user={user} onLogout={handleLogout} onUpdateUser={handleUpdateUser}>
        <ErrorBoundary>
          <Suspense fallback={
            <div style={{ padding: "32px 24px", maxWidth: "1280px", margin: "0 auto" }}>
              <div style={{ marginBottom: "24px" }}>
                <LoadingSkeleton height="36px" width="320px" style={{ marginBottom: "12px" }} />
                <LoadingSkeleton height="18px" width="500px" />
              </div>
              <CardSkeleton count={3} />
            </div>
          }>
            <Routes>
              <Route path="/" element={<Dashboard user={user} onUpdateUser={handleUpdateUser} />} />
              <Route path="/dashboard" element={<Dashboard user={user} onUpdateUser={handleUpdateUser} />} />
              <Route path="/chat" element={<AIChat user={user} />} />
              <Route path="/disease" element={<DiseaseDiagnosis user={user} />} />
              <Route path="/xai" element={<XAIDashboard />} />
              <Route path="/crop-tool" element={<CropRecommendationTool />} />
              <Route path="/knowledge" element={<KnowledgeHub />} />
              <Route path="/schemes" element={<GovernmentSchemes />} />
              <Route path="/government-schemes" element={<GovernmentSchemes />} />
              <Route path="/benchmark" element={<BenchmarkDashboard />} />
              <Route path="/benchmarks" element={<BenchmarkDashboard />} />
              <Route path="/calendar" element={<CropCalendar user={user} />} />
              <Route path="/alerts" element={<FarmerAlerts user={user} />} />
              <Route path="/iot" element={<IoTTelemetry user={user} />} />
              <Route path="/admin" element={<AdminPanel user={user} />} />
              <Route path="/irrigation" element={<IrrigationScheduler user={user} />} />
              <Route path="/fertilizer" element={<FertilizerPlanner user={user} />} />
              <Route path="/profitability" element={<ProfitabilityAnalysis user={user} />} />
              <Route path="/rotation" element={<CropRotationSimulator user={user} />} />
              <Route path="/ledger" element={<FarmLedger user={user} />} />
              <Route path="/satellite" element={<SatelliteNDVI user={user} />} />
              <Route path="/hire" element={<HireCenter user={user} />} />
              <Route path="/soil-health" element={<SoilHealth user={user} />} />
              <Route path="/tank-mix" element={<TankMixChecker user={user} />} />
              <Route path="/traceability" element={<FarmTraceability user={user} />} />
              <Route path="/trace" element={<FarmTraceability user={user} />} />
              <Route path="/gdd-radar" element={<GDDRadar user={user} />} />
              <Route path="/gdd" element={<GDDRadar user={user} />} />
              <Route path="/yield-predictor" element={<YieldPredictor user={user} />} />
              <Route path="/yield" element={<YieldPredictor user={user} />} />
              <Route path="/mandi-forecast" element={<MandiForecast user={user} />} />
              <Route path="/livestock" element={<LivestockAdvisor user={user} />} />
              <Route path="/organic-farming" element={<OrganicFarming user={user} />} />
              <Route path="/solar-pump" element={<SolarPump user={user} />} />
              <Route path="/crop-insurance" element={<CropInsurance user={user} />} />
              <Route path="/carbon-credits" element={<CarbonCredits user={user} />} />
              <Route path="/weather" element={<Weather user={user} />} />
              <Route path="/mandi" element={<MandiPrices user={user} />} />
              <Route path="/mandi-prices" element={<MandiPrices user={user} />} />
              <Route path="/market" element={<MandiPrices user={user} />} />
              <Route path="/reset-password/:token" element={<ResetPassword onNavigateLogin={() => window.location.href = "/"} />} />
              <Route path="/reset-password" element={<ResetPassword onNavigateLogin={() => window.location.href = "/"} />} />
            </Routes>
          </Suspense>
        </ErrorBoundary>


      {/* PWA Install Banner */}
      {pwaVisible && (
        <div className="pwa-install-banner">
          <span style={{ fontSize: 30 }}>🌾</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 800, fontSize: 14 }}>Install Kisan AI App</div>
            <div style={{ fontSize: 12, opacity: 0.8, marginTop: 2 }}>Add to your home screen for offline access</div>
          </div>
          <button className="pwa-install-btn" onClick={handlePwaInstall}>Install</button>
          <button onClick={() => setPwaVisible(false)} style={{ background: 'none', border: 'none', color: '#ffffff', opacity: 0.6, cursor: 'pointer', fontSize: 19.5, padding: '0 4px' }}>✕</button>
        </div>
      )}
    </AppShell>
  );
}

export default function App() {
  return (
    <BrowserRouter>
        <ThemeProvider>
          <LanguageProvider>
            <MainLayout />
          </LanguageProvider>
        </ThemeProvider>
    </BrowserRouter>
  );
}
