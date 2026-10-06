import { useState } from "react";
import { MapPin, Sprout, Droplets, Globe, Calendar, Edit3, Volume2, VolumeX } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import useVoiceAssistant from "../hooks/useVoiceAssistant";

/**
 * Returns vernacular audio speech text for Farm Profile Summary
 * Supports native regional script + phonetic transliteration for all 9 Indian languages.
 */
function getFarmProfileVoiceText(user, language) {
  const name = user?.name ? user.name.split(" ")[0] : "Kisan";
  const profile = user?.farmProfile || {};
  const crops = profile.crops || [{ name: user?.cropType || "Cotton", isPrimary: true }];
  const primaryCrop = crops.find(c => c.isPrimary)?.name || crops[0]?.name || "Crop";
  const loc = (user?.location || profile?.location?.district || "Your Area").split(",")[0];
  const acres = profile?.land?.sizeAcres || user?.landSize?.split(" ")[0] || "3";
  const season = profile.season || "kharif";

  const voiceMap = {
    EN: {
      native: `Farmer ${name}, here is your farm profile. Location: ${loc}. Total land: ${acres} acres. Main crop: ${primaryCrop}. Season: ${season}. AI crop decisions and weather alerts are actively customized for your field.`,
      phonetic: `Farmer ${name}, here is your farm profile. Location: ${loc}. Total land: ${acres} acres. Main crop: ${primaryCrop}. Season: ${season}. AI crop decisions and weather alerts are actively customized for your field.`
    },
    HI: {
      native: `किसान ${name} जी, यह आपका खेत प्रोफाइल है। स्थान: ${loc}, कुल भूमि: ${acres} एकड़, मुख्य फसल: ${primaryCrop}, मौसम: ${season}। आपके खेत के अनुसार एआई सलाह और मौसम अलर्ट सक्रिय हैं।`,
      phonetic: `Kisan ${name} ji, yeh aapka khet profile hai. Sthaan: ${loc}, kul bhoomi: ${acres} acre, mukhya fasal: ${primaryCrop}, mausam: ${season}. Aapke khet ke anusaar AI salaah aur mausam alert sakriya hain.`
    },
    TE: {
      native: `రైతు ${name} గారూ, ఇది మీ వ్యవసాయ ప్రొఫైల్. ప్రాంతం: ${loc}, మొత్తం భూమి: ${acres} ఎకరాలు, ప్రధాన పంట: ${primaryCrop}, సీజన్: ${season}. మీ పొలానికి అనుగుణంగా AI సలహాలు మరియు వాతావరణ సమాచారం సిద్ధంగా ఉన్నాయి.`,
      phonetic: `Raitu ${name} gaaru, idi mee vyavasaaya profile. Praantham: ${loc}, mottham bhoomi: ${acres} ekaralu, pradhaana panta: ${primaryCrop}, season: ${season}. Mee polaani ki anugunangaa AI salahaalu mariyu vaathaavarana samaachaaram siddhangaa unnaayi.`
    },
    TA: {
      native: `விவசாயி ${name}, இது உங்கள் பண்ணை சுயவிவரம். இடம்: ${loc}, மொத்த நிலம்: ${acres} ஏக்கர், முதன்மை பயிர்: ${primaryCrop}, பருவம்: ${season}. உங்கள் பண்ணைக்கான AI பரிந்துரைகள் மற்றும் வானிலை எச்சரிக்கைகள் தயாராக உள்ளன.`,
      phonetic: `Vivasaayi ${name}, idhu ungal pannai suyavivaram. Idam: ${loc}, mottha nilam: ${acres} acre, mudhanmai payir: ${primaryCrop}, paruvam: ${season}. Ungal pannaikkaana AI parindhuraigal matrum vaanilai echarikkaigal thayaaraaga ullana.`
    },
    KN: {
      native: `ರೈತ ${name} ಅವರೇ, ಇದು ನಿಮ್ಮ ಕೃಷಿ ಪ್ರೊಫೈಲ್. ಸ್ಥಳ: ${loc}, ಒಟ್ಟು ಜಮೀನು: ${acres} ಎಕರೆ, ಮುಖ್ಯ ಬೆಳೆ: ${primaryCrop}, ಹಂಗಾಮು: ${season}. ನಿಮ್ಮ ಜಮೀನಿಗೆ ಸೂಕ್ತವಾದ AI ಸಲಹೆಗಳು ಮತ್ತು ಹವಾಮಾನ ಮುನ್ಸೂಚನೆ ಸಕ್ರಿಯವಾಗಿದೆ.`,
      phonetic: `Raita ${name} avare, idu nimma krushi profile. Sthala: ${loc}, ottu jameenu: ${acres} ekare, mukhya bele: ${primaryCrop}, hangaamu: ${season}. Nimma jameenige sookthavaada AI salahegalu matthu havaamaana munsoochane sakriyavaagide.`
    },
    MR: {
      native: `शेतकरी ${name} जी, हे आपले शेत प्रोफाइल आहे. ठिकाण: ${loc}, एकूण जमीन: ${acres} एकर, मुख्य पीक: ${primaryCrop}, हंगाम: ${season}. आपल्या शेतानुसार AI सल्ला व हवामान अंदाज सक्रिय आहेत.`,
      phonetic: `Shetkari ${name} ji, he aaple shet profile aahe. Thikaan: ${loc}, ekun jameen: ${acres} acre, mukhya peek: ${primaryCrop}, hangaam: ${season}. Aaplya shetaanusaar AI salla va havaamaan andaaz sakriya aahet.`
    },
    PA: {
      native: `ਕਿਸਾਨ ${name} ਜੀ, ਇਹ ਤੁਹਾਡਾ ਖੇਤ ਪ੍ਰੋਫਾਈਲ ਹੈ। ਸਥਾਨ: ${loc}, ਕੁੱਲ ਜ਼ਮੀਨ: ${acres} ਏਕੜ, ਮੁੱਖ ਫਸਲ: ${primaryCrop}, ਸੀਜ਼ਨ: ${season}। ਤੁਹਾਡੇ ਖੇਤ ਮੁਤਾਬਕ AI ਸਲਾਹ ਅਤੇ ਮੌਸਮ ਅਲਰਟ ਸਰਗਰਮ ਹਨ।`,
      phonetic: `Kisaan ${name} ji, eh tuhada khet profile hai. Sthaan: ${loc}, kull zameen: ${acres} acre, mukh fasal: ${primaryCrop}, season: ${season}. Tuhade khet mutaabak AI salaah atey mausam alert sargaram han.`
    },
    BN: {
      native: `কৃষক ${name} বাবু, এটি আপনার খামার প্রোফাইল। স্থান: ${loc}, মোট জমি: ${acres} একর, প্রধান ফসল: ${primaryCrop}, মৌসুম: ${season}। আপনার খামার অনুযায়ী AI পরামর্শ ও আবহাওয়া বার্তা সক্রিয় রয়েছে।`,
      phonetic: `Krishok ${name} baabu, eti aponar khamar profile. Sthaan: ${loc}, mot jomi: ${acres} acre, prodhaan foshul: ${primaryCrop}, moushum: ${season}. Aponar khamar onujaayi AI poramorsho o aabohaawa baarta shokriyo royechhe.`
    },
    GU: {
      native: `ખેડૂત ${name} ભાઈ, આ તમારી ખેત પ્રોફાઇલ છે. સ્થળ: ${loc}, કુલ જમીન: ${acres} એકર, મુખ્ય પાક: ${primaryCrop}, મોસમ: ${season}. તમારા ખેતર અનુસાર AI સલાહ અને હવામાન એલર્ટ સક્રિય છે.`,
      phonetic: `Khedut ${name} bhai, aa tamaari khet profile chhe. Sthal: ${loc}, kul jameen: ${acres} acre, mukhya paak: ${primaryCrop}, mosam: ${season}. Tamaara khetar anusaar AI salaah ane havaamaan alert sakriya chhe.`
    }
  };

  return voiceMap[language] || voiceMap.EN;
}

export default function FarmProfileSummary({ user, onEdit }) {
  const { language, t } = useLanguage();
  const { isSpeaking, speak, stopSpeaking } = useVoiceAssistant(language);

  const profile = user?.farmProfile || {};
  const crops = profile.crops || [
    { name: user?.cropType || "Bt Hybrid Cotton", icon: "🌿", isPrimary: true }
  ];
  const location = user?.location || profile?.location?.formattedAddress || "Hyderabad, Telangana, India";
  const landAcres = profile?.land?.sizeAcres || user?.landSize?.split(" ")[0] || 3;
  const landUnit = profile?.land?.unit || "Acres";
  const soil = profile.soilType || "black";
  const season = profile.season || "kharif";
  const irrigation = Array.isArray(profile.irrigation) ? profile.irrigation : ["borewell", "drip"];

  const handleVoicePlay = () => {
    if (isSpeaking) {
      stopSpeaking();
    } else {
      const guidance = getFarmProfileVoiceText(user, language);
      speak(guidance.native, language, guidance.phonetic);
    }
  };

  return (
    <div
      className="farm-summary-card glass-card"
      style={{
        background: "linear-gradient(135deg, rgba(0, 105, 72, 0.05) 0%, rgba(40, 116, 240, 0.04) 100%)",
        border: "1.5px solid rgba(0, 105, 72, 0.25)",
        borderRadius: "12px",
        padding: "18px 20px",
        marginBottom: "20px",
        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.04)",
        display: "flex",
        flexDirection: "column",
        gap: "14px"
      }}
    >
      {/* Header with Title, Voice Assistant and Edit Actions */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "10px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{
            width: "40px",
            height: "40px",
            borderRadius: "10px",
            background: "#dcfce7",
            color: "#006948",
            display: "grid",
            placeItems: "center",
            boxShadow: "0 2px 8px rgba(0, 105, 72, 0.15)"
          }}>
            <Sprout size={22} />
          </div>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                {t("🌾 My Farm", "🌾 My Farm")}
              </h3>
              <span style={{
                fontSize: "11px",
                fontWeight: "800",
                background: "rgba(0, 105, 72, 0.12)",
                color: "#006948",
                padding: "2px 8px",
                borderRadius: "12px",
                border: "1px solid rgba(0, 105, 72, 0.3)"
              }}>
                {t("AI Decision Support Active", "AI Decision Support Active")}
              </span>
            </div>
            <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>
              {user?.name ? `${user.name} · ` : ""}{location.split(",")[0] || location}
            </span>
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          {/* Vernacular Voice Assistant Button */}
          <button
            type="button"
            onClick={handleVoicePlay}
            title={isSpeaking ? t("Stop Voice Assistance", "Stop Voice Assistance") : t("Listen to farm profile summary", "Listen to farm profile summary")}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              padding: "7px 14px",
              borderRadius: "20px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              border: isSpeaking ? "1.5px solid #dc2626" : "1.5px solid #006948",
              background: isSpeaking ? "#fee2e2" : "rgba(0, 105, 72, 0.08)",
              color: isSpeaking ? "#dc2626" : "#006948",
              boxShadow: "0 2px 6px rgba(0,0,0,0.06)",
              transition: "all 0.15s ease"
            }}
          >
            {isSpeaking ? <VolumeX size={15} /> : <Volume2 size={15} />}
            <span>{isSpeaking ? t("Stop", "Stop") : t("Listen to Voice", "Listen")}</span>
          </button>

          {/* Edit Profile Button */}
          <button
            type="button"
            onClick={onEdit}
            style={{
              background: "#006948",
              border: "none",
              color: "#ffffff",
              padding: "7px 15px",
              borderRadius: "6px",
              fontSize: "13px",
              fontWeight: "700",
              cursor: "pointer",
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              boxShadow: "0 2px 8px rgba(0, 105, 72, 0.25)",
              transition: "all 0.15s ease"
            }}
          >
            <Edit3 size={14} /> {t("Edit Farm Profile", "Edit Farm Profile")}
          </button>
        </div>
      </div>

      {/* KPI Grid - Fully Translated */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))",
        gap: "10px",
        background: "rgba(255,255,255,0.7)",
        padding: "12px 14px",
        borderRadius: "8px",
        border: "1px solid var(--fk-border)"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "var(--fk-text)" }}>
          <MapPin size={15} color="#006948" flexShrink={0} />
          <span style={{ fontWeight: "600" }}>{location.split(",")[0] || location}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "var(--fk-text)" }}>
          <span>📐</span>
          <span style={{ fontWeight: "600" }}>{landAcres} {t(landUnit, landUnit)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "var(--fk-text)" }}>
          <span>🌱</span>
          <span style={{ fontWeight: "600" }}>{crops.length} {crops.length > 1 ? t("Crops", "Crops") : t("Crop", "Crop")}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "var(--fk-text)" }}>
          <Droplets size={15} color="#0284c7" flexShrink={0} />
          <span style={{ fontWeight: "600" }}>
            {irrigation.map(i => t(i, i)).join(", ")}
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "var(--fk-text)" }}>
          <Globe size={15} color="#795548" flexShrink={0} />
          <span style={{ fontWeight: "600" }}>{t(soil, soil)}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "13.5px", color: "var(--fk-text)" }}>
          <Calendar size={15} color="#d97706" flexShrink={0} />
          <span style={{ fontWeight: "600" }}>{t(season, season)}</span>
        </div>
      </div>

      {/* Crops Tag List with Primary Indicator */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase" }}>
            {t("Cultivated Crops", "Cultivated Crops")}:
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
            {crops.map(c => {
              const cropNameTrans = t(c.name, c.name);
              return (
                <span
                  key={c.name}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px",
                    padding: "4px 10px",
                    borderRadius: "14px",
                    fontSize: "13px",
                    fontWeight: "700",
                    background: c.isPrimary ? "rgba(0, 105, 72, 0.14)" : "var(--fk-card)",
                    border: c.isPrimary ? "1.5px solid #006948" : "1px solid var(--fk-border)",
                    color: c.isPrimary ? "#006948" : "var(--fk-text)"
                  }}
                >
                  <span>{c.icon || "🌱"}</span>
                  <span>{cropNameTrans}</span>
                  {c.isPrimary && (
                    <strong style={{ color: "#006948", fontSize: "10.5px", marginLeft: "2px" }}>
                      ({t("PRIMARY", "PRIMARY")})
                    </strong>
                  )}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
