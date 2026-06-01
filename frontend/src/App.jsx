import { useState, useCallback } from 'react'
import { useTweaks } from './hooks/useTweaks'
import { Sidebar } from './components/Sidebar'
import { MemoryDrawer } from './components/MemoryDrawer'
import { TraceModal } from './components/TraceModal'
import { ChatPage } from './pages/ChatPage'
import { blockSession } from './api/index'

const TWEAK_DEFAULTS = {
  accentColor: '#5B4FF5',
  warnColor:   '#F59E0B',
  fontSize:    14,
}

export function App() {
  const [tweaks]              = useTweaks(TWEAK_DEFAULTS)
  const [section, setSection]  = useState('chat')
  const [drawerOpen, setDrawer] = useState(false)
  const [traceOpen, setTrace]  = useState(false)
  const [memories, setMemories]           = useState([])
  const [highlightId, setHl]             = useState(null)
  const [currentSessionId, setCurrentSessionId] = useState(null)
  const [traceInfo, setTraceInfo]         = useState(null)

  // 세션 내 참조 기억 누적 — 응답마다 덮어쓰지 않고 새 항목만 추가
  // clear: true 이면 명시적 초기화 (새 채팅, 세션 전환)
  const handleNewMemories = useCallback((refs, { clear = false } = {}) => {
    if (clear) { setMemories([]); return }
    if (!refs.length) return
    setMemories(prev => {
      const existingIds = new Set(prev.map(m => m.id))
      const fresh = refs.filter(r => !existingIds.has(r.id))
      return fresh.length ? [...prev, ...fresh] : prev
    })
  }, [])

  const block = useCallback((id, fromRoomId) => {
    setMemories(ms => ms.map(m => m.id === id ? { ...m, blocked: true } : m))
    if (currentSessionId && fromRoomId) {
      blockSession(currentSessionId, fromRoomId).catch(console.error)
    }
  }, [currentSessionId])

  const locate = useCallback((id) => {
    setHl(id)
    setTimeout(() => setHl(null), 4000)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontSize: tweaks.fontSize }}>
      <Sidebar active={section} onNav={setSection} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {section === 'chat' && (
          <ChatPage
            onMemoryOpen={() => setDrawer(true)}
            memories={memories}
            highlightId={highlightId}
            onNewMemories={handleNewMemories}
            onSessionChange={setCurrentSessionId}
            onTraceData={setTraceInfo}
          />
        )}
      </div>

      <MemoryDrawer
        open={drawerOpen}
        onClose={() => setDrawer(false)}
        memories={memories}
        onBlock={block}
        onLocate={locate}
        onTraceOpen={() => { setDrawer(false); setTrace(true) }}
      />
      <TraceModal open={traceOpen} onClose={() => setTrace(false)} traceInfo={traceInfo} />
    </div>
  )
}
