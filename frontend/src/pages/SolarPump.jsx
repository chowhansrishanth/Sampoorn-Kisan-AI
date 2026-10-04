import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import { useState } from "react";
import { Sun, Sparkles } from "lucide-react";


export default function SolarPump() {
  const [params, setParams] = useState({
    depthFeet: 160,
    irrigationAcres: 4,
    cropType: "Paddy / Vegetables",
    waterSource: "Borewell",
    existingPumpType: "Diesel"
  });
  const { data: result, loading, error, reload } = useApiResource({ method: 'post', url: '/api/solar-pump/calculate', data: params });

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
            background: "rgba(234, 179, 8, 0.15)",
            border: "1px solid rgba(234, 179, 8, 0.35)",
            color: "#facc15",
            padding: "4px 14px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 700,
            marginBottom: "0.8rem"
          }}
        >
          <Sparkles size={14} /> MNRE & PM-KUSUM COMPONENT-B SCHEME CALCULATOR
        </div>
        <h1 style={{ fontSize: "2.3rem", fontWeight: 900, margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
          Solar Water Pump Sizing & Subsidy Hub
        </h1>
        <p style={{ color: "var(--fk-text-sub, #94a3b8)", fontSize: "1.06rem", maxWidth: "750px", margin: "0 auto" }}>
          Determine required pump horsepower and solar array capacity based on borewell water depth. Calculate 90% combined government subsidy and diesel fuel savings.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Controls Card */}
        <div className="glass" style={{ padding: "1.8rem", borderRadius: "16px", border: "1px solid var(--fk-border, #334155)" }}>
          <h2 style={{ fontSize: "1.3rem", fontWeight: 800, margin: "0 0 1.2rem 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Sun size={20} color="#facc15" /> Borewell & Farm Parameters
          </h2>

          <div style={{ marginBottom: "1.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
              <span>BOREWELL WATER DEPTH / HEAD</span>
              <span style={{ color: "#38bdf8" }}>{params.depthFeet} Feet ({Math.round(params.depthFeet * 0.3048)} m)</span>
            </div>
            <input
              type="range"
              min="40"
              max="450"
              step="10"
              value={params.depthFeet}
              onChange={(e) => setParams((p) => ({ ...p, depthFeet: Number(e.target.value) }))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "1.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: 700, marginBottom: "6px" }}>
              <span>IRRIGATION COMMAND AREA</span>
              <span style={{ color: "#22c55e" }}>{params.irrigationAcres} Acres</span>
            </div>
            <input
              type="range"
              min="1"
              max="15"
              step="1"
              value={params.irrigationAcres}
              onChange={(e) => setParams((p) => ({ ...p, irrigationAcres: Number(e.target.value) }))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ marginBottom: "1.4rem" }}>
            <label style={{ fontSize: "13px", fontWeight: 700, color: "var(--fk-text-sub, #94a3b8)", display: "block", marginBottom: "6px" }}>
              CURRENT POWER SOURCE
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              {["Diesel", "Grid Electricity"].map((t) => (
                <button
                  key={t}
                  onClick={() => setParams((p) => ({ ...p, existingPumpType: t }))}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    borderRadius: "8px",
                    border: params.existingPumpType === t ? "2px solid #facc15" : "1px solid var(--fk-border, #334155)",
                    background: params.existingPumpType === t ? "rgba(234, 179, 8, 0.15)" : "var(--fk-card, #0f172a)",
                    color: params.existingPumpType === t ? "#facc15" : "#ffffff",
                    fontWeight: 700,
                    fontSize: "14px",
                    cursor: "pointer"
                  }}
                >
                  {t === "Diesel" ? "⛽ Diesel Engine" : "⚡ Grid Electricity"}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: "rgba(56, 189, 248, 0.08)", border: "1px solid rgba(56, 189, 248, 0.25)", padding: "1rem", borderRadius: "12px", fontSize: "13px", color: "#94a3b8", lineHeight: 1.5 }}>
            💡 Under PM-KUSUM Component-B, farmers pay only <strong>10%</strong> upfront. Central Government provides 30% subsidy, State Government contributes 30%, and 30% is financed via NABARD / institutional bank loans.
          </div>
        </div>

        {/* Results Card */}
        {result && (
          <div className="glass" style={{ padding: "1.8rem", borderRadius: "16px", border: "1px solid var(--fk-border, #334155)" }}>
            <span style={{ fontSize: "12px", fontWeight: 800, color: "#38bdf8", textTransform: "uppercase", background: "rgba(56, 189, 248, 0.15)", padding: "3px 10px", borderRadius: "10px" }}>
              RECOMMENDED SYSTEM
            </span>
            <h3 style={{ fontSize: "1.9rem", fontWeight: 900, margin: "0.6rem 0 0.2rem 0", color: "#ffffff" }}>
              {result.sizing.recommendedHP} HP {result.sizing.pumpType}
            </h3>
            <div style={{ fontSize: "14px", color: "#94a3b8", marginBottom: "1.4rem" }}>
              Solar Array Capacity: <strong>{result.sizing.solarArrayKWp} kWp</strong> ({result.sizing.solarPanelsCount} Polycrystalline Panels)
            </div>

            {/* Financials Strip */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.4rem" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--fk-border, #1e293b)" }}>
                <div style={{ fontSize: "12px", color: "#94a3b8" }}>TOTAL PROJECT COST</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 800 }}>₹{result.financials.totalProjectCostINR.toLocaleString("en-IN")}</div>
              </div>
              <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.25)" }}>
                <div style={{ fontSize: "12px", color: "#86efac", fontWeight: 700 }}>FARMER SHARE (10%)</div>
                <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#22c55e" }}>₹{result.financials.farmerPayableINR.toLocaleString("en-IN")}</div>
              </div>
            </div>

            {/* Subsidy Matrix */}
            <div style={{ fontSize: "13px", marginBottom: "1.4rem", background: "rgba(255,255,255,0.02)", padding: "12px", borderRadius: "10px", border: "1px solid var(--fk-border, #1e293b)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>Central Govt Subsidy (30%):</span>
                <strong>₹{result.financials.centralSubsidyINR.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                <span>State Govt Subsidy (30%):</span>
                <strong>₹{result.financials.stateSubsidyINR.toLocaleString("en-IN")}</strong>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>Bank Loan / NABARD (30%):</span>
                <strong>₹{result.financials.bankLoanINR.toLocaleString("en-IN")}</strong>
              </div>
            </div>

            {/* Water Discharge & Savings */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
              <div style={{ background: "rgba(56, 189, 248, 0.08)", padding: "10px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", color: "#7dd3fc" }}>DAILY WATER OUTPUT</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#38bdf8" }}>{result.sizing.dailyDischargeLiters.toLocaleString("en-IN")} L/day</div>
              </div>
              <div style={{ background: "rgba(245, 158, 11, 0.08)", padding: "10px", borderRadius: "8px" }}>
                <div style={{ fontSize: "12px", color: "#fde047" }}>ANNUAL FUEL SAVINGS</div>
                <div style={{ fontSize: "1.2rem", fontWeight: 800, color: "#facc15" }}>₹{result.financials.annualDieselSavingsINR.toLocaleString("en-IN")}/yr</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

