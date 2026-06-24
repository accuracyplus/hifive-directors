import React, { useState } from 'react'
import { DIRS } from '../constants.js'
import { TOP_BAR, INPUT_STYLE, BTN_PRIMARY } from '../utils.js'

export default function ProfileScreen({ curUser, waNumber, onWaChange, onSignOut }) {
  const dir = DIRS[curUser] || DIRS['admin']
  const [curPin, setCurPin]   = useState('')
  const [newPin, setNewPin]   = useState('')
  const [confPin, setConfPin] = useState('')
  const [pinMsg, setPinMsg]   = useState('')
  const [waMsg, setWaMsg]     = useState('')
  const [waLocal, setWaLocal] = useState(waNumber)

  function handleUpdatePin() {
    if (!curPin || !newPin || !confPin) { setPinMsg('All PIN fields are required.'); return }
    if (!/^\d{4}$/.test(newPin))        { setPinMsg('New PIN must be 4 digits.'); return }
    if (newPin !== confPin)              { setPinMsg('PINs do not match.'); return }
    setCurPin(''); setNewPin(''); setConfPin('')
    setPinMsg('✓ PIN updated successfully')
    setTimeout(() => setPinMsg(''), 3000)
  }

  function handleUpdateWa() {
    onWaChange(waLocal)
    setWaMsg('✓ WhatsApp number updated')
    setTimeout(() => setWaMsg(''), 3000)
  }

  const section = (title, children) => (
    <div style={{ marginBottom: '28px' }}>
      <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={TOP_BAR}>
        <div style={{ fontSize: '18px', fontWeight: '700' }}>Profile</div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '26px 22px 96px' }}>
        {/* Avatar */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', marginBottom: '30px' }}>
          <div style={{
            width: '80px', height: '80px', borderRadius: '50%',
            background: dir.color, color: '#fff',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '28px', fontWeight: '700'
          }}>{dir.initials}</div>
          <div style={{ fontSize: '21px', fontWeight: '700', color: '#1f2937', marginTop: '4px' }}>{dir.name}</div>
          <div style={{ fontSize: '13px', color: '#6b7280' }}>{dir.role} · {dir.entity}</div>
        </div>

        {/* Change PIN */}
        {section('Change PIN',
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input type="password" placeholder="Current PIN" value={curPin}  onChange={e => setCurPin(e.target.value)}  maxLength={4} style={INPUT_STYLE} />
            <input type="password" placeholder="New PIN (4 digits)" value={newPin}   onChange={e => setNewPin(e.target.value)}   maxLength={4} style={INPUT_STYLE} />
            <input type="password" placeholder="Confirm new PIN"    value={confPin} onChange={e => setConfPin(e.target.value)} maxLength={4} style={INPUT_STYLE} />
            {pinMsg && (
              <div style={{ fontSize: '12px', fontWeight: '600', color: pinMsg.startsWith('✓') ? '#0f6e56' : '#c0392b' }}>
                {pinMsg}
              </div>
            )}
            <button onClick={handleUpdatePin} style={BTN_PRIMARY}>Update PIN</button>
          </div>
        )}

        {/* WhatsApp */}
        {section('WhatsApp number',
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <input
              type="tel"
              value={waLocal}
              onChange={e => setWaLocal(e.target.value)}
              placeholder="+971 50 000 0000"
              style={INPUT_STYLE}
            />
            {waMsg && (
              <div style={{ fontSize: '12px', fontWeight: '600', color: '#0f6e56' }}>{waMsg}</div>
            )}
            <button onClick={handleUpdateWa} style={BTN_PRIMARY}>Update number</button>
          </div>
        )}

        {/* Sign out */}
        <button
          onClick={onSignOut}
          style={{
            width: '100%', padding: '14px',
            border: '1px solid rgba(192,57,43,0.5)',
            borderRadius: '16px',
            background: 'rgba(252,235,235,0.6)',
            backdropFilter: 'blur(14px)',
            WebkitBackdropFilter: 'blur(14px)',
            color: '#c0392b',
            fontSize: '15px', fontWeight: '600', cursor: 'pointer'
          }}
        >Sign out</button>
      </div>
    </div>
  )
}
