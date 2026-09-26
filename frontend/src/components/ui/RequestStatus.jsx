import { AlertTriangle, Loader2 } from 'lucide-react';
export default function RequestStatus({ loading, error, onRetry }) {
  if(error) return <div className="request-status is-error" role="alert"><AlertTriangle size={20}/><p>{error}</p>{onRetry && <button type="button" onClick={onRetry} disabled={loading}>Try again</button>}</div>;
  if(loading) return <div className="request-status" role="status" aria-live="polite"><Loader2 size={18} className="spin"/><p>Loading current information…</p></div>;
  return null;
}
