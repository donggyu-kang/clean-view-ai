import { useState } from 'react'
import { T } from '../constants/tokens'
import { MemoryCard } from '../components/MemoryCard'

const FILTERS = ['전체', '다른 대화', '현재 대화', '차단됨']

export function MemoryPage({ memories, onBlock }) {
  const [filter, setFilter] = useState('전체')

  const shown = memories.filter(m => {
    if (filter === '다른 대화') return !m.isCurrent
    if (filter === '현재 대화') return m.isCurrent
    if (filter === '차단됨')   return m.blocked
    return true
  })

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg }}>
      {/* Header */}
      <div style={{
        padding: '20px 28px', flexShrink: 0,
        borderBottom: `1px solid ${T.border}`, background: T.surface,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div>
          <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 4 }}>내 기억 관리</div>
          <div style={{ fontSize: 12, color: T.textMid }}>AI가 참고하는 나의 대화 기록을 확인하고 관리해요</div>
        </div>
        <div style={{ display: 'flex', gap: 5 }}>
          {FILTERS.map(f => (
            <button key={f} onClick={() => setFilter(f)} style={{
              padding: '6px 14px', fontSize: 12, fontWeight: 500,
              fontFamily: 'DM Sans, sans-serif',
              background: filter === f ? T.accent : T.bg,
              border: `1px solid ${filter === f ? T.accent : T.border}`,
              borderRadius: 99, color: filter === f ? '#fff' : T.textMid,
              cursor: 'pointer', transition: 'all 0.15s',
            }}>
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div style={{
        flex: 1, overflowY: 'auto', padding: 28,
        display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))',
        gap: 14, alignContent: 'start',
      }}>
        {shown.map((mem, i) => (
          <MemoryCard key={mem.id} mem={mem} idx={i} onBlock={onBlock} onLocate={() => {}} />
        ))}
      </div>
    </div>
  )
}
