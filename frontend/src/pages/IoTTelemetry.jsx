import { useState, useEffect, useRef, useCallback } from "react";
import { API_BASE_URL } from "../api/client";
import { Activity, Droplet, Thermometer, Wind, Cpu, Zap, AlertTriangle } from "lucide-react";
import PremiumCard from "../components/ui/PremiumCard";
import PageHeader from "../components/ui/PageHeader";

const SENSORS = [
  { key: "soilMoisture",   label: "Soil Moisture",  unit: "%",    min: 0,   max: 100, color: "#22c55e", icon: Droplet,      good: [40, 80], tip: "Ideal range: 40–80%" },
  { key: "temperature",    label: "Temperature",    unit: "°C",   min: 0,   max: 50,  color: "#f59e0b", icon: Thermometer,  good: [18, 35], tip: "Ideal range: 18–35°C" },
  { key: "humidity",       label: "Humidity",       unit: "%",    min: 0,   max: 100, color: "#0ea5e9", icon: Wind,         good: [50, 80], tip: "Ideal range: 50–80%" },
  { key: "N",              label: "Nitrogen (N)",   unit: "mg/L", min: 0,   max: 200, color: "#10b981", icon: Activity,     good: [80, 160], tip: "Ideal range: 80–160 mg/L" },
  { key: "P",              label: "Phosphorus (P)", unit: "mg/L", min: 0,   max: 100, color: "#8b5cf6", icon: Activity,     good: [30, 80],  tip: "Ideal range: 30–80 mg/L" },
  { key: "K",              label: "Potassium (K)",  unit: "mg/L", min: 0,   max: 200, color: "#ec4899", icon: Activity,     good: [60, 150], tip: "Ideal range: 60–150 mg/L" },
  { key: "pH",             label: "Soil pH",        unit: "",     min: 4,   max: 9,   color: "#f97316", icon: Cpu,          good: [6.0, 7.5], tip: "Ideal range: 6.0–7.5" },
  { key: "batteryLevel",   label: "Device Battery", unit: "%",    min: 0,   max: 100, color: "#facc15", icon: Zap,          good: [20, 100], tip: "Low below 20%" },
];

function GaugeCard({ sensor, value }) {
  const pct = Math.round(((value - sensor.min) / (sensor.max - sensor.min)) * 100);
  const bad = value < sensor.good[0] || value > sensor.good[1];
  const Icon = sensor.icon;
  const color = bad ? "#ef4444" : sensor.color;
  return (
    <div className="calendar-month-card" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 10, textAlign: "center" }}>
      <div className="iot-gauge-ring" style={{ "--gauge-color": color, "--gauge-pct": pct + "%" }}>
        <div className="iot-gauge-value">
          <Icon size={18} color={color} />
          <div style={{ fontSize: 14, fontWeight: 800, color }}>{value}{sensor.unit}</div>
        </div>
      </div>
      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--fk-text)" }}>{sensor.label}</div>
      <div style={{ fontSize: 12, color: bad ? "#ef4444" : "#64748b" }}>{bad ? "⚠ Out of range" : sensor.tip}</div>
    </div>
  );
}

export default function IoTTelemetry() {
  const [data, setData] = useState(null);
  const [connected, setConnected] = useState(false);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState(null);
  const wsRef = useRef(null);
  const reconnectTimer = useRef(null);

  const connect = useCallback(function connectSocket() {
    const wsUrl = new URL('/ws/telemetry', API_BASE_URL || window.location.origin);
    wsUrl.protocol = wsUrl.protocol === 'https:' ? 'wss:' : 'ws:';
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => { setConnected(true); setError(null); };

    ws.onmessage = (evt) => {
      try {
        const d = JSON.parse(evt.data);
        if (d.type === 'unavailable') { setError(d.message); ws.onclose = null; setConnected(false); }
        if (d.type === "telemetry") {
          setData(d);
          setHistory(prev => [...prev.slice(-19), { ...d, t: new Date(d.timestamp).toLocaleTimeString() }]);
        }
      } catch { setError("Invalid sensor message received."); }
    };

    ws.onerror = () => { setError("WebSocket connection error. Reconnecting shortly."); setConnected(false); };

    ws.onclose = () => {
      setConnected(false);
      // Reconnect after 5s
      reconnectTimer.current = setTimeout(connectSocket, 5000);
    };
  }, []);

  useEffect(() => {
    connect();
    return () => {
      if (wsRef.current) { wsRef.current.onclose = null; wsRef.current.close(); }
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
    };
  }, [connect]);

  return (
    <div style={{ padding: "16px 20px", maxWidth: 1200, margin: "0 auto" }}>
      <PageHeader
        title="IoT Live Telemetry"
        subtitle="Real-time soil and environmental sensor data"
        icon={<Activity size={22} color="#22c55e" />}
      />

      {/* Connection status bar */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16, padding: "10px 16px", background: connected ? "rgba(34, 197, 94, 0.08)" : "rgba(239, 68, 68, 0.08)", borderRadius: 10, border: "1px solid " + (connected ? "rgba(34,197,94,0.2)" : "rgba(239,68,68,0.2)") }}>
        <span className="iot-live-dot" style={{ background: connected ? "#22c55e" : "#ef4444" }}></span>
        <span style={{ fontSize: 14, fontWeight: 700, color: connected ? "#16a34a" : "#dc2626" }}>
          {connected ? "DEMO — Simulated sensor data" : "Connecting to sensor hub…"}
        </span>
        {data && <span style={{ marginLeft: "auto", fontSize: 12, color: "#64748b" }}>Last update: {new Date(data.timestamp).toLocaleTimeString()}</span>}
      </div>

      {error && (
        <div className="alert-banner advisory" style={{ marginBottom: 16 }}>
          <AlertTriangle size={16} /><span>{error}</span>
        </div>
      )}

      {/* Gauges grid */}
      <PremiumCard style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 16, color: "var(--fk-text)" }}>📡 Sensor Readings</div>
        <div className="calendar-grid">
          {SENSORS.map(s => (
            <GaugeCard key={s.key} sensor={s} value={data ? (typeof data[s.key] === "number" ? data[s.key] : 0) : 0} />
          ))}
        </div>
      </PremiumCard>

      {/* History table */}
      {history.length > 0 && (
        <PremiumCard>
          <div style={{ fontSize: 15, fontWeight: 800, marginBottom: 12, color: "var(--fk-text)" }}>📊 Reading History (last 20)</div>
          <div style={{ overflowX: "auto" }}>
            <table className="admin-user-table">
              <thead>
                <tr>
                  <th>Time</th>
                  <th>Moisture %</th>
                  <th>Temp °C</th>
                  <th>Humidity %</th>
                  <th>N mg/L</th>
                  <th>P mg/L</th>
                  <th>K mg/L</th>
                  <th>pH</th>
                  <th>Battery %</th>
                </tr>
              </thead>
              <tbody>
                {[...history].reverse().map((row, i) => (
                  <tr key={i}>
                    <td style={{ fontVariantNumeric: "tabular-nums", fontSize: 12 }}>{row.t}</td>
                    <td>{row.soilMoisture}</td>
                    <td>{row.temperature}</td>
                    <td>{row.humidity}</td>
                    <td>{row.N}</td>
                    <td>{row.P}</td>
                    <td>{row.K}</td>
                    <td>{row.pH}</td>
                    <td>{row.batteryLevel}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </PremiumCard>
      )}
    </div>
  );
}
