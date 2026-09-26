import useApiResource from '../hooks/useApiResource';
import { useState } from "react";
import axios from "../api/client";
import { HeartPulse, Scale, CalendarCheck, PhoneCall, CheckCircle, ShieldAlert, Sparkles, Droplets } from "lucide-react";

const API = axios.defaults.baseURL;

const COMMON_SYMPTOMS = [
  "High fever",
  "Blister on tongue/mouth",
  "Blister on hooves / Lameness",
  "Excessive drooling / salivation",
  "Swollen / hot udder",
  "Blood or clots in milk",
  "Firm round skin lumps / nodules",
  "Severe left flank bloat",
  "Tremors / Downer cow (cannot stand)",
  "Cold ears / S-shaped neck",
  "Eye discharge & cough",
  "Loss of appetite & rumination"
];

export default function LivestockAdvisor() {
  const [activeTab, setActiveTab] = useState("triage"); // 'triage' | 'ration' | 'vaccination'

  // Triage state
  const [species, setSpecies] = useState("Cattle");
  const [selectedSymptoms, setSelectedSymptoms] = useState([]);
  const [triageNotes, setTriageNotes] = useState("");
  const [triageResult, setTriageResult] = useState(null);
  const [triageLoading, setTriageLoading] = useState(false);
  const [triageError, setTriageError] = useState("");

  // Ration state
  const [rationParams, setRationParams] = useState({
    species: "Cow",
    bodyWeightKg: 400,
    milkYieldLiters: 12,
    fatPercentage: 4.2,
    pregnancyMonth: 0
  });


  // Vaccination state


  // Toggle symptom chip
  const toggleSymptom = (sym) => {
    setSelectedSymptoms((prev) =>
      prev.includes(sym) ? prev.filter((s) => s !== sym) : [...prev, sym]
    );
  };

  // Run Triage
  const handleRunTriage = async () => {
    if (selectedSymptoms.length === 0 && !triageNotes.trim()) {
      setTriageError("Please select at least one symptom or describe signs.");
      return;
    }
    setTriageLoading(true);
    setTriageError("");
    try {
      const res = await axios.post(`${API}/api/livestock/triage`, {
        species,
        symptoms: selectedSymptoms,
        notes: triageNotes
      });
      setTriageResult(res.data);
    } catch (err) {
      setTriageError(err.response?.data?.error || "Failed to analyze symptoms.");
    } finally {
      setTriageLoading(false);
    }
  };

  const ration = useApiResource(activeTab === 'ration' ? { method: 'post', url: '/api/livestock/ration', data: rationParams } : null);
  const vaccination = useApiResource(activeTab === 'vaccination' ? { url: '/api/livestock/vaccination' } : null);
  const rationResult = ration.data;
  const rationLoading = ration.loading;
  const vaccinationData = vaccination.data;
  const handleCalculateRation = ration.reload;

  return (
    <div
      style={{
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "2rem 1.5rem",
        color: "var(--fk-text, #f8fafc)"
      }}
    >
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: "2rem" }}>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "rgba(245, 158, 11, 0.15)",
            border: "1px solid rgba(245, 158, 11, 0.35)",
            color: "#fbbf24",
            padding: "4px 14px",
            borderRadius: "20px",
            fontSize: "12px",
            fontWeight: 700,
            marginBottom: "0.8rem"
          }}
        >
          <Sparkles size={14} /> ICAR & IVRI VETERINARY DECISION SUPPORT
        </div>
        <h1 style={{ fontSize: "2.2rem", fontWeight: 900, margin: "0 0 0.5rem 0", letterSpacing: "-0.02em" }}>
          Livestock & Dairy Health Advisor
        </h1>
        <p style={{ color: "var(--fk-text-sub, #94a3b8)", fontSize: "1rem", maxWidth: "720px", margin: "0 auto" }}>
          Instant symptom triage, ICAR-standard balanced dairy feed ration calculator, and national vaccination schedules for cattle, buffaloes, sheep, and goats.
        </p>
      </div>

      {/* Emergency Hotline Strip */}
      <div
        className="glass"
        style={{
          padding: "0.9rem 1.4rem",
          borderRadius: "12px",
          background: "linear-gradient(90deg, rgba(220, 38, 38, 0.12) 0%, rgba(245, 158, 11, 0.12) 100%)",
          border: "1px solid rgba(220, 38, 38, 0.3)",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: "2rem",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <ShieldAlert size={22} color="#f87171" />
          <span style={{ fontSize: "13px", fontWeight: 700 }}>
            Toll-Free National Animal Health & Emergency Helpline:
          </span>
        </div>
        <a
          href="tel:1962"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "8px",
            background: "#dc2626",
            color: "#ffffff",
            padding: "6px 16px",
            borderRadius: "20px",
            fontSize: "14px",
            fontWeight: 800,
            textDecoration: "none"
          }}
        >
          <PhoneCall size={16} /> DIAL 1962
        </a>
      </div>

      {/* Tab Navigation */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          borderBottom: "1px solid var(--fk-border, #334155)",
          marginBottom: "2rem"
        }}
      >
        <button
          onClick={() => setActiveTab("triage")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "triage" ? "3px solid #22c55e" : "3px solid transparent",
            color: activeTab === "triage" ? "#22c55e" : "var(--fk-text-sub, #94a3b8)",
            padding: "10px 18px",
            fontWeight: 800,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <HeartPulse size={18} /> Symptom Triage & First Aid
        </button>

        <button
          onClick={() => setActiveTab("ration")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "ration" ? "3px solid #38bdf8" : "3px solid transparent",
            color: activeTab === "ration" ? "#38bdf8" : "var(--fk-text-sub, #94a3b8)",
            padding: "10px 18px",
            fontWeight: 800,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <Scale size={18} /> Dairy Ration Balancer
        </button>

        <button
          onClick={() => setActiveTab("vaccination")}
          style={{
            background: "none",
            border: "none",
            borderBottom: activeTab === "vaccination" ? "3px solid #a855f7" : "3px solid transparent",
            color: activeTab === "vaccination" ? "#a855f7" : "var(--fk-text-sub, #94a3b8)",
            padding: "10px 18px",
            fontWeight: 800,
            fontSize: "14px",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "8px"
          }}
        >
          <CalendarCheck size={18} /> Vaccination & Deworming
        </button>
      </div>

      {/* ── TAB 1: SYMPTOM TRIAGE ─────────────────────────────────────────── */}
      {activeTab === "triage" && (
        <div>
          <div
            className="glass"
            style={{
              padding: "1.6rem",
              borderRadius: "16px",
              border: "1px solid var(--fk-border, #334155)",
              marginBottom: "2rem"
            }}
          >
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 1rem 0" }}>
              Select Animal Species & Observed Clinical Signs
            </h2>

            {/* Species Selector */}
            <div style={{ display: "flex", gap: "10px", marginBottom: "1.4rem", flexWrap: "wrap" }}>
              {["Cattle", "Buffalo", "Goat", "Sheep"].map((sp) => (
                <button
                  key={sp}
                  onClick={() => setSpecies(sp)}
                  style={{
                    padding: "8px 18px",
                    borderRadius: "20px",
                    border: species === sp ? "2px solid #22c55e" : "1px solid var(--fk-border, #334155)",
                    background: species === sp ? "rgba(34, 197, 94, 0.15)" : "var(--fk-card, #0f172a)",
                    color: species === sp ? "#4ade80" : "var(--fk-text, #ffffff)",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer"
                  }}
                >
                  {sp === "Cattle" ? "🐄" : sp === "Buffalo" ? "🐃" : "🐐"} {sp}
                </button>
              ))}
            </div>

            {/* Common Symptom Chips */}
            <div style={{ marginBottom: "1.4rem" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fk-text-sub, #94a3b8)", display: "block", marginBottom: "8px" }}>
                COMMON SYMPTOMS (CLICK TO SELECT)
              </label>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {COMMON_SYMPTOMS.map((sym) => {
                  const isSelected = selectedSymptoms.includes(sym);
                  return (
                    <button
                      key={sym}
                      onClick={() => toggleSymptom(sym)}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "8px",
                        border: isSelected ? "1px solid #22c55e" : "1px solid var(--fk-border, #334155)",
                        background: isSelected ? "#22c55e" : "var(--fk-card, #0f172a)",
                        color: isSelected ? "#052e16" : "var(--fk-text, #ffffff)",
                        fontWeight: isSelected ? 800 : 500,
                        fontSize: "12px",
                        cursor: "pointer",
                        transition: "all 0.15s ease"
                      }}
                    >
                      {isSelected ? "✓ " : "+ "} {sym}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Freeform Notes */}
            <div style={{ marginBottom: "1.4rem" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, color: "var(--fk-text-sub, #94a3b8)", display: "block", marginBottom: "6px" }}>
                ADDITIONAL FIELD OBSERVATIONS (OPTIONAL)
              </label>
              <textarea
                rows="2"
                placeholder="e.g., Temperature 104°F, stopped chewing cud since yesterday, calved 24 hours ago..."
                value={triageNotes}
                onChange={(e) => setTriageNotes(e.target.value)}
                style={{
                  width: "100%",
                  padding: "10px 14px",
                  borderRadius: "10px",
                  background: "var(--fk-card, #0f172a)",
                  border: "1px solid var(--fk-border, #334155)",
                  color: "var(--fk-text, #ffffff)",
                  fontSize: "13px",
                  outline: "none",
                  boxSizing: "border-box"
                }}
              />
            </div>

            {triageError && (
              <div style={{ color: "#f87171", fontSize: "13px", marginBottom: "1rem" }}>
                {triageError}
              </div>
            )}

            <button
              onClick={handleRunTriage}
              disabled={triageLoading}
              style={{
                background: "#22c55e",
                color: "#052e16",
                border: "none",
                padding: "10px 24px",
                borderRadius: "10px",
                fontWeight: 900,
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              {triageLoading ? "Analyzing Clinical Profiles..." : "Run Clinical Triage"}
            </button>
          </div>

          {/* Triage Results Card */}
          {triageResult && (
            <div
              className="glass"
              style={{
                padding: "1.8rem",
                borderRadius: "16px",
                border: "1px solid var(--fk-border, #334155)",
                marginBottom: "2rem"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1rem", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span
                    style={{
                      background: triageResult.primaryDiagnosis.severity === "Emergency" ? "#dc2626" : "#f59e0b",
                      color: "#ffffff",
                      fontSize: "11px",
                      fontWeight: 800,
                      padding: "3px 10px",
                      borderRadius: "12px",
                      textTransform: "uppercase"
                    }}
                  >
                    {triageResult.primaryDiagnosis.severity} ALERT
                  </span>
                  <h3 style={{ fontSize: "1.5rem", fontWeight: 900, margin: "0.5rem 0 0.2rem 0" }}>
                    {triageResult.primaryDiagnosis.name}
                  </h3>
                  <div style={{ fontSize: "13px", color: "var(--fk-text-sub, #94a3b8)" }}>
                    Match Confidence: <strong>{triageResult.primaryDiagnosis.matchConfidence}%</strong>
                  </div>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "#94a3b8", display: "block" }}>Urgency Protocol</span>
                  <strong style={{ color: "#f87171" }}>{triageResult.primaryDiagnosis.urgency}</strong>
                </div>
              </div>

              {/* Clinical Description */}
              <p style={{ fontSize: "14px", lineHeight: 1.5, color: "var(--fk-text, #ffffff)", marginBottom: "1.4rem" }}>
                {triageResult.primaryDiagnosis.symptoms}
              </p>

              {/* Immediate First-Aid Box */}
              <div
                style={{
                  background: "rgba(34, 197, 94, 0.08)",
                  border: "1px solid rgba(34, 197, 94, 0.25)",
                  padding: "1.2rem",
                  borderRadius: "12px",
                  marginBottom: "1.4rem"
                }}
              >
                <h4 style={{ margin: "0 0 0.8rem 0", fontSize: "14px", fontWeight: 800, color: "#4ade80", display: "flex", alignItems: "center", gap: "8px" }}>
                  <CheckCircle size={16} /> Immediate Veterinary First-Aid Protocol
                </h4>
                <ul style={{ margin: 0, paddingLeft: "1.2rem", fontSize: "13px", lineHeight: 1.6 }}>
                  {triageResult.primaryDiagnosis.firstAid.map((step, idx) => (
                    <li key={idx} style={{ marginBottom: "4px" }}>
                      {step}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Prevention Advice */}
              <div style={{ fontSize: "13px", color: "var(--fk-text-sub, #94a3b8)" }}>
                <strong>Long-Term Prevention:</strong> {triageResult.primaryDiagnosis.prevention}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 2: DAIRY RATION BALANCER ─────────────────────────────────── */}
      {activeTab === "ration" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "1.5rem" }}>
          {/* Controls */}
          <div
            className="glass"
            style={{
              padding: "1.6rem",
              borderRadius: "16px",
              border: "1px solid var(--fk-border, #334155)"
            }}
          >
            <h2 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 1.2rem 0" }}>
              Milch Animal Parameters
            </h2>

            <div style={{ marginBottom: "1.2rem" }}>
              <label style={{ fontSize: "12px", fontWeight: 700, display: "block", marginBottom: "6px" }}>
                ANIMAL SPECIES
              </label>
              <select
                value={rationParams.species}
                onChange={(e) => setRationParams((p) => ({ ...p, species: e.target.value }))}
                style={{
                  width: "100%",
                  padding: "8px 12px",
                  borderRadius: "8px",
                  background: "var(--fk-card, #0f172a)",
                  border: "1px solid var(--fk-border, #334155)",
                  color: "#ffffff"
                }}
              >
                <option value="Cow">Crossbred / Indigenous Cow</option>
                <option value="Buffalo">Murrah / Mehsana Buffalo</option>
              </select>
            </div>

            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                <span>BODY WEIGHT</span>
                <span style={{ color: "#38bdf8" }}>{rationParams.bodyWeightKg} kg</span>
              </div>
              <input
                type="range"
                min="200"
                max="650"
                step="25"
                value={rationParams.bodyWeightKg}
                onChange={(e) => setRationParams((p) => ({ ...p, bodyWeightKg: Number(e.target.value) }))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                <span>DAILY MILK YIELD</span>
                <span style={{ color: "#22c55e" }}>{rationParams.milkYieldLiters} Liters / day</span>
              </div>
              <input
                type="range"
                min="0"
                max="35"
                step="1"
                value={rationParams.milkYieldLiters}
                onChange={(e) => setRationParams((p) => ({ ...p, milkYieldLiters: Number(e.target.value) }))}
                style={{ width: "100%" }}
              />
            </div>

            <div style={{ marginBottom: "1.2rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", fontWeight: 700, marginBottom: "4px" }}>
                <span>MILK FAT PERCENTAGE</span>
                <span style={{ color: "#facc15" }}>{rationParams.fatPercentage}%</span>
              </div>
              <input
                type="range"
                min="3.0"
                max="8.0"
                step="0.1"
                value={rationParams.fatPercentage}
                onChange={(e) => setRationParams((p) => ({ ...p, fatPercentage: Number(e.target.value) }))}
                style={{ width: "100%" }}
              />
            </div>

            <button
              onClick={handleCalculateRation}
              disabled={rationLoading}
              style={{
                width: "100%",
                background: "#38bdf8",
                color: "#082f49",
                border: "none",
                padding: "10px",
                borderRadius: "8px",
                fontWeight: 900,
                fontSize: "14px",
                cursor: "pointer"
              }}
            >
              {rationLoading ? "Computing ICAR Diet..." : "Recalculate Ration"}
            </button>
          </div>

          {/* Diet Output Card */}
          {rationResult && (
            <div
              className="glass"
              style={{
                padding: "1.6rem",
                borderRadius: "16px",
                border: "1px solid var(--fk-border, #334155)"
              }}
            >
              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 1rem 0", color: "#38bdf8" }}>
                Recommended Daily Feed (Fresh Weight Basis)
              </h3>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "1.4rem" }}>
                <div style={{ background: "rgba(34, 197, 94, 0.1)", border: "1px solid rgba(34, 197, 94, 0.25)", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#86efac", fontWeight: 700 }}>GREEN FODDER</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#22c55e" }}>
                    {rationResult.dailyDietRecommendations.feedIngredientsFreshWeight.greenFodderKg} kg
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Hybrid Napier / Sorghum</div>
                </div>

                <div style={{ background: "rgba(245, 158, 11, 0.1)", border: "1px solid rgba(245, 158, 11, 0.25)", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#fde047", fontWeight: 700 }}>DRY STRAW / BHUSA</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#f59e0b" }}>
                    {rationResult.dailyDietRecommendations.feedIngredientsFreshWeight.dryStrawKg} kg
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Paddy / Wheat straw</div>
                </div>

                <div style={{ background: "rgba(56, 189, 248, 0.1)", border: "1px solid rgba(56, 189, 248, 0.25)", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#7dd3fc", fontWeight: 700 }}>CONCENTRATE PELLET</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#38bdf8" }}>
                    {rationResult.dailyDietRecommendations.feedIngredientsFreshWeight.concentratePelletKg} kg
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Cattle feed (20% CP)</div>
                </div>

                <div style={{ background: "rgba(168, 85, 247, 0.1)", border: "1px solid rgba(168, 85, 247, 0.25)", padding: "12px", borderRadius: "10px" }}>
                  <div style={{ fontSize: "11px", color: "#d8b4fe", fontWeight: 700 }}>MINERAL MIXTURE</div>
                  <div style={{ fontSize: "1.5rem", fontWeight: 900, color: "#c084fc" }}>
                    {rationResult.dailyDietRecommendations.feedIngredientsFreshWeight.mineralMixtureGrams} g
                  </div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>+ 35g common salt</div>
                </div>
              </div>

              {/* Water Requirement */}
              <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.04)" }}>
                <Droplets size={20} color="#38bdf8" />
                <span style={{ fontSize: "13px" }}>
                  Estimated clean drinking water requirement: <strong>{rationResult.dailyDietRecommendations.feedIngredientsFreshWeight.cleanWaterLitersEstimate} Liters / day</strong>
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB 3: VACCINATION & DEWORMING ─────────────────────────────────── */}
      {activeTab === "vaccination" && (
        <div>
          {/* Deworming Guidelines */}
          <div
            className="glass"
            style={{
              padding: "1.4rem",
              borderRadius: "14px",
              border: "1px solid var(--fk-border, #334155)",
              marginBottom: "2rem"
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 0.8rem 0", color: "#22c55e" }}>
              🪱 Strategic Deworming Protocol
            </h3>
            <p style={{ fontSize: "13px", color: "var(--fk-text-sub, #94a3b8)", margin: "0 0 1rem 0" }}>
              Internal parasites suppress milk yield and immune antibody synthesis. Always deworm 10–14 days prior to seasonal vaccination.
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
              {vaccinationData?.dewormingSchedule?.map((d, i) => (
                <div key={i} style={{ padding: "10px 14px", borderRadius: "10px", background: "rgba(255,255,255,0.03)", border: "1px solid var(--fk-border, #1e293b)" }}>
                  <div style={{ fontSize: "12px", fontWeight: 800, color: "#fbbf24" }}>{d.timing}</div>
                  <div style={{ fontSize: "13px", fontWeight: 700, margin: "4px 0" }}>{d.drug}</div>
                  <div style={{ fontSize: "11px", color: "#94a3b8" }}>Target: {d.target}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Vaccination Schedule Table */}
          <div
            className="glass"
            style={{
              padding: "1.4rem",
              borderRadius: "14px",
              border: "1px solid var(--fk-border, #334155)"
            }}
          >
            <h3 style={{ fontSize: "1.2rem", fontWeight: 800, margin: "0 0 1rem 0", color: "#a855f7" }}>
              💉 National Livestock Immunization Schedule
            </h3>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr style={{ background: "rgba(255,255,255,0.04)", borderBottom: "1px solid var(--fk-border, #334155)" }}>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Disease</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Target Species</th>
                    <th style={{ padding: "10px 14px", textAlign: "center" }}>First Dose Age</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Booster Frequency</th>
                    <th style={{ padding: "10px 14px", textAlign: "left" }}>Govt Scheme</th>
                  </tr>
                </thead>
                <tbody>
                  {vaccinationData?.vaccinationSchedule?.map((v, idx) => (
                    <tr key={idx} style={{ borderBottom: "1px solid var(--fk-border, #1e293b)" }}>
                      <td style={{ padding: "12px 14px", fontWeight: 700, color: "#ffffff" }}>{v.disease}</td>
                      <td style={{ padding: "12px 14px", color: "#94a3b8" }}>{v.target}</td>
                      <td style={{ padding: "12px 14px", textAlign: "center", fontWeight: 700, color: "#38bdf8" }}>{v.firstDoseAge}</td>
                      <td style={{ padding: "12px 14px" }}>{v.boosterInterval}</td>
                      <td style={{ padding: "12px 14px", color: "#4ade80", fontSize: "12px" }}>{v.scheme}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
