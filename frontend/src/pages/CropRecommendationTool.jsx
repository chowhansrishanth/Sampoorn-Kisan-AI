import { useState } from "react";
import {
  Sliders,
  TrendingUp,
  ShieldAlert,
  BarChart2,
  PieChart,
  Droplets,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  ArrowRight,
  Filter,
  Check,
  Search,
  Sparkles,
  Layers,
  Award,
  Zap,
  Info
} from "lucide-react";

// ==========================================
// 1. SOIL TYPES DEFINITION
// ==========================================
const SOIL_TYPES = [
  {
    id: "black",
    name: "Black Cotton Soil (Regur)",
    icon: "🪨",
    badge: "High Water Retention",
    desc: "Clay-rich, deep moisture retention. Ideal for cotton, soybean, pulses, wheat & chilli."
  },
  {
    id: "red",
    name: "Red Loamy Soil",
    icon: "🔴",
    badge: "Well-Drained & Porous",
    desc: "Porous, light-to-medium texture, excellent aeration. Ideal for groundnut, pulses, maize & vegetables."
  },
  {
    id: "alluvial",
    name: "Alluvial / River Loam",
    icon: "🌾",
    badge: "Highly Fertile",
    desc: "Rich in silt, balanced loam, high organic matter. Excellent for paddy, wheat, sugarcane & maize."
  },
  {
    id: "clay",
    name: "Clayey Heavy Soil",
    icon: "🧱",
    badge: "Dense & Moisture Holding",
    desc: "Slow drainage, dense structure. Great for transplanted paddy; challenging for root/peg crops."
  },
  {
    id: "sandy",
    name: "Sandy Loam / Light Soil",
    icon: "🏖️",
    badge: "Fast Drainage",
    desc: "Light, drains rapidly, warms fast. Best for groundnut, pulses, bajra & light vegetables."
  },
  {
    id: "laterite",
    name: "Laterite / Red Gravelly",
    icon: "🍂",
    badge: "Acidic & Porous",
    desc: "Leached upland soil, acidic pH, responds well to organic manure and lime. Good for cashew, pulses & oilseeds."
  }
];

// ==========================================
// 2. THE WAY OF GETTING WATER FOR IRRIGATION
// ==========================================
const IRRIGATION_METHODS = [
  {
    id: "borewell",
    name: "Borewell / Tube-Well",
    icon: "🚰",
    sub: "Motorized Groundwater Pumping",
    efficiency: "+10% yield control with timely water",
    desc: "Submersible pump from underground aquifer. Dependent on reliable 3-phase electricity or solar power.",
    bestCrops: ["cotton", "maize", "chilli", "wheat", "tomato", "chickpea"]
  },
  {
    id: "drip",
    name: "Drip Irrigation (Micro-Irrigation)",
    icon: "💧",
    sub: "Precision Root-Zone Emitters",
    efficiency: "40-50% water savings & +12-15% yield bonus",
    desc: "Delivers water & liquid fertigation directly to root zones. Maximum water efficiency and minimum weed pressure.",
    bestCrops: ["cotton", "chilli", "tomato", "maize", "sugarcane", "red_gram"]
  },
  {
    id: "canal",
    name: "Canal / River Gravity Network",
    icon: "🌊",
    sub: "Government Canal or Lift System",
    efficiency: "High-volume flood/furrow watering",
    desc: "Surface water allocation from dam/river canal. Zero pumping power cost, dependent on government release turns.",
    bestCrops: ["paddy", "wheat", "sugarcane", "maize", "mustard"]
  },
  {
    id: "sprinkler",
    name: "Sprinkler Irrigation System",
    icon: "💦",
    sub: "Pressurized Overhead Rain Simulation",
    efficiency: "30% water savings & uniform moisture",
    desc: "Overhead spray nozzles ideal for undulating fields, sandy soils, and closely spaced crops.",
    bestCrops: ["groundnut", "mustard", "chickpea", "wheat", "soybean"]
  },
  {
    id: "open_well",
    name: "Open Well / Farm Pond / Tank",
    icon: "🏞️",
    sub: "Shallow Aquifer or Rainwater Pond",
    efficiency: "Moderate seasonal water reserve",
    desc: "Surface open well or dugout farm pond with diesel/electric motor. Sensitive to summer water table drops.",
    bestCrops: ["green_gram", "red_gram", "maize", "soybean", "onion"]
  },
  {
    id: "rainfed",
    name: "Rainfed Only (Monsoon Dependent)",
    icon: "🌧️",
    sub: "No Assured Irrigation Facility",
    efficiency: "Zero infrastructure cost, high dry spell risk",
    desc: "Field is 100% dependent on natural monsoon rainfall. High water crops have severe failure risk without protective rain.",
    bestCrops: ["red_gram", "green_gram", "bajra", "soybean", "groundnut", "chickpea"]
  }
];

// ==========================================
// 3. WATER AVAILABILITY / FREQUENCY
// ==========================================
const WATER_AVAILABILITIES = [
  {
    id: "abundant",
    name: "Abundant & Assured",
    sub: "24x7 or Daily Supply (>1000mm)",
    icon: "💧",
    desc: "Continuous, assured water availability with no pumping constraints. Suitable for high-water crops like Paddy & Sugarcane."
  },
  {
    id: "moderate",
    name: "Moderate Irrigation",
    sub: "2–3 Waterings per Week (550–800mm)",
    icon: "🚰",
    desc: "Regular scheduled irrigation available 2-3 times weekly. Ideal for Cotton, Maize, Chilli, Wheat & Vegetables."
  },
  {
    id: "limited",
    name: "Limited / Deficit Supply",
    sub: "Critical Stages Only (350–500mm)",
    icon: "🌦️",
    desc: "Water is constrained; sufficient only for 2-3 protective irrigations during flowering and pod/grain setting."
  },
  {
    id: "scanty",
    name: "Scanty / Drought-Prone",
    sub: "Dryland / Rainfed (<300mm)",
    icon: "☀️",
    desc: "Severe water deficit. Requires short-duration, drought-hardy pulses or millets."
  }
];

// ==========================================
// 4. COMPREHENSIVE CROP DATABASE (16 MAJOR INDIAN CROPS)
// ==========================================
const CROPS_DB = [
  {
    id: "red_gram",
    name: "Red Gram (Arhar / Tur)",
    icon: "🌾",
    category: "Pulses",
    waterReq: "Low (350-450mm)",
    waterLevel: "low",
    duration: "160-180 days",
    durationDays: 170,
    costPerAcre: 14500,
    yieldPerAcre: 8,
    pricePerQtl: 7550,
    risk: "Low",
    badge: "🌟 Best Overall Fit",
    keyStrength: "Enriches soil nitrogen and thrives in dry spells",
    idealSoils: ["black", "red", "alluvial"],
    moderateSoils: ["sandy", "laterite"],
    poorSoils: ["clay"],
    waterSuitability: { abundant: 45, moderate: 50, limited: 50, scanty: 38 },
    irrigationFit: {
      borewell: "Optimal: 2 protective waterings at flowering and pod filling ensure peak harvest.",
      drip: "Excellent: Boosts branch count and prevents moisture stress with 40% water savings.",
      canal: "Good: Provide surface furrows; avoid standing water around stems.",
      sprinkler: "Very Good: Uniform moisture during early vegetative growth.",
      open_well: "Ideal: Low water requirement easily met by seasonal well.",
      rainfed: "Outstanding: Deep taproot system withstands 3-4 week monsoon dry spells."
    },
    advisory: "Extremely cost-effective pulse. Excellent for crop rotation as it deposits 40kg natural nitrogen per acre."
  },
  {
    id: "cotton",
    name: "Cotton (Kapas)",
    icon: "☁️",
    category: "Cash Crop",
    waterReq: "Medium (600-800mm)",
    waterLevel: "medium",
    duration: "160-210 days",
    durationDays: 185,
    costPerAcre: 22000,
    yieldPerAcre: 10,
    pricePerQtl: 7120,
    risk: "Medium-High",
    badge: "🏆 Highest Net Return",
    keyStrength: "Maximum revenue potential in deep black soils with steady irrigation",
    idealSoils: ["black", "alluvial"],
    moderateSoils: ["red"],
    poorSoils: ["sandy", "laterite", "clay"],
    waterSuitability: { abundant: 50, moderate: 50, limited: 25, scanty: 10 },
    irrigationFit: {
      borewell: "Ideal: Steady borewell runs during square and boll formation guarantee high lint yields.",
      drip: "Industry Gold Standard: Drip fertigation increases boll weight by +15% and cuts weed growth.",
      canal: "Good: Furrow irrigation works well; ensure field has good drainage slope.",
      sprinkler: "Not recommended during flowering as overhead droplets cause flower shedding.",
      open_well: "Manageable: Requires sustained water through November-December boll maturity.",
      rainfed: "High Risk: Water deficit during boll development triggers young boll shedding and yield drop."
    },
    advisory: "Highest gross cash earner for black soil farms with steady borewell or drip water. Monitor for pink bollworm."
  },
  {
    id: "maize",
    name: "Maize (Corn / Makka)",
    icon: "🌽",
    category: "Cereals",
    waterReq: "Medium (500-650mm)",
    waterLevel: "medium",
    duration: "95-110 days",
    durationDays: 100,
    costPerAcre: 16000,
    yieldPerAcre: 26,
    pricePerQtl: 2225,
    risk: "Low-Medium",
    badge: "⚡ Fast Growth",
    keyStrength: "Quick turn-around, dual fodder and grain income",
    idealSoils: ["alluvial", "red", "black"],
    moderateSoils: ["clay", "sandy"],
    poorSoils: ["laterite"],
    waterSuitability: { abundant: 50, moderate: 50, limited: 30, scanty: 15 },
    irrigationFit: {
      borewell: "Optimal: Critical waterings at silking and tasseling produce full, dense cobs.",
      drip: "High Efficiency: Increases cob diameter and uniformity while conserving water.",
      canal: "Excellent: Fast growth responds rapidly to scheduled canal turns.",
      sprinkler: "Effective during vegetative phase; switch to furrow once tassels appear.",
      open_well: "Good: 100-day harvest timeline finishes before well dries up.",
      rainfed: "Moderate: Sensitive to drought during flowering; yields drop if rain fails at silking."
    },
    advisory: "Frees land in just 100 days, allowing double cropping. Highly liquid market with immediate buyer uptake."
  },
  {
    id: "green_gram",
    name: "Green Gram (Moong)",
    icon: "🌱",
    category: "Pulses",
    waterReq: "Very Low (250-350mm)",
    waterLevel: "very_low",
    duration: "60-75 days",
    durationDays: 68,
    costPerAcre: 9500,
    yieldPerAcre: 6,
    pricePerQtl: 8558,
    risk: "Low",
    badge: "💧 Lowest Water & Risk",
    keyStrength: "Fastest cash realization & minimum financial investment",
    idealSoils: ["red", "alluvial", "black", "sandy"],
    moderateSoils: ["laterite"],
    poorSoils: ["clay"],
    waterSuitability: { abundant: 40, moderate: 50, limited: 50, scanty: 45 },
    irrigationFit: {
      borewell: "One single protective watering at pod formation gives record yield.",
      drip: "Superb: Light daily pulse maintains ideal pod setting without water waste.",
      canal: "Ensure quick drainage; avoid waterlogging.",
      sprinkler: "Ideal: Light overhead spray matches short-root structure perfectly.",
      open_well: "Perfect: Uses minimal water, leaving plenty for next crops.",
      rainfed: "Top Choice: Thrives on minimal monsoon showers; matures before drought sets in."
    },
    advisory: "Harvest in just 65 days with highest MSP price per quintal. Perfect catch crop between seasons."
  },
  {
    id: "paddy",
    name: "Paddy (Rice / Dhan)",
    icon: "🌾",
    category: "Cereals",
    waterReq: "Very High (1100-1400mm)",
    waterLevel: "very_high",
    duration: "125-145 days",
    durationDays: 135,
    costPerAcre: 21500,
    yieldPerAcre: 25,
    pricePerQtl: 2320,
    risk: "Medium",
    badge: "🌾 Assured MSP Procurement",
    keyStrength: "Guaranteed government purchase with massive grain volume",
    idealSoils: ["clay", "alluvial", "black"],
    moderateSoils: ["red"],
    poorSoils: ["sandy", "laterite"],
    waterSuitability: { abundant: 50, moderate: 30, limited: 10, scanty: 5 },
    irrigationFit: {
      borewell: "High Power Burden: Heavy continuous pumping required; motor burn risk during peak summer.",
      drip: "Requires DSR (Direct Seeded Rice) with specialized sub-surface drip tapes.",
      canal: "Native Sweet Spot: Continuous canal flooding ensures full panicle emergence with zero power cost.",
      sprinkler: "Not viable for traditional transplanted wetland paddy.",
      open_well: "Risk: Open well will quickly deplete unless constantly replenished by rain/canal.",
      rainfed: "Critical Failure Risk: Traditional paddy will dry up without continuous assured water."
    },
    advisory: "Plant only if canal water or high-capacity borewell is guaranteed. Consider DSR to save 35% water."
  },
  {
    id: "soybean",
    name: "Soybean",
    icon: "🫘",
    category: "Oilseeds",
    waterReq: "Medium (450-600mm)",
    waterLevel: "medium",
    duration: "90-105 days",
    durationDays: 98,
    costPerAcre: 13800,
    yieldPerAcre: 9,
    pricePerQtl: 4892,
    risk: "Low-Medium",
    badge: "🌱 Soil Nitrogen Enriched",
    keyStrength: "Low labor requirements & leaves field fertile for wheat or chickpea",
    idealSoils: ["black", "alluvial"],
    moderateSoils: ["red", "clay"],
    poorSoils: ["sandy", "laterite"],
    waterSuitability: { abundant: 45, moderate: 50, limited: 35, scanty: 15 },
    irrigationFit: {
      borewell: "Optimal: Sustains robust pod setting with 1-2 supplemental irrigations in dry spells.",
      drip: "High Efficiency: Yield increases by +12% with uniform pod filling.",
      canal: "Provide surface drainage furrows; standing water hurts seedling emergence.",
      sprinkler: "Very Good: Uniform coverage without crusting the soil.",
      open_well: "Reliable: 95-day maturity consumes manageable water volume.",
      rainfed: "Good: Standard Kharif crop across Central India; yields well with normal monsoon."
    },
    advisory: "Frees fields by October for timely Rabi sowing (Wheat/Chickpea). Enriches soil with biological nitrogen."
  },
  {
    id: "chilli",
    name: "Chilli (Mirchi)",
    icon: "🌶️",
    category: "Cash Crop",
    waterReq: "Medium-High (600-800mm)",
    waterLevel: "medium",
    duration: "150-180 days",
    durationDays: 165,
    costPerAcre: 38000,
    yieldPerAcre: 18,
    pricePerQtl: 14500,
    risk: "High",
    badge: "💰 High Return Specialist",
    keyStrength: "Highest profit per acre with drip fertigation and proper pest management",
    idealSoils: ["black", "red", "alluvial"],
    moderateSoils: ["clay", "laterite"],
    poorSoils: ["sandy"],
    waterSuitability: { abundant: 50, moderate: 45, low: 20, scanty: 10 },
    irrigationFit: {
      borewell: "Very Good: Regular furrow or drip cycles maintain steady flower set.",
      drip: "Essential for Maximum Profit: Drip fertigation boosts yield by 25% and reduces wilt diseases.",
      canal: "Ensure ridge planting; direct flood contact with plant stems causes damping off.",
      sprinkler: "Avoid during flowering; overhead water washes away pollen and invites fungal leaf spot.",
      open_well: "Manageable if well has water till March for multiple pickings.",
      rainfed: "High Failure Risk: Chilli plants drop flowers during water stress. Not recommended rainfed."
    },
    advisory: "Highest investment requirement (₹38,000/acre) but unmatched net returns for farmers with drip irrigation."
  },
  {
    id: "groundnut",
    name: "Groundnut (Peanut)",
    icon: "🥜",
    category: "Oilseeds",
    waterReq: "Low-Medium (400-550mm)",
    waterLevel: "low",
    duration: "105-120 days",
    durationDays: 112,
    costPerAcre: 17500,
    yieldPerAcre: 12,
    pricePerQtl: 6780,
    risk: "Low-Medium",
    badge: "🥜 Best for Sandy & Red Soils",
    keyStrength: "Superior pegging and pod yield in loose, friable soils",
    idealSoils: ["sandy", "red", "alluvial"],
    moderateSoils: ["laterite"],
    poorSoils: ["clay", "black"],
    waterSuitability: { abundant: 45, moderate: 50, limited: 40, scanty: 25 },
    irrigationFit: {
      borewell: "Water at pegging (40-50 days) and pod development for clean, heavy kernels.",
      drip: "Excellent: Delivers moisture right to the pegging zone.",
      canal: "Keep soil moist but never soaked; standing water rots developing pods.",
      sprinkler: "Industry Best Match: Sprinkler softens soil crust so pegs easily penetrate the ground.",
      open_well: "Good: Matches water availability of seasonal open wells.",
      rainfed: "Widely Grown: Excellent in red sandy soils with normal monsoon showers."
    },
    advisory: "The #1 cash crop for light, red, and sandy soils where Cotton or Paddy struggle."
  },
  {
    id: "wheat",
    name: "Wheat (Gehun)",
    icon: "🌾",
    category: "Cereals",
    waterReq: "Medium (450-600mm)",
    waterLevel: "medium",
    duration: "115-130 days",
    durationDays: 120,
    costPerAcre: 15200,
    yieldPerAcre: 21,
    pricePerQtl: 2425,
    risk: "Low",
    badge: "🌾 Reliable Winter Staple",
    keyStrength: "Guaranteed MSP and low pest vulnerability during winter",
    idealSoils: ["alluvial", "black", "clay"],
    moderateSoils: ["red"],
    poorSoils: ["sandy", "laterite"],
    waterSuitability: { abundant: 50, moderate: 48, limited: 25, scanty: 10 },
    irrigationFit: {
      borewell: "High yield with 4-5 timely irrigations at Crown Root (21 days) and grain filling.",
      drip: "Viable with micro-sprinklers or closely spaced drip lines.",
      canal: "Classic Match: Canal flood turns during northern winter deliver top yields at zero power cost.",
      sprinkler: "Excellent: Simulates gentle rain and prevents soil compaction.",
      open_well: "Dependable if winter water table is preserved from monsoon recharge.",
      rainfed: "Only viable in deep black soils with heavy residual moisture; yield drops 40%."
    },
    advisory: "Solid, safe winter crop with assured government MSP purchase and predictable weather profile."
  },
  {
    id: "chickpea",
    name: "Chickpea (Chana)",
    icon: "🧆",
    category: "Pulses",
    waterReq: "Low (250-350mm)",
    waterLevel: "low",
    duration: "90-110 days",
    durationDays: 100,
    costPerAcre: 11500,
    yieldPerAcre: 8,
    pricePerQtl: 5875,
    risk: "Low",
    badge: "🧆 Low Water Rabi Winner",
    keyStrength: "Utilizes residual black soil moisture with minimal watering",
    idealSoils: ["black", "alluvial", "red"],
    moderateSoils: ["clay", "laterite"],
    poorSoils: ["sandy"],
    waterSuitability: { abundant: 40, moderate: 50, limited: 50, scanty: 35 },
    irrigationFit: {
      borewell: "Needs only 1-2 irrigations: one at branching and one at pod formation.",
      drip: "Prevents collar rot by delivering precise sub-surface moisture.",
      canal: "Overwatering promotes excessive foliage and reduces pod setting; irrigate cautiously.",
      sprinkler: "Ideal for light winter watering without disturbing soil structure.",
      open_well: "Perfect fit: Minimal water requirement leaves well full for spring.",
      rainfed: "Best Rabi Rainfed Crop: Thrives on residual moisture stored in deep black soils."
    },
    advisory: "Outstanding profit-to-cost ratio for Rabi season. Requires almost zero pesticide if nip-pruned."
  },
  {
    id: "tomato",
    name: "Tomato",
    icon: "🍅",
    category: "Vegetables",
    waterReq: "Medium (500-650mm)",
    waterLevel: "medium",
    duration: "90-120 days",
    durationDays: 105,
    costPerAcre: 32000,
    yieldPerAcre: 140,
    pricePerQtl: 1100,
    risk: "Medium-High",
    badge: "🍅 Rapid Weekly Cash Flow",
    keyStrength: "Frequent weekly income with massive fruit yield volume",
    idealSoils: ["red", "alluvial", "black"],
    moderateSoils: ["sandy", "clay"],
    poorSoils: ["laterite"],
    waterSuitability: { abundant: 50, moderate: 45, limited: 20, scanty: 10 },
    irrigationFit: {
      borewell: "Reliable production with weekly furrow or drip irrigation.",
      drip: "Essential: Continuous drip supply ensures uniform fruit sizing without cracking.",
      canal: "Raised beds mandatory; standing canal water triggers fruit rot and bacterial wilt.",
      sprinkler: "Avoid: Wet foliage leads to severe early and late blight infections.",
      open_well: "Manageable for small 1-2 acre plots.",
      rainfed: "High Risk: Moisture fluctuations cause severe fruit cracking and blossom drop."
    },
    advisory: "Weekly harvest income starting from 60 days. Market prices fluctuate, but high yields provide fast cash."
  },
  {
    id: "mustard",
    name: "Mustard (Sarson)",
    icon: "🌼",
    category: "Oilseeds",
    waterReq: "Low (200-300mm)",
    waterLevel: "low",
    duration: "105-125 days",
    durationDays: 115,
    costPerAcre: 10500,
    yieldPerAcre: 7.5,
    pricePerQtl: 5650,
    risk: "Low",
    badge: "🌼 Low Budget Oilseed",
    keyStrength: "Extremely economical, needs only 1-2 irrigations",
    idealSoils: ["alluvial", "red", "sandy", "black"],
    moderateSoils: ["laterite"],
    poorSoils: ["clay"],
    waterSuitability: { abundant: 45, moderate: 50, limited: 45, scanty: 30 },
    irrigationFit: {
      borewell: "Optimal: Produces full seed pods with one irrigation at flowering.",
      drip: "Very efficient; saves water while boosting oil percentage.",
      canal: "Canal turn at pre-sowing and flowering gives excellent results.",
      sprinkler: "Outstanding: Overhead sprinkler matches shallow taproots perfectly.",
      open_well: "Great: Very low water consumption preserves well water.",
      rainfed: "Performs remarkably well on winter showers or dew moisture."
    },
    advisory: "Minimal investment needed (₹10,500/acre). Domestic mustard oil demand keeps mandi prices strong."
  },
  {
    id: "onion",
    name: "Onion (Pyaz)",
    icon: "🧅",
    category: "Vegetables",
    waterReq: "Medium (450-600mm)",
    waterLevel: "medium",
    duration: "120-140 days",
    durationDays: 130,
    costPerAcre: 28000,
    yieldPerAcre: 90,
    pricePerQtl: 2150,
    risk: "Medium-High",
    badge: "🧅 High Demand Cash Bulb",
    keyStrength: "High yield volume and massive price upside in urban mandis",
    idealSoils: ["alluvial", "red", "black"],
    moderateSoils: ["sandy"],
    poorSoils: ["clay", "laterite"],
    waterSuitability: { abundant: 48, moderate: 50, limited: 25, scanty: 10 },
    irrigationFit: {
      borewell: "Frequent light waterings keep shallow root system thriving.",
      drip: "Superb: Drip lines between onion beds prevent bulb rot and save 40% water.",
      canal: "Furrow beds required; flood irrigation causes purple blotch and bulb decay.",
      sprinkler: "Micro-sprinklers produce uniform bulb sizes and cool soil temperatures.",
      open_well: "Viable for Rabi crop with steady winter well supply.",
      rainfed: "Very High Risk: Onion roots are shallow; dry spells stop bulb enlargement."
    },
    advisory: "High return bulb crop. Store properly in ventilated sheds to sell during seasonal price spikes."
  },
  {
    id: "sugarcane",
    name: "Sugarcane (Ganna)",
    icon: "🎋",
    category: "Cash Crop",
    waterReq: "Extreme (>1500mm)",
    waterLevel: "very_high",
    duration: "300-360 days",
    durationDays: 330,
    costPerAcre: 42000,
    yieldPerAcre: 380,
    pricePerQtl: 340,
    risk: "Low-Medium",
    badge: "🎋 Guaranteed Mill Purchase",
    keyStrength: "Highest tonnage yield with assured sugar mill statutory pricing",
    idealSoils: ["alluvial", "black", "clay"],
    moderateSoils: ["red"],
    poorSoils: ["sandy", "laterite"],
    waterSuitability: { abundant: 50, moderate: 25, limited: 5, scanty: 0 },
    irrigationFit: {
      borewell: "Requires heavy year-round pumping; ensure high aquifer yield.",
      drip: "Game Changer: Sub-surface drip cuts water by 50% and increases cane weight by 20%.",
      canal: "Ideal Match: Gravity canal water provides heavy watering without electricity bills.",
      sprinkler: "Not suitable for tall cane canopy.",
      open_well: "Not recommended unless backed by perennial river recharge.",
      rainfed: "Total Failure: Sugarcane cannot survive annual drought without perennial water."
    },
    advisory: "Requires assured year-round water. Sugar mill contracts guarantee payment at FRP (Fair and Remunerative Price)."
  },
  {
    id: "bajra",
    name: "Pearl Millet (Bajra)",
    icon: "🌾",
    category: "Cereals",
    waterReq: "Very Low (200-300mm)",
    waterLevel: "very_low",
    duration: "75-85 days",
    durationDays: 80,
    costPerAcre: 8500,
    yieldPerAcre: 14,
    pricePerQtl: 2500,
    risk: "Very Low",
    badge: "🛡️ Ultimate Drought Shield",
    keyStrength: "Toughest climate-resilient millet with minimal input cost",
    idealSoils: ["sandy", "red", "alluvial", "black"],
    moderateSoils: ["laterite"],
    poorSoils: ["clay"],
    waterSuitability: { abundant: 35, moderate: 45, limited: 50, scanty: 50 },
    irrigationFit: {
      borewell: "Requires zero to one light irrigation; extremely economical.",
      drip: "Overkill for bajra; furrow or rain is sufficient.",
      canal: "Avoid flood waterlogging; bajra hates excess water.",
      sprinkler: "Light sprinkler at emergence gives 100% germination.",
      open_well: "Minimal water consumption; great for water-stressed farms.",
      rainfed: "Undisputed King of Rainfed Farming: Grows even with erratic desert-like rains."
    },
    advisory: "Lowest risk crop in India. Superfood demand has boosted mandi prices and government procurement."
  },
  {
    id: "potato",
    name: "Potato (Aloo)",
    icon: "🥔",
    category: "Vegetables",
    waterReq: "Medium (450-550mm)",
    waterLevel: "medium",
    duration: "85-100 days",
    durationDays: 92,
    costPerAcre: 35000,
    yieldPerAcre: 110,
    pricePerQtl: 1450,
    risk: "Medium",
    badge: "🥔 High Yield Bulk Tuber",
    keyStrength: "Fast 90-day turnaround with huge market volume",
    idealSoils: ["alluvial", "sandy", "red"],
    moderateSoils: ["black"],
    poorSoils: ["clay", "laterite"],
    waterSuitability: { abundant: 50, moderate: 45, limited: 20, scanty: 10 },
    irrigationFit: {
      borewell: "Regular light furrow irrigation keeps tuber beds loose and moist.",
      drip: "Very Good: Prevents water contact with foliage and tuber rotting.",
      canal: "Canal water works well in ridge-and-furrow layout.",
      sprinkler: "Widely used in northern India; creates ideal cool microclimate.",
      open_well: "Manageable for short 90-day winter season.",
      rainfed: "Not viable: Tubers cannot develop in dry, hardened soil."
    },
    advisory: "Requires cold storage logistics post-harvest, but delivers massive cash yield in just 3 months."
  }
];

// ==========================================
// 5. HELPER: DYNAMIC SUITABILITY COMPUTATION
// ==========================================
function getCropSuitability(crop, soilId, methodId, waterId) {
  // 1. Soil Match (out of 35)
  let soilScore = 12;
  let soilMatch = "poor";
  if (crop.idealSoils.includes(soilId)) {
    soilScore = 35;
    soilMatch = "ideal";
  } else if (crop.moderateSoils.includes(soilId)) {
    soilScore = 25;
    soilMatch = "moderate";
  }

  // 2. Irrigation Method Match (out of 35)
  let methodScore = 25;
  let methodStatus = "Good Match";
  const methodFitText = crop.irrigationFit?.[methodId] || "Compatible with proper scheduling.";

  if (methodId === "rainfed") {
    if (crop.waterLevel === "very_high") {
      methodScore = 5;
      methodStatus = "⛔ Severe Deficit (High Failure Risk)";
    } else if (crop.waterLevel === "high" || crop.id === "chilli") {
      methodScore = 12;
      methodStatus = "⚠️ High Drought Risk";
    } else if (crop.waterLevel === "medium") {
      methodScore = 24;
      methodStatus = "🟡 Moderate (Yield at Rain Risk)";
    } else {
      methodScore = 35;
      methodStatus = "✅ Outstanding Rainfed Fit";
    }
  } else if (methodId === "drip") {
    if (["cotton", "chilli", "tomato", "sugarcane", "maize", "red_gram"].includes(crop.id)) {
      methodScore = 35;
      methodStatus = "🌟 98% Optimal (Drip Yield Bonus)";
    } else {
      methodScore = 30;
      methodStatus = "✅ High Efficiency Match";
    }
  } else if (methodId === "canal") {
    if (["paddy", "wheat", "sugarcane", "maize"].includes(crop.id)) {
      methodScore = 35;
      methodStatus = "🌊 Ideal Match (Zero Power Cost)";
    } else {
      methodScore = 28;
      methodStatus = "✅ Good Furrow Match";
    }
  } else if (methodId === "sprinkler") {
    if (["groundnut", "mustard", "chickpea", "wheat", "soybean"].includes(crop.id)) {
      methodScore = 35;
      methodStatus = "💦 Optimal Sprinkler Fit";
    } else if (crop.id === "cotton" || crop.id === "chilli") {
      methodScore = 18;
      methodStatus = "⚠️ Caution (Avoid During Flowering)";
    } else {
      methodScore = 28;
      methodStatus = "✅ Good Coverage";
    }
  } else if (methodId === "borewell") {
    methodScore = 33;
    methodStatus = "🚰 Reliable On-Demand Irrigation";
  } else {
    // open_well
    methodScore = crop.waterLevel === "very_high" ? 15 : 30;
    methodStatus = crop.waterLevel === "very_high" ? "⚠️ Well Depletion Risk" : "✅ Good Seasonal Match";
  }

  // 3. Water Availability Match (out of 30)
  const baseWaterSuit = crop.waterSuitability[waterId] || 20;
  const waterScore = Math.round((baseWaterSuit / 50) * 30);

  const totalScore = Math.min(100, Math.max(10, soilScore + methodScore + waterScore));

  let ratingLabel = "🌟 Highly Suitable";
  let ratingColor = "#16a34a"; // green
  if (totalScore >= 82) {
    ratingLabel = "🌟 Highly Recommended";
    ratingColor = "#16a34a";
  } else if (totalScore >= 68) {
    ratingLabel = "👍 Feasible / Good Fit";
    ratingColor = "#2563eb"; // blue
  } else if (totalScore >= 50) {
    ratingLabel = "⚠️ Moderate Risk";
    ratingColor = "#d97706"; // amber
  } else {
    ratingLabel = "⛔ High Risk for Field";
    ratingColor = "#dc2626"; // red
  }

  return {
    soilScore,
    soilMatch,
    methodScore,
    methodStatus,
    methodFitText,
    waterScore,
    totalScore,
    ratingLabel,
    ratingColor
  };
}

// ==========================================
// 6. HELPER: DYNAMIC INTERCROPPING & RISK ENGINE
// ==========================================
function getDynamicIntercroppingPlan(primaryCropId, soilId, methodId, waterId, acres) {
  const safeAcres = Math.max(0.1, Number(acres) || 0.1);
  const primaryAcreage = Math.round(safeAcres * 0.7 * 100) / 100;
  const companionAcreage = Math.round(safeAcres * 0.2 * 100) / 100;
  const trapAcreage = Math.round(safeAcres * 0.1 * 100) / 100;

  const primaryCrop = CROPS_DB.find((c) => c.id === primaryCropId) || CROPS_DB[1]; // default Cotton

  let companion = {
    name: "Red Gram (Arhar / Tur)",
    icon: "🌾",
    category: "Pulses",
    ratio: "4:1 (4 Rows Primary : 1 Row Tur)",
    duration: "160-180 days",
    nFixKgPerAcre: 38,
    seedRateKg: (companionAcreage * 4.5).toFixed(1) + " kg",
    rationale: "Deep taproots aerate subsoil and deposit natural nitrogen without shading primary plants."
  };

  let trapBorder = {
    name: "African Marigold + Castor Strip",
    icon: "🌼",
    ratio: "10% Field Perimeter & Outer 2 Rows",
    pestsTargeted: "Helicoverpa Bollworm, Sucking Thrips & Spodoptera Armyworm",
    sprayCutPct: 30,
    rationale: "Bright floral volatiles lure pests to outer trap plants, keeping central crop pesticide-free."
  };

  let rowPattern = "4 Rows Primary : 1 Row Companion Pulse (with Marigold/Castor border perimeter)";
  let fertilizerSavingsPerAcre = 2600;
  let bonusRevenuePotential = Math.round(companionAcreage * 18000);

  if (primaryCropId === "cotton") {
    if (methodId === "rainfed" || waterId === "scanty" || waterId === "limited") {
      companion = {
        name: "Green Gram (Moong)",
        icon: "🌱",
        category: "Pulses",
        ratio: "4:1 Row Ratio (4 Rows Cotton : 1 Row Moong)",
        duration: "65-70 days",
        nFixKgPerAcre: 32,
        seedRateKg: (companionAcreage * 5).toFixed(1) + " kg",
        rationale: "Fast 65-day catch crop harvested before summer drought stress sets in."
      };
    } else if (soilId === "red" || soilId === "sandy") {
      companion = {
        name: "Soybean",
        icon: "🫘",
        category: "Legume Oilseed",
        ratio: "4:2 Row Ratio (4 Rows Cotton : 2 Rows Soybean)",
        duration: "90-100 days",
        nFixKgPerAcre: 42,
        seedRateKg: (companionAcreage * 12).toFixed(1) + " kg",
        rationale: "Dense legume canopy covers porous soil, drastically slowing water evaporation."
      };
    } else {
      companion = {
        name: "Red Gram (Arhar / Tur)",
        icon: "🌾",
        category: "Pulses",
        ratio: "4:1 or 8:2 Row Ratio (4-8 Rows Cotton : 1-2 Rows Tur)",
        duration: "160-180 days",
        nFixKgPerAcre: 40,
        seedRateKg: (companionAcreage * 4.5).toFixed(1) + " kg",
        rationale: "Breaks black cotton soil hardpan while fixing 40 kg natural nitrogen per acre."
      };
    }
    trapBorder = {
      name: "African Marigold (10%) + Castor Strip + Outer Bajra",
      icon: "🌼",
      ratio: "10% Border Rows & 1 Trap Plant every 15 Cotton plants",
      pestsTargeted: "Pink Bollworm, American Bollworm, Aphids & Jassids",
      sprayCutPct: 32,
      rationale: "Marigold traps Helicoverpa; Castor traps Spodoptera; outer Bajra blocks wind-borne whiteflies."
    };
    rowPattern = "4:1 or 8:2 (Cotton : Pulse with 2 border rows of Marigold & Castor)";
    fertilizerSavingsPerAcre = 2800;
    bonusRevenuePotential = Math.round(companionAcreage * 22000);

  } else if (primaryCropId === "maize") {
    if (methodId === "rainfed" || waterId === "scanty") {
      companion = {
        name: "Cowpea (Lobia / Chawli)",
        icon: "🌱",
        category: "Pulses",
        ratio: "2:1 Row Ratio (2 Rows Maize : 1 Row Cowpea)",
        duration: "70-75 days",
        nFixKgPerAcre: 35,
        seedRateKg: (companionAcreage * 6).toFixed(1) + " kg",
        rationale: "Tough drought-hardy legume; smothers weeds completely and provides protein-rich animal fodder."
      };
    } else {
      companion = {
        name: "Soybean or French Beans",
        icon: "🫘",
        category: "Legume",
        ratio: "2:2 Strip Intercropping (2 Rows Maize : 2 Rows Soybean)",
        duration: "85-95 days",
        nFixKgPerAcre: 40,
        seedRateKg: (companionAcreage * 10).toFixed(1) + " kg",
        rationale: "Replenishes the heavy nitrogen extraction of maize plants naturally."
      };
    }
    trapBorder = {
      name: "Napier Grass Push-Pull Border + Sunhemp",
      icon: "🌿",
      ratio: "Outer 3-meter perimeter buffer",
      pestsTargeted: "Fall Armyworm (FAW) & Maize Stem Borer",
      sprayCutPct: 35,
      rationale: "Push-Pull system: Sunhemp repels moths, outer Napier traps them."
    };
    rowPattern = "2 Rows Maize : 2 Rows Soybean / Cowpea + Perimeter Napier Buffer";
    fertilizerSavingsPerAcre = 2400;
    bonusRevenuePotential = Math.round(companionAcreage * 16000);

  } else if (primaryCropId === "red_gram") {
    companion = {
      name: soilId === "sandy" || soilId === "red" ? "Groundnut (Peanut)" : "Soybean or Green Gram",
      icon: soilId === "sandy" || soilId === "red" ? "🥜" : "🌱",
      category: "Early Maturing Crop",
      ratio: "1:4 or 1:6 (1 Row Tur : 4-6 Rows Companion)",
      duration: "65-105 days",
      nFixKgPerAcre: 42,
      seedRateKg: (companionAcreage * 12).toFixed(1) + " kg",
      rationale: "Tur grows slowly in first 60 days; companion crop completes harvest without any sunlight competition."
    };
    trapBorder = {
      name: "Sorghum (Jowar) / Bajra Tall Bird Perches",
      icon: "🌾",
      ratio: "Outer boundary line every 20 meters",
      pestsTargeted: "Helicoverpa Pod Borer & Plume Moth",
      sprayCutPct: 25,
      rationale: "Provides landing perches for insectivorous birds that feed on pod borer larvae."
    };
    rowPattern = "1 Row Red Gram : 4 Rows Companion Pulse/Groundnut";
    fertilizerSavingsPerAcre = 2100;
    bonusRevenuePotential = Math.round(companionAcreage * 20000);

  } else if (primaryCropId === "paddy") {
    companion = {
      name: "Azolla Pinnata Bio-Fertilizer (In-Water)",
      icon: "☘️",
      category: "Green Manure Biofertilizer",
      ratio: "Dual cropping in puddled standing water",
      duration: "Continuous multiplication",
      nFixKgPerAcre: 35,
      seedRateKg: (companionAcreage * 200).toFixed(0) + " kg fresh inoculum",
      rationale: "Forms an aquatic carpet fixing 35kg N/acre, suppressing weeds and cooling water temperature."
    };
    trapBorder = {
      name: "Dhaincha (Sesbania) & Black Gram on Bunds",
      icon: "🌾",
      ratio: "Perimeter field bunds & drainage lines",
      pestsTargeted: "Yellow Stem Borer & Leaf Folders",
      sprayCutPct: 22,
      rationale: "Strengthens field bunds against canal erosion while acting as natural insect barrier."
    };
    rowPattern = "Paddy standing water carpeted with Azolla + Dhaincha bund planting";
    fertilizerSavingsPerAcre = 3200;
    bonusRevenuePotential = Math.round(companionAcreage * 14000);

  } else if (primaryCropId === "groundnut") {
    companion = {
      name: "Red Gram (Arhar / Tur)",
      icon: "🌾",
      category: "Pulses",
      ratio: "6:1 or 7:1 (6-7 Rows Groundnut : 1 Row Tur)",
      duration: "160-180 days",
      nFixKgPerAcre: 42,
      seedRateKg: (companionAcreage * 4).toFixed(1) + " kg",
      rationale: "ICAR standard for dryland farming. Tur taproots break hardpan; groundnut protects topsoil."
    };
    trapBorder = {
      name: "Castor Trap Plants (1 plant every 5 meters)",
      icon: "🍃",
      ratio: "Dispersed trap grid in field",
      pestsTargeted: "Spodoptera litura (Tobacco Caterpillar)",
      sprayCutPct: 30,
      rationale: "Castor leaves attract caterpillar egg masses for early manual or biological destruction."
    };
    rowPattern = "6 Rows Groundnut : 1 Row Red Gram + Castor Trap Plants";
    fertilizerSavingsPerAcre = 2200;
    bonusRevenuePotential = Math.round(companionAcreage * 19000);

  } else if (primaryCropId === "chilli") {
    companion = {
      name: "Coriander (Dhania) or Garlic (Lahsun)",
      icon: "🌿",
      category: "Spices / Herbs",
      ratio: "2:1 alternate furrow beds",
      duration: "45-60 days",
      nFixKgPerAcre: 15,
      seedRateKg: (companionAcreage * 4).toFixed(1) + " kg",
      rationale: "Aromatic volatile scent repels mites and flower thrips, protecting flower buds."
    };
    trapBorder = {
      name: "African Marigold Border + 3-Row Barrier Maize",
      icon: "🌼",
      ratio: "Field boundary buffer",
      pestsTargeted: "Thrips, Whiteflies (Leaf Curl Virus) & Root Nematodes",
      sprayCutPct: 40,
      rationale: "Marigold roots secrete alpha-terthienyl killing nematodes; outer maize blocks viruliferous whiteflies."
    };
    rowPattern = "2 Rows Chilli : 1 Row Coriander + 3 Outer Barrier Rows of Maize";
    fertilizerSavingsPerAcre = 3500;
    bonusRevenuePotential = Math.round(companionAcreage * 26000);

  } else if (primaryCropId === "sugarcane") {
    companion = {
      name: soilId === "alluvial" ? "Potato (Aloo)" : "Onion (Pyaz) / Green Gram",
      icon: soilId === "alluvial" ? "🥔" : "🧅",
      category: "Short-Duration Cash Crop",
      ratio: "1:2 Inter-row trench planting",
      duration: "75-90 days",
      nFixKgPerAcre: 25,
      seedRateKg: (companionAcreage * 6).toFixed(1) + " kg",
      rationale: "Cane canopy remains open for first 90 days; short crops utilize this light and moisture for early cash."
    };
    trapBorder = {
      name: "Sunhemp / Dhaincha Green Manure Border",
      icon: "🌱",
      ratio: "Canal intake and field borders",
      pestsTargeted: "Early Shoot Borer & Pyrilla",
      sprayCutPct: 24,
      rationale: "Repels shoot borer moths and provides organic mulch."
    };
    rowPattern = "1 Wide Trench Cane : 2 Inter-row Ridge Vegetable Beds";
    fertilizerSavingsPerAcre = 3600;
    bonusRevenuePotential = Math.round(companionAcreage * 32000);

  } else {
    // Default pulse / millet / general pattern
    companion = {
      name: "Green Gram (Moong) / Cowpea",
      icon: "🌱",
      category: "Pulses",
      ratio: "3:1 Row Ratio",
      duration: "65-75 days",
      nFixKgPerAcre: 34,
      seedRateKg: (companionAcreage * 5).toFixed(1) + " kg",
      rationale: "Universal soil-enriching legume companion that prevents weed growth and adds nitrogen."
    };
    trapBorder = {
      name: "African Marigold & Mustard Border",
      icon: "🌼",
      ratio: "10% Field Perimeter Strip",
      pestsTargeted: "Caterpillars, Aphids and Sucking Insects",
      sprayCutPct: 28,
      rationale: "Provides floral biodiversity and natural predator attraction."
    };
    rowPattern = "3 Rows Main Crop : 1 Row Companion Legume + Outer Border Strip";
    fertilizerSavingsPerAcre = 2300;
    bonusRevenuePotential = Math.round(companionAcreage * 17000);
  }

  // 4-VECTOR RISK SCORING (0-100)
  let weatherRisk = 30;
  if (methodId === "rainfed") weatherRisk = 72;
  else if (methodId === "open_well") weatherRisk = 48;
  else if (methodId === "sprinkler") weatherRisk = 32;
  else if (methodId === "canal") weatherRisk = 28;
  else if (methodId === "drip") weatherRisk = 18;
  else weatherRisk = 22; // borewell

  if (waterId === "scanty") weatherRisk += 16;
  else if (waterId === "limited") weatherRisk += 8;
  else if (waterId === "abundant") weatherRisk -= 8;

  if (soilId === "black") weatherRisk -= 6;
  if (soilId === "sandy") weatherRisk += 10;
  weatherRisk = Math.max(10, Math.min(92, weatherRisk));

  let marketRisk = 35;
  if (["chilli", "tomato", "onion"].includes(primaryCropId)) marketRisk = 68;
  else if (["cotton", "sugarcane"].includes(primaryCropId)) marketRisk = 46;
  else if (["maize", "groundnut", "soybean"].includes(primaryCropId)) marketRisk = 36;
  else marketRisk = 24;
  marketRisk = Math.max(12, marketRisk - 12);

  let waterRisk = 25;
  if (primaryCrop.waterLevel === "very_high") waterRisk = 65;
  else if (primaryCrop.waterLevel === "high") waterRisk = 50;
  else if (primaryCrop.waterLevel === "medium") waterRisk = 35;
  else waterRisk = 18;

  if (methodId === "rainfed") waterRisk += 25;
  else if (methodId === "drip") waterRisk -= 18;
  else if (methodId === "borewell" && waterId === "abundant") waterRisk -= 12;
  waterRisk = Math.max(10, Math.min(95, waterRisk));

  let basePestRisk = 48;
  if (primaryCropId === "cotton" || primaryCropId === "chilli") basePestRisk = 58;
  else if (primaryCropId === "tomato") basePestRisk = 54;
  else if (primaryCropId === "paddy") basePestRisk = 46;
  else basePestRisk = 36;
  const intercropPestRisk = Math.max(14, Math.round(basePestRisk * (1 - trapBorder.sprayCutPct / 100)));

  const aggregateScore = Math.round((weatherRisk * 0.3) + (marketRisk * 0.25) + (waterRisk * 0.25) + (intercropPestRisk * 0.2));

  let riskCategory = "Low Risk (Safe & Resilient)";
  let riskColor = "#16a34a";
  if (aggregateScore >= 60) {
    riskCategory = "High Vulnerability";
    riskColor = "#dc2626";
  } else if (aggregateScore >= 38) {
    riskCategory = "Moderate (Manageable with Scheduling)";
    riskColor = "#d97706";
  }

  const totalFertilizerSavings = Math.round(fertilizerSavingsPerAcre * safeAcres);
  const totalNFixedKg = Math.round(companion.nFixKgPerAcre * companionAcreage);

  return {
    primaryCrop,
    primaryAcreage,
    companion,
    companionAcreage,
    trapBorder,
    trapAcreage,
    rowPattern,
    fertilizerSavingsPerAcre,
    totalFertilizerSavings,
    totalNFixedKg,
    bonusRevenuePotential,
    weatherRisk,
    marketRisk,
    waterRisk,
    basePestRisk,
    intercropPestRisk,
    aggregateScore,
    riskCategory,
    riskColor
  };
}

export default function CropRecommendationTool() {
  const [activeTab, setActiveTab] = useState("compare");

  // ==========================================
  // USER INPUT STATE: CROPS, LAND & IRRIGATION
  // ==========================================
  const [landAcres, setLandAcres] = useState(2.0);
  const [selectedSoil, setSelectedSoil] = useState("black");
  const [selectedIrrigationMethod, setSelectedIrrigationMethod] = useState("borewell");
  const [selectedWaterAvailability, setSelectedWaterAvailability] = useState("moderate");
  const [cropSearch, setCropSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Selected crops for side-by-side comparison
  const [selectedCropIds, setSelectedCropIds] = useState(["red_gram", "cotton", "maize", "green_gram"]);

  // Intercropping Primary Crop Focus State
  const [intercropPrimaryCropId, setIntercropPrimaryCropId] = useState("");

  // Budget Calculator Form State (Tab 2)
  const [selectedCrop, setSelectedCrop] = useState("Cotton");
  const [seedCost, setSeedCost] = useState(3500);
  const [fertCost, setFertCost] = useState(6500);
  const [pestCost, setPestCost] = useState(4200);
  const [laborCost, setLaborCost] = useState(8000);
  const [irrigCost, setIrrigCost] = useState(3000);
  const [machineryCost, setMachineryCost] = useState(5000);
  const [transportCost, setTransportCost] = useState(2500);
  const [expectedYieldQtl, setExpectedYieldQtl] = useState(24);
  const [sellingPriceQtl, setSellingPriceQtl] = useState(2300);

  // Safe boundary protection
  const safeLandAcres = Math.max(0.1, Number(landAcres) || 0.1);

  // Budget Tab Computations
  const safeYieldQtl = Math.max(0, Number(expectedYieldQtl) || 0);
  const safeSellingPrice = Math.max(0, Number(sellingPriceQtl) || 0);
  const totalInputCostPerAcre =
    (Number(seedCost) || 0) +
    (Number(fertCost) || 0) +
    (Number(pestCost) || 0) +
    (Number(laborCost) || 0) +
    (Number(irrigCost) || 0) +
    (Number(machineryCost) || 0) +
    (Number(transportCost) || 0);
  const totalCostOverall = totalInputCostPerAcre * safeLandAcres;
  const totalYieldQuintals = safeYieldQtl * safeLandAcres;
  const grossRevenue = totalYieldQuintals * safeSellingPrice;
  const netProfit = grossRevenue - totalCostOverall;
  const roiPercent = totalCostOverall > 0 ? ((netProfit / totalCostOverall) * 100).toFixed(1) : "0.0";
  const breakEvenPrice = totalYieldQuintals > 0 ? Math.round(totalCostOverall / totalYieldQuintals) : 0;

  // Toggle Crop in Comparison
  const toggleCropSelection = (cropId) => {
    setSelectedCropIds((prev) => {
      if (prev.includes(cropId)) {
        return prev.filter((id) => id !== cropId);
      } else {
        return [...prev, cropId];
      }
    });
  };

  const applyPreset = (cropIdList) => {
    setSelectedCropIds(cropIdList);
  };

  // Transfer Crop into Budget Calculator
  const handleLoadIntoBudget = (crop) => {
    setSelectedCrop(crop.name);
    setExpectedYieldQtl(crop.yieldPerAcre);
    setSellingPriceQtl(crop.pricePerQtl);
    const total = crop.costPerAcre;
    setSeedCost(Math.round(total * 0.16));
    setFertCost(Math.round(total * 0.28));
    setPestCost(Math.round(total * 0.18));
    setLaborCost(Math.round(total * 0.22));
    setIrrigCost(Math.round(total * 0.08));
    setMachineryCost(Math.round(total * 0.05));
    setTransportCost(Math.round(total * 0.03));
    setActiveTab("budget");
  };

  // Filter Crops for Selection Grid
  const categories = ["All", "Pulses", "Cereals", "Cash Crop", "Oilseeds", "Vegetables"];
  const filteredCrops = CROPS_DB.filter((c) => {
    const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
    const matchesSearch =
      c.name.toLowerCase().includes(cropSearch.toLowerCase()) ||
      c.category.toLowerCase().includes(cropSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Dynamic Multi-Crop Comparison Calculations
  const comparedCrops = selectedCropIds
    .map((id) => CROPS_DB.find((c) => c.id === id))
    .filter(Boolean)
    .map((crop) => {
      const suitability = getCropSuitability(crop, selectedSoil, selectedIrrigationMethod, selectedWaterAvailability);

      // Yield adjustment based on irrigation method & water
      let yieldMultiplier = 1.0;
      if (selectedIrrigationMethod === "drip" && ["cotton", "chilli", "tomato", "maize", "sugarcane"].includes(crop.id)) {
        yieldMultiplier = 1.15; // +15% yield with precision drip
      } else if (selectedIrrigationMethod === "rainfed") {
        if (crop.waterLevel === "very_high") yieldMultiplier = 0.55;
        else if (crop.waterLevel === "high") yieldMultiplier = 0.72;
        else if (crop.waterLevel === "medium") yieldMultiplier = 0.85;
        else yieldMultiplier = 0.98;
      }

      // Cost adjustment: Rainfed saves ₹1,500/acre in pumping costs
      const costAdjustmentPerAcre = selectedIrrigationMethod === "rainfed" ? -1500 : 0;
      const adjustedCostPerAcre = Math.max(5000, crop.costPerAcre + costAdjustmentPerAcre);

      const totalCost = adjustedCostPerAcre * safeLandAcres;
      const totalYield = Math.round(crop.yieldPerAcre * yieldMultiplier * safeLandAcres * 10) / 10;
      const totalGross = Math.round(totalYield * crop.pricePerQtl);
      const totalProfit = totalGross - totalCost;
      const roi = totalCost > 0 ? Math.round((totalProfit / totalCost) * 100) : 0;
      const breakEven = totalYield > 0 ? Math.round(totalCost / totalYield) : 0;

      return {
        ...crop,
        suitability,
        yieldMultiplier,
        adjustedCostPerAcre,
        totalCost,
        totalYield,
        totalGross,
        totalProfit,
        roi,
        breakEven
      };
    });

  // Calculate Recommendations among compared crops
  let bestOverallCrop = null;
  let highestProfitCrop = null;
  let lowestRiskCrop = null;
  let fastestHarvestCrop = null;
  let bestWaterCrop = null;

  if (comparedCrops.length >= 2) {
    bestOverallCrop = [...comparedCrops].sort((a, b) => {
      const scoreA = a.suitability.totalScore * 1000 + a.totalProfit;
      const scoreB = b.suitability.totalScore * 1000 + b.totalProfit;
      return scoreB - scoreA;
    })[0];

    highestProfitCrop = [...comparedCrops].sort((a, b) => b.totalProfit - a.totalProfit)[0];
    lowestRiskCrop = [...comparedCrops].sort((a, b) => a.totalCost - b.totalCost)[0];
    fastestHarvestCrop = [...comparedCrops].sort((a, b) => a.durationDays - b.durationDays)[0];
    bestWaterCrop = [...comparedCrops].sort((a, b) => b.suitability.methodScore - a.suitability.methodScore)[0];
  }

  const currentSoilObj = SOIL_TYPES.find((s) => s.id === selectedSoil) || SOIL_TYPES[0];
  const currentMethodObj = IRRIGATION_METHODS.find((m) => m.id === selectedIrrigationMethod) || IRRIGATION_METHODS[0];
  const currentWaterObj = WATER_AVAILABILITIES.find((w) => w.id === selectedWaterAvailability) || WATER_AVAILABILITIES[1];

  // Dynamic Intercropping Plan Computation
  const activeIntercropPrimaryId = intercropPrimaryCropId || (selectedCropIds.length > 0 ? selectedCropIds[0] : "cotton");
  const intercropPlan = getDynamicIntercroppingPlan(
    activeIntercropPrimaryId,
    selectedSoil,
    selectedIrrigationMethod,
    selectedWaterAvailability,
    safeLandAcres
  );

  return (
    <div className="page-container crop-tool-page page-enter">
      {/* PAGE HEADER */}
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "16px", marginBottom: "20px" }}>
        <div>
          <h1 className="page-title" style={{ display: "flex", alignItems: "center", gap: "8px", margin: "0 0 6px" }}>
            🌾 Smart Farm Financial Hub & Multi-Crop Decision Engine
          </h1>
          <p className="page-subtitle" style={{ margin: 0 }}>
            Enter your exact land details, choose your way of getting water for irrigation, pick crops, and get a complete side-by-side comparison.
          </p>
        </div>

        {/* TAB BUTTONS: 1. Multi-Crop Comparison Engine | 2. Smart Intercropping & Risk Matrix | 3. Smart Budget */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }} role="tablist" aria-label="Crop Tool Sections">
          <button
            role="tab"
            aria-selected={activeTab === "compare"}
            className={`secondary-btn ${activeTab === "compare" ? "active" : ""}`}
            onClick={() => setActiveTab("compare")}
            style={{
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "6px",
              border: activeTab === "compare" ? "2px solid #16a34a" : "1px solid var(--fk-border)",
              background: activeTab === "compare" ? "#16a34a" : "var(--fk-card)",
              color: activeTab === "compare" ? "#ffffff" : "var(--fk-text)",
              cursor: "pointer"
            }}
          >
            📊 Multi-Crop Comparison Engine
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "plan"}
            className={`secondary-btn ${activeTab === "plan" ? "active" : ""}`}
            onClick={() => setActiveTab("plan")}
            style={{
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "6px",
              border: activeTab === "plan" ? "2px solid #16a34a" : "1px solid var(--fk-border)",
              background: activeTab === "plan" ? "#16a34a" : "var(--fk-card)",
              color: activeTab === "plan" ? "#ffffff" : "var(--fk-text)",
              cursor: "pointer"
            }}
          >
            🌿 Smart Intercropping & Risk Matrix
          </button>
          <button
            role="tab"
            aria-selected={activeTab === "budget"}
            className={`secondary-btn ${activeTab === "budget" ? "active" : ""}`}
            onClick={() => setActiveTab("budget")}
            style={{
              fontWeight: "700",
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "10px 16px",
              borderRadius: "6px",
              border: activeTab === "budget" ? "2px solid #16a34a" : "1px solid var(--fk-border)",
              background: activeTab === "budget" ? "#16a34a" : "var(--fk-card)",
              color: activeTab === "budget" ? "#ffffff" : "var(--fk-text)",
              cursor: "pointer"
            }}
          >
            💰 Smart Budget & Break-Even Calculator
          </button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* TAB 1: MULTI-CROP COMPARISON ENGINE */}
      {/* ========================================================= */}
      {activeTab === "compare" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>

          {/* CARD 1: ENTER LAND DETAILS & WAY OF GETTING WATER */}
          <div className="glass-card" style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", borderRadius: "10px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "18px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(22, 163, 74, 0.12)", color: "#16a34a", padding: "8px", borderRadius: "8px" }}>
                  <Sliders size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                    Step 1: Enter Your Land Details & Way of Getting Water for Irrigation
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "2px 0 0" }}>
                    Crop returns, yield forecasts, and feasibility scores will automatically recalculate for your exact field.
                  </p>
                </div>
              </div>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a", background: "rgba(22, 163, 74, 0.1)", padding: "4px 12px", borderRadius: "20px" }}>
                ⚡ Live Auto-Recalculating
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "16px" }}>

              {/* 1. LAND SIZE INPUT */}
              <div style={{ background: "var(--fk-bg)", padding: "14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
                <label style={{ fontSize: "13px", fontWeight: "800", color: "var(--fk-text)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span>📏 Enter Land Details (Acres)</span>
                  <span style={{ color: "#16a34a", fontWeight: "800", fontSize: "14px" }}>{safeLandAcres} Acres</span>
                </label>
                <div style={{ display: "flex", gap: "6px", alignItems: "center", marginBottom: "8px" }}>
                  <input
                    type="number"
                    min="0.25"
                    step="0.5"
                    max="100"
                    value={landAcres}
                    onChange={(e) => setLandAcres(Math.max(0.1, Number(e.target.value)))}
                    style={{
                      width: "100%",
                      padding: "8px 12px",
                      borderRadius: "6px",
                      border: "1px solid var(--fk-border)",
                      background: "var(--fk-card)",
                      color: "var(--fk-text)",
                      fontSize: "15px",
                      fontWeight: "700"
                    }}
                  />
                  <span style={{ fontSize: "13px", color: "var(--fk-text-sub)", whiteSpace: "nowrap", fontWeight: "600" }}>Acres</span>
                </div>
                {/* QUICK BUTTONS */}
                <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                  {[1, 2, 3, 5, 10].map((ac) => (
                    <button
                      key={ac}
                      type="button"
                      onClick={() => setLandAcres(ac)}
                      style={{
                        padding: "3px 8px",
                        fontSize: "12px",
                        fontWeight: "600",
                        borderRadius: "4px",
                        border: landAcres === ac ? "1px solid #16a34a" : "1px solid var(--fk-border)",
                        background: landAcres === ac ? "rgba(22, 163, 74, 0.15)" : "var(--fk-card)",
                        color: landAcres === ac ? "#16a34a" : "var(--fk-text-sub)",
                        cursor: "pointer"
                      }}
                    >
                      {ac} Acre{ac > 1 ? "s" : ""}
                    </button>
                  ))}
                </div>
              </div>

              {/* 2. SOIL TYPE SELECTION */}
              <div style={{ background: "var(--fk-bg)", padding: "14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
                <label style={{ fontSize: "13px", fontWeight: "800", color: "var(--fk-text)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span>🪨 Soil Type of Your Land</span>
                  <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "700" }}>{currentSoilObj.badge}</span>
                </label>
                <select
                  value={selectedSoil}
                  onChange={(e) => setSelectedSoil(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--fk-border)",
                    background: "var(--fk-card)",
                    color: "var(--fk-text)",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "6px"
                  }}
                >
                  {SOIL_TYPES.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.icon} {s.name}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: "12px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.4" }}>
                  {currentSoilObj.desc}
                </p>
              </div>

              {/* 3. THE WAY OF GETTING WATER FOR IRRIGATION */}
              <div style={{ background: "var(--fk-bg)", padding: "14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
                <label style={{ fontSize: "13px", fontWeight: "800", color: "var(--fk-text)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span>🚰 Way of Getting Water for Irrigation</span>
                  <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>{currentMethodObj.icon} {currentMethodObj.name.split(" ")[0]}</span>
                </label>
                <select
                  value={selectedIrrigationMethod}
                  onChange={(e) => setSelectedIrrigationMethod(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--fk-border)",
                    background: "var(--fk-card)",
                    color: "var(--fk-text)",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "6px"
                  }}
                >
                  {IRRIGATION_METHODS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.icon} {m.name} — {m.sub}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: "12px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.4" }}>
                  <strong>Impact:</strong> {currentMethodObj.efficiency}
                </p>
              </div>

              {/* 4. WATER AVAILABILITY / FREQUENCY */}
              <div style={{ background: "var(--fk-bg)", padding: "14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
                <label style={{ fontSize: "13px", fontWeight: "800", color: "var(--fk-text)", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                  <span>💧 Water Availability Level</span>
                  <span style={{ fontSize: "12px", color: "#0891b2", fontWeight: "700" }}>{currentWaterObj.icon} {currentWaterObj.name.split(" ")[0]}</span>
                </label>
                <select
                  value={selectedWaterAvailability}
                  onChange={(e) => setSelectedWaterAvailability(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px",
                    borderRadius: "6px",
                    border: "1px solid var(--fk-border)",
                    background: "var(--fk-card)",
                    color: "var(--fk-text)",
                    fontSize: "14px",
                    fontWeight: "600",
                    marginBottom: "6px"
                  }}
                >
                  {WATER_AVAILABILITIES.map((w) => (
                    <option key={w.id} value={w.id}>
                      {w.icon} {w.name} — {w.sub}
                    </option>
                  ))}
                </select>
                <p style={{ fontSize: "12px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.4" }}>
                  {currentWaterObj.desc}
                </p>
              </div>

            </div>
          </div>

          {/* CARD 2: ENTER / SELECT CROPS TO COMPARE */}
          <div className="glass-card" style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", borderRadius: "10px", padding: "22px", boxShadow: "0 2px 10px rgba(0,0,0,0.04)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563eb", padding: "8px", borderRadius: "8px" }}>
                  <Layers size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                    Step 2: Enter or Select Crops to Compare
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "2px 0 0" }}>
                    Search or click on any 2 or more crops to compare returns, costs, and water feasibility side-by-side.
                  </p>
                </div>
              </div>

              {/* SELECTION STATUS BADGE */}
              <div>
                {selectedCropIds.length < 2 ? (
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#dc2626", background: "rgba(220, 38, 38, 0.12)", padding: "6px 12px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <AlertTriangle size={15} /> Select at least 2 crops (Currently: {selectedCropIds.length})
                  </span>
                ) : (
                  <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a", background: "rgba(22, 163, 74, 0.12)", padding: "6px 14px", borderRadius: "20px", display: "inline-flex", alignItems: "center", gap: "5px" }}>
                    <CheckCircle2 size={15} /> {selectedCropIds.length} Crops Selected for Comparison
                  </span>
                )}
              </div>
            </div>

            {/* SEARCH & CATEGORY FILTER ROW */}
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", alignItems: "center", marginBottom: "14px" }}>
              {/* CROP SEARCH INPUT */}
              <div style={{ position: "relative", flex: "1 1 240px" }}>
                <Search size={16} style={{ position: "absolute", left: "12px", top: "50%", transform: "translateY(-50%)", color: "var(--fk-text-sub)" }} />
                <input
                  type="text"
                  placeholder="🔍 Search crops by name (e.g. Cotton, Chilli, Paddy, Maize)..."
                  value={cropSearch}
                  onChange={(e) => setCropSearch(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "9px 12px 9px 36px",
                    borderRadius: "6px",
                    border: "1px solid var(--fk-border)",
                    background: "var(--fk-bg)",
                    color: "var(--fk-text)",
                    fontSize: "14px"
                  }}
                />
              </div>

              {/* CATEGORY PILLS */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      padding: "6px 12px",
                      fontSize: "13px",
                      fontWeight: selectedCategory === cat ? "700" : "600",
                      borderRadius: "20px",
                      border: selectedCategory === cat ? "1px solid #16a34a" : "1px solid var(--fk-border)",
                      background: selectedCategory === cat ? "rgba(22, 163, 74, 0.15)" : "var(--fk-bg)",
                      color: selectedCategory === cat ? "#16a34a" : "var(--fk-text-sub)",
                      cursor: "pointer"
                    }}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* PRESET FILTER SHORTCUTS */}
            <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center", marginBottom: "16px", padding: "10px 14px", background: "var(--fk-bg)", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                <Filter size={13} /> Quick Presets:
              </span>
              <button
                type="button"
                onClick={() => applyPreset(["red_gram", "cotton", "maize", "green_gram"])}
                style={{ padding: "5px 10px", fontSize: "13px", fontWeight: "600", borderRadius: "5px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", cursor: "pointer" }}
              >
                ⭐ Top 4 Regional Standards
              </button>
              <button
                type="button"
                onClick={() => applyPreset(["cotton", "chilli", "maize", "tomato"])}
                style={{ padding: "5px 10px", fontSize: "13px", fontWeight: "600", borderRadius: "5px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", cursor: "pointer" }}
              >
                💰 High Commercial Profit
              </button>
              <button
                type="button"
                onClick={() => applyPreset(["green_gram", "red_gram", "bajra", "chickpea"])}
                style={{ padding: "5px 10px", fontSize: "13px", fontWeight: "600", borderRadius: "5px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", cursor: "pointer" }}
              >
                💧 Low Water & Rainfed Champions
              </button>
              <button
                type="button"
                onClick={() => applyPreset(["groundnut", "mustard", "wheat", "soybean"])}
                style={{ padding: "5px 10px", fontSize: "13px", fontWeight: "600", borderRadius: "5px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", cursor: "pointer" }}
              >
                🏖️ Sandy & Loam Performers
              </button>
              <button
                type="button"
                onClick={() => applyPreset(CROPS_DB.map((c) => c.id))}
                style={{ padding: "5px 10px", fontSize: "13px", fontWeight: "600", borderRadius: "5px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", cursor: "pointer" }}
              >
                Select All ({CROPS_DB.length})
              </button>
              <button
                type="button"
                onClick={() => setSelectedCropIds([])}
                style={{ padding: "5px 10px", fontSize: "13px", fontWeight: "600", borderRadius: "5px", border: "1px solid var(--fk-border)", background: "transparent", color: "#dc2626", cursor: "pointer", marginLeft: "auto" }}
              >
                Clear All
              </button>
            </div>

            {/* CROP CHIPS / CARDS SELECTOR GRID */}
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: "10px" }}>
              {filteredCrops.map((c) => {
                const isSelected = selectedCropIds.includes(c.id);
                const suitability = getCropSuitability(c, selectedSoil, selectedIrrigationMethod, selectedWaterAvailability);

                return (
                  <div
                    key={c.id}
                    onClick={() => toggleCropSelection(c.id)}
                    style={{
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                      padding: "12px",
                      borderRadius: "8px",
                      border: isSelected ? "2px solid #16a34a" : "1px solid var(--fk-border)",
                      background: isSelected ? "rgba(22, 163, 74, 0.08)" : "var(--fk-card)",
                      cursor: "pointer",
                      transition: "all 0.18s ease",
                      position: "relative",
                      boxShadow: isSelected ? "0 2px 8px rgba(22, 163, 74, 0.15)" : "none"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: "8px", marginBottom: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <span style={{ fontSize: "25.5px", lineHeight: "1" }}>{c.icon}</span>
                        <div>
                          <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)" }}>{c.name}</div>
                          <span style={{ fontSize: "11px", color: "var(--fk-text-sub)", fontWeight: "600" }}>{c.category}</span>
                        </div>
                      </div>

                      {/* CHECKMARK ICON */}
                      <div
                        style={{
                          width: "20px",
                          height: "20px",
                          borderRadius: "50%",
                          border: isSelected ? "2px solid #16a34a" : "2px solid var(--fk-border)",
                          background: isSelected ? "#16a34a" : "transparent",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          color: "#ffffff",
                          flexShrink: 0
                        }}
                      >
                        {isSelected && <Check size={12} strokeWidth={3} />}
                      </div>
                    </div>

                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "700",
                          color: suitability.ratingColor,
                          background: `${suitability.ratingColor}15`,
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}
                      >
                        {suitability.totalScore}% Match
                      </span>
                      <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
                        💧 {c.waterReq.split(" ")[0]}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CARD 3: THE SIDE-BY-SIDE COMPARISON OUTPUT */}
          {selectedCropIds.length < 2 ? (
            /* GUIDANCE WHEN FEWER THAN 2 CROPS ARE SELECTED */
            <div
              className="glass-card"
              style={{
                background: "var(--fk-card)",
                border: "2px dashed #f59e0b",
                borderRadius: "10px",
                padding: "36px 20px",
                textAlign: "center"
              }}
            >
              <div style={{ width: "56px", height: "56px", borderRadius: "50%", background: "rgba(245, 158, 11, 0.15)", color: "#d97706", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 14px" }}>
                <HelpCircle size={32} />
              </div>
              <h3 style={{ fontSize: "19.5px", fontWeight: "800", color: "var(--fk-text)", margin: "0 0 8px" }}>
                Select at least 2 crops to unlock side-by-side comparison
              </h3>
              <p style={{ fontSize: "14px", color: "var(--fk-text-sub)", maxWidth: "540px", margin: "0 auto 20px" }}>
                Currently, you have selected <strong>{selectedCropIds.length}</strong> crop(s). Click on any two or more crops above, or choose an instant comparison combination below:
              </p>
              <div style={{ display: "flex", gap: "10px", justifyContent: "center", flexWrap: "wrap" }}>
                <button
                  type="button"
                  onClick={() => applyPreset(["cotton", "red_gram"])}
                  style={{ padding: "8px 16px", fontSize: "14px", fontWeight: "700", borderRadius: "6px", border: "1px solid #16a34a", background: "#16a34a", color: "#ffffff", cursor: "pointer" }}
                >
                  🌾 Cotton vs Red Gram
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(["maize", "green_gram"])}
                  style={{ padding: "8px 16px", fontSize: "14px", fontWeight: "700", borderRadius: "6px", border: "1px solid #2563eb", background: "#2563eb", color: "#ffffff", cursor: "pointer" }}
                >
                  🌽 Maize vs Green Gram
                </button>
                <button
                  type="button"
                  onClick={() => applyPreset(["red_gram", "cotton", "maize", "green_gram"])}
                  style={{ padding: "8px 16px", fontSize: "14px", fontWeight: "700", borderRadius: "6px", border: "1px solid var(--fk-border)", background: "var(--fk-bg)", color: "var(--fk-text)", cursor: "pointer" }}
                >
                  ⭐ Reset to Top 4 Regional Crops
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* AI AGRONOMIC & IRRIGATION VERDICT BANNER */}
              <div
                className="glass-card"
                style={{
                  background: "linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(37, 99, 235, 0.06) 100%)",
                  border: "1px solid rgba(22, 163, 74, 0.25)",
                  borderRadius: "10px",
                  padding: "20px"
                }}
              >
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "14px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <Sparkles size={20} color="#16a34a" />
                    <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                      Field Advisory: {safeLandAcres} Acres • {currentSoilObj.name.split(" ")[0]} Soil • {currentMethodObj.name}
                    </h3>
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>
                    Comparing <strong>{comparedCrops.length}</strong> Selected Crops
                  </span>
                </div>

                {/* 4 SUMMARY METRIC CARDS */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "12px", marginBottom: "14px" }}>
                  {/* WINNER 1: BEST OVERALL FIT */}
                  <div style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Award size={14} /> 1. Best Overall Match
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", marginTop: "4px" }}>
                      {bestOverallCrop?.icon} {bestOverallCrop?.name}
                    </div>
                    <span style={{ fontSize: "13px", fontWeight: "700", color: "#16a34a" }}>
                      {bestOverallCrop?.suitability.totalScore}% Suitability Match
                    </span>
                  </div>

                  {/* WINNER 2: HIGHEST PROFIT */}
                  <div style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                      <TrendingUp size={14} /> 2. Highest Net Profit
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: "800", color: "#16a34a", marginTop: "4px" }}>
                      ₹{highestProfitCrop?.totalProfit.toLocaleString()}
                    </div>
                    <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>
                      {highestProfitCrop?.icon} {highestProfitCrop?.name} ({highestProfitCrop?.roi}% ROI)
                    </span>
                  </div>

                  {/* WINNER 3: BEST IRRIGATION FIT */}
                  <div style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#0891b2", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Droplets size={14} /> 3. Best for Your Water Source
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", marginTop: "4px" }}>
                      {bestWaterCrop?.icon} {bestWaterCrop?.name}
                    </div>
                    <span style={{ fontSize: "12px", color: "#0891b2", fontWeight: "600" }}>
                      {bestWaterCrop?.suitability.methodStatus}
                    </span>
                  </div>

                  {/* WINNER 4: FASTEST HARVEST */}
                  <div style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", padding: "12px", borderRadius: "8px" }}>
                    <div style={{ fontSize: "12px", fontWeight: "700", color: "#9333ea", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
                      <Zap size={14} /> 4. Fastest Cash Cycle
                    </div>
                    <div style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", marginTop: "4px" }}>
                      ⏱️ {fastestHarvestCrop?.duration}
                    </div>
                    <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>
                      {fastestHarvestCrop?.icon} {fastestHarvestCrop?.name}
                    </span>
                  </div>
                </div>

                {/* IRRIGATION METHOD ADVICE NOTE */}
                <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", padding: "12px 14px", borderRadius: "6px", display: "flex", alignItems: "flex-start", gap: "8px" }}>
                  <Info size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: "2px" }} />
                  <p style={{ fontSize: "13.5px", color: "var(--fk-text)", margin: 0, lineHeight: "1.5" }}>
                    <strong>Irrigation Impact ({currentMethodObj.name}): </strong>
                    {selectedIrrigationMethod === "drip" && "Precision drip irrigation saves 40-50% water while increasing yields by +12-15% for row crops like Cotton, Chilli, and Tomato."}
                    {selectedIrrigationMethod === "borewell" && "Steady tube-well water ensures reliable vegetative & flowering stage moisture. Protect motor from dry run during peak summer."}
                    {selectedIrrigationMethod === "canal" && "Low-cost surface canal water provides abundant volume for Paddy, Wheat, and Sugarcane with zero electric pumping costs."}
                    {selectedIrrigationMethod === "sprinkler" && "Sprinklers simulate natural rainfall with 30% water savings. Ideal for Groundnut, Mustard, and Chickpea."}
                    {selectedIrrigationMethod === "open_well" && "Monitor open well water levels through post-monsoon months; short-duration crops (Moong, Maize) preserve water."}
                    {selectedIrrigationMethod === "rainfed" && "⚠️ Rainfed Alert: High-water crops (Paddy, Sugarcane, Chilli) carry extreme crop failure risk without assured water. We strongly recommend drought-resilient crops like Red Gram, Green Gram, or Bajra."}
                  </p>
                </div>
              </div>

              {/* SECTION: COMPLETE SIDE-BY-SIDE PARAMETER MATRIX TABLE */}
              <div className="glass-card" style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", borderRadius: "10px", padding: "20px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <BarChart2 size={20} color="#2563eb" />
                    <div>
                      <h3 style={{ fontSize: "19.5px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                        Side-by-Side Multi-Crop Comparison Engine ({safeLandAcres} Acres)
                      </h3>
                      <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "2px 0 0" }}>
                        Evaluating {comparedCrops.length} selected crops for your {currentSoilObj.name.split(" ")[0]} soil and {currentMethodObj.name}.
                      </p>
                    </div>
                  </div>
                  <span style={{ fontSize: "13px", color: "var(--fk-text-sub)", background: "var(--fk-bg)", padding: "4px 10px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                    {comparedCrops.length} Crops in View
                  </span>
                </div>

                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", fontSize: "14px", borderCollapse: "collapse", minWidth: "750px" }}>
                    <thead>
                      <tr style={{ background: "var(--fk-bg)", borderBottom: "2px solid var(--fk-border)", textAlign: "left" }}>
                        <th style={{ padding: "14px 12px", width: "230px", color: "var(--fk-text)" }}>Parameter</th>
                        {comparedCrops.map((c) => {
                          const isWinner = bestOverallCrop && bestOverallCrop.id === c.id;
                          return (
                            <th key={c.id} style={{ padding: "14px 12px", minWidth: "165px", background: isWinner ? "rgba(22, 163, 74, 0.05)" : "transparent" }}>
                              <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                <span style={{ fontSize: "21.5px" }}>{c.icon}</span>
                                <div style={{ fontSize: "15px", fontWeight: "800", color: "var(--fk-text)" }}>{c.name}</div>
                              </div>
                              <span
                                style={{
                                  fontSize: "11px",
                                  fontWeight: "700",
                                  color: c.suitability.ratingColor,
                                  background: `${c.suitability.ratingColor}15`,
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  display: "inline-block",
                                  marginTop: "4px"
                                }}
                              >
                                {isWinner ? "🏆 Top Fit (" + c.suitability.totalScore + "%)" : c.suitability.totalScore + "% Match"}
                              </span>
                            </th>
                          );
                        })}
                      </tr>
                    </thead>
                    <tbody>
                      {/* ROW 1: SUITABILITY MATCH */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>Field Suitability Match</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: "700", color: c.suitability.ratingColor }}>{c.suitability.ratingLabel}</div>
                            <div style={{ fontSize: "12px", color: "var(--fk-text-sub)", marginTop: "2px" }}>{c.keyStrength}</div>
                          </td>
                        ))}
                      </tr>

                      {/* ROW 2: IRRIGATION METHOD FIT */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)", background: "rgba(37, 99, 235, 0.02)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>
                          Water Source Compatibility ({currentMethodObj.name.split(" ")[0]})
                        </td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: "700", fontSize: "13px", color: c.suitability.methodScore >= 30 ? "#16a34a" : c.suitability.methodScore >= 20 ? "#d97706" : "#dc2626" }}>
                              {c.suitability.methodStatus}
                            </div>
                            <div style={{ fontSize: "12px", color: "var(--fk-text-sub)", marginTop: "2px" }}>
                              {c.suitability.methodFitText}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* ROW 3: WATER REQUIREMENT */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>Water Requirement</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>
                            💧 {c.waterReq}
                          </td>
                        ))}
                      </tr>

                      {/* ROW 4: SOIL FIT */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>
                          Soil Fit ({currentSoilObj.name.split(" ")[0]})
                        </td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px" }}>
                            <div style={{ fontWeight: "700", color: c.suitability.soilScore === 35 ? "#16a34a" : c.suitability.soilScore === 25 ? "#d97706" : "#dc2626" }}>
                              {c.suitability.soilScore === 35 ? "✅ Ideal Fit" : c.suitability.soilScore === 25 ? "🟡 Moderate Fit" : "⚠️ Poor Fit"}
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* ROW 5: DURATION */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>Crop Duration to Harvest</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>
                            ⏱️ {c.duration}
                          </td>
                        ))}
                      </tr>

                      {/* ROW 6: INPUT COST PER ACRE */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>Input Cost / Acre</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px", color: "#dc2626", fontWeight: "700" }}>
                            ₹{c.adjustedCostPerAcre.toLocaleString()}
                          </td>
                        ))}
                      </tr>

                      {/* ROW 7: TOTAL INVESTMENT SCALED TO ACRES */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>
                          Total Cost ({safeLandAcres} Acres)
                        </td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px", fontWeight: "800", color: "#dc2626" }}>
                            ₹{c.totalCost.toLocaleString()}
                          </td>
                        ))}
                      </tr>

                      {/* ROW 8: RISK LEVEL */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>Risk Level</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px" }}>
                            <span
                              style={{
                                fontSize: "12px",
                                fontWeight: "700",
                                color: c.risk.includes("Low") ? "#16a34a" : c.risk.includes("High") ? "#dc2626" : "#d97706",
                                background: c.risk.includes("Low") ? "rgba(22, 163, 74, 0.1)" : c.risk.includes("High") ? "rgba(220, 38, 38, 0.1)" : "rgba(217, 119, 6, 0.1)",
                                padding: "2px 8px",
                                borderRadius: "4px"
                              }}
                            >
                              {c.risk}
                            </span>
                          </td>
                        ))}
                      </tr>

                      {/* ROW 9: EXPECTED YIELD */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>
                          Expected Yield ({safeLandAcres} Acres)
                        </td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>
                            {c.totalYield} Qtl
                            <div style={{ fontSize: "12px", fontWeight: "normal", color: "var(--fk-text-sub)" }}>
                              ~{Math.round(c.yieldPerAcre * c.yieldMultiplier * 10) / 10} Qtl/Acre
                            </div>
                          </td>
                        ))}
                      </tr>

                      {/* ROW 10: MANDI PRICE */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>Market Selling Price</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>
                            ₹{c.pricePerQtl.toLocaleString()}/Qtl
                          </td>
                        ))}
                      </tr>

                      {/* ROW 11: GROSS REVENUE */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>Expected Revenue</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px", fontWeight: "700", color: "#16a34a" }}>
                            ₹{c.totalGross.toLocaleString()}
                          </td>
                        ))}
                      </tr>

                      {/* ROW 12: NET EXPECTED PROFIT (HERO ROW) */}
                      <tr style={{ borderBottom: "2px solid #16a34a", background: "rgba(22, 163, 74, 0.12)" }}>
                        <td style={{ padding: "14px 12px", fontWeight: "900", color: "#16a34a", fontSize: "15px" }}>
                          💵 Net Expected Profit
                        </td>
                        {comparedCrops.map((c) => {
                          const isMaxProfit = highestProfitCrop && highestProfitCrop.id === c.id;
                          return (
                            <td key={c.id} style={{ padding: "14px 12px", fontSize: "17px", fontWeight: "900", color: "#16a34a" }}>
                              ₹{c.totalProfit.toLocaleString()}
                              {isMaxProfit && (
                                <span style={{ fontSize: "11px", background: "#16a34a", color: "#ffffff", padding: "1px 6px", borderRadius: "10px", marginLeft: "6px", verticalAlign: "middle" }}>
                                  Highest
                                </span>
                              )}
                              <div style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", marginTop: "2px" }}>
                                {c.roi}% ROI
                              </div>
                            </td>
                          );
                        })}
                      </tr>

                      {/* ROW 13: BREAK-EVEN PRICE */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>Break-Even Price</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px", color: "var(--fk-text)" }}>
                            ₹{c.breakEven}/Qtl
                            <div style={{ fontSize: "11px", color: "var(--fk-text-sub)" }}>Min price to recover costs</div>
                          </td>
                        ))}
                      </tr>

                      {/* ROW 14: KISAN ADVISORY TIP */}
                      <tr style={{ borderBottom: "1px solid var(--fk-border)" }}>
                        <td style={{ padding: "10px 12px", fontWeight: "700", color: "var(--fk-text)" }}>Kisan Advisor Tip</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "10px 12px", fontSize: "12px", color: "var(--fk-text-sub)", lineHeight: "1.4" }}>
                            {c.advisory}
                          </td>
                        ))}
                      </tr>

                      {/* ROW 15: ACTION BUTTON */}
                      <tr>
                        <td style={{ padding: "12px", fontWeight: "700", color: "var(--fk-text)" }}>Action</td>
                        {comparedCrops.map((c) => (
                          <td key={c.id} style={{ padding: "12px" }}>
                            <button
                              type="button"
                              onClick={() => handleLoadIntoBudget(c)}
                              style={{
                                padding: "6px 12px",
                                borderRadius: "6px",
                                border: "1px solid #16a34a",
                                background: "#16a34a",
                                color: "#ffffff",
                                fontSize: "12px",
                                fontWeight: "700",
                                cursor: "pointer",
                                display: "inline-flex",
                                alignItems: "center",
                                gap: "4px"
                              }}
                            >
                              Plan Budget <ArrowRight size={12} />
                            </button>
                          </td>
                        ))}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 2: SMART INTERCROPPING & RISK MATRIX (ICAR COMPLIANT) */}
      {/* ========================================================= */}
      {activeTab === "plan" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
          {/* TOP CONTROLS & PRIMARY CROP SELECTOR */}
          <div className="glass-card" style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", borderRadius: "10px", padding: "18px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: "12px", marginBottom: "14px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <div style={{ background: "rgba(37, 99, 235, 0.12)", color: "#2563eb", padding: "8px", borderRadius: "8px" }}>
                  <PieChart size={22} />
                </div>
                <div>
                  <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                    Smart Intercropping & Cultivation Risk Matrix ({safeLandAcres} Acres)
                  </h3>
                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "2px 0 0" }}>
                    Companion pulses, pest trap buffers, and biological nitrogen inputs automatically adapt to your {currentSoilObj.name.split(" ")[0]} soil and {currentMethodObj.name}.
                  </p>
                </div>
              </div>

              {/* FIELD PROFILE BADGES */}
              <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
                <span style={{ fontSize: "12px", background: "var(--fk-bg)", border: "1px solid var(--fk-border)", padding: "4px 8px", borderRadius: "6px", color: "var(--fk-text)" }}>
                  📏 {safeLandAcres} Acres
                </span>
                <span style={{ fontSize: "12px", background: "var(--fk-bg)", border: "1px solid var(--fk-border)", padding: "4px 8px", borderRadius: "6px", color: "var(--fk-text)" }}>
                  {currentSoilObj.icon} {currentSoilObj.name.split(" ")[0]}
                </span>
                <span style={{ fontSize: "12px", background: "var(--fk-bg)", border: "1px solid var(--fk-border)", padding: "4px 8px", borderRadius: "6px", color: "#16a34a" }}>
                  {currentMethodObj.icon} {currentMethodObj.name.split(" ")[0]} ({currentWaterObj.name.split(" ")[0]})
                </span>
              </div>
            </div>

            {/* SELECT PRIMARY FOCUS CROP */}
            <div style={{ background: "var(--fk-bg)", padding: "14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
              <label style={{ fontSize: "13px", fontWeight: "800", color: "var(--fk-text)", display: "block", marginBottom: "8px" }}>
                🎯 Select Your Primary Focus Crop to Plan Intercropping:
              </label>
              <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", alignItems: "center" }}>
                {(selectedCropIds.length > 0 ? selectedCropIds : ["cotton", "red_gram", "maize", "green_gram"]).map((cid) => {
                  const cObj = CROPS_DB.find((c) => c.id === cid);
                  if (!cObj) return null;
                  const isSelected = activeIntercropPrimaryId === cid;
                  return (
                    <button
                      key={cid}
                      type="button"
                      onClick={() => setIntercropPrimaryCropId(cid)}
                      style={{
                        padding: "8px 14px",
                        fontSize: "13px",
                        fontWeight: "700",
                        borderRadius: "6px",
                        border: isSelected ? "2px solid #2563eb" : "1px solid var(--fk-border)",
                        background: isSelected ? "rgba(37, 99, 235, 0.15)" : "var(--fk-card)",
                        color: isSelected ? "#2563eb" : "var(--fk-text)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px"
                      }}
                    >
                      <span>{cObj.icon}</span>
                      <span>{cObj.name}</span>
                      {isSelected && <Check size={14} />}
                    </button>
                  );
                })}

                {/* DROPDOWN TO SELECT ANY OF 16 CROPS */}
                <select
                  value={activeIntercropPrimaryId}
                  onChange={(e) => setIntercropPrimaryCropId(e.target.value)}
                  style={{
                    padding: "7px 10px",
                    borderRadius: "6px",
                    border: "1px solid var(--fk-border)",
                    background: "var(--fk-card)",
                    color: "var(--fk-text)",
                    fontSize: "13px",
                    fontWeight: "600",
                    marginLeft: "auto"
                  }}
                >
                  <option value="" disabled>Or pick from all crops...</option>
                  {CROPS_DB.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.icon} {c.name} ({c.category})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* 2-COLUMN GRID: ALLOCATION PLAN & RISK MATRIX */}
          <div className="grid-2-col" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "20px" }}>
            
            {/* COLUMN 1: SMART CROP ALLOCATION & SOWING BLUEPRINT */}
            <div className="glass-card" style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", borderRadius: "10px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", margin: 0, display: "flex", alignItems: "center", gap: "6px" }}>
                  <PieChart size={18} color="#2563eb" /> Spatial Crop Allocation ({safeLandAcres} Acres)
                </h3>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", background: "rgba(22, 163, 74, 0.12)", padding: "3px 8px", borderRadius: "12px" }}>
                  70-20-10 Diversification Rule
                </span>
              </div>

              {/* 3 ALLOCATION CARDS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "16px" }}>
                {/* 1. PRIMARY CROP (70%) */}
                <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", borderLeft: "4px solid #2563eb", padding: "12px 14px", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "19.5px" }}>{intercropPlan.primaryCrop.icon}</span>
                      <strong style={{ fontSize: "14px", color: "var(--fk-text)" }}>
                        Primary Cash Crop (70% Allocation)
                      </strong>
                    </div>
                    <span style={{ color: "#2563eb", fontWeight: "800", fontSize: "14px" }}>
                      {intercropPlan.primaryAcreage} Acres
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: 0 }}>
                    <strong>{intercropPlan.primaryCrop.name}</strong> — Main harvest revenue driver ({intercropPlan.primaryCrop.duration}).
                  </p>
                </div>

                {/* 2. COMPANION LEGUME (20%) */}
                <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", borderLeft: "4px solid #16a34a", padding: "12px 14px", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "19.5px" }}>{intercropPlan.companion.icon}</span>
                      <strong style={{ fontSize: "14px", color: "var(--fk-text)" }}>
                        Secondary Companion Legume (20% Allocation)
                      </strong>
                    </div>
                    <span style={{ color: "#16a34a", fontWeight: "800", fontSize: "14px" }}>
                      {intercropPlan.companionAcreage} Acres
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: "0 0 4px" }}>
                    <strong>{intercropPlan.companion.name}</strong> — {intercropPlan.companion.ratio}
                  </p>
                  <p style={{ fontSize: "12.5px", color: "var(--fk-text-sub)", margin: "0 0 6px", lineHeight: "1.4" }}>
                    {intercropPlan.companion.rationale}
                  </p>
                  <div style={{ display: "flex", gap: "8px", fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>
                    <span>🌱 Seed Needed: {intercropPlan.companion.seedRateKg}</span>
                    <span>•</span>
                    <span>⏱️ Duration: {intercropPlan.companion.duration}</span>
                  </div>
                </div>

                {/* 3. TRAP / BORDER CROP (10%) */}
                <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", borderLeft: "4px solid #d97706", padding: "12px 14px", borderRadius: "6px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "4px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                      <span style={{ fontSize: "19.5px" }}>{intercropPlan.trapBorder.icon}</span>
                      <strong style={{ fontSize: "14px", color: "var(--fk-text)" }}>
                        Border & Trap Crop Buffer (10% Allocation)
                      </strong>
                    </div>
                    <span style={{ color: "#d97706", fontWeight: "800", fontSize: "14px" }}>
                      {intercropPlan.trapAcreage} Acres
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: "0 0 4px" }}>
                    <strong>{intercropPlan.trapBorder.name}</strong>
                  </p>
                  <p style={{ fontSize: "12.5px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.4" }}>
                    {intercropPlan.trapBorder.rationale}
                  </p>
                  <div style={{ fontSize: "12px", color: "#d97706", fontWeight: "700", marginTop: "4px" }}>
                    🎯 Targets: {intercropPlan.trapBorder.pestsTargeted}
                  </div>
                </div>
              </div>

              {/* SOWING GEOMETRY PATTERN */}
              <div style={{ background: "rgba(37, 99, 235, 0.06)", border: "1px solid rgba(37, 99, 235, 0.2)", padding: "12px 14px", borderRadius: "6px", marginBottom: "16px" }}>
                <div style={{ fontSize: "13px", fontWeight: "800", color: "#2563eb", marginBottom: "4px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <Sliders size={14} /> Recommended Field Row Configuration
                </div>
                <div style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--fk-text)", marginBottom: "4px" }}>
                  {intercropPlan.rowPattern}
                </div>
                <p style={{ fontSize: "12px", color: "var(--fk-text-sub)", margin: 0 }}>
                  ICAR agronomic standard for {currentSoilObj.name.split(" ")[0]} soil. Allows tractor tillage and drip lateral layout without interference.
                </p>
              </div>

              {/* ECONOMIC & ECOLOGICAL IMPACT SUMMARY */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                <div style={{ background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.25)", padding: "10px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase" }}>Biological Nitrogen</div>
                  <div style={{ fontSize: "17px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>+{intercropPlan.totalNFixedKg} kg N</div>
                  <span style={{ fontSize: "11.5px", color: "var(--fk-text-sub)" }}>Fixed naturally in root nodules</span>
                </div>

                <div style={{ background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.25)", padding: "10px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase" }}>Fertilizer Cost Saved</div>
                  <div style={{ fontSize: "17px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>₹{intercropPlan.totalFertilizerSavings.toLocaleString()}</div>
                  <span style={{ fontSize: "11.5px", color: "var(--fk-text-sub)" }}>Urea/DAP expense reduction</span>
                </div>

                <div style={{ background: "rgba(217, 119, 6, 0.08)", border: "1px solid rgba(217, 119, 6, 0.25)", padding: "10px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#d97706", textTransform: "uppercase" }}>Pesticide Cut</div>
                  <div style={{ fontSize: "17px", fontWeight: "800", color: "#d97706", marginTop: "2px" }}>~{intercropPlan.trapBorder.sprayCutPct}% Fewer Sprays</div>
                  <span style={{ fontSize: "11.5px", color: "var(--fk-text-sub)" }}>Via perimeter trap buffers</span>
                </div>

                <div style={{ background: "rgba(37, 99, 235, 0.08)", border: "1px solid rgba(37, 99, 235, 0.25)", padding: "10px", borderRadius: "6px" }}>
                  <div style={{ fontSize: "11px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>Early Cash Realized</div>
                  <div style={{ fontSize: "17px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>+₹{intercropPlan.bonusRevenuePotential.toLocaleString()}</div>
                  <span style={{ fontSize: "11.5px", color: "var(--fk-text-sub)" }}>Bonus revenue from intercrop</span>
                </div>
              </div>
            </div>

            {/* COLUMN 2: 4-VECTOR CULTIVATION RISK MATRIX */}
            <div className="glass-card" style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", borderRadius: "10px", padding: "20px" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <ShieldAlert size={20} color={intercropPlan.riskColor} />
                  <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                    4-Vector Cultivation Risk Score
                  </h3>
                </div>
                <span
                  style={{
                    fontSize: "12px",
                    fontWeight: "700",
                    color: intercropPlan.riskColor,
                    background: `${intercropPlan.riskColor}15`,
                    border: `1px solid ${intercropPlan.riskColor}40`,
                    padding: "3px 10px",
                    borderRadius: "12px"
                  }}
                >
                  Score: {intercropPlan.aggregateScore}/100
                </span>
              </div>

              {/* 4 DYNAMIC PROGRESS BARS */}
              <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginBottom: "18px" }}>
                {/* 1. WEATHER & CLIMATE RISK */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>
                    <span>1. Weather & Rainfall Sensitivity</span>
                    <span style={{ color: intercropPlan.weatherRisk > 50 ? "#dc2626" : intercropPlan.weatherRisk > 30 ? "#d97706" : "#16a34a" }}>
                      {intercropPlan.weatherRisk}% ({intercropPlan.weatherRisk > 50 ? "High" : intercropPlan.weatherRisk > 30 ? "Moderate" : "Low"})
                    </span>
                  </div>
                  <div style={{ background: "var(--fk-border)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        background: intercropPlan.weatherRisk > 50 ? "#dc2626" : intercropPlan.weatherRisk > 30 ? "#d97706" : "#16a34a",
                        width: `${intercropPlan.weatherRisk}%`,
                        height: "100%",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
                    Calculated for {currentMethodObj.name} on {currentSoilObj.name.split(" ")[0]} soil.
                  </span>
                </div>

                {/* 2. MARKET VOLATILITY RISK */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>
                    <span>2. Market Price Volatility Risk</span>
                    <span style={{ color: intercropPlan.marketRisk > 50 ? "#dc2626" : intercropPlan.marketRisk > 30 ? "#d97706" : "#16a34a" }}>
                      {intercropPlan.marketRisk}% ({intercropPlan.marketRisk > 50 ? "High Volatility" : intercropPlan.marketRisk > 30 ? "Moderate" : "MSP Protected"})
                    </span>
                  </div>
                  <div style={{ background: "var(--fk-border)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        background: intercropPlan.marketRisk > 50 ? "#dc2626" : intercropPlan.marketRisk > 30 ? "#d97706" : "#16a34a",
                        width: `${intercropPlan.marketRisk}%`,
                        height: "100%",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
                    -12% diversification cushion applied from dual harvest streams.
                  </span>
                </div>

                {/* 3. WATER AVAILABILITY RISK */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>
                    <span>3. Water Availability & Pumping Risk</span>
                    <span style={{ color: intercropPlan.waterRisk > 50 ? "#dc2626" : intercropPlan.waterRisk > 30 ? "#d97706" : "#16a34a" }}>
                      {intercropPlan.waterRisk}% ({intercropPlan.waterRisk > 50 ? "High Deficit Risk" : intercropPlan.waterRisk > 30 ? "Moderate" : "Comfortable"})
                    </span>
                  </div>
                  <div style={{ background: "var(--fk-border)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        background: intercropPlan.waterRisk > 50 ? "#dc2626" : intercropPlan.waterRisk > 30 ? "#d97706" : "#16a34a",
                        width: `${intercropPlan.waterRisk}%`,
                        height: "100%",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
                    {intercropPlan.primaryCrop.waterReq} demand evaluated with {currentWaterObj.name}.
                  </span>
                </div>

                {/* 4. PEST & DISEASE RISK */}
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", fontWeight: "bold", marginBottom: "4px" }}>
                    <span>4. Pest & Disease Infection Risk</span>
                    <span style={{ color: "#16a34a" }}>
                      {intercropPlan.intercropPestRisk}% (Reduced from {intercropPlan.basePestRisk}%)
                    </span>
                  </div>
                  <div style={{ background: "var(--fk-border)", height: "8px", borderRadius: "4px", overflow: "hidden" }}>
                    <div
                      style={{
                        background: "#16a34a",
                        width: `${intercropPlan.intercropPestRisk}%`,
                        height: "100%",
                        transition: "width 0.4s ease"
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "600" }}>
                    🛡️ Trap crop border neutralizes {intercropPlan.trapBorder.sprayCutPct}% of insect pressure organically!
                  </span>
                </div>
              </div>

              {/* OVERALL RISK VERDICT */}
              <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", padding: "14px", borderRadius: "8px", marginBottom: "14px" }}>
                <div style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "4px", display: "flex", alignItems: "center", gap: "6px" }}>
                  <span>Field Cultivation Assessment:</span>
                  <span style={{ color: intercropPlan.riskColor, fontWeight: "800" }}>
                    {intercropPlan.riskCategory}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.5" }}>
                  {intercropPlan.aggregateScore < 38 && "Outstanding agro-ecological resilience. The companion pulse safeguards soil nutrients and traps critical pests, ensuring maximum profit protection."}
                  {intercropPlan.aggregateScore >= 38 && intercropPlan.aggregateScore < 60 && "Manageable field risk profile. Ensure scheduled irrigation runs during flowering and maintain trap crop density along outer perimeter."}
                  {intercropPlan.aggregateScore >= 60 && "High vulnerability detected. With rainfed or scanty water, avoid heavy water crops and strictly utilize drought-hardy pulses like Red Gram or Pearl Millet."}
                </p>
              </div>

              {/* ACTION: TRANSFER TO BUDGET CALCULATOR */}
              <button
                type="button"
                onClick={() => {
                  handleLoadIntoBudget(intercropPlan.primaryCrop);
                  setActiveTab("budget");
                }}
                style={{
                  width: "100%",
                  padding: "10px",
                  borderRadius: "6px",
                  border: "1px solid #16a34a",
                  background: "#16a34a",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: "700",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: "6px"
                }}
              >
                <span>Calculate Exact Budget for {intercropPlan.primaryCrop.name}</span>
                <ArrowRight size={14} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 3: SMART BUDGET & BREAK-EVEN CALCULATOR */}
      {/* ========================================================= */}
      {activeTab === "budget" && (
        <div className="grid-2-col">
          {/* INPUT FORM CARD */}
          <div className="glass-card dg-card-interactive">
            <div className="card-header" style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <Sliders size={20} color="var(--fk-blue)" />
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>Farm Financial Input Parameters</h3>
            </div>

            <div className="form-row-2col" style={{ marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", marginBottom: "4px", display: "block" }}>
                  Land Size (Acres)
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={landAcres}
                  onChange={(e) => setLandAcres(Number(e.target.value))}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "15px" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)", textTransform: "uppercase", marginBottom: "4px", display: "block" }}>
                  Crop Name
                </label>
                <select
                  value={selectedCrop}
                  onChange={(e) => setSelectedCrop(e.target.value)}
                  style={{ width: "100%", padding: "10px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "15px" }}
                >
                  {CROPS_DB.map((c) => (
                    <option key={c.id} value={c.name}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text-sub)", marginBottom: "8px", textTransform: "uppercase" }}>
              Per-Acre Production Input Costs (₹)
            </h4>

            <div className="form-row-2col" style={{ gap: "10px", marginBottom: "14px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Seed Cost / Acre</label>
                <input type="number" value={seedCost} onChange={(e) => setSeedCost(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Fertilizer / Acre</label>
                <input type="number" value={fertCost} onChange={(e) => setFertCost(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Pesticide / Acre</label>
                <input type="number" value={pestCost} onChange={(e) => setPestCost(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Labor Charges / Acre</label>
                <input type="number" value={laborCost} onChange={(e) => setLaborCost(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Irrigation Water / Acre</label>
                <input type="number" value={irrigCost} onChange={(e) => setIrrigCost(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Machinery / Tractor</label>
                <input type="number" value={machineryCost} onChange={(e) => setMachineryCost(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Transport / Mandi Logistics</label>
                <input type="number" value={transportCost} onChange={(e) => setTransportCost(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "14px" }} />
              </div>
            </div>

            <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text-sub)", marginBottom: "8px", textTransform: "uppercase" }}>
              Harvest & Selling Expectations
            </h4>

            <div className="form-row-2col" style={{ gap: "10px" }}>
              <div>
                <label style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Expected Yield (Qtl / Acre)</label>
                <input type="number" value={expectedYieldQtl} onChange={(e) => setExpectedYieldQtl(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "14px" }} />
              </div>
              <div>
                <label style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>Market Selling Price (₹ / Qtl)</label>
                <input type="number" value={sellingPriceQtl} onChange={(e) => setSellingPriceQtl(Number(e.target.value))} style={{ width: "100%", padding: "8px", borderRadius: "4px", border: "1px solid var(--fk-border)", background: "var(--fk-card)", color: "var(--fk-text)", fontSize: "14px" }} />
              </div>
            </div>
          </div>

          {/* FINANCIAL DASHBOARD OUTPUT */}
          <div className="glass-card dg-card-interactive">
            <div className="card-header" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <TrendingUp size={20} color="#16a34a" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>Smart Financial Analysis</h3>
              </div>
              <span style={{ fontSize: "13px", fontWeight: "bold", color: "#16a34a", background: "rgba(22, 163, 74, 0.15)", padding: "4px 10px", borderRadius: "20px" }}>
                {roiPercent}% Expected ROI
              </span>
            </div>

            {/* Key Metrics Cards Grid */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "16px" }}>
              <div style={{ background: "var(--fk-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "bold" }}>Total Crop Investment</span>
                <div style={{ fontSize: "21.5px", fontWeight: "800", color: "#dc2626", marginTop: "2px" }}>₹{Math.round(totalCostOverall).toLocaleString()}</div>
                <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>₹{Math.round(totalInputCostPerAcre).toLocaleString()} / Acre</span>
              </div>

              <div style={{ background: "var(--fk-bg)", padding: "12px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "bold" }}>Gross Revenue ({totalYieldQuintals} Qtl)</span>
                <div style={{ fontSize: "21.5px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>₹{Math.round(grossRevenue).toLocaleString()}</div>
                <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>At ₹{sellingPriceQtl}/Qtl</span>
              </div>

              <div style={{ background: "rgba(22, 163, 74, 0.1)", padding: "12px", borderRadius: "6px", border: "1px solid rgba(22, 163, 74, 0.3)" }}>
                <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "bold" }}>Net Expected Profit</span>
                <div style={{ fontSize: "23.5px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>₹{Math.round(netProfit).toLocaleString()}</div>
                <span style={{ fontSize: "12px", color: "var(--fk-text)" }}>Net Return Margin</span>
              </div>

              <div style={{ background: "rgba(37, 99, 235, 0.1)", padding: "12px", borderRadius: "6px", border: "1px solid rgba(37, 99, 235, 0.3)" }}>
                <span style={{ fontSize: "12px", color: "#2563eb", fontWeight: "bold" }}>Break-Even Selling Price</span>
                <div style={{ fontSize: "23.5px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>₹{Math.round(breakEvenPrice)} / Qtl</div>
                <span style={{ fontSize: "12px", color: "var(--fk-text)" }}>Min price to recover costs</span>
              </div>
            </div>

            {/* Plain-Language Summary Box */}
            <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", padding: "14px", borderRadius: "6px" }}>
              <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "6px" }}>
                💡 Sahayak Financial Advisor Insight
              </h4>
              <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.5" }}>
                For <strong>{landAcres} acres</strong> of <strong>{selectedCrop}</strong>: Total cost is <strong>₹{Math.round(totalCostOverall).toLocaleString()}</strong>.
                If market price stays above <strong>₹{Math.round(breakEvenPrice)}/qtl</strong>, your farm will make a profit. At target price of ₹{sellingPriceQtl}/qtl, expected Net Return is <strong>₹{Math.round(netProfit).toLocaleString()}</strong> ({roiPercent}% ROI).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
