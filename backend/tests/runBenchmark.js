/**
 * CLI Benchmark Evaluation Runner
 * Executed via `npm run ai:benchmark`
 */

const evaluator = require("../services/benchmarkEvaluator");
const generator = require("../services/benchmarkGenerator");

async function main() {
    console.log("=========================================================================");
    console.log(" 🌾 SAMPOORN KISAN AI SAHAYAK — BENCHMARK EVALUATION SYSTEM");
    console.log("=========================================================================\n");

    // Ensure benchmark datasets exist
    generator.generateBenchmark();

    // Run evaluation against Golden Test Set (100 records for fast CLI output)
    console.log("[CLI] Running Golden Test Set Evaluation...");
    const summary = await evaluator.runEvaluation("golden_test", 100);

    console.log("\n=========================================================================");
    console.log(` 📊 OVERALL BENCHMARK ACCURACY: ${summary.overallAccuracy}%`);
    console.log(` 🎯 Intent Accuracy:            ${summary.metrics.intentAccuracy}%`);
    console.log(` 🏷️  Entity Accuracy:            ${summary.metrics.entityAccuracy}%`);
    console.log(` 🛠️  Tool Selection Accuracy:   ${summary.metrics.toolSelectionAccuracy}%`);
    console.log(` 🚫 Hallucination Rate:         ${summary.metrics.hallucinationRate}%`);
    console.log(` ⏱️  P50 Latency:                ${summary.metrics.p50LatencyMs} ms`);
    console.log(` ⚡ P95 Latency:                ${summary.metrics.p95LatencyMs} ms`);
    console.log("=========================================================================\n");
}

main().catch(err => {
    console.error("Benchmark error:", err);
    process.exit(1);
});
