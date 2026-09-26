import useApiResource from '../hooks/useApiResource';
import { useState } from "react";
import axios from "../api/client";
import { Shield, Users, Activity, RefreshCw, ToggleLeft, ToggleRight, TrendingUp } from "lucide-react";
import PremiumCard from "../components/ui/PremiumCard";
import PageHeader from "../components/ui/PageHeader";
import { StatCard } from "../components/ui/StatCard";

const API = (path) => `/api/admin${path}`;

function UserRow({ u, onToggle, currentUserId }) {
  const isSelf = u.id === currentUserId;
  return (
    <tr>
      <td>
        <div style={{ fontWeight: 700, fontSize: 13 }}>{u.name || "—"}</div>
        <div style={{ fontSize: 11, color: "#64748b" }}>{u.email}</div>
      </td>
      <td style={{ fontSize: 12 }}>{u.phone || "—"}</td>
      <td>
        <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: u.role === "admin" ? "rgba(139,92,246,0.12)" : "rgba(16,185,129,0.10)", color: u.role === "admin" ? "#7c3aed" : "#059669" }}>
          {u.role || "farmer"}
        </span>
      </td>
      <td style={{ fontSize: 11 }}>{u.location || "—"}</td>
      <td>
        <span style={{ padding: "2px 8px", borderRadius: 10, fontSize: 11, fontWeight: 700, background: u.isActive ? "rgba(34,197,94,0.10)" : "rgba(239,68,68,0.10)", color: u.isActive ? "#16a34a" : "#dc2626" }}>
          {u.isActive ? "Active" : "Inactive"}
        </span>
      </td>
      <td>
        {isSelf ? (
          <span style={{ fontSize: 11, color: "#94a3b8" }}>You</span>
        ) : (
          <button
            onClick={() => onToggle(u.id, !u.isActive)}
            title={u.isActive ? "Deactivate user" : "Activate user"}
            style={{ background: "none", border: "none", cursor: "pointer", color: u.isActive ? "#ef4444" : "#22c55e", display: "flex", alignItems: "center", gap: 4, fontSize: 11 }}
          >
            {u.isActive ? <ToggleLeft size={18} /> : <ToggleRight size={18} />}
            {u.isActive ? "Deactivate" : "Activate"}
          </button>
        )}
      </td>
    </tr>
  );
}

export default function AdminPanel({ user }) {

  const [tab, setTab] = useState("overview");
  const [actionMsg, setActionMsg] = useState(null);
  const { data, loading, error, reload: load } = useApiResource([{ url: API('/stats') }, { url: API('/users') }]);
  const stats = data?.[0]?.stats;
  const users = data?.[1]?.users || [];

  const handleToggle = async (userId, isActive) => {
    try {
      await axios.put(API(`/users/${userId}/status`), { isActive });
      await load();
      setActionMsg({ type: "advisory", text: `User ${isActive ? "activated" : "deactivated"} successfully.` });
      setTimeout(() => setActionMsg(null), 3000);
    } catch {
      setActionMsg({ type: "critical", text: "Failed to update user status." });
    }
  };

  const tabStyle = (t) => ({
    padding: "7px 18px",
    borderRadius: 8,
    border: "1px solid " + (tab === t ? "#22c55e" : "var(--fk-border)"),
    background: tab === t ? "#22c55e" : "var(--fk-card)",
    color: tab === t ? "#ffffff" : "var(--fk-text-sub)",
    fontWeight: 700,
    fontSize: 12,
    cursor: "pointer",
  });

  return (
    <div style={{ padding: "16px 20px", maxWidth: 1200, margin: "0 auto" }}>
      {error && <p role="alert">{error}</p>}
      <PageHeader
        title="Admin Panel"
        subtitle="Farmer management and system analytics"
        icon={<Shield size={22} color="#7c3aed" />}
      />

      {actionMsg && (
        <div className={`alert-banner ${actionMsg.type}`} style={{ marginBottom: 16 }}>
          {actionMsg.text}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        <button style={tabStyle("overview")} onClick={() => setTab("overview")}>📊 Overview</button>
        <button style={tabStyle("users")} onClick={() => setTab("users")}>👥 Users</button>
        <button
          style={{ ...tabStyle("refresh"), marginLeft: "auto" }}
          onClick={load}
          disabled={loading}
        >
          <RefreshCw size={13} style={{ display: "inline", marginRight: 4, animation: loading ? "spin 1s linear infinite" : "none" }} />
          Refresh
        </button>
      </div>

      {loading && !stats ? (
        <div style={{ padding: 40, textAlign: "center", color: "#64748b" }}>Loading admin data…</div>
      ) : (
        <>
          {tab === "overview" && stats && (
            <>
              <div className="admin-stat-grid">
                <StatCard icon={<Users size={20} />} label="Total Users" value={stats.totalUsers} color="var(--primary-light)" />
                <StatCard icon={<Activity size={20} />} label="Active Users" value={stats.activeUsers} color="#22c55e" />
                <StatCard icon={<TrendingUp size={20} />} label="Daily Active (24h)" value={stats.dailyActive} color="#f59e0b" />
                <StatCard icon={<Shield size={20} />} label="Admin Accounts" value={stats.adminCount} color="#7c3aed" />
              </div>
              <PremiumCard>
                <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>⚙️ System Status</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
                  {[
                    { label: "Uptime", value: Math.floor(stats.uptimeSeconds / 60) + "m " + (stats.uptimeSeconds % 60) + "s" },
                    { label: "Heap Memory", value: stats.memoryMB + " MB" },
                    { label: "Node.js", value: stats.nodeVersion },
                    { label: "Environment", value: stats.environment },
                  ].map(row => (
                    <div key={row.label} style={{ padding: 12, borderRadius: 8, background: "var(--primary-surface)", border: "1px solid var(--primary-border)" }}>
                      <div style={{ fontSize: 11, color: "#64748b" }}>{row.label}</div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "var(--fk-text)" }}>{row.value}</div>
                    </div>
                  ))}
                </div>
              </PremiumCard>
            </>
          )}

          {tab === "users" && (
            <PremiumCard>
              <div style={{ fontSize: 14, fontWeight: 800, marginBottom: 16 }}>👥 All Farmer Accounts ({users.length})</div>
              <div style={{ overflowX: "auto" }}>
                <table className="admin-user-table">
                  <thead>
                    <tr>
                      <th>Name / Email</th>
                      <th>Phone</th>
                      <th>Role</th>
                      <th>Location</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map(u => (
                      <UserRow key={u.id} u={u} onToggle={handleToggle} currentUserId={user?.id} />
                    ))}
                  </tbody>
                </table>
              </div>
            </PremiumCard>
          )}
        </>
      )}
    </div>
  );
}
