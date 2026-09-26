import { useState, useEffect, useCallback } from "react";
import axios from "../api/client";
import { getFirebaseMessaging, getToken, onMessage, firebaseConfig } from "../config/firebase";

const STORAGE_KEY = "sk_fcm_token";

/**
 * Custom React Hook for Managing Firebase Push Notifications (with Stub & Live Fallback)
 * @param {object} user - Current authenticated user
 * @param {function} onUpdateUser - Optional callback to update parent user state
 */
export default function usePushNotifications(user, onUpdateUser) {
  const isSupported = typeof window !== 'undefined' && 'Notification' in window && 'serviceWorker' in navigator;
  const [permission, setPermission] = useState(() => isSupported ? Notification.permission : 'default');
  const [localToken, setFcmToken] = useState(undefined);
  const fcmToken = localToken === undefined ? user?.fcmToken || null : localToken;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [lastNotification, setLastNotification] = useState(null);

  // Foreground message listener
  useEffect(() => {
    let unsubscribe = null;
    let isMounted = true;

    async function initListener() {
      try {
        const messaging = await getFirebaseMessaging();
        if (messaging && isMounted) {
          unsubscribe = onMessage(messaging, (payload) => {
            console.log("🔔 [FCM Foreground Notification Received]:", payload);
            const notif = {
              title: payload.notification?.title || payload.data?.title || "Sampoorn Kisan Alert 🌾",
              body: payload.notification?.body || payload.data?.body || "New farm advisory received.",
              timestamp: new Date().toISOString(),
              data: payload.data,
            };
            setLastNotification(notif);

            // Also show browser notification if tab is open
            if (Notification.permission === "granted") {
              try {
                new Notification(notif.title, {
                  body: notif.body,
                  icon: "/favicon.svg",
                });
              } catch { /* Notification display may be denied by the browser. */ }
            }
          });
        }
      } catch (err) {
        console.warn("FCM onMessage listener setup warning:", err.message);
      }
    }

    initListener();
    return () => {
      isMounted = false;
      if (typeof unsubscribe === "function") unsubscribe();
    };
  }, []);

  /**
   * Subscribe to Push Notifications
   */
  const subscribe = useCallback(async () => {
    if (!isSupported) {
      setError("Push notifications are not supported on this browser or platform.");
      return null;
    }

    setLoading(true);
    setError(null);

    try {
      // 1. Request browser notification permission
      const perm = await Notification.requestPermission();
      setPermission(perm);

      if (perm !== "granted") {
        throw new Error(
          perm === "denied"
            ? "Notification permission was blocked in browser settings. Please allow notifications in site settings."
            : "Notification permission was dismissed."
        );
      }

      let generatedToken = null;

      // 2. Try retrieving actual FCM Token via Firebase Messaging if VAPID key is configured
      try {
        const messaging = await getFirebaseMessaging();
        if (messaging) {
          const swRegistration = await navigator.serviceWorker.ready.catch(() => null);
          const options = {};
          if (firebaseConfig.vapidKey) options.vapidKey = firebaseConfig.vapidKey;
          if (swRegistration) options.serviceWorkerRegistration = swRegistration;

          // Attempt FCM retrieval
          const token = await getToken(messaging, options);
          if (token) generatedToken = token;
        }
      } catch (fcmErr) {
        console.warn("⚠️ FCM live token retrieval bypassed; notification setup failed:", fcmErr.message);
      }

      if (!generatedToken) throw new Error('Push notifications are unavailable. Check the Firebase and VAPID configuration.');

      // 4. Update backend profile with new FCM token
      try {
        const res = await axios.put("/api/auth/update-profile", { fcmToken: generatedToken });
        if (res.data?.user && typeof onUpdateUser === "function") {
          onUpdateUser(res.data.user);
        }
      } catch (apiErr) {
        throw new Error("Could not save notification preferences: " + apiErr.message, { cause: apiErr });
      }

      // 5. Persist locally
      localStorage.setItem(STORAGE_KEY, generatedToken);
      setFcmToken(generatedToken);

      // 6. Provide immediate visual feedback to the farmer
      try {
        new Notification("🌾 Notifications Active!", {
          body: "You will now receive instant weather alerts, pest advisories, and Mandi price signals.",
          icon: "/favicon.svg",
        });
      } catch { /* Notification display may be denied by the browser. */ }

      return generatedToken;
    } catch (err) {
      console.error("Failed to subscribe to push notifications:", err);
      setError(err.message || "Failed to subscribe to push notifications");
      return null;
    } finally {
      setLoading(false);
    }
  }, [isSupported, onUpdateUser]);

  /**
   * Unsubscribe from Push Notifications
   */
  const unsubscribe = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Clear from backend profile
      try {
        const res = await axios.put("/api/auth/update-profile", { fcmToken: null });
        if (res.data?.user && typeof onUpdateUser === "function") {
          onUpdateUser(res.data.user);
        }
      } catch (apiErr) {
        throw new Error("Could not save notification preferences: " + apiErr.message, { cause: apiErr });
      }

      // Clear local storage & state
      localStorage.removeItem(STORAGE_KEY);
      setFcmToken(null);
      return true;
    } catch (err) {
      console.error("Failed to unsubscribe from push notifications:", err);
      setError(err.message || "Failed to unsubscribe");
      return false;
    } finally {
      setLoading(false);
    }
  }, [onUpdateUser]);

  /**
   * Dispatch a Test Push Notification
   */
  const sendTestNotification = useCallback(
    async (title = "🌾 Sampoorn Kisan AI Radar Alert", body = "Optimal soil moisture window detected. Rain chance 10% today.") => {
      setLoading(true);
      setError(null);
      try {
        const tokenToSend = fcmToken;

        // Dispatch through backend API
        if (!tokenToSend) throw new Error("Subscribe to notifications first.");
        const response = await axios.post("/api/alerts/send-test-push", {
          fcmToken: tokenToSend,
          title,
          body,
        });

        // Trigger local browser notification as immediate proof-of-concept
        if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
          try {
            new Notification(title, {
              body,
              icon: "/favicon.svg",
            });
          } catch { /* Notification display may be denied by the browser. */ }
        }

        setLastNotification({
          title,
          body,
          timestamp: new Date().toISOString(),
          mode: response.data?.result?.mode || "stub",
        });

        return response.data;
      } catch (err) {
        console.error("Send test push error:", err);
        setError(err.response?.data?.error || err.message || "Failed to dispatch test notification");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [fcmToken]
  );

  return {
    isSupported,
    permission,
    fcmToken,
    isSubscribed: Boolean(fcmToken),
    loading,
    error,
    subscribe,
    unsubscribe,
    sendTestNotification,
    lastNotification,
  };
}
