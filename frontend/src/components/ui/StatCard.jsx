
/**
 * Universal Stat / KPI Card
 */
export function StatCard({ icon: Icon, title, value, unit, subtitle, trend, trendType = 'up', color = '#15803d' }) {
  return (
    <div style={{
      background: 'var(--fk-card, #ffffff)',
      border: '1px solid var(--fk-border, #e2e8f0)',
      borderRadius: '10px',
      padding: '16px 20px',
      display: 'flex',
      alignItems: 'center',
      gap: '16px',
      boxShadow: 'var(--fk-shadow, 0 2px 4px rgba(0,0,0,0.03))'
    }}>
      {Icon && (
        <div style={{
          width: '46px',
          height: '46px',
          borderRadius: '10px',
          background: `${color}15`,
          color: color,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0
        }}>
          <Icon size={22} />
        </div>
      )}
      <div style={{ flex: 1 }}>
        <p style={{ fontSize: '12px', fontWeight: '600', color: 'var(--fk-text-sub, #64748b)', margin: '0 0 4px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          {title}
        </p>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
          <span style={{ fontSize: '22px', fontWeight: '800', color: 'var(--fk-text, #0f172a)', fontFamily: 'Outfit, sans-serif' }}>
            {value}
          </span>
          {unit && <span style={{ fontSize: '13px', color: 'var(--fk-text-sub, #64748b)', fontWeight: '600' }}>{unit}</span>}
          {trend && (
            <span style={{
              fontSize: '11px',
              fontWeight: '700',
              padding: '2px 6px',
              borderRadius: '4px',
              marginLeft: 'auto',
              background: trendType === 'up' ? '#dcfce7' : '#fee2e2',
              color: trendType === 'up' ? '#166534' : '#991b1b'
            }}>
              {trend}
            </span>
          )}
        </div>
        {subtitle && <p style={{ fontSize: '12px', color: 'var(--fk-text-sub, #64748b)', margin: '2px 0 0' }}>{subtitle}</p>}
      </div>
    </div>
  );
}

/**
 * Universal Status Badge Pill
 */
export function StatusBadge({ status = 'success', children, icon: Icon }) {
  const getBadgeColors = () => {
    switch (status) {
      case 'success':
        return { bg: '#dcfce7', text: '#166534', border: '#bbf7d0' };
      case 'warning':
        return { bg: '#fef3c7', text: '#92400e', border: '#fde68a' };
      case 'danger':
      case 'error':
        return { bg: '#fee2e2', text: '#991b1b', border: '#fecaca' };
      case 'info':
      default:
        return { bg: '#dbeafe', text: '#1e40af', border: '#bfdbfe' };
    }
  };

  const colors = getBadgeColors();

  return (
    <span style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      padding: '3px 9px',
      borderRadius: '20px',
      fontSize: '12px',
      fontWeight: '700',
      background: colors.bg,
      color: colors.text,
      border: `1px solid ${colors.border}`
    }}>
      {Icon && <Icon size={12} />}
      {children}
    </span>
  );
}
