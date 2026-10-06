import { useState, useEffect, useMemo } from 'react';
import axios from '../api/client';
import PageHeader from '../components/ui/PageHeader';
import PremiumCard from '../components/ui/PremiumCard';
import { StatCard } from '../components/ui/StatCard';
import {
  FlaskConical,
  ShieldCheck,
  AlertTriangle,
  XCircle,
  CheckCircle2,
  Search,
  Check,
  X,
  Droplets,
  HelpCircle,
  Info,
  Layers,
  Sparkles,
  Zap
} from 'lucide-react';

const CATEGORY_COLORS = {
  all: '#6366f1',
  insecticide: '#f97316',
  fungicide: '#8b5cf6',
  herbicide: '#ef4444',
  foliar_fertilizer: '#10b981'
};

const CATEGORY_ICONS = {
  all: '🧪',
  insecticide: '🐛',
  fungicide: '🍄',
  herbicide: '🌿',
  foliar_fertilizer: '💧'
};

export default function TankMixChecker() {
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState([]);
  const [result, setResult] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);

  // Fetch product catalog on mount
  useEffect(() => {
    setLoading(true);
    axios
      .get('/api/tank-mix/products')
      .then((res) => {
        setProducts(res.data.products || []);
      })
      .catch(() => {
        // Fallback default products
        setProducts([
          { id: 'chlorpyrifos', name: 'Chlorpyrifos 20% EC', category: 'insecticide', activeIngredient: 'Chlorpyrifos', formulation: 'EC', pH: 'neutral' },
          { id: 'imidacloprid', name: 'Imidacloprid 17.8 SL', category: 'insecticide', activeIngredient: 'Imidacloprid', formulation: 'SL', pH: 'acidic' },
          { id: 'spinosad', name: 'Spinosad 45 SC', category: 'insecticide', activeIngredient: 'Spinosad', formulation: 'SC', pH: 'neutral' },
          { id: 'mancozeb', name: 'Mancozeb 75 WP', category: 'fungicide', activeIngredient: 'Mancozeb', formulation: 'WP', pH: 'neutral' },
          { id: 'carbendazim', name: 'Carbendazim 50 WP', category: 'fungicide', activeIngredient: 'Carbendazim', formulation: 'WP', pH: 'acidic' },
          { id: 'azoxystrobin', name: 'Azoxystrobin 23 SC', category: 'fungicide', activeIngredient: 'Azoxystrobin', formulation: 'SC', pH: 'neutral' },
          { id: 'copper_oxychloride', name: 'Copper Oxychloride 50 WP', category: 'fungicide', activeIngredient: 'Copper Oxychloride', formulation: 'WP', pH: 'alkaline' },
          { id: 'glyphosate', name: 'Glyphosate 41 SL', category: 'herbicide', activeIngredient: 'Glyphosate', formulation: 'SL', pH: 'acidic', note: 'Broad-spectrum — apply alone.' },
          { id: 'dap_foliar', name: 'DAP (Foliar Grade) 18-46-0', category: 'foliar_fertilizer', activeIngredient: 'Di-Ammonium Phosphate', formulation: 'WS', pH: 'acidic' },
          { id: 'nano_urea', name: 'Nano Urea (IFFCO Liquid)', category: 'foliar_fertilizer', activeIngredient: 'Nano Nitrogen Particles', formulation: 'suspension', pH: 'neutral' }
        ]);
      })
      .finally(() => setLoading(false));
  }, []);

  const toggleProduct = (id) => {
    setSelected((prev) => {
      const updated = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      return updated;
    });
  };

  const checkCompatibility = async (overrideSelected) => {
    const toCheck = overrideSelected || selected;
    if (toCheck.length < 2) return;

    setChecking(true);
    try {
      const res = await axios.post('/api/tank-mix/check', { productIds: toCheck });
      setResult(res.data);
    } catch (e) {
      alert(e.response?.data?.error || 'Tank mix compatibility check failed.');
    } finally {
      setChecking(false);
    }
  };

  // Re-check whenever selection changes (if 2 or more products)
  useEffect(() => {
    if (selected.length >= 2) {
      checkCompatibility(selected);
    } else {
      setResult(null);
    }
  }, [selected]);

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesCat = activeFilter === 'all' || p.category === activeFilter;
      const matchesSearch =
        !searchQuery.trim() ||
        p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.activeIngredient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCat && matchesSearch;
    });
  }, [products, activeFilter, searchQuery]);

  const selectedProductObjects = useMemo(() => {
    return selected.map((id) => products.find((p) => p.id === id)).filter(Boolean);
  }, [selected, products]);

  const getOverallBadge = (rating) => {
    if (rating?.includes('SAFE')) {
      return { label: 'SAFE TO MIX ✅', bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
    }
    if (rating?.includes('CAUTION')) {
      return { label: 'CAUTION REQUIRED ⚠️', bg: '#fef3c7', color: '#92400e', border: '#fde68a' };
    }
    return { label: 'CRITICAL INCOMPATIBILITY ❌', bg: '#fee2e2', color: '#991b1b', border: '#fecaca' };
  };

  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '1.5rem 1rem', color: 'var(--fk-text, #0f172a)' }}>
      {/* Universal Page Header */}
      <PageHeader
        badge="AGRO-CHEMICAL COMPATIBILITY & PHYTOTOXICITY RADAR"
        icon={FlaskConical}
        title="Agro-Chemical Tank-Mix Safety Checker"
        subtitle="Prevent chemical precipitation, equipment nozzle clogging, phytotoxic leaf scorching, and active-ingredient antagonism before spraying."
        action={
          selected.length > 0 && (
            <button
              onClick={() => {
                setSelected([]);
                setResult(null);
              }}
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
              <X size={15} /> Clear All ({selected.length})
            </button>
          )
        }
      />

      {/* Top Stat KPI Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginBottom: '24px' }}>
        <StatCard
          icon={FlaskConical}
          title="Products Selected"
          value={selected.length}
          unit="In Tank"
          subtitle={selected.length < 2 ? 'Select at least 2 to verify' : 'Mix verification active'}
          color="#8b5cf6"
        />
        <StatCard
          icon={ShieldCheck}
          title="Compatibility Rating"
          value={result ? (result.overallRating?.includes('SAFE') ? 'SAFE' : result.overallRating?.includes('CAUTION') ? 'CAUTION' : 'UNSAFE') : 'Ready'}
          unit={result?.overallRating ? 'Verified' : 'Pending'}
          subtitle={result?.criticalIssues?.length ? `${result.criticalIssues.length} Critical Issue(s)` : 'No precipitation conflict'}
          trend={result?.safe ? 'Compatible' : result ? 'High Risk' : undefined}
          trendType={result?.safe ? 'up' : 'down'}
          color={result?.safe ? '#059669' : result ? '#ef4444' : '#64748b'}
        />
        <StatCard
          icon={Droplets}
          title="Jar Test Requirement"
          value={result?.jarTestRequired ? 'Mandatory' : 'Standard'}
          unit="500 mL Trial"
          subtitle="Pre-mix trial test in glass container"
          color="#0284c7"
        />
        <StatCard
          icon={Layers}
          title="Mixing Protocol"
          value="WALES Order"
          unit="Gold Standard"
          subtitle="Water → Powders → Flowables → EC"
          color="#d97706"
        />
      </div>

      {/* Main Two-Column Layout */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px', alignItems: 'start' }}>
        
        {/* Left Column: Product Catalog & Selection */}
        <div>
          {/* Search Bar + Category Filters */}
          <div style={{ marginBottom: '16px' }}>
            <div style={{ position: 'relative', marginBottom: '10px' }}>
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--fk-text-muted, #94a3b8)'
                }}
              />
              <input
                type="text"
                placeholder="Search chemical by name, brand, or active ingredient (e.g. Mancozeb, Imidacloprid)..."
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
                  boxSizing: 'border-box'
                }}
              />
            </div>

            {/* Filter Tabs */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {['all', 'insecticide', 'fungicide', 'herbicide', 'foliar_fertilizer'].map((cat) => {
                const isSelected = activeFilter === cat;
                const color = CATEGORY_COLORS[cat];
                const icon = CATEGORY_ICONS[cat];
                return (
                  <button
                    key={cat}
                    onClick={() => setActiveFilter(cat)}
                    style={{
                      padding: '7px 14px',
                      borderRadius: '20px',
                      border: isSelected ? `2px solid ${color}` : '1px solid var(--fk-border, #e2e8f0)',
                      background: isSelected ? `${color}15` : 'var(--fk-card, #ffffff)',
                      color: isSelected ? color : 'var(--fk-text-sub, #64748b)',
                      fontWeight: isSelected ? '700' : '500',
                      cursor: 'pointer',
                      fontSize: '12.5px',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      textTransform: 'capitalize'
                    }}
                  >
                    <span>{icon}</span>
                    <span>{cat.replace(/_/g, ' ')}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Product Grid */}
          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--fk-text-sub, #64748b)' }}>
              Loading agro-chemical database...
            </div>
          ) : filteredProducts.length === 0 ? (
            <PremiumCard style={{ textAlign: 'center', padding: '40px' }}>
              <div style={{ fontSize: '32px', marginBottom: '8px' }}>🔍</div>
              <div style={{ fontWeight: '700', fontSize: '15px' }}>No chemicals found</div>
              <div style={{ color: 'var(--fk-text-sub, #64748b)', fontSize: '13px', marginTop: '4px' }}>
                Try adjusting your search query or category filter.
              </div>
            </PremiumCard>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '14px' }}>
              {filteredProducts.map((p) => {
                const isSelected = selected.includes(p.id);
                const color = CATEGORY_COLORS[p.category] || '#6366f1';
                const icon = CATEGORY_ICONS[p.category] || '🧪';

                return (
                  <PremiumCard
                    key={p.id}
                    hoverable
                    onClick={() => toggleProduct(p.id)}
                    style={{
                      cursor: 'pointer',
                      border: isSelected ? `2px solid ${color}` : '1px solid var(--fk-border, #e2e8f0)',
                      background: isSelected ? `${color}08` : 'var(--fk-card, #ffffff)',
                      position: 'relative',
                      padding: '16px',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    {/* Selected Checkmark Badge */}
                    {isSelected && (
                      <div
                        style={{
                          position: 'absolute',
                          top: '12px',
                          right: '12px',
                          width: '22px',
                          height: '22px',
                          borderRadius: '50%',
                          background: color,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '12px',
                          fontWeight: '800'
                        }}
                      >
                        ✓
                      </div>
                    )}

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{ fontSize: '20px' }}>{icon}</span>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          background: `${color}15`,
                          color,
                          textTransform: 'capitalize'
                        }}
                      >
                        {p.category.replace(/_/g, ' ')}
                      </span>
                      <span
                        style={{
                          fontSize: '10.5px',
                          fontWeight: '700',
                          padding: '2px 6px',
                          borderRadius: '4px',
                          background: 'var(--fk-bg, #f8fafc)',
                          color: 'var(--fk-text-sub, #64748b)'
                        }}
                      >
                        Form: {p.formulation}
                      </span>
                    </div>

                    <h4 style={{ margin: '0 0 6px 0', fontSize: '15px', fontWeight: '800', lineHeight: '1.3' }}>
                      {p.name}
                    </h4>

                    <div style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)', lineHeight: '1.4' }}>
                      <strong>Active:</strong> {p.activeIngredient}
                    </div>

                    {p.pH && (
                      <div style={{ fontSize: '11px', color: 'var(--fk-text-muted, #94a3b8)', marginTop: '4px' }}>
                        Solution Reaction: <span style={{ textTransform: 'capitalize' }}>{p.pH}</span>
                      </div>
                    )}

                    {p.note && (
                      <div
                        style={{
                          marginTop: '8px',
                          padding: '6px 8px',
                          borderRadius: '6px',
                          background: 'rgba(239, 68, 68, 0.08)',
                          color: '#dc2626',
                          fontSize: '11px',
                          lineHeight: '1.3'
                        }}
                      >
                        ⚠️ {p.note}
                      </div>
                    )}
                  </PremiumCard>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Tank Selection Tray & Real-Time Safety Report */}
        <div style={{ position: 'sticky', top: '24px' }}>
          {/* Selected Tray Card */}
          <PremiumCard accentBorder style={{ padding: '20px', marginBottom: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <FlaskConical size={18} color="#059669" />
                <h3 style={{ margin: 0, fontSize: '15.5px', fontWeight: '800' }}>Spray Tank Contents</h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: '700', color: '#059669' }}>
                {selected.length} Product(s)
              </span>
            </div>

            {selected.length === 0 ? (
              <div
                style={{
                  textAlign: 'center',
                  padding: '24px 12px',
                  background: 'var(--fk-bg, #f8fafc)',
                  borderRadius: '10px',
                  border: '1px dashed var(--fk-border, #cbd5e1)'
                }}
              >
                <div style={{ fontSize: '24px', marginBottom: '6px' }}>☝️</div>
                <div style={{ fontWeight: '700', fontSize: '13px' }}>Select 2 or more products</div>
                <div style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)', marginTop: '4px' }}>
                  Click on chemicals from the catalog on the left to check real-time tank compatibility.
                </div>
              </div>
            ) : (
              <div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '14px' }}>
                  {selectedProductObjects.map((prod) => {
                    const color = CATEGORY_COLORS[prod.category] || '#6366f1';
                    return (
                      <div
                        key={prod.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '8px 10px',
                          borderRadius: '8px',
                          background: 'var(--fk-bg, #f8fafc)',
                          border: '1px solid var(--fk-border, #e2e8f0)',
                          fontSize: '12.5px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: color }} />
                          <strong style={{ color: 'var(--fk-text, #0f172a)' }}>{prod.name}</strong>
                        </div>
                        <button
                          onClick={() => toggleProduct(prod.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            color: 'var(--fk-text-sub, #64748b)',
                            cursor: 'pointer',
                            padding: '2px 4px',
                            fontSize: '13px'
                          }}
                        >
                          ✕
                        </button>
                      </div>
                    );
                  })}
                </div>

                {checking && (
                  <div style={{ textAlign: 'center', padding: '10px', color: '#059669', fontSize: '12px', fontWeight: '700' }}>
                    Verifying chemical compatibility...
                  </div>
                )}
              </div>
            )}
          </PremiumCard>

          {/* Compatibility Report */}
          {result && (
            <PremiumCard style={{ padding: '20px', borderTop: result.safe ? '3px solid #10b981' : '3px solid #ef4444' }}>
              {/* Overall Rating Banner */}
              <div
                style={{
                  padding: '12px 14px',
                  borderRadius: '10px',
                  background: getOverallBadge(result.overallRating).bg,
                  border: `1px solid ${getOverallBadge(result.overallRating).border}`,
                  color: getOverallBadge(result.overallRating).color,
                  fontWeight: '800',
                  fontSize: '14px',
                  textAlign: 'center',
                  marginBottom: '14px'
                }}
              >
                {getOverallBadge(result.overallRating).label}
              </div>

              {/* Critical Incompatibility Issues */}
              {result.criticalIssues?.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#dc2626', marginBottom: '8px' }}>
                    🚫 Critical Issues ({result.criticalIssues.length}):
                  </div>
                  {result.criticalIssues.map((issue, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '10px',
                        borderRadius: '8px',
                        background: '#fee2e2',
                        border: '1px solid #fecaca',
                        marginBottom: '8px',
                        fontSize: '12px'
                      }}
                    >
                      <div style={{ fontWeight: '700', color: '#991b1b', marginBottom: '4px' }}>
                        {issue.issue}
                      </div>
                      <div style={{ color: '#7f1d1d' }}>⚠️ {issue.action}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* Same Category / Antagonism Warnings */}
              {result.warnings?.length > 0 && (
                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '12.5px', fontWeight: '800', color: '#d97706', marginBottom: '8px' }}>
                    ⚠️ Potential Antagonism Warnings:
                  </div>
                  {result.warnings.map((w, idx) => (
                    <div
                      key={idx}
                      style={{
                        padding: '8px 10px',
                        borderRadius: '8px',
                        background: '#fef3c7',
                        border: '1px solid #fde68a',
                        marginBottom: '6px',
                        fontSize: '12px',
                        color: '#92400e'
                      }}
                    >
                      <div>{w.issue}</div>
                      <div style={{ fontStyle: 'italic', marginTop: '2px' }}>Action: {w.action}</div>
                    </div>
                  ))}
                </div>
              )}

              {/* WALES Sequential Mixing Protocol */}
              <div
                style={{
                  background: 'rgba(2, 132, 199, 0.08)',
                  borderRadius: '10px',
                  border: '1px solid rgba(2, 132, 199, 0.2)',
                  padding: '12px',
                  marginBottom: '14px'
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: '800', color: '#0284c7', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Layers size={15} /> Recommended Mixing Sequence (WALES)
                </div>
                {result.mixingOrderProtocol?.map((step, idx) => (
                  <div key={idx} style={{ fontSize: '12px', color: 'var(--fk-text, #0f172a)', marginBottom: '4px', lineHeight: '1.4' }}>
                    {step}
                  </div>
                ))}
              </div>

              {/* Jar Test Instructions */}
              <div
                style={{
                  background: 'var(--fk-bg, #f8fafc)',
                  borderRadius: '10px',
                  padding: '12px',
                  border: '1px solid var(--fk-border, #e2e8f0)',
                  fontSize: '12px',
                  lineHeight: '1.45'
                }}
              >
                <strong style={{ display: 'block', color: 'var(--fk-text, #0f172a)', marginBottom: '4px' }}>
                  ⚗️ 5-Step Jar Test Safety Protocol:
                </strong>
                <ol style={{ margin: '0', paddingLeft: '16px', color: 'var(--fk-text-sub, #64748b)' }}>
                  <li>Fill a clean 500 mL glass jar 2/3 with farm spray water.</li>
                  <li>Add proportional doses in WALES order.</li>
                  <li>Invert jar 10 times to mix thoroughly.</li>
                  <li>Let stand undisturbed for 30 minutes.</li>
                  <li>Inspect: If curdling, sludge, or flakes appear, DO NOT spray.</li>
                </ol>
              </div>
            </PremiumCard>
          )}
        </div>
      </div>
    </div>
  );
}