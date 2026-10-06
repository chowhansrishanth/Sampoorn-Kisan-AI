/**
 * ============================================================================
 * CROP CALENDAR COMPONENT — ICAR AGRONOMIC SCHEDULE & STAGE REQUIREMENTS
 * ============================================================================
 * 
 * Features:
 * 1. Selected Crop Intake from Recommendation Tool via URL search parameters:
 *    - Reads ?crop=..., ?durationDays=..., ?acres=..., ?soil=..., ?season=..., ?irrigation=...
 * 2. Interactive Duration Adjuster:
 *    - Allows farmer to toggle and adjust duration in Days or Months.
 *    - Automatically rescales all growth stage day-ranges proportionally.
 * 3. 10 Essential Agronomic Growth Requirements (ICAR Benchmark Guidelines):
 *    - Crop Growth Stages & Activities (Sowing, Vegetative, Flowering, Filling, Harvest)
 *    - Land & Soil Requirements (pH, texture, land prep)
 *    - Irrigation & Water Requirements (total volume, critical stages, intervals)
 *    - Fertilizer & Nutrient Management (Basal, top-dressing, micronutrients)
 *    - Sowing & Planting Specifications (seed rate, spacing, depth, seed treatment)
 *    - Weeding Requirements (critical period, herbicides, hoeing)
 *    - Pest & Disease Management (CIBRC dosages, major insect pests & fungi)
 *    - Weather & Climate Considerations (optimum temperature, rainfall, frost/heat warnings)
 *    - Required Farming Facilities & Equipment (implements, sprayers, storage)
 *    - Harvesting Period & Post-Harvest Moisture Control
 * 4. Month-by-Month 12-Month Calendar Schedule with Task Filtering (sowing, irrigation, fertilizer, pest, harvest).
 */

import { useState, useCallback, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import {
  Calendar,
  Clock,
  Sprout,
  Droplets,
  FlaskConical,
  ShieldCheck,
  Sun,
  Layers,
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Info,
  Sliders,
  ChevronRight,
  Filter
} from "lucide-react";
import PremiumCard from "../components/ui/PremiumCard";
import PageHeader from "../components/ui/PageHeader";

// 12 Months of the Agricultural Year
const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Icons & descriptive labels for month-by-month task types
const TASK_ICONS = {
  sowing: { icon: "🌱", label: "Sowing / Transplanting" },
  irrigation: { icon: "💧", label: "Irrigation" },
  fertilizer: { icon: "🧪", label: "Fertilizer / Nutrition" },
  pest: { icon: "🐛", label: "Pest / Disease Management" },
  harvest: { icon: "🌾", label: "Harvest / Post-Harvest" },
};

const FILTER_OPTIONS = ["all", ...Object.keys(TASK_ICONS)];

export default function CropCalendar() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Read URL parameters passed from Crop Recommendation Tool or Farm Profile
  const urlCrop = searchParams.get("crop");
  const urlDurationDays = searchParams.get("durationDays");
  const urlAcres = searchParams.get("acres");
  const urlSoil = searchParams.get("soil");
  const urlSeason = searchParams.get("season");
  const urlIrrigation = searchParams.get("irrigation");

  // State: Selected crop key
  const [chosenCrop, setChosenCrop] = useState(urlCrop || null);

  // State: Task category filter for the 12-month calendar
  const [filter, setFilter] = useState("all");

  // State: Active view tab (stages, requirements, calendar)
  const [activeTab, setActiveTab] = useState("stages");

  // State: Duration unit mode ("days" or "months")
  const [durationUnit, setDurationUnit] = useState("days");

  // State: Custom duration in days
  const [customDurationDays, setCustomDurationDays] = useState(
    urlDurationDays ? parseInt(urlDurationDays, 10) : null
  );

  const currentMonth = MONTHS[new Date().getMonth()];

  // Fetch available crops catalog from backend API (/api/calendar/crops)
  const catalog = useApiResource({ url: '/api/calendar/crops' });
  const crops = catalog.data?.crops || [];

  // Determine active selected crop key with fuzzy fallback
  const selectedCrop = useMemo(() => {
    if (chosenCrop) {
      // Find matching crop key in catalog
      const match = crops.find(c =>
        c.key.toLowerCase() === chosenCrop.toLowerCase() ||
        c.name.toLowerCase().includes(chosenCrop.toLowerCase()) ||
        chosenCrop.toLowerCase().includes(c.key.toLowerCase())
      );
      if (match) return match.key;
      return chosenCrop;
    }
    return crops[0]?.key || "Paddy";
  }, [chosenCrop, crops]);

  // Fetch comprehensive 12-month schedule & agronomic data for selected crop
  const schedule = useApiResource(selectedCrop ? { url: '/api/calendar/' + encodeURIComponent(selectedCrop) } : null);
  const calendar = schedule.data;

  // Initialize custom duration when crop data loads
  useEffect(() => {
    if (calendar?.defaultDurationDays && !customDurationDays) {
      setCustomDurationDays(calendar.defaultDurationDays);
    }
  }, [calendar, customDurationDays]);

  // Active duration calculation (fallback to default)
  const activeDurationDays = customDurationDays || calendar?.defaultDurationDays || 120;
  const activeDurationMonths = (activeDurationDays / 30).toFixed(1);

  // Synchronize chosenCrop state if URL parameter changes
  useEffect(() => {
    if (urlCrop) {
      setChosenCrop(urlCrop);
    }
    if (urlDurationDays) {
      setCustomDurationDays(parseInt(urlDurationDays, 10));
    }
  }, [urlCrop, urlDurationDays]);

  const loading = catalog.loading;
  const calLoading = schedule.loading;
  const error = catalog.error || schedule.error;
  const reload = () => { catalog.reload(); schedule.reload(); };

  // Task filter callback
  const filteredTasks = useCallback((tasks) => {
    if (filter === "all") return tasks;
    return tasks.filter(t => t.type === filter);
  }, [filter]);

  // Dynamically recalculate stage timelines based on selected duration
  const scaledStages = useMemo(() => {
    if (!calendar?.stages || !Array.isArray(calendar.stages)) return [];
    let cumulativeStartDay = 1;
    return calendar.stages.map((stageItem) => {
      const stagePercent = stageItem.percent || 20;
      const stageLengthDays = Math.max(5, Math.round((activeDurationDays * stagePercent) / 100));
      const startDay = cumulativeStartDay;
      const endDay = Math.min(activeDurationDays, cumulativeStartDay + stageLengthDays - 1);
      cumulativeStartDay = endDay + 1;

      const startMonth = Math.ceil(startDay / 30);
      const endMonth = Math.ceil(endDay / 30);

      return {
        ...stageItem,
        startDay,
        endDay,
        stageLengthDays,
        durationText: durationUnit === "months"
          ? `Month ${startMonth === endMonth ? startMonth : `${startMonth}–${endMonth}`} (${startDay}–${endDay} Days)`
          : `Day ${startDay}–${endDay} (${stageLengthDays} Days)`
      };
    });
  }, [calendar, activeDurationDays, durationUnit]);

  return (
    <div style={{ padding: "16px 20px", maxWidth: 1240, margin: "0 auto" }}>
      <RequestStatus loading={loading} error={error} onRetry={reload} />

      {/* Header */}
      <PageHeader
        title="Crop Calendar & Growth Advisory"
        subtitle="ICAR-aligned growth stages, inputs, facilities, and 12-month agronomic practices"
        icon={<Calendar size={22} color="#006948" />}
      />

      {/* Incoming Context Banner (if redirected from Crop Recommendation Tool) */}
      {(urlCrop || urlAcres || urlSoil) && (
        <div style={{
          background: "linear-gradient(135deg, rgba(0, 105, 72, 0.08) 0%, rgba(40, 116, 240, 0.06) 100%)",
          border: "1.5px solid rgba(0, 105, 72, 0.25)",
          borderRadius: "10px",
          padding: "12px 16px",
          marginBottom: "16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "10px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span style={{ fontSize: "20px" }}>🌾</span>
            <div>
              <strong style={{ fontSize: "13.5px", color: "#006948" }}>
                Selected Crop: {calendar?.name || chosenCrop || "Selected Crop"}
              </strong>
              <div style={{ fontSize: "12px", color: "var(--fk-text-sub, #64748b)" }}>
                Carried forward from your farm details:{" "}
                {urlAcres ? `${urlAcres} Acres` : ""}{urlSoil ? ` • ${urlSoil.toUpperCase()} soil` : ""}{urlSeason ? ` • ${urlSeason.toUpperCase()} season` : ""}{urlIrrigation ? ` • ${urlIrrigation}` : ""}
              </div>
            </div>
          </div>
          <span style={{ fontSize: "11px", fontWeight: "700", background: "#006948", color: "#fff", padding: "4px 10px", borderRadius: "12px" }}>
            CONNECTED FROM CROP TOOL
          </span>
        </div>
      )}

      {/* Crop Selector Card */}
      <PremiumCard style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
          <span style={{ fontSize: 13.5, fontWeight: 700, color: "var(--fk-text-sub, #475569)", marginRight: 4 }}>
            Select Crop:
          </span>
          {loading ? (
            <span style={{ fontSize: 13, color: "#64748b" }}>Loading crops…</span>
          ) : crops.map(c => {
            const isSelected = selectedCrop?.toLowerCase() === c.key.toLowerCase();
            return (
              <button
                key={c.key}
                type="button"
                onClick={() => {
                  setChosenCrop(c.key);
                  setCustomDurationDays(c.defaultDurationDays || 120);
                  setSearchParams({ crop: c.name || c.key });
                }}
                style={{
                  padding: "6px 14px",
                  borderRadius: 20,
                  border: isSelected ? "1.5px solid #006948" : "1px solid var(--fk-border, #e2e8f0)",
                  background: isSelected ? "#006948" : "var(--fk-card, #ffffff)",
                  color: isSelected ? "#ffffff" : "var(--fk-text, #1e293b)",
                  fontWeight: isSelected ? 700 : 600,
                  fontSize: 13,
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px"
                }}
              >
                <span>{c.name}</span>
              </button>
            );
          })}
        </div>

        {/* Selected Crop Meta & Interactive Duration Adjuster */}
        {calendar && (
          <div style={{
            marginTop: 16,
            paddingTop: 14,
            borderTop: "1px solid var(--fk-border, #e2e8f0)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "14px"
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
              <div style={{ fontSize: 13, color: "var(--fk-text, #1e293b)" }}>
                📅 Season: <strong>{calendar.season}</strong>
              </div>
              <div style={{ fontSize: 13, color: "var(--fk-text, #1e293b)" }}>
                🏷️ Category: <strong>{calendar.category || "Field Crop"}</strong>
              </div>
            </div>

            {/* Requirement 5: Interactive Crop Duration Selector in Months / Days */}
            <div style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              background: "var(--fk-bg, #f8fafc)",
              padding: "6px 12px",
              borderRadius: "8px",
              border: "1px solid var(--fk-border, #e2e8f0)"
            }}>
              <span style={{ fontSize: "12.5px", fontWeight: "700", color: "#006948", display: "flex", alignItems: "center", gap: "4px" }}>
                <Clock size={15} />
                <span>Crop Duration:</span>
              </span>

              {/* Unit Toggle: Days vs Months */}
              <div style={{ display: "flex", borderRadius: "14px", border: "1px solid var(--fk-border, #cbd5e1)", overflow: "hidden" }}>
                <button
                  type="button"
                  onClick={() => setDurationUnit("days")}
                  style={{
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "none",
                    background: durationUnit === "days" ? "#006948" : "transparent",
                    color: durationUnit === "days" ? "#ffffff" : "var(--fk-text-sub, #64748b)",
                    cursor: "pointer"
                  }}
                >
                  Days
                </button>
                <button
                  type="button"
                  onClick={() => setDurationUnit("months")}
                  style={{
                    padding: "3px 8px",
                    fontSize: "11px",
                    fontWeight: 700,
                    border: "none",
                    background: durationUnit === "months" ? "#006948" : "transparent",
                    color: durationUnit === "months" ? "#ffffff" : "var(--fk-text-sub, #64748b)",
                    cursor: "pointer"
                  }}
                >
                  Months
                </button>
              </div>

              {/* Interactive Duration Slider / Number Selector */}
              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <input
                  type="range"
                  min={calendar.durationMinDays || 90}
                  max={calendar.durationMaxDays || 180}
                  step={5}
                  value={activeDurationDays}
                  onChange={(e) => setCustomDurationDays(parseInt(e.target.value, 10))}
                  style={{ width: "90px", accentColor: "#006948", cursor: "pointer" }}
                />
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#006948" }}>
                  {durationUnit === "days" ? `${activeDurationDays} Days` : `${activeDurationMonths} Months`}
                </span>
              </div>
            </div>
          </div>
        )}
      </PremiumCard>

      {/* Main Navigation Tabs */}
      <div style={{
        display: "flex",
        gap: "6px",
        marginBottom: "16px",
        borderBottom: "1px solid var(--fk-border, #e2e8f0)",
        paddingBottom: "8px",
        flexWrap: "wrap"
      }}>
        <button
          type="button"
          onClick={() => setActiveTab("stages")}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "700",
            borderRadius: "6px",
            border: activeTab === "stages" ? "1.5px solid #006948" : "1px solid transparent",
            background: activeTab === "stages" ? "rgba(0, 105, 72, 0.1)" : "transparent",
            color: activeTab === "stages" ? "#006948" : "var(--fk-text-sub, #64748b)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Sprout size={16} />
          <span>Growth Stages ({scaledStages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("requirements")}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "700",
            borderRadius: "6px",
            border: activeTab === "requirements" ? "1.5px solid #006948" : "1px solid transparent",
            background: activeTab === "requirements" ? "rgba(0, 105, 72, 0.1)" : "transparent",
            color: activeTab === "requirements" ? "#006948" : "var(--fk-text-sub, #64748b)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Sliders size={16} />
          <span>Farming Requirements & Facilities</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("calendar")}
          style={{
            padding: "8px 16px",
            fontSize: "13px",
            fontWeight: "700",
            borderRadius: "6px",
            border: activeTab === "calendar" ? "1.5px solid #006948" : "1px solid transparent",
            background: activeTab === "calendar" ? "rgba(0, 105, 72, 0.1)" : "transparent",
            color: activeTab === "calendar" ? "#006948" : "var(--fk-text-sub, #64748b)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <Calendar size={16} />
          <span>12-Month Calendar Schedule</span>
        </button>
      </div>

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 1: CROP GROWTH STAGES & CRITICAL ACTIVITIES (BASED ON DURATION)
         ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === "stages" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {calLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading growth stages…</div>
          ) : scaledStages.length > 0 ? (
            scaledStages.map((stageItem, idx) => (
              <div
                key={idx}
                className="glass-card"
                style={{
                  background: "var(--fk-card, #ffffff)",
                  border: "1px solid var(--fk-border, #e2e8f0)",
                  borderRadius: "10px",
                  padding: "18px 20px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.03)"
                }}
              >
                {/* Stage Header */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "8px", marginBottom: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <div style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: "#006948",
                      color: "#fff",
                      fontWeight: 800,
                      fontSize: "13px",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}>
                      {idx + 1}
                    </div>
                    <div>
                      <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text, #1e293b)", margin: 0 }}>
                        {stageItem.stage}
                      </h3>
                      <span style={{ fontSize: "12px", color: "var(--fk-text-sub, #64748b)" }}>
                        Timeline: <strong>{stageItem.durationText}</strong> ({stageItem.percent}% of cycle)
                      </span>
                    </div>
                  </div>
                  <span style={{ fontSize: "12px", fontWeight: "700", background: "rgba(0, 105, 72, 0.1)", color: "#006948", padding: "4px 10px", borderRadius: "14px" }}>
                    Stage {idx + 1} of {scaledStages.length}
                  </span>
                </div>

                {/* Important Activities at this Stage */}
                <div style={{ marginBottom: "12px" }}>
                  <strong style={{ fontSize: "13px", color: "var(--fk-text, #1e293b)", display: "flex", alignItems: "center", gap: "5px", marginBottom: "6px" }}>
                    <CheckCircle2 size={15} color="#006948" />
                    <span>Important Field Activities:</span>
                  </strong>
                  <ul style={{ margin: 0, paddingLeft: "22px", fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.5" }}>
                    {stageItem.activities?.map((act, actIdx) => (
                      <li key={actIdx}>{act}</li>
                    ))}
                  </ul>
                </div>

                {/* Stage-wise Agronomic Operations Grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
                  gap: "10px",
                  background: "var(--fk-bg, #f8fafc)",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--fk-border, #e2e8f0)"
                }}>
                  {stageItem.irrigation && (
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#0891b2", display: "flex", alignItems: "center", gap: "4px" }}>
                        <Droplets size={13} />
                        <span>Irrigation & Water Requirement</span>
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--fk-text, #334155)" }}>
                        {stageItem.irrigation}
                      </p>
                    </div>
                  )}

                  {stageItem.nutrition && (
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#d97706", display: "flex", alignItems: "center", gap: "4px" }}>
                        <FlaskConical size={13} />
                        <span>Nutrient / Fertilizer Application</span>
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--fk-text, #334155)" }}>
                        {stageItem.nutrition}
                      </p>
                    </div>
                  )}

                  {stageItem.plantProtection && (
                    <div>
                      <div style={{ fontSize: "11.5px", fontWeight: "700", color: "#dc2626", display: "flex", alignItems: "center", gap: "4px" }}>
                        <ShieldCheck size={13} />
                        <span>Plant Protection & Pest Scouting</span>
                      </div>
                      <p style={{ margin: "2px 0 0", fontSize: "12px", color: "var(--fk-text, #334155)" }}>
                        {stageItem.plantProtection}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              Select a crop above to view its detailed growth stages.
            </div>
          )}
        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 2: FARMING REQUIREMENTS, FACILITIES & AGRONOMIC PRACTICES
         ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === "requirements" && calendar && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "16px" }}>

          {/* 1. LAND & SOIL REQUIREMENTS */}
          {calendar.landSoilRequirements && (
            <div className="glass-card" style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>🪨</span>
                <h3 style={{ fontSize: "15.5px", fontWeight: "800", color: "var(--fk-text, #1e293b)", margin: 0 }}>
                  Land & Soil Requirements
                </h3>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.55" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Suitable Soils:</strong> {calendar.landSoilRequirements.preferredSoils?.join(", ")}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Optimum pH Range:</strong> {calendar.landSoilRequirements.idealPh}
                </div>
                <div>
                  <strong>Field Preparation:</strong> {calendar.landSoilRequirements.fieldPreparation}
                </div>
              </div>
            </div>
          )}

          {/* 2. IRRIGATION & WATER REQUIREMENTS */}
          {calendar.irrigationRequirements && (
            <div className="glass-card" style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>💧</span>
                <h3 style={{ fontSize: "15.5px", fontWeight: "800", color: "#0891b2", margin: 0 }}>
                  Irrigation & Water Requirements
                </h3>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.55" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Total Water Need:</strong> {calendar.irrigationRequirements.totalWaterNeedMm}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Recommended Method:</strong> {calendar.irrigationRequirements.method}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Critical Irrigation Stages:</strong> {calendar.irrigationRequirements.criticalStages?.join(", ")}
                </div>
                <div>
                  <strong>Frequency / Schedule:</strong> {calendar.irrigationRequirements.intervals}
                </div>
              </div>
            </div>
          )}

          {/* 3. FERTILIZER & NUTRIENT REQUIREMENTS */}
          {calendar.fertilizerNutrientRequirements && (
            <div className="glass-card" style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>🧪</span>
                <h3 style={{ fontSize: "15.5px", fontWeight: "800", color: "#d97706", margin: 0 }}>
                  Fertilizer & Nutrient Requirements
                </h3>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.55" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Recommended NPK:</strong> {calendar.fertilizerNutrientRequirements.recommendedNpkKgPerHa}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Basal Application:</strong> {calendar.fertilizerNutrientRequirements.basalApplication}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Top-Dressing Schedule:</strong> {calendar.fertilizerNutrientRequirements.topDressing}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Micronutrients:</strong> {calendar.fertilizerNutrientRequirements.micronutrients}
                </div>
                <div>
                  <strong>Organic / Bio-fertilizers:</strong> {calendar.fertilizerNutrientRequirements.organicBiofertilizers}
                </div>
              </div>
            </div>
          )}

          {/* 4. SOWING & PLANTING INFORMATION */}
          {calendar.sowingPlantingInfo && (
            <div className="glass-card" style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>🌱</span>
                <h3 style={{ fontSize: "15.5px", fontWeight: "800", color: "#16a34a", margin: 0 }}>
                  Sowing & Planting Information
                </h3>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.55" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Optimum Sowing Window:</strong> {calendar.sowingPlantingInfo.sowingWindow}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Seed Rate:</strong> {calendar.sowingPlantingInfo.seedRatePerAcre}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Spacing (Row x Plant):</strong> {calendar.sowingPlantingInfo.spacing}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Sowing Depth:</strong> {calendar.sowingPlantingInfo.sowingDepth}
                </div>
                <div>
                  <strong>Seed Treatment:</strong> {calendar.sowingPlantingInfo.seedTreatment}
                </div>
              </div>
            </div>
          )}

          {/* 5. WEEDING REQUIREMENTS */}
          {calendar.weedingRequirements && (
            <div className="glass-card" style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>🌿</span>
                <h3 style={{ fontSize: "15.5px", fontWeight: "800", color: "#65a30d", margin: 0 }}>
                  Weeding Requirements
                </h3>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.55" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Critical Weed Period:</strong> {calendar.weedingRequirements.criticalPeriod}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Herbicide Guidelines:</strong> {calendar.weedingRequirements.herbicideRecommendations}
                </div>
                <div>
                  <strong>Manual / Inter-culture:</strong> {calendar.weedingRequirements.manualInterculture}
                </div>
              </div>
            </div>
          )}

          {/* 6. PEST & DISEASE MANAGEMENT */}
          {calendar.pestDiseaseManagement && (
            <div className="glass-card" style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>🛡️</span>
                <h3 style={{ fontSize: "15.5px", fontWeight: "800", color: "#dc2626", margin: 0 }}>
                  Pest & Disease Management
                </h3>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.55" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Major Insect Pests:</strong> {calendar.pestDiseaseManagement.majorPests?.join("; ")}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Major Diseases:</strong> {calendar.pestDiseaseManagement.majorDiseases?.join("; ")}
                </div>
                <div>
                  <strong>Cultural & Biological Prevention:</strong> {calendar.pestDiseaseManagement.preventiveCulturalPractices?.join("; ")}
                </div>
              </div>
            </div>
          )}

          {/* 7. WEATHER & CLIMATE CONSIDERATIONS */}
          {calendar.weatherClimate && (
            <div className="glass-card" style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>🌤️</span>
                <h3 style={{ fontSize: "15.5px", fontWeight: "800", color: "#e11d48", margin: 0 }}>
                  Weather & Climate Considerations
                </h3>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.55" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Optimum Temperature:</strong> {calendar.weatherClimate.optimumTemperature}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Rainfall Requirement:</strong> {calendar.weatherClimate.rainfall}
                </div>
                <div>
                  <strong>Weather Risk / Caution:</strong> {calendar.weatherClimate.weatherAlerts}
                </div>
              </div>
            </div>
          )}

          {/* 8. REQUIRED FARMING FACILITIES & RESOURCES */}
          {calendar.facilitiesResources && (
            <div className="glass-card" style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>🚜</span>
                <h3 style={{ fontSize: "15.5px", fontWeight: "800", color: "#006948", margin: 0 }}>
                  Required Farming Facilities & Resources
                </h3>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.55" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Farm Implements & Machinery:</strong> {calendar.facilitiesResources.machineryEquipment?.join("; ")}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Irrigation Setup:</strong> {calendar.facilitiesResources.irrigationInfrastructure?.join("; ")}
                </div>
                <div>
                  <strong>Storage & Post-Harvest Facility:</strong> {calendar.facilitiesResources.storageHandling?.join("; ")}
                </div>
              </div>
            </div>
          )}

          {/* 9. HARVESTING PERIOD & STORAGE */}
          {calendar.harvestingPeriod && (
            <div className="glass-card" style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "10px", padding: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
                <span style={{ fontSize: "20px" }}>🌾</span>
                <h3 style={{ fontSize: "15.5px", fontWeight: "800", color: "#854d0e", margin: 0 }}>
                  Harvesting Period & Post-Harvest Care
                </h3>
              </div>
              <div style={{ fontSize: "12.5px", color: "var(--fk-text, #334155)", lineHeight: "1.55" }}>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Maturity Indicators:</strong> {calendar.harvestingPeriod.maturityIndicators}
                </div>
                <div style={{ marginBottom: "6px" }}>
                  <strong>Harvest Moisture:</strong> {calendar.harvestingPeriod.harvestMoisture}
                </div>
                <div>
                  <strong>Curing & Safe Storage:</strong> {calendar.harvestingPeriod.postHarvestCare}
                </div>
              </div>
            </div>
          )}

        </div>
      )}

      {/* ═════════════════════════════════════════════════════════════════════
          TAB 3: 12-MONTH ICAR SCHEDULE & MONTHLY TASK LISTING
         ═════════════════════════════════════════════════════════════════════ */}
      {activeTab === "calendar" && (
        <div>
          {/* Filter by task type */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
            {FILTER_OPTIONS.map(f => (
              <button
                key={f}
                type="button"
                onClick={() => setFilter(f)}
                style={{
                  padding: "4px 12px",
                  borderRadius: 14,
                  border: "1px solid " + (filter === f ? "#006948" : "var(--fk-border, #e2e8f0)"),
                  background: filter === f ? "rgba(0,105,72,0.12)" : "var(--fk-card, #ffffff)",
                  color: filter === f ? "#006948" : "var(--fk-text-sub, #64748b)",
                  fontWeight: 600,
                  fontSize: 12,
                  cursor: "pointer",
                }}
              >
                {f === "all" ? "All Tasks" : TASK_ICONS[f].icon + " " + TASK_ICONS[f].label}
              </button>
            ))}
          </div>

          {/* Calendar grid */}
          {calLoading ? (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading calendar schedule…</div>
          ) : calendar ? (
            <div className="calendar-grid">
              {MONTHS.map(month => {
                const raw = calendar.months?.[month] || [];
                const tasks = filteredTasks(raw);
                const isCurrent = month === currentMonth;
                return (
                  <div
                    key={month}
                    className="calendar-month-card"
                    style={isCurrent ? { border: "2px solid #006948", boxShadow: "0 0 0 3px rgba(0,105,72,0.12)" } : {}}
                  >
                    <div className="calendar-month-name">
                      {isCurrent ? "📍 " : ""}
                      {month}
                      {isCurrent && (
                        <span style={{ marginLeft: "auto", fontSize: 11, background: "#006948", color: "#fff", padding: "1px 6px", borderRadius: 8 }}>
                          Current
                        </span>
                      )}
                    </div>
                    {tasks.length === 0 ? (
                      <div style={{ fontSize: 12, color: "#94a3b8", padding: "4px 0" }}>
                        {filter !== "all" ? "No " + filter + " tasks" : "No tasks scheduled"}
                      </div>
                    ) : tasks.map((t, i) => (
                      <div key={i} className="calendar-task-item">
                        <span className="calendar-task-icon">{TASK_ICONS[t.type]?.icon || "📋"}</span>
                        <span>{t.task}</span>
                      </div>
                    ))}
                    {raw.length > 0 && filter !== "all" && tasks.length === 0 && (
                      <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>
                        {raw.length} other task(s)
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>
              Select a crop to view its calendar.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
