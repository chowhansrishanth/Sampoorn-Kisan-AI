
/**
 * Universal Premium Card Container
 */
export default function PremiumCard({
  children,
  className = '',
  style = {},
  hoverable = false,
  padding = '24px',
  accentBorder = false,
  ...props
}) {
  const cardStyle = {
    background: 'var(--surface)' ,
    border: '1px solid transparent',
    borderTop: accentBorder ? '3px solid #15803d' : '1px solid var(--fk-border, #e2e8f0)',
    borderRadius: '16px',
    padding,
    boxShadow: 'var(--fk-shadow, 0 4px 6px -1px rgba(0,0,0,0.04))',
    transition: 'transform 0.18s ease, box-shadow 0.18s ease',
    ...style
  };

  return (
    <div
      className={`premium-card ${hoverable ? 'hover-elevate' : ''} ${className}`}
      style={cardStyle}
      {...props}
    >
      {children}
    </div>
  );
}
