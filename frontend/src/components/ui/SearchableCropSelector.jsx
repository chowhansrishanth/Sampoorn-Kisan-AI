import { useState, useMemo } from "react";
import { Search, X, Check, Star, ShieldAlert, Sprout } from "lucide-react";
import { CROP_CATEGORIES, GROWTH_STAGES, searchCrops } from "../../data/cropsData";
import { useLanguage } from "../../context/LanguageContext";

export default function SearchableCropSelector({
  selectedCrops = [],
  onChange,
  totalFarmArea = 5,
  landUnit = "Acres"
}) {
  const { t } = useLanguage();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [showAreaDetails, setShowAreaDetails] = useState(true);

  // Filter crops based on query and category
  const filteredCrops = useMemo(() => {
    return searchCrops(searchQuery, activeCategory);
  }, [searchQuery, activeCategory]);

  // Calculate total allocated crop area
  const totalAllocatedArea = useMemo(() => {
    return selectedCrops.reduce((acc, c) => acc + (parseFloat(c.area) || 0), 0);
  }, [selectedCrops]);

  const isAreaExceeded = totalFarmArea > 0 && totalAllocatedArea > totalFarmArea;

  const handleToggleCrop = (crop) => {
    const exists = selectedCrops.find(c => c.name === crop.name || c.id === crop.id);
    if (exists) {
      // Remove crop
      const updated = selectedCrops.filter(c => c.name !== crop.name && c.id !== crop.id);
      onChange(updated);
    } else {
      // Add crop with default metadata
      const isFirst = selectedCrops.length === 0;
      const newCropItem = {
        id: crop.id,
        name: crop.name,
        icon: crop.icon,
        category: crop.category,
        isPrimary: isFirst,
        area: 0,
        stage: "Vegetative Growth"
      };
      onChange([...selectedCrops, newCropItem]);
    }
  };

  const handleRemoveCrop = (cropName) => {
    const updated = selectedCrops.filter(c => c.name !== cropName);
    // If we removed the primary crop, assign primary to the first remaining crop
    if (updated.length > 0 && !updated.some(c => c.isPrimary)) {
      updated[0].isPrimary = true;
    }
    onChange(updated);
  };

  const handleClearAll = () => {
    onChange([]);
  };

  const handleSetPrimary = (cropName) => {
    const updated = selectedCrops.map(c => ({
      ...c,
      isPrimary: c.name === cropName
    }));
    onChange(updated);
  };

  const handleUpdateCropField = (cropName, field, value) => {
    const updated = selectedCrops.map(c => {
      if (c.name === cropName) {
        return { ...c, [field]: value };
      }
      return c;
    });
    onChange(updated);
  };

  return (
    <div className="scs-wrapper" style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
      {/* Search Input & Category Pills */}
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
        <div style={{
          position: "relative",
          display: "flex",
          alignItems: "center",
          background: "var(--fk-card)",
          border: "1px solid var(--fk-border)",
          borderRadius: "6px",
          padding: "8px 12px",
          boxShadow: "0 1px 3px rgba(0,0,0,0.05)"
        }}>
          <Search size={18} color="var(--fk-text-sub)" style={{ flexShrink: 0, marginRight: "10px" }} />
          <input
            type="text"
            placeholder={t("Search crops by English or Indian names (e.g. Tomato, Tur, Chana, Jowar, Bajra, Bhendi)...", "Search crops by English or Indian names (e.g. Tomato, Tur, Chana, Jowar, Bajra, Bhendi)...")}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              border: "none",
              outline: "none",
              background: "transparent",
              color: "var(--fk-text)",
              fontSize: "15px",
              width: "100%"
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery("")}
              style={{ background: "none", border: "none", color: "var(--fk-text-sub)", cursor: "pointer", padding: "2px" }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Horizontal Filter Pills */}
        <div style={{
          display: "flex",
          gap: "6px",
          overflowX: "auto",
          paddingBottom: "4px",
          scrollbarWidth: "none"
        }}>
          {CROP_CATEGORIES.map(cat => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "600",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                  border: isActive ? "1px solid #2874f0" : "1px solid var(--fk-border)",
                  background: isActive ? "rgba(40, 116, 240, 0.12)" : "var(--fk-card)",
                  color: isActive ? "#2874f0" : "var(--fk-text-sub)"
                }}
              >
                <span>{cat.icon}</span>
                <span>{t(cat.label, cat.label)}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Crop Chips */}
      {selectedCrops.length > 0 && (
        <div style={{
          background: "rgba(40, 116, 240, 0.04)",
          border: "1px solid rgba(40, 116, 240, 0.15)",
          borderRadius: "6px",
          padding: "12px"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
            <span style={{ fontSize: "13px", fontWeight: "700", color: "#2874f0", textTransform: "uppercase", letterSpacing: "0.03em" }}>
              {t("Selected Crops", "Selected Crops")} ({selectedCrops.length})
            </span>
            <button
              type="button"
              onClick={handleClearAll}
              style={{
                background: "none",
                border: "none",
                fontSize: "13px",
                color: "#d32f2f",
                fontWeight: "700",
                cursor: "pointer",
                textDecoration: "underline"
              }}
            >
              {t("Clear all", "Clear all")}
            </button>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
            {selectedCrops.map(crop => (
              <div
                key={crop.name}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  padding: "5px 10px",
                  borderRadius: "16px",
                  background: crop.isPrimary ? "rgba(40, 116, 240, 0.15)" : "var(--fk-card)",
                  border: crop.isPrimary ? "1px solid #2874f0" : "1px solid var(--fk-border)",
                  color: "var(--fk-text)",
                  fontSize: "14px",
                  fontWeight: "600"
                }}
              >
                <span>{crop.icon}</span>
                <span>{t(crop.name, crop.name)}</span>
                {crop.isPrimary && (
                  <span style={{
                    fontSize: "11px",
                    fontWeight: "800",
                    background: "#2874f0",
                    color: "#ffffff",
                    padding: "1px 5px",
                    borderRadius: "8px"
                  }}>
                    {t("PRIMARY", "PRIMARY")}
                  </span>
                )}
                <button
                  type="button"
                  onClick={() => handleRemoveCrop(crop.name)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "var(--fk-text-sub)",
                    cursor: "pointer",
                    padding: "0 2px",
                    display: "grid",
                    placeItems: "center"
                  }}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>

          {/* Area Allocation Validator */}
          {totalFarmArea > 0 && (
            <div style={{ marginTop: "12px", paddingTop: "8px", borderTop: "1px dashed rgba(40, 116, 240, 0.2)", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13px" }}>
              <span style={{ color: "var(--fk-text-sub)", fontWeight: "600" }}>
                {t("Crop Area Allocated", "Crop Area Allocated")}: <strong>{totalAllocatedArea} {t(landUnit, landUnit)}</strong> / <strong>{totalFarmArea} {t(landUnit, landUnit)}</strong>
              </span>
              {isAreaExceeded && (
                <span style={{ color: "#d32f2f", fontWeight: "700", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <ShieldAlert size={14} /> {t("Allocated area exceeds total land!", "Allocated area exceeds total land!")}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Grid of Searchable Crops */}
      <div style={{
        maxHeight: "220px",
        overflowY: "auto",
        border: "1px solid var(--fk-border)",
        borderRadius: "6px",
        padding: "8px",
        background: "var(--fk-card)",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))",
        gap: "8px"
      }}>
        {filteredCrops.length === 0 ? (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", padding: "20px", color: "var(--fk-text-sub)", fontSize: "14px" }}>
            {t("No matching crops found", "No matching crops found")} "{searchQuery}".
          </div>
        ) : (
          filteredCrops.map(crop => {
            const isSelected = selectedCrops.some(c => c.name === crop.name || c.id === crop.id);
            return (
              <button
                key={crop.id}
                type="button"
                onClick={() => handleToggleCrop(crop)}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "8px 10px",
                  borderRadius: "6px",
                  border: isSelected ? "1px solid #388e3c" : "1px solid var(--fk-border)",
                  background: isSelected ? "rgba(56, 142, 60, 0.1)" : "var(--fk-card)",
                  color: "var(--fk-text)",
                  cursor: "pointer",
                  textAlign: "left",
                  transition: "all 0.15s ease"
                }}
              >
                <div style={{
                  width: "20px",
                  height: "20px",
                  borderRadius: "4px",
                  border: isSelected ? "none" : "1px solid var(--fk-border)",
                  background: isSelected ? "#388e3c" : "transparent",
                  color: "#ffffff",
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0
                }}>
                  {isSelected && <Check size={14} />}
                </div>
                <span style={{ fontSize: "17px" }}>{crop.icon}</span>
                <span style={{ fontSize: "14px", fontWeight: "600", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", flex: 1 }}>
                  {t(crop.name, crop.name)}
                </span>
              </button>
            );
          })
        )}
      </div>

      {/* Per-Crop Config Details (Primary Tag, Area, Growth Stage) */}
      {selectedCrops.length > 0 && (
        <div style={{
          border: "1px solid var(--fk-border)",
          borderRadius: "6px",
          padding: "12px",
          background: "var(--fk-card)"
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <span style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)", display: "flex", alignItems: "center", gap: "6px" }}>
              <Sprout size={16} color="#2874f0" /> {t("Primary & Secondary Crop Details", "Primary & Secondary Crop Details")}
            </span>
            <button
              type="button"
              className="lg-text-btn"
              style={{ fontSize: "13px" }}
              onClick={() => setShowAreaDetails(!showAreaDetails)}
            >
              {showAreaDetails ? t("Hide Details", "Hide Details") : t("Configure Area & Stages", "Configure Area & Stages")}
            </button>
          </div>

          {showAreaDetails && (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {selectedCrops.map(crop => (
                <div
                  key={crop.name}
                  style={{
                    padding: "10px 12px",
                    borderRadius: "6px",
                    background: "rgba(0,0,0,0.02)",
                    border: "1px solid var(--fk-border)",
                    display: "flex",
                    flexDirection: "column",
                    gap: "8px"
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <span style={{ fontSize: "17px" }}>{crop.icon}</span>
                      <strong style={{ fontSize: "15px", color: "var(--fk-text)" }}>{t(crop.name, crop.name)}</strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleSetPrimary(crop.name)}
                      style={{
                        background: crop.isPrimary ? "rgba(40, 116, 240, 0.15)" : "transparent",
                        border: crop.isPrimary ? "1px solid #2874f0" : "1px solid var(--fk-border)",
                        color: crop.isPrimary ? "#2874f0" : "var(--fk-text-sub)",
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "700",
                        cursor: "pointer",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px"
                      }}
                    >
                      <Star size={12} fill={crop.isPrimary ? "#2874f0" : "none"} />
                      {crop.isPrimary ? t("Primary Crop", "Primary Crop") : t("Set as Primary", "Set as Primary")}
                    </button>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", display: "block", marginBottom: "4px" }}>
                        {t("Crop Area", "Crop Area")} ({t(landUnit, landUnit)})
                      </label>
                      <input
                        type="number"
                        min="0"
                        step="0.1"
                        placeholder="e.g. 2.5"
                        value={crop.area || ""}
                        onChange={(e) => handleUpdateCropField(crop.name, "area", parseFloat(e.target.value) || 0)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--fk-border)",
                          fontSize: "14px",
                          background: "var(--fk-card)",
                          color: "var(--fk-text)"
                        }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", display: "block", marginBottom: "4px" }}>
                        {t("Growth Stage", "Growth Stage")}
                      </label>
                      <select
                        value={crop.stage || "Vegetative Growth"}
                        onChange={(e) => handleUpdateCropField(crop.name, "stage", e.target.value)}
                        style={{
                          width: "100%",
                          padding: "6px 8px",
                          borderRadius: "4px",
                          border: "1px solid var(--fk-border)",
                          fontSize: "14px",
                          background: "var(--fk-card)",
                          color: "var(--fk-text)"
                        }}
                      >
                        {GROWTH_STAGES.map(stage => (
                          <option key={stage} value={stage}>{t(stage, stage)}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
