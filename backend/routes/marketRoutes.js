const express = require("express");
const router = express.Router();
const { getWeatherForecast, getMandiPrices } = require("../controllers/marketWeatherController");

router.get("/weather", getWeatherForecast);
router.get("/mandi", getMandiPrices);

module.exports = router;
