import { T } from '../constants/tokens'

export function MatchBar({ pct, color = T.accent }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ flex: 1, height: 4, background: T.surfaceAlt, borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          height: '100%',
          width: `${pct}%`,
          background: `linear-gradient(90deg, ${color}88, ${color})`,
          borderRadius: 99,
          transition: 'width 0.7s cubic-bezier(0.22,1,0.36,1)',
        }} />
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color, minWidth: 30 }}>{pct}%</span>
    </div>
  )
}
