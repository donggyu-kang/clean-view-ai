import { useState, useEffect, useRef } from 'react'
import { T } from '../constants/tokens'
import { AI_SEGMENTS } from '../constants/mockData'
import { Ico } from '../components/Ico'

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
  const bottomRef           = useRef(null)

  const blockedIds   = memories.filter(m => m.blocked).map(m => m.id)
  const crossCount   = memories.filter(m => !m.isCurrent && !m.blocked).length
  const isProcessing = trace.status === 'running'

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

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* Top bar */}
      <div style={{
        padding: '14px 24px', flexShrink: 0,
        borderBottom: `1px solid ${T.border}`, background: T.surface,
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
            <div style={{ fontSize: 14, fontWeight: 700, color: T.text }}>Clean View AI</div>
            <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 4, color: isProcessing ? T.accent : T.success }}>
              <div style={{
                width: 6, height: 6, borderRadius: '50%',
                background: isProcessing ? T.accent : T.success,
                animation: isProcessing ? 'blink 1s infinite' : 'none',
              }} />
              {isProcessing
                ? `처리 중... ${trace.steps.find(s => s.status === 'running')?.label ?? ''}`
                : '응답 가능'}
            </div>
          </div>
        </div>

        {crossCount > 0 && (
          <div onClick={onMemoryOpen} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '6px 12px',
            background: T.warnLight, border: `1px solid ${T.warnBorder}`,
            borderRadius: 99, cursor: 'pointer',
          }}>
            <Ico name="warning" size={14} color="#92400E" />
            <span style={{ fontSize: 12, fontWeight: 500, color: '#92400E' }}>
              다른 대화 기억 {crossCount}개 사용 중
            </span>
          </div>
        )}
      </div>

      {/* Messages */}
      <div ref={bottomRef} style={{ flex: 1, overflowY: 'auto', padding: '28px 24px', display: 'flex', flexDirection: 'column', gap: 20 }}>

        {/* Initial user bubble */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', animation: 'fadeUp 0.3s both' }}>
          <div style={{
            maxWidth: 420, padding: '12px 16px',
            background: T.accent, borderRadius: '18px 18px 4px 18px',
            fontSize: 14, color: '#fff', lineHeight: 1.65,
            boxShadow: `0 2px 8px ${T.accent}44`,
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
                padding: '10px 14px', marginBottom: 10,
                background: T.warnLight, border: `1px solid ${T.warnBorder}`,
                borderRadius: 12, animation: 'fadeUp 0.4s both',
              }}>
                <Ico name="warning" size={14} color="#92400E" />
                <span style={{ fontSize: 12, color: '#92400E', lineHeight: 1.5 }}>
                  <strong>이 답변에 다른 대화의 기억이 포함됐어요.</strong>{' '}
                  밑줄 친 부분이 다른 대화에서 가져온 내용입니다.
                </span>
              </div>
            )}
            <div style={{
              background: T.surface, border: `1px solid ${T.border}`,
              borderRadius: '4px 18px 18px 18px',
              padding: '16px 18px', boxShadow: T.shadow,
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
                padding: '8px 14px', fontSize: 12, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                background: crossCount > 0 ? T.warnLight : T.accentLight,
                border: `1.5px solid ${crossCount > 0 ? T.warnBorder : T.accent + '33'}`,
                borderRadius: 99, color: crossCount > 0 ? '#92400E' : T.accent,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = T.shadow }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = 'none' }}
              >
                <Ico name={crossCount > 0 ? 'warning' : 'search'} size={13} color={crossCount > 0 ? '#92400E' : T.accent} />
                어떻게 알았어요?
                {crossCount > 0 && (
                  <span style={{ background: `${T.warn}22`, border: `1px solid ${T.warn}44`, borderRadius: 99, padding: '0 7px', fontSize: 10, color: T.warn, fontWeight: 700 }}>
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
              maxWidth: 440, padding: '12px 16px', fontSize: 14, lineHeight: 1.65,
              background: m.role === 'user' ? T.accent : T.surface,
              color: m.role === 'user' ? '#fff' : T.text,
              borderRadius: m.role === 'user' ? '18px 18px 4px 18px' : '4px 18px 18px 18px',
              border: m.role === 'ai' ? `1px solid ${T.border}` : 'none',
              boxShadow: m.role === 'ai' ? T.shadow : 'none',
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
            <div style={{ padding: '14px 18px', background: T.surface, border: `1px solid ${T.border}`, borderRadius: '4px 18px 18px 18px', boxShadow: T.shadow, display: 'flex', gap: 5, alignItems: 'center' }}>
              {[0, 1, 2].map(i => (
                <div key={i} style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent, animation: `blink 1.2s ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div />
      </div>

      {/* Input area */}
      <div style={{ padding: '16px 24px', background: T.surface, borderTop: `1px solid ${T.border}`, flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: 6, marginBottom: 12, flexWrap: 'wrap' }}>
          {['점심 메뉴 추천', '오늘 운동 뭐할까', '집중력 높이는 법'].map(s => (
            <button key={s} onClick={() => setInput(s)} style={{
              padding: '5px 12px', fontSize: 11, fontWeight: 500,
              fontFamily: 'DM Sans, sans-serif',
              background: T.bg, border: `1px solid ${T.border}`,
              borderRadius: 99, color: T.textMid, cursor: 'pointer', transition: 'all 0.15s',
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = T.accent; e.currentTarget.style.color = T.accent }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = T.border; e.currentTarget.style.color = T.textMid }}
            >
              {s}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="메시지를 입력하세요..."
            style={{
              flex: 1, padding: '12px 16px',
              background: T.bg, border: `1.5px solid ${T.border}`,
              borderRadius: 12, color: T.text, fontSize: 14,
              fontFamily: 'DM Sans, sans-serif', outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={e => { e.target.style.borderColor = T.accent }}
            onBlur={e => { e.target.style.borderColor = T.border }}
          />
          <button onClick={send} disabled={!input.trim() || isProcessing} style={{
            padding: '12px 20px', fontSize: 14, fontWeight: 600,
            fontFamily: 'DM Sans, sans-serif',
            background: input.trim() && !isProcessing ? T.accent : T.surfaceAlt,
            border: 'none', borderRadius: 12,
            color: input.trim() && !isProcessing ? '#fff' : T.textDim,
            cursor: input.trim() && !isProcessing ? 'pointer' : 'default',
            transition: 'all 0.2s',
            boxShadow: input.trim() && !isProcessing ? `0 2px 10px ${T.accent}44` : 'none',
            display: 'flex', alignItems: 'center', gap: 7,
          }}>
            <Ico name="send" size={14} color={input.trim() && !isProcessing ? '#fff' : T.textDim} />
            전송
          </button>
        </div>
      </div>
    </div>
  )
}
