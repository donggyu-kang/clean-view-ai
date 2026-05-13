import { T } from '../constants/tokens'
import { Ico } from './Ico'
import { MemoryCard } from './MemoryCard'

export function MemoryDrawer({ open, onClose, memories, onBlock, onLocate, onTraceOpen }) {
  const crossCount = memories.filter(m => !m.isCurrent && !m.blocked).length
  const visibleMemories = memories.filter(m => !m.isCurrent)

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
        background: T.panel,
        borderLeft: `1px solid rgba(255,255,255,0.40)`,
        boxShadow: open ? '-16px 0 40px rgba(15,23,42,0.12)' : 'none',
        transform: open ? 'translateX(0)' : 'translateX(100%)',
        transition: 'transform 0.32s cubic-bezier(0.22,1,0.36,1)',
        zIndex: 50, display: 'flex', flexDirection: 'column',
      }}>

        {/* Header */}
        <div style={{ padding: '22px 22px 18px', borderBottom: `1px solid rgba(255,255,255,0.46)`, flexShrink: 0 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 12 }}>
            <div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.text, marginBottom: 3 }}>AI가 참고한 기억</div>
              <div style={{ fontSize: 12, color: T.textMid }}>총 {visibleMemories.length}개의 기억 조각을 찾았어요</div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8,
              background: 'rgba(255,255,255,0.75)', border: `1px solid ${T.borderSoft}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
              transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.background = '#fff' }}
              onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.75)' }}
            >
              <Ico name="close" size={14} color={T.textMid} />
            </button>
          </div>

          {crossCount > 0 && (
            <div style={{ padding: '13px 14px', background: '#FFFFFF', border: `1px solid ${T.warnBorder}`, borderRadius: 14, boxShadow: '0 8px 18px rgba(139,120,216,0.08)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: T.warn, marginBottom: 3, display: 'flex', alignItems: 'center', gap: 6 }}>
                <Ico name="warning" size={14} color={T.warn} />
                다른 대화의 기억이 사용됐어요
              </div>
              <div style={{ fontSize: 12, color: T.textMid, lineHeight: 1.5 }}>
                AI가 지금 대화에서 말한 적 없는 정보를 다른 대화에서 가져왔습니다. 원하지 않으면 차단할 수 있어요.
              </div>
            </div>
          )}
        </div>

        {/* Memory list */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px 28px', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {visibleMemories.map((mem, i) => (
            <MemoryCard
              key={mem.id} mem={mem} idx={i}
              onBlock={onBlock}
            />
          ))}
        </div>

        {/* Footer */}
        <div style={{ padding: '16px 22px 18px', borderTop: `1px solid rgba(255,255,255,0.46)`, flexShrink: 0 }}>
          <button onClick={onTraceOpen} style={{
            width: '100%', padding: '12px 0', fontSize: 13, fontWeight: 600,
            fontFamily: 'DM Sans, sans-serif',
            background: '#FFFFFF', border: `1px solid ${T.borderSoft}`,
            borderRadius: 14, color: T.accent, cursor: 'pointer', transition: 'all 0.15s',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 10px 24px rgba(15,23,42,0.08)',
          }}
            onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
            onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
          >
            답변 상세 분석
            <Ico name="arrowRight" size={14} color={T.accent} />
          </button>
        </div>
      </div>
    </>
  )
}
