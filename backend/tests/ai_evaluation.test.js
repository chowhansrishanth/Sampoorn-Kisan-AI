/**
 * AI Evaluation & Accuracy Benchmark Suite
 * Tests 15+ real-world Indian agricultural queries across all specialized domain agents.
 */

const assert = require("assert");
const aiOrchestrator = require("../services/aiOrchestrator");
const conversationMemory = require("../services/conversationMemory");

const EVAL_QUERIES = [
    { query: "Warangal mandi price for cotton today", expectedIntent: "market", expectedAgent: "Mandi Market & MSP Agent" },
    { query: "What is the official MSP for Green Gram Moong in 2025-26?", expectedIntent: "market", expectedAgent: "Mandi Market & MSP Agent" },
    { query: "Is heavy rain expected in Ludhiana tomorrow?", expectedIntent: "weather", expectedAgent: "Weather & Agromet Advisory Agent" },
    { query: "Should I spray pesticide if rain is coming in 2 hours?", expectedIntent: "weather", expectedAgent: "Weather & Agromet Advisory Agent" },
    { query: "My tomato leaf has concentric dark bullseye rings with yellow halo", expectedIntent: "disease", expectedAgent: "Pest & Disease Diagnostic Agent" },
    { query: "How much Coragen pesticide should I spray per acre for Fall Armyworm?", expectedIntent: "disease", expectedAgent: "Pest & Disease Diagnostic Agent" },
    { query: "Yellow leaves in paddy crop NPK fertilizer recommendation", expectedIntent: "soil", expectedAgent: "Soil & Crop Nutrition Agent" },
    { query: "How much DAP and Zinc Sulphate per acre for red soil?", expectedIntent: "soil", expectedAgent: "Soil & Crop Nutrition Agent" },
    { query: "How to apply for PM-Kisan scheme 6000 rupees?", expectedIntent: "scheme", expectedAgent: "Government Schemes & Subsidy Agent" },
    { query: "PMKSY micro irrigation drip subsidy for small farmers", expectedIntent: "scheme", expectedAgent: "Government Schemes & Subsidy Agent" },
    { query: "Which easy high profit short duration crop can I grow in 2 acres?", expectedIntent: "crop", expectedAgent: "Crop Recommendation & Agronomy Agent" },
    { query: "Best crop for low water drought condition in Kharif season?", expectedIntent: "crop", expectedAgent: "Crop Recommendation & Agronomy Agent" },
    { query: "నా టమాటో ఆకులపై మచ్చలు వచ్చాయి ఏం మందు పిచికారీ చేయాలి?", expectedIntent: "disease", expectedAgent: "Pest & Disease Diagnostic Agent" },
    { query: "धान की फसल में पीलापन दूर करने के लिए कौन सा उर्वरक डालें?", expectedIntent: "soil", expectedAgent: "Soil & Crop Nutrition Agent" },
    { query: "How to prevent root rot in black soil?", expectedIntent: "disease", expectedAgent: "Pest & Disease Diagnostic Agent" }
];

async function runEvaluationSuite() {
    console.log("=================================================");
    console.log("📊 RUNNING SAMPOORN KISAN AI 15-QUERY EVALUATION");
    console.log("=================================================");
    let passed = 0;

    for (let i = 0; i < EVAL_QUERIES.length; i++) {
        const item = EVAL_QUERIES[i];
        const route = aiOrchestrator.detectAgentAndIntent(item.query);
        const isMatch = route.intent === item.expectedIntent;

        if (isMatch) {
            console.log(`  ✅ [Q${i+1}] PASS: "${item.query.substring(0, 45)}..." -> ${route.agent}`);
            passed++;
        } else {
            console.error(`  ❌ [Q${i+1}] FAIL: "${item.query}" -> got '${route.agent}' (expected '${item.expectedAgent}')`);
        }
    }

    const accuracy = ((passed / EVAL_QUERIES.length) * 100).toFixed(1);
    console.log("=================================================");
    console.log(`🎯 EVALUATION BENCHMARK ACCURACY: ${accuracy}% (${passed}/${EVAL_QUERIES.length})`);
    console.log("=================================================");

    if (passed < EVAL_QUERIES.length) {
        process.exit(1);
    }
}

if (require.main === module) {
    runEvaluationSuite();
}

module.exports = runEvaluationSuite;
