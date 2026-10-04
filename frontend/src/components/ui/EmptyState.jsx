import { AlertTriangle, Inbox, RefreshCw, CheckCircle2 } from 'lucide-react';
import PremiumButton from './PremiumButton';

/**
 * Universal Empty State
 */
export function EmptyState({ 
  icon: Icon = Inbox, 
  title = 'No Data Found', 
  description = 'There are no items to display at this moment.', 
  actionText, 
  onAction,
  tip
}) {
  return (
    <div 
      style={{
        padding: '40px 24px',
        textAlign: 'center',
        background: 'var(--fk-card, #ffffff)',
        border: '1.5px dashed var(--fk-border, #cbd5e1)',
        borderRadius: '14px',
        margin: '20px 0',
        transition: 'all var(--motion-normal, 220ms) var(--ease-smooth, ease-in-out)'
      }}
      role="status"
      aria-label={title}
    >
      <div style={{
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        background: 'var(--primary-surface, rgba(16, 185, 129, 0.08))',
        color: 'var(--primary, #15803d)',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: '16px',
        border: '1px solid var(--primary-border, rgba(16, 185, 129, 0.2))'
      }}>
        <Icon size={28} />
      </div>
      <h3 style={{ fontSize: '19.5px', fontWeight: '800', color: 'var(--fk-text, #0f172a)', margin: '0 0 8px', fontFamily: 'Outfit, sans-serif' }}>
        {title}
      </h3>
      <p style={{ fontSize: '15px', color: 'var(--fk-text-sub, #64748b)', margin: '0 0 16px', maxWidth: '440px', marginLeft: 'auto', marginRight: 'auto', lineHeight: 1.5 }}>
        {description}
      </p>
      {tip && (
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 12px',
          borderRadius: '20px',
          background: 'var(--primary-surface)',
          color: 'var(--primary)',
          fontSize: '13px',
          fontWeight: 600,
          marginBottom: '20px'
        }}>
          <CheckCircle2 size={13} /> {tip}
        </div>
      )}
      {actionText && onAction && (
        <div>
          <PremiumButton variant="primary" size="md" onClick={onAction}>
            {actionText}
          </PremiumButton>
        </div>
      )}
    </div>
  );
}

/**
 * Universal Error State with Full Light/Dark Theme Contrast
 */
export function ErrorState({ 
  title = 'Unable to load data', 
  message = 'A network error occurred. Please check your connection and try again.', 
  onRetry 
}) {
  return (
    <div 
      style={{
        padding: '24px',
        background: 'rgba(239, 68, 68, 0.08)',
        border: '1px solid rgba(239, 68, 68, 0.28)',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'flex-start',
        gap: '16px',
        margin: '20px 0',
        transition: 'all var(--motion-normal, 220ms)'
      }}
      role="alert"
    >
      <div style={{
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'rgba(239, 68, 68, 0.15)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        color: '#ef4444'
      }}>
        <AlertTriangle size={22} />
      </div>
      <div style={{ flex: 1 }}>
        <h4 style={{ fontSize: '16px', fontWeight: '800', color: 'var(--fk-text, #0f172a)', margin: '0 0 4px', fontFamily: 'Outfit, sans-serif' }}>
          {title}
        </h4>
        <p style={{ fontSize: '14px', color: 'var(--fk-text-sub, #64748b)', margin: '0 0 14px', lineHeight: 1.5 }}>
          {message}
        </p>
        {onRetry && (
          <PremiumButton variant="danger" size="sm" icon={RefreshCw} onClick={onRetry}>
            Try Again
          </PremiumButton>
        )}
      </div>
    </div>
  );
}
export default EmptyState;
