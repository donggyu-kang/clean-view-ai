import { useState, useEffect } from 'react'
import { T } from '../constants/tokens'
import { PIPELINE, TOTAL_MS } from '../constants/mockData'
import { Ico } from './Ico'

export function TraceModal({ open, onClose }) {
  const [vis, setVis] = useState(false)

  useEffect(() => {
    if (open) setTimeout(() => setVis(true), 100)
    else setVis(false)
  }, [open])

  if (!open) return null

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 60,
      background: 'rgba(26,26,26,0.4)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      animation: 'fadeUp 0.2s both',
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        width: 640, maxWidth: '92vw',
        background: T.surface, borderRadius: 20,
        boxShadow: T.shadowLg, overflow: 'hidden',
        animation: 'fadeUp 0.22s both',
      }}>
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: `1px solid ${T.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: T.text, marginBottom: 4 }}>AI 답변 생성 과정</div>
              <div style={{ fontSize: 12, color: T.textMid }}>총 {TOTAL_MS}ms 걸려 답변을 만들었어요</div>
            </div>
            <button onClick={onClose} style={{
              width: 32, height: 32, borderRadius: 8,
              background: T.surfaceAlt, border: `1px solid ${T.border}`,
              cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <Ico name="close" size={14} color={T.textMid} />
            </button>
          </div>
        </div>

        {/* Steps */}
        <div style={{ padding: '24px 28px' }}>
          {PIPELINE.map((step, i) => {
            const off = (PIPELINE.slice(0, i).reduce((s, p) => s + p.ms, 0) / TOTAL_MS) * 100
            const w   = (step.ms / TOTAL_MS) * 100
            return (
              <div key={step.label} style={{ marginBottom: i < PIPELINE.length - 1 ? 18 : 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{ width: 32, height: 32, borderRadius: 8, background: T.accentLight, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Ico name={step.icon} size={16} color={T.accent} />
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: T.text }}>{step.label}</div>
                      <div style={{ fontSize: 11, color: T.textDim }}>{step.sub}</div>
                    </div>
                  </div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: T.textMid, fontFamily: 'DM Mono, monospace' }}>
                    {step.ms}ms
                  </div>
                </div>
                <div style={{ height: 8, background: T.surfaceAlt, borderRadius: 99, overflow: 'hidden', position: 'relative' }}>
                  <div style={{
                    position: 'absolute', left: `${off}%`, top: 0, bottom: 0,
                    width: vis ? `${w}%` : 0,
                    background: `linear-gradient(90deg, ${T.accent}66, ${T.accent})`,
                    borderRadius: 99,
                    transition: `width 0.9s ${i * 0.12}s cubic-bezier(0.22,1,0.36,1)`,
                    boxShadow: `0 0 8px ${T.accent}44`,
                  }} />
                </div>
                {i < PIPELINE.length - 1 && (
                  <div style={{ textAlign: 'center', fontSize: 11, color: T.textDim, marginTop: 6 }}>↓</div>
                )}
              </div>
            )
          })}
        </div>

        {/* Footer stats */}
        <div style={{ padding: '16px 28px 24px', borderTop: `1px solid ${T.border}`, display: 'flex' }}>
          {[
            { label: '총 소요 시간', val: `${TOTAL_MS}ms` },
            { label: '참고한 기억', val: '3개' },
            { label: '다른 대화에서', val: '2개' },
            { label: '사용된 토큰', val: '2,341' },
          ].map((s, i) => (
            <div key={s.label} style={{
              flex: 1, textAlign: 'center',
              borderRight: i < 3 ? `1px solid ${T.border}` : 'none',
            }}>
              <div style={{ fontSize: 11, color: T.textDim, marginBottom: 4 }}>{s.label}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: T.accent }}>{s.val}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
