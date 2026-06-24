import React from 'react'
import { DIRS, DIR_ORDER } from '../constants.js'
import { INPUT_STYLE } from '../utils.js'

const NAVY = '#0a2240'

const keyBase = {
  height: '62px',
  borderRadius: '18px',
  background: 'rgba(255,255,255,0.45)',
  backdropFilter: 'blur(16px) saturate(180%)',
  WebkitBackdropFilter: 'blur(16px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.6)',
  fontSize: '24px',
  fontWeight: '500',
  color: NAVY,
  cursor: 'pointer',
  boxShadow: '0 6px 18px -10px rgba(11,34,64,0.3)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center'
}

export default function LoginScreen({ selUser, onSelectUser, pin, onKey, onBack }) {
  const dots = [0, 1, 2, 3]
  const keys = ['1','2','3','4','5','6','7','8','9',null,'0','⌫']

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(10,34,64,0.55)',
        backdropFilter: 'blur(24px) saturate(180%)',
        WebkitBackdropFilter: 'blur(24px) saturate(180%)',
        borderBottom: '1px solid rgba(255,255,255,0.12)',
        color: '#fff',
        padding: '18px 16px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '10px',
        flexShrink: 0
      }}>
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
        </svg>
        <span style={{ fontSize: '17px', fontWeight: '700', letterSpacing: '.01em' }}>Director Tracker</span>
      </div>

      {/* Body */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '30px 28px', display: 'flex', flexDirection: 'column' }}>
        {/* User select */}
        <div style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Select user</div>
        <select
          value={selUser}
          onChange={e => onSelectUser(e.target.value)}
          style={{ ...INPUT_STYLE, marginBottom: '32px' }}
        >
          <option value="">— select —</option>
          {DIR_ORDER.map(id => (
            <option key={id} value={id}>{DIRS[id].name} · {DIRS[id].entity}</option>
          ))}
          <option value="admin">Admin / PA · HiFive Holdings</option>
        </select>

        {/* PIN dots */}
        <div style={{ textAlign: 'center', fontSize: '14px', color: '#4b5563', marginBottom: '18px' }}>
          Enter your 4-digit PIN
        </div>
        <div style={{ display: 'flex', gap: '18px', justifyContent: 'center', marginBottom: '30px' }}>
          {dots.map(i => (
            <div key={i} style={{
              width: '15px',
              height: '15px',
              borderRadius: '50%',
              background: i < pin.length ? NAVY : 'transparent',
              border: `2px solid ${i < pin.length ? NAVY : '#c9c5ba'}`,
              transition: 'all 0.15s ease'
            }} />
          ))}
        </div>

        {/* Numpad */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(3, 1fr)',
          gap: '13px',
          maxWidth: '268px',
          margin: '0 auto',
          width: '100%'
        }}>
          {keys.map((k, i) => {
            if (k === null) return <div key={i} />
            if (k === '⌫') return (
              <button key={i} onClick={onBack} style={{ ...keyBase, fontSize: '20px' }}>⌫</button>
            )
            return (
              <button key={i} onClick={() => onKey(k)} style={keyBase}>{k}</button>
            )
          })}
        </div>

        <div style={{ textAlign: 'center', marginTop: '26px', fontSize: '12px', color: '#9a958a' }}>
          Demo — any 4 digits unlock
        </div>
      </div>
    </div>
  )
}
