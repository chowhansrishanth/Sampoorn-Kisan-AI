import { useMemo, useSyncExternalStore } from 'react';
import api, { getApiErrorMessage } from '../api/client';

// A component-owned request store: parameters identify the result, stale requests
// are cancelled on unsubscribe, and subscribers share one in-flight operation.
function createResource(request) {
  let snapshot = { data: null, loading: Boolean(request), error: null };
  let controller = null;
  const listeners = new Set();
  const publish = value => { snapshot = value; listeners.forEach(listener => listener()); };
  const reload = async (retryCount = 0) => {
    controller?.abort();
    if (!request) return;
    const active = new AbortController();
    controller = active;
    publish({ ...snapshot, loading: true, error: null });
    try {
      const responses = await Promise.all((Array.isArray(request) ? request : [request]).map(config => api({ ...config, signal: active.signal })));
      if (!active.signal.aborted) publish({ data: Array.isArray(request) ? responses.map(r => r.data) : responses[0].data, loading: false, error: null });
    } catch (error) {
      if (!active.signal.aborted) {
        const isTransient = error.code === 'ERR_NETWORK' || error.response?.status === 503 || error.message?.includes('Network Error');
        if (retryCount < 2 && isTransient) {
          setTimeout(() => {
            if (!active.signal.aborted) reload(retryCount + 1);
          }, 1500);
          return;
        }
        publish({ data: null, loading: false, error: getApiErrorMessage(error) });
      }
    } finally { if (controller === active) controller = null; }
  };
  return {
    getSnapshot: () => snapshot,
    subscribe(listener) {
      listeners.add(listener);
      if (listeners.size === 1 && !controller && snapshot.data === null && !snapshot.error) reload();
      return () => { listeners.delete(listener); if (!listeners.size) { controller?.abort(); controller = null; } };
    },
    reload,
  };
}
export default function useApiResource(request) {
  const key = JSON.stringify(request);
  const resource = useMemo(() => createResource(JSON.parse(key)), [key]);
  const snapshot = useSyncExternalStore(resource.subscribe, resource.getSnapshot, resource.getSnapshot);
  return { ...snapshot, reload: resource.reload };
}
