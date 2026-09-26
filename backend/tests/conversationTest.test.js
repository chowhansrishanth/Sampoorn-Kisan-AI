/**
 * Multi-Turn Reference & Context Resolution Automated Test Suite
 * Fulfills Requirement Section 44.
 */

const aiOrchestrator = require("../services/aiOrchestrator");
const conversationMemory = require("../services/conversationMemory");

async function runConversationTest() {
    console.log("\n=========================================================================");
    console.log(" 🗣️ RUNNING MULTI-TURN CONVERSATION TEST SUITE (SECTION 44)");
    console.log("=========================================================================\n");

    const sessionId = "spec_sec44_test_session_" + Date.now();
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
        // Turn 1: Location Context
        console.log("--> Turn 1: 'I am from Telangana.'");
        await aiOrchestrator.processMessage("I am from Telangana.", "EN", [], sessionId);
        let mem = conversationMemory.getSession(sessionId).structured;
        assert(mem.state === "Telangana" || mem.location?.includes("Telangana"), "Stored state = Telangana");

        // Turn 2: Soil Type Context
        console.log("\n--> Turn 2: 'I have black soil.'");
        await aiOrchestrator.processMessage("I have black soil.", "EN", [], sessionId);
        mem = conversationMemory.getSession(sessionId).structured;
        assert(mem.soil_type === "Black Soil", "Stored soil = Black Soil");

        // Turn 3: Land Size Context
        console.log("\n--> Turn 3: 'I have 1.5 acres.'");
        await aiOrchestrator.processMessage("I have 1.5 acres.", "EN", [], sessionId);
        mem = conversationMemory.getSession(sessionId).structured;
        assert(mem.land_size?.includes("1.5"), "Stored land size = 1.5 acres");

        // Turn 4: Water Availability Context
        console.log("\n--> Turn 4: 'Water is limited.'");
        await aiOrchestrator.processMessage("Water is limited.", "EN", [], sessionId);
        mem = conversationMemory.getSession(sessionId).structured;
        assert(mem.water_availability !== null, "Stored water availability");

        // Turn 5: Season Context
        console.log("\n--> Turn 5: 'It is Kharif season.'");
        await aiOrchestrator.processMessage("It is Kharif season.", "EN", [], sessionId);
        mem = conversationMemory.getSession(sessionId).structured;
        assert(mem.season !== null, "Stored season");

        // Turn 6: Crop Recommendation using accumulated context
        console.log("\n--> Turn 6: 'Which crop should I grow?'");
        const cropRes = await aiOrchestrator.processMessage("Which crop should I grow?", "EN", [], sessionId);
        mem = conversationMemory.getSession(sessionId).structured;
        assert(cropRes.success === true, "Orchestrator processed query successfully");
        assert(!cropRes.response.includes("Which state") && !cropRes.response.includes("What soil"), "Did NOT re-ask for location or soil");
        assert(mem.lastRecommendedCrop !== null || /cotton|red gram|paddy|chilli/i.test(cropRes.response), "Generated crop recommendation using accumulated context");

        // Turn 7: Reference Resolution ("its market price")
        console.log("\n--> Turn 7: 'What is its market price?'");
        const priceRes = await aiOrchestrator.processMessage("What is its market price?", "EN", [], sessionId);
        assert(priceRes.success === true, "Orchestrator processed 'its market price' query");
        assert(!priceRes.response.includes("Which crop or commodity"), "Did NOT ask 'Which crop or commodity?'");
        assert(priceRes.response.includes("Telangana") || priceRes.response.includes("quintal") || priceRes.response.includes("Price") || priceRes.response.includes("mandi"), "Returned price info using stored commodity & Telangana location");

        // Turn 8: Contextual Follow-up ("What about irrigation?")
        console.log("\n--> Turn 8: 'What about irrigation?'");
        const irriRes = await aiOrchestrator.processMessage("What about irrigation?", "EN", [], sessionId);
        assert(irriRes.success === true, "Orchestrator processed irrigation follow-up");
        assert(irriRes.response.length > 30, "Returned practical irrigation advisory");

        // Turn 9: Weather Query using stored location ("Will it rain tomorrow?")
        console.log("\n--> Turn 9: 'Will it rain tomorrow?'");
        const weatherRes = await aiOrchestrator.processMessage("Will it rain tomorrow?", "EN", [], sessionId);
        assert(weatherRes.success === true, "Orchestrator processed weather query");
        assert(!weatherRes.response.includes("Which location") && !weatherRes.response.includes("Which state"), "Used stored location without asking location");

    } catch (err) {
        console.error("Test Exception:", err);
        failed++;
    }

    console.log("\n=========================================================================");
    console.log(` 📊 SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} TESTS`);
    console.log("=========================================================================\n");
}

runConversationTest();
