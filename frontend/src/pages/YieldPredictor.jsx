import { useState, useEffect } from 'react';
import axios from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import PremiumCard from '../components/ui/PremiumCard';
import { StatCard } from '../components/ui/StatCard';
import {
  TrendingUp,
  Sparkles,
  ShieldCheck,
  DollarSign,
  Droplets,
  Scale,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  Zap,
  Info,
  Calendar,
  Layers,
  Award
} from 'lucide-react';

const CROPS = [
  'Paddy / Rice',
  'Wheat',
  'Cotton',
  'Maize',
  'Soybean',
  'Chili / Red Pepper',
  'Tomato',
  'Groundnut',
  'Mustard',
  'Onion'
];

const SCENARIOS = [
  'No Anomaly (Normal Season)',
  'Mild Drought (20-30% Rainfall Deficit)',
  'Severe Drought (>40% Rainfall Deficit)',
  'Excess Rainfall / Flood Risk',
  'Heat Wave (>40°C for 5+ Days)',
  'Unseasonal Frost / Cold Spell',
  'High Humidity / Disease Pressure'
];

const RISK_CONFIG = {
  low: { label: 'LOW CLIMATE RISK', color: '#10b981', bg: '#dcfce7', border: '#bbf7d0' },
  medium: { label: 'MODERATE RISK', color: '#f59e0b', bg: '#fef3c7', border: '#fde68a' },
  high: { label: 'SEVERE CLIMATE RISK', color: '#ef4444', bg: '#fee2e2', border: '#fecaca' }
};

export default function YieldPredictor({ user }) {
  const [form, setForm] = useState({
    crop: user?.farmProfile?.primaryCrop || 'Paddy / Rice',
    landArea: user?.farmProfile?.land?.sizeAcres || 2,
    areaUnit: 'acre', // 'acre' | 'hectare'
    irrigationType: 'drip',
    soilQuality: 'good',
    climateScenario: 'No Anomaly (Normal Season)',
    cultivarType: 'hybrid'
  });

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const predict = async () => {
    setLoading(true);
    setError('');

    const effectiveHectares =
      form.areaUnit === 'acre' ? Number(form.landArea) * 0.404686 : Number(form.landArea);

    try {
      const res = await axios.post('/api/yield/predict', {
        crop: form.crop,
        landHectares: effectiveHectares || 1,
        irrigationType: form.irrigationType,
        soilQuality: form.soilQuality,
        climateScenario: form.climateScenario,
        cultivarType: form.cultivarType
      });
      setResult(res.data);
    } catch (e) {
      setError(e.response?.data?.error || 'Yield prediction simulation failed.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    predict();
  }, [form.crop, form.irrigationType, form.climateScenario]);

  const fmt = (n) => (n !== undefined && n !== null ? n.toLocaleString('en-IN') : '—');

  const riskStyle = RISK_CONFIG[result?.riskLevel] || RISK_CONFIG['low'];

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem', color: 'var(--fk-text, #0f172a)' }}>
      {/* Universal Page Header */}
      <PageHeader
        badge="FAO CROP RESPONSE MODEL & PMFBY SIMULATOR"
        icon={TrendingUp}
        title="Crop Yield & Harvest Revenue Predictor"
        subtitle="Forecast farm-gate tonnage and MSP revenue across climate risk scenarios, simulate PMFBY insurance claims, and optimize harvest efficiency."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={predict}
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
              {loading ? 'Simulating...' : 'Run Simulation'}
            </button>
          </div>
        }
      />

      {/* Top Stat KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard
          icon={TrendingUp}
          title="Predicted Harvest"
          value={result ? `${fmt(result.yieldPrediction.totalYieldQuintals)}` : '—'}
          unit="Quintals"
          subtitle={result ? `${result.yieldPrediction.adjustedYieldPerHa} Qtl/Ha (${(result.yieldPrediction.adjustedYieldPerHa * 0.404686).toFixed(1)} Qtl/Acre)` : 'Based on farm parameters'}
          color="#059669"
        />
        <StatCard
          icon={Zap}
          title="Yield Efficiency"
          value={result ? `${result.yieldPrediction.yieldEfficiencyPercent}%` : '—'}
          unit="Of Potential"
          subtitle="Relative to agro-climatic optimum"
          trend={result?.yieldPrediction?.yieldEfficiencyPercent >= 85 ? 'High Efficiency' : 'Stressed'}
          trendType={result?.yieldPrediction?.yieldEfficiencyPercent >= 85 ? 'up' : 'down'}
          color="#0284c7"
        />
        <StatCard
          icon={DollarSign}
          title="Gross MSP Revenue"
          value={result ? `₹${fmt(result.financials.grossRevenueRs)}` : '—'}
          unit="At MSP Rate"
          subtitle={result ? `@ ₹${fmt(result.financials.mspRatePerQtl)} / Qtl` : 'Government MSP benchmark'}
          color="#f59e0b"
        />
        <StatCard
          icon={ShieldCheck}
          title="Post-PMFBY Net"
          value={result ? `₹${fmt(result.financials.netRevenueAfterInsuranceRs)}` : '—'}
          unit="Protected"
          subtitle={result?.financials?.pmfbyPayoutRs > 0 ? `Includes ₹${fmt(result.financials.pmfbyPayoutRs)} Claim Payout` : 'Zero shortfall claim needed'}
          color="#8b5cf6"
        />
      </div>

      {/* Main Grid: Parameters Form (Left) + Simulation Analysis (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Farm Parameters Simulation Inputs */}
        <PremiumCard accentBorder style={{ padding: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
            <Scale size={18} color="#059669" />
            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Farm & Climate Parameters</h3>
          </div>

          {/* Crop Selector */}
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

          {/* Land Area & Unit */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                LAND AREA
              </label>
              <input
                type="number"
                min="0.5"
                step="0.5"
                value={form.landArea}
                onChange={(e) => setForm({ ...form, landArea: e.target.value })}
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
                value={form.areaUnit}
                onChange={(e) => setForm({ ...form, areaUnit: e.target.value })}
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
                <option value="acre">Acres</option>
                <option value="hectare">Hectares</option>
              </select>
            </div>
          </div>

          {/* Irrigation Method */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
              IRRIGATION INFRASTRUCTURE
            </label>
            <select
              value={form.irrigationType}
              onChange={(e) => setForm({ ...form, irrigationType: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--fk-border, #cbd5e1)',
                background: 'var(--fk-bg, #f8fafc)',
                color: 'var(--fk-text, #0f172a)',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <option value="drip">Drip Irrigation (+15% Yield Bonus)</option>
              <option value="sprinkler">Sprinkler Irrigation (+8% Bonus)</option>
              <option value="canal">Canal / Flood (+5% Baseline)</option>
              <option value="rainfed">Rainfed / Unirrigated (-18% Risk)</option>
            </select>
          </div>

          {/* Soil Quality */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
              SOIL HEALTH PROFILE
            </label>
            <select
              value={form.soilQuality}
              onChange={(e) => setForm({ ...form, soilQuality: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--fk-border, #cbd5e1)',
                background: 'var(--fk-bg, #f8fafc)',
                color: 'var(--fk-text, #0f172a)',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <option value="excellent">Excellent Deep Alluvial / Black (+12%)</option>
              <option value="good">Good Fertile Soil (Standard)</option>
              <option value="fair">Fair Medium Soil (-15%)</option>
              <option value="poor">Poor Shallow / Degraded Soil (-32%)</option>
            </select>
          </div>

          {/* Cultivar Type */}
          <div style={{ marginBottom: '14px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
              SEED VARIETY / CULTIVAR
            </label>
            <select
              value={form.cultivarType}
              onChange={(e) => setForm({ ...form, cultivarType: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--fk-border, #cbd5e1)',
                background: 'var(--fk-bg, #f8fafc)',
                color: 'var(--fk-text, #0f172a)',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              <option value="hybrid">High-Yielding Hybrid (+18%)</option>
              <option value="improved">Certified Improved Variety (+8%)</option>
              <option value="local">Traditional Local Seed (Baseline)</option>
            </select>
          </div>

          {/* Climate Anomaly Scenario */}
          <div style={{ marginBottom: '18px' }}>
            <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
              WEATHER & CLIMATE SCENARIO
            </label>
            <select
              value={form.climateScenario}
              onChange={(e) => setForm({ ...form, climateScenario: e.target.value })}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: '1px solid var(--fk-border, #cbd5e1)',
                background: 'var(--fk-bg, #f8fafc)',
                color: 'var(--fk-text, #0f172a)',
                fontSize: '13px',
                fontWeight: '600'
              }}
            >
              {SCENARIOS.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={predict}
            disabled={loading}
            style={{
              width: '100%',
              padding: '11px',
              borderRadius: '8px',
              border: 'none',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: '#fff',
              fontWeight: '700',
              fontSize: '13.5px',
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Simulating...' : 'Recalculate Yield & Payout'}
          </button>

          {error && (
            <div style={{ marginTop: '10px', padding: '8px', background: '#fee2e2', color: '#991b1b', borderRadius: '6px', fontSize: '12px' }}>
              {error}
            </div>
          )}
        </PremiumCard>

        {/* Right Column: Detailed Simulation Output & PMFBY Breakdown */}
        {result ? (
          <div>
            {/* Climate Risk Banner */}
            <div
              style={{
                padding: '14px 18px',
                borderRadius: '12px',
                background: riskStyle.bg,
                border: `1px solid ${riskStyle.border}`,
                color: riskStyle.color,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '10px',
                marginBottom: '18px'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <AlertTriangle size={20} />
                <div>
                  <div style={{ fontWeight: '800', fontSize: '14px' }}>{riskStyle.label}</div>
                  <div style={{ fontSize: '12.5px', opacity: 0.9 }}>{result.climateScenario}</div>
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <span style={{ fontSize: '11px', display: 'block', opacity: 0.85 }}>Harvest Efficiency</span>
                <strong style={{ fontSize: '20px', fontWeight: '900', fontFamily: 'Outfit, sans-serif' }}>
                  {result.yieldPrediction.yieldEfficiencyPercent}%
                </strong>
              </div>
            </div>

            {/* 3-Scenario Comparison Cards */}
            <div style={{ marginBottom: '20px' }}>
              <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--fk-text-sub, #64748b)', marginBottom: '10px', textTransform: 'uppercase' }}>
                📊 3-Scenario Harvest Comparison
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px' }}>
                {result.scenarios.map((scen, idx) => {
                  const isExpected = idx === 1;

                  return (
                    <PremiumCard
                      key={idx}
                      style={{
                        padding: '16px',
                        border: isExpected ? '2px solid #059669' : '1px solid var(--fk-border, #e2e8f0)',
                        background: isExpected ? 'var(--primary-surface, rgba(16, 185, 129, 0.08))' : 'var(--fk-card, #ffffff)'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '12px', fontWeight: '800', color: isExpected ? '#059669' : 'var(--fk-text-sub, #64748b)' }}>
                          {scen.label.split('(')[0].trim()}
                        </span>
                        {isExpected && (
                          <span style={{ fontSize: '10px', fontWeight: '800', padding: '2px 6px', borderRadius: '4px', background: '#059669', color: '#fff' }}>
                            Current Forecast
                          </span>
                        )}
                      </div>

                      <div style={{ fontSize: '22px', fontWeight: '900', color: 'var(--fk-text, #0f172a)', fontFamily: 'Outfit, sans-serif' }}>
                        {fmt(scen.yieldQtl)} <span style={{ fontSize: '13px', fontWeight: '600', color: 'var(--fk-text-sub, #64748b)' }}>Qtl</span>
                      </div>

                      <div style={{ marginTop: '8px', paddingTop: '8px', borderTop: '1px dashed var(--fk-border, #cbd5e1)', display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                        <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Revenue:</span>
                        <strong style={{ color: '#059669' }}>₹{fmt(scen.revenue)}</strong>
                      </div>
                    </PremiumCard>
                  );
                })}
              </div>
            </div>

            {/* PMFBY Crop Insurance Detailed Breakdown */}
            <PremiumCard style={{ padding: '20px', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px', flexWrap: 'wrap', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ShieldCheck size={20} color="#0284c7" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                    PMFBY Insurance Simulation & Claim Payout
                  </h3>
                </div>

                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '800',
                    padding: '3px 8px',
                    borderRadius: '6px',
                    background: '#e0f2fe',
                    color: '#0369a1'
                  }}
                >
                  Govt Subsidized Premium ({result.pmfbyInsurance.farmerPremiumPercent}%)
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '14px' }}>
                <div style={{ background: 'var(--fk-bg, #f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', fontWeight: '700' }}>SUM INSURED (VALUE)</div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: 'var(--fk-text, #0f172a)', marginTop: '2px' }}>
                    ₹{fmt(result.pmfbyInsurance.totalSumInsuredRs)}
                  </div>
                </div>

                <div style={{ background: 'var(--fk-bg, #f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', fontWeight: '700' }}>FARMER PREMIUM (PAID)</div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#f59e0b', marginTop: '2px' }}>
                    ₹{fmt(result.pmfbyInsurance.farmerPremiumRs)}
                  </div>
                </div>

                <div style={{ background: 'var(--fk-bg, #f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', fontWeight: '700' }}>GOVT SUBSIDY (CENTRAL + STATE)</div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: '#059669', marginTop: '2px' }}>
                    ₹{fmt(result.pmfbyInsurance.centralSubsidyEstimateRs)}
                  </div>
                </div>

                <div style={{ background: 'var(--fk-bg, #f8fafc)', padding: '12px', borderRadius: '8px', border: '1px solid var(--fk-border, #e2e8f0)' }}>
                  <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', fontWeight: '700' }}>EXPECTED CLAIM PAYOUT</div>
                  <div style={{ fontSize: '17px', fontWeight: '800', color: result.pmfbyInsurance.expectedPayoutRs > 0 ? '#ef4444' : '#059669', marginTop: '2px' }}>
                    ₹{fmt(result.pmfbyInsurance.expectedPayoutRs)}
                  </div>
                </div>
              </div>

              <div
                style={{
                  padding: '10px 14px',
                  borderRadius: '8px',
                  background: 'rgba(2, 132, 199, 0.08)',
                  color: '#0369a1',
                  fontSize: '12.5px',
                  fontWeight: '700',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}
              >
                <span>💡</span>
                <span>{result.pmfbyInsurance.recommendation}</span>
              </div>
            </PremiumCard>

            {/* Yield Maximization Roadmap */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <PremiumCard style={{ padding: '16px' }}>
                <div style={{ fontWeight: '800', fontSize: '13.5px', marginBottom: '6px', color: '#059669' }}>
                  💧 Irrigation Optimization
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--fk-text-sub, #64748b)', margin: 0, lineHeight: '1.5' }}>
                  Switching from traditional flood/canal to automated drip saves up to 40% water and provides a proven +15% yield boost through uniform soil moisture tension and fertigation efficiency.
                </p>
              </PremiumCard>

              <PremiumCard style={{ padding: '16px' }}>
                <div style={{ fontWeight: '800', fontSize: '13.5px', marginBottom: '6px', color: '#0284c7' }}>
                  🌾 Hybrid Vigor & Seed Treatment
                </div>
                <p style={{ fontSize: '12.5px', color: 'var(--fk-text-sub, #64748b)', margin: 0, lineHeight: '1.5' }}>
                  Certified F1 hybrids offer deep taproot resilience against drought and higher harvest index. Combine with bio-priming (Trichoderma + Pseudomonas) to safeguard early seedling stand.
                </p>
              </PremiumCard>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}