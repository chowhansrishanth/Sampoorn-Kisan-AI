const express = require("express");
const router = express.Router();
const {
    getCropRecommendation,
    getYieldPrediction,
    getFertilizerRecommendation,
    compareCrops
} = require("../controllers/cropController");

const recommendHandler = getCropRecommendation;

router.post("/recommend", recommendHandler);
router.post("/yield", getYieldPrediction);
router.post("/fertilizer", getFertilizerRecommendation);
router.post("/compare", compareCrops);

module.exports = router;