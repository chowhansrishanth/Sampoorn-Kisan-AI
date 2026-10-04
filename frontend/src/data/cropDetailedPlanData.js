/**
 * Detailed Day-Wise Cultivation Milestones, Economics, Water Sensitivity & Tank-Mix Rules
 * Aligned with ICAR (Indian Council of Agricultural Research) & State Agricultural Universities
 */

export const CROP_DETAILED_MILESTONES = {
  cotton: [
    {
      day: 0,
      title: "Field Preparation, Basal Dosing & Sowing",
      phase: "Pre-Sowing",
      category: "Soil & Fertilizer",
      priority: "Mandatory",
      action: "Sow Bt hybrid seeds at 90 cm × 60 cm (light soil) or 120 cm × 45 cm (black soil) on ridges. Apply basal DAP (50 kg) + MOP (25 kg) + Urea (15 kg) per acre.",
      irrigation: "Pre-sowing soaking irrigation (Rouni) to achieve field moisture capacity.",
      protection: "Treat seeds with Azotobacter & PSB bio-fertilizers (10 g/kg seed) before dibbling."
    },
    {
      day: 7,
      title: "Seedling Emergence & Stand Inspection",
      phase: "Germination",
      category: "Field Inspection",
      priority: "High Priority",
      action: "Check field for uniform germination. Seedlings should show two cotyledonary green leaves.",
      irrigation: "Light furrow moisture only; avoid water pooling around young collars.",
      protection: "Inspect soil line for cutworms or damping-off fungus."
    },
    {
      day: 12,
      title: "Gap Filling (Dibbling) to Guarantee 100% Population",
      phase: "Stand Establishment",
      category: "Crop Care",
      priority: "Mandatory",
      action: "Dibble pre-soaked spare seeds in empty gaps where germination failed to ensure 7,400 plants/acre.",
      irrigation: "Spot-water dibbled gap seeds.",
      protection: "Spray Pendimethalin 30% EC @ 1.0 L/acre within 48h if weeds threaten early emergence."
    },
    {
      day: 20,
      title: "First Inter-Cultivation & Weed Eradication",
      phase: "Early Vegetative",
      category: "Weed Control",
      priority: "High Priority",
      action: "Run tractor/bullock blade harrow between 90 cm rows to remove weeds and create soil dust mulch.",
      irrigation: "Irrigate 2 days after inter-cultivation.",
      protection: "Post-emergence spray: Quizalofop-ethyl 5% EC @ 2 ml/L (for grasses) or Pyrithiobac @ 1.5 ml/L (for broadleaf weeds)."
    },
    {
      day: 30,
      title: "First Nitrogen Top-Dressing & Sucking Pest Scouting",
      phase: "Active Vegetative",
      category: "Fertilizer & Nutrition",
      priority: "Mandatory",
      action: "Apply First Split Nitrogen: Broadcast 35 kg Neem-Coated Urea per acre 6 cm away from plant stems.",
      irrigation: "Follow immediately with light furrow irrigation to dissolve urea.",
      protection: "Install 5 Yellow Sticky Traps/acre. If jassids/whiteflies > 5/leaf, spray Diafenthiuron 50% WP @ 1.25 g/L."
    },
    {
      day: 45,
      title: "Apical Shoot Nipping & Micronutrient Spray (CURRENT ACTIVE STAGE)",
      phase: "Squaring & Branching",
      category: "Crop Care / Nipping",
      priority: "High Priority",
      action: "Nip top 5 cm apical terminal bud if plant height exceeds 1 meter to stimulate heavy lateral fruit-bearing branches.",
      irrigation: "Maintain steady moisture; drought at Day 45–55 triggers heavy square dropping.",
      protection: "Install 5 Gossyplure Pheromone Traps for Pink Bollworm. Spray 1% Formula-4 (Zn, B, Fe, Mg) + 1% Urea."
    },
    {
      day: 60,
      title: "Second Nitrogen Split & Pink Bollworm ETL Surveillance",
      phase: "Peak Squaring",
      category: "Fertilizer & Pest Control",
      priority: "Mandatory",
      action: "Apply Second Split Nitrogen: Top-dress 30 kg Urea per acre at square initiation.",
      irrigation: "Furrow irrigation every 8–10 days.",
      protection: "Scout for rosette flowers. If trap catch exceeds 8 moths/night for 3 days, spray Chlorantraniliprole 18.5% SC @ 0.4 ml/L."
    },
    {
      day: 75,
      title: "Peak Flowering, Stop Boll Drop & Potash Split",
      phase: "Flowering & Boll Setting",
      category: "Yield Deciding",
      priority: "Critical Priority",
      action: "Apply remaining 50% Potash (MOP 25 kg/acre) + 20 kg Urea. Spray 2% DAP or Potassium Nitrate (13-0-45) @ 10 g/L.",
      irrigation: "MOST CRITICAL IRRIGATION: Moisture stress drops 35% of flowers; irrigate every 7 days.",
      protection: "Check for Grey Mildew / Cercospora leaf spot; spray Azoxystrobin + Difenoconazole @ 1 ml/L if overcast."
    },
    {
      day: 90,
      title: "Boll Maturation & Sulphate of Potash Foliar Dosing",
      phase: "Boll Development",
      category: "Foliar Nutrition",
      priority: "Recommended",
      action: "Spray Sulphate of Potash (0-0-50) @ 10 g/liter to pump carbohydrates into developing bolls for maximum lint micronaire.",
      irrigation: "Maintain alternate furrow irrigation.",
      protection: "Monitor for internal boll rot; avoid excessive late nitrogen that causes rank vegetative foliage."
    },
    {
      day: 110,
      title: "Late Season Boll Sizing & Irrigation Tapering",
      phase: "Maturation",
      category: "Irrigation & Health",
      priority: "High Priority",
      action: "Taper off irrigation to encourage green bolls to naturally mature and split open.",
      irrigation: "Light irrigation only if soil shows severe deep cracking.",
      protection: "Check for late Spodoptera armyworm on foliage; handpick large caterpillars."
    },
    {
      day: 130,
      title: "First Cotton Picking Flush & Quality Sorting",
      phase: "Harvesting",
      category: "Harvest",
      priority: "Mandatory",
      action: "Stop irrigation 15 days before picking. Pick clean, fully burst fluffy cotton bolls in morning after dew dries.",
      irrigation: "ZERO irrigation during boll opening.",
      protection: "Store seed cotton in clean dry jute bags; avoid plastic bags to prevent fiber yellowing. Keep moisture < 8%."
    },
    {
      day: 155,
      title: "Final Picking Flush & Field Stalk Destruction",
      phase: "Post-Harvest Sanitation",
      category: "Sanitation",
      priority: "Mandatory",
      action: "Complete final picking. Shred cotton stalks immediately with tractor shredder to eradicate overwintering Pink Bollworm pupae.",
      irrigation: "None.",
      protection: "Never stack dry cotton stalks near the field during summer, as larvae hibernate in dried bolls."
    }
  ],

  paddy: [
    {
      day: 0,
      title: "Seed Selection & Nursery Seed Treatment",
      phase: "Nursery Setup",
      category: "Seed Priming",
      priority: "Mandatory",
      action: "Perform 10% brine salt water test; discard floating seeds. Treat selected seeds with Carbendazim (2g/kg) + Streptocycline (0.1g/kg) for 24h.",
      irrigation: "Soak seeds in clean water.",
      protection: "Sow in raised nursery beds (1m wide); apply Zinc Sulphate (2kg/100m²) to prevent Khaira disease."
    },
    {
      day: 7,
      title: "Nursery Seedling Health & Water Regulation",
      phase: "Nursery",
      category: "Irrigation",
      priority: "High Priority",
      action: "Maintain 1 cm shallow water layer in nursery ditches. Check for armyworm or seedling thrips.",
      irrigation: "Shallow ditch misting.",
      protection: "Spray 19-19-19 (3g/L) if seedlings appear pale yellow."
    },
    {
      day: 18,
      title: "Main Field Puddling & Basal Fertilizer Application",
      phase: "Field Preparation",
      category: "Soil & Fertilizer",
      priority: "Mandatory",
      action: "Puddle field twice with rotavator. Apply Basal: DAP 50 kg + MOP 25 kg + Zinc Sulphate (21%) @ 15 kg per acre.",
      irrigation: "Maintain 3 cm standing water for puddling.",
      protection: "Never mix Zinc Sulphate directly with DAP (forms insoluble zinc phosphate)."
    },
    {
      day: 21,
      title: "Transplanting Young Seedlings & Weed Control",
      phase: "Transplanting",
      category: "Establishment",
      priority: "Mandatory",
      action: "Transplant 18–22 day-old seedlings (2–3 per hill) at 20 cm × 15 cm. Spray Pretilachlor 50% EC @ 500 ml/acre within 48h.",
      irrigation: "Maintain 2 cm standing water for 7 days post-transplanting.",
      protection: "Avoid deep planting (>3 cm) which reduces tiller formation."
    },
    {
      day: 30,
      title: "Active Tillering & First Nitrogen Split",
      phase: "Tillering",
      category: "Fertilizer & Aeration",
      priority: "Mandatory",
      action: "Apply First Split: Broadcast 35 kg Urea per acre. Run cono-weeder to aerate root zone and incorporate green weeds.",
      irrigation: "Practice Alternate Wetting & Drying (AWD): allow water to drain until hair cracks appear, then re-flood.",
      protection: "Scout for Yellow Stem Borer dead hearts; install 4 pheromone traps/acre."
    },
    {
      day: 45,
      title: "Maximum Tillering & Stem Borer Control",
      phase: "Maximum Tillering",
      category: "Pest Control",
      priority: "High Priority",
      action: "Count tillers (target: 25–35 tillers/hill). Broadcast Chlorantraniliprole 0.4% G (Ferterra) @ 4 kg/acre in 2 cm standing water.",
      irrigation: "Maintain shallow 2 cm water layer for 48 hours after granule broadcast.",
      protection: "Check for leaf folder (folded leaves with transparent white streaks)."
    },
    {
      day: 60,
      title: "Panicle Initiation & Second Nitrogen Top-Dressing",
      phase: "Panicle Initiation",
      category: "Yield Deciding",
      priority: "Critical Priority",
      action: "Apply Second Split: 30 kg Urea + remaining 25 kg MOP per acre. Potash thickens stems and prevents lodging.",
      irrigation: "CRITICAL: Maintain continuous 3–5 cm water layer for these 10 days; drought causes empty chaffy grains.",
      protection: "Inspect leaf sheaths at waterline for Sheath Blight snake-skin lesions."
    },
    {
      day: 75,
      title: "Boot Leaf, Heading & Blast Disease Preventive",
      phase: "Heading & Flowering",
      category: "Disease Defense",
      priority: "High Priority",
      action: "Spray 1% Potassium Nitrate (13-0-45) @ 10 g/L for uniform panicle emergence. Spray Tricyclazole 75% WP @ 0.6 g/L for blast.",
      irrigation: "Maintain 2–3 cm water depth.",
      protection: "Form 1-foot alleyways every 2 meters to allow sunlight & breeze, preventing BPH flare-ups."
    },
    {
      day: 90,
      title: "Milk Stage & Brown Plant Hopper (BPH) Surveillance",
      phase: "Grain Filling",
      category: "Pest Surveillance",
      priority: "Critical Priority",
      action: "Check plant bases near waterline for Brown Plant Hopper nymphs. If > 10 hoppers/hill, spray Dinotefuran 20% SG @ 80 g/acre.",
      irrigation: "Shallow water only; do not flood.",
      protection: "Never spray synthetic pyrethroids (Cypermethrin), as they trigger catastrophic BPH resurgence."
    },
    {
      day: 105,
      title: "Dough Stage & Pre-Harvest Water Drainage",
      phase: "Maturation",
      category: "Water Drainage",
      priority: "Mandatory",
      action: "Drain all standing water from the field completely 12–15 days prior to harvest to harden soil for harvesters.",
      irrigation: "ZERO irrigation; field must dry completely.",
      protection: "Protect ripening crop against birds during early morning and late evening."
    },
    {
      day: 130,
      title: "Harvesting, Threshing & Safe Grain Storage",
      phase: "Harvest & Storage",
      category: "Harvest",
      priority: "Mandatory",
      action: "Harvest when 85% panicles turn golden yellow and grain moisture is 18–20%. Sun-dry on clean tarpaulin to 12–13% moisture.",
      irrigation: "None.",
      protection: "Mix shade-cured neem leaves (2 kg per 100 kg grain) inside gunny bags to stop rice weevils."
    }
  ],

  maize: [
    {
      day: 0,
      title: "Ridge Sowing, Basal Nutrition & Pre-Emergence Herbicide",
      phase: "Sowing",
      category: "Sowing & Weed Control",
      priority: "Mandatory",
      action: "Sow hybrid seeds at 60 cm × 20 cm on ridges at 4–5 cm depth. Basal DAP 50 kg + MOP 20 kg + Urea 15 kg/acre. Spray Atrazine 50% WP @ 500 g/acre within 48h.",
      irrigation: "Pre-sowing soaking or light furrow watering immediately after dibbling.",
      protection: "Seed treatment with Thiamethoxam 30% FS @ 4 ml/kg seed for shoot fly defense."
    },
    {
      day: 15,
      title: "Seedling Establishment & Fall Armyworm (FAW) Scout",
      phase: "Seedling",
      category: "Pest Surveillance",
      priority: "High Priority",
      action: "Check for FAW pinholes and papery window-paning on leaves. Drop wood ash + fine sand (1:9) into central whorls.",
      irrigation: "Furrow irrigation every 10–12 days.",
      protection: "If FAW larvae spotted, spray Chlorantraniliprole 18.5% SC @ 0.4 ml/L directed into central whorls."
    },
    {
      day: 30,
      title: "Knee-High Stage, First Urea Split & Earthing Up",
      phase: "Vegetative",
      category: "Fertilizer & Root Support",
      priority: "Mandatory",
      action: "First Top-Dressing: Apply 35 kg Urea per acre 10 cm away from stems. Earth up soil around plant bases to anchor brace roots against wind lodging.",
      irrigation: "Irrigate 1 day after earthing up.",
      protection: "Never allow water stagnation (>12h) in maize; ensure clear drainage furrows."
    },
    {
      day: 50,
      title: "Pre-Tasseling Stage & Second Nitrogen Split",
      phase: "Pre-Tasseling",
      category: "Nutrition",
      priority: "Mandatory",
      action: "Second Split: Apply 30 kg Urea per acre just prior to tassel emergence. Spray Zinc Sulphate (0.5%) + Boron (0.2%) for pollen vigor.",
      irrigation: "Maintain steady soil moisture.",
      protection: "Check for Turcicum leaf blight; spray Mancozeb 75% WP @ 2.5 g/L if cigar lesions appear."
    },
    {
      day: 65,
      title: "Tasseling & Silking Stage (MOST CRITICAL WATER WINDOW)",
      phase: "Pollination",
      category: "Water Critical",
      priority: "Critical Priority",
      action: "CRITICAL: Moisture stress at silking prevents cob fertilization and leads to barren ears. Maintain soil at field capacity.",
      irrigation: "Mandatory watering throughout the 15-day silking window.",
      protection: "Scout for cob borers entering the silk tips; spray Spinetoram 11.7% SC @ 0.5 ml/L if needed."
    },
    {
      day: 80,
      title: "Cob Grain Filling (Milk to Dough Stage)",
      phase: "Grain Filling",
      category: "Foliar Nutrition",
      priority: "High Priority",
      action: "Spray Sulphate of Potash (0-0-50) @ 10 g/liter to pump starch and increase kernel weight.",
      irrigation: "Irrigate every 8–10 days until dough stage solidifies.",
      protection: "Protect field borders from wild boars and stray cattle."
    },
    {
      day: 105,
      title: "Physiological Maturity, Cob Harvesting & Silage",
      phase: "Harvesting",
      category: "Harvest & Storage",
      priority: "Mandatory",
      action: "Harvest when husks turn papery white and black layer forms at kernel tips. Sun-dry cobs for 4 days before shelling. Store at <12% moisture.",
      irrigation: "Stop watering 15 days before harvest.",
      protection: "Chop remaining green stalks with chaff cutter for high-protein cattle silage."
    }
  ],

  tomato: [
    {
      day: 0,
      title: "Pro-Tray Nursery Sowing under 40-Mesh Insect Net",
      phase: "Nursery",
      category: "Seed Priming",
      priority: "Mandatory",
      action: "Sow hybrid seeds in 98-cavity pro-trays in coco-peat + vermicompost. Keep under 40-mesh insect net to block viral whiteflies.",
      irrigation: "Fine rose-can misting twice daily.",
      protection: "Drench pro-trays with Trichoderma viride (5g/L) on Day 5 to prevent damping-off."
    },
    {
      day: 25,
      title: "Raised Bed Preparation, Drip Mulching & Evening Transplanting",
      phase: "Transplanting",
      category: "Bed Setup",
      priority: "Mandatory",
      action: "Prepare 90 cm raised beds with inline drip. Lay 25-micron silver-black plastic mulch. Transplant in evening at 60 cm spacing.",
      irrigation: "Run drip for 45 minutes immediately after planting.",
      protection: "Dip seedling roots in Imidacloprid (0.5 ml/L) for 15 minutes before transplanting to immunize against early vectors."
    },
    {
      day: 35,
      title: "Bamboo Staking, Wire Trellising & Sucker Pruning",
      phase: "Staking & Trellis",
      category: "Canopy Training",
      priority: "Mandatory",
      action: "Erect bamboo poles and GI wire trellis. Prune all bottom suckers up to 20 cm from ground to maintain single/double main stems.",
      irrigation: "Daily drip irrigation (2–3 liters per plant).",
      protection: "Install 15 Yellow and 10 Blue Sticky Traps per acre."
    },
    {
      day: 50,
      title: "Early Flowering & Fertigation Regimen",
      phase: "Flowering",
      category: "Fertigation",
      priority: "High Priority",
      action: "Fertigation via Venturi: Inject 19-19-19 @ 3 kg/acre twice weekly. Spray 0.2% Boron (2g/L) to prevent flower drop.",
      irrigation: "Maintain even moisture; fluctuating water causes fruit cracking.",
      protection: "Spray Diafenthiuron 50% WP @ 1.25 g/L if whitefly nymphs appear."
    },
    {
      day: 65,
      title: "Fruit Setting & Blossom End Rot Prevention",
      phase: "Fruit Setting",
      category: "Nutrient Balance",
      priority: "Mandatory",
      action: "Fertigate Calcium Nitrate @ 2.5 kg/acre + Boron @ 250 g/acre to prevent Blossom End Rot (black sunken fruit bottoms).",
      irrigation: "Daily drip watering based on evapotranspiration.",
      protection: "Scout for Fruit Borer (Helicoverpa) and Pinworm (Tuta absoluta); spray Flubendiamide 39.35% SC @ 0.3 ml/L."
    },
    {
      day: 80,
      title: "Fruit Sizing & Foliar Potassium Boost",
      phase: "Fruit Growth",
      category: "Fruit Quality",
      priority: "High Priority",
      action: "Fertigate Potassium Nitrate (13-0-45) @ 3 kg/acre. Spray 0-52-34 @ 5 g/L to enhance fruit redness and firmness.",
      irrigation: "Keep drip lines clean and unclogged.",
      protection: "Spray Cymoxanil + Mancozeb @ 2.5 g/L if late blight grease lesions appear during cool foggy mornings."
    },
    {
      day: 95,
      title: "Breaker Stage Harvesting & Multi-Flush Picking",
      phase: "Harvesting",
      category: "Harvest & Sorting",
      priority: "Mandatory",
      action: "Harvest at 'Breaker' stage (pink tinge on bottom) for distant transit, or red-ripe for local mandis. Pick every 3–4 days in crates.",
      irrigation: "Light drip watering after each picking flush.",
      protection: "Never pack in rough gunny bags; use plastic crates with newspaper liners."
    }
  ],

  chilli: [
    {
      day: 0,
      title: "Protected Nursery Raising under Insect Net",
      phase: "Nursery",
      category: "Nursery",
      priority: "Mandatory",
      action: "Sow in 98-cavity pro-trays in sterilized media under 40-mesh insect net. Seed treatment with Trichoderma (10g/kg).",
      irrigation: "Rose-can misting twice a day.",
      protection: "Keep insect-proof mesh sealed to prevent virus-transmitting thrips."
    },
    {
      day: 30,
      title: "Raised Bed Mulch Transplanting & Border Crop Barrier",
      phase: "Transplanting",
      category: "Field Setup",
      priority: "Mandatory",
      action: "Transplant on silver-black mulch raised beds at 75 cm × 45 cm. Plant 3 dense outer border rows of tall maize/sorghum as insect barrier.",
      irrigation: "Run drip 45 minutes post-planting.",
      protection: "Dip roots in Pseudomonas fluorescens (10g/L) for systemic bio-defense."
    },
    {
      day: 45,
      title: "Terminal Shoot Nipping & Blue Sticky Trap Deployment",
      phase: "Branching",
      category: "Nipping & Pruning",
      priority: "Mandatory",
      action: "Nip terminal shoot at 45 DAS to trigger 12–15 productive secondary lateral branches. Install 20 Blue Sticky Traps per acre.",
      irrigation: "Maintain even furrow or drip moisture.",
      protection: "Blue traps attract thrips. If upward leaf curling starts, spray Spinetoram 11.7% SC @ 1 ml/L."
    },
    {
      day: 65,
      title: "Flowering Flush & Fertigation Nutrition",
      phase: "Flowering",
      category: "Fertigation",
      priority: "High Priority",
      action: "Fertigate 12-61-00 (MAP) @ 3 kg/acre + 13-0-45 @ 3 kg/acre weekly. Spray Boron (2g/L) to prevent flower shedding.",
      irrigation: "Drip watering every 4–5 days.",
      protection: "If leaves curl downwards (inverted cup), yellow mites are active; spray Spiromesifen 22.9% SC @ 1 ml/L."
    },
    {
      day: 85,
      title: "Green Chilli Picking & Anthracnose Die-Back Prevention",
      phase: "Green Harvest & Disease",
      category: "Harvest & Disease",
      priority: "High Priority",
      action: "First green chilli pickings begin. Spray Azoxystrobin + Difenoconazole @ 1 ml/L to prevent circular fruit rot and twig die-back.",
      irrigation: "Light drip watering after picking.",
      protection: "Remove all dried infected twigs manually before fungicide spray."
    },
    {
      day: 120,
      title: "Red Ripe Pod Harvest & Cemented Yard Drying",
      phase: "Dry Chilli Harvest",
      category: "Drying & Curing",
      priority: "Mandatory",
      action: "Pick dark red ripe chillies. Sun-dry on clean polythene tarpaulin or cemented yard for 8–10 days to 10% moisture (produces crisp shake sound).",
      irrigation: "Taper off watering between pickings.",
      protection: "Never dry directly on bare mud soil; mud dust destroys export price grade."
    }
  ],

  wheat: [
    {
      day: 0,
      title: "Seed Treatment & Zero-Till Seed Drill Sowing",
      phase: "Sowing",
      category: "Sowing & Nutrition",
      priority: "Mandatory",
      action: "Sow optimal window (Nov 5–25) with seed drill at 20 cm row spacing, 4–5 cm depth. Basal DAP (55 kg) + MOP (20 kg) + Urea (25 kg/acre).",
      irrigation: "Pre-sowing Paleva watering to ensure moist seedbed.",
      protection: "Seed treatment with Carboxin 37.5% + Thiram 37.5% DS @ 2.5 g/kg seed to prevent loose smut."
    },
    {
      day: 21,
      title: "CROWN ROOT INITIATION (CRI) - MOST CRITICAL IRRIGATION",
      phase: "CRI Stage",
      category: "Water Critical",
      priority: "Critical Priority",
      action: "FIRST & MOST VITAL IRRIGATION: Crown roots establish now; missing this water cuts tillers by 35%. Top-dress 35 kg Urea/acre 2 days after irrigation.",
      irrigation: "Mandatory watering between Day 20 and Day 25 without fail.",
      protection: "Inspect for termites in sandy soils; drench Chlorpyrifos 20% EC @ 1.5 L/acre if termites seen."
    },
    {
      day: 35,
      title: "Post-Emergence Weed Control (Phalaris & Broadleaf)",
      phase: "Weed Control",
      category: "Weed Management",
      priority: "Mandatory",
      action: "Spray Clodinafop-propargyl 15% WP @ 160 g/acre (for Gulli Danda) + Metsulfuron Methyl 20% WP @ 8 g/acre (for broadleaf weeds).",
      irrigation: "Apply when soil has good moisture.",
      protection: "Never spray weedicides when soil is bone dry or temperature is below 15°C."
    },
    {
      day: 45,
      title: "Jointing Stage, Second Urea Split & Frost Defense",
      phase: "Jointing",
      category: "Fertilizer & Frost",
      priority: "High Priority",
      action: "Second Split: Broadcast 30 kg Urea/acre. If night temperature falls below 4°C, give a light evening irrigation to raise soil temperature.",
      irrigation: "Second irrigation at jointing stage (40–45 DAS).",
      protection: "Foliar spray of 0.1% Thiourea (1g/L) helps wheat tolerate severe winter cold waves."
    },
    {
      day: 65,
      title: "Boot Leaf Stage, Terminal Heat Defense & Yellow Rust Scout",
      phase: "Boot Leaf & Heading",
      category: "Heat Defense",
      priority: "Critical Priority",
      action: "Spray 1% Potassium Nitrate (13-0-45) @ 10 g/L or 2% Urea to shield developing grains from premature March heat waves.",
      irrigation: "Third irrigation at flowering/heading on calm, non-windy days to prevent lodging.",
      protection: "Inspect leaves for bright yellow stripe rust pustules; spray Propiconazole 25% EC (Tilt) @ 1 ml/L at first sign."
    },
    {
      day: 85,
      title: "Milking & Grain Hardening Stage",
      phase: "Grain Filling",
      category: "Yield Protection",
      priority: "High Priority",
      action: "Fourth irrigation at milking stage to plump up kernels. Spray 0-0-50 Sulphate of Potash @ 10 g/L.",
      irrigation: "Light irrigation only; avoid waterlogging.",
      protection: "Check for aphid colonies on wheat ears; spray Thiamethoxam 25% WG @ 0.3 g/L if ETL exceeded."
    },
    {
      day: 110,
      title: "Dough Stage, Pre-Harvest Cutoff & Combine Harvesting",
      phase: "Harvesting",
      category: "Harvest & Storage",
      priority: "Mandatory",
      action: "Cut off all irrigation when grains turn hard. Combine harvest when grain moisture is below 14%. Store at <12% moisture with neem leaves.",
      irrigation: "ZERO irrigation.",
      protection: "Do not burn wheat straw; incorporate with Super Seeder to replenish soil organic carbon."
    }
  ],

  redgram: [
    {
      day: 0,
      title: "Rhizobium Bio-Inoculation & Broad Bed Furrow (BBF) Sowing",
      phase: "Sowing",
      category: "Bio-Inoculation",
      priority: "Mandatory",
      action: "Treat seed with Rhizobium culture + Trichoderma viride (10 g/kg seed) in jaggery slurry; dry in shade. Apply DAP 40 kg + Single Super Phosphate (SSP) 50 kg/acre.",
      irrigation: "Pre-sowing moisture is sufficient.",
      protection: "Never apply heavy urea to pulses; synthetic nitrogen stops nitrogen-fixing root nodules from forming."
    },
    {
      day: 20,
      title: "First Inter-Cultivation & Weed Management",
      phase: "Early Vegetative",
      category: "Inter-Cultivation",
      priority: "High Priority",
      action: "Run blade harrow between 120 cm rows to remove weeds and create soil dust mulch that conserves moisture.",
      irrigation: "Rainfed crop; spot water only if dry spell exceeds 20 days.",
      protection: "Inspect seedlings for early collar rot; drench Carbendazim (1g/L) if damping-off occurs."
    },
    {
      day: 45,
      title: "TERMINAL SHOOT NIPPING (HIGHEST ROI PRACTICE)",
      phase: "Nipping Stage",
      category: "Pruning & Nipping",
      priority: "Critical Priority",
      action: "Clip top 5 cm of terminal apical shoots with hand shears. Nipping forces secondary and tertiary lateral branches, doubling pod cluster sites.",
      irrigation: "Rainfed.",
      protection: "Nipping is the single most profitable practice in Red Gram, increasing yield by 25–30%."
    },
    {
      day: 65,
      title: "Flower Bud Induction & Pheromone Trap Setup",
      phase: "Flower Bud Stage",
      category: "Pest Surveillance",
      priority: "High Priority",
      action: "Install 5 Helicoverpa pheromone traps per acre. One protective irrigation at flower bud opening is non-negotiable.",
      irrigation: "CRITICAL: One protective irrigation at flower initiation.",
      protection: "Scout for spotted pod borer (Maruca) webbing on flower clusters."
    },
    {
      day: 85,
      title: "50% Flowering, Foliar Nutrition & Pod Borer Protection",
      phase: "Flowering & Pod Set",
      category: "Protection & Yield",
      priority: "Critical Priority",
      action: "Spray 1% Pulse Wonder or 2% Urea + 0.2% Boron at 50% flowering to halt flower drop. Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L.",
      irrigation: "Maintain soil moisture.",
      protection: "Never spray during peak sunny afternoon; spray between 7:00 AM and 10:00 AM."
    },
    {
      day: 115,
      title: "Pod Filling & Sulphate of Potash Spray",
      phase: "Pod Filling",
      category: "Foliar Nutrition",
      priority: "High Priority",
      action: "Spray 0-0-50 Sulphate of Potash @ 10 g/L at pod filling to plump up pulse grains.",
      irrigation: "Protective watering if severe drought persists.",
      protection: "Check for Pod Fly maggots inside pods; spray Monocrotophos or Dimethoate if damage seen."
    },
    {
      day: 160,
      title: "Pod Maturation, Upright Sun Curing & Threshing",
      phase: "Harvesting",
      category: "Harvest & Storage",
      priority: "Mandatory",
      action: "Harvest when 85% of pods turn dark brown. Cut plants at base, bundle and stack upright in sun for 4 days before threshing. Store at <9% moisture.",
      irrigation: "None.",
      protection: "Sun-dry grains to 9% moisture before storage to prevent Pulse Beetle (Callosobruchus) attack."
    }
  ],

  soybean: [
    {
      day: 0,
      title: "Seedbed Prep, BBF Bedding & Rhizobium Sowing",
      phase: "Sowing",
      category: "Soil & Sowing",
      priority: "Mandatory",
      action: "Form Broad Bed and Furrows (1.2m beds). Treat seed with Bradyrhizobium japonicum + PSB slurry (5g/kg). Sow at 45×5 cm. Apply basal DAP 50 kg + MOP 25 kg + Sulphur 10 kg/acre.",
      irrigation: "Sow in good soil moisture after at least 75 mm monsoon rain.",
      protection: "Never sow deeper than 3–4 cm to prevent seedling hypocotyl rot."
    },
    {
      day: 5,
      title: "Emergence Inspection & Pre-Emergence Herbicide",
      phase: "Germination",
      category: "Weed Control",
      priority: "High Priority",
      action: "Check uniform seedling emergence. Target 18–20 plants per linear meter.",
      irrigation: "Ensure surface drains are open to shed torrential rain excess.",
      protection: "Spray Pendimethalin 38.7% CS @ 700 ml/acre within 48h of sowing."
    },
    {
      day: 20,
      title: "Inter-Cultivation & Weed Eradication",
      phase: "Vegetative",
      category: "Weed Control",
      priority: "Recommended",
      action: "Run bullock or tractor wheel hoe between 45 cm rows to aerate soil and eliminate weeds.",
      irrigation: "Rainfed crop; furrow irrigation only if dry spell exceeds 15 days.",
      protection: "Spray Quizalofop-ethyl 5% EC @ 300 ml/acre if grass weeds dominate."
    },
    {
      day: 28,
      title: "Root Nodulation & Nitrogen Fixation Check",
      phase: "Nodulation",
      category: "Crop Care",
      priority: "High Priority",
      action: "Uproot 3 plants gently and slice nodules; active nodules must show red/pink internal pigmentation.",
      irrigation: "Maintain soil moisture for bacterial nodule longevity.",
      protection: "Install 5 yellow sticky traps/acre to monitor whitefly vector of YMV."
    },
    {
      day: 40,
      title: "Flower Induction & Boron Foliar Nutrition (ACTIVE STAGE)",
      phase: "Flowering",
      category: "Nutrition & Protection",
      priority: "Critical Priority",
      action: "Spray 19-19-19 Soluble NPK @ 5 g/L + Boron 20% @ 1 g/L to stimulate profuse flower retention.",
      irrigation: "CRITICAL: Moisture stress drops 40% flowers; give protective furrow irrigation.",
      protection: "Chlorantraniliprole 18.5% SC @ 0.3 ml/L if girdle beetle rings or semiloopers appear."
    },
    {
      day: 60,
      title: "Pod Development & Potassium Spray",
      phase: "Pod Formation",
      category: "Nutrition",
      priority: "High Priority",
      action: "Spray Potassium Nitrate (13-0-45) @ 10 g/L or 0-0-50 Sulphate of Potash @ 10 g/L for high seed test weight.",
      irrigation: "Furrow irrigation if monsoon rain pauses.",
      protection: "Rogue out and destroy yellow mosaic virus (YMV) crinkled plants."
    },
    {
      day: 75,
      title: "Pod Bulking & Spodoptera Defense",
      phase: "Seed Filling",
      category: "Pest Management",
      priority: "High Priority",
      action: "Scout pod borer and leaf eating caterpillars. Handpick clusters of young Spodoptera larvae.",
      irrigation: "Maintain steady moisture; drought causes wrinkled undersized seeds.",
      protection: "Spray Emamectin Benzoate 5% SG @ 0.5 g/L if pod damage exceeds 5%."
    },
    {
      day: 95,
      title: "Defoliation, Pod Browning & Prompt Harvesting",
      phase: "Harvesting",
      category: "Harvest & Threshing",
      priority: "Mandatory",
      action: "Harvest when leaves drop and pods turn golden brown. Harvest promptly when grain rattles to avoid field shattering.",
      irrigation: "Zero water.",
      protection: "Thresh at low cylinder speed (350 RPM) to protect seed germination viability."
    }
  ],

  groundnut: [
    {
      day: 0,
      title: "Land Pulverization, Trichoderma Seed Dressing & Sowing",
      phase: "Sowing",
      category: "Soil & Sowing",
      priority: "Mandatory",
      action: "Pulverize sandy loam soil to 15 cm. Treat seed kernels with Trichoderma viride (10 g/kg) + Rhizobium. Sow at 30×10 cm. Apply SSP 125 kg + MOP 35 kg + Urea 15 kg/acre.",
      irrigation: "Pre-sowing soaking irrigation to ensure moist seedbed.",
      protection: "Prevent Collar Rot by avoiding seed coat cracking during shelling."
    },
    {
      day: 10,
      title: "Emergence Inspection & Dibble Gap Filling",
      phase: "Germination",
      category: "Stand Establishment",
      priority: "High Priority",
      action: "Check germination; dibble sprouted kernels in gaps by Day 10 to ensure 1.33 lakh plants/acre.",
      irrigation: "Light sprinkler/furrow moisture.",
      protection: "Spray Pendimethalin 30% EC within 48h of sowing for pre-emergence weed control."
    },
    {
      day: 22,
      title: "First Hand Weeding & Inter-Cultivation",
      phase: "Vegetative",
      category: "Weed Control",
      priority: "Mandatory",
      action: "Hand weed and run blade harrow between 30 cm rows to loosen surface crust for future peg entry.",
      irrigation: "Irrigate every 10–12 days.",
      protection: "Inspect for collar rot lesions at ground level."
    },
    {
      day: 42,
      title: "MANDATORY GYPSUM TOP-DRESSING (200 kg/acre) (ACTIVE STAGE)",
      phase: "Pegging",
      category: "Nutrition & Care",
      priority: "Critical Priority",
      action: "Broadcast 200 kg Agricultural Gypsum per acre around base of plants and incorporate into top 3 cm soil. STOP ALL HOEING AND BULLOCK HARROWING.",
      irrigation: "Immediate irrigation after gypsum to deliver calcium into the pegging zone.",
      protection: "Hoeing after 45 days cuts underground pegs and drops pod yield by 40%."
    },
    {
      day: 60,
      title: "Aerial Peg Entry & Steady Moisture Maintenance",
      phase: "Peg Penetration",
      category: "Water Management",
      priority: "High Priority",
      action: "Ensure topsoil remains soft so needle-like pegs penetrate smoothly into soil.",
      irrigation: "Maintain topsoil moisture; hard crusted soil blocks peg entry.",
      protection: "Scout for leaf miner and sucking thrips; spray Imidacloprid @ 0.3 ml/L if needed."
    },
    {
      day: 78,
      title: "Pod Bulking & Tikka Leaf Spot Defense",
      phase: "Pod Development",
      category: "Pest & Nutrition",
      priority: "High Priority",
      action: "Spray Tebuconazole 25.9% EC @ 1 ml/L or Hexaconazole 5% SC @ 2 ml/L against Tikka spot and rust.",
      irrigation: "Irrigate every 7–8 days during pod development.",
      protection: "Spray 1% Potassium Nitrate (13-0-45) to enhance pod filling."
    },
    {
      day: 95,
      title: "Pod Filling & Shell Hardening Check",
      phase: "Pod Maturation",
      category: "Crop Care",
      priority: "Recommended",
      action: "Pull 2 plants; inspect internal pod shell walls for dark brown coloration.",
      irrigation: "Taper off irrigation intervals.",
      protection: "Avoid water stagnation which causes pod rot and aflatoxin buildup."
    },
    {
      day: 112,
      title: "Maturity Harvest, Digging & Inverted Field Curing",
      phase: "Harvesting",
      category: "Harvest & Curing",
      priority: "Mandatory",
      action: "Give light irrigation 2 days prior to harvest. Dig pods, invert plants with pods facing sun for 3–5 days to dry kernels to 8% moisture.",
      irrigation: "None.",
      protection: "Never heap moist groundnut vines in heaps; leads to toxic Aflatoxin contamination."
    }
  ],

  chickpea: [
    {
      day: 0,
      title: "Post-Monsoon Moisture Conservation & Sowing",
      phase: "Sowing",
      category: "Soil & Sowing",
      priority: "Mandatory",
      action: "Sow certified seeds treated with Carbendazim (2g/kg) + Mesorhizobium ciceri & PSB cultures. Sow at 30×10 cm. Apply DAP 40 kg + MOP 15 kg + Sulphur 10 kg/acre in furrows.",
      irrigation: "Sow in conserved post-monsoon residual moisture.",
      protection: "Seed priming (soak 4h in water) accelerates uniform emergence in cold soil."
    },
    {
      day: 10,
      title: "Seedling Stand Inspection & Gap Dibbling",
      phase: "Germination",
      category: "Stand Establishment",
      priority: "High Priority",
      action: "Check uniform germination across field. Dibble spare seeds in empty patches.",
      irrigation: "Do NOT irrigate young seedlings; forcing roots deep builds drought tolerance.",
      protection: "Inspect soil surface for cutworm damage."
    },
    {
      day: 22,
      title: "First Hand Weeding & Inter-Row Cultivation",
      phase: "Vegetative",
      category: "Weed Control",
      priority: "Recommended",
      action: "Remove weeds before they compete for scarce soil moisture. Run shallow hand hoe between rows.",
      irrigation: "None (Rainfed/Residual moisture).",
      protection: "Spray Quizalofop-ethyl if narrow-leaf grass weeds invade."
    },
    {
      day: 32,
      title: "MANDATORY SHOOT NIPPING (Top 3 cm Clipping)",
      phase: "Branching",
      category: "Crop Care",
      priority: "Critical Priority",
      action: "Nip or clip the top 2–3 cm growing tips of main shoots. Nipping breaks apical dominance and stimulates 4–6 heavy secondary pod-bearing branches.",
      irrigation: "None.",
      protection: "Install 15 'T'-shaped bird perches/acre for predatory insectivorous birds."
    },
    {
      day: 45,
      title: "Flower Induction & Pod Borer Trapping (ACTIVE STAGE)",
      phase: "Flowering",
      category: "Protection & Nutrition",
      priority: "Critical Priority",
      action: "Install 5 Helicoverpa pheromone traps/acre. Spray 2% DAP (20 g/L) + 0.2% Boron (2 g/L) at flower initiation to halt flower shedding.",
      irrigation: "CRITICAL: Give ONE life-saving irrigation at pre-flowering. NEVER irrigate during full bloom.",
      protection: "Scout leaf undersides daily for small green Helicoverpa caterpillars."
    },
    {
      day: 65,
      title: "Pod Borer Surveillance & Chlorantraniliprole Spray",
      phase: "Pod Formation",
      category: "Pest Management",
      priority: "Critical Priority",
      action: "Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Emamectin Benzoate 5% SG @ 0.5 g/L if > 1 larva/meter row.",
      irrigation: "Light irrigation at early pod filling if black soil is cracking severely.",
      protection: "Always spray in late afternoon (4–6 PM) when larvae are actively feeding."
    },
    {
      day: 85,
      title: "Pod Filling & Terminal Heat Defense",
      phase: "Seed Filling",
      category: "Nutrition",
      priority: "High Priority",
      action: "Foliar spray of 1% Potassium Nitrate (13-0-45) to shield developing seeds against February heat spikes.",
      irrigation: "Stop all water.",
      protection: "Monitor for pod fly and late pod borer."
    },
    {
      day: 102,
      title: "Pod Desiccation, Morning Harvesting & Storage",
      phase: "Harvesting",
      category: "Harvest & Storage",
      priority: "Mandatory",
      action: "Harvest when 85% of leaves and pods turn golden-yellow and dry. Cut at base in morning. Sun-dry sheaves for 4 days before threshing.",
      irrigation: "None.",
      protection: "Mix neem oil (5 ml/kg seed) or inert sand layer to protect stored chana from pulse beetle."
    }
  ],

  sugarcane: [
    {
      day: 0,
      title: "Trench Opening, Sett Dip Treatment & Planting",
      phase: "Planting",
      category: "Soil & Planting",
      priority: "Mandatory",
      action: "Open deep trenches at 120 cm. Dip 2-budded healthy setts in Carbendazim (1 g/L) + Chlorpyrifos (2 ml/L) for 15 mins. Apply SSP 250 kg + MOP 20 kg + Urea 30 kg + Zinc 10 kg/acre.",
      irrigation: "Soaking irrigation in furrows; plant setts with buds facing laterally.",
      protection: "Never plant single-budded setts with buds facing upward or downward."
    },
    {
      day: 25,
      title: "Bud Sprouting & Pre-Emergence Herbicide",
      phase: "Germination",
      category: "Weed Control",
      priority: "High Priority",
      action: "Buds sprout within 15–20 days. Spray Atrazine 50% WP @ 1.0 kg/acre on moist soil within 3 days of planting.",
      irrigation: "Irrigate every 8–10 days in sandy loam soils.",
      protection: "Inspect for termite damage in cane setts; drench Chlorpyrifos if termites attack."
    },
    {
      day: 45,
      title: "First Split Nitrogen & Early Shoot Borer Defense",
      phase: "Tillering",
      category: "Nutrition & Protection",
      priority: "Critical Priority",
      action: "Top-dress 50 kg Urea/acre followed by furrow watering. Deploy 10 Trichogramma chilonis egg cards (50,000/acre) against Early Shoot Borer.",
      irrigation: "Furrow irrigation every 7–9 days during summer tillering.",
      protection: "Fipronil 0.3% GR @ 10 kg/acre in furrows if 'dead hearts' appear."
    },
    {
      day: 90,
      title: "Second Split Nitrogen & Inter-Cultivation",
      phase: "Active Tillering",
      category: "Nutrition & Soil",
      priority: "High Priority",
      action: "Top-dress 50 kg Urea + 30 kg MOP per acre. Inter-cultivate with power tiller to weed furrows.",
      irrigation: "Maintain steady furrow moisture.",
      protection: "Scout for Pyrilla and whitefly under leaves."
    },
    {
      day: 115,
      title: "FINAL EARTHING UP & TRASH MULCHING (ACTIVE STAGE)",
      phase: "Grand Growth",
      category: "Field Operations",
      priority: "Critical Priority",
      action: "FINAL EARTHING UP: Convert furrows into ridges around cane clumps to anchor strong roots and stop lodging. Spread dried cane trash (3 t/acre) in furrows.",
      irrigation: "Irrigate through newly formed inter-ridge furrows.",
      protection: "Un-earthed cane lodges flat during monsoon storms, losing 30% sugar weight."
    },
    {
      day: 150,
      title: "Final Potash Split, De-Trashing & Propping",
      phase: "Elongation",
      category: "Biomass Bulking",
      priority: "High Priority",
      action: "Apply final Potash split (MOP 30 kg) + 40 kg Urea. Strip off dried bottom leaves (de-trashing). Tie opposite cane clumps together (propping).",
      irrigation: "Peak water consumption window: irrigate every 6–8 days.",
      protection: "STOP ALL CHEMICAL NITROGEN after Day 150 to ensure high sucrose concentration."
    },
    {
      day: 220,
      title: "Grand Internode Growth & Internode Borer Monitoring",
      phase: "Cane Sizing",
      category: "Pest Management",
      priority: "Recommended",
      action: "Second de-trashing to maximize sunlight penetration. Tie clumps with dried leaves against cyclonic gales.",
      irrigation: "Irrigate every 10–12 days as weather cools.",
      protection: "Release Trichogramma chilonis against internode borer."
    },
    {
      day: 315,
      title: "Brix Refractometer Testing & Flush-to-Ground Harvesting",
      phase: "Harvesting",
      category: "Harvest & Mill Sale",
      priority: "Mandatory",
      action: "Test juice: crop is mature when Brix reaches 18–20%. Stop water 20 days prior to cutting. Cut flush at ground level (highest sugar in bottom 3 internodes).",
      irrigation: "Zero water 20 days before harvest.",
      protection: "Deliver to sugar mill within 24 hours to prevent sucrose inversion."
    }
  ],

  mustard: [
    {
      day: 0,
      title: "Seedbed Planking, Basal Sulphur & Line Sowing",
      phase: "Sowing",
      category: "Soil & Sowing",
      priority: "Mandatory",
      action: "Plough twice and run heavy wooden plank (Pata) to conserve soil moisture. Treat seed with Metalaxyl (6 g/kg). Sow at 30×10 cm (1.5 kg seed/acre). Apply DAP 35 kg + MOP 25 kg + Urea 25 kg + Sulphur 15 kg/acre.",
      irrigation: "Sow in good residual moisture; sowing depth 2–3 cm max.",
      protection: "Sulphur raises seed oil content by 2.5–3.0% and synthesizes essential glucosinolates."
    },
    {
      day: 18,
      title: "MANDATORY SEEDLING THINNING to 10 cm Spacing",
      phase: "Stand Establishment",
      category: "Mandatory Care",
      priority: "Critical Priority",
      action: "PULL OUT EXCESS SEEDLINGS to maintain strict 10–12 cm spacing between plants in rows. Remove weak spindly seedlings.",
      irrigation: "None before thinning.",
      protection: "Overcrowding cuts yield by 40%. One vigorous plant every 10 cm is vital."
    },
    {
      day: 25,
      title: "First Irrigation (Rosette Stage) & Urea Top-Dress",
      phase: "Vegetative",
      category: "Irrigation & Nutrition",
      priority: "Critical Priority",
      action: "FIRST CRITICAL IRRIGATION at 25–28 DAS. Broadcast 30 kg Urea/acre immediately before watering.",
      irrigation: "Light furrow irrigation (avoid waterlogging young seedlings).",
      protection: "First hand weeding to eliminate competing broadleaf weeds."
    },
    {
      day: 40,
      title: "Full Yellow Bloom & Mustard Aphid Radar (ACTIVE STAGE)",
      phase: "Flowering",
      category: "Pest Management",
      priority: "Critical Priority",
      action: "Scout terminal shoots daily for Mustard Aphid colonies (Lipaphis erysimi). Spray Dimethoate 30% EC @ 1.5 ml/L or Thiamethoxam 25% WG @ 0.4 g/L if colony > 1 cm on 20% plants.",
      irrigation: "SECOND CRITICAL IRRIGATION at siliqua initiation (50 DAS).",
      protection: "SPRAY ONLY AFTER 3:30 PM IN THE EVENING to protect foraging honeybees."
    },
    {
      day: 65,
      title: "Siliqua Elongation & Alternaria Blight Defense",
      phase: "Siliqua Formation",
      category: "Disease Control",
      priority: "High Priority",
      action: "Scout for Alternaria Blight brown concentric spots on leaves and pods. Spray Mancozeb 75% WP @ 2.5 g/L or Azoxystrobin @ 1 ml/L.",
      irrigation: "Maintain light moisture; avoid heavy irrigation during strong winds to prevent lodging.",
      protection: "Spray 1% Potassium Nitrate (13-0-45) to shield against sudden heat spikes."
    },
    {
      day: 85,
      title: "Seed Bulking & Water Cutoff",
      phase: "Seed Filling",
      category: "Water Management",
      priority: "Recommended",
      action: "Pods swell with developing oilseeds. Stop all irrigation once siliquae turn light yellow-green.",
      irrigation: "Zero irrigation.",
      protection: "Watch out for powdery mildew; spray wettable sulphur 80% WP @ 2 g/L if white powder appears."
    },
    {
      day: 110,
      title: "Morning Harvesting, Pod Sun Drying & Threshing",
      phase: "Harvesting",
      category: "Harvest & Threshing",
      priority: "Mandatory",
      action: "Harvest when 75–80% of siliquae turn golden-yellow and seeds turn brownish-black. Harvest early morning when dew prevents pod shattering.",
      irrigation: "None.",
      protection: "Dry harvested seeds to 8% moisture before storing in clean dry bins."
    }
  ],

  onion: [
    {
      day: 0,
      title: "Broad Bed Prep, Seedling Root Dip & Transplanting",
      phase: "Transplanting",
      category: "Planting & Basal",
      priority: "Mandatory",
      action: "Transplant 40-day old pencil-thick seedlings at 15×10 cm on broad beds. Trim top 1/3rd foliage. Dip roots in Carbendazim (1 g/L) + Imidacloprid (0.5 ml/L) for 15 mins. Apply DAP 45 kg + MOP 35 kg + Urea 20 kg + Sulphur 20 kg/acre.",
      irrigation: "Immediate light irrigation on planting day followed by life irrigation on 3rd day.",
      protection: "Never plant overgrown seedlings with premature bulb formation (they bolt into seed stalks)."
    },
    {
      day: 15,
      title: "Establishment & Early Post Herbicide",
      phase: "Establishment",
      category: "Weed Control",
      priority: "High Priority",
      action: "Spray Oxyfluorfen 23.5% EC @ 150 ml/acre within 3 days of transplanting or hand weed at Day 15.",
      irrigation: "Frequent shallow irrigations every 5–6 days.",
      protection: "Inspect leaf axils for tiny yellow Thrips nymphs."
    },
    {
      day: 28,
      title: "First Nitrogen Top-Dressing & Thrips Scouting",
      phase: "Vegetative",
      category: "Nutrition",
      priority: "High Priority",
      action: "Apply 30 kg Urea per acre followed by light watering. Install 15 Blue Sticky Traps per acre.",
      irrigation: "Irrigate every 5–7 days.",
      protection: "Onion has shallow roots (top 15 cm); light frequent watering is essential."
    },
    {
      day: 48,
      title: "Bulb Initiation, Thrips Spray + Wetting Sticker (ACTIVE STAGE)",
      phase: "Bulb Formation",
      category: "Pest & Nutrition",
      priority: "Critical Priority",
      action: "Spray Spinetoram 11.7% SC @ 0.8 ml/L or Fipronil 5% SC @ 1.5 ml/L ALWAYS with non-ionic sticker (0.5 ml/L) against thrips. Apply Second Nitrogen Split: 25 kg Urea + 15 kg Potash/acre.",
      irrigation: "CRITICAL: Maintain uniform moisture. Alternating wet and dry cycles causes split double bulbs.",
      protection: "Waxy upright onion leaves bounce spray droplets off; sticker is mandatory."
    },
    {
      day: 70,
      title: "Bulb Bulking, 13-0-45 Potash Spray & NITROGEN CUTOFF",
      phase: "Bulb Sizing",
      category: "Nutrition",
      priority: "Critical Priority",
      action: "Spray Sulphate of Potash (0-0-50) @ 10 g/L for rich pink/red skin and scale firmness. STOP ALL CHEMICAL NITROGEN APPLICATION COMPLETELY.",
      irrigation: "Irrigate every 6–8 days.",
      protection: "Late nitrogen after 70 days causes thick-necked 'bullhead' onions that rot in storage."
    },
    {
      day: 95,
      title: "Purple Blotch Defense & Irrigation Tapering",
      phase: "Bulb Maturation",
      category: "Disease Control",
      priority: "High Priority",
      action: "Spray Azoxystrobin + Difenoconazole @ 1 ml/L or Nativo @ 0.7 g/L against Purple Blotch (Alternaria porri).",
      irrigation: "Reduce irrigation frequency as bulb necks begin to soften.",
      protection: "Ensure morning sprays so foliage dries thoroughly before nightfall."
    },
    {
      day: 118,
      title: "50% Neck Fall, Harvesting, Windrow Curing & Neck Cut",
      phase: "Harvesting",
      category: "Harvest & Curing",
      priority: "Mandatory",
      action: "Harvest strictly when 50–70% of tops soften and fall over ('neck fall'). STOP WATER 15 DAYS PRIOR. Windrow in field for 3 days covered with tops. Cut tops leaving 2.5 cm dry neck.",
      irrigation: "Zero water 15 days before harvest.",
      protection: "Leaving 2.5 cm dry neck prevents fungal neck rot (Botrytis) from penetrating bulbs in storage."
    }
  ],

  potato: [
    {
      day: 0,
      title: "Cold Store Sprouting, Mancozeb Dip & Ridge Planting",
      phase: "Planting",
      category: "Planting & Basal",
      priority: "Mandatory",
      action: "Sprout cold store seed tubers (40–50 g) in diffused light for 7 days. Dip cut tubers in Mancozeb (2.5 g/L) for 10 mins. Apply basal 50% Urea (65 kg) + SSP 250 kg + 50% MOP (40 kg)/acre. Plant at 60×20 cm on ridges.",
      irrigation: "Pre-sowing furrow irrigation; never plant tubers in dry hot soil.",
      protection: "Allow cut surfaces to suberize (harden) in shade for 24h before planting."
    },
    {
      day: 12,
      title: "Sprout Emergence & Light Inter-Row Hoeing",
      phase: "Emergence",
      category: "Stand Establishment",
      priority: "High Priority",
      action: "Sprouts emerge within 10–14 days. Hoe inter-rows lightly to break crust and control early weed flush.",
      irrigation: "Light furrow moisture (keep water level below 1/2 ridge height).",
      protection: "Inspect for cutworms and wireworms chewing tender sprouts."
    },
    {
      day: 28,
      title: "FIRST MANDATORY EARTHING UP & Second Nitrogen Split",
      phase: "Vegetative",
      category: "Mandatory Earthing",
      priority: "Critical Priority",
      action: "FIRST EARTHING UP: When plants are 15–20 cm high, mound loose soil against stem bases to form broad ridges. Top-dress remaining 50% Urea (65 kg) + 50% MOP (40 kg) just before earthing up.",
      irrigation: "Immediate furrow irrigation following earthing up.",
      protection: "Earthing up covers stolons and prevents tubers from turning green with toxic solanine."
    },
    {
      day: 42,
      title: "Tuber Initiation, Steady Moisture & Late Blight Radar (ACTIVE STAGE)",
      phase: "Tuber Bulking",
      category: "Disease & Water",
      priority: "Critical Priority",
      action: "Stolons swell into baby tubers. LATE BLIGHT DEFENSE: Spray Cymoxanil 8% + Mancozeb 64% WP @ 2.5 g/L or Dimethomorph @ 1 g/L immediately if cloudy drizzling weather occurs.",
      irrigation: "CRITICAL: Maintain steady furrow moisture. Moisture stress causes hollow heart and knobby tubers.",
      protection: "Late Blight can destroy an entire potato field in 4 days in cool humid fog."
    },
    {
      day: 60,
      title: "Rapid Tuber Bulking & Sulphate of Potash Foliar Dosing",
      phase: "Tuber Sizing",
      category: "Nutrition",
      priority: "High Priority",
      action: "Spray Sulphate of Potash (0-0-50) @ 10 g/L to pump starch into tubers and thicken skin periderm.",
      irrigation: "Furrow irrigation every 6–8 days.",
      protection: "Keep ridges well-earthed up; exposed tubers are attacked by Potato Tuber Moth."
    },
    {
      day: 80,
      title: "MANDATORY DEHAULMING (Cutting Green Haulms)",
      phase: "Dehaulming",
      category: "Skin Hardening",
      priority: "Critical Priority",
      action: "MANDATORY DEHAULMING: Cut off all aboveground green foliage with sickle 10–12 days prior to digging. STOP ALL IRRIGATION.",
      irrigation: "Zero water upon dehaulming.",
      protection: "Dehaulming hardens potato skins so they do not peel or rot during harvest and cold storage."
    },
    {
      day: 92,
      title: "Tuber Digging, Shade Curing & Grade Burlap Bagging",
      phase: "Harvesting",
      category: "Harvest & Storage",
      priority: "Mandatory",
      action: "Harvest 10–12 days after dehaulming when soil is friable. Dig with potato digger. Heap tubers in shade for 10 days to cure skin abrasions. Grade and store in burlap bags.",
      irrigation: "None.",
      protection: "Never leave harvested potatoes in direct hot sun; causes internal blackheart breakdown in storage."
    }
  ]
};

// ── CROP ECONOMICS & PER-ACRE BUDGET BREAKDOWN ──────────────────────────────
export const CROP_ECONOMICS = {
  cotton: {
    seedCost: 2200,
    landPrepCost: 4500,
    fertilizerCost: 8200,
    protectionCost: 7800,
    irrigationPowerCost: 3500,
    laborHarvestCost: 14000,
    totalExpenses: 40200,
    expectedYieldQtl: 20,
    marketPricePerQtl: 7521,
    grossRevenue: 150420,
    netProfitPerAcre: 110220,
    roiPercent: "274%",
    breakEvenYieldQtl: 5.3
  },
  paddy: {
    seedCost: 1500,
    landPrepCost: 6500,
    fertilizerCost: 6800,
    protectionCost: 4200,
    irrigationPowerCost: 4500,
    laborHarvestCost: 12500,
    totalExpenses: 36000,
    expectedYieldQtl: 28,
    marketPricePerQtl: 2320,
    grossRevenue: 64960,
    netProfitPerAcre: 28960,
    roiPercent: "80%",
    breakEvenYieldQtl: 15.5
  },
  maize: {
    seedCost: 2400,
    landPrepCost: 4000,
    fertilizerCost: 7200,
    protectionCost: 3800,
    irrigationPowerCost: 3000,
    laborHarvestCost: 7600,
    totalExpenses: 28000,
    expectedYieldQtl: 32,
    marketPricePerQtl: 2225,
    grossRevenue: 71200,
    netProfitPerAcre: 43200,
    roiPercent: "154%",
    breakEvenYieldQtl: 12.6
  },
  tomato: {
    seedCost: 4500,
    landPrepCost: 8000,
    fertilizerCost: 14000,
    protectionCost: 12500,
    irrigationPowerCost: 5000,
    laborHarvestCost: 22000,
    totalExpenses: 66000,
    expectedYieldQtl: 240, // 24 Tons
    marketPricePerQtl: 1200,
    grossRevenue: 288000,
    netProfitPerAcre: 222000,
    roiPercent: "336%",
    breakEvenYieldQtl: 55.0
  },
  chilli: {
    seedCost: 4200,
    landPrepCost: 8500,
    fertilizerCost: 13500,
    protectionCost: 16000,
    irrigationPowerCost: 5500,
    laborHarvestCost: 24000,
    totalExpenses: 71700,
    expectedYieldQtl: 22,
    marketPricePerQtl: 18500,
    grossRevenue: 407000,
    netProfitPerAcre: 335300,
    roiPercent: "467%",
    breakEvenYieldQtl: 3.9
  },
  wheat: {
    seedCost: 2200,
    landPrepCost: 3800,
    fertilizerCost: 6200,
    protectionCost: 2800,
    irrigationPowerCost: 3200,
    laborHarvestCost: 6800,
    totalExpenses: 25000,
    expectedYieldQtl: 25,
    marketPricePerQtl: 2275,
    grossRevenue: 56875,
    netProfitPerAcre: 31875,
    roiPercent: "127%",
    breakEvenYieldQtl: 11.0
  },
  redgram: {
    seedCost: 1800,
    landPrepCost: 3500,
    fertilizerCost: 4200,
    protectionCost: 4800,
    irrigationPowerCost: 1500,
    laborHarvestCost: 6200,
    totalExpenses: 22000,
    expectedYieldQtl: 12,
    marketPricePerQtl: 7550,
    grossRevenue: 90600,
    netProfitPerAcre: 68600,
    roiPercent: "311%",
    breakEvenYieldQtl: 2.9
  },
  soybean: {
    seedCost: 3200,
    landPrepCost: 3500,
    fertilizerCost: 4800,
    protectionCost: 3600,
    irrigationPowerCost: 1500,
    laborHarvestCost: 7400,
    totalExpenses: 24000,
    expectedYieldQtl: 11,
    marketPricePerQtl: 4892,
    grossRevenue: 53812,
    netProfitPerAcre: 29812,
    roiPercent: "124%",
    breakEvenYieldQtl: 4.9
  },
  groundnut: {
    seedCost: 5500,
    landPrepCost: 4000,
    fertilizerCost: 5500,
    protectionCost: 3800,
    irrigationPowerCost: 2800,
    laborHarvestCost: 8400,
    totalExpenses: 30000,
    expectedYieldQtl: 14,
    marketPricePerQtl: 6783,
    grossRevenue: 94962,
    netProfitPerAcre: 64962,
    roiPercent: "216%",
    breakEvenYieldQtl: 4.4
  },
  chickpea: {
    seedCost: 3200,
    landPrepCost: 3000,
    fertilizerCost: 3800,
    protectionCost: 3200,
    irrigationPowerCost: 1800,
    laborHarvestCost: 6500,
    totalExpenses: 21500,
    expectedYieldQtl: 10,
    marketPricePerQtl: 5440,
    grossRevenue: 54400,
    netProfitPerAcre: 32900,
    roiPercent: "153%",
    breakEvenYieldQtl: 3.9
  },
  sugarcane: {
    seedCost: 9000,
    landPrepCost: 7500,
    fertilizerCost: 16000,
    protectionCost: 5500,
    irrigationPowerCost: 12000,
    laborHarvestCost: 22000,
    totalExpenses: 72000,
    expectedYieldQtl: 520,
    marketPricePerQtl: 340,
    grossRevenue: 176800,
    netProfitPerAcre: 104800,
    roiPercent: "145%",
    breakEvenYieldQtl: 211.7
  },
  mustard: {
    seedCost: 1200,
    landPrepCost: 3500,
    fertilizerCost: 4500,
    protectionCost: 2800,
    irrigationPowerCost: 2200,
    laborHarvestCost: 5800,
    totalExpenses: 20000,
    expectedYieldQtl: 10,
    marketPricePerQtl: 5650,
    grossRevenue: 56500,
    netProfitPerAcre: 36500,
    roiPercent: "182%",
    breakEvenYieldQtl: 3.5
  },
  onion: {
    seedCost: 4500,
    landPrepCost: 6500,
    fertilizerCost: 9500,
    protectionCost: 5500,
    irrigationPowerCost: 4200,
    laborHarvestCost: 15000,
    totalExpenses: 45200,
    expectedYieldQtl: 120,
    marketPricePerQtl: 2200,
    grossRevenue: 264000,
    netProfitPerAcre: 218800,
    roiPercent: "484%",
    breakEvenYieldQtl: 20.5
  },
  potato: {
    seedCost: 18000,
    landPrepCost: 6500,
    fertilizerCost: 11000,
    protectionCost: 6500,
    irrigationPowerCost: 3800,
    laborHarvestCost: 12000,
    totalExpenses: 57800,
    expectedYieldQtl: 125,
    marketPricePerQtl: 1650,
    grossRevenue: 206250,
    netProfitPerAcre: 148450,
    roiPercent: "256%",
    breakEvenYieldQtl: 35.0
  }
};

// ── CRITICAL IRRIGATION STAGES & WATER SENSITIVITY MATRIX ───────────────────
export const CROP_WATER_STAGES = {
  cotton: [
    { stage: "Pre-Sowing (Rouni)", timing: "Day -7", mmNeeded: "75 mm", riskIfMissed: "Uneven seed germination & patchy stand" },
    { stage: "Square Initiation", timing: "Day 45–55", mmNeeded: "65 mm", riskIfMissed: "Premature square drop & delayed flowering" },
    { stage: "Peak Flowering", timing: "Day 70–85", mmNeeded: "90 mm", riskIfMissed: "CRITICAL: 40% flower shedding & empty nodes" },
    { stage: "Boll Development", timing: "Day 90–110", mmNeeded: "80 mm", riskIfMissed: "Small bolls, low lint weight & weak fiber" },
    { stage: "Boll Bursting", timing: "Day 125+", mmNeeded: "0 mm (Dry)", riskIfMissed: "Excess water causes fungal boll rot & stained lint" }
  ],
  paddy: [
    { stage: "Transplanting & Rooting", timing: "Day 21–28", mmNeeded: "2 cm depth", riskIfMissed: "Seedling desiccation and delayed root anchoring" },
    { stage: "Active Tillering", timing: "Day 30–50", mmNeeded: "AWD (2–3 cm)", riskIfMissed: "Tiller count drops from 30 down to 12 per hill" },
    { stage: "Panicle Initiation", timing: "Day 55–65", mmNeeded: "Continuous 5 cm", riskIfMissed: "FATAL: Empty panicles & chaffy non-viable grains" },
    { stage: "Flowering & Heading", timing: "Day 75–85", mmNeeded: "3–4 cm depth", riskIfMissed: "Spikelet sterility and pollination failure" },
    { stage: "Pre-Harvest Drainage", timing: "Day 115+", mmNeeded: "0 mm (Drain)", riskIfMissed: "Standing water rots straw and blocks harvesters" }
  ],
  maize: [
    { stage: "Seedling Emergence", timing: "Day 0–10", mmNeeded: "45 mm", riskIfMissed: "Poor emergence" },
    { stage: "Knee-High Stage", timing: "Day 25–35", mmNeeded: "60 mm", riskIfMissed: "Stunted internodes and weak root brace anchoring" },
    { stage: "Tasseling & Silking", timing: "Day 55–70", mmNeeded: "110 mm", riskIfMissed: "CRITICAL: Pollen desiccation & barren cobs (50% loss)" },
    { stage: "Dough & Kernel Filling", timing: "Day 75–90", mmNeeded: "70 mm", riskIfMissed: "Shriveled dented kernels with low starch weight" }
  ],
  tomato: [
    { stage: "Transplant Establishment", timing: "Day 25–32", mmNeeded: "Daily Drip 2L", riskIfMissed: "Seedling wilt and slow root penetration" },
    { stage: "Vegetative & Trellising", timing: "Day 35–50", mmNeeded: "Daily Drip 3L", riskIfMissed: "Weak vines unable to support fruit clusters" },
    { stage: "Peak Flowering & Fruit Set", timing: "Day 55–75", mmNeeded: "Daily Drip 4L", riskIfMissed: "Massive flower shedding and blossom end rot" },
    { stage: "Fruit Sizing & Ripening", timing: "Day 80–110", mmNeeded: "Daily Drip 3.5L", riskIfMissed: "Irregular watering causes fruit skin cracking" }
  ],
  chilli: [
    { stage: "Transplant Hardening", timing: "Day 30–38", mmNeeded: "Drip 2L/plant", riskIfMissed: "Transplant shock and slow branch initiation" },
    { stage: "Branching & Nipping", timing: "Day 45–60", mmNeeded: "Drip 3L/plant", riskIfMissed: "Reduced secondary lateral branch count" },
    { stage: "Peak Flowering", timing: "Day 65–85", mmNeeded: "Drip 3.5L/plant", riskIfMissed: "Flower drop & bud drying" },
    { stage: "Fruit Development", timing: "Day 90–120", mmNeeded: "Drip 3L/plant", riskIfMissed: "Small wrinkled pods with low capsaicin weight" }
  ],
  wheat: [
    { stage: "Crown Root Initiation (CRI)", timing: "Day 20–25", mmNeeded: "75 mm", riskIfMissed: "MOST VITAL: Reduces productive tillers by 35%" },
    { stage: "Tillering / Jointing", timing: "Day 40–45", mmNeeded: "65 mm", riskIfMissed: "Stunted stalk height and fewer spikelets" },
    { stage: "Late Boot / Heading", timing: "Day 65–70", mmNeeded: "70 mm", riskIfMissed: "Flower sterility and small spike size" },
    { stage: "Milking Stage", timing: "Day 80–85", mmNeeded: "65 mm", riskIfMissed: "Terminal heat shrivels grain weight" }
  ],
  redgram: [
    { stage: "Sowing Moisture", timing: "Day 0", mmNeeded: "50 mm", riskIfMissed: "Patchy seedling emergence" },
    { stage: "Flower Bud Opening", timing: "Day 60–70", mmNeeded: "60 mm", riskIfMissed: "CRITICAL: Flower shedding and stunted racemes" },
    { stage: "Pod Elongation & Filling", timing: "Day 85–100", mmNeeded: "60 mm", riskIfMissed: "Empty pods and shrunken seeds" }
  ],
  soybean: [
    { stage: "Sowing Moisture", timing: "Day 0", mmNeeded: "75 mm", riskIfMissed: "Poor hypocotyl emergence and patchy stand" },
    { stage: "Flower Initiation", timing: "Day 35–45", mmNeeded: "65 mm", riskIfMissed: "CRITICAL: 35% flower shedding & fewer pod clusters" },
    { stage: "Pod Elongation & Seed Fill", timing: "Day 60–75", mmNeeded: "70 mm", riskIfMissed: "Shriveled, wrinkled grain with lower oil percentage" },
    { stage: "Pod Browning / Ripening", timing: "Day 85+", mmNeeded: "0 mm (Drain)", riskIfMissed: "Excess rain causes pod shattering and fungal seed rot" }
  ],
  groundnut: [
    { stage: "Germination & Stand", timing: "Day 0–12", mmNeeded: "50 mm", riskIfMissed: "Uneven seedling emergence and poor root anchoring" },
    { stage: "Flowering & Peg Initiation", timing: "Day 35–45", mmNeeded: "65 mm", riskIfMissed: "Fewer flowers and delayed aerial peg formation" },
    { stage: "Peg Penetration into Soil", timing: "Day 45–60", mmNeeded: "70 mm", riskIfMissed: "MOST CRITICAL: Hard dry crust snaps pegs; no pods form" },
    { stage: "Pod Development & Shell Sizing", timing: "Day 65–85", mmNeeded: "75 mm", riskIfMissed: "Severe yield crash; high incidence of empty 'pops'" },
    { stage: "Pod Hardening / Curing", timing: "Day 100+", mmNeeded: "0 mm (Dry)", riskIfMissed: "Standing water rots pods and triggers aflatoxin" }
  ],
  chickpea: [
    { stage: "Pre-Sowing Moisture", timing: "Day 0", mmNeeded: "60 mm", riskIfMissed: "Seed failure in dry soil; poor germination stand" },
    { stage: "Pre-Flowering Branching", timing: "Day 40–50", mmNeeded: "50 mm", riskIfMissed: "ONE PROTECTIVE IRRIGATION: Arrests flower bud drop" },
    { stage: "Peak Flowering", timing: "Day 55–65", mmNeeded: "0 mm (DO NOT IRRIGATE)", riskIfMissed: "Excess water at full bloom causes massive flower drop" },
    { stage: "Early Pod Filling", timing: "Day 75–85", mmNeeded: "45 mm", riskIfMissed: "Terminal heat shrivels developing chana grains" }
  ],
  sugarcane: [
    { stage: "Germination & Sprouting", timing: "Day 0–35", mmNeeded: "120 mm", riskIfMissed: "Desiccation of sett eye buds; patchy sprouting" },
    { stage: "Tillering Phase", timing: "Day 40–100", mmNeeded: "250 mm", riskIfMissed: "Tiller mortality; cane clump population drops by 40%" },
    { stage: "Grand Growth & Internode Elongation", timing: "Day 110–240", mmNeeded: "800 mm", riskIfMissed: "Short thin canes with short internodes and stunted biomass" },
    { stage: "Sucrose Maturation", timing: "Day 270–310", mmNeeded: "Taper off (50 mm)", riskIfMissed: "Excess water prevents sucrose concentration in stalks" },
    { stage: "Pre-Harvest Drying", timing: "Day 315+", mmNeeded: "0 mm (Cutoff)", riskIfMissed: "Juice dilution and lower commercial sugar recovery" }
  ],
  mustard: [
    { stage: "Pre-Sowing Residual Moisture", timing: "Day 0", mmNeeded: "50 mm", riskIfMissed: "Poor emergence of tiny mustard seeds" },
    { stage: "Rosette Stage (First Critical)", timing: "Day 25–28", mmNeeded: "65 mm", riskIfMissed: "Fewer primary fruiting branches and stunted plant height" },
    { stage: "Siliqua / Pod Initiation (Second Critical)", timing: "Day 50–55", mmNeeded: "70 mm", riskIfMissed: "Shorter siliquae with only 8–10 seeds per pod instead of 18" },
    { stage: "Seed Hardening", timing: "Day 80+", mmNeeded: "0 mm (Dry)", riskIfMissed: "High moisture promotes Alternaria pod blight and lodging" }
  ],
  onion: [
    { stage: "Transplanting & Establishment", timing: "Day 0–15", mmNeeded: "Frequent (40 mm)", riskIfMissed: "Transplant shock and high seedling mortality" },
    { stage: "Vegetative Foliage Growth", timing: "Day 20–45", mmNeeded: "50 mm (Light)", riskIfMissed: "Reduced leaf count; leaf number directly limits bulb scale size" },
    { stage: "Bulb Initiation & Swelling", timing: "Day 50–85", mmNeeded: "75 mm (Regular)", riskIfMissed: "CRITICAL: Irregular watering causes split & double bulbs" },
    { stage: "Neck Fall & Scale Drying", timing: "Day 105+", mmNeeded: "0 mm (Dry)", riskIfMissed: "Watering during neck fall causes thick necks and neck rot in storage" }
  ],
  potato: [
    { stage: "Stolon Emergence", timing: "Day 10–20", mmNeeded: "50 mm", riskIfMissed: "Delayed sprout emergence and weak stolon rooting" },
    { stage: "Tuber Initiation", timing: "Day 35–45", mmNeeded: "65 mm", riskIfMissed: "MOST CRITICAL: Reduced tuber count per hill (drops from 8 to 3)" },
    { stage: "Tuber Bulking & Sizing", timing: "Day 50–75", mmNeeded: "85 mm", riskIfMissed: "Hollow heart, growth cracks, and small unmarketable tubers" },
    { stage: "Post-Dehaulming & Skin Curing", timing: "Day 80+", mmNeeded: "0 mm (Dry)", riskIfMissed: "Tubers absorb moisture, skin periderm softens, rots in storage" }
  ]
};

// ── FOLIAR TANK-MIX SAFETY & COMPATIBILITY RULES ────────────────────────────
export const CROP_TANK_MIX = {
  cotton: [
    { combo: "Chlorantraniliprole 18.5% SC + 19-19-19 Soluble NPK", status: "SAFE", note: "Compatible. Saves one tractor/labor spraying pass." },
    { combo: "Diafenthiuron 50% WP + Neem Oil 10,000 ppm", status: "SAFE", note: "Synergistic knockdown of whitefly nymphs and adults." },
    { combo: "Copper Oxychloride + Potassium Nitrate (13-0-45)", status: "INCOMPATIBLE", note: "Do not mix. Forms alkaline precipitates that clog spray nozzles." },
    { combo: "Emamectin Benzoate + Formula-4 Micronutrient", status: "WARNING", note: "Jar test first. Ensure spray water pH is between 6.0 and 7.0." }
  ],
  paddy: [
    { combo: "Tricyclazole 75% WP + Potassium Nitrate (13-0-45)", status: "SAFE", note: "Highly effective at boot leaf for blast defense + panicle exertion." },
    { combo: "Cartap Hydrochloride + Zinc Sulphate", status: "INCOMPATIBLE", note: "Incompatible. Zinc precipitates active insecticide." },
    { combo: "Hexaconazole 5% SC + Validamycin 3% L", status: "SAFE", note: "Excellent dual-action systemic control for sheath blight." },
    { combo: "Pretilachlor Herbicide + Urea", status: "SAFE", note: "Standard sand/urea broadcast mix within 3 days of transplanting." }
  ],
  maize: [
    { combo: "Chlorantraniliprole 18.5% SC + Zinc Sulphate (0.5%)", status: "SAFE", note: "Safe for whorl application targeting Fall Armyworm." },
    { combo: "Atrazine 50% WP + Post-emergence insecticides", status: "INCOMPATIBLE", note: "Atrazine must be sprayed alone as pre-emergence on bare soil." },
    { combo: "Mancozeb 75% WP + Urea 2%", status: "SAFE", note: "Compatible foliar spray against Turcicum blight." }
  ],
  tomato: [
    { combo: "Calcium Nitrate + Mono-Ammonium Phosphate (12-61-0)", status: "INCOMPATIBLE", note: "NEVER MIX in fertilizer tank. Forms insoluble Calcium Phosphate stones." },
    { combo: "Flubendiamide 39.35% SC + 0-52-34 (MKP)", status: "SAFE", note: "Compatible spray during fruit expansion." },
    { combo: "Cymoxanil + Mancozeb + Boron 20%", status: "SAFE", note: "Safe for late blight prevention and blossom retention." }
  ],
  chilli: [
    { combo: "Spinetoram 11.7% SC + Boron 20%", status: "SAFE", note: "Ideal combo for thrips eradication and flower setting." },
    { combo: "Spiromesifen (Mite spray) + Sulfur WP", status: "SAFE", note: "Dual acaricide action against yellow and red spider mites." },
    { combo: "Copper Hydroxide + Acidic Foliar Fertilizers", status: "INCOMPATIBLE", note: "Causes severe leaf scorch and phytotoxicity on chilli leaves." }
  ],
  wheat: [
    { combo: "Propiconazole 25% EC + Potassium Nitrate (13-0-45)", status: "SAFE", note: "Superb combo at boot leaf against stripe rust and terminal heat." },
    { combo: "Clodinafop 15% WP + 2,4-D Ethyl Ester", status: "INCOMPATIBLE", note: "Causes antagonism; reduces grass weed control by 40%." },
    { combo: "Urea 2% Foliar Spray + Tilt Fungicide", status: "SAFE", note: "Safe and cost-effective nitrogen booster." }
  ],
  redgram: [
    { combo: "Chlorantraniliprole 18.5% SC + Pulse Wonder (1%)", status: "SAFE", note: "Recommended ICAR spray at 50% flowering against pod borer." },
    { combo: "Neem Seed Kernel Extract (5%) + Bio-agents", status: "SAFE", note: "100% natural organic IPM combination." },
    { combo: "Carbendazim + Heavy Insecticides", status: "WARNING", note: "Avoid over-mixing; test jar solution before tank filling." }
  ],
  soybean: [
    { combo: "Chlorantraniliprole 18.5% SC + 19-19-19 Soluble NPK", status: "SAFE", note: "Compatible. Controls girdle beetle while feeding flower clusters." },
    { combo: "Quizalofop-ethyl Herbicide + Synthetic Insecticides", status: "INCOMPATIBLE", note: "Do not tank-mix; causes leaf yellowing and reduces grass weed efficacy." },
    { combo: "Neem Oil 10,000 ppm + Potassium Nitrate (13-0-45)", status: "SAFE", note: "Safe dual repellent and grain bulking foliar spray." }
  ],
  groundnut: [
    { combo: "Tebuconazole 25.9% EC + Potassium Nitrate (13-0-45)", status: "SAFE", note: "Excellent synergism for Tikka leaf spot defense and pod filling." },
    { combo: "Ferrous Sulphate + Soluble Phosphate (DAP)", status: "INCOMPATIBLE", note: "NEVER MIX; forms insoluble Iron Phosphate precipitate." },
    { combo: "Hexaconazole + Urea 1%", status: "SAFE", note: "Safe booster against rust and leaf spots." }
  ],
  chickpea: [
    { combo: "Chlorantraniliprole 18.5% SC + Boron 20% (Solubor)", status: "SAFE", note: "Standard ICAR mix at flower initiation for borer defense & pod setting." },
    { combo: "Carboxin + Alkaline Copper Fungicides", status: "INCOMPATIBLE", note: "Incompatible; copper degrades systemic carboxin." },
    { combo: "HaNPV Biocontrol + Neem Extract 5%", status: "SAFE", note: "Highly synergistic biological IPM solution for Helicoverpa." }
  ],
  sugarcane: [
    { combo: "Atrazine 50% WP + 2,4-D Sodium Salt", status: "SAFE", note: "Classic broad-spectrum pre-emergence tank mix for cane fields." },
    { combo: "Carbendazim 50% WP + Chlorpyrifos 20% EC", status: "SAFE", note: "Standard sett treatment dip against red rot fungus and termites." },
    { combo: "Paraquat Herbicide + Systemic Foliar Insecticides", status: "INCOMPATIBLE", note: "Never mix contact desiccants with systemic insecticides." }
  ],
  mustard: [
    { combo: "Dimethoate 30% EC + Mancozeb 75% WP", status: "SAFE", note: "Dual aphid knockdown and Alternaria leaf blight prevention." },
    { combo: "Metalaxyl-M + Concentrated Nitrogen Fertilizers", status: "WARNING", note: "Perform jar test first; ensure spray water pH is 6.5–7.0." },
    { combo: "Wettable Sulphur 80% WP + Systemic Organophosphates", status: "SAFE", note: "Safe mix for powdery mildew and mite control." }
  ],
  onion: [
    { combo: "Spinetoram 11.7% SC + Non-Ionic Silicone Sticker (Silwet)", status: "SAFE", note: "Mandatory mix; sticker ensures pesticide spreads evenly on waxy onion leaves." },
    { combo: "Copper Oxychloride + Acidic Foliar Fertilizers (0-52-34)", status: "INCOMPATIBLE", note: "Causes leaf scorch and severe phytotoxicity on young onion necks." },
    { combo: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC + Sticker", status: "SAFE", note: "Premium dual-action systemic cure for Purple Blotch." }
  ],
  potato: [
    { combo: "Cymoxanil 8% + Mancozeb 64% WP + Boron 20%", status: "SAFE", note: "Superb protective combo during Late Blight forecast windows." },
    { combo: "Calcium Nitrate + Mono-Potassium Phosphate (0-52-34)", status: "INCOMPATIBLE", note: "Forms insoluble Calcium Phosphate sludge in spray nozzles." },
    { combo: "Dimethomorph 50% WP + Mancozeb 75% WP", status: "SAFE", note: "Industry standard tank-mix curative defense for Late Blight." }
  ]
};

// ── BRIEF STAGE-BY-STAGE DAY WISE ROADMAP (CONCISE BRIEF SUMMARY) ───────────
export const CROP_BRIEF_STAGES = {
  cotton: [
    {
      stage: "Stage 1: Sowing & Stand Establishment",
      days: "Day 0 – 20",
      targetDay: 12,
      icon: "🌱",
      focus: "100% Germination & Weed Pre-emption",
      keyAction: "Dibble hybrid seeds at 90×60 cm; gap-fill missing spots within Day 10–12 to guarantee 7,400 plants/acre.",
      waterNutrient: "Basal DAP 50 kg + MOP 25 kg + Urea 15 kg. Light furrow moisture without pooling.",
      pestAlert: "Apply Pendimethalin within 48h. Scout for cutworms and damping-off fungus."
    },
    {
      stage: "Stage 2: Vegetative Growth & Nipping",
      days: "Day 21 – 50",
      targetDay: 45,
      icon: "🌿",
      focus: "Canopy Branching & Sucking Pest Defense",
      keyAction: "Inter-cultivate to create dust mulch. At Day 45, nip apical shoot (top 5 cm) to trigger lateral fruiting branches.",
      waterNutrient: "First Split Urea (35 kg/acre) at Day 30. Spray 1% Formula-4 micronutrient at Day 45.",
      pestAlert: "Install 5 yellow sticky traps. Spray Diafenthiuron 50% WP if jassids/whiteflies > 5/leaf."
    },
    {
      stage: "Stage 3: Squaring & Peak Flowering",
      days: "Day 51 – 85",
      targetDay: 75,
      icon: "🌸",
      focus: "Flower Retention & Pink Bollworm Defense",
      keyAction: "Check rosette flowers daily. Install Gossyplure pheromone traps (5/acre). Spray 13-0-45 (10 g/L) to prevent boll drop.",
      waterNutrient: "Second Split Urea (30 kg) + MOP (25 kg). CRITICAL: Furrow irrigation every 7 days (flower drop window).",
      pestAlert: "Chlorantraniliprole 18.5% SC @ 0.4 ml/L if moth catch > 8/night. Azoxystrobin if grey mildew appears."
    },
    {
      stage: "Stage 4: Boll Expansion & Maturation",
      days: "Day 86 – 125",
      targetDay: 90,
      icon: "🍈",
      focus: "Boll Weight, Fiber Strength & Irrigation Cutoff",
      keyAction: "Spray Sulphate of Potash (0-0-50) @ 10 g/L for fiber micronaire. Taper off irrigation gradually as bolls crack.",
      waterNutrient: "Alternate furrow irrigation only. ZERO nitrogen to prevent vegetative rank growth.",
      pestAlert: "Inspect internal boll rot; avoid wetting open bolls. Handpick Spodoptera caterpillars."
    },
    {
      stage: "Stage 5: Fluffy Boll Burst & Harvesting",
      days: "Day 126 – 160",
      targetDay: 130,
      icon: "🧺",
      focus: "Clean Picking & Stalk Sanitation",
      keyAction: "Stop water 15 days before picking. Pick clean, fully burst bolls in morning after dew evaporates. Shred stalks immediately post-harvest.",
      waterNutrient: "Zero water. Store in dry jute bags with moisture below 8%.",
      pestAlert: "Never stack old stalks near field; shred to eliminate overwintering pink bollworm pupae."
    }
  ],
  paddy: [
    {
      stage: "Stage 1: Nursery & Puddled Transplanting",
      days: "Day 0 – 25",
      targetDay: 21,
      icon: "🌱",
      focus: "Seed Treatment & Optimal Stand Density",
      keyAction: "10% brine seed test; sow in raised nursery. Transplant 21-day seedlings (2–3/hill) at 20×15 cm in puddled soil.",
      waterNutrient: "Basal DAP 50 kg + MOP 25 kg + Zinc Sulphate 15 kg/acre. 2 cm standing water for 7 days post-transplant.",
      pestAlert: "Spray Pretilachlor 50% EC @ 500 ml/acre within 48h. Treat nursery with Carbendazim against blast."
    },
    {
      stage: "Stage 2: Active Tillering & Weed Management",
      days: "Day 26 – 50",
      targetDay: 30,
      icon: "🌾",
      focus: "Maximizing Productive Tillers (Target: 25–35/hill)",
      keyAction: "Broadcast First Split Urea (35 kg/acre). Run cono-weeder to aerate root zone and bury weeds.",
      waterNutrient: "Alternate Wetting & Drying (AWD): drain until fine hair cracks appear, then re-flood to 3 cm.",
      pestAlert: "Install 4 pheromone traps/acre. Apply Chlorantraniliprole 0.4% G (4 kg/acre) against stem borer."
    },
    {
      stage: "Stage 3: Panicle Initiation & Boot Leaf",
      days: "Day 51 – 75",
      targetDay: 60,
      icon: "🌾",
      focus: "Panicle Primordia Formation (Yield Deciding)",
      keyAction: "Top-dress Second Split Urea (30 kg) + MOP (25 kg). Spray 13-0-45 (10 g/L) + Tricyclazole for blast protection.",
      waterNutrient: "CRITICAL: Maintain continuous 3–5 cm water layer; drought stress causes empty panicles.",
      pestAlert: "Scout sheath waterline for sheath blight snake-skin lesions; spray Hexaconazole if detected."
    },
    {
      stage: "Stage 4: Heading, Flowering & Milk Stage",
      days: "Day 76 – 100",
      targetDay: 90,
      icon: "🌾",
      focus: "Grain Filling & Brown Plant Hopper (BPH) Defense",
      keyAction: "Create 1-foot alleyways every 2m for sunlight and air. Inspect plant bases near waterline daily for BPH hoppers.",
      waterNutrient: "Maintain shallow 2 cm water layer. Spray 0-52-34 (MKP) @ 10 g/L for plump grain weight.",
      pestAlert: "If BPH > 10/hill, spray Dinotefuran 20% SG @ 80 g/acre. Never spray Cypermethrin (causes resurgence)."
    },
    {
      stage: "Stage 5: Dough Stage, Drainage & Harvest",
      days: "Day 101 – 135",
      targetDay: 130,
      icon: "🚜",
      focus: "Complete Field Drainage & Timely Combine Harvest",
      keyAction: "Drain field completely 14 days before harvest. Combine harvest when 85% panicles turn golden yellow.",
      waterNutrient: "Zero water. Sun-dry grain to 12–13% moisture before bagging.",
      pestAlert: "Store grain with shade-dried neem leaves in clean gunny bags against rice weevils."
    }
  ],
  maize: [
    {
      stage: "Stage 1: Ridge Sowing & Stand Establishment",
      days: "Day 0 – 20",
      targetDay: 10,
      icon: "🌱",
      focus: "Ridge Dibbling & Pre-Emergence Weed Eradication",
      keyAction: "Dibble seeds on ridge slopes at 60×20 cm. Spray Atrazine 50% WP @ 500 g/acre within 48h of sowing.",
      waterNutrient: "Basal DAP 50 kg + MOP 20 kg + Urea 15 kg/acre. Pre-sowing irrigation ensures uniform emergence.",
      pestAlert: "Check whorls on Day 10 for pinhole damage indicating early Fall Armyworm (FAW)."
    },
    {
      stage: "Stage 2: Knee-High Stage & FAW Whorl Defense",
      days: "Day 21 – 45",
      targetDay: 30,
      icon: "🌽",
      focus: "Rapid Vegetative Expansion & Stalk Thickening",
      keyAction: "Broadcast First Split Urea (40 kg/acre) + earth up ridges to prevent lodging. Check whorls for FAW sawdust frass.",
      waterNutrient: "Irrigate every 10–12 days. Apply 10 kg Zinc Sulphate if white bud deficiency appears.",
      pestAlert: "Apply Chlorantraniliprole 18.5% SC @ 0.4 ml/L or Emamectin Benzoate 5% SG @ 0.4 g/L directly into whorls."
    },
    {
      stage: "Stage 3: Tasseling & Silking (CRITICAL)",
      days: "Day 46 – 70",
      targetDay: 60,
      icon: "🌽",
      focus: "Pollination Success & Cob Kernel Setting",
      keyAction: "Broadcast Second Split Urea (35 kg/acre). Ensure steady soil moisture; water stress during silking drops yield by 50%.",
      waterNutrient: "CRITICAL: Irrigate every 6–8 days. Spray 13-0-45 (10 g/L) + Boron (1 g/L) for full cob tip filling.",
      pestAlert: "Check leaves for oval Turcicum blight lesions; spray Mancozeb 75% WP @ 2.5 g/L if cloudy."
    },
    {
      stage: "Stage 4: Dough, Dent & Kernel Hardening",
      days: "Day 71 – 100",
      targetDay: 85,
      icon: "🌽",
      focus: "Maximum Grain Weight & Cob Starch Accumulation",
      keyAction: "Maintain alternate furrow irrigation until black layer forms at base of grain (indicating physiological maturity).",
      waterNutrient: "Taper off water 10 days before harvest.",
      pestAlert: "Deter birds and wild boars during kernel dough stage."
    },
    {
      stage: "Stage 5: Cob Harvest & Shelling",
      days: "Day 101 – 115",
      targetDay: 110,
      icon: "🚜",
      focus: "Dry Harvesting & Safe Moisture Storage",
      keyAction: "Harvest when outer husk leaves turn dry papery brown. Sun-dry cobs to 14% moisture before mechanical shelling.",
      waterNutrient: "Zero water. Store clean grain at < 12% moisture.",
      pestAlert: "Dust storage bags with Malathion 5% D against grain weevils."
    }
  ],
  tomato: [
    {
      stage: "Stage 1: Pro-Tray Nursery & Bed Transplanting",
      days: "Day 0 – 30",
      targetDay: 25,
      icon: "🌱",
      focus: "Strong Root Establishment & Mulching",
      keyAction: "Transplant 25-day pro-tray seedlings into silver-black plastic mulch beds at 90×45 cm. Drench 19-19-19 + Humic Acid.",
      waterNutrient: "Basal DAP 75 kg + MOP 40 kg + 10 tons FYM/acre. Daily drip irrigation: 2 liters/plant.",
      pestAlert: "Install 10 blue sticky traps for thrips & yellow traps for whiteflies to prevent Tomato Leaf Curl Virus."
    },
    {
      stage: "Stage 2: Staking, Trellising & Branching",
      days: "Day 31 – 55",
      targetDay: 40,
      icon: "🍅",
      focus: "Trellis Tying & Apical Pruning",
      keyAction: "Erect bamboo poles with GI wire trellising. Prune bottom side-suckers up to 20 cm from ground to stop soil-borne fungal spores.",
      waterNutrient: "Fertigate weekly: 19-19-19 (3 kg/acre) + Calcium Nitrate (2 kg/acre on alternate days). Daily drip: 3L/plant.",
      pestAlert: "Spray Flubendiamide @ 0.3 ml/L for Tuta absoluta leaf miner and pinworm."
    },
    {
      stage: "Stage 3: Heavy Flowering & Fruit Set",
      days: "Day 56 – 80",
      targetDay: 65,
      icon: "🍅",
      focus: "Blossom Retention & Blossom End Rot Prevention",
      keyAction: "Spray Boron 20% @ 1 g/L + Planofix (0.25 ml/L) to prevent blossom drop. Apply Chelated Calcium to stop Blossom End Rot.",
      waterNutrient: "Fertigate 12-61-0 (Mono-Ammonium Phosphate) + Potassium Nitrate (13-0-45). Daily drip: 4L/plant.",
      pestAlert: "Prevent Late Blight with Cymoxanil + Mancozeb (2 g/L) if morning dew and cool fog occur."
    },
    {
      stage: "Stage 4: Fruit Sizing & Breaker Stage Picking",
      days: "Day 81 – 115",
      targetDay: 95,
      icon: "🍅",
      focus: "Firm Fruit Texture, Color Development & Harvest",
      keyAction: "Pick fruit at 'breaker stage' (slight pink star at blossom end) for long-distance transport. Grade by size in plastic crates.",
      waterNutrient: "Consistent drip irrigation; irregular watering causes fruit skin cracking. Fertigate 0-0-50 Sulphate of Potash.",
      pestAlert: "Spray Chlorantraniliprole @ 0.3 ml/L for fruit borer (Helicoverpa). Observe 3-day PHI before picking."
    },
    {
      stage: "Stage 5: Extended Picking Flushes & Vine Clearing",
      days: "Day 116 – 145",
      targetDay: 130,
      icon: "🧺",
      focus: "Multi-Flush Harvests & Post-Harvest Hygiene",
      keyAction: "Harvest fruit every 3–4 days. After 8–10 pickings, clear vines and dispose of cull fruits away from fields.",
      waterNutrient: "Taper drip irrigation. Pack in ventilated 25 kg plastic crates.",
      pestAlert: "Destroy fallen rotten fruit immediately to prevent fruit fly multiplication."
    }
  ],
  chilli: [
    {
      stage: "Stage 1: Nursery & Ridge Transplanting",
      days: "Day 0 – 35",
      targetDay: 30,
      icon: "🌱",
      focus: "Seedling Hardening & Virus Vector Defense",
      keyAction: "Transplant 35-day sturdy seedlings at 60×45 cm on raised beds with drip lateral. Drench Trichoderma viride.",
      waterNutrient: "Basal DAP 60 kg + MOP 30 kg + Urea 20 kg/acre. Daily drip irrigation: 2 liters/plant.",
      pestAlert: "Dip seedling roots in Imidacloprid (0.5 ml/L) for 15 minutes before transplanting against early thrips."
    },
    {
      stage: "Stage 2: Apical Shoot Nipping & Branching",
      days: "Day 36 – 60",
      targetDay: 45,
      icon: "🌶️",
      focus: "Nipping for Bushy Architecture & Mite Control",
      keyAction: "Nip terminal shoot tip at Day 45 to stimulate 6–8 bushy lateral branches. Install 10 blue sticky traps for thrips.",
      waterNutrient: "Fertigate 19-19-19 (3 kg/acre) weekly. Daily drip: 3 liters/plant.",
      pestAlert: "Spray Spinetoram 11.7% SC @ 1 ml/L for leaf-curl thrips. Spray Spiromesifen 22.9% SC @ 1 ml/L for yellow mites."
    },
    {
      stage: "Stage 3: Profuse Flowering & Pod Initiation",
      days: "Day 61 – 90",
      targetDay: 75,
      icon: "🌶️",
      focus: "Flower Retention & Anthracnose (Dieback) Defense",
      keyAction: "Spray NAA 4.5% SL (Planofix) @ 0.25 ml/L + Boron 20% (1 g/L) to prevent flower and bud dropping.",
      waterNutrient: "Fertigate 13-0-45 (Potassium Nitrate) + 0-52-34 (MKP). Daily drip: 3.5 liters/plant.",
      pestAlert: "Spray Azoxystrobin + Difenoconazole @ 1 ml/L against Dieback / Anthracnose fruit rot."
    },
    {
      stage: "Stage 4: Green & Red Ripe Chilli Picking",
      days: "Day 91 – 130",
      targetDay: 110,
      icon: "🌶️",
      focus: "Multi-Flush Harvests & Sun Drying on Tarpaulin",
      keyAction: "Pick green chillies for vegetable markets or allow pods to turn deep red on plant for dry red chilli spice.",
      waterNutrient: "Sustain steady drip irrigation; avoid drought stress between pickings.",
      pestAlert: "Observe 5-day PHI waiting period after any spray before picking."
    },
    {
      stage: "Stage 5: Final Picking & Clean Spice Drying",
      days: "Day 131 – 160",
      targetDay: 145,
      icon: "🧺",
      focus: "Solar Drying to 10% Moisture for Maximum Price",
      keyAction: "Dry red ripe pods on clean cement drying floors or UV tarpaulins; turn daily for uniform scarlet red color.",
      waterNutrient: "Zero water before final flush.",
      pestAlert: "Store dried pods in moisture-proof polythene-lined gunny bags to retain natural red gloss."
    }
  ],
  wheat: [
    {
      stage: "Stage 1: Seed Sowing & Crown Root Initiation (CRI)",
      days: "Day 0 – 25",
      targetDay: 21,
      icon: "🌱",
      focus: "Seed Priming & MOST CRITICAL FIRST IRRIGATION",
      keyAction: "Sow certified seeds at 20 cm row spacing with seed-cum-fertilizer drill. First irrigation at Day 21 (CRI stage) is mandatory.",
      waterNutrient: "Basal DAP 55 kg + MOP 20 kg + Urea 25 kg/acre. First irrigation @ CRI ensures 35% more tillers.",
      pestAlert: "Spray Clodinafop-propargyl 15% WP @ 160 g/acre at Day 30 against Phalaris minor (Gulli Danda) weed."
    },
    {
      stage: "Stage 2: Active Tillering & Jointing",
      days: "Day 26 – 55",
      targetDay: 40,
      icon: "🌾",
      focus: "Stem Elongation & Top-Dress Nitrogen",
      keyAction: "Broadcast First Top-Dress Urea (45 kg/acre) right before second irrigation. Weed field thoroughly.",
      waterNutrient: "Second irrigation at late tillering / jointing (Day 40–45).",
      pestAlert: "Check leaves for yellow stripe rust; spray Tilt (Propiconazole 25% EC) @ 1 ml/L at first appearance."
    },
    {
      stage: "Stage 3: Boot Leaf & Heading (Flowering)",
      days: "Day 56 – 75",
      targetDay: 65,
      icon: "🌾",
      focus: "Ear Emergence & Lodging Prevention",
      keyAction: "Third irrigation on calm, non-windy day to prevent plant lodging. Spray 1% Potassium Nitrate (13-0-45) @ 10 g/L.",
      waterNutrient: "Third irrigation at flowering. Spray 0-0-50 to protect against terminal heat.",
      pestAlert: "Scout for earhead aphids; spray Thiamethoxam 25% WG @ 0.3 g/L if > 10 aphids/earhead."
    },
    {
      stage: "Stage 4: Milking & Dough Stage",
      days: "Day 76 – 100",
      targetDay: 85,
      icon: "🌾",
      focus: "Grain Filling & Kernel Plumping",
      keyAction: "Fourth light irrigation at milking stage. Stop all irrigation once grain reaches hard dough stage.",
      waterNutrient: "Light irrigation only; do not flood.",
      pestAlert: "Protect against early summer hot dry winds (terminal heat) with foliar potassium."
    },
    {
      stage: "Stage 5: Combine Harvesting & Straw Management",
      days: "Day 101 – 125",
      targetDay: 115,
      icon: "🚜",
      focus: "Combine Harvest at < 14% Moisture",
      keyAction: "Harvest when grains turn hard and amber colored. Incorporate stubble with Super Seeder (Never burn straw).",
      waterNutrient: "Zero water. Store clean grain at < 12% moisture with dried neem leaves.",
      pestAlert: "Store in airtight silos or bins to prevent Khapra beetle."
    }
  ],
  redgram: [
    {
      stage: "Stage 1: Rhizobium Inoculation & BBF Sowing",
      days: "Day 0 – 25",
      targetDay: 15,
      icon: "🌱",
      focus: "Root Nodule Priming & Wide Row Establishment",
      keyAction: "Treat seeds with Rhizobium + Trichoderma viride in jaggery slurry. Sow on Broad Bed Furrow (BBF) at 120×30 cm.",
      waterNutrient: "Basal DAP 40 kg + Single Super Phosphate (SSP) 50 kg/acre. Rainfed crop.",
      pestAlert: "Never apply heavy synthetic urea; chemical nitrogen prevents atmospheric nitrogen fixation."
    },
    {
      stage: "Stage 2: Inter-Cultivation & TERMINAL NIPPING",
      days: "Day 26 – 60",
      targetDay: 45,
      icon: "🌿",
      focus: "Nipping Top 5 cm to Double Fruiting Branches",
      keyAction: "Run blade harrow at Day 25. At Day 45–50, clip top 5 cm of terminal apical shoots; nipping doubles pod clusters.",
      waterNutrient: "Dust mulching conserves moisture. Spot-irrigate only if dry spell exceeds 25 days.",
      pestAlert: "Inspect for collar rot; drench Carbendazim (1 g/L) if damping-off occurs."
    },
    {
      stage: "Stage 3: Flower Bud Initiation & Pod Borer Trapping",
      days: "Day 61 – 95",
      targetDay: 75,
      icon: "🌸",
      focus: "Flower Retention & Helicoverpa Pheromone Defense",
      keyAction: "Install 4 Helicoverpa pheromone traps/acre. Spray Pulse Wonder (1%) or 13-0-45 (10 g/L) at 50% flowering.",
      waterNutrient: "Critical moisture stage: light irrigation at flower bud opening stops flower drop.",
      pestAlert: "Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L or Emamectin Benzoate 5% SG @ 0.4 g/L at early pod borer larva stage."
    },
    {
      stage: "Stage 4: Pod Development & Maruca Webbing Defense",
      days: "Day 96 – 135",
      targetDay: 110,
      icon: "🫘",
      focus: "Pod Filling & Spotted Pod Borer Defense",
      keyAction: "Inspect flower and pod clusters for Maruca silky webbing. Spray Spinosad 45% SC @ 0.3 ml/L if webbing observed.",
      waterNutrient: "Maintain soil moisture at pod filling stage.",
      pestAlert: "Shake plants early morning onto plastic sheets to dislodge pod borer larvae."
    },
    {
      stage: "Stage 5: Pod Drying & Threshing",
      days: "Day 136 – 165",
      targetDay: 150,
      icon: "🧺",
      focus: "Sun Drying & Bruchids Pest-Free Storage",
      keyAction: "Harvest when 80% pods turn dry brown. Sun-dry harvested plants on threshing floor for 3 days before beating/threshing.",
      waterNutrient: "Zero water. Sun-dry clean dal/pulse to 10% moisture.",
      pestAlert: "Mix sweet flag (Vasambu) rhizome powder or edible neem oil (5 ml/kg seed) to prevent bruchid pulse beetle."
    }
  ],
  soybean: [
    {
      stage: "Stage 1: Seed Inoculation & Stand Setup",
      days: "Day 0 – 18",
      targetDay: 5,
      icon: "🌱",
      focus: "Rhizobium Colonization & Weed Suppression",
      keyAction: "Form BBF raised beds. Treat seeds with Bradyrhizobium japonicum + PSB. Spray Pendimethalin within 48h.",
      waterNutrient: "Basal DAP 50 kg + MOP 25 kg + Sulphur 10 kg/acre. Drain waterlogging promptly.",
      pestAlert: "Inspect stem-fly punctures and cutworms at soil level."
    },
    {
      stage: "Stage 2: Root Nodulation & Vegetative Growth",
      days: "Day 19 – 35",
      targetDay: 25,
      icon: "🌿",
      focus: "Nitrogen Fixation & Grass Weed Control",
      keyAction: "Run wheel hoe between rows. Verify pink root nodules at Day 25. Spray Quizalofop-ethyl if grasses invade.",
      waterNutrient: "Rainfed/protective furrow watering only during prolonged dry spells.",
      pestAlert: "Install 5 yellow sticky traps/acre for whiteflies transmitting YMV."
    },
    {
      stage: "Stage 3: Flower Induction & Girdle Beetle Radar",
      days: "Day 36 – 55",
      targetDay: 40,
      icon: "🌸",
      focus: "Blossom Retention & Borer Defense",
      keyAction: "Foliar spray of 19-19-19 (5 g/L) + Boron 20% (1 g/L) at flower initiation. Scout for petiole girdle cuts.",
      waterNutrient: "CRITICAL: Irrigate during flowering to prevent flower drop.",
      pestAlert: "Chlorantraniliprole 18.5% SC @ 0.3 ml/L if girdle beetle or semiloopers appear."
    },
    {
      stage: "Stage 4: Pod Development & Seed Plumping",
      days: "Day 56 – 80",
      targetDay: 65,
      icon: "🫛",
      focus: "Seed Weight & Potassium Nutrition",
      keyAction: "Spray 13-0-45 Potash @ 10 g/L for plump bold seeds. Rogue out crinkled yellow mosaic virus plants.",
      waterNutrient: "Maintain soil moisture in pod filling window.",
      pestAlert: "Handpick Spodoptera egg masses and caterpillar clusters."
    },
    {
      stage: "Stage 5: Leaf Shedding & Shatter-Free Harvest",
      days: "Day 81 – 100",
      targetDay: 95,
      icon: "🧺",
      focus: "Prompt Threshing & Safe Storage",
      keyAction: "Harvest when leaves yellow/drop and pods turn golden brown. Harvest promptly to stop pod shattering in field.",
      waterNutrient: "Zero water. Sun-dry seed to 9% moisture.",
      pestAlert: "Thresh at low cylinder speed (350 RPM) to protect seed germination."
    }
  ],
  groundnut: [
    {
      stage: "Stage 1: Pulverized Sowing & Seed Coating",
      days: "Day 0 – 20",
      targetDay: 10,
      icon: "🌱",
      focus: "Collar Rot Prevention & 100% Population",
      keyAction: "Pulverize sandy loam soil. Treat kernels with Trichoderma viride (10 g/kg). Dibble gap seeds by Day 10.",
      waterNutrient: "Basal SSP 125 kg (Calcium + Sulphur) + MOP 35 kg + Urea 15 kg/acre.",
      pestAlert: "Apply Pendimethalin pre-emergence within 48 hours."
    },
    {
      stage: "Stage 2: Early Vegetative & Hand Weeding",
      days: "Day 21 – 35",
      targetDay: 25,
      icon: "🌿",
      focus: "Surface Loosening for Future Pegs",
      keyAction: "Hand weed and shallow hoe between rows before 35 DAS. DO NOT DISTURB SOIL AFTER 40 DAS.",
      waterNutrient: "Irrigate every 10–12 days in light soils.",
      pestAlert: "Inspect root collars for black Aspergillus rot."
    },
    {
      stage: "Stage 3: Gypsum Top-Dressing & Peg Entry",
      days: "Day 36 – 60",
      targetDay: 45,
      icon: "🥜",
      focus: "Subterranean Calcium for Shell Filling",
      keyAction: "Broadcast 200 kg Agricultural Gypsum/acre at Day 40–45 around plants. Irrigate immediately. Stop all hoeing.",
      waterNutrient: "Maintain topsoil moist and soft so aerial pegs penetrate smoothly.",
      pestAlert: "Hoeing after 40 days cuts pegs and causes 40% yield loss."
    },
    {
      stage: "Stage 4: Pod Bulking & Tikka Leaf Spot Defense",
      days: "Day 61 – 95",
      targetDay: 75,
      icon: "🫛",
      focus: "Foliage Protection & Pod Filling",
      keyAction: "Spray Tebuconazole 25.9% EC @ 1 ml/L against Tikka spot and rust. Spray 1% Potassium Nitrate for pod density.",
      waterNutrient: "Irrigate every 7–8 days during pod development.",
      pestAlert: "Scout leaf undersides for brown Tikka spots with yellow halos."
    },
    {
      stage: "Stage 5: Digging & Inverted Sun Curing",
      days: "Day 96 – 115",
      targetDay: 110,
      icon: "🧺",
      focus: "Aflatoxin-Free Harvest & Drying",
      keyAction: "Light pre-harvest irrigation. Dig pods, invert plants facing sun for 3–5 days to dry kernels to 8% moisture.",
      waterNutrient: "Zero water during pulling.",
      pestAlert: "Never heap moist groundnut vines in humid piles; prevents toxic aflatoxin."
    }
  ],
  chickpea: [
    {
      stage: "Stage 1: Residual Moisture Sowing & Seed Priming",
      days: "Day 0 – 20",
      targetDay: 10,
      icon: "🌱",
      focus: "Deep Root Stand & Wilt Prevention",
      keyAction: "Sow primed seeds (soaked 4h) treated with Mesorhizobium + Carbendazim. Conserve subsoil moisture.",
      waterNutrient: "Basal DAP 40 kg + MOP 15 kg + Sulphur 10 kg/acre in furrows.",
      pestAlert: "Plant certified wilt-resistant varieties (JG 11 / JAKI 9218)."
    },
    {
      stage: "Stage 2: Vegetative Growth & Mandatory Nipping",
      days: "Day 21 – 35",
      targetDay: 32,
      icon: "🌿",
      focus: "Apical Break & Heavy Lateral Branching",
      keyAction: "NIP TOP 3 CM GROWING TIPS of main shoots at Day 30–35. Stimulates 4–6 heavy secondary pod branches.",
      waterNutrient: "Rainfed / Zero irrigation (forces deep taproot growth).",
      pestAlert: "Install 15 'T'-shaped bird perches per acre."
    },
    {
      stage: "Stage 3: Flower Induction & Pod Borer Traps",
      days: "Day 36 – 60",
      targetDay: 45,
      icon: "🌸",
      focus: "Flower Retention & Life-Saving Water",
      keyAction: "Install 5 Helicoverpa pheromone traps. Spray 2% DAP + 0.2% Boron at flower initiation. Give ONE irrigation now.",
      waterNutrient: "ONE PROTECTIVE IRRIGATION at pre-flowering. NEVER irrigate during full bloom.",
      pestAlert: "Scout leaf undersides for small green Helicoverpa caterpillars."
    },
    {
      stage: "Stage 4: Pod Development & Terminal Heat Shield",
      days: "Day 61 – 85",
      targetDay: 75,
      icon: "🫛",
      focus: "Grain Filling & Potassium Spray",
      keyAction: "Spray Chlorantraniliprole 18.5% SC @ 0.3 ml/L if borer exceeds 1/m-row. Spray 1% Potassium Nitrate (13-0-45).",
      waterNutrient: "Light irrigation at early pod fill if black soil cracks severely.",
      pestAlert: "Evening sprays (4–6 PM) ensure maximum caterpillar knockdown."
    },
    {
      stage: "Stage 5: Pod Desiccation & Safe Storage",
      days: "Day 86 – 105",
      targetDay: 100,
      icon: "🧺",
      focus: "Clean Threshing & Pulse Beetle Protection",
      keyAction: "Harvest when 85% of leaves and pods turn golden-yellow. Cut at base in morning. Sun-dry sheaves 4 days.",
      waterNutrient: "Zero water 20 days before harvest.",
      pestAlert: "Coat stored grain with neem oil (5 ml/kg) to block Callosobruchus bruchid beetles."
    }
  ],
  sugarcane: [
    {
      stage: "Stage 1: Trench Planting & Sett Treatment",
      days: "Day 0 – 35",
      targetDay: 20,
      icon: "🌱",
      focus: "100% Sprouting & Termite Defense",
      keyAction: "Open trenches at 120 cm. Dip 2-bud setts in Carbendazim + Chlorpyrifos. Plant setts with buds facing sideways.",
      waterNutrient: "Basal SSP 250 kg + MOP 20 kg + Urea 30 kg + Zinc 10 kg/acre.",
      pestAlert: "Spray Atrazine 50% WP within 3 days for pre-emergence weed control."
    },
    {
      stage: "Stage 2: Tillering & Early Shoot Borer Defense",
      days: "Day 36 – 90",
      targetDay: 60,
      icon: "🌿",
      focus: "Clump Density & First Split Fertilizer",
      keyAction: "Top-dress 50 kg Urea at Day 45. Release Trichogramma egg cards (50,000/acre) against Early Shoot Borer.",
      waterNutrient: "Furrow irrigation every 7–9 days during summer tillering.",
      pestAlert: "Fipronil 0.3% GR @ 10 kg/acre in furrows if 'dead hearts' appear."
    },
    {
      stage: "Stage 3: FINAL EARTHING UP & Trash Mulching",
      days: "Day 91 – 130",
      targetDay: 115,
      icon: "🎋",
      focus: "Root Anchoring & Anti-Lodging Ridges",
      keyAction: "FINAL EARTHING UP: Convert furrows into high ridges around cane clumps. Spread dried trash (3 t/ac) in furrows.",
      waterNutrient: "Second split: 50 kg Urea + 30 kg MOP at Day 90 before earthing up.",
      pestAlert: "Earthing up stops cane clumps from lodging flat during monsoon storms."
    },
    {
      stage: "Stage 4: Grand Biomass Growth & De-Trashing",
      days: "Day 131 – 240",
      targetDay: 180,
      icon: "🌴",
      focus: "Internode Elongation & Cyclone Tying",
      keyAction: "Final Potash split (MOP 30 kg) + 40 kg Urea at Day 150. Strip dried leaves (de-trashing). Tie clumps together (propping).",
      waterNutrient: "Irrigate every 6–8 days. STOP ALL CHEMICAL NITROGEN after Day 150.",
      pestAlert: "Late nitrogen reduces sucrose sugar concentration at mill."
    },
    {
      stage: "Stage 5: Brix Testing & Ground-Level Harvest",
      days: "Day 241 – 330",
      targetDay: 315,
      icon: "🧺",
      focus: "Peak Sucrose Recovery & Fast Delivery",
      keyAction: "Check juice Brix (target 18–20%). Stop water 20 days prior. Cut flush at ground level. Deliver to mill in 24h.",
      waterNutrient: "Zero water 20 days prior to cane cutting.",
      pestAlert: "Each day delay in delivery causes sucrose inversion into low-value glucose."
    }
  ],
  mustard: [
    {
      stage: "Stage 1: Planking & Line Sowing",
      days: "Day 0 – 15",
      targetDay: 5,
      icon: "🌱",
      focus: "Sulphur Nutrition & Moisture Conservation",
      keyAction: "Plank heavily after ploughing. Treat seed with Metalaxyl (6 g/kg). Sow at 30×10 cm at 2 cm depth.",
      waterNutrient: "Basal DAP 35 kg + MOP 25 kg + Urea 25 kg + Sulphur Bentonite 15 kg/acre.",
      pestAlert: "Sulphur raises oil percentage by 2.5–3.0%."
    },
    {
      stage: "Stage 2: Mandatory Seedling Thinning",
      days: "Day 16 – 30",
      targetDay: 20,
      icon: "🌿",
      focus: "10 cm Spacing & First Irrigation",
      keyAction: "MANDATORY THINNING at Day 18 to leave 1 plant every 10 cm. FIRST IRRIGATION at rosette stage (Day 25–28).",
      waterNutrient: "Top-dress 30 kg Urea per acre just prior to first watering.",
      pestAlert: "Overcrowding cuts yield by 40%; thinning is non-negotiable."
    },
    {
      stage: "Stage 3: Full Bloom & Mustard Aphid Radar",
      days: "Day 31 – 60",
      targetDay: 40,
      icon: "🌼",
      focus: "Bee Cross-Pollination & Aphid Defense",
      keyAction: "SECOND IRRIGATION at siliqua setting (50 DAS). Scout aphids on shoots. SPRAY ONLY AFTER 3:30 PM.",
      waterNutrient: "Furrow irrigation every 15–20 days.",
      pestAlert: "Spray Dimethoate or Thiamethoxam in late afternoon to protect foraging honeybees."
    },
    {
      stage: "Stage 4: Siliqua Seed Bulking & Blight Control",
      days: "Day 61 – 90",
      targetDay: 75,
      icon: "🫛",
      focus: "Alternaria Defense & Heat Protection",
      keyAction: "Spray Mancozeb @ 2.5 g/L against Alternaria leaf/pod blight. Spray 1% Potassium Nitrate against heat.",
      waterNutrient: "Stop all irrigation once pods turn light yellow-green.",
      pestAlert: "Avoid heavy watering during high winds to prevent crop lodging."
    },
    {
      stage: "Stage 5: Morning Harvest & Threshing",
      days: "Day 91 – 115",
      targetDay: 110,
      icon: "🧺",
      focus: "Shatter-Free Harvesting",
      keyAction: "Harvest when 75–80% pods turn golden-yellow. Harvest early morning when dew prevents pod shattering.",
      waterNutrient: "Zero water.",
      pestAlert: "Dry seeds to 8% moisture before storing in clean dry bins."
    }
  ],
  onion: [
    {
      stage: "Stage 1: Nursery Transplanting & Root Dip",
      days: "Day 0 – 20",
      targetDay: 5,
      icon: "🌱",
      focus: "Transplant Anchor & Weed Prevention",
      keyAction: "Transplant 40-day pencil-thick seedlings at 15×10 cm on broad beds. Trim top 1/3rd leaves. Dip roots in Carbendazim + Imidacloprid.",
      waterNutrient: "Basal DAP 45 kg + MOP 35 kg + Urea 20 kg + Sulphur 20 kg/acre. Immediate light watering.",
      pestAlert: "Spray Oxyfluorfen within 3 days for early weed suppression."
    },
    {
      stage: "Stage 2: Foliar Vigor & First Top-Dressing",
      days: "Day 21 – 40",
      targetDay: 28,
      icon: "🌿",
      focus: "Root Depth & Leaf Area Development",
      keyAction: "Hand weed at Day 25. Apply First Top-Dressing: 30 kg Urea/acre. Install 15 Blue Sticky Traps for thrips.",
      waterNutrient: "Shallow frequent irrigations every 5–7 days (shallow root system).",
      pestAlert: "Inspect inner leaf axils for tiny yellow thrips nymphs."
    },
    {
      stage: "Stage 3: Bulb Initiation & Thrips Eradication",
      days: "Day 41 – 70",
      targetDay: 50,
      icon: "🧅",
      focus: "Bulb Sizing & Wetting Agent Sprays",
      keyAction: "Spray Spinetoram 11.7% SC @ 0.8 ml/L with non-ionic sticker against thrips. Second Split: 25 kg Urea + 15 kg Potash/acre.",
      waterNutrient: "CRITICAL: Maintain uniform moisture. Fluctuating moisture creates split double bulbs.",
      pestAlert: "Onion leaf wax deflects spray; sticker is mandatory."
    },
    {
      stage: "Stage 4: Bulb Bulking & NITROGEN CUTOFF",
      days: "Day 71 – 100",
      targetDay: 85,
      icon: "🫛",
      focus: "Skin Hardening & Purple Blotch Defense",
      keyAction: "Spray Sulphate of Potash (0-0-50) @ 10 g/L for rich pink scales. Spray Nativo @ 0.7 g/L against Purple Blotch. STOP ALL UREA.",
      waterNutrient: "Taper off watering frequency.",
      pestAlert: "Late nitrogen after 70 days causes thick-necked onions that rot in storage."
    },
    {
      stage: "Stage 5: 50% Neck Fall & Field Curing",
      days: "Day 101 – 125",
      targetDay: 118,
      icon: "🧺",
      focus: "Neck Drying & Long Storage Life",
      keyAction: "Harvest when 50–70% plant necks soften and fall over. STOP WATER 15 DAYS PRIOR. Windrow cure in field 3 days. Leave 2.5 cm neck.",
      waterNutrient: "Zero water 15 days before harvest.",
      pestAlert: "Leaving 2.5 cm dry neck stops Botrytis fungal neck rot in storage."
    }
  ],
  potato: [
    {
      stage: "Stage 1: Seed Sprouting & Ridge Planting",
      days: "Day 0 – 20",
      targetDay: 5,
      icon: "🌱",
      focus: "Sprout Emergence & Black Scurf Defense",
      keyAction: "Sprout cold store tubers (40–50 g) in diffused light. Dip cut tubers in Mancozeb (2.5 g/L). Plant on ridges at 60×20 cm.",
      waterNutrient: "Basal 50% Urea (65 kg) + SSP 250 kg + 50% MOP (40 kg)/acre. Pre-sowing furrow watering.",
      pestAlert: "Never plant freshly cut wet tubers directly into wet mud."
    },
    {
      stage: "Stage 2: Emergence & MANDATORY EARTHING UP",
      days: "Day 21 – 35",
      targetDay: 28,
      icon: "🌿",
      focus: "Ridge Mounding & Stolon Bed Formation",
      keyAction: "FIRST EARTHING UP: Mound loose soil around stems to form high broad ridges. Top-dress remaining 50% Urea (65 kg) + 50% MOP (40 kg).",
      waterNutrient: "Immediate furrow watering following earthing up.",
      pestAlert: "Earthing up stops tubers from turning green with toxic solanine."
    },
    {
      stage: "Stage 3: Tuber Initiation & Late Blight Radar",
      days: "Day 36 – 55",
      targetDay: 42,
      icon: "🥔",
      focus: "Tuber Count Setting & Fog Defense",
      keyAction: "Stolons swell into baby tubers. LATE BLIGHT DEFENSE: Spray Cymoxanil + Mancozeb (2.5 g/L) immediately if foggy drizzling weather occurs.",
      waterNutrient: "MOST CRITICAL: Maintain steady moisture. Drought causes hollow heart and knobby tubers.",
      pestAlert: "Late Blight can destroy an entire field in 4 days in cool humid fog."
    },
    {
      stage: "Stage 4: Tuber Bulking & MANDATORY DEHAULMING",
      days: "Day 56 – 82",
      targetDay: 80,
      icon: "🫛",
      focus: "Starch Filling & Skin Hardening",
      keyAction: "Spray 0-0-50 Sulphate of Potash @ 10 g/L at Day 65. MANDATORY DEHAULMING at Day 80: Cut green foliage 10 days prior to digging.",
      waterNutrient: "STOP ALL IRRIGATION immediately upon dehaulming.",
      pestAlert: "Dehaulming cures skin periderm so tubers do not peel or rot."
    },
    {
      stage: "Stage 5: Digging, Shade Curing & Bagging",
      days: "Day 83 – 95",
      targetDay: 92,
      icon: "🧺",
      focus: "Skin Curing & Cold Storage Prep",
      keyAction: "Harvest 10 days post-dehaulming when soil is friable. Dig with potato digger. Heap tubers in shade for 10 days to heal skin abrasions.",
      waterNutrient: "Zero water.",
      pestAlert: "Never leave harvested potatoes in direct sun; causes internal blackheart rot."
    }
  ]
};

// ── NUTRIENT DEFICIENCY & VISUAL FIELD DOCTOR ────────────────────────────────
export const CROP_NUTRIENT_DEFICIENCIES = {
  cotton: [
    {
      id: "n_def",
      nutrient: "Nitrogen (N) Deficiency",
      symptom: "General pale yellowish-green tint starting on oldest lower leaves; stunted plants with reduced square formation.",
      cause: "Heavy rain leaching, low soil organic carbon, or delayed top-dressing.",
      remedy: "Foliar spray of 1.5–2.0% Urea (15–20 g/L water) or top-dress 30 kg Neem-Coated Urea followed by furrow irrigation.",
      recoveryTime: "3–5 Days",
      severity: "High"
    },
    {
      id: "mg_def",
      nutrient: "Magnesium (Mg) Deficiency ('Lal Patti' / Red Leaf)",
      symptom: "Interveinal purplish-red discoloration on mature leaves while veins remain green; severe leaf drop at boll formation.",
      cause: "High potassium/calcium antagonism in black cotton soils or waterlogging.",
      remedy: "Foliar spray of Magnesium Sulphate (MgSO4) @ 10 g/L (1%) + 10 g/L Urea twice at 15-day intervals.",
      recoveryTime: "5–7 Days",
      severity: "Critical"
    },
    {
      id: "zn_def",
      nutrient: "Zinc (Zn) Deficiency",
      symptom: "Interveinal chlorosis on young upper leaves with small clustered leaves ('little leaf' rosette) and short internodes.",
      cause: "High soil pH (>8.0), calcareous black soils, or excessive phosphorus application.",
      remedy: "Foliar spray of Chelated Zinc (Zn-EDTA 12%) @ 1.0 g/L or Zinc Sulphate (21%) @ 5 g/L neutralized with 2.5 g/L Lime.",
      recoveryTime: "6–8 Days",
      severity: "Moderate"
    },
    {
      id: "b_def",
      nutrient: "Boron (B) Deficiency",
      symptom: "Excessive square and flower dropping; small deformed bolls that fail to open ('parrot-beaking' bolls).",
      cause: "Sandy or light red soils during drought periods.",
      remedy: "Foliar spray of Solubor (Boron 20%) @ 1.0–1.25 g/L at peak squaring and flowering stages.",
      recoveryTime: "4–6 Days",
      severity: "Critical"
    }
  ],
  paddy: [
    {
      id: "zn_def",
      nutrient: "Zinc Deficiency ('Khaira' Disease)",
      symptom: "Rusty brown or bronze pigmentation appearing 2–3 weeks after transplanting on lower leaves; stunted seedlings.",
      cause: "Calcareous alkali soils, high bicarbonate irrigation water, or submergence in anaerobic soils.",
      remedy: "Foliar spray of 0.5% Zinc Sulphate (5 g/L) + 0.25% Slaked Lime (2.5 g/L). Repeat after 7 days.",
      recoveryTime: "4–6 Days",
      severity: "Critical"
    },
    {
      id: "n_def",
      nutrient: "Nitrogen (N) Deficiency",
      symptom: "Yellowing of bottom leaves, poor tiller production (less than 10 tillers/hill), and premature flowering with short panicles.",
      cause: "Denitrification under waterlogged conditions or sandy leaching.",
      remedy: "Broadcast 30 kg Neem-Coated Urea in drained field, followed by shallow irrigation 24 hours later.",
      recoveryTime: "3–4 Days",
      severity: "High"
    },
    {
      id: "k_def",
      nutrient: "Potassium (K) Deficiency",
      symptom: "Dark green leaves with scorch/burning along leaf margins; weak culms prone to heavy lodging and blast susceptibility.",
      cause: "Intensive cropping without MOP application in acid or light soils.",
      remedy: "Top-dress 25 kg MOP/acre or foliar spray of Potassium Nitrate (13-0-45) @ 10 g/L at panicle initiation.",
      recoveryTime: "5–7 Days",
      severity: "High"
    },
    {
      id: "fe_def",
      nutrient: "Iron (Fe) Chlorosis",
      symptom: "Youngest emerging leaves show bright ivory-white or pale yellow striping between veins; common in upland direct-seeded rice.",
      cause: "Calcareous alkaline soils where iron is immobilized.",
      remedy: "Foliar spray of Ferrous Sulphate (19% Fe) @ 10 g/L + Citric Acid (1 g/L) to enhance absorption.",
      recoveryTime: "4–5 Days",
      severity: "Moderate"
    }
  ],
  maize: [
    {
      id: "zn_def",
      nutrient: "Zinc Deficiency ('White Bud' of Maize)",
      symptom: "Broad bleached white or light yellow bands on either side of the midrib on young leaves; apical bud turns white.",
      cause: "High soil pH (>7.8) and excessive basal phosphate fertilizer.",
      remedy: "Foliar spray of Zinc Sulphate (21%) @ 5 g/L + Urea @ 10 g/L twice at knee-high stage.",
      recoveryTime: "4–6 Days",
      severity: "Critical"
    },
    {
      id: "n_def",
      nutrient: "Nitrogen (N) Deficiency",
      symptom: "V-shaped yellowing starting from leaf tips and proceeding along the midrib towards the stem on lower leaves.",
      cause: "Heavy downpours leaching nitrogen; shallow root depth.",
      remedy: "Top-dress 35 kg Urea per acre 10 cm away from plant rows, immediately before irrigation.",
      recoveryTime: "3–5 Days",
      severity: "High"
    },
    {
      id: "p_def",
      nutrient: "Phosphorus (P) Deficiency",
      symptom: "Distinct reddish-purple coloration along leaf margins and stems of young seedlings; delayed silking.",
      cause: "Cold wet soils, low soil organic matter, or soil pH < 5.5 / > 8.0.",
      remedy: "Foliar spray of 12-61-0 (Mono-Ammonium Phosphate) @ 10 g/L or 19-19-19 @ 10 g/L.",
      recoveryTime: "5–7 Days",
      severity: "Moderate"
    },
    {
      id: "b_def",
      nutrient: "Boron (B) Deficiency",
      symptom: "Irregular or missing kernel rows on cobs ('blank cobs'), deformed tassels, and poor pollen viability.",
      cause: "Drought stress during silking and coarse sandy soils.",
      remedy: "Foliar spray of Boron 20% @ 1.0 g/L at tassel emergence.",
      recoveryTime: "Pre-flowering only",
      severity: "High"
    }
  ],
  tomato: [
    {
      id: "ca_def",
      nutrient: "Calcium (Ca) Deficiency (Blossom End Rot)",
      symptom: "Water-soaked dark sunken leathery black rot at the blossom end (bottom tip) of expanding green fruits.",
      cause: "Irregular watering causing sudden calcium transport stoppage to fast-growing fruit tips.",
      remedy: "Maintain steady drip watering. Foliar spray of Calcium Nitrate @ 5 g/L or Chelated Calcium @ 1.5 g/L every 7 days.",
      recoveryTime: "Stops new fruit rot in 3 Days",
      severity: "Critical"
    },
    {
      id: "k_def",
      nutrient: "Potassium (K) Deficiency ('Yellow Shoulders')",
      symptom: "Fruit shoulders remain hard, green or yellow and fail to ripen uniformly; leaf margins scorch upwards.",
      cause: "Heavy crop load draining potassium; high magnesium competition in soil.",
      remedy: "Fertigate 0-0-50 Sulphate of Potash @ 3 kg/acre weekly or foliar spray Potassium Schoenite @ 8 g/L.",
      recoveryTime: "5–7 Days",
      severity: "High"
    },
    {
      id: "mg_def",
      nutrient: "Magnesium (Mg) Deficiency",
      symptom: "Interveinal yellowing (chlorosis) on older leaves while veins stay dark green, followed by brittle brown necrotic spots.",
      cause: "Acid soils or over-fertilization with potassium and ammonium fertilizers.",
      remedy: "Foliar spray of Magnesium Sulphate @ 5 g/L (0.5%) + Urea 2 g/L twice at 10-day intervals.",
      recoveryTime: "5–6 Days",
      severity: "Moderate"
    },
    {
      id: "b_def",
      nutrient: "Boron (B) Deficiency (Fruit Cracking & Corking)",
      symptom: "Radial or concentric skin cracking near stem scar; corky rough brown fruit surface and blossom dropping.",
      cause: "Dry soil followed by sudden heavy irrigation or high pH calcareous soils.",
      remedy: "Foliar spray of Solubor (Boron 20%) @ 1.0 g/L at flower flush and fruit initiation.",
      recoveryTime: "Prevents subsequent clusters",
      severity: "High"
    }
  ],
  chilli: [
    {
      id: "ca_def",
      nutrient: "Calcium (Ca) Deficiency (Blossom End Rot of Chilli)",
      symptom: "Sunken dry bleached necrotic lesions near the pod tip; premature pod drop.",
      cause: "Drought spells between irrigations restricting calcium transpiration flow.",
      remedy: "Foliar spray of Calcium Nitrate @ 5 g/L + Boron @ 1 g/L; avoid soil moisture fluctuations.",
      recoveryTime: "4–6 Days",
      severity: "High"
    },
    {
      id: "mg_def",
      nutrient: "Magnesium (Mg) Deficiency",
      symptom: "Older leaves turn golden yellow between veins; severe leaf shedding during peak fruiting flushes.",
      cause: "High potassium/ammonium dosing suppressing magnesium uptake.",
      remedy: "Foliar spray of Magnesium Sulphate @ 5 g/L at 45 and 65 days after transplanting.",
      recoveryTime: "5–7 Days",
      severity: "Moderate"
    },
    {
      id: "b_def",
      nutrient: "Boron (B) Deficiency",
      symptom: "Flower bud necrosis, severe bud dropping, and deformed curved pods with thickened brittle walls.",
      cause: "Coarse soils and alkaline conditions.",
      remedy: "Foliar spray of Boron 20% @ 1 g/L at first flowering and 20 days later.",
      recoveryTime: "4–5 Days",
      severity: "Critical"
    },
    {
      id: "zn_def",
      nutrient: "Zinc (Zn) Deficiency",
      symptom: "Stunted bushy growth with small, narrow upright leaves ('little leaf') and mottled chlorotic patches.",
      cause: "High phosphate fertilizer locking zinc into insoluble compounds.",
      remedy: "Foliar spray of Chelated Zinc EDTA 12% @ 1.0 g/L.",
      recoveryTime: "5–8 Days",
      severity: "Moderate"
    }
  ],
  wheat: [
    {
      id: "n_def",
      nutrient: "Nitrogen (N) Deficiency",
      symptom: "General light green to pale yellow foliage starting on basal leaves; low tiller number and early heading with small ears.",
      cause: "Delayed urea top-dressing or leaching after heavy winter canal irrigation.",
      remedy: "Top-dress 40 kg Urea/acre before second irrigation or foliar spray 2% Urea (20 g/L).",
      recoveryTime: "3–4 Days",
      severity: "High"
    },
    {
      id: "zn_def",
      nutrient: "Zinc (Zn) Deficiency",
      symptom: "White or necrotic brown lesions along middle leaf blades; plants remain dwarf with poor root volume.",
      cause: "Rice-wheat cropping system leading to subsoil zinc exhaustion.",
      remedy: "Foliar spray of 0.5% Zinc Sulphate (5 g/L) + 0.25% Slaked Lime at CRI stage.",
      recoveryTime: "5–7 Days",
      severity: "High"
    },
    {
      id: "fe_def",
      nutrient: "Iron (Fe) Chlorosis",
      symptom: "Interveinal yellowing on upper youngest leaves while veins remain green; prevalent in light sandy soils.",
      cause: "High calcium carbonate in soils immobilizing iron.",
      remedy: "Foliar spray of Ferrous Sulphate (19%) @ 10 g/L + Citric Acid (1 g/L) twice at 10-day intervals.",
      recoveryTime: "4–6 Days",
      severity: "Moderate"
    },
    {
      id: "k_def",
      nutrient: "Potassium (K) & Terminal Heat Stress",
      symptom: "Tip and margin scorching on flag leaf; grains shrivel prematurely under high March temperatures.",
      cause: "Insufficient potash nutrition causing poor stomatal regulation during heat waves.",
      remedy: "Foliar spray of Potassium Nitrate (13-0-45) @ 10 g/L or 0-0-50 @ 10 g/L at heading and milking stages.",
      recoveryTime: "Immediate heat buffer",
      severity: "Critical"
    }
  ],
  redgram: [
    {
      id: "p_def",
      nutrient: "Phosphorus (P) Deficiency",
      symptom: "Dull bluish-green or purplish tint on leaves, stunted root nodule development, and delayed flowering.",
      cause: "Pulse grown on marginal red chalka soils without single super phosphate (SSP).",
      remedy: "Foliar spray of 12-61-0 (Mono-Ammonium Phosphate) @ 10 g/L or 19-19-19 @ 10 g/L at branching.",
      recoveryTime: "5–7 Days",
      severity: "High"
    },
    {
      id: "b_def",
      nutrient: "Boron (B) Deficiency",
      symptom: "Flower bud drop exceeding 70%; small distorted pods with aborted seeds inside.",
      cause: "Rainfed dryland drought stress.",
      remedy: "Foliar spray of Boron 20% @ 1.0 g/L + NAA 4.5% SL @ 0.25 ml/L at flower initiation.",
      recoveryTime: "Protects new flower clusters",
      severity: "Critical"
    },
    {
      id: "s_def",
      nutrient: "Sulphur (S) Deficiency",
      symptom: "Pale yellowing of youngest leaves while older lower leaves stay green (opposite of nitrogen deficiency).",
      cause: "Continuous use of DAP without Sulphur-containing fertilizers like SSP or Gypsum.",
      remedy: "Foliar spray of Sulphur 80% WDG @ 3 g/L or broadcast 50 kg Gypsum/acre.",
      recoveryTime: "4–6 Days",
      severity: "Moderate"
    },
    {
      id: "zn_def",
      nutrient: "Zinc (Zn) Deficiency",
      symptom: "Bronzing of leaf lamina between veins, short internodes, and stunted pulse bush.",
      cause: "Alkaline dryland black soils.",
      remedy: "Foliar spray of Chelated Zinc 12% @ 1 g/L at 30 days after sowing.",
      recoveryTime: "6–8 Days",
      severity: "Moderate"
    }
  ],
  soybean: [
    {
      id: "fe_def",
      nutrient: "Iron (Fe) Chlorosis ('Peela Rog')",
      symptom: "Severe bleaching and ivory-white yellowing of young leaves while veins remain green; severe stunting on high pH calcareous soils.",
      cause: "High soil calcium carbonate locking iron in insoluble ferric forms.",
      remedy: "Foliar spray of Ferrous Sulphate (FeSO4 19%) @ 5 g/L + Citric Acid (1 g/L) or Chelated Fe-EDTA @ 1 g/L.",
      recoveryTime: "4–6 Days",
      severity: "High"
    },
    {
      id: "s_def",
      nutrient: "Sulphur (S) Deficiency",
      symptom: "Younger leaves turn uniformly pale yellow while older bottom leaves stay green; reduced nodulation and low seed oil content.",
      cause: "Low soil organic matter and continuous use of sulphur-free high analysis fertilizers.",
      remedy: "Broadcast 10 kg Sulphur Bentonite 90% or foliar spray of Sulphur 80% WDG @ 3 g/L.",
      recoveryTime: "5–7 Days",
      severity: "Moderate"
    },
    {
      id: "k_def",
      nutrient: "Potassium (K) Deficiency",
      symptom: "Marginal chlorosis followed by scorching and necrotic firing along leaf edges of mature lower leaves.",
      cause: "Sandy or light soils with low cation exchange capacity.",
      remedy: "Foliar spray of 1% Potassium Nitrate (13-0-45) or 0-0-50 Sulphate of Potash @ 10 g/L.",
      recoveryTime: "4–5 Days",
      severity: "Moderate"
    }
  ],
  groundnut: [
    {
      id: "ca_def",
      nutrient: "Calcium (Ca) Deficiency ('Pops' / Empty Pods)",
      symptom: "Developing pods remain empty or contain shriveled unviable seeds ('pops'); dark necrotic spots inside embryo kernels.",
      cause: "Low available calcium in pegging zone (top 5 cm soil).",
      remedy: "Broadcast 200 kg Agricultural Gypsum per acre at Day 40–45 around plant base followed by furrow irrigation.",
      recoveryTime: "Must be applied before Day 50 (Preventive)",
      severity: "Critical"
    },
    {
      id: "fe_def",
      nutrient: "Iron (Fe) Deficiency (Lime-Induced Chlorosis)",
      symptom: "Ivory-white bleaching of terminal leaflets; complete loss of chlorophyll during rainy overcast spells.",
      cause: "Calcareous alkaline red/black soils with pH > 7.8.",
      remedy: "Foliar spray of 0.5% Ferrous Sulphate (5 g/L) + 0.1% Citric Acid (1 g/L) twice at 10-day intervals.",
      recoveryTime: "5–7 Days",
      severity: "High"
    },
    {
      id: "b_def",
      nutrient: "Boron (B) Deficiency ('Hollow Heart')",
      symptom: "Internal cavity or brownish hollow heart inside peanut kernels; severely reduces market grading value.",
      cause: "Sandy soils leached by heavy rainfall.",
      remedy: "Foliar spray of Solubor (Boron 20%) @ 1.0 g/L at peak flowering and pegging stages.",
      recoveryTime: "6–8 Days",
      severity: "Moderate"
    }
  ],
  chickpea: [
    {
      id: "fe_def",
      nutrient: "Iron (Fe) Chlorosis",
      symptom: "Interveinal yellowing of young top leaves; severely stunted chickpea bush in high lime black soils.",
      cause: "High bicarbonate levels in soil solution impairing iron uptake.",
      remedy: "Foliar spray of Ferrous Sulphate @ 5 g/L + Citric acid 1 g/L at 30–35 DAS.",
      recoveryTime: "4–6 Days",
      severity: "Moderate"
    },
    {
      id: "b_def",
      nutrient: "Boron (B) Deficiency",
      symptom: "Flower bud sterility; flowers drop off without setting pods; terminal growing points become brittle.",
      cause: "Dry soil profile in Rabi season.",
      remedy: "Foliar spray of Boron 20% @ 1.0 g/L at flower bud initiation.",
      recoveryTime: "5–7 Days",
      severity: "Critical"
    },
    {
      id: "p_def",
      nutrient: "Phosphorus (P) Deficiency",
      symptom: "Dark purplish-bronze foliage coloration, stunted erect stems, and very few Rhizobium root nodules.",
      cause: "Acidic or alkaline fixation of phosphorus.",
      remedy: "Foliar spray of 2% DAP (20 g/L) solution at 35 DAS.",
      recoveryTime: "5–7 Days",
      severity: "Moderate"
    }
  ],
  sugarcane: [
    {
      id: "fe_def",
      nutrient: "Iron (Fe) Chlorosis ('Yellow Leaf Banding')",
      symptom: "Pronounced yellow bleached stripes running parallel along leaf blades on young cane whorls; whole canopy looks whitish-yellow.",
      cause: "Calcareous alkaline soils with high active lime.",
      remedy: "Foliar spray of Ferrous Sulphate (10 g/L) + Urea (10 g/L) twice at 10-day intervals.",
      recoveryTime: "5–7 Days",
      severity: "High"
    },
    {
      id: "n_def",
      nutrient: "Nitrogen (N) Deficiency",
      symptom: "Pale yellowish-green narrow leaves, early leaf senescence, short internodes, and very thin cane diameter.",
      cause: "Low soil organic matter, waterlogging, or insufficient basal nitrogen.",
      remedy: "Apply 50 kg Urea/acre in furrows followed by immediate irrigation.",
      recoveryTime: "4–6 Days",
      severity: "High"
    },
    {
      id: "mg_def",
      nutrient: "Magnesium (Mg) Deficiency ('Orange Freckling')",
      symptom: "Small chlorotic spots that turn rusty-orange and necrotic ('rust-like freckles') on older lower leaves.",
      cause: "Heavy potassium or ammonium fertilizer over-application competing with magnesium.",
      remedy: "Foliar spray of Magnesium Sulphate @ 10 g/L (1%).",
      recoveryTime: "7–9 Days",
      severity: "Moderate"
    }
  ],
  mustard: [
    {
      id: "s_def",
      nutrient: "Sulphur (S) Deficiency",
      symptom: "Inward cupping of leaves with pronounced purple-reddish pigmentation on leaf undersides; stunted siliquae.",
      cause: "Mustard requires 1 kg Sulphur for every 2 kg Nitrogen; lack of sulphur cripples glucosinolate oil synthesis.",
      remedy: "Broadcast 15 kg Sulphur Bentonite per acre or foliar spray of Sulphur 80% WDG @ 3 g/L.",
      recoveryTime: "4–6 Days",
      severity: "Critical"
    },
    {
      id: "zn_def",
      nutrient: "Zinc (Zn) Deficiency",
      symptom: "Interveinal yellowing of lower and middle leaves; delayed flowering and small stunted siliquae.",
      cause: "Alkaline sandy soils with low zinc availability.",
      remedy: "Foliar spray of Zinc Sulphate (21%) @ 5 g/L + 2.5 g/L Lime at rosette stage.",
      recoveryTime: "5–7 Days",
      severity: "Moderate"
    },
    {
      id: "b_def",
      nutrient: "Boron (B) Deficiency",
      symptom: "Cracked stems, internal stem browning, poor siliqua development with empty seedless pods.",
      cause: "Leached sandy loam soils.",
      remedy: "Foliar spray of Boron 20% @ 1.0 g/L at pre-flowering stage.",
      recoveryTime: "5–7 Days",
      severity: "High"
    }
  ],
  onion: [
    {
      id: "k_def",
      nutrient: "Potassium (K) Deficiency",
      symptom: "Older leaves turn yellowish with scorched, papery dried tips; thin bulb skins and poor storage keeping quality.",
      cause: "Sandy soils or continuous urea application without potash.",
      remedy: "Foliar spray of 0-0-50 Sulphate of Potash @ 10 g/L at bulb initiation and bulking stages.",
      recoveryTime: "4–6 Days",
      severity: "High"
    },
    {
      id: "zn_def",
      nutrient: "Zinc (Zn) Deficiency",
      symptom: "Inward curling, twisting, and spiraling of leaf blades with yellow chlorotic spots; severely reduced bulb diameter.",
      cause: "High soil phosphorus locking available zinc.",
      remedy: "Foliar spray of Chelated Zinc 12% @ 1.0 g/L + Sticker @ 0.5 ml/L.",
      recoveryTime: "5–7 Days",
      severity: "Moderate"
    },
    {
      id: "n_def",
      nutrient: "Nitrogen (N) Deficiency",
      symptom: "Pale yellow, erect, narrow, stunted leaves; premature maturity resulting in undersized 'button' bulbs.",
      cause: "Leaching under frequent sprinkler or furrow irrigation.",
      remedy: "Top-dress 25 kg Urea per acre before bulb formation (Day 45).",
      recoveryTime: "3–4 Days",
      severity: "High"
    }
  ],
  potato: [
    {
      id: "k_def",
      nutrient: "Potassium (K) Deficiency ('Internal Blackening')",
      symptom: "Dark green crinkled leaves with bronze necrotic margins; harvested tubers show black internal vascular rings during cold storage.",
      cause: "Potato removes 120 kg K2O/acre; high potassium demand during tuber bulking.",
      remedy: "Foliar spray of Sulphate of Potash (0-0-50) @ 10 g/L twice during tuber bulking.",
      recoveryTime: "5–7 Days",
      severity: "Critical"
    },
    {
      id: "mg_def",
      nutrient: "Magnesium (Mg) Deficiency",
      symptom: "Interveinal chlorosis starting from leaf tips and margins on older leaves; leaf margins curl upward becoming brittle.",
      cause: "Acidic sandy soils or excess potassium fertilizer application.",
      remedy: "Foliar spray of Magnesium Sulphate @ 10 g/L (1%).",
      recoveryTime: "4–6 Days",
      severity: "Moderate"
    },
    {
      id: "zn_def",
      nutrient: "Zinc (Zn) Deficiency ('Fern Leaf')",
      symptom: "Small, narrow, clustered leaves with curled edges resembling fern fronds; brown spots on lower leaves.",
      cause: "Calcareous alkaline soils with pH > 7.5.",
      remedy: "Foliar spray of Chelated Zinc @ 1 g/L or Zinc Sulphate @ 4 g/L + Lime 2 g/L.",
      recoveryTime: "5–7 Days",
      severity: "Moderate"
    }
  ]
};

// ── MATCHING GOVERNMENT SUBSIDIES & SCHEMES PER CROP ─────────────────────────
export const CROP_MATCHING_SCHEMES = {
  cotton: [
    { name: "Pradhan Mantri Krishi Sinchayee Yojana (PMKSY)", type: "Drip Irrigation Subsidy", subsidy: "Up to 70%", benefit: "Drip kit subsidy for wide-row cotton, saves 45% water & boosts yield by 30%." },
    { name: "Sub-Mission on Cotton (NFSM-Commercial Crops)", type: "Certified Hybrid Seed Subsidy", subsidy: "₹1,000 / ha", benefit: "Direct cash discount on ICAR certified Bt and non-Bt hybrid cotton seeds." },
    { name: "PM Fasal Bima Yojana (PMFBY)", type: "Crop Loss Insurance", subsidy: "Premium only 2%", benefit: "Comprehensive insurance against drought, unseasonal rainfall, and pink bollworm calamity." }
  ],
  paddy: [
    { name: "Sub-Mission on Agricultural Mechanization (SMAM)", type: "Paddy Transplanter & Combine", subsidy: "40% to 50%", benefit: "Subsidy on 4-row/8-row mechanical paddy transplanters and combine harvesters." },
    { name: "National Food Security Mission (NFSM-Rice)", type: "Bio-Fertilizer & Micronutrient Kit", subsidy: "100% Free / Direct Kit", benefit: "Free distribution of Zinc Sulphate, Azospirillum, and PSB kits via Rythu Bharosa / KVK." },
    { name: "PM Fasal Bima Yojana (PMFBY)", type: "Weather & Flood Insurance", subsidy: "Premium 2%", benefit: "Guaranteed sum insured against flood inundation, drought, and cyclonic storm damage." }
  ],
  maize: [
    { name: "NFSM-Coarse Cereals & Maize", type: "Hybrid Seed Subsidy", subsidy: "Up to ₹5,000 / ha", benefit: "High-yielding single cross hybrid maize seed subsidy via state agriculture departments." },
    { name: "Mission for Fall Armyworm Control", type: "Pheromone Trap & Bio-Agent Subsidy", subsidy: "75% Grant", benefit: "Subsidized distribution of FAW pheromone lures, light traps, and Metarhizium bio-fungicides." },
    { name: "SMAM Custom Hiring Center (CHC)", type: "Maize Sheller & Seed Drill", subsidy: "40%", benefit: "Subsidy on power-operated maize de-huskers and seed-cum-fertilizer drills." }
  ],
  tomato: [
    { name: "Mission for Integrated Development of Horticulture (MIDH)", type: "Plastic Mulch & Trellising", subsidy: "50%", benefit: "₹16,000/ha subsidy for silver-black plastic mulch and bamboo GI wire trellising kits." },
    { name: "PMKSY Micro-Irrigation", type: "Inline Drip System", subsidy: "55% to 75%", benefit: "Full inline drip irrigation system with venturi fertigation injector." },
    { name: "Operation Greens (TOP Scheme)", type: "Cold Storage & Transport Subsidy", subsidy: "50% Freight", benefit: "50% freight transport subsidy during market glut to prevent distress sales." }
  ],
  chilli: [
    { name: "Spices Board Export Promotion Scheme", type: "Solar Tunnel Dryers", subsidy: "50% (up to ₹2.5 Lakh)", benefit: "Clean solar tunnel dryer subsidy to produce aflatoxin-free export grade dry chillies." },
    { name: "MIDH Drip & Fertigation Scheme", type: "Automated Fertigation Drip", subsidy: "70%", benefit: "Saves 40% fertilizer via precision water-soluble fertilizer injection." },
    { name: "PMFBY Horticultural Insurance", type: "Thrips & Unseasonal Rain Cover", subsidy: "Premium 5%", benefit: "Indemnity coverage against black thrips wipeout and unseasonal harvest rains." }
  ],
  wheat: [
    { name: "CRM (Crop Residue Management Scheme)", type: "Super Seeder & Happy Seeder", subsidy: "50% Individual / 80% CHC", benefit: "Subsidy on Super Seeder machines that sow wheat directly into standing paddy stubble." },
    { name: "NFSM-Wheat Development Program", type: "Certified High-Yield Seed", subsidy: "₹1,200 / quintal", benefit: "Subsidy on rust-resistant and terminal heat-tolerant wheat varieties (e.g. DBW 187, DBW 303)." },
    { name: "PM-KISAN Direct Income Support", type: "Annual Cash Transfer", subsidy: "₹6,000 / year", benefit: "Three installments of ₹2,000 transferred directly to landholding farmers." }
  ],
  redgram: [
    { name: "NFSM-Pulses Seed Hub Scheme", type: "Certified Breeder & Foundation Seed", subsidy: "75%", benefit: "Subsidized seed distribution of wilt-resistant pigeon pea varieties (e.g. PRG 176, Asha, WRG 65)." },
    { name: "PMKSY Sprinkler Irrigation Scheme", type: "Portable Sprinkler System", subsidy: "55% to 70%", benefit: "Portable sprinkler sets for life-saving protective irrigation during dry spells in drylands." },
    { name: "National Mission on Oilseeds & Oil Palm (NMOOP/NFSM)", type: "Intercropping Demonstration", subsidy: "₹4,000 / ha", benefit: "Financial incentive for planting Cotton + Redgram (8:1) or Groundnut + Redgram intercropping." }
  ],
  soybean: [
    { name: "National Mission on Edible Oils – Oilseeds (NMEO-OS)", type: "Certified Breeder Seed Mini-Kits", subsidy: "100% Free / Subsidized", benefit: "Distribution of high-yielding rust-tolerant certified soybean seeds via KVKs." },
    { name: "Sub-Mission on Agricultural Mechanization (SMAM)", type: "BBF Planter & Raised Bed Former", subsidy: "40% to 50%", benefit: "Subsidy on tractor-mounted Broad Bed Furrow planters to avoid monsoon waterlogging." },
    { name: "PM Fasal Bima Yojana (PMFBY)", type: "Kharif Crop Insurance", subsidy: "Premium only 2%", benefit: "Covers dry spells, excessive rain flooding, and pest attack during pod setting." }
  ],
  groundnut: [
    { name: "NFSM-Oilseeds Gypsum Subsidy Scheme", type: "Agricultural Gypsum & SSP Kit", subsidy: "50% (₹750 / acre)", benefit: "Direct subsidy on agricultural gypsum bags for pod filling and pop reduction." },
    { name: "PMKSY Micro-Irrigation (Sprinkler Kit)", type: "Portable Micro-Sprinkler System", subsidy: "55% to 75%", benefit: "Subsidized micro-sprinklers ideal for sandy loam groundnut germination & pegging." },
    { name: "SMAM Groundnut Digger & Pod Sheller", type: "Post-Harvest Machinery", subsidy: "40% to 50%", benefit: "Subsidy on power tractor-driven groundnut digger-shakers and decorticators." }
  ],
  chickpea: [
    { name: "NFSM-Pulses Development Program", type: "Certified Chana Seed Mini-Kits", subsidy: "75%", benefit: "High-yielding drought-tolerant chickpea varieties (JAKI 9218, JG 11) distributed at subsidized rates." },
    { name: "Mission for Biological Control (HaNPV)", type: "Bio-Pesticide & Pheromone Traps", subsidy: "100% Grant", benefit: "Free Helicoverpa armigera pheromone traps and NPV bio-formulations via state agriculture dept." },
    { name: "PM-KISAN & KCC Low-Interest Credit", type: "Kisan Credit Card (KCC)", subsidy: "4% Subsidized Interest", benefit: "Collateral-free crop credit up to ₹1.6 Lakh for Rabi inputs." }
  ],
  sugarcane: [
    { name: "Sugar Development Fund (SDF) Cane Modernization", type: "Trench Planter & Ratoon Manager", subsidy: "40% to 50%", benefit: "Subsidies on deep trench cane planters, ratoon management devices, and trash shredders." },
    { name: "PMKSY Drip Irrigation Subsidy (Tops in Cane)", type: "Sub-Surface Drip System", subsidy: "Up to 70%", benefit: "Sub-surface drip systems saving 50% water while boosting cane yield by 35%." },
    { name: "Ethanol Blended Petrol (EBP) Incentive Scheme", type: "Assured Sugar Mill Cane Price", subsidy: "Fixed Fair Price (FRP)", benefit: "Direct statutory bank payment from sugar mills for supplied cane within 14 days." }
  ],
  mustard: [
    { name: "Special Mustard Mission (DA&FW)", type: "High-Oil Hybrid Seed Mini-Kits", subsidy: "100% Free / Subsidized", benefit: "Free distribution of certified seeds (e.g. Giriraj, RH 725, PMW 1) to replace old varieties." },
    { name: "NFSM Soil Health & Sulphur Kit", type: "Sulphur Bentonite Fertilizer", subsidy: "50% Subsidy", benefit: "Subsidized granular sulphur to boost seed oil concentration by 2.5–3.0%." },
    { name: "PMFBY Weather-Based Insurance", type: "Frost & Aphid Infestation Cover", subsidy: "Premium only 1.5%", benefit: "Statutory compensation for sudden cold wave frost or epidemic aphid wipeouts." }
  ],
  onion: [
    { name: "MIDH Onion Storage Structure Scheme (Kanda Chawl)", type: "Ventilated Onion Storage Godown", subsidy: "50% (Up to ₹87,500 for 25MT)", benefit: "Subsidy to construct scientific naturally-ventilated storage sheds preventing monsoon rotting." },
    { name: "PMKSY Drip & Micro-Sprinkler Scheme", type: "Inline Drip Lateral Kit", subsidy: "70%", benefit: "Subsidized drip system tailored for raised bed onion cultivation." },
    { name: "Price Stabilization Fund (PSF / NAFED Procurement)", type: "Buffer Stock Direct MSP Procurement", subsidy: "Market Intervention", benefit: "NAFED/NCCF direct procurement at fair benchmark rates during market glut periods." }
  ],
  potato: [
    { name: "MIDH Cold Storage & Cold Chain Subsidy", type: "Multi-Chamber Cold Store Setup", subsidy: "35% to 50% Capital Grant", benefit: "Subsidy for farmer groups and FPOs setting up modern cold storage facilities." },
    { name: "Sub-Mission on Seeds & Planting Material (SMSP)", type: "Aeroponic / Tissue Culture Seed Tubers", subsidy: "60%", benefit: "Subsidized certified virus-free seed tubers from ICAR-CPRI (Central Potato Research Institute)." },
    { name: "Operation Greens (TOP Scheme - Tomato, Onion, Potato)", type: "Processing & Transport Subsidy", subsidy: "50% Freight & Storage", benefit: "50% freight subsidy during harvest surplus to transport potatoes to distant consuming metros." }
  ]
};

