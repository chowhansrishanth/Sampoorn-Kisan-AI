import { useState } from "react";
import { useSearchParams, Navigate, Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";
import {
  BookOpen,
  Leaf,
  Bug,
  Droplets,
  FlaskConical,
  Package,
  PhoneCall,
  Search,
  CheckCircle2,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Calendar,
  Layers,
  Landmark,
  ArrowRight
} from "lucide-react";

// ============================================================================
// COMPREHENSIVE FARMER KNOWLEDGE REPOSITORY (ICAR / KVK VERIFIED)
// ============================================================================
const KNOWLEDGE_CATEGORIES = [
  { id: "all", label: "All Topics", icon: BookOpen },
  { id: "crop_pop", label: "Crop Production Guides", icon: Leaf },
  { id: "ipm", label: "Pest & Disease Control (IPM)", icon: Bug },
  { id: "organic_soil", label: "Organic Bio-Fertilizers & Soil", icon: FlaskConical },
  { id: "water_drip", label: "Water & Drip Maintenance", icon: Droplets },
  { id: "post_harvest", label: "Post-Harvest & Storage", icon: Package },
  { id: "helplines", label: "Emergency Helplines & KVKs", icon: PhoneCall }
];

const FARMER_KNOWLEDGE_ARTICLES = [
  // ── 1. CROP PRODUCTION GUIDES (PACKAGES OF PRACTICES) ──────────────────────
  {
    id: "pop_cotton",
    category: "crop_pop",
    categoryLabel: "Crop Production Guide",
    title: "Cotton (Kapas) Complete Production Manual & Sowing Protocol",
    summary: "ICAR standard agronomy guidelines for hybrid/Bt cotton: seed rate, spacing, nitrogen split doses, and square formation care.",
    badge: "ICAR Standard",
    readTime: "4 min read",
    keyPoints: [
      "Optimal Sowing Window: June 15 to July 15 (onset of monsoon showers).",
      "Seed Rate & Spacing: 1.5–2.0 packets/acre (Bt hybrid). Spacing: 90 cm × 60 cm for light soils; 120 cm × 45 cm for deep black soils.",
      "Seed Treatment: Pre-treated seeds only need bio-agent inoculation with Azotobacter and PSB (10g/kg seed).",
      "NPK Nutrition: Recommended 120:60:60 kg/ha. Apply Nitrogen in 3 equal splits: Basal, Square initiation (35 DAS), and Flowering (65 DAS).",
      "Critical Care: Spray 2% DAP or 1% Potassium Nitrate (13-0-45) during peak boll development to prevent young boll dropping."
    ],
    fullDetails: "Cotton is sensitive to waterlogging. Ensure ridges and furrows are constructed across the slope. During flowering and boll bursting, avoid flood irrigation; light furrow or drip lateral watering gives maximum lint quality and ginning percentage."
  },
  {
    id: "pop_paddy",
    category: "crop_pop",
    categoryLabel: "Crop Production Guide",
    title: "Paddy / Rice: System of Rice Intensification (SRI) & Nutrient Schedule",
    summary: "Save 40% water and 25% seed costs with SRI nursery management and balanced zinc nutrition.",
    badge: "Water & Seed Saver",
    readTime: "5 min read",
    keyPoints: [
      "Nursery Age: Transplant 10–12 day-old young seedlings with single seedling per hill (vs traditional 25-day seedlings).",
      "Square Spacing: 25 cm × 25 cm grid spacing allows maximum tiller formation (30–45 productive tillers per hill).",
      "Water Management: Alternate Wetting and Drying (AWD) — maintain 2–3 cm shallow water; do not keep field continuously flooded.",
      "Zinc Management: Khaira disease (rusty brown spots) is caused by zinc deficiency. Apply Zinc Sulphate (21%) @ 20 kg/acre at final puddling.",
      "Weed Control: Use cono-weeder at 10, 20, and 30 days after transplanting to incorporate weeds as green manure."
    ],
    fullDetails: "SRI methods increase grain yield by 20–30% while reducing seed requirement from 25kg down to just 2kg/acre. Ensure puddling is level to prevent uneven pooling."
  },
  {
    id: "pop_pulses",
    category: "crop_pop",
    categoryLabel: "Crop Production Guide",
    title: "Red Gram (Arhar / Tur) & Green Gram (Moong) High-Yield Technology",
    summary: "Rhizobium inoculation, nipping of terminal shoots, and pod borer protection for maximum pulse returns.",
    badge: "Soil Nitrogen Booster",
    readTime: "4 min read",
    keyPoints: [
      "Seed Inoculation: Treat seeds with Rhizobium culture + Trichoderma viride (10g/kg seed) in jaggery water solution. Dries in shade.",
      "Nipping Practice: Clip top 2 inches of Red Gram shoots at 45–50 days to stimulate heavy secondary branching and 25% more pod sites.",
      "Moong as Catch Crop: Short-duration Moong varieties (matures in 60–65 days) fit perfectly between Rabi harvest and Kharif sowing.",
      "Critical Irrigation: One protective irrigation at flower bud emergence and one at pod development stage are non-negotiable.",
      "Foliar Nutrition: Spray 2% urea or 1% pulse wonder at 50% flowering to stop flower shedding."
    ],
    fullDetails: "Pulses fix up to 40 kg of atmospheric nitrogen per acre. Never apply heavy nitrogen fertilizers to pulses, as excessive chemical nitrogen prevents root nodule bacteria from forming."
  },

  // ── 2. INTEGRATED PEST & DISEASE MANAGEMENT (IPM) ──────────────────────────
  {
    id: "ipm_pink_bollworm",
    category: "ipm",
    categoryLabel: "Pest & Disease Control",
    title: "Pink Bollworm (PBW) in Cotton: Complete Surveillance & Control Protocol",
    summary: "Economic Threshold Levels (ETL), pheromone trap setup, and organic spray rotation for cotton farmers.",
    badge: "High Alert Advisory",
    readTime: "5 min read",
    keyPoints: [
      "Pheromone Trap Setup: Install 5 pheromone traps (Phero-Sensor with Gossyplure lure) per acre at 45 days after sowing.",
      "Economic Threshold Level (ETL): 8 moths/trap/night for 3 consecutive days OR 10% rosette flowers indicates active infestation.",
      "Organic / Biological Spray: Release Trichogramma bactrae egg parasitoids @ 60,000/acre at weekly intervals from 45 DAS.",
      "Botanical Control: Spray 5% Neem Seed Kernel Extract (NSKE) or Azadirachtin 1500 ppm @ 5 ml/liter at first sign of rosette flowers.",
      "Chemical Option: If ETL exceeds, spray Profenofos 50% EC @ 2 ml/L or Emamectin Benzoate 5% SG @ 0.5 g/L. Rotate chemical groups."
    ],
    fullDetails: "Always destroy rosette flowers manually and never stack cotton stalks near the field during off-season, as overwintering larvae hibernate in dried bolls."
  },
  {
    id: "ipm_fall_armyworm",
    category: "ipm",
    categoryLabel: "Pest & Disease Control",
    title: "Fall Armyworm (FAW) in Maize: Identification & Whorl Application",
    summary: "Recognize inverted 'Y' on head, window-paning symptoms, and non-chemical whorl treatment.",
    badge: "Maize Protection",
    readTime: "4 min read",
    keyPoints: [
      "Identification: Larvae have 4 dark spots arranged in a square on the 8th segment and an inverted white 'Y' on the head.",
      "Damage Sign: Elongated papery windows on young leaves and heavy saw-dust-like frass inside the central plant whorl.",
      "Traditional Whorl Trick: Drop a mixture of fine sand and wood ash (9:1 ratio) directly into the whorl to choke young caterpillars.",
      "Biological Weapon: Spray Metarhizium anisopliae or Beauveria bassiana (1 × 10⁸ CFU/g) @ 5g/liter directed into whorls.",
      "Recommended Spray: Chlorantraniliprole 18.5% SC @ 0.4 ml/L or Spinetoram 11.7% SC @ 0.5 ml/L using knapsack nozzle."
    ],
    fullDetails: "Apply sprays early in the morning or late evening when caterpillars come out of the whorl to feed."
  },
  {
    id: "ipm_whitefly_virus",
    category: "ipm",
    categoryLabel: "Pest & Disease Control",
    title: "Whitefly, Thrips & Leaf Curl Virus Control in Chilli & Tomato",
    summary: "Physical barrier tactics, yellow sticky traps, and systemic protection against viral vectors.",
    badge: "Vegetable Safety",
    readTime: "4 min read",
    keyPoints: [
      "Yellow & Blue Sticky Traps: Install 15 yellow traps (for whiteflies/aphids) and 10 blue traps (for thrips) per acre at crop canopy height.",
      "Border Barrier Crop: Plant 3 dense outer rows of tall Maize, Sorghum, or Bajra around the field 2 weeks prior to transplanting.",
      "Neem Preventive: Spray Azadirachtin 10,000 ppm @ 2 ml/liter every 12 days to repel vector insects from landing.",
      "Nematode Barrier: Intercrop 1 row of African Marigold every 16 plants; root secretions kill root-knot nematodes naturally.",
      "Vector Spray: If whiteflies flare, spray Diafenthiuron 50% WP @ 1.2 g/L or Acetamiprid 20% SP @ 0.3 g/L."
    ],
    fullDetails: "Once a plant contracts Leaf Curl Virus, it cannot be cured chemically. Immediately uproot and bury infected stunted plants to prevent spreading."
  },

  // ── 3. ORGANIC BIO-FERTILIZERS & SOIL HEALTH ───────────────────────────────
  {
    id: "org_jeevamrut",
    category: "organic_soil",
    categoryLabel: "Soil & Organic Formulations",
    title: "Jeevamrut Preparation Guide: Master Recipe for 1 Acre Living Soil",
    summary: "Step-by-step 48-hour fermentation formula to multiply billions of beneficial soil microbes without synthetic chemicals.",
    badge: "100% Natural Recipe",
    readTime: "5 min read",
    keyPoints: [
      "Ingredients Required: Fresh Desi Cow Dung (10 kg), Desi Cow Urine (5–10 liters), Jaggery / Gur (2 kg), Pulse Flour / Besan (2 kg), Forest or Bund Virgin Soil (handful), Clean Water (200 liters).",
      "Preparation Step 1: Mix cow dung and urine thoroughly in a plastic barrel with 200L water using a wooden stick.",
      "Preparation Step 2: Add dissolved jaggery and pulse flour. Add the handful of chemical-free live soil.",
      "Fermentation: Keep the barrel in the shade covered with a gunny bag. Stir clockwise with a wooden pole for 5 minutes twice daily (morning & evening).",
      "Application: Ready in 48 to 72 hours. Apply 200 liters per acre through irrigation water channels or drip filter every 15–20 days."
    ],
    fullDetails: "One gram of desi cow dung contains over 300 crore beneficial microbes. Jeevamrut does not act as raw food for plants; it acts as a catalytic culture that unlocks locked minerals in your field."
  },
  {
    id: "org_beejamrut",
    category: "organic_soil",
    categoryLabel: "Soil & Organic Formulations",
    title: "Beejamrut Seed Treatment & Panchagavya Formulation",
    summary: "Natural organic seed coating to guarantee 98% germination and protect against damping-off disease.",
    badge: "Organic Seed Defense",
    readTime: "4 min read",
    keyPoints: [
      "Beejamrut Ingredients: Desi cow dung (5 kg), Cow urine (5 L), Cow milk (50 ml), Slaked lime / Chuna (50 g), Water (20 L).",
      "Preparation: Hang cow dung in a cloth bag in water overnight. Squeeze extract, add urine, lime, and milk. Stir well.",
      "Seed Treatment: Dip seeds in Beejamrut solution, rub gently with hands, and dry in shade for 30 minutes before sowing.",
      "Panchagavya Foliar Spray: 5 cow derivatives (dung, urine, milk, curd, ghee) + sugarcane juice and tender coconut water.",
      "Dosage: Spray 3% Panchagavya (30 ml/L) at 30, 45, and 60 days after sowing to increase branch count and drought tolerance."
    ],
    fullDetails: "Beejamrut-coated seeds show higher root vigor and complete resistance to seed-borne fungal rots and seedling wilt."
  },
  {
    id: "soil_health_card",
    category: "organic_soil",
    categoryLabel: "Soil & Organic Formulations",
    title: "How to Read Your Soil Health Card & Correct Micronutrient Deficiencies",
    summary: "Decode pH, Organic Carbon, Electrical Conductivity, and avoid wasting thousands on unnecessary DAP/Urea.",
    badge: "Lab Test Guide",
    readTime: "5 min read",
    keyPoints: [
      "Soil pH Interpretation: Ideal pH is 6.5 to 7.5. If pH < 6.0 (Acidic), apply agricultural lime. If pH > 8.5 (Alkaline), apply gypsum @ 500 kg/acre.",
      "Organic Carbon (OC): Healthy soil needs OC > 0.75%. If OC < 0.5%, chemical fertilizers will leach away; add 5 tons Farm Yard Manure (FYM).",
      "Electrical Conductivity (EC): EC should be < 1.0 dS/m. Values above 2.0 indicate dangerous salinity requiring deep leaching irrigation.",
      "Micronutrient Triad: Zinc, Boron, and Sulphur are the most common hidden deficiencies limiting 30% of Indian harvest yields.",
      "Balanced NPK Ratio: India's ideal ratio is 4:2:1 (N:P:K). Over-applying urea (N) causes soft, lush foliage that attracts sucking pests."
    ],
    fullDetails: "Always collect soil samples in a zig-zag V-shape pattern from 8–10 spots across the field at 15 cm depth. Mix, quarter down to 500 grams, dry in shade, and deposit at your nearest KVK lab."
  },

  // ── 4. WATER CONSERVATION & DRIP MAINTENANCE ───────────────────────────────
  {
    id: "water_drip_acid",
    category: "water_drip",
    categoryLabel: "Water & Irrigation",
    title: "Drip Irrigation Maintenance: Acid Treatment to Clean Clogged Emitters",
    summary: "Restore 100% emitter water flow and dissolve hard calcium/magnesium scaling using safe acid flushing.",
    badge: "Equipment Care",
    readTime: "4 min read",
    keyPoints: [
      "Why Emitters Clog: Borewell groundwater in India is high in dissolved carbonates and iron, which crystallize inside dripper labyrinths.",
      "Acid Choice: Use Hydrochloric Acid (Commercial Muriatic Acid 33%) or Nitric Acid (60%). Never use Sulphuric Acid.",
      "Dosage Calculation: Typically 0.5 to 1.0 liter of commercial acid per 1,000 liters of system water volume to achieve pH 4.0 in laterals.",
      "Flushing Procedure: Run drip system, inject acid solution, check pH at lateral ends with litmus paper (turns red at pH 4.0), and shut off pump.",
      "Soaking & Backwash: Leave acid in lateral pipes for 12–24 hours to dissolve salts. Next morning, open all flush valves and run pump to flush out debris."
    ],
    fullDetails: "Conduct acid flushing once before sowing and once post-harvest. Always pour acid slowly into water; never pour water into acid."
  },
  {
    id: "water_critical_stages",
    category: "water_drip",
    categoryLabel: "Water & Irrigation",
    title: "Critical Crop Irrigation Stages: When You Must Never Allow Moisture Stress",
    summary: "Strategic watering schedule: Missing irrigation during these exact 3-day windows drops yields by 40%.",
    badge: "Yield Protection",
    readTime: "4 min read",
    keyPoints: [
      "Wheat: Crown Root Initiation (20–25 DAS) is the most critical stage. Skipping this water reduces tillers by 35%.",
      "Cotton: Peak Square Formation (45–55 DAS) and Flowering/Boll development (70–90 DAS). Drought causes young boll shedding.",
      "Maize: Tasseling and Silking stages (50–65 DAS). Moisture stress at silking prevents cob grain filling.",
      "Groundnut: Pegging and Pod development (40–70 DAS). Soil must be moist so pegs can easily penetrate the earth.",
      "Paddy: Panicle initiation and flowering. Standing water of 2–3 cm is essential during these 10 days."
    ],
    fullDetails: "If borewell or canal water is scarce, skip vegetative stage irrigations and reserve all available water for the flowering and grain-filling windows."
  },

  // ── 5. POST-HARVEST & SAFE GRAIN STORAGE ───────────────────────────────────
  {
    id: "post_grain_storage",
    category: "post_harvest",
    categoryLabel: "Post-Harvest & Storage",
    title: "Safe Grain Storage: Safe Moisture Percentages & Preventing Weevils",
    summary: "Prevent aflatoxin mold, pulse beetles, and moisture spoilage to sell at peak market prices.",
    badge: "Storage Economics",
    readTime: "4 min read",
    keyPoints: [
      "Safe Storage Moisture: Paddy (<13%), Wheat (<12%), Maize (<12%), Pulses / Red Gram (<9%), Oilseeds (<8%).",
      "Traditional Sun Drying: Spread harvested grains on clean tarpaulin sheets in direct sunlight for 2–3 days until grain snaps cleanly between teeth.",
      "Neem Leaf Protection: Mix dried, shade-cured neem leaves (2 kg per 100 kg grain) inside gunny bags to naturally repel rice weevils.",
      "Hermetic Storage Bags: Use PICS (Purdue Improved Crop Storage) bags with airtight triple-layer liners to suffocate storage insects without chemicals.",
      "Dampness Prevention: Place grain bags on wooden pallets or bamboo mats at least 1 foot away from warehouse walls."
    ],
    fullDetails: "Grains stored at >14% moisture develop Aspergillus flavus fungus, which produces dangerous carcinogenic aflatoxins and causes mandi buyers to reject lots."
  },

  // ── 6. EMERGENCY FARMER HELPLINES & DIRECTORY ──────────────────────────────
  {
    id: "helplines_directory",
    category: "helplines",
    categoryLabel: "Official Helplines",
    title: "National & State Agricultural Emergency Helplines & KVK Directory",
    summary: "Toll-free government numbers for immediate crop distress, pest outbreaks, weather warnings, and insurance claims.",
    badge: "Verified Toll-Free",
    readTime: "3 min read",
    keyPoints: [
      "Kisan Call Center (KCC): 1800-180-1551 (Toll-Free, 22 languages, 6:00 AM to 10:00 PM every day).",
      "PMFBY Crop Insurance Loss Reporting: 1800-180-1111 (Must report hailstorm/flood damage within 72 hours).",
      "Farmer Suicide Prevention & Stress Counseling: 1800-599-0019 (KIRAN Mental Health Helpline).",
      "Kisan Drone & Custom Hiring Helpline: 1800-180-1551.",
      "Weather Warning SMS Portal: Register on mkisan.gov.in for localized block-level agro-meteorological SMS alerts."
    ],
    fullDetails: "When calling the Kisan Call Center (1800-180-1551), keep your village survey number and crop sowing date ready. If the Level-1 executive cannot answer your specialized pest query, ask them to escalate to the Level-2 Agriculture University Subject Matter Specialist (SMS)."
  },

  // ── 7. RABI CROP PRODUCTION & FROST DEFENSE ────────────────────────────────
  {
    id: "pop_wheat_mustard",
    category: "crop_pop",
    categoryLabel: "Crop Production Guide",
    title: "Wheat & Mustard (Rabi Season): High-Yield Protocol & Frost/Heat Defense",
    summary: "Crown root initiation timing, sulfur fertilization for oil content, and protecting crops from cold waves and terminal heat.",
    badge: "Rabi Special",
    readTime: "5 min read",
    keyPoints: [
      "Mustard Sowing Window: October 1 to October 25 is ideal. Sowing after November 10 invites severe aphid attacks and cuts yield by 30%.",
      "Mustard Sulfur Secret: Apply 20 kg elemental Sulfur or 40 kg Bentonite Sulfur per acre at basal sowing. This raises seed oil content from 38% to 43%.",
      "Wheat Sowing & Spacing: Optimal window is November 5–25. Line sowing at 20 cm row-to-row spacing with seed drill gives 4–5 more quintals/acre than broadcasting.",
      "Frost & Cold Wave Defense: When night temperatures plunge below 4°C, give a light evening irrigation to raise soil temperature by 2–3°C, or spray 0.1% Thiourea (1g/liter).",
      "Terminal Heat Protection: Spray 1% Potassium Nitrate (13-0-45) or 2% Urea at boot leaf and milk stage to protect wheat grain filling from March heat waves."
    ],
    fullDetails: "Never apply chemical weedicides (like 2,4-D or Clodinafop) when soil is dry or temperature is below 15°C, as it burns young wheat tillers. Always spray after first irrigation when soil is at field capacity."
  },

  // ── 8. SOIL RECLAMATION & GREEN MANURING ───────────────────────────────────
  {
    id: "org_soil_reclamation",
    category: "organic_soil",
    categoryLabel: "Soil & Organic Formulations",
    title: "Reclaiming Saline & Alkaline Soils: Gypsum Calculation & Green Manuring (Dhaincha)",
    summary: "Permanently cure white/black alkali encrustations, restore soil water drainage, and save degraded acreage.",
    badge: "Land Reclamation",
    readTime: "5 min read",
    keyPoints: [
      "Diagnostic Test: Saline soils have white crust on surface (EC > 4); Alkaline / Sodic soils are hard, impermeable with black crust (pH > 8.5).",
      "Gypsum Treatment for Alkali Soils: Apply Agricultural Gypsum (min 70% purity) @ 1.5–2.5 tons/acre based on soil test gypsum requirement (GR).",
      "Gypsum Application Steps: Broadcast gypsum uniformly on dry soil in May–June, shallow mix (top 10 cm), flood with 10–15 cm standing water, and leach out soluble salts through drainage ditches.",
      "Green Manuring with Dhaincha (Sesbania aculeata): Sow Dhaincha @ 20–25 kg seed/acre with pre-monsoon showers. Plough it down into soil at 45–50 days (flowering stage).",
      "Organic Matter Addition: Dhaincha adds 8–10 tons of succulent green biomass and 35–40 kg pure organic nitrogen per acre, reducing soil pH naturally."
    ],
    fullDetails: "Do not bury Dhaincha too deep. Rotavator incorporation into the top 12–15 cm allows soil bacteria to rapidly decompose the green succulent tissue within 7–10 days before main Kharif crop transplanting."
  },

  // ── 9. DIRECT BENEFIT TRANSFER & BANK SEEDING TROUBLESHOOTER ───────────────
  {
    id: "gov_dbt_unblock",
    category: "helplines",
    categoryLabel: "Official Helplines",
    title: "Aadhaar NPCI Seeding & PFMS Troubleshooter: How to Unblock Delayed DBT Subsidies",
    summary: "Fix PM-Kisan and subsidy payment failures (FTO Pending / Aadhaar not mapped) in 24 hours without visiting government offices.",
    badge: "Payment Fixer",
    readTime: "4 min read",
    keyPoints: [
      "Why Payments Fail: Having Aadhaar linked to a bank account is NOT enough; your account must be mapped with the NPCI Aadhaar Payment Bridge (APB) mapper.",
      "Check NPCI Status Online: Visit resident.uidai.gov.in/bank-mapper or check on the mAadhaar mobile app under 'Bank Seeding Status'.",
      "Instant 24-Hour Fix: Open a Zero-Balance India Post Payments Bank (IPPB) DBT account through your local village postman. IPPB automatically seeds NPCI DBT within 24 hours.",
      "Land Record Seeding: If PM-Kisan status shows 'Land Seeding: NO', submit your updated Land Passbook / Pahani copy to the Mandal Revenue Officer (MRO) / Patwari.",
      "e-KYC Completion: Biometric e-KYC can be done instantly for free using face authentication on the PM-KISAN mobile app without fingerprint scanners."
    ],
    fullDetails: "If your bank changes or merges, the old NPCI mapping gets disconnected. If you suspect an issue, ask your bank branch manager specifically for the 'NPCI Aadhaar Mandate Seeding Form' and collect an official acknowledgment receipt."
  }
];

export default function KnowledgeHub() {
  const { language, t } = useLanguage();
  const [searchParams] = useSearchParams();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedArticleId, setExpandedArticleId] = useState("pop_cotton");

  // If user visits /knowledge?tab=schemes, redirect to dedicated Government Schemes page
  if (searchParams.get("tab") === "schemes") {
    return <Navigate to="/schemes" replace />;
  }

  const filteredArticles = FARMER_KNOWLEDGE_ARTICLES.filter((article) => {
    const matchesCategory = selectedCategory === "all" || article.category === selectedCategory;
    const matchesSearch =
      searchQuery.trim() === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.keyPoints.some((p) => p.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="page-container knowledge-page page-enter">
      {/* PAGE HEADER */}
      <div className="page-header" style={{ marginBottom: "16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
          <div style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563eb", padding: "8px", borderRadius: "8px" }}>
            <BookOpen size={24} />
          </div>
          <div>
            <h1 className="page-title" style={{ margin: 0, fontSize: "23.5px" }}>
              📚 {t("knowledge_hub_title", "Farmer Knowledge Hub & Practical Agronomic Field Manual")}
            </h1>
            <p className="page-subtitle" style={{ margin: "2px 0 0" }}>
              {t("knowledge_hub_sub", "Practical, ICAR-verified agricultural manuals, organic fertilizer recipes (Jeevamrut), pest surveillance, drip maintenance, and verified farmer helplines.")}
            </p>
          </div>
        </div>
      </div>

      {/* QUICK CROSS-NAVIGATION BANNER TO GOVERNMENT SCHEMES */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          background: "rgba(37, 99, 235, 0.08)",
          border: "1px solid rgba(37, 99, 235, 0.25)",
          borderRadius: "8px",
          padding: "12px 16px",
          marginBottom: "18px",
          flexWrap: "wrap",
          gap: "10px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <Landmark size={22} color="#2563eb" />
          <div>
            <strong style={{ fontSize: "14px", color: "var(--fk-text)", display: "block" }}>
              Looking for Central & State Government Schemes, KCC Loans, or PMKSY Drip Subsidies?
            </strong>
            <span style={{ fontSize: "12.5px", color: "var(--fk-text-sub)" }}>
              Access our dedicated Government Schemes Portal with state-wise eligibility, required documents, and verified application guides.
            </span>
          </div>
        </div>
        <Link
          to="/schemes"
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#2563eb",
            color: "#ffffff",
            padding: "7px 14px",
            borderRadius: "6px",
            fontSize: "13px",
            fontWeight: "700",
            textDecoration: "none",
            transition: "all 0.2s ease"
          }}
        >
          View Government Schemes <ArrowRight size={14} />
        </Link>
      </div>

      {/* SEARCH BAR & TOPIC PILLS */}
      <div
        className="glass-card"
        style={{
          background: "var(--fk-card)",
          border: "1px solid var(--fk-border)",
          borderRadius: "10px",
          padding: "18px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Search size={18} color="var(--fk-blue)" />
            <h3 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
              Search Practical Agricultural Knowledge
            </h3>
          </div>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", background: "rgba(22, 163, 74, 0.1)", padding: "3px 10px", borderRadius: "12px" }}>
            🌱 ICAR & KVK Agronomy Guidelines
          </span>
        </div>

        {/* SEARCH INPUT */}
        <div style={{ position: "relative", marginBottom: "14px" }}>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search keywords: Cotton, Jeevamrut recipe, Pink Bollworm, Drip acid flush, Grain moisture..."
            style={{
              width: "100%",
              padding: "10px 14px 10px 38px",
              borderRadius: "6px",
              border: "1px solid var(--fk-border)",
              background: "var(--fk-bg)",
              color: "var(--fk-text)",
              fontSize: "15px",
              fontWeight: "600"
            }}
          />
          <Search size={16} color="var(--fk-text-sub)" style={{ position: "absolute", left: "12px", top: "12px" }} />
        </div>

        {/* TOPIC FILTER PILLS */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {KNOWLEDGE_CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat.id;
            const IconCmp = cat.icon;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setSelectedCategory(cat.id)}
                style={{
                  padding: "7px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  border: isSelected ? "2px solid #2563eb" : "1px solid var(--fk-border)",
                  background: isSelected ? "rgba(37, 99, 235, 0.12)" : "var(--fk-bg)",
                  color: isSelected ? "#2563eb" : "var(--fk-text)",
                  transition: "all 0.15s ease"
                }}
              >
                <IconCmp size={14} />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* KNOWLEDGE ARTICLES LIST */}
      <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
        {filteredArticles.length === 0 ? (
          <div
            className="glass-card"
            style={{
              background: "var(--fk-card)",
              border: "1px solid var(--fk-border)",
              borderRadius: "10px",
              padding: "30px",
              textAlign: "center"
            }}
          >
            <p style={{ fontSize: "15px", color: "var(--fk-text-sub)", margin: "0 0 10px" }}>
              No articles match your search query &quot;<strong>{searchQuery}</strong>&quot;.
            </p>
            <button
              type="button"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategory("all");
              }}
              style={{
                padding: "6px 14px",
                borderRadius: "6px",
                border: "1px solid #2563eb",
                background: "#2563eb",
                color: "#ffffff",
                fontSize: "13px",
                fontWeight: "700",
                cursor: "pointer"
              }}
            >
              Reset Search & Filters
            </button>
          </div>
        ) : (
          filteredArticles.map((article) => {
            const isExpanded = expandedArticleId === article.id;
            return (
              <div
                key={article.id}
                className="glass-card"
                style={{
                  background: "var(--fk-card)",
                  border: isExpanded ? "2px solid #2563eb" : "1px solid var(--fk-border)",
                  borderRadius: "10px",
                  padding: "18px",
                  transition: "all 0.2s ease",
                  boxShadow: isExpanded ? "0 4px 14px rgba(37, 99, 235, 0.08)" : "none"
                }}
              >
                {/* ARTICLE HEADER BAR */}
                <div
                  onClick={() => setExpandedArticleId(isExpanded ? null : article.id)}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    cursor: "pointer",
                    gap: "12px"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "6px", flexWrap: "wrap" }}>
                      <span
                        style={{
                          fontSize: "12px",
                          fontWeight: "800",
                          color: "#2563eb",
                          background: "rgba(37, 99, 235, 0.12)",
                          padding: "2px 8px",
                          borderRadius: "4px"
                        }}
                      >
                        {article.categoryLabel}
                      </span>
                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: "700",
                          color: "#16a34a",
                          background: "rgba(22, 163, 74, 0.12)",
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}
                      >
                        {article.badge}
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
                        ⏱️ {article.readTime}
                      </span>
                    </div>

                    <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", margin: "0 0 6px" }}>
                      {article.title}
                    </h3>
                    <p style={{ fontSize: "14px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.4" }}>
                      {article.summary}
                    </p>
                  </div>

                  <button
                    type="button"
                    style={{
                      background: isExpanded ? "#2563eb" : "var(--fk-bg)",
                      color: isExpanded ? "#ffffff" : "var(--fk-text)",
                      border: "1px solid var(--fk-border)",
                      borderRadius: "6px",
                      padding: "6px",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center"
                    }}
                    aria-label={isExpanded ? "Collapse" : "Expand"}
                  >
                    {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                  </button>
                </div>

                {/* EXPANDED CONTENT: CHECKLIST & FULL AGRONOMY DETAILS */}
                {isExpanded && (
                  <div style={{ marginTop: "16px", borderTop: "1px solid var(--fk-border)", paddingTop: "14px" }}>
                    <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "8px", display: "flex", alignItems: "center", gap: "6px" }}>
                      <CheckCircle2 size={16} color="#16a34a" /> Key Actionable Steps & Guidelines
                    </h4>

                    <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginBottom: "14px" }}>
                      {article.keyPoints.map((pt, pIdx) => (
                        <div
                          key={pIdx}
                          style={{
                            background: "var(--fk-bg)",
                            border: "1px solid var(--fk-border)",
                            padding: "9px 12px",
                            borderRadius: "6px",
                            fontSize: "13.5px",
                            color: "var(--fk-text)",
                            lineHeight: "1.4"
                          }}
                        >
                          <strong>{pIdx + 1}. </strong>
                          {pt}
                        </div>
                      ))}
                    </div>

                    {/* ADVISORY NOTE */}
                    <div
                      style={{
                        background: "rgba(22, 163, 74, 0.08)",
                        border: "1px solid rgba(22, 163, 74, 0.25)",
                        padding: "12px 14px",
                        borderRadius: "6px"
                      }}
                    >
                      <strong style={{ fontSize: "13px", color: "#16a34a", display: "block", marginBottom: "4px" }}>
                        💡 Practical Field Advisory Tip
                      </strong>
                      <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: 0, lineHeight: "1.4" }}>
                        {article.fullDetails}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* QUICK FOOTER HELPLINE BANNER */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(22, 163, 74, 0.08))",
          border: "1px solid var(--fk-border)",
          borderRadius: "10px",
          padding: "16px 20px",
          marginTop: "20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <PhoneCall size={22} color="#2563eb" />
          <div>
            <strong style={{ fontSize: "15px", color: "var(--fk-text)", display: "block" }}>
              Need Direct Agronomic Assistance from Government Extension Scientists?
            </strong>
            <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>
              Call Kisan Call Center (KCC) toll-free in any Indian language.
            </span>
          </div>
        </div>
        <a
          href="tel:18001801551"
          style={{
            background: "#2563eb",
            color: "#ffffff",
            padding: "8px 16px",
            borderRadius: "6px",
            fontWeight: "800",
            fontSize: "14px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <PhoneCall size={14} /> 1800-180-1551 (Toll-Free)
        </a>
      </div>
    </div>
  );
}
