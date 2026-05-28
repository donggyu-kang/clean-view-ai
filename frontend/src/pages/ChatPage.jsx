import { useState, useEffect, useRef } from 'react'
import { T } from '../constants/tokens'
import { AI_SEGMENTS } from '../constants/mockData'
import { Ico } from '../components/Ico'
import { ChatSidebar } from '../components/ChatSidebar'

function AnswerText({ segments, memories, highlightId, blockedIds }) {
  return (
    <span style={{ lineHeight: 1.8 }}>
      {segments.map((seg, i) => {
        if (!seg.memId) return <span key={i}>{seg.text}</span>
        const mem = memories.find(m => m.id === seg.memId)
        if (!mem || blockedIds.includes(seg.memId)) return <span key={i}>{seg.text}</span>
        const isHl = seg.memId === highlightId
        return (
          <span key={i} style={{
            background: isHl ? `${mem.segColor}25` : `${mem.segColor}12`,
            borderBottom: `2px solid ${mem.segColor}`,
            borderRadius: '2px 2px 0 0',
            padding: '0 1px',
            transition: 'background 0.4s',
            animation: isHl ? 'highlightFade 1.4s 2' : 'none',
            cursor: 'default',
          }} title={`${mem.fromRoom} 대화에서 참고`}>
            {seg.text}
          </span>
        )
      })}
    </span>
  )
}

export function ChatPage({ onMemoryOpen, memories, highlightId, onSend, trace }) {
  const [input, setInput]   = useState('')
  const [typing, setTyping] = useState(false)
  const [extra, setExtra]   = useState([])
  const [currentHistoryId, setCurrentHistoryId] = useState('h1')
  const [chatHistories, setChatHistories] = useState([
    { id: 'h1', title: '오늘 아침 뭐먹을까?', messageCount: 8, date: '오늘' },
    { id: 'h2', title: '집중력 높이는 방법', messageCount: 12, date: '어제' },
    { id: 'h3', title: '주말 계획 짜기', messageCount: 5, date: '2일 전' },
    { id: 'h4', title: '운동 루틴 짜기', messageCount: 15, date: '3일 전' },
  ])
  const bottomRef           = useRef(null)

  const blockedIds   = memories.filter(m => m.blocked).map(m => m.id)
  const crossCount   = memories.filter(m => !m.isCurrent && !m.blocked).length
  const isProcessing = trace.status === 'running'
  const currentHistory = chatHistories.find(history => history.id === currentHistoryId)
  const inputBaseBorder = `1.5px solid ${T.borderSoft}`

  useEffect(() => {
    if (bottomRef.current) bottomRef.current.scrollTop = bottomRef.current.scrollHeight
  }, [typing, extra])

  const send = () => {
    if (!input.trim() || isProcessing) return
    const q = input
    setInput('')
    setTyping(true)
    setExtra(e => [...e, { id: Date.now(), role: 'user', text: q }])
    onSend(q)
    // TODO: POST /api/chat/message { text: q } → AI 답변 스트리밍
    setTimeout(() => {
      setTyping(false)
      setExtra(e => [...e, { id: Date.now() + 1, role: 'ai', text: '네, 좋은 질문이에요! 저장된 대화 기록을 바탕으로 답변드릴게요.' }])
    }, 1300)
  }

  const handleNewChat = () => {
    const newId = `h${Date.now()}`
    setChatHistories(h => [...h, {
      id: newId,
      title: '새로운 채팅',
      messageCount: 0,
      date: '지금',
    }])
    setCurrentHistoryId(newId)
    setExtra([])
  }

  const handleSelectHistory = (historyId) => {
    setCurrentHistoryId(historyId)
    // TODO: 해당 히스토리의 메시지 로드
    setExtra([])
  }

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: T.canvas }}>
      <ChatSidebar
        histories={chatHistories}
        currentHistoryId={currentHistoryId}
        onSelectHistory={handleSelectHistory}
        onNewChat={handleNewChat}
      />

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

        {/* Top bar */}
        <div style={{
          padding: '18px 28px', flexShrink: 0,
          borderBottom: `1px solid ${T.borderSoft}`, background: 'rgba(255,255,255,0.58)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 34, height: 34, borderRadius: 10,
              background: `linear-gradient(135deg, ${T.accent}, ${T.accentMid})`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: `0 2px 8px ${T.accent}44`,
            }}>
              <Ico name="sparkle" size={18} color="#fff" strokeWidth={1.4} />
            </div>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>
                {currentHistory?.title ?? 'Clean View AI'}
              </div>
              <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: isProcessing ? T.accent : T.textMid }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: isProcessing ? T.accent : T.success,
                  animation: isProcessing ? 'blink 1s infinite' : 'none',
                }} />
                {isProcessing
                  ? `처리 중... ${trace.steps.find(s => s.status === 'running')?.label ?? ''}`
                  : '준비 완료'}
              </div>
            </div>
          </div>

          {crossCount > 0 && (
            <div onClick={onMemoryOpen} style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '8px 14px',
              background: '#FFFFFF',
              border: `1px solid ${T.warnBorder}`,
              borderRadius: 999, cursor: 'pointer',
              boxShadow: '0 6px 16px rgba(139,120,216,0.10)',
            }}>
              <Ico name="warning" size={14} color={T.warn} />
              <span style={{ fontSize: 12, fontWeight: 500, color: T.warn }}>
                다른 대화 기억 {crossCount}개 사용 중
              </span>
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={bottomRef} style={{ flex: 1, overflowY: 'auto', padding: '32px 28px', display: 'flex', flexDirection: 'column', gap: 22 }}>

        {/* Initial user bubble */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'fadeUp 0.3s both' }}>
          <div style={{
            maxWidth: 440, padding: '14px 18px',
            background: `linear-gradient(135deg, ${T.accent}, ${T.accentMid})`, borderRadius: '22px 22px 8px 22px',
            fontSize: 14, color: '#fff', lineHeight: 1.7,
            boxShadow: `0 12px 28px ${T.accent}2A`,
          }}>
            오늘 아침 뭐먹을까?
          </div>
        </div>

        {/* Initial AI bubble */}
        <div style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.3s 0.1s both' }}>
          <div style={{
            width: 36, height: 36, borderRadius: 10, flexShrink: 0,
            background: `linear-gradient(135deg, ${T.accent}, ${T.accentMid})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: `0 2px 8px ${T.accent}33`,
          }}>
            <Ico name="sparkle" size={16} color="#fff" strokeWidth={1.4} />
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            {crossCount > 0 && (
              <div style={{
                display: 'flex', alignItems: 'flex-start', gap: 8,
                padding: '12px 14px', marginBottom: 12,
                background: '#FFFFFF', border: `1px solid ${T.warnBorder}`,
                borderRadius: 14, animation: 'fadeUp 0.4s both',
                boxShadow: '0 8px 20px rgba(139,120,216,0.08)',
              }}>
                <Ico name="warning" size={14} color={T.warn} />
                <span style={{ fontSize: 12, color: T.textMid, lineHeight: 1.55 }}>
                  <strong>이 답변에 다른 대화의 기억이 포함됐어요.</strong>{' '}
                  밑줄 친 부분이 다른 대화에서 가져온 내용입니다.
                </span>
              </div>
            )}
            <div style={{
              background: T.surface, border: `1px solid ${T.borderSoft}`,
              borderRadius: '10px 24px 24px 24px',
              padding: '20px 22px', boxShadow: '0 16px 36px rgba(15,23,42,0.08)',
              fontSize: 14, lineHeight: 1.75,
            }}>
              <p style={{ marginBottom: 14 }}>
                <AnswerText segments={AI_SEGMENTS} memories={memories} highlightId={highlightId} blockedIds={blockedIds} />
              </p>
              {crossCount > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                  {memories.filter(m => !m.isCurrent && !m.blocked).map(m => (
                    <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.textMid }}>
                      <div style={{ width: 16, height: 2.5, background: m.segColor, borderRadius: 1 }} />
                      <span>{m.fromRoom} 대화</span>
                    </div>
                  ))}
                </div>
              )}
              <button onClick={onMemoryOpen} style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                padding: '9px 14px', fontSize: 12, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                background: '#FFFFFF',
                border: `1px solid ${crossCount > 0 ? T.warnBorder : T.borderSoft}`,
                borderRadius: 999, color: crossCount > 0 ? T.warn : T.textMid,
                cursor: 'pointer', transition: 'all 0.2s',
                boxShadow: crossCount > 0 ? '0 6px 16px rgba(139,120,216,0.10)' : '0 6px 16px rgba(148,163,184,0.10)',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
              >
                <Ico name={crossCount > 0 ? 'warning' : 'search'} size={13} color={crossCount > 0 ? T.warn : T.textMid} />
                참고한 기억
                {crossCount > 0 && (
                  <span style={{ background: T.warnLight, border: `1px solid ${T.warnBorder}`, borderRadius: 99, padding: '0 7px', fontSize: 10, color: T.warn, fontWeight: 700 }}>
                    다른 대화 {crossCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Extra messages */}
        {extra.map(m => (
          <div key={m.id} style={{ display: 'flex', justifyContent: m.role === 'user' ? 'flex-end' : 'flex-start', gap: 12, animation: 'fadeUp 0.3s both' }}>
            {m.role === 'ai' && (
              <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${T.accent},${T.accentMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Ico name="sparkle" size={16} color="#fff" strokeWidth={1.4} />
              </div>
            )}
            <div style={{
              maxWidth: 460, padding: '14px 18px', fontSize: 14, lineHeight: 1.7,
              background: m.role === 'user' ? `linear-gradient(135deg, ${T.accent}, ${T.accentMid})` : 'rgba(255,255,255,0.72)',
              color: m.role === 'user' ? '#fff' : T.text,
              borderRadius: m.role === 'user' ? '22px 22px 8px 22px' : '10px 24px 24px 24px',
              border: m.role === 'ai' ? `1px solid ${T.borderSoft}` : 'none',
              boxShadow: m.role === 'ai' ? '0 16px 36px rgba(15,23,42,0.08)' : `0 12px 28px ${T.accent}2A`,
              backdropFilter: 'none',
            }}>
              {m.text}
            </div>
          </div>
        ))}

        {/* 타이핑 인디케이터 */}
        {typing && (
          <div style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.3s both' }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, flexShrink: 0, background: `linear-gradient(135deg,${T.accent},${T.accentMid})`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Ico name="sparkle" size={16} color="#fff" strokeWidth={1.4} />
            </div>
            <div style={{ padding: '14px 18px', background: T.surface, border: `1px solid ${T.borderSoft}`, borderRadius: '10px 24px 24px 24px', boxShadow: '0 16px 36px rgba(15,23,42,0.08)', display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent, animation: `blink 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div />
        </div>

        {/* Input area */}
        <div style={{ padding: '18px 28px 24px', background: 'rgba(255,255,255,0.58)', borderTop: `1px solid ${T.borderSoft}`, flexShrink: 0 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
              placeholder="메시지를 입력하세요..."
              style={{
                flex: 1, padding: '13px 16px',
                background: 'rgba(255,255,255,0.82)', border: inputBaseBorder,
                borderRadius: 14, color: T.text, fontSize: 14,
                fontFamily: 'DM Sans, sans-serif', outline: 'none',
                transition: 'border-color 0.2s, box-shadow 0.2s, background 0.2s',
                boxSizing: 'border-box',
              }}
              onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accent}1e`; e.target.style.background = '#fff' }}
              onBlur={e => { e.target.style.border = inputBaseBorder; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.82)' }}
            />
            <button onClick={send} disabled={!input.trim() || isProcessing} style={{
              padding: '13px 20px', fontSize: 14, fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              background: input.trim() && !isProcessing ? T.accent : '#E2E8F0',
              border: 'none', borderRadius: 14,
              color: input.trim() && !isProcessing ? '#fff' : T.textDim,
              cursor: input.trim() && !isProcessing ? 'pointer' : 'default',
              transition: 'all 0.2s',
              boxShadow: input.trim() && !isProcessing ? `0 10px 24px ${T.accent}30` : 'none',
              display: 'flex', alignItems: 'center', gap: 7,
            }}>
              <Ico name="send" size={14} color={input.trim() && !isProcessing ? '#fff' : T.textDim} />
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
