'use client'

interface SkeletonProps {
  width?: string | number
  height?: string | number
  borderRadius?: string | number
  style?: React.CSSProperties
}

export function Skeleton({ width = '100%', height = 16, borderRadius = 2, style }: SkeletonProps) {
  return (
    <div style={{
      width, height, borderRadius,
      background: 'linear-gradient(90deg, var(--surface) 25%, var(--surface-bright) 50%, var(--surface) 75%)',
      backgroundSize: '200% 100%',
      animation: 'shimmer 1.5s infinite',
      flexShrink: 0,
      ...style,
    }} />
  )
}

export function SignalSkeleton() {
  return (
    <div style={{ padding: '1rem 0', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: '0.75rem' }}>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`}</style>
      <Skeleton width={28} height={28} borderRadius="50%" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        <Skeleton width="30%" height={12} />
        <Skeleton width="90%" height={14} />
        <Skeleton width="70%" height={14} />
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div style={{ padding: '1.5rem', border: '0.5px solid var(--border)', borderRadius: '2px', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`}</style>
      <Skeleton width="60%" height={18} />
      <Skeleton width="100%" height={12} />
      <Skeleton width="80%" height={12} />
      <Skeleton width="40%" height={10} />
    </div>
  )
}

export function ProfileSkeleton() {
  return (
    <div style={{ display: 'flex', gap: '2rem', alignItems: 'flex-start', flexWrap: 'wrap' }}>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`}</style>
      <Skeleton width={100} height={100} borderRadius="50%" style={{ flexShrink: 0 }} />
      <div style={{ flex: 1, minWidth: 200, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        <Skeleton width="40%" height={40} />
        <Skeleton width="60%" height={14} />
        <Skeleton width="80%" height={14} />
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {[1, 2, 3].map(i => <Skeleton key={i} width={80} height={28} />)}
        </div>
      </div>
    </div>
  )
}

export function TableRowSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <>
      <style>{`@keyframes shimmer { 0% { background-position: -200% 0 } 100% { background-position: 200% 0 } }`}</style>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} style={{ padding: '1rem 1.25rem', borderBottom: '0.5px solid var(--border)', display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <Skeleton width={32} height={32} borderRadius="50%" style={{ flexShrink: 0 }} />
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
            <Skeleton width="40%" height={13} />
            <Skeleton width="65%" height={11} />
          </div>
        </div>
      ))}
    </>
  )
}
