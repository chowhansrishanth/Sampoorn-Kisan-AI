'use strict';
/**
 * Agro-Chemical Compatibility & Tank-Mix Safety Checker
 * Validates pesticide, fungicide, herbicide, and fertilizer combinations
 * for phytotoxicity risk, antagonism, precipitation, and label compliance.
 */

// Chemical compatibility matrix (product categories)
const PRODUCT_DATABASE = [
  // Insecticides
  { id: 'chlorpyrifos', name: 'Chlorpyrifos 20% EC', category: 'insecticide', activeIngredient: 'Chlorpyrifos', pH: 'neutral', formulation: 'EC', compatibility: ['mancozeb', 'carbendazim', 'imidacloprid'], incompatible: ['bordeaux_mixture', 'lime_sulfur', 'alkaline_herbicides'], phytotoxicPH: ['>9'] },
  { id: 'imidacloprid', name: 'Imidacloprid 17.8 SL', category: 'insecticide', activeIngredient: 'Imidacloprid', pH: 'acidic', formulation: 'SL', compatibility: ['mancozeb', 'chlorpyrifos', 'azoxystrobin'], incompatible: ['copper_oxychloride', 'lime_sulfur'], phytotoxicPH: [] },
  { id: 'spinosad', name: 'Spinosad 45 SC', category: 'insecticide', activeIngredient: 'Spinosad', pH: 'neutral', formulation: 'SC', compatibility: ['azoxystrobin', 'mancozeb'], incompatible: ['bordeaux_mixture', 'copper_oxychloride'], phytotoxicPH: [] },
  { id: 'lambda_cyhalothrin', name: 'Lambda-Cyhalothrin 5 EC', category: 'insecticide', activeIngredient: 'Lambda-Cyhalothrin', pH: 'neutral', formulation: 'EC', compatibility: ['mancozeb', 'carbendazim'], incompatible: ['bordeaux_mixture', 'alkaline_solutions'], phytotoxicPH: [] },

  // Fungicides
  { id: 'mancozeb', name: 'Mancozeb 75 WP', category: 'fungicide', activeIngredient: 'Mancozeb', pH: 'neutral', formulation: 'WP', compatibility: ['chlorpyrifos', 'imidacloprid', 'spinosad', 'lambda_cyhalothrin'], incompatible: ['alkaline_products', 'copper_compounds'], phytotoxicPH: ['>8.5'] },
  { id: 'carbendazim', name: 'Carbendazim 50 WP', category: 'fungicide', activeIngredient: 'Carbendazim', pH: 'acidic', formulation: 'WP', compatibility: ['chlorpyrifos', 'mancozeb', 'lambda_cyhalothrin'], incompatible: ['bordeaux_mixture', 'lime_sulfur'], phytotoxicPH: [] },
  { id: 'azoxystrobin', name: 'Azoxystrobin 23 SC', category: 'fungicide', activeIngredient: 'Azoxystrobin', pH: 'neutral', formulation: 'SC', compatibility: ['imidacloprid', 'spinosad'], incompatible: ['emulsifiable_oils'], phytotoxicPH: [] },
  { id: 'copper_oxychloride', name: 'Copper Oxychloride 50 WP', category: 'fungicide', activeIngredient: 'Copper Oxychloride', pH: 'alkaline', formulation: 'WP', compatibility: [], incompatible: ['imidacloprid', 'spinosad', 'organophosphates', 'mancozeb'], phytotoxicPH: [] },
  { id: 'bordeaux_mixture', name: 'Bordeaux Mixture (1:1:100)', category: 'fungicide', activeIngredient: 'Copper Sulfate + Lime', pH: 'alkaline', formulation: 'ready-mix', compatibility: [], incompatible: ['chlorpyrifos', 'carbendazim', 'spinosad', 'mancozeb', 'ec_formulations'], phytotoxicPH: [] },

  // Herbicides
  { id: 'glyphosate', name: 'Glyphosate 41 SL', category: 'herbicide', activeIngredient: 'Glyphosate', pH: 'acidic', formulation: 'SL', compatibility: [], incompatible: ['all_pesticides', 'all_fungicides'], phytotoxicPH: [], note: 'Broad-spectrum — never tank-mix with crop protection chemicals. Use alone.' },
  { id: 'pendimethalin', name: 'Pendimethalin 30 EC', category: 'herbicide', activeIngredient: 'Pendimethalin', pH: 'neutral', formulation: 'EC', compatibility: [], incompatible: ['mancozeb', 'carbendazim'], phytotoxicPH: [] },
  { id: 'atrazine', name: 'Atrazine 50 WP', category: 'herbicide', activeIngredient: 'Atrazine', pH: 'neutral', formulation: 'WP', compatibility: [], incompatible: ['organophosphates'], phytotoxicPH: [] },

  // Foliar Fertilizers
  { id: 'dap_foliar', name: 'DAP (Foliar Grade) 18-46-0', category: 'foliar_fertilizer', activeIngredient: 'Di-Ammonium Phosphate', pH: 'acidic', formulation: 'WS', compatibility: ['mancozeb', 'imidacloprid', 'carbendazim'], incompatible: ['bordeaux_mixture', 'copper_compounds'], phytotoxicPH: ['>8'] },
  { id: 'nano_urea', name: 'Nano Urea (IFFCO Liquid)', category: 'foliar_fertilizer', activeIngredient: 'Nano Nitrogen Particles', pH: 'neutral', formulation: 'suspension', compatibility: ['imidacloprid', 'mancozeb', 'azoxystrobin'], incompatible: ['bordeaux_mixture'], phytotoxicPH: [] },
];

function checkTankMixCompatibility(productIds) {
  if (!Array.isArray(productIds) || productIds.length < 2) {
    return { safe: true, issues: [], recommendations: ['Select at least 2 products to check compatibility.'] };
  }

  const products = productIds.map((id) => PRODUCT_DATABASE.find((p) => p.id === id)).filter(Boolean);
  const issues = [];
  const warnings = [];

  // Check each pair
  for (let i = 0; i < products.length; i++) {
    for (let j = i + 1; j < products.length; j++) {
      const a = products[i];
      const b = products[j];

      const aIncompatibleWithB = a.incompatible.some((inc) =>
        inc === b.id || inc.includes(b.category) || b.name.toLowerCase().includes(inc.replace('_', ' '))
      );
      const bIncompatibleWithA = b.incompatible.some((inc) =>
        inc === a.id || inc.includes(a.category) || a.name.toLowerCase().includes(inc.replace('_', ' '))
      );

      if (aIncompatibleWithB || bIncompatibleWithA) {
        issues.push({
          severity: 'CRITICAL',
          products: [a.name, b.name],
          issue: `${a.name} is chemically incompatible with ${b.name}. May cause precipitation, phytotoxicity, or product degradation.`,
          action: 'DO NOT MIX — Apply separately with 2-3 hour gap.',
        });
      }

      // Warn about same-category stacking
      if (a.category === b.category && a.category !== 'foliar_fertilizer') {
        warnings.push({
          severity: 'WARNING',
          products: [a.name, b.name],
          issue: `Mixing two ${a.category}s may cause antagonism or reduce efficacy of both actives.`,
          action: 'Consult KVK agronomist before mixing same-class chemicals.',
        });
      }
    }
  }

  // Any product with glyphosate → always critical
  if (products.some((p) => p.id === 'glyphosate') && products.length > 1) {
    issues.push({ severity: 'CRITICAL', products: ['Glyphosate'], issue: 'Glyphosate is a total herbicide and must NEVER be mixed with insecticides, fungicides, or fertilizers.', action: 'Remove Glyphosate from this tank-mix entirely.' });
  }

  // Jar-test recommendation
  const tankMixSafe = issues.length === 0;
  const mixingOrder = products.map((p, i) => `${i + 1}. Add ${p.name} (${p.formulation})`);
  mixingOrder.push('Fill tank 2/3 with water first, add WP formulations before SL/EC, agitate between additions.');

  return {
    safe: tankMixSafe,
    productCount: products.length,
    selectedProducts: products.map((p) => ({ id: p.id, name: p.name, category: p.category, formulation: p.formulation })),
    criticalIssues: issues,
    warnings,
    mixingOrderProtocol: mixingOrder,
    jarTestRequired: !tankMixSafe || products.length > 2,
    overallRating: issues.length === 0 ? (warnings.length === 0 ? 'SAFE ✅' : 'CAUTION ⚠️') : 'UNSAFE ❌',
  };
}

function getProductCatalog(category) {
  if (category) return PRODUCT_DATABASE.filter((p) => p.category === category);
  return PRODUCT_DATABASE;
}

module.exports = { checkTankMixCompatibility, getProductCatalog, PRODUCT_DATABASE };
