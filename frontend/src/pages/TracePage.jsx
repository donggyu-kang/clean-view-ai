import { useState, useEffect } from 'react'
import { T } from '../constants/tokens'
import { PIPELINE } from '../constants/mockData'
import { Ico } from '../components/Ico'

export function TracePage({ trace }) {
  const [vis, setVis] = useState(false)
  useEffect(() => { setTimeout(() => setVis(true), 200) }, [])

  const steps        = trace?.steps    ?? PIPELINE.map(p => ({ ...p, actualMs: p.ms, status: 'done' }))
  const totalMs      = trace?.totalMs  ?? PIPELINE.reduce((s, p) => s + p.ms, 0)
  const traceStatus  = trace?.status   ?? 'done'
  const requestCount = trace?.requestCount ?? 0

  return (
    <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: T.bg }}>
      {/* Header */}
      <div style={{ padding: '20px 28px', borderBottom: `1px solid ${T.border}`, background: T.surface, flexShrink: 0 }}>
        <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 4 }}>AI 처리 과정</div>
        <div style={{ fontSize: 12, color: T.textMid }}>답변이 만들어지는 단계를 보여드려요</div>
      </div>

      <div style={{ flex: 1, overflowY: 'auto', padding: 28 }}>
        {/* Pipeline steps */}
        <div style={{
          display: 'flex', flexDirection: 'column', gap: 0, marginBottom: 32,
          background: T.surface, borderRadius: 16,
          border: `1px solid ${T.border}`, overflow: 'hidden', boxShadow: T.shadow,
        }}>
          {steps.map((step, i) => (
            <div key={step.label} style={{
              padding: '20px 24px',
              borderBottom: i < PIPELINE.length - 1 ? `1px solid ${T.border}` : 'none',
              animation: `fadeUp 0.4s ${i * 0.1}s both`,
            }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36, borderRadius: 9, position: 'relative',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: step.status === 'done' ? T.successLight : step.status === 'running' ? T.accentLight : T.surfaceAlt,
                  }}>
                    <Ico name={step.icon} size={18} color={step.status === 'done' ? T.success : step.status === 'running' ? T.accent : T.textDim} />
                    {step.status === 'running' && (
                      <div style={{ position: 'absolute', inset: 0, borderRadius: 9, border: `2px solid ${T.accent}`, animation: 'pulse 1s infinite' }} />
                    )}
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: T.text }}>{step.label}</div>
                    <div style={{ fontSize: 11, color: T.textDim, marginTop: 1 }}>{step.sub}</div>
                  </div>
                </div>
                <div style={{ fontFamily: 'DM Mono, monospace', fontSize: 13, fontWeight: 600, color: step.status === 'running' ? T.accent : step.status === 'done' ? T.success : T.textDim }}>
                  {step.status === 'pending' ? '—' : step.status === 'running' ? '처리 중...' : `${step.actualMs}ms`}
                </div>
              </div>
              <div style={{ height: 6, background: T.surfaceAlt, borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                <div style={{
                  position: 'absolute', left: 0, top: 0, bottom: 0,
                  width: step.status === 'done' ? '100%' : step.status === 'running' ? '60%' : '0%',
                  background: step.status === 'done'
                    ? `linear-gradient(90deg,${T.accent}88,${T.success})`
                    : step.status === 'running'
                      ? `linear-gradient(90deg,${T.accent}66,${T.accent})`
                      : T.surfaceAlt,
                  borderRadius: 99,
                  transition: 'width 0.6s cubic-bezier(0.22,1,0.36,1)',
                  animation: step.status === 'running' ? 'shimmer 1.2s infinite' : 'none',
                }} />
              </div>
            </div>
          ))}
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(160px,1fr))', gap: 14 }}>
          {[
            { label: '총 소요 시간', val: traceStatus === 'idle' ? '—' : `${totalMs}ms`, icon: 'clock',   color: T.accent  },
            { label: '참고한 기억', val: '3개',                                            icon: 'memory',  color: T.accent  },
            { label: '처리된 요청', val: requestCount > 0 ? `${requestCount}회` : '—',    icon: 'warning', color: T.warn    },
            { label: '사용된 토큰', val: '2,341',                                          icon: 'file',    color: T.textMid },
          ].map(s => (
            <div key={s.label} style={{ background: T.surface, border: `1px solid ${T.border}`, borderRadius: 14, padding: '18px 20px', boxShadow: T.shadow, animation: 'fadeUp 0.4s both' }}>
              <div style={{ width: 36, height: 36, borderRadius: 9, background: `${s.color}12`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 8 }}>
                <Ico name={s.icon} size={18} color={s.color} />
              </div>
              <div style={{ fontSize: 11, color: T.textDim, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 20, fontWeight: 700, color: s.color }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
