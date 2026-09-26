/**
 * Comprehensive Automated System Test Suite
 * Validates AI Orchestrator Intent Routing, Session Memory Context Retention,
 * RAG Context Injection, and Response Safety Guardrails.
 */

const assert = require("assert");
const aiOrchestrator = require("../services/aiOrchestrator");
const conversationMemory = require("../services/conversationMemory");
const ragEngine = require("../services/ragEngine");
const responseValidator = require("../services/responseValidator");
const aiProvider = require("../services/aiProvider");

async function runSystemTestSuite() {
    console.log("=================================================");
    console.log("🧪 STARTING SAMPOORN KISAN AI SYSTEM TEST SUITE");
    console.log("=================================================");
    let passed = 0;
    let failed = 0;

    async function test(name, fn) {
        try {
            await fn();
            console.log(`  ✅ PASS: ${name}`);
            passed++;
        } catch (err) {
            console.error(`  ❌ FAIL: ${name}`);
            console.error(`     Error: ${err.message}`);
            failed++;
        }
    }

    // 1. INTENT ROUTING ACCURACY
    await test("Intent Classifier: Mandi Market & MSP Agent", async () => {
        const route = aiOrchestrator.detectAgentAndIntent("What is today's mandi price for cotton in Warangal?");
        assert.strictEqual(route.intent, "market");
        assert.strictEqual(route.agent, "Mandi Market & MSP Agent");
    });

    await test("Intent Classifier: Weather & Agromet Advisory Agent", async () => {
        const route = aiOrchestrator.detectAgentAndIntent("Will it rain tomorrow in Karimnagar? Should I drain field water?");
        assert.strictEqual(route.intent, "weather");
        assert.strictEqual(route.agent, "Weather & Agromet Advisory Agent");
    });

    await test("Intent Classifier: Pest & Disease Diagnostic Agent", async () => {
        const route = aiOrchestrator.detectAgentAndIntent("My tomato leaves have dark circular spots with yellow halos, what spray should I use?");
        assert.strictEqual(route.intent, "disease");
        assert.strictEqual(route.agent, "Pest & Disease Diagnostic Agent");
    });

    await test("Intent Classifier: Soil & Crop Nutrition Agent", async () => {
        const route = aiOrchestrator.detectAgentAndIntent("What is the NPK fertilizer ratio and Urea dosage for soil deficiency?");
        assert.strictEqual(route.intent, "soil");
        assert.strictEqual(route.agent, "Soil & Crop Nutrition Agent");
    });

    await test("Intent Classifier: Government Schemes Agent", async () => {
        const route = aiOrchestrator.detectAgentAndIntent("How do I get 90% drip irrigation subsidy under PMKSY scheme?");
        assert.strictEqual(route.intent, "scheme");
        assert.strictEqual(route.agent, "Government Schemes & Subsidy Agent");
    });

    await test("Intent Classifier: Crop Recommendation Agent", async () => {
        const route = aiOrchestrator.detectAgentAndIntent("Which high profit crop can I grow in 2 acres red soil during Kharif season?");
        assert.strictEqual(route.intent, "crop");
        assert.strictEqual(route.agent, "Crop Recommendation & Agronomy Agent");
    });

    // 2. CONVERSATION MEMORY & USER SESSION ISOLATION
    await test("Session Memory: Structured Entity Extraction (State, Soil, Land, Crop)", async () => {
        const testSession = "test_session_user_42";
        conversationMemory.resetSession(testSession);
        
        conversationMemory.processUserTurn(testSession, "I am a farmer from Telangana. I have 3 acres red soil and want to grow cotton.");
        const session = conversationMemory.getSession(testSession);

        assert.strictEqual(session.structured.state, "Telangana");
        assert.strictEqual(session.structured.soil_type, "Red Soil");
        assert(session.structured.land_size.includes("3 acre"));
        assert.strictEqual(session.structured.current_crop, "Cotton");
    });

    await test("Session Memory: Isolated Context Reuse without Global Bleed", async () => {
        const userA = "session_user_A";
        const userB = "session_user_B";
        conversationMemory.resetSession(userA);
        conversationMemory.resetSession(userB);

        conversationMemory.processUserTurn(userA, "I have black soil in Punjab");
        conversationMemory.processUserTurn(userB, "I have sandy soil in Rajasthan");

        const contextA = conversationMemory.composeContext(userA);
        const contextB = conversationMemory.composeContext(userB);

        assert(contextA.structuredSummary.includes("Punjab"));
        assert(contextA.structuredSummary.includes("Black Soil"));
        assert(!contextA.structuredSummary.includes("Rajasthan"));

        assert(contextB.structuredSummary.includes("Rajasthan"));
        assert(contextB.structuredSummary.includes("Sandy"));
        assert(!contextB.structuredSummary.includes("Punjab"));
    });

    // 3. RAG ENGINE GROUNDING & DATA BOUNDARY ENFORCEMENT
    await test("RAG Engine: Retrieves verified reference data with strict metadata boundary tags", async () => {
        const ragRes = await ragEngine.retrieveContexts("pest control dosage for bollworm", "disease", {});
        assert(ragRes.contexts.length > 0);
        assert(ragRes.contexts[0].includes("[VERIFIED REFERENCE DATA"));
        assert(ragRes.sources.some(s => s.includes("CIBRC") || s.includes("ICAR")));
    });

    // 4. RESPONSE VALIDATION & DOSAGE GUARDRAILS
    await test("Response Validator: Corrects excessive chemical dosage to safe CIBRC limit", async () => {
        const responseText = "You should spray Imidacloprid 17.8% SL @ 10 ml/L water for sucking pests.";
        const validation = responseValidator.validateResponse(responseText, "how to spray imidacloprid", {});
        assert(validation.sanitizedResponse.includes("0.5 ml/L") || validation.sanitizedResponse.includes("0.5ml/L"));
        assert(validation.validationNotes.some(n => n.includes("Imidacloprid")));
    });

    await test("Response Validator: Enforces anti-hallucination guardrail on missing mandi prices", async () => {
        const validation = responseValidator.validateResponse("The exact current live mandi price is ₹9,999", "what is today's live mandi price for cotton", {});
        assert(validation.sanitizedResponse.includes("couldn't verify"));
    });

    // 5. END-TO-END ORCHESTRATOR PIPELINE
    await test("AI Orchestrator: End-to-End processing with grounded data and fallback resilience", async () => {
        const result = await aiOrchestrator.processQuery({
            message: "What crop should I grow in 2 acres red soil during Kharif season with limited water?",
            sessionId: "test_e2e_session",
            language: "EN"
        });

        assert.strictEqual(result.success, true);
        assert(result.agent.length > 0);
        assert(result.response.length > 30);
        assert(Array.isArray(result.sources));
    });

    console.log("=================================================");
    console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) {
        process.exit(1);
    }
}

if (require.main === module) {
    runSystemTestSuite();
}

module.exports = runSystemTestSuite;
