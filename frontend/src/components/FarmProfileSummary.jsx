import { MapPin, Sprout, Droplets, Globe, Calendar, Edit3 } from "lucide-react";

export default function FarmProfileSummary({ user, onEdit }) {
  const profile = user?.farmProfile || {};
  const crops = profile.crops || [
    { name: user?.cropType || "Wheat & Rice", icon: "🌾", isPrimary: true }
  ];
  const location = user?.location || profile?.location?.formattedAddress || "Hyderabad, Telangana, India";
  const landSize = user?.landSize || `${profile?.land?.sizeAcres || 3} Acres`;
  const soil = profile.soilType || "Black Soil";
  const season = profile.season || "Kharif";
  const irrigation = Array.isArray(profile.irrigation) ? profile.irrigation.join(", ") : "Borewell + Drip";

  return (
    <div className="farm-summary-card" style={{
      background: "var(--fk-card)",
      border: "1px solid var(--fk-border)",
      borderRadius: "8px",
      padding: "20px",
      boxShadow: "0 4px 16px rgba(0,0,0,0.06)",
      display: "flex",
      flexDirection: "column",
      gap: "16px"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <div style={{ width: "36px", height: "36px", borderRadius: "50%", background: "rgba(40, 116, 240, 0.15)", color: "#2874f0", display: "grid", placeItems: "center" }}>
            <Sprout size={20} />
          </div>
          <div>
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>🌾 My Farm</h3>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>AI Decision Support Active</span>
          </div>
        </div>

        <button
          type="button"
          onClick={onEdit}
          style={{
            background: "rgba(40, 116, 240, 0.1)",
            border: "1px solid #2874f0",
            color: "#2874f0",
            padding: "6px 12px",
            borderRadius: "4px",
            fontSize: "12px",
            fontWeight: "700",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: "4px"
          }}
        >
          <Edit3 size={13} /> Edit Farm Profile
        </button>
      </div>

      {/* KPI Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "10px",
        background: "rgba(0,0,0,0.02)",
        padding: "12px",
        borderRadius: "6px",
        border: "1px solid var(--fk-border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--fk-text)" }}>
          <MapPin size={15} color="#2874f0" /> <span>{location.split(",")[0] || location}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--fk-text)" }}>
          📐 <span>{landSize}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--fk-text)" }}>
          🌱 <span>{crops.length} Crop{crops.length > 1 ? "s" : ""}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--fk-text)" }}>
          <Droplets size={15} color="#00bcd4" /> <span style={{ textTransform: "capitalize" }}>{irrigation}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--fk-text)" }}>
          <Globe size={15} color="#795548" /> <span style={{ textTransform: "capitalize" }}>{soil}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", color: "var(--fk-text)" }}>
          <Calendar size={15} color="#ff9800" /> <span style={{ textTransform: "capitalize" }}>{season}</span>
        </div>
      </div>

      {/* Crops Tag List */}
      <div>
        <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "block", marginBottom: "6px" }}>
          Cultivated Crops
        </span>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
          {crops.map(c => (
            <span
              key={c.name}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                padding: "4px 10px",
                borderRadius: "14px",
                fontSize: "12px",
                fontWeight: "600",
                background: c.isPrimary ? "rgba(40, 116, 240, 0.15)" : "var(--fk-card)",
                border: c.isPrimary ? "1px solid #2874f0" : "1px solid var(--fk-border)",
                color: "var(--fk-text)"
              }}
            >
              <span>{c.icon || "🌱"}</span>
              <span>{c.name}</span>
              {c.isPrimary && <strong style={{ color: "#2874f0", fontSize: "10px" }}> (PRIMARY)</strong>}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
