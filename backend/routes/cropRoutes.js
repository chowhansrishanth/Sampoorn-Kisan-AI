const express = require("express");
const router = express.Router();
const {
    getCropRecommendation,
    getYieldPrediction,
    getFertilizerRecommendation
} = require("../controllers/cropController");

const recommendHandler = getCropRecommendation;

router.post("/recommend", recommendHandler);
router.post("/yield", getYieldPrediction);
router.post("/fertilizer", getFertilizerRecommendation);

module.exports = router;