'use strict';
const express = require('express');
const router = express.Router();
router.use(require('../middleware/authMiddleware').requireAuth);
router.param('farmerId', (req, res, next, farmerId) => {
  if (farmerId !== String(req.userId)) return res.status(403).json({ success: false, error: 'Access denied.' });
  next();
});
const {
  getfarmerAlerts,
  refreshAlerts,
  dismissAlert,
  sendTestPushNotification,
  getPushHistory,
} = require('../controllers/alertController');

// Push notification endpoints
router.post('/send-test-push', sendTestPushNotification);
router.get('/push-history', require('../middleware/adminMiddleware').requireAdmin, getPushHistory);

// Farmer alerts endpoints
router.get('/:farmerId', getfarmerAlerts);
router.post('/:farmerId/refresh', refreshAlerts);
router.post('/dismiss/:alertId', dismissAlert);

module.exports = router;

