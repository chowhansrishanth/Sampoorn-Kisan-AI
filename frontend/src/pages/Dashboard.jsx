import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { Droplet, Thermometer, Activity, CloudSun, TrendingUp, Cpu, RefreshCw, CheckCircle2, MapPin, Sparkles, ShieldCheck, Compass, Bell, BellRing, BellOff, Send, AlertTriangle, X, Radio, Mic, MicOff } from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import { StatCard, StatusBadge } from "../components/ui/StatCard";
import { DashboardSkeleton } from "../components/ui/LoadingSkeleton";
import FarmProfileSummary from "../components/FarmProfileSummary";
import FarmProfileWizard from "../components/FarmProfileWizard";
import usePushNotifications from "../hooks/usePushNotifications";
import useVoiceAssistant from "../hooks/useVoiceAssistant";
import MandiArbitrageWidget from "../components/MandiArbitrageWidget";

export default function Dashboard({ user, onUpdateUser }) {
  const navigate = useNavigate();

  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [locationText, setLocationText] = useState(user?.location || "Hyderabad, Telangana, India");
  const [quickPrompt, setQuickPrompt] = useState("");

  const voice = useVoiceAssistant("EN", (spokenText) => {
    setQuickPrompt(spokenText);
  });

  const {
    permission: pushPermission,
    fcmToken,
    isSubscribed: pushSubscribed,
    loading: pushLoading,
    error: pushError,
    subscribe: subscribePush,
    unsubscribe: unsubscribePush,
    sendTestNotification: sendTestPush,
  } = usePushNotifications(user, onUpdateUser);


  const [testSentMsg, setTestSentMsg] = useState("");

  const farmerId = user?.id || user?._id || "guest";

  const alertResource = useApiResource({ url: '/api/alerts/' + farmerId });
  const alerts = alertResource.data?.alerts || [];
  const alertsLoading = alertResource.loading;
  const fetchFarmerAlerts = alertResource.reload;

  const handleDismissAlert = async (alertId) => {
    try {
      await axios.post(`/api/alerts/dismiss/${alertId}`, { farmerId });
      await fetchFarmerAlerts();
    } catch { await fetchFarmerAlerts(); }
  };

  const handleSendTestPush = async () => {
    setTestSentMsg("");
    const res = await sendTestPush(
      "🌾 Live Radar Alert • Sampoorn Kisan AI",
      'This is a requested test notification; it contains no sensor reading or farm alert.'
    );
    if (res?.success) {
      setTestSentMsg("✅ Test push notification dispatched successfully!");
      setTimeout(() => setTestSentMsg(""), 4500);
    }
  };

  const locParts = (locationText || user?.location || 'Hyderabad, Telangana, India').split(',').map(s => s.trim()).filter(Boolean);
  const weatherResource = useApiResource({ url: '/api/market/weather', params: { location: locParts[0] } });
  const marketResource = useApiResource({ url: '/api/market/mandi', params: { state: locParts[1] || user?.state || 'Telangana' } });
  const flResource = useApiResource({ url: '/api/fl/status' });
  const soilResource = useApiResource({ url: '/api/soil/latest' });
  const weather = weatherResource.data;
  const mandi = marketResource.data;
  const flStatus = flResource.data;
  const soilMeasurement = soilResource.data?.measurement;
  // An optional training coordinator must not prevent weather and market data
  // from rendering. Its own card states availability below.
  const loading = weatherResource.loading || marketResource.loading;
  const error = weatherResource.error || marketResource.error;
  const reload = () => { weatherResource.reload(); marketResource.reload(); flResource.reload(); soilResource.reload(); };
  const fetchDashboardData = reload;

  const mandiChartData = useMemo(() => {
    return mandi?.prices ? mandi.prices.filter(p => Number.isFinite(Number(p.modal_price_rs_quintal ?? p.modal_price))).map(p => ({
      name: p.market ? p.market.split(' ')[0] : (p.mandi ? p.mandi.replace(" Mandi", "") : "Market"),
      ModalPrice: Number(p.modal_price_rs_quintal ?? p.modal_price),
      MinPrice: p.min_price ?? null,
      MaxPrice: p.max_price ?? null
    })) : [];
  }, [mandi]);

  const handleLaunchPrompt = (e) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    navigate(`/chat?query=${encodeURIComponent(quickPrompt.trim())}`);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return "Good Morning";
    if (hr < 17) return "Good Afternoon";
    return "Good Evening";
  };

  if (loading && !weather && !mandi) {
    return <DashboardSkeleton />;
  }

  const farmerName = user?.name ? user.name.split(' ')[0] : 'Farmer';

  return (
    <div className="page-container dashboard-page">
      <RequestStatus loading={loading} error={error} onRetry={reload} />
      {/* PAGE HEADER */}
      <PageHeader
        badge="Farm Decision Dashboard"
        icon={Compass}
        title={`${getGreeting()}, ${farmerName}! 🌾 Farmer Command Center`}
        subtitle="Farm context, available weather, market observations and decision tools"
        action={
          <PremiumButton
            variant="primary"
            size="md"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchDashboardData}
          >
            Refresh Telemetry
          </PremiumButton>
        }
      />

      {/* FARM LOCATION STRIP WITH DATA TRUST INDICATORS */}
      <PremiumCard style={{ marginBottom: '24px', background: 'linear-gradient(135deg, rgba(21, 128, 61, 0.06) 0%, rgba(6, 78, 59, 0.03) 100%)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: '#dcfce7', color: '#15803d', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <MapPin size={24} />
            </div>
            <div>
              <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em' }}>Active Farm Location</div>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--fk-text, #0f172a)', fontFamily: 'Outfit, sans-serif' }}>{locationText}</div>
              <div style={{ fontSize: '12px', color: '#15803d', fontWeight: 600, marginTop: '2px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <ShieldCheck size={14} /> Source availability and observation dates are shown with each result
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px' }}>
            <PremiumButton variant="secondary" size="sm" onClick={() => setIsEditingProfile(true)}>
              🌾 Edit Farm Profile
            </PremiumButton>
            <PremiumButton variant="primary" size="sm" onClick={() => navigate("/chat?query=Suggest next crop for my farm profile")}>
              Ask Sahayak AI
            </PremiumButton>
          </div>
        </div>
      </PremiumCard>

      {/* FARM PROFILE SUMMARY WIDGET */}
      <div style={{ marginBottom: '24px' }}>
        <FarmProfileSummary user={user} onEdit={() => setIsEditingProfile(true)} />
      </div>

      {isEditingProfile && (
        <FarmProfileWizard
          user={user}
          onClose={() => setIsEditingProfile(false)}
          onSaveProfile={async (updated) => {
            if (onUpdateUser) await onUpdateUser(updated);
            if (updated.location) setLocationText(updated.location);
          }}
        />
      )}

      {/* FARM ADVISORIES & PUSH ALERTS HUB */}
      <PremiumCard style={{ marginBottom: "24px", border: "1px solid var(--fk-border, #e2e8f0)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ width: "42px", height: "42px", borderRadius: "10px", background: pushSubscribed ? "rgba(34, 197, 94, 0.15)" : "rgba(245, 158, 11, 0.15)", color: pushSubscribed ? "#15803d" : "#d97706", display: "flex", alignItems: "center", justifyContent: "center" }}>
              {pushSubscribed ? <BellRing size={22} /> : <Bell size={22} />}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text, #0f172a)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                  Farm Advisories & Push Alerts Hub
                </h3>
                {pushSubscribed ? (
                  <StatusBadge status="success">Push Active • FCM Device Paired</StatusBadge>
                ) : (
                  <StatusBadge status="warning">Push Inactive</StatusBadge>
                )}
              </div>
              <p style={{ fontSize: "12px", color: "var(--fk-text-sub, #64748b)", margin: "2px 0 0" }}>
                Receive real-time weather alerts, pest hazard advisories, and APMC Mandi price triggers directly on your device.
              </p>
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            {pushSubscribed ? (
              <>
                <PremiumButton
                  variant="secondary"
                  size="sm"
                  icon={Send}
                  loading={pushLoading}
                  onClick={handleSendTestPush}
                  title="Dispatch a test push notification to this device"
                >
                  Send Test Alert
                </PremiumButton>
                <PremiumButton
                  variant="outline"
                  size="sm"
                  icon={BellOff}
                  loading={pushLoading}
                  onClick={unsubscribePush}
                  style={{ color: "#dc2626", borderColor: "rgba(220, 38, 38, 0.3)" }}
                >
                  Disable Push
                </PremiumButton>
              </>
            ) : (
              <PremiumButton
                variant="primary"
                size="sm"
                icon={Bell}
                loading={pushLoading}
                onClick={subscribePush}
              >
                Enable Push Alerts 🔔
              </PremiumButton>
            )}
            <PremiumButton
              variant="outline"
              size="sm"
              icon={RefreshCw}
              loading={alertsLoading}
              onClick={fetchFarmerAlerts}
            >
              Refresh
            </PremiumButton>
          </div>
        </div>

        {/* Feedback messages */}
        {testSentMsg && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.3)", color: "#15803d", fontSize: "13px", fontWeight: "600", marginBottom: "14px" }}>
            {testSentMsg}
          </div>
        )}

        {pushError && (
          <div style={{ padding: "10px 14px", borderRadius: "8px", background: "rgba(239, 68, 68, 0.1)", border: "1px solid rgba(239, 68, 68, 0.3)", color: "#dc2626", fontSize: "13px", fontWeight: "600", marginBottom: "14px" }}>
            ⚠️ {pushError}
          </div>
        )}

        {/* Device FCM Token Info Strip */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--fk-bg, #f8fafc)", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", marginBottom: "16px", fontSize: "12px", color: "var(--fk-text-sub, #64748b)", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Radio size={14} color={pushSubscribed ? "#15803d" : "#94a3b8"} />
            <span>
              <strong>FCM Registration:</strong>{" "}
              {fcmToken ? (
                <code style={{ background: "rgba(0,0,0,0.05)", padding: "2px 6px", borderRadius: "4px", color: "#0f172a" }}>
                  {fcmToken.length > 28 ? `${fcmToken.slice(0, 16)}...${fcmToken.slice(-10)}` : fcmToken}
                </code>
              ) : (
                "No token registered yet. Click 'Enable Push Alerts' to link your browser device."
              )}
            </span>
          </div>
          <div style={{ display: "flex", gap: "12px", fontSize: "11px" }}>
            <span>Browser Permission: <strong style={{ textTransform: "capitalize", color: pushPermission === "granted" ? "#15803d" : "#d97706" }}>{pushPermission}</strong></span>
            <span>Channel: <strong>Firebase FCM (WebPush)</strong></span>
          </div>
        </div>

        {/* Active Alerts List */}
        <div>
          {alertsLoading && alerts.length === 0 ? (
            <div style={{ padding: "16px", textAlign: "center", color: "#64748b", fontSize: "13px" }}>Loading farm alerts...</div>
          ) : alerts.length === 0 ? (
            <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", background: "rgba(34, 197, 94, 0.08)", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.2)" }}>
              <CheckCircle2 size={18} style={{ color: "#15803d", flexShrink: 0 }} />
              <p style={{ fontSize: "13px", color: "var(--fk-text, #0f172a)", margin: 0 }}>
                <strong>All Clear!</strong> No active weather warnings, flood hazards, or severe pest outbreaks recorded for {locationText.split(",")[0]}.
              </p>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {alerts.map((alert) => {
                const isCrit = alert.severity === "critical";
                const isWarn = alert.severity === "warning";
                const bg = isCrit ? "rgba(239, 68, 68, 0.08)" : isWarn ? "rgba(245, 158, 11, 0.08)" : "rgba(2, 132, 199, 0.08)";
                const border = isCrit ? "rgba(239, 68, 68, 0.3)" : isWarn ? "rgba(245, 158, 11, 0.3)" : "rgba(2, 132, 199, 0.3)";
                const textCol = isCrit ? "#dc2626" : isWarn ? "#d97706" : "#0284c7";

                return (
                  <div
                    key={alert.id || alert.key}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      padding: "12px 14px",
                      background: bg,
                      border: `1px solid ${border}`,
                      borderRadius: "8px",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", gap: "10px", alignItems: "flex-start" }}>
                      <AlertTriangle size={18} style={{ color: textCol, flexShrink: 0, marginTop: "2px" }} />
                      <div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "13px", fontWeight: "800", color: "var(--fk-text, #0f172a)" }}>{alert.title}</span>
                          <span style={{ fontSize: "10px", fontWeight: "800", textTransform: "uppercase", padding: "1px 6px", borderRadius: "4px", background: border, color: textCol }}>
                            {alert.severity}
                          </span>
                        </div>
                        <p style={{ fontSize: "12px", color: "var(--fk-text-sub, #475569)", margin: "4px 0 0", lineHeight: 1.4 }}>
                          {alert.message}
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={() => handleDismissAlert(alert.id)}
                      title="Dismiss alert"
                      style={{ background: "none", border: "none", cursor: "pointer", color: "#64748b", padding: "4px", borderRadius: "4px" }}
                    >
                      <X size={16} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </PremiumCard>

      <PremiumCard><h2>Today's Farm Plan</h2><p>{weather?.daily?.precipitation_sum?.[0]!=null?'Forecast rainfall: '+weather.daily.precipitation_sum[0]+' mm. Review irrigation with your field moisture estimate.':'Weather is unavailable; a weather-based irrigation priority cannot be determined.'}</p><p>Fertilizer timing requires a reviewed prescription. No application is automatically scheduled.</p><p>{alertsLoading?'Checking alerts…':alertResource.error?'Alert status is unavailable.':alerts.length+' stored farm alerts. An empty list does not establish absence of disease.'}</p><p>{mandi?.updated_at?'Latest market observation: '+mandi.updated_at:'Current market freshness is unverified.'}</p><div className="decision-actions"><button onClick={()=>navigate('/irrigation')}>Irrigation</button><button onClick={()=>navigate('/fertilizer')}>Fertilizer</button><button onClick={()=>navigate('/profitability')}>Profitability</button><button onClick={()=>navigate('/calendar')}>Crop Calendar</button></div></PremiumCard>

      {/* QUICK SAHAYAK AI LAUNCHER */}
      <PremiumCard style={{ marginBottom: '24px', background: 'linear-gradient(135deg, #064e3b 0%, #15803d 100%)', color: '#ffffff', border: 'none' }}>
        <form onSubmit={handleLaunchPrompt} style={{ display: 'flex', gap: '14px', alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '220px' }}>
            <Sparkles size={22} style={{ color: '#facc15' }} />
            <strong style={{ fontSize: '16px', fontFamily: 'Outfit, sans-serif' }}>Ask Sahayak AI Anything:</strong>
          </div>
          <div style={{ display: "flex", flex: 1, position: "relative", alignItems: "center", minWidth: "260px" }}>
            <input
              type="text"
              value={voice.isListening ? (voice.interimTranscript || "Listening to your voice... 🎙️") : quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder="e.g. 'What is the current Mandi price of Tomato and net expected return?'"
              style={{
                width: "100%",
                padding: "11px 44px 11px 16px",
                borderRadius: "8px",
                border: "none",
                outline: "none",
                fontSize: "14px",
                color: "#0f172a",
                background: "#ffffff",
                boxShadow: voice.isListening ? "0 0 0 2px #ef4444" : "none",
                transition: "all 0.2s ease"
              }}
            />
            {voice.isSttSupported && (
              <button
                type="button"
                onClick={voice.isListening ? voice.stopListening : voice.startListening}
                title={voice.isListening ? "Stop listening" : "Click to speak your question"}
                style={{
                  position: "absolute",
                  right: "8px",
                  background: voice.isListening ? "#ef4444" : "rgba(0,0,0,0.06)",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: voice.isListening ? "#ffffff" : "#15803d",
                  transition: "all 0.2s ease"
                }}
              >
                {voice.isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            )}
          </div>
          <PremiumButton type="submit" variant="secondary" size="md" style={{ background: '#facc15', color: '#0f172a', border: 'none', fontWeight: 800 }}>
            Ask AI 🚀
          </PremiumButton>
        </form>
      </PremiumCard>

      {/* TELEMETRY CARDS */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        <StatCard icon={Droplet} title="Soil Moisture Index" value={soilMeasurement?.moisture != null ? `${soilMeasurement.moisture}%` : 'Unavailable'} subtitle={soilMeasurement?.moisture != null ? `Source: ${soilMeasurement.source} · ${new Date(soilMeasurement.measuredAt).toLocaleDateString()}` : 'Record a field sensor or soil-test measurement.'} color="#2563eb" />
        <StatCard icon={Thermometer} title="Soil Temperature" value={soilMeasurement?.temperature != null ? `${soilMeasurement.temperature}°C` : 'Unavailable'} subtitle={soilMeasurement?.temperature != null ? `Source: ${soilMeasurement.source}` : 'No connected soil-temperature reading.'} color="#d97706" />
        <StatCard icon={Activity} title="NPK Balance" value={soilMeasurement && ['nitrogen','phosphorus','potassium'].some(k => soilMeasurement[k] != null) ? `${soilMeasurement.nitrogen ?? '—'} / ${soilMeasurement.phosphorus ?? '—'} / ${soilMeasurement.potassium ?? '—'}` : 'Unavailable'} subtitle={soilMeasurement ? `N / P / K · ${soilMeasurement.unit || 'reported units'}` : 'Add a soil test to view nutrient measurements.'} color="#15803d" />
        <StatCard icon={Droplet} title="Soil pH Rating" value={soilMeasurement?.ph != null ? soilMeasurement.ph.toFixed(1) : 'Unavailable'} subtitle={soilMeasurement?.ph != null ? `Source: ${soilMeasurement.source}` : 'Add a soil test to view the current pH.'} color="#059669" />
      </div>

      {/* WEATHER & MANDI GRID WITH NET RETURN CALCULATOR */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '24px' }}>
        {/* Weather Forecast Widget */}
        <PremiumCard id="weather">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <CloudSun size={22} style={{ color: '#d97706' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, fontFamily: 'Outfit, sans-serif' }}>Live Weather Radar</h3>
            </div>
            <StatusBadge status="info">Open-Meteo Verified</StatusBadge>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', padding: '16px', background: 'var(--fk-bg, #f8fafc)', borderRadius: '8px' }}>
            <div>
              <h2 style={{ fontSize: '32px', fontWeight: 800, color: 'var(--fk-text, #0f172a)', margin: 0, fontFamily: 'Outfit, sans-serif' }}>
                {weather?.current_temperature_c ?? 'Unavailable'}°C
              </h2>
              <p style={{ fontSize: '14px', color: 'var(--fk-text-sub, #64748b)', fontWeight: 600, margin: '2px 0 0' }}>
                {weather?.condition || 'Unavailable'}
              </p>
            </div>
            <div style={{ fontSize: '13px', display: 'flex', flexDirection: 'column', gap: '4px', color: 'var(--fk-text-sub, #64748b)' }}>
              <div>Humidity: <strong style={{ color: 'var(--fk-text, #0f172a)' }}>{weather?.humidity_percent ?? 'Unavailable'}%</strong></div>
              <div>Rain Probability: <strong style={{ color: 'var(--fk-text, #0f172a)' }}>{weather?.rainfall_probability ?? 'Unavailable'}</strong></div>
              <div>Wind Speed: <strong style={{ color: 'var(--fk-text, #0f172a)' }}>{weather?.wind_speed_kmh ?? 'Unavailable'} km/h</strong></div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '10px', padding: '12px', background: 'rgba(21, 128, 61, 0.08)', borderRadius: '8px', border: '1px solid rgba(21, 128, 61, 0.2)' }}>
            <CheckCircle2 size={20} style={{ color: '#15803d', flexShrink: 0, marginTop: '2px' }} />
            <p style={{ fontSize: '13px', color: 'var(--fk-text, #0f172a)', margin: 0 }}>
              <strong>Agronomic Advice:</strong> {weather?.smart_irrigation_recommendation || 'A current forecast is required for irrigation guidance.'}
            </p>
          </div>
        </PremiumCard>

        {/* Mandi Price Tracker */}
        <PremiumCard id="market">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <TrendingUp size={22} style={{ color: '#15803d' }} />
              <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, fontFamily: 'Outfit, sans-serif' }}>Mandi Price Tracker</h3>
            </div>
            <StatusBadge status="success">Farmer.in Open Data</StatusBadge>
          </div>

          <div style={{ width: "100%", height: 150 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mandiChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fk-border, #e2e8f0)" />
                <XAxis dataKey="name" stroke="var(--fk-text-sub, #64748b)" fontSize={11} tickLine={false} />
                <YAxis domain={[1500, 3500]} stroke="var(--fk-text-sub, #64748b)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--fk-card, #ffffff)", borderColor: "var(--fk-border, #e2e8f0)", color: "var(--fk-text, #0f172a)", borderRadius: "8px" }} />
                <Bar dataKey="ModalPrice" fill="#15803d" name="Modal Price (₹/qtl)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="MaxPrice" fill="#22c55e" name="Max Price (₹/qtl)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </PremiumCard>
      </div>

      {/* APMC MANDI PRICE PREDICTOR & MULTI-MARKET ARBITRAGE MATRIX */}
      <MandiArbitrageWidget defaultCommodity="Tomato" defaultState="Telangana" />

      {/* FEDERATED LEARNING NETWORK STATUS */}
      <PremiumCard>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Cpu size={22} style={{ color: '#9333ea' }} />
            <h3 style={{ fontSize: '17px', fontWeight: 700, margin: 0, fontFamily: 'Outfit, sans-serif' }}>
              Federated Learning Edge Network (coordinator-reported security)
            </h3>
          </div>
          <StatusBadge status={flStatus ? 'info' : 'warning'}>
            {flStatus ? `Round ${flStatus.current_global_round ?? 'Unavailable'} Active` : 'Coordinator unavailable'}
          </StatusBadge>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div style={{ padding: '14px', background: 'var(--fk-bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
            <span style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)' }}>Global Model Accuracy</span>
            <strong style={{ display: 'block', fontSize: '20px', color: 'var(--fk-text, #0f172a)', fontFamily: 'Outfit, sans-serif' }}>
              {flStatus?.metrics?.global_accuracy ?? 'Unavailable'}
            </strong>
          </div>
          <div style={{ padding: '14px', background: 'var(--fk-bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
            <span style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)' }}>Privacy Budget (ε)</span>
            <strong style={{ display: 'block', fontSize: '20px', color: 'var(--fk-text, #0f172a)', fontFamily: 'Outfit, sans-serif' }}>
              {flStatus?.metrics?.privacy_budget_consumed_eps ?? 'Unavailable'} / 10.0
            </strong>
          </div>
          <div style={{ padding: '14px', background: 'var(--fk-bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
            <span style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)' }}>Encryption Standard</span>
            <strong style={{ display: 'block', fontSize: '20px', color: 'var(--fk-text, #0f172a)', fontFamily: 'Outfit, sans-serif' }}>
              {flStatus?.encryption_standard || 'Unverified'}
            </strong>
          </div>
          <div style={{ padding: '14px', background: 'var(--fk-bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
            <span style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)' }}>Participating Farm Nodes</span>
            <strong style={{ display: 'block', fontSize: '20px', color: 'var(--fk-text, #0f172a)', fontFamily: 'Outfit, sans-serif' }}>
              {flStatus?.participating_nodes ?? 'Unavailable'} Nodes Active
            </strong>
          </div>
        </div>
        {!flStatus && (
          <p role="status" style={{ margin: '14px 0 0', color: 'var(--fk-text-sub, #64748b)', fontSize: '13px' }}>
            Federated-learning metrics are unavailable because no verified coordinator is connected. Farm recommendations continue to use their own available services.
          </p>
        )}
      </PremiumCard>
    </div>
  );
}
