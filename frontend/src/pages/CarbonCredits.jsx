import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import { useState } from "react";
import { Award, Sparkles, Leaf } from "lucide-react";


const AVAILABLE_PRACTICES = [
  { id: "noTill", name: "Zero Tillage / Direct Seeding", rate: "0.65 tCO2e/ac", desc: "Reduces fuel usage and prevents soil organic matter oxidation." },
  { id: "residueRetention", name: "Crop Residue Mulching (No Burning)", rate: "0.85 tCO2e/ac", desc: "Recycles 3-5 tons of biomass back into topsoil per acre." },
  { id: "coverCropping", name: "Leguminous Cover Crops", rate: "0.70 tCO2e/ac", desc: "Sunhemp or Dhaincha fixing nitrogen and adding root biomass." },
  { id: "biocharApplication", name: "Biochar Soil Amendment", rate: "1.20 tCO2e/ac", desc: "Recalcitrant pure carbon with 100+ year topsoil half-life." },
  { id: "dripFertigation", name: "Precision Drip Fertigation", rate: "0.35 tCO2e/ac", desc: "Reduces synthetic urea application and N2O greenhouse emissions." },
  { id: "agroforestry", name: "Agroforestry / Bund Tree Planting", rate: "1.50 tCO2e/ac", desc: "Deep-root perennial woody biomass carbon sink." }
];

export default function CarbonCredits() {
  const [acres, setAcres] = useState(8);
  const [activePractices, setActivePractices] = useState(["noTill", "residueRetention", "coverCropping"]);
  const [creditPriceINR, setCreditPriceINR] = useState(1900);


  const togglePractice = (id) => {
    setActivePractices((prev) =>
      prev.includes(id) ? prev.filter((p) => p !== id) : [...prev, id]
    );
  };

  const { data: estimateData, loading, error, reload } = useApiResource({ method: 'post', url: '/api/carbon/estimate', data: { acres, activePractices, carbonCreditPriceINR: creditPriceINR } });

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
            background: "rgba(16, 185, 129, 0.15)",
            border: "1px solid rgba(16, 185, 129, 0.35)",
            color: "#34d399",
            padding: "4px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "0.8rem"
          }}
        >
          <Sparkles size={14} /> VERRA (VM0042) & GOLD STANDARD CARBON ACCOUNTING
        </div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
          Regenerative Farm & Carbon Credit Tracker
        </h1>
        <p style={{ color: "var(--fk-text-sub, #94a3b8)", fontSize: "1rem", maxWidth: "750px", margin: "0 auto" }}>
          Quantify annual soil organic carbon (SOC) sequestration from regenerative practices. Monetize certified carbon offsets in the global voluntary carbon market.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Practice Selection Card */}
        <div className="glass" style={{ padding: "1.8rem", borderRadius: "16px", border: "1px solid var(--fk-border, #334155)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 1.2rem 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <Leaf size={20} color="#34d399" /> Regenerative Farm Practices
          </h2>

          <div style={{ marginBottom: "1.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              <span>FARM SIZE (ACRES)</span>
              <span style={{ color: "#34d399" }}>{acres} Acres</span>
            </div>
            <input
              type="range"
              min="1"
              max="50"
              step="1"
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "8px", marginBottom: "1.4rem" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fk-text-sub, #94a3b8)" }}>
              SELECT ACTIVE REGENERATIVE PRACTICES:
            </label>
            {AVAILABLE_PRACTICES.map((p) => {
              const isChecked = activePractices.includes(p.id);
              return (
                <div
                  key={p.id}
                  onClick={() => togglePractice(p.id)}
                  style={{
                    padding: "10px 14px",
                    borderRadius: "10px",
                    border: isChecked ? "1px solid #10b981" : "1px solid var(--fk-border, #334155)",
                    background: isChecked ? "rgba(16, 185, 129, 0.1)" : "rgba(255,255,255,0.02)",
                    cursor: "pointer",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center"
                  }}
                >
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: isChecked ? "#34d399" : "#ffffff" }}>
                      {isChecked ? "✓ " : "+ "} {p.name}
                    </div>
                    <div style={{ fontSize: "11px", color: "#94a3b8" }}>{p.desc}</div>
                  </div>
                  <span style={{ fontSize: "11px", fontWeight: 800, color: "#10b981", background: "rgba(16, 185, 129, 0.2)", padding: "2px 8px", borderRadius: "10px" }}>
                    {p.rate}
                  </span>
                </div>
              );
            })}
          </div>

          <div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              <span>VOLUNTARY CARBON CREDIT VALUE (₹ / tCO2e)</span>
              <span style={{ color: "#facc15" }}>₹{creditPriceINR}</span>
            </div>
            <input
              type="range"
              min="1000"
              max="3500"
              step="50"
              value={creditPriceINR}
              onChange={(e) => setCreditPriceINR(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>
        </div>

        {/* Revenue & Impact Projection */}
        {estimateData && (
          <div className="glass" style={{ padding: "1.8rem", borderRadius: "16px", border: "1px solid var(--fk-border, #334155)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.8rem" }}>
              <span style={{ fontSize: "11px", fontWeight: 800, color: "#34d399", textTransform: "uppercase", background: "rgba(16, 185, 129, 0.15)", padding: "3px 10px", borderRadius: "10px" }}>
                {estimateData.sustainabilityRating}
              </span>
              <Award size={20} color="#34d399" />
            </div>

            <div style={{ fontSize: "12px", color: "#94a3b8" }}>ESTIMATED NET ANNUAL CARBON PAYOUT</div>
            <div style={{ fontSize: "2.4rem", fontWeight: 900, color: "#10b981", margin: "0.2rem 0 0.8rem 0" }}>
              ₹{estimateData.netFarmerCarbonIncomeINR.toLocaleString("en-IN")}
              <span style={{ fontSize: "14px", color: "#94a3b8", fontWeight: 500 }}> / year</span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.4rem" }}>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "10px", border: "1px solid var(--fk-border, #1e293b)" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>CARBON SEQUESTERED</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#38bdf8" }}>{estimateData.totalTCO2SequesteredAnnual} tCO2e</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>{estimateData.totalSequesteredPerAcre} tons/acre/yr</div>
              </div>
              <div style={{ background: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "10px", border: "1px solid var(--fk-border, #1e293b)" }}>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>EST. 3-YR SOC GAIN</div>
                <div style={{ fontSize: "1.4rem", fontWeight: 800, color: "#facc15" }}>+{estimateData.estimatedSocIncreasePercent}%</div>
                <div style={{ fontSize: "11px", color: "#94a3b8" }}>Soil Organic Carbon</div>
              </div>
            </div>

            <h4 style={{ fontSize: "12px", fontWeight: 800, color: "#cbd5e1", textTransform: "uppercase", marginBottom: "8px" }}>
              Practice Sequestration Breakdown
            </h4>
            <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "1.2rem" }}>
              {estimateData.practiceBreakdown.map((p) => (
                <div key={p.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", padding: "6px 10px", borderRadius: "6px", background: "rgba(255,255,255,0.02)" }}>
                  <span>{p.name}:</span>
                  <strong style={{ color: "#34d399" }}>{p.totalTCO2} tCO2e/yr</strong>
                </div>
              ))}
            </div>

            <div style={{ fontSize: "11px", color: "#94a3b8", borderTop: "1px solid var(--fk-border, #1e293b)", paddingTop: "10px" }}>
              Certified under international MRV (Measurement, Reporting, and Verification) standards. 15% platform and verification cost deducted automatically.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
