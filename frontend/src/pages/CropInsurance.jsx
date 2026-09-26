import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import { useState } from "react";
import { Clock, PhoneCall, DollarSign, Sparkles } from "lucide-react";


const CROPS = ["Paddy", "Wheat", "Cotton", "Soybean", "Maize", "Chili", "Tomato", "Mustard", "Groundnut"];

export default function CropInsurance() {
  const [selectedCrop, setSelectedCrop] = useState("Paddy");
  const [acres, setAcres] = useState(3);
  const { data, loading, error, reload } = useApiResource([
    { method: 'post', url: '/api/insurance/calculate-premium', data: { crop: selectedCrop, acres } },
    { url: '/api/insurance/claim-guide' }
  ]);
  const premiumData = data?.[0];
  const claimGuide = data?.[1];

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
            background: "rgba(59, 130, 246, 0.15)",
            border: "1px solid rgba(59, 130, 246, 0.35)",
            color: "#60a5fa",
            padding: "4px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "0.8rem"
          }}
        >
          <Sparkles size={14} /> PRADHAN MANTRI FASAL BIMA YOJANA (PMFBY) ASSISTANCE
        </div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
          Crop Insurance & 72-Hour Claim Portal
        </h1>
        <p style={{ color: "var(--fk-text-sub, #94a3b8)", fontSize: "1rem", maxWidth: "750px", margin: "0 auto" }}>
          Calculate subsidized statutory farmer premiums (1.5% to 5.0%) and follow the step-by-step emergency claim intimation protocol for crop damages.
        </p>
      </div>

      {/* 72-Hour Warning Strip */}
      <div
        className="glass"
        style={{
          padding: "1rem 1.4rem",
          borderRadius: "12px",
          background: "linear-gradient(90deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)",
          border: "1px solid rgba(239, 68, 68, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Clock size={24} color="#f87171" />
          <div>
            <strong style={{ color: "#f87171", fontSize: "14px", display: "block" }}>CRITICAL 72-HOUR CLAIM WINDOW</strong>
            <span style={{ fontSize: "12px", color: "#cbd5e1" }}>
              Localized calamities (hailstorms, floods) and post-harvest unseasonal rain claims must be reported within 72 hours.
            </span>
          </div>
        </div>
        <a
          href="tel:14447"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#dc2626",
            color: "#ffffff",
            padding: "8px 18px",
            borderRadius: "20px",
            fontSize: "13px",
            fontWeight: 800,
            textDecoration: "none"
          }}
        >
          <PhoneCall size={16} /> CALL 14447 (TOLL-FREE)
        </a>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem", marginBottom: "2rem" }}>
        {/* Premium Calculator Card */}
        <div className="glass" style={{ padding: "1.8rem", borderRadius: "16px", border: "1px solid var(--fk-border, #334155)" }}>
          <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 1.2rem 0", display: "flex", alignItems: "center", gap: "8px" }}>
            <DollarSign size={20} color="#60a5fa" /> Subsidized Premium Calculator
          </h2>

          <div style={{ marginBottom: "1.2rem" }}>
            <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fk-text-sub, #94a3b8)", display: "block", marginBottom: "6px" }}>
              INSURED CROP
            </label>
            <select
              value={selectedCrop}
              onChange={(e) => setSelectedCrop(e.target.value)}
              style={{
                width: "100%",
                padding: "8px 12px",
                borderRadius: "8px",
                background: "var(--fk-card, #0f172a)",
                border: "1px solid var(--fk-border, #334155)",
                color: "#ffffff",
                fontSize: "14px"
              }}
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ marginBottom: "1.4rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "6px" }}>
              <span>FARM ACREAGE</span>
              <span style={{ color: "#60a5fa" }}>{acres} Acres</span>
            </div>
            <input
              type="range"
              min="1"
              max="20"
              step="1"
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value))}
              style={{ width: "100%" }}
            />
          </div>

          {premiumData && (
            <div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1rem" }}>
                <div style={{ background: "rgba(255,255,255,0.03)", padding: "10px", borderRadius: "8px", border: "1px solid var(--fk-border, #1e293b)" }}>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>TOTAL SUM INSURED</div>
                  <div style={{ fontSize: "1.2rem", fontWeight: 800 }}>₹{premiumData.sumInsuredTotalINR.toLocaleString("en-IN")}</div>
                </div>
                <div style={{ background: "rgba(34, 197, 94, 0.1)", padding: "10px", borderRadius: "8px", border: "1px solid rgba(34, 197, 94, 0.25)" }}>
                  <div style={{ fontSize: "11px", color: "#86efac", fontWeight: 700 }}>FARMER PREMIUM ({premiumData.farmerPremiumRatePercent}%)</div>
                  <div style={{ fontSize: "1.3rem", fontWeight: 900, color: "#22c55e" }}>₹{premiumData.farmerPremiumPayableINR.toLocaleString("en-IN")}</div>
                </div>
              </div>

              <div style={{ fontSize: "12px", background: "rgba(59, 130, 246, 0.08)", padding: "12px", borderRadius: "10px", border: "1px solid rgba(59, 130, 246, 0.25)", color: "#cbd5e1" }}>
                🏛️ Government subsidy absorbs <strong>₹{premiumData.govtSubsidyINR.toLocaleString("en-IN")}</strong> ({premiumData.governmentSubsidySharePercent}% of commercial actuarial premium) paid equally by Center & State.
              </div>
            </div>
          )}
        </div>

        {/* Claim Triage Categories */}
        <div className="glass" style={{ padding: "1.8rem", borderRadius: "16px", border: "1px solid var(--fk-border, #334155)" }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 1rem 0", color: "#f87171" }}>
            Four-Tier PMFBY Claim Categories
          </h3>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {claimGuide?.claimCategories &&
              Object.entries(claimGuide.claimCategories).map(([key, c]) => (
                <div key={key} style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--fk-border, #1e293b)" }}>
                  <div style={{ fontSize: "13px", fontWeight: 800, color: "#ffffff" }}>{c.title}</div>
                  <div style={{ fontSize: "11px", color: "#f59e0b", margin: "2px 0" }}>⏱️ {c.timeWindow}</div>
                  <div style={{ fontSize: "12px", color: "#94a3b8" }}>{c.payoutTerms}</div>
                </div>
              ))}
          </div>
        </div>
      </div>
    </div>
  );
}
