import { useState, useCallback } from 'react'

const STEPS_TEMPLATE = [
  { label: '요청 수신',   sub: 'Spring Boot', icon: 'inbox',  baseMs: 38  },
  { label: '기억 검색',   sub: 'FastAPI',     icon: 'search', baseMs: 124 },
  { label: '유사도 계산', sub: 'pgvector',    icon: 'cpu',    baseMs: 89  },
  { label: '답변 생성',   sub: 'GPT-4o',      icon: 'zap',    baseMs: 921 },
]

const fresh = () =>
  STEPS_TEMPLATE.map(s => ({
    ...s,
    actualMs: Math.round(s.baseMs * (0.7 + Math.random() * 0.7)),
    status: 'pending', // 'pending' | 'running' | 'done'
  }))

export function useTraceEngine() {
  const [trace, setTrace] = useState({
    status: 'idle', // 'idle' | 'running' | 'done'
    steps: fresh(),
    totalMs: 0,
    requestCount: 0,
    requestText: '',
    startedAt: null,
  })

  const runTrace = useCallback((requestText) => {
    const steps = fresh()
    setTrace(t => ({
      status: 'running',
      steps: steps.map(s => ({ ...s, status: 'pending' })),
      totalMs: 0,
      requestCount: t.requestCount + 1,
      requestText,
      startedAt: Date.now(),
    }))

    let delay = 0
    steps.forEach((step, i) => {
      // 단계 시작
      setTimeout(() => {
        setTrace(t => ({
          ...t,
          steps: t.steps.map((s, j) => (j === i ? { ...s, status: 'running' } : s)),
        }))
      }, delay)

      delay += step.actualMs

      // 단계 완료
      const d = delay
      setTimeout(() => {
        setTrace(t => {
          const newSteps = t.steps.map((s, j) => (j === i ? { ...s, status: 'done' } : s))
          const allDone  = newSteps.every(s => s.status === 'done')
          return {
            ...t,
            steps: newSteps,
            totalMs: newSteps.filter(s => s.status === 'done').reduce((acc, s) => acc + s.actualMs, 0),
            status: allDone ? 'done' : 'running',
          }
        })
      }, d)
    })
  }, [])

  return { trace, runTrace }
}
