import { useState, useEffect } from 'react'
import { T } from '../constants/tokens'
import { PIPELINE, TOTAL_MS, EMBEDDING_SPAN } from '../constants/mockData'
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

        {/* Embedding span detail */}
        <div style={{ padding: '4px 28px 20px' }}>
          <div style={{
            background: T.surfaceAlt,
            borderRadius: 12,
            border: `1px solid ${T.border}`,
            overflow: 'hidden',
          }}>
            <div style={{
              padding: '9px 14px',
              borderBottom: `1px solid ${T.border}`,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: T.accent, flexShrink: 0 }} />
              <span style={{ fontSize: 12, fontWeight: 600, color: T.textMid, flex: 1 }}>
                기억 검색 분석
              </span>
              <span style={{ fontSize: 11, fontWeight: 700, fontFamily: 'DM Mono, monospace', color: T.accent }}>
                {EMBEDDING_SPAN.latency_ms}ms
              </span>
            </div>
            <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 7 }}>
              {[
                ['분석 모델',      EMBEDDING_SPAN.attributes.model_name],
                ['질문 글자 수',   `${EMBEDDING_SPAN.attributes.input_text_length}자`],
                ['처리 토큰 수',   `${EMBEDDING_SPAN.attributes.token_usage}개`],
                ['의미 벡터 크기', `${EMBEDDING_SPAN.attributes.dimensions}차원`],
                ['소요 시간',     `${EMBEDDING_SPAN.latency_ms}ms`],
              ].map(([key, val]) => (
                <div key={key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
                  <span style={{ fontSize: 12, color: T.textMid }}>{key}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, fontFamily: 'DM Mono, monospace', color: T.text }}>{val}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Footer stats */}
        <div style={{ padding: '16px 28px 24px', borderTop: `1px solid ${T.border}`, display: 'flex' }}>
          {[
            { label: '총 소요 시간',  val: `${TOTAL_MS}ms` },
            { label: '참고한 기억',  val: '3개' },
            { label: '다른 대화에서', val: '2개' },
            { label: '임베딩 토큰',  val: `${EMBEDDING_SPAN.attributes.token_usage}` },
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
