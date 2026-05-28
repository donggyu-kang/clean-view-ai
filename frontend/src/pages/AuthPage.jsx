import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { T } from '../constants/tokens'
import { Ico } from '../components/Ico'

const inputStyle = {
  width: '100%', padding: '12px 14px',
  background: 'rgba(255,255,255,0.6)', border: `1.5px solid rgba(255,255,255,0.8)`,
  borderRadius: 10, fontSize: 14,
  fontFamily: 'DM Sans, sans-serif', color: T.text, outline: 'none',
  transition: 'border-color 0.2s, box-shadow 0.2s',
  boxSizing: 'border-box',
}

export function AuthPage() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [mode, setMode]         = useState('login')
  const [email, setEmail]       = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm]   = useState('')
  const [name, setName]         = useState('')
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState('')

  const switchMode = (next) => {
    setMode(next)
    setEmail(''); setPassword(''); setConfirm(''); setName(''); setError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup' && password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.')
      return
    }

    setLoading(true)
    try {
      const url = mode === 'login' ? '/api/v1/auth/login' : '/api/v1/auth/signup'
      const body = mode === 'login' ? { email, password } : { name, email, password }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()
      if (!res.ok) {
        setError(data.message || '요청에 실패했습니다.')
        return
      }

      login(data.token, data.name, data.email)
      navigate('/')
    } catch {
      setError('서버에 연결할 수 없습니다.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      width: '100vw', height: '100vh',
      display: 'flex',
      fontFamily: 'DM Sans, sans-serif',
      overflow: 'hidden',
    }}>
      {/* 왼쪽 — 배경 이미지 + 소개 문구 */}
      <div style={{
        flex: 1,
        position: 'relative',
        backgroundImage: 'url(/auth-bg.jpg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center 65%',
      }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(91,79,245,0.45) 0%, rgba(0,0,0,0.25) 100%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          display: 'flex', flexDirection: 'column',
          justifyContent: 'flex-end',
          padding: '48px 52px',
        }}>
          <div style={{
            fontSize: 28, fontWeight: 700,
            color: '#fff', lineHeight: 1.4,
            marginBottom: 12,
            textShadow: '0 2px 12px rgba(0,0,0,0.3)',
          }}>
            AI가 기억하는 방식,<br />투명하게 확인하세요.
          </div>
          <div style={{
            fontSize: 14, color: 'rgba(255,255,255,0.75)',
            lineHeight: 1.6,
            textShadow: '0 1px 6px rgba(0,0,0,0.2)',
          }}>
            Clean View AI는 AI가 어떤 기억을 참조해<br />답변을 생성했는지 직접 추적할 수 있습니다.
          </div>
        </div>
      </div>

      {/* 오른쪽 — 폼 */}
      <div style={{
        width: 480,
        background: '#C8D3DF',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 48px',
        flexShrink: 0,
        position: 'relative',
      }}>

        <div style={{ width: '100%', maxWidth: 360, position: 'relative' }}>
          {/* Logo */}
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: `linear-gradient(135deg, ${T.accent}, ${T.accentMid})`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
            boxShadow: `0 4px 14px ${T.accent}55`,
          }}>
            <Ico name="sparkle" size={22} color="#fff" strokeWidth={1.4} />
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, color: T.text, textAlign: 'center', marginBottom: 6 }}>
            Clean View AI
          </div>
          <div style={{ fontSize: 13, color: T.textMid, textAlign: 'center', marginBottom: 28, lineHeight: 1.5 }}>
            {mode === 'login' ? '투명한 AI 메모리 관리 서비스에 오신 걸 환영해요' : '새 계정을 만들어 시작하세요'}
          </div>

          {/* 서버 상태 뱃지 */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            background: 'rgba(236,253,245,0.8)', border: `1px solid #6EE7B7`,
            borderRadius: 99, padding: '4px 14px',
            fontSize: 11, color: '#065F46', fontWeight: 500,
            margin: '0 auto 28px', width: 'fit-content',
          }}>
            <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success }} />
            서버 정상 운영 중
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {mode === 'signup' && (
              <div style={{ marginBottom: 16 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 7 }}>
                  이름
                </label>
                <input
                  type="text" required
                  value={name} onChange={e => setName(e.target.value)}
                  placeholder="홍길동"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accent}1e`; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.7)' }}
                />
              </div>
            )}

            <div style={{ marginBottom: 16 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 7 }}>
                이메일
              </label>
              <input
                type="email" required
                value={email} onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accent}1e`; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.7)' }}
              />
            </div>

            <div style={{ marginBottom: mode === 'signup' ? 16 : 8 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 7 }}>
                비밀번호
              </label>
              <input
                type="password" required
                value={password} onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                style={inputStyle}
                onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accent}1e`; e.target.style.background = '#fff' }}
                onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.7)' }}
              />
            </div>

            {mode === 'signup' && (
              <div style={{ marginBottom: 8 }}>
                <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: T.text, marginBottom: 7 }}>
                  비밀번호 확인
                </label>
                <input
                  type="password" required
                  value={confirm} onChange={e => setConfirm(e.target.value)}
                  placeholder="••••••••"
                  style={inputStyle}
                  onFocus={e => { e.target.style.borderColor = T.accent; e.target.style.boxShadow = `0 0 0 3px ${T.accent}1e`; e.target.style.background = '#fff' }}
                  onBlur={e => { e.target.style.borderColor = T.border; e.target.style.boxShadow = 'none'; e.target.style.background = 'rgba(255,255,255,0.7)' }}
                />
              </div>
            )}

            {error && (
              <div style={{
                padding: '10px 14px', marginTop: 8,
                background: 'rgba(239,68,68,0.1)', border: `1px solid rgba(239,68,68,0.3)`,
                borderRadius: 8, fontSize: 12, color: T.red,
              }}>
                {error}
              </div>
            )}

            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px 0', marginTop: 16,
              background: loading ? T.accentMid : T.accent,
              border: 'none', borderRadius: 10,
              color: '#fff', fontSize: 14, fontWeight: 600,
              fontFamily: 'DM Sans, sans-serif',
              cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.2s',
              boxShadow: `0 2px 10px ${T.accent}44`,
            }}
              onMouseEnter={e => { if (!loading) { e.currentTarget.style.background = '#4A3FE4'; e.currentTarget.style.transform = 'translateY(-1px)'; e.currentTarget.style.boxShadow = `0 4px 18px ${T.accent}55` } }}
              onMouseLeave={e => { e.currentTarget.style.background = T.accent; e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = `0 2px 10px ${T.accent}44` }}
            >
              {loading ? (mode === 'login' ? '로그인 중...' : '가입 중...') : (mode === 'login' ? '로그인' : '회원가입')}
            </button>
          </form>

          <div style={{ textAlign: 'center', fontSize: 12, color: T.textMid, marginTop: 24 }}>
            {mode === 'login' ? (
              <>계정이 없으신가요?{' '}
                <a href="#" onClick={e => { e.preventDefault(); switchMode('signup') }}
                  style={{ color: T.accent, textDecoration: 'none', fontWeight: 500 }}>회원가입</a>
              </>
            ) : (
              <>이미 계정이 있으신가요?{' '}
                <a href="#" onClick={e => { e.preventDefault(); switchMode('login') }}
                  style={{ color: T.accent, textDecoration: 'none', fontWeight: 500 }}>로그인</a>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
