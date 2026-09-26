const express = require("express");
const router = express.Router();
const { getFLStatus, triggerFLRound } = require("../controllers/flController");

router.get("/status", getFLStatus);
router.post("/trigger", triggerFLRound);

module.exports = router;
