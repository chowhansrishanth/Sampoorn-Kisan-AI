import useApiResource from '../hooks/useApiResource';
import RequestStatus from './ui/RequestStatus';
import { useState } from "react";

import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { TrendingUp, Award, RefreshCw, Scale, Calendar } from "lucide-react";
import PremiumCard from "./ui/PremiumCard";
import PremiumButton from "./ui/PremiumButton";
import { StatusBadge } from "./ui/StatCard";

export default function MandiArbitrageWidget({ defaultCommodity = "Tomato", defaultState = "Telangana" }) {
  const [commodity, setCommodity] = useState(defaultCommodity);
  const [state, setState] = useState(defaultState);
  const [quantity, setQuantity] = useState(25);
  const { data, loading, error, reload } = useApiResource([
    { url: '/api/market-forecast/forecast', params: { commodity, state } },
    { method: 'post', url: '/api/market-forecast/arbitrage', data: { commodity, state, quantityQuintals: quantity } }
  ]);
  const forecastData = data?.[0];
  const arbitrageData = data?.[1];
  const fetchData = reload;

  const bestDay = forecastData?.bestSellingDay;

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      <RequestStatus loading={loading} error={error} onRetry={reload} />
      {/* FILTER CONTROL STRIP */}
      <PremiumCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                Commodity
              </label>
              <select
                value={commodity}
                onChange={(e) => setCommodity(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "14px" }}
              >
                <option value="Tomato">Tomato (Horticulture)</option>
                <option value="Onion">Onion (Rabi / Kharif)</option>
                <option value="Potato">Potato</option>
                <option value="Cotton">Cotton (Kharif Cash)</option>
                <option value="Wheat">Wheat (Grain)</option>
                <option value="Chili">Red Chili (Spice)</option>
                <option value="Soybean">Soybean</option>
                <option value="Maize">Maize</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                State APMC Zone
              </label>
              <select
                value={state}
                onChange={(e) => setState(e.target.value)}
                style={{ padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "14px" }}
              >
                <option value="Telangana">Telangana (Warangal / Hyderabad)</option>
                <option value="Punjab">Punjab (Khanna / Ludhiana)</option>
                <option value="Maharashtra">Maharashtra (Lasalgaon / Mumbai)</option>
              </select>
            </div>

            <div>
              <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub, #64748b)", display: "block", marginBottom: "4px" }}>
                Harvest Consignment (Quintals)
              </label>
              <input
                type="number"
                min="1"
                max="500"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value) || 10)}
                style={{ width: "110px", padding: "8px 12px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", background: "var(--fk-card, #ffffff)", color: "var(--fk-text, #0f172a)", fontWeight: "700", fontSize: "14px" }}
              />
            </div>
          </div>

          <PremiumButton variant="outline" size="sm" icon={RefreshCw} loading={loading} onClick={fetchData}>
            Refresh Mandi Data
          </PremiumButton>
        </div>
      </PremiumCard>

      {/* ARBITRAGE HIGHLIGHT BANNER */}
      {arbitrageData && (
        <div style={{ padding: "16px 20px", borderRadius: "12px", background: "linear-gradient(135deg, rgba(21, 128, 61, 0.1) 0%, rgba(34, 197, 94, 0.05) 100%)", border: "1px solid rgba(21, 128, 61, 0.25)", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div style={{ width: "44px", height: "44px", borderRadius: "10px", background: "#dcfce7", color: "#15803d", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Award size={24} />
            </div>
            <div>
              <div style={{ fontSize: "12px", fontWeight: "800", textTransform: "uppercase", color: "#15803d", letterSpacing: "0.05em" }}>
                Optimal APMC Market Recommendation
              </div>
              <div style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text, #0f172a)" }}>
                {arbitrageData.recommendation}
              </div>
            </div>
          </div>
          {bestDay && (
            <div style={{ display: "flex", alignItems: "center", gap: "8px", background: "var(--fk-card, #ffffff)", padding: "8px 14px", borderRadius: "8px", border: "1px solid var(--fk-border, #e2e8f0)", fontSize: "13px", color: "var(--fk-text, #0f172a)" }}>
              <Calendar size={16} color="#2563eb" />
              <span>
                Peak Selling Day: <strong>{bestDay.day} ({bestDay.date})</strong> at <strong>₹{bestDay.expectedPrice}/Qtl</strong>
              </span>
            </div>
          )}
        </div>
      )}

      {/* 7-DAY PRICE PREDICTION CHART */}
      <PremiumCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <TrendingUp size={22} style={{ color: "#15803d" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text, #0f172a)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
              7-Day APMC Price Forecast (₹/Quintal)
            </h3>
          </div>
          <StatusBadge status="success">Arrival Volume & Seasonality AI Grounded</StatusBadge>
        </div>

        <div style={{ width: "100%", height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={forecastData?.forecast || []}>
              <defs>
                <linearGradient id="priceGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#15803d" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--fk-border, #e2e8f0)" />
              <XAxis dataKey="day" stroke="var(--fk-text-sub, #64748b)" fontSize={12} tickLine={false} />
              <YAxis domain={["auto", "auto"]} stroke="var(--fk-text-sub, #64748b)" fontSize={12} tickLine={false} />
              <Tooltip contentStyle={{ backgroundColor: "var(--fk-card, #ffffff)", borderColor: "var(--fk-border, #e2e8f0)", color: "var(--fk-text, #0f172a)", borderRadius: "8px" }} />
              <Area type="monotone" dataKey="predictedModal" stroke="#15803d" strokeWidth={2.5} fillOpacity={1} fill="url(#priceGrad)" name="Modal Price (₹/Qtl)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </PremiumCard>

      {/* MULTI-MANDI ARBITRAGE COMPARISON TABLE */}
      <PremiumCard>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Scale size={22} style={{ color: "#2563eb" }} />
            <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text, #0f172a)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
              Multi-Market Arbitrage & Net Return Matrix ({quantity} Quintals)
            </h3>
          </div>
          <span style={{ fontSize: "13px", color: "var(--fk-text-sub, #64748b)" }}>
            Diesel Transit @ ₹18/km • APMC Cess Included
          </span>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "left", fontSize: "14px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid var(--fk-border, #e2e8f0)", color: "var(--fk-text-sub, #64748b)" }}>
                <th style={{ padding: "12px 10px" }}>APMC Mandi</th>
                <th style={{ padding: "12px 10px" }}>Distance</th>
                <th style={{ padding: "12px 10px" }}>Quoted Price</th>
                <th style={{ padding: "12px 10px" }}>Gross Value</th>
                <th style={{ padding: "12px 10px" }}>Transport Cost</th>
                <th style={{ padding: "12px 10px" }}>Cess & Labor</th>
                <th style={{ padding: "12px 10px" }}>Net Realized Profit</th>
                <th style={{ padding: "12px 10px" }}>Effective Rate</th>
              </tr>
            </thead>
            <tbody>
              {arbitrageData?.comparison?.map((mandi, idx) => {
                const isWinner = idx === 0;
                return (
                  <tr key={mandi.mandiName} style={{ borderBottom: "1px solid var(--fk-border, #e2e8f0)", background: isWinner ? "rgba(34, 197, 94, 0.08)" : "transparent" }}>
                    <td style={{ padding: "12px 10px", fontWeight: "700", color: "var(--fk-text, #0f172a)" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        {isWinner && <Award size={16} color="#15803d" />}
                        {mandi.mandiName}
                        {isWinner && <span style={{ fontSize: "11px", background: "#15803d", color: "#ffffff", padding: "1px 6px", borderRadius: "4px", fontWeight: "800" }}>BEST CHOICE</span>}
                      </div>
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--fk-text-sub, #64748b)" }}>
                      {mandi.distanceKm} km
                    </td>
                    <td style={{ padding: "12px 10px", fontWeight: "700", color: "#0f172a" }}>
                      ₹{mandi.quotedModalPrice}/Qtl
                    </td>
                    <td style={{ padding: "12px 10px", color: "var(--fk-text-sub, #64748b)" }}>
                      ₹{mandi.grossRevenue.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#dc2626" }}>
                      -₹{mandi.transportCost.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#d97706" }}>
                      -₹{(mandi.apmcCess + mandi.loadingCharges).toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 10px", fontWeight: "800", color: isWinner ? "#15803d" : "#0f172a", fontSize: "15px" }}>
                      ₹{mandi.netProfit.toLocaleString()}
                    </td>
                    <td style={{ padding: "12px 10px", fontWeight: "700", color: isWinner ? "#15803d" : "var(--fk-text-sub, #64748b)" }}>
                      ₹{mandi.effectivePricePerQuintal}/Qtl
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
