import { useState, useCallback } from 'react'
import { T } from './constants/tokens'
import { MEMORIES } from './constants/mockData'
import { useTweaks } from './hooks/useTweaks'
import { useTraceEngine } from './hooks/useTraceEngine'
import { Sidebar } from './components/Sidebar'
import { MemoryDrawer } from './components/MemoryDrawer'
import { TraceModal } from './components/TraceModal'
import { TweaksPanel, TweakColor, TweakSlider } from './components/TweaksPanel'
import { ChatPage } from './pages/ChatPage'
import { MemoryPage } from './pages/MemoryPage'
import { TracePage } from './pages/TracePage'

const TWEAK_DEFAULTS = {
  accentColor: '#5B4FF5',
  warnColor:   '#F59E0B',
  fontSize:    14,
}

export function App() {
  const [tweaks, setTweak]      = useTweaks(TWEAK_DEFAULTS)
  const [section, setSection]   = useState('chat')
  const [drawerOpen, setDrawer] = useState(false)
  const [traceOpen, setTrace]   = useState(false)
  const [memories, setMemories] = useState(MEMORIES)
  const [highlightId, setHl]    = useState(null)
  const { trace, runTrace }     = useTraceEngine()

  const block = useCallback((id) => {
    setMemories(ms => ms.map(m => m.id === id ? { ...m, blocked: true } : m))
  }, [])

  const locate = useCallback((id) => {
    setHl(id)
    setTimeout(() => setHl(null), 4000)
  }, [])

  return (
    <div style={{ width: '100vw', height: '100vh', display: 'flex', fontSize: tweaks.fontSize }}>
      <Sidebar active={section} onNav={setSection} traceStatus={trace.status} />

      <div style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
        {section === 'chat'   && <ChatPage onMemoryOpen={() => setDrawer(true)} memories={memories} highlightId={highlightId} onSend={runTrace} trace={trace} />}
        {section === 'memory' && <MemoryPage memories={memories} onBlock={block} />}
        {section === 'trace'  && <TracePage trace={trace} />}
      </div>

      <MemoryDrawer
        open={drawerOpen}
        onClose={() => setDrawer(false)}
        memories={memories}
        onBlock={block}
        onLocate={locate}
        onTraceOpen={() => { setDrawer(false); setTrace(true) }}
      />
      <TraceModal open={traceOpen} onClose={() => setTrace(false)} />

      <TweaksPanel>
        <TweakColor  label="포인트 컬러" value={tweaks.accentColor} onChange={v => setTweak('accentColor', v)} />
        <TweakColor  label="경고 컬러"   value={tweaks.warnColor}   onChange={v => setTweak('warnColor', v)} />
        <TweakSlider label="글자 크기"   value={tweaks.fontSize} min={12} max={18} step={1} onChange={v => setTweak('fontSize', v)} />
      </TweaksPanel>
    </div>
  )
}
