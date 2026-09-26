/**
 * Mandatory Context Retention Automated Test Suite
 * Fulfills Requirement 39: Mandatory Multi-Turn Agricultural Context Retention.
 */

const aiOrchestrator = require("../services/aiOrchestrator");
const conversationMemory = require("../services/conversationMemory");

async function runContextRetentionTest() {
    console.log("\n=========================================================================");
    console.log(" 🧪 RUNNING MANDATORY CONTEXT RETENTION AUTOMATED TEST SUITE (POINT 39)");
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
        const testSessionId = `test_context_session_${Date.now()}`;

        // TURN 1: Farmer provides baseline parameters
        console.log("--> Turn 1: Storing Farmer Parameters");
        const turn1Msg = "I am from Telangana. I have black soil. I have 1.5 acres. Water is limited. It is Kharif season.";
        const state1 = conversationMemory.processUserTurn(testSessionId, turn1Msg);

        assert(state1.state === "Telangana", "Memory retained State = Telangana");
        assert(state1.soil_type === "Black Soil", "Memory retained Soil = Black Soil");
        assert(state1.land_size && state1.land_size.includes("1.5"), "Memory retained Land Size = 1.5 acres");
        assert(state1.water_availability && state1.water_availability.includes("Limited"), "Memory retained Water = Limited");
        assert(state1.season && state1.season.includes("Kharif"), "Memory retained Season = Kharif");

        // TURN 2: Farmer asks "Which crop should I grow?"
        console.log("\n--> Turn 2: Processing Crop Query using Stored Context");
        const res2 = await aiOrchestrator.processQuery({
            message: "Which crop should I grow?",
            language: "EN",
            sessionId: testSessionId
        });

        assert(res2.success === true, "Orchestrator processed Turn 2 successfully");
        const lowerRes2 = (res2.response || "").toLowerCase();
        
        // Assert AI does NOT re-ask for details already provided
        const reasksInformation = lowerRes2.includes("which state are you from") || lowerRes2.includes("what soil do you have");
        assert(!reasksInformation, "AI did NOT re-ask for state or soil type");
        assert(lowerRes2.includes("cotton") || lowerRes2.includes("red gram") || lowerRes2.includes("pigeonpea") || lowerRes2.includes("black soil"), "AI utilized stored Telangana & Black Soil context");

        // TURN 3: Farmer asks "What about irrigation?"
        console.log("\n--> Turn 3: Processing Follow-up Irrigation Query using Stored Context");
        const res3 = await aiOrchestrator.processQuery({
            message: "What about irrigation?",
            language: "EN",
            sessionId: testSessionId
        });

        assert(res3.success === true, "Orchestrator processed Turn 3 successfully");
        const lowerRes3 = (res3.response || "").toLowerCase();

        assert(lowerRes3.includes("drip") || lowerRes3.includes("drainage") || lowerRes3.includes("water") || lowerRes3.includes("irrigation"), "AI provided relevant irrigation guidance using stored context");
        assert(!lowerRes3.includes("which state"), "AI continued using stored context without re-asking questions");

    } catch (err) {
        console.error("Test Exception:", err);
        failed++;
    }

    console.log("\n=========================================================================");
    console.log(` 📊 SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} TESTS`);
    console.log("=========================================================================\n");

    if (failed > 0) {
        process.exit(1);
    }
}

runContextRetentionTest();
