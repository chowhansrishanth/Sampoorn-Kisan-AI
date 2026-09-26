/**
 * Benchmark Management REST API Routes
 * Exposes endpoints for triggering benchmark runs, inspecting metrics, 
 * viewing failure reports, and updating human review queue items.
 */

const express = require("express");
const router = express.Router();
router.use(require('../middleware/authMiddleware').requireAuth, require('../middleware/adminMiddleware').requireAdmin);
const path = require("path");
const fs = require("fs");
const evaluator = require("../services/benchmarkEvaluator");

const DATASET_DIR = path.join(__dirname, "../data/benchmark");

// GET /api/benchmark/status
router.get("/status", (req, res) => {
    const reportPath = path.join(DATASET_DIR, "benchmark-report.json");
    let lastRun = evaluator.lastRunResult;
    if (!lastRun && fs.existsSync(reportPath)) {
        try {
            lastRun = JSON.parse(fs.readFileSync(reportPath, "utf8"));
        } catch (e) {}
    }

    res.json({
        activeRun: evaluator.activeRun,
        lastRunResult: lastRun
    });
});

// POST /api/benchmark/run
router.post("/run", async (req, res) => {
    try {
        const { splitName = "golden_test", limit = 100 } = req.body || {};
        if (!['train','validation','test','golden_test'].includes(splitName) || !Number.isInteger(limit) || limit < 1 || limit > 1000) return res.status(400).json({ error: 'Invalid benchmark split or limit.' });
        if (evaluator.activeRun) {
            return res.status(409).json({ error: "Evaluation already running." });
        }

        // Run evaluation asynchronously or return job started
        evaluator.runEvaluation(splitName, limit)
            .then(summary => console.log("[BenchmarkAPI] Evaluation finished:", summary.runId))
            .catch(err => console.error("[BenchmarkAPI] Evaluation failed:", err));

        res.json({
            message: "Benchmark evaluation run initiated successfully.",
            splitName,
            limit
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// GET /api/benchmark/results
router.get("/results", (req, res) => {
    const reportPath = path.join(DATASET_DIR, "benchmark-report.json");
    if (!fs.existsSync(reportPath)) {
        return res.status(404).json({ error: "No benchmark report found. Run evaluation first." });
    }
    const report = JSON.parse(fs.readFileSync(reportPath, "utf8"));
    res.json(report);
});

// GET /api/benchmark/failures
router.get("/failures", (req, res) => {
    const queuePath = path.join(DATASET_DIR, "review_queue.json");
    if (!fs.existsSync(queuePath)) {
        return res.json([]);
    }
    const failures = JSON.parse(fs.readFileSync(queuePath, "utf8"));
    res.json(failures);
});

// GET /api/benchmark/review
router.get("/review", (req, res) => {
    const queuePath = path.join(DATASET_DIR, "review_queue.json");
    if (!fs.existsSync(queuePath)) {
        return res.json([]);
    }
    const reviewItems = JSON.parse(fs.readFileSync(queuePath, "utf8"));
    res.json(reviewItems);
});

// POST /api/benchmark/review/action
router.post("/review/action", (req, res) => {
    const { id, action, note } = req.body || {};
    const queuePath = path.join(DATASET_DIR, "review_queue.json");
    if (!fs.existsSync(queuePath)) {
        return res.status(404).json({ error: "Review queue empty." });
    }

    let reviewItems = JSON.parse(fs.readFileSync(queuePath, "utf8"));
    reviewItems = reviewItems.filter(item => item.id !== id);
    fs.writeFileSync(queuePath, JSON.stringify(reviewItems, null, 2), "utf8");

    res.json({ message: `Review item ${id} ${action}ed successfully.` });
});

module.exports = router;
