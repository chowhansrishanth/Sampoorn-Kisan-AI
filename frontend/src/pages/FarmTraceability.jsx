import { useState } from 'react';
import axios from '../api/client';
import useApiResource from '../hooks/useApiResource';
import PageHeader from '../components/ui/PageHeader';
import PremiumCard from '../components/ui/PremiumCard';
import { StatCard } from '../components/ui/StatCard';
import {
  QrCode,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  MapPin,
  Clock,
  Plus,
  Search,
  ExternalLink,
  Copy,
  Printer,
  Check,
  X,
  Layers,
  Award,
  ArrowRight
} from 'lucide-react';

const STAGES = [
  'Crop Scouting / Field Inspection',
  'Pesticide / Fertilizer Application',
  'Harvest',
  'Post-Harvest Cleaning & Grading',
  'Cold Storage / Warehouse Entry',
  'Quality Lab Test',
  'Transport to APMC / Buyer',
  'Market Sale / Export Dispatch'
];

const STATUS_CONFIG = {
  SOWING_REGISTERED: { label: 'Sowing Registered', color: '#10b981', bg: '#dcfce7' },
  IN_PROGRESS: { label: 'In Cultivation', color: '#0284c7', bg: '#e0f2fe' },
  HARVESTED: { label: 'Harvested', color: '#f59e0b', bg: '#fef3c7' },
  GRADED: { label: 'Post-Harvest Graded', color: '#8b5cf6', bg: '#ede9fe' },
  IN_STORAGE: { label: 'In Cold Storage', color: '#06b6d4', bg: '#cffafe' },
  TESTED: { label: 'MRL Lab Tested', color: '#6366f1', bg: '#e0e7ff' },
  IN_TRANSIT: { label: 'In Transit', color: '#f97316', bg: '#ffedd5' },
  SOLD: { label: 'Sold / Dispatched', color: '#10b981', bg: '#dcfce7' },
  COMPLETE: { label: 'Certified Complete', color: '#10b981', bg: '#dcfce7' }
};

export default function FarmTraceability({ user }) {
  const [selectedBatchId, setSelectedBatchId] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [showCheckpoint, setShowCheckpoint] = useState(false);
  const [copied, setCopied] = useState(false);

  // New Batch Form State
  const [newBatch, setNewBatch] = useState({
    farmerName: user?.name || 'Ramu Reddy',
    crop: user?.farmProfile?.primaryCrop || 'Export Tomato',
    landAcres: user?.farmProfile?.land?.sizeAcres || 2,
    location: user?.location || 'Shadnagar, Telangana',
    soilType: 'Black Clay Loam',
    irrigationType: 'Drip Irrigation',
    grade: 'Export Grade A',
    harvestDateExpected: new Date(Date.now() + 75 * 86400000).toISOString().split('T')[0]
  });

  // New Checkpoint Form State
  const [checkpoint, setCheckpoint] = useState({
    stage: STAGES[0],
    actor: user?.name || 'Field Agronomist',
    details: 'Visual inspection completed. Leaf canopy healthy, zero pest pressure.'
  });

  const { data, loading, error, reload: fetchBatches } = useApiResource({ url: '/api/trace/batches' });
  const batches = data?.batches || [];

  // Active selected batch
  const selected = batches.find((b) => b.batchId === selectedBatchId) || batches[0] || null;

  const createBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post('/api/trace/batch', {
        ...newBatch,
        farmerId: user?.id || 'farmer_user',
        landAcres: Number(newBatch.landAcres) || 1
      });
      await fetchBatches();
      setSelectedBatchId(res.data.batchId);
      setShowCreate(false);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const addCheckpoint = async (e) => {
    e.preventDefault();
    if (!selected) return;
    try {
      await axios.post(`/api/trace/batch/${selected.batchId}/checkpoint`, checkpoint);
      await fetchBatches();
      setShowCheckpoint(false);
    } catch (err) {
      alert(err.response?.data?.error || err.message);
    }
  };

  const qrUrl = selected
    ? `https://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(selected.qrPayload)}&size=200x200&margin=8`
    : '';

  const copyQrLink = () => {
    if (selected) {
      navigator.clipboard.writeText(selected.qrPayload);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const filteredBatches = batches.filter(
    (b) =>
      b.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.batchId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.farmerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem', color: 'var(--fk-text, #0f172a)' }}>
      {/* Universal Page Header */}
      <PageHeader
        badge="EXPORT TRACEABILITY & QR DIGITAL PASSPORT"
        icon={QrCode}
        title="Farm-to-Fork Traceability Hub"
        subtitle="Generate immutable digital batch passports with chain-of-custody milestones from sowing to retail dispatch for export and organic certification."
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
              <Printer size={15} /> Print Certificate
            </button>
            <button
              onClick={() => setShowCreate(true)}
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
              <Plus size={15} /> Register New Batch
            </button>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard
          icon={QrCode}
          title="Active Crop Passports"
          value={batches.length || '1'}
          unit="Batches Tracked"
          subtitle="Verifiable QR Chain"
          color="#059669"
        />
        <StatCard
          icon={Award}
          title="Certification Standard"
          value="GlobalGAP"
          unit="& NPOP"
          subtitle="Meets European & FSSAI MRL Limits"
          color="#8b5cf6"
        />
        <StatCard
          icon={ShieldCheck}
          title="Residue Compliance"
          value="100%"
          unit="PHI Passed"
          subtitle="Safe Pre-Harvest Interval Observed"
          trend="Certified Safe"
          trendType="up"
          color="#0284c7"
        />
        <StatCard
          icon={Layers}
          title="Chain Milestones"
          value={selected?.timeline?.length || '1'}
          unit="Verified Steps"
          subtitle="Immutable Farmer-to-Retail log"
          color="#d97706"
        />
      </div>

      {/* Main Grid: Batches List (Left) + Selected Passport Details (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Registered Batches List */}
        <div>
          <div style={{ position: 'relative', marginBottom: '12px' }}>
            <Search
              size={15}
              style={{
                position: 'absolute',
                left: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--fk-text-muted, #94a3b8)'
              }}
            />
            <input
              type="text"
              placeholder="Search batches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 10px 8px 32px',
                borderRadius: '8px',
                border: '1px solid var(--fk-border, #cbd5e1)',
                background: 'var(--fk-card, #ffffff)',
                color: 'var(--fk-text, #0f172a)',
                fontSize: '12.5px',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <PremiumCard style={{ padding: '12px' }}>
            <div style={{ fontSize: '12px', fontWeight: '800', color: 'var(--fk-text-sub, #64748b)', marginBottom: '10px', textTransform: 'uppercase' }}>
              Crop Batches ({filteredBatches.length})
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fk-text-sub, #64748b)' }}>
                Loading batches...
              </div>
            ) : filteredBatches.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px', color: 'var(--fk-text-sub, #64748b)' }}>
                No batches found.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {filteredBatches.map((b) => {
                  const isSelected = (selected?.batchId === b.batchId);
                  const statusMeta = STATUS_CONFIG[b.status] || { label: b.status, color: '#059669', bg: '#dcfce7' };

                  return (
                    <div
                      key={b.batchId}
                      onClick={() => setSelectedBatchId(b.batchId)}
                      style={{
                        padding: '12px',
                        borderRadius: '10px',
                        cursor: 'pointer',
                        background: isSelected ? 'var(--primary-surface, rgba(16, 185, 129, 0.12))' : 'var(--fk-bg, #f8fafc)',
                        border: isSelected ? '2px solid #059669' : '1px solid var(--fk-border, #e2e8f0)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '4px' }}>
                        <strong style={{ fontSize: '14px', color: 'var(--fk-text, #0f172a)' }}>{b.crop}</strong>
                        <span
                          style={{
                            fontSize: '10.5px',
                            fontWeight: '700',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            background: statusMeta.bg,
                            color: statusMeta.color
                          }}
                        >
                          {statusMeta.label}
                        </span>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--fk-text-sub, #64748b)', fontFamily: 'monospace' }}>
                        {b.batchId}
                      </div>
                      <div style={{ fontSize: '11.5px', color: 'var(--fk-text-muted, #94a3b8)', marginTop: '4px' }}>
                        {b.location} · {b.landAcres} Acres
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </PremiumCard>
        </div>

        {/* Right Column: Selected Batch Digital Passport & Chain Timeline */}
        {selected ? (
          <div>
            {/* Passport Identity Card with Live QR Code */}
            <PremiumCard accentBorder style={{ padding: '24px', marginBottom: '20px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px', gap: '20px', alignItems: 'center' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                    <span style={{ fontSize: '22px' }}>📦</span>
                    <h2 style={{ margin: 0, fontSize: '20px', fontWeight: '900' }}>
                      {selected.crop} — {selected.grade}
                    </h2>
                  </div>

                  <div style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)', fontFamily: 'monospace', marginBottom: '14px' }}>
                    Passport UUID: <strong>{selected.batchId}</strong>
                  </div>

                  {/* Provenance Metadata Grid */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '13px' }}>
                    <div>
                      <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Farmer / Owner:</span>{' '}
                      <strong>{selected.farmerName}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Farm Location:</span>{' '}
                      <strong>{selected.location}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Land Parcel:</span>{' '}
                      <strong>{selected.landAcres} Acres</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Irrigation System:</span>{' '}
                      <strong>{selected.irrigationType}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Soil Classification:</span>{' '}
                      <strong>{selected.soilType}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Expected Harvest:</span>{' '}
                      <strong>{selected.harvestDateExpected}</strong>
                    </div>
                  </div>

                  {/* Export Certification Tags */}
                  <div style={{ display: 'flex', gap: '6px', marginTop: '14px', flexWrap: 'wrap' }}>
                    {['NPOP Organic Certified', 'GlobalGAP Compliant', 'Zero Chemical Residue', 'APEDA Registered'].map((badge) => (
                      <span
                        key={badge}
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          background: '#dcfce7',
                          color: '#166534',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px'
                        }}
                      >
                        <Check size={12} /> {badge}
                      </span>
                    ))}
                  </div>
                </div>

                {/* QR Code Container */}
                <div style={{ textAlign: 'center' }}>
                  <div
                    style={{
                      background: '#ffffff',
                      padding: '10px',
                      borderRadius: '12px',
                      border: '1px solid var(--fk-border, #cbd5e1)',
                      boxShadow: '0 4px 6px -1px rgba(0,0,0,0.06)',
                      display: 'inline-block'
                    }}
                  >
                    <img
                      src={qrUrl}
                      alt="Verifiable Batch QR"
                      style={{ width: '150px', height: '150px', display: 'block' }}
                    />
                  </div>
                  <div style={{ marginTop: '8px', display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    <button
                      onClick={copyQrLink}
                      style={{
                        padding: '5px 10px',
                        borderRadius: '6px',
                        border: '1px solid var(--fk-border, #cbd5e1)',
                        background: 'var(--fk-card, #ffffff)',
                        color: 'var(--fk-text, #0f172a)',
                        fontSize: '11px',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      {copied ? <Check size={12} color="#059669" /> : <Copy size={12} />}
                      {copied ? 'Copied' : 'Copy URL'}
                    </button>
                  </div>
                </div>
              </div>
            </PremiumCard>

            {/* Chain of Custody Timeline */}
            <PremiumCard style={{ padding: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Layers size={18} color="#059669" />
                  <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>
                    Chain-of-Custody Immutable Timeline
                  </h3>
                </div>

                <button
                  onClick={() => setShowCheckpoint(true)}
                  style={{
                    padding: '7px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontSize: '12.5px',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                >
                  <Plus size={14} /> Add Milestones
                </button>
              </div>

              {/* Timeline Items */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
                {selected.timeline?.map((step, idx) => {
                  const isLast = idx === selected.timeline.length - 1;

                  return (
                    <div key={idx} style={{ display: 'flex', gap: '14px', position: 'relative' }}>
                      {/* Left icon & vertical line */}
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '50%',
                            background: '#dcfce7',
                            color: '#166534',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '14px',
                            flexShrink: 0
                          }}
                        >
                          <CheckCircle2 size={18} />
                        </div>
                        {!isLast && (
                          <div
                            style={{
                              width: '2px',
                              flex: 1,
                              background: 'var(--fk-border, #e2e8f0)',
                              margin: '4px 0'
                            }}
                          />
                        )}
                      </div>

                      {/* Content */}
                      <div style={{ paddingBottom: '20px', flex: 1 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                          <strong style={{ fontSize: '14.5px', color: 'var(--fk-text, #0f172a)' }}>
                            {step.stage}
                          </strong>
                          <span style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)' }}>
                            {step.date}
                          </span>
                        </div>

                        <p style={{ margin: '0 0 6px 0', fontSize: '13px', color: 'var(--fk-text-sub, #64748b)', lineHeight: '1.45' }}>
                          {step.details}
                        </p>

                        <div style={{ display: 'flex', gap: '14px', fontSize: '12px', color: 'var(--fk-text-muted, #94a3b8)' }}>
                          <span>👤 Verified by: <strong>{step.actor}</strong></span>
                          <span>📍 Geotag: {step.geoTag ? `${step.geoTag.lat}°N, ${step.geoTag.lon}°E` : 'GPS Verified'}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </PremiumCard>
          </div>
        ) : (
          <PremiumCard style={{ textAlign: 'center', padding: '40px' }}>
            <div style={{ fontSize: '32px', marginBottom: '8px' }}>📦</div>
            <div style={{ fontWeight: '800', fontSize: '16px' }}>No Batch Selected</div>
            <div style={{ color: 'var(--fk-text-sub, #64748b)', fontSize: '13px', marginTop: '4px' }}>
              Select a crop batch from the left column or create a new batch.
            </div>
          </PremiumCard>
        )}
      </div>

      {/* Modal 1: Register New Crop Batch */}
      {showCreate && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            style={{
              background: 'var(--fk-card, #ffffff)',
              color: 'var(--fk-text, #0f172a)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '520px',
              border: '1px solid var(--fk-border, #cbd5e1)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Register New Crop Batch</h3>
              <button
                onClick={() => setShowCreate(false)}
                style={{ background: 'none', border: 'none', color: 'var(--fk-text-sub, #64748b)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={createBatch}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    FARMER NAME
                  </label>
                  <input
                    type="text"
                    required
                    value={newBatch.farmerName}
                    onChange={(e) => setNewBatch({ ...newBatch, farmerName: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--fk-border, #cbd5e1)',
                      background: 'var(--fk-bg, #f8fafc)',
                      color: 'var(--fk-text, #0f172a)',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    CROP & VARIETY
                  </label>
                  <input
                    type="text"
                    required
                    value={newBatch.crop}
                    onChange={(e) => setNewBatch({ ...newBatch, crop: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--fk-border, #cbd5e1)',
                      background: 'var(--fk-bg, #f8fafc)',
                      color: 'var(--fk-text, #0f172a)',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    LAND ACRES
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    required
                    value={newBatch.landAcres}
                    onChange={(e) => setNewBatch({ ...newBatch, landAcres: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--fk-border, #cbd5e1)',
                      background: 'var(--fk-bg, #f8fafc)',
                      color: 'var(--fk-text, #0f172a)',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    TARGET HARVEST DATE
                  </label>
                  <input
                    type="date"
                    required
                    value={newBatch.harvestDateExpected}
                    onChange={(e) => setNewBatch({ ...newBatch, harvestDateExpected: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--fk-border, #cbd5e1)',
                      background: 'var(--fk-bg, #f8fafc)',
                      color: 'var(--fk-text, #0f172a)',
                      fontSize: '13px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  LOCATION & MANDAL
                </label>
                <input
                  type="text"
                  required
                  value={newBatch.location}
                  onChange={(e) => setNewBatch({ ...newBatch, location: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--fk-border, #cbd5e1)',
                    background: 'var(--fk-bg, #f8fafc)',
                    color: 'var(--fk-text, #0f172a)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
                <button
                  type="button"
                  onClick={() => setShowCreate(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--fk-border, #cbd5e1)',
                    background: 'var(--fk-bg, #f8fafc)',
                    color: 'var(--fk-text, #0f172a)',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Register Batch Passport
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal 2: Add Chain Checkpoint */}
      {showCheckpoint && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0, 0, 0, 0.65)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '16px',
            backdropFilter: 'blur(4px)'
          }}
        >
          <div
            style={{
              background: 'var(--fk-card, #ffffff)',
              color: 'var(--fk-text, #0f172a)',
              borderRadius: '16px',
              padding: '24px',
              width: '100%',
              maxWidth: '500px',
              border: '1px solid var(--fk-border, #cbd5e1)',
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Add Chain Checkpoint</h3>
              <button
                onClick={() => setShowCheckpoint(false)}
                style={{ background: 'none', border: 'none', color: 'var(--fk-text-sub, #64748b)', cursor: 'pointer' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={addCheckpoint}>
              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  OPERATIONAL STAGE
                </label>
                <select
                  value={checkpoint.stage}
                  onChange={(e) => setCheckpoint({ ...checkpoint, stage: e.target.value })}
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
                  {STAGES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '12px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  INSPECTOR / ACTOR NAME
                </label>
                <input
                  type="text"
                  required
                  value={checkpoint.actor}
                  onChange={(e) => setCheckpoint({ ...checkpoint, actor: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--fk-border, #cbd5e1)',
                    background: 'var(--fk-bg, #f8fafc)',
                    color: 'var(--fk-text, #0f172a)',
                    fontSize: '13px',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                  OBSERVATIONS / LAB LOGS
                </label>
                <textarea
                  rows="3"
                  required
                  value={checkpoint.details}
                  onChange={(e) => setCheckpoint({ ...checkpoint, details: e.target.value })}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--fk-border, #cbd5e1)',
                    background: 'var(--fk-bg, #f8fafc)',
                    color: 'var(--fk-text, #0f172a)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                    fontFamily: 'inherit'
                  }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  onClick={() => setShowCheckpoint(false)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '1px solid var(--fk-border, #cbd5e1)',
                    background: 'var(--fk-bg, #f8fafc)',
                    color: 'var(--fk-text, #0f172a)',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: '700',
                    cursor: 'pointer'
                  }}
                >
                  Record Milestone
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
