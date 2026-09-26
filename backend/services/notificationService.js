'use strict';
/**
 * Firebase Cloud Messaging (FCM) Notification Service
 * Uses the Firebase Admin SDK. Missing credentials and rejected sends fail closed.
 */


const User = require('../models/User');


// In-memory log of dispatched notifications (useful for audits, dashboard telemetry & testing)
const notificationHistory = [];
const MAX_HISTORY = 100;

function recordDispatch(entry) {
  notificationHistory.unshift({
    id: entry.id || `fcm_log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: new Date().toISOString(),
    ...entry,
  });
  if (notificationHistory.length > MAX_HISTORY) {
    notificationHistory.pop();
  }
}

/**
 * Send a push notification to a specific FCM token
 * @param {string} fcmToken - Recipient FCM device token
 * @param {object} payload - { title, body, icon, data, click_action }
 * @returns {Promise<{success: boolean, mode: string, messageId?: string, error?: string}>}
 */
async function sendPushNotification(fcmToken, payload = {}) {
  if (typeof fcmToken !== 'string' || !fcmToken.trim() || fcmToken.length > 4096) return { success: false, error: 'Valid FCM device token is required' };
  if (!process.env.GOOGLE_APPLICATION_CREDENTIALS && process.env.FIREBASE_USE_ADC !== 'true') return { success: false, mode: 'unavailable', error: 'Push delivery is not configured.' };
  try {
    const { getApps, initializeApp, applicationDefault } = require('firebase-admin/app');
    const { getMessaging } = require('firebase-admin/messaging');
    const app = getApps().find(app => app.name === 'kisan-notifications') || initializeApp({ credential: applicationDefault(), projectId: process.env.FIREBASE_PROJECT_ID }, 'kisan-notifications');
    const messageId = await getMessaging(app).send({ token: fcmToken.trim(), notification: { title: String(payload.title || 'Sampoorn Kisan Alert'), body: String(payload.body || '') }, data: Object.fromEntries(Object.entries(payload.data || {}).map(([key,value]) => [key,String(value)])) });
    recordDispatch({ title: payload.title, mode: 'live', status: 'accepted', messageId });
    return { success: true, mode: 'live', messageId };
  } catch {
    return { success: false, mode: 'unavailable', error: 'Push delivery failed. Please retry later.' };
  }
}

/**
 * Helper to retrieve a user from either MongoDB or in-memory map
 */
async function findUserRecord(userId) {
  if (!userId) return null;
  try {
    const u = require('../config/db').isDbOperational() ? await User.findById(userId).maxTimeMS(3000) : null;
    if (u) return u;
  } catch {}

  // Fallback to in-memory store if available from auth controller
  try {
    const authCtrl = require('../controllers/authController');
    if (typeof authCtrl.getUserById === 'function') {
      return await authCtrl.getUserById(userId);
    }
  } catch {}

  return null;
}

/**
 * Send push notification to a specific user by userId
 * @param {string} userId - User ID
 * @param {object} payload - { title, body, icon, data, click_action }
 */
async function sendNotificationToUser(userId, payload) {
  const user = await findUserRecord(userId);
  if (!user) {
    return { success: false, error: `User with ID ${userId} not found` };
  }

  if (!user.fcmToken) {
    return {
      success: false,
      error: 'User does not have an active push subscription (missing fcmToken)',
      userId,
    };
  }

  return sendPushNotification(user.fcmToken, {
    ...payload,
    data: { ...payload.data, userId: String(userId) },
  });
}

/**
 * Broadcast an alert to multiple FCM tokens
 * @param {string[]} tokens - Array of FCM tokens
 * @param {object} payload - Notification payload
 */
async function sendBroadcastAlert(tokens = [], payload) {
  if (!Array.isArray(tokens) || tokens.length === 0) {
    return { success: true, count: 0, results: [] };
  }

  const results = await Promise.allSettled(tokens.map((token) => sendPushNotification(token, payload)));

  return {
    success: true,
    total: tokens.length,
    successful: results.filter((r) => r.status === 'fulfilled' && r.value?.success).length,
    results,
  };
}

/**
 * Retrieve recent notification history
 */
function getNotificationHistory(limit = 20) {
  return notificationHistory.slice(0, Math.min(limit, notificationHistory.length));
}

/**
 * Clear in-memory history
 */
function clearNotificationHistory() {
  notificationHistory.length = 0;
}

module.exports = {
  sendPushNotification,
  sendNotificationToUser,
  sendBroadcastAlert,
  getNotificationHistory,
  clearNotificationHistory,
};
