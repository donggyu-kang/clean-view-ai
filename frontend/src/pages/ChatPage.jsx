import { useState, useEffect, useRef, useCallback } from 'react'
import { T } from '../constants/tokens'
import { Ico } from '../components/Ico'
import { ChatSidebar } from '../components/ChatSidebar'
import { getSessions, getMessages, sendMessage } from '../api/index'

// 세션별 색상 팔레트
const PALETTE = ['#F59E0B', '#8B5CF6', '#06B6D4', '#10B981', '#EF4444', '#F97316']

// API references → 메모리 드로어 포맷 변환
function refsToMemories(references = [], sessions = []) {
  return references.map((ref, i) => {
    const session = sessions.find(s => s.id === ref.session_id)
    return {
      id: `ref-${ref.id}`,
      refId: ref.id,
      sessionId: ref.session_id,
      matchPct: Math.round((ref.similarity ?? 0) * 100),
      fromRoom: session?.title ?? `대화 ${ref.session_id}`,
      fromRoomId: ref.session_id,
      isCurrent: false,
      excerpt: `"${(ref.content ?? '').substring(0, 80)}"`,
      blocked: false,
      usedIn: true,
      segColor: PALETTE[i % PALETTE.length],
    }
  })
}

// API segments → UI 세그먼트 포맷 변환
function apiToUiSegments(segments = []) {
  return segments.map(s => ({
    text: s.text,
    memId: s.has_citation && s.ref_id != null ? `ref-${s.ref_id}` : null,
  }))
}

// 날짜 포맷
function formatDate(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const now = new Date()
  const diff = now - d
  if (diff < 86400000) return '오늘'
  if (diff < 172800000) return '어제'
  return `${d.getMonth() + 1}월 ${d.getDate()}일`
}

// 하이라이트 텍스트 컴포넌트
function AnswerText({ segments, memories, highlightId, blockedIds }) {
  if (!segments || segments.length === 0) return null
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

export function ChatPage({ onMemoryOpen, memories, highlightId, onNewMemories }) {
  const [sessions, setSessions]               = useState([])
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [messages, setMessages]               = useState([])
  const [input, setInput]                     = useState('')
  const [sending, setSending]                 = useState(false)
  const [loadingMessages, setLoadingMessages]  = useState(false)
  const bottomRef                             = useRef(null)
  // stale closure 방지: sessions 최신값 ref
  const sessionsRef                           = useRef([])

  const blockedIds  = memories.filter(m => m.blocked).map(m => m.id)
  const crossCount  = memories.filter(m => !m.isCurrent && !m.blocked).length
  const inputBaseBorder = `1.5px solid ${T.borderSoft}`

  // sessions 최신값 ref 동기화
  useEffect(() => { sessionsRef.current = sessions }, [sessions])

  // 세션 목록 로드 — currentSessionId 클로저 캡처 없이 함수형 업데이터 사용
  const loadSessions = useCallback(() => {
    getSessions()
      .then(data => {
        const list = data ?? []
        setSessions(list)
        // 함수형 업데이터: 현재 값이 null이면 첫 세션 자동 선택
        setCurrentSessionId(prev => (prev == null && list.length > 0) ? list[0].id : prev)
      })
      .catch(console.error)
  }, [])

  useEffect(() => {
    loadSessions()
  }, [loadSessions])

  // 세션 변경 시 메시지 로드
  useEffect(() => {
    if (!currentSessionId) return
    setLoadingMessages(true)
    setMessages([])
    onNewMemories([])
    getMessages(currentSessionId)
      .then(data => {
        setMessages((data ?? []).map(m => ({
          id: m.id,
          role: m.role,
          text: m.content,
        })))
      })
      .catch(console.error)
      .finally(() => setLoadingMessages(false))
  }, [currentSessionId])

  // 메시지 추가 시 스크롤
  useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollTop = bottomRef.current.scrollHeight
    }
  }, [messages, sending])

  const handleSend = async () => {
    if (!input.trim() || sending) return
    const q = input
    setInput('')
    setSending(true)

    // 사용자 메시지 즉시 표시
    setMessages(ms => [...ms, { id: `tmp-${Date.now()}`, role: 'user', text: q }])

    try {
      const res = await sendMessage(q, currentSessionId)

      // 새 세션이 생성된 경우 세션 목록 갱신
      const newSessionId = res.session_id ? parseInt(res.session_id) : null
      if (newSessionId && newSessionId !== currentSessionId) {
        setCurrentSessionId(newSessionId)
        loadSessions()
      } else {
        // 기존 세션이면 제목 업데이트를 위해 갱신
        loadSessions()
      }

      // references → memories 변환 (sessionsRef: 최신 sessions 참조)
      const newMemories = refsToMemories(res.references ?? [], sessionsRef.current)
      const uiSegments  = apiToUiSegments(res.segments ?? [])

      // AI 메시지 추가
      setMessages(ms => [...ms, {
        id: `ai-${Date.now()}`,
        role: 'assistant',
        text: res.answer,
        segments: uiSegments,
        memories: newMemories,
      }])

      // App에 memories 전달 (드로어용)
      onNewMemories(newMemories)

    } catch (err) {
      setMessages(ms => [...ms, {
        id: `err-${Date.now()}`,
        role: 'error',
        text: `오류가 발생했습니다: ${err.message}`,
      }])
    } finally {
      setSending(false)
    }
  }

  const handleNewChat = () => {
    setCurrentSessionId(null)
    setMessages([])
    onNewMemories([])
  }

  const handleSelectSession = (sessionId) => {
    if (sessionId === currentSessionId) return
    setCurrentSessionId(sessionId)
  }

  // 세션 목록 → ChatSidebar 포맷 변환
  const histories = sessions.map(s => ({
    id: s.id,
    title: s.title,
    messageCount: 0,
    date: formatDate(s.updatedAt ?? s.createdAt),
  }))

  const currentSession = sessions.find(s => s.id === currentSessionId)

  return (
    <div style={{ flex: 1, display: 'flex', overflow: 'hidden', background: T.canvas }}>
      <ChatSidebar
        histories={histories}
        currentHistoryId={currentSessionId}
        onSelectHistory={handleSelectSession}
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
                {currentSession?.title ?? 'Clean View AI'}
              </div>
              <div style={{ fontSize: 11, display: 'flex', alignItems: 'center', gap: 5, color: sending ? T.accent : T.textMid }}>
                <div style={{
                  width: 6, height: 6, borderRadius: '50%',
                  background: sending ? T.accent : T.success,
                  animation: sending ? 'blink 1s infinite' : 'none',
                }} />
                {sending ? '답변 생성 중...' : '준비 완료'}
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
        <div ref={bottomRef} style={{
          flex: 1, overflowY: 'auto', padding: '32px 28px',
          display: 'flex', flexDirection: 'column', gap: 22,
        }}>

          {/* 빈 상태 */}
          {!loadingMessages && messages.length === 0 && (
            <div style={{
              flex: 1, display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              color: T.textDim, fontSize: 14, gap: 10, paddingTop: 60,
            }}>
              <Ico name="sparkle" size={32} color={T.textDim} strokeWidth={1.2} />
              <div style={{ fontWeight: 600 }}>무엇이든 물어보세요</div>
              <div style={{ fontSize: 12 }}>AI가 이전 대화 기억을 참고해 답변드려요</div>
            </div>
          )}

          {/* 로딩 */}
          {loadingMessages && (
            <div style={{ display: 'flex', justifyContent: 'center', paddingTop: 60, color: T.textDim, fontSize: 13 }}>
              메시지를 불러오는 중...
            </div>
          )}

          {/* 메시지 목록 */}
          {messages.map(m => {
            if (m.role === 'user') {
              return (
                <div key={m.id} style={{ display: 'flex', justifyContent: 'flex-end', animation: 'fadeUp 0.3s both' }}>
                  <div style={{
                    maxWidth: 440, padding: '14px 18px',
                    background: `linear-gradient(135deg, ${T.accent}, ${T.accentMid})`,
                    borderRadius: '22px 22px 8px 22px',
                    fontSize: 14, color: '#fff', lineHeight: 1.7,
                    boxShadow: `0 12px 28px ${T.accent}2A`,
                  }}>
                    {m.text}
                  </div>
                </div>
              )
            }

            if (m.role === 'error') {
              return (
                <div key={m.id} style={{
                  padding: '12px 16px', background: 'rgba(239,68,68,0.08)',
                  border: '1px solid rgba(239,68,68,0.2)', borderRadius: 12,
                  fontSize: 13, color: T.red,
                }}>
                  {m.text}
                </div>
              )
            }

            // assistant 메시지
            const msgMemories = m.memories ?? []
            const msgSegments = m.segments ?? []
            // blockedIds는 App.jsx에서 내려오는 prop 기반 → 실시간으로 반영됨
            const hasCitations = msgMemories.filter(mm => !blockedIds.includes(mm.id)).length > 0

            return (
              <div key={m.id} style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.3s 0.1s both' }}>
                <div style={{
                  width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                  background: `linear-gradient(135deg, ${T.accent}, ${T.accentMid})`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  boxShadow: `0 2px 8px ${T.accent}33`,
                }}>
                  <Ico name="sparkle" size={16} color="#fff" strokeWidth={1.4} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  {hasCitations && (
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
                    <p style={{ marginBottom: msgMemories.length > 0 ? 14 : 0 }}>
                      {msgSegments.length > 0 ? (
                        <AnswerText
                          segments={msgSegments}
                          memories={msgMemories}
                          highlightId={highlightId}
                          blockedIds={blockedIds}
                        />
                      ) : (
                        m.text
                      )}
                    </p>
                    {msgMemories.length > 0 && (
                      <>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 14 }}>
                          {msgMemories.filter(mm => !blockedIds.includes(mm.id)).map(mm => (
                            <div key={mm.id} style={{ display: 'flex', alignItems: 'center', gap: 5, fontSize: 11, color: T.textMid }}>
                              <div style={{ width: 16, height: 2.5, background: mm.segColor, borderRadius: 1 }} />
                              <span>{mm.fromRoom} 대화</span>
                            </div>
                          ))}
                        </div>
                        <button onClick={onMemoryOpen} style={{
                          display: 'inline-flex', alignItems: 'center', gap: 7,
                          padding: '9px 14px', fontSize: 12, fontWeight: 600,
                          fontFamily: 'DM Sans, sans-serif',
                          background: '#FFFFFF',
                          border: `1px solid ${hasCitations ? T.warnBorder : T.borderSoft}`,
                          borderRadius: 999, color: hasCitations ? T.warn : T.textMid,
                          cursor: 'pointer', transition: 'all 0.2s',
                          boxShadow: hasCitations ? '0 6px 16px rgba(139,120,216,0.10)' : '0 6px 16px rgba(148,163,184,0.10)',
                        }}
                          onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-1px)' }}
                          onMouseLeave={e => { e.currentTarget.style.transform = 'none' }}
                        >
                          <Ico name={hasCitations ? 'warning' : 'search'} size={13} color={hasCitations ? T.warn : T.textMid} />
                          참고한 기억
                          {hasCitations && (
                            <span style={{
                              background: T.warnLight, border: `1px solid ${T.warnBorder}`,
                              borderRadius: 99, padding: '0 7px', fontSize: 10, color: T.warn, fontWeight: 700,
                            }}>
                              다른 대화 {msgMemories.filter(mm => !blockedIds.includes(mm.id)).length}
                            </span>
                          )}
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )
          })}

          {/* 타이핑 인디케이터 */}
          {sending && (
            <div style={{ display: 'flex', gap: 12, animation: 'fadeUp 0.3s both' }}>
              <div style={{
                width: 36, height: 36, borderRadius: 10, flexShrink: 0,
                background: `linear-gradient(135deg, ${T.accent}, ${T.accentMid})`,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <Ico name="sparkle" size={16} color="#fff" strokeWidth={1.4} />
              </div>
              <div style={{
                padding: '14px 18px', background: T.surface,
                border: `1px solid ${T.borderSoft}`, borderRadius: '10px 24px 24px 24px',
                boxShadow: '0 16px 36px rgba(15,23,42,0.08)',
                display: 'flex', gap: 5, alignItems: 'center',
              }}>
                {[0, 1, 2].map(i => (
                  <div key={i} style={{
                    width: 7, height: 7, borderRadius: '50%', background: T.accent,
                    animation: `blink 1.2s ${i * 0.2}s infinite`,
                  }} />
                ))}
              </div>
            </div>
          )}
          <div />
        </div>

        {/* Input area */}
        <div style={{
          padding: '18px 28px 24px', background: 'rgba(255,255,255,0.58)',
          borderTop: `1px solid ${T.borderSoft}`, flexShrink: 0,
        }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSend()}
              placeholder="메시지를 입력하세요..."
              disabled={sending}
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
            <button
              onClick={handleSend}
              disabled={!input.trim() || sending}
              style={{
                padding: '13px 20px', fontSize: 14, fontWeight: 600,
                fontFamily: 'DM Sans, sans-serif',
                background: input.trim() && !sending ? T.accent : '#E2E8F0',
                border: 'none', borderRadius: 14,
                color: input.trim() && !sending ? '#fff' : T.textDim,
                cursor: input.trim() && !sending ? 'pointer' : 'default',
                transition: 'all 0.2s',
                boxShadow: input.trim() && !sending ? `0 10px 24px ${T.accent}30` : 'none',
                display: 'flex', alignItems: 'center', gap: 7,
              }}
            >
              <Ico name="send" size={14} color={input.trim() && !sending ? '#fff' : T.textDim} />
              전송
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
