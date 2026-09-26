import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import { useState } from "react";
import { Calculator, Sparkles } from "lucide-react";


export default function OrganicFarming() {

  const [selectedId, setSelectedId] = useState("jeevamrutha");
  const [acres, setAcres] = useState(3);
  const catalog = useApiResource({ url: '/api/organic/formulations' });
  const { data: scaledData, loading: calculating, error: calculationError, reload: calculate } = useApiResource({ method: 'post', url: '/api/organic/calculate-acreage', data: { formulationId: selectedId, acres: Number(acres) } });
  const formulations = catalog.data?.formulations || [];
  const loading = catalog.loading || calculating;
  const error = catalog.error || calculationError;
  const reload = () => { catalog.reload(); calculate(); };

  const activeFormulation = formulations.find((f) => f.id === selectedId) || formulations[0];

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "2rem 1.5rem", color: "var(--fk-text, #f8fafc)" }}>
      <RequestStatus loading={loading} error={error} onRetry={reload} />
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(34, 197, 94, 0.15)",
            border: "1px solid rgba(34, 197, 94, 0.35)",
            color: "#4ade80",
            padding: "4px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "0.8rem"
          }}
        >
          <Sparkles size={14} /> ICAR & ZBNF REGENERATIVE BIO-INPUT REPOSITORY
        </div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
          Organic Farming & Bio-Inputs Hub
        </h1>
        <p style={{ color: "var(--fk-text-sub, #94a3b8)", fontSize: "1rem", maxWidth: "750px", margin: "0 auto" }}>
          Standardized indigenous bio-fertilizers and botanical insect repellents. Scale raw material requirements dynamically for your exact farm acreage.
        </p>
      </div>

      {/* Formulation Pills */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "2rem" }}>
        {formulations.map((f) => {
          const isSel = f.id === selectedId;
          return (
            <button
              key={f.id}
              onClick={() => setSelectedId(f.id)}
              style={{
                padding: "8px 18px",
                borderRadius: "20px",
                border: isSel ? "2px solid #22c55e" : "1px solid var(--fk-border, #334155)",
                background: isSel ? "rgba(34, 197, 94, 0.15)" : "var(--fk-card, #0f172a)",
                color: isSel ? "#4ade80" : "var(--fk-text, #ffffff)",
                fontWeight: 700,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all 0.15s ease"
              }}
            >
              🌿 {f.name.split(" ")[0]}
            </button>
          );
        })}
      </div>

      {/* Formulation Details & Acreage Scaler */}
      {activeFormulation && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
          {/* Preparation & Instructions */}
          <div className="glass" style={{ padding: "1.8rem", borderRadius: "16px", border: "1px solid var(--fk-border, #334155)" }}>
            <span style={{ fontSize: "11px", fontWeight: 800, color: "#4ade80", textTransform: "uppercase", background: "rgba(34, 197, 94, 0.15)", padding: "3px 10px", borderRadius: "10px" }}>
              {activeFormulation.category}
            </span>
            <h2 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0.8rem 0 0.4rem 0" }}>
              {activeFormulation.name}
            </h2>
            <p style={{ fontSize: "13px", color: "var(--fk-text-sub, #cbd5e1)", lineHeight: 1.5, marginBottom: "1.2rem" }}>
              {activeFormulation.targetBenefits}
            </p>

            <div style={{ display: "flex", gap: "1.2rem", marginBottom: "1.4rem", flexWrap: "wrap", fontSize: "12px", color: "#94a3b8" }}>
              <div>⏱️ <strong>Shelf Life:</strong> {activeFormulation.shelfLifeDays} days</div>
              <div>🚜 <strong>Dosage:</strong> {activeFormulation.dosagePerAcre}</div>
            </div>

            <h3 style={{ fontSize: "13px", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", margin: "0 0 0.8rem 0" }}>
              Preparation Protocol (Step-by-Step)
            </h3>
            <ol style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "13px", lineHeight: 1.6, color: "var(--fk-text, #ffffff)" }}>
              {activeFormulation.preparationSteps.map((step, idx) => (
                <li key={idx} style={{ marginBottom: "6px" }}>{step}</li>
              ))}
            </ol>
          </div>

          {/* Acreage Scaling Calculator */}
          <div className="glass" style={{ padding: "1.8rem", borderRadius: "16px", border: "1px solid var(--fk-border, #334155)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.2rem" }}>
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: 0, display: "flex", alignItems: "center", gap: "8px" }}>
                <Calculator size={18} color="#22c55e" /> Acreage Raw Material Scaler
              </h3>
              <span style={{ fontSize: "12px", color: "#22c55e", fontWeight: 700 }}>{acres} Acres</span>
            </div>

            <div style={{ marginBottom: "1.4rem" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fk-text-sub, #94a3b8)", display: "block", marginBottom: "6px" }}>
                FARM LAND SIZE (ACRES)
              </label>
              <input
                type="range"
                min="0.5"
                max="25"
                step="0.5"
                value={acres}
                onChange={(e) => setAcres(Number(e.target.value))}
                style={{ width: "100%" }}
              />
            </div>

            {scaledData?.scaledIngredients && (
              <div style={{ marginBottom: "1.4rem" }}>
                <h4 style={{ fontSize: "12px", fontWeight: 700, color: "#cbd5e1", marginBottom: "8px" }}>
                  REQUIRED QUANTITIES FOR {acres} ACRES:
                </h4>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  {Object.entries(scaledData.scaledIngredients).map(([key, val]) => (
                    <div key={key} style={{ padding: "8px 12px", borderRadius: "8px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--fk-border, #1e293b)" }}>
                      <div style={{ fontSize: "11px", color: "#94a3b8" }}>{key.replace(/([A-Z])/g, " $1")}</div>
                      <div style={{ fontSize: "14px", fontWeight: 800, color: "#4ade80" }}>{val}</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Savings Box */}
            <div style={{ background: "rgba(34, 197, 94, 0.08)", border: "1px solid rgba(34, 197, 94, 0.25)", padding: "1rem", borderRadius: "12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                <span style={{ fontSize: "12px", fontWeight: 700, color: "#86efac" }}>Chemical Fertilizer Savings:</span>
                <strong style={{ fontSize: "1.1rem", color: "#22c55e" }}>+₹{scaledData?.chemicalFertilizerSavingsINR?.toLocaleString("en-IN")}</strong>
              </div>
              <p style={{ margin: 0, fontSize: "11px", color: "#94a3b8" }}>
                Replaces synthetic urea & DAP with indigenous microbial consortium, saving up to ₹3,200 per acre per season.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
