import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';
import { useState, useCallback } from "react";

import { Calendar } from "lucide-react";
import PremiumCard from "../components/ui/PremiumCard";
import PageHeader from "../components/ui/PageHeader";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const TASK_ICONS = {
  sowing: { icon: "🌱", label: "Sowing/Transplanting" },
  irrigation: { icon: "💧", label: "Irrigation" },
  fertilizer: { icon: "🧪", label: "Fertilizer / Nutrition" },
  pest: { icon: "🐛", label: "Pest / Disease" },
  harvest: { icon: "🌾", label: "Harvest / Post-Harvest" },
};

const FILTER_OPTIONS = ["all", ...Object.keys(TASK_ICONS)];

export default function CropCalendar() {
  const [chosenCrop, setSelectedCrop] = useState(null);
  const [filter, setFilter] = useState('all');
  const currentMonth = MONTHS[new Date().getMonth()];
  const catalog = useApiResource({ url: '/api/calendar/crops' });
  const crops = catalog.data?.crops || [];
  const selectedCrop = chosenCrop || crops[0]?.key;
  const schedule = useApiResource(selectedCrop ? { url: '/api/calendar/' + encodeURIComponent(selectedCrop) } : null);
  const calendar = schedule.data;
  const loading = catalog.loading;
  const calLoading = schedule.loading;
  const error = catalog.error || schedule.error;
  const reload = () => { catalog.reload(); schedule.reload(); };
  const filteredTasks = useCallback((tasks) => {
    if (filter === "all") return tasks;
    return tasks.filter(t => t.type === filter);
  }, [filter]);

  return (
    <div style={{ padding: "16px 20px", maxWidth: 1200, margin: "0 auto" }}>
      <RequestStatus loading={loading} error={error} onRetry={reload} />
      <PageHeader
        title="Crop Calendar"
        subtitle="Month-by-month ICAR-aligned agronomic schedule"
        icon={<Calendar size={22} color="#22c55e" />}
      />

      {/* Crop selector */}
      <PremiumCard style={{ marginBottom: 20 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: "var(--fk-text-sub)", marginRight: 4 }}>Select Crop:</span>
          {loading ? (
            <span style={{ fontSize: 14, color: "#64748b" }}>Loading crops…</span>
          ) : crops.map(c => (
            <button
              key={c.key}
              onClick={() => setSelectedCrop(c.key)}
              style={{
                padding: "6px 14px",
                borderRadius: 20,
                border: "1.5px solid " + (selectedCrop === c.key ? "#22c55e" : "var(--fk-border)"),
                background: selectedCrop === c.key ? "#22c55e" : "var(--fk-card)",
                color: selectedCrop === c.key ? "#ffffff" : "var(--fk-text-sub)",
                fontWeight: 700,
                fontSize: 13,
                cursor: "pointer",
                transition: "all 0.15s ease",
              }}
            >{c.name}</button>
          ))}
        </div>
        {calendar && (
          <div style={{ marginTop: 10, fontSize: 13, color: "#64748b" }}>
            📅 Season: <strong>{calendar.season}</strong>
          </div>
        )}
      </PremiumCard>

      {/* Filter by task type */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 16 }}>
        {FILTER_OPTIONS.map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "4px 12px",
              borderRadius: 14,
              border: "1px solid " + (filter === f ? "#22c55e" : "var(--fk-border)"),
              background: filter === f ? "rgba(34,197,94,0.12)" : "var(--fk-card)",
              color: filter === f ? "#16a34a" : "#64748b",
              fontWeight: 600,
              fontSize: 12,
              cursor: "pointer",
            }}
          >
            {f === "all" ? "All Tasks" : TASK_ICONS[f].icon + " " + TASK_ICONS[f].label}
          </button>
        ))}
      </div>

      {/* Calendar grid */}
      {calLoading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading calendar…</div>
      ) : calendar ? (
        <div className="calendar-grid">
          {MONTHS.map(month => {
            const raw = calendar.months?.[month] || [];
            const tasks = filteredTasks(raw);
            const isCurrent = month === currentMonth;
            return (
              <div
                key={month}
                className="calendar-month-card"
                style={isCurrent ? { border: "2px solid #22c55e", boxShadow: "0 0 0 3px rgba(34,197,94,0.12)" } : {}}
              >
                <div className="calendar-month-name">
                  {isCurrent ? "📍 " : ""}
                  {month}
                  {isCurrent && <span style={{ marginLeft: "auto", fontSize: 11, background: "#22c55e", color: "#fff", padding: "1px 6px", borderRadius: 8 }}>Now</span>}
                </div>
                {tasks.length === 0 ? (
                  <div style={{ fontSize: 12, color: "#94a3b8", padding: "4px 0" }}>{filter !== "all" ? "No " + filter + " tasks" : "No tasks scheduled"}</div>
                ) : tasks.map((t, i) => (
                  <div key={i} className="calendar-task-item">
                    <span className="calendar-task-icon">{TASK_ICONS[t.type]?.icon || "📋"}</span>
                    <span>{t.task}</span>
                  </div>
                ))}
                {raw.length > 0 && filter !== "all" && tasks.length === 0 && (
                  <div style={{ fontSize: 11, color: "#94a3b8", marginTop: 4 }}>{raw.length} other task(s)</div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Select a crop to view its calendar.</div>
      )}
    </div>
  );
}
