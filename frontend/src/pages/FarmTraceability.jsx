import useApiResource from '../hooks/useApiResource';
import { useState } from 'react';
import axios from '../api/client';

const API = axios.defaults.baseURL;
const STAGES = ['Crop Scouting / Field Inspection', 'Pesticide / Fertilizer Application', 'Harvest', 'Post-Harvest Cleaning & Grading', 'Cold Storage / Warehouse Entry', 'Quality Lab Test', 'Transport to APMC / Buyer', 'Market Sale / Export Dispatch'];
const STATUS_COLORS = { SOWING_REGISTERED: '#22c55e', IN_PROGRESS: '#3b82f6', HARVESTED: '#f59e0b', GRADED: '#a855f7', IN_STORAGE: '#06b6d4', TESTED: '#8b5cf6', IN_TRANSIT: '#f97316', SOLD: '#22c55e', COMPLETE: '#22c55e' };

export default function FarmTraceability() {

  const [selectedBatch, setSelected] = useState(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);

  const [newBatch, setNewBatch] = useState({ farmerName: 'Ramu Reddy', crop: 'Tomato', landAcres: 2, location: 'Shadnagar, Telangana', soilType: 'black', irrigationType: 'drip', grade: 'Export Grade A', harvestDateExpected: '' });
  const [checkpoint, setCheckpoint] = useState({ stage: STAGES[0], actor: '', details: '' });



  const { data, loading, error, reload: fetchBatches } = useApiResource({ url: '/api/trace/batches' });
  const batches = data?.batches || [];
  const selected = selectedBatch || batches[0] || null;

  const createBatch = async () => {
    try {
      const { data } = await axios.post(`${API}/api/trace/batch`, { ...newBatch, farmerId: 'demo_user', landAcres: Number(newBatch.landAcres) });
      await fetchBatches();
      setSelected(data);
      setShowCreate(false);
    } catch (e) { alert(e.message); }
  };

  const addCheckpoint = async () => {
    try {
      const { data } = await axios.post(`${API}/api/trace/batch/${selected.batchId}/checkpoint`, checkpoint);
      setSelected(data);
      await fetchBatches();
      setShowCheckpoint(false);
    } catch (e) { alert(e.message); }
  };

  const qrUrl = selected ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(selected.qrPayload)}&size=180x180&margin=8` : '';

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg,#0f0c29,#302b63,#24243e)', padding: '2rem', fontFamily: "'Inter', sans-serif", color: '#e2e8f0' }}>
      {error && <p role="alert">{error}</p>}
      <div style={{ maxWidth: 1100, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ fontSize: '2.5rem' }}>📦</div>
            <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: 800, background: 'linear-gradient(90deg,#a855f7,#ec4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>Farm-to-Fork Traceability</h1>
            <p style={{ color: '#94a3b8', margin: '0.3rem 0 0', fontSize: '0.9rem' }}>QR Batch Passport · Chain-of-Custody · Export Certification</p>
          </div>
          <button onClick={() => setShowCreate(true)} style={{ padding: '0.75rem 1.5rem', background: 'linear-gradient(135deg,#a855f7,#7c3aed)', border: 'none', borderRadius: 12, color: '#fff', fontWeight: 700, cursor: 'pointer', fontSize: '0.95rem' }}>+ Register New Batch</button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
          {/* Batch List */}
          <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: '1rem', height: 'fit-content' }}>
            <h3 style={{ margin: '0 0 1rem', color: '#a78bfa', fontSize: '0.9rem', fontWeight: 700 }}>CROP BATCHES</h3>
            {loading && <div style={{ color: '#64748b', textAlign: 'center', padding: '1rem' }}>Loading...</div>}
            {batches.map(b => (
              <div key={b.batchId} onClick={() => setSelected(b)} style={{ padding: '0.85rem', borderRadius: 12, cursor: 'pointer', marginBottom: '0.5rem', background: selected?.batchId === b.batchId ? 'rgba(168,85,247,0.15)' : 'rgba(0,0,0,0.2)', border: `1px solid ${selected?.batchId === b.batchId ? 'rgba(168,85,247,0.4)' : 'transparent'}`, transition: 'all 0.2s' }}>
                <div style={{ fontWeight: 700, fontSize: '0.9rem', color: '#e2e8f0' }}>{b.crop}</div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>{b.batchId}</div>
                <div style={{ marginTop: '0.4rem' }}>
                  <span style={{ fontSize: '0.7rem', padding: '0.2rem 0.5rem', borderRadius: 6, background: `${STATUS_COLORS[b.status] || '#22c55e'}22`, color: STATUS_COLORS[b.status] || '#22c55e', fontWeight: 700 }}>{b.status?.replace(/_/g, ' ')}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Batch Detail */}
          {selected && (
            <div>
              {/* QR + Info */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '1.5rem', background: 'rgba(255,255,255,0.05)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.1)', padding: '1.5rem', marginBottom: '1.5rem' }}>
                <div>
                  <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem' }}>
                    <span style={{ fontSize: '1.5rem' }}>📦</span>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{selected.crop} — {selected.grade}</div>
                      <div style={{ color: '#64748b', fontSize: '0.8rem', fontFamily: 'monospace' }}>{selected.batchId}</div>
                    </div>
                  </div>
                  {[['📍 Location', selected.location], ['🌍 Land Area', `${selected.landAcres} Acres`], ['💧 Irrigation', selected.irrigationType], ['🗓️ Harvest Expected', selected.harvestDateExpected], ['🏅 Certifications', (selected.certifications || []).join(', ')]].map(([l, v]) => (
                    <div key={l} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.4rem', fontSize: '0.88rem' }}>
                      <span style={{ color: '#64748b', width: 160 }}>{l}</span>
                      <span style={{ color: '#e2e8f0', fontWeight: 600 }}>{v}</span>
                    </div>
                  ))}
                  {selected.pesticidesUsed?.length > 0 && (
                    <div style={{ marginTop: '0.5rem', fontSize: '0.8rem', color: '#86efac', background: 'rgba(34,197,94,0.08)', padding: '0.5rem 0.75rem', borderRadius: 8 }}>
                      🌿 <strong>Pesticides Used:</strong> {selected.pesticidesUsed.join(' | ')}
                    </div>
                  )}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <img src={qrUrl} alt="QR Passport" style={{ borderRadius: 12, border: '3px solid rgba(168,85,247,0.4)', width: 160 }} />
                  <div style={{ fontSize: '0.7rem', color: '#64748b', marginTop: '0.4rem' }}>Scan for live trace</div>
                </div>
              </div>

              {/* Timeline */}
              <div style={{ background: 'rgba(255,255,255,0.04)', borderRadius: 18, border: '1px solid rgba(255,255,255,0.08)', padding: '1.5rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.2rem' }}>
                  <h3 style={{ margin: 0, color: '#a78bfa', fontWeight: 700 }}>🗺️ Chain of Custody Timeline</h3>
                  <button onClick={() => setShowCheckpoint(true)} style={{ padding: '0.5rem 1rem', background: 'rgba(168,85,247,0.2)', border: '1px solid rgba(168,85,247,0.4)', borderRadius: 8, color: '#a78bfa', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 700 }}>+ Add Checkpoint</button>
                </div>
                {selected.timeline?.map((t, i) => (
                  <div key={i} style={{ display: 'flex', gap: '1rem', marginBottom: '1.2rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: `${STATUS_COLORS[t.status] || '#22c55e'}22`, border: `2px solid ${STATUS_COLORS[t.status] || '#22c55e'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', flexShrink: 0 }}>✅</div>
                      {i < selected.timeline.length - 1 && <div style={{ width: 2, flex: 1, minHeight: 24, background: 'rgba(255,255,255,0.1)', marginTop: 4 }} />}
                    </div>
                    <div style={{ flex: 1, paddingBottom: '0.5rem' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                        <span style={{ fontWeight: 700, color: '#e2e8f0', fontSize: '0.9rem' }}>{t.stage}</span>
                        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{t.date}</span>
                      </div>
                      <div style={{ color: '#94a3b8', fontSize: '0.82rem', marginTop: '0.2rem' }}>{t.details}</div>
                      <div style={{ color: '#64748b', fontSize: '0.78rem', marginTop: '0.2rem' }}>By: {t.actor}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Batch Modal */}
      {showCreate && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1e293b', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 500, border: '1px solid rgba(168,85,247,0.3)' }}>
            <h2 style={{ margin: '0 0 1.5rem', color: '#a78bfa' }}>Register New Crop Batch</h2>
            {Object.entries(newBatch).map(([key, val]) => (
              <div key={key} style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem', textTransform: 'capitalize' }}>{key.replace(/([A-Z])/g, ' $1')}</label>
                <input value={val} onChange={e => setNewBatch(b => ({ ...b, [key]: e.target.value }))} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.6rem', color: '#e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={createBatch} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg,#a855f7,#7c3aed)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Create Batch</button>
              <button onClick={() => setShowCreate(false)} style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Checkpoint Modal */}
      {showCheckpoint && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
          <div style={{ background: '#1e293b', borderRadius: 20, padding: '2rem', width: '100%', maxWidth: 480, border: '1px solid rgba(168,85,247,0.3)' }}>
            <h2 style={{ margin: '0 0 1.5rem', color: '#a78bfa' }}>Add Chain Checkpoint</h2>
            <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>Stage</label>
            <select value={checkpoint.stage} onChange={e => setCheckpoint(c => ({ ...c, stage: e.target.value }))} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.6rem', color: '#e2e8f0', fontSize: '0.9rem', marginBottom: '0.75rem' }}>
              {STAGES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {[['Actor / Inspector Name', 'actor'], ['Details / Observations', 'details']].map(([label, key]) => (
              <div key={key} style={{ marginBottom: '0.75rem' }}>
                <label style={{ display: 'block', fontSize: '0.8rem', color: '#94a3b8', marginBottom: '0.3rem' }}>{label}</label>
                <input value={checkpoint[key]} onChange={e => setCheckpoint(c => ({ ...c, [key]: e.target.value }))} style={{ width: '100%', background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, padding: '0.6rem', color: '#e2e8f0', fontSize: '0.9rem', boxSizing: 'border-box' }} />
              </div>
            ))}
            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button onClick={addCheckpoint} style={{ flex: 1, padding: '0.75rem', background: 'linear-gradient(135deg,#a855f7,#7c3aed)', border: 'none', borderRadius: 10, color: '#fff', fontWeight: 700, cursor: 'pointer' }}>Add Checkpoint</button>
              <button onClick={() => setShowCheckpoint(false)} style={{ padding: '0.75rem 1.5rem', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#94a3b8', cursor: 'pointer' }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
