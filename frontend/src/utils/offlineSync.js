import { useState, useEffect, useCallback } from "react";

const DB_NAME = "sampoorn_offline_db";
const DB_VERSION = 1;
const STORE_NAME = "offline_sync_queue";
function currentOwner() {
  try { const user = JSON.parse(localStorage.getItem('sampoorn_user_session') || '{}').user; return user?.id || user?._id || null; }
  catch { return null; }
}

// Open or initialize IndexedDB
function openDB() {
  return new Promise((resolve, reject) => {
    if (typeof window === "undefined" || !window.indexedDB) {
      return reject(new Error("IndexedDB not supported"));
    }
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = (e) => {
      const db = e.target.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id", autoIncrement: true });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// Enqueue an action when offline
export async function enqueueOfflineAction(actionType, payload) {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, "readwrite");
      const store = tx.objectStore(STORE_NAME);
      const item = {
        actionType,
        ownerId: currentOwner(),
        payload,
        queuedAt: new Date().toISOString(),
        synced: false
      };
      const req = store.add(item);
      req.onsuccess = () => {
        window.dispatchEvent(new CustomEvent("sampoorn_queue_updated"));
        resolve(req.result);
      };
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn("Failed to enqueue offline action in IndexedDB:", err);
    // Graceful fallback to localStorage
    try {
      const fallbackQueue = JSON.parse(localStorage.getItem("sampoorn_offline_fallback") || "[]");
      fallbackQueue.push({ actionType, ownerId: currentOwner(), payload, queuedAt: new Date().toISOString() });
      localStorage.setItem("sampoorn_offline_fallback", JSON.stringify(fallbackQueue));
      window.dispatchEvent(new CustomEvent("sampoorn_queue_updated"));
    } catch {
      // ignore
    }
  }
}

// Retrieve pending queue count
export async function getPendingOfflineCount() {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, "readonly");
      const store = tx.objectStore(STORE_NAME);
      const countReq = store.count();
      countReq.onsuccess = () => resolve(countReq.result);
      countReq.onerror = () => resolve(0);
    });
  } catch {
    try {
      const fallbackQueue = JSON.parse(localStorage.getItem("sampoorn_offline_fallback") || "[]");
      return fallbackQueue.length;
    } catch {
      return 0;
    }
  }
}

// Process and flush offline queue with backend API
let activeSync;
export function syncOfflineQueue(apiClient) {
  if (activeSync) return activeSync;
  activeSync = replayQueue(apiClient).finally(() => { activeSync = null; });
  return activeSync;
}
async function replayQueue(apiClient) {
  const ownerId = currentOwner();
  if (!apiClient || !ownerId || !navigator.onLine) return { synced: 0, remaining: await getPendingOfflineCount() };
  let processed = 0;
  const replay = async item => {
    if (item.ownerId !== ownerId || item.actionType !== 'LEDGER_TRANSACTION') return false;
    const response = await apiClient.post('/api/ledger/' + encodeURIComponent(ownerId), item.payload);
    return response.data?.success === true;
  };
  let db;
  try {
    db = await openDB();
    const items = await new Promise((resolve, reject) => {
      const req = db.transaction(STORE_NAME, 'readonly').objectStore(STORE_NAME).getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
    for (const item of items) {
      try {
        if (!await replay(item)) continue;
        await new Promise((resolve, reject) => {
          const tx = db.transaction(STORE_NAME, 'readwrite');
          tx.objectStore(STORE_NAME).delete(item.id);
          tx.oncomplete = resolve;
          tx.onerror = () => reject(tx.error);
        });
        processed++;
      } catch { break; } // Keep the failed item and all remaining work for retry.
    }
  } catch { /* IndexedDB may be disabled; retain its contents and process fallback below. */ }
  finally { db?.close(); }
  try {
    const queue = JSON.parse(localStorage.getItem('sampoorn_offline_fallback') || '[]');
    for (const item of [...queue]) {
      try {
        if (!await replay(item)) continue;
        queue.splice(queue.indexOf(item), 1);
        localStorage.setItem('sampoorn_offline_fallback', JSON.stringify(queue));
        processed++;
      } catch { break; }
    }
  } catch { /* Preserve malformed or inaccessible storage for recovery. */ }
  window.dispatchEvent(new CustomEvent('sampoorn_queue_updated'));
  return { synced: processed, remaining: await getPendingOfflineCount() };
}

export function useNetworkStatus(apiClient) {
  const [isOnline, setIsOnline] = useState(() => (typeof navigator !== "undefined" ? navigator.onLine : true));
  const [pendingCount, setPendingCount] = useState(0);

  const refreshCount = useCallback(async () => {
    const count = await getPendingOfflineCount();
    setPendingCount(count);
  }, []);

  const triggerSync = useCallback(async () => {
    if (navigator.onLine) {
      await syncOfflineQueue(apiClient);
      await refreshCount();
    }
  }, [apiClient, refreshCount]);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      triggerSync();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    const handleQueueUpdate = () => {
      refreshCount();
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    window.addEventListener("sampoorn_queue_updated", handleQueueUpdate);

    getPendingOfflineCount().then(setPendingCount);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      window.removeEventListener("sampoorn_queue_updated", handleQueueUpdate);
    };
  }, [triggerSync, refreshCount]);

  return {
    isOnline,
    pendingCount,
    triggerSync
  };
}
