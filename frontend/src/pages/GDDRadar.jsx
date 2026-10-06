import { useState, useEffect } from 'react';
import axios from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import PremiumCard from '../components/ui/PremiumCard';
import { StatCard } from '../components/ui/StatCard';
import {
  Thermometer,
  Sparkles,
  Bug,
  AlertTriangle,
  CheckCircle2,
  Calendar,
  Layers,
  ShieldCheck,
  RefreshCw,
  Wind,
  Droplets,
  Sun,
  Activity,
  ArrowRight,
  Info
} from 'lucide-react';

const CROPS = [
  'Cotton',
  'Maize',
  'Paddy / Rice',
  'Chili / Tomato / Cotton'
];

const ALERT_CONFIG = {
  'CRITICAL — Spray Window Open': {
    color: '#ef4444',
    bg: '#fee2e2',
    border: '#fecaca',
    label: 'CRITICAL — SPRAY WINDOW OPEN'
  },
  'WARNING — Scout Immediately': {
    color: '#f59e0b',
    bg: '#fef3c7',
    border: '#fde68a',
    label: 'WARNING — SCOUT FIELD NOW'
  },
  'MONITOR': {
    color: '#10b981',
    bg: '#dcfce7',
    border: '#bbf7d0',
    label: 'MONITORING — BELOW THRESHOLD'
  }
};

const PEST_ICONS = {
  pink_bollworm: '🦋',
  fall_armyworm: '🐛',
  brown_planthopper: '🦗',
  helicoverpa: '🐞'
};

export default function GDDRadar({ user }) {
  const [crop, setCrop] = useState(user?.farmProfile?.primaryCrop || 'Cotton');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedPest, setSelectedPest] = useState(null);

  const runRadar = async (targetCrop = crop) => {
    setLoading(true);
    setError('');
    try {
      const res = await axios.post('/api/gdd/radar', { crop: targetCrop });
      setResult(res.data);
      if (res.data?.pests?.length > 0) {
        setSelectedPest(res.data.pests[0]);
      }
    } catch (e) {
      setError(e.response?.data?.error || 'GDD Pest Radar calculation failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    runRadar(crop);
  }, [crop]);

  const activePest = selectedPest || result?.pests?.[0] || null;

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem', color: 'var(--fk-text, #0f172a)' }}>
      {/* Universal Page Header */}
      <PageHeader
        badge="THERMAL ACCUMULATION & BIOFIX PHENOLOGY RADAR"
        icon={Thermometer}
        title="GDD Micro-Climate Pest Outbreak Radar"
        subtitle="Predict insect generation lifecycles, egg hatching surges, and precise spray intervention windows using degree-day heat unit accumulation."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => runRadar(crop)}
              disabled={loading}
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
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              <RefreshCw size={15} className={loading ? 'spin' : ''} />
              {loading ? 'Simulating...' : 'Recalculate Radar'}
            </button>
          </div>
        }
      />

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard
          icon={Bug}
          title="Monitored Crop"
          value={crop}
          unit="Biofix Tracked"
          subtitle="Phenology bio-thermal simulation"
          color="#059669"
        />
        <StatCard
          icon={Thermometer}
          title="Accumulated GDD"
          value={activePest ? `${activePest.cumulativeGDD}` : '380'}
          unit="°C-Days"
          subtitle={activePest ? `Threshold: ${activePest.gddToFirstGeneration} GDD` : 'Thermal accumulation'}
          color="#0284c7"
        />
        <StatCard
          icon={AlertTriangle}
          title="Outbreak Risk Level"
          value={activePest ? activePest.alertLevel?.split('—')[0]?.trim() : 'Active'}
          unit="Status"
          subtitle={activePest ? activePest.alertLevel : 'Biofix monitoring'}
          trend={activePest?.percentToFirstGeneration >= 90 ? 'High Risk' : 'Normal'}
          trendType={activePest?.percentToFirstGeneration >= 90 ? 'down' : 'up'}
          color={activePest?.alertLevel?.includes('CRITICAL') ? '#ef4444' : '#f59e0b'}
        />
        <StatCard
          icon={Wind}
          title="Spray Window"
          value={activePest?.alertLevel?.includes('CRITICAL') ? 'OPEN' : 'MONITOR'}
          unit="Actionable"
          subtitle="Early morning / late evening spray"
          color="#8b5cf6"
        />
      </div>

      {/* Crop Selector & Simulation Context Bar */}
      <div
        style={{
          background: 'var(--fk-card, #ffffff)',
          border: '1px solid var(--fk-border, #e2e8f0)',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '13px', fontWeight: '800', color: 'var(--fk-text, #0f172a)' }}>
            SELECT CROP FOR RADAR:
          </span>
          <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
            {CROPS.map((c) => (
              <button
                key={c}
                onClick={() => setCrop(c)}
                style={{
                  padding: '6px 12px',
                  borderRadius: '20px',
                  border: crop === c ? '2px solid #059669' : '1px solid var(--fk-border, #cbd5e1)',
                  background: crop === c ? 'rgba(16, 185, 129, 0.12)' : 'var(--fk-bg, #f8fafc)',
                  color: crop === c ? '#059669' : 'var(--fk-text-sub, #64748b)',
                  fontWeight: crop === c ? '800' : '600',
                  fontSize: '12px',
                  cursor: 'pointer'
                }}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div style={{ fontSize: '12.5px', color: 'var(--fk-text-sub, #64748b)' }}>
          {result?.daysAnalyzed ? `Based on ${result.daysAnalyzed}-day micro-climate temperature history` : 'Simulated Degree-Days'}
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px', background: '#fee2e2', color: '#991b1b', borderRadius: '8px', marginBottom: '20px' }}>
          {error}
        </div>
      )}

      {/* Main Grid: Pest Cards (Left) + Detailed IPM & Degree-Day Progress (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: List of Pests tracked for this crop */}
        <div>
          <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--fk-text-sub, #64748b)', marginBottom: '10px', textTransform: 'uppercase' }}>
            Target Pests Phenology Models
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '30px', color: 'var(--fk-text-sub, #64748b)' }}>
              Computing GDD radar...
            </div>
          ) : result?.pests?.length === 0 ? (
            <PremiumCard style={{ textAlign: 'center', padding: '30px' }}>
              <div style={{ fontSize: '28px', marginBottom: '6px' }}>🌾</div>
              <div style={{ fontWeight: '800', fontSize: '14px' }}>No models for this crop</div>
              <div style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)', marginTop: '4px' }}>
                Select Cotton, Maize, or Paddy to view full phenology degree-day predictions.
              </div>
            </PremiumCard>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {result?.pests?.map((p) => {
                const isSelected = activePest?.pestId === p.pestId;
                const alertStyle = ALERT_CONFIG[p.alertLevel] || ALERT_CONFIG['MONITOR'];
                const emoji = PEST_ICONS[p.pestId] || '🐛';

                return (
                  <PremiumCard
                    key={p.pestId}
                    hoverable
                    onClick={() => setSelectedPest(p)}
                    style={{
                      cursor: 'pointer',
                      padding: '16px',
                      border: isSelected ? `2px solid ${alertStyle.color}` : '1px solid var(--fk-border, #e2e8f0)',
                      background: isSelected ? `${alertStyle.color}08` : 'var(--fk-card, #ffffff)'
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '24px' }}>{emoji}</span>
                        <div>
                          <strong style={{ fontSize: '14.5px', color: 'var(--fk-text, #0f172a)' }}>{p.name}</strong>
                          <div style={{ fontSize: '11.5px', color: 'var(--fk-text-sub, #64748b)' }}>Crop: {p.crop}</div>
                        </div>
                      </div>
                    </div>

                    <div style={{ margin: '8px 0' }}>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '800',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: alertStyle.bg,
                          color: alertStyle.color,
                          display: 'inline-block'
                        }}
                      >
                        {p.alertLevel}
                      </span>
                    </div>

                    {/* Progress Bar preview */}
                    <div style={{ marginTop: '8px' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', marginBottom: '3px' }}>
                        <span>Accumulation:</span>
                        <strong>{p.percentToFirstGeneration}% to 1st Peak</strong>
                      </div>
                      <div style={{ height: '6px', background: 'var(--fk-border, #e2e8f0)', borderRadius: '4px', overflow: 'hidden' }}>
                        <div
                          style={{
                            width: `${Math.min(p.percentToFirstGeneration, 100)}%`,
                            height: '100%',
                            background: alertStyle.color,
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                    </div>
                  </PremiumCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Detailed Thermal Progress, Generation Dates, & IPM Action Protocols */}
        {activePest ? (
          <div>
            {/* Degree-Day Thermal Progress Card */}
            <PremiumCard accentBorder style={{ padding: '22px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ fontSize: '28px' }}>{PEST_ICONS[activePest.pestId] || '🐛'}</span>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '900' }}>{activePest.name}</h3>
                    <div style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)' }}>
                      Base Temp Threshold (Tbase): {activePest.tBase || 11.7}°C · Max Cutoff: {activePest.tMax || 35.0}°C
                    </div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    background: (ALERT_CONFIG[activePest.alertLevel] || ALERT_CONFIG['MONITOR']).bg,
                    color: (ALERT_CONFIG[activePest.alertLevel] || ALERT_CONFIG['MONITOR']).color,
                    fontWeight: '800',
                    fontSize: '12.5px'
                  }}
                >
                  {activePest.alertLevel}
                </div>
              </div>

              {/* Multi-Stage Degree-Day Accumulation Meter */}
              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span>
                    Accumulated GDD:{' '}
                    <strong style={{ color: '#059669', fontSize: '14px' }}>{activePest.cumulativeGDD} °C-days</strong> / {activePest.gddToFirstGeneration} GDD
                  </span>
                  <strong style={{ color: (ALERT_CONFIG[activePest.alertLevel] || ALERT_CONFIG['MONITOR']).color }}>
                    {activePest.percentToFirstGeneration}% to 1st Generation Peak
                  </strong>
                </div>

                <div style={{ height: '12px', background: 'var(--fk-bg, #f8fafc)', borderRadius: '6px', overflow: 'hidden', border: '1px solid var(--fk-border, #e2e8f0)' }}>
                  <div
                    style={{
                      width: `${Math.min(activePest.percentToFirstGeneration, 100)}%`,
                      height: '100%',
                      background: 'linear-gradient(90deg, #10b981 0%, #f59e0b 70%, #ef4444 100%)',
                      borderRadius: '6px',
                      transition: 'width 0.6s ease'
                    }}
                  />
                </div>
              </div>

              {/* Generation Peak Calendar Chips */}
              {activePest.predictedGenerationDates && (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '10px', marginTop: '16px' }}>
                  <div style={{ padding: '10px', background: 'var(--fk-bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', fontWeight: '700' }}>1ST GENERATION PEAK</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--fk-text, #0f172a)', marginTop: '2px' }}>
                      {activePest.predictedGenerationDates.firstGen || 'Day 45–50'}
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--fk-bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', fontWeight: '700' }}>2ND GENERATION PEAK</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--fk-text, #0f172a)', marginTop: '2px' }}>
                      {activePest.predictedGenerationDates.secondGen || 'Day 75–80'}
                    </div>
                  </div>

                  <div style={{ padding: '10px', background: 'var(--fk-bg, #f8fafc)', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
                    <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', fontWeight: '700' }}>3RD GENERATION PEAK</div>
                    <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--fk-text, #0f172a)', marginTop: '2px' }}>
                      {activePest.predictedGenerationDates.thirdGen || 'Day 105–110'}
                    </div>
                  </div>
                </div>
              )}
            </PremiumCard>

            {/* Economic Threshold Index (ETI) Box */}
            <PremiumCard style={{ padding: '18px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                <ShieldCheck size={18} color="#d97706" />
                <h4 style={{ margin: 0, fontSize: '14.5px', fontWeight: '800', color: 'var(--fk-text, #0f172a)' }}>
                  Economic Threshold Index (ETI) & Trap Criteria
                </h4>
              </div>

              <div style={{ fontSize: '13px', color: 'var(--fk-text-sub, #475569)', lineHeight: '1.5' }}>
                {activePest.economicThreshold || activePest.damageThreshold || 'Field action is required only when pest counts exceed economic threshold.'}
              </div>
            </PremiumCard>

            {/* 4-Pillar Integrated Pest Management (IPM) Protocols */}
            <PremiumCard style={{ padding: '20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
                <Layers size={18} color="#059669" />
                <h4 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800' }}>
                  Integrated Pest Management (IPM) 4-Pillar Protocol
                </h4>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '10px' }}>
                {activePest.managementProtocol?.map((step, idx) => (
                  <div
                    key={idx}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      background: 'var(--fk-bg, #f8fafc)',
                      border: '1px solid var(--fk-border, #e2e8f0)',
                      fontSize: '12.5px',
                      lineHeight: '1.45',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px'
                    }}
                  >
                    <span style={{ color: '#059669', fontWeight: '800' }}>{idx + 1}.</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Safe Spray Weather Condition Advisory */}
              <div
                style={{
                  marginTop: '16px',
                  padding: '12px 14px',
                  borderRadius: '8px',
                  background: 'rgba(2, 132, 199, 0.08)',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                  fontSize: '12.5px',
                  color: 'var(--fk-text, #0f172a)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}
              >
                <Wind size={18} color="#0284c7" />
                <div>
                  <strong>Weather Suitability for Spraying:</strong> Wind speed &lt; 12 km/h, temperature &lt; 32°C. Spray in early morning (6–9 AM) or evening (4–6 PM) to protect honeybees and pollinators.
                </div>
              </div>
            </PremiumCard>
          </div>
        ) : null}
      </div>
    </div>
  );
}