import { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import useApiResource from "../hooks/useApiResource";
import RequestStatus from "../components/ui/RequestStatus";
import { useLanguage } from "../context/LanguageContext";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell
} from "recharts";
import {
  Sprout,
  Calendar,
  Bug,
  Shield,
  Check,
  CheckCircle2,
  Clock,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
  FlaskConical,
  Filter,
  Leaf,
  Droplet,
  CloudSun,
  TrendingUp,
  RefreshCw,
  MapPin,
  Sparkles,
  ShieldCheck,
  Compass,
  Mic,
  MicOff,
  ArrowRight,
  DollarSign,
  AlertCircle,
  HelpCircle,
  PhoneCall,
  Sliders,
  Layers,
  Scale,
  Zap,
  Info,
  Copy,
  Printer,
  CheckSquare,
  Square,
  Activity,
  FileText,
  Calculator,
  Award,
  Share2,
  Stethoscope,
  CalendarDays,
  Satellite,
  Tractor,
  QrCode,
  Thermometer,
  Sun,
  Radio,
  Search,
  HeartPulse,
  RotateCcw,
  Wallet,
  ExternalLink,
  Play
} from "lucide-react";

import PageHeader from "../components/ui/PageHeader";
import PremiumCard from "../components/ui/PremiumCard";
import PremiumButton from "../components/ui/PremiumButton";
import { StatusBadge } from "../components/ui/StatCard";
import { DashboardSkeleton } from "../components/ui/LoadingSkeleton";
import FarmProfileWizard from "../components/FarmProfileWizard";
import useVoiceAssistant from "../hooks/useVoiceAssistant";

// Data sources
import { CROP_DATABASE } from "../data/cropLifecycleData";
import {
  CROP_DETAILED_MILESTONES,
  CROP_ECONOMICS,
  CROP_WATER_STAGES,
  CROP_TANK_MIX,
  CROP_BRIEF_STAGES,
  CROP_NUTRIENT_DEFICIENCIES,
  CROP_MATCHING_SCHEMES
} from "../data/cropDetailedPlanData";

// Crop Agricultural Categories for Selection
export const CROP_CATEGORIES = [
  { id: "all", label: "All Crops", icon: "🌱" },
  { id: "cereals", label: "Cereals & Grains", icon: "🌾" },
  { id: "pulses", label: "Pulses & Legumes", icon: "🫘" },
  { id: "oilseeds", label: "Oilseeds", icon: "🌻" },
  { id: "commercial", label: "Commercial & Cash", icon: "🚜" },
  { id: "vegetables", label: "Vegetables & Spices", icon: "🍅" }
];

// 20 Operational Decision Engines & Farm Tools
export const MORE_FARM_TOOLS_REGISTRY = [
  // ── 1. IRRIGATION & AGRONOMY (5) ──
  {
    id: "calendar",
    path: "/calendar",
    title: "ICAR Crop Calendar",
    category: "agronomy",
    categoryLabel: "💧 Irrigation & Agronomy",
    badge: "Active • ICAR Timelines",
    badgeColor: "#16a34a",
    icon: Calendar,
    summary: "Month-by-month sowing, weeding, fertilization, and harvest schedule calibrated to Indian agro-climatic zones.",
    capabilities: ["Monthly field tasks", "ICAR standardized timing", "Stage-wise advisories", "Season overview"],
    actionLabel: "Open Crop Calendar"
  },
  {
    id: "irrigation",
    path: "/irrigation",
    title: "FAO-56 Smart Irrigation Scheduler",
    category: "agronomy",
    categoryLabel: "💧 Irrigation & Agronomy",
    badge: "Active • FAO-56 Synced",
    badgeColor: "#0284c7",
    icon: Droplet,
    summary: "Dynamic crop evapotranspiration (ETc = ETo × Kc), rootzone water deficit tracking, and pump motor runtime optimizer.",
    capabilities: ["ETo & Kc calculations", "Soil water deficit (mm)", "Pump runtime hours/day", "Open-Meteo weather sync"],
    actionLabel: "Launch Water Scheduler"
  },
  {
    id: "fertilizer",
    path: "/fertilizer",
    title: "Precision Fertilizer & NPK Planner",
    category: "agronomy",
    categoryLabel: "💧 Irrigation & Agronomy",
    badge: "Active • Bag Calculator",
    badgeColor: "#8b5cf6",
    icon: FlaskConical,
    summary: "Targeted NPK nutrient recommendation, instant standard fertilizer bag calculator (Urea 45kg, DAP 50kg, MOP 50kg), and 4-stage split calendar.",
    capabilities: ["13 Crop ICAR presets", "Instant bag quantities", "Basal & top-dress splits", "Foliar zinc & gypsum"],
    actionLabel: "Open Fertilizer Planner"
  },
  {
    id: "rotation",
    path: "/rotation",
    title: "Crop Rotation & Soil Nitrogen Simulator",
    category: "agronomy",
    categoryLabel: "💧 Irrigation & Agronomy",
    badge: "Active • Soil Dynamics",
    badgeColor: "#10b981",
    icon: RotateCcw,
    summary: "Multi-season biological nitrogen fixation (BNF), pest break cycle modeling, and 3-year profitability simulations.",
    capabilities: ["Nitrogen fixation (+45 kg/ha)", "Soil pathogen disruption", "3-Year cumulative margin", "Legume-cereal pairing"],
    actionLabel: "Simulate Rotation Cycles"
  },
  {
    id: "tank-mix",
    path: "/tank-mix",
    title: "Agro-Chemical Tank-Mix Safety",
    category: "agronomy",
    categoryLabel: "💧 Irrigation & Agronomy",
    badge: "Active • Compatibility Matrix",
    badgeColor: "#d97706",
    icon: FlaskConical,
    summary: "Multi-product tank-mix compatibility checker preventing chemical precipitation, phytotoxicity leaf scorch, and spray nozzle clogging.",
    capabilities: ["Insecticide + Fungicide checks", "Jar test protocol", "Foliar micronutrient safety", "Physical & biological alerts"],
    actionLabel: "Check Tank-Mix Safety"
  },

  // ── 2. ECONOMICS, MARKETS & FINANCE (5) ──
  {
    id: "profitability",
    path: "/profitability",
    title: "Farm Profitability & Sensitivity Engine",
    category: "economics",
    categoryLabel: "📈 Economics & Markets",
    badge: "Active • ICAR Presets",
    badgeColor: "#16a34a",
    icon: DollarSign,
    summary: "Complete cost-of-cultivation modeling, break-even farmgate prices, ROI calculations, and ±15% price/yield sensitivity scenarios.",
    capabilities: ["1-Click ICAR presets", "Break-even price / quintal", "8-Item cost breakdown", "Sensitivity stress test"],
    actionLabel: "Calculate Profit & ROI"
  },
  {
    id: "mandi-forecast",
    path: "/mandi-forecast",
    title: "APMC Mandi 15-Day Price Forecast",
    category: "economics",
    categoryLabel: "📈 Economics & Markets",
    badge: "Active • Multi-Mandi Arbitrage",
    badgeColor: "#2563eb",
    icon: TrendingUp,
    summary: "Predictive price trajectory modeling with 85% confidence intervals, data-driven Sell vs Hold advisory, and multi-mandi arbitrage matrix.",
    capabilities: ["15-Day forecast trajectory", "Sell vs Hold advisory", "Multi-mandi net arbitrage", "Transportation cost adjustment"],
    actionLabel: "Explore Mandi Forecasts"
  },
  {
    id: "ledger",
    path: "/ledger",
    title: "Farm Ledger & KCC Credit Limit",
    category: "economics",
    categoryLabel: "📈 Economics & Markets",
    badge: "Active • Printable Statement",
    badgeColor: "#059669",
    icon: Wallet,
    summary: "Interactive income and expense ledger, statutory Kisan Credit Card (KCC) borrowing limit calculator, and official audited bank statements.",
    capabilities: ["Scale of Finance limits", "Subsidized 4% interest rate", "Printable KCC statement", "Net farm cashflow"],
    actionLabel: "Open Farm Ledger"
  },
  {
    id: "hire",
    path: "/hire",
    title: "Custom Hiring Center (CHC) & Drones",
    category: "economics",
    categoryLabel: "📈 Economics & Markets",
    badge: "Active • Transparent Quotes",
    badgeColor: "#f59e0b",
    icon: Tractor,
    summary: "Book heavy farm machinery (MB ploughs, laser levelers, rotavators, combine harvesters) and agricultural drone spraying services per acre.",
    capabilities: ["Acre & hourly estimates", "Verified CHC operators", "Drone pesticide spraying", "Fuel & operator included"],
    actionLabel: "Book Machinery & Drones"
  },
  {
    id: "crop-insurance",
    path: "/crop-insurance",
    title: "PMFBY Crop Insurance & 72-Hour Claim",
    category: "economics",
    categoryLabel: "📈 Economics & Markets",
    badge: "Active • 72h Intimation Portal",
    badgeColor: "#dc2626",
    icon: Shield,
    summary: "Calculate statutory farmer premiums (1.5% Rabi, 2% Kharif, 5% Commercial) and follow mandatory 72-hour emergency claim intimation steps.",
    capabilities: ["Subsidized premium quote", "Sum insured per hectare", "72-Hour loss intimation", "Toll-free 14447 hotline"],
    actionLabel: "Check Insurance & Claims"
  },

  // ── 3. PRECISION TECH & SATELLITE (5) ──
  {
    id: "satellite",
    path: "/satellite",
    title: "Satellite Sentinel-2 NDVI Stress Radar",
    category: "tech",
    categoryLabel: "🛰️ Precision Tech & Satellite",
    badge: "Active • 10m Resolution",
    badgeColor: "#0284c7",
    icon: Satellite,
    summary: "Spaceborne 10m multispectral satellite imagery monitoring canopy vigor, nitrogen deficiency chlorosis, and drought stress hotspot zones.",
    capabilities: ["Sentinel-2 NDVI grid", "Canopy biomass indexing", "Chlorosis hotspot alerts", "5-Day orbital passes"],
    actionLabel: "View Satellite NDVI"
  },
  {
    id: "gdd-radar",
    path: "/gdd-radar",
    title: "GDD Micro-Climate Pest Outbreak Radar",
    category: "tech",
    categoryLabel: "🛰️ Precision Tech & Satellite",
    badge: "Active • Thermal Phenology",
    badgeColor: "#ef4444",
    icon: Thermometer,
    summary: "Growing Degree Day thermal accumulation modeling predicting exact emergence dates for Pink Bollworm, Fall Armyworm, and BPH.",
    capabilities: ["Thermal GDD tracking", "Generational peak dates", "Economic threshold alerts", "CIBRC management timing"],
    actionLabel: "Run Pest Radar"
  },
  {
    id: "yield-predictor",
    path: "/yield-predictor",
    title: "Crop Yield & Revenue Predictor",
    category: "tech",
    categoryLabel: "🛰️ Precision Tech & Satellite",
    badge: "Active • FAO Model",
    badgeColor: "#16a34a",
    icon: TrendingUp,
    summary: "FAO crop water-yield response modeling with 3-scenario climate stress testing (Drought, Heat Wave, Flood) and PMFBY shortfall simulation.",
    capabilities: ["Optimistic/Normal/Pessimistic", "Soil quality calibration", "Drought penalty factors", "Gross revenue forecast"],
    actionLabel: "Predict Crop Yield"
  },
  {
    id: "iot",
    path: "/iot",
    title: "IoT Field Telemetry & Sensor Mesh",
    category: "tech",
    categoryLabel: "🛰️ Precision Tech & Satellite",
    badge: "Active • Live Stream",
    badgeColor: "#3b82f6",
    icon: Radio,
    summary: "Real-time field telemetry streaming soil moisture, temperature, electrical conductivity (EC), and NPK sensor readings with battery monitoring.",
    capabilities: ["Live sensor gauges", "Soil moisture thresholds", "Optimal range indicators", "Telemetry historical log"],
    actionLabel: "Stream Field Sensors"
  },
  {
    id: "traceability",
    path: "/traceability",
    title: "Farm-to-Fork QR Batch Traceability",
    category: "tech",
    categoryLabel: "🛰️ Precision Tech & Satellite",
    badge: "Active • QR Batch Passports",
    badgeColor: "#a855f7",
    icon: QrCode,
    summary: "Digital harvest batch registration with immutable chain-of-custody logging and instant consumer-facing export QR code generation.",
    capabilities: ["Batch QR generation", "Cold storage tracking", "Agrochemical audit trail", "Export quality grading"],
    actionLabel: "Manage QR Traceability"
  },

  // ── 4. SUSTAINABLE & ALLIED FARMING (5) ──
  {
    id: "livestock",
    path: "/livestock",
    title: "Livestock & Dairy Health Advisor",
    category: "allied",
    categoryLabel: "🌿 Sustainable & Allied",
    badge: "Active • IVRI Veterinary",
    badgeColor: "#f59e0b",
    icon: HeartPulse,
    summary: "Instant veterinary symptom triage for cattle, buffaloes, sheep, and goats, ICAR balanced dairy ration formulation, and national vaccination calendar.",
    capabilities: ["Emergency symptom triage", "Balanced dry matter ration", "Green & dry fodder splits", "Annual vaccination table"],
    actionLabel: "Consult Veterinary Advisor"
  },
  {
    id: "organic-farming",
    path: "/organic-farming",
    title: "Organic Bio-Inputs & Natural Farming",
    category: "allied",
    categoryLabel: "🌿 Sustainable & Allied",
    badge: "Active • Dynamic Scaling",
    badgeColor: "#16a34a",
    icon: Leaf,
    summary: "Standardized regenerative bio-formulations (Jeevamrutha, Beejamrutha, Brahmastra, Agniastra, Dashaparni) scaled dynamically to your exact acreage.",
    capabilities: ["Acreage auto-scaling", "Step-by-step preparation", "Application schedules", "Target pest control"],
    actionLabel: "Explore Bio-Input Recipes"
  },
  {
    id: "solar-pump",
    path: "/solar-pump",
    title: "PM-KUSUM Solar Pump Sizing & Subsidy",
    category: "allied",
    categoryLabel: "🌿 Sustainable & Allied",
    badge: "Active • 90% Subsidy Calculator",
    badgeColor: "#eab308",
    icon: Sun,
    summary: "Calculate required pump horsepower and solar PV array capacity based on borewell water depth. Quantify 90% government subsidy and diesel fuel savings.",
    capabilities: ["Borewell head vs HP sizing", "90% PM-KUSUM subsidy", "Solar array wattage (Wp)", "Annual diesel savings (₹)"],
    actionLabel: "Size Solar Water Pump"
  },
  {
    id: "carbon-credits",
    path: "/carbon-credits",
    title: "Regenerative Carbon Credit Monetizer",
    category: "allied",
    categoryLabel: "🌿 Sustainable & Allied",
    badge: "Active • Verra VM0042",
    badgeColor: "#10b981",
    icon: Award,
    summary: "Quantify annual soil organic carbon (SOC) sequestration from regenerative practices (No-till, cover cropping, biochar) and monetize certified offsets.",
    capabilities: ["Verra VM0042 standard", "tCO2e sequestration rate", "Annual carbon revenue (₹)", "Practice impact breakdown"],
    actionLabel: "Monetize Carbon Credits"
  },
  {
    id: "soil-health",
    path: "/soil-health",
    title: "Soil Health Card (SHC) Diagnostic",
    category: "allied",
    categoryLabel: "🌿 Sustainable & Allied",
    badge: "Active • 12 Parameters",
    badgeColor: "#8b5cf6",
    icon: Sprout,
    summary: "Complete 12-parameter soil health analysis covering primary NPK, secondary sulfur, micronutrients (Zn, Fe, Mn, B), organic carbon, and soil pH.",
    capabilities: ["Target nutrient sufficiency", "Custom fertilizer correction", "Gypsum / lime amendment", "Soil quality grade"],
    actionLabel: "Analyze Soil Health"
  }
];

export default function Dashboard({ user, onUpdateUser }) {
  const navigate = useNavigate();
  const { language, t } = useLanguage();

  // Active Crop & Selected Day
  const [selectedCropId, setSelectedCropId] = useState("cotton");
  const crop = CROP_DATABASE[selectedCropId] || CROP_DATABASE.cotton;

  // Selected Day within Season
  const [selectedDay, setSelectedDay] = useState(crop.currentDaySample || 45);
  const [activeTab, setActiveTab] = useState("day_plan"); // 'day_plan' | 'weekly_planner' | 'pesticides' | 'deficiencies' | 'economics' | 'simulator' | 'irrigation' | 'tank_mix' | 'schemes'
  const [dayPlanViewMode, setDayPlanViewMode] = useState("brief"); // 'brief' | 'detailed'
  const [pesticideFilter, setPesticideFilter] = useState("all");
  const [expandedMilestoneDay, setExpandedMilestoneDay] = useState(null);
  const [completedTasks, setCompletedTasks] = useState({});
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [locationText, setLocationText] = useState(user?.location || "Hyderabad, Telangana, India");
  const [quickPrompt, setQuickPrompt] = useState("");
  const [copiedStatus, setCopiedStatus] = useState(false);

  // Profit Simulator overrides
  const [simYield, setSimYield] = useState(null);
  const [simPrice, setSimPrice] = useState(null);

  // Nutrient Doctor selected deficiency
  const [selectedDeficiencyId, setSelectedDeficiencyId] = useState(null);

  // Crop filtering states
  const [cropCategoryFilter, setCropCategoryFilter] = useState("all");
  const [cropSearchQuery, setCropSearchQuery] = useState("");

  // More Farm Tools filtering states
  const [toolsCategoryFilter, setToolsCategoryFilter] = useState("all");
  const [toolsSearchQuery, setToolsSearchQuery] = useState("");

  // Filtered Crops for Switchboard
  const filteredCrops = useMemo(() => {
    return Object.values(CROP_DATABASE).filter((c) => {
      const matchesCategory = cropCategoryFilter === "all" || c.category === cropCategoryFilter;
      const q = cropSearchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        c.name.toLowerCase().includes(q) ||
        c.id.toLowerCase().includes(q) ||
        (c.scientificName && c.scientificName.toLowerCase().includes(q));
      return matchesCategory && matchesSearch;
    });
  }, [cropCategoryFilter, cropSearchQuery]);

  // Filtered Farm Tools
  const filteredTools = useMemo(() => {
    return MORE_FARM_TOOLS_REGISTRY.filter((tool) => {
      const matchesCat = toolsCategoryFilter === "all" || tool.category === toolsCategoryFilter;
      const q = toolsSearchQuery.trim().toLowerCase();
      const matchesSearch = !q ||
        tool.title.toLowerCase().includes(q) ||
        tool.summary.toLowerCase().includes(q) ||
        tool.capabilities.some(cap => cap.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [toolsCategoryFilter, toolsSearchQuery]);

  const voice = useVoiceAssistant(language || "EN", (spokenText) => {
    setQuickPrompt(spokenText);
  });

  // Location breakdown
  const locParts = (locationText || user?.location || "Hyderabad, Telangana, India")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const weatherResource = useApiResource({
    url: "/api/market/weather",
    params: { location: locParts[0] }
  });
  const marketResource = useApiResource({
    url: "/api/market/mandi",
    params: { state: locParts[1] || user?.state || "Telangana" }
  });
  const soilResource = useApiResource({ url: "/api/soil/latest" });

  const weather = weatherResource.data;
  const mandi = marketResource.data;
  const soilMeasurement = soilResource.data?.measurement;
  const loading = weatherResource.loading || marketResource.loading;
  const error = weatherResource.error || marketResource.error;

  const reload = () => {
    weatherResource.reload();
    marketResource.reload();
    soilResource.reload();
  };

  // Day Milestones for Current Crop
  const milestones = CROP_DETAILED_MILESTONES[selectedCropId] || CROP_DETAILED_MILESTONES.cotton;
  const economics = CROP_ECONOMICS[selectedCropId] || CROP_ECONOMICS.cotton;
  const waterStages = CROP_WATER_STAGES[selectedCropId] || CROP_WATER_STAGES.cotton;
  const tankMixes = CROP_TANK_MIX[selectedCropId] || CROP_TANK_MIX.cotton;
  const briefStages = CROP_BRIEF_STAGES[selectedCropId] || CROP_BRIEF_STAGES.cotton;
  const deficiencies = CROP_NUTRIENT_DEFICIENCIES[selectedCropId] || CROP_NUTRIENT_DEFICIENCIES.cotton;
  const matchingSchemes = CROP_MATCHING_SCHEMES[selectedCropId] || CROP_MATCHING_SCHEMES.cotton;

  // Closest Milestone for Selected Day
  const currentMilestone = useMemo(() => {
    let closest = milestones[0];
    let minDiff = 999;
    milestones.forEach((m) => {
      const diff = Math.abs(m.day - selectedDay);
      if (diff < minDiff) {
        minDiff = diff;
        closest = m;
      }
    });
    return closest;
  }, [milestones, selectedDay]);

  // Next Milestone
  const nextMilestone = useMemo(() => {
    return milestones.find((m) => m.day > selectedDay) || null;
  }, [milestones, selectedDay]);

  // Filter Mandi prices relevant to selected crop
  const mandiChartData = useMemo(() => {
    if (!mandi?.prices) return [];
    return mandi.prices
      .filter((p) => Number.isFinite(Number(p.modal_price_rs_quintal ?? p.modal_price)))
      .slice(0, 5)
      .map((p) => ({
        name: p.market ? p.market.split(" ")[0] : p.mandi ? p.mandi.replace(" Mandi", "") : "Market",
        ModalPrice: Number(p.modal_price_rs_quintal ?? p.modal_price),
        MinPrice: p.min_price ?? null,
        MaxPrice: p.max_price ?? null
      }));
  }, [mandi]);

  // Selected deficiency for nutrient doctor
  const activeDeficiency = useMemo(() => {
    if (!deficiencies || deficiencies.length === 0) return null;
    return deficiencies.find((d) => d.id === selectedDeficiencyId) || deficiencies[0];
  }, [deficiencies, selectedDeficiencyId]);

  // Dynamic 7-day activity lookahead
  const weeklyActivities = useMemo(() => {
    const list = [];
    const baseDay = selectedDay;
    for (let offset = 0; offset < 7; offset++) {
      const dayNum = baseDay + offset;
      if (dayNum > crop.durationDays) break;
      const exactM = milestones.find((m) => m.day === dayNum);
      let title = "";
      let task = "";
      let type = "Routine Inspection";
      let icon = "🌱";

      if (exactM) {
        title = exactM.title;
        task = exactM.action;
        type = exactM.category;
        icon = "⚡";
      } else if (offset === 0) {
        title = `Day ${dayNum}: Active Protocol Follow-up`;
        task = currentMilestone.action;
        type = "Active Today";
        icon = "📍";
      } else if (offset === 1) {
        title = `Day ${dayNum}: Morning Canopy Scouting (6:30–8:30 AM)`;
        task = "Walk diagonally (W-pattern) across field to inspect leaf undersides for sucking pests and early fungal leaf spots.";
        type = "Field Scouting";
        icon = "🔍";
      } else if (offset === 2) {
        title = `Day ${dayNum}: Soil Moisture & Subsurface Check`;
        task = "Probe soil 10 cm deep in root zone. If soil ball crumbles easily in your fist, schedule furrow/drip irrigation.";
        type = "Water Management";
        icon = "💧";
      } else if (offset === 3) {
        title = `Day ${dayNum}: Pest Trap Count & Sticky Sheet Maintenance`;
        task = "Count moths caught in pheromone traps. Re-coat yellow/blue sticky sheets with fresh castor oil if dusty.";
        type = "Pest Surveillance";
        icon = "🪤";
      } else if (offset === 4) {
        title = `Day ${dayNum}: Foliar Booster / Micronutrient Window`;
        task = "Check canopy for micronutrient chlorosis or blossom drop; prepare foliar tank solution if needed.";
        type = "Plant Nutrition";
        icon = "🌿";
      } else if (offset === 5) {
        title = `Day ${dayNum}: Weed & Inter-Cultivation Check`;
        task = "Spot-uproot fast-growing weeds along furrows and field bunds before they flower and disperse weed seeds.";
        type = "Weed Eradication";
        icon = "🌾";
      } else {
        title = `Day ${dayNum}: Weekly Summary & Input Procurement`;
        task = nextMilestone
          ? `Verify inventory for upcoming Day ${nextMilestone.day} milestone (${nextMilestone.title}). Procure required formulations.`
          : "Review overall crop vigor and record weekly farm telemetry.";
        type = "Planning & Inventory";
        icon = "📦";
      }

      list.push({
        day: dayNum,
        offset,
        title,
        task,
        type,
        icon,
        isMilestoneDay: !!exactM,
        isToday: offset === 0
      });
    }
    return list;
  }, [selectedDay, crop.durationDays, milestones, currentMilestone, nextMilestone]);

  // Simulator calculations
  const effectiveYield = simYield !== null ? simYield : economics.expectedYieldQtl;
  const effectivePrice = simPrice !== null ? simPrice : economics.marketPricePerQtl;
  const simGrossRevenue = effectiveYield * effectivePrice;
  const simExpenses = economics.totalExpenses;
  const simNetProfit = simGrossRevenue - simExpenses;
  const simRoi = simExpenses > 0 ? Math.round((simNetProfit / simExpenses) * 100) : 0;
  const simBreakEvenYield = effectivePrice > 0 ? (simExpenses / effectivePrice).toFixed(1) : 0;

  // Today's 3-step checklist
  const checklistKey1 = `chk_${selectedCropId}_${selectedDay}_1`;
  const checklistKey2 = `chk_${selectedCropId}_${selectedDay}_2`;
  const checklistKey3 = `chk_${selectedCropId}_${selectedDay}_3`;

  const doneCount =
    (completedTasks[checklistKey1] ? 1 : 0) +
    (completedTasks[checklistKey2] ? 1 : 0) +
    (completedTasks[checklistKey3] ? 1 : 0);
  const checklistPct = Math.round((doneCount / 3) * 100);

  // Copy Today's Advisory (WhatsApp format)
  const handleCopyTodayAdvisory = () => {
    const text = `🌾 *Kisan AI Farm Advisory - Day ${selectedDay} (${crop.name})*
Phase: ${currentMilestone.phase} | Priority: ${currentMilestone.priority}

👉 *Today's Core Operation:*
${currentMilestone.action}

💧 *Irrigation Guidance:*
${currentMilestone.irrigation}

🛡️ *Crop Protection / Foliar Spray:*
${currentMilestone.protection}

⏳ *Upcoming Milestone:*
${nextMilestone ? `Day ${nextMilestone.day}: ${nextMilestone.title}` : "Approaching Season Harvest"}

Generated via Kisan AI Command Center | Govt MSP: ${crop.mspValue}`;

    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setCopiedStatus(true);
        setTimeout(() => setCopiedStatus(false), 2500);
      });
    }
  };

  const handlePrintPlan = () => {
    window.print();
  };

  // Local Soil Data
  const soilData = {
    ph: soilMeasurement?.ph ?? 7.2,
    nitrogen: soilMeasurement?.nitrogen ?? 195,
    phosphorus: soilMeasurement?.phosphorus ?? 18,
    potassium: soilMeasurement?.potassium ?? 285,
    organicCarbon: soilMeasurement?.organic_carbon ?? 0.54,
    zinc: soilMeasurement?.zinc ?? 0.52
  };

  const handleLaunchPrompt = (e) => {
    e.preventDefault();
    if (!quickPrompt.trim()) return;
    navigate(`/chat?query=${encodeURIComponent(quickPrompt.trim())}`);
  };

  const getGreeting = () => {
    const hr = new Date().getHours();
    if (hr < 12) return t("greeting_morning", "Good Morning");
    if (hr < 17) return t("greeting_afternoon", "Good Afternoon");
    return t("greeting_evening", "Good Evening");
  };

  const farmerName = user?.name ? user.name.split(" ")[0] : t("greeting_farmer", "Farmer");

  const toggleTask = (key) => {
    setCompletedTasks((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Filtered pesticides
  const filteredPesticides = useMemo(() => {
    if (pesticideFilter === "all") return crop.pesticideProtocols;
    if (pesticideFilter === "insect")
      return crop.pesticideProtocols.filter((p) => p.targetCategory.toLowerCase().includes("insect"));
    if (pesticideFilter === "fungal")
      return crop.pesticideProtocols.filter(
        (p) =>
          p.targetCategory.toLowerCase().includes("fungal") ||
          p.targetCategory.toLowerCase().includes("bacterial") ||
          p.targetCategory.toLowerCase().includes("viral")
      );
    if (pesticideFilter === "weed")
      return crop.pesticideProtocols.filter((p) => p.targetCategory.toLowerCase().includes("weed"));
    return crop.pesticideProtocols;
  }, [crop, pesticideFilter]);

  if (loading && !weather && !mandi) {
    return <DashboardSkeleton />;
  }

  const seasonProgressPct = Math.min(100, Math.round((selectedDay / crop.durationDays) * 100));

  return (
    <div className="page-container dashboard-page page-enter">
      <RequestStatus loading={loading} error={error} onRetry={reload} />

      {/* PAGE HEADER */}
      <PageHeader
        badge={t("dash_badge", "Farm Decision Command Center")}
        icon={Compass}
        title={`${getGreeting()}, ${farmerName}! 🌾 ${t("dash_header_title", "Crop Lifecycle & Day-Wise Operations")}`}
        subtitle={t("dash_subtitle", "Complete crop agronomy, interactive day-wise field calendar, and targeted pesticide protection schedule.")}
        action={
          <PremiumButton
            variant="primary"
            size="md"
            icon={RefreshCw}
            loading={loading}
            onClick={reload}
          >
            {t("refresh_telemetry", "Refresh Telemetry")}
          </PremiumButton>
        }
      />

      {/* INTERACTIVE CROP SWITCHBOARD BAR */}
      <div
        className="glass-card"
        style={{
          background: "var(--fk-card)",
          border: "1px solid var(--fk-border)",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "20px",
          boxShadow: "0 2px 10px rgba(0,0,0,0.03)"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sprout size={20} color="#16a34a" />
            <strong style={{ fontSize: "17px", color: "var(--fk-text)", fontFamily: "Outfit, sans-serif" }}>
              {t("active_crop_selector", "Active Crop Selector")} ({Object.keys(CROP_DATABASE).length} {t("crops_in_categories", "Crops in 5 Categories")}):
            </strong>
          </div>
          
          {/* Quick Search Input */}
          <div style={{ position: "relative", minWidth: "220px" }}>
            <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--fk-text-sub)" }} />
            <input
              type="text"
              value={cropSearchQuery}
              onChange={(e) => setCropSearchQuery(e.target.value)}
              placeholder={t("search_crop_placeholder", "Search crop by name...")}
              style={{
                padding: "6px 12px 6px 30px",
                borderRadius: "6px",
                border: "1px solid var(--fk-border)",
                background: "var(--fk-bg)",
                color: "var(--fk-text)",
                fontSize: "13.5px",
                width: "100%",
                outline: "none"
              }}
            />
          </div>
        </div>

        {/* AGRICULTURAL CATEGORY FILTER PILLS */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px", paddingBottom: "10px", borderBottom: "1px solid var(--fk-border)" }}>
          {CROP_CATEGORIES.map((cat) => {
            const isSelected = cropCategoryFilter === cat.id;
            const count = cat.id === "all"
              ? Object.keys(CROP_DATABASE).length
              : Object.values(CROP_DATABASE).filter((c) => c.category === cat.id).length;
            const translatedCatLabel = t("cat_" + cat.id, cat.label);
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setCropCategoryFilter(cat.id)}
                style={{
                  padding: "5px 12px",
                  borderRadius: "20px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: isSelected ? "1.5px solid #16a34a" : "1px solid var(--fk-border)",
                  background: isSelected ? "#16a34a" : "var(--fk-bg)",
                  color: isSelected ? "#ffffff" : "var(--fk-text)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  transition: "all 0.15s ease"
                }}
              >
                <span>{cat.icon}</span>
                <span>{translatedCatLabel}</span>
                <span
                  style={{
                    fontSize: "11px",
                    background: isSelected ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                    padding: "1px 6px",
                    borderRadius: "10px"
                  }}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* CROP PILLS GRID */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {filteredCrops.map((c) => {
            const isSelected = selectedCropId === c.id;
            const catObj = CROP_CATEGORIES.find((cat) => cat.id === c.category);
            const cropNameTranslated = t("crop_" + c.id, c.name);
            const shortName = cropNameTranslated.split(" ")[0];
            const catLabelTranslated = t("cat_" + (catObj?.id || c.category), catObj?.label || c.category);
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => {
                  setSelectedCropId(c.id);
                  setSelectedDay(c.currentDaySample || 40);
                  setExpandedMilestoneDay(null);
                }}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "7px 13px",
                  borderRadius: "8px",
                  fontSize: "13.5px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: isSelected ? "2px solid #16a34a" : "1px solid var(--fk-border)",
                  background: isSelected ? "rgba(22, 163, 74, 0.12)" : "var(--fk-bg)",
                  color: isSelected ? "#16a34a" : "var(--fk-text)",
                  transition: "all 0.15s ease",
                  boxShadow: isSelected ? "0 2px 8px rgba(22, 163, 74, 0.15)" : "none"
                }}
              >
                <span style={{ fontSize: "19.5px" }}>{c.icon}</span>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", textAlign: "left" }}>
                  <span style={{ lineHeight: "1.2" }}>{shortName}</span>
                  <span style={{ fontSize: "11px", color: isSelected ? "#15803d" : "var(--fk-text-sub)", fontWeight: "500" }}>
                    {c.durationDays}d · {catLabelTranslated.split(" ")[0]}
                  </span>
                </div>
                {isSelected && (
                  <span
                    style={{
                      fontSize: "10px",
                      background: "#16a34a",
                      color: "#ffffff",
                      padding: "1px 5px",
                      borderRadius: "8px",
                      marginLeft: "2px"
                    }}
                  >
                    {t("active_badge", "Active")}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CROP IDENTITY STRIP WITH COMPLETE SPECIFICATIONS */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, rgba(22, 163, 74, 0.08) 0%, rgba(37, 99, 235, 0.04) 100%)",
          border: "1px solid rgba(22, 163, 74, 0.25)",
          borderRadius: "12px",
          padding: "20px",
          marginBottom: "22px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "16px", marginBottom: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
            <div
              style={{
                width: "56px",
                height: "56px",
                borderRadius: "14px",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "32px",
                boxShadow: "0 4px 12px rgba(22, 163, 74, 0.15)"
              }}
            >
              {crop.icon}
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                <h2 style={{ fontSize: "23.5px", fontWeight: "800", color: "var(--fk-text)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                  {t("crop_" + crop.id, crop.name)}
                </h2>
                <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", background: "rgba(22, 163, 74, 0.15)", padding: "2px 8px", borderRadius: "4px" }}>
                  {crop.season}
                </span>
                <span style={{ fontSize: "13px", color: "var(--fk-text-sub)", fontStyle: "italic" }}>
                  ({crop.scientificName})
                </span>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "4px 0 0" }}>
                <strong>{t("preferred_soil", "Preferred Soil")}:</strong> {crop.soilPreference} (pH {crop.phRange}) · <strong>{t("spacing", "Spacing")}:</strong> {crop.recommendedSpacing}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <PremiumButton variant="secondary" size="sm" onClick={() => navigate("/crop-tool")}>
              🌱 {t("compare_other_crops", "Compare Other Crops")}
            </PremiumButton>
            <PremiumButton variant="primary" size="sm" onClick={() => navigate(`/chat?query=Give complete schedule for ${crop.name}`)}>
              {t("ask_sahayak_about", "Ask Sahayak AI About")} {t("crop_" + crop.id, crop.name).split(" ")[0]}
            </PremiumButton>
          </div>
        </div>

        {/* 4 VITAL AGRO STAT CARDS */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "12px" }}>
          <div style={{ background: "var(--fk-card)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
              <Clock size={13} color="#2563eb" /> {t("current_season_day", "Current Season Day")}
            </span>
            <div style={{ fontSize: "19.5px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>
              Day {selectedDay} of {crop.durationDays}
            </div>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
              {seasonProgressPct}% {t("growth_completed", "Growth Completed")}
            </span>
          </div>

          <div style={{ background: "var(--fk-card)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
              <TrendingUp size={13} color="#16a34a" /> {t("target_yield_msp", "Target Yield & MSP")}
            </span>
            <div style={{ fontSize: "19.5px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>
              {crop.targetYield}
            </div>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
              {t("govt_msp", "Govt MSP")}: {crop.mspValue}
            </span>
          </div>

          <div style={{ background: "var(--fk-card)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
              <Droplet size={13} color="#0284c7" /> {t("total_water_need", "Total Water Need")}
            </span>
            <div style={{ fontSize: "19.5px", fontWeight: "800", color: "#0284c7", marginTop: "2px" }}>
              {crop.waterRequirement.split("(")[0]}
            </div>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
              {t("water_tip", "Peak at flowering & seed fill")}
            </span>
          </div>

          <div style={{ background: "var(--fk-card)", padding: "12px 14px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "700", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "4px" }}>
              <FlaskConical size={13} color="#f59e0b" /> {t("prescribed_npk", "Prescribed NPK")}
            </span>
            <div style={{ fontSize: "16px", fontWeight: "800", color: "#d97706", marginTop: "4px" }}>
              {crop.totalFertilizerDose.split("per")[0]}
            </div>
            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
              {t("fertilizer_split_tip", "Split at Basal, 30 & 60 DAS")}
            </span>
          </div>
        </div>

        {/* SOIL HEALTH TELEMETRY & SMART DOSAGE CALIBRATION */}
        <div
          style={{
            marginTop: "16px",
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "10px",
            padding: "12px 16px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "12px"
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <Activity size={20} color="#16a34a" />
            <div>
              <strong style={{ fontSize: "14px", color: "var(--fk-text)" }}>
                Field Soil Test Calibration ({locationText.split(",")[0]}):
              </strong>
              <span style={{ fontSize: "13px", color: "var(--fk-text-sub)", marginLeft: "6px" }}>
                pH: <strong>{soilData.ph}</strong> (Neutral) · Organic Carbon: <strong>{soilData.organicCarbon}%</strong> · N: <strong>{soilData.nitrogen} kg/ha</strong> (Low) · P: <strong>{soilData.phosphorus} kg/ha</strong> · K: <strong>{soilData.potassium} kg/ha</strong> (Optimal) · Zn: <strong>{soilData.zinc} ppm</strong>
              </span>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", fontWeight: "700", background: "rgba(22, 163, 74, 0.12)", color: "#16a34a", padding: "4px 8px", borderRadius: "4px" }}>
              ✓ Fertilizer AI Calibrated
            </span>
            <Link
              to="/soil-health"
              style={{ fontSize: "12.5px", fontWeight: "700", color: "#2563eb", textDecoration: "none" }}
            >
              Update Soil Card →
            </Link>
          </div>
        </div>
      </div>

      {/* INTERACTIVE DAY SLIDER & SEASON NAVIGATOR */}
      <div
        className="glass-card"
        style={{
          background: "var(--fk-card)",
          border: "1px solid var(--fk-border)",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "22px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Sliders size={18} color="#2563eb" />
            <strong style={{ fontSize: "15px", color: "var(--fk-text)" }}>
              Interactive Growth Day Navigator (Drag to Inspect Any Crop Day):
            </strong>
          </div>
          <span style={{ fontSize: "14px", fontWeight: "800", color: "#2563eb", background: "rgba(37, 99, 235, 0.1)", padding: "3px 10px", borderRadius: "6px" }}>
            Viewing: Day {selectedDay} ({currentMilestone.phase})
          </span>
        </div>

        {/* SLIDER INPUT */}
        <div style={{ position: "relative", marginBottom: "12px" }}>
          <input
            type="range"
            min="0"
            max={crop.durationDays}
            value={selectedDay}
            onChange={(e) => setSelectedDay(Number(e.target.value))}
            style={{
              width: "100%",
              height: "8px",
              borderRadius: "4px",
              accentColor: "#16a34a",
              cursor: "pointer"
            }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--fk-text-sub)", marginTop: "4px" }}>
            <span>Day 0 (Sowing)</span>
            <span>Day {Math.round(crop.durationDays * 0.25)} (Vegetative)</span>
            <span>Day {Math.round(crop.durationDays * 0.5)} (Flowering)</span>
            <span>Day {Math.round(crop.durationDays * 0.75)} (Pod/Boll Dev)</span>
            <span>Day {crop.durationDays} (Harvest)</span>
          </div>
        </div>

        {/* QUICK JUMP MILESTONE BUTTONS */}
        <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", alignItems: "center" }}>
          <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text-sub)" }}>{t("quick_jump", "Quick Jump")}:</span>
          {milestones.map((m) => (
            <button
              key={m.day}
              type="button"
              onClick={() => setSelectedDay(m.day)}
              style={{
                padding: "3px 8px",
                borderRadius: "4px",
                fontSize: "12px",
                fontWeight: "700",
                cursor: "pointer",
                border: selectedDay === m.day ? "1.5px solid #16a34a" : "1px solid var(--fk-border)",
                background: selectedDay === m.day ? "#16a34a" : "var(--fk-bg)",
                color: selectedDay === m.day ? "#ffffff" : "var(--fk-text)"
              }}
            >
              Day {m.day}
            </button>
          ))}
        </div>
      </div>

      {/* TODAY'S EXACT FIELD PROTOCOL (HIGHLIGHT CARD) */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.08), rgba(22, 163, 74, 0.08))",
          border: "2px solid rgba(37, 99, 235, 0.3)",
          borderRadius: "12px",
          padding: "18px 20px",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "10px", marginBottom: "10px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Zap size={20} color="#2563eb" />
            <h3 style={{ fontSize: "17px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
              {t("protocol_for_day", "Protocol for Day")} {currentMilestone.day}: {currentMilestone.title}
            </h3>
          </div>
          <span
            style={{
              fontSize: "12px",
              fontWeight: "800",
              color: "#ffffff",
              background: currentMilestone.priority.includes("Critical") ? "#dc2626" : "#2563eb",
              padding: "2px 8px",
              borderRadius: "4px"
            }}
          >
            {currentMilestone.priority}
          </span>
        </div>

        <p style={{ fontSize: "14.5px", color: "var(--fk-text)", margin: "0 0 12px", lineHeight: "1.5" }}>
          👉 <strong>{t("core_operation", "Core Operation")}:</strong> {currentMilestone.action}
        </p>

        {/* 3 ACTION BOXES */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "10px" }}>
          <div style={{ background: "var(--fk-card)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <strong style={{ fontSize: "12.5px", color: "#0284c7", display: "flex", alignItems: "center", gap: "4px" }}>
              💧 {t("irrigation_guidance", "Irrigation Guidance")}
            </strong>
            <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: "3px 0 0" }}>
              {currentMilestone.irrigation}
            </p>
          </div>

          <div style={{ background: "var(--fk-card)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
            <strong style={{ fontSize: "12.5px", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
              🛡️ {t("plant_protection", "Plant Protection / Nutrition")}
            </strong>
            <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: "3px 0 0" }}>
              {currentMilestone.protection}
            </p>
          </div>

          {nextMilestone && (
            <div style={{ background: "var(--fk-card)", padding: "10px 12px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
              <strong style={{ fontSize: "12.5px", color: "#f59e0b", display: "flex", alignItems: "center", gap: "4px" }}>
                ⏳ {t("coming_up", "Coming Up on Day")} {nextMilestone.day}
              </strong>
              <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: "3px 0 0" }}>
                {nextMilestone.title} ({nextMilestone.phase})
              </p>
            </div>
          )}
        </div>
      </div>

      {/* DASHBOARD EXPLORER TABS */}
      <div
        style={{
          display: "flex",
          gap: "8px",
          marginBottom: "18px",
          borderBottom: "1px solid var(--fk-border)",
          paddingBottom: "10px",
          flexWrap: "wrap"
        }}
      >
        {[
          { id: "day_plan", label: t("tab_day_plan", "📅 Day-Wise Plan (Brief & Detailed)"), color: "#2563eb", icon: Calendar },
          { id: "weekly_planner", label: t("tab_weekly", "🗓️ 7-Day Farm Outlook"), color: "#0891b2", icon: CalendarDays },
          { id: "pesticides", label: t("tab_pesticides", "🛡️ Required Pesticides & Sprays"), color: "#dc2626", icon: Bug },
          { id: "deficiencies", label: t("tab_deficiencies", "🩺 Nutrient Doctor & Visual Diagnosis"), color: "#7c3aed", icon: Stethoscope },
          { id: "economics", label: t("tab_economics", "💰 Per-Acre Cost & Profit"), color: "#16a34a", icon: DollarSign },
          { id: "simulator", label: t("tab_simulator", "📈 What-If Profit Simulator"), color: "#059669", icon: Calculator },
          { id: "irrigation", label: t("tab_irrigation", "💧 Critical Water Windows"), color: "#0284c7", icon: Droplet },
          { id: "tank_mix", label: t("tab_tank_mix", "🧪 Tank-Mix Safety"), color: "#d97706", icon: FlaskConical },
          { id: "schemes", label: t("tab_schemes", "🏛️ Matching Govt Subsidies"), color: "#b45309", icon: Award },
          { id: "more_tools", label: t("tab_more_tools", "🚜 More Farm Tools (20 Engines)"), color: "#059669", icon: Sprout }
        ].map((tab) => {
          const isActive = activeTab === tab.id;
          const TabIcon = tab.icon;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                padding: "8px 14px",
                borderRadius: "6px",
                border: isActive ? `2px solid ${tab.color}` : "1px solid var(--fk-border)",
                background: isActive ? `${tab.color}15` : "var(--fk-card)",
                color: isActive ? tab.color : "var(--fk-text)",
                fontWeight: "800",
                fontSize: "13.5px",
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                transition: "all 0.15s ease",
                boxShadow: isActive ? `0 2px 8px ${tab.color}20` : "none"
              }}
            >
              <TabIcon size={15} /> {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB 1: DAY-WISE SCHEDULE (BRIEF ROADMAP & DETAILED MILESTONES) */}
      {activeTab === "day_plan" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          {/* HEADER WITH VIEW MODE SWITCHER & QUICK ACTIONS */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calendar size={20} color="#2563eb" />
                <h3 style={{ fontSize: "19.5px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                  Crop Lifecycle &amp; Day-Wise Schedule ({crop.name})
                </h3>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                ICAR standardized field timeline: switch between concise stage overview or granular day-by-day operations.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
              {/* VIEW MODE TOGGLE */}
              <div style={{ display: "inline-flex", background: "var(--fk-bg)", padding: "3px", borderRadius: "8px", border: "1px solid var(--fk-border)" }}>
                <button
                  type="button"
                  onClick={() => setDayPlanViewMode("brief")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "800",
                    border: "none",
                    cursor: "pointer",
                    background: dayPlanViewMode === "brief" ? "#2563eb" : "transparent",
                    color: dayPlanViewMode === "brief" ? "#ffffff" : "var(--fk-text)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <FileText size={13} /> {t("brief_roadmap", "📋 Brief Stage Roadmap")}
                </button>
                <button
                  type="button"
                  onClick={() => setDayPlanViewMode("detailed")}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "800",
                    border: "none",
                    cursor: "pointer",
                    background: dayPlanViewMode === "detailed" ? "#2563eb" : "transparent",
                    color: dayPlanViewMode === "detailed" ? "#ffffff" : "var(--fk-text)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "5px"
                  }}
                >
                  <Calendar size={13} /> {t("granular_daily", "🔍 Granular Day-by-Day")} ({milestones.length})
                </button>
              </div>

              {/* WHATSAPP SHARE / COPY BUTTON */}
              <button
                type="button"
                onClick={handleCopyTodayAdvisory}
                style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "1px solid var(--fk-border)",
                  background: copiedStatus ? "#16a34a" : "var(--fk-bg)",
                  color: copiedStatus ? "#ffffff" : "var(--fk-text)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px"
                }}
              >
                {copiedStatus ? <Check size={14} /> : <Share2 size={14} />}
                {copiedStatus ? t("copied_clipboard", "Copied to clipboard!") : t("share_plan", "Share WhatsApp Plan")}
              </button>

              {/* PRINT BUTTON */}
              <button
                type="button"
                onClick={handlePrintPlan}
                style={{
                  padding: "6px 10px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: "700",
                  cursor: "pointer",
                  border: "1px solid var(--fk-border)",
                  background: "var(--fk-bg)",
                  color: "var(--fk-text)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px"
                }}
                title={t("print_plan", "Print Day-Wise Calendar")}
              >
                <Printer size={14} /> {t("print_plan", "Print")}
              </button>
            </div>
          </div>

          {/* TODAY'S 3-STEP FIELD ACTION CHECKLIST */}
          <div
            style={{
              background: "linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(22, 163, 74, 0.05))",
              border: "1.5px solid rgba(37, 99, 235, 0.25)",
              borderRadius: "10px",
              padding: "14px 16px",
              marginBottom: "20px"
            }}
          >
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "10px", flexWrap: "wrap", gap: "8px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CheckSquare size={17} color="#2563eb" />
                <strong style={{ fontSize: "15px", color: "var(--fk-text)" }}>
                  Today's Field Action Checklist (Day {selectedDay} · {currentMilestone.phase}):
                </strong>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <div style={{ width: "120px", height: "6px", background: "var(--fk-border)", borderRadius: "3px", overflow: "hidden" }}>
                  <div style={{ width: `${checklistPct}%`, height: "100%", background: checklistPct === 100 ? "#16a34a" : "#2563eb", transition: "width 0.3s ease" }} />
                </div>
                <span style={{ fontSize: "12.5px", fontWeight: "800", color: checklistPct === 100 ? "#16a34a" : "#2563eb" }}>
                  {doneCount}/3 Done ({checklistPct}%)
                </span>
              </div>
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {[
                { key: checklistKey1, label: "Core Agronomy Operation", detail: currentMilestone.action, icon: Sprout, color: "#2563eb" },
                { key: checklistKey2, label: "Irrigation Action", detail: currentMilestone.irrigation, icon: Droplet, color: "#0284c7" },
                { key: checklistKey3, label: "Plant Protection / Foliar Spray", detail: currentMilestone.protection, icon: Shield, color: "#16a34a" }
              ].map((item, idx) => {
                const isChecked = !!completedTasks[item.key];
                return (
                  <div
                    key={item.key}
                    onClick={() => toggleTask(item.key)}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "10px",
                      padding: "8px 12px",
                      background: isChecked ? "rgba(22, 163, 74, 0.08)" : "var(--fk-card)",
                      border: `1px solid ${isChecked ? "rgba(22, 163, 74, 0.3)" : "var(--fk-border)"}`,
                      borderRadius: "6px",
                      cursor: "pointer",
                      transition: "all 0.15s ease"
                    }}
                  >
                    <div style={{ marginTop: "2px", color: isChecked ? "#16a34a" : "var(--fk-text-sub)" }}>
                      {isChecked ? <CheckCircle2 size={16} color="#16a34a" /> : <Square size={16} />}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "11.5px", fontWeight: "800", textTransform: "uppercase", color: item.color }}>
                          Step {idx + 1}: {item.label}
                        </span>
                        {isChecked && (
                          <span style={{ fontSize: "11px", fontWeight: "700", color: "#16a34a" }}>✓ Completed</span>
                        )}
                      </div>
                      <p style={{ fontSize: "13.5px", color: isChecked ? "var(--fk-text-sub)" : "var(--fk-text)", textDecoration: isChecked ? "line-through" : "none", margin: "2px 0 0", lineHeight: "1.4" }}>
                        {item.detail}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* VIEW MODE 1: BRIEF STAGE ROADMAP (SUMMARY MATRIX) */}
          {dayPlanViewMode === "brief" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <strong style={{ fontSize: "15px", color: "var(--fk-text)" }}>
                  5-Stage Crop Journey at a Glance:
                </strong>
                <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>
                  Tap 'Jump to Stage' to inspect exact days in each phase
                </span>
              </div>

              {/* 5 BRIEF STAGE CARDS */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "14px", marginBottom: "20px" }}>
                {briefStages.map((s, idx) => {
                  const isCurrentPhase = currentMilestone.phase.toLowerCase().includes(s.stage.split(":")[1]?.trim().toLowerCase().split(" ")[0] || "xyz");
                  return (
                    <div
                      key={idx}
                      style={{
                        background: isCurrentPhase ? "rgba(37, 99, 235, 0.04)" : "var(--fk-bg)",
                        border: isCurrentPhase ? "2px solid #2563eb" : "1px solid var(--fk-border)",
                        borderRadius: "10px",
                        padding: "16px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px" }}>
                          <div>
                            <span style={{ fontSize: "12px", fontWeight: "800", color: "#2563eb", background: "rgba(37, 99, 235, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                              {s.days}
                            </span>
                            <h4 style={{ fontSize: "15.5px", fontWeight: "800", color: "var(--fk-text)", margin: "4px 0 0" }}>
                              {s.icon} {s.stage}
                            </h4>
                          </div>
                          {isCurrentPhase && (
                            <span style={{ fontSize: "11px", fontWeight: "800", color: "#ffffff", background: "#2563eb", padding: "2px 6px", borderRadius: "4px" }}>
                              Current Active Phase
                            </span>
                          )}
                        </div>

                        <p style={{ fontSize: "12.5px", fontWeight: "700", color: "#16a34a", margin: "0 0 10px" }}>
                          🎯 Focus: {s.focus}
                        </p>

                        <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px", color: "var(--fk-text)" }}>
                          <div style={{ background: "var(--fk-card)", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                            <strong style={{ fontSize: "12px", color: "var(--fk-text)", display: "block" }}>
                              🚜 Core Agronomic Action:
                            </strong>
                            <span style={{ color: "var(--fk-text-sub)", lineHeight: "1.3", display: "block", marginTop: "2px" }}>
                              {s.keyAction}
                            </span>
                          </div>

                          <div style={{ background: "var(--fk-card)", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                            <strong style={{ fontSize: "12px", color: "#0284c7", display: "block" }}>
                              💧 Water &amp; Nutrients:
                            </strong>
                            <span style={{ color: "var(--fk-text-sub)", lineHeight: "1.3", display: "block", marginTop: "2px" }}>
                              {s.waterNutrient}
                            </span>
                          </div>

                          <div style={{ background: "var(--fk-card)", padding: "8px 10px", borderRadius: "6px", border: "1px solid var(--fk-border)" }}>
                            <strong style={{ fontSize: "12px", color: "#dc2626", display: "block" }}>
                              🛡️ Pest &amp; Disease Alert:
                            </strong>
                            <span style={{ color: "var(--fk-text-sub)", lineHeight: "1.3", display: "block", marginTop: "2px" }}>
                              {s.pestAlert}
                            </span>
                          </div>
                        </div>
                      </div>

                      <div style={{ marginTop: "12px", borderTop: "1px solid var(--fk-border)", paddingTop: "10px", textAlign: "right" }}>
                        <button
                          type="button"
                          onClick={() => setSelectedDay(s.targetDay)}
                          style={{
                            background: "transparent",
                            border: "none",
                            color: "#2563eb",
                            fontWeight: "800",
                            fontSize: "13px",
                            cursor: "pointer",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "4px"
                          }}
                        >
                          Jump to Day {s.targetDay} <ArrowRight size={13} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* QUICK LIFECYCLE SUMMARY TABLE */}
              <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", borderRadius: "8px", overflow: "hidden" }}>
                <div style={{ padding: "10px 14px", borderBottom: "1px solid var(--fk-border)", background: "rgba(0,0,0,0.02)" }}>
                  <strong style={{ fontSize: "13.5px", color: "var(--fk-text)" }}>
                    📊 Quick Lifecycle Comparison &amp; Summary Matrix
                  </strong>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                    <thead>
                      <tr style={{ borderBottom: "1px solid var(--fk-border)", textAlign: "left", color: "var(--fk-text-sub)" }}>
                        <th style={{ padding: "10px 12px", width: "160px" }}>Phase &amp; Days</th>
                        <th style={{ padding: "10px 12px" }}>Primary Goal</th>
                        <th style={{ padding: "10px 12px" }}>Water &amp; Dosing Brief</th>
                        <th style={{ padding: "10px 12px" }}>Key Spray / Protection</th>
                      </tr>
                    </thead>
                    <tbody>
                      {briefStages.map((s, idx) => (
                        <tr key={idx} style={{ borderBottom: idx < briefStages.length - 1 ? "1px solid var(--fk-border)" : "none" }}>
                          <td style={{ padding: "10px 12px", fontWeight: "700", color: "#2563eb" }}>
                            {s.stage.split(":")[1]?.trim()} <br />
                            <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>{s.days}</span>
                          </td>
                          <td style={{ padding: "10px 12px", color: "var(--fk-text)" }}>
                            {s.focus}
                          </td>
                          <td style={{ padding: "10px 12px", color: "var(--fk-text-sub)" }}>
                            {s.waterNutrient}
                          </td>
                          <td style={{ padding: "10px 12px", color: "#dc2626" }}>
                            {s.pestAlert}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* VIEW MODE 2: GRANULAR DAY-BY-DAY ROADMAP (ACCORDION) */}
          {dayPlanViewMode === "detailed" && (
            <div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px", flexWrap: "wrap", gap: "8px" }}>
                <strong style={{ fontSize: "15px", color: "var(--fk-text)" }}>
                  All Granular Milestones ({milestones.length} Days):
                </strong>
                <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>
                  Tap any day to expand instructions or check off completed tasks
                </span>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {milestones.map((m) => {
                  const isSelectedDay = m.day === currentMilestone.day;
                  const isExpanded = expandedMilestoneDay === m.day || (expandedMilestoneDay === null && isSelectedDay);
                  const taskDone = !!completedTasks[`milestone_${selectedCropId}_${m.day}`];

                  return (
                    <div
                      key={m.day}
                      style={{
                        background: isSelectedDay ? "rgba(37, 99, 235, 0.04)" : "var(--fk-bg)",
                        border: isSelectedDay ? "2px solid #2563eb" : "1px solid var(--fk-border)",
                        borderRadius: "10px",
                        padding: "14px 18px",
                        transition: "all 0.2s ease"
                      }}
                    >
                      <div
                        onClick={() => setExpandedMilestoneDay(isExpanded ? "none" : m.day)}
                        style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          cursor: "pointer",
                          gap: "12px"
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                          <div
                            style={{
                              width: "36px",
                              height: "36px",
                              borderRadius: "8px",
                              background: isSelectedDay ? "#2563eb" : "var(--fk-card)",
                              color: isSelectedDay ? "#ffffff" : "var(--fk-text)",
                              border: "1px solid var(--fk-border)",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontWeight: "800",
                              fontSize: "13px",
                              flexShrink: 0
                            }}
                          >
                            Day {m.day}
                          </div>

                          <div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                              <strong style={{ fontSize: "15px", color: "var(--fk-text)" }}>
                                {m.title}
                              </strong>
                              <span
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "700",
                                  color: "#2563eb",
                                  background: "rgba(37, 99, 235, 0.1)",
                                  padding: "2px 7px",
                                  borderRadius: "4px"
                                }}
                              >
                                {m.phase}
                              </span>
                              <span
                                style={{
                                  fontSize: "11.5px",
                                  fontWeight: "700",
                                  color: m.priority.includes("Critical") ? "#dc2626" : "#16a34a",
                                  background: m.priority.includes("Critical") ? "rgba(220, 38, 38, 0.1)" : "rgba(22, 163, 74, 0.1)",
                                  padding: "2px 6px",
                                  borderRadius: "4px"
                                }}
                              >
                                {m.priority}
                              </span>
                            </div>
                            <span style={{ fontSize: "12.5px", color: "var(--fk-text-sub)" }}>
                              Category: {m.category}
                            </span>
                          </div>
                        </div>

                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleTask(`milestone_${selectedCropId}_${m.day}`);
                            }}
                            style={{
                              padding: "4px 10px",
                              borderRadius: "4px",
                              fontSize: "12.5px",
                              fontWeight: "700",
                              border: "1px solid var(--fk-border)",
                              background: taskDone ? "#16a34a" : "var(--fk-card)",
                              color: taskDone ? "#ffffff" : "var(--fk-text)",
                              cursor: "pointer",
                              display: "inline-flex",
                              alignItems: "center",
                              gap: "4px"
                            }}
                          >
                            {taskDone ? <Check size={13} /> : null}
                            {taskDone ? "Completed" : "Mark Done"}
                          </button>
                          {isExpanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                        </div>
                      </div>

                      {/* EXPANDED DETAILS */}
                      {isExpanded && (
                        <div style={{ marginTop: "12px", borderTop: "1px solid var(--fk-border)", paddingTop: "12px" }}>
                          <p style={{ fontSize: "14px", color: "var(--fk-text)", margin: "0 0 10px", lineHeight: "1.4" }}>
                            <strong>Action:</strong> {m.action}
                          </p>

                          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: "10px" }}>
                            <div style={{ background: "rgba(2, 132, 199, 0.06)", border: "1px solid rgba(2, 132, 199, 0.2)", padding: "10px 12px", borderRadius: "6px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "700", color: "#0284c7", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Droplet size={13} /> Irrigation Detail
                              </span>
                              <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: "3px 0 0" }}>
                                {m.irrigation}
                              </p>
                            </div>

                            <div style={{ background: "rgba(22, 163, 74, 0.06)", border: "1px solid rgba(22, 163, 74, 0.2)", padding: "10px 12px", borderRadius: "6px" }}>
                              <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", display: "flex", alignItems: "center", gap: "4px" }}>
                                <Shield size={13} /> Protection / Nutrition Detail
                              </span>
                              <p style={{ fontSize: "13px", color: "var(--fk-text)", margin: "3px 0 0" }}>
                                {m.protection}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: 7-DAY FARM ACTIVITY LOOKAHEAD */}
      {activeTab === "weekly_planner" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <CalendarDays size={20} color="#0891b2" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                  🗓️ 7-Day Farm Action Plan (Day {selectedDay} to Day {Math.min(crop.durationDays, selectedDay + 6)})
                </h3>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                Weather-aligned forward schedule: planned morning scouting, spray windows, and irrigation checks.
              </p>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "13px", color: "#0891b2", background: "rgba(8, 145, 178, 0.1)", padding: "4px 10px", borderRadius: "6px", fontWeight: "700" }}>
                Forecast: {weather?.condition || "Partly Cloudy"} · Wind: {weather?.wind_speed_kmh ?? 12} km/h
              </span>
            </div>
          </div>

          {/* 7-DAY CARDS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "12px" }}>
            {weeklyActivities.map((act) => {
              const taskKey = `plan_task_${selectedCropId}_${act.day}`;
              const isDone = !!completedTasks[taskKey];
              return (
                <div
                  key={act.day}
                  style={{
                    background: act.isToday ? "rgba(8, 145, 178, 0.05)" : "var(--fk-bg)",
                    border: act.isToday ? "2px solid #0891b2" : "1px solid var(--fk-border)",
                    borderRadius: "10px",
                    padding: "14px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "all 0.15s ease"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                        <span style={{ fontSize: "17px" }}>{act.icon}</span>
                        <strong style={{ fontSize: "14.5px", color: act.isToday ? "#0891b2" : "var(--fk-text)" }}>
                          Day {act.day} {act.isToday && "· TODAY"}
                        </strong>
                      </div>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: "800",
                          color: act.isMilestoneDay ? "#dc2626" : "#0891b2",
                          background: act.isMilestoneDay ? "rgba(220, 38, 38, 0.1)" : "rgba(8, 145, 178, 0.1)",
                          padding: "2px 6px",
                          borderRadius: "4px"
                        }}
                      >
                        {act.type}
                      </span>
                    </div>

                    <h5 style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--fk-text)", margin: "0 0 6px" }}>
                      {act.title}
                    </h5>

                    <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.4" }}>
                      {act.task}
                    </p>
                  </div>

                  <div style={{ marginTop: "12px", borderTop: "1px solid var(--fk-border)", paddingTop: "8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>
                      {act.offset === 0 ? "Active window" : `In ${act.offset} days`}
                    </span>
                    <button
                      type="button"
                      onClick={() => toggleTask(taskKey)}
                      style={{
                        padding: "3px 8px",
                        borderRadius: "4px",
                        fontSize: "12px",
                        fontWeight: "700",
                        border: "1px solid var(--fk-border)",
                        background: isDone ? "#16a34a" : "var(--fk-card)",
                        color: isDone ? "#ffffff" : "var(--fk-text)",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "3px"
                      }}
                    >
                      {isDone ? <Check size={12} /> : null}
                      {isDone ? "Done" : "Mark"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: REQUIRED PESTICIDES & PROTECTION GUIDE */}
      {activeTab === "pesticides" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                🛡️ Prescribed Pesticides &amp; Disease Spray Protocol ({crop.name})
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                Approved CIBRC chemical formulations, exact dosages per liter, pre-harvest safety intervals, and organic bio-controls.
              </p>
            </div>

            {/* FILTER BUTTONS */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {[
                { id: "all", label: t("all_sprays", "All Protection") },
                { id: "insect", label: t("insecticides", "Insects & Worms") },
                { id: "fungal", label: t("fungicides", "Diseases & Blights") },
                { id: "weed", label: t("herbicides", "Weed Control") }
              ].map((f) => (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => setPesticideFilter(f.id)}
                  style={{
                    padding: "5px 12px",
                    borderRadius: "6px",
                    fontSize: "13px",
                    fontWeight: "700",
                    cursor: "pointer",
                    border: pesticideFilter === f.id ? "2px solid #dc2626" : "1px solid var(--fk-border)",
                    background: pesticideFilter === f.id ? "rgba(220, 38, 38, 0.1)" : "var(--fk-bg)",
                    color: pesticideFilter === f.id ? "#dc2626" : "var(--fk-text)"
                  }}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* PESTICIDE CARDS GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {filteredPesticides.map((pest) => (
              <div
                key={pest.id}
                style={{
                  background: "var(--fk-bg)",
                  border: "1px solid var(--fk-border)",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "10px" }}>
                    <div>
                      <span style={{ fontSize: "11.5px", fontWeight: "800", color: "var(--fk-text-sub)", textTransform: "uppercase" }}>
                        {pest.targetCategory}
                      </span>
                      <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text)", margin: "2px 0 0" }}>
                        {pest.targetName}
                      </h4>
                    </div>
                    <span
                      style={{
                        fontSize: "12px",
                        fontWeight: "800",
                        color: pest.severity.includes("Critical") || pest.severity.includes("Catastrophic") ? "#dc2626" : "#d97706",
                        background: pest.severity.includes("Critical") || pest.severity.includes("Catastrophic") ? "rgba(220, 38, 38, 0.1)" : "rgba(245, 158, 11, 0.1)",
                        padding: "2px 8px",
                        borderRadius: "4px",
                        whiteSpace: "nowrap"
                      }}
                    >
                      {pest.severity}
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", marginBottom: "12px", lineHeight: "1.4" }}>
                    <strong>Field Symptoms:</strong> {pest.symptoms}
                  </p>

                  <div
                    style={{
                      background: "rgba(220, 38, 38, 0.05)",
                      border: "1px solid rgba(220, 38, 38, 0.25)",
                      borderRadius: "8px",
                      padding: "10px 12px",
                      marginBottom: "10px"
                    }}
                  >
                    <strong style={{ fontSize: "12px", color: "#dc2626", textTransform: "uppercase", display: "block", marginBottom: "4px" }}>
                      🧪 Prescribed Chemical &amp; Dosage:
                    </strong>
                    <div style={{ fontSize: "13.5px", fontWeight: "700", color: "var(--fk-text)", lineHeight: "1.4" }}>
                      {pest.chemicalSolution}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "6px", fontSize: "12px", color: "var(--fk-text-sub)" }}>
                      <span>⏱️ Apply: <strong>{pest.timing.split("when")[0]}</strong></span>
                      <span style={{ color: "#dc2626", fontWeight: "700" }}>Waiting: {pest.waitingPeriodDays} Days</span>
                    </div>
                  </div>

                  <div
                    style={{
                      background: "rgba(22, 163, 74, 0.06)",
                      border: "1px solid rgba(22, 163, 74, 0.2)",
                      borderRadius: "8px",
                      padding: "8px 12px",
                      marginBottom: "10px"
                    }}
                  >
                    <strong style={{ fontSize: "11.5px", color: "#16a34a", textTransform: "uppercase", display: "block", marginBottom: "2px" }}>
                      🌿 Organic / Bio-Pesticide Alternative:
                    </strong>
                    <span style={{ fontSize: "13px", color: "var(--fk-text)", lineHeight: "1.3" }}>
                      {pest.organicAlternative}
                    </span>
                  </div>
                </div>

                <div style={{ borderTop: "1px solid var(--fk-border)", paddingTop: "8px", fontSize: "12px", color: "var(--fk-text-sub)", display: "flex", alignItems: "center", gap: "6px" }}>
                  <Shield size={12} color="#16a34a" />
                  <span>{pest.safetyPrecaution}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: NUTRIENT DOCTOR & VISUAL DEFICIENCY DIAGNOSIS */}
      {activeTab === "deficiencies" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Stethoscope size={20} color="#7c3aed" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                  🩺 Visual Nutrient Doctor &amp; Deficiency Remedies ({crop.name})
                </h3>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                Diagnose leaf discoloration, purpling, fruit cracking, or flower drop with ICAR prescribed foliar remedies.
              </p>
            </div>

            {/* NUTRIENT SELECTOR PILLS */}
            <div style={{ display: "flex", gap: "6px", flexWrap: "wrap" }}>
              {deficiencies.map((d) => {
                const isSelected = activeDeficiency?.id === d.id;
                return (
                  <button
                    key={d.id}
                    type="button"
                    onClick={() => setSelectedDeficiencyId(d.id)}
                    style={{
                      padding: "5px 12px",
                      borderRadius: "6px",
                      fontSize: "13px",
                      fontWeight: "700",
                      cursor: "pointer",
                      border: isSelected ? "2px solid #7c3aed" : "1px solid var(--fk-border)",
                      background: isSelected ? "rgba(124, 58, 237, 0.12)" : "var(--fk-bg)",
                      color: isSelected ? "#7c3aed" : "var(--fk-text)"
                    }}
                  >
                    {d.nutrient.split("(")[0].trim()}
                  </button>
                );
              })}
            </div>
          </div>

          {activeDeficiency && (
            <div
              style={{
                background: "var(--fk-bg)",
                border: "1.5px solid rgba(124, 58, 237, 0.3)",
                borderRadius: "10px",
                padding: "20px"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
                <div>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#7c3aed", textTransform: "uppercase" }}>
                    Diagnosed Field Nutritional Problem
                  </span>
                  <h4 style={{ fontSize: "19.5px", fontWeight: "800", color: "var(--fk-text)", margin: "2px 0 0" }}>
                    {activeDeficiency.nutrient}
                  </h4>
                </div>
                <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#dc2626", background: "rgba(220, 38, 38, 0.1)", padding: "3px 8px", borderRadius: "4px" }}>
                    Severity: {activeDeficiency.severity}
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#16a34a", background: "rgba(22, 163, 74, 0.1)", padding: "3px 8px", borderRadius: "4px" }}>
                    Recovery: {activeDeficiency.recoveryTime}
                  </span>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px", marginBottom: "16px" }}>
                <div style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", padding: "14px", borderRadius: "8px" }}>
                  <strong style={{ fontSize: "13px", color: "var(--fk-text)", display: "flex", alignItems: "center", gap: "6px" }}>
                    🔍 Visual Field Symptoms
                  </strong>
                  <p style={{ fontSize: "14px", color: "var(--fk-text-sub)", margin: "6px 0 0", lineHeight: "1.4" }}>
                    {activeDeficiency.symptom}
                  </p>
                </div>

                <div style={{ background: "var(--fk-card)", border: "1px solid var(--fk-border)", padding: "14px", borderRadius: "8px" }}>
                  <strong style={{ fontSize: "13px", color: "#d97706", display: "flex", alignItems: "center", gap: "6px" }}>
                    ⚠️ Primary Environmental / Soil Cause
                  </strong>
                  <p style={{ fontSize: "14px", color: "var(--fk-text-sub)", margin: "6px 0 0", lineHeight: "1.4" }}>
                    {activeDeficiency.cause}
                  </p>
                </div>
              </div>

              {/* REMEDY BANNER */}
              <div
                style={{
                  background: "linear-gradient(135deg, rgba(22, 163, 74, 0.08), rgba(124, 58, 237, 0.08))",
                  border: "1.5px solid #16a34a",
                  borderRadius: "8px",
                  padding: "14px 16px"
                }}
              >
                <strong style={{ fontSize: "13px", color: "#16a34a", textTransform: "uppercase", display: "flex", alignItems: "center", gap: "6px" }}>
                  💊 Immediate Foliar Spray &amp; Soil Dosage Formulation:
                </strong>
                <p style={{ fontSize: "14.5px", fontWeight: "700", color: "var(--fk-text)", margin: "6px 0 0", lineHeight: "1.4" }}>
                  {activeDeficiency.remedy}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 5: CROP ECONOMICS & PER-ACRE PROFIT CALCULATOR */}
      {activeTab === "economics" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                💰 Per-Acre Cost of Cultivation &amp; Profit Estimator ({crop.name})
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                Complete production cost breakdown vs expected yield and government MSP revenue.
              </p>
            </div>
            <span style={{ fontSize: "13px", fontWeight: "800", color: "#16a34a", background: "rgba(22, 163, 74, 0.1)", padding: "4px 10px", borderRadius: "6px" }}>
              Projected ROI: {economics.roiPercent}
            </span>
          </div>

          {/* FINANCIAL SUMMARY TILES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginBottom: "20px" }}>
            <div style={{ background: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.2)", padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#dc2626", textTransform: "uppercase" }}>Total Expenses / Acre</span>
              <div style={{ fontSize: "23.5px", fontWeight: "800", color: "#dc2626", marginTop: "2px" }}>
                ₹{economics.totalExpenses.toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>Includes seed, fertilizer, labor &amp; sprays</span>
            </div>

            <div style={{ background: "rgba(37, 99, 235, 0.06)", border: "1px solid rgba(37, 99, 235, 0.2)", padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>Expected Gross Revenue</span>
              <div style={{ fontSize: "23.5px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>
                ₹{economics.grossRevenue.toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>At {economics.expectedYieldQtl} Qtl × ₹{economics.marketPricePerQtl}/Qtl</span>
            </div>

            <div style={{ background: "rgba(22, 163, 74, 0.08)", border: "1px solid rgba(22, 163, 74, 0.3)", padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#16a34a", textTransform: "uppercase" }}>Estimated Net Profit / Acre</span>
              <div style={{ fontSize: "25.5px", fontWeight: "800", color: "#16a34a", marginTop: "2px" }}>
                ₹{economics.netProfitPerAcre.toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>Break-Even: {economics.breakEvenYieldQtl} Qtl/Acre</span>
            </div>
          </div>

          {/* COST BREAKDOWN TABLE */}
          <h4 style={{ fontSize: "14px", fontWeight: "800", color: "var(--fk-text)", marginBottom: "8px" }}>
            Detailed Input &amp; Labor Cost Breakdown (Per Acre):
          </h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
            {[
              { label: "Certified Seed / Pro-Trays", cost: economics.seedCost, pct: "6%" },
              { label: "Land Prep & Summer Tillage", cost: economics.landPrepCost, pct: "11%" },
              { label: "Chemical & Organic Fertilizers", cost: economics.fertilizerCost, pct: "20%" },
              { label: "Plant Protection (Pesticides)", cost: economics.protectionCost, pct: "19%" },
              { label: "Irrigation Electricity / Fuel", cost: economics.irrigationPowerCost, pct: "9%" },
              { label: "Manual Labor & Harvesting", cost: economics.laborHarvestCost, pct: "35%" }
            ].map((item, idx) => (
              <div key={idx} style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", padding: "10px 12px", borderRadius: "6px" }}>
                <span style={{ fontSize: "12.5px", color: "var(--fk-text-sub)", display: "block" }}>{item.label}</span>
                <strong style={{ fontSize: "15px", color: "var(--fk-text)", display: "block", marginTop: "2px" }}>
                  ₹{item.cost.toLocaleString("en-IN")}
                </strong>
                <span style={{ fontSize: "11.5px", color: "#2563eb", fontWeight: "700" }}>{item.pct} of total expenses</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: WHAT-IF YIELD & MANDI PROFIT SIMULATOR */}
      {activeTab === "simulator" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Calculator size={20} color="#059669" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                  📈 Interactive Profit &amp; Mandi Price Sensitivity Simulator ({crop.name})
                </h3>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                Slide yield and market selling prices to estimate net profit, return on investment, and break-even thresholds.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSimYield(economics.expectedYieldQtl);
                setSimPrice(economics.marketPricePerQtl);
              }}
              style={{
                padding: "4px 10px",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: "700",
                border: "1px solid var(--fk-border)",
                background: "var(--fk-bg)",
                color: "var(--fk-text)",
                cursor: "pointer"
              }}
            >
              Reset to Benchmarks
            </button>
          </div>

          {/* 2 SLIDERS */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginBottom: "20px" }}>
            {/* YIELD SLIDER */}
            <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", borderRadius: "8px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "14px", color: "var(--fk-text)" }}>
                  🌾 Simulated Harvest Yield:
                </strong>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#16a34a" }}>
                  {effectiveYield} Qtl / Acre
                </span>
              </div>
              <input
                type="range"
                min={Math.max(1, Math.round(economics.expectedYieldQtl * 0.4))}
                max={Math.round(economics.expectedYieldQtl * 2.2)}
                step="1"
                value={effectiveYield}
                onChange={(e) => setSimYield(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#16a34a", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--fk-text-sub)", marginTop: "4px" }}>
                <span>Low: {Math.round(economics.expectedYieldQtl * 0.5)} Qtl</span>
                <span>Avg: {economics.expectedYieldQtl} Qtl</span>
                <span>High: {Math.round(economics.expectedYieldQtl * 1.8)} Qtl</span>
              </div>
            </div>

            {/* MANDI PRICE SLIDER */}
            <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", borderRadius: "8px", padding: "14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <strong style={{ fontSize: "14px", color: "var(--fk-text)" }}>
                  💵 Selling Price per Quintal:
                </strong>
                <span style={{ fontSize: "16px", fontWeight: "800", color: "#2563eb" }}>
                  ₹{effectivePrice.toLocaleString("en-IN")} / Qtl
                </span>
              </div>
              <input
                type="range"
                min={Math.round(economics.marketPricePerQtl * 0.5)}
                max={Math.round(economics.marketPricePerQtl * 1.8)}
                step="50"
                value={effectivePrice}
                onChange={(e) => setSimPrice(Number(e.target.value))}
                style={{ width: "100%", accentColor: "#2563eb", cursor: "pointer" }}
              />
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--fk-text-sub)", marginTop: "4px" }}>
                <span>Discounted: ₹{Math.round(economics.marketPricePerQtl * 0.7)}</span>
                <span>MSP: ₹{economics.marketPricePerQtl}</span>
                <span>Peak: ₹{Math.round(economics.marketPricePerQtl * 1.5)}</span>
              </div>
            </div>
          </div>

          {/* 4 SIMULATED FINANCIAL TILES */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))", gap: "12px", marginBottom: "16px" }}>
            <div style={{ background: "rgba(37, 99, 235, 0.06)", border: "1px solid rgba(37, 99, 235, 0.2)", padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#2563eb", textTransform: "uppercase" }}>Simulated Gross Revenue</span>
              <div style={{ fontSize: "23.5px", fontWeight: "800", color: "#2563eb", marginTop: "2px" }}>
                ₹{simGrossRevenue.toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>{effectiveYield} Qtl × ₹{effectivePrice}</span>
            </div>

            <div style={{ background: "rgba(220, 38, 38, 0.06)", border: "1px solid rgba(220, 38, 38, 0.2)", padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "#dc2626", textTransform: "uppercase" }}>Cost of Production</span>
              <div style={{ fontSize: "23.5px", fontWeight: "800", color: "#dc2626", marginTop: "2px" }}>
                ₹{simExpenses.toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>Fixed + Variable Costs</span>
            </div>

            <div style={{ background: simNetProfit >= 0 ? "rgba(22, 163, 74, 0.08)" : "rgba(220, 38, 38, 0.08)", border: `1px solid ${simNetProfit >= 0 ? "rgba(22, 163, 74, 0.3)" : "rgba(220, 38, 38, 0.3)"}`, padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: simNetProfit >= 0 ? "#16a34a" : "#dc2626", textTransform: "uppercase" }}>
                {simNetProfit >= 0 ? "Estimated Net Profit" : "Estimated Net Loss"}
              </span>
              <div style={{ fontSize: "25.5px", fontWeight: "800", color: simNetProfit >= 0 ? "#16a34a" : "#dc2626", marginTop: "2px" }}>
                ₹{Math.abs(simNetProfit).toLocaleString("en-IN")}
              </div>
              <span style={{ fontSize: "12px", color: simNetProfit >= 0 ? "#16a34a" : "#dc2626", fontWeight: "700" }}>
                {simNetProfit >= 0 ? `ROI: +${simRoi}%` : `Loss: ${simRoi}%`}
              </span>
            </div>

            <div style={{ background: "var(--fk-bg)", border: "1px solid var(--fk-border)", padding: "14px", borderRadius: "8px" }}>
              <span style={{ fontSize: "12px", fontWeight: "700", color: "var(--fk-text)", textTransform: "uppercase" }}>Break-Even Yield</span>
              <div style={{ fontSize: "23.5px", fontWeight: "800", color: "var(--fk-text)", marginTop: "2px" }}>
                {simBreakEvenYield} Qtl
              </div>
              <span style={{ fontSize: "12px", color: "var(--fk-text-sub)" }}>Minimum yield required to cover costs</span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 7: CRITICAL WATER STAGES */}
      {activeTab === "irrigation" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                💧 Critical Irrigation Windows &amp; Moisture Sensitivity ({crop.name})
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                Strategic irrigation stages where missing water drops final harvest yield significantly.
              </p>
            </div>
            <span style={{ fontSize: "13px", color: "#0284c7", fontWeight: "700" }}>
              Total Season Need: {crop.waterRequirement}
            </span>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {waterStages.map((ws, idx) => (
              <div
                key={idx}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "12px 16px",
                  background: "var(--fk-bg)",
                  border: "1px solid var(--fk-border)",
                  borderRadius: "8px",
                  flexWrap: "wrap",
                  gap: "10px"
                }}
              >
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "24px", height: "24px", borderRadius: "50%", background: "#0284c7", color: "#ffffff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "12px", fontWeight: "800" }}>
                      {idx + 1}
                    </span>
                    <strong style={{ fontSize: "14.5px", color: "var(--fk-text)" }}>{ws.stage}</strong>
                    <span style={{ fontSize: "12px", fontWeight: "700", color: "#0284c7", background: "rgba(2, 132, 199, 0.1)", padding: "2px 7px", borderRadius: "4px" }}>
                      {ws.timing}
                    </span>
                  </div>
                  <p style={{ fontSize: "13px", color: "#dc2626", margin: "4px 0 0", display: "flex", alignItems: "center", gap: "4px" }}>
                    <AlertTriangle size={13} /> <strong>Yield Penalty If Missed:</strong> {ws.riskIfMissed}
                  </p>
                </div>

                <div style={{ textAlign: "right" }}>
                  <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", display: "block" }}>Water Volume</span>
                  <strong style={{ fontSize: "15px", color: "#0284c7" }}>{ws.mmNeeded}</strong>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 5: FOLIAR TANK-MIX SAFETY GUIDE */}
      {activeTab === "tank_mix" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                🧪 Foliar Tank-Mix Safety &amp; Chemical Compatibility Chart ({crop.name})
              </h3>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                Save labor and pump passes safely by knowing which fertilizers, fungicides, and insecticides can be mixed in a knapsack sprayer.
              </p>
            </div>
            <Link to="/tank-mix" style={{ fontSize: "13px", fontWeight: "700", color: "#2563eb", textDecoration: "none" }}>
              Open Full Tank-Mix Checker →
            </Link>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {tankMixes.map((tm, idx) => {
              const isSafe = tm.status === "SAFE";
              const isWarning = tm.status === "WARNING";
              return (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 16px",
                    background: isSafe ? "rgba(22, 163, 74, 0.05)" : isWarning ? "rgba(245, 158, 11, 0.05)" : "rgba(220, 38, 38, 0.05)",
                    border: `1px solid ${isSafe ? "rgba(22, 163, 74, 0.25)" : isWarning ? "rgba(245, 158, 11, 0.25)" : "rgba(220, 38, 38, 0.25)"}`,
                    borderRadius: "8px",
                    flexWrap: "wrap",
                    gap: "10px"
                  }}
                >
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                      <strong style={{ fontSize: "14px", color: "var(--fk-text)" }}>{tm.combo}</strong>
                    </div>
                    <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                      {tm.note}
                    </p>
                  </div>

                  <span
                    style={{
                      fontSize: "12px",
                      fontWeight: "800",
                      color: isSafe ? "#16a34a" : isWarning ? "#d97706" : "#dc2626",
                      background: "var(--fk-card)",
                      padding: "3px 8px",
                      borderRadius: "4px",
                      border: "1px solid var(--fk-border)"
                    }}
                  >
                    {tm.status}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 9: MATCHING GOVERNMENT SCHEMES & SUBSIDIES */}
      {activeTab === "schemes" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "10px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Award size={20} color="#b45309" />
                <h3 style={{ fontSize: "18px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                  🏛️ Government Subsidies &amp; Schemes Matching {crop.name}
                </h3>
              </div>
              <p style={{ fontSize: "13.5px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                Direct financial grants, seed subsidies, micro-irrigation discounts, and insurance schemes applicable to your farm.
              </p>
            </div>
            <Link
              to="/schemes"
              style={{
                fontSize: "13px",
                fontWeight: "800",
                color: "#2563eb",
                background: "rgba(37, 99, 235, 0.1)",
                padding: "6px 14px",
                borderRadius: "6px",
                textDecoration: "none",
                display: "inline-flex",
                alignItems: "center",
                gap: "5px"
              }}
            >
              Open Full Schemes Portal →
            </Link>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "14px" }}>
            {matchingSchemes.map((sch, idx) => (
              <div
                key={idx}
                style={{
                  background: "var(--fk-bg)",
                  border: "1px solid var(--fk-border)",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "8px", gap: "8px" }}>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#b45309", background: "rgba(180, 83, 9, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                      {sch.type}
                    </span>
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#16a34a", background: "rgba(22, 163, 74, 0.1)", padding: "2px 8px", borderRadius: "4px" }}>
                      {sch.subsidy}
                    </span>
                  </div>

                  <h4 style={{ fontSize: "15.5px", fontWeight: "800", color: "var(--fk-text)", margin: "2px 0 6px" }}>
                    {sch.name}
                  </h4>

                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: 0, lineHeight: "1.4" }}>
                    {sch.benefit}
                  </p>
                </div>

                <div style={{ marginTop: "14px", borderTop: "1px solid var(--fk-border)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>✓ Active for 2025–26</span>
                  <Link
                    to={`/schemes?search=${encodeURIComponent(sch.name.split(" ")[0])}`}
                    style={{ fontSize: "12.5px", fontWeight: "800", color: "#2563eb", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: "3px" }}
                  >
                    Check Eligibility <ArrowRight size={12} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 10: MORE FARM TOOLS & DECISION ENGINES (20 ENGINES) */}
      {activeTab === "more_tools" && (
        <div
          className="glass-card"
          style={{
            background: "var(--fk-card)",
            border: "1px solid var(--fk-border)",
            borderRadius: "12px",
            padding: "20px",
            marginBottom: "24px"
          }}
        >
          {/* HEADER */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Sprout size={22} color="#059669" />
                <h3 style={{ fontSize: "21.5px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                  More Farm Tools &amp; Specialized Decision Engines ({MORE_FARM_TOOLS_REGISTRY.length} Active Engines)
                </h3>
              </div>
              <p style={{ fontSize: "14px", color: "var(--fk-text-sub)", margin: "4px 0 0" }}>
                All 20 precision agronomy calculators, satellite stress indices, farm machinery rentals, and government scheme modules are fully operational.
              </p>
            </div>

            {/* Quick search input */}
            <div style={{ position: "relative", minWidth: "240px" }}>
              <Search size={14} style={{ position: "absolute", left: "10px", top: "50%", transform: "translateY(-50%)", color: "var(--fk-text-sub)" }} />
              <input
                type="text"
                value={toolsSearchQuery}
                onChange={(e) => setToolsSearchQuery(e.target.value)}
                placeholder="Search any tool or capability..."
                style={{
                  padding: "7px 12px 7px 32px",
                  borderRadius: "8px",
                  border: "1px solid var(--fk-border)",
                  background: "var(--fk-bg)",
                  color: "var(--fk-text)",
                  fontSize: "14px",
                  width: "100%",
                  outline: "none"
                }}
              />
            </div>
          </div>

          {/* ENGINE CATEGORY FILTER PILLS */}
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px", paddingBottom: "12px", borderBottom: "1px solid var(--fk-border)" }}>
            {[
              { id: "all", label: t("tools_cat_all", "All 20 Engines"), count: MORE_FARM_TOOLS_REGISTRY.length },
              { id: "agronomy", label: t("tools_cat_agronomy", "💧 Irrigation & Agronomy"), count: MORE_FARM_TOOLS_REGISTRY.filter(t => t.category === "agronomy").length },
              { id: "economics", label: t("tools_cat_economics", "📈 Economics & Markets"), count: MORE_FARM_TOOLS_REGISTRY.filter(t => t.category === "economics").length },
              { id: "tech", label: t("tools_cat_tech", "🛰️ Precision Tech & Satellite"), count: MORE_FARM_TOOLS_REGISTRY.filter(t => t.category === "tech").length },
              { id: "allied", label: t("tools_cat_allied", "🌿 Sustainable & Allied Farming"), count: MORE_FARM_TOOLS_REGISTRY.filter(t => t.category === "allied").length }
            ].map((cat) => {
              const isSel = toolsCategoryFilter === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setToolsCategoryFilter(cat.id)}
                  style={{
                    padding: "6px 14px",
                    borderRadius: "20px",
                    fontSize: "13.5px",
                    fontWeight: "800",
                    cursor: "pointer",
                    border: isSel ? "1.5px solid #059669" : "1px solid var(--fk-border)",
                    background: isSel ? "#059669" : "var(--fk-bg)",
                    color: isSel ? "#ffffff" : "var(--fk-text)",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    transition: "all 0.15s ease"
                  }}
                >
                  <span>{cat.label}</span>
                  <span
                    style={{
                      fontSize: "11.5px",
                      background: isSel ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                      padding: "1px 7px",
                      borderRadius: "10px"
                    }}
                  >
                    {cat.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* 20 ENGINES GRID */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {filteredTools.map((tool) => {
              const ToolIcon = tool.icon;
              return (
                <div
                  key={tool.id}
                  style={{
                    background: "var(--fk-bg)",
                    border: "1px solid var(--fk-border)",
                    borderRadius: "12px",
                    padding: "18px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    boxShadow: "0 2px 8px rgba(0,0,0,0.02)"
                  }}
                >
                  <div>
                    {/* Top Row: Icon, Title & Status */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px", marginBottom: "12px" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                        <div
                          style={{
                            width: "42px",
                            height: "42px",
                            borderRadius: "10px",
                            background: `${tool.badgeColor}18`,
                            color: tool.badgeColor,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            flexShrink: 0
                          }}
                        >
                          <ToolIcon size={22} />
                        </div>
                        <div>
                          <h4 style={{ fontSize: "16px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                            {t("tool_" + tool.id.replace(/-/g, "_"), tool.title)}
                          </h4>
                          <span style={{ fontSize: "12px", color: "var(--fk-text-sub)", fontWeight: "600" }}>
                            {tool.categoryLabel}
                          </span>
                        </div>
                      </div>

                      <span
                        style={{
                          fontSize: "11.5px",
                          fontWeight: "800",
                          color: tool.badgeColor,
                          background: `${tool.badgeColor}15`,
                          border: `1px solid ${tool.badgeColor}35`,
                          padding: "3px 8px",
                          borderRadius: "12px",
                          whiteSpace: "nowrap"
                        }}
                      >
                        {tool.badge}
                      </span>
                    </div>

                    {/* Summary Description */}
                    <p style={{ fontSize: "13.5px", color: "var(--fk-text)", margin: "0 0 12px", lineHeight: "1.45" }}>
                      {tool.summary}
                    </p>

                    {/* Key Capabilities */}
                    <div style={{ display: "flex", gap: "6px", flexWrap: "wrap", marginBottom: "14px" }}>
                      {tool.capabilities.map((cap, cIdx) => (
                        <span
                          key={cIdx}
                          style={{
                            fontSize: "12px",
                            background: "var(--fk-card)",
                            border: "1px solid var(--fk-border)",
                            color: "var(--fk-text-sub)",
                            padding: "2px 8px",
                            borderRadius: "6px",
                            fontWeight: "500"
                          }}
                        >
                          • {cap}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Launch Button */}
                  <div style={{ borderTop: "1px solid var(--fk-border)", paddingTop: "12px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: "12.5px", color: "#16a34a", fontWeight: "700", display: "flex", alignItems: "center", gap: "4px" }}>
                      <CheckCircle2 size={13} color="#16a34a" /> {t("live_ready", "Live & Ready")}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(tool.path)}
                      style={{
                        padding: "7px 14px",
                        borderRadius: "8px",
                        background: tool.badgeColor,
                        color: "#ffffff",
                        border: "none",
                        fontWeight: "800",
                        fontSize: "13px",
                        cursor: "pointer",
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        transition: "opacity 0.15s ease",
                        boxShadow: `0 2px 6px ${tool.badgeColor}40`
                      }}
                    >
                      {t("open_tool", "Open Tool")} <ArrowRight size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SECTION 4: LIVE WEATHER, MANDI PRICES & SAHAYAK AI HELPER */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(min(100%, 340px), 1fr))", gap: "20px", marginBottom: "24px" }}>
        {/* LIVE WEATHER RADAR */}
        <PremiumCard id="weather">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <CloudSun size={22} style={{ color: "#d97706" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, fontFamily: "Outfit, sans-serif" }}>
                {t("weather_title", "Live Weather & Spray Advisory")}
              </h3>
            </div>
            <StatusBadge status="info">{t("real_time_forecast", "Real-Time Forecast")}</StatusBadge>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px", padding: "14px", background: "var(--fk-bg)", borderRadius: "8px" }}>
            <div>
              <h2 style={{ fontSize: "32px", fontWeight: "800", color: "var(--fk-text)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                {weather?.current_temperature_c ?? 28}°C
              </h2>
              <p style={{ fontSize: "14px", color: "var(--fk-text-sub)", fontWeight: 600, margin: "2px 0 0" }}>
                {weather?.condition || "Partly Cloudy"}
              </p>
            </div>
            <div style={{ fontSize: "13px", display: "flex", flexDirection: "column", gap: "3px", color: "var(--fk-text-sub)" }}>
              <div>Humidity: <strong style={{ color: "var(--fk-text)" }}>{weather?.humidity_percent ?? 68}%</strong></div>
              <div>Rain Probability: <strong style={{ color: "var(--fk-text)" }}>{weather?.rainfall_probability ?? "20%"}</strong></div>
              <div>Wind: <strong style={{ color: "var(--fk-text)" }}>{weather?.wind_speed_kmh ?? 12} km/h</strong></div>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px", padding: "10px 12px", background: "rgba(21, 128, 61, 0.08)", borderRadius: "8px", border: "1px solid rgba(21, 128, 61, 0.2)" }}>
            <CheckCircle2 size={18} style={{ color: "#15803d", flexShrink: 0, marginTop: "2px" }} />
            <p style={{ fontSize: "13.5px", color: "var(--fk-text)", margin: 0 }}>
              {t("spray_conditions", "Spray Conditions: Wind speed < 15 km/h. Suitable for foliar nutrient and pest sprays before 10:30 AM.")}
            </p>
          </div>

          <div style={{ marginTop: "12px", textAlign: "right" }}>
            <button
              type="button"
              onClick={() => navigate("/weather")}
              style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              {t("open_full_weather", "Open Full Weather Radar")} <ArrowRight size={13} />
            </button>
          </div>
        </PremiumCard>

        {/* APMC MANDI PRICES */}
        <PremiumCard id="market">
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <TrendingUp size={22} style={{ color: "#15803d" }} />
              <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, fontFamily: "Outfit, sans-serif" }}>
                {t("mandi_title", "Live Mandi Prices")} ({t("crop_" + crop.id, crop.name).split(" ")[0]})
              </h3>
            </div>
            <StatusBadge status="success">{t("apmc_verified", "APMC Verified")}</StatusBadge>
          </div>

          <div style={{ width: "100%", height: 140 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={mandiChartData.length > 0 ? mandiChartData : [
                { name: "Hyd", ModalPrice: 7200 },
                { name: "Warangal", ModalPrice: 7450 },
                { name: "Khammam", ModalPrice: 7100 },
                { name: "Adilabad", ModalPrice: 7380 }
              ]}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--fk-border)" />
                <XAxis dataKey="name" stroke="var(--fk-text-sub)" fontSize={11} tickLine={false} />
                <YAxis stroke="var(--fk-text-sub)" fontSize={11} tickLine={false} />
                <Tooltip contentStyle={{ backgroundColor: "var(--fk-card)", borderColor: "var(--fk-border)", color: "var(--fk-text)", borderRadius: "8px" }} />
                <Bar dataKey="ModalPrice" fill="#16a34a" name="Price (₹/qtl)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px", fontSize: "13px" }}>
            <span style={{ color: "var(--fk-text-sub)" }}>MSP: <strong>{crop.mspValue}</strong></span>
            <button
              type="button"
              onClick={() => navigate("/mandi")}
              style={{ background: "none", border: "none", color: "#16a34a", fontWeight: "700", fontSize: "13px", cursor: "pointer", display: "inline-flex", alignItems: "center", gap: "4px" }}
            >
              {t("open_full_mandi", "Open Full Mandi Tracker")} <ArrowRight size={13} />
            </button>
          </div>
        </PremiumCard>
      </div>

      {/* QUICK SAHAYAK AI LAUNCHER */}
      <PremiumCard style={{ marginBottom: "24px", background: "linear-gradient(135deg, #064e3b 0%, #15803d 100%)", color: "#ffffff", border: "none" }}>
        <form onSubmit={handleLaunchPrompt} style={{ display: "flex", gap: "14px", alignItems: "center", flexWrap: "wrap" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", minWidth: "220px" }}>
            <Sparkles size={22} style={{ color: "#facc15" }} />
            <strong style={{ fontSize: "17px", fontFamily: "Outfit, sans-serif" }}>
              {t("ask_ai_title", "Ask Sahayak AI About")} {t("crop_" + crop.id, crop.name)}:
            </strong>
          </div>
          <div style={{ display: "flex", flex: 1, position: "relative", alignItems: "center", minWidth: "260px" }}>
            <input
              type="text"
              value={voice.isListening ? voice.interimTranscript || "Listening to your voice... 🎙️" : quickPrompt}
              onChange={(e) => setQuickPrompt(e.target.value)}
              placeholder={`e.g. 'How much urea should I spray for ${crop.name} at Day ${selectedDay}?'`}
              style={{
                width: "100%",
                padding: "11px 44px 11px 16px",
                borderRadius: "8px",
                border: "none",
                outline: "none",
                fontSize: "15px",
                color: "#0f172a",
                background: "#ffffff",
                boxShadow: voice.isListening ? "0 0 0 2px #ef4444" : "none"
              }}
            />
            {voice.isSttSupported && (
              <button
                type="button"
                onClick={voice.isListening ? voice.stopListening : voice.startListening}
                title={voice.isListening ? "Stop listening" : "Click to speak your question"}
                style={{
                  position: "absolute",
                  right: "8px",
                  background: voice.isListening ? "#ef4444" : "rgba(0,0,0,0.06)",
                  border: "none",
                  borderRadius: "50%",
                  width: "30px",
                  height: "30px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: voice.isListening ? "#ffffff" : "#15803d"
                }}
              >
                {voice.isListening ? <MicOff size={15} /> : <Mic size={15} />}
              </button>
            )}
          </div>
          <PremiumButton type="submit" variant="secondary" size="md" style={{ background: "#facc15", color: "#0f172a", border: "none", fontWeight: 800 }}>
            {t("ask_ai_btn", "Ask AI 🚀")}
          </PremiumButton>
        </form>
      </PremiumCard>

      {/* SECTION 5: MORE FARM TOOLS & DECISION ENGINES HUB */}
      <div
        className="glass-card"
        id="more-farm-tools-hub"
        style={{
          background: "linear-gradient(135deg, rgba(22, 163, 74, 0.04) 0%, rgba(37, 99, 235, 0.04) 100%)",
          border: "2px solid rgba(22, 163, 74, 0.25)",
          borderRadius: "14px",
          padding: "24px 22px",
          marginBottom: "24px"
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div
              style={{
                width: "48px",
                height: "48px",
                borderRadius: "12px",
                background: "#dcfce7",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "25.5px"
              }}
            >
              🚜
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <h3 style={{ fontSize: "21.5px", fontWeight: "900", color: "var(--fk-text)", margin: 0, fontFamily: "Outfit, sans-serif" }}>
                  {t("more_farm_tools_title", "More Farm Tools & Specialized Decision Engines")}
                </h3>
                <span style={{ fontSize: "12px", fontWeight: "800", color: "#16a34a", background: "rgba(22, 163, 74, 0.15)", padding: "2px 8px", borderRadius: "10px" }}>
                  {t("operational_engines", "20 Operational Engines")}
                </span>
              </div>
              <p style={{ fontSize: "14px", color: "var(--fk-text-sub)", margin: "3px 0 0" }}>
                {t("more_farm_tools_sub", "Instant access to FAO water budgeting, Sentinel-2 spaceborne NDVI, APMC mandi arbitrage, PMFBY claim assistance, and livestock veterinary triage.")}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "8px" }}>
            <PremiumButton variant="secondary" size="sm" onClick={() => setActiveTab("more_tools")}>
              {t("view_tab_view", "View Tab View 📑")}
            </PremiumButton>
          </div>
        </div>

        {/* 4 CATEGORY PILLS */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", marginBottom: "18px", paddingBottom: "12px", borderBottom: "1px solid var(--fk-border)" }}>
          {[
            { id: "all", label: t("tools_cat_all", "All 20 Engines"), count: 20 },
            { id: "agronomy", label: t("tools_cat_agronomy", "💧 Irrigation & Agronomy"), count: 5 },
            { id: "economics", label: t("tools_cat_economics", "📈 Economics & Markets"), count: 5 },
            { id: "tech", label: t("tools_cat_tech", "🛰️ Precision Tech & Satellite"), count: 5 },
            { id: "allied", label: t("tools_cat_allied", "🌿 Sustainable & Allied Farming"), count: 5 }
          ].map((cat) => {
            const isSel = toolsCategoryFilter === cat.id;
            return (
              <button
                key={cat.id}
                type="button"
                onClick={() => setToolsCategoryFilter(cat.id)}
                style={{
                  padding: "6px 14px",
                  borderRadius: "20px",
                  fontSize: "13.5px",
                  fontWeight: "800",
                  cursor: "pointer",
                  border: isSel ? "1.5px solid #16a34a" : "1px solid var(--fk-border)",
                  background: isSel ? "#16a34a" : "var(--fk-bg)",
                  color: isSel ? "#ffffff" : "var(--fk-text)",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "6px",
                  transition: "all 0.15s ease"
                }}
              >
                <span>{cat.label}</span>
                <span
                  style={{
                    fontSize: "11.5px",
                    background: isSel ? "rgba(255,255,255,0.25)" : "rgba(0,0,0,0.06)",
                    padding: "1px 7px",
                    borderRadius: "10px"
                  }}
                >
                  {cat.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* 20 ENGINES GRID IN DASHBOARD */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "14px" }}>
          {filteredTools.map((tool) => {
            const ToolIcon = tool.icon;
            return (
              <div
                key={tool.id}
                style={{
                  background: "var(--fk-card)",
                  border: "1px solid var(--fk-border)",
                  borderRadius: "10px",
                  padding: "16px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  boxShadow: "0 2px 6px rgba(0,0,0,0.02)"
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "8px", marginBottom: "8px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <div
                        style={{
                          width: "36px",
                          height: "36px",
                          borderRadius: "8px",
                          background: `${tool.badgeColor}18`,
                          color: tool.badgeColor,
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0
                        }}
                      >
                        <ToolIcon size={20} />
                      </div>
                      <div>
                        <h4 style={{ fontSize: "15px", fontWeight: "800", color: "var(--fk-text)", margin: 0 }}>
                          {t("tool_" + tool.id.replace(/-/g, "_"), tool.title)}
                        </h4>
                        <span style={{ fontSize: "11.5px", color: "var(--fk-text-sub)" }}>
                          {tool.categoryLabel}
                        </span>
                      </div>
                    </div>

                    <span
                      style={{
                        fontSize: "11px",
                        fontWeight: "800",
                        color: tool.badgeColor,
                        background: `${tool.badgeColor}15`,
                        padding: "2px 6px",
                        borderRadius: "8px"
                      }}
                    >
                      Active
                    </span>
                  </div>

                  <p style={{ fontSize: "13px", color: "var(--fk-text-sub)", margin: "0 0 10px", lineHeight: "1.4" }}>
                    {tool.summary}
                  </p>
                </div>

                <div style={{ borderTop: "1px solid var(--fk-border)", paddingTop: "10px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span style={{ fontSize: "12px", color: "#16a34a", fontWeight: "700" }}>
                    ✓ Ready
                  </span>
                  <button
                    type="button"
                    onClick={() => navigate(tool.path)}
                    style={{
                      padding: "6px 12px",
                      borderRadius: "6px",
                      background: tool.badgeColor,
                      color: "#ffffff",
                      border: "none",
                      fontWeight: "800",
                      fontSize: "12.5px",
                      cursor: "pointer",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px"
                    }}
                  >
                    {t("open_tool", "Open Tool")} <ArrowRight size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* KISAN CALL CENTER TOLL-FREE DIRECT BANNER */}
      <div
        className="glass-card"
        style={{
          background: "linear-gradient(135deg, rgba(37, 99, 235, 0.06), rgba(22, 163, 74, 0.06))",
          border: "1px solid var(--fk-border)",
          borderRadius: "10px",
          padding: "14px 20px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
          marginBottom: "20px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <PhoneCall size={22} color="#2563eb" />
          <div>
            <strong style={{ fontSize: "15px", color: "var(--fk-text)", display: "block" }}>
              {t("kcc_banner_title", "Need Direct Guidance from Government University Agronomists?")}
            </strong>
            <span style={{ fontSize: "13px", color: "var(--fk-text-sub)" }}>
              {t("kcc_banner_sub", "Call Kisan Call Center (KCC) toll-free from 6:00 AM to 10:00 PM in any Indian language.")}
            </span>
          </div>
        </div>
        <a
          href="tel:18001801551"
          style={{
            background: "#2563eb",
            color: "#ffffff",
            padding: "7px 16px",
            borderRadius: "6px",
            fontWeight: "800",
            fontSize: "14px",
            textDecoration: "none",
            display: "inline-flex",
            alignItems: "center",
            gap: "6px"
          }}
        >
          <PhoneCall size={14} /> {t("kcc_toll_free", "1800-180-1551 (Toll-Free)")}
        </a>
      </div>

      {/* FARM PROFILE WIZARD MODAL */}
      {isEditingProfile && (
        <FarmProfileWizard
          user={user}
          onClose={() => setIsEditingProfile(false)}
          onSaveProfile={async (updated) => {
            if (onUpdateUser) await onUpdateUser(updated);
            if (updated.location) setLocationText(updated.location);
          }}
        />
      )}
    </div>
  );
}
