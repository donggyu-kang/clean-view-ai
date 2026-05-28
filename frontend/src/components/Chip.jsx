import { T } from '../constants/tokens'

export function Chip({ children, color = T.accent, bg, icon }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 4,
      fontSize: 11, fontWeight: 500, color,
      background: bg || `${color}14`,
      border: `1px solid ${color}2a`,
      borderRadius: 99, padding: '2px 9px',
      whiteSpace: 'nowrap',
    }}>
      {icon && <span style={{ display: 'flex' }}>{icon}</span>}
      {children}
    </span>
  )
}
