import { useState, useEffect } from 'react';
import axios from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import PremiumCard from '../components/ui/PremiumCard';
import { StatCard } from '../components/ui/StatCard';
import {
  FlaskConical,
  Sprout,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Sparkles,
  Layers,
  Scale,
  RefreshCw,
  Printer,
  ChevronRight,
  Info,
  Check,
  Zap,
  TrendingUp
} from 'lucide-react';

const CROPS = [
  'Paddy / Rice',
  'Wheat',
  'Cotton',
  'Maize',
  'Soybean',
  'Tomato',
  'Onion',
  'Chili',
  'Groundnut',
  'Sugarcane'
];

const PRESETS = [
  {
    label: '🌾 Alluvial Indo-Gangetic Soil',
    crop: 'Paddy / Rice',
    land: 2,
    shc: { nitrogen: 340, phosphorus: 14, potassium: 210, sulfur: 12, zinc: 0.8, iron: 8.5, manganese: 4.2, boron: 0.6, pH: 7.2, organicCarbon: 0.55 }
  },
  {
    label: '🌿 Deep Black Cotton Soil',
    crop: 'Cotton',
    land: 3,
    shc: { nitrogen: 240, phosphorus: 9, potassium: 320, sulfur: 8, zinc: 0.45, iron: 6.2, manganese: 3.1, boron: 0.5, pH: 8.1, organicCarbon: 0.42 }
  },
  {
    label: '🌱 Red Sandy Loam (Groundnut/Pulses)',
    crop: 'Groundnut',
    land: 2.5,
    shc: { nitrogen: 210, phosphorus: 8, potassium: 160, sulfur: 7, zinc: 0.4, iron: 12.0, manganese: 2.8, boron: 0.35, pH: 6.2, organicCarbon: 0.38 }
  },
  {
    label: '🧪 Low pH Acidic Soil (Laterite)',
    crop: 'Tomato',
    land: 1.5,
    shc: { nitrogen: 260, phosphorus: 6, potassium: 140, sulfur: 14, zinc: 0.7, iron: 18.0, manganese: 5.5, boron: 0.3, pH: 5.2, organicCarbon: 0.62 }
  },
  {
    label: '⚡ Saline / Sodic Alkaline Soil',
    crop: 'Wheat',
    land: 2,
    shc: { nitrogen: 190, phosphorus: 7, potassium: 290, sulfur: 5, zinc: 0.35, iron: 4.1, manganese: 1.8, boron: 0.4, pH: 8.7, organicCarbon: 0.28 }
  }
];

const DEFAULT_SHC = {
  nitrogen: 320,
  phosphorus: 12,
  potassium: 220,
  sulfur: 9,
  zinc: 0.55,
  iron: 7.5,
  manganese: 3.5,
  boron: 0.45,
  pH: 6.8,
  organicCarbon: 0.48
};

export default function SoilHealth({ user }) {
  const [form, setForm] = useState({
    shcData: DEFAULT_SHC,
    crop: user?.farmProfile?.primaryCrop || 'Paddy / Rice',
    landHectares: 2,
    unitMode: 'hectare' // 'hectare' | 'acre'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('prescription'); // 'prescription' | 'diagnostics' | 'reclamation'

  const setShc = (k, v) => {
    setForm((f) => ({
      ...f,
      shcData: { ...f.shcData, [k]: v === '' ? '' : parseFloat(v) || 0 }
    }));
  };

  const applyPreset = (preset) => {
    setForm({
      shcData: { ...preset.shc },
      crop: preset.crop,
      landHectares: preset.land,
      unitMode: 'hectare'
    });
  };

  const analyze = async () => {
    setLoading(true);
    setError('');
    const effectiveHectares =
      form.unitMode === 'acre' ? Number(form.landHectares) * 0.404686 : Number(form.landHectares);

    try {
      const res = await axios.post('/api/soil-health/analyze', {
        shcData: form.shcData,
        crop: form.crop,
        landHectares: effectiveHectares || 1
      });
      setResult(res.data);

      // Persist to farm profile soil history in background
      try {
        await axios.post('/api/soil', {
          nitrogen: form.shcData.nitrogen,
          phosphorus: form.shcData.phosphorus,
          potassium: form.shcData.potassium,
          ph: form.shcData.pH,
          source: 'soil_health_card',
          unit: 'reported soil-test units',
          measuredAt: new Date().toISOString()
        });
      } catch {
        // Ignore background sync error
      }
    } catch (e) {
      setError(e.response?.data?.error || 'Soil Health analysis failed. Please verify input numbers.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    analyze();
  }, [form.crop]);

  const fmt = (n) => (n !== undefined && n !== null ? n.toLocaleString('en-IN') : '—');

  const shcFields = [
    { key: 'nitrogen', label: 'Available Nitrogen (N)', unit: 'kg/ha', benchmark: '280–560', category: 'Macro' },
    { key: 'phosphorus', label: 'Available Phosphorus (P)', unit: 'kg/ha', benchmark: '11–22', category: 'Macro' },
    { key: 'potassium', label: 'Available Potassium (K)', unit: 'kg/ha', benchmark: '108–280', category: 'Macro' },
    { key: 'sulfur', label: 'Available Sulfur (S)', unit: 'ppm', benchmark: '10–20', category: 'Secondary' },
    { key: 'zinc', label: 'DTPA-Zinc (Zn)', unit: 'ppm', benchmark: '0.6–1.2', category: 'Micro' },
    { key: 'iron', label: 'DTPA-Iron (Fe)', unit: 'ppm', benchmark: '4.5–10.0', category: 'Micro' },
    { key: 'manganese', label: 'DTPA-Manganese (Mn)', unit: 'ppm', benchmark: '2.0–5.0', category: 'Micro' },
    { key: 'boron', label: 'Hot-Water Boron (B)', unit: 'ppm', benchmark: '0.5–1.0', category: 'Micro' },
    { key: 'pH', label: 'Soil Reaction (pH)', unit: 'pH scale', benchmark: '6.5–7.5', category: 'Physical' },
    { key: 'organicCarbon', label: 'Organic Carbon (OC)', unit: '%', benchmark: '0.50–0.75%', category: 'Physical' }
  ];

  const getStatusBadge = (status) => {
    if (status === 'sufficient') {
      return { label: 'Sufficient', bg: '#dcfce7', color: '#166534', icon: CheckCircle2 };
    }
    if (status === 'medium') {
      return { label: 'Medium', bg: '#fef3c7', color: '#92400e', icon: AlertTriangle };
    }
    return { label: 'Deficient', bg: '#fee2e2', color: '#991b1b', icon: XCircle };
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem', color: 'var(--fk-text, #0f172a)' }}>
      {/* Universal Page Header */}
      <PageHeader
        badge="ICAR & STCR SOIL HEALTH CARD PROTOCOL"
        icon={FlaskConical}
        title="Soil Health Card Analyzer & Prescription Engine"
        subtitle="Translate official Soil Health Card (SHC) laboratory test results into precision STCR fertilizer dosages, micronutrient rectifications, and soil reclamation steps."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => window.print()}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'var(--fk-card, #ffffff)',
                color: 'var(--fk-text, #0f172a)',
                border: '1px solid var(--fk-border, #cbd5e1)',
                borderRadius: '8px',
                padding: '9px 14px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <Printer size={15} /> Print Report
            </button>
            <button
              onClick={analyze}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                padding: '9px 16px',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer'
              }}
            >
              <RefreshCw size={15} /> Re-analyze Card
            </button>
          </div>
        }
      />

      {/* Quick Presets Strip */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fk-text-sub, #64748b)', marginBottom: '8px', textTransform: 'uppercase' }}>
          ⚡ Quick Soil Type Presets (Click to load standard agro-climatic values):
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {PRESETS.map((p) => (
            <button
              key={p.label}
              onClick={() => applyPreset(p)}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                border: '1px solid var(--fk-border, #cbd5e1)',
                background: 'var(--fk-card, #ffffff)',
                color: 'var(--fk-text, #0f172a)',
                fontSize: '12px',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Top Stat Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard
          icon={Sprout}
          title="Soil Health Index"
          value={result ? `${result.soilHealthScore}%` : '—'}
          unit="ICAR Rating"
          subtitle={result?.soilHealthScore >= 70 ? 'Optimal Soil Fertility' : result?.soilHealthScore >= 40 ? 'Moderate Fertility' : 'High Deficiency Stress'}
          trend={result?.soilHealthScore >= 60 ? 'Fertile' : 'Needs Care'}
          trendType={result?.soilHealthScore >= 60 ? 'up' : 'down'}
          color="#059669"
        />
        <StatCard
          icon={AlertTriangle}
          title="Deficiencies Detected"
          value={result ? result.deficienciesDetected?.length || 0 : '0'}
          unit="Nutrients"
          subtitle={result?.deficienciesDetected?.length ? result.deficienciesDetected.join(', ') : 'None detected'}
          color={result?.deficienciesDetected?.length ? '#ef4444' : '#10b981'}
        />
        <StatCard
          icon={FlaskConical}
          title="Soil Reaction (pH)"
          value={form.shcData.pH || '7.0'}
          unit={form.shcData.pH < 6.5 ? 'Acidic' : form.shcData.pH > 7.5 ? 'Alkaline' : 'Neutral'}
          subtitle={form.shcData.pH >= 6.5 && form.shcData.pH <= 7.5 ? 'Optimal for nutrient availability' : 'Reclamation recommended'}
          color="#0284c7"
        />
        <StatCard
          icon={Layers}
          title="Organic Carbon (OC)"
          value={`${form.shcData.organicCarbon}%`}
          unit={form.shcData.organicCarbon >= 0.5 ? 'Sufficient' : 'Low OC'}
          subtitle="FYM / Vermicompost recommendation"
          color="#d97706"
        />
      </div>

      {/* Main Grid: Input Form (Left) + Interactive Prescription Results (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '400px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: SHC Laboratory Test Data Input Card */}
        <PremiumCard accentBorder style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <FlaskConical size={18} color="#059669" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>SHC Test Parameters</h3>
          </div>

          {/* Crop & Land Selection */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
              TARGET CROP
            </label>
            <select
              value={form.crop}
              onChange={(e) => setForm({ ...form, crop: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--fk-border, #cbd5e1)',
                background: 'var(--fk-bg, #f8fafc)',
                color: 'var(--fk-text, #0f172a)',
                fontSize: '13px',
                fontWeight: '700'
              }}
            >
              {CROPS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                LAND AREA
              </label>
              <input
                type="number"
                min="0.1"
                step="0.5"
                value={form.landHectares}
                onChange={(e) => setForm({ ...form, landHectares: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--fk-border, #cbd5e1)',
                  background: 'var(--fk-bg, #f8fafc)',
                  color: 'var(--fk-text, #0f172a)',
                  fontSize: '13px',
                  fontWeight: '700',
                  boxSizing: 'border-box'
                }}
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                UNIT
              </label>
              <select
                value={form.unitMode}
                onChange={(e) => setForm({ ...form, unitMode: e.target.value })}
                style={{
                  width: '100%',
                  padding: '8px 10px',
                  borderRadius: '8px',
                  border: '1px solid var(--fk-border, #cbd5e1)',
                  background: 'var(--fk-bg, #f8fafc)',
                  color: 'var(--fk-text, #0f172a)',
                  fontSize: '13px',
                  fontWeight: '600'
                }}
              >
                <option value="hectare">Hectares (ha)</option>
                <option value="acre">Acres</option>
              </select>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--fk-border, #e2e8f0)', paddingTop: '14px', marginBottom: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fk-text-sub, #64748b)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Laboratory Test Results (SHC)
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
              {shcFields.map(({ key, label, unit, benchmark }) => (
                <div key={key}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                    <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--fk-text, #0f172a)' }}>
                      {key.toUpperCase()}
                    </label>
                    <span style={{ fontSize: '10px', color: 'var(--fk-text-sub, #64748b)' }}>({unit})</span>
                  </div>
                  <input
                    type="number"
                    step="any"
                    value={form.shcData[key]}
                    onChange={(e) => setShc(key, e.target.value)}
                    placeholder={benchmark}
                    style={{
                      width: '100%',
                      padding: '7px 9px',
                      borderRadius: '6px',
                      border: '1px solid var(--fk-border, #cbd5e1)',
                      background: 'var(--fk-bg, #f8fafc)',
                      color: 'var(--fk-text, #0f172a)',
                      fontSize: '12.5px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <div style={{ fontSize: '10px', color: 'var(--fk-text-sub, #94a3b8)', marginTop: '2px' }}>
                    Ref: {benchmark}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={analyze}
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '14px',
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: loading ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px'
            }}
          >
            {loading ? <RefreshCw size={16} className="spin" /> : <Sparkles size={16} />}
            {loading ? 'Evaluating...' : 'Generate STCR Prescription'}
          </button>

          {error && (
            <div style={{ marginTop: '10px', padding: '8px', borderRadius: '6px', background: '#fee2e2', color: '#991b1b', fontSize: '12px' }}>
              {error}
            </div>
          )}
        </PremiumCard>

        {/* Right Column: Diagnostic Tabs & Results */}
        <div>
          {/* Navigation Tabs */}
          <div style={{ display: 'flex', gap: '8px', borderBottom: '1px solid var(--fk-border, #e2e8f0)', paddingBottom: '10px', marginBottom: '18px' }}>
            {[
              { id: 'prescription', label: 'Fertilizer Prescription Schedule', icon: Sprout },
              { id: 'diagnostics', label: '10-Parameter Nutrient Status', icon: FlaskConical },
              { id: 'reclamation', label: 'Soil Health Reclamation', icon: Layers }
            ].map((t) => {
              const Icon = t.icon;
              const isSelected = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: 'none',
                    background: isSelected ? 'var(--primary-surface, rgba(16, 185, 129, 0.12))' : 'transparent',
                    color: isSelected ? 'var(--primary, #059669)' : 'var(--fk-text-sub, #64748b)',
                    fontWeight: isSelected ? '800' : '600',
                    fontSize: '13px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Icon size={15} /> {t.label}
                </button>
              );
            })}
          </div>

          {/* TAB 1: Fertilizer Prescription Schedule */}
          {activeTab === 'prescription' && (
            <div>
              <div
                style={{
                  background: 'var(--primary-surface, rgba(16, 185, 129, 0.08))',
                  border: '1px solid var(--primary-border, rgba(16, 185, 129, 0.2))',
                  borderRadius: '12px',
                  padding: '14px 18px',
                  marginBottom: '18px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '10px'
                }}
              >
                <div>
                  <div style={{ fontSize: '15px', fontWeight: '800', color: 'var(--fk-text, #0f172a)' }}>
                    STCR Tailored Schedule for {form.crop} ({form.landHectares} {form.unitMode})
                  </div>
                  <div style={{ fontSize: '12.5px', color: 'var(--fk-text-sub, #64748b)' }}>
                    Soil Test Crop Response (STCR) equation balances fertilizer inputs against existing soil nutrient reserves.
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', display: 'block' }}>Estimated Fertilizer Budget</span>
                  <strong style={{ fontSize: '18px', color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
                    ₹
                    {fmt(
                      result?.fertilizerSchedule?.reduce(
                        (sum, stage) => sum + stage.fertilizers.reduce((s2, f) => s2 + (f.costRs || 0), 0),
                        0
                      ) || 3850
                    )}
                  </strong>
                </div>
              </div>

              {/* Stage Cards */}
              {result?.fertilizerSchedule ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  {result.fertilizerSchedule.map((stage, idx) => (
                    <PremiumCard key={idx} style={{ padding: '16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span
                            style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              background: '#059669',
                              color: '#ffffff',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: '800'
                            }}
                          >
                            {idx + 1}
                          </span>
                          <strong style={{ fontSize: '14.5px' }}>{stage.timing}</strong>
                        </div>
                        <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fk-text-sub, #64748b)' }}>
                          Application Stage {idx + 1} of {result.fertilizerSchedule.length}
                        </span>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                        {stage.fertilizers.map((f, fi) => (
                          <div
                            key={fi}
                            style={{
                              background: 'var(--fk-bg, #f8fafc)',
                              border: '1px solid var(--fk-border, #e2e8f0)',
                              borderRadius: '8px',
                              padding: '12px'
                            }}
                          >
                            <div style={{ fontSize: '13px', fontWeight: '800', color: 'var(--fk-text, #0f172a)' }}>
                              {f.name}
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', fontSize: '12px' }}>
                              <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Per Hectare:</span>
                              <strong>{f.kgPerHa} kg/ha</strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
                              <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Total Quantity:</span>
                              <strong style={{ color: '#059669' }}>
                                {f.totalKg} kg ({Math.ceil(f.totalKg / 50)} bags)
                              </strong>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px', fontSize: '12px' }}>
                              <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Estimated Cost:</span>
                              <strong>₹{fmt(f.costRs)}</strong>
                            </div>
                          </div>
                        ))}
                      </div>
                    </PremiumCard>
                  ))}
                </div>
              ) : (
                <div style={{ textAlign: 'center', padding: '30px', color: 'var(--fk-text-sub, #64748b)' }}>
                  Loading prescription schedule...
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 10-Parameter Nutrient Status */}
          {activeTab === 'diagnostics' && (
            <div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '12px' }}>
                {result?.soilAnalysis &&
                  Object.entries(result.soilAnalysis).map(([key, nut]) => {
                    const statusMeta = getStatusBadge(nut.status);
                    const StatusIcon = statusMeta.icon;

                    return (
                      <PremiumCard key={key} style={{ padding: '14px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                          <div>
                            <div style={{ fontSize: '13.5px', fontWeight: '800' }}>{nut.name}</div>
                            <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)' }}>
                              ICAR Benchmark: {nut.sufficiencyRange}
                            </div>
                          </div>
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: statusMeta.bg,
                              color: statusMeta.color,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <StatusIcon size={12} /> {statusMeta.label}
                          </span>
                        </div>

                        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px', marginTop: '6px' }}>
                          <span style={{ fontSize: '20px', fontWeight: '900', color: 'var(--fk-text, #0f172a)' }}>
                            {nut.measured !== undefined && nut.measured !== null ? nut.measured : '—'}
                          </span>
                          <span style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)' }}>{nut.unit}</span>
                        </div>
                      </PremiumCard>
                    );
                  })}
              </div>
            </div>
          )}

          {/* TAB 3: Soil Reclamation & Agronomic Advice */}
          {activeTab === 'reclamation' && (
            <div>
              <PremiumCard style={{ padding: '18px', marginBottom: '14px' }}>
                <h4 style={{ margin: '0 0 10px 0', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={17} color="#059669" /> Corrective Agronomic Measures
                </h4>

                {result?.agronomicRecommendations?.length > 0 ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {result.agronomicRecommendations.map((rec, i) => (
                      <div
                        key={i}
                        style={{
                          padding: '10px 14px',
                          borderRadius: '8px',
                          background: 'rgba(245, 158, 11, 0.08)',
                          border: '1px solid rgba(245, 158, 11, 0.25)',
                          fontSize: '13px',
                          color: 'var(--fk-text, #0f172a)',
                          display: 'flex',
                          alignItems: 'flex-start',
                          gap: '10px'
                        }}
                      >
                        <span style={{ color: '#d97706', fontSize: '16px' }}>⚠️</span>
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ padding: '12px', background: '#dcfce7', borderRadius: '8px', color: '#166534', fontSize: '13px' }}>
                    ✅ Soil parameters are within acceptable thresholds. No major chemical amendments (liming or gypsum) required for this cycle.
                  </div>
                )}
              </PremiumCard>

              {/* Universal Soil Enrichment Guidelines */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
                <PremiumCard style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '800', fontSize: '13.5px', marginBottom: '6px', color: '#059669' }}>
                    🌱 Organic Carbon (OC) Restoration
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--fk-text-sub, #64748b)', margin: 0, lineHeight: '1.5' }}>
                    Indian soils typically test &lt; 0.5% OC due to intensive heat and lack of biomass return. Incorporate 5 tonnes/ha of well-rotted FYM or 2.5 tonnes vermicompost along with green manuring (Dhaincha or Sunhemp) before kharif sowing.
                  </p>
                </PremiumCard>

                <PremiumCard style={{ padding: '16px' }}>
                  <div style={{ fontWeight: '800', fontSize: '13.5px', marginBottom: '6px', color: '#0284c7' }}>
                    🔬 Micronutrient Foliar Rectification
                  </div>
                  <p style={{ fontSize: '12.5px', color: 'var(--fk-text-sub, #64748b)', margin: 0, lineHeight: '1.5' }}>
                    Zinc and Boron deficiencies account for up to 45% hidden yield loss. Spray 0.5% Zinc Sulphate (5 g/L) + 0.2% Borax at vegetative and pre-flowering stages if soil test indicates low micro-levels.
                  </p>
                </PremiumCard>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
