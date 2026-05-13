import { useState } from 'react'
import { T } from '../constants/tokens'
import { Ico } from './Ico'
import { Chip } from './Chip'
import { MatchBar } from './MatchBar'

export function MemoryCard({ mem, idx, onBlock }) {
  const [exiting, setExiting]   = useState(false)

  const doBlock = (e) => {
    e.stopPropagation()
    setExiting(true)
    setTimeout(() => onBlock(mem.id), 380)
  }

  const borderColor = mem.blocked ? T.borderSoft : T.warnBorder
  const accentColor = mem.blocked ? T.textDim : T.warn

  return (
    <div
      style={{
        background:   mem.blocked ? 'rgba(255,255,255,0.70)' : T.surface,
        border:       `1px solid ${borderColor}`,
        borderRadius: 18,
        padding:      '16px 16px 14px',
        cursor:       'default',
        transition:   'box-shadow 0.2s, border-color 0.2s',
        boxShadow:    mem.blocked ? 'none' : '0 12px 28px rgba(15,23,42,0.08)',
        animation:    exiting
          ? 'cardOut 0.38s forwards'
          : `slideRight 0.3s ${idx * 0.07}s both`,
        overflow: 'visible',
        width: '100%',
        boxSizing: 'border-box',
      }}
      onMouseEnter={e => { if (!mem.blocked) e.currentTarget.style.boxShadow = '0 16px 36px rgba(15,23,42,0.10)' }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = mem.blocked ? 'none' : '0 12px 28px rgba(15,23,42,0.08)' }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10, alignContent: 'flex-start' }}>
            {mem.blocked ? (
              <Chip color={T.textDim} bg={T.surfaceAlt} icon={<Ico name="block" size={11} color={T.textDim} />}>차단됨</Chip>
            ) : (
              <Chip color={T.warn} bg={T.warnLight} icon={<Ico name="warning" size={11} color={T.warn} />}>다른 대화에서 가져옴</Chip>
            )}
            <Chip color={T.textMid} bg={T.surfaceAlt}>{mem.date}</Chip>
            <Chip color={T.textMid} bg={T.surfaceAlt} icon={<Ico name="link" size={11} color={T.textMid} />}>
              {mem.fromRoom} 대화
            </Chip>
          </div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <MatchBar pct={mem.matchPct} color={accentColor} />
          </div>
        </div>
      </div>

      {!mem.blocked && (
        <div style={{ marginTop: 14, animation: 'fadeUp 0.18s both' }}>
          <p style={{
            fontSize: 13, color: T.textMid, lineHeight: 1.65, fontStyle: 'italic',
            padding: '12px 14px',
            background: '#FBF9FF',
            borderRadius: 14,
            border: `1px solid ${T.warnBorder}`,
            marginBottom: 12,
            boxSizing: 'border-box',
          }}>
            {mem.excerpt}
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr',
            gap: 8,
            alignItems: 'stretch',
          }}>
            <button onClick={doBlock} style={{
              width: '100%', minHeight: 44, padding: '11px 12px', fontSize: 12, fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              background: '#FFFFFF', border: `1px solid #F1C7C7`,
              borderRadius: 99, color: T.red, cursor: 'pointer',
              transition: 'all 0.18s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              boxSizing: 'border-box',
              lineHeight: 1.35,
              textAlign: 'center',
              boxShadow: '0 6px 16px rgba(239,68,68,0.08)',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2' }}
              onMouseLeave={e => { e.currentTarget.style.background = '#FFFFFF' }}
            >
              <Ico name="block" size={13} color="currentColor" />이 대화에서 사용 안 함
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
