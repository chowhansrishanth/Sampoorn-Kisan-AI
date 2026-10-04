import useApiResource from '../hooks/useApiResource';
import RequestStatus from '../components/ui/RequestStatus';

import axios from "../api/client";
import { Bell, AlertTriangle, Info, X, RefreshCw, CheckCircle2 } from "lucide-react";
import PremiumCard from "../components/ui/PremiumCard";
import PageHeader from "../components/ui/PageHeader";

const SEVERITY_CONFIG = {
  critical: { cls: "critical", icon: AlertTriangle, label: "Critical" },
  warning:  { cls: "warning",  icon: AlertTriangle, label: "Warning" },
  advisory: { cls: "advisory", icon: Info,          label: "Advisory" },
};

export default function FarmerAlerts({ user }) {
  const farmerId = user?.id || user?._id || 'guest';
  const { data, loading, error, reload } = useApiResource({ url: '/api/alerts/' + farmerId });
  const alerts = data?.alerts || [];
  const fetchAlerts = reload;
  const dismiss = async (alertId) => {
    try { await axios.post('/api/alerts/dismiss/' + alertId, { farmerId }); await reload(); }
    catch { await reload(); }
  };
  const criticalCount = alerts.filter(a => a.severity === "critical").length;
  const warningCount = alerts.filter(a => a.severity === "warning").length;

  return (
    <div style={{ padding: "16px 20px", maxWidth: 900, margin: "0 auto" }}>
      <RequestStatus loading={loading} error={error} onRetry={reload} />
      <PageHeader
        title="Farmer Alerts"
        subtitle="Weather, pest, and seasonal advisory notifications"
        icon={<Bell size={22} color="#f59e0b" />}
      />

      {/* Summary pills */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap" }}>
        {[
          { label: "Critical", count: criticalCount, color: "#dc2626", bg: "rgba(239,68,68,0.10)" },
          { label: "Warnings", count: warningCount, color: "#d97706", bg: "rgba(245,158,11,0.10)" },
          { label: "Advisories", count: alerts.filter(a => a.severity === "advisory").length, color: "#0284c7", bg: "rgba(2,132,199,0.10)" },
          { label: "Total Active", count: alerts.length, color: "#059669", bg: "rgba(16,185,129,0.10)" },
        ].map(p => (
          <div key={p.label} style={{ display: "flex", alignItems: "center", gap: 8, padding: "8px 16px", borderRadius: 10, background: p.bg, fontWeight: 700, fontSize: 14 }}>
            <span style={{ color: p.color, fontSize: 19.5, fontWeight: 900 }}>{p.count}</span>
            <span style={{ color: "var(--fk-text-sub)" }}>{p.label}</span>
          </div>
        ))}
        <button
          onClick={fetchAlerts}
          disabled={loading}
          style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 10, background: "var(--fk-card)", border: "1px solid var(--fk-border)", fontWeight: 600, fontSize: 13, cursor: "pointer", color: "var(--fk-text-sub)" }}
        >
          <RefreshCw size={13} style={{ animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {/* Alert list */}
      {loading && alerts.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading alerts…</div>
      ) : alerts.length === 0 ? (
        <PremiumCard style={{ textAlign: "center", padding: 40 }}>
          <CheckCircle2 size={40} color="#22c55e" style={{ margin: "0 auto 12px" }} />
          <div style={{ fontWeight: 800, fontSize: 17, color: "var(--fk-text)" }}>All Clear! No active alerts.</div>
          <div style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>Your farm is currently free of weather or pest warnings.</div>
        </PremiumCard>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
          {alerts.map(alert => {
            const cfg = SEVERITY_CONFIG[alert.severity] || SEVERITY_CONFIG.advisory;
            const Icon = cfg.icon;
            return (
              <div key={alert.id} className={`alert-banner ${cfg.cls}`}>
                <Icon size={18} style={{ flexShrink: 0, marginTop: 1 }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 800, fontSize: 14, marginBottom: 2 }}>{alert.title}</div>
                  <div style={{ fontWeight: 400, fontSize: 13, lineHeight: 1.5 }}>{alert.message}</div>
                  <div style={{ fontSize: 11, opacity: 0.6, marginTop: 4 }}>{new Date(alert.createdAt).toLocaleString()}</div>
                </div>
                <button className="alert-dismiss-btn" onClick={() => dismiss(alert.id)} title="Dismiss alert">
                  <X size={14} />
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
