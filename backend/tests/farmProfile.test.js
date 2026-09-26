/**
 * Farm Profile & Crop Selection Automated Verification Test Suite
 */

const { searchCrops, convertToAcres, CROPS_DATABASE } = require("../data/cropsData");
const conversationMemory = require("../services/conversationMemory");
const aiOrchestrator = require("../services/aiOrchestrator");

async function runFarmProfileTests() {
  console.log("\n🧪 Running Farm Profile & Crop Selection Automated Tests...\n");
  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  ✅ PASS: ${message}`);
      passed++;
    } else {
      console.error(`  ❌ FAIL: ${message}`);
      failed++;
    }
  }

  // 1. Searchable Crop Selector Alias Tests
  const turResults = searchCrops("tur");
  assert(
    turResults.length > 0 && turResults.some(c => c.name.includes("Red Gram")),
    `Regional alias "tur" matches "Red Gram / Pigeon Pea"`
  );

  const bhendiResults = searchCrops("bhendi");
  assert(
    bhendiResults.length > 0 && bhendiResults.some(c => c.name.includes("Okra")),
    `Regional alias "bhendi" matches "Okra / Bhendi / Ladyfinger"`
  );

  const paddyResults = searchCrops("paddy");
  assert(
    paddyResults.length > 0 && paddyResults.some(c => c.name.includes("Rice")),
    `Regional alias "paddy" matches "Rice / Paddy"`
  );

  const chanaResults = searchCrops("chana");
  assert(
    chanaResults.length > 0 && chanaResults.some(c => c.name.includes("Bengal Gram")),
    `Regional alias "chana" matches "Bengal Gram / Chickpea"`
  );

  // 2. Category Filter Tests
  const pulsesOnly = searchCrops("", "pulses");
  assert(
    pulsesOnly.length >= 6 && pulsesOnly.every(c => c.category === "pulses"),
    `Category filter "pulses" returns all pulses & legumes (${pulsesOnly.length} found)`
  );

  // 3. Unit Conversion Tests
  assert(convertToAcres(2, "Hectares") === 4.94, `2 Hectares converts to 4.94 Acres`);
  assert(convertToAcres(100, "Cents") === 1, `100 Cents converts to 1 Acre`);
  assert(convertToAcres(40, "Guntas") === 1, `40 Guntas converts to 1 Acre`);
  assert(convertToAcres(5, "Acres") === 5, `5 Acres remains 5 Acres`);

  // 4. Memory Persistence & Context Injection Tests
  const testSessionId = "test_farmer_profile_123";
  const sampleProfile = {
    location: { formattedAddress: "Warangal, Telangana, India", state: "Telangana", district: "Warangal" },
    land: { sizeAcres: 5.5 },
    soilType: "Black Soil",
    irrigation: ["Borewell", "Drip"],
    season: "Kharif",
    primaryCrop: "Red Gram / Pigeon Pea",
    crops: [
      { name: "Red Gram / Pigeon Pea", icon: "🫘", isPrimary: true, area: 3.5, stage: "Flowering / Booting" },
      { name: "Cotton", icon: "🌿", isPrimary: false, area: 2.0, stage: "Vegetative Growth" }
    ],
    farmingMethod: "Organic"
  };

  conversationMemory.syncFarmProfileState(testSessionId, sampleProfile);
  const memoryContext = conversationMemory.composeContext(testSessionId);

  assert(
    memoryContext.structuredState.location === "Warangal, Telangana, India",
    `Structured memory persists farm location "Warangal, Telangana, India"`
  );
  assert(
    memoryContext.structuredState.land_size === "5.5 Acres",
    `Structured memory persists land size "5.5 Acres"`
  );
  assert(
    Array.isArray(memoryContext.structuredState.crops) && memoryContext.structuredState.crops.length === 2,
    `Structured memory persists multiple crops (2 crops saved)`
  );

  // 5. Orchestrator Prompt Context Inclusion
  const prompt = aiOrchestrator._buildPrompt({ query: 'How to manage pests?', language: 'EN', agent: 'Agri Expert', memoryContext, groundedContexts: ['ICAR Crop Guidelines'], sources: [] });

  assert(
    prompt.includes("Registered Farm Crops:") && prompt.includes("Red Gram") && prompt.includes("Cotton"),
    `AI Orchestrator prompt includes registered farm crops (Red Gram & Cotton)`
  );
  assert(
    prompt.includes("Flowering / Booting"),
    `AI Orchestrator prompt includes specific crop growth stage "Flowering / Booting"`
  );

  console.log(`\n📊 Farm Profile Test Summary: ${passed} Passed, ${failed} Failed\n`);
  return { passed, failed };
}

if (require.main === module) {
  runFarmProfileTests().then(({ failed }) => process.exit(failed > 0 ? 1 : 0));
}

module.exports = { runFarmProfileTests };
