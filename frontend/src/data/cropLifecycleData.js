/**
 * Comprehensive Crop Agronomy, Day-Wise Cultivation Lifecycle & Pesticide Protocols
 * Aligned with ICAR (Indian Council of Agricultural Research) & CIBRC (Central Insecticides Board)
 */

export const CROP_DATABASE = {
  cotton: {
    id: "cotton",
    name: "Bt Hybrid Cotton (Kapas)",
    scientificName: "Gossypium hirsutum",
    icon: "🌿",
    category: "commercial",
    season: "Kharif (June – December)",
    durationDays: 155,
    currentDaySample: 45,
    currentStageKey: "branching",
    soilPreference: "Deep Black Cotton Soil (Regur) or Well-Drained Sandy Loam",
    phRange: "6.5 – 7.8",
    targetYield: "18 – 24 Quintals / Acre",
    mspValue: "₹7,521 / Quintal (Medium Staple)",
    waterRequirement: "550 – 700 mm (Critical at Flowering & Boll Dev)",
    recommendedSpacing: "90 cm × 60 cm (Light Soils) or 120 cm × 45 cm (Black Soil)",
    totalFertilizerDose: "120 kg N : 60 kg P₂O₅ : 60 kg K₂O per Hectare",

    // ── DAY-WISE CULTIVATION LIFECYCLE ──────────────────────────────────────
    lifecyclePlan: [
      {
        phaseId: "prep",
        dayRange: "Day -7 to Day 0",
        stageName: "Pre-Sowing Field Preparation & Basal Nutrition",
        badge: "Soil Foundation",
        tasks: [
          "Deep summer ploughing (25–30 cm) with MB plough to expose soil pests and weed roots to solar heat.",
          "Incorporate 4–5 tons of well-rotted Farm Yard Manure (FYM) or compost per acre at final discing.",
          "Apply Basal Fertilizer: 100% of Phosphorus (DAP 50 kg/acre) + 50% Potash (MOP 25 kg/acre) + 20% Nitrogen (Urea 15 kg).",
          "Seed Inoculation: Treat hybrid seeds with Azotobacter & PSB bio-fertilizer slurry (10 g/kg seed)."
        ],
        irrigationAdvice: "Pre-sowing soaking irrigation (Rouni) to achieve field capacity moisture for uniform germination.",
        keyTip: "Ensure ridges and furrows are spaced at 90 cm to prevent monsoon water stagnation."
      },
      {
        phaseId: "germination",
        dayRange: "Day 1 to Day 15",
        stageName: "Germination & Seedling Establishment",
        badge: "Early Stand",
        tasks: [
          "Check germination rate on Day 6–8. Seedlings should emerge within 5–7 days.",
          "Gap Filling (Dibbling): Carry out gap filling on Day 8–10 using spare soaked seeds to ensure 100% plant population.",
          "Pre-emergence Weed Control: Spray Pendimethalin 30% EC within 48 hours of sowing if weeds threaten germination.",
          "Inspect for damping-off or wireworm attack at soil line."
        ],
        irrigationAdvice: "Maintain light furrow moisture; never flood young seedlings.",
        keyTip: "Healthy crop stand target is 7,400 plants/acre for hybrid cotton."
      },
      {
        phaseId: "vegetative",
        dayRange: "Day 16 to Day 35",
        stageName: "Vegetative Growth & First Top-Dressing",
        badge: "Root & Foliage",
        tasks: [
          "Thinning: Retain one vigorous seedling per hill at 15–20 DAS.",
          "First Hand Weeding / Inter-Cultivation: Run bullock/tractor blade harrow between rows to aerate soil.",
          "First Nitrogen Top-Dressing: Apply 35 kg Urea per acre 5–7 cm away from root zone followed by light irrigation.",
          "Scout for sucking pests: Install 5 Yellow Sticky Traps per acre to monitor whiteflies and aphids."
        ],
        irrigationAdvice: "Irrigate every 10–12 days depending on monsoon rain intervals.",
        keyTip: "Avoid applying nitrogen right against plant collars to prevent chemical fertilizer burn."
      },
      {
        phaseId: "branching",
        dayRange: "Day 36 to Day 55",
        stageName: "Squaring & Sympodial Branching (CURRENT ACTIVE STAGE)",
        badge: "Active Growth",
        tasks: [
          "Terminal Nipping: Nip terminal apical bud at 45–50 days if vegetative growth exceeds 1 meter to force heavy lateral fruit-bearing branches.",
          "Foliar Micronutrient Nutrition: Spray 1% Formula-4 (Zinc, Boron, Ferrous, Magnesium) + 1% Urea to boost square retention.",
          "Install Pheromone Traps: Set up 5 Gossyplure pheromone traps per acre at crop canopy height for Pink Bollworm surveillance.",
          "Second Nitrogen Split: Top dress 30 kg Urea per acre at square initiation."
        ],
        irrigationAdvice: "Critical stage: Maintain steady moisture in furrows. Water stress causes square dropping.",
        keyTip: "If more than 8 moths/trap/night are trapped for 3 consecutive days, ETL is breached."
      },
      {
        phaseId: "flowering",
        dayRange: "Day 56 to Day 85",
        stageName: "Peak Flowering & Young Boll Formation",
        badge: "Yield Deciding",
        tasks: [
          "Daily Scout for Rosette Flowers: Rosette (twist-petaled) flowers indicate Pink Bollworm entry; hand-pick and destroy immediately.",
          "Foliar Spray to Stop Boll Drop: Spray 2% DAP solution (4 kg DAP in 200L water) or Potassium Nitrate (13-0-45) @ 10 g/liter.",
          "Apply remaining 50% Potash (MOP 25 kg/acre) + 20 kg Urea.",
          "Monitor for Grey Mildew / Cercospora fungal leaf spots during cloudy, high-humidity weather."
        ],
        irrigationAdvice: "Peak transpiration window: Irrigate every 7–9 days. Never allow deep cracking of black soil.",
        keyTip: "Morning sprays between 7:00 AM and 10:30 AM yield maximum foliar stomatal absorption."
      },
      {
        phaseId: "boll_dev",
        dayRange: "Day 86 to Day 120",
        stageName: "Boll Maturation & Fiber Elongation",
        badge: "Lint Filling",
        tasks: [
          "Spray Sulphate of Potash (0-0-50) @ 10 g/liter at 90 DAS to maximize seed weight and micronaire fiber strength.",
          "Maintain strict insecticide rotation; avoid applying pyrethroids consecutively to prevent pest resurgence.",
          "Keep furrows clean and weed-free for effortless manual picking."
        ],
        irrigationAdvice: "Reduce irrigation frequency to prevent excessive late vegetative flush (rank growth).",
        keyTip: "Rank vegetative growth steals nutrients away from maturing bolls."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 121 to Day 155",
        stageName: "Defoliation & Selective Cotton Picking",
        badge: "Harvest & Sale",
        tasks: [
          "Stop irrigation completely 12–15 days prior to picking to encourage uniform boll opening.",
          "First Picking: Pick clean, fully burst fluffy cotton bolls in bright sunny morning after dew dries.",
          "Store harvested seed cotton (Kapas) in dry jute bags; avoid plastic bags to prevent yellow fiber staining.",
          "Stalk Destruction: Shred cotton stalks immediately after final picking with tractor shredder to break Pink Bollworm overwintering cycle."
        ],
        irrigationAdvice: "Zero irrigation during boll bursting window.",
        keyTip: "Ensure seed cotton moisture is below 8% before bagging to get top grade at CCI / Mandi."
      }
    ],

    // ── COMPLETE PESTICIDES & CROP PROTECTION PROTOCOL ───────────────────────
    pesticideProtocols: [
      {
        id: "pest_pbw",
        targetCategory: "Insect Pest",
        targetName: "Pink Bollworm (Pectinophora gossypiella)",
        severity: "Critical Threat",
        symptoms: "Rosette flowers, boreholes plugged with excreta in young bolls, internal locule damage and stained lint.",
        chemicalSolution: "Chlorantraniliprole 18.5% SC @ 0.4 ml/L (60 ml/acre) OR Emamectin Benzoate 5% SG @ 0.5 g/L (100 g/acre)",
        timing: "Apply at 45–60 DAS when pheromone trap catch exceeds ETL (8 moths/trap/night) or 10% rosette flowers.",
        waitingPeriodDays: 14,
        organicAlternative: "Release Trichogramma bactrae egg parasitoid @ 60,000/acre at weekly intervals + Spray 5% NSKE (Neem Seed Kernel Extract)",
        safetyPrecaution: "Rotate chemical groups (Diamides to Avermectins). Wear rubber gloves and face mask."
      },
      {
        id: "pest_sucking",
        targetCategory: "Insect Pest",
        targetName: "Sucking Pest Complex (Thrips, Aphids, Whiteflies, Jassids)",
        severity: "High Hazard",
        symptoms: "Cupping of young leaves, yellow margins, sooty mold honeydew on foliage, stunted vegetative growth.",
        chemicalSolution: "Diafenthiuron 50% WP @ 1.25 g/L (250 g/acre) OR Acetamiprid 20% SP @ 0.3 g/L (50 g/acre) OR Flonicamid 50% WG @ 0.3 g/L",
        timing: "Spray early in the morning when nymph population exceeds ETL (5–10 nymphs/leaf).",
        waitingPeriodDays: 15,
        organicAlternative: "Spray Azadirachtin 10,000 ppm @ 2 ml/liter + Install 15 Yellow Sticky Traps per acre.",
        safetyPrecaution: "Spray the undersides of leaves where nymphs colony feeds."
      },
      {
        id: "dis_grey_mildew",
        targetCategory: "Fungal Disease",
        targetName: "Grey Mildew (Dahiya) & Cercospora Leaf Spot",
        severity: "Moderate",
        symptoms: "Angular pale translucent spots on lower leaves turning into white powdery fungal growth on underside.",
        chemicalSolution: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1.0 ml/L (200 ml/acre) OR Carbendazim 50% WP @ 1.0 g/L",
        timing: "Apply at first sign of lower leaf speckling, especially during continuous overcast rainy days.",
        waitingPeriodDays: 12,
        organicAlternative: "Spray Pseudomonas fluorescens (1% WP) @ 5 g/liter in the evening.",
        safetyPrecaution: "Ensure full canopy coverage including lower shaded leaves."
      },
      {
        id: "dis_boll_rot",
        targetCategory: "Fungal / Bacterial",
        targetName: "Boll Rot Complex (Internal & External)",
        severity: "High Hazard",
        symptoms: "Water-soaked lesions on green bolls, turning brown to black, rotting lint inside unopened bolls.",
        chemicalSolution: "Copper Oxychloride 50% WP @ 2.5 g/L (500 g/acre) + Streptocycline (plant antibiotic) @ 1 g per 10 Liters water",
        timing: "Spray immediately after heavy unseasonal monsoon downpours during boll development.",
        waitingPeriodDays: 10,
        organicAlternative: "Improve air circulation by nipping bottom vegetative leaves (desuckering).",
        safetyPrecaution: "Do not mix Streptocycline with acidic chemical fertilizers."
      },
      {
        id: "weed_complex",
        targetCategory: "Weed Control",
        targetName: "Grasses & Broadleaf Weed Complex",
        severity: "Yield Reducer",
        symptoms: "Weeds compete for soil nitrogen, water, and sunlight, reducing cotton yields by up to 35%.",
        chemicalSolution: "Quizalofop-ethyl 5% EC @ 2 ml/L (for grasses) OR Pyrithiobac Sodium 10% EC @ 1.5 ml/L (for broadleaf weeds)",
        timing: "Apply at 20–25 DAS when weeds are in 2–4 leaf stage and soil has adequate moisture.",
        waitingPeriodDays: 30,
        organicAlternative: "Inter-row tractor cultivator blade run + manual hand weeding at 20 and 40 DAS.",
        safetyPrecaution: "Use flood-jet flat fan nozzle with spray hood; avoid drift onto cotton terminals."
      }
    ]
  },

  paddy: {
    id: "paddy",
    name: "Paddy / Rice (Dhan)",
    scientificName: "Oryza sativa",
    icon: "🌾",
    category: "cereals",
    season: "Kharif & Rabi",
    durationDays: 135,
    currentDaySample: 38,
    currentStageKey: "tillering",
    soilPreference: "Clay Loam to Heavy Clay Soils with Low Water Percolation",
    phRange: "5.5 – 7.2",
    targetYield: "26 – 32 Quintals / Acre",
    mspValue: "₹2,320 / Quintal (Grade A)",
    waterRequirement: "1,100 – 1,350 mm (Requires 2–3 cm standing water)",
    recommendedSpacing: "20 cm × 15 cm (Normal) or 25 cm × 25 cm (SRI System)",
    totalFertilizerDose: "100 kg N : 50 kg P₂O₅ : 50 kg K₂O per Hectare",

    lifecyclePlan: [
      {
        phaseId: "nursery",
        dayRange: "Day 1 to Day 20",
        stageName: "Nursery Raising & Seed Priming",
        badge: "Seedling Phase",
        tasks: [
          "Salt Water Seed Selection: Dip seeds in 10% brine solution; discard floating light chaffy seeds.",
          "Seed Treatment: Soak selected seeds in Carbendazim 2g/kg seed + Streptocycline 0.1g/kg for 24 hours.",
          "Prepare raised nursery beds (1 meter wide); sow pre-sprouted seeds uniformly.",
          "Apply Zinc Sulphate (21%) @ 2 kg/100 sq. meter in nursery bed to prevent seedling Khaira disease."
        ],
        irrigationAdvice: "Maintain shallow 1 cm water layer in nursery ditches.",
        keyTip: "Transplant healthy young seedlings at 18–22 days (4-leaf stage); never use old 35-day seedlings."
      },
      {
        phaseId: "transplant",
        dayRange: "Day 21 to Day 30",
        stageName: "Puddling, Leveling & Main Field Transplanting",
        badge: "Field Setup",
        tasks: [
          "Puddle field twice with rotavator and plank to form an impermeable hard pan that retains water.",
          "Apply Basal Fertilizer: 100% Phosphorus (DAP 50 kg/acre) + 50% Potash (MOP 25 kg/acre) + Zinc Sulphate (21%) @ 15 kg/acre.",
          "Transplant 2–3 seedlings per hill at shallow 2–3 cm depth.",
          "Spray Pre-emergence Herbicide: Pretilachlor 50% EC @ 500 ml/acre within 3 days of transplanting in standing water."
        ],
        irrigationAdvice: "Keep 2 cm water layer for 7 days post-transplanting to assist root anchoring.",
        keyTip: "Never apply Zinc Sulphate mixed directly with DAP, as insoluble zinc phosphate forms."
      },
      {
        phaseId: "tillering",
        dayRange: "Day 31 to Day 55",
        stageName: "Active Tillering & First Nitrogen Split (CURRENT ACTIVE STAGE)",
        badge: "Tillering",
        tasks: [
          "Apply First Nitrogen Top-Dressing: 35 kg Neem Coated Urea per acre at 25–30 days after transplanting.",
          "Run cono-weeder or rotary weeder between rows to aerate root zone and incorporate green weed biomass.",
          "Scout for Yellow Stem Borer: Look for 'dead hearts' in central tillers and deploy 4 pheromone traps/acre.",
          "Practice Alternate Wetting & Drying (AWD): Allow water to drain naturally until fine hair cracks appear, then re-flood."
        ],
        irrigationAdvice: "Alternate Wetting and Drying (AWD) saves 30% water and strengthens deep roots.",
        keyTip: "Each healthy paddy hill should develop 25–35 productive tillers."
      },
      {
        phaseId: "panicle",
        dayRange: "Day 56 to Day 80",
        stageName: "Panicle Initiation & Second Top-Dressing",
        badge: "Flower Initiation",
        tasks: [
          "Apply Second Nitrogen Split: 30 kg Urea + remaining 25 kg Muriate of Potash (MOP) at panicle initiation stage.",
          "Monitor for Rice Blast (spindle-shaped lesions) and Sheath Blight (snake-skin spots on waterline).",
          "Ensure continuous shallow water (3–5 cm) during these 10 critical panicle initiation days."
        ],
        irrigationAdvice: "CRITICAL: Moisture stress at panicle stage causes empty grains (chaffy panicles).",
        keyTip: "Potassium applied at this stage thickens cell walls and prevents plant lodging during winds."
      },
      {
        phaseId: "heading",
        dayRange: "Day 81 to Day 105",
        stageName: "Heading, Flowering & Milk Stage",
        badge: "Grain Filling",
        tasks: [
          "Foliar Nutrition: Spray 1% Potassium Nitrate (13-0-45) @ 10 g/liter to ensure complete panicle exertion.",
          "Check for Brown Plant Hopper (BPH) at base of stems near water level; look for 'hopper burn'.",
          "Form alleyways (1 foot gap every 2 meters) to allow sunlight and breeze to penetrate crop canopy."
        ],
        irrigationAdvice: "Maintain 2–3 cm water depth until dough stage is reached.",
        keyTip: "Never spray insecticides during peak morning pollination hours (9:00 AM – 11:30 AM)."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 106 to Day 135",
        stageName: "Dough Stage, Maturation & Harvesting",
        badge: "Harvest",
        tasks: [
          "Drain all standing water from the field completely 10–12 days prior to expected harvest.",
          "Harvest when 85% of panicles turn golden yellow and grain moisture drops to 18–20%.",
          "Thresh promptly and sun-dry paddy grains on clean tarpaulin to 12–13% moisture for safe storage."
        ],
        irrigationAdvice: "Field must be dry for combine harvester movement.",
        keyTip: "Delayed harvesting leads to heavy grain shattering losses and grain breakage during milling."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_stem_borer",
        targetCategory: "Insect Pest",
        targetName: "Yellow Stem Borer (Scirpophaga incertulas)",
        severity: "Critical Threat",
        symptoms: "Dead hearts at vegetative stage (central leaf dries and pulls out easily); White ears at flowering (empty white panicles).",
        chemicalSolution: "Chlorantraniliprole 0.4% G (Ferterra) @ 4 kg/acre broadcast OR Cartap Hydrochloride 50% SP @ 2 g/L (400 g/acre)",
        timing: "Broadcast granules at 25–30 DAS in standing water (2 cm) OR spray Cartap at first dead heart symptom.",
        waitingPeriodDays: 21,
        organicAlternative: "Install 5 pheromone traps per acre + Release Trichogramma japonicum egg cards @ 40,000/acre.",
        safetyPrecaution: "Do not drain water for 48 hours after broadcasting granular insecticides."
      },
      {
        id: "pest_bph",
        targetCategory: "Insect Pest",
        targetName: "Brown Plant Hopper (BPH - Nilaparvata lugens)",
        severity: "Catastrophic Hazard",
        symptoms: "Circular patches of dried, burnt-looking plants ('hopper burn') caused by thousands of nymphs sucking stem sap.",
        chemicalSolution: "Triflumuron + Pymetrozine 50% WG @ 120 g/acre OR Dinotefuran 20% SG @ 80 g/acre OR Pymetrozine 50% WDG @ 120 g/acre",
        timing: "Direct nozzle spray strictly to the base of the plant hill when count exceeds 10–15 hoppers per hill.",
        waitingPeriodDays: 14,
        organicAlternative: "Drain field water completely for 3 days to deprive hoppers of humidity + spray neem oil 10,000 ppm @ 2 ml/L.",
        safetyPrecaution: "Avoid synthetic pyrethroid sprays (Cypermethrin), as they trigger massive BPH pest resurgence."
      },
      {
        id: "dis_blast",
        targetCategory: "Fungal Disease",
        targetName: "Rice Blast (Leaf & Neck Blast - Magnaporthe oryzae)",
        severity: "High Hazard",
        symptoms: "Diamond / eye-shaped spots with grey centers on leaves; black necrotic lesions at panicle neck causing neck rot.",
        chemicalSolution: "Tricyclazole 75% WP @ 0.6 g/L (120 g/acre) OR Isoprothiolane 40% EC @ 1.5 ml/L (300 ml/acre)",
        timing: "Spray preventively at early leaf spot initiation and again at 5% panicle emergence stage.",
        waitingPeriodDays: 14,
        organicAlternative: "Seed treatment with Pseudomonas fluorescens (10 g/kg seed) + foliar spray @ 5 g/L.",
        safetyPrecaution: "Avoid heavy nitrogen doses in blast-prone fields; nitrogen softens leaf cuticle."
      },
      {
        id: "dis_sheath_blight",
        targetCategory: "Fungal Disease",
        targetName: "Sheath Blight (Rhizoctonia solani)",
        severity: "Moderate to High",
        symptoms: "Oval, grey-green water-soaked lesions with dark brown margins on leaf sheaths near waterline.",
        chemicalSolution: "Hexaconazole 5% SC @ 2 ml/L (400 ml/acre) OR Validamycin 3% L @ 2.5 ml/L (500 ml/acre)",
        timing: "Apply at maximum tillering to heading stage when snake-skin lesions climb up the stem.",
        waitingPeriodDays: 15,
        organicAlternative: "Apply Trichoderma viride enriched FYM (2 kg Trichoderma in 100 kg FYM) at transplanting.",
        safetyPrecaution: "Ensure spray reaches the lower sheaths near the water level."
      }
    ]
  },

  maize: {
    id: "maize",
    name: "Maize (Makka / Corn)",
    scientificName: "Zea mays",
    icon: "🌽",
    category: "cereals",
    season: "Kharif, Rabi & Spring",
    durationDays: 110,
    currentDaySample: 32,
    currentStageKey: "knee_high",
    soilPreference: "Well-Drained Loam to Silt Loam Soil Rich in Organic Carbon",
    phRange: "6.0 – 7.2",
    targetYield: "30 – 38 Quintals / Acre",
    mspValue: "₹2,225 / Quintal",
    waterRequirement: "500 – 600 mm (Critical at Tasseling & Silking)",
    recommendedSpacing: "60 cm × 20 cm",
    totalFertilizerDose: "120 kg N : 60 kg P₂O₅ : 40 kg K₂O per Hectare",

    lifecyclePlan: [
      {
        phaseId: "sowing",
        dayRange: "Day 0 to Day 10",
        stageName: "Sowing & Basal Dosing",
        badge: "Germination",
        tasks: [
          "Sow hybrid seeds at 4–5 cm depth on ridges with 60 cm row-to-row spacing.",
          "Seed Treatment: Treat seeds with Thiamethoxam 30% FS @ 4 ml/kg seed for early shoot fly protection.",
          "Basal Fertilizer: Apply 100% Phosphorus (DAP 50 kg/acre) + 50% Potash (MOP 20 kg/acre) + 20% Urea (15 kg).",
          "Pre-emergence herbicide: Spray Atrazine 50% WP @ 500 g/acre within 48 hours."
        ],
        irrigationAdvice: "Give light irrigation immediately after dibbling seeds on ridges.",
        keyTip: "Do not bury seeds deeper than 5 cm; deep placement delays emergence."
      },
      {
        phaseId: "knee_high",
        dayRange: "Day 11 to Day 35",
        stageName: "Knee-High Stage & First Whorl Application (CURRENT ACTIVE STAGE)",
        badge: "Vegetative",
        tasks: [
          "Scout for Fall Armyworm (FAW): Look for window-paning on leaves and saw-dust frass inside the central whorl.",
          "First Top-Dressing: Apply 35 kg Urea per acre 10 cm away from plant rows.",
          "Earthing Up: Ridge soil up against the plant base at 30 DAS to support anchor brace roots and prevent lodging."
        ],
        irrigationAdvice: "Irrigate every 10–12 days; maize is extremely sensitive to water stagnation.",
        keyTip: "Never allow water to pool in maize fields for more than 12 hours; make drainage cuts."
      },
      {
        phaseId: "tasseling",
        dayRange: "Day 36 to Day 65",
        stageName: "Tasseling & Silking Stage",
        badge: "Pollination",
        tasks: [
          "Second Top-Dressing: Apply 30 kg Urea per acre just prior to tassel emergence.",
          "Spray Zinc Sulphate (0.5%) + Boron (0.2%) to maximize pollen viability and grain setting on cobs.",
          "Critical Water Stage: Ensure field has adequate moisture throughout the 15-day silking window."
        ],
        irrigationAdvice: "CRITICAL: Moisture stress at silking leads to poor grain filling and barren cobs.",
        keyTip: "Hot winds (>38°C) during tasseling desiccate pollen; a light sprinkler run cools the microclimate."
      },
      {
        phaseId: "grain_filling",
        dayRange: "Day 66 to Day 90",
        stageName: "Milk to Dough Stage (Cob Grain Filling)",
        badge: "Yield Formation",
        tasks: [
          "Foliar Spray: 1% Potash (0-0-50) @ 10 g/L to boost kernel size and starch density.",
          "Check for Turcicum leaf blight (long spindle lesions) during humid conditions.",
          "Protect borders against stray cattle and wild boar."
        ],
        irrigationAdvice: "Maintain moist soil until kernels develop black layer at the base.",
        keyTip: "Kernels enter dough stage; starch solidifies inside cobs."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 91 to Day 110",
        stageName: "Physiological Maturity & Cob Harvesting",
        badge: "Harvest",
        tasks: [
          "Check for maturity: Husk turns papery white and black abscission layer forms at kernel tip.",
          "Harvest cobs, de-husk, and sun-dry cobs for 3–4 days before mechanical shelling.",
          "Store shelled grain at below 12% moisture to prevent aflatoxin contamination."
        ],
        irrigationAdvice: "Stop watering 15 days before harvest.",
        keyTip: "Chop remaining green maize stalks with chaff cutter for high-energy cattle silage."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_faw",
        targetCategory: "Insect Pest",
        targetName: "Fall Armyworm (FAW - Spodoptera frugiperda)",
        severity: "Critical Threat",
        symptoms: "Elongated papery windows on leaves, heavy saw-dust-like fecal frass inside the central whorl, bored cobs.",
        chemicalSolution: "Chlorantraniliprole 18.5% SC @ 0.4 ml/L (80 ml/acre) OR Spinetoram 11.7% SC @ 0.5 ml/L (100 ml/acre)",
        timing: "Direct nozzle spray straight down into the central plant whorl early morning or late evening.",
        waitingPeriodDays: 14,
        organicAlternative: "Drop fine sand mixed with wood ash (9:1 ratio) directly into the whorl OR spray Metarhizium anisopliae @ 5 g/L.",
        safetyPrecaution: "Do not use standard flat-fan spray; knapsack spray must be directed into whorl cavity."
      },
      {
        id: "dis_turcicum",
        targetCategory: "Fungal Disease",
        targetName: "Turcicum Leaf Blight (Exserohilum turcicum)",
        severity: "Moderate to High",
        symptoms: "Long, elliptical grayish-green or tan lesions on lower leaves progressing upward.",
        chemicalSolution: "Mancozeb 75% WP @ 2.5 g/L (500 g/acre) OR Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L",
        timing: "Apply at first appearance of cigar-shaped lesions on lower leaves.",
        waitingPeriodDays: 15,
        organicAlternative: "Spray Trichoderma viride @ 5 g/L + foliar cow urine extract (5%).",
        safetyPrecaution: "Spray both upper and lower leaf surfaces thoroughly."
      }
    ]
  },

  tomato: {
    id: "tomato",
    name: "Tomato (Tamatar)",
    scientificName: "Solanum lycopersicum",
    icon: "🍅",
    category: "vegetables",
    season: "Year-Round (Kharif / Rabi / Summer)",
    durationDays: 125,
    currentDaySample: 40,
    currentStageKey: "flowering",
    soilPreference: "Deep Well-Drained Sandy Loam to Clay Loam with Rich Humus",
    phRange: "6.0 – 7.0",
    targetYield: "20 – 30 Tons / Acre",
    mspValue: "Market Determined (₹1,500 – ₹3,500 / Quintal)",
    waterRequirement: "400 – 600 mm (Drip Irrigation Recommended)",
    recommendedSpacing: "90 cm × 60 cm (Staked)",
    totalFertilizerDose: "150 kg N : 100 kg P₂O₅ : 120 kg K₂O per Hectare",

    lifecyclePlan: [
      {
        phaseId: "nursery",
        dayRange: "Day 0 to Day 25",
        stageName: "Pro-Tray Nursery & Hardening",
        badge: "Nursery",
        tasks: [
          "Raise hybrid seeds in 98-cavity pro-trays using sterilized coco-peat + vermicompost (3:1).",
          "Drench seedlings with Trichoderma viride (5g/L) to prevent damping-off disease.",
          "Install insect-proof nylon net (40 mesh) over nursery to keep virus-transmitting whiteflies out."
        ],
        irrigationAdvice: "Fine rose-can misting twice daily.",
        keyTip: "Harden seedlings 3 days prior to transplanting by reducing watering."
      },
      {
        phaseId: "transplant",
        dayRange: "Day 26 to Day 35",
        stageName: "Bed Preparation, Mulching & Transplanting",
        badge: "Transplant",
        tasks: [
          "Prepare raised beds (90 cm width, 30 cm height) with inline drip laterals.",
          "Lay 25-micron silver-black plastic mulch film to stop weeds and conserve 40% water.",
          "Dip seedling roots in Imidacloprid (0.5 ml/L) for 15 minutes before transplanting.",
          "Transplant in zigzag rows at 60 cm plant-to-plant spacing in evening."
        ],
        irrigationAdvice: "Run drip for 45 minutes immediately after planting.",
        keyTip: "Mulch film keeps root zones 4°C cooler in summer and stops fruit contact with soil."
      },
      {
        phaseId: "staking",
        dayRange: "Day 36 to Day 55",
        stageName: "Staking, Trellising & Early Flowering (CURRENT ACTIVE STAGE)",
        badge: "Vigor",
        tasks: [
          "Install bamboo poles and GI wire trellis (trellising / staking) to support indeterminate heavy fruit loads.",
          "Pruning: Remove lower suckers (side shoots) up to 20 cm from ground to promote vertical single-stem growth.",
          "Fertigation: Inject 19-19-19 water soluble fertilizer @ 3 kg/acre via venturi drip system twice weekly.",
          "Hang 15 Yellow & 10 Blue Sticky Traps per acre."
        ],
        irrigationAdvice: "Daily drip watering of 3–4 liters per plant depending on temperature.",
        keyTip: "Unstaked tomatoes rot on wet soil and suffer 40% fruit borer losses."
      },
      {
        phaseId: "fruiting",
        dayRange: "Day 56 to Day 85",
        stageName: "Fruit Setting & Berry Sizing",
        badge: "Fruiting",
        tasks: [
          "Fertigation: Switch to Calcium Nitrate @ 2.5 kg/acre + Boron @ 250 g/acre to prevent Blossom End Rot (black fruit bottom).",
          "Spray 0-52-34 (Monopotassium Phosphate) @ 5 g/L to stimulate massive flower clusters.",
          "Scout for Tomato Fruit Borer (Helicoverpa) and Pinworm (Tuta absoluta)."
        ],
        irrigationAdvice: "Keep moisture consistent. Irregular watering causes fruit skin cracking.",
        keyTip: "Calcium deficiency causes black sunken bottoms on green tomatoes."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 86 to Day 125",
        stageName: "Harvesting & Grading",
        badge: "Harvest",
        tasks: [
          "Harvest at 'Breaker' stage (pink tinge on bottom) for distant markets, or full red for local mandis.",
          "Pick fruits with calyx intact every 3–4 days in early morning.",
          "Grade into Grade A (firm, spotless) and Grade B in plastic crates."
        ],
        irrigationAdvice: "Give light drip irrigation after each picking flush.",
        keyTip: "Never pack tomatoes in rough gunny sacks; use well-ventilated plastic crates."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_fruit_borer",
        targetCategory: "Insect Pest",
        targetName: "Tomato Fruit Borer (Helicoverpa armigera) & Pinworm (Tuta absoluta)",
        severity: "Critical Threat",
        symptoms: "Circular boreholes on green and ripe fruits, pinhole leaf mines, fruit rot.",
        chemicalSolution: "Flubendiamide 39.35% SC @ 0.3 ml/L (60 ml/acre) OR Emamectin Benzoate 5% SG @ 0.5 g/L (100 g/acre)",
        timing: "Spray at early fruit set when small holes or eggs are observed.",
        waitingPeriodDays: 5,
        organicAlternative: "Plant African Marigold as trap crop (1 row every 16 tomato rows) + Spray NPV virus @ 250 LE/acre.",
        safetyPrecaution: "Strictly observe 5-day pre-harvest interval before picking fruits for market."
      },
      {
        id: "dis_early_late_blight",
        targetCategory: "Fungal Disease",
        targetName: "Early Blight (Alternaria) & Late Blight (Phytophthora)",
        severity: "Catastrophic Hazard",
        symptoms: "Concentric target-board rings on leaves; water-soaked greasy brown lesions on stems and green fruit.",
        chemicalSolution: "Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L OR Metalaxyl 8% + Mancozeb 64% WP @ 2 g/L (400 g/acre)",
        timing: "Apply preventively when cloudy, cool, foggy weather persists with high relative humidity.",
        waitingPeriodDays: 7,
        organicAlternative: "Copper Hydroxide 53.8% DF @ 2 g/L + Cow urine (5%) foliar spray.",
        safetyPrecaution: "Spray immediately after rains; do not delay once late blight lesions appear."
      },
      {
        id: "dis_leaf_curl",
        targetCategory: "Viral Disease",
        targetName: "Tomato Leaf Curl Virus (ToLCV) & Whitefly Vector",
        severity: "Yield Destroyer",
        symptoms: "Severe upward leaf curling, thickening, puckering, stunting, complete cessation of fruit setting.",
        chemicalSolution: "Control Vector Whitefly: Diafenthiuron 50% WP @ 1.25 g/L OR Cyantraniliprole 10.26% OD @ 1.8 ml/L",
        timing: "Spray whitefly vectors from 15 DAS onwards to prevent virus inoculation.",
        waitingPeriodDays: 7,
        organicAlternative: "Uproot and bury virus-infected stunted plants immediately; spray 10,000 ppm neem oil @ 2 ml/L.",
        safetyPrecaution: "Once a plant contracts the virus, it cannot be cured chemically; vector control is mandatory."
      }
    ]
  },

  chilli: {
    id: "chilli",
    name: "Chilli (Mirchi)",
    scientificName: "Capsicum annuum",
    icon: "🌶️",
    category: "vegetables",
    season: "Kharif & Rabi",
    durationDays: 160,
    currentDaySample: 48,
    currentStageKey: "flowering",
    soilPreference: "Well-Drained Black Soils or Rich Sandy Loam with Neutral pH",
    phRange: "6.5 – 7.5",
    targetYield: "20 – 25 Quintals / Acre (Dry Chilli)",
    mspValue: "Market Price (₹14,000 – ₹22,000 / Quintal Dry)",
    waterRequirement: "500 – 650 mm (Drip with fertigation)",
    recommendedSpacing: "75 cm × 45 cm",
    totalFertilizerDose: "120 kg N : 60 kg P₂O₅ : 80 kg K₂O per Hectare",

    lifecyclePlan: [
      {
        phaseId: "nursery",
        dayRange: "Day 0 to Day 30",
        stageName: "Protected Nursery & Seedling Care",
        badge: "Nursery",
        tasks: [
          "Raise in 98-hole pro-trays under 40-mesh insect net shade house.",
          "Seed treatment with Trichoderma viride (10g/kg) and Imidacloprid (5g/kg).",
          "Drench pro-trays with 19-19-19 (3g/L) at 15 days."
        ],
        irrigationAdvice: "Light misting twice a day.",
        keyTip: "Protecting young chilli nursery from thrips and whiteflies prevents 80% of virus outbreaks later."
      },
      {
        phaseId: "transplant",
        dayRange: "Day 31 to Day 45",
        stageName: "Bed Preparation, Mulch & Transplanting",
        badge: "Establishment",
        tasks: [
          "Transplant 30-day seedlings in evening on silver-black mulched raised beds.",
          "Dip roots in Pseudomonas fluorescens (10g/L) before planting to build systemic resistance.",
          "Plant border rows of tall maize or sorghum (3 dense rows) to create a wind & insect barrier."
        ],
        irrigationAdvice: "Run drip for 40 minutes immediately after transplanting.",
        keyTip: "Border barrier crops block flying thrips and aphids from entering the chilli field."
      },
      {
        phaseId: "branching",
        dayRange: "Day 46 to Day 70",
        stageName: "Branching & First Flush of Flowers (CURRENT ACTIVE STAGE)",
        badge: "Flowering",
        tasks: [
          "Nip terminal shoot at 45 DAS to encourage 12–15 productive secondary fruiting branches.",
          "Install 20 Blue Sticky Traps per acre (Thrips are uniquely attracted to blue color).",
          "Fertigation: Inject 12-61-00 (Mono Ammonium Phosphate) @ 3 kg/acre + 13-0-45 @ 3 kg/acre weekly.",
          "Spray 0.2% Boron (2g/L) to prevent flower drop and improve fruit elongation."
        ],
        irrigationAdvice: "Maintain even soil moisture; avoid flood wetting that induces wilt.",
        keyTip: "Blue sticky traps are 3x more effective than yellow traps for Chilli Thrips."
      },
      {
        phaseId: "fruiting",
        dayRange: "Day 71 to Day 110",
        stageName: "Green Chilli Development & Pod Sizing",
        badge: "Pod Growth",
        tasks: [
          "Apply Potassium Nitrate (13-0-45) and Micronutrient mixture foliar spray.",
          "Check for Anthracnose (Die-Back / Fruit Rot) water-soaked spots.",
          "First green chilli pickings begin for fresh market."
        ],
        irrigationAdvice: "Irrigate every 5–7 days through drip.",
        keyTip: "Anthracnose fungus enters through thrips puncture wounds; controlling thrips prevents fruit rot."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 111 to Day 160",
        stageName: "Red Ripe Pod Harvest & Sun Drying",
        badge: "Harvest",
        tasks: [
          "Pick fully ripe dark red chillies in multiple pickings (3–4 flushes).",
          "Sun-dry red chillies on clean cemented drying yard or polythene sheet for 8–10 days.",
          "Maintain moisture at 10% so chillies produce clean crisp sound when shaken.",
          "Pack in moisture-proof gunny bags lined with paper."
        ],
        irrigationAdvice: "Light drip irrigation between pickings to encourage subsequent flush.",
        keyTip: "Never dry chillies directly on bare mud soil; mud dust ruins premium export grade."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_thrips_mites",
        targetCategory: "Insect Pest",
        targetName: "Chilli Thrips (Scirtothrips dorsalis) & Yellow Mites",
        severity: "Critical Threat",
        symptoms: "Boat-shaped upward leaf curling (thrips), downward inverted cup curling (mites), bronzed foliage, flower shedding.",
        chemicalSolution: "For Thrips: Spinetoram 11.7% SC @ 1 ml/L OR Fipronil 5% SC @ 2 ml/L | For Mites: Spiromesifen 22.9% SC @ 1 ml/L",
        timing: "Spray early morning with fine cone nozzle at first sign of leaf rim curling.",
        waitingPeriodDays: 7,
        organicAlternative: "Spray Azadirachtin 10,000 ppm @ 2 ml/L + install 20 Blue Sticky Traps per acre.",
        safetyPrecaution: "Upward leaf curling = Thrips; Downward curling = Mites. Use correct targeted chemical."
      },
      {
        id: "dis_anthracnose",
        targetCategory: "Fungal Disease",
        targetName: "Anthracnose / Die-Back & Fruit Rot (Colletotrichum)",
        severity: "High Hazard",
        symptoms: "Twigs dry from top downwards (Die-Back); circular sunken necrotic spots on ripe red chillies with black concentric rings.",
        chemicalSolution: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L OR Tebuconazole 25.9% EC @ 1.5 ml/L",
        timing: "Spray at 50% flowering and repeat 15 days later during pod development.",
        waitingPeriodDays: 10,
        organicAlternative: "Seed treatment with Trichoderma viride @ 10g/kg + spray Pseudomonas @ 5g/L.",
        safetyPrecaution: "Remove infected dry twigs and burned fruits before spraying."
      }
    ]
  },

  wheat: {
    id: "wheat",
    name: "Wheat (Gehun)",
    scientificName: "Triticum aestivum",
    icon: "🌾",
    category: "cereals",
    season: "Rabi (November – April)",
    durationDays: 120,
    currentDaySample: 22,
    currentStageKey: "cri_stage",
    soilPreference: "Well-Drained Fertile Clay Loam to Silt Loam Soils",
    phRange: "6.0 – 7.5",
    targetYield: "22 – 28 Quintals / Acre",
    mspValue: "₹2,275 / Quintal",
    waterRequirement: "350 – 450 mm (Critical at Crown Root Initiation)",
    recommendedSpacing: "20 cm row-to-row (Seed Drill)",
    totalFertilizerDose: "120 kg N : 60 kg P₂O₅ : 40 kg K₂O per Hectare",

    lifecyclePlan: [
      {
        phaseId: "sowing",
        dayRange: "Day 0 to Day 10",
        stageName: "Seed Treatment & Line Sowing",
        badge: "Sowing",
        tasks: [
          "Sow during optimal window (Nov 5–25) with zero-till seed drill or conventional drill at 4–5 cm depth.",
          "Seed Treatment: Treat seed with Carboxin 37.5% + Thiram 37.5% DS @ 2.5 g/kg seed to prevent loose smut.",
          "Basal Fertilizer: Apply 100% DAP (55 kg/acre) + 50% Potash (MOP 20 kg/acre) + 30% Urea (25 kg/acre).",
          "Ensure row-to-row spacing of 20 cm."
        ],
        irrigationAdvice: "Pre-sowing irrigation (Paleva) to ensure moist seedbed for 100% germination.",
        keyTip: "Broadcasting reduces yield by 4 quintals/acre compared to seed drill line sowing."
      },
      {
        phaseId: "cri_stage",
        dayRange: "Day 18 to Day 25",
        stageName: "Crown Root Initiation (CRI) - MOST CRITICAL (CURRENT ACTIVE STAGE)",
        badge: "CRI Stage",
        tasks: [
          "FIRST & MOST VITAL IRRIGATION: Crown roots establish now; missing this water cuts tillers by 35%.",
          "First Nitrogen Top-Dressing: Broadcast 35 kg Urea per acre 2 days after CRI irrigation.",
          "Inspect for early termite attack in sandy soils (drench Chlorpyrifos 20% EC @ 1.5 L/acre if termites seen)."
        ],
        irrigationAdvice: "Mandatory irrigation between Day 20 and Day 25 without fail.",
        keyTip: "If you have water for only one irrigation in the entire season, give it at CRI stage."
      },
      {
        phaseId: "tillering_jointing",
        dayRange: "Day 26 to Day 55",
        stageName: "Tillering, Jointing & Weed Eradication",
        badge: "Tillering",
        tasks: [
          "Post-emergence Weed Control: Spray Clodinafop-propargyl 15% WP @ 160 g/acre (for Phalaris minor / Gulli danda) + Metsulfuron Methyl 20% WP @ 8 g/acre (for broadleaf weeds) at 30–35 DAS.",
          "Second Nitrogen Split: Top dress 30 kg Urea per acre at jointing stage (45 DAS).",
          "Frost / Cold Wave Protection: Give a light evening irrigation when night temperature falls below 4°C."
        ],
        irrigationAdvice: "Second irrigation at late tillering / jointing stage (40–45 DAS).",
        keyTip: "Never spray weedicides when soil is bone dry or temperature is below 15°C."
      },
      {
        phaseId: "heading_milking",
        dayRange: "Day 56 to Day 90",
        stageName: "Boot Leaf, Heading & Milk Stage",
        badge: "Grain Setting",
        tasks: [
          "Third Irrigation at flowering / milking stage to prevent grain abortion.",
          "Terminal Heat Defense: Spray 1% Potassium Nitrate (13-0-45) @ 10 g/L or 2% Urea at boot leaf stage to protect grains from sudden March heat waves.",
          "Monitor for Yellow & Brown Rust (Puccinia) on leaves."
        ],
        irrigationAdvice: "Irrigate on calm, non-windy days to prevent plant lodging.",
        keyTip: "Terminal heat during milking shrinks grain size; foliar potassium shields grain weight."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 91 to Day 120",
        stageName: "Dough Stage, Hardening & Combine Harvest",
        badge: "Harvest",
        tasks: [
          "Stop irrigation completely when grains turn hard and cannot be dented with fingernail.",
          "Combine harvest when grain moisture drops below 14% to avoid grain bruising.",
          "Store grains at below 12% moisture with shade-dried neem leaves."
        ],
        irrigationAdvice: "Zero irrigation during grain ripening.",
        keyTip: "Do not burn wheat crop residue (Paddy straw / Stubble); incorporate with Super Seeder for soil carbon."
      }
    ],

    pesticideProtocols: [
      {
        id: "dis_yellow_rust",
        targetCategory: "Fungal Disease",
        targetName: "Yellow / Stripe Rust (Puccinia striiformis)",
        severity: "Critical Threat",
        symptoms: "Bright yellow powdery pustules arranged in linear stripes on leaf blades; yellow dust rubs off on fingers.",
        chemicalSolution: "Propiconazole 25% EC (Tilt) @ 1.0 ml/L (200 ml/acre) OR Tebuconazole 25.9% EC @ 1.25 ml/L",
        timing: "Spray immediately at first detection of yellow stripe patches in the field.",
        waitingPeriodDays: 20,
        organicAlternative: "Spray cow urine (10%) + sour buttermilk (5%) early morning.",
        safetyPrecaution: "Act immediately; yellow rust can destroy 80% yield within 10 days of foggy weather."
      },
      {
        id: "weed_phalaris",
        targetCategory: "Weed Control",
        targetName: "Canary Grass / Gulli Danda (Phalaris minor)",
        severity: "Yield Destroyer",
        symptoms: "Mimic weed identical to wheat seedlings that chokes out tillers and consumes 40% of applied urea.",
        chemicalSolution: "Clodinafop 15% WP @ 160 g/acre OR Sulfosulfuron 75% WG @ 13.5 g/acre with surfactant",
        timing: "Apply at 30–35 DAS when weed has 2–3 leaves and wheat field has good moisture.",
        waitingPeriodDays: 45,
        organicAlternative: "Zero-tillage sowing into paddy residue directly suppresses Phalaris germination by 70%.",
        safetyPrecaution: "Spray with knapsack flat-fan nozzle; avoid overlapping spray swaths."
      }
    ]
  },

  redgram: {
    id: "redgram",
    name: "Red Gram / Pigeon Pea (Tur / Arhar)",
    scientificName: "Cajanus cajan",
    icon: "🫘",
    category: "pulses",
    season: "Kharif (June – January)",
    durationDays: 170,
    currentDaySample: 50,
    currentStageKey: "branching_nipping",
    soilPreference: "Deep Well-Drained Sandy Loam to Black Cotton Soil with Good Internal Drainage",
    phRange: "6.5 – 8.0",
    targetYield: "10 – 14 Quintals / Acre",
    mspValue: "₹7,550 / Quintal",
    waterRequirement: "450 – 550 mm (Extremely drought hardy taproot system)",
    recommendedSpacing: "120 cm × 30 cm (or Intercropped 1:3 with Soybean/Cotton)",
    totalFertilizerDose: "20 kg N : 50 kg P₂O₅ : 20 kg K₂O per Hectare (Low N due to Rhizobium)",

    lifecyclePlan: [
      {
        phaseId: "sowing",
        dayRange: "Day 0 to Day 10",
        stageName: "Seed Inoculation & Ridge Sowing",
        badge: "Sowing",
        tasks: [
          "Rhizobium Seed Treatment: Inoculate seeds with Rhizobium culture + Trichoderma viride (10 g/kg seed) in jaggery slurry; dry in shade.",
          "Basal Fertilizer: Apply DAP 40 kg/acre + Single Super Phosphate (SSP) 50 kg/acre (SSP provides vital sulfur for pulse protein).",
          "Sow on ridges or broad bed furrows (BBF) to prevent waterlogging during monsoon downpours."
        ],
        irrigationAdvice: "Pre-sowing moisture is sufficient; avoid excess water pooling.",
        keyTip: "Never apply heavy urea to pulses; synthetic nitrogen stops root nodule bacteria from working."
      },
      {
        phaseId: "branching_nipping",
        dayRange: "Day 11 to Day 55",
        stageName: "Vegetative Growth & Terminal Shoot Nipping (CURRENT ACTIVE STAGE)",
        badge: "Nipping Stage",
        tasks: [
          "TERMINAL SHOOT NIPPING: Clip top 2 inches (5 cm) of terminal shoots at 45–50 DAS using hand shears or sickle.",
          "Nipping forces secondary and tertiary lateral branching, increasing pod cluster sites by 25–30%.",
          "Inter-cultivation: Run blade harrow between 120 cm rows to remove weeds and create soil dust mulch."
        ],
        irrigationAdvice: "Rainfed crop; give one protective irrigation only if dry spell exceeds 20 days.",
        keyTip: "Nipping is the single highest ROI practice in Red Gram; it doubles pod-bearing branches."
      },
      {
        phaseId: "flowering",
        dayRange: "Day 56 to Day 110",
        stageName: "Flower Bud Induction & Pod Borer Defense",
        badge: "Flowering",
        tasks: [
          "Install 5 Helicoverpa pheromone traps per acre at 60 DAS.",
          "Foliar Nutrition: Spray 1% Pulse Wonder or 2% Urea + 0.2% Boron at 50% flowering to halt flower drop.",
          "Scout for Pod Borer caterpillars and Pod Fly maggots."
        ],
        irrigationAdvice: "CRITICAL: One protective irrigation at flower bud opening stage is non-negotiable.",
        keyTip: "Moisture stress at flowering causes massive flower shedding."
      },
      {
        phaseId: "pod_maturation",
        dayRange: "Day 111 to Day 170",
        stageName: "Pod Development, Drying & Harvesting",
        badge: "Harvest",
        tasks: [
          "Spray 0-0-50 Sulphate of Potash @ 10 g/L at pod filling to plump up pulse grains.",
          "Harvest when 80–85% of pods turn brown and dry.",
          "Cut plants at base with sickle, bundle, stack upright in sun for 3–5 days, and thresh with pulse thresher."
        ],
        irrigationAdvice: "Stop all watering 20 days prior to harvest.",
        keyTip: "Sun-dry grains to 9% moisture before storage to prevent Pulse Beetle (Callosobruchus) attack."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_pod_borer",
        targetCategory: "Insect Pest",
        targetName: "Gram Pod Borer (Helicoverpa armigera) & Maruca Webbing Borer",
        severity: "Critical Threat",
        symptoms: "Caterpillar feeds with half its body thrust inside the pod; circular holes in developing pods; webbed flower clusters.",
        chemicalSolution: "Chlorantraniliprole 18.5% SC @ 0.3 ml/L (60 ml/acre) OR Emamectin Benzoate 5% SG @ 0.5 g/L (100 g/acre)",
        timing: "Spray at 50% flowering or when 1 caterpillar per plant / 10% damaged pods are scouted.",
        waitingPeriodDays: 14,
        organicAlternative: "Spray 5% NSKE (Neem Seed Kernel Extract) + Release Trichogramma chilonis @ 40,000/acre.",
        safetyPrecaution: "Never spray during peak sunny afternoon; spray between 7:00 AM and 10:00 AM."
      },
      {
        id: "dis_fusarium_wilt",
        targetCategory: "Fungal Disease",
        targetName: "Fusarium Wilt (Fusarium udum) & Phytophthora Blight",
        severity: "Catastrophic Hazard",
        symptoms: "Sudden drooping and wilting of green leaves; black vascular streak inside split taproot; plant dries up rapidly.",
        chemicalSolution: "Soil Drenching: Carbendazim 12% + Mancozeb 63% WP @ 2.5 g/L at base of infected row",
        timing: "Apply at first sign of single plant yellowing or wilting.",
        waitingPeriodDays: 20,
        organicAlternative: "Soil application of Trichoderma viride (2 kg mixed in 100 kg FYM) at basal sowing.",
        safetyPrecaution: "Crop rotation with sorghum, maize, or paddy is the only permanent cure for wilt-infested fields."
      }
    ]
  },

  soybean: {
    id: "soybean",
    name: "Soybean (सोयाबीन / Peda)",
    scientificName: "Glycine max",
    icon: "🫘",
    category: "oilseeds",
    season: "Kharif (June – October)",
    durationDays: 100,
    currentDaySample: 40,
    currentStageKey: "flowering",
    soilPreference: "Well-Drained Black Soils (Vertisols) or Fertile Clay Loams",
    phRange: "6.5 – 7.5",
    targetYield: "10 – 14 Quintals / Acre",
    mspValue: "₹4,892 / Quintal (Yellow Variety)",
    waterRequirement: "450 – 550 mm (Critical at Flowering & Pod Elongation)",
    recommendedSpacing: "45 cm × 5–7 cm (Maintain 1.6–1.8 lakh plants/acre)",
    totalFertilizerDose: "12 kg N : 24 kg P₂O₅ : 16 kg K₂O + 10 kg Sulphur per Acre",

    lifecyclePlan: [
      {
        phaseId: "prep_sowing",
        dayRange: "Day -5 to Day 0",
        stageName: "Seed Inoculation, BBF Bed Prep & Sowing",
        badge: "Stand Foundation",
        tasks: [
          "Plough field once with MB plough and harrow twice to create a fine, crumbly seedbed.",
          "Adopt Broad Bed and Furrow (BBF) or Ridge-and-Furrow method (bed width 1.2 m) to prevent waterlogging during torrential rains.",
          "Inoculate seed with Bradyrhizobium japonicum (5 g/kg seed) + PSB (5 g/kg seed) slurry 2 hours before sowing.",
          "Apply Basal Fertilizer: DAP 50 kg + MOP 25 kg + Sulphur Bentonite 10 kg per acre in furrows 5 cm deeper than seed."
        ],
        irrigationAdvice: "Sow only after receipt of at least 75–100 mm monsoon rainfall when topsoil has reached field capacity.",
        keyTip: "Never sow soybean deeper than 3–4 cm; deep sowing causes poor seedling emergence and hypocotyl rot."
      },
      {
        phaseId: "germination",
        dayRange: "Day 1 to Day 18",
        stageName: "Germination & Pre-Emergence Weed Eradication",
        badge: "Seedling Vigor",
        tasks: [
          "Inspect seedling emergence at Day 4–6; target 18–20 plants per linear meter of row.",
          "Pre-emergence Weed Control: Spray Pendimethalin 38.7% CS @ 700 ml/acre in 200L water within 48 hours of sowing.",
          "Scout for early seedling stem-fly punctures and cutworm cut-marks at soil line."
        ],
        irrigationAdvice: "Avoid water stagnation; surface water drains must remain clear.",
        keyTip: "Soybean is extremely sensitive to waterlogging; 24h standing water reduces seedling population by 30%."
      },
      {
        phaseId: "vegetative",
        dayRange: "Day 19 to Day 35",
        stageName: "Active Vegetative, Root Nodulation & Inter-Cultivation",
        badge: "Nodule Formation",
        tasks: [
          "Run wheel hoe or bullock-drawn blade harrow between 45 cm rows at 20 DAS to control weeds and aerate root zone.",
          "Check root nodulation at Day 25: Uproot 3 plants gently and wash roots. Slice nodules; active nitrogen-fixing nodules must show pink/red interiors.",
          "If grass weeds (Echinochloa) dominate, spray Quizalofop-ethyl 5% EC @ 300 ml/acre at 20–25 DAS.",
          "Install 5 Yellow Sticky Traps per acre to monitor whitefly vector of Yellow Mosaic Virus (YMV)."
        ],
        irrigationAdvice: "Rainfed crop; provide furrow irrigation only if dry spell exceeds 15 days.",
        keyTip: "Pink nodule interior confirms leguminous bacterial nitrogen fixation; green or white nodules are non-functional."
      },
      {
        phaseId: "flowering",
        dayRange: "Day 36 to Day 55",
        stageName: "Flower Induction & Pod Formation (CURRENT ACTIVE STAGE)",
        badge: "Yield Deciding",
        tasks: [
          "Foliar Nutrition: Spray 19-19-19 Soluble NPK @ 5 g/L + Boron 20% @ 1 g/L to stimulate profuse flower retention.",
          "Scout for Girdle Beetle and Semilooper caterpillars cutting leaves and petiole rings.",
          "Spray 5% Neem Seed Kernel Extract (NSKE) as repellent against sucking vectors."
        ],
        irrigationAdvice: "MOST CRITICAL IRRIGATION: Moisture stress at flowering causes up to 40% blossom shedding. Give furrow protective irrigation.",
        keyTip: "Never spray harsh organophosphates during peak morning bee visitation (8:00 AM – 11:00 AM)."
      },
      {
        phaseId: "pod_filling",
        dayRange: "Day 56 to Day 80",
        stageName: "Pod Development & Grain Bulking",
        badge: "Seed Sizing",
        tasks: [
          "Spray Potassium Nitrate (13-0-45) @ 10 g/L or 0-0-50 Sulphate of Potash @ 10 g/L to boost test weight (100-seed weight).",
          "Inspect for Pod Borer and Tobacco Caterpillar attacks on developing pods.",
          "Remove and burn virus-infected crinkled yellow mosaic plants (YMV) to stop pest vectors."
        ],
        irrigationAdvice: "Maintain steady moisture; drought at pod filling causes wrinkled, undersized grain.",
        keyTip: "Potash foliar spray during pod fill increases oil content and kernel density by 12%."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 81 to Day 100",
        stageName: "Leaf Shedding, Pod Drying & Harvesting",
        badge: "Harvest & Threshing",
        tasks: [
          "Monitor physiological maturity: Crop is ready when leaves turn yellow and drop off, and pods turn golden-brown.",
          "Harvest promptly when grain rattles inside pods; delayed harvest causes massive pod shattering losses in the field.",
          "Harvest with sickle at base or combine harvester with floating cutter bar set 5 cm above ground.",
          "Thresh at cylinder speed of 350–400 RPM to avoid cracking the delicate seed coats."
        ],
        irrigationAdvice: "Zero irrigation during pod yellowing stage.",
        keyTip: "Sun-dry harvested soybean seed to 9–10% moisture before storing in aerated gunny bags."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_girdle_beetle",
        targetCategory: "Insect Pest",
        targetName: "Girdle Beetle (Obereopsis brevis) & Stem Fly",
        severity: "Critical Threat",
        symptoms: "Characteristic two ring-like cuts on petiole or stem; leaves above ring wilt, dry up, and drop; plant vigor collapses.",
        chemicalSolution: "Chlorantraniliprole 18.5% SC @ 0.3 ml/L (60 ml/acre) OR Thiamethoxam 12.6% + Lambda Cyhalothrin 9.5% ZC @ 60 ml/acre",
        timing: "Spray at 20–25 DAS or as soon as first girdled petiole is observed.",
        waitingPeriodDays: 14,
        organicAlternative: "Neem oil 10,000 ppm @ 2 ml/L or NSKE 5% spray at 15–20 DAS.",
        safetyPrecaution: "Spray nozzle directed towards plant stems for thorough coverage."
      },
      {
        id: "dis_yellow_mosaic",
        targetCategory: "Viral / Vector Disease",
        targetName: "Yellow Mosaic Virus (YMV) via Whitefly Vector (Bemisia tabaci)",
        severity: "Severe Hazard",
        symptoms: "Bright yellow patches interspersed with green on young leaves; pods remain stunted with tiny shriveled seeds.",
        chemicalSolution: "Vector Control: Diafenthiuron 50% WP @ 1.25 g/L OR Acetamiprid 20% SP @ 0.5 g/L",
        timing: "Spray at first appearance of whiteflies on leaf undersides.",
        waitingPeriodDays: 15,
        organicAlternative: "Install 10 yellow sticky sheets/acre; spray Verticillium lecanii bio-fungicide @ 5 g/L.",
        safetyPrecaution: "Uproot and destroy rogue YMV-infected plants immediately to prevent field-wide vector spread."
      }
    ]
  },

  groundnut: {
    id: "groundnut",
    name: "Groundnut / Peanut (मूंगफली / Palli)",
    scientificName: "Arachis hypogaea",
    icon: "🥜",
    category: "oilseeds",
    season: "Kharif / Summer (June – Oct / Jan – May)",
    durationDays: 115,
    currentDaySample: 45,
    currentStageKey: "pegging",
    soilPreference: "Well-Drained Sandy Loam or Red Sandy Loam (Light Friable Texture)",
    phRange: "6.0 – 7.2",
    targetYield: "12 – 16 Quintals / Acre (Dry Pods)",
    mspValue: "₹6,783 / Quintal",
    waterRequirement: "500 – 600 mm (Critical at Flowering, Pegging & Pod Formation)",
    recommendedSpacing: "30 cm × 10 cm (1.33 lakh plants/acre)",
    totalFertilizerDose: "10 kg N : 20 kg P₂O₅ : 20 kg K₂O + 200 kg Gypsum per Acre",

    lifecyclePlan: [
      {
        phaseId: "prep_sowing",
        dayRange: "Day -7 to Day 0",
        stageName: "Seed Kernel Selection, Trichoderma Treatment & Sowing",
        badge: "Seed Treatment",
        tasks: [
          "Plough field twice to 15 cm depth; pulverize soil thoroughly to facilitate smooth peg penetration.",
          "Select bold, undamaged kernels (seed rate 45–50 kg kernels/acre for bunch varieties).",
          "Seed Treatment: Treat kernels with Trichoderma viride (10 g/kg seed) to prevent Collar Rot & Stem Rot, followed by Rhizobium slurry.",
          "Apply Basal Fertilizer: Single Super Phosphate (SSP) 125 kg (provides P + Calcium + Sulphur) + MOP 35 kg + Urea 15 kg/acre."
        ],
        irrigationAdvice: "Pre-sowing irrigation to ensure adequate seedbed moisture.",
        keyTip: "Never use heavy black clay soil; clay hardens when dry and breaks developing pegs during harvest."
      },
      {
        phaseId: "vegetative",
        dayRange: "Day 1 to Day 30",
        stageName: "Germination, Early Stand & Hand Weeding",
        badge: "Early Growth",
        tasks: [
          "Check germination at Day 7–10. Gap fill with sprouted seeds on Day 10.",
          "Pre-emergence Herbicide: Spray Pendimethalin 30% EC @ 1.0 L/acre within 48h of sowing.",
          "First Hand Weeding at 20–25 DAS to remove all competing grasses.",
          "Inspect for collar rot lesions at soil line."
        ],
        irrigationAdvice: "Irrigate every 10–12 days in light sandy soils.",
        keyTip: "Complete all inter-cultivation and hoeing strictly before 40 DAS; never disturb soil once pegging begins."
      },
      {
        phaseId: "pegging",
        dayRange: "Day 31 to Day 60",
        stageName: "Flowering, Peg Penetration & Gypsum Top-Dressing (CURRENT ACTIVE STAGE)",
        badge: "Pegging Window",
        tasks: [
          "GYPSUM APPLICATION (Day 40–45): Broadcast 200 kg Agricultural Gypsum per acre around the base of plants.",
          "Lightly incorporate gypsum into top 3 cm soil with a hand rake followed by immediate irrigation.",
          "Gypsum supplies water-soluble Calcium and Sulphur directly to underground pod pods for solid kernel filling ('pod filling without pop').",
          "STRICT RULE: Do not run any mechanical hoes or bullocks in the field; hoeing cuts subterranean pegs."
        ],
        irrigationAdvice: "CRITICAL: Soil must remain moist and soft so aerial pegs can pierce the ground effortlessly.",
        keyTip: "Calcium deficiency causes 'Pops' (empty hollow pods without peanut kernels). Gypsum is essential."
      },
      {
        phaseId: "pod_maturation",
        dayRange: "Day 61 to Day 95",
        stageName: "Pod Enlargement & Tikka Leaf Spot Defense",
        badge: "Pod Bulking",
        tasks: [
          "Scout for Early and Late Tikka Leaf Spots (circular dark spots with yellow halos).",
          "Spray Tebuconazole 25.9% EC @ 1.0 ml/L or Mancozeb 75% WP @ 2.5 g/L to protect foliage.",
          "Foliar Nutrition: Spray 1% Multi-K (13-0-45) or 0.5% Ferrous Sulphate + 0.1% Citric Acid if iron chlorosis (whitish leaves) appears."
        ],
        irrigationAdvice: "Provide irrigation every 7–8 days during pod development. Moisture stress at pod filling drops yield by 50%.",
        keyTip: "Groundnut absorbs calcium directly through developing pod shell walls, not through root systems."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 96 to Day 115",
        stageName: "Maturity Assessment, Digging & Sun Drying",
        badge: "Harvest & Curing",
        tasks: [
          "Check maturity: Pull 3 random plants; crack open 10 pods. Pods are mature when inner shell lining turns chocolate-brown to black.",
          "Give light irrigation 2 days prior to harvest to loosen sandy soil.",
          "Harvest with groundnut digger or pull manually; shake off root soil immediately.",
          "Invert plants in field rows with pods facing upward to sun-dry for 3–5 days until kernel moisture reaches 8%."
        ],
        irrigationAdvice: "Zero irrigation once pulling begins.",
        keyTip: "Never heap damp pods in moist conditions; moist storage leads to Aspergillus flavus infection producing carcinogenic Aflatoxins."
      }
    ],

    pesticideProtocols: [
      {
        id: "dis_tikka_leafspot",
        targetCategory: "Fungal Disease",
        targetName: "Tikka Leaf Spot (Cercospora arachidicola) & Rust (Puccinia arachidis)",
        severity: "Severe Hazard",
        symptoms: "Circular dark brown spots with prominent yellow rings on leaf upperside; severe premature defoliation leaves bare stems.",
        chemicalSolution: "Tebuconazole 25.9% EC @ 1 ml/L (200 ml/acre) OR Hexaconazole 5% SC @ 2 ml/L",
        timing: "Spray at initial symptom notice (around 45–50 DAS) and repeat 15 days later.",
        waitingPeriodDays: 14,
        organicAlternative: "Spray Pseudomonas fluorescens @ 5 g/L or 10% cow urine + garlic extract.",
        safetyPrecaution: "Spray undersides of canopy leaves where rust pustules and fungal spores thrive."
      },
      {
        id: "dis_collar_rot",
        targetCategory: "Fungal Disease",
        targetName: "Collar Rot / Crown Rot (Aspergillus niger) & Stem Rot (Sclerotium rolfsii)",
        severity: "Catastrophic Hazard",
        symptoms: "Black fungal sooty powder at seedling collar; collar tissue softens, rots, and seedlings collapse overnight.",
        chemicalSolution: "Seed Treatment: Thiram + Carbendazim (2:1) @ 3 g/kg seed. Soil Drenching: Tebuconazole @ 1.5 ml/L",
        timing: "Preventive seed dressing before dibbling.",
        waitingPeriodDays: 21,
        organicAlternative: "Trichoderma harzianum (2 kg) incubated in 100 kg farmyard manure broadcasted at land prep.",
        safetyPrecaution: "Ensure deep summer ploughing to bury sclerotial fungal bodies."
      }
    ]
  },

  chickpea: {
    id: "chickpea",
    name: "Bengal Gram / Chickpea (चना / Senagalu)",
    scientificName: "Cicer arietinum",
    icon: "🫘",
    category: "pulses",
    season: "Rabi (October – March)",
    durationDays: 105,
    currentDaySample: 40,
    currentStageKey: "branching",
    soilPreference: "Deep Black Soils (Regur) or Medium Alluvial Loams with High Moisture Retention",
    phRange: "6.8 – 7.8",
    targetYield: "8 – 12 Quintals / Acre",
    mspValue: "₹5,440 / Quintal",
    waterRequirement: "250 – 350 mm (Extremely Sensitive to Standing Water / Aeration Dependent)",
    recommendedSpacing: "30 cm × 10 cm (1.3 lakh plants/acre)",
    totalFertilizerDose: "8 kg N : 20 kg P₂O₅ : 10 kg K₂O + 10 kg Sulphur per Acre",

    lifecyclePlan: [
      {
        phaseId: "prep_sowing",
        dayRange: "Day -5 to Day 0",
        stageName: "Seed Priming, Basal Phosphorus & Sowing",
        badge: "Rabi Sowing",
        tasks: [
          "Conserve post-monsoon soil moisture with shallow disc ploughing followed by immediate planking.",
          "Seed Treatment: Treat certified seeds with Carbendazim 2 g/kg + Mesorhizobium ciceri & PSB cultures (10 g/kg seed).",
          "Seed Priming: Soak seeds in water for 4–6 hours and shade-dry before sowing to accelerate uniform emergence in cold soil.",
          "Apply Basal Fertilizer: DAP 40 kg + MOP 15 kg + Sulphur 10 kg/acre placed 5–7 cm deep in furrows."
        ],
        irrigationAdvice: "Sow in residual moisture; pre-sowing light irrigation if top 5 cm soil has dried.",
        keyTip: "Optimum sowing window is October 15 to November 10; late sowing exposes crop to terminal heat stress at pod fill."
      },
      {
        phaseId: "vegetative",
        dayRange: "Day 1 to Day 35",
        stageName: "Emergence, Weed Removal & Shoot Nipping",
        badge: "Lateral Shoot Branching",
        tasks: [
          "Seedlings emerge within 5–7 days. Hand-weed at 25 DAS or spray Quizalofop-ethyl for grass weeds.",
          "TERMINAL NIPPING (Day 30–35): Nip or clip the top 2–3 cm growing tips of main shoots using sickle or shears.",
          "Nipping breaks apical dominance, stimulating 4–6 heavy secondary pod-bearing branches and increasing pod count by 35%."
        ],
        irrigationAdvice: "Do NOT irrigate during early vegetative growth; forced drying pushes roots deeper into black soil.",
        keyTip: "Nipping is the most cost-effective agronomic booster in chickpea; sheep grazing at 30 days achieves the same nipping benefit."
      },
      {
        phaseId: "flowering",
        dayRange: "Day 36 to Day 65",
        stageName: "Flower Bud Induction & Pod Borer Trapping (CURRENT ACTIVE STAGE)",
        badge: "Flower Retention",
        tasks: [
          "Install 5 Helicoverpa armigera pheromone traps per acre at crop canopy level.",
          "Install 'T'-shaped bird perches @ 15 per acre to invite insectivorous birds (drongos/mynas) to feed on caterpillars.",
          "Foliar Spray: Spray 2% DAP (20 g/L) + 0.2% Boron (2 g/L) at flower initiation to arrest flower drop.",
          "Scout daily for young green caterpillars chewing tender leaves."
        ],
        irrigationAdvice: "CRITICAL: Give ONE life-saving irrigation at pre-flowering / pod initiation stage. NEVER irrigate during peak full flowering (causes vegetative drop).",
        keyTip: "Excessive irrigation or rain during peak bloom causes flower shedding and vegetative resurgence."
      },
      {
        phaseId: "pod_filling",
        dayRange: "Day 66 to Day 90",
        stageName: "Pod Development & Terminal Heat Management",
        badge: "Pod Plumping",
        tasks: [
          "Monitor pod borer caterpillar damage: caterpillars thrust head inside pod and eat developing grains.",
          "Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Emamectin Benzoate 5% SG @ 0.5 g/L if > 1 caterpillar/plant.",
          "Foliar spray of 1% Potassium Nitrate (13-0-45) to mitigate terminal rising temperatures in February/March."
        ],
        irrigationAdvice: "One light irrigation at pod filling if soil is cracking severely.",
        keyTip: "Terminal heat above 32°C during grain fill shrinks seed size; foliar potassium shields against heat desiccation."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 91 to Day 105",
        stageName: "Pod Desiccation, Harvesting & Threshing",
        badge: "Harvest",
        tasks: [
          "Harvest when 85% of leaves and pods turn golden-yellow and dry; seeds shake freely inside pods.",
          "Cut plants close to ground with sickle in morning to prevent pod shattering.",
          "Sun-dry bundled sheaves for 3–4 days in threshing yard and thresh with tractor or pulse thresher.",
          "Clean grains and store at 8–9% moisture."
        ],
        irrigationAdvice: "Zero water 20 days prior to harvest.",
        keyTip: "Store with 2 cm sand layer or neem oil coating (5 ml/kg seed) to prevent pulse beetle (Callosobruchus) attack."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_gram_pod_borer",
        targetCategory: "Insect Pest",
        targetName: "Gram Pod Borer (Helicoverpa armigera)",
        severity: "Critical Threat",
        symptoms: "Defoliated young leaves; circular holes cut into developing green pods; caterpillar feeding inside.",
        chemicalSolution: "Chlorantraniliprole 18.5% SC @ 0.3 ml/L (60 ml/acre) OR Emamectin Benzoate 5% SG @ 0.5 g/L (100 g/acre)",
        timing: "Spray at 1 larva/meter row or 5% damaged pods.",
        waitingPeriodDays: 14,
        organicAlternative: "HaNPV (Nuclear Polyhedrosis Virus) @ 250 LE/acre in evening + 5% NSKE neem extract.",
        safetyPrecaution: "Spray in late afternoon (4 PM – 6 PM) when larvae climb out on canopy to feed."
      },
      {
        id: "dis_chickpea_wilt",
        targetCategory: "Fungal Disease",
        targetName: "Fusarium Wilt (Fusarium oxysporum f. sp. ciceris) & Dry Root Rot",
        severity: "Catastrophic Hazard",
        symptoms: "Sudden drooping and drying of leaves without yellowing; brown/black xylem vascular discolouration inside split taproot.",
        chemicalSolution: "Seed Dressing: Carboxin 37.5% + Thiram 37.5% DS @ 2 g/kg seed. Soil Drench: Carbendazim @ 2 g/L",
        timing: "Preventive seed treatment before sowing.",
        waitingPeriodDays: 20,
        organicAlternative: "Soil application of Trichoderma viride (2 kg in 100 kg FYM) per acre at last ploughing.",
        safetyPrecaution: "Grow wilt-resistant certified cultivars (e.g., JG 11, JAKI 9218, KAK 2) in wilt-endemic fields."
      }
    ]
  },

  sugarcane: {
    id: "sugarcane",
    name: "Sugarcane (गन्ना / Cheruku)",
    scientificName: "Saccharum officinarum",
    icon: "🎋",
    category: "commercial",
    season: "Annual / Adsali / Suru (Year-round)",
    durationDays: 330,
    currentDaySample: 120,
    currentStageKey: "grand_growth",
    soilPreference: "Deep, Rich, Well-Drained Loamy Soils or Heavy Alluvial Soils with Good Drainage",
    phRange: "6.5 – 7.8",
    targetYield: "45 – 60 Tons (450 – 600 Quintals) / Acre",
    mspValue: "₹340 / Quintal (FRP at 10.25% Sugar Recovery)",
    waterRequirement: "1500 – 2200 mm (High Water Demand; Ideal for Drip Fertigation)",
    recommendedSpacing: "120 cm to 150 cm Single Row OR 90×180 cm Paired Row Trench Method",
    totalFertilizerDose: "100 kg N : 40 kg P₂O₅ : 48 kg K₂O per Acre (Applied in 4 distinct splits)",

    lifecyclePlan: [
      {
        phaseId: "sett_prep",
        dayRange: "Day -5 to Day 0",
        stageName: "Two-Budded Sett Selection, Hot Water Treatment & Planting",
        badge: "Planting & Basal",
        tasks: [
          "Select clean disease-free 8–10 month old cane seed nursery; cut healthy 2-budded or 3-budded setts.",
          "Sett Treatment: Dip setts for 15 minutes in Carbendazim 50% WP (1 g/L) + Chlorpyrifos 20% EC (2 ml/L) solution to prevent Red Rot and Termites.",
          "Open deep trenches/furrows at 120 cm spacing with tractor ridger.",
          "Apply Basal Fertilizer: 100% Phosphorus (SSP 250 kg/acre) + 25% Potash (MOP 20 kg) + 15% Nitrogen (Urea 30 kg) + 10 kg Zinc Sulphate."
        ],
        irrigationAdvice: "Pre-planting soaking irrigation in trenches; place setts end-to-end (buds facing sideways) and cover with 5 cm soil.",
        keyTip: "Always plant buds facing lateral sides, never facing top or bottom, to ensure 100% bud sprouting."
      },
      {
        phaseId: "germination_tillering",
        dayRange: "Day 1 to Day 60",
        stageName: "Germination, Early Shoot Borer Defense & First Split",
        badge: "Tillering Phase",
        tasks: [
          "Bud sprouting starts at Day 12–15; complete germination counts by Day 35–40.",
          "Pre-emergence Herbicide: Spray Atrazine 50% WP @ 1.0 kg/acre on moist soil within 3 days of planting.",
          "Early Shoot Borer (ESB) Defense: Deploy 10 Trichogramma chilonis egg cards (50,000 parasitoids/acre) at 30, 45, and 60 days.",
          "First Nitrogen Top-Dressing at Day 45: Top dress 50 kg Urea followed by furrow irrigation."
        ],
        irrigationAdvice: "Irrigate every 8–10 days during summer tillering phase.",
        keyTip: "Early Shoot Borer causes 'Dead Hearts' that pull out easily and emit a rotting smell. Treat immediately."
      },
      {
        phaseId: "earthing_up",
        dayRange: "Day 61 to Day 120",
        stageName: "Tillering Consolidation, Second Split & Final Earthing Up (CURRENT STAGE)",
        badge: "Earthing-Up",
        tasks: [
          "Apply Second Nitrogen Split at Day 90: 50 kg Urea + 30 kg MOP per acre.",
          "FINAL EARTHING UP (Day 110–120): Dig furrows and mound soil against cane rows to convert furrows into ridges.",
          "Earthing up anchors strong root clumps, destroys late useless tillers, and prevents cane crop lodging during monsoon winds.",
          "Trash Mulching: Spread dried cane trash (3 tons/acre) in furrows to conserve soil moisture and smother weeds."
        ],
        irrigationAdvice: "Irrigate every 7–8 days. Ridges and furrows must drain monsoon surplus without waterlogging.",
        keyTip: "Earthing up is mandatory before monsoon storms; un-earthed sugarcane crops lodge flat and lose 30% sugar weight."
      },
      {
        phaseId: "grand_growth",
        dayRange: "Day 121 to Day 240",
        stageName: "Grand Cane Growth, Internode Elongation & Propping",
        badge: "Biomass Bulking",
        tasks: [
          "Apply Final Potash Split (MOP 30 kg/acre) + 40 kg Urea at Day 150 (stop all nitrogen after 150 days).",
          "De-trashing: Strip off dried bottom senescent leaves at Day 150 and Day 210 to ensure air circulation and reduce scales/mealybugs.",
          "Cane Propping / Tying: Tie opposite clumps of canes together like a tepee using dried leaves to withstand cyclonic gales."
        ],
        irrigationAdvice: "Peak transpiration window: maintain regular furrow or drip irrigation (drip saves 50% water).",
        keyTip: "Never apply chemical nitrogen fertilizer after 150 days; late nitrogen increases vegetative water shoots and lowers sucrose sugar recovery."
      },
      {
        phaseId: "maturation_harvest",
        dayRange: "Day 241 to Day 330",
        stageName: "Sucrose Accumulation, Brix Testing & Harvesting",
        badge: "Harvest & Mill Sale",
        tasks: [
          "Sucrose Synthesis: Cool dry nights (12–14°C) with bright sunny days trigger intense sucrose synthesis in cane stalks.",
          "Test Maturity: Check juice with Hand Refractometer; crop is mature when Brix reading reaches 18–20% throughout cane stem.",
          "Stop irrigation completely 15–20 days before cane cutting to concentrate sugar.",
          "Harvest flush at ground level with sharp cane knife (highest sugar concentration is in the bottom 3 internodes)."
        ],
        irrigationAdvice: "Zero irrigation 20 days prior to cane cutting.",
        keyTip: "Deliver cut cane to sugar mill within 24 hours of cutting; each day's delay causes sucrose inversion into glucose, slashing factory payment."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_shoot_borer",
        targetCategory: "Insect Pest",
        targetName: "Early Shoot Borer (Chilo infuscatellus) & Top Borer",
        severity: "Critical Threat",
        symptoms: "Central whorl dries up into 'dead heart' in young shoots up to 90 days; dead shoots pull out easily with foul rotting odor.",
        chemicalSolution: "Fipronil 0.3% GR @ 10 kg/acre applied in furrows at planting OR Chlorantraniliprole 18.5% SC @ 150 ml/acre drenching along rows",
        timing: "Apply at 30 to 45 days after planting.",
        waitingPeriodDays: 28,
        organicAlternative: "Release Trichogramma chilonis egg parasitoid @ 50,000/acre at weekly intervals from Day 30 to Day 60.",
        safetyPrecaution: "Avoid light shallow spraying; insecticide must reach the collar region inside furrows."
      },
      {
        id: "dis_red_rot",
        targetCategory: "Fungal Disease",
        targetName: "Red Rot (Colletotrichum falcatum) & Smut (Sporisorium scitamineum)",
        severity: "Catastrophic Hazard",
        symptoms: "Third or fourth leaf dries up from tip; split stalk reveals dark red internal tissues with diagnostic white cross-bands and alcohol-like sour odor.",
        chemicalSolution: "Sett Treatment: Carbendazim 50% WP @ 1 g/L water dip for 15 mins. There is NO standing chemical cure for red rot.",
        timing: "Strict preventive sett dip before planting.",
        waitingPeriodDays: 45,
        organicAlternative: "Hot water treatment of seed cane setts at 52°C for 30 minutes destroys internal fungal mycelium.",
        safetyPrecaution: "Immediately uproot and burn red-rot infected clumps; never take ratoon crop from infected fields."
      }
    ]
  },

  mustard: {
    id: "mustard",
    name: "Mustard / Rapeseed (सरसों / Avalu)",
    scientificName: "Brassica juncea",
    icon: "🌼",
    category: "oilseeds",
    season: "Rabi (October – March)",
    durationDays: 115,
    currentDaySample: 35,
    currentStageKey: "flowering",
    soilPreference: "Light to Heavy Loam Soils with Adequate Drainage (Tolerates Mild Salinity)",
    phRange: "6.0 – 7.5",
    targetYield: "8 – 12 Quintals / Acre",
    mspValue: "₹5,650 / Quintal",
    waterRequirement: "250 – 350 mm (Critical at Rosette/Branching & Siliqua Seed Filling)",
    recommendedSpacing: "30 cm × 10 cm (Thin to 1 plant every 10 cm)",
    totalFertilizerDose: "32 kg N : 16 kg P₂O₅ : 16 kg K₂O + 16 kg Sulphur per Acre",

    lifecyclePlan: [
      {
        phaseId: "prep_sowing",
        dayRange: "Day -5 to Day 0",
        stageName: "Seedbed Preparation, Sulphur Nutrition & Sowing",
        badge: "Sowing & Basal",
        tasks: [
          "Plough field twice and run wooden plank (Pata) immediately after ploughing to conserve sub-surface moisture.",
          "Seed Treatment: Treat certified seeds with Metalaxyl 35% WS @ 6 g/kg seed to prevent White Rust & Downy Mildew.",
          "Apply Basal Fertilizer: DAP 35 kg + MOP 25 kg + Urea 25 kg + Sulphur Bentonite 15 kg/acre.",
          "Sow in lines at 30 cm spacing using seed drill at 1.5–2 kg seed/acre."
        ],
        irrigationAdvice: "Sow in good residual moisture; avoid deep sowing (depth 2–3 cm max).",
        keyTip: "Sulphur is mandatory for mustard; it raises seed oil content by 2.5–3.0% and synthesizes essential allyl isothiocyanate glucosinolates."
      },
      {
        phaseId: "thinning",
        dayRange: "Day 1 to Day 25",
        stageName: "Germination, Mandatory Thinning & First Irrigation",
        badge: "Thinning Stand",
        tasks: [
          "MANDATORY THINNING (Day 15–20): Pull out excess seedlings to maintain strict 10–12 cm spacing between plants.",
          "Failure to thin causes severe overcrowding, weak spindly stems, and 40% yield drop.",
          "First Hand Weeding at Day 20 before first irrigation.",
          "First Top-Dressing: Broadcast 30 kg Urea per acre at Day 25 just prior to first irrigation."
        ],
        irrigationAdvice: "FIRST CRITICAL IRRIGATION (Rosette Stage, 25–28 DAS): Give light furrow irrigation.",
        keyTip: "Thinning is the single most neglected operation in mustard; 1 healthy plant per 10 cm yields far more than 5 crowded stems."
      },
      {
        phaseId: "flowering",
        dayRange: "Day 26 to Day 60",
        stageName: "Full Yellow Bloom & Mustard Aphid Radar (CURRENT ACTIVE STAGE)",
        badge: "Aphid Vigilance",
        tasks: [
          "Scout daily for Mustard Aphid (Lipaphis erysimi) colonies on inflorescence branches and tender siliquae.",
          "ETL Threshold: 20–25% plants showing aphid colonies / 0.5–1.0 cm colony length on terminal shoot.",
          "Foliar Spray: Spray Dimethoate 30% EC @ 1.5 ml/L or Thiamethoxam 25% WG @ 0.4 g/L if ETL is reached.",
          "Spray only after 3:30 PM in the evening to protect honeybees active during sunny morning bloom."
        ],
        irrigationAdvice: "SECOND CRITICAL IRRIGATION (Siliqua Initiation, 50–55 DAS): Ensures long pods with 16–20 plump seeds per pod.",
        keyTip: "Never spray systemic insecticides in morning; mustard depends on honeybee cross-pollination for 25% of seed setting."
      },
      {
        phaseId: "siliqua_filling",
        dayRange: "Day 61 to Day 90",
        stageName: "Siliqua Maturation & Alternaria Blight Defense",
        badge: "Seed Filling",
        tasks: [
          "Scout for Alternaria Blight (target board circular concentric brown spots on leaves and siliquae).",
          "Spray Mancozeb 75% WP @ 2 g/L or Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L.",
          "Spray 1% Potassium Nitrate (13-0-45) to shield against sudden February heat spikes."
        ],
        irrigationAdvice: "Stop irrigation completely once pods turn light yellowish-green.",
        keyTip: "Heavy irrigation during high winds causes complete lodging of tall mustard stands."
      },
      {
        phaseId: "harvest",
        dayRange: "Day 91 to Day 115",
        stageName: "Pod Golden Browning, Morning Harvesting & Threshing",
        badge: "Harvest",
        tasks: [
          "Harvest when 75–80% of siliquae turn golden-yellow and seeds turn brownish-black.",
          "Harvest early in the morning when dew is on plants to prevent pod shattering and seed loss.",
          "Bundle stalks, stack in sun for 4–6 days, and thresh with tractor or stick beating.",
          "Dry seeds to 8% moisture before storing in clean dry bins."
        ],
        irrigationAdvice: "Zero irrigation.",
        keyTip: "Never delay harvest until pods turn bone-dry and brittle; mid-day harvesting shatters 15–20% of seeds onto the ground."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_mustard_aphid",
        targetCategory: "Insect Pest",
        targetName: "Mustard Aphid (Lipaphis erysimi)",
        severity: "Critical Threat",
        symptoms: "Thousands of tiny green-yellow aphids clustering on flower buds and tender pods; suck sap causing stunted curling; honeydew excretions turn canopy sooty black.",
        chemicalSolution: "Dimethoate 30% EC @ 1.5 ml/L OR Thiamethoxam 25% WG @ 0.35 g/L (80 g/acre) OR Oxydemeton-methyl 25% EC @ 1.5 ml/L",
        timing: "Spray when aphid colony length exceeds 0.5–1.0 cm on terminal central shoot on 20% plants.",
        waitingPeriodDays: 14,
        organicAlternative: "Spray 5% Neem Seed Kernel Extract (NSKE) or Fish Oil Rosin Soap (20 g/L). Release Coccinellid ladybird beetles.",
        safetyPrecaution: "Always spray in late afternoon (after 3:30 PM) when honeybee foraging activity has ceased."
      },
      {
        id: "dis_white_rust",
        targetCategory: "Fungal Disease",
        targetName: "White Rust (Albugo candida) & Alternaria Blight",
        severity: "Severe Hazard",
        symptoms: "White creamy raised pustules/blisters on leaf undersides; infected flowers form swollen, twisted, sterile 'staghead' malformations.",
        chemicalSolution: "Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ) @ 2.5 g/L OR Mancozeb 75% WP @ 2.5 g/L",
        timing: "Spray at first sign of white pustules on lower leaves; repeat after 12 days.",
        waitingPeriodDays: 21,
        organicAlternative: "Foliar spray of garlic bulb extract 5% + Trichoderma harzianum @ 5 g/L.",
        safetyPrecaution: "Destroy 'staghead' floral malformations manually to break the downy mildew / white rust disease cycle."
      }
    ]
  },

  onion: {
    id: "onion",
    name: "Onion (प्याज़ / Ullipayalu)",
    scientificName: "Allium cepa",
    icon: "🧅",
    category: "vegetables",
    season: "Kharif / Late Kharif / Rabi",
    durationDays: 125,
    currentDaySample: 50,
    currentStageKey: "bulb_formation",
    soilPreference: "Deep Friable Sandy Loam or Silt Loam Rich in Humus with Excellent Drainage",
    phRange: "6.2 – 7.0",
    targetYield: "100 – 140 Quintals / Acre",
    mspValue: "Market Driven (₹1,800 – ₹3,200 / Quintal Wholesale APMC)",
    waterRequirement: "550 – 700 mm (Frequent Light Irrigations; Drip/Micro-Sprinkler Ideal)",
    recommendedSpacing: "15 cm × 10 cm on Flat Beds or Raised Broad Beds (BBF)",
    totalFertilizerDose: "40 kg N : 20 kg P₂O₅ : 20 kg K₂O + 20 kg Sulphur per Acre",

    lifecyclePlan: [
      {
        phaseId: "nursery_transplanting",
        dayRange: "Day -45 to Day 0",
        stageName: "Nursery Raising, Seedling Root Dip & Field Transplanting",
        badge: "Transplanting",
        tasks: [
          "Raise nursery for 40–45 days; healthy seedlings should be pencil-thick (6–8 mm diameter).",
          "Cut top 1/3rd of seedling foliage before transplanting to reduce transpiration water loss.",
          "Root Dip Treatment: Dip seedling roots for 15 minutes in Carbendazim (1 g/L) + Imidacloprid (0.5 ml/L) solution before planting.",
          "Transplant on raised beds at 15 cm row-to-row and 10 cm plant-to-plant spacing.",
          "Apply Basal Fertilizer: DAP 45 kg + MOP 35 kg + Urea 20 kg + Sulphur 20 kg per acre."
        ],
        irrigationAdvice: "Give immediate light irrigation on day of transplanting and follow with 'life irrigation' on 3rd day.",
        keyTip: "Never plant overgrown seedlings with premature bulb formation; they bolt into seed stalks and ruin market bulb quality."
      },
      {
        phaseId: "establishment",
        dayRange: "Day 1 to Day 30",
        stageName: "Root Anchor, Weed Control & First Nitrogen Top-Dress",
        badge: "Establishment",
        tasks: [
          "Pre-emergence / Early Post Herbicide: Spray Oxyfluorfen 23.5% EC @ 150 ml/acre within 3 days of transplanting.",
          "Hand weeding at Day 25 to remove stubborn weeds.",
          "First Nitrogen Top-Dressing at Day 30: Apply 30 kg Urea per acre followed by light watering.",
          "Inspect leaf axils for tiny yellow Thrips nymphs."
        ],
        irrigationAdvice: "Irrigate every 5–7 days in sandy loam soils.",
        keyTip: "Onion has shallow root systems (top 15–20 cm); shallow frequent watering is far superior to heavy flood soaking."
      },
      {
        phaseId: "bulb_formation",
        dayRange: "Day 31 to Day 75",
        stageName: "Foliar Vigor, Thrips Eradication & Bulb Bulking (CURRENT ACTIVE STAGE)",
        badge: "Bulb Sizing",
        tasks: [
          "THRIPS DEFENSE: Inspect inner leaf folds for Thrips tabaci causing white silvery streaks and leaf curling.",
          "Spray Fipronil 5% SC @ 1.5 ml/L OR Spinetoram 11.7% SC @ 0.8 ml/L + Sticker/Spreader (0.5 ml/L).",
          "Apply Second Nitrogen Split at Day 50: Apply 25 kg Urea + 15 kg Potash per acre.",
          "Foliar Nutrition: Spray 19-19-19 @ 5 g/L + Boron 20% @ 1 g/L to stimulate bulb expansion."
        ],
        irrigationAdvice: "CRITICAL: Maintain uniform moisture. Fluctuating wet and dry soil cycles causes split/double bulbs.",
        keyTip: "Always mix a non-ionic wetting sticker (e.g. Silwet/APSA) when spraying onions; waxy upright leaves cause spray droplets to bounce off."
      },
      {
        phaseId: "bulb_maturation",
        dayRange: "Day 76 to Day 105",
        stageName: "Bulb Sizing, Purple Blotch Defense & Water Tapering",
        badge: "Bulb Maturation",
        tasks: [
          "Scout for Purple Blotch (Alternaria porri): water-soaked sunken lesions turning purplish on leaf blades.",
          "Spray Tebuconazole + Trifloxystrobin (Nativo) @ 0.7 g/L or Azoxystrobin @ 1 ml/L.",
          "Spray Sulphate of Potash (0-0-50) @ 10 g/L at Day 85 to thicken bulb scales and build rich pink/red skin color.",
          "STOP all chemical nitrogen application after Day 70 to prevent soft bulbs with thick necks."
        ],
        irrigationAdvice: "Reduce watering frequency as bulb neck softens.",
        keyTip: "Late nitrogen after 70 days prevents neck closure, causing thick-necked 'bullhead' onions that rot quickly in storage."
      },
      {
        phaseId: "harvest_curing",
        dayRange: "Day 106 to Day 125",
        stageName: "Neck Fall (50%), Harvesting & Field Curing",
        badge: "Curing & Storage",
        tasks: [
          "HARVEST TIMING: Harvest strictly when 50% to 70% of plant tops soften and fall over ('neck fall').",
          "STOP IRRIGATION completely 12–15 days prior to harvest to dry out outer scales and enhance storage life.",
          "Pull bulbs manually; avoid wounding bulb scales with tools.",
          "FIELD CURING: Windrow bulbs in field for 3–5 days covered with tops so direct scorching sun does not sun-scald bulbs.",
          "Cut tops leaving 2.5 cm neck; store in well-ventilated dry onion storage structures."
        ],
        irrigationAdvice: "Zero water 15 days before harvest.",
        keyTip: "Leaving 2.5 cm dry neck prevents fungal neck rot (Botrytis) from penetrating into the bulb during monsoon storage."
      }
    ],

    pesticideProtocols: [
      {
        id: "pest_onion_thrips",
        targetCategory: "Insect Pest",
        targetName: "Onion Thrips (Thrips tabaci)",
        severity: "Critical Threat",
        symptoms: "Silvery white blotches and sunken patches along leaf blades; leaf tips curl, brown, and dry up; bulb size severely reduced.",
        chemicalSolution: "Spinetoram 11.7% SC @ 0.8 ml/L (160 ml/acre) OR Fipronil 5% SC @ 1.5 ml/L (300 ml/acre) + Sticker @ 0.5 ml/L",
        timing: "Spray when 10–15 thrips per plant are spotted in central leaf sheath axils.",
        waitingPeriodDays: 14,
        organicAlternative: "Spray Verticillium lecanii @ 5 g/L + Neem oil 10,000 ppm @ 2 ml/L. Install 15 Blue Sticky Traps per acre.",
        safetyPrecaution: "Must use surfactant/silicone sticker; onion leaf wax deflects 70% of standard water sprays."
      },
      {
        id: "dis_purple_blotch",
        targetCategory: "Fungal Disease",
        targetName: "Purple Blotch (Alternaria porri) & Stemphylium Blight",
        severity: "Severe Hazard",
        symptoms: "Small water-soaked sunken lesions on leaves and seed stalks that enlarge, turn dark purple with yellow chlorotic halos, and snap leaves in half.",
        chemicalSolution: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1 ml/L OR Mancozeb 75% WP @ 2.5 g/L",
        timing: "Spray at first appearance of purple leaf flecks during cloudy/rainy weather.",
        waitingPeriodDays: 15,
        organicAlternative: "Spray Trichoderma viride @ 5 g/L + 1% Bordeaux mixture.",
        safetyPrecaution: "Ensure morning application; allow foliage to dry before sunset to minimize fungal spore germination."
      }
    ]
  },

  potato: {
    id: "potato",
    name: "Potato (आलू / Bangaladumpa)",
    scientificName: "Solanum tuberosum",
    icon: "🥔",
    category: "vegetables",
    season: "Rabi (October – February)",
    durationDays: 95,
    currentDaySample: 40,
    currentStageKey: "tuber_bulking",
    soilPreference: "Deep, Loose, Friable Sandy Loam Rich in Organic Humus (Free from Stones & Clods)",
    phRange: "5.5 – 6.5 (Slightly Acidic Soils Suppress Potato Common Scab)",
    targetYield: "100 – 150 Quintals / Acre",
    mspValue: "Market Driven (₹1,200 – ₹2,400 / Quintal Wholesale APMC)",
    waterRequirement: "450 – 550 mm (Furrow or Drip; Sensitive to Drought at Tuber Initiation)",
    recommendedSpacing: "60 cm × 20 cm on Ridges (Maintain 33,000 hills/acre)",
    totalFertilizerDose: "60 kg N : 40 kg P₂O₅ : 48 kg K₂O per Acre (Heavy Feeder)",

    lifecyclePlan: [
      {
        phaseId: "seed_cutting_planting",
        dayRange: "Day -5 to Day 0",
        stageName: "Seed Tuber Sprouting, Fungicidal Dip & Ridge Planting",
        badge: "Planting & Basal",
        tasks: [
          "Select certified disease-free cold storage seed tubers (35–45 mm diameter, 40–50 g weight with 2–3 sprouted eyes).",
          "Remove tubers from cold store 7–10 days before planting to break dormancy and sprout green eyes in diffused light.",
          "Tuber Treatment: Dip cut tubers in Mancozeb 75% WP (2.5 g/L) for 10 minutes to heal cut surfaces and block Black Scurf/Rot.",
          "Apply Basal Fertilizer: 50% N (Urea 65 kg) + 100% P (SSP 250 kg) + 50% K (MOP 40 kg) placed in bands 5 cm away from tubers.",
          "Plant on ridges at 60 cm row-to-row and 20 cm plant spacing; cover with 6–8 cm loose soil."
        ],
        irrigationAdvice: "Pre-sowing furrow irrigation; never plant tubers in bone-dry hot soil.",
        keyTip: "Never plant freshly cut wet tubers directly into wet mud; allow cut surfaces to suberize (harden) in shade for 24h."
      },
      {
        phaseId: "emergence_earthing",
        dayRange: "Day 1 to Day 30",
        stageName: "Emergence, Weed Control & First Mandatory Earthing Up",
        badge: "Earthing-Up",
        tasks: [
          "Sprouts emerge within 10–14 days. Hoe inter-rows to break crust.",
          "FIRST EARTHING UP (Day 25–30): When plants reach 15–20 cm height, mound loose soil against the stem base to create broad ridges.",
          "Apply Second Nitrogen Split: Top dress remaining 50% Urea (65 kg/acre) + 50% MOP (40 kg) just before earthing up.",
          "Earthing up is mandatory to provide loose soil bed for underground stolons and prevent tubers from turning green."
        ],
        irrigationAdvice: "Irrigate every 7–8 days. Water level in furrows should never rise higher than 2/3rd ridge height.",
        keyTip: "Exposing developing tubers to sunlight triggers toxic Solanine synthesis, turning potatoes green and unmarketable."
      },
      {
        phaseId: "tuber_initiation",
        dayRange: "Day 31 to Day 60",
        stageName: "Stolon Hooking, Tuber Bulking & Late Blight Surveillance (CURRENT STAGE)",
        badge: "Tuber Bulking",
        tasks: [
          "Stolons swell into tubers (tuber initiation). Second light earthing up if soil has eroded.",
          "LATE BLIGHT RADAR (Phytophthora infestans): Check for water-soaked black spots with white cottony mildew under leaf margins.",
          "Preventive Blight Spray: Spray Mancozeb 75% WP @ 2.5 g/L or Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L immediately if cloudy overcast weather persists.",
          "Foliar Micronutrient: Spray 0.5% Zinc Sulphate + 0.2% Boron to stimulate skin setting."
        ],
        irrigationAdvice: "MOST CRITICAL IRRIGATION WINDOW: Maintain steady furrow moisture. Drought causes hollow heart and malformed knobby tubers.",
        keyTip: "Late Blight can wipe out an entire potato field in 4 days during foggy overcast weather (temperature 12–18°C, RH > 90%)."
      },
      {
        phaseId: "bulking_dehaulming",
        dayRange: "Day 61 to Day 85",
        stageName: "Rapid Tuber Bulking & Mandatory Dehaulming",
        badge: "Dehaulming",
        tasks: [
          "Spray Sulphate of Potash (0-0-50) @ 10 g/L at Day 65 to pump starch into tubers and thicken skin periderm.",
          "MANDATORY DEHAULMING (Day 80–85): Cut off all aboveground green foliage (haulms) with sickle or spray Paraquat herbicide 10–12 days prior to digging.",
          "Dehaulming arrests tuber growth at optimum commercial grade, cures tuber skin, and prevents Late Blight spores from infecting underground tubers."
        ],
        irrigationAdvice: "STOP ALL IRRIGATION immediately upon dehaulming.",
        keyTip: "Dehaulming hardens potato skins so they do not peel or bruise during harvesting, grading, and transport."
      },
      {
        phaseId: "digging_curing",
        dayRange: "Day 86 to Day 95",
        stageName: "Tuber Digging, Field Curing & Cool Grading",
        badge: "Harvest & Curing",
        tasks: [
          "Harvest 10–12 days after dehaulming when soil is friable and neither muddy nor bone-dry.",
          "Dig tubers with tractor-drawn potato digger or hand spades; avoid cutting tubers.",
          "Field Curing: Heap harvested potatoes in shade in a cool, ventilated shed for 10–15 days to heal skin abrasions.",
          "Grade tubers into Seed size (30–50 g), Table size (80–150 g), and Large size. Store in clean burlap bags."
        ],
        irrigationAdvice: "Zero water.",
        keyTip: "Never leave harvested potatoes exposed to direct midday sun in the field; sun-heated tubers rot in cold storage within weeks."
      }
    ],

    pesticideProtocols: [
      {
        id: "dis_late_blight",
        targetCategory: "Fungal / Oomycete Disease",
        targetName: "Late Blight of Potato (Phytophthora infestans)",
        severity: "Catastrophic Hazard",
        symptoms: "Water-soaked irregular blackish-brown lesions on leaves; white downy fungal growth on leaf undersides in high humidity; infected tubers show dry, granular, reddish-brown rot extending into flesh.",
        chemicalSolution: "Cymoxanil 8% + Mancozeb 64% WP (Curzate) @ 2.5 g/L OR Dimethomorph 50% WP @ 1 g/L + Mancozeb @ 2 g/L OR Metalaxyl-M + Mancozeb (Ridomil Gold) @ 2.5 g/L",
        timing: "Apply preventive spray before disease onset when foggy, overcast, drizzling weather is forecasted.",
        waitingPeriodDays: 14,
        organicAlternative: "Spray 1% Bordeaux mixture or Copper Oxychloride 50% WP @ 3 g/L preventively.",
        safetyPrecaution: "Spray entire canopy with high-pressure sprayer ensuring under-leaf coverage; repeat every 7 days during blight epidemics."
      },
      {
        id: "pest_potato_tuber_moth",
        targetCategory: "Insect Pest",
        targetName: "Potato Tuber Moth (Phthorimaea operculella) & Aphids",
        severity: "Severe Hazard",
        symptoms: "Caterpillars mine leaves causing blister blotches; crawl through soil cracks into exposed tubers making dirty frass-filled galleries.",
        chemicalSolution: "Chlorantraniliprole 18.5% SC @ 0.3 ml/L OR Emamectin Benzoate 5% SG @ 0.4 g/L",
        timing: "Spray foliage at first sign of leaf mines; ensure deep earthing-up to prevent tuber exposure.",
        waitingPeriodDays: 14,
        organicAlternative: "Cover stored seed potatoes with a 2.5 cm layer of dried Lantana camara or Eucalyptus leaves.",
        safetyPrecaution: "Never allow soil cracking during tuber bulking; keep ridges well-earthed up to bury tubers at least 8 cm deep."
      }
    ]
  }
};


