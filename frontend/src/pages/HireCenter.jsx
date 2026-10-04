import useApiResource from '../hooks/useApiResource';
import { useState } from 'react';
import axios from '../api/client';

const API = axios.defaults.baseURL;
const CATEGORY_ICONS = { 'Land Preparation': '🚜', 'Sowing & Planting': '🌱', 'Harvesting': '🌾', 'Drone Spray Services': '🚁', 'Inter-Cultivation': '🪛', 'Pest Management': '💧' };
const CATEGORY_COLORS = { 'Land Preparation': '#f59e0b', 'Sowing & Planting': '#22c55e', 'Harvesting': '#f97316', 'Drone Spray Services': '#06b6d4', 'Inter-Cultivation': '#a855f7', 'Pest Management': '#3b82f6' };

export default function HireCenter() {

  const [activeCategory, setActiveCategory] = useState('All');
  const [estimate, setEstimate] = useState(null);
  const [estForm, setEstForm] = useState({ machineId: '', acres: 2, hours: 0 });
  const catalog = useApiResource({ url: '/api/hire/categories' });
  const { data, loading, error } = useApiResource({ url: '/api/hire/machinery', params: activeCategory === 'All' ? {} : { category: activeCategory } });
  const machinery = data?.machinery || [];
  const categories = catalog.data?.categories || ['All'];
  const fetchMachinery = setActiveCategory;
  const estimateCost = async (machineId) => {
    try {
      const { data } = await axios.post(`${API}/api/hire/estimate`, { machineId, acres: Number(estForm.acres), hours: Number(estForm.hours) });
      setEstimate(data);
    } catch (e) { alert(e.response?.data?.error || 'Estimation failed'); }
  };

  const fmt = (n) => n?.toLocaleString('en-IN') || '—';
  const catColor = (cat) => CATEGORY_COLORS[cat] || '#6366f1';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#1a1a2e,#16213e,#0f3460)', padding: '2rem', fontFamily: "'Inter', sans-serif", color: '#e2e8f0' }}>
      {error && <p role="alert">{error}</p>}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3.1rem' }}>🤝</div>
          <h1 style={{ margin: 0, fontSize: '2.1rem', fontWeight: 800, background: 'linear-gradient(90deg,#f59e0b,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>CHC Machinery & Drone Rental Hub</h1>
          <p style={{ color: '#94a3b8', marginTop: '0.4rem' }}>Custom Hiring Center · Agricultural Machinery · Drone Spray Services</p>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '2rem' }}>
          {categories.map(cat => (
            <button key={cat} onClick={() => { setActiveCategory(cat); fetchMachinery(cat); }} style={{ padding: '0.5rem 1.1rem', borderRadius: 999, border: activeCategory === cat ? `2px solid ${catColor(cat)}` : '1px solid rgba(255,255,255,0.1)', background: activeCategory === cat ? `${catColor(cat)}22` : 'rgba(255,255,255,0.04)', color: activeCategory === cat ? catColor(cat) : '#94a3b8', fontWeight: activeCategory === cat ? 700 : 400, cursor: 'pointer', fontSize: '0.91rem', transition: 'all 0.2s' }}>
              {CATEGORY_ICONS[cat] || '🔧'} {cat}
            </button>
          ))}
        </div>

        {/* Quick Estimate Strip */}
        <div style={{ background: 'rgba(245,158,11,0.1)', borderRadius: 14, border: '1px solid rgba(245,158,11,0.25)', padding: '1rem 1.5rem', marginBottom: '2rem', display: 'flex', gap: '1rem', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ color: '#fbbf24', fontWeight: 700, fontSize: '0.96rem' }}>⚡ Quick Cost Estimator</span>
          <input type="number" placeholder="Acres" value={estForm.acres} onChange={e => setEstForm(f => ({ ...f, acres: e.target.value }))} style={{ padding: '0.45rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', width: 90, fontSize: '0.91rem' }} />
          <input type="number" placeholder="Hours (optional)" value={estForm.hours} onChange={e => setEstForm(f => ({ ...f, hours: e.target.value }))} style={{ padding: '0.45rem 0.75rem', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#e2e8f0', width: 130, fontSize: '0.91rem' }} />
          {estForm.machineId && <button onClick={() => estimateCost(estForm.machineId)} style={{ padding: '0.45rem 1rem', background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.91rem' }}>Estimate ₹</button>}
          {!estForm.machineId && <span style={{ color: '#64748b', fontSize: '0.86rem' }}>← Click "Get Quote" on any machine below</span>}
        </div>

        {/* Estimate Result */}
        {estimate && (
          <div style={{ background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.3)', borderRadius: 14, padding: '1.2rem 1.5rem', marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '0.5rem', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 700, color: '#fbbf24', fontSize: '1.06rem' }}>{estimate.machine}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.88rem' }}>{estimate.operator} · {estimate.contactPhone}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '1.7rem', fontWeight: 800, color: '#22c55e' }}>₹{fmt(estimate.totalEstimate)}</div>
                <div style={{ color: '#64748b', fontSize: '0.84rem' }}>Rental + Transport | ₹{fmt(estimate.perAcreEffectiveCost)}/acre</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1.5rem', marginTop: '0.75rem', flexWrap: 'wrap', fontSize: '0.88rem', color: '#94a3b8' }}>
              <span>💰 Rental: ₹{fmt(estimate.rentalCost)}</span>
              <span>🚛 Transport: ₹{fmt(estimate.fuelSurcharge)}</span>
              <span>⏱️ Est. Hours: {estimate.estimatedHours}h</span>
              <span style={{ color: '#22c55e' }}>👷 Labour Saving: {estimate.laborSavingPercent}%</span>
            </div>
          </div>
        )}

        {/* Machinery Grid */}
        {loading ? (
          <div style={{ textAlign: 'center', color: '#64748b', padding: '3rem' }}>Loading machinery catalog...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(320px,1fr))', gap: '1.5rem' }}>
            {machinery.map(m => (
              <div key={m.id} style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, border: `1px solid rgba(255,255,255,0.08)`, padding: '1.5rem', transition: 'transform 0.2s', ':hover': { transform: 'translateY(-2px)' } }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2.1rem' }}>{CATEGORY_ICONS[m.category] || '🔧'}</span>
                  <span style={{ fontSize: '0.78rem', padding: '0.25rem 0.6rem', borderRadius: 6, background: `${catColor(m.category)}22`, color: catColor(m.category), fontWeight: 700 }}>{m.category}</span>
                </div>
                <div style={{ fontWeight: 800, color: '#e2e8f0', marginBottom: '0.4rem', lineHeight: 1.3 }}>{m.name}</div>
                <div style={{ color: '#94a3b8', fontSize: '0.86rem', lineHeight: 1.5, marginBottom: '1rem' }}>{m.description}</div>
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                  <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '0.5rem' }}>
                    <div style={{ color: '#22c55e', fontWeight: 800, fontSize: '1.06rem' }}>₹{fmt(m.ratePerAcre)}</div>
                    <div style={{ color: '#64748b', fontSize: '0.76rem' }}>/ Acre</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '0.5rem' }}>
                    <div style={{ color: '#3b82f6', fontWeight: 800, fontSize: '1.06rem' }}>₹{fmt(m.ratePerHour)}</div>
                    <div style={{ color: '#64748b', fontSize: '0.76rem' }}>/ Hour</div>
                  </div>
                  <div style={{ flex: 1, textAlign: 'center', background: 'rgba(0,0,0,0.2)', borderRadius: 10, padding: '0.5rem' }}>
                    <div style={{ color: '#f59e0b', fontWeight: 800, fontSize: '1.06rem' }}>{m.distKm} km</div>
                    <div style={{ color: '#64748b', fontSize: '0.76rem' }}>Distance</div>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.84rem', color: '#94a3b8' }}>👤 {m.operator}</div>
                  <button onClick={() => { setEstForm(f => ({ ...f, machineId: m.id })); estimateCost(m.id); }} style={{ padding: '0.45rem 1rem', background: 'linear-gradient(135deg,#f59e0b,#d97706)', border: 'none', borderRadius: 8, color: '#000', fontWeight: 700, cursor: 'pointer', fontSize: '0.86rem' }}>Get Quote ₹</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
