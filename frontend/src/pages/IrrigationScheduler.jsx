import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import './DecisionForms.css';
import { useState } from "react";

import { Droplet, CloudRain, Zap, Gauge, Calendar, AlertCircle, CheckCircle2, RefreshCw, Clock } from "lucide-react";
import PageHeader from "../components/ui/PageHeader";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import { StatCard, StatusBadge } from "../components/ui/StatCard";

export default function IrrigationScheduler({user}) {
  const [crop, setCrop] = useState("Wheat");
  const [stage, setStage] = useState("vegetative");
  const [soil, setSoil] = useState("black");
  const [acres, setAcres] = useState(2.5);
  const [pumpHp, setPumpHp] = useState("5");
  const [irrigationType, setIrrigationType] = useState("drip");
  const [context,setContext]=useState({lat:user?.farmProfile?.location?.lat??'',lon:user?.farmProfile?.location?.lon??'',initialDeficitMm:'',pumpFlowLph:''});
  const [request,setRequest]=useState(null);
  const [validation,setValidation]=useState('');
  const {data,loading,error,reload}=useApiResource(request);
  const fetchSchedule=()=>{if(Object.values(context).some(v=>v===''||!Number.isFinite(Number(v)))){setValidation('Enter coordinates, estimated initial deficit and measured pump flow.');return;}setValidation('');setRequest({method:'post',url:'/api/irrigation/calculate',data:{crop,stage,soil,landAcres:Number(acres),pumpHp,irrigationType,...Object.fromEntries(Object.entries(context).map(([k,v])=>[k,Number(v)]))}});};

  const summary = data?.weeklySummary;

  return (
    <div className="page-container">
      <RequestStatus loading={loading} error={error} onRetry={reload} />
      <PageHeader
        title="Smart Irrigation & FAO-56 Water Scheduler"
        subtitle="Dynamic Crop Water Requirement (ETc = ETo × Kc), Soil Water Deficit, and Motor Runtime Optimizer"
        badge="Hydrological Intelligence • Open-Meteo Synced"
        icon={Droplet}
        action={
          <PremiumButton
            variant="primary"
            size="md"
            icon={RefreshCw}
            loading={loading}
            onClick={fetchSchedule}
          >
            Recalculate Water Demand
          </PremiumButton>
        }
      />

      <PremiumCard><p>Review the crop and soil assumptions below. This is a modeled schedule; no soil-moisture sensor is connected. Pump power alone cannot determine actual flow.</p><div className="decision-grid">{Object.entries({lat:'Latitude',lon:'Longitude',initialDeficitMm:'Estimated initial water deficit (mm)',pumpFlowLph:'Measured pump flow (L/hour)'}).map(([key,label])=><label key={key}>{label}<input type="number" step="any" value={context[key]} onChange={e=>setContext({...context,[key]:e.target.value})}/></label>)}</div>{validation&&<p role="alert">{validation}</p>}</PremiumCard>
      {/* PARAMETERS SELECTION BAR */}
      <PremiumCard style={{ marginBottom: "24px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "16px" }}>
          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "6px" }}>
              Target Crop
            </label>
            <select
              value={crop}
              onChange={(e) => setCrop(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontSize: "14px", fontWeight: "600" }}
            >
              <option value="Wheat">Wheat (Rabi)</option>
              <option value="Rice">Paddy / Rice (Kharif)</option>
              <option value="Cotton">Cotton (Kharif)</option>
              <option value="Tomato">Tomato (Horticulture)</option>
              <option value="Maize">Maize (Cereal)</option>
              <option value="Chili">Chili (Spice / Cash)</option>
              <option value="Soybean">Soybean (Oilseed)</option>
              <option value="Sugarcane">Sugarcane (Perennial)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "6px" }}>
              Growth Stage
            </label>
            <select
              value={stage}
              onChange={(e) => setStage(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontSize: "14px", fontWeight: "600" }}
            >
              <option value="initial">Initial (Germination / Seedling)</option>
              <option value="vegetative">Vegetative (Rapid Leaf Growth)</option>
              <option value="mid_season">Mid-Season (Flowering / Heading)</option>
              <option value="late_season">Late Season (Maturity / Ripening)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "6px" }}>
              Soil Type
            </label>
            <select
              value={soil}
              onChange={(e) => setSoil(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontSize: "14px", fontWeight: "600" }}
            >
              <option value="black">Deep Black Cotton Soil (High Retention)</option>
              <option value="alluvial">Alluvial Loam (Balanced Retention)</option>
              <option value="red">Red Loamy Soil (Moderate Retention)</option>
              <option value="sandy">Sandy Soil (High Drainage)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "6px" }}>
              Irrigation Method
            </label>
            <select
              value={irrigationType}
              onChange={(e) => setIrrigationType(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontSize: "14px", fontWeight: "600" }}
            >
              <option value="drip">Drip Irrigation (90% Efficiency)</option>
              <option value="sprinkler">Micro-Sprinkler (75% Efficiency)</option>
              <option value="flood">Traditional Flood/Furrow (60% Efficiency)</option>
            </select>
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "6px" }}>
              Plot Area (Acres)
            </label>
            <input
              type="number"
              min="0.5"
              max="100"
              step="0.5"
              value={acres}
              onChange={(e) => setAcres(Number(e.target.value) || 1)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontSize: "14px", fontWeight: "600" }}
            />
          </div>

          <div>
            <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "6px" }}>
              Pump Motor Power
            </label>
            <select
              value={pumpHp}
              onChange={(e) => setPumpHp(e.target.value)}
              style={{ width: "100%", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontSize: "14px", fontWeight: "600" }}
            >
              <option value="3">3 HP Submersible (~18,000 L/hr)</option>
              <option value="5">5 HP Submersible (~30,000 L/hr)</option>
              <option value="7.5">7.5 HP Submersible (~45,000 L/hr)</option>
              <option value="10">10 HP Agricultural (~60,000 L/hr)</option>
            </select>
          </div>
        </div>
      </PremiumCard>

      {data?.limitations&&<PremiumCard>{data.limitations.map(text=><p key={text}>{text}</p>)}</PremiumCard>}
      {/* KPI METRIC CARDS */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "16px", marginBottom: "24px" }}>
        <StatCard
          icon={Droplet}
          title="7-Day Water Demand"
          value={summary?.totalWaterLiters ? `${(summary.totalWaterLiters / 1000).toFixed(0)}k` : "—"}
          unit="Liters"
          subtitle={`Crop Kc: ${data?.cropKc ?? '—'}`}
          color="#2563eb"
        />
        <StatCard
          icon={Clock}
          title="Total Pump Runtime"
          value={summary?.totalPumpHours ?? '—'}
          unit="Hours"
          subtitle={`${pumpHp} HP Motor Schedule`}
          color="#d97706"
        />
        <StatCard
          icon={Gauge}
          title="Water Savings vs Flood"
          value={summary?.waterSavedVsFloodPercent ?? '—'}
          unit="%"
          subtitle={`${irrigationType.toUpperCase()} Efficiency: ${data?.efficiencyPercent || 90}%`}
          color="#15803d"
        />
        <StatCard
          icon={Zap}
          title="Power Consumption"
          value={summary?.estimatedElectricityKwh ?? '—'}
          unit="kWh"
          subtitle="Estimated Energy Load"
          color="#9333ea"
        />
      </div>

      {/* 7-DAY WATER TIMELINE TABLE */}
      <PremiumCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Calendar size={22} style={{ color: "#2563eb" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text, #0f172a)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
              7-Day Smart Irrigation Action Plan
            </h3>
          </div>
          <StatusBadge status="info">FAO-56 Penman-Monteith Grounded</StatusBadge>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--fk-border, #e2e8f0)", color: "var(--fk-text-sub, #64748b)" }}>
                <th style={{ padding: "12px 10px" }}>Day & Date</th>
                <th style={{ padding: "12px 10px" }}>Temp (Max/Min)</th>
                <th style={{ padding: "12px 10px" }}>Crop ETc (mm)</th>
                <th style={{ padding: "12px 10px" }}>Rain Forecast</th>
                <th style={{ padding: "12px 10px" }}>Water Volume</th>
                <th style={{ padding: "12px 10px" }}>Pump Runtime</th>
                <th style={{ padding: "12px 10px" }}>Agronomic Advisory</th>
              </tr>
            </thead>
            <tbody>
              {data?.schedule?.map((item, idx) => {
                const isIrrigate = item.priority === "irrigate";
                const isSkip = item.priority === "skip";
                const bg = isIrrigate ? "rgba(37, 99, 235, 0.04)" : isSkip ? "rgba(245, 158, 11, 0.05)" : "transparent";

                return (
                  <tr key={idx} style={{ borderBottom: "1px solid var(--fk-border, #e2e8f0)", background: bg }}>
                    <td style={{ padding: "12px 10px", fontWeight: "700", color: "var(--fk-text, #0f172a)" }}>
                      <div>{item.day}</div>
                      <div style={{ fontSize: "11px", color: "var(--fk-text-sub, #64748b)", fontWeight: "normal" }}>{item.date}</div>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      {item.tempMax}°C / {item.tempMin}°C
                    </td>
                    <td style={{ padding: "12px 10px", fontWeight: "700", color: "#2563eb" }}>
                      {item.etc} mm
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      {item.rainMm > 0 ? (
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "4px", color: "#0284c7", fontWeight: "700" }}>
                          <CloudRain size={14} /> {item.rainMm} mm
                        </span>
                      ) : (
                        <span style={{ color: "var(--fk-text-sub, #64748b)" }}>0 mm (Dry)</span>
                      )}
                    </td>
                    <td style={{ padding: "12px 10px", fontWeight: "700" }}>
                      {item.waterVolumeLiters > 0 ? `${item.waterVolumeLiters.toLocaleString()} L` : "—"}
                    </td>
                    <td style={{ padding: "12px 10px", fontWeight: "700" }}>
                      {item.pumpMinutes > 0 ? (
                        <span style={{ color: "#d97706", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                          <Clock size={13} /> {Math.floor(item.pumpMinutes / 60)}h {item.pumpMinutes % 60}m
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      {isIrrigate ? (
                        <span style={{ color: "#15803d", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <CheckCircle2 size={16} color="#15803d" /> {item.recommendation}
                        </span>
                      ) : isSkip ? (
                        <span style={{ color: "#d97706", fontWeight: "600", display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <AlertCircle size={16} color="#d97706" /> {item.recommendation}
                        </span>
                      ) : (
                        <span style={{ color: "var(--fk-text-sub, #64748b)" }}>{item.recommendation}</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </PremiumCard>
    </div>
  );
}
