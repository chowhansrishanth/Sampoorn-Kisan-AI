import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import { useState } from "react";

import { Satellite, Layers, AlertTriangle, CheckCircle2, RefreshCw, Compass, Sparkles, Eye } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import { StatCard, StatusBadge } from "../components/ui/StatCard";

export default function SatelliteNDVI() {
  const [crop, setCrop] = useState("Cotton");
  const [stage, setStage] = useState("vegetative");
  const [pickedCell, setSelectedCell] = useState(null);
  const { data: ndviData, loading, error, reload } = useApiResource({ url: '/api/satellite/ndvi', params: { crop, stage, lat: 17.38, lon: 78.48 } });
  const selectedCell = pickedCell || ndviData?.grid?.[0]?.[0];
  const fetchNdvi = reload;

  const metrics = ndviData?.metrics;
  const stress = ndviData?.stressDiagnosis;

  return (
    <div className="page-container">
      <RequestStatus loading={loading} error={error} onRetry={reload} />
      <PageHeader
        title="Satellite NDVI Vegetation Health & Field Stress Visualizer"
        subtitle="Sentinel-2 Multispectral 10m Spaceborne Radar, Canopy Biomass & Chlorosis Hotspot Detection"
        badge="European Space Agency Sentinel-2 • 10m Ground Resolution"
        icon={Satellite}
        action={
          <PremiumButton
            variant="primary"
            size="md"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchNdvi}
          >
            Refresh Satellite Pass
          </PremiumButton>
        }
      />

      {/* FILTER STRIP */}
      <PremiumCard style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                Target Crop
              </label>
              <select
                value={crop}
                onChange={(e) => setCrop(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "14px" }}
              >
                <option value="Cotton">Cotton (Kharif)</option>
                <option value="Paddy / Rice">Paddy / Rice</option>
                <option value="Wheat">Wheat (Rabi)</option>
                <option value="Chili">Chili (Hot Pepper)</option>
                <option value="Tomato">Tomato (Horticulture)</option>
                <option value="Soybean">Soybean</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                Growth Phenology Stage
              </label>
              <select
                value={stage}
                onChange={(e) => setStage(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "14px" }}
              >
                <option value="initial">Initial Seedling (Low Canopy Cover)</option>
                <option value="vegetative">Vegetative (Rapid Leaf Expansion)</option>
                <option value="flowering">Flowering / Fruit Formation (Peak Vigor)</option>
                <option value="maturity">Ripening / Senescence (Natural Chlorosis)</option>
              </select>
            </div>
          </div>

          <div style={{ fontSize: "13px", color: "var(--fk-text-sub, #64748b)", display: "flex", alignItems: "center", gap: "6px" }}>
            <Compass size={16} color="#2563eb" /> Sentinel-2 MSI Multi-Band Pass: <strong>36 hrs ago</strong>
          </div>
        </div>
      </PremiumCard>

      {/* KPI STAT CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          icon={Layers}
          title="Average Plot NDVI"
          value={metrics?.averageNdvi || 0.68}
          unit=""
          subtitle="Plot Mean Vigor Index"
          color="#15803d"
        />
        <StatCard
          icon={CheckCircle2}
          title="Healthy Canopy Area"
          value={`${metrics?.healthyVigorAreaPercent || 83}%`}
          unit=""
          subtitle="Optimal Chlorophyll Density"
          color="#22c55e"
        />
        <StatCard
          icon={AlertTriangle}
          title="Moisture / Disease Stressed"
          value={`${metrics?.stressedAreaPercent || 17}%`}
          unit=""
          subtitle="Field Anomaly Zone"
          color="#ef4444"
        />
        <StatCard
          icon={Sparkles}
          title="Peak Vigor Index"
          value={metrics?.maxNdvi || 0.86}
          unit="NDVI"
          subtitle="Maximum Biomass Point"
          color="#2563eb"
        />
      </div>

      {/* MULTISPECTRAL GRID & SECTOR INSPECTION */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "24px", marginBottom: "24px" }}>
        {/* Spatial NDVI Heatmap Grid */}
        <PremiumCard>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text, #0f172a)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
              Field Pixel Heatmap (6x6 Grid • 2.5 Acres)
            </h3>
            <StatusBadge status="info">Click Cell to Inspect</StatusBadge>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(6, 1fr)",
              gap: "8px",
              padding: "16px",
              background: "var(--fk-bg, #f8fafc)",
              borderRadius: "12px",
              border: "1px solid var(--fk-border, #e2e8f0)",
              maxWidth: "400px",
              margin: "0 auto",
            }}
          >
            {ndviData?.grid?.map((row, rIdx) =>
              row.map((cell, cIdx) => {
                const isSelected = selectedCell && selectedCell.row === rIdx && selectedCell.col === cIdx;
                return (
                  <button
                    key={`${rIdx}-${cIdx}`}
                    onClick={() => setSelectedCell(cell)}
                    title={`Row ${rIdx + 1}, Col ${cIdx + 1} | NDVI: ${cell.ndvi}`}
                    style={{
                      aspectRatio: "1",
                      background: cell.statusColor,
                      border: isSelected ? "3px solid #0f172a" : "1px solid rgba(0,0,0,0.1)",
                      borderRadius: "6px",
                      cursor: "pointer",
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#ffffff",
                      fontWeight: "800",
                      fontSize: "12px",
                      transform: isSelected ? "scale(1.08)" : "none",
                      transition: "all 0.15s ease",
                      boxShadow: isSelected ? "0 4px 10px rgba(0,0,0,0.2)" : "none",
                    }}
                  >
                    <span>{cell.ndvi}</span>
                  </button>
                );
              })
            )}
          </div>

          {/* Color Gradient Legend */}
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "12px", color: "var(--fk-text-sub, #64748b)", fontWeight: "700" }}>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#ef4444" }} /> Severe Stress (&lt;0.38)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#eab308" }} /> Moderate (0.38-0.51)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#22c55e" }} /> Healthy (0.52-0.71)
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: "4px" }}>
              <span style={{ width: "10px", height: "10px", borderRadius: "2px", background: "#15803d" }} /> Peak Vigor (&gt;0.72)
            </span>
          </div>
        </PremiumCard>

        {/* Selected Pixel Analysis & Stress Diagnosis */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {selectedCell && (
            <PremiumCard>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" }}>
                <Eye size={18} color="#2563eb" />
                <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text, #0f172a)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                  Selected Pixel Inspection: Sector R{selectedCell.row + 1} / C{selectedCell.col + 1}
                </h4>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px", fontSize: "14px", marginBottom: "14px" }}>
                <div style={{ padding: "10px", background: "var(--fk-bg, #f8fafc)", borderRadius: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub, #64748b)" }}>NDVI Reading</span>
                  <div style={{ fontSize: "21.5px", fontWeight: "800", color: selectedCell.statusColor }}>
                    {selectedCell.ndvi}
                  </div>
                </div>
                <div style={{ padding: "10px", background: "var(--fk-bg, #f8fafc)", borderRadius: "8px" }}>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub, #64748b)" }}>Biomass Yield Index</span>
                  <div style={{ fontSize: "21.5px", fontWeight: "800", color: "var(--fk-text, #0f172a)" }}>
                    {selectedCell.estimatedBiomassKgM2} kg/m²
                  </div>
                </div>
              </div>

              <div style={{ fontSize: "13px", color: "var(--fk-text-sub, #64748b)" }}>
                Condition Assessment:{" "}
                <strong style={{ textTransform: "capitalize", color: selectedCell.statusColor }}>
                  {selectedCell.status.replace("_", " ")}
                </strong>
              </div>
            </PremiumCard>
          )}

          {/* Stress Zone Diagnosis Box */}
          <PremiumCard style={{ background: "rgba(239, 68, 68, 0.04)", border: "1px solid rgba(239, 68, 68, 0.25)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
              <AlertTriangle size={18} color="#dc2626" />
              <h4 style={{ fontSize: "16px", fontWeight: "800", color: "#dc2626", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                Field Stress Hotspot: {stress?.criticalQuadrant}
              </h4>
            </div>

            <p style={{ fontSize: "13px", color: "var(--fk-text-sub, #475569)", margin: "0 0 10px" }}>
              <strong>Anomaly Level:</strong> {stress?.anomalyFactor}
            </p>

            <div style={{ fontSize: "13px", color: "var(--fk-text, #0f172a)", marginBottom: "10px" }}>
              <strong>Probable Root Causes:</strong>
              <ul style={{ margin: "4px 0 0", paddingLeft: "18px", color: "var(--fk-text-sub, #475569)" }}>
                {stress?.probableCauses?.map((cause, i) => (
                  <li key={i}>{cause}</li>
                ))}
              </ul>
            </div>

            <div style={{ padding: "10px 12px", background: "rgba(21, 128, 61, 0.08)", borderRadius: "8px", border: "1px solid rgba(21, 128, 61, 0.2)", fontSize: "13px", color: "#15803d" }}>
              <strong>Actionable Protocol:</strong> {stress?.recommendedAction}
            </div>
          </PremiumCard>
        </div>
      </div>
    </div>
  );
}
