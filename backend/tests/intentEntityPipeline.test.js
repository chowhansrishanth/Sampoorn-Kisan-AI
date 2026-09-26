/**
 * Automated Test Suite — AI Intent & Agricultural Entity Understanding Pipeline
 * Verifies all 19 test queries specified in Requirement Section 18.
 */

const assert = require("assert");
const intentClassifier = require("../services/intentClassifier");
const entityNormalizer = require("../services/agriculturalEntityNormalizer");
const aiOrchestrator = require("../services/aiOrchestrator");

async function runIntentEntityTestSuite() {
    console.log("=========================================================================");
    console.log(" 🌾 RUNNING AI INTENT & FUZZY ENTITY PIPELINE AUTOMATED TEST SUITE");
    console.log("=========================================================================\n");

    const testCases = [
        { query: "chiili market price", expectedIntent: "MARKET_PRICE", expectedCommodity: "chilli" },
        { query: "chilli market price", expectedIntent: "MARKET_PRICE", expectedCommodity: "chilli" },
        { query: "mirchi price", expectedIntent: "MARKET_PRICE", expectedCommodity: "chilli" },
        { query: "mirchi mandi rate", expectedIntent: "MARKET_PRICE", expectedCommodity: "chilli" },
        { query: "chilli price in Telangana", expectedIntent: "MARKET_PRICE", expectedCommodity: "chilli", expectedState: "Telangana" },
        { query: "chilli price in Warangal", expectedIntent: "MARKET_PRICE", expectedCommodity: "chilli", expectedDistrict: "Warangal" },
        { query: "what is today's chilli price?", expectedIntent: "MARKET_PRICE", expectedCommodity: "chilli" },
        { query: "how much is mirchi selling for?", expectedIntent: "MARKET_PRICE", expectedCommodity: "chilli" },
        { query: "cottn price", expectedIntent: "MARKET_PRICE", expectedCommodity: "cotton" },
        { query: "pady market price", expectedIntent: "MARKET_PRICE", expectedCommodity: "rice" },
        { query: "tomato price", expectedIntent: "MARKET_PRICE", expectedCommodity: "tomato" },
        { query: "onion mandi rate", expectedIntent: "MARKET_PRICE", expectedCommodity: "onion" },
        { query: "red gram price", expectedIntent: "MARKET_PRICE", expectedCommodity: "red gram" },
        { query: "moong price", expectedIntent: "MARKET_PRICE", expectedCommodity: "green gram" },
        { query: "what is the weather tomorrow?", expectedIntent: "WEATHER" },
        { query: "will it rain tomorrow?", expectedIntent: "WEATHER" },
        { query: "cotton disease", expectedIntent: "DISEASE", expectedCommodity: "cotton" },
        { query: "fertilizer for paddy", expectedIntent: "FERTILIZER", expectedCommodity: "rice" },
        { query: "crop for black soil", expectedIntent: "CROP_RECOMMENDATION", expectedSoil: "Black Soil" }
    ];

    let passedCount = 0;
    let failedCount = 0;

    for (let i = 0; i < testCases.length; i++) {
        const tc = testCases[i];
        console.log(`--> Test ${i + 1}: "${tc.query}"`);

        const res = intentClassifier.classify(tc.query);

        try {
            assert.strictEqual(res.intent, tc.expectedIntent, `Intent mismatch: expected ${tc.expectedIntent}, got ${res.intent}`);
            
            if (tc.expectedCommodity) {
                assert(res.commodity && res.commodity.toLowerCase().includes(tc.expectedCommodity.toLowerCase()), `Commodity mismatch: expected ${tc.expectedCommodity}, got ${res.commodity}`);
            }
            if (tc.expectedState) {
                assert(res.locationEntity && res.locationEntity.state === tc.expectedState, `State mismatch: expected ${tc.expectedState}`);
            }
            if (tc.expectedDistrict) {
                assert(res.locationEntity && res.locationEntity.canonical === tc.expectedDistrict, `District mismatch: expected ${tc.expectedDistrict}`);
            }
            if (tc.expectedSoil) {
                assert(res.soilEntity && res.soilEntity.canonical === tc.expectedSoil, `Soil mismatch: expected ${tc.expectedSoil}`);
            }

            console.log(` ✅ PASS: Intent = ${res.intent}, Entity = ${res.commodity || res.soilEntity?.canonical || 'N/A'}`);
            passedCount++;
        } catch (err) {
            console.error(` ❌ FAIL: ${err.message}`);
            failedCount++;
        }
    }

    // Critical End-to-End Orchestrator Check for "chiili market price"
    console.log("\n--> Critical Verification: AI Orchestrator response for 'chiili market price'");
    const orchestratorRes = await aiOrchestrator.processQuery({
        message: "chiili market price",
        sessionId: "test_intent_session_" + Date.now()
    });

    try {
        assert(orchestratorRes.success === true, "Orchestrator returned success");
        assert(!orchestratorRes.response.includes("Which crop or commodity market price would you like to check?"), "Must NOT ask 'Which crop?' for 'chiili market price'");
        assert(orchestratorRes.response.includes("Chilli") || orchestratorRes.response.includes("chilli"), "Response must reference Chilli");
        console.log(" ✅ PASS: Orchestrator understood 'chiili market price' and did NOT ask 'Which crop?'!");
        console.log(" Bot Response Snippet: " + orchestratorRes.response.substring(0, 120) + "...\n");
        passedCount++;
    } catch (err) {
        console.error(` ❌ FAIL: ${err.message}`);
        failedCount++;
    }

    console.log("=========================================================================");
    console.log(` 📊 SUMMARY: ${passedCount} PASSED, ${failedCount} FAILED out of ${passedCount + failedCount} TESTS`);
    console.log("=========================================================================");

    if (failedCount > 0) process.exit(1);
}

runIntentEntityTestSuite().catch(err => {
    console.error("Test Suite Error:", err);
    process.exit(1);
});
