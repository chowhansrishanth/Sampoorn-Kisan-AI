import { useState, useMemo, useEffect } from 'react';
import axios from '../api/client';
import useApiResource from '../hooks/useApiResource';
import PageHeader from '../components/ui/PageHeader';
import PremiumCard from '../components/ui/PremiumCard';
import { StatCard } from '../components/ui/StatCard';
import {
  Tractor,
  Sparkles,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Calculator,
  Search,
  Calendar,
  DollarSign,
  X,
  Clock,
  ArrowRight,
  Info,
  Check,
  Zap
} from 'lucide-react';

const CATEGORY_META = {
  'All': { icon: '🚜', color: '#10b981' },
  'Land Preparation': { icon: '🚜', color: '#f59e0b' },
  'Sowing & Planting': { icon: '🌱', color: '#22c55e' },
  'Harvesting': { icon: '🌾', color: '#f97316' },
  'Drone Spray Services': { icon: '🚁', color: '#06b6d4' },
  'Inter-Cultivation': { icon: '⚙️', color: '#8b5cf6' },
  'Pest Management': { icon: '💧', color: '#3b82f6' },
};

export default function HireCenter({ user }) {
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('dist'); // 'dist' | 'rate' | 'name'
  const [estimate, setEstimate] = useState(null);
  const [estimating, setEstimating] = useState(false);
  const [estForm, setEstForm] = useState({
    machineId: 'tractor_55hp',
    acres: user?.farmProfile?.land?.sizeAcres || 2,
    hours: 0,
  });

  // Booking Modal State
  const [bookingMachine, setBookingMachine] = useState(null);
  const [bookingForm, setBookingForm] = useState({
    farmerName: user?.name || '',
    phone: user?.phone || '',
    location: user?.location || '',
    date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    acres: 2,
    hours: 2,
    notes: '',
  });
  const [bookingConfirmed, setBookingConfirmed] = useState(null);

  // Fetch catalog & categories
  const categoriesRes = useApiResource({ url: '/api/hire/categories' });
  const { data, loading, error, reload } = useApiResource({
    url: '/api/hire/machinery',
    params: activeCategory === 'All' ? {} : { category: activeCategory },
  });

  const machineryList = data?.machinery || [];
  const categories = categoriesRes.data?.categories || [
    'All',
    'Land Preparation',
    'Sowing & Planting',
    'Harvesting',
    'Drone Spray Services',
    'Inter-Cultivation',
    'Pest Management',
  ];

  // Auto-select initial machine for estimator if available
  useEffect(() => {
    if (machineryList.length > 0 && !machineryList.find((m) => m.id === estForm.machineId)) {
      setEstForm((prev) => ({ ...prev, machineId: machineryList[0].id }));
    }
  }, [machineryList]);

  // Instant or API cost calculation
  const runEstimate = async (machineId = estForm.machineId) => {
    setEstimating(true);
    try {
      const targetId = machineId || estForm.machineId || machineryList[0]?.id;
      const res = await axios.post('/api/hire/estimate', {
        machineId: targetId,
        acres: Number(estForm.acres) || 1,
        hours: Number(estForm.hours) || 0,
      });
      setEstimate(res.data);
    } catch {
      // Fallback in-browser calculation
      const target = machineryList.find((m) => m.id === (machineId || estForm.machineId));
      if (target) {
        const acresCost = (Number(estForm.acres) || 1) * target.ratePerAcre;
        const hoursCost = Math.max(Number(estForm.hours) || 0, target.minHours) * target.ratePerHour;
        const rental = Math.max(acresCost, hoursCost);
        const fuel = Math.round(target.distKm * 18);
        setEstimate({
          machine: target.name,
          operator: target.operator,
          contactPhone: target.contactPhone,
          acres: Number(estForm.acres) || 1,
          estimatedHours: Number(estForm.hours) || Math.ceil((Number(estForm.acres) || 1) / 4),
          rentalCost: rental,
          fuelSurcharge: fuel,
          totalEstimate: rental + fuel,
          perAcreEffectiveCost: Math.round((rental + fuel) / Math.max(Number(estForm.acres) || 1, 1)),
          laborSavingPercent: target.category === 'Drone Spray Services' ? 85 : target.category === 'Harvesting' ? 90 : 60,
          timeSavingDays: target.category === 'Harvesting' ? Math.ceil((Number(estForm.acres) || 1) / 8) : null,
        });
      }
    } finally {
      setEstimating(false);
    }
  };

  // Run initial estimate once machinery loads
  useEffect(() => {
    if (machineryList.length > 0 && !estimate) {
      runEstimate(machineryList[0].id);
    }
  }, [machineryList]);

  // Filter & sort machinery
  const filteredMachinery = useMemo(() => {
    return machineryList
      .filter((m) => {
        const matchesCategory = activeCategory === 'All' || m.category === activeCategory;
        const matchesSearch =
          !searchQuery.trim() ||
          m.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
          m.operator.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => {
        if (sortBy === 'dist') return a.distKm - b.distKm;
        if (sortBy === 'rate') return a.ratePerAcre - b.ratePerAcre;
        if (sortBy === 'name') return a.name.localeCompare(b.name);
        return 0;
      });
  }, [machineryList, activeCategory, searchQuery, sortBy]);

  const fmt = (n) => (n !== undefined && n !== null ? n.toLocaleString('en-IN') : '—');

  const openBookingModal = (machine) => {
    setBookingMachine(machine);
    setBookingConfirmed(null);
    setBookingForm((prev) => ({
      ...prev,
      farmerName: prev.farmerName || user?.name || 'Farmer',
      phone: prev.phone || user?.phone || '',
      location: prev.location || user?.location || 'My Farm',
    }));
  };

  const handleConfirmBooking = (e) => {
    e.preventDefault();
    const bookingRef = `CHC-${Math.floor(100000 + Math.random() * 900000)}`;
    setBookingConfirmed({
      reference: bookingRef,
      machine: bookingMachine.name,
      operator: bookingMachine.operator,
      phone: bookingMachine.contactPhone,
      date: bookingForm.date,
      acres: bookingForm.acres,
      estCost: (bookingMachine.ratePerAcre * Number(bookingForm.acres)) + Math.round(bookingMachine.distKm * 18),
    });
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem', color: 'var(--fk-text, #0f172a)' }}>
      {/* Universal Page Header */}
      <PageHeader
        badge="GOVERNMENT CUSTOM HIRING CENTER (CHC) & DRONE FLEET"
        icon={Tractor}
        title="Custom Hiring Center & Agricultural Drone Hub"
        subtitle="Access high-power tractors, laser levelers, combine harvesters, and DGCA-certified drone sprayers at government-regulated hourly & per-acre tariffs."
        action={
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={() => {
                const el = document.getElementById('quick-estimator-section');
                if (el) el.scrollIntoView({ behavior: 'smooth' });
              }}
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
                cursor: 'pointer',
              }}
            >
              <Calculator size={15} /> Instant Cost Estimator
            </button>
          </div>
        }
      />

      {/* KPI Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard
          icon={Tractor}
          title="Available Machinery"
          value={machineryList.length || '8+'}
          unit="Units Ready"
          subtitle="Tractors, Drills & Harvesters"
          color="#059669"
        />
        <StatCard
          icon={Zap}
          title="Drone Spray Fleet"
          value="10L / 16L"
          unit="DJI & XAG"
          subtitle="Precision nano-urea & pest spray"
          trend="85% Labor Saved"
          trendType="up"
          color="#0284c7"
        />
        <StatCard
          icon={ShieldCheck}
          title="Subsidized Tariffs"
          value="40%–50%"
          unit="SMAM Govt Aid"
          subtitle="Sub-Mission on Agri Mechanization"
          color="#f59e0b"
        />
        <StatCard
          icon={MapPin}
          title="Max Delivery Radius"
          value="< 12"
          unit="Kilometres"
          subtitle="Direct to your field boundary"
          color="#8b5cf6"
        />
      </div>

      {/* SMAM Government Subsidy & Guarantee Banner */}
      <div
        style={{
          background: 'var(--primary-surface, rgba(16, 185, 129, 0.08))',
          border: '1px solid var(--primary-border, rgba(16, 185, 129, 0.25))',
          borderRadius: '12px',
          padding: '14px 18px',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '24px' }}>🛡️</span>
          <div>
            <div style={{ fontWeight: '700', fontSize: '14px', color: 'var(--fk-text, #0f172a)' }}>
              Subsidized Agricultural Mechanization (SMAM & CHC Guarantee)
            </div>
            <div style={{ fontSize: '13px', color: 'var(--fk-text-sub, #64748b)' }}>
              All machines are maintained by registered farmer cooperatives & Custom Hiring Centers. Operators are verified and certified with GPS tracking.
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#dcfce7',
              color: '#166534',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Check size={14} /> Fuel Surcharge Capped @ ₹18/km
          </span>
          <span
            style={{
              fontSize: '12px',
              fontWeight: '700',
              padding: '4px 10px',
              borderRadius: '6px',
              background: '#e0f2fe',
              color: '#0369a1',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <ShieldCheck size={14} /> Full Transit Insurance
          </span>
        </div>
      </div>

      {/* Main Grid: Machinery Catalog (Left) + Quick Cost Estimator (Right) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Filters + Machinery Cards */}
        <div>
          {/* Search & Category Pills */}
          <div style={{ marginBottom: '16px' }}>
            {/* Search + Sort Bar */}
            <div style={{ display: 'flex', gap: '10px', marginBottom: '12px', flexWrap: 'wrap' }}>
              <div style={{ position: 'relative', flex: 1, minWidth: '220px' }}>
                <Search
                  size={16}
                  style={{
                    position: 'absolute',
                    left: '12px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    color: 'var(--fk-text-muted, #94a3b8)',
                  }}
                />
                <input
                  type="text"
                  placeholder="Search machine, drone, or operator..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px 9px 36px',
                    borderRadius: '8px',
                    border: '1px solid var(--fk-border, #e2e8f0)',
                    background: 'var(--fk-card, #ffffff)',
                    color: 'var(--fk-text, #0f172a)',
                    fontSize: '13px',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                style={{
                  padding: '9px 14px',
                  borderRadius: '8px',
                  border: '1px solid var(--fk-border, #e2e8f0)',
                  background: 'var(--fk-card, #ffffff)',
                  color: 'var(--fk-text, #0f172a)',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: 'pointer',
                }}
              >
                <option value="dist">Sort: Nearest Distance</option>
                <option value="rate">Sort: Lowest Tariff</option>
                <option value="name">Sort: Machine Name</option>
              </select>
            </div>

            {/* Category Filter Pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {categories.map((cat) => {
                const isSelected = activeCategory === cat;
                const meta = CATEGORY_META[cat] || { icon: '🔧', color: '#6366f1' };
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveCategory(cat)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '20px',
                      border: isSelected ? `2px solid ${meta.color}` : '1px solid var(--fk-border, #e2e8f0)',
                      background: isSelected ? `${meta.color}15` : 'var(--fk-card, #ffffff)',
                      color: isSelected ? meta.color : 'var(--fk-text-sub, #64748b)',
                      fontWeight: isSelected ? '700' : '500',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      transition: 'all 0.15s ease',
                    }}
                  >
                    <span>{meta.icon}</span>
                    <span>{cat}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Catalog Cards Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--fk-text-sub, #64748b)' }}>
              Loading machinery and drone fleet...
            </div>
          ) : error ? (
            <div style={{ textAlign: 'center', padding: '30px', color: '#ef4444' }}>
              Failed to load machinery catalog: {error}
            </div>
          ) : filteredMachinery.length === 0 ? (
            <PremiumCard style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>No machines found</div>
              <div style={{ color: 'var(--fk-text-sub, #64748b)', fontSize: '13px', marginTop: '4px' }}>
                Try adjusting your category filter or search query.
              </div>
            </PremiumCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '16px' }}>
              {filteredMachinery.map((m) => {
                const meta = CATEGORY_META[m.category] || { icon: '🔧', color: '#10b981' };
                const isDrone = m.category === 'Drone Spray Services';

                return (
                  <PremiumCard
                    key={m.id}
                    hoverable
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      borderTop: `3px solid ${meta.color}`,
                    }}
                  >
                    <div>
                      {/* Top Header: Category & Availability */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: `${meta.color}15`,
                            color: meta.color,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          {meta.icon} {m.category}
                        </span>

                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: '700',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            background: '#dcfce7',
                            color: '#166534',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#22c55e' }} />
                          Ready for Hire
                        </span>
                      </div>

                      {/* Name & Distance */}
                      <h3 style={{ margin: '0 0 6px 0', fontSize: '16px', fontWeight: '800', lineHeight: '1.3' }}>
                        {m.name}
                      </h3>

                      <p style={{ margin: '0 0 12px 0', fontSize: '12.5px', color: 'var(--fk-text-sub, #64748b)', lineHeight: '1.45' }}>
                        {m.description}
                      </p>

                      {/* Distance & Operator badge */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'var(--fk-bg, #f8fafc)',
                          marginBottom: '12px',
                          fontSize: '12px',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <MapPin size={13} color="#059669" />
                          <strong style={{ color: 'var(--fk-text, #0f172a)' }}>{m.distKm} km away</strong>
                        </div>
                        <div style={{ color: 'var(--fk-text-sub, #64748b)' }}>
                          👤 {m.operator}
                        </div>
                      </div>

                      {/* Dual Pricing Boxes */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '14px' }}>
                        <div
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(16, 185, 129, 0.08)',
                            border: '1px solid rgba(16, 185, 129, 0.18)',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: '#047857', fontWeight: '700' }}>PER ACRE RATE</div>
                          <div style={{ fontSize: '17px', fontWeight: '800', color: '#047857', marginTop: '2px' }}>
                            ₹{fmt(m.ratePerAcre)}
                          </div>
                        </div>

                        <div
                          style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(2, 132, 199, 0.08)',
                            border: '1px solid rgba(2, 132, 199, 0.18)',
                            textAlign: 'center',
                          }}
                        >
                          <div style={{ fontSize: '11px', color: '#0284c7', fontWeight: '700' }}>PER HOUR RATE</div>
                          <div style={{ fontSize: '17px', fontWeight: '800', color: '#0284c7', marginTop: '2px' }}>
                            ₹{fmt(m.ratePerHour)}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                      <button
                        onClick={() => {
                          setEstForm((prev) => ({ ...prev, machineId: m.id }));
                          runEstimate(m.id);
                          const el = document.getElementById('quick-estimator-section');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: '1px solid var(--fk-border, #cbd5e1)',
                          background: 'var(--fk-card, #ffffff)',
                          color: 'var(--fk-text, #0f172a)',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Calculate ₹
                      </button>

                      <button
                        onClick={() => openBookingModal(m)}
                        style={{
                          flex: 1,
                          padding: '8px',
                          borderRadius: '8px',
                          border: 'none',
                          background: isDrone ? 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)' : 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                          color: '#fff',
                          fontWeight: '700',
                          fontSize: '12px',
                          cursor: 'pointer',
                        }}
                      >
                        Book Machine
                      </button>
                    </div>
                  </PremiumCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Quick Cost Estimator */}
        <div id="quick-estimator-section" style={{ position: 'sticky', top: '24px' }}>
          <PremiumCard accentBorder style={{ padding: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <Calculator size={18} color="#059669" />
              <h3 style={{ margin: 0, fontSize: '16px', fontWeight: '800' }}>Job Cost Estimator</h3>
            </div>

            <p style={{ margin: '0 0 16px 0', fontSize: '12.5px', color: 'var(--fk-text-sub, #64748b)' }}>
              Calculate total rental expense including fuel surcharge and labor savings before booking.
            </p>

            {/* Select Machine */}
            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>
                SELECT MACHINERY / DRONE
              </label>
              <select
                value={estForm.machineId}
                onChange={(e) => {
                  setEstForm((prev) => ({ ...prev, machineId: e.target.value }));
                  runEstimate(e.target.value);
                }}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid var(--fk-border, #cbd5e1)',
                  background: 'var(--fk-bg, #f8fafc)',
                  color: 'var(--fk-text, #0f172a)',
                  fontSize: '13px',
                  fontWeight: '600',
                }}
              >
                {machineryList.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name} (₹{fmt(m.ratePerAcre)}/ac)
                  </option>
                ))}
              </select>
            </div>

            {/* Acres & Hours Controls */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>
                  FARM ACRES
                </label>
                <input
                  type="number"
                  min="0.5"
                  step="0.5"
                  value={estForm.acres}
                  onChange={(e) => setEstForm((prev) => ({ ...prev, acres: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--fk-border, #cbd5e1)',
                    background: 'var(--fk-bg, #f8fafc)',
                    color: 'var(--fk-text, #0f172a)',
                    fontSize: '13px',
                    fontWeight: '700',
                    boxSizing: 'border-box',
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '5px' }}>
                  HOURS (OPTIONAL)
                </label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="Auto"
                  value={estForm.hours}
                  onChange={(e) => setEstForm((prev) => ({ ...prev, hours: e.target.value }))}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    border: '1px solid var(--fk-border, #cbd5e1)',
                    background: 'var(--fk-bg, #f8fafc)',
                    color: 'var(--fk-text, #0f172a)',
                    fontSize: '13px',
                    fontWeight: '700',
                    boxSizing: 'border-box',
                  }}
                />
              </div>
            </div>

            <button
              onClick={() => runEstimate()}
              disabled={estimating}
              style={{
                width: '100%',
                padding: '10px',
                borderRadius: '8px',
                border: 'none',
                background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                color: '#fff',
                fontWeight: '700',
                fontSize: '13px',
                cursor: 'pointer',
                marginBottom: '16px',
              }}
            >
              {estimating ? 'Calculating...' : 'Re-calculate Quotation'}
            </button>

            {/* Estimate Result Card */}
            {estimate && (
              <div
                style={{
                  background: 'var(--fk-bg, #f8fafc)',
                  borderRadius: '12px',
                  border: '1px solid var(--fk-border, #e2e8f0)',
                  padding: '14px',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '10px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: 'var(--fk-text-sub, #64748b)' }}>
                    TOTAL ESTIMATED COST
                  </span>
                  <span style={{ fontSize: '22px', fontWeight: '900', color: '#059669', fontFamily: 'Outfit, sans-serif' }}>
                    ₹{fmt(estimate.totalEstimate)}
                  </span>
                </div>

                <div style={{ borderTop: '1px dashed var(--fk-border, #cbd5e1)', paddingTop: '10px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Base Rental Cost:</span>
                    <strong>₹{fmt(estimate.rentalCost)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Transport Surcharge:</span>
                    <strong>₹{fmt(estimate.fuelSurcharge)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Effective Cost / Acre:</span>
                    <strong style={{ color: '#059669' }}>₹{fmt(estimate.perAcreEffectiveCost)}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Estimated Work Time:</span>
                    <strong>{estimate.estimatedHours} hrs</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '6px', color: '#059669', fontWeight: '700' }}>
                    <span>Labor Cost Saving:</span>
                    <span>{estimate.laborSavingPercent}% Saved</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    const target = machineryList.find((m) => m.id === estForm.machineId);
                    if (target) openBookingModal(target);
                  }}
                  style={{
                    width: '100%',
                    marginTop: '12px',
                    padding: '9px',
                    borderRadius: '8px',
                    border: 'none',
                    background: '#0f172a',
                    color: '#ffffff',
                    fontWeight: '700',
                    fontSize: '12.5px',
                    cursor: 'pointer',
                  }}
                >
                  Book This Machine Now →
                </button>
              </div>
            )}
          </PremiumCard>
        </div>
      </div>

      {/* Booking Dialog Modal */}
      {bookingMachine && (
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
            backdropFilter: 'blur(4px)',
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
              boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Tractor size={20} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '17px', fontWeight: '800' }}>Confirm Machinery Booking</h3>
              </div>
              <button
                onClick={() => setBookingMachine(null)}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--fk-text-sub, #64748b)',
                  cursor: 'pointer',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            {bookingConfirmed ? (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div
                  style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: '#dcfce7',
                    color: '#166534',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 14px',
                  }}
                >
                  <CheckCircle2 size={32} />
                </div>
                <h4 style={{ margin: '0 0 6px 0', fontSize: '18px', fontWeight: '800' }}>Booking Registered!</h4>
                <div style={{ fontSize: '13px', color: 'var(--fk-text-sub, #64748b)', marginBottom: '16px' }}>
                  Booking Reference: <strong style={{ color: '#059669' }}>{bookingConfirmed.reference}</strong>
                </div>

                <div
                  style={{
                    background: 'var(--fk-bg, #f8fafc)',
                    borderRadius: '10px',
                    padding: '14px',
                    textAlign: 'left',
                    fontSize: '13px',
                    marginBottom: '20px',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Equipment:</span>
                    <strong>{bookingConfirmed.machine}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>CHC Operator:</span>
                    <strong>{bookingConfirmed.operator}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Contact Phone:</span>
                    <strong>{bookingConfirmed.phone}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Scheduled Date:</span>
                    <strong>{bookingConfirmed.date}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--fk-text-sub, #64748b)' }}>Estimated Cost:</span>
                    <strong style={{ color: '#059669' }}>₹{fmt(bookingConfirmed.estCost)}</strong>
                  </div>
                </div>

                <p style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)', margin: '0 0 20px 0' }}>
                  The CHC supervisor will call you within 2 hours to confirm GPS coordinates and arrival schedule.
                </p>

                <button
                  onClick={() => setBookingMachine(null)}
                  style={{
                    width: '100%',
                    padding: '10px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                    color: '#fff',
                    fontWeight: '700',
                    fontSize: '14px',
                    cursor: 'pointer',
                  }}
                >
                  Done
                </button>
              </div>
            ) : (
              <form onSubmit={handleConfirmBooking}>
                <div style={{ background: 'var(--fk-bg, #f8fafc)', padding: '10px 14px', borderRadius: '10px', marginBottom: '14px' }}>
                  <div style={{ fontSize: '14px', fontWeight: '800' }}>{bookingMachine.name}</div>
                  <div style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)' }}>
                    ₹{fmt(bookingMachine.ratePerAcre)} / acre · Operator: {bookingMachine.operator}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      FARMER NAME
                    </label>
                    <input
                      type="text"
                      required
                      value={bookingForm.farmerName}
                      onChange={(e) => setBookingForm({ ...bookingForm, farmerName: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--fk-border, #cbd5e1)',
                        background: 'var(--fk-bg, #f8fafc)',
                        color: 'var(--fk-text, #0f172a)',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      MOBILE NUMBER
                    </label>
                    <input
                      type="tel"
                      required
                      value={bookingForm.phone}
                      onChange={(e) => setBookingForm({ ...bookingForm, phone: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--fk-border, #cbd5e1)',
                        background: 'var(--fk-bg, #f8fafc)',
                        color: 'var(--fk-text, #0f172a)',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      SCHEDULED DATE
                    </label>
                    <input
                      type="date"
                      required
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({ ...bookingForm, date: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--fk-border, #cbd5e1)',
                        background: 'var(--fk-bg, #f8fafc)',
                        color: 'var(--fk-text, #0f172a)',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>

                  <div>
                    <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                      LAND SIZE (ACRES)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      step="0.5"
                      required
                      value={bookingForm.acres}
                      onChange={(e) => setBookingForm({ ...bookingForm, acres: e.target.value })}
                      style={{
                        width: '100%',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        border: '1px solid var(--fk-border, #cbd5e1)',
                        background: 'var(--fk-bg, #f8fafc)',
                        color: 'var(--fk-text, #0f172a)',
                        fontSize: '13px',
                        boxSizing: 'border-box',
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '12px', fontWeight: '700', marginBottom: '4px' }}>
                    FARM LOCATION / LANDMARK
                  </label>
                  <input
                    type="text"
                    required
                    value={bookingForm.location}
                    onChange={(e) => setBookingForm({ ...bookingForm, location: e.target.value })}
                    placeholder="Village, survey no. or landmark"
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: '1px solid var(--fk-border, #cbd5e1)',
                      background: 'var(--fk-bg, #f8fafc)',
                      color: 'var(--fk-text, #0f172a)',
                      fontSize: '13px',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button
                    type="button"
                    onClick={() => setBookingMachine(null)}
                    style={{
                      flex: 1,
                      padding: '10px',
                      borderRadius: '8px',
                      border: '1px solid var(--fk-border, #cbd5e1)',
                      background: 'var(--fk-bg, #f8fafc)',
                      color: 'var(--fk-text, #0f172a)',
                      fontWeight: '700',
                      cursor: 'pointer',
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
                      cursor: 'pointer',
                    }}
                  >
                    Send Booking Request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
