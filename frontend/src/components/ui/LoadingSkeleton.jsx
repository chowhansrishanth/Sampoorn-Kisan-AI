/**
 * Universal Skeleton Loader Components for Sampoorn Kisan AI
 * Provides realistic shimmer layouts that match production page geometries
 */
export default function LoadingSkeleton({ width = '100%', height = '20px', borderRadius = '6px', style = {} }) {
  return (
    <div
      style={{
        width,
        height,
        borderRadius,
        background: 'linear-gradient(90deg, var(--fk-border, #e2e8f0) 25%, var(--fk-card, #f8fafc) 50%, var(--fk-border, #e2e8f0) 75%)',
        backgroundSize: '200% 100%',
        animation: 'skeleton-shimmer 1.5s infinite ease-in-out',
        ...style
      }}
      aria-hidden="true"
    />
  );
}

export function CardSkeleton({ count = 1 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--fk-border, #e2e8f0)', background: 'var(--fk-card, #ffffff)' }}>
          <LoadingSkeleton height="16px" width="40%" style={{ marginBottom: '12px' }} />
          <LoadingSkeleton height="28px" width="70%" style={{ marginBottom: '16px' }} />
          <LoadingSkeleton height="14px" width="100%" style={{ marginBottom: '8px' }} />
          <LoadingSkeleton height="14px" width="85%" />
        </div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '20px' }}>
      {/* Header Skeleton */}
      <div style={{ marginBottom: '24px' }}>
        <LoadingSkeleton height="20px" width="220px" style={{ marginBottom: '10px' }} />
        <LoadingSkeleton height="36px" width="450px" style={{ marginBottom: '8px' }} />
        <LoadingSkeleton height="16px" width="600px" />
      </div>

      {/* Farm Location Strip Skeleton */}
      <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--fk-border, #e2e8f0)', background: 'var(--fk-card, #ffffff)', marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <LoadingSkeleton width="48px" height="48px" borderRadius="12px" />
            <div>
              <LoadingSkeleton width="140px" height="14px" style={{ marginBottom: '6px' }} />
              <LoadingSkeleton width="260px" height="22px" style={{ marginBottom: '4px' }} />
              <LoadingSkeleton width="200px" height="12px" />
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <LoadingSkeleton width="120px" height="38px" borderRadius="8px" />
            <LoadingSkeleton width="120px" height="38px" borderRadius="8px" />
          </div>
        </div>
      </div>

      {/* Telemetry Stat Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '24px' }}>
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} style={{ padding: '16px', borderRadius: '12px', border: '1px solid var(--fk-border, #e2e8f0)', background: 'var(--fk-card, #ffffff)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <LoadingSkeleton width="100px" height="14px" />
              <LoadingSkeleton width="32px" height="32px" borderRadius="8px" />
            </div>
            <LoadingSkeleton width="120px" height="28px" style={{ marginBottom: '8px' }} />
            <LoadingSkeleton width="80px" height="12px" />
          </div>
        ))}
      </div>

      {/* Weather & Mandi Grid Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: '20px', marginBottom: '24px' }}>
        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--fk-border, #e2e8f0)', background: 'var(--fk-card, #ffffff)' }}>
          <LoadingSkeleton width="160px" height="20px" style={{ marginBottom: '16px' }} />
          <LoadingSkeleton width="100%" height="90px" borderRadius="8px" style={{ marginBottom: '16px' }} />
          <LoadingSkeleton width="100%" height="45px" borderRadius="8px" />
        </div>
        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--fk-border, #e2e8f0)', background: 'var(--fk-card, #ffffff)' }}>
          <LoadingSkeleton width="180px" height="20px" style={{ marginBottom: '16px' }} />
          <LoadingSkeleton width="100%" height="60px" borderRadius="8px" style={{ marginBottom: '16px' }} />
          <LoadingSkeleton width="100%" height="110px" borderRadius="8px" />
        </div>
      </div>
    </div>
  );
}

export function ChatSkeleton() {
  return (
    <div style={{ maxWidth: '900px', margin: '0 auto', padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
        <LoadingSkeleton width="36px" height="36px" borderRadius="50%" />
        <div style={{ flex: 1, maxWidth: '70%', background: 'var(--fk-card)', padding: '16px', borderRadius: '12px', border: '1px solid var(--fk-border)' }}>
          <LoadingSkeleton width="120px" height="14px" style={{ marginBottom: '10px' }} />
          <LoadingSkeleton width="100%" height="16px" style={{ marginBottom: '6px' }} />
          <LoadingSkeleton width="80%" height="16px" />
        </div>
      </div>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'flex-start', justifyContent: 'flex-end' }}>
        <div style={{ width: '55%', background: 'var(--primary-surface)', padding: '14px', borderRadius: '12px' }}>
          <LoadingSkeleton width="100%" height="16px" style={{ marginBottom: '6px' }} />
          <LoadingSkeleton width="60%" height="16px" />
        </div>
        <LoadingSkeleton width="36px" height="36px" borderRadius="50%" />
      </div>
    </div>
  );
}

export function DiagnosisSkeleton() {
  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '24px' }}>
      <LoadingSkeleton height="36px" width="340px" style={{ marginBottom: '12px' }} />
      <LoadingSkeleton height="18px" width="560px" style={{ marginBottom: '24px' }} />
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px' }}>
        <div style={{ padding: '24px', borderRadius: '12px', border: '2px dashed var(--fk-border)', height: '280px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <LoadingSkeleton width="64px" height="64px" borderRadius="50%" style={{ marginBottom: '16px' }} />
          <LoadingSkeleton width="200px" height="18px" style={{ marginBottom: '8px' }} />
          <LoadingSkeleton width="140px" height="14px" />
        </div>
        <div style={{ padding: '20px', borderRadius: '12px', border: '1px solid var(--fk-border)', background: 'var(--fk-card)' }}>
          <LoadingSkeleton width="160px" height="20px" style={{ marginBottom: '16px' }} />
          <LoadingSkeleton width="100%" height="14px" style={{ marginBottom: '8px' }} />
          <LoadingSkeleton width="100%" height="14px" style={{ marginBottom: '8px' }} />
          <LoadingSkeleton width="75%" height="14px" style={{ marginBottom: '20px' }} />
          <LoadingSkeleton width="100%" height="42px" borderRadius="8px" />
        </div>
      </div>
    </div>
  );
}
