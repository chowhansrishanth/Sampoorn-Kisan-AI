/**
 * ============================================================================
 * SAHAYAK AI LIVE GEMINI SMOKE TEST (`backend/tests/smoke_live_gemini.js`)
 * ============================================================================
 * Exercises the end-to-end path used by the React frontend:
 * 1. Authenticates through auth middleware
 * 2. Sends real agricultural queries to POST /api/ai/chat
 * 3. Verifies live Gemini API generation (isLiveAi: true, modelUsed: gemini-*)
 * 4. Verifies Multilingual Telugu response generation
 * 5. Verifies graceful fallback resilience when LLM is unavailable
 * ============================================================================
 */

const assert = require("assert");
const path = require("path");
const http = require("http");
const jwt = require("jsonwebtoken");

// Ensure environment is loaded from backend/.env
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const app = require("../server");
const aiProvider = require("../services/aiProvider");
const { JWT_SECRET } = require("../config/security");

async function runSmokeTest() {
    console.log("=================================================");
    console.log("🌾 SAHAYAK AI LIVE GEMINI END-TO-END SMOKE TEST");
    console.log("=================================================");

    const server = await new Promise(resolve => {
        const s = app.listen(0, "127.0.0.1", () => resolve(s));
    });
    const port = server.address().port;
    const baseUrl = `http://127.0.0.1:${port}`;

    // Register a valid test user through the API
    const regEmail = `farmer_${Date.now()}@kisan.ai`;
    const regPassword = "SecurePassword123!";
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            name: "Smoke Test Farmer",
            email: regEmail,
            phone: `99${Date.now().toString().slice(-8)}`,
            password: regPassword,
            confirmPassword: regPassword
        })
    });
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            identifier: regEmail,
            password: regPassword
        })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    assert(token, `Failed to obtain token from login: ${JSON.stringify(loginData)}`);

    let passed = 0;
    let failed = 0;

    async function testStep(name, fn) {
        const t0 = Date.now();
        try {
            await fn();
            console.log(`  ✅ PASS: ${name} (${Date.now() - t0}ms)`);
            passed++;
        } catch (err) {
            console.error(`  ❌ FAIL: ${name} (${Date.now() - t0}ms)`);
            console.error(`     Error: ${err.message}`);
            failed++;
        }
    }

    try {
        // ── 1. Live Agronomic Question via Frontend Route ──────────────────────
        await testStep("1. End-to-End Chat via POST /api/ai/chat with live Gemini", async () => {
            const res = await fetch(`${baseUrl}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: "What is the best sowing time and NPK fertilizer dosage for Maize in Telangana?",
                    language: "EN",
                    sessionId: "smoke_session_1"
                })
            });

            assert.strictEqual(res.status, 200, `Expected HTTP 200, got ${res.status}`);
            const data = await res.json();
            assert.strictEqual(data.success, true, "Expected success: true");
            assert(data.response && data.response.length > 50, "Expected non-empty advisory response");
            assert(data.modelUsed.includes("gemini") || data.isLiveAi === true, `Expected live Gemini model, got ${data.modelUsed}`);
            assert.strictEqual(data.isLiveAi, true, "Expected isLiveAi to be true");
            console.log(`     [Model: ${data.modelUsed} | Latency: ${data.latencyMs}ms | Agent: ${data.agent}]`);
            console.log(`     [Snippet]: ${data.response.substring(0, 90).replace(/\n/g, ' ')}...`);
        });

        // ── 2. Multilingual Live Telugu Generation ─────────────────────────────
        await testStep("2. Multilingual Telugu query generation via live Gemini", async () => {
            const res = await fetch(`${baseUrl}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: "టమాటా పంటలో ఆకులపై మచ్చలు వస్తే ఏ మందు వాడాలి?",
                    language: "TE",
                    sessionId: "smoke_session_telugu"
                })
            });

            assert.strictEqual(res.status, 200, `Expected HTTP 200, got ${res.status}`);
            const data = await res.json();
            assert.strictEqual(data.success, true, "Expected success: true");
            assert(data.response.length > 30, "Expected non-empty Telugu response");
            // Check for Telugu Unicode characters (U+0C00 - U+0C7F)
            const hasTelugu = /[\u0C00-\u0C7F]/.test(data.response);
            assert.strictEqual(hasTelugu, true, "Response should be in fluent Telugu script");
            assert.strictEqual(data.isLiveAi, true, "Expected live AI generation for Telugu query");
            console.log(`     [Telugu Snippet]: ${data.response.substring(0, 80).replace(/\n/g, ' ')}...`);
        });

        // ── 3. Session Context Memory Isolation Across Distinct Users ───────────
        await testStep("3. Session memory retains context across turns", async () => {
            // Turn 1: State farmer context
            await fetch(`${baseUrl}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: "I am growing Cotton on 5 acres black soil in Warangal.",
                    sessionId: "smoke_memory_session"
                })
            });

            // Turn 2: Ask follow-up question relying on memory
            const resTurn2 = await fetch(`${baseUrl}/api/ai/chat`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`
                },
                body: JSON.stringify({
                    message: "What pest should I watch out for in my crop?",
                    sessionId: "smoke_memory_session"
                })
            });

            const data2 = await resTurn2.json();
            assert.strictEqual(data2.success, true);
            // Verify bollworm / sucking pests relevant to cotton were addressed
            const isCottonRelevant = /cotton|bollworm|sucking|whitefly|aphid|పత్తి|గులాబీ/i.test(data2.response);
            assert.strictEqual(isCottonRelevant, true, "Follow-up response should contextualize Cotton from Turn 1");
        });

        // ── 4. Fallback Resilience Simulation ──────────────────────────────────
        await testStep("4. Graceful fallback when external LLM is offline", async () => {
            // Temporarily simulate absent API key
            const origKey = aiProvider.hasValidApiKey;
            aiProvider.hasValidApiKey = false;

            try {
                const res = await fetch(`${baseUrl}/api/ai/chat`, {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({
                        message: "What is the recommended fertilizer for paddy?",
                        sessionId: "smoke_fallback_session"
                    })
                });

                assert.strictEqual(res.status, 200);
                const data = await res.json();
                assert.strictEqual(data.success, true, "Fallback must return success: true");
                assert.strictEqual(data.isLiveAi, false, "Fallback must be marked isLiveAi: false");
                assert(data.modelUsed.includes("Fallback"), `Expected Fallback model, got ${data.modelUsed}`);
                assert(data.response.length > 30, "Fallback must return non-empty verified advice");
                console.log(`     [Fallback Model: ${data.modelUsed}]`);
            } finally {
                aiProvider.hasValidApiKey = origKey;
            }
        });

        // ── 5. Unauthenticated Request Rejection ───────────────────────────────
        await testStep("5. Unauthorized request rejects with HTTP 401", async () => {
            const res = await fetch(`${baseUrl}/api/ai/chat`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: "Hello" })
            });
            assert.strictEqual(res.status, 401, "Unauthenticated request must be rejected");
        });

    } finally {
        server.closeAllConnections();
        await new Promise(r => server.close(r));
    }

    console.log("=================================================");
    console.log(`🎯 SMOKE TEST COMPLETED: ${passed} PASSED, ${failed} FAILED`);
    console.log("=================================================");

    if (failed > 0) {
        process.exit(1);
    }
    process.exit(0);
}

if (require.main === module) {
    runSmokeTest().catch(err => {
        console.error("Smoke test unexpected error:", err);
        process.exit(1);
    });
}

module.exports = runSmokeTest;
