import { useState } from 'react'
import { T } from '../constants/tokens'
import { Ico } from './Ico'
import { Chip } from './Chip'
import { MatchBar } from './MatchBar'

export function MemoryCard({ mem, idx, onBlock, onLocate }) {
  const [expanded, setExpanded] = useState(idx < 2)
  const [exiting, setExiting]   = useState(false)

  const doBlock = (e) => {
    e.stopPropagation()
    setExiting(true)
    setTimeout(() => onBlock(mem.id), 380)
  }

  const isCross     = !mem.isCurrent
  const borderColor = mem.blocked ? T.border : isCross ? T.warn : T.success

  return (
    <div
      onClick={() => !mem.blocked && setExpanded(e => !e)}
      style={{
        background:   mem.blocked ? T.surfaceAlt : T.surface,
        border:       `1.5px solid ${borderColor}`,
        borderRadius: 12,
        padding:      '14px 16px',
        cursor:       mem.blocked ? 'default' : 'pointer',
        transition:   'box-shadow 0.2s, border-color 0.2s',
        boxShadow:    mem.blocked ? 'none' : T.shadow,
        animation:    exiting
          ? 'cardOut 0.38s forwards'
          : `slideRight 0.3s ${idx * 0.07}s both`,
        overflow: 'hidden',
      }}
      onMouseEnter={e => { if (!mem.blocked) e.currentTarget.style.boxShadow = T.shadowMd }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = mem.blocked ? 'none' : T.shadow }}
    >
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginBottom: 8 }}>
            {mem.blocked ? (
              <Chip color={T.textDim} bg={T.surfaceAlt} icon={<Ico name="block" size={11} color={T.textDim} />}>차단됨</Chip>
            ) : isCross ? (
              <Chip color={T.warn} bg={T.warnLight} icon={<Ico name="warning" size={11} color={T.warn} />}>다른 대화에서 가져옴</Chip>
            ) : (
              <Chip color={T.success} bg={T.successLight} icon={<Ico name="check" size={11} color={T.success} />}>현재 대화</Chip>
            )}
            <Chip color={T.textMid} bg={T.surfaceAlt}>{mem.date}</Chip>
            {!mem.isCurrent && (
              <Chip color={T.textMid} bg={T.surfaceAlt} icon={<Ico name="link" size={11} color={T.textMid} />}>
                {mem.fromRoom} 대화
              </Chip>
            )}
          </div>
          <MatchBar pct={mem.matchPct} color={mem.blocked ? T.textDim : isCross ? T.warn : T.success} />
        </div>
        {!mem.blocked && (
          <div style={{
            flexShrink: 0, marginTop: 2,
            transform: expanded ? 'rotate(180deg)' : 'none',
            transition: 'transform 0.2s',
          }}>
            <Ico name="chevDown" size={14} color={T.textDim} />
          </div>
        )}
      </div>

      {/* Expanded body */}
      {expanded && !mem.blocked && (
        <div style={{ marginTop: 12, animation: 'fadeUp 0.18s both' }}>
          <p style={{
            fontSize: 13, color: T.textMid, lineHeight: 1.65, fontStyle: 'italic',
            padding: '10px 12px',
            background: isCross ? T.warnLight : T.successLight,
            borderRadius: 8,
            borderLeft: `3px solid ${isCross ? T.warn : T.success}`,
            marginBottom: 12,
          }}>
            {mem.excerpt}
          </p>

          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {isCross && (
              <button onClick={doBlock} style={{
                flex: 1, padding: '9px 0', fontSize: 12, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                background: '#FFF1F0', border: `1.5px solid ${T.red}44`,
                borderRadius: 99, color: T.red, cursor: 'pointer',
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.red; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = T.red }}
                onMouseLeave={e => { e.currentTarget.style.background = '#FFF1F0'; e.currentTarget.style.color = T.red; e.currentTarget.style.borderColor = `${T.red}44` }}
              >
                <Ico name="block" size={13} color="currentColor" />이 대화에서 사용 안 함
              </button>
            )}
            {mem.usedIn && (
              <button onClick={e => { e.stopPropagation(); onLocate(mem.id) }} style={{
                padding: '9px 14px', fontSize: 12, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                background: T.accentLight, border: `1.5px solid ${T.accent}33`,
                borderRadius: 99, color: T.accent, cursor: 'pointer',
                transition: 'all 0.18s',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
                onMouseEnter={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = T.accent }}
                onMouseLeave={e => { e.currentTarget.style.background = T.accentLight; e.currentTarget.style.color = T.accent; e.currentTarget.style.borderColor = `${T.accent}33` }}
              >
                <Ico name="eye" size={13} color="currentColor" />답변에서 보기
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
