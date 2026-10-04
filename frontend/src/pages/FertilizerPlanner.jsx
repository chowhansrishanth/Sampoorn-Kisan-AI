import { useState, useMemo } from 'react';
import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import PageHeader from '../components/ui/PageHeader';
import PremiumCard from '../components/ui/PremiumCard';
import { FlaskConical, Sparkles, CheckCircle2, Calendar, Scale, Info, Layers, RefreshCw } from 'lucide-react';
import './DecisionForms.css';

// ICAR Standard Prescribed Recommended Dose of Fertilizers (RDF) per acre
const ICAR_CROP_PRESETS = [
  { id: 'cotton', name: 'Bt Hybrid Cotton', icon: '🌿', N: 48, P: 24, K: 24, secondary: 'Zinc Sulphate 10 kg + MgSO4 10 kg', splits: '25% Basal, 35% at 30 DAS, 25% at 60 DAS, 15% at 75 DAS' },
  { id: 'paddy', name: 'Paddy / Rice (Dhan)', icon: '🌾', N: 40, P: 20, K: 20, secondary: 'Zinc Sulphate 10 kg (Basal)', splits: '50% P & K + 25% N Basal, 35% N Active Tillering, 25% N Panicle Initiation, 15% N Heading' },
  { id: 'maize', name: 'Hybrid Grain Maize', icon: '🌽', N: 48, P: 24, K: 20, secondary: 'Zinc Sulphate 8 kg/acre', splits: '100% P & K + 25% N Basal, 50% N at Knee-High, 25% N at Tasseling' },
  { id: 'wheat', name: 'High-Yield Wheat', icon: '🌾', N: 48, P: 24, K: 16, secondary: 'Sulphur 10 kg/acre', splits: '100% P & K + 50% N Basal, 25% N at CRI (21 DAS), 25% N at Tillering (45 DAS)' },
  { id: 'tomato', name: 'Hybrid Tomato', icon: '🍅', N: 60, P: 40, K: 40, secondary: 'Calcium Nitrate 15 kg + Boron 2 kg', splits: '30% N + 100% P + 40% K Basal, balance in 3 fertigation splits' },
  { id: 'chilli', name: 'Hot Chilli (Mirchi)', icon: '🌶️', N: 48, P: 24, K: 32, secondary: 'Sulphur 12 kg + Zinc 5 kg', splits: '25% N + 100% P + 50% K Basal, 25% N at 30 DAS, 25% N at 60 DAS, 25% N + 50% K at 90 DAS' },
  { id: 'redgram', name: 'Red Gram / Arhar / Tur', icon: '🫘', N: 10, P: 25, K: 10, secondary: 'Sulphur Bentonite 10 kg/acre', splits: '100% Basal at sowing (Rhizobium fixes atmospheric nitrogen)' },
  { id: 'soybean', name: 'Soybean (सोयाबीन)', icon: '🫘', N: 12, P: 24, K: 16, secondary: 'Sulphur Bentonite 10 kg/acre', splits: '100% Basal in furrows (Bradyrhizobium fixes nitrogen)' },
  { id: 'groundnut', name: 'Groundnut / Peanut', icon: '🥜', N: 10, P: 20, K: 20, secondary: 'Agricultural Gypsum 200 kg at 40–45 DAS', splits: '100% NPK Basal; Gypsum top-dressed at pegging' },
  { id: 'sugarcane', name: 'Sugarcane (गन्ना)', icon: '🎋', N: 100, P: 40, K: 48, secondary: 'Zinc Sulphate 10 kg + Ferrous Sulphate 10 kg', splits: '15% N + 100% P + 25% K Basal, 30% N at 45d, 35% N + 25% K at 90d, 20% N + 50% K at 150d' },
  { id: 'mustard', name: 'Mustard / Rapeseed', icon: '🌼', N: 32, P: 16, K: 16, secondary: 'Sulphur Bentonite 15 kg/acre', splits: '100% P & K + 50% N Basal, 50% N at Rosette Stage (25 DAS)' },
  { id: 'onion', name: 'Onion (प्याज़)', icon: '🧅', N: 40, P: 20, K: 20, secondary: 'Sulphur 20 kg/acre', splits: '50% N + 100% P & K Basal, 25% N at 30 DAS, 25% N at 50 DAS (Stop N after 60 DAS)' },
  { id: 'potato', name: 'Potato (आलू)', icon: '🥔', N: 60, P: 40, K: 48, secondary: 'Magnesium Sulphate 10 kg/acre', splits: '50% N + 100% P + 50% K Basal, 50% N + 50% K at Earthing Up (28 DAS)' }
];

export default function FertilizerPlanner({ user }) {
  const [form, setForm] = useState({
    crop: user?.farmProfile?.primaryCrop || 'Bt Hybrid Cotton',
    area: user?.farmProfile?.land?.sizeAcres || '2',
    unit: 'acre',
    stage: 'Vegetative & Active Growth',
    N: '48',
    P: '24',
    K: '24',
    rateSource: 'ICAR Standard Package of Practices (All India Coordinated Research Project)',
    soilMode: false,
    soilN: '',
    soilP: '',
    soilK: '',
    soilUnit: 'kg/ha',
    soilDate: ''
  });

  const [request, setRequest] = useState(null);
  const [validation, setValidation] = useState('');
  const { data, loading, error, reload } = useApiResource(request);
  const result = data?.data;

  const update = (k, v) => setForm(prev => ({ ...prev, [k]: v }));

  // Apply ICAR Crop Preset
  const applyPreset = (preset) => {
    setForm(prev => ({
      ...prev,
      crop: preset.name,
      N: String(preset.N),
      P: String(preset.P),
      K: String(preset.K),
      stage: 'Vegetative & Active Growth',
      rateSource: `ICAR Package of Practices (${preset.name})`
    }));
    setValidation('');
  };

  // Instant In-Browser Fertilizer Calculations based on standard chemical assays:
  // DAP: 18% N, 46% P2O5 (50 kg bag)
  // Urea: 46% N (45 kg bag)
  // MOP: 60% K2O (50 kg bag)
  // SSP: 16% P2O5 (50 kg bag)
  const instantCalculation = useMemo(() => {
    const areaNum = Number(form.area) * (form.unit === 'hectare' ? 2.47105 : 1);
    const nReq = Number(form.N) * areaNum;
    const pReq = Number(form.P) * areaNum;
    const kReq = Number(form.K) * areaNum;

    if (!Number.isFinite(nReq) || nReq < 0 || !Number.isFinite(pReq) || pReq < 0 || !Number.isFinite(kReq) || kReq < 0 || areaNum <= 0) {
      return null;
    }

    // DAP Pathway
    const dapKg = (pReq / 0.46);
    const dapBags = (dapKg / 50).toFixed(1);
    const dapSuppliedN = dapKg * 0.18;
    const remainingN = Math.max(0, nReq - dapSuppliedN);
    const ureaKg = (remainingN / 0.46);
    const ureaBags = (ureaKg / 45).toFixed(1);
    const mopKg = (kReq / 0.60);
    const mopBags = (mopKg / 50).toFixed(1);

    // Alternative SSP Pathway
    const sspKg = (pReq / 0.16);
    const sspBags = (sspKg / 50).toFixed(1);
    const ureaOnlyKg = (nReq / 0.46);
    const ureaOnlyBags = (ureaOnlyKg / 45).toFixed(1);

    return {
      areaAcres: areaNum,
      totalN: Math.round(nReq),
      totalP: Math.round(pReq),
      totalK: Math.round(kReq),
      dapKg: Math.round(dapKg),
      dapBags,
      ureaKg: Math.round(ureaKg),
      ureaBags,
      mopKg: Math.round(mopKg),
      mopBags,
      sspKg: Math.round(sspKg),
      sspBags,
      ureaOnlyBags,
      dapSuppliedN: Math.round(dapSuppliedN)
    };
  }, [form.area, form.unit, form.N, form.P, form.K]);

  // Current matched preset for secondary recommendations & split schedules
  const matchedPreset = useMemo(() => {
    return ICAR_CROP_PRESETS.find(p => form.crop.toLowerCase().includes(p.id) || p.name.toLowerCase().includes(form.crop.toLowerCase())) || ICAR_CROP_PRESETS[0];
  }, [form.crop]);

  function submit(e) {
    e.preventDefault();
    const keys = ['area', 'N', 'P', 'K', ...(form.soilMode ? ['soilN', 'soilP', 'soilK'] : [])];
    if (keys.some(k => form[k] === '' || !Number.isFinite(Number(form[k])) || Number(form[k]) < 0) || Number(form.area) <= 0) {
      setValidation('Please enter a valid positive area and non-negative numeric nutrient values.');
      return;
    }
    setValidation('');
    setRequest({
      method: 'post',
      url: '/api/crop/fertilizer',
      data: {
        crop: form.crop,
        areaAcres: Number(form.area) * (form.unit === 'hectare' ? 2.4710538147 : 1),
        stage: form.stage,
        nutrientTargets: { N: Number(form.N), P: Number(form.P), K: Number(form.K) },
        rateSource: form.rateSource,
        soilTest: form.soilMode ? {
          N: Number(form.soilN),
          P: Number(form.soilP),
          K: Number(form.soilK),
          unit: form.soilUnit,
          date: form.soilDate
        } : null
      }
    });
  }

  return (
    <div className="page-container decision-page" style={{ maxWidth: "1200px", margin: "0 auto", padding: "20px" }}>
      <PageHeader
        title="Fertilizer & Precision Nutrient Planner"
        subtitle="ICAR-prescribed NPK doses, exact commercial fertilizer bags (Urea, DAP, MOP, SSP), and 4-stage split schedules"
        badge="ICAR Aligned • Zero Guesswork"
        icon={FlaskConical}
      />

      {/* 1-CLICK ICAR CROP PRESETS */}
      <PremiumCard style={{ marginBottom: "20px", background: "var(--fk-card)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sparkles size={18} color="#16a34a" />
            <strong style={{ fontSize: "15px", color: "var(--fk-text)" }}>1-Click ICAR Standard Crop Presets:</strong>
          </div>
          <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Click any crop to instantly auto-fill verified N:P:K nutrient targets</span>
        </div>

        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {ICAR_CROP_PRESETS.map((p) => {
            const isSelected = form.crop.toLowerCase().includes(p.id) || p.name.toLowerCase().includes(form.crop.toLowerCase());
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => applyPreset(p)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "7px 12px",
                  borderRadius: "20px",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: isSelected ? "2px solid #16a34a" : "1px solid var(--fk-border)",
                  background: isSelected ? "rgba(22, 163, 74, 0.12)" : "var(--fk-bg)",
                  color: isSelected ? "#16a34a" : "var(--fk-text)",
                  transition: "all 0.15s ease"
                }}
              >
                <span>{p.icon}</span>
                <span>{p.name.split(" ")[0]}</span>
                <span style={{ fontSize: "11px", opacity: 0.8, background: "rgba(0,0,0,0.06)", padding: "1px 5px", borderRadius: "10px" }}>
                  {p.N}:{p.P}:{p.K}
                </span>
              </button>
            );
          })}
        </div>
      </PremiumCard>

      {/* INPUT FORM */}
      <PremiumCard style={{ marginBottom: "24px" }}>
        <form onSubmit={submit}>
          <div className="decision-grid">
            <label>
              Crop Name
              <input required value={form.crop} onChange={e => update('crop', e.target.value)} placeholder="e.g. Bt Hybrid Cotton" />
            </label>
            <label>
              Farm Area
              <input required min="0.0001" step="any" type="number" value={form.area} onChange={e => update('area', e.target.value)} />
            </label>
            <label>
              Area Unit
              <select value={form.unit} onChange={e => update('unit', e.target.value)}>
                <option value="acre">Acres</option>
                <option value="hectare">Hectares</option>
              </select>
            </label>
            <label>
              Current Growth Stage
              <input value={form.stage} onChange={e => update('stage', e.target.value)} placeholder="e.g. Vegetative / Flowering" />
            </label>
            <label>
              Nitrogen (N) Target kg/acre
              <input required type="number" step="any" min="0" max="1000" value={form.N} onChange={e => update('N', e.target.value)} />
            </label>
            <label>
              Phosphate (P₂O₅) Target kg/acre
              <input required type="number" step="any" min="0" max="1000" value={form.P} onChange={e => update('P', e.target.value)} />
            </label>
            <label>
              Potash (K₂O) Target kg/acre
              <input required type="number" step="any" min="0" max="1000" value={form.K} onChange={e => update('K', e.target.value)} />
            </label>
            <label>
              Prescription Source
              <input required maxLength="300" value={form.rateSource} onChange={e => update('rateSource', e.target.value)} placeholder="Agronomist / ICAR / Soil Test Lab" />
            </label>
            <label>
              Soil Test Adjustment
              <select value={form.soilMode ? 'soil' : 'general'} onChange={e => update('soilMode', e.target.value === 'soil')}>
                <option value="general">Standard ICAR Dose (No Soil Test)</option>
                <option value="soil">Include Soil Health Card Measurements</option>
              </select>
            </label>
          </div>

          {form.soilMode && (
            <fieldset style={{ marginTop: "16px", padding: "16px", borderRadius: "10px", border: "1px dashed var(--fk-border)" }}>
              <legend style={{ padding: "0 8px", fontWeight: "700", color: "#16a34a" }}>Farmer Soil Test Telemetry</legend>
              <div className="decision-grid">
                <label>Measured Soil N (kg/ha)<input required type="number" min="0" step="any" value={form.soilN} onChange={e => update('soilN', e.target.value)} /></label>
                <label>Measured Soil P (kg/ha)<input required type="number" min="0" step="any" value={form.soilP} onChange={e => update('soilP', e.target.value)} /></label>
                <label>Measured Soil K (kg/ha)<input required type="number" min="0" step="any" value={form.soilK} onChange={e => update('soilK', e.target.value)} /></label>
                <label>Lab Units<input required value={form.soilUnit} onChange={e => update('soilUnit', e.target.value)} /></label>
                <label>Test Date<input required type="date" max={new Date().toISOString().slice(0, 10)} value={form.soilDate} onChange={e => update('soilDate', e.target.value)} /></label>
              </div>
            </fieldset>
          )}

          {validation && <p role="alert" style={{ color: "#ef4444", fontWeight: "700", marginTop: "12px" }}>{validation}</p>}

          <div style={{ marginTop: "16px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: "10px 20px",
                background: "linear-gradient(135deg, #16a34a, #15803d)",
                color: "#ffffff",
                border: "none",
                borderRadius: "8px",
                fontWeight: "800",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "8px"
              }}
            >
              <FlaskConical size={16} />
              {loading ? "Calculating..." : "Sync with Backend Ag Engine"}
            </button>
          </div>
        </form>
      </PremiumCard>

      <RequestStatus loading={loading} error={error} onRetry={reload} />

      {/* INSTANT FULL PRECISION FERTILIZER QUANTITY CARD */}
      {instantCalculation && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginBottom: "24px" }}>
          {/* COMMERCIAL FERTILIZER BAGS (DAP + UREA + MOP PATHWAY) */}
          <PremiumCard style={{ background: "linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(37, 99, 235, 0.04))", border: "1.5px solid rgba(22, 163, 74, 0.3)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Scale size={20} color="#16a34a" />
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--fk-text)" }}>
                Exact Fertilizer Bags Required ({instantCalculation.areaAcres.toFixed(1)} Acres)
              </h3>
            </div>
            <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "0 0 16px" }}>
              Standard Pathway 1: DAP (18-46-0) + Urea (46% N) + Muriate of Potash (60% K₂O)
            </p>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "10px", marginBottom: "16px" }}>
              <div style={{ background: "var(--fk-card)", padding: "12px", borderRadius: "10px", border: "1px solid var(--fk-border)", textAlign: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", display: "block" }}>UREA (45 kg)</span>
                <strong style={{ fontSize: "21.5px", color: "var(--fk-text)", display: "block", margin: "4px 0" }}>{instantCalculation.ureaBags}</strong>
                <span style={{ fontSize: "11px", color: "var(--fk-text-sub)" }}>{instantCalculation.ureaKg} kg total</span>
              </div>

              <div style={{ background: "var(--fk-card)", padding: "12px", borderRadius: "10px", border: "1px solid var(--fk-border)", textAlign: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", display: "block" }}>DAP (50 kg)</span>
                <strong style={{ fontSize: "21.5px", color: "var(--fk-text)", display: "block", margin: "4px 0" }}>{instantCalculation.dapBags}</strong>
                <span style={{ fontSize: "11px", color: "var(--fk-text-sub)" }}>{instantCalculation.dapKg} kg total</span>
              </div>

              <div style={{ background: "var(--fk-card)", padding: "12px", borderRadius: "10px", border: "1px solid var(--fk-border)", textAlign: "center" }}>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#d97706", display: "block" }}>MOP (50 kg)</span>
                <strong style={{ fontSize: "21.5px", color: "var(--fk-text)", display: "block", margin: "4px 0" }}>{instantCalculation.mopBags}</strong>
                <span style={{ fontSize: "11px", color: "var(--fk-text-sub)" }}>{instantCalculation.mopKg} kg total</span>
              </div>
            </div>

            <div style={{ background: "rgba(22, 163, 74, 0.08)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", color: "var(--fk-text)", border: "1px solid rgba(22, 163, 74, 0.2)" }}>
              💡 <strong>Agronomy Credit:</strong> The {instantCalculation.dapKg} kg of DAP already contributes <strong>{instantCalculation.dapSuppliedN} kg of elemental Nitrogen</strong>, which was deducted before calculating Urea. This saves you money and prevents fertilizer burn!
            </div>
          </PremiumCard>

          {/* SPLIT SCHEDULE & SECONDARY NUTRIENTS */}
          <PremiumCard style={{ background: "var(--fk-card)" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "14px" }}>
              <Calendar size={20} color="#2563eb" />
              <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--fk-text)" }}>
                ICAR 4-Stage Application Split Schedule
              </h3>
            </div>

            <div style={{ fontSize: "14px", lineHeight: "1.6", color: "var(--fk-text)", marginBottom: "14px" }}>
              <div style={{ padding: "8px 0", borderBottom: "1px solid var(--fk-border)" }}>
                <strong>1. Basal Sowing / Transplanting:</strong> Apply 100% DAP ({instantCalculation.dapBags} bags) + 50% Potash (MOP) + 25% Urea.
              </div>
              <div style={{ padding: "8px 0", borderBottom: "1px solid var(--fk-border)" }}>
                <strong>2. Active Tillering / Branching:</strong> Top dress 35% of Urea 5–7 cm away from root zone followed by irrigation.
              </div>
              <div style={{ padding: "8px 0", borderBottom: "1px solid var(--fk-border)" }}>
                <strong>3. Panicle / Flower Initiation:</strong> Top dress 25% Urea + remaining 50% Potash (MOP) to maximize flower retention.
              </div>
              <div style={{ padding: "8px 0" }}>
                <strong>4. Grain Filling / Bulking:</strong> Foliar spray 1% Multi-K (13-0-45) or 0-0-50 Sulphate of Potash @ 10 g/L.
              </div>
            </div>

            <div style={{ background: "rgba(37, 99, 235, 0.08)", padding: "10px 14px", borderRadius: "8px", fontSize: "13px", color: "var(--fk-text)", border: "1px solid rgba(37, 99, 235, 0.2)" }}>
              🌿 <strong>Secondary &amp; Micronutrients:</strong> {matchedPreset.secondary}.
            </div>
          </PremiumCard>
        </div>
      )}

      {/* BACKEND VERIFIED RESULT (IF SUBMITTED) */}
      {result && (
        <PremiumCard style={{ border: "2px solid #16a34a", background: "var(--fk-card)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" }}>
            <CheckCircle2 size={20} color="#16a34a" />
            <h3 style={{ margin: 0, fontSize: "17px", fontWeight: "800", color: "var(--fk-text)" }}>
              Backend Algorithm Confirmation ({result.mode?.replaceAll('_', ' ')})
            </h3>
          </div>
          <p style={{ fontSize: "14px", color: "var(--fk-text-sub)", margin: "0 0 14px" }}>
            Farm area: {result.areaAcres?.toFixed(2)} acres · Prescription Source: {result.provenance?.rateSource || 'ICAR Standard'}
          </p>

          <div className="decision-grid" style={{ marginBottom: "14px" }}>
            {result.fertilizerQuantitiesKg && Object.entries(result.fertilizerQuantitiesKg).map(([k, v]) => (
              <div className="decision-stat" key={k} style={{ background: "var(--fk-bg)", padding: "10px", borderRadius: "8px" }}>
                <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>{k.toUpperCase()}</span>
                <strong style={{ fontSize: "17px", color: "#16a34a", display: "block" }}>{v} kg</strong>
              </div>
            ))}
          </div>

          {result.excessNitrogenKg > 0 && (
            <p role="alert" style={{ color: "#f59e0b", fontSize: "13.5px", background: "rgba(245, 158, 11, 0.1)", padding: "8px 12px", borderRadius: "6px" }}>
              ⚠️ Note: DAP alone supplies slightly higher nitrogen ({result.excessNitrogenKg} kg) than minimal pulse targets. Consider using SSP (Single Super Phosphate) for pure phosphorus supply.
            </p>
          )}

          <details style={{ marginTop: "12px", fontSize: "13px", color: "var(--fk-text-sub)" }}>
            <summary style={{ cursor: "pointer", fontWeight: "700", color: "var(--fk-text)" }}>View ICAR Mathematical Formulas &amp; Conversion Assays</summary>
            {result.formulas?.map(f => <p key={f} style={{ margin: "4px 0" }}>• {f}</p>)}
          </details>
        </PremiumCard>
      )}
    </div>
  );
}
