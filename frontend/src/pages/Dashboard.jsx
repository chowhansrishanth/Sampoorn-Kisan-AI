import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import useApiResource from "../hooks/useApiResource";
import RequestStatus from "../components/ui/RequestStatus";
import { useLanguage } from "../context/LanguageContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts";
import {
  Sprout,
  Calendar,
  Bug,
  Shield,
  Check,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FlaskConical,
  Droplet,
  CloudSun,
  TrendingUp,
  RefreshCw,
  Compass,
  Mic,
  MicOff,
  ArrowRight,
  DollarSign,
  Zap,
  FileText,
  Calculator,
  Share2,
  Printer,
  Stethoscope,
  CalendarDays,
  Sliders,
  CheckSquare,
  Square,
  Activity,
  PhoneCall,
  Sparkles
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import { StatusBadge } from "../components/ui/StatCard";
import { DashboardSkeleton } from "../components/ui/LoadingSkeleton";
import FarmProfileWizard from "../components/FarmProfileWizard";
import FarmProfileSummary from "../components/FarmProfileSummary";
import useVoiceAssistant from "../hooks/useVoiceAssistant";

// Data sources
import { CROP_DATABASE } from "../data/cropLifecycleData";
import {
  CROP_DETAILED_MILESTONES,
  CROP_ECONOMICS,
  CROP_WATER_STAGES,
  CROP_BRIEF_STAGES,
  CROP_NUTRIENT_DEFICIENCIES
} from "../data/cropDetailedPlanData";

export default function Dashboard({ user, onUpdateUser }) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // Extract Farmer's registered profile crops
  const userFarmCrops = useMemo(() => {
    const profileCrops = user?.farmProfile?.crops;
    if (Array.isArray(profileCrops) && profileCrops.length > 0) {
      return profileCrops.map((c) => {
        const found =
          CROP_DATABASE[c.id] ||
          Object.values(CROP_DATABASE).find((db) =>
            db.name.toLowerCase().includes(String(c.name || "").toLowerCase())
          );
        return {
          id: found?.id || c.id || "cotton",
          name: found?.name || c.name || "Crop",
          icon: found?.icon || c.icon || "🌱",
          area: c.area || null,
          isPrimary: !!c.isPrimary
        };
      });
    }
    return [
      { id: "cotton", name: "Bt Hybrid Cotton", icon: "🌿", area: 3, isPrimary: true }
    ];
  }, [user]);

  // Active Crop selection
  const [selectedCropId, setSelectedCropId] = useState(() => {
    const profileCrops = user?.farmProfile?.crops;
    if (Array.isArray(profileCrops) && profileCrops.length > 0) {
      const primary = profileCrops.find((c) => c.isPrimary) || profileCrops[0];
      const match =
        CROP_DATABASE[primary.id] ||
        Object.values(CROP_DATABASE).find((db) =>
          db.name.toLowerCase().includes(String(primary.name || "").toLowerCase())
        );
      if (match) return match.id;
    }
    return "cotton";
  });

  const crop = CROP_DATABASE[selectedCropId] || CROP_DATABASE.cotton;

  // Selected Day within Season
  const [selectedDay, setSelectedDay] = useState(crop.currentDaySample || 45);
  const [activeTab, setActiveTab] = useState("day_plan"); // 'day_plan' | 'weekly_planner' | 'pesticides' | 'deficiencies' | 'irrigation' | 'economics'
  const [dayPlanViewMode, setDayPlanViewMode] = useState("brief"); // 'brief' | 'detailed'
  const [pesticideFilter, setPesticideFilter] = useState("all");
  const [expandedMilestoneDay, setExpandedMilestoneDay] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [locationText, setLocationText] = useState(user?.location || "Hyderabad, Telangana, India");
  const [quickPrompt, setQuickPrompt] = useState("");
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Profit Simulator overrides
  const [simYield, setSimYield] = useState(null);
  const [simPrice, setSimPrice] = useState(null);

  // Nutrient Doctor selected deficiency
  const [selectedDeficiencyId, setSelectedDeficiencyId] = useState(null);

  const voice = useVoiceAssistant(language || "EN", (spokenText) => {
    setQuickPrompt(spokenText);
  });

  // Location breakdown
  const locParts = (locationText || user?.location || "Hyderabad, Telangana, India")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const weatherResource = useApiResource({
    url: "/api/market/weather",
    params: { location: locParts[0] }
  });
  const marketResource = useApiResource({
    url: "/api/market/mandi",
    params: { state: locParts[1] || user?.state || "Telangana" }
  });
  const soilResource = useApiResource({ url: "/api/soil/latest" });

  const weather = weatherResource.data;
  const mandi = marketResource.data;
  const soilMeasurement = soilResource.data?.measurement;
  const loading = weatherResource.loading || marketResource.loading;
  const error = weatherResource.error || marketResource.error;

  const reload = () => {
    weatherResource.reload();
    marketResource.reload();
    soilResource.reload();
  };

  // Day Milestones for Current Crop
  const milestones = CROP_DETAILED_MILESTONES[selectedCropId] || CROP_DETAILED_MILESTONES.cotton;
  const economics = CROP_ECONOMICS[selectedCropId] || CROP_ECONOMICS.cotton;
  const waterStages = CROP_WATER_STAGES[selectedCropId] || CROP_WATER_STAGES.cotton;
  const briefStages = CROP_BRIEF_STAGES[selectedCropId] || CROP_BRIEF_STAGES.cotton;
  const deficiencies = CROP_NUTRIENT_DEFICIENCIES[selectedCropId] || CROP_NUTRIENT_DEFICIENCIES.cotton;

  // Closest Milestone for Selected Day
  const currentMilestone = useMemo(() => {
    let closest = milestones[0];
    let minDiff = 999;
    milestones.forEach((m) => {
      const diff = Math.abs(m.day - selectedDay);
      if (diff < minDiff) {
        minDiff = diff;
        closest = m;
      }
    });
    return closest;
  }, [milestones, selectedDay]);

  // Next Milestone
  const nextMilestone = useMemo(() => {
    return milestones.find((m) => m.day > selectedDay) || null;
  }, [milestones, selectedDay]);

  // Filter Mandi prices relevant to selected crop
  const mandiChartData = useMemo(() => {
    if (!mandi?.prices) return [];
    return mandi.prices
      .filter((p) => Number.isFinite(Number(p.modal_price_rs_quintal ?? p.modal_price)))
      .slice(0, 5)
      .map((p) => ({
        name: p.market ? p.market.split(" ")[0] : p.mandi ? p.mandi.replace(" Mandi", "") : "Market",
        ModalPrice: Number(p.modal_price_rs_quintal ?? p.modal_price),
        MinPrice: p.min_price ?? null,
        MaxPrice: p.max_price ?? null
      }));
  }, [mandi]);

  // Selected deficiency for nutrient doctor
  const activeDeficiency = useMemo(() => {
    if (!deficiencies || deficiencies.length === 0) return null;
    return deficiencies.find((d) => d.id === selectedDeficiencyId) || deficiencies[0];
  }, [deficiencies, selectedDeficiencyId]);

  // Dynamic 7-day activity lookahead
  const weeklyActivities = useMemo(() => {
    const list = [];
    const baseDay = selectedDay;
    for (let offset = 0; offset < 7; offset++) {
      const dayNum = baseDay + offset;
      if (dayNum > crop.durationDays) break;
      const exactM = milestones.find((m) => m.day === dayNum);
      let title = "";
      let task = "";
      let type = "Routine Inspection";
      let icon = "🌱";

      if (exactM) {
        title = exactM.title;
        task = exactM.action;
        type = exactM.category;
        icon = "⚡";
      } else if (offset === 0) {
        title = `Day ${dayNum}: Active Protocol Follow-up`;
        task = currentMilestone.action;
        type = "Active Today";
        icon = "📍";
      } else if (offset === 1) {
        title = `Day ${dayNum}: Morning Canopy Scouting (6:30–8:30 AM)`;
        task = "Walk diagonally (W-pattern) across field to inspect leaf undersides for sucking pests and early fungal leaf spots.";
        type = "Field Scouting";
        icon = "🔍";
      } else if (offset === 2) {
        title = `Day ${dayNum}: Soil Moisture & Subsurface Check`;
        task = "Probe soil 10 cm deep in root zone. If soil ball crumbles easily in your fist, schedule furrow/drip irrigation.";
        type = "Water Management";
        icon = "💧";
      } else if (offset === 3) {
        title = `Day ${dayNum}: Pest Trap Count & Sticky Sheet Maintenance`;
        task = "Count moths caught in pheromone traps. Re-coat yellow/blue sticky sheets with fresh castor oil if dusty.";
        type = "Pest Surveillance";
        icon = "🪤";
      } else if (offset === 4) {
        title = `Day ${dayNum}: Foliar Booster / Micronutrient Window`;
        task = "Check canopy for micronutrient chlorosis or blossom drop; prepare foliar tank solution if needed.";
        type = "Plant Nutrition";
        icon = "🌿";
      } else if (offset === 5) {
        title = `Day ${dayNum}: Weed & Inter-Cultivation Check`;
        task = "Spot-uproot fast-growing weeds along furrows and field bunds before they flower and disperse weed seeds.";
        type = "Weed Eradication";
        icon = "🌾";
      } else {
        title = `Day ${dayNum}: Weekly Summary & Input Procurement`;
        task = nextMilestone
          ? `Verify inventory for upcoming Day ${nextMilestone.day} milestone (${nextMilestone.title}). Procure required formulations.`
          : "Review overall crop vigor and record weekly farm observations.";
        type = "Planning & Inventory";
        icon = "📦";
      }

      list.push({
        day: dayNum,
        offset,
        title,
        task,
        type,
        icon,
        isMilestoneDay: !!exactM,
        isToday: offset === 0
      });
    }
    return list;
  }, [selectedDay, crop.durationDays, milestones, currentMilestone, nextMilestone]);

  // Simulator calculations
  const effectiveYield = simYield !== null ? simYield : economics.expectedYieldQtl;
  const effectivePrice = simPrice !== null ? simPrice : economics.marketPricePerQtl;
  const simGrossRevenue = effectiveYield * effectivePrice;
  const simExpenses = economics.totalExpenses;
  const simNetProfit = simGrossRevenue - simExpenses;
  const simRoi = simExpenses > 0 ? Math.round((simNetProfit / simExpenses) * 100) : 0;
  const simBreakEvenYield = effectivePrice > 0 ? (simExpenses / effectivePrice).toFixed(1) : 0;

  // Today's 3-step checklist
  const checklistKey1 = `chk_${selectedCropId}_${selectedDay}_1`;
  const checklistKey2 = `chk_${selectedCropId}_${selectedDay}_2`;
  const checklistKey3 = `chk_${selectedCropId}_${selectedDay}_3`;

  const doneCount =
    (completedTasks[checklistKey1] ? 1 : 0) +
    (completedTasks[checklistKey2] ? 1 : 0) +
    (completedTasks[checklistKey3] ? 1 : 0);
  const checklistPct = Math.round((doneCount / 3) * 100);

  // Copy Today's Advisory (WhatsApp format)
  const handleCopyTodayAdvisory = () => {
    const text = `🌾 *Kisan AI Farm Advisory - Day ${selectedDay} (${crop.name})*
Phase: ${currentMilestone.phase} | Priority: ${currentMilestone.priority}

👉 *Today's Core Operation:*
${currentMilestone.action}

💧 *Irrigation Guidance:*
${currentMilestone.irrigation}

🛡️ *Crop Protection / Foliar Spray:*
${currentMilestone.protection}

⏳ *Upcoming Milestone:*
${nextMilestone ? `Day ${nextMilestone.day}: ${nextMilestone.title}` : "Approaching Season Harvest"}

Generated via Kisan AI Command Center | Govt MSP: ${crop.mspValue}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedStatus(true);
        setTimeout(() => setCopiedStatus(false), 2500);
      });
    }
  };

  const handlePrintPlan = () => {
    window.print();
  };

  // Local Soil Data
  const soilData = {
    ph: soilMeasurement?.ph ?? 7.2,
    nitrogen: soilMeasurement?.nitrogen ?? 195,
    phosphorus: soilMeasurement?.phosphorus ?? 18,
    potassium: soilMeasurement?.potassium ?? 285,
    organicCarbon: soilMeasurement?.organic_carbon ?? 0.54,
    zinc: soilMeasurement?.zinc ?? 0.52
  };

  const handleLaunchPrompt = (e) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    navigate(`/chat?query=${encodeURIComponent(quickPrompt.trim())}`);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return t("greeting_morning", "Good Morning");
    if (hr < 17) return t("greeting_afternoon", "Good Afternoon");
    return t("greeting_evening", "Good Evening");
  };

  const farmerName = user?.name ? user.name.split(" ")[0] : t("greeting_farmer", "Farmer");

  const toggleTask = (key) => {
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtered pesticides
  const filteredPesticides = useMemo(() => {
    if (pesticideFilter === "all") return crop.pesticideProtocols;
    if (pesticideFilter === "insect")
      return crop.pesticideProtocols.filter((p) => p.targetCategory.toLowerCase().includes("insect"));
    if (pesticideFilter === "fungal")
      return crop.pesticideProtocols.filter(
        (p) =>
          p.targetCategory.toLowerCase().includes("fungal") ||
          p.targetCategory.toLowerCase().includes("bacterial") ||
          p.targetCategory.toLowerCase().includes("viral")
      );
    if (pesticideFilter === "weed")
      return crop.pesticideProtocols.filter((p) => p.targetCategory.toLowerCase().includes("weed"));
    return crop.pesticideProtocols;
  }, [crop, pesticideFilter]);

  if (loading && !weather && !mandi) {
    return <DashboardSkeleton />;
  }

  const seasonProgressPct = Math.min(100, Math.round((selectedDay / crop.durationDays) * 100));

  return (
    <div className="page-container dashboard-page page-enter">
      <RequestStatus loading={loading} error={error} onRetry={reload} />

      {/* PAGE HEADER */}
      <PageHeader
        badge={t("dash_badge", "Farm Decision Command Center")}
        icon={Compass}
        title={`${getGreeting()}, ${farmerName}! 🌾 ${t("dash_header_title", "Crop Lifecycle & Day-Wise Operations")}`}
        subtitle={t("dash_subtitle", "Complete crop agronomy, interactive day-wise field calendar, and targeted pesticide protection schedule.")}
        action={
          <PremiumButton
            variant="primary"
            size="md"
            icon={RefreshCw}
            loading={loading}
            onClick={reload}
          >
            {t("refresh_data", "Refresh Data")}
          </PremiumButton>
        }
      />

      {/* FARM PROFILE SECTION WITH VOICE GUIDANCE & MULTILINGUAL SYNC */}
      <FarmProfileSummary
        user={user}
        onEdit={() => setIsEditingProfile(true)}
      />

      {/* STREAMLINED ACTIVE CROP & AGRO SPECIFICATIONS CARD */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)",
          border: "1px solid rgba(22, 163, 74, 0.25)",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "22px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)"
        }}
      >
        {/* TOP ROW: FARMER'S ACTIVE CROPS & COMPACT SWITCHER */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px",
            marginBottom: "16px",
            paddingBottom: "14px",
            borderBottom: "1px solid var(--fk-border)"
          }}
        >
          {/* Farmer's Crop Pills */}
          <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
            <span style={{ fontSize: "13.5px", fontWeight: "800", color: "var(--fk-text)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sprout size={17} color="#16a34a" /> {t("my_farm_crops", "My Farm Crops")}:
            </span>
            {userFarmCrops.map((c) => {
              const isSelected = selectedCropId === c.id;
              return (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => {
                    setSelectedCropId(c.id);
                    const newCrop = CROP_DATABASE[c.id];
                    if (newCrop) setSelectedDay(newCrop.currentDaySample || 40);
                  }}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    padding: "6px 12px",
                    borderRadius: "20px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    border: isSelected ? "2px solid #16a34a" : "1px solid var(--fk-border)",
                    background: isSelected ? "#16a34a" : "var(--fk-card)",
                    color: isSelected ? "#ffffff" : "var(--fk-text)",
                    transition: "all 0.15s ease",
                    boxShadow: isSelected ? "0 2px 8px rgba(22, 163, 74, 0.25)" : "none"
                  }}
                >
                  <span style={{ fontSize: "16px" }}>{c.icon}</span>
                  <span>{t("crop_" + c.id, c.name)}</span>
                  {c.area ? (
                    <span
                      style={{
                        fontSize: "11px",
                        background: isSelected ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                        padding: "1px 6px",
                        borderRadius: "10px"
                      }}
                    >
                      {c.area} {t("acres", "Acres")}
                    </span>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Compact Dropdown to Explore Any Database Crop */}
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "12.5px", color: "var(--fk-text-sub)", fontWeight: "600" }}>
              {t("explore_other_crop", "Explore Any Crop")}:
            </span>
            <select
              value={selectedCropId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedCropId(newId);
                const newCrop = CROP_DATABASE[newId];
                if (newCrop) setSelectedDay(newCrop.currentDaySample || 40);
              }}
              style={{
                padding: "6px 10px",
                borderRadius: "8px",
                border: "1px solid var(--fk-border)",
                background: "var(--fk-card)",
                color: "var(--fk-text)",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer",
                outline: "none"
              }}
            >
              {Object.values(CROP_DATABASE).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.icon} {c.name} ({c.durationDays}d · {c.season})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* CROP IDENTITY DETAILS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.15)"
              }}
            >
              {crop.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "22px", fontWeight: "800", color: "var(--fk-text)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                  {t("crop_" + crop.id, crop.name)}
                </h2>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", background: "rgba(22, 163, 74, 0.15)", padding: "2px 8px", borderRadius: "4px" }}>
                  {crop.season}
                </span>
                <span style={{ fontSize: "13px", color: "var(--fk-text-sub)", fontStyle: "italic" }}>
                  ({crop.scientificName})
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "4px 0 0" }}>
                <strong>{t("preferred_soil", "Preferred Soil")}:</strong> {crop.soilPreference} (pH {crop.phRange}) · <strong>{t("spacing", "Spacing")}:</strong> {crop.recommendedSpacing}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <PremiumButton variant="secondary" size="sm" onClick={() => navigate("/crop-tool")}>
              🌱 {t("compare_other_crops", "Compare Crops")}
            </PremiumButton>
            <PremiumButton variant="primary" size="sm" onClick={() => navigate(`/chat?query=Give complete schedule for ${crop.name}`)}>
              {t("ask_sahayak_about", "Ask Sahayak AI About")} {t("crop_" + crop.id, crop.name).split(" ")[0]}
            </PremiumButton>
          </div>
        </div>

        {/* 4 VITAL AGRO STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div style={{ background: "var(--fk-card)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={13} color="#2563eb" /> {t("current_season_day", "Current Season Day")}
            </span>
            <div style={{ fontSize: "19px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>
              Day {selectedDay} of {crop.durationDays}
            </div>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
              {seasonProgressPct}% {t("growth_completed", "Growth Completed")}
            </span>
          </div>

          <div style={{ background: "var(--fk-card)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
              <TrendingUp size={13} color="#16a34a" /> {t("target_yield_msp", "Target Yield & MSP")}
            </span>
            <div style={{ fontSize: "19px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>
              {crop.targetYield}
            </div>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
              {t("govt_msp", "Govt MSP")}: {crop.mspValue}
            </span>
          </div>

          <div style={{ background: "var(--fk-card)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
              <Droplet size={13} color="#0284c7" /> {t("total_water_need", "Total Water Need")}
            </span>
            <div style={{ fontSize: "19px", fontWeight: "800", color: "#0284c7", marginTop: "2px" }}>
              {crop.waterRequirement.split("(")[0]}
            </div>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
              {t("water_tip", "Peak at flowering & seed fill")}
            </span>
          </div>

          <div style={{ background: "var(--fk-card)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
              <FlaskConical size={13} color="#f59e0b" /> {t("prescribed_npk", "Prescribed NPK")}
            </span>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>
              {crop.totalFertilizerDose.split("per")[0]}
            </div>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
              {t("fertilizer_split_tip", "Split at Basal, 30 & 60 DAS")}
            </span>
          </div>
        </div>

        {/* SOIL HEALTH TEST CALIBRATION BAR */}
        <div
          style={{
            marginTop: "14px",
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "8px",
            padding: "10px 14px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "10px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Activity size={18} color="#16a34a" />
            <span style={{ fontSize: "13px", color: "var(--fk-text)" }}>
              <strong>{t("soil_calibration", "Soil Calibration")}:</strong> pH: <strong>{soilData.ph}</strong> · N: <strong>{soilData.nitrogen} kg/ha</strong> · P: <strong>{soilData.phosphorus} kg/ha</strong> · K: <strong>{soilData.potassium} kg/ha</strong> · Zn: <strong>{soilData.zinc} ppm</strong>
            </span>
          </div>
          <Link
            to="/soil-health"
            style={{ fontSize: "12.5px", fontWeight: "700", color: "#2563eb", textDecoration: "none" }}
          >
            {t("update_soil_card", "Update Soil Card →")}
          </Link>
        </div>
      </div>

      {/* UNIFIED INTERACTIVE GROWTH DAY NAVIGATOR & TODAY'S FIELD ACTION PROTOCOL */}
      <div
        className="glass-card"
        style={{
          background: "var(--fk-card)",
          border: "2px solid rgba(37, 99, 235, 0.25)",
          borderRadius: "14px",
          padding: "20px",
          marginBottom: "24px",
          boxShadow: "0 4px 16px rgba(0, 0, 0, 0.03)"
        }}
      >
        {/* DAY SCRUBBER HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sliders size={18} color="#2563eb" />
            <strong style={{ fontSize: "15.5px", color: "var(--fk-text)", fontFamily: "Outfit, sans-serif" }}>
              {t("growth_day_navigator", "Interactive Growth Day Navigator")}:
            </strong>
          </div>
          <span style={{ fontSize: "13.5px", fontWeight: "800", color: "#2563eb", background: "rgba(37, 99, 235, 0.1)", padding: "4px 12px", borderRadius: "20px" }}>
            Day {selectedDay} · {currentMilestone.phase}
          </span>
        </div>

        {/* SLIDER INPUT */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <input
            type="range"
            min="0"
            max={crop.durationDays}
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            style={{
              width: "100%",
              height: "8px",
              borderRadius: "4px",
              accentColor: "#16a34a",
              cursor: "pointer"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11.5px", color: "var(--fk-text-sub)", marginTop: "4px" }}>
            <span>Day 0 ({t("sowing", "Sowing")})</span>
            <span>Day {Math.round(crop.durationDays * 0.25)} ({t("vegetative", "Vegetative")})</span>
            <span>Day {Math.round(crop.durationDays * 0.5)} ({t("flowering", "Flowering")})</span>
            <span>Day {Math.round(crop.durationDays * 0.75)} ({t("boll_pod", "Pod / Boll Dev")})</span>
            <span>Day {crop.durationDays} ({t("harvest", "Harvest")})</span>
          </div>
        </div>

        {/* QUICK JUMP MILESTONE BUTTONS */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center", marginBottom: "18px" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)" }}>
            {t("quick_jump", "Quick Jump")}:
          </span>
          {milestones.map((m) => (
            <button
              key={m.day}
              type="button"
              onClick={() => setSelectedDay(m.day)}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                border: selectedDay === m.day ? "1.5px solid #16a34a" : "1px solid var(--fk-border)",
                background: selectedDay === m.day ? "#16a34a" : "var(--fk-bg)",
                color: selectedDay === m.day ? "#ffffff" : "var(--fk-text)",
                transition: "all 0.15s ease"
              }}
            >
              Day {m.day}
            </button>
          ))}
        </div>

        {/* TODAY'S FIELD ACTION PROTOCOL & 3-STEP CHECKLIST */}
        <div
          style={{
            background: "linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(22, 163, 74, 0.05))",
            border: "1.5px solid rgba(37, 99, 235, 0.2)",
            borderRadius: "10px",
            padding: "16px",
            marginTop: "10px"
          }}
        >
          {/* Action Header & Share Controls */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <Zap size={18} color="#2563eb" />
                <h3 style={{ fontSize: "16.5px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                  {t("protocol_for_day", "Protocol for Day")} {currentMilestone.day}: {currentMilestone.title}
                </h3>
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    color: "#ffffff",
                    background: currentMilestone.priority.includes("Critical") ? "#dc2626" : "#2563eb",
                    padding: "2px 7px",
                    borderRadius: "4px"
                  }}
                >
                  {currentMilestone.priority}
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--fk-text)", margin: "4px 0 0", lineHeight: "1.4" }}>
                👉 <strong>{t("core_operation", "Core Operation")}:</strong> {currentMilestone.action}
              </p>
            </div>

            {/* WhatsApp Share & Print buttons */}
            <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
              <button
                type="button"
                onClick={handleCopyTodayAdvisory}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "1px solid var(--fk-border)",
                  background: copiedStatus ? "#16a34a" : "var(--fk-card)",
                  color: copiedStatus ? "#ffffff" : "var(--fk-text)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                {copiedStatus ? <Check size={13} /> : <Share2 size={13} />}
                {copiedStatus ? t("copied", "Copied!") : t("share_whatsapp", "WhatsApp")}
              </button>
              <button
                type="button"
                onClick={handlePrintPlan}
                style={{
                  padding: "5px 10px",
                  borderRadius: "6px",
                  fontSize: "12.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "1px solid var(--fk-border)",
                  background: "var(--fk-card)",
                  color: "var(--fk-text)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "4px"
                }}
                title={t("print_plan", "Print")}
              >
                <Printer size={13} /> {t("print", "Print")}
              </button>
            </div>
          </div>

          {/* Interactive Checklist Header with Progress */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px", flexWrap: "wrap", gap: "6px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "var(--fk-text-sub)" }}>
              {t("tasks_checklist", "Today's Field Action Checklist")}:
            </span>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <div style={{ width: "100px", height: "5px", background: "var(--fk-border)", borderRadius: "3px", overflow: "hidden" }}>
                <div style={{ width: `${checklistPct}%`, height: "100%", background: checklistPct === 100 ? "#16a34a" : "#2563eb", transition: "width 0.3s ease" }} />
              </div>
              <span style={{ fontSize: "12px", fontWeight: "800", color: checklistPct === 100 ? "#16a34a" : "#2563eb" }}>
                {doneCount}/3 {t("done", "Done")} ({checklistPct}%)
              </span>
            </div>
          </div>

          {/* 3 Interactive Tasks */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { key: checklistKey1, label: t("core_operation_task", "Core Agronomy Operation"), detail: currentMilestone.action, icon: Sprout, color: "#2563eb" },
              { key: checklistKey2, label: t("irrigation_task", "Irrigation Action"), detail: currentMilestone.irrigation, icon: Droplet, color: "#0284c7" },
              { key: checklistKey3, label: t("protection_task", "Plant Protection / Foliar Spray"), detail: currentMilestone.protection, icon: Shield, color: "#16a34a" }
            ].map((item, idx) => {
              const isChecked = !!completedTasks[item.key];
              return (
                <div
                  key={item.key}
                  onClick={() => toggleTask(item.key)}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "10px",
                    padding: "8px 12px",
                    background: isChecked ? "rgba(22, 163, 74, 0.08)" : "var(--fk-card)",
                    border: `1px solid ${isChecked ? "rgba(22, 163, 74, 0.3)" : "var(--fk-border)"}`,
                    borderRadius: "6px",
                    cursor: "pointer",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div style={{ marginTop: "2px", color: isChecked ? "#16a34a" : "var(--fk-text-sub)" }}>
                    {isChecked ? <CheckCircle2 size={16} color="#16a34a" /> : <Square size={16} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", textTransform: "uppercase", color: item.color }}>
                        {t("step", "Step")} {idx + 1}: {item.label}
                      </span>
                      {isChecked && (
                        <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a" }}>✓ {t("completed", "Completed")}</span>
                      )}
                    </div>
                    <p style={{ fontSize: "13px", color: isChecked ? "var(--fk-text-sub)" : "var(--fk-text)", textDecoration: isChecked ? "line-through" : "none", margin: "2px 0 0", lineHeight: "1.4" }}>
                      {item.detail}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* STREAMLINED CROP AGRONOMY TABS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "18px",
          borderBottom: "1px solid var(--fk-border)",
          paddingBottom: "10px",
          flexWrap: "wrap"
        }}
      >
        {[
          { id: "day_plan", label: t("tab_day_plan", "📅 Day-Wise Schedule"), color: "#2563eb", icon: Calendar },
          { id: "weekly_planner", label: t("tab_weekly", "🗓️ 7-Day Farm Outlook"), color: "#0891b2", icon: CalendarDays },
          { id: "pesticides", label: t("tab_pesticides", "🛡️ Crop Protection & Sprays"), color: "#dc2626", icon: Bug },
          { id: "deficiencies", label: t("tab_deficiencies", "🩺 Nutrient Doctor & Diagnosis"), color: "#7c3aed", icon: Stethoscope },
          { id: "irrigation", label: t("tab_irrigation", "💧 Critical Water Stages"), color: "#0284c7", icon: Droplet },
          { id: "economics", label: t("tab_economics", "💰 Cost, Revenue & Profit"), color: "#16a34a", icon: DollarSign }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: isActive ? `2px solid ${tab.color}` : "1px solid var(--fk-border)",
                background: isActive ? `${tab.color}15` : "var(--fk-card)",
                color: isActive ? tab.color : "var(--fk-text)",
                fontWeight: "800",
                fontSize: "13.5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                boxShadow: isActive ? `0 2px 8px ${tab.color}20` : "none"
              }}
            >
              <TabIcon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAY-WISE SCHEDULE (BRIEF ROADMAP & GRANULAR MILESTONES) */}
      {activeTab === "day_plan" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          {/* HEADER WITH VIEW MODE SWITCHER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={20} color="#2563eb" />
                <h3 style={{ fontSize: "19px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                  {t("crop_lifecycle_schedule", "Crop Lifecycle & Day-Wise Schedule")} ({crop.name})
                </h3>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                {t("icar_timeline_sub", "ICAR standardized field timeline: switch between concise 5-stage overview or granular day-by-day operations.")}
              </p>
            </div>

            {/* VIEW MODE TOGGLE */}
            <div style={{ display: "inline-flex", background: "var(--fk-bg)", padding: "3px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
              <button
                type="button"
                onClick={() => setDayPlanViewMode("brief")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "800",
                  border: "none",
                  cursor: "pointer",
                  background: dayPlanViewMode === "brief" ? "#2563eb" : "transparent",
                  color: dayPlanViewMode === "brief" ? "#ffffff" : "var(--fk-text)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                <FileText size={13} /> {t("brief_roadmap", "📋 5-Stage Roadmap")}
              </button>
              <button
                type="button"
                onClick={() => setDayPlanViewMode("detailed")}
                style={{
                  padding: "5px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "800",
                  border: "none",
                  cursor: "pointer",
                  background: dayPlanViewMode === "detailed" ? "#2563eb" : "transparent",
                  color: dayPlanViewMode === "detailed" ? "#ffffff" : "var(--fk-text)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}
              >
                <Calendar size={13} /> {t("granular_daily", "🔍 Granular Day-by-Day")} ({milestones.length})
              </button>
            </div>
          </div>

          {/* VIEW MODE 1: BRIEF STAGE ROADMAP (SUMMARY MATRIX) */}
          {dayPlanViewMode === "brief" && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px", marginBottom: "20px" }}>
                {briefStages.map((s, idx) => {
                  const isCurrentPhase = currentMilestone.phase.toLowerCase().includes(s.stage.split(":")[1]?.trim().toLowerCase().split(" ")[0] || "xyz");
                  return (
                    <div
                      key={idx}
                      style={{
                        background: isCurrentPhase ? "rgba(37, 99, 235, 0.04)" : "var(--fk-bg)",
                        border: isCurrentPhase ? "2px solid #2563eb" : "1px solid var(--fk-border)",
                        borderRadius: "10px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px" }}>
                          <div>
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb", background: "rgba(37, 99, 235, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                              {s.days}
                            </span>
                            <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--fk-text)", margin: "4px 0 0" }}>
                              {s.icon} {s.stage}
                            </h4>
                          </div>
                          {isCurrentPhase && (
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff", background: "#2563eb", padding: "2px 6px", borderRadius: "4px" }}>
                              {t("current_phase", "Active Phase")}
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: "12.5px", fontWeight: "700", color: "#16a34a", margin: "0 0 10px" }}>
                          🎯 {t("focus", "Focus")}: {s.focus}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--fk-text)" }}>
                          <div style={{ background: "var(--fk-card)", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                            <strong style={{ fontSize: "12px", color: "var(--fk-text)", display: "block" }}>
                              🚜 {t("core_action", "Core Action")}:
                            </strong>
                            <span style={{ color: "var(--fk-text-sub)", lineHeight: "1.3", display: "block", marginTop: "2px" }}>
                              {s.keyAction}
                            </span>
                          </div>

                          <div style={{ background: "var(--fk-card)", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                            <strong style={{ fontSize: "12px", color: "#0284c7", display: "block" }}>
                              💧 {t("water_nutrients", "Water & Nutrients")}:
                            </strong>
                            <span style={{ color: "var(--fk-text-sub)", lineHeight: "1.3", display: "block", marginTop: "2px" }}>
                              {s.waterNutrient}
                            </span>
                          </div>

                          <div style={{ background: "var(--fk-card)", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                            <strong style={{ fontSize: "12px", color: "#dc2626", display: "block" }}>
                              🛡️ {t("pest_alert", "Pest & Disease Alert")}:
                            </strong>
                            <span style={{ color: "var(--fk-text-sub)", lineHeight: "1.3", display: "block", marginTop: "2px" }}>
                              {s.pestAlert}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: "12px", borderTop: "1px solid var(--fk-border)", paddingTop: "10px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(s.targetDay)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#2563eb",
                            fontWeight: "800",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          {t("jump_to_day", "Jump to Day")} {s.targetDay} <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* QUICK LIFECYCLE SUMMARY TABLE */}
              <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--fk-border)", background: "rgba(0,0,0,0.02)" }}>
                  <strong style={{ fontSize: "13.5px", color: "var(--fk-text)" }}>
                    📊 {t("lifecycle_comparison", "Quick Lifecycle Summary Matrix")}
                  </strong>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--fk-border)", textAlign: "left", color: "var(--fk-text-sub)" }}>
                        <th style={{ padding: "10px 12px", width: "160px" }}>{t("phase_days", "Phase & Days")}</th>
                        <th style={{ padding: "10px 12px" }}>{t("primary_goal", "Primary Goal")}</th>
                        <th style={{ padding: "10px 12px" }}>{t("water_dosing_brief", "Water & Dosing Brief")}</th>
                        <th style={{ padding: "10px 12px" }}>{t("primary_pest_risk", "Primary Pest Risk")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {briefStages.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: "1px solid var(--fk-border)" }}>
                          <td style={{ padding: "10px 12px", fontWeight: "700", color: "#2563eb" }}>
                            {s.icon} {s.stage.split(":")[0]} ({s.days})
                          </td>
                          <td style={{ padding: "10px 12px", color: "var(--fk-text)" }}>{s.focus}</td>
                          <td style={{ padding: "10px 12px", color: "var(--fk-text-sub)" }}>{s.waterNutrient}</td>
                          <td style={{ padding: "10px 12px", color: "#dc2626" }}>{s.pestAlert.split("(")[0]}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: GRANULAR DAY-BY-DAY ROADMAP (ACCORDION) */}
          {dayPlanViewMode === "detailed" && (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {milestones.map((m) => {
                const isSelected = selectedDay === m.day;
                const isExpanded = expandedMilestoneDay === m.day || (expandedMilestoneDay === null && isSelected);
                return (
                  <div
                    key={m.day}
                    style={{
                      background: isSelected ? "rgba(37, 99, 235, 0.04)" : "var(--fk-bg)",
                      border: isSelected ? "2px solid #2563eb" : "1px solid var(--fk-border)",
                      borderRadius: "8px",
                      padding: "14px 16px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div
                      onClick={() => setExpandedMilestoneDay(isExpanded ? -1 : m.day)}
                      style={{ display: "flex", justifyContent: "space-between", alignItems: "center", cursor: "pointer" }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <span
                          style={{
                            width: "36px",
                            height: "36px",
                            borderRadius: "50%",
                            background: isSelected ? "#2563eb" : "rgba(0,0,0,0.06)",
                            color: isSelected ? "#ffffff" : "var(--fk-text)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "13px",
                            fontWeight: "800"
                          }}
                        >
                          D{m.day}
                        </span>
                        <div>
                          <strong style={{ fontSize: "15px", color: "var(--fk-text)" }}>{m.title}</strong>
                          <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", marginLeft: "8px" }}>
                            ({m.phase})
                          </span>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: "800",
                            color: m.priority.includes("Critical") ? "#dc2626" : "#2563eb",
                            background: m.priority.includes("Critical") ? "rgba(220, 38, 38, 0.1)" : "rgba(37, 99, 235, 0.1)",
                            padding: "2px 7px",
                            borderRadius: "4px"
                          }}
                        >
                          {m.priority}
                        </span>
                        {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                      </div>
                    </div>

                    {isExpanded && (
                      <div style={{ marginTop: "12px", paddingTop: "12px", borderTop: "1px solid var(--fk-border)", display: "flex", flexDirection: "column", gap: "8px" }}>
                        <p style={{ fontSize: "13.5px", color: "var(--fk-text)", margin: 0 }}>
                          🚜 <strong>{t("agronomy_task", "Agronomy Task")}:</strong> {m.action}
                        </p>
                        <p style={{ fontSize: "13px", color: "#0284c7", margin: 0 }}>
                          💧 <strong>{t("irrigation_advisory", "Irrigation")}:</strong> {m.irrigation}
                        </p>
                        <p style={{ fontSize: "13px", color: "#16a34a", margin: 0 }}>
                          🛡️ <strong>{t("plant_protection", "Protection")}:</strong> {m.protection}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 7-DAY FARM ACTIVITY LOOKAHEAD */}
      {activeTab === "weekly_planner" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarDays size={20} color="#0891b2" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                  🗓️ {t("weekly_outlook", "7-Day Farm Action Plan")} (Day {selectedDay} to Day {Math.min(crop.durationDays, selectedDay + 6)})
                </h3>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                {t("weekly_outlook_sub", "Weather-aligned forward schedule: planned morning scouting, spray windows, and irrigation checks.")}
              </p>
            </div>

            <span style={{ fontSize: "13px", color: "#0891b2", background: "rgba(8, 145, 178, 0.1)", padding: "4px 10px", borderRadius: "6px", fontWeight: "700" }}>
              {weather?.condition || "Partly Cloudy"} · {t("wind", "Wind")}: {weather?.wind_speed_kmh ?? 12} km/h
            </span>
          </div>

          {/* 7-DAY CARDS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {weeklyActivities.map((act) => {
              const taskKey = `plan_task_${selectedCropId}_${act.day}`;
              const isDone = !!completedTasks[taskKey];
              return (
                <div
                  key={act.day}
                  style={{
                    background: act.isToday ? "rgba(8, 145, 178, 0.05)" : "var(--fk-bg)",
                    border: act.isToday ? "2px solid #0891b2" : "1px solid var(--fk-border)",
                    borderRadius: "10px",
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "17px" }}>{act.icon}</span>
                        <strong style={{ fontSize: "14.5px", color: act.isToday ? "#0891b2" : "var(--fk-text)" }}>
                          Day {act.day} {act.isToday && "· TODAY"}
                        </strong>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: act.isMilestoneDay ? "#dc2626" : "#0891b2",
                          background: act.isMilestoneDay ? "rgba(220, 38, 38, 0.1)" : "rgba(8, 145, 178, 0.1)",
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}
                      >
                        {act.type}
                      </span>
                    </div>

                    <h5 style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--fk-text)", margin: "0 0 6px" }}>
                      {act.title}
                    </h5>

                    <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.4" }}>
                      {act.task}
                    </p>
                  </div>

                  <div style={{ marginTop: "12px", borderTop: "1px solid var(--fk-border)", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
                      {act.offset === 0 ? t("active_window", "Active window") : `${t("in", "In")} ${act.offset} ${t("days", "days")}`}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTask(taskKey)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "700",
                        border: "1px solid var(--fk-border)",
                        background: isDone ? "#16a34a" : "var(--fk-card)",
                        color: isDone ? "#ffffff" : "var(--fk-text)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px"
                      }}
                    >
                      {isDone ? <Check size={12} /> : null}
                      {isDone ? t("done", "Done") : t("mark", "Mark")}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REQUIRED PESTICIDES & PROTECTION GUIDE */}
      {activeTab === "pesticides" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                🛡️ {t("prescribed_pesticides_title", "Prescribed Pesticides & Spray Protocols")} ({crop.name})
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                {t("pesticide_protocol_sub", "Approved CIBRC chemical formulations, exact dosages per liter, pre-harvest safety intervals, and organic bio-controls.")}
              </p>
            </div>

            {/* FILTER BUTTONS */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: t("all_sprays", "All Protection") },
                { id: "insect", label: t("insecticides", "Insects & Worms") },
                { id: "fungal", label: t("fungicides", "Diseases & Blights") },
                { id: "weed", label: t("herbicides", "Weed Control") }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPesticideFilter(f.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    border: pesticideFilter === f.id ? "2px solid #dc2626" : "1px solid var(--fk-border)",
                    background: pesticideFilter === f.id ? "rgba(220, 38, 38, 0.1)" : "var(--fk-bg)",
                    color: pesticideFilter === f.id ? "#dc2626" : "var(--fk-text)"
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* PESTICIDE CARDS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {filteredPesticides.map((pest) => (
              <div
                key={pest.id}
                style={{
                  background: "var(--fk-bg)",
                  border: "1px solid var(--fk-border)",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "10px" }}>
                    <div>
                      <span style={{ fontSize: "11.5px", fontWeight: "800", color: "var(--fk-text-sub)", textTransform: "uppercase" }}>
                        {pest.targetCategory}
                      </span>
                      <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text)", margin: "2px 0 0" }}>
                        {pest.targetName}
                      </h4>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "800",
                        color: pest.severity.includes("Critical") || pest.severity.includes("Catastrophic") ? "#dc2626" : "#d97706",
                        background: pest.severity.includes("Critical") || pest.severity.includes("Catastrophic") ? "rgba(220, 38, 38, 0.1)" : "rgba(245, 158, 11, 0.1)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {pest.severity}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", marginBottom: "12px", lineHeight: "1.4" }}>
                    <strong>{t("field_symptoms", "Symptoms")}:</strong> {pest.symptoms}
                  </p>

                  <div style={{ background: "rgba(220, 38, 38, 0.05)", border: "1px solid rgba(220, 38, 38, 0.2)", borderRadius: "8px", padding: "10px 12px", marginBottom: "10px" }}>
                    <span style={{ fontSize: "11.5px", fontWeight: "800", color: "#dc2626", textTransform: "uppercase" }}>
                      🧪 {t("recommended_formulation", "Approved Chemical Spray")}
                    </span>
                    <div style={{ fontSize: "14.5px", fontWeight: "800", color: "var(--fk-text)", marginTop: "2px" }}>
                      {pest.chemicalName}
                    </div>
                    <div style={{ fontSize: "12.5px", color: "var(--fk-text-sub)", marginTop: "2px" }}>
                      {t("dosage", "Dosage")}: <strong>{pest.dosagePerAcre}</strong> · {t("timing", "Timing")}: {pest.stageTiming}
                    </div>
                  </div>

                  {pest.organicAlternative && (
                    <div style={{ background: "rgba(22, 163, 74, 0.05)", border: "1px solid rgba(22, 163, 74, 0.2)", borderRadius: "8px", padding: "8px 12px" }}>
                      <span style={{ fontSize: "11px", fontWeight: "800", color: "#16a34a", textTransform: "uppercase" }}>
                        🌿 {t("organic_alternative", "Bio-Control / Organic Alternative")}
                      </span>
                      <div style={{ fontSize: "13px", color: "var(--fk-text)", marginTop: "2px" }}>
                        {pest.organicAlternative}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: NUTRIENT DOCTOR & VISUAL DEFICIENCY DIAGNOSIS */}
      {activeTab === "deficiencies" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
              🩺 {t("nutrient_doctor_title", "Nutrient Doctor & Visual Diagnosis")} ({crop.name})
            </h3>
            <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
              {t("nutrient_doctor_sub", "Identify leaf discoloration, chlorosis, and stunting caused by nitrogen, phosphorus, potassium, or micronutrient shortages.")}
            </p>
          </div>

          {/* NUTRIENT SELECTOR PILLS */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px", paddingBottom: "12px", borderBottom: "1px solid var(--fk-border)" }}>
            {deficiencies.map((d) => {
              const isSelected = activeDeficiency?.id === d.id;
              return (
                <button
                  key={d.id}
                  type="button"
                  onClick={() => setSelectedDeficiencyId(d.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "800",
                    cursor: "pointer",
                    border: isSelected ? "2px solid #7c3aed" : "1px solid var(--fk-border)",
                    background: isSelected ? "rgba(124, 58, 237, 0.12)" : "var(--fk-bg)",
                    color: isSelected ? "#7c3aed" : "var(--fk-text)",
                    transition: "all 0.15s ease"
                  }}
                >
                  {d.nutrient} {t("deficiency", "Deficiency")}
                </button>
              );
            })}
          </div>

          {/* ACTIVE DEFICIENCY CARD */}
          {activeDeficiency && (
            <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#7c3aed", background: "rgba(124, 58, 237, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                    {activeDeficiency.affectedPart}
                  </span>
                  <h4 style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", margin: "4px 0 0" }}>
                    {activeDeficiency.nutrient} Deficiency
                  </h4>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px", marginBottom: "14px" }}>
                <div style={{ background: "var(--fk-card)", padding: "12px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
                  <strong style={{ fontSize: "13px", color: "var(--fk-text)", display: "block" }}>
                    🔍 {t("field_symptoms", "Visual Symptoms")}:
                  </strong>
                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "4px 0 0", lineHeight: "1.4" }}>
                    {activeDeficiency.symptoms}
                  </p>
                </div>

                <div style={{ background: "var(--fk-card)", padding: "12px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
                  <strong style={{ fontSize: "13px", color: "#dc2626", display: "block" }}>
                    ⚠️ {t("impact_on_harvest", "Impact on Harvest")}:
                  </strong>
                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "4px 0 0", lineHeight: "1.4" }}>
                    {activeDeficiency.impact}
                  </p>
                </div>
              </div>

              <div
                style={{
                  background: "linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(124, 58, 237, 0.08))",
                  border: "1.5px solid #16a34a",
                  borderRadius: "8px",
                  padding: "14px 16px"
                }}
              >
                <strong style={{ fontSize: "13px", color: "#16a34a", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                  💊 {t("remedy_title", "Immediate Foliar Spray & Soil Formulation")}:
                </strong>
                <p style={{ fontSize: "14px", fontWeight: "700", color: "var(--fk-text)", margin: "6px 0 0", lineHeight: "1.4" }}>
                  {activeDeficiency.remedy}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CRITICAL WATER STAGES */}
      {activeTab === "irrigation" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                💧 {t("critical_irrigation_title", "Critical Irrigation Windows & Moisture Sensitivity")} ({crop.name})
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                {t("irrigation_sub", "Strategic irrigation stages where missing water drops final harvest yield significantly.")}
              </p>
            </div>
            <span style={{ fontSize: "13px", color: "#0284c7", fontWeight: "700" }}>
              {t("total_season_need", "Total Season Need")}: {crop.waterRequirement}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {waterStages.map((ws, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "var(--fk-bg)",
                  border: "1px solid var(--fk-border)",
                  borderRadius: "8px",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800" }}>
                      {idx + 1}
                    </span>
                    <strong style={{ fontSize: "14.5px", color: "var(--fk-text)" }}>{ws.stage}</strong>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#0284c7", background: "rgba(2, 132, 199, 0.1)", padding: "2px 7px", borderRadius: "4px" }}>
                      {ws.timing}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#dc2626", margin: "4px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertTriangle size={13} /> <strong>{t("yield_penalty", "Yield Penalty If Missed")}:</strong> {ws.riskIfMissed}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", display: "block" }}>{t("water_volume", "Water Volume")}</span>
                  <strong style={{ fontSize: "15px", color: "#0284c7" }}>{ws.mmNeeded}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: CROP ECONOMICS & PROFITABILITY SENSITIVITY */}
      {activeTab === "economics" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                💰 {t("economics_title", "Per-Acre Cost of Cultivation & Profit Estimator")} ({crop.name})
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                {t("economics_sub", "Complete production cost breakdown vs expected yield and government MSP revenue.")}
              </p>
            </div>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#16a34a", background: "rgba(22, 163, 74, 0.1)", padding: "4px 10px", borderRadius: "6px" }}>
              Projected ROI: {simRoi}%
            </span>
          </div>

          {/* FINANCIAL SUMMARY TILES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.2)", padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#dc2626", textTransform: "uppercase" }}>{t("total_expenses", "Total Expenses / Acre")}</span>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#dc2626", marginTop: "2px" }}>
                ₹{simExpenses.toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>Includes seed, fertilizer, labor &amp; sprays</span>
            </div>

            <div style={{ background: "rgba(37, 99, 235, 0.06)", border: "1px solid rgba(37, 99, 235, 0.2)", padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>{t("expected_gross_revenue", "Expected Gross Revenue")}</span>
              <div style={{ fontSize: "22px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>
                ₹{simGrossRevenue.toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>At {effectiveYield} Qtl × ₹{effectivePrice}/Qtl</span>
            </div>

            <div style={{ background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.3)", padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase" }}>{t("estimated_net_profit", "Estimated Net Profit / Acre")}</span>
              <div style={{ fontSize: "24px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>
                ₹{simNetProfit.toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>Break-Even: {simBreakEvenYield} Qtl/Acre</span>
            </div>
          </div>

          {/* SENSITIVITY SLIDERS */}
          <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", borderRadius: "8px", padding: "14px", marginBottom: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px" }}>
              <strong style={{ fontSize: "13.5px", color: "var(--fk-text)" }}>
                📈 {t("simulate_harvest_price", "Simulate Yield & Mandi Price")}:
              </strong>
              <button
                type="button"
                onClick={() => {
                  setSimYield(economics.expectedYieldQtl);
                  setSimPrice(economics.marketPricePerQtl);
                }}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "#2563eb",
                  fontWeight: "700",
                  fontSize: "12.5px",
                  cursor: "pointer"
                }}
              >
                Reset Benchmarks
              </button>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "14px" }}>
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                  <span>{t("sim_yield", "Yield (Qtl/Acre)")}</span>
                  <strong>{effectiveYield} Qtl</strong>
                </div>
                <input
                  type="range"
                  min="5"
                  max="45"
                  value={effectiveYield}
                  onChange={(e) => setSimYield(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#16a34a" }}
                />
              </div>

              <div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px", marginBottom: "4px" }}>
                  <span>{t("sim_price", "Mandi Selling Price (₹/Qtl)")}</span>
                  <strong>₹{effectivePrice}</strong>
                </div>
                <input
                  type="range"
                  min="2000"
                  max="12000"
                  step="100"
                  value={effectivePrice}
                  onChange={(e) => setSimPrice(Number(e.target.value))}
                  style={{ width: "100%", accentColor: "#2563eb" }}
                />
              </div>
            </div>
          </div>

          {/* COST BREAKDOWN TABLE */}
          <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "8px" }}>
            {t("cost_breakdown_title", "Detailed Input & Labor Cost Breakdown (Per Acre)")}:
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {[
              { label: "Certified Seed / Pro-Trays", cost: economics.seedCost, pct: "6%" },
              { label: "Land Prep & Summer Tillage", cost: economics.landPrepCost, pct: "11%" },
              { label: "Chemical & Organic Fertilizers", cost: economics.fertilizerCost, pct: "20%" },
              { label: "Plant Protection (Pesticides)", cost: economics.protectionCost, pct: "19%" },
              { label: "Irrigation Electricity / Fuel", cost: economics.irrigationPowerCost, pct: "9%" },
              { label: "Manual Labor & Harvesting", cost: economics.laborHarvestCost, pct: "35%" }
            ].map((item, idx) => (
              <div key={idx} style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", padding: "10px 12px", borderRadius: "6px" }}>
                <span style={{ fontSize: "12.5px", color: "var(--fk-text-sub)", display: "block" }}>{item.label}</span>
                <strong style={{ fontSize: "15px", color: "var(--fk-text)", display: "block", marginTop: "2px" }}>
                  ₹{item.cost.toLocaleString("en-IN")}
                </strong>
                <span style={{ fontSize: "11.5px", color: "#2563eb", fontWeight: "700" }}>{item.pct} of total</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* LIVE WEATHER & APMC MANDI RADAR */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "20px", marginBottom: "24px" }}>
        {/* LIVE WEATHER RADAR */}
        <PremiumCard id="weather">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CloudSun size={22} style={{ color: "#d97706" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, fontFamily: "Outfit, sans-serif" }}>
                {t("weather_title", "Live Weather & Spray Advisory")}
              </h3>
            </div>
            <StatusBadge status="info">{t("real_time_forecast", "Real-Time Forecast")}</StatusBadge>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", padding: "14px", background: "var(--fk-bg)", borderRadius: "8px" }}>
            <div>
              <h2 style={{ fontSize: "32px", fontWeight: "800", color: "var(--fk-text)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                {weather?.current_temperature_c ?? 28}°C
              </h2>
              <p style={{ fontSize: "14px", color: "var(--fk-text-sub)", fontWeight: 600, margin: "2px 0 0" }}>
                {weather?.condition || "Partly Cloudy"}
              </p>
            </div>
            <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "3px", color: "var(--fk-text-sub)" }}>
              <div>Humidity: <strong style={{ color: "var(--fk-text)" }}>{weather?.humidity_percent ?? 68}%</strong></div>
              <div>Rain Chance: <strong style={{ color: "var(--fk-text)" }}>{weather?.rainfall_probability ?? "20%"}</strong></div>
              <div>Wind: <strong style={{ color: "var(--fk-text)" }}>{weather?.wind_speed_kmh ?? 12} km/h</strong></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", padding: "10px 12px", background: "rgba(21, 128, 61, 0.08)", borderRadius: "8px", border: "1px solid rgba(21, 128, 61, 0.2)" }}>
            <CheckCircle2 size={18} style={{ color: "#15803d", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: 0 }}>
              {t("spray_conditions", "Spray Conditions: Wind speed < 15 km/h. Suitable for foliar nutrient and pest sprays before 10:30 AM.")}
            </p>
          </div>

          <div style={{ marginTop: "12px", textAlign: "right" }}>
            <button
              type="button"
              onClick={() => navigate("/weather")}
              style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              {t("open_full_weather", "Open Full Weather Radar")} <ArrowRight size={13} />
            </button>
          </div>
        </PremiumCard>

        {/* APMC MANDI PRICES */}
        <PremiumCard id="market">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TrendingUp size={22} style={{ color: "#15803d" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, fontFamily: "Outfit, sans-serif" }}>
                {t("mandi_title", "Live Mandi Prices")} ({t("crop_" + crop.id, crop.name).split(" ")[0]})
              </h3>
            </div>
            <StatusBadge status="success">{t("apmc_verified", "APMC Verified")}</StatusBadge>
          </div>

          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mandiChartData.length > 0 ? mandiChartData : [
                { name: "Hyd", ModalPrice: 7200 },
                { name: "Warangal", ModalPrice: 7450 },
                { name: "Khammam", ModalPrice: 7100 },
                { name: "Adilabad", ModalPrice: 7380 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fk-border)" />
                <XAxis dataKey="name" stroke="var(--fk-text-sub)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--fk-text-sub)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--fk-card)", borderColor: "var(--fk-border)", color: "var(--fk-text)", borderRadius: "8px" }} />
                <Bar dataKey="ModalPrice" fill="#16a34a" name="Price (₹/qtl)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "13px" }}>
            <span style={{ color: "var(--fk-text-sub)" }}>MSP: <strong>{crop.mspValue}</strong></span>
            <button
              type="button"
              onClick={() => navigate("/mandi")}
              style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              {t("open_full_mandi", "Open Full Mandi Tracker")} <ArrowRight size={13} />
            </button>
          </div>
        </PremiumCard>
      </div>

      {/* QUICK SAHAYAK AI LAUNCHER */}
      <PremiumCard style={{ marginBottom: "20px", background: "linear-gradient(135deg, #064e3b 0%, #15803d 100%)", color: "#ffffff", border: "none" }}>
        <form onSubmit={handleLaunchPrompt} style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "220px" }}>
            <Sparkles size={22} style={{ color: "#facc15" }} />
            <strong style={{ fontSize: "16px", fontFamily: "Outfit, sans-serif" }}>
              {t("ask_ai_title", "Ask Sahayak AI About")} {t("crop_" + crop.id, crop.name).split(" ")[0]}:
            </strong>
          </div>
          <div style={{ display: "flex", flex: 1, position: "relative", alignItems: "center", minWidth: "240px" }}>
            <input
              type="text"
              value={voice.isListening ? voice.interimTranscript || "Listening to your voice... 🎙️" : quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder={`e.g. 'How much urea should I spray for ${crop.name} at Day ${selectedDay}?'`}
              style={{
                width: "100%",
                padding: "10px 42px 10px 14px",
                borderRadius: "8px",
                border: "none",
                outline: "none",
                fontSize: "14px",
                color: "#0f172a",
                background: "#ffffff",
                boxShadow: voice.isListening ? "0 0 0 2px #ef4444" : "none"
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
                  width: "28px",
                  height: "28px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: voice.isListening ? "#ffffff" : "#15803d"
                }}
              >
                {voice.isListening ? <MicOff size={14} /> : <Mic size={14} />}
              </button>
            )}
          </div>
          <PremiumButton type="submit" variant="secondary" size="md" style={{ background: "#facc15", color: "#0f172a", border: "none", fontWeight: 800 }}>
            {t("ask_ai_btn", "Ask AI 🚀")}
          </PremiumButton>
        </form>
      </PremiumCard>

      {/* KISAN CALL CENTER TOLL-FREE DIRECT BANNER */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(22, 163, 74, 0.06))",
          border: "1px solid var(--fk-border)",
          borderRadius: "10px",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <PhoneCall size={22} color="#2563eb" />
          <div>
            <strong style={{ fontSize: "15px", color: "var(--fk-text)", display: "block" }}>
              {t("kcc_banner_title", "Need Direct Guidance from Government University Agronomists?")}
            </strong>
            <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>
              {t("kcc_banner_sub", "Call Kisan Call Center (KCC) toll-free from 6:00 AM to 10:00 PM in any Indian language.")}
            </span>
          </div>
        </div>
        <a
          href="tel:18001801551"
          style={{
            background: "#2563eb",
            color: "#ffffff",
            padding: "7px 16px",
            borderRadius: "6px",
            fontWeight: "800",
            fontSize: "14px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <PhoneCall size={14} /> {t("kcc_toll_free", "1800-180-1551 (Toll-Free)")}
        </a>
      </div>

      {/* FARM PROFILE WIZARD MODAL */}
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
    </div>
  );
}
