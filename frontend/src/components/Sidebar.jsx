import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { T } from '../constants/tokens'
import { Ico } from './Ico'

const NAV_ITEMS = [
  { id: 'chat',   icon: 'chat',   label: '채팅'     },
]

export function Sidebar({ active, onNav }) {
  const navigate = useNavigate()
  const { logout } = useAuth()

  return (
    <div style={{
      width: 64, flexShrink: 0,
      background: T.surface,
      borderRight: `1px solid ${T.border}`,
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '16px 0', gap: 2,
    }}>
      {/* Logo */}
      <div style={{
        width: 36, height: 36, borderRadius: 10, marginBottom: 20,
        background: `linear-gradient(135deg, ${T.accent}, ${T.accentMid})`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        boxShadow: `0 2px 8px ${T.accent}44`,
      }}>
        <Ico name="sparkle" size={18} color="#fff" strokeWidth={1.4} />
      </div>

      {NAV_ITEMS.map(item => (
        <button key={item.id} onClick={() => onNav(item.id)} title={item.label} style={{
          width: 44, height: 44, borderRadius: 10,
          background: active === item.id ? T.accentLight : 'transparent',
          border: `1px solid ${active === item.id ? T.accent + '33' : 'transparent'}`,
          cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', position: 'relative',
        }}
          onMouseEnter={e => { if (active !== item.id) e.currentTarget.style.background = T.surfaceAlt }}
          onMouseLeave={e => { if (active !== item.id) e.currentTarget.style.background = 'transparent' }}
        >
          <Ico name={item.icon} size={18} color={active === item.id ? T.accent : T.textMid} />
        </button>
      ))}

      <div style={{ flex: 1 }} />

      {/* 로그아웃 */}
      <button
        title="로그아웃"
        onClick={() => { logout(); navigate('/auth') }}
        style={{
          width: 38, height: 38, borderRadius: 10,
          background: 'transparent', border: '1px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          transition: 'all 0.15s', marginBottom: 6,
        }}
        onMouseEnter={e => { e.currentTarget.style.background = '#FEF2F2'; e.currentTarget.style.borderColor = '#EF444433' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'transparent' }}
      >
        <Ico name="logout" size={16} color={T.red} />
      </button>

      <div style={{ fontSize: 9, color: T.textDim, textAlign: 'center', padding: '0 4px' }}>
        <div style={{ width: 6, height: 6, borderRadius: '50%', background: T.success, margin: '0 auto 4px', boxShadow: `0 0 5px ${T.success}` }} />
        정상
      </div>
    </div>
  )
}
