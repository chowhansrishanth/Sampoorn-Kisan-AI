import { useState } from 'react';
import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import PageHeader from '../components/ui/PageHeader';
import PremiumCard from '../components/ui/PremiumCard';
import './DecisionForms.css';

const COSTS = ['seed', 'fertilizer', 'pesticides', 'irrigation', 'labor', 'machinery', 'transport', 'miscellaneous'];
const money = value => value == null ? 'Not defined' : new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(value);
export default function ProfitabilityAnalysis({ user }) {
  const profile = user?.farmProfile;
  const [form, setForm] = useState({ crop: profile?.primaryCrop || '', area: profile?.land?.sizeAcres || '', areaUnit: 'acre', yield: '', yieldUnit: 'quintal', price: '', priceUnit: 'quintal', ...Object.fromEntries(COSTS.map(key => [key, ''])) });
  const [request, setRequest] = useState(null);
  const [validation, setValidation] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [sortBy, setSortBy] = useState('estimatedGrossMargin');
  const { data, loading, error, reload } = useApiResource(request);
  function input() {
    const keys = ['area','yield','price',...COSTS];
    if (!form.crop.trim() || keys.some(key => form[key] === '' || !Number.isFinite(Number(form[key])) || Number(form[key]) < 0 || Number(form[key]) > 1e9) || Number(form.area) <= 0) throw new Error('Enter a crop, positive area, and a valid non-negative number in every field. Enter 0 for a cost that does not apply.');
    if (!['acre','hectare'].includes(form.areaUnit) || !['kg','quintal'].includes(form.yieldUnit) || !['kg','quintal'].includes(form.priceUnit)) throw new Error('Select valid units.');
    const acresPerUnit = form.areaUnit === 'hectare' ? 2.4710538147 : 1;
    return { cropName: form.crop.trim(), landSizeAcres: Number(form.area) * acresPerUnit, expectedYieldQuintalsPerAcre: Number(form.yield) * (form.yieldUnit === 'kg' ? 0.01 : 1) / acresPerUnit, expectedPricePerQuintal: Number(form.price) * (form.priceUnit === 'kg' ? 100 : 1), customInputCosts: Object.fromEntries(COSTS.map(key => [key, Number(form[key])])) };
  }
  function calculate(event) { event.preventDefault(); try { setRequest({ method:'post', url:'/api/profitability/sensitivity', data:input() }); setValidation(''); } catch (err) { setValidation(err.message); } }
  function addCandidate() { try { const scenario = input(); setCandidates(items => [...items, scenario].slice(0,4)); setValidation(''); } catch (err) { setValidation(err.message); } }
  const scenarios = data?.data?.expected ? data.data : null;
  const result = scenarios?.expected;
  const comparisons = Array.isArray(data?.data) ? [...data.data].sort((a,b) => Number(b[sortBy]) - Number(a[sortBy])) : [];
  const update = (key, value) => setForm(previous => ({ ...previous, [key]:value }));
  return <div className="page-container decision-page">
    <PageHeader title="Farm Profitability Intelligence" subtitle="Review cultivation costs and compare crop economics under your own assumptions." badge="Calculated estimates" />
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
