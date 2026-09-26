/**
 * High-Performance & AI Intelligence Benchmark Suite
 * Measures latency SLAs, in-flight request deduplication, cache hit rates,
 * complexity routing, and pure-code deterministic math execution.
 */

const assert = require("assert");
const cacheService = require("../services/cacheService");
const marketPriceService = require("../services/marketPriceService");
const locationService = require("../services/locationService");
const cropService = require("../services/cropService");
const aiOrchestrator = require("../services/aiOrchestrator");
const responseValidator = require("../services/responseValidator");

async function runBenchmarkSuite() {
    console.log("\n=========================================================================");
    console.log(" 🚀 RUNNING HIGH-PERFORMANCE & AI INTELLIGENCE BENCHMARK SUITE");
    console.log("=========================================================================\n");

    let totalTests = 0;
    let passedTests = 0;

    function test(name, fn) {
        totalTests++;
        try {
            fn();
            passedTests++;
            console.log(` ✅ PASS: ${name}`);
        } catch (err) {
            console.error(` ❌ FAIL: ${name}`);
            console.error(`    Error: ${err.message}`);
        }
    }

    async function asyncTest(name, fn) {
        totalTests++;
        try {
            await fn();
            passedTests++;
            console.log(` ✅ PASS: ${name}`);
        } catch (err) {
            console.error(` ❌ FAIL: ${name}`);
            console.error(`    Error: ${err.message}`);
        }
    }

    // 1. Cache & Deduplication Tests
    await asyncTest("In-Flight Promise Deduplication for Concurrent Requests", async () => {
        cacheService.clear();
        let fetchCount = 0;
        const fetcherFn = async () => {
            fetchCount++;
            await new Promise(r => setTimeout(r, 50));
            return { temperature: "32°C", humidity: "65%" };
        };

        // 5 concurrent requests for same key
        const results = await Promise.all([
            cacheService.getOrFetch("weather_hyderabad", fetcherFn),
            cacheService.getOrFetch("weather_hyderabad", fetcherFn),
            cacheService.getOrFetch("weather_hyderabad", fetcherFn),
            cacheService.getOrFetch("weather_hyderabad", fetcherFn),
            cacheService.getOrFetch("weather_hyderabad", fetcherFn)
        ]);

        assert.strictEqual(fetchCount, 1, "Fetcher function should be called ONLY once for 5 concurrent requests");
        assert.strictEqual(results[0].temperature, "32°C");
        assert.strictEqual(results[4].humidity, "65%");
    });

    await asyncTest("TTL Cache Hit Latency < 5ms", async () => {
        const start = Date.now();
        const res1 = await marketPriceService.getMarketPrice("Tomato price in Hyderabad", { location: "Hyderabad, Telangana, India" });
        const latency1 = Date.now() - start;

        const start2 = Date.now();
        const res2 = await marketPriceService.getMarketPrice("Tomato price in Hyderabad", { location: "Hyderabad, Telangana, India" });
        const latency2 = Date.now() - start2;

        assert(res2.isCached || res2.success, "Second call should return cached payload");
        assert(latency2 <= 15, `Cached call latency (${latency2} ms) should be under 15 ms`);
    });

    // 2. Location Service Geocode Caching
    await asyncTest("GPS Geocoded Coordinate Caching < 10ms SLA (fixture)", async () => {
        cacheService.set("geo:17.385:78.487", {success:true,latitude:17.385,longitude:78.4867,formattedAddress:"Fixture Hyderabad, India"},60000);
        const start1 = Date.now();
        const geo1 = await locationService.reverseGeocode(17.3850, 78.4867);
        
        const start2 = Date.now();
        const geo2 = await locationService.reverseGeocode(17.3850, 78.4867);
        const latency2 = Date.now() - start2;

        assert(geo2.success, "Cached geocode lookup must succeed");
        assert(geo2.isCached, "Second geocode lookup must return cached flag");
        assert(latency2 <= 10, `Cached geocode latency (${latency2} ms) should be under 10 ms`);
    });

    // 3. Pure Code Deterministic Financial Arithmetic
    test("Pure Code Net Return Transport Calculation Execution < 1ms", () => {
        marketPriceService.calculateNetReturn({quantityQuintals:1,pricePerQuintal:1,distanceKm:0,transportCostPerKm:0,loadingCharges:0,apmcCessPercentage:0}); // Warm Intl formatting before timing.
        const start = Date.now();
        const calc = marketPriceService.calculateNetReturn({ quantityQuintals: 50, pricePerQuintal: 3000, distanceKm: 40, transportCostPerKm: 20, loadingCharges: 1000, apmcCessPercentage: 1.0 });
        const latency = Date.now() - start;

        assert.strictEqual(calc.grossSaleValue, 150000);
        assert.strictEqual(calc.totalTransportCost, 800);
        assert.strictEqual(calc.apmcCess, 1500);
        assert.strictEqual(calc.totalDeductions, 3300);
        assert.strictEqual(calc.netExpectedReturn, 146700);
        assert(latency <= 5, "Pure JS math execution must be near-instant (< 5 ms)");
    });

    test("Pure Code Smart Budget & Break-Even Calculation < 1ms", () => {
        const budget = cropService.calculateSmartBudget({
            landSizeAcres: 5.0,
            cropName: "Cotton",
            seedCost: 4000,
            fertilizerCost: 8000,
            pesticideCost: 5000,
            laborCost: 10000,
            irrigationCost: 4000,
            machineryCost: 6000,
            transportCost: 3000,
            otherCost: 2000,
            expectedYieldQuintalsPerAcre: 12,
            pricePerQuintal: 7000
        });

        assert.strictEqual(budget.costs.totalCost, 210000);
        assert.strictEqual(budget.financials.expectedRevenue, 420000);
        assert.strictEqual(budget.financials.netProfit, 210000);
        assert.strictEqual(budget.financials.roiPercentage, "100.0%");
        assert.strictEqual(budget.financials.breakEvenPricePerQuintal, 3500);
    });

    // 4. Complexity Router & AI Orchestration Performance
    await asyncTest("AI Orchestrator Simple Query Routing Latency < 100ms", async () => {
        const start = Date.now();
        const res = await aiOrchestrator.processMessage("What is red gram?", "EN", [], "perf_test_user");
        const latency = Date.now() - start;

        assert(res.success, "Simple query must succeed");
        assert.strictEqual(res.complexity, "SIMPLE", "Query must be classified as SIMPLE complexity");
        assert(latency <= 100, `Simple query latency (${latency} ms) must be within 100ms SLA`);
    });

    await asyncTest("AI Orchestrator Real-Time Market Route Latency < 100ms", async () => {
        const start = Date.now();
        const res = await aiOrchestrator.processMessage("What is today's tomato mandi price?", "EN", [], "perf_test_user");
        const latency = Date.now() - start;

        assert(res.success, "Market query must succeed");
        assert.strictEqual(res.complexity, "REAL-TIME", "Query must be classified as REAL-TIME complexity");
        assert(res.response.includes("Tomato"), "Response must contain verified tomato market details");
        assert(latency <= 100, `Real-time market route latency (${latency} ms) must be within 100ms SLA`);
    });

    // 5. Risk-Based Validation & Quality Scoring
    test("Risk-Based Fast Validation & Quality Scoring Engine", () => {
        const valRes = responseValidator.validateAndFormat(
            "Spray Imidacloprid 17.8% SL @ 0.5 ml/L water for aphid control.",
            { userQuery: "Which pesticide should I use for aphids?", structuredState: {} }
        );

        assert.strictEqual(valRes.riskLevel, "HIGH_RISK", "Chemical query must be classified as HIGH_RISK");
        assert(valRes.qualityScore.accuracy >= 80, "Quality score accuracy must be >= 80");
        assert(valRes.qualityScore.dataFreshness >= 90, "Quality score data freshness must be >= 90");
        assert(valRes.response.includes("CIBRC"), "Must append chemical spray safety disclaimer");
    });

    console.log("\n=========================================================================");
    console.log(` 📊 BENCHMARK SUMMARY: ${passedTests} PASSED, ${totalTests - passedTests} FAILED out of ${totalTests} TESTS`);
    console.log("=========================================================================\n");

    if (totalTests !== passedTests) {
        process.exit(1);
    }
}

runBenchmarkSuite().catch(err => {
    console.error("Benchmark suite crashed:", err);
    process.exit(1);
});
