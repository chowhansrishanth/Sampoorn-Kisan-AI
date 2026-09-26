const express = require("express");
const router = express.Router();
router.use(require('../middleware/authMiddleware').requireAuth);
const { orchestrateAgents, handleAgentChat } = require("../controllers/agentController");

router.post("/orchestrate", orchestrateAgents);
router.post("/chat", handleAgentChat);

module.exports = router;
