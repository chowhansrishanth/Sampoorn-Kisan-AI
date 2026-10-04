import { Loader2 } from 'lucide-react';

/**
 * Universal Premium Button Component
 * Supports variants: primary, secondary, ghost, danger, outline, gold
 * Supports sizes: sm, md, lg
 */
export default function PremiumButton({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  icon: Icon,
  className = '',
  onClick,
  type = 'button',
  style = {},
  ...props
}) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'primary':
        return {
          background: 'var(--primary)' ,
          color: '#ffffff',
          border: '1px solid var(--primary)' ,
          boxShadow: 'none'
        };
      case 'secondary':
        return {
          background: 'var(--fk-card, #ffffff)',
          color: 'var(--fk-text, #0f172a)',
          border: '1px solid var(--fk-border, #e2e8f0)',
          boxShadow: '0 1px 3px rgba(0, 0, 0, 0.05)'
        };
      case 'outline':
        return {
          background: 'transparent',
          color: 'var(--primary, #10b981)',
          border: '1.5px solid var(--primary, #10b981)'
        };
      case 'gold':
        return {
          background: 'var(--warning)' ,
          color: '#ffffff',
          border: '1px solid #b45309',
          boxShadow: '0 2px 6px rgba(245, 158, 11, 0.3)'
        };
      case 'ghost':
        return {
          background: 'transparent',
          color: 'var(--fk-text-sub, #475569)',
          border: '1px solid transparent'
        };
      case 'danger':
        return {
          background: '#dc2626',
          color: '#ffffff',
          border: '1px solid #b91c1c',
          boxShadow: '0 2px 6px rgba(220, 38, 38, 0.25)'
        };
      default:
        return {};
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return { padding: '6px 14px', fontSize: '14px', borderRadius: '7px', gap: '6px', minHeight: '34px' };
      case 'lg':
        return { padding: '12px 24px', fontSize: '17px', borderRadius: '10px', gap: '10px', minHeight: '48px' };
      case 'md':
      default:
        return { padding: '9px 18px', fontSize: '15px', borderRadius: '8px', gap: '8px', minHeight: '40px' };
    }
  };

  const baseStyles = {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 700,
    fontFamily: 'Inter, sans-serif',
    cursor: disabled || loading ? 'not-allowed' : 'pointer',
    opacity: disabled ? 0.55 : 1,
    transition: 'all var(--motion-fast, 140ms) var(--ease-smooth, ease-in-out)',
    outline: 'none',
    userSelect: 'none',
    whiteSpace: 'nowrap',
    ...getVariantStyles(),
    ...getSizeStyles(),
    ...style
  };

  return (
    <button
      type={type}
      style={baseStyles}
      disabled={disabled || loading}
      onClick={onClick}
      className={`premium-btn ${className}`}
      {...props}
    >
      {loading ? (
        <>
          <Loader2 className="spin-icon" size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />
          <span>Processing...</span>
        </>
      ) : (
        <>
          {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 18 : 16} />}
          <span>{children}</span>
        </>
      )}
    </button>
  );
}
