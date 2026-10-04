import { useState, useEffect } from 'react';
import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import PageHeader from '../components/ui/PageHeader';
import PremiumCard from '../components/ui/PremiumCard';
import './DecisionForms.css';

const COSTS = ['seed', 'fertilizer', 'pesticides', 'irrigation', 'labor', 'machinery', 'transport', 'miscellaneous'];
const money = value => value == null ? 'Not defined' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);

const CROP_PRESETS = [
  { crop: 'Bt Cotton', area: 2.5, yield: 20, price: 7521, seed: 3800, fertilizer: 5500, pesticides: 6800, irrigation: 2500, labor: 14000, machinery: 4500, transport: 1200, miscellaneous: 1500 },
  { crop: 'Paddy / Rice', area: 3.0, yield: 28, price: 2320, seed: 1800, fertilizer: 4200, pesticides: 3100, irrigation: 4500, labor: 12000, machinery: 5200, transport: 1400, miscellaneous: 1200 },
  { crop: 'Maize', area: 2.0, yield: 32, price: 2225, seed: 2600, fertilizer: 4800, pesticides: 3400, irrigation: 2800, labor: 9500, machinery: 3800, transport: 1100, miscellaneous: 1000 },
  { crop: 'Soybean', area: 2.5, yield: 12, price: 4892, seed: 3200, fertilizer: 3600, pesticides: 3200, irrigation: 1500, labor: 8000, machinery: 3500, transport: 900, miscellaneous: 800 },
  { crop: 'Groundnut', area: 2.0, yield: 16, price: 6783, seed: 5400, fertilizer: 3800, pesticides: 2800, irrigation: 2200, labor: 10500, machinery: 3900, transport: 1000, miscellaneous: 900 },
  { crop: 'Wheat', area: 3.0, yield: 24, price: 2425, seed: 2200, fertilizer: 3900, pesticides: 1800, irrigation: 3200, labor: 8500, machinery: 4200, transport: 1100, miscellaneous: 900 },
  { crop: 'Red Gram (Tur)', area: 2.0, yield: 9, price: 7550, seed: 1900, fertilizer: 3200, pesticides: 4500, irrigation: 1800, labor: 9000, machinery: 3200, transport: 800, miscellaneous: 900 },
  { crop: 'Chickpea (Chana)', area: 2.0, yield: 10, price: 5650, seed: 2800, fertilizer: 2800, pesticides: 2900, irrigation: 1600, labor: 7800, machinery: 3100, transport: 800, miscellaneous: 800 },
  { crop: 'Tomato', area: 1.5, yield: 160, price: 1600, seed: 6500, fertilizer: 9500, pesticides: 11000, irrigation: 6500, labor: 28000, machinery: 5500, transport: 4500, miscellaneous: 3500 },
  { crop: 'Chilli', area: 1.5, yield: 24, price: 17500, seed: 7500, fertilizer: 11500, pesticides: 14500, irrigation: 5800, labor: 32000, machinery: 6000, transport: 3200, miscellaneous: 4000 },
  { crop: 'Sugarcane', area: 2.0, yield: 420, price: 340, seed: 12000, fertilizer: 14000, pesticides: 4500, irrigation: 12000, labor: 35000, machinery: 9000, transport: 8500, miscellaneous: 5000 },
  { crop: 'Potato', area: 2.0, yield: 110, price: 1450, seed: 18000, fertilizer: 8500, pesticides: 6500, irrigation: 5500, labor: 18000, machinery: 6500, transport: 3500, miscellaneous: 2500 }
];

export default function ProfitabilityAnalysis({ user }) {
  const profile = user?.farmProfile;
  const defaultPreset = CROP_PRESETS[0];
  const [form, setForm] = useState({
    crop: profile?.primaryCrop || defaultPreset.crop,
    area: profile?.land?.sizeAcres || defaultPreset.area,
    areaUnit: 'acre',
    yield: defaultPreset.yield,
    yieldUnit: 'quintal',
    price: defaultPreset.price,
    priceUnit: 'quintal',
    seed: defaultPreset.seed,
    fertilizer: defaultPreset.fertilizer,
    pesticides: defaultPreset.pesticides,
    irrigation: defaultPreset.irrigation,
    labor: defaultPreset.labor,
    machinery: defaultPreset.machinery,
    transport: defaultPreset.transport,
    miscellaneous: defaultPreset.miscellaneous
  });
  
  function getPayload(currentForm = form) {
    const acresPerUnit = currentForm.areaUnit === 'hectare' ? 2.4710538147 : 1;
    return {
      cropName: currentForm.crop.trim(),
      landSizeAcres: Number(currentForm.area) * acresPerUnit,
      expectedYieldQuintalsPerAcre: Number(currentForm.yield) * (currentForm.yieldUnit === 'kg' ? 0.01 : 1) / acresPerUnit,
      expectedPricePerQuintal: Number(currentForm.price) * (currentForm.priceUnit === 'kg' ? 100 : 1),
      customInputCosts: Object.fromEntries(COSTS.map(key => [key, Number(currentForm[key] || 0)]))
    };
  }

  const [request, setRequest] = useState({
    method: 'post',
    url: '/api/profitability/sensitivity',
    data: getPayload({
      crop: defaultPreset.crop,
      area: defaultPreset.area,
      areaUnit: 'acre',
      yield: defaultPreset.yield,
      yieldUnit: 'quintal',
      price: defaultPreset.price,
      priceUnit: 'quintal',
      ...defaultPreset
    })
  });
  const [validation, setValidation] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [sortBy, setSortBy] = useState('estimatedGrossMargin');
  const { data, loading, error, reload } = useApiResource(request);

  function applyPreset(preset) {
    const updated = {
      ...form,
      crop: preset.crop,
      area: preset.area,
      yield: preset.yield,
      price: preset.price,
      seed: preset.seed,
      fertilizer: preset.fertilizer,
      pesticides: preset.pesticides,
      irrigation: preset.irrigation,
      labor: preset.labor,
      machinery: preset.machinery,
      transport: preset.transport,
      miscellaneous: preset.miscellaneous
    };
    setForm(updated);
    setValidation('');
    setRequest({
      method: 'post',
      url: '/api/profitability/sensitivity',
      data: getPayload(updated)
    });
  }

  function input() {
    const keys = ['area','yield','price',...COSTS];
    if (!form.crop.trim() || keys.some(key => form[key] === '' || !Number.isFinite(Number(form[key])) || Number(form[key]) < 0 || Number(form[key]) > 1e9) || Number(form.area) <= 0) throw new Error('Enter a crop, positive area, and a valid non-negative number in every field. Enter 0 for a cost that does not apply.');
    if (!['acre','hectare'].includes(form.areaUnit) || !['kg','quintal'].includes(form.yieldUnit) || !['kg','quintal'].includes(form.priceUnit)) throw new Error('Select valid units.');
    return getPayload(form);
  }

  function calculate(event) {
    if (event) event.preventDefault();
    try {
      setRequest({ method:'post', url:'/api/profitability/sensitivity', data:input() });
      setValidation('');
    } catch (err) {
      setValidation(err.message);
    }
  }

  function addCandidate() {
    try {
      const scenario = input();
      setCandidates(items => [...items, scenario].slice(0,4));
      setValidation('');
    } catch (err) {
      setValidation(err.message);
    }
  }

  const scenarios = data?.data?.expected ? data.data : null;
  const result = scenarios?.expected;
  const comparisons = Array.isArray(data?.data) ? [...data.data].sort((a,b) => Number(b[sortBy]) - Number(a[sortBy])) : [];
  const update = (key, value) => setForm(previous => ({ ...previous, [key]:value }));

  return <div className="page-container decision-page">
    <PageHeader title="Farm Profitability Intelligence" subtitle="Review cultivation costs, ICAR benchmark budgets, and compare crop economics under your own assumptions." badge="Calculated estimates" />
    
    {/* 1-CLICK ICAR BENCHMARK PRESETS BAR */}
    <div style={{ background: "var(--fk-card, #ffffff)", border: "1px solid var(--fk-border, #e2e8f0)", borderRadius: "12px", padding: "14px 18px", marginBottom: "18px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
        <strong style={{ fontSize: "14px", color: "var(--fk-text, #0f172a)" }}>
          ⚡ 1-Click ICAR Benchmark Presets (Load Real Costs, Yield &amp; MSP):
        </strong>
        <span style={{ fontSize: "12px", color: "#64748b" }}>Click any crop to autofill authentic per-acre budget</span>
      </div>
      <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
        {CROP_PRESETS.map((p) => (
          <button
            key={p.crop}
            type="button"
            onClick={() => applyPreset(p)}
            style={{
              padding: "6px 12px",
              borderRadius: "8px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              border: form.crop === p.crop ? "2px solid #16a34a" : "1px solid var(--fk-border, #cbd5e1)",
              background: form.crop === p.crop ? "rgba(22, 163, 74, 0.12)" : "var(--fk-bg, #f8fafc)",
              color: form.crop === p.crop ? "#16a34a" : "var(--fk-text, #334155)",
              transition: "all 0.15s ease"
            }}
          >
            {p.crop}
          </button>
        ))}
      </div>
    </div>

    <PremiumCard><form onSubmit={calculate}>
      <div className="decision-grid">
        <label>Crop<input required maxLength={100} value={form.crop} onChange={e=>update('crop',e.target.value)} /></label>
        <label>Farm area<input required type="number" min="0.000001" step="any" value={form.area} onChange={e=>update('area',e.target.value)} /></label>
        <label>Area unit<select value={form.areaUnit} onChange={e=>update('areaUnit',e.target.value)}><option value="acre">Acre</option><option value="hectare">Hectare</option></select></label>
        <label>Expected yield per {form.areaUnit}<input required type="number" min="0" step="any" value={form.yield} onChange={e=>update('yield',e.target.value)} /></label>
        <label>Yield unit<select value={form.yieldUnit} onChange={e=>update('yieldUnit',e.target.value)}><option value="quintal">Quintal (100 kg)</option><option value="kg">Kilogram</option></select></label>
        <label>Expected selling price (₹)<input required type="number" min="0" step="any" value={form.price} onChange={e=>update('price',e.target.value)} /></label>
        <label>Price unit<select value={form.priceUnit} onChange={e=>update('priceUnit',e.target.value)}><option value="quintal">₹ per quintal</option><option value="kg">₹ per kilogram</option></select></label>
      </div>
      <h3>Costs per acre (₹)</h3><p>Enter every cost. A zero means you expect no expense in that category.</p>
      <div className="decision-grid">{COSTS.map(key=><label key={key}><span className="capitalize">{key}</span><input required type="number" min="0" max="1000000000" step="any" value={form[key]} onChange={e=>update(key,e.target.value)} /></label>)}</div>
      <p>Crop/area may start from your farm profile. Review all values. Yield, price, and costs are farmer-entered estimates.</p>
      {validation && <p role="alert">{validation}</p>}
      <div className="decision-actions"><button disabled={loading} type="submit">Calculate &amp; view scenarios</button><button disabled={candidates.length>=4} type="button" onClick={addCandidate}>Add to crop comparison ({candidates.length}/4)</button></div>
    </form></PremiumCard>
    {candidates.length>0 && <PremiumCard><h3>Candidate crops</h3>{candidates.map((c,i)=><p key={i}>{c.cropName} · {c.landSizeAcres.toFixed(2)} acres <button onClick={()=>setCandidates(items=>items.filter((_,index)=>index!==i))} aria-label={`Remove ${c.cropName} candidate ${i+1}`}>Remove</button></p>)}<button disabled={candidates.length<2 || loading} onClick={()=>setRequest({method:'post',url:'/api/profitability/compare',data:{crops:candidates}})}>Compare entered assumptions</button></PremiumCard>}
    <RequestStatus loading={loading} error={error} onRetry={reload}/>
    {result && <PremiumCard><h3>{result.cropName}: calculated results</h3><div className="decision-grid">{[['Cultivation cost',money(result.totalInputCosts)],['Production',`${result.totalYieldQuintals.toFixed(2)} quintals`],['Revenue',money(result.estimatedGrossRevenue)],[result.estimatedGrossMargin<0?'Expected loss':'Expected profit',money(Math.abs(result.estimatedGrossMargin))],['Profit/loss per acre',money(result.netProfitPerAcre)],['Break-even price / quintal',money(result.breakEvenPricePerQuintal)],['ROI',result.roiPercentage ?? 'Undefined: zero cost']].map(([name,value])=><div className="decision-stat" key={name}><span>{name}</span><strong>{value}</strong></div>)}</div>
      <h3>Cost breakdown per acre</h3>{Object.entries(result.costsBreakdown).map(([key,value])=><label className="cost-row" key={key}><span>{key.replaceAll('_',' ')} · {money(value)}</span><meter aria-label={`${key} share of costs`} min="0" max={result.totalCostPerAcre || 1} value={value}/></label>)}
      <h3>Sensitivity: price and yield each vary by 15%</h3><div className="decision-grid">{['low','expected','high'].map(key=><div className="decision-stat" key={key}><h4>{key.toUpperCase()} CASE</h4><p>Revenue {money(scenarios[key].estimatedGrossRevenue)}</p><p>Profit/loss {money(scenarios[key].estimatedGrossMargin)}</p><p>ROI {scenarios[key].roiPercentage ?? 'Undefined'}</p></div>)}</div>
      <details><summary>How calculated</summary><p>Production = acres × yield per acre. Revenue = production × selling price. Cost = acres × summed costs per acre. Profit = revenue − cost. Break-even price = cost ÷ production. ROI = profit ÷ cost × 100. Zero denominators return no defined value.</p></details>
    </PremiumCard>}
    {comparisons.length>0 && <PremiumCard><h3>Crop comparison</h3><label>Sort by<select value={sortBy} onChange={e=>setSortBy(e.target.value)}><option value="estimatedGrossMargin">Estimated profit (descending)</option><option value="netProfitPerAcre">Profit per acre (descending)</option></select></label><div className="decision-table" tabIndex="0" role="region" aria-label="Crop comparison table"><table><caption>Calculated from the entered assumptions; no crop is universally best.</caption><thead><tr>{['Crop','Cost','Revenue','Profit/loss','Profit/acre','Break-even/qtl','ROI'].map(h=><th key={h}>{h}</th>)}</tr></thead><tbody>{comparisons.map((r,i)=><tr key={i}><th>{r.cropName}</th><td>{money(r.totalInputCosts)}</td><td>{money(r.estimatedGrossRevenue)}</td><td>{money(r.estimatedGrossMargin)}</td><td>{money(r.netProfitPerAcre)}</td><td>{money(r.breakEvenPricePerQuintal)}</td><td>{r.roiPercentage??'Undefined'}</td></tr>)}</tbody></table></div></PremiumCard>}
    <p>Profitability estimates depend on yield, costs and market-price assumptions and are not guaranteed income. Results reflect your last submitted values.</p>
  </div>;
}
