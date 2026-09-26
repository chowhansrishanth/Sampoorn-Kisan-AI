import { useState, useEffect, useCallback } from "react";
import axios, { getApiErrorMessage } from "../api/client";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell } from "recharts";
import { Brain, Cpu, ShieldCheck, Eye, HelpCircle, Layers, CheckCircle2, Sliders, RefreshCw, Sparkles } from "lucide-react";

export default function XAIDashboard() {
  const [npk, setNpk] = useState({ N: 90, P: 42, K: 43, temperature: 25.5, humidity: 75, ph: 6.5, rainfall: 200 });
  const [shapData, setShapData] = useState([]);
  const [limeData, setLimeData] = useState([]);
  const [recommendedCrop, setRecommendedCrop] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchXAIData = useCallback((params = npk) => {
    let isSubscribed = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    axios.post("/api/crop/recommend", params, { signal: controller.signal })
      .then((res) => {
        if (!isSubscribed) return;
        const data = res.data || {};
        setRecommendedCrop(data.recommended_crop || null);
        setShapData(Array.isArray(data.shap_explanation?.shap_values) ? data.shap_explanation.shap_values : (Array.isArray(data.xai_breakdown) ? data.xai_breakdown : []));
        setLimeData(Array.isArray(data.lime_explanation) ? data.lime_explanation : []);
      })
      .catch((e) => {
        if (!isSubscribed || axios.isCancel(e) || e.name === "CanceledError" || e.name === "AbortError") return;
        setRecommendedCrop(null);
        setShapData([]);
        setLimeData([]);
        setError(getApiErrorMessage(e, "Explainable crop model data is unavailable right now."));
      })
      .finally(() => {
        if (isSubscribed) setLoading(false);
      });
    return () => {
      isSubscribed = false;
      controller.abort();
    };
  }, [npk]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchXAIData(npk);
    }, 350);
    return () => clearTimeout(timer);
  }, [fetchXAIData, npk]);

  const handleSliderChange = (key, val) => {
    const updated = { ...npk, [key]: Number(val) };
    setNpk(updated);
  };

  const handleApply = (e) => {
    e.preventDefault();
    fetchXAIData(npk);
  };

  const colors = ["#16a34a", "#22c55e", "#4ade80", "#2563eb", "#38bdf8", "#f59e0b", "#a855f7"];

  return (
    <div className="page-container xai-page page-enter">
      <div className="page-header">
        <h1 className="page-title">🧠 Explainable AI (XAI) Visualizer & Model Transparency Hub</h1>
        <p className="page-subtitle">
          Demystifying Black-Box Smart Agricultural AI via SHAP (SHapley Additive exPlanations), LIME Local Decision Boundaries, and Gradient Interpretability
        </p>
      </div>

      {/* SUMMARY BADGES */}
      <div className="xai-stats-row" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px', marginBottom: '20px' }}>
        <div className="xai-stat-card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div className="xai-icon" style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#16a34a', padding: '10px', borderRadius: '8px' }}><Brain size={24}/></div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)', fontWeight: 'bold', textTransform: 'uppercase' }}>Explainability Index</span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--fk-text)' }}>Unavailable</h3>
          </div>
        </div>

        <div className="xai-stat-card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div className="xai-icon" style={{ background: 'rgba(37, 99, 235, 0.15)', color: '#2563eb', padding: '10px', borderRadius: '8px' }}><ShieldCheck size={24}/></div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)', fontWeight: 'bold', textTransform: 'uppercase' }}>Privacy Loss (Diff ε)</span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--fk-text)' }}>Unavailable</h3>
          </div>
        </div>

        <div className="xai-stat-card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div className="xai-icon" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '10px', borderRadius: '8px' }}><Cpu size={24}/></div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)', fontWeight: 'bold', textTransform: 'uppercase' }}>Resource Efficiency</span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--fk-text)' }}>Unavailable</h3>
          </div>
        </div>

        <div className="xai-stat-card glass-card" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px' }}>
          <div className="xai-icon" style={{ background: 'rgba(168, 85, 247, 0.15)', color: '#a855f7', padding: '10px', borderRadius: '8px' }}><Layers size={24}/></div>
          <div>
            <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)', fontWeight: 'bold', textTransform: 'uppercase' }}>Generalization F1</span>
            <h3 style={{ margin: 0, fontSize: '20px', fontWeight: '800', color: 'var(--fk-text)' }}>Unavailable</h3>
          </div>
        </div>
      </div>

      {/* INTERACTIVE CONTROLS ROW */}
      <div className="glass-card" style={{ marginBottom: '20px', padding: '18px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={20} color="#16a34a" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Live Soil & Microclimate Telemetry Controls</h3>
          </div>
          <button className="primary-btn" onClick={handleApply} disabled={loading} style={{ padding: '8px 16px', fontSize: '13px' }}>
            {loading ? <RefreshCw size={16} className="spin-anim" /> : <Sparkles size={16} />} Recompute XAI Attributions
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '14px' }}>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fk-text-sub)', display: 'block', marginBottom: '4px' }}>
              Nitrogen (N): <span style={{ color: '#16a34a' }}>{npk.N} mg/kg</span>
            </label>
            <input type="range" min="10" max="180" value={npk.N} onChange={e => handleSliderChange("N", e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fk-text-sub)', display: 'block', marginBottom: '4px' }}>
              Phosphorus (P): <span style={{ color: '#2563eb' }}>{npk.P} mg/kg</span>
            </label>
            <input type="range" min="10" max="120" value={npk.P} onChange={e => handleSliderChange("P", e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fk-text-sub)', display: 'block', marginBottom: '4px' }}>
              Potassium (K): <span style={{ color: '#f59e0b' }}>{npk.K} mg/kg</span>
            </label>
            <input type="range" min="10" max="120" value={npk.K} onChange={e => handleSliderChange("K", e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fk-text-sub)', display: 'block', marginBottom: '4px' }}>
              Rainfall: <span style={{ color: '#38bdf8' }}>{npk.rainfall} mm</span>
            </label>
            <input type="range" min="50" max="600" value={npk.rainfall} onChange={e => handleSliderChange("rainfall", e.target.value)} style={{ width: '100%' }} />
          </div>
          <div>
            <label style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fk-text-sub)', display: 'block', marginBottom: '4px' }}>
              Soil pH: <span style={{ color: '#a855f7' }}>{npk.ph}</span>
            </label>
            <input type="range" min="4.5" max="9.0" step="0.1" value={npk.ph} onChange={e => handleSliderChange("ph", e.target.value)} style={{ width: '100%' }} />
          </div>
        </div>
      </div>

      <div className="grid-2-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 340px), 1fr))', gap: '20px' }}>
        {/* SHAP CHART */}
        <div className="glass-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Eye size={20} color="#16a34a" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>SHAP Feature Importance{recommendedCrop ? ` (${recommendedCrop})` : ""}</h3>
            </div>
            <span className="method-tag" style={{ background: 'rgba(22, 163, 74, 0.15)', color: '#16a34a', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
              SHAP TreeExplainer
            </span>
          </div>

          <p className="xai-desc" style={{ fontSize: '13px', color: 'var(--fk-text-sub)', marginBottom: '14px', lineHeight: '1.4' }}>
            SHAP (SHapley Additive exPlanations) isolates the marginal contribution of each soil chemical and climate variable returned by the crop model.
          </p>

          {error && <div className="request-status is-error" role="alert"><span>{error}</span></div>}
          {!error && !loading && shapData.length === 0 && <div className="data-empty"><HelpCircle size={18} /> <span>The model did not return SHAP values for this sample.</span></div>}

          <div style={{ width: "100%", height: 280 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={shapData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fk-border)" />
                <XAxis type="number" stroke="var(--fk-text-sub)" fontSize={12} tickLine={false} />
                <YAxis dataKey="feature" type="category" stroke="var(--fk-text-sub)" width={110} fontSize={12} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--fk-card)", borderColor: "var(--fk-border)", color: "var(--fk-text)", borderRadius: "6px" }} />
                <Bar dataKey="importance" name="SHAP Importance Score" radius={[0, 6, 6, 0]} isAnimationActive={!loading}>
                  {shapData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* LIME EXPLANATION TABLE */}
        <div className="glass-card">
          <div className="card-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
            <div className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <HelpCircle size={20} color="#f59e0b" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>LIME Local Decision Explanations</h3>
            </div>
            <span className="method-tag gold" style={{ background: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', padding: '3px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: 'bold' }}>
              LIME Local Surrogate
            </span>
          </div>

          <p className="xai-desc" style={{ fontSize: '13px', color: 'var(--fk-text-sub)', marginBottom: '14px', lineHeight: '1.4' }}>
            LIME generates interpretable local perturbations around this specific sample to compute clear decision rules that validate model trustworthiness for field agronomists.
          </p>

          <div className="lime-list" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {limeData.map((item, index) => (
              <div className="lime-item" key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--fk-bg)', border: '1px solid var(--fk-border)', borderRadius: '6px' }}>
                <div className="lime-condition" style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
                  <CheckCircle2 size={16} color="#16a34a"/>
                  <span>{item.condition}</span>
                </div>
                <span className="lime-impact positive" style={{ color: '#16a34a', fontWeight: 'bold', fontSize: '12px' }}>{item.impact}</span>
              </div>
            ))}
            {!error && !loading && limeData.length === 0 && <div className="data-empty"><HelpCircle size={18} /> <span>The model did not return LIME rules for this sample.</span></div>}
          </div>

          <div className="xai-paper-note mt-4" style={{ marginTop: '16px', padding: '12px', background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', borderRadius: '6px' }}>
            <p style={{ margin: 0, fontSize: '12px', color: 'var(--fk-text)', lineHeight: '1.5' }}>
              <strong>Explainability Standard:</strong> SHAP and LIME guarantee transparent, auditable AI decisions for agricultural credit, crop insurance subsidies, and automated precision irrigation protocols.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
