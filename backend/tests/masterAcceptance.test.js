/**
 * Master Natural Language Acceptance Test Suite
 * Fulfills Requirement Section 49.
 */

const aiOrchestrator = require("../services/aiOrchestrator");

async function runMasterAcceptanceTests() {
    console.log("\n=========================================================================");
    console.log(" 🎯 RUNNING MASTER NATURAL LANGUAGE ACCEPTANCE TEST SUITE (SECTION 49)");
    console.log("=========================================================================\n");

    let passed = 0;
    let failed = 0;

    const assert = (condition, description) => {
        if (condition) {
            console.log(` ✅ PASS: ${description}`);
            passed++;
        } else {
            console.error(` ❌ FAIL: ${description}`);
            failed++;
        }
    };

    try {
        // Query 1: Typo + Short query ("chiili market price")
        console.log("--> Query 1: 'chiili market price'");
        const res1 = await aiOrchestrator.processMessage("chiili market price", "EN", [], "sec49_sess_1");
        assert(res1.success === true, "Query 1 executed successfully");
        assert(res1.intent === "market", "Detected MARKET_PRICE intent");
        assert(res1.structured_memory.lastCommodity === "chilli", "Extracted commodity 'chilli' from typo 'chiili'");
        assert(!res1.response.includes("Which crop or commodity"), "No generic 'Which crop?' question");

        // Query 2: Telugu Transliterated Mandi query ("vari market price")
        console.log("\n--> Query 2: 'vari market price'");
        const res2 = await aiOrchestrator.processMessage("vari market price", "TE", [], "sec49_sess_2");
        assert(res2.success === true, "Query 2 executed successfully");
        assert(res2.intent === "market", "Detected MARKET_PRICE intent for Telugu 'vari'");
        assert(res2.structured_memory.lastCommodity === "rice" || res2.structured_memory.lastCommodity === "paddy", "Normalized 'vari' to 'rice/paddy'");
        assert(!res2.response.includes("Which crop or commodity"), "No generic fallback prompt");

        // Query 3: Telugu Crop Planning query ("panta recommendation")
        console.log("\n--> Query 3: 'panta recommendation'");
        const res3 = await aiOrchestrator.processMessage("panta recommendation", "TE", [], "sec49_sess_3");
        assert(res3.success === true, "Query 3 executed successfully");
        assert(res3.intent === "crop", "Detected CROP_RECOMMENDATION intent for 'panta'");
        assert(res3.response.length > 30, "Generated crop recommendation advisory");

        // Query 4: Soil + Crop Fertilizer query ("what fertilizer for tomato in red soil")
        console.log("\n--> Query 4: 'what fertilizer for tomato in red soil'");
        const res4 = await aiOrchestrator.processMessage("what fertilizer for tomato in red soil", "EN", [], "sec49_sess_4");
        assert(res4.success === true, "Query 4 executed successfully");
        assert(res4.intent === "soil", "Detected SOIL/FERTILIZER intent");
        assert(res4.structured_memory.soil_type === "Red Soil", "Extracted Red Soil entity");

        // Query 5: Pest query for transliterated crop ("pest control for mirchi")
        console.log("\n--> Query 5: 'pest control for mirchi'");
        const res5 = await aiOrchestrator.processMessage("pest control for mirchi", "EN", [], "sec49_sess_5");
        assert(res5.success === true, "Query 5 executed successfully");
        assert(res5.intent === "disease", "Detected PEST/DISEASE intent");
        assert(res5.structured_memory.lastCommodity === "chilli", "Normalized 'mirchi' to 'chilli'");

        // Query 6: Government Scheme query ("pm kisan status")
        console.log("\n--> Query 6: 'pm kisan status'");
        const res6 = await aiOrchestrator.processMessage("pm kisan status", "EN", [], "sec49_sess_6");
        assert(res6.success === true, "Query 6 executed successfully");
        assert(res6.intent === "scheme", "Detected GOVERNMENT_SCHEME intent");
        assert(res6.response.toLowerCase().includes("pm-kisan") || res6.response.toLowerCase().includes("kisan"), "Returned PM-KISAN scheme info");

    } catch (err) {
        console.error("Test Exception:", err);
        failed++;
    }

    console.log("\n=========================================================================");
    console.log(` 📊 SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} TESTS`);
    console.log("=========================================================================\n");
}

runMasterAcceptanceTests();
