'use strict';

const express = require('express');
const router = express.Router();

// ── Standard Veterinary Reference Data (ICAR / IVRI Guidelines) ───────────────
const LIVESTOCK_DISEASES = [
  {
    id: 'fmd',
    name: 'Foot and Mouth Disease (FMD / खुरपका-मुँहपका)',
    species: ['Cattle', 'Buffalo', 'Goat', 'Sheep', 'Pig'],
    keywords: ['fever', 'blister', 'drooling', 'saliva', 'hoof', 'tongue', 'lameness', 'mouth lesion', 'loss of appetite'],
    severity: 'High',
    urgency: 'CRITICAL_QUARANTINE',
    symptoms: 'High fever, vesicle/blister eruptions on tongue, dental pad, and interdigital clefts of hooves, excessive ropy salivation.',
    firstAid: [
      'Isolate the infected animal immediately from the herd in a dry, disinfected shed.',
      'Wash mouth ulcers gently with 1% potassium permanganate (KMNO4) or 2% sodium bicarbonate solution.',
      'Apply boric acid with glycerin paste to mouth lesions to facilitate eating.',
      'Dress foot lesions with copper sulphate (1%) or neem-oil based antiseptic ointment.',
      'Provide soft, easily digestible gruel (cooked rice, ragi, or porridge).'
    ],
    prevention: 'Mandatory bi-annual FMD vaccination under the National Animal Disease Control Programme (NADCP).',
    emergencyHelpline: '1962 (Toll-Free National Animal Health Helpline)'
  },
  {
    id: 'mastitis',
    name: 'Bovine Mastitis (थानैला रोग / Udder Infection)',
    species: ['Cattle', 'Buffalo', 'Goat'],
    keywords: ['udder', 'teat', 'swollen udder', 'blood in milk', 'watery milk', 'clots in milk', 'painful teat', 'hard udder'],
    severity: 'High',
    urgency: 'URGENT_VET_EXAM',
    symptoms: 'Hot, painful, and swollen udder/quarters, yellowish or watery milk with clots/flakes, drastic drop in milk yield.',
    firstAid: [
      'Milk out the affected quarter completely every 2 hours and discard the milk safely.',
      'Apply cold water compresses or ice packs during acute swelling (first 24 hours).',
      'Never allow calves to suckle from the infected quarter.',
      'Consult a registered veterinarian immediately for intramammary antibiotic infusion following California Mastitis Test (CMT).'
    ],
    prevention: 'Post-milking teat dipping with 0.5% povidone-iodine solution; maintain dry and lime-dusted bedding.',
    emergencyHelpline: '1962 (Toll-Free National Animal Health Helpline)'
  },
  {
    id: 'lumpy_skin',
    name: 'Lumpy Skin Disease (LSD / लंपी त्वचा रोग)',
    species: ['Cattle', 'Buffalo'],
    keywords: ['nodule', 'skin lump', 'fever', 'lymph node', 'fly bite', 'scab', 'eye discharge', 'edema'],
    severity: 'High',
    urgency: 'QUARANTINE_AND_NOTIFY',
    symptoms: 'Persistent fever, firm round nodules (2-5 cm) all over skin, enlarged superficial lymph nodes, swelling in legs and brisket.',
    firstAid: [
      'Quarantine the animal in an insect-proof enclosure (mosquito/fly vector control using neem smoke or pyrethroid sprays).',
      'Clean open burst nodules with 2% povidone-iodine and apply fly-repellent ointments.',
      'Provide supportive fluid therapy, multivitamins (especially Vit A, D, E, H) and liver tonics.',
      'Administer paracetamol / meloxicam under veterinary guidance for high fever management.'
    ],
    prevention: 'Homologous Goat Pox vaccine (or Lumpi-ProVacInd) administered annually.',
    emergencyHelpline: '1962 (Toll-Free National Animal Health Helpline)'
  },
  {
    id: 'bloat',
    name: 'Tympanites / Acute Bloat (अफरा / गैस पेट फूलना)',
    species: ['Cattle', 'Buffalo', 'Goat', 'Sheep'],
    keywords: ['bloat', 'distended rumen', 'left flank', 'gasping', 'colic', 'overeating lush green', 'leg kicking belly'],
    severity: 'Emergency',
    urgency: 'IMMEDIATE_INTERVENTION',
    symptoms: 'Severe distension of the left flank (drum-like sound upon tapping), difficulty breathing, open-mouth panting, anxiety.',
    firstAid: [
      'Drench with 200–300 ml linseed oil, mustard oil, or sweet oil mixed with 30 ml turpentine oil.',
      'Keep the animal standing on an incline with the front feet elevated to facilitate gas release.',
      'Gently place a wooden gag in the mouth to encourage salivation and burping.',
      'Do not allow the animal to lie down. If asphyxiation is imminent, veterinary trocarization of the left paralumbar fossa is required.'
    ],
    prevention: 'Avoid sudden excess feeding of young lush legumes (berseem, lucerne); feed dry roughage before green fodder.',
    emergencyHelpline: '1962 (Toll-Free National Animal Health Helpline)'
  },
  {
    id: 'milk_fever',
    name: 'Hypocalcemia / Milk Fever (सूतक ज्वर)',
    species: ['Cattle', 'Buffalo'],
    keywords: ['calving', 'downer cow', 'tremor', 'cold ears', 'paralysis', 'cannot stand', 's-shaped neck', 'dry muzzle'],
    severity: 'Emergency',
    urgency: 'IMMEDIATE_IV_CALCIUM',
    symptoms: 'Occurs within 48 hours post-calving; muscular tremors, weakness, sternal recumbency with head turned into flank (S-shape), cold ears and extremities.',
    firstAid: [
      'Prop the cow into an upright sternal position using straw bales; do not let her lie flat on her side to prevent rumen inhalation.',
      'Never attempt to force liquid drench orally (risk of fatal pulmonary aspiration due to pharyngeal paralysis).',
      'Call veterinarian immediately for slow intravenous administration of Calcium Borogluconate (25%).'
    ],
    prevention: 'Restrict high calcium diets during late dry period; supplement anionic salts (DCAD diet) 3 weeks before calving.',
    emergencyHelpline: '1962 (Toll-Free National Animal Health Helpline)'
  }
];

const VACCINATION_SCHEDULE = [
  {
    disease: 'Foot and Mouth Disease (FMD)',
    target: 'Cattle, Buffalo, Sheep, Goat',
    firstDoseAge: '4 months',
    boosterInterval: 'Bi-annual (Every 6 months / Pre-monsoon & Post-monsoon)',
    scheme: 'National Animal Disease Control Programme (Free at Govt Vet Hospitals)'
  },
  {
    disease: 'Haemorrhagic Septicaemia (HS / गलघोंटू)',
    target: 'Cattle & Buffalo',
    firstDoseAge: '6 months',
    boosterInterval: 'Annual (May - June, strictly pre-monsoon)',
    scheme: 'State Animal Husbandry Department Schedule'
  },
  {
    disease: 'Black Quarter (BQ / लंगड़ा बुखार)',
    target: 'Cattle & Buffalo (Below 3 years)',
    firstDoseAge: '6 months',
    boosterInterval: 'Annual (Pre-monsoon)',
    scheme: 'State Animal Husbandry Department Schedule'
  },
  {
    disease: 'Brucellosis (Calfhood)',
    target: 'Female calves only',
    firstDoseAge: '4–8 months (Single lifetime dose)',
    boosterInterval: 'No booster required (Lifetime immunity)',
    scheme: 'NADCP National Brucella Control'
  },
  {
    disease: 'Enterotoxaemia (ET / फड़किया)',
    target: 'Sheep & Goat',
    firstDoseAge: '3 months',
    boosterInterval: 'Annual (Prior to seasonal lush grazing)',
    scheme: 'Small Ruminant Health Support'
  },
  {
    disease: 'Peste des Petits Ruminants (PPR / बकरी प्लेग)',
    target: 'Sheep & Goat',
    firstDoseAge: '4 months',
    boosterInterval: 'Once every 3 years',
    scheme: 'National PPR Eradication Programme'
  }
];

// ── Symptom Matching & Triage Algorithm ───────────────────────────────────────
router.post('/triage', (req, res) => {
  try {
    const { species = 'Cattle', symptoms = [], notes = '' } = req.body || {};

    const textToMatch = [
      ...(Array.isArray(symptoms) ? symptoms : [symptoms]),
      notes
    ].join(' ').toLowerCase();

    if (!textToMatch.trim()) {
      return res.status(400).json({
        success: false,
        error: 'Please select at least one symptom or describe observed signs.'
      });
    }

    const scored = LIVESTOCK_DISEASES.map(d => {
      let score = 0;
      let matchedKeywords = [];

      d.keywords.forEach(kw => {
        if (textToMatch.includes(kw.toLowerCase())) {
          score += 20;
          matchedKeywords.push(kw);
        }
      });

      // Species affinity bonus
      if (d.species.some(s => s.toLowerCase() === species.toLowerCase())) {
        score += 10;
      }

      const matchConfidence = Math.min(Math.round((score / 60) * 100), 96);

      return {
        ...d,
        matchConfidence,
        matchedKeywords
      };
    }).filter(d => d.matchedKeywords.length > 0)
      .sort((a, b) => b.matchConfidence - a.matchConfidence);

    const primaryDiagnosis = scored[0] || {
      id: 'general_veterinary_concern',
      name: 'Unspecified Veterinary Condition',
      severity: 'Medium',
      urgency: 'ROUTINE_CHECKUP',
      symptoms: 'Observed signs do not clearly match endemic epidemic profiles.',
      firstAid: [
        'Check rectal temperature with a digital clinical thermometer (Normal: 101.5°F ± 1°F).',
        'Ensure continuous access to clean, cool drinking water.',
        'Record feed intake and cud chewing (rumination rate).'
      ],
      prevention: 'Regular deworming every 3 months and periodic herd health checkups.',
      emergencyHelpline: '1962 (Toll-Free National Animal Health Helpline)',
      matchConfidence: 40,
      matchedKeywords: []
    };

    return res.json({
      success: true,
      species,
      querySymptoms: textToMatch,
      primaryDiagnosis,
      differentialDiagnoses: scored.slice(1, 3),
      triageTimestamp: new Date().toISOString()
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Triage failed', details: err.message });
  }
});

// ── ICAR Balanced Dairy Ration Calculator ─────────────────────────────────────
router.post('/ration', (req, res) => {
  try {
    const {
      species = 'Cow',
      bodyWeightKg = 400,
      milkYieldLiters = 10,
      fatPercentage = 4.0,
      pregnancyMonth = 0
    } = req.body || {};

    const weight = Math.max(150, Math.min(800, Number(bodyWeightKg) || 400));
    const milk = Math.max(0, Math.min(50, Number(milkYieldLiters) || 10));
    const fat = Math.max(2.5, Math.min(9.0, Number(fatPercentage) || 4.0));
    const preg = Number(pregnancyMonth) || 0;

    // Standard ICAR Dry Matter (DM) Intake: ~2.5% to 3.0% of body weight
    const maintenanceDM = weight * 0.022; // ~8.8 kg DM for 400kg cow
    const lactationDM = milk * 0.35;      // ~3.5 kg DM for 10L milk
    const pregnancyDM = preg >= 7 ? 1.5 : 0;
    const totalDryMatterKg = +(maintenanceDM + lactationDM + pregnancyDM).toFixed(2);

    // DM Distribution: 65% Roughage (2/3 Green, 1/3 Dry), 35% Concentrate
    const concentrateDM = +(totalDryMatterKg * 0.35).toFixed(2);
    const roughageDM = +(totalDryMatterKg * 0.65).toFixed(2);

    // Fresh weight conversions (Green fodder ~20-25% DM, Dry straw ~85-90% DM, Concentrate ~90% DM)
    const greenFodderFreshKg = +((roughageDM * 0.67) / 0.22).toFixed(1);
    const dryStrawFreshKg = +((roughageDM * 0.33) / 0.88).toFixed(1);
    const concentrateFeedKg = +(concentrateDM / 0.90).toFixed(1);
    const mineralMixtureGrams = Math.round(50 + (milk * 5)); // 50g base + 5g per liter
    const commonSaltGrams = 35;

    // Nutritional Targets
    const crudeProteinGrams = Math.round((weight * 0.8) + (milk * (fat * 12 + 40)));
    const tdnKg = +((totalDryMatterKg * 0.62).toFixed(2)); // Total Digestible Nutrients

    return res.json({
      success: true,
      parameters: { species, bodyWeightKg: weight, milkYieldLiters: milk, fatPercentage: fat, pregnancyMonth: preg },
      dailyDietRecommendations: {
        totalDryMatterKg,
        feedIngredientsFreshWeight: {
          greenFodderKg: greenFodderFreshKg, // e.g. Hybrid Napier, Maize, Sorghum, Berseem
          dryStrawKg: dryStrawFreshKg,       // e.g. Paddy straw, Wheat bhusa
          concentratePelletKg: concentrateFeedKg, // Cattle feed / grain mash
          mineralMixtureGrams,
          commonSaltGrams,
          cleanWaterLitersEstimate: Math.round(weight * 0.1 + milk * 3)
        },
        nutritionSummary: {
          crudeProteinGrams,
          tdnKg,
          recommendedGreenFodderTypes: ['Hybrid Napier (CO-4/CO-5)', 'SSG Fodder Sorghum', 'Berseem / Lucerne'],
          concentrateFormula: 'Maize/Grains (35%) + Mustard/Cottonseed De-oiled Cake (32%) + Wheat Bran (30%) + Mineral Mix (2%) + Salt (1%)'
        }
      }
    });
  } catch (err) {
    return res.status(500).json({ success: false, error: 'Ration calculation failed', details: err.message });
  }
});

// ── Standard National Vaccination & Deworming Schedule ────────────────────────
router.get('/vaccination', (req, res) => {
  res.json({
    success: true,
    dewormingSchedule: [
      { timing: 'Pre-Monsoon (May–June)', drug: 'Albendazole / Fenbendazole', target: 'Broad-spectrum nematodes, roundworms' },
      { timing: 'Post-Monsoon (September–October)', drug: 'Oxyclozanide / Triclabendazole', target: 'Liver flukes, amphistomes' },
      { timing: 'Winter (January–February)', drug: 'Ivermectin (Subcutaneous / Oral)', target: 'Ectoparasites, ticks, mites & intestinal worms' }
    ],
    vaccinationSchedule: VACCINATION_SCHEDULE,
    veterinaryGuidelines: 'Always administer dewormers 10–14 days prior to any vaccination for optimal immune titer response.'
  });
});

module.exports = router;
