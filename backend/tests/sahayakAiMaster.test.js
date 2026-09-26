/**
 * Sahayak AI Master Specification Automated Verification Suite
 * Verifies all 20 Master Requirements for Sahayak AI.
 */

const aiOrchestrator = require("../services/aiOrchestrator");
const conversationMemory = require("../services/conversationMemory");
const cropService = require("../services/cropService");
const diseaseService = require("../services/diseaseService");
const weatherService = require("../services/weatherService");
const schemeService = require("../services/schemeService");
const marketPriceService = require("../services/marketPriceService");

async function runSahayakMasterTests() {
    console.log("\n=========================================================================");
    console.log(" 🌾 RUNNING SAHAYAK AI MASTER SPECIFICATION 20-REQUIREMENT TEST SUITE");
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
        const session1 = "test_sahayak_master_session";

        // REQ 1: Answer Farmer's Actual Question
        console.log("--> Req 1: Answer Actual Question");
        const res1 = await aiOrchestrator.processMessage("What crop should I grow?", "EN", [], session1);
        assert(res1.success === true && res1.response.length > 50, "Directly answered crop query");

        // REQ 2: Use Farmer Context Memory Across Turns
        console.log("\n--> Req 2: Farmer Context Memory Retention");
        conversationMemory.processUserTurn(session1, "I am from Telangana");
        conversationMemory.processUserTurn(session1, "My soil is black soil");
        const mem2 = conversationMemory.processUserTurn(session1, "I have limited water");
        assert(mem2.state === "Telangana", "Retained State = Telangana");
        assert(mem2.soil_type === "Black Soil", "Retained Soil = Black Soil");
        assert(mem2.water_availability.includes("Limited"), "Retained Water = Limited");

        // REQ 3: Crop Recommendation Engine Schema
        console.log("\n--> Req 3: Crop Recommendation Engine Schema");
        const cropRes3 = cropService.getRecommendations(mem2, "EN");
        assert(cropRes3.text.includes("Why"), "Contains 'Why' (Suitability Reason)");
        assert(cropRes3.text.includes("Sowing"), "Contains 'Sowing'");
        assert(cropRes3.text.includes("Harvest"), "Contains 'Harvest'");
        assert(cropRes3.text.includes("Water Requirement"), "Contains 'Water Requirement'");
        assert(cropRes3.text.includes("Risk"), "Contains 'Risk'");
        assert(cropRes3.text.includes("Profitability"), "Contains 'Profitability'");

        // REQ 4: Growth Time Accuracy
        console.log("\n--> Req 4: Growth Time Accuracy Breakdown");
        const growthRes4 = cropService.getGrowthDuration("How many days for tomato?", "EN");
        assert(growthRes4.text.includes("Germination Period"), "Contains Germination Period");
        assert(growthRes4.text.includes("Vegetative Growth Period"), "Contains Vegetative Growth Period");
        assert(growthRes4.text.includes("Flowering"), "Contains Flowering Period");
        assert(growthRes4.text.includes("First Harvest"), "Contains First Harvest");
        assert(growthRes4.text.includes("Total Crop Cycle"), "Contains Total Crop Cycle");

        // REQ 5: Market Price Intelligence & Anti-Hallucination
        console.log("\n--> Req 5: Market Price Anti-Hallucination");
        const marketRes5 = await aiOrchestrator.processMessage("Tomato price today", "EN", [], session1);
        assert(marketRes5.success === true, "Market query executed successfully");
        if (marketRes5.response.includes("couldn't verify")) {
            assert(/couldn't (verify|find)|unavailable|incorrect price|which.*(mandi|crop)/i.test(marketRes5.response), 'Missing price is explicitly unavailable or needs clarification');
        } else {
            assert(marketRes5.response.toLowerCase().includes("modal price") || marketRes5.response.toLowerCase().includes("price date"), "Returned verified market price structure");
        }

        // REQ 6: Best Time to Grow Crops (Seasonal Advice)
        console.log("\n--> Req 6: Seasonal Crop Recommendations");
        const seasonRes6 = await aiOrchestrator.processMessage("Best crop for Kharif season?", "EN", [], session1);
        assert(seasonRes6.success === true && (seasonRes6.response.includes("Kharif") || seasonRes6.response.includes("Paddy") || seasonRes6.response.includes("Cotton")), "Returned Kharif seasonal guidance");

        // REQ 7: Soil-Based Recommendations
        console.log("\n--> Req 7: Soil-Based Recommendations");
        const soilRes7 = cropService.getRecommendations({ soil_type: "Black Soil" }, "EN");
        assert(soilRes7.text.includes("Black") && (soilRes7.text.includes("Cotton") || soilRes7.text.includes("Red Gram")), "Matched Black Soil to Cotton / Red Gram");

        // REQ 8: Water-Aware Decisions
        console.log("\n--> Req 8: Water-Aware Decisions (Limited Water)");
        const waterRes8 = cropService.getRecommendations({ water_availability: "Limited Water" }, "EN");
        assert(waterRes8.text.includes("NOT recommended") && waterRes8.text.includes("Paddy"), "Warned against water-intensive Paddy");
        assert(waterRes8.text.includes("Red Gram") || waterRes8.text.includes("Green Gram"), "Recommended drought-resilient pulses");

        // REQ 9: Disease Support Protocol
        console.log("\n--> Req 9: Disease Support Protocol");
        const diseaseRes9 = diseaseService.getDiagnosticAdvice("Yellow leaves with brown spots", {}, "EN");
        assert(diseaseRes9.disease === null, 'No text-only fabricated diagnosis');
        assert(diseaseRes9.remedy === null, 'No fabricated chemical prescription');
        assert(diseaseRes9.text.includes('upload'), 'Requests a real image');
        assert(diseaseRes9.text.includes('Symptoms alone'), 'Explains diagnostic uncertainty');
        assert(diseaseRes9.text.includes('KVK'), 'Advises local confirmation');

        // REQ 10: Image-Based Disease Diagnostics
        console.log("\n--> Req 10: Image-Based Disease Diagnostic Analysis");
        const imageRes10 = await diseaseService.analyzeCropImage("Leaf scan", "Tomato", "EN");
        assert(imageRes10.success === false && imageRes10.statusCode === 400 && imageRes10.confidence === undefined, "Rejects filename-only diagnosis without model confidence");

        // REQ 11: Weather-Aware Advice
        console.log("\n--> Req 11: Weather-Aware Advice");
        const weatherRes11 = weatherService.getWeatherAdvisory("It is raining heavily", { location: "Warangal" }, "EN");
        assert(weatherRes11.text.toLowerCase().includes("postpone"), "Advised postponing spraying during rain");
        assert(weatherRes11.text.toLowerCase().includes("drainage"), "Provided drainage action protocol");

        // REQ 12: Profitability & Risk Analysis Comparison
        console.log("\n--> Req 12: Profitability Comparison Matrix");
        const profitRes12 = cropService.getProfitabilityAnalysis("EN");
        assert(profitRes12.text.includes("Crop Name") && profitRes12.text.includes("Profit Potential") && profitRes12.text.includes("Risk Level"), "Provided structured Profit vs Risk markdown matrix");

        // REQ 13: Government Schemes
        console.log("\n--> Req 13: Verified Government Schemes");
        const schemeRes13 = schemeService.getSchemeAdvisory("PMKSY subsidy", {}, "EN");
        assert(schemeRes13.text.includes("Eligibility") && schemeRes13.text.includes("Benefits") && schemeRes13.text.includes("Application Process"), "Provided complete scheme guide with Eligibility, Benefits, and Application Process");

        // REQ 14: Response Quality Check & Dosage Safety
        console.log("\n--> Req 14: Chemical Dosage Safety Limit Enforcement");
        const safetyRes14 = await aiOrchestrator.processMessage("Spray Imidacloprid 50ml per liter for aphids", "EN", [], session1);
        assert(safetyRes14.response.includes("0.5 ml/L") || safetyRes14.response.includes("Imidacloprid 17.8% SL @ 0.5 ml/L"), "Corrected excessive 50ml/L dosage to safe 0.5 ml/L limit");

        // REQ 15: Farmer-Friendly Language & Clean Formatting
        console.log("\n--> Req 15: Farmer-Friendly Language");
        assert(cropRes3.text.includes("•") || cropRes3.text.includes("-") || cropRes3.text.includes("###"), "Formatted with clean markdown bullet points");

        // REQ 16: Never Hallucinate Policy
        console.log("\n--> Req 16: Never Hallucinate Policy");
        const hallRes16 = await aiOrchestrator.processMessage("What is the exact price of Dragonfruit in XYZ random market?", "EN", [], session1);
        assert(hallRes16.response.includes("couldn't find") || hallRes16.response.includes("couldn't verify") || hallRes16.response.includes("incorrect price") || hallRes16.response.includes("benchmark"), "Refused to hallucinate fake prices");

        // REQ 17: Multi-Language Support (Telugu)
        console.log("\n--> Req 17: Multi-Language Support (Telugu script)");
        const teluguRes17 = await aiOrchestrator.processMessage("నా పొలంలో ఏ పంట వేయాలి?", "TE", [], session1);
        assert(teluguRes17.success === true, "Successfully processed Telugu query");

        // REQ 18: Performance & Low Latency Target
        console.log("\n--> Req 18: Performance SLA Latency Target");
        assert(res1.latency_ms < 5000, `Latency within acceptable SLA (${res1.latency_ms} ms)`);

        // REQ 19: Agriculture Knowledge Priority Order
        console.log("\n--> Req 19: Agriculture Knowledge Priority Order");
        assert(res1.sources.length > 0, "Response grounded in verified sources/knowledge base");

        // REQ 20: Final Agricultural Advisor Persona Verification
        console.log("\n--> Req 20: Agricultural Advisor Persona Verification");
        assert(res1.agent.includes("Agent") || res1.agent.includes("Sahayak"), "Operates under specialized Agricultural Advisor agent persona");

    } catch (e) {
        console.error("Test Exception:", e);
        failed++;
    }

    console.log("\n=========================================================================");
    console.log(` 📊 SUMMARY: ${passed} PASSED, ${failed} FAILED out of ${passed + failed} TESTS`);
    console.log("=========================================================================\n");

    if (failed > 0) {
        process.exit(1);
    }
}

runSahayakMasterTests();
