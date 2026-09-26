import { useState } from "react";
import { Sliders, TrendingUp, ShieldAlert, BarChart2, PieChart } from "lucide-react";

const MULTI_CROP_COMPARISON_DB = [
  { crop: "Red Gram (Arhar)", water: "Low", duration: "160-180 days", costPerAcre: 14500, risk: "Low", yieldPerAcre: 8, pricePerQtl: 7550, suitability: "High for Red/Black soils with limited water", badge: "🌟 Best Overall Fit" },
  { crop: "Cotton", water: "Medium", duration: "160-210 days", costPerAcre: 22000, risk: "Medium-High", yieldPerAcre: 10, pricePerQtl: 7120, suitability: "Best for deep Black soils", badge: "🏆 Highest Net Return" },
  { crop: "Maize (Corn)", water: "Medium", duration: "95-110 days", costPerAcre: 16000, risk: "Low-Medium", yieldPerAcre: 26, pricePerQtl: 2225, suitability: "Ideal for well-drained loamy soils", badge: "⚡ Fast Growth" },
  { crop: "Green Gram (Moong)", water: "Very Low", duration: "60-75 days", costPerAcre: 9500, risk: "Low", yieldPerAcre: 6, pricePerQtl: 8558, suitability: "Shortest duration drought crop", badge: "💧 Lowest Water & Risk" }
];

export default function CropRecommendationTool() {
  const [activeTab, setActiveTab] = useState("budget");

  // Budget Calculator Form State
  const [landAcres, setLandAcres] = useState(2.0);
  const [selectedCrop, setSelectedCrop] = useState("Paddy (Rice)");
  const [seedCost, setSeedCost] = useState(3500);
  const [fertCost, setFertCost] = useState(6500);
  const [pestCost, setPestCost] = useState(4200);
  const [laborCost, setLaborCost] = useState(8000);
  const [irrigCost, setIrrigCost] = useState(3000);
  const [machineryCost, setMachineryCost] = useState(5000);
  const [transportCost, setTransportCost] = useState(2500);
  const [expectedYieldQtl, setExpectedYieldQtl] = useState(24);
  const [sellingPriceQtl, setSellingPriceQtl] = useState(2300);

  // Financial Computations with safe boundary protection
  const safeLandAcres = Math.max(0.1, Number(landAcres) || 0.1);
  const safeYieldQtl = Math.max(0, Number(expectedYieldQtl) || 0);
  const safeSellingPrice = Math.max(0, Number(sellingPriceQtl) || 0);
  const safeSeed = Math.max(0, Number(seedCost) || 0);
  const safeFert = Math.max(0, Number(fertCost) || 0);
  const safePest = Math.max(0, Number(pestCost) || 0);
  const safeLabor = Math.max(0, Number(laborCost) || 0);
  const safeIrrig = Math.max(0, Number(irrigCost) || 0);
  const safeMachine = Math.max(0, Number(machineryCost) || 0);
  const safeTransport = Math.max(0, Number(transportCost) || 0);

  const totalInputCostPerAcre = safeSeed + safeFert + safePest + safeLabor + safeIrrig + safeMachine + safeTransport;
  const totalCostOverall = totalInputCostPerAcre * safeLandAcres;
  const totalYieldQuintals = safeYieldQtl * safeLandAcres;
  const grossRevenue = totalYieldQuintals * safeSellingPrice;
  const netProfit = grossRevenue - totalCostOverall;
  const roiPercent = totalCostOverall > 0 ? ((netProfit / totalCostOverall) * 100).toFixed(1) : "0.0";
  const breakEvenPrice = totalYieldQuintals > 0 ? Math.round(totalCostOverall / totalYieldQuintals) : 0;

  return (
    <div className="page-container crop-tool-page page-enter">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <h1 className="page-title">🌾 Smart Farm Financial Hub & Multi-Crop Decision Engine</h1>
          <p className="page-subtitle">Calculate cultivation break-even prices, compare multi-crop returns side-by-side, plan intercropping workflows, and inspect 4-vector risk scores</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }} role="tablist" aria-label="Crop Tool Sections">
          <button 
            role="tab"
            aria-selected={activeTab === 'budget'}
            className={`secondary-btn ${activeTab === 'budget' ? 'active' : ''}`} 
            onClick={() => setActiveTab('budget')} 
            style={{ fontWeight: 'bold' }}
          >
            💰 Smart Budget & Break-Even Calculator
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === 'compare'}
            className={`secondary-btn ${activeTab === 'compare' ? 'active' : ''}`} 
            onClick={() => setActiveTab('compare')} 
            style={{ fontWeight: 'bold' }}
          >
            📊 Multi-Crop Comparison Engine
          </button>
          <button 
            role="tab"
            aria-selected={activeTab === 'plan'}
            className={`secondary-btn ${activeTab === 'plan' ? 'active' : ''}`} 
            onClick={() => setActiveTab('plan')} 
            style={{ fontWeight: 'bold' }}
          >
            🌿 Smart Intercropping & Risk Matrix
          </button>
        </div>
      </div>

      {activeTab === 'budget' && (
        <div className="grid-2-col">
          {/* INPUT FORM CARD */}
          <div className="glass-card dg-card-interactive">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
              <Sliders size={20} color="var(--fk-blue)" />
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--fk-text)', margin: 0 }}>Farm Financial Input Parameters</h3>
            </div>

            <div className="form-row-2col" style={{ marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--fk-text-sub)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Land Size (Acres)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={landAcres}
                  onChange={e => setLandAcres(Number(e.target.value))}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '14px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '11px', fontWeight: '700', color: 'var(--fk-text-sub)', textTransform: 'uppercase', marginBottom: '4px', display: 'block' }}>
                  Crop Name
                </label>
                <select
                  value={selectedCrop}
                  onChange={e => setSelectedCrop(e.target.value)}
                  style={{ width: '100%', padding: '10px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '14px' }}
                >
                  <option value="Paddy (Rice)">Paddy (Rice)</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Red Gram (Arhar)">Red Gram (Arhar)</option>
                  <option value="Maize (Corn)">Maize (Corn)</option>
                  <option value="Green Gram (Moong)">Green Gram (Moong)</option>
                  <option value="Soybean">Soybean</option>
                  <option value="Chilli">Chilli</option>
                  <option value="Wheat">Wheat</option>
                </select>
              </div>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--fk-text-sub)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Per-Acre Production Input Costs (₹)
            </h4>

            <div className="form-row-2col" style={{ gap: '10px', marginBottom: '14px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Seed Cost / Acre</label>
                <input type="number" value={seedCost} onChange={e => setSeedCost(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Fertilizer / Acre</label>
                <input type="number" value={fertCost} onChange={e => setFertCost(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Pesticide / Acre</label>
                <input type="number" value={pestCost} onChange={e => setPestCost(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Labor Charges / Acre</label>
                <input type="number" value={laborCost} onChange={e => setLaborCost(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Irrigation Water / Acre</label>
                <input type="number" value={irrigCost} onChange={e => setIrrigCost(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Machinery / Tractor</label>
                <input type="number" value={machineryCost} onChange={e => setMachineryCost(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Transport / Mandi Logistics</label>
                <input type="number" value={transportCost} onChange={e => setTransportCost(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }} />
              </div>
            </div>

            <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--fk-text-sub)', marginBottom: '8px', textTransform: 'uppercase' }}>
              Harvest & Selling Expectations
            </h4>

            <div className="form-row-2col" style={{ gap: '10px' }}>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Expected Yield (Qtl / Acre)</label>
                <input type="number" value={expectedYieldQtl} onChange={e => setExpectedYieldQtl(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }} />
              </div>
              <div>
                <label style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Market Selling Price (₹ / Qtl)</label>
                <input type="number" value={sellingPriceQtl} onChange={e => setSellingPriceQtl(Number(e.target.value))} style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)', color: 'var(--fk-text)', fontSize: '13px' }} />
              </div>
            </div>
          </div>

          {/* FINANCIAL DASHBOARD OUTPUT */}
          <div className="glass-card dg-card-interactive">
            <div className="card-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <TrendingUp size={20} color="#16a34a" />
                <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--fk-text)', margin: 0 }}>Smart Financial Analysis</h3>
              </div>
              <span style={{ fontSize: '12px', fontWeight: 'bold', color: '#16a34a', background: 'rgba(22, 163, 74, 0.15)', padding: '4px 10px', borderRadius: '20px' }}>
                {roiPercent}% Expected ROI
              </span>
            </div>

            {/* Key Metrics Cards Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--fk-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--fk-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)', fontWeight: 'bold' }}>Total Crop Investment</span>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#dc2626', marginTop: '2px' }}>₹{Math.round(totalCostOverall).toLocaleString()}</div>
                <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)' }}>₹{Math.round(totalInputCostPerAcre).toLocaleString()} / Acre</span>
              </div>

              <div style={{ background: 'var(--fk-bg)', padding: '12px', borderRadius: '6px', border: '1px solid var(--fk-border)' }}>
                <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)', fontWeight: 'bold' }}>Gross Revenue ({totalYieldQuintals} Qtl)</span>
                <div style={{ fontSize: '20px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>₹{Math.round(grossRevenue).toLocaleString()}</div>
                <span style={{ fontSize: '11px', color: 'var(--fk-text-sub)' }}>At ₹{sellingPriceQtl}/Qtl</span>
              </div>

              <div style={{ background: 'rgba(22, 163, 74, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(22, 163, 74, 0.3)' }}>
                <span style={{ fontSize: '11px', color: '#16a34a', fontWeight: 'bold' }}>Net Expected Profit</span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#16a34a', marginTop: '2px' }}>₹{Math.round(netProfit).toLocaleString()}</div>
                <span style={{ fontSize: '11px', color: 'var(--fk-text)' }}>Net Return Margin</span>
              </div>

              <div style={{ background: 'rgba(37, 99, 235, 0.1)', padding: '12px', borderRadius: '6px', border: '1px solid rgba(37, 99, 235, 0.3)' }}>
                <span style={{ fontSize: '11px', color: '#2563eb', fontWeight: 'bold' }}>Break-Even Selling Price</span>
                <div style={{ fontSize: '22px', fontWeight: '800', color: '#2563eb', marginTop: '2px' }}>₹{Math.round(breakEvenPrice)} / Qtl</div>
                <span style={{ fontSize: '11px', color: 'var(--fk-text)' }}>Min price to recover costs</span>
              </div>
            </div>

            {/* Plain-Language Summary Box */}
            <div style={{ background: 'var(--fk-bg)', border: '1px solid var(--fk-border)', padding: '14px', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '13px', fontWeight: '800', color: 'var(--fk-text)', marginBottom: '6px' }}>
                💡 Sahayak Financial Advisor Insight
              </h4>
              <p style={{ fontSize: '12px', color: 'var(--fk-text-sub)', margin: 0, lineHeight: '1.5' }}>
                For <strong>{landAcres} acres</strong> of <strong>{selectedCrop}</strong>: Total cost is <strong>₹{Math.round(totalCostOverall).toLocaleString()}</strong>.
                If market price stays above <strong>₹{Math.round(breakEvenPrice)}/qtl</strong>, your farm will make a profit. At target price of ₹{sellingPriceQtl}/qtl, expected Net Return is <strong>₹{Math.round(netProfit).toLocaleString()}</strong> ({roiPercent}% ROI).
              </p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'compare' && (
        <div className="glass-card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <BarChart2 size={20} color="#2563eb" />
              <h3 style={{ fontSize: '18px', fontWeight: '800', color: 'var(--fk-text)', margin: 0 }}>Side-by-Side Multi-Crop Comparison Engine ({landAcres} Acres)</h3>
            </div>
            <span style={{ fontSize: '12px', color: 'var(--fk-text-sub)' }}>Evaluating 4 Major Regional Crops</span>
          </div>

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', fontSize: '13px', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--fk-bg)', borderBottom: '1px solid var(--fk-border)', textAlign: 'left' }}>
                  <th style={{ padding: '12px' }}>Parameter</th>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => (
                    <th key={i} style={{ padding: '12px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '800', color: 'var(--fk-text)' }}>{c.crop}</div>
                      <span style={{ fontSize: '11px', fontWeight: 'bold', color: '#16a34a', background: 'rgba(22, 163, 74, 0.12)', padding: '2px 6px', borderRadius: '4px', display: 'inline-block', marginTop: '2px' }}>
                        {c.badge}
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: '1px solid var(--fk-border)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--fk-text-sub)' }}>Water Requirement</td>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => <td key={i} style={{ padding: '10px' }}>{c.water}</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fk-border)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--fk-text-sub)' }}>Crop Duration</td>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => <td key={i} style={{ padding: '10px' }}>{c.duration}</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fk-border)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--fk-text-sub)' }}>Input Cost / Acre</td>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => <td key={i} style={{ padding: '10px', color: '#dc2626', fontWeight: 'bold' }}>₹{c.costPerAcre.toLocaleString()}</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fk-border)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--fk-text-sub)' }}>Total Cost ({landAcres} Acres)</td>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => <td key={i} style={{ padding: '10px', color: '#dc2626', fontWeight: 'bold' }}>₹{(c.costPerAcre * landAcres).toLocaleString()}</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fk-border)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--fk-text-sub)' }}>Risk Level</td>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => <td key={i} style={{ padding: '10px' }}>{c.risk}</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fk-border)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--fk-text-sub)' }}>Expected Yield ({landAcres} Acres)</td>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => <td key={i} style={{ padding: '10px' }}>{c.yieldPerAcre * landAcres} Qtl</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fk-border)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--fk-text-sub)' }}>Market Selling Price</td>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => <td key={i} style={{ padding: '10px' }}>₹{c.pricePerQtl}/Qtl</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fk-border)' }}>
                  <td style={{ padding: '10px', fontWeight: 'bold', color: 'var(--fk-text-sub)' }}>Expected Revenue</td>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => <td key={i} style={{ padding: '10px', color: '#16a34a', fontWeight: 'bold' }}>₹{(c.yieldPerAcre * landAcres * c.pricePerQtl).toLocaleString()}</td>)}
                </tr>
                <tr style={{ borderBottom: '1px solid var(--fk-border)', background: 'rgba(22, 163, 74, 0.08)' }}>
                  <td style={{ padding: '12px', fontWeight: '800', color: '#16a34a' }}>Net Expected Profit</td>
                  {MULTI_CROP_COMPARISON_DB.map((c, i) => {
                    const prof = (c.yieldPerAcre * landAcres * c.pricePerQtl) - (c.costPerAcre * landAcres);
                    return <td key={i} style={{ padding: '12px', fontSize: '15px', fontWeight: '800', color: '#16a34a' }}>₹{prof.toLocaleString()}</td>;
                  })}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'plan' && (
        <div className="grid-2-col">
          {/* SMART CROP ALLOCATION PLANNER */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <PieChart size={20} color="#2874f0" />
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--fk-text)', margin: 0 }}>
                Smart Intercropping Allocation Plan ({landAcres} Acres)
              </h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '16px' }}>
              <div style={{ background: 'var(--fk-bg)', border: '1px solid var(--fk-border)', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Primary Cash Crop (70% Allocation)</span>
                  <span style={{ color: '#2563eb' }}>{(landAcres * 0.7).toFixed(1)} Acres</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--fk-text-sub)', margin: 0 }}>Cotton / Paddy - Primary revenue generator.</p>
              </div>

              <div style={{ background: 'var(--fk-bg)', border: '1px solid var(--fk-border)', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Secondary Legume Crop (20% Allocation)</span>
                  <span style={{ color: '#16a34a' }}>{(landAcres * 0.2).toFixed(1)} Acres</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--fk-text-sub)', margin: 0 }}>Red Gram / Black Gram - Enriches soil nitrogen naturally.</p>
              </div>

              <div style={{ background: 'var(--fk-bg)', border: '1px solid var(--fk-border)', padding: '12px', borderRadius: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>Border & Trap Crop Reserve (10% Allocation)</span>
                  <span style={{ color: '#d97706' }}>{(landAcres * 0.1).toFixed(1)} Acres</span>
                </div>
                <p style={{ fontSize: '12px', color: 'var(--fk-text-sub)', margin: 0 }}>Marigold & Bajra rows to trap sucking pests organically.</p>
              </div>
            </div>

            <div style={{ background: 'rgba(37, 99, 235, 0.08)', border: '1px solid rgba(37, 99, 235, 0.2)', padding: '12px', borderRadius: '6px' }}>
              <h4 style={{ fontSize: '12px', fontWeight: '800', color: '#2563eb', margin: '0 0 4px' }}>Intercropping Rationale</h4>
              <p style={{ fontSize: '12px', color: 'var(--fk-text)', margin: 0 }}>
                Planting 1 row of Red Gram for every 4 rows of Cotton provides biological pest barriers, reduces pesticide expenses by ~25%, and improves soil fertility for the next season.
              </p>
            </div>
          </div>

          {/* 4-VECTOR RISK MATRIX */}
          <div className="glass-card">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
              <ShieldAlert size={20} color="#d97706" />
              <h3 style={{ fontSize: '17px', fontWeight: '800', color: 'var(--fk-text)', margin: 0 }}>4-Vector Cultivation Risk Score</h3>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>1. Weather Risk (Rain & Temp)</span>
                  <span style={{ color: '#16a34a' }}>Low (25%)</span>
                </div>
                <div style={{ background: 'var(--fk-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: '#16a34a', width: '25%', height: '100%' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>2. Market Price Volatility Risk</span>
                  <span style={{ color: '#d97706' }}>Moderate (35%)</span>
                </div>
                <div style={{ background: 'var(--fk-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: '#d97706', width: '35%', height: '100%' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>3. Water Availability Risk</span>
                  <span style={{ color: '#16a34a' }}>Low (20%)</span>
                </div>
                <div style={{ background: 'var(--fk-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: '#16a34a', width: '20%', height: '100%' }}></div>
                </div>
              </div>

              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', fontWeight: 'bold', marginBottom: '4px' }}>
                  <span>4. Pest & Disease Infection Risk</span>
                  <span style={{ color: '#d97706' }}>Moderate (45%)</span>
                </div>
                <div style={{ background: 'var(--fk-border)', height: '6px', borderRadius: '3px', overflow: 'hidden' }}>
                  <div style={{ background: '#d97706', width: '45%', height: '100%' }}></div>
                </div>
              </div>
            </div>

            <div style={{ background: 'var(--fk-bg)', border: '1px solid var(--fk-border)', padding: '12px', borderRadius: '6px' }}>
              <div style={{ fontSize: '12px', fontWeight: 'bold', color: 'var(--fk-text)', marginBottom: '2px' }}>
                Overall Risk Assessment: <span style={{ color: '#16a34a' }}>Low-Moderate Risk (Score: 31/100)</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--fk-text-sub)', margin: 0 }}>
                High night humidity poses a mild fungal threat; apply preventive bio-fungicides to maintain high safety.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
