'use strict';
const { generateAlerts, getAlerts, dismissAlert } = require('../services/alertService');
const { sendPushNotification, getNotificationHistory } = require('../services/notificationService');

// GET /api/alerts/:farmerId
exports.getfarmerAlerts = async (req, res) => {
  const { farmerId } = req.params;
  const weatherData = null; // alerts auto-refresh when dashboard loads with weather
  try {
    const alerts = generateAlerts(farmerId, weatherData);
    res.json({ success: true, count: alerts.length, alerts });
  } catch (err) {
    console.error('Alert generation error:', err.message);
    res.status(500).json({ success: false, error: 'Could not generate alerts' });
  }
};

// POST /api/alerts/:farmerId/refresh — regenerate with live weather payload
exports.refreshAlerts = (req, res) => {
  const { farmerId } = req.params;
  const { weatherData } = req.body || {};
  const alerts = generateAlerts(farmerId, weatherData || null);
  res.json({ success: true, count: alerts.length, alerts });
};

// POST /api/alerts/dismiss/:alertId
exports.dismissAlert = (req, res) => {
  const { alertId } = req.params;
  const farmerId = req.userId;
  if (!farmerId) return res.status(400).json({ success: false, error: 'farmerId required' });
  const dismissed = dismissAlert(farmerId, alertId);
  res.json({ success: dismissed, message: dismissed ? 'Alert dismissed' : 'Alert not found' });
};

// POST /api/alerts/send-test-push — triggers a test push notification to user's device
exports.sendTestPushNotification = async (req, res) => {
  try {
    const { title, body } = req.body || {};
    const token = req.user?.fcmToken;

    if (!token) {
      return res.status(400).json({
        success: false,
        error: 'FCM device token is required to dispatch push notification. Please enable push notifications first.',
      });
    }

    const payload = {
      title: title || '🌾 Sampoorn Kisan AI: Crop & Weather Alert',
      body: body || 'Weather radar update: Rain probability 15%. Optimal window for field irrigation today.',
      icon: '/favicon.svg',
      data: { type: 'test_alert', dispatchedAt: String(Date.now()) },
      click_action: '/dashboard',
    };

    const result = await sendPushNotification(token, payload);
    return res.status(result.success ? 200 : 503).json({
      success: result.success,
      message: result.success ? 'Push notification dispatched successfully!' : result.error,
      result,
    });
  } catch (err) {
    console.error('Push notification send error:', err.message);
    return res.status(500).json({ success: false, error: 'Failed to dispatch push notification', details: err.message });
  }
};

// GET /api/alerts/push-history — inspect dispatched notifications (stub or live)
exports.getPushHistory = (req, res) => {
  const history = getNotificationHistory(20);
  res.json({ success: true, count: history.length, history });
};

