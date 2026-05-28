import { T } from '../constants/tokens'
import { Ico } from './Ico'

export function ChatSidebar({ 
  histories, 
  currentHistoryId, 
  onSelectHistory, 
  onNewChat,
}) {
  return (
    <div style={{
      width: 280, flexShrink: 0,
      background: T.panelStrong,
      borderRight: `1px solid rgba(255,255,255,0.35)`,
      display: 'flex', flexDirection: 'column',
      overflow: 'hidden',
    }}>
      <div style={{
        padding: '20px 18px 16px', flexShrink: 0,
        borderBottom: `1px solid rgba(255,255,255,0.38)`,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
          <div style={{
            width: 34, height: 34, borderRadius: 10,
            background: `linear-gradient(135deg, ${T.accent}, ${T.accentMid})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 2px 8px ${T.accent}33`,
          }}>
            <Ico name="chat" size={16} color="#fff" strokeWidth={1.5} />
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>채팅 목록</div>
            <div style={{ fontSize: 11, color: T.textDim }}>대화를 빠르게 탐색하고 전환할 수 있어요</div>
          </div>
        </div>
        <button
          onClick={onNewChat}
          style={{
            width: '100%', padding: '13px 14px',
            background: T.accent,
            border: 'none',
            borderRadius: 14, cursor: 'pointer',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            transition: 'all 0.15s',
            color: '#fff',
            boxShadow: `0 10px 24px ${T.accent}2E`,
          }}
          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 14px 30px ${T.accent}30` }}
          onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 10px 24px ${T.accent}2E` }}
        >
          <Ico name="plus" size={16} color="#fff" />
          <span style={{ fontSize: 13, fontWeight: 700 }}>새 채팅 시작</span>
        </button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 14px 18px' }}>
        <div style={{ fontSize: 11, fontWeight: 700, color: T.textDim, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: 12 }}>
          최근 대화
        </div>

        {histories && histories.length > 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {histories.map(history => (
              <button
                key={history.id}
                onClick={() => onSelectHistory(history.id)}
                title={history.title}
                style={{
                  width: '100%', padding: '12px 13px',
                  borderRadius: 16, border: `1px solid ${currentHistoryId === history.id ? T.accent + '2A' : 'rgba(255,255,255,0.50)'}`, cursor: 'pointer',
                  background: currentHistoryId === history.id 
                    ? 'rgba(255,255,255,0.96)' 
                    : 'rgba(255,255,255,0.62)',
                  textAlign: 'left', transition: 'all 0.15s',
                  display: 'flex', flexDirection: 'column', gap: 4,
                  boxShadow: currentHistoryId === history.id ? '0 14px 30px rgba(15,23,42,0.10)' : '0 3px 10px rgba(15,23,42,0.04)',
                }}
                onMouseEnter={e => {
                  if (currentHistoryId !== history.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.82)'
                    e.currentTarget.style.boxShadow = '0 10px 22px rgba(15,23,42,0.08)'
                  }
                }}
                onMouseLeave={e => {
                  if (currentHistoryId !== history.id) {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.62)'
                    e.currentTarget.style.boxShadow = '0 3px 10px rgba(15,23,42,0.04)'
                  }
                }}
              >
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: 8,
                      background: currentHistoryId === history.id ? `${T.accent}12` : T.surfaceSoft,
                      border: `1px solid ${currentHistoryId === history.id ? T.accent + '1F' : T.borderSoft}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0,
                    }}>
                      <Ico name="chat" size={13} color={currentHistoryId === history.id ? T.accent : T.textMid} />
                    </div>
                    <div style={{
                      fontSize: 12, fontWeight: 600, color: T.text,
                      overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      flex: 1, minWidth: 0,
                    }}>
                      {history.title}
                    </div>
                </div>
                <div style={{
                  fontSize: 10, color: T.textDim,
                    display: 'flex', justifyContent: 'space-between',
                    paddingLeft: 36,
                }}>
                  <span>{history.messageCount} 메시지</span>
                  <span>{history.date}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div style={{
            padding: '24px 16px', textAlign: 'center',
            color: T.textDim, fontSize: 12,
          }}>
            채팅 기록이 없습니다
          </div>
        )}
      </div>
    </div>
  )
}
