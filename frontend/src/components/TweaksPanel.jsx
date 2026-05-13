import { useState } from 'react'
import { T } from '../constants/tokens'
import { Ico } from './Ico'

export function TweaksPanel({ children }) {
  const [open, setOpen] = useState(false)

  return (
    <div style={{ position: 'fixed', bottom: 22, right: 22, zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
      {open && (
        <div style={{
          marginBottom: 10,
          background: T.surface, borderRadius: 14,
          border: `1px solid ${T.border}`,
          boxShadow: T.shadowMd,
          padding: '18px 18px 10px', minWidth: 230,
          animation: 'fadeUp 0.18s both',
        }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 14 }}>
            디자인 설정
          </div>
          {children}
        </div>
      )}
      <button
        onClick={() => setOpen(o => !o)}
        title="디자인 설정"
        style={{
          width: 38, height: 38, borderRadius: '50%',
          background: open ? T.text : T.accent,
          border: 'none', color: '#fff', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: `0 2px 12px ${T.accent}55`,
          transition: 'background 0.2s',
        }}
      >
        <Ico name={open ? 'close' : 'sparkle'} size={15} color="#fff" strokeWidth={1.6} />
      </button>
    </div>
  )
}

export function TweakColor({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, color: T.textMid, fontWeight: 500, marginBottom: 7 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <input
          type="color" value={value}
          onChange={e => onChange(e.target.value)}
          style={{ width: 34, height: 34, border: `1.5px solid ${T.border}`, borderRadius: 8, cursor: 'pointer', padding: 3, background: 'none' }}
        />
        <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: T.textMid }}>{value}</span>
      </div>
    </div>
  )
}

export function TweakSlider({ label, value, min, max, step, onChange }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span style={{ fontSize: 11, color: T.textMid, fontWeight: 500 }}>{label}</span>
        <span style={{ fontSize: 11, fontFamily: 'DM Mono, monospace', color: T.text, fontWeight: 600 }}>{value}px</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={e => onChange(Number(e.target.value))}
        style={{ width: '100%', accentColor: T.accent, cursor: 'pointer' }}
      />
    </div>
  )
}
