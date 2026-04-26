import { T } from '../constants/tokens'
import { Ico } from './Ico'
import { MemoryCard } from './MemoryCard'

export function MemoryDrawer({ open, onClose, memories, onBlock, onLocate, onTraceOpen }) {
  const crossCount = memories.filter(m => !m.isCurrent && !m.blocked).length

  return (
    <>
      {/* Backdrop */}
      <div onClick={onClose} style={{
        position: 'fixed', inset: 0,
        background: 'rgba(26,26,26,0.25)',
        backdropFilter: 'blur(3px)',
        opacity: open ? 1 : 0,
        pointerEvents: open ? 'auto' : 'none',
        transition: 'opacity 0.25s',
        zIndex: 40,
      }} />

      {/* Panel */}
      <div style={{
        position: 'fixed', top: 0, right: 0, bottom: 0, width: 400,
        background: T.bg,
        borderLeft: `1px solid ${T.border}`,
        boxShadow: open ? '-8px 0 40px rgba(0,0,0,0.10)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{ padding: '20px 22px 16px', borderBottom: `1px solid ${T.border}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 3 }}>AI가 참고한 기억</div>
              <div style={{ fontSize: 12, color: T.textMid }}>총 {memories.length}개의 기억 조각을 찾았어요</div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8,
              background: T.surfaceAlt, border: `1px solid ${T.border}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = T.border }}
              onMouseLeave={e => { e.currentTarget.style.background = T.surfaceAlt }}
            >
              <Ico name="close" size={14} color={T.textMid} />
            </button>
          </div>

          {crossCount > 0 && (
            <div style={{ padding: '12px 14px', background: T.warnLight, border: `1px solid ${T.warnBorder}`, borderRadius: 10 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#92400E', marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ico name="warning" size={14} color="#92400E" />
                다른 대화의 기억이 사용됐어요
              </div>
              <div style={{ fontSize: 12, color: '#B45309', lineHeight: 1.5 }}>
                AI가 지금 대화에서 말한 적 없는 정보를 다른 대화에서 가져왔습니다. 원하지 않으면 차단할 수 있어요.
              </div>
            </div>
          )}
        </div>

        {/* Memory list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 10 }}>
          {memories.map((mem, i) => (
            <MemoryCard
              key={mem.id} mem={mem} idx={i}
              onBlock={onBlock}
              onLocate={id => { onLocate(id); onClose() }}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '14px 22px', borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
          <button onClick={onTraceOpen} style={{
            width: '100%', padding: '10px 0', fontSize: 13, fontWeight: 500,
            fontFamily: 'DM Sans, sans-serif',
            background: T.accentLight, border: `1px solid ${T.accent}33`,
            borderRadius: 10, color: T.accent, cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
          }}
            onMouseEnter={e => { e.currentTarget.style.background = `${T.accent}20` }}
            onMouseLeave={e => { e.currentTarget.style.background = T.accentLight }}
          >
            AI가 어떻게 답변을 만들었는지 자세히 보기
            <Ico name="arrowRight" size={14} color={T.accent} />
          </button>
        </div>
      </div>
    </>
  )
}
