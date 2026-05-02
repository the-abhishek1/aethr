export default function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: '1rem',
      fontFamily: 'var(--font-mono)', fontSize: '0.62rem',
      letterSpacing: '0.28em', textTransform: 'uppercase',
      color: 'var(--aether)', marginBottom: '1rem',
    }}>
      <span style={{ width: 40, height: '0.5px', background: 'var(--aether)', opacity: 0.5, display: 'block' }} />
      {children}
    </div>
  )
}
