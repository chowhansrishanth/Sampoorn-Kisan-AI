import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import { useState } from "react";

import { RotateCcw, Sprout, ShieldCheck, TrendingUp, DollarSign, RefreshCw, Layers, Sparkles } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import { StatCard, StatusBadge } from "../components/ui/StatCard";

export default function CropRotationSimulator() {
  const [hectares, setHectares] = useState(1.5);

  const [selectedTemplate, setSelectedTemplate] = useState("sustainable_cereal_pulse");
  const [seasons, setSeasons] = useState([
    { season: "Kharif (Year 1)", crop: "Paddy / Rice" },
    { season: "Rabi (Year 1)", crop: "Chickpea / Bengal Gram" },
    { season: "Zaid (Year 1)", crop: "Green Gram / Moong" },
    { season: "Kharif (Year 2)", crop: "Cotton" },
    { season: "Rabi (Year 2)", crop: "Wheat" },
    { season: "Zaid (Year 2)", crop: "Dhaincha (Green Manure)" },
  ]);
  const catalog = useApiResource({ url: '/api/rotation/rotation-templates' });
  const templates = catalog.data?.templates || [];
  const availableCrops = catalog.data?.availableCrops || [];
  const { data: simulation, loading, error, reload } = useApiResource({ method: 'post', url: '/api/rotation/simulate-rotation', data: { seasons, landHectares: hectares } });
  const runSimulation = reload;

  const handleTemplateChange = (templateId) => {
    setSelectedTemplate(templateId);
    const tmpl = templates.find((t) => t.id === templateId);
    if (tmpl && tmpl.seasons) {
      setSeasons(tmpl.seasons);
    }
  };

  const handleCropChange = (index, newCrop) => {
    const updated = [...seasons];
    updated[index].crop = newCrop;
    setSeasons(updated);
  };

  return (
    <div className="page-container">
      <RequestStatus loading={loading} error={error} onRetry={reload} />
      <PageHeader
        title="Multi-Season Crop Rotation & Soil Nitrogen Simulator"
        subtitle="Model Biological Nitrogen Fixation, Pathogen Interruption & 3-Year Profitability Cycles"
        badge="Soil Health Dynamics • ICAR Recommended"
        icon={RotateCcw}
        action={
          <PremiumButton
            variant="primary"
            size="md"
            icon={RefreshCw}
            loading={loading}
            onClick={runSimulation}
          >
            Re-Simulate Soil & ROI
          </PremiumButton>
        }
      />

      {/* TEMPLATE PICKER STRIP */}
      <PremiumCard style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                Agronomy Template
              </label>
              <select
                value={selectedTemplate}
                onChange={(e) => handleTemplateChange(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "13px" }}
              >
                {templates.map((tmpl) => (
                  <option key={tmpl.id} value={tmpl.id}>
                    {tmpl.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label style={{ fontSize: "11px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                Farm Land Area (Hectares)
              </label>
              <input
                type="number"
                min="0.5"
                max="50"
                step="0.5"
                value={hectares}
                onChange={(e) => setHectares(Number(e.target.value) || 1)}
                style={{ width: "100px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "13px" }}
              />
            </div>
          </div>

          <div style={{ fontSize: "12px", color: "#15803d", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
            <Sparkles size={16} /> Chemical Fertilizer Savings: -{simulation?.recommendedChemicalFertilizerReductionPercent || 30}% Urea Recommended
          </div>
        </div>
      </PremiumCard>

      {/* KPI STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          icon={TrendingUp}
          title="Multi-Year Net Profit"
          value={simulation?.cumulativeNetProfit ? `₹${(simulation.cumulativeNetProfit / 1000).toFixed(0)}k` : "₹0"}
          unit=""
          subtitle={`Over ${simulation?.totalSeasons || 6} Seasons`}
          color="#15803d"
        />
        <StatCard
          icon={Sprout}
          title="Net Nitrogen Balance"
          value={simulation?.netNitrogenBalanceKgHa || 0}
          unit="kg N/ha"
          subtitle={simulation?.soilHealthRating || "Balanced 🌾"}
          color={simulation?.netNitrogenBalanceKgHa >= 0 ? "#15803d" : "#d97706"}
        />
        <StatCard
          icon={ShieldCheck}
          title="Pest & Disease Break"
          value="94%"
          unit="Efficacy"
          subtitle="Cycle Disruption Score"
          color="#2563eb"
        />
        <StatCard
          icon={DollarSign}
          title="Gross Farm Revenue"
          value={simulation?.cumulativeGrossRevenue ? `₹${(simulation.cumulativeGrossRevenue / 1000).toFixed(0)}k` : "₹0"}
          unit=""
          subtitle={`Cultivation Cost: ₹${((simulation?.cumulativeCultivationCost || 0) / 1000).toFixed(0)}k`}
          color="#9333ea"
        />
      </div>

      {/* TIMELINE SUCCESSION CARDS */}
      <PremiumCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Layers size={22} style={{ color: "#15803d" }} />
            <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text, #0f172a)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
              Seasonal Crop Succession Timeline & Soil Nutrient Tracker
            </h3>
          </div>
          <StatusBadge status="success">Biological Nitrogen Dynamics</StatusBadge>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
          {simulation?.timeline?.map((step, idx) => {
            const isNFixing = step.isNFixing;
            return (
              <div
                key={idx}
                style={{
                  padding: "16px",
                  borderRadius: "10px",
                  background: isNFixing ? "rgba(34, 197, 94, 0.05)" : "var(--fk-bg, #f8fafc)",
                  border: isNFixing ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid var(--fk-border, #e2e8f0)",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                    <span style={{ fontSize: "11px", fontWeight: "800", color: isNFixing ? "#15803d" : "#2563eb", textTransform: "uppercase" }}>
                      {step.season}
                    </span>
                    {isNFixing ? (
                      <span style={{ fontSize: "10px", fontWeight: "800", background: "#dcfce7", color: "#15803d", padding: "2px 6px", borderRadius: "4px" }}>
                        +N Fixer 🌱
                      </span>
                    ) : (
                      <span style={{ fontSize: "10px", fontWeight: "700", background: "rgba(0,0,0,0.06)", color: "var(--fk-text-sub, #64748b)", padding: "2px 6px", borderRadius: "4px" }}>
                        {step.cropType}
                      </span>
                    )}
                  </div>

                  <div style={{ marginBottom: "10px" }}>
                    <select
                      value={step.crop}
                      onChange={(e) => handleCropChange(idx, e.target.value)}
                      style={{ width: "100%", padding: "6px 8px", borderRadius: "6px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "13px" }}
                    >
                      {availableCrops.map((c) => (
                        <option key={c} value={c}>
                          {c}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", fontSize: "12px", marginBottom: "10px" }}>
                    <div>
                      <span style={{ color: "var(--fk-text-sub, #64748b)" }}>Nitrogen Delta:</span>{" "}
                      <strong style={{ color: isNFixing ? "#15803d" : "#dc2626" }}>
                        {step.nitrogenChangeKg > 0 ? `+${step.nitrogenChangeKg}` : step.nitrogenChangeKg} kg/ha
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: "var(--fk-text-sub, #64748b)" }}>Soil Available N:</span>{" "}
                      <strong style={{ color: "#0f172a" }}>{step.currentSoilNitrogenKgHa} kg/ha</strong>
                    </div>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "var(--fk-text-sub, #64748b)", marginBottom: "4px" }}>
                    <span>Disease Suppression Score:</span>
                    <strong style={{ color: "#2563eb" }}>{step.diseaseSuppressionScore}%</strong>
                  </div>
                  <div style={{ width: "100%", height: "4px", background: "rgba(0,0,0,0.08)", borderRadius: "2px", overflow: "hidden", marginBottom: "12px" }}>
                    <div style={{ width: `${step.diseaseSuppressionScore}%`, height: "100%", background: "#2563eb" }} />
                  </div>
                </div>

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid var(--fk-border, #e2e8f0)", paddingTop: "8px", fontSize: "12px" }}>
                  <span style={{ color: "var(--fk-text-sub, #64748b)" }}>Net Expected Return:</span>
                  <strong style={{ color: step.netProfitRs >= 0 ? "#15803d" : "#dc2626", fontSize: "14px" }}>
                    ₹{step.netProfitRs.toLocaleString()}
                  </strong>
                </div>
              </div>
            );
          })}
        </div>
      </PremiumCard>
    </div>
  );
}
