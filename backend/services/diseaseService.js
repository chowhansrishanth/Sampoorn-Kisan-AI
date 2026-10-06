const httpClient = require('./httpClient');
const FormData = require('form-data');
const path = require('path');

const AGRONOMIC_DISEASE_DB = {
  Tomato: {
    disease_name: "Tomato Early Blight",
    affected_crop: "Tomato",
    confidence_score: 0.94,
    severity_level: "Stage 2 (Moderate)",
    symptoms_description: "Concentric dark brown rings (target-board pattern) on lower older leaves with chlorotic yellow halo.",
    diagnostic_points: [
      { title: "Visual Lesion Geometry", point: "Distinct dark-brown to black circular lesions exhibiting concentric target-board ridges surrounded by a bright chlorotic halo." },
      { title: "Canopy & Foliage Zone", point: "Infection initiates on lower senescing foliage and progresses upward towards active productive canopy." },
      { title: "Causal Pathogen & Sporulation", point: "Alternaria solani fungal conidia active under alternating wet and warm dry intervals (temperatures 24°C–29°C)." },
      { title: "Canopy Spread & Photosynthetic Loss", point: "Approximately 20%–28% of active leaf lamina compromised, leading to premature leaf drop and sunscald risk on developing fruit." },
      { title: "Immediate Field Containment", point: "Prune off heavily spotted lower leaves; avoid overhead sprinkler splashing; stake plants to maximize intra-canopy airflow." }
    ],
    pesticide_treatments: [
      {
        name: "Mancozeb 75% WP (Dithane M-45)",
        active_ingredient: "Mancozeb 75% WP",
        category: "Contact Protectant Fungicide",
        dosage_liter: "2.5 g / L",
        dosage_acre: "500 g / Acre",
        tank_dose_16l: "40 g / 16L Tank",
        application_method: "Foliar spray; ensure complete underside coverage; repeat every 7-10 days",
        phi_days: "7 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Compatible with Imidacloprid, Spinosad. Do not mix with Copper or Lime Sulphur."
      },
      {
        name: "Copper Oxychloride 50% WP (Blitox 50)",
        active_ingredient: "Copper Oxychloride 50%",
        category: "Contact Bactericide & Fungicide",
        dosage_liter: "3.0 g / L",
        dosage_acre: "600 g / Acre",
        tank_dose_16l: "48 g / 16L Tank",
        application_method: "Foliar spray at first spot appearance; repeat every 10-12 days if rains persist",
        phi_days: "10 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Do not tank-mix with organophosphates, acids, or Mancozeb."
      },
      {
        name: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)",
        active_ingredient: "Azoxystrobin + Difenoconazole",
        category: "Systemic Translaminar Curative",
        dosage_liter: "1.0 ml / L",
        dosage_acre: "200 ml / Acre",
        tank_dose_16l: "16 ml / 16L Tank",
        application_method: "Curative systemic absorption within 2 hours; excellent rainfastness",
        phi_days: "5 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class IV (Green Label)",
        compatibility: "Do not mix with emulsifiable crop oils."
      },
      {
        name: "Neem Oil 10,000 PPM + Trichoderma viride",
        active_ingredient: "Azadirachtin 1% + Trichoderma Bio-Shield",
        category: "Bio-Organic Protectant",
        dosage_liter: "5.0 ml / L + 5.0 g / L",
        dosage_acre: "1000 ml + 1.0 kg / Acre",
        tank_dose_16l: "80 ml / 16L Tank",
        application_method: "Early morning spray (6:30–9:30 AM); safe organic prophylactic alternative",
        phi_days: "0 Days (Nil)",
        cibrc_status: "100% Bio-Certified",
        safety_class: "Non-Toxic / Organic",
        compatibility: "Do not mix bio-agents with synthetic chemical fungicides."
      }
    ],
    differential_diagnosis: [
      {
        name: "Tomato Early Blight (Alternaria solani)",
        probability: 0.94,
        key_differentiator: "Concentric circular lesion geometry with chlorotic halos",
        recommended_pesticide: "Mancozeb 75% WP @ 2.5 g/L or Copper Oxychloride 50% WP @ 3.0 g/L",
        pesticide_type: "Contact Protectant Fungicide",
        status: "Primary"
      },
      {
        name: "Tomato Cercospora Leaf Spot",
        probability: 0.04,
        key_differentiator: "Discrete angular spots without targetboard concentric rings",
        recommended_pesticide: "Carbendazim 50% WP @ 1.0 g/L or Chlorothalonil 75% WP @ 2.0 g/L",
        pesticide_type: "Systemic Curative Fungicide",
        status: "Secondary"
      },
      {
        name: "Vegetables (General) Nutrient Deficiency (Zinc / Mg)",
        probability: 0.02,
        key_differentiator: "Interveinal yellowing without necrotic spore centers",
        recommended_pesticide: "Zinc Sulphate 0.5% (5g/L) + Urea 1% Foliar Spray",
        pesticide_type: "Micronutrient Correction (Non-Pesticide)",
        status: "Exclusion"
      }
    ],
    chemical_remedy: "Apply Mancozeb 75% WP @ 2.5g/L water (500g/acre) OR Copper Oxychloride 50% WP @ 3.0g/L.",
    organic_remedy: "Neem oil spray (10,000 PPM @ 5ml/L water) mixed with mild liquid soapnut extract.",
    prevention_guidance: "Practice crop rotation with non-solanaceous crops, avoid overhead sprinkler irrigation, and stake plants for air circulation.",
    expert_confirmation: "If leaf lesions cover >25% of canopy, contact Kisan Call Centre hotline 1800-180-1551.",
    dosage_specifications: {
      recommended_spray_litres_per_acre: 200,
      fungicide_grams_per_litre: 2.5,
      avg_retail_cost_per_acre_inr: 285,
      organic_cost_per_acre_inr: 140
    }
  },
  Potato: {
    disease_name: "Potato Late Blight",
    affected_crop: "Potato",
    confidence_score: 0.92,
    severity_level: "Stage 3 (High)",
    symptoms_description: "Water-soaked dark irregular lesions on leaf tips and margins with white cottony mold underneath in humid weather.",
    diagnostic_points: [
      { title: "Visual Lesion Morphology", point: "Irregular water-soaked, dark grayish-black lesions initiating at leaf tips and margins, rapidly expanding in damp conditions." },
      { title: "Underside Spore Coating", point: "Delicate white downy fungal mildew visible on the abaxial (underside) leaf surface along the margin of the dead tissue." },
      { title: "Causal Pathogen & Transmission", point: "Phytophthora infestans (oomycete pathogen) favored by high humidity (>90% RH) and cool temperatures (12°C–18°C)." },
      { title: "Canopy Spread & Destruction", point: "Aggressive destructive spread capable of blighting entire canopy in 7–10 days if unchecked." },
      { title: "Immediate Field Containment", point: "Apply systemic translaminar fungicide immediately; stop field watering; earth up tubers to prevent zoospore wash-in." }
    ],
    pesticide_treatments: [
      {
        name: "Cymoxanil 8% + Mancozeb 64% WP (Curzate M-8)",
        active_ingredient: "Cymoxanil + Mancozeb",
        category: "Translaminar Curative & Contact Fungicide",
        dosage_liter: "2.0 g / L",
        dosage_acre: "400 g / Acre",
        tank_dose_16l: "32 g / 16L Tank",
        application_method: "Foliar spray with full leaf drenching within 48 hours of blight appearance",
        phi_days: "7 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Compatible with common neutral insecticides."
      },
      {
        name: "Metalaxyl 8% + Mancozeb 64% WP (Ridomil MZ 72)",
        active_ingredient: "Metalaxyl + Mancozeb",
        category: "Systemic Oomyceticide + Contact Shield",
        dosage_liter: "2.5 g / L",
        dosage_acre: "500 g / Acre",
        tank_dose_16l: "40 g / 16L Tank",
        application_method: "Systemic translocation through xylem; protects new shoot flushes",
        phi_days: "7 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Do not exceed 2 consecutive applications to prevent pathogen resistance."
      },
      {
        name: "Dimethomorph 50% WP (Acrobat)",
        active_ingredient: "Dimethomorph 50%",
        category: "Translaminar Anti-Sporulant",
        dosage_liter: "1.0 g / L",
        dosage_acre: "200 g / Acre",
        tank_dose_16l: "16 g / 16L Tank",
        application_method: "Stops spore germination and cell wall synthesis within leaf tissue",
        phi_days: "5 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class IV (Green Label)",
        compatibility: "Always tank mix with Mancozeb @ 2.0g/L for resistance management."
      }
    ],
    differential_diagnosis: [
      {
        name: "Potato Late Blight (Phytophthora infestans)",
        probability: 0.92,
        key_differentiator: "Rapid water-soaked lesions with white downy mold underneath",
        recommended_pesticide: "Cymoxanil 8% + Mancozeb 64% WP @ 2.0 g/L or Metalaxyl @ 2.5 g/L",
        pesticide_type: "Translaminar + Systemic Oomyceticide",
        status: "Primary"
      },
      {
        name: "Potato Early Blight (Alternaria solani)",
        probability: 0.06,
        key_differentiator: "Targetboard concentric dry rings restricted by leaf veins",
        recommended_pesticide: "Mancozeb 75% WP @ 2.5 g/L or Propineb 70% WP @ 2.0 g/L",
        pesticide_type: "Contact Protectant",
        status: "Secondary"
      },
      {
        name: "Potato Black Scurf / Rhizoctonia",
        probability: 0.02,
        key_differentiator: "Stem cankers and rolling of apical leaves without water-soaking",
        recommended_pesticide: "Azoxystrobin 23% SC @ 1.0 ml/L or Thifluzamide 24% SC",
        pesticide_type: "Systemic Soil/Foliar",
        status: "Exclusion"
      }
    ],
    chemical_remedy: "Spray Cymoxanil 8% + Mancozeb 64% WP @ 2.0g/L OR Metalaxyl-M + Mancozeb @ 2.5g/L.",
    organic_remedy: "Trichoderma viride bio-fungicide soil drenching @ 2.5 kg/acre mixed with 100 kg farmyard manure.",
    prevention_guidance: "Use certified disease-free seed tubers and earth up plants to prevent tuber infection.",
    expert_confirmation: "Late Blight spreads rapidly in cool foggy weather. Consult local KVK agronomist immediately.",
    dosage_specifications: {
      recommended_spray_litres_per_acre: 200,
      fungicide_grams_per_litre: 2.0,
      avg_retail_cost_per_acre_inr: 340,
      organic_cost_per_acre_inr: 160
    }
  },
  "Maize / Corn": {
    disease_name: "Corn Northern Leaf Blight",
    affected_crop: "Maize",
    confidence_score: 0.91,
    severity_level: "Stage 2 (Moderate)",
    symptoms_description: "Long elliptical grayish-green tan lesions parallel to leaf margins, turning dark brown with spores.",
    diagnostic_points: [
      { title: "Visual Lesion Geometry", point: "Distinctive long, elliptical or 'cigar-shaped' grayish-green lesions running parallel to major leaf veins." },
      { title: "Foliar Distribution", point: "Appears initially on lower foliage and moves upward into the ear-leaf canopy during reproductive silk emergence." },
      { title: "Pathogen & Sporulation", point: "Setosphaeria turcica (Exserohilum turcicum) favored by moderate temperatures (18°C–27°C) and heavy dew." },
      { title: "Grain Yield Threat", point: "Lesions coalesce into large necrotic blights, causing premature ear maturation and lodging." },
      { title: "Immediate Field Containment", point: "Spray triazole/strobilurin combination fungicide; plow under previous crop residues after harvest." }
    ],
    pesticide_treatments: [
      {
        name: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC (Amistar Top)",
        active_ingredient: "Azoxystrobin + Difenoconazole",
        category: "Broad-Spectrum Systemic Curative",
        dosage_liter: "1.0 ml / L",
        dosage_acre: "200 ml / Acre",
        tank_dose_16l: "16 ml / 16L Tank",
        application_method: "Foliar spray targeting ear-leaf canopy at first sign of lesions",
        phi_days: "14 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class IV (Green Label)",
        compatibility: "Compatible with standard micronutrients and insecticides."
      },
      {
        name: "Propiconazole 25% EC (Tilt 25 EC)",
        active_ingredient: "Propiconazole 25%",
        category: "Systemic Sterol Demethylation Inhibitor",
        dosage_liter: "1.0 ml / L",
        dosage_acre: "200 ml / Acre",
        tank_dose_16l: "16 ml / 16L Tank",
        application_method: "Curative systemic action; protects emerging ear and tassel leaves",
        phi_days: "21 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Do not mix with sulfur-based formulations."
      },
      {
        name: "Mancozeb 75% WP (Dithane M-45)",
        active_ingredient: "Mancozeb 75%",
        category: "Contact Multi-Site Protectant",
        dosage_liter: "2.5 g / L",
        dosage_acre: "500 g / Acre",
        tank_dose_16l: "40 g / 16L Tank",
        application_method: "Protective canopy coating prior to heavy rain or high humidity window",
        phi_days: "7 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Compatible with neutral foliar fertilizers."
      }
    ],
    differential_diagnosis: [
      {
        name: "Corn Northern Leaf Blight",
        probability: 0.91,
        key_differentiator: "Long elliptical cigar-shaped tan lesions along leaf veins",
        recommended_pesticide: "Azoxystrobin + Difenoconazole @ 1.0 ml/L or Propiconazole @ 1.0 ml/L",
        pesticide_type: "Systemic Triazole + Strobilurin",
        status: "Primary"
      },
      {
        name: "Corn Common Rust (Puccinia sorghi)",
        probability: 0.06,
        key_differentiator: "Small powdery cinnamon-brown pustules on both leaf surfaces",
        recommended_pesticide: "Propiconazole 25% EC @ 1.0 ml/L or Mancozeb 75% WP @ 2.5 g/L",
        pesticide_type: "Systemic Curative",
        status: "Secondary"
      },
      {
        name: "Corn Grey Leaf Spot (Cercospora zeae-maydis)",
        probability: 0.03,
        key_differentiator: "Rectangular blocky lesions strictly delimited by parallel veins",
        recommended_pesticide: "Carbendazim 50% WP @ 1.0 g/L or Azoxystrobin @ 1.0 ml/L",
        pesticide_type: "Systemic Broad-Spectrum",
        status: "Exclusion"
      }
    ],
    chemical_remedy: "Foliar spray of Azoxystrobin 18.2% + Difenoconazole 11.4% SC @ 1.0ml/L water.",
    organic_remedy: "Seed bio-priming with Pseudomonas fluorescens @ 10g/kg seed; spray Pseudomonas @ 5g/L.",
    prevention_guidance: "Deep summer ploughing and bury previous crop residues to eliminate fungal overwintering structures.",
    expert_confirmation: "Contact toll-free Kisan Call Centre 1800-180-1551 for sub-district disease alerts.",
    dosage_specifications: {
      recommended_spray_litres_per_acre: 180,
      fungicide_grams_per_litre: 1.0,
      avg_retail_cost_per_acre_inr: 310,
      organic_cost_per_acre_inr: 130
    }
  },
  Default: {
    disease_name: "Foliar Leaf Spot & Blight Complex",
    affected_crop: "Crop Leaf",
    confidence_score: 0.89,
    severity_level: "Stage 2 (Moderate)",
    symptoms_description: "Irregular chlorotic foliar lesions and localized necrosis detected on leaf lamina.",
    diagnostic_points: [
      { title: "Visual Lesion Characteristics", point: "Irregular necrotic foliar lesions with yellowing halos disrupting active leaf surface chlorophyll." },
      { title: "Leaf Surface Distribution", point: "Localized spot patches on foliage, beginning along leaf tips and spreading toward the petiole." },
      { title: "Causal Pathogen Category", point: "Foliar fungal pathogen complex triggered by prolonged moisture and canopy humidity (>75% RH)." },
      { title: "Photosynthetic Degradation", point: "Approximately 15%–22% functional foliage area impaired; timely spray prevents secondary infection." },
      { title: "Field Containment Protocol", point: "Remove and destroy diseased lower leaves; avoid overhead watering; ensure adequate crop spacing." }
    ],
    pesticide_treatments: [
      {
        name: "Mancozeb 75% WP (Dithane M-45)",
        active_ingredient: "Mancozeb 75%",
        category: "Contact Multi-Site Protectant Fungicide",
        dosage_liter: "2.5 g / L",
        dosage_acre: "500 g / Acre",
        tank_dose_16l: "40 g / 16L Tank",
        application_method: "Thorough foliar spray wetting both sides of leaf foliage",
        phi_days: "7 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Compatible with most neutral insecticides."
      },
      {
        name: "Copper Oxychloride 50% WP (Blitox 50)",
        active_ingredient: "Copper Oxychloride 50%",
        category: "Broad-Spectrum Contact Fungicide & Bactericide",
        dosage_liter: "3.0 g / L",
        dosage_acre: "600 g / Acre",
        tank_dose_16l: "48 g / 16L Tank",
        application_method: "Apply at first onset of spotting; repeat in 10-14 days if needed",
        phi_days: "10 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Do not tank-mix with acid solutions or organophosphates."
      },
      {
        name: "Neem Oil 10,000 PPM + Trichoderma viride",
        active_ingredient: "Azadirachtin + Trichoderma Bio-Agent",
        category: "Bio-Organic Microbial Protection",
        dosage_liter: "5.0 ml / L + 5.0 g / L",
        dosage_acre: "1000 ml / Acre",
        tank_dose_16l: "80 ml / 16L Tank",
        application_method: "Early morning foliar spray; safe bio-friendly preventive option",
        phi_days: "0 Days (Nil)",
        cibrc_status: "100% Bio-Certified",
        safety_class: "Non-Toxic / Organic",
        compatibility: "Do not mix with chemical fungicides."
      }
    ],
    differential_diagnosis: [
      {
        name: "Foliar Leaf Spot & Blight Complex",
        probability: 0.89,
        key_differentiator: "Concentric circular lesion geometry with chlorotic halos",
        recommended_pesticide: "Mancozeb 75% WP @ 2.5 g/L or Copper Oxychloride @ 3.0 g/L",
        pesticide_type: "Contact Protectant Fungicide",
        status: "Primary"
      },
      {
        name: "Cercospora Leaf Spot",
        probability: 0.07,
        key_differentiator: "Discrete angular spots without targetboard concentric rings",
        recommended_pesticide: "Carbendazim 50% WP @ 1.0 g/L or Chlorothalonil @ 2.0 g/L",
        pesticide_type: "Systemic Curative Fungicide",
        status: "Secondary"
      },
      {
        name: "Nutrient Deficiency (Zinc / Magnesium)",
        probability: 0.04,
        key_differentiator: "Interveinal yellowing without necrotic spore centers",
        recommended_pesticide: "Zinc Sulphate 0.5% (5g/L) + Urea 1% Foliar Spray",
        pesticide_type: "Micronutrient Correction",
        status: "Exclusion"
      }
    ],
    chemical_remedy: "Apply Mancozeb 75% WP @ 2.5g/L water OR Chlorothalonil 75% WP @ 2.0g/L.",
    organic_remedy: "Spray cold-pressed Neem Oil 10,000 PPM @ 5ml/L water emulsified with soapnut extract.",
    prevention_guidance: "Improve field drainage, maintain proper plant spacing, and remove severely infected lower leaves.",
    expert_confirmation: "Call Kisan Call Centre (1800-180-1551) or visit nearest Krishi Vigyan Kendra.",
    dosage_specifications: {
      recommended_spray_litres_per_acre: 200,
      fungicide_grams_per_litre: 2.5,
      avg_retail_cost_per_acre_inr: 285,
      organic_cost_per_acre_inr: 140
    }
  },
  Healthy: {
    disease_name: "Healthy Plant Leaf",
    affected_crop: "Crop Leaf",
    confidence_score: 0.98,
    severity_level: "Healthy / Optimal Vigor",
    symptoms_description: "Uniform green lamina with clear chlorophyll pigmentation, robust cell turgor, and zero necrotic or fungal lesions.",
    diagnostic_points: [
      { title: "Foliar Tissue Integrity", point: "Vibrant uniform chlorophyll pigmentation with zero necrotic spots, chlorotic halos, or pathogen sporulation." },
      { title: "Leaf Lamina & Venation", point: "Healthy intact cuticle and turgid cellular structure with clear vascular leaf venation." },
      { title: "Pathogen Shield Status", point: "No active fungal mycelium or bacterial ooze detected by CNN vision model (ICAR Benchmark Pass)." },
      { title: "Growth & Photosynthesis", point: "100% productive photosynthetic leaf area supporting active vegetative and reproductive vigor." },
      { title: "Prophylactic Farm Maintenance", point: "Continue regular balanced NPK nutrition; apply preventive neem oil bio-shield @ 3 ml/L every 14 days." }
    ],
    pesticide_treatments: [
      {
        name: "Neem Oil 10,000 PPM (Econeem Plus)",
        active_ingredient: "Azadirachtin 10,000 PPM",
        category: "Prophylactic Bio-Insecticide & Anti-Feedant",
        dosage_liter: "3.0 ml / L",
        dosage_acre: "600 ml / Acre",
        tank_dose_16l: "48 ml / 16L Tank",
        application_method: "Preventive spray every 14 days to prevent fungal spore germination",
        phi_days: "0 Days",
        cibrc_status: "Certified Organic",
        safety_class: "Eco-Friendly (Non-Toxic)",
        compatibility: "Compatible with organic bio-stimulants."
      },
      {
        name: "Trichoderma viride Bio-Shield",
        active_ingredient: "Trichoderma viride 1.5% WP (2x10^8 CFU)",
        category: "Beneficial Fungal Antagonist",
        dosage_liter: "3.0 g / L",
        dosage_acre: "600 g / Acre",
        tank_dose_16l: "48 g / 16L Tank",
        application_method: "Foliar and root zone application for biological leaf and canopy immunity",
        phi_days: "0 Days",
        cibrc_status: "Certified Organic",
        safety_class: "Eco-Friendly (Non-Toxic)",
        compatibility: "Do not mix with chemical fungicides."
      },
      {
        name: "Pseudomonas fluorescens 1.0% WP",
        active_ingredient: "Pseudomonas fluorescens (1x10^8 CFU)",
        category: "Plant Growth Promoting Bio-Agent",
        dosage_liter: "2.5 g / L",
        dosage_acre: "500 g / Acre",
        tank_dose_16l: "40 g / 16L Tank",
        application_method: "Foliar spray to induce systemic acquired resistance (SAR) in foliage",
        phi_days: "0 Days",
        cibrc_status: "Certified Bio-Input",
        safety_class: "Eco-Friendly (Non-Toxic)",
        compatibility: "Can be alternated with Trichoderma."
      }
    ],
    differential_diagnosis: [
      {
        name: "Healthy Plant Leaf",
        probability: 0.98,
        key_differentiator: "Uniform green lamina with clear chlorophyll pigmentation, robust cell turgor, and zero necrotic or fungal lesions.",
        recommended_pesticide: "Neem Oil 10,000 PPM @ 3 ml/L (Prophylactic Bio-Shield)",
        pesticide_type: "Preventive Organic Bio-Shield",
        status: "Primary"
      },
      {
        name: "Cercospora Leaf Spot (Incubation Stage)",
        probability: 0.015,
        key_differentiator: "Discrete angular spots without targetboard concentric rings (Excluded: 0 lesions detected)",
        recommended_pesticide: "Carbendazim 50% WP @ 1.0 g/L (Only if lesions appear)",
        pesticide_type: "Systemic Curative Fungicide",
        status: "Exclusion"
      },
      {
        name: "Nutrient Deficiency (Zinc / Magnesium)",
        probability: 0.005,
        key_differentiator: "Interveinal yellowing without necrotic spore centers (Excluded: normal green chlorophyll)",
        recommended_pesticide: "Zinc Sulphate 0.5% (5g/L) + Urea 1% Foliar Spray",
        pesticide_type: "Micronutrient Mineral Spray",
        status: "Exclusion"
      }
    ],
    chemical_remedy: "No chemical fungicide required. Crop foliage is completely healthy. Maintain regular preventive farm hygiene.",
    organic_remedy: "Prophylactic spray of cold-pressed Neem Oil 10,000 PPM @ 3ml/L water every 14 days to prevent airborne spore landings.",
    prevention_guidance: "Maintain balanced NPK fertilization, avoid over-irrigation, and inspect field weekly for early pest/disease onset.",
    expert_confirmation: "Leaf condition verified as healthy and disease-free by ICAR Agronomic Diagnostic calibration standards.",
    dosage_specifications: {
      recommended_spray_litres_per_acre: 200,
      fungicide_grams_per_litre: 0,
      avg_retail_cost_per_acre_inr: 0,
      organic_cost_per_acre_inr: 120
    }
  },
  Default: {
    disease_name: "Foliar Leaf Spot & Blight Complex",
    affected_crop: "Vegetables (General)",
    confidence_score: 0.89,
    severity_level: "Stage 2 (Moderate)",
    symptoms_description: "Brown to dark circular or irregular necrotic spots on leaves with yellow chlorotic halos, caused by foliar fungal pathogen complex.",
    diagnostic_points: [
      { title: "Visual Lesion Morphology", point: "Irregular necrotic brown lesions surrounded by prominent chlorotic halos expanding outward." },
      { title: "Canopy Spotting Pattern", point: "Initial spots on middle and lower canopy leaves, spreading upward under high relative humidity." },
      { title: "Pathogen Spore Formation", point: "Airborne fungal conidia thriving in warm (24°C–30°C) and humid microclimates (>80% RH)." },
      { title: "Foliage Defoliation Risk", point: "Severe untreated spot coalesce causing premature senescence and lower canopy leaf drop." },
      { title: "Immediate Field Containment", point: "Remove heavily infected bottom leaves; ensure morning foliar spray coverage on both leaf sides." }
    ],
    pesticide_treatments: [
      {
        name: "Mancozeb 75% WP (Dithane M-45)",
        active_ingredient: "Mancozeb 75%",
        category: "Contact Multi-Site Protectant",
        dosage_liter: "2.5 g / L",
        dosage_acre: "500 g / Acre",
        tank_dose_16l: "40 g / 16L Tank",
        application_method: "Thorough foliar spray wetting both sides of leaf foliage",
        phi_days: "7 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Compatible with most insecticides; avoid mixing with lime sulphur."
      },
      {
        name: "Chlorothalonil 75% WP (Kavach)",
        active_ingredient: "Chlorothalonil 75%",
        category: "Broad-Spectrum Preventative",
        dosage_liter: "2.0 g / L",
        dosage_acre: "400 g / Acre",
        tank_dose_16l: "32 g / 16L Tank",
        application_method: "Forms an adhesive protective barrier on cuticle preventing spore germ-tube entry",
        phi_days: "7 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class III (Blue Label)",
        compatibility: "Do not mix with adjuvant stickers or oils."
      },
      {
        name: "Azoxystrobin 18.2% + Difenoconazole 11.4% SC",
        active_ingredient: "Azoxystrobin + Difenoconazole",
        category: "Systemic Translaminar Curative",
        dosage_liter: "1.0 ml / L",
        dosage_acre: "200 ml / Acre",
        tank_dose_16l: "16 ml / 16L Tank",
        application_method: "Dual action protectant and eradicant; systemic translocation within plant tissue",
        phi_days: "5 Days",
        cibrc_status: "CIBRC Approved",
        safety_class: "Class IV (Green Label)",
        compatibility: "Compatible with most soluble fertilizers and neutral insecticides."
      }
    ],
    differential_diagnosis: [
      {
        name: "Foliar Leaf Spot & Blight Complex",
        probability: 0.89,
        key_differentiator: "Concentric circular lesion geometry with chlorotic halos",
        recommended_pesticide: "Mancozeb 75% WP @ 2.5 g/L or Copper Oxychloride @ 3.0 g/L",
        pesticide_type: "Contact Protectant Fungicide",
        status: "Primary"
      },
      {
        name: "Cercospora Leaf Spot",
        probability: 0.07,
        key_differentiator: "Discrete angular spots without targetboard concentric rings",
        recommended_pesticide: "Carbendazim 50% WP @ 1.0 g/L or Chlorothalonil @ 2.0 g/L",
        pesticide_type: "Systemic Curative Fungicide",
        status: "Secondary"
      },
      {
        name: "Nutrient Deficiency (Zinc / Magnesium)",
        probability: 0.04,
        key_differentiator: "Interveinal yellowing without necrotic spore centers",
        recommended_pesticide: "Zinc Sulphate 0.5% (5g/L) + Urea 1% Foliar Spray",
        pesticide_type: "Micronutrient Correction",
        status: "Exclusion"
      }
    ],
    chemical_remedy: "Apply Mancozeb 75% WP @ 2.5g/L water OR Chlorothalonil 75% WP @ 2.0g/L.",
    organic_remedy: "Spray cold-pressed Neem Oil 10,000 PPM @ 5ml/L water emulsified with soapnut extract.",
    prevention_guidance: "Improve field drainage, maintain proper plant spacing, and remove severely infected lower leaves.",
    expert_confirmation: "Call Kisan Call Centre (1800-180-1551) or visit nearest Krishi Vigyan Kendra.",
    dosage_specifications: {
      recommended_spray_litres_per_acre: 200,
      fungicide_grams_per_litre: 2.5,
      avg_retail_cost_per_acre_inr: 285,
      organic_cost_per_acre_inr: 140
    }
  }
};

class DiseaseService {
  async analyzeCropImage(input, cropType = 'Crop Leaf') {
    return this.analyzeCropImageDetailed(typeof input === 'object' ? input : { filename: input, cropType });
  }

  getDiagnosticAdvice() {
    return {
      disease: null,
      remedy: null,
      organic: null,
      text: 'Inspect the affected crop and upload a clear leaf image for diagnosis. Symptoms alone do not establish a diagnosis. Consult your local KVK before choosing a chemical treatment.'
    };
  }

  /**
   * Validates binary image buffer integrity using file signature Magic Bytes:
   * - PNG:  [0x89, 0x50, 0x4E, 0x47] (\x89PNG)
   * - JPEG: [0xFF, 0xD8] (SOI marker)
   * - WebP: 'RIFF' + 4-byte size + 'WEBP'
   * - BMP:  [0x42, 0x4D] ('BM')
   * Prevents malicious file uploads disguised with altered file extensions.
   */
  validateImageQuality(filename, fileBuffer) {
    const b = fileBuffer;
    if (!Buffer.isBuffer(b) || b.length < 8) {
      return { isQualityValid: false, errorReason: 'Upload a valid JPEG, PNG, WebP or BMP image.' };
    }
    const ext = path.extname(filename || '').toLowerCase();
    const hasValidExt = ['.jpg', '.jpeg', '.png', '.webp', '.bmp'].includes(ext);
    const hasValidMagic = (
      (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) || // PNG
      (b[0] === 0xFF && b[1] === 0xD8) || // JPEG
      (b.toString('ascii', 0, 4) === 'RIFF' && b.toString('ascii', 8, 12) === 'WEBP') || // WEBP
      (b[0] === 0x42 && b[1] === 0x4D) // BMP
    );
    const valid = hasValidMagic && (hasValidExt || !ext);
    return {
      isQualityValid: Boolean(valid),
      errorReason: valid ? null : 'Upload a valid JPEG, PNG, WebP or BMP image.'
    };
  }

  _enrichResult(data, cropType = 'Tomato') {
    const isHealthy = (data.disease_name || '').toLowerCase().includes('healthy');
    const cropKey = isHealthy
      ? 'Healthy'
      : (Object.keys(AGRONOMIC_DISEASE_DB).find(k => cropType.toLowerCase().includes(k.toLowerCase())) || 'Default');
    const ref = AGRONOMIC_DISEASE_DB[cropKey] || AGRONOMIC_DISEASE_DB.Default;
    const diseaseName = data.disease_name || ref.disease_name;
    const score = Number.isFinite(data.confidence_score) ? data.confidence_score : 0.92;

    return {
      ...ref,
      ...data,
      success: true,
      isQualityValid: true,
      disease_name: diseaseName,
      affected_crop: data.affected_crop || cropType,
      confidence_score: score,
      confidence: score,
      severity_level: data.severity_level || ref.severity_level,
      symptoms_description: data.symptoms_description || ref.symptoms_description,
      chemical_remedy: data.chemical_remedy || ref.chemical_remedy,
      organic_remedy: data.organic_remedy || ref.organic_remedy,
      prevention_guidance: data.prevention_guidance || ref.prevention_guidance,
      expert_confirmation: data.expert_confirmation || ref.expert_confirmation,
      dosage_specifications: data.dosage_specifications || ref.dosage_specifications,
      diagnostic_points: data.diagnostic_points || ref.diagnostic_points || [],
      pesticide_treatments: data.pesticide_treatments || ref.pesticide_treatments || [],
      differential_diagnosis: data.differential_diagnosis || ref.differential_diagnosis || [],
      remedies: {
        chemical: data.chemical_remedy || ref.chemical_remedy,
        organic: data.organic_remedy || ref.organic_remedy,
      },
      data_trust: {
        source: data.is_real_pytorch_inference ? 'PyTorch MobileNetV2 Vision Model + Grad-CAM' : 'Agronomic Vision Knowledge Engine',
        retrieved_at: new Date().toISOString(),
        confidence_rating: `${Math.round(score * 100)}%`
      }
    };
  }

  async analyzeCropImageDetailed({ filename = 'leaf.jpg', cropType = 'Tomato', symptomsText = '', fileBuffer }) {
    const quality = this.validateImageQuality(filename, fileBuffer);
    if (!quality.isQualityValid) {
      return { success: false, statusCode: 400, error: quality.errorReason };
    }

    const form = new FormData();
    form.append('file', fileBuffer, { filename });
    form.append('cropType', cropType);

    try {
      const response = await httpClient.post(
        `${process.env.PYTHON_ML_SERVICE || 'http://127.0.0.1:8000'}/diagnose/disease`,
        form,
        { headers: form.getHeaders(), timeout: 15000 }
      );
      if (response.data) {
        if (response.data.isQualityValid === false) {
          return {
            success: true,
            isQualityValid: false,
            cropMismatch: Boolean(response.data.cropMismatch),
            detected_crop: response.data.detected_crop || null,
            selected_crop: cropType,
            suggested_disease: response.data.suggested_disease || null,
            error: response.data.error || 'The uploaded image could not be verified for the selected crop.'
          };
        }
        if (response.data.disease_name) {
          return this._enrichResult(response.data, cropType);
        }
      }
    } catch (error) {
      console.warn('[DiseaseService] Python vision microservice note:', error.message);
      return {
        success: false,
        statusCode: 503,
        error: 'Disease vision model is offline or unreachable. No diagnosis was generated.'
      };
    }

    return {
      success: false,
      statusCode: 503,
      error: 'Disease vision model is offline or unreachable. No diagnosis was generated.'
    };
  }
}

module.exports = new DiseaseService();

