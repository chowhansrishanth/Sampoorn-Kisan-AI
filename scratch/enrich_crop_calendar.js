const fs = require('fs');
const path = require('path');

const targetFile = path.join(__dirname, '../backend/data/cropCalendar.json');
let existing = {};
try {
  existing = JSON.parse(fs.readFileSync(targetFile, 'utf8').replace(/^\uFEFF/, ''));
} catch (e) {
  console.log('Error reading existing cropCalendar.json:', e.message);
}

const cropAgronomics = {
  "Paddy": {
    name: "Paddy (Rice)",
    category: "Cereals",
    season: "Kharif (Jun-Nov) / Rabi (Nov-Apr)",
    defaultDurationDays: 135,
    durationMinDays: 110,
    durationMaxDays: 160,
    stages: [
      {
        stage: "Nursery & Seedling (0-25 days)",
        percent: 18,
        activities: ["Nursery bed preparation (10% of main field area)", "Wet bed or dry bed sowing with sprouted seeds", "Maintain thin layer of water (1-2 cm) in nursery"],
        irrigation: "Keep nursery bed saturated; avoid deep submergence of young sprouts",
        nutrition: "Apply 10 kg Urea + 10 kg SSP per 1000 m2 nursery area",
        plantProtection: "Monitor for stem borer and thrips; seed treatment with Carbendazim 2g/kg"
      },
      {
        stage: "Tillering & Vegetative (26-60 days)",
        percent: 26,
        activities: ["Transplant 2-3 seedlings per hill at 20x15 cm spacing", "Gap filling within 7-10 days of transplanting", "Cono-weeder or manual weeding at 20 and 40 DAT"],
        irrigation: "Maintain 2-5 cm shallow standing water; practice alternate wetting and drying (AWD)",
        nutrition: "1st Top dressing: 30 kg Nitrogen/ha at 21 DAT during active tillering",
        plantProtection: "Scout for blast, gall midge, and whorl maggot; apply Cartap Hydrochloride if threshold exceeded"
      },
      {
        stage: "Panicle Initiation & Booting (61-85 days)",
        percent: 19,
        activities: ["Monitor panicle primordium development", "Maintain field bunds to prevent nutrient leakage", "Rogue out off-type and wild rice plants"],
        irrigation: "Maintain steady 5 cm standing water (most drought-sensitive stage)",
        nutrition: "2nd Top dressing: 25 kg Nitrogen + 20 kg Potash (K2O)/ha at panicle initiation",
        plantProtection: "Preventive spray of Tricyclazole 75 WP @ 0.6g/L for neck and panicle blast"
      },
      {
        stage: "Flowering & Grain Filling (86-115 days)",
        percent: 22,
        activities: ["Anthesis and milk-to-dough stage development", "Keep field free of birds and rodent traps", "Foliar spray of 1% Potassium Nitrate (13:0:45) for grain weight boost"],
        irrigation: "Maintain 2-3 cm water till dough stage; drain field 10-12 days before anticipated harvest",
        nutrition: "Avoid excess Nitrogen to prevent lodging and sheath rot",
        plantProtection: "Monitor for brown plant hopper (BPH) at base of plants; spray Pymetrozine 50 WG @ 0.6g/L"
      },
      {
        stage: "Physiological Maturity & Harvesting (116-135 days)",
        percent: 15,
        activities: ["Reap when 80-85% of grains turn golden yellow", "Combine harvesting or manual sickle cutting followed by mechanical thresher", "Sun dry harvested paddy on clean threshing floor"],
        irrigation: "Completely drained dry field for easy machinery movement and uniform ripening",
        nutrition: "No fertilizer application during ripening",
        plantProtection: "Store cleaned grain in airtight bags; fumigate with Aluminum Phosphide if weevil observed"
      }
    ],
    landSoilRequirements: {
      preferredSoils: ["Clay Loam", "Clayey Soils", "Alluvial River Loams", "Black Silt Soils"],
      idealPh: "5.5 - 7.5",
      fieldPreparation: "2-3 summer ploughings followed by puddling with cage wheels. Level field thoroughly using laser land leveler to ensure uniform water depth."
    },
    irrigationRequirements: {
      totalWaterNeedMm: "1100 - 1400 mm",
      method: "Controlled Basin Irrigation or Alternate Wetting & Drying (AWD)",
      criticalStages: ["Transplanting", "Tillering", "Panicle Initiation", "Flowering/Booting"],
      intervals: "Keep continuous 2-5 cm submergence during tillering and panicle initiation, then AWD until 10 days before harvest."
    },
    fertilizerNutrientRequirements: {
      recommendedNpkKgPerHa: "120:60:40 kg/ha N:P2O5:K2O",
      basalApplication: "Apply 50% N + 100% P + 50% K + Zinc Sulphate 25 kg/ha at final puddling.",
      topDressing: "25% N at active tillering (21 DAT) and remaining 25% N + 50% K at panicle initiation (45-50 DAT).",
      micronutrients: "Zinc Sulphate 21% @ 25 kg/ha basal to prevent Khaira deficiency.",
      organicBiofertilizers: "Incorporate FYM @ 10 tonnes/ha or green manuring with Sesbania (Dhaincha) before puddling; Azospirillum @ 2 kg/ha seed treatment."
    },
    sowingPlantingInfo: {
      sowingWindow: "Kharif: May 20 - June 25 (Nursery), June 15 - July 20 (Transplanting); Rabi: Nov 15 - Dec 20",
      seedRatePerAcre: "16 - 20 kg/acre (Transplanted); 8 - 10 kg/acre (SRI method)",
      spacing: "20 cm row-to-row x 15 cm plant-to-plant (2-3 seedlings/hill)",
      sowingDepth: "Transplant shallow at 2 - 3 cm depth for rapid rooting",
      seedTreatment: "Carbendazim 50% WP @ 2g/kg + Streptocycline @ 0.1g/kg seed in 1 liter water for 12 hours"
    },
    weedingRequirements: {
      criticalPeriod: "First 15 to 45 days after transplanting (DAT)",
      herbicideRecommendations: "Pre-emergence: Pretilachlor 50 EC @ 600 ml/acre within 3 days of transplanting in standing water; Post-emergence: Bispyribac sodium 10 SC @ 80 ml/acre at 20-25 DAT.",
      manualInterculture: "Run Cono-weeder or rotary weeder between rows at 20 DAT and 40 DAT to aerate roots."
    },
    pestDiseaseManagement: {
      majorPests: ["Yellow Stem Borer (Dead heart, white ear)", "Brown Plant Hopper (Hopper burn)", "Leaf Folder", "Gall Midge"],
      majorDiseases: ["Bacterial Leaf Blight (BLB)", "Blast (Pyricularia oryzae)", "Sheath Blight", "False Smut"],
      preventiveCulturalPractices: ["Avoid excessive nitrogen application", "Install pheromone traps @ 5/acre for stem borer", "Maintain field bunds free of weed hosts", "Follow alternate wetting and drying to curb BPH"]
    },
    weatherClimate: {
      optimumTemperature: "22°C - 32°C during vegetative; 20°C - 25°C during ripening",
      rainfall: "1000 - 1500 mm well-distributed rainfall",
      weatherAlerts: "Heavy rainfall during flowering washes away pollen; drain standing water immediately if cyclone or flash flooding occurs."
    },
    facilitiesResources: {
      machineryEquipment: ["Tractor with cage wheels and rotavator", "Laser land leveler", "Cono-weeder", "Knapsack/Power sprayer", "Combine harvester or mechanical thresher"],
      irrigationInfrastructure: ["Canal outlets, tubewell/borewell with PVC delivery pipelines", "Level field bunds with drainage sluice gates"],
      storageHandling: ["Elevated cement drying yard (pucca khaliyan)", "Tarpaulin sheets (20x20 ft)", "Hermetic grain storage bags (PICS bags) or galvanized steel bins"]
    },
    harvestingPeriod: {
      maturityIndicators: "85% grains in panicle turn golden straw color; flag leaf senesces; grains produce metallic crack sound when bitten.",
      harvestMoisture: "18% - 20% moisture during field cutting; dry immediately to 12% - 14% for long-term safe storage.",
      postHarvestCare: "Thresh within 24 hours of cutting to prevent fungal development; dry slowly under mild sun; store in cool, rodent-proof godown."
    }
  },
  "Wheat": {
    name: "Wheat",
    category: "Cereals",
    season: "Rabi (Oct-Mar)",
    defaultDurationDays: 120,
    durationMinDays: 105,
    durationMaxDays: 135,
    stages: [
      {
        stage: "Crown Root Initiation (CRI, 20-25 days)",
        percent: 20,
        activities: ["First critical irrigation", "First weeding and hoeing", "Check for termite activity"],
        irrigation: "Most critical irrigation (20-25 DAS); water stress here reduces yield by 30%",
        nutrition: "1st Top dressing: 30 kg Nitrogen (65 kg Urea)/ha immediately after first irrigation",
        plantProtection: "Pre-emergence weed control with Pendimethalin 30 EC @ 1 L/acre"
      },
      {
        stage: "Tillering & Jointing (26-55 days)",
        percent: 25,
        activities: ["Second irrigation at late tillering (40-45 DAS)", "Secondary root establishment", "Broadleaf weed spray"],
        irrigation: "Irrigate at 40-45 DAS; avoid standing water in heavy soils",
        nutrition: "2nd Top dressing: 30 kg Nitrogen/ha at first node stage",
        plantProtection: "Spray 2,4-D Ethyl Ester @ 250 ml/acre or Metsulfuron-methyl @ 8g/acre for broadleaf weeds"
      },
      {
        stage: "Booting & Heading (56-80 days)",
        percent: 21,
        activities: ["Third irrigation at booting stage (65-70 DAS)", "Scout for yellow rust pustules on upper leaves", "Foliar spray of Zinc Sulphate if deficiency noticed"],
        irrigation: "Light irrigation at ear emergence; do not irrigate in high winds to prevent lodging",
        nutrition: "Foliar spray of 2% Urea + 0.5% Zinc Sulphate for grain spikelet fertility",
        plantProtection: "Spray Propiconazole 25 EC (Tilt) @ 1 ml/L on initial yellow/brown rust signs"
      },
      {
        stage: "Milk & Dough Stage (81-105 days)",
        percent: 21,
        activities: ["Grain filling and starch accumulation", "Protect from bird damage in early morning/evening", "Fourth irrigation at milk stage"],
        irrigation: "Maintain soil moisture at grain filling; cease irrigation 15 days before harvest",
        nutrition: "Foliar spray of 1% Potassium Nitrate (13:0:45) to enhance 1000-grain weight",
        plantProtection: "Monitor for head aphids; spray Thiamethoxam 25 WG @ 0.3g/L if population exceeds 5 per ear head"
      },
      {
        stage: "Physiological Maturity & Harvesting (106-120 days)",
        percent: 13,
        activities: ["Harvest when grain is flinty hard and straw is dry and brittle", "Combine harvesting or reaper threshing", "Sun-dry grain to <= 12% moisture"],
        irrigation: "Dry field conditions required for harvest",
        nutrition: "Nil",
        plantProtection: "Treat storage bins with Malathion 50 EC spray before storage"
      }
    ],
    landSoilRequirements: {
      preferredSoils: ["Well-drained Loam", "Clay Loam", "Alluvial Soils", "Black Loam Soils"],
      idealPh: "6.0 - 7.5",
      fieldPreparation: "1 deep summer ploughing followed by 2-3 cultivator passes and planking to create a fine, weed-free, firm seedbed."
    },
    irrigationRequirements: {
      totalWaterNeedMm: "450 - 600 mm",
      method: "Border Strip, Furrow, or Sprinkler Irrigation",
      criticalStages: ["Crown Root Initiation (21 DAS)", "Tillering (42 DAS)", "Jointing (65 DAS)", "Flowering (85 DAS)", "Milking (100 DAS)"],
      intervals: "4 to 6 light irrigations spaced 18-22 days apart depending on winter rain."
    },
    fertilizerNutrientRequirements: {
      recommendedNpkKgPerHa: "120:60:40 kg/ha N:P2O5:K2O",
      basalApplication: "Apply 50% N + 100% P + 100% K at sowing in seed-cum-fertilizer drill.",
      topDressing: "25% N at first irrigation (CRI stage) and remaining 25% N at second irrigation (Jointing).",
      micronutrients: "Zinc Sulphate 21% @ 25 kg/ha basal once in 2 years.",
      organicBiofertilizers: "FYM @ 5-8 tonnes/ha incorporated during field preparation; Azotobacter + PSB seed treatment @ 200g/10kg seed."
    },
    sowingPlantingInfo: {
      sowingWindow: "Timely sowing: November 1 - November 20; Late sowing: November 25 - December 15",
      seedRatePerAcre: "40 - 45 kg/acre (Timely); 50 - 55 kg/acre (Late sown)",
      spacing: "20 - 22.5 cm row-to-row x continuous seed drop",
      sowingDepth: "4 - 5 cm in moist zone (Avoid deeper sowing which delays CRI emergence)",
      seedTreatment: "Carboxin + Thiram (Vitavax Power) @ 2.5g/kg seed for loose smut prevention"
    },
    weedingRequirements: {
      criticalPeriod: "First 30 to 45 days after sowing",
      herbicideRecommendations: "Pre-emergence: Pendimethalin 30 EC @ 1 L/acre within 2 DAS; Post-emergence: Sulfosulfuron 75 WG @ 13.5 g/acre + Metsulfuron @ 8 g/acre at 30-35 DAS.",
      manualInterculture: "One hand weeding at 30-35 DAS if herbicide not applied."
    },
    pestDiseaseManagement: {
      majorPests: ["Wheat Aphids (Sitobion avenae)", "Termites (Microtermes obesi)", "Armyworm"],
      majorDiseases: ["Yellow Rust (Stripe rust)", "Brown Rust (Leaf rust)", "Loose Smut", "Karnal Bunt"],
      preventiveCulturalPractices: ["Use certified rust-resistant varieties (HD-2967, HD-3086, DBW-187, DBW-303)", "Seed treatment with Chlorpyrifos for termite prone fields", "Avoid excessive nitrogen in humid cloudy weather"]
    },
    weatherClimate: {
      optimumTemperature: "15°C - 20°C during tillering; 20°C - 25°C during heading and grain filling",
      rainfall: "250 - 350 mm winter showers (Western disturbances)",
      weatherAlerts: "Terminal heat stress (temperatures > 32°C in March) causes forced maturity; spray Potassium Nitrate 1% or provide light irrigation to cool canopy."
    },
    facilitiesResources: {
      machineryEquipment: ["Tractor with Zero-Till drill or Happy Seeder", "Cultivator and heavy planker", "Boom or battery sprayer", "Reaper-binder or combine harvester"],
      irrigationInfrastructure: ["Underground pipeline network or sprinkler sets to prevent deep percolation"],
      storageHandling: ["Metal grain silos or HDPE woven bags with polythene liner", "Moisture meter to verify <= 12% moisture"]
    },
    harvestingPeriod: {
      maturityIndicators: "Grain becomes hard and dough turns firm; straw turns completely yellow and dry; moisture drops below 14%.",
      harvestMoisture: "12% - 14% optimal for harvesting.",
      postHarvestCare: "Separate chaff, winnow, dry for 2 sunny days, store with neem leaves or dry sand sealing."
    }
  },
  "Cotton": {
    name: "Cotton",
    category: "Commercial / Cash Crop",
    season: "Kharif (Apr-Nov)",
    defaultDurationDays: 160,
    durationMinDays: 140,
    durationMaxDays: 180,
    stages: [
      {
        stage: "Sowing & Emergence (0-20 days)",
        percent: 13,
        activities: ["Ridge and furrow formation", "Sow 1-2 seeds per dibbling spot at 90x60 cm", "Gap filling with pre-soaked seed within 10 days"],
        irrigation: "Light irrigation immediately after dibbling or sow on ridges under rainfed monsoon",
        nutrition: "Basal: 25% N + 100% P + 50% K applied 5 cm below and to the side of seed",
        plantProtection: "Seed treatment with Imidacloprid 70 WS @ 7g/kg for 30-day sucking pest protection"
      },
      {
        stage: "Squaring & Vegetative (21-65 days)",
        percent: 28,
        activities: ["Thinning to single vigorous plant per hill at 20 DAS", "Inter-cultivation with blade harrow (Danti)", "Monitor for square formation and early thrips"],
        irrigation: "Irrigate every 10-14 days; avoid standing water on black soils",
        nutrition: "1st Top dressing: 35% Nitrogen at 35-40 DAS during squaring stage",
        plantProtection: "Install yellow and blue sticky traps; spray Neem oil 10,000 ppm @ 3 ml/L for whiteflies"
      },
      {
        stage: "Flowering & Boll Initiation (66-105 days)",
        percent: 25,
        activities: ["Peak flowering and young boll development", "Nipper / detopping terminal shoots at 90-100 DAS to redirect energy to bolls", "Scout for pink bollworm inside rosette flowers"],
        irrigation: "Critical irrigation stage; ensure soil moisture during flowering to prevent boll shed",
        nutrition: "2nd Top dressing: 25% Nitrogen + 50% Potash at 65-70 DAS; foliar spray of 1% Magnesium Sulphate + 0.2% Boron",
        plantProtection: "Install Pink Bollworm pheromone traps @ 8/acre; spray Emamectin Benzoate 5 SG @ 0.4g/L if moth catch > 8/day"
      },
      {
        stage: "Boll Development & Bursting (106-135 days)",
        percent: 19,
        activities: ["Boll maturation and lint expansion", "Protect from boll rot during unseasonal rains", "First picking of fluffy opened bolls in dry sunny weather"],
        irrigation: "Light irrigations; cease all irrigation 15 days before major boll opening",
        nutrition: "Foliar spray of 2% Potassium Nitrate (13:0:45) twice at 15-day interval for boll size",
        plantProtection: "Spray Spinosad 45 SC @ 0.3 ml/L if American bollworm detected"
      },
      {
        stage: "Harvesting & Picking (136-160 days)",
        percent: 15,
        activities: ["Pick clean cotton in dry afternoon hours (avoid morning dew)", "Separate trash, dried bracts, and stained cotton from clean lint", "Sun-dry seed cotton (Kapas) on clean canvas"],
        irrigation: "Completely dry soil",
        nutrition: "Nil",
        plantProtection: "Destroy crop residue and graze cattle to prevent pink bollworm carryover"
      }
    ],
    landSoilRequirements: {
      preferredSoils: ["Deep Black Cotton Soil (Regur)", "Well-drained Clay Loam", "Medium Black Soils"],
      idealPh: "6.5 - 8.2",
      fieldPreparation: "Deep summer ploughing (25-30 cm) to break hardpan; 2 harrowings followed by ridger to form ridges and furrows at 90 cm interval."
    },
    irrigationRequirements: {
      totalWaterNeedMm: "700 - 900 mm",
      method: "Drip Irrigation (Recommended) or Alternate Furrow Irrigation",
      criticalStages: ["Squaring (40 DAS)", "Flowering (70 DAS)", "Boll development (95 DAS)"],
      intervals: "Irrigate every 8-12 days depending on evapotranspiration and soil moisture."
    },
    fertilizerNutrientRequirements: {
      recommendedNpkKgPerHa: "120:60:60 kg/ha N:P2O5:K2O (for Bt Hybrids)",
      basalApplication: "Apply 25% N + 100% P + 50% K + 25 kg/ha Zinc Sulphate + 10 kg/ha Borax.",
      topDressing: "35% N at squaring (35-40 DAS), 25% N + 50% K at peak flowering (65-70 DAS), 15% N at boll formation (85-90 DAS).",
      micronutrients: "Foliar spray of 1% Magnesium Sulphate + 0.5% Zinc Sulphate to prevent red leaf disease (leaf reddening).",
      organicBiofertilizers: "FYM @ 10 tonnes/ha; VAM (Mycorrhiza) @ 5 kg/ha at root zone for phosphorus uptake."
    },
    sowingPlantingInfo: {
      sowingWindow: "Kharif: May 15 - June 25 with pre-monsoon irrigation; June 15 - July 10 under rainfed conditions",
      seedRatePerAcre: "1.5 - 2.0 kg/acre (Bt hybrid packets including refuge seed)",
      spacing: "90 cm x 60 cm (Low rainfall) or 120 cm x 45 cm (Drip fertile fields)",
      sowingDepth: "3 - 4 cm on side of ridge",
      seedTreatment: "Bt hybrid seed is pre-treated; for non-Bt treat with Imidacloprid 70 WS @ 7g/kg + Trichoderma viride @ 4g/kg"
    },
    weedingRequirements: {
      criticalPeriod: "First 60 days after sowing",
      herbicideRecommendations: "Pre-emergence: Pendimethalin 30 EC @ 1.25 L/acre within 48 hours of sowing; Post-emergence directed: Quizalofop-ethyl 5 EC @ 400 ml/acre for grass weeds at 25 DAS.",
      manualInterculture: "Inter-cultivation with bullock or tractor drawn cultivator at 25, 45, and 65 DAS followed by hand weeding."
    },
    pestDiseaseManagement: {
      majorPests: ["Pink Bollworm (Pectinophora gossypiella)", "Whitefly (Bemisia tabaci)", "Thrips", "Jassids (Leafhoppers)"],
      majorDiseases: ["Bacterial Leaf Blight (Angular leaf spot)", "Grey Mildew", "Root Rot (Rhizoctonia)", "Alternaria Leaf Spot"],
      preventiveCulturalPractices: ["Install pheromone traps @ 8/acre by 45 DAS", "Destroy and burn stubbles immediately after final picking", "Spray Copper Oxychloride @ 3g/L + Streptocycline @ 0.1g/L for bacterial blight"]
    },
    weatherClimate: {
      optimumTemperature: "25°C - 35°C during vegetative; 21°C - 28°C during boll bursting with bright sunshine",
      rainfall: "600 - 800 mm with dry sunny weather during boll maturation",
      weatherAlerts: "Continuous cloudy days and high humidity promote flower shedding and grey mildew; unseasonal rain stains open cotton."
    },
    facilitiesResources: {
      machineryEquipment: ["Tractor with ridger and cultivator", "Battery knapsack sprayer with hollow cone nozzle", "Cotton picking bags (aprons)", "Cotton shredder for post-harvest stubble removal"],
      irrigationInfrastructure: ["Drip irrigation kit with inline emitters (2 LPH at 60 cm interval)"],
      storageHandling: ["Clean cement yard protected from dust and cattle", "Clean cotton cloth bags (Avoid polythene or plastic strings to prevent lint contamination)"]
    },
    harvestingPeriod: {
      maturityIndicators: "Bolls burst open fully revealing clean, white, fluffy seed cotton; bolls feel dry to the touch.",
      harvestMoisture: "<= 8% moisture for safe ginning and market delivery.",
      postHarvestCare: "Pick in 3-4 pickings; dry under morning sun for 3-4 hours; store in dry, fire-safe shed away from kerosene/diesel fumes."
    }
  },
  "Groundnut": {
    name: "Groundnut (Peanut)",
    category: "Oilseeds / Legumes",
    season: "Kharif (Jun-Oct) / Rabi (Oct-Feb)",
    defaultDurationDays: 110,
    durationMinDays: 95,
    durationMaxDays: 125,
    stages: [
      {
        stage: "Emergence & Early Vegetative (0-25 days)",
        percent: 22,
        activities: ["Pre-sowing seed treatment with Rhizobium and Trichoderma", "Broadbed and Furrow (BBF) sowing", "Gap filling within 7-10 days"],
        irrigation: "Sow in good soil moisture; first life irrigation at 7-10 DAS if dry",
        nutrition: "Basal: SSP @ 150 kg/acre + 25 kg Urea + 25 kg MOP + 100 kg Gypsum/acre",
        plantProtection: "Seed treatment with Imidacloprid 600 FS @ 6 ml/kg seed against white grubs"
      },
      {
        stage: "Flowering & Peg Initiation (26-50 days)",
        percent: 23,
        activities: ["Profuse yellow flower appearance", "Pegs emerge and penetrate soil (geocarpy)", "Strictly avoid hoeing once pegging begins"],
        irrigation: "Critical irrigation at flowering and peg entry into soil (40-45 DAS)",
        nutrition: "Apply Gypsum @ 200 kg/acre at 40-45 DAS around base; Calcium is critical for pod filling",
        plantProtection: "Spray Chlorpyrifos 20 EC @ 2 ml/L into soil if white grub observed"
      },
      {
        stage: "Pod Development & Seed Filling (51-85 days)",
        percent: 32,
        activities: ["Underground pod enlargement and shell hardening", "Maintain loose, moist friable topsoil in peg zone", "Scout for Tikka leaf spot on lower canopy"],
        irrigation: "Most critical water requirement stage; maintain optimum soil moisture for pod development",
        nutrition: "Foliar spray of 0.5% Ferrous Sulphate + 0.1% Citric acid if iron chlorosis (yellowing) appears",
        plantProtection: "Spray Mancozeb 75 WP @ 2.5g/L or Hexaconazole 5 SC @ 1.5 ml/L for Tikka and Rust"
      },
      {
        stage: "Physiological Maturity & Harvesting (86-110 days)",
        percent: 23,
        activities: ["Pull out sample plants to inspect inside of shell (dark brown/black lining means mature)", "Harvest by pulling or tractor digger in moist soil", "Windrow and sun-cure pods in field for 3-4 days"],
        irrigation: "Give light irrigation 2-3 days before pulling if soil is hard/dry to prevent pod detachment in soil",
        nutrition: "Nil",
        plantProtection: "Dry pods quickly to <= 8% moisture to prevent Aspergillus flavus (Aflatoxin) fungus"
      }
    ],
    landSoilRequirements: {
      preferredSoils: ["Sandy Loam", "Red Sandy Soils", "Light Loamy Soils with excellent drainage"],
      idealPh: "6.0 - 7.5",
      fieldPreparation: "Plough 15-20 cm deep; avoid excessive pulverization; form Broad Bed and Furrows (BBF: 120 cm bed, 30 cm furrow) for better aeration and drainage."
    },
    irrigationRequirements: {
      totalWaterNeedMm: "450 - 550 mm",
      method: "Sprinkler Irrigation (Highly Recommended) or Furrow Irrigation",
      criticalStages: ["Flowering (30-35 DAS)", "Pegging (45-50 DAS)", "Pod development (65-75 DAS)"],
      intervals: "Irrigate every 10-12 days; keep pegging zone friable."
    },
    fertilizerNutrientRequirements: {
      recommendedNpkKgPerHa: "25:50:50 kg/ha N:P2O5:K2O",
      basalApplication: "Full N, full P (as Single Super Phosphate), and full K at sowing.",
      topDressing: "Gypsum @ 400-500 kg/ha at pegging stage (40-45 DAS) placed 5 cm around plants.",
      micronutrients: "Zinc Sulphate @ 25 kg/ha + Borax @ 10 kg/ha basal for pod filling.",
      organicBiofertilizers: "Rhizobium leguminosarum + PSB seed treatment @ 50g each per kg seed."
    },
    sowingPlantingInfo: {
      sowingWindow: "Kharif: June 15 - July 15; Rabi: October 15 - November 15; Summer: Jan 15 - Feb 15",
      seedRatePerAcre: "45 - 55 kg kernels/acre (Bunch type); 40 - 45 kg/acre (Spreading type)",
      spacing: "30 cm x 10 cm (Bunch type) or 45 cm x 15 cm (Spreading)",
      sowingDepth: "4 - 5 cm in moist soil",
      seedTreatment: "Trichoderma viride @ 4g/kg + Imidacloprid 600 FS @ 2ml/kg + Rhizobium culture"
    },
    weedingRequirements: {
      criticalPeriod: "First 35 days after sowing (Do NOT weed or disturb soil after 45 DAS to protect delicate pegs)",
      herbicideRecommendations: "Pre-emergence: Pendimethalin 30 EC @ 1 L/acre within 2 days of sowing; Post-emergence: Imazethapyr 10 SL @ 300 ml/acre at 20 DAS.",
      manualInterculture: "One hand weeding at 20-25 DAS before flowering."
    },
    pestDiseaseManagement: {
      majorPests: ["White Grub (Holotrichia serrata)", "Spodoptera litura (Tobacco caterpillar)", "Leaf Miner", "Thrips"],
      majorDiseases: ["Early & Late Tikka Leaf Spot (Cercospora)", "Rust", "Collar Rot (Aspergillus niger)", "Aflatoxin"],
      preventiveCulturalPractices: ["Soil application of Phorate 10G or Chlorpyrifos for white grub", "Crop rotation with cereals (Maize/Bajra)", "Dry pods rapidly to prevent Aspergillus mould"]
    },
    weatherClimate: {
      optimumTemperature: "25°C - 30°C for vegetative and flowering; warm sunny weather during ripening",
      rainfall: "500 - 700 mm evenly distributed",
      weatherAlerts: "Waterlogging for > 24 hours causes severe pod rotting; ensure unobstructed surface drainage."
    },
    facilitiesResources: {
      machineryEquipment: ["Tractor with groundnut planter", "Groundnut digger shaker/inverter", "Pod thresher", "Sprinkler irrigation system"],
      irrigationInfrastructure: ["Sprinkler pipes with rotating nozzles to apply uniform mist on pegging zone"],
      storageHandling: ["Raised wooden platforms in godown", "Breathable gunny bags (Do not store in plastic/airtight bags)"]
    },
    harvestingPeriod: {
      maturityIndicators: "Vines begin to yellow and drop lower leaves; inner shell of pods shows dark brown/black reticulation; kernels separate easily from shell.",
      harvestMoisture: "<= 8% moisture in pods for safe commercial storage.",
      postHarvestCare: "Sun-dry harvested pods on threshing floor for 5-7 days; check that rattling sound is heard when shaken."
    }
  },
  "Chili": {
    name: "Chili",
    category: "Spices / Vegetables",
    season: "Kharif/Rabi (Year-round with irrigation)",
    defaultDurationDays: 150,
    durationMinDays: 130,
    durationMaxDays: 180,
    stages: [
      {
        stage: "Nursery & Transplanting (0-40 days)",
        percent: 26,
        activities: ["Raise nursery on raised beds (15 cm high)", "Pro-tray seedling production under shade net", "Transplant 35-40 day seedlings at 60x45 cm spacing"],
        irrigation: "Light irrigation every 2-3 days in nursery; life irrigation immediately upon transplanting",
        nutrition: "Basal: FYM 10 t/ha + 50 kg N + 75 kg P + 50 kg K/ha",
        plantProtection: "Treat nursery with Carbofuran 3G @ 10 g/m2 for cutworms; seed treatment with Trichoderma 4g/kg"
      },
      {
        stage: "Vegetative & Branching (41-75 days)",
        percent: 23,
        activities: ["Primary and secondary branch proliferation", "Install blue and yellow sticky traps for thrips and whitefly", "Manual weeding and earthing up"],
        irrigation: "Irrigate every 6-8 days; avoid water stagnation",
        nutrition: "1st Top dressing: 25 kg N/ha at 30 DAT; foliar spray of 19:19:19 @ 5g/L",
        plantProtection: "Spray Spinosad 45 SC @ 0.3 ml/L for thrips; Diafenthiuron 50 WP @ 1.25 g/L for yellow mites"
      },
      {
        stage: "Flowering & Fruit Set (76-110 days)",
        percent: 23,
        activities: ["Flowering clusters and young green chili setting", "Foliar spray of Planofix (NAA) @ 0.25 ml/L to prevent flower drop", "Stake tall varieties if heavy fruit set"],
        irrigation: "Regular light irrigations; moisture stress causes flower drop",
        nutrition: "2nd Top dressing: 25 kg N + 25 kg K/ha at flowering; spray Boron 0.2% for pollination",
        plantProtection: "Spray Imidacloprid @ 0.3 ml/L for vector-borne Leaf Curl Virus control; spray Mancozeb for anthracnose"
      },
      {
        stage: "Fruiting & Harvesting (111-150 days)",
        percent: 28,
        activities: ["Pick green chilies at 60-70 DAT; allow red ripe chilies to color on vine for dry chili", "Repeat pickings every 10-14 days", "Sun-dry red ripe chilies on clean polythene sheet"],
        irrigation: "Maintain irrigation between picking rounds to sustain continuous flushes",
        nutrition: "Foliar spray of Potassium Schoenite or 00:00:50 @ 5g/L for fruit shine and color",
        plantProtection: "Spray Azoxystrobin 23 SC @ 1 ml/L for Dieback/Anthracnose fruit rot"
      }
    ],
    landSoilRequirements: {
      preferredSoils: ["Well-drained Sandy Loam", "Clay Loam", "Black Loam with good drainage"],
      idealPh: "6.2 - 7.8",
      fieldPreparation: "2-3 deep ploughings followed by rotavator; incorporate 15-20 tonnes FYM/ha; make ridges and furrows at 60 cm spacing."
    },
    irrigationRequirements: {
      totalWaterNeedMm: "600 - 800 mm",
      method: "Drip Irrigation with fertigation (Highly Recommended)",
      criticalStages: ["Transplanting", "Flowering", "Fruit development"],
      intervals: "Irrigate every 5-7 days under furrow; daily or alternate days under drip (2-3 hours/day)."
    },
    fertilizerNutrientRequirements: {
      recommendedNpkKgPerHa: "150:75:75 kg/ha N:P2O5:K2O",
      basalApplication: "50 kg N + 75 kg P + 50 kg K + 25 kg Zinc Sulphate at transplanting.",
      topDressing: "Split remaining 100 kg N + 25 kg K into 4 equal doses at 30, 60, 90, and 120 DAT.",
      micronutrients: "Foliar spray of Micronutrient mixture (Formula 4) @ 2.5 ml/L at flowering.",
      organicBiofertilizers: "Neem cake @ 250 kg/acre at planting to control root nematodes; Pseudomonas fluorescens root dip."
    },
    sowingPlantingInfo: {
      sowingWindow: "Kharif: May-June nursery (July transplant); Rabi: Oct nursery (Nov transplant); Summer: Jan-Feb",
      seedRatePerAcre: "200 - 250 g/acre (Hybrid); 400 - 500 g/acre (OP variety)",
      spacing: "60 cm row x 45 cm plant or paired row 90 x 60 x 45 cm under drip",
      sowingDepth: "0.5 - 1 cm in pro-trays; transplant seedling at nursery root collar depth",
      seedTreatment: "Thiram @ 3g/kg seed + Imidacloprid 70 WS @ 5g/kg"
    },
    weedingRequirements: {
      criticalPeriod: "First 45 days after transplanting",
      herbicideRecommendations: "Pre-emergence: Pendimethalin 30 EC @ 1 L/acre applied before transplanting; Post-emergence: Quizalofop-ethyl 5 EC @ 400 ml/acre for grass weeds.",
      manualInterculture: "Hand weeding at 25 and 50 DAT followed by earthing up."
    },
    pestDiseaseManagement: {
      majorPests: ["Chili Thrips (Scirtothrips dorsalis - upward leaf curling)", "Yellow Mite (Polyphagotarsonemus - downward curling)", "Fruit Borer", "Aphids"],
      majorDiseases: ["Anthracnose / Die-back (Colletotrichum)", "Chili Leaf Curl Virus (transmitted by whitefly)", "Damping off", "Powdery Mildew"],
      preventiveCulturalPractices: ["Install blue sticky traps for thrips @ 20/acre", "Grow 2 rows of Maize or Jowar as border crop to block vector insects", "Spray Copper Oxychloride for fruit rot"]
    },
    weatherClimate: {
      optimumTemperature: "20°C - 30°C; frost-free warm humid climate during growth; dry warm weather during ripening",
      rainfall: "600 - 900 mm well distributed",
      weatherAlerts: "Water stagnation causes sudden wilt and root rot; ensure raised bed drainage during monsoon storms."
    },
    facilitiesResources: {
      machineryEquipment: ["Tractor with raised bed maker", "Battery knapsack or power sprayer", "Plastic picking crates", "Solar tunnel dryer or clean drying sheets"],
      irrigationInfrastructure: ["Drip irrigation system with Venturi fertigation injector"],
      storageHandling: ["Cold storage at 4°C - 7°C for green chilies; dry red chilies stored in clean gunny bags in dry aerated godowns"]
    },
    harvestingPeriod: {
      maturityIndicators: "Green chili: firm, fully grown with pungent smell; Red chili: fully turned deep red on the vine.",
      harvestMoisture: "<= 10% - 12% moisture for dry red chili.",
      postHarvestCare: "Dry red chilies on clean cement drying floor for 8-10 days; turn twice daily; grade by size and color."
    }
  },
  "Tomato": {
    name: "Tomato",
    category: "Vegetables",
    season: "Year-round (Kharif, Rabi, Summer)",
    defaultDurationDays: 115,
    durationMinDays: 95,
    durationMaxDays: 135,
    stages: [
      {
        stage: "Nursery & Transplanting (0-30 days)",
        percent: 26,
        activities: ["Pro-tray nursery under 50% shade net", "Raised bed main field preparation", "Transplant 25-day seedlings with root dip"],
        irrigation: "Light sprinkler in nursery; life irrigation immediately after transplanting",
        nutrition: "Basal: FYM 10 t/acre + N:P:K 40:60:40 kg/acre + 10 kg Zinc Sulphate",
        plantProtection: "Trichoderma viride root dip to prevent damping-off"
      },
      {
        stage: "Vegetative & Staking (31-60 days)",
        percent: 26,
        activities: ["Staking plants with bamboo poles and GI wire for indeterminate hybrids", "Pruning side suckers up to 30 cm height", "Weeding and earthing up"],
        irrigation: "Drip irrigation daily or alternate days (15-20 liters/plant/week)",
        nutrition: "Fertigation: 19:19:19 @ 3 kg/acre twice a week; Calcium Nitrate @ 2 kg/acre",
        plantProtection: "Install yellow sticky traps for whitefly; spray Neem oil 10,000 ppm @ 2 ml/L"
      },
      {
        stage: "Flowering & Fruit Development (61-90 days)",
        percent: 26,
        activities: ["Peak flowering and fruit cluster formation", "Install pheromone traps for Helicoverpa fruit borer @ 15/acre", "Foliar spray of Micronutrients + Boron"],
        irrigation: "Maintain consistent soil moisture; irregular watering causes Blossom End Rot and fruit cracking",
        nutrition: "Fertigation with 13:0:45 (Potassium Nitrate) @ 4 kg/acre + Boron 0.2% foliar",
        plantProtection: "Spray Chlorantraniliprole 18.5 SC (Coragen) @ 0.3 ml/L for fruit borer; Mancozeb @ 2.5g/L for Early Blight"
      },
      {
        stage: "Harvesting & Picking (91-115 days)",
        percent: 22,
        activities: ["Harvest at breaker/turning stage for long-distance transport", "Harvest at pink/red-ripe stage for local market", "Grade into A, B, C categories in plastic crates"],
        irrigation: "Continue light drip irrigation to nourish successive fruit flushes",
        nutrition: "Fertigation with 0:0:50 (Potassium Sulphate) @ 3 kg/acre for fruit firmness",
        plantProtection: "Spray Metalaxyl-Mancozeb @ 2g/L if Late Blight threatens during cloudy rainy spells"
      }
    ],
    landSoilRequirements: {
      preferredSoils: ["Well-drained Sandy Loam", "Rich Loamy Soils", "Clay Loam with high organic matter"],
      idealPh: "6.0 - 7.0",
      fieldPreparation: "2 deep ploughings, rotavator, incorporate FYM 10 t/acre; make raised beds 90 cm wide, 15 cm high with 30 cm furrow."
    },
    irrigationRequirements: {
      totalWaterNeedMm: "500 - 650 mm",
      method: "Drip Irrigation (Essential for commercial hybrids)",
      criticalStages: ["Transplanting", "Flowering", "Fruit set", "Fruit expansion"],
      intervals: "Daily drip irrigation based on crop evapotranspiration."
    },
    fertilizerNutrientRequirements: {
      recommendedNpkKgPerHa: "180:100:150 kg/ha N:P2O5:K2O",
      basalApplication: "40 kg N + 100 kg P + 50 kg K basal per hectare.",
      topDressing: "Remaining 140 kg N + 100 kg K applied through drip fertigation in weekly split doses.",
      micronutrients: "Calcium Nitrate + Boron foliar spray at fruit set to prevent Blossom End Rot.",
      organicBiofertilizers: "FYM @ 25 t/ha; Azospirillum + Phosphobacteria seedling dip."
    },
    sowingPlantingInfo: {
      sowingWindow: "Kharif: June-July; Rabi: Sept-Oct; Summer: Dec-Jan",
      seedRatePerAcre: "50 - 60 g/acre for indeterminate hybrids; 100 - 150 g/acre for OP varieties",
      spacing: "90 cm x 60 cm (Determinate) or 120 cm x 45 cm (Staked Indeterminate)",
      sowingDepth: "0.5 cm in pro-trays; transplant seedling firmly at collar",
      seedTreatment: "Thiram 2g/kg + Imidacloprid 70 WS 3g/kg"
    },
    weedingRequirements: {
      criticalPeriod: "First 30 days after transplanting (Silver-black plastic mulch recommended)",
      herbicideRecommendations: "Pre-emergence: Pendimethalin 30 EC @ 1 L/acre applied before laying mulch.",
      manualInterculture: "Hand weeding around plant holes at 20 and 40 DAT."
    },
    pestDiseaseManagement: {
      majorPests: ["Tomato Fruit Borer (Helicoverpa armigera)", "Whitefly (Vector for ToLCV)", "Leaf Miner (Liriomyza)", "Pinworm (Tuta absoluta)"],
      majorDiseases: ["Tomato Leaf Curl Virus (ToLCV)", "Early Blight (Alternaria)", "Late Blight (Phytophthora infestans)", "Bacterial Wilt"],
      preventiveCulturalPractices: ["Use ToLCV resistant hybrids (Arka Samrat, US-440)", "Staking prevents fruits touching wet soil", "Pheromone traps @ 12/acre for Tuta absoluta and Helicoverpa"]
    },
    weatherClimate: {
      optimumTemperature: "21°C - 26°C daytime; 15°C - 20°C night temperature",
      rainfall: "400 - 600 mm well drained",
      weatherAlerts: "Night temperatures > 27°C or < 12°C cause severe flower drop and poor pollination."
    },
    facilitiesResources: {
      machineryEquipment: ["Tractor with bed maker", "Mulching machine", "Drip irrigation system", "Bamboo stakes and trellising wire", "Stackable plastic crates"],
      irrigationInfrastructure: ["Drip system with inline drippers (16 mm lateral, 40 cm spacing, 2 LPH)"],
      storageHandling: ["Shaded packing shed with grading table", "Cold room storage at 10°C - 12°C for 2-3 weeks shelf life"]
    },
    harvestingPeriod: {
      maturityIndicators: "Breaker stage (10% pinkish blush at blossom end) for distance transport; full red for local processing.",
      harvestMoisture: "Firm fruit texture, glossy skin.",
      postHarvestCare: "Wipe with clean dry cloth, sort out damaged/cracked fruits, pack in ventilated 20 kg plastic crates."
    }
  },
  "Maize": {
    name: "Maize (Corn)",
    category: "Cereals / Coarse Grains",
    season: "Kharif (Jun-Sep) / Rabi (Oct-Feb)",
    defaultDurationDays: 105,
    durationMinDays: 90,
    durationMaxDays: 120,
    stages: [
      {
        stage: "Emergence & Early Vegetative (0-25 days)",
        percent: 24,
        activities: ["Ridges and furrow sowing at 60x20 cm", "Thinning to single seedling per hill at 12 DAS", "Gap filling with pre-germinated seed"],
        irrigation: "Sow in moist seedbed; life irrigation at 5-7 DAS if soil dry",
        nutrition: "Basal: 25% N + 100% P + 50% K + 10 kg Zinc Sulphate/acre",
        plantProtection: "Crucial Fall Armyworm (FAW) monitoring from 7 DAS; seed treatment with Cyantraniliprole (Fortenza Duo)"
      },
      {
        stage: "Knee-High (V6-V8, 26-50 days)",
        percent: 24,
        activities: ["Rapid stem elongation and leaf canopy development", "Mechanical inter-cultivation and earthing-up", "Scout whorls for FAW shot-hole pin holes"],
        irrigation: "Irrigate every 10-12 days; prevent dry spells",
        nutrition: "1st Top dressing: 35% Nitrogen (Urea @ 40 kg/acre) at knee-high stage (30 DAS) followed by earthing up",
        plantProtection: "Apply Emamectin Benzoate 5 SG @ 0.4g/L or Spinetoram 11.7 SC @ 0.5 ml/L into the plant whorl for FAW"
      },
      {
        stage: "Tasseling & Silking (51-75 days)",
        percent: 24,
        activities: ["Tassel emergence (male) and silk emergence (female)", "Critical pollination window", "Avoid any water or heat stress"],
        irrigation: "Most critical irrigation stage; water deficit for 2 days at silking reduces yield by 25-40%",
        nutrition: "2nd Top dressing: 30% Nitrogen + 50% Potash at tasseling stage (50-55 DAS)",
        plantProtection: "Monitor for Turcicum leaf blight; spray Azoxystrobin + Difenoconazole @ 1 ml/L"
      },
      {
        stage: "Grain Filling & Maturity (76-105 days)",
        percent: 28,
        activities: ["Milk stage -> Dough stage -> Dent stage -> Black layer formation", "Cob husks turn dry, papery and pale yellow", "Harvest cobs when black layer appears at grain base"],
        irrigation: "Maintain soil moisture till dough stage; cease watering 10 days before harvest",
        nutrition: "Foliar spray of 1% Zinc EDTA if leaf striping observed",
        plantProtection: "Protect sweet corn / grain cobs from birds and rodents"
      }
    ],
    landSoilRequirements: {
      preferredSoils: ["Deep Well-drained Loam", "Silt Loam", "Alluvial Soils", "Red Sandy Loams"],
      idealPh: "6.0 - 7.5",
      fieldPreparation: "1 deep summer ploughing followed by 2 diskings and planking; make ridges and furrows at 60 cm interval."
    },
    irrigationRequirements: {
      totalWaterNeedMm: "500 - 650 mm",
      method: "Furrow Irrigation or Drip Irrigation",
      criticalStages: ["Knee-high (30 DAS)", "Tasseling (50 DAS)", "Silking (60 DAS)", "Grain dough (80 DAS)"],
      intervals: "Irrigate every 8-12 days in Kharif dry spells; every 12-15 days in Rabi."
    },
    fertilizerNutrientRequirements: {
      recommendedNpkKgPerHa: "150:60:60 kg/ha N:P2O5:K2O (for High-Yielding Hybrids)",
      basalApplication: "Apply 25% N + 100% P + 50% K + Zinc Sulphate 25 kg/ha at sowing.",
      topDressing: "35% N at knee-high (V6 stage), 30% N + 50% K at tasseling (V10 stage), 10% N at grain filling.",
      micronutrients: "Zinc Sulphate 21% @ 25 kg/ha basal (Maize is an indicator crop for Zinc deficiency).",
      organicBiofertilizers: "FYM @ 10 t/ha; Azospirillum + Phosphobacteria seed inoculation."
    },
    sowingPlantingInfo: {
      sowingWindow: "Kharif: June 15 - July 15; Rabi: October 15 - November 15; Spring: Jan 15 - Feb 15",
      seedRatePerAcre: "7 - 8 kg/acre for single cross hybrids; 9 - 10 kg/acre for composite varieties",
      spacing: "60 cm row x 20 cm plant-to-plant",
      sowingDepth: "4 - 5 cm deep in ridge side",
      seedTreatment: "Cyantraniliprole 19.8% + Thiamethoxam 19.8% FS (Fortenza Duo) @ 6 ml/kg seed for Fall Armyworm protection"
    },
    weedingRequirements: {
      criticalPeriod: "First 30 days after sowing",
      herbicideRecommendations: "Pre-emergence: Atrazine 50 WP @ 1 kg/acre applied within 2 days of sowing in moist soil; Post-emergence: Tembotrione 34.4 SC @ 115 ml/acre at 20-25 DAS.",
      manualInterculture: "One hand weeding and inter-cultivation with bullock/tractor cultivator at 25 DAS followed by earthing-up."
    },
    pestDiseaseManagement: {
      majorPests: ["Fall Armyworm (Spodoptera frugiperda)", "Stem Borer (Chilo partellus)", "Pink Borer", "Shoot Fly"],
      majorDiseases: ["Turcicum Leaf Blight (Exserohilum turcicum)", "Maydis Leaf Blight", "Charcoal Rot", "Banded Leaf and Sheath Blight"],
      preventiveCulturalPractices: ["Whorl application of sand + neem seed kernel powder (9:1 ratio)", "Install FAW pheromone traps @ 5/acre", "Deep ploughing to expose pupae to birds and sun"]
    },
    weatherClimate: {
      optimumTemperature: "21°C - 30°C for growth; warm frost-free climate with warm nights",
      rainfall: "600 - 800 mm evenly distributed",
      weatherAlerts: "Waterlogging for even 24-48 hours during early stages causes irreversible stunting; construct drainage furrows."
    },
    facilitiesResources: {
      machineryEquipment: ["Tractor with pneumatic seed planter or ridge seeder", "Cultivator with earthing-up ridger attachments", "High-clearance power sprayer", "Maize dehusker-sheller"],
      irrigationInfrastructure: ["Furrow layout or drip lateral lines (16 mm, 50 cm drippers)"],
      storageHandling: ["Elevated cribs or drying floor", "Gunny bags, moisture meter to verify <= 12% moisture"]
    },
    harvestingPeriod: {
      maturityIndicators: "Cob husk leaves turn straw yellow and paper dry; grains turn hard and glassy; black layer forms at the tip of grain hilum.",
      harvestMoisture: "20% - 22% cob moisture; shell after drying cobs in sun to <= 14% grain moisture.",
      postHarvestCare: "De-husk, dry cobs in sun for 3-5 days, shell using mechanical sheller, winnow, and pack dry grain at <= 12% moisture."
    }
  }
};

// Merge agronomics into existing calendar data and preserve existing months
Object.keys(cropAgronomics).forEach(cropKey => {
  const details = cropAgronomics[cropKey];
  if (!existing[cropKey]) {
    existing[cropKey] = {
      name: details.name,
      season: details.season,
      months: {}
    };
  }
  existing[cropKey].name = details.name;
  existing[cropKey].category = details.category;
  existing[cropKey].season = details.season;
  existing[cropKey].defaultDurationDays = details.defaultDurationDays;
  existing[cropKey].durationMinDays = details.durationMinDays;
  existing[cropKey].durationMaxDays = details.durationMaxDays;
  existing[cropKey].stages = details.stages;
  existing[cropKey].landSoilRequirements = details.landSoilRequirements;
  existing[cropKey].irrigationRequirements = details.irrigationRequirements;
  existing[cropKey].fertilizerNutrientRequirements = details.fertilizerNutrientRequirements;
  existing[cropKey].sowingPlantingInfo = details.sowingPlantingInfo;
  existing[cropKey].weedingRequirements = details.weedingRequirements;
  existing[cropKey].pestDiseaseManagement = details.pestDiseaseManagement;
  existing[cropKey].weatherClimate = details.weatherClimate;
  existing[cropKey].facilitiesResources = details.facilitiesResources;
  existing[cropKey].harvestingPeriod = details.harvestingPeriod;
});

fs.writeFileSync(targetFile, JSON.stringify(existing, null, 2), 'utf8');
console.log('Successfully enriched cropCalendar.json with full agronomic specifications!');
