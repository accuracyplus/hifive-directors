import React, { useState } from 'react'
import { DIRS, DIR_ORDER } from '../constants.js'
import { TOP_BAR, INPUT_STYLE, BTN_PRIMARY } from '../utils.js'

export default function ProfileScreen({ curUser, waNumber, onWaChange, onChangePin, onAdminResetPin, onSignOut }) {
  const dir = DIRS[curUser] || DIRS['admin']
  const isAdmin = curUser === 'admin'

  const [curPin,  setCurPin]  = useState('')
  const [newPin,  setNewPin]  = useState('')
  const [confPin, setConfPin] = useState('')
  const [pinMsg,  setPinMsg]  = useState('')
  const [pinErr,  setPinErr]  = useState('')
  const [pinBusy, setPinBusy] = useState(false)

  const [waLocal, setWaLocal] = useState(waNumber)
  const [waMsg,   setWaMsg]   = useState('')

  // Admin reset state
  const [resetDir,    setResetDir]    = useState('')
  const [resetPin,    setResetPin]    = useState('')
  const [resetConf,   setResetConf]   = useState('')
  const [resetMsg,    setResetMsg]    = useState('')
  const [resetErr,    setResetErr]    = useState('')
  const [resetBusy,   setResetBusy]   = useState(false)

  async function handleUpdatePin() {
    setPinErr(''); setPinMsg('')
    if (!curPin||!newPin||!confPin) { setPinErr('All PIN fields required.'); return }
    if (!/^\d{4}$/.test(newPin))    { setPinErr('New PIN must be exactly 4 digits.'); return }
    if (newPin!==confPin)            { setPinErr('New PINs do not match.'); return }
    setPinBusy(true)
    try {
      const res = await onChangePin(curPin, newPin)
      if (res?.ok) { setCurPin(''); setNewPin(''); setConfPin(''); setPinMsg('✓ PIN updated') }
      else setPinErr(res?.error||'Update failed.')
    } catch(e) { setPinErr(e.message||'Update failed.') }
    finally { setPinBusy(false); setTimeout(()=>setPinMsg(''),4000) }
  }

  async function handleAdminReset() {
    setResetErr(''); setResetMsg('')
    if (!resetDir)                       { setResetErr('Select a director.'); return }
    if (!/^\d{4}$/.test(resetPin))       { setResetErr('PIN must be 4 digits.'); return }
    if (resetPin!==resetConf)            { setResetErr('PINs do not match.'); return }
    setResetBusy(true)
    try {
      const res = await onAdminResetPin(resetDir, resetPin)
      if (res?.ok) { setResetPin(''); setResetConf(''); setResetMsg(`✓ PIN reset for ${DIRS[resetDir]?.name}`) }
      else setResetErr(res?.error||'Reset failed.')
    } catch(e) { setResetErr(e.message||'Reset failed.') }
    finally { setResetBusy(false); setTimeout(()=>setResetMsg(''),4000) }
  }

  async function handleUpdateWa() {
    await onWaChange(waLocal)
    setWaMsg('✓ WhatsApp number updated')
    setTimeout(()=>setWaMsg(''),4000)
  }

  const section = (title, children) => (
    <div style={{ marginBottom:'28px' }}>
      <div style={{ fontSize:'13px', fontWeight:'700', color:'#1f2937', marginBottom:'12px' }}>{title}</div>
      {children}
    </div>
  )

  return (
    <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
      <div style={TOP_BAR}><div style={{ fontSize:'18px', fontWeight:'700' }}>Profile</div></div>

      <div style={{ flex:1, minHeight:0, overflowY:'auto', padding:'26px 22px 96px' }}>
        {/* Avatar */}
        <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'8px', marginBottom:'30px' }}>
          <div style={{ width:'80px', height:'80px', borderRadius:'50%', background:dir.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'28px', fontWeight:'700' }}>{dir.initials}</div>
          <div style={{ fontSize:'21px', fontWeight:'700', color:'#1f2937', marginTop:'4px' }}>{dir.name}</div>
          <div style={{ fontSize:'13px', color:'#6b7280' }}>{dir.role} · {dir.entity}</div>
        </div>

        {/* Change own PIN */}
        {!isAdmin && section('Change my PIN',
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <input type="password" placeholder="Current PIN" value={curPin}  onChange={e=>setCurPin(e.target.value)}  maxLength={4} style={INPUT_STYLE}/>
            <input type="password" placeholder="New PIN (4 digits)" value={newPin}   onChange={e=>setNewPin(e.target.value)}   maxLength={4} style={INPUT_STYLE}/>
            <input type="password" placeholder="Confirm new PIN"    value={confPin} onChange={e=>setConfPin(e.target.value)} maxLength={4} style={INPUT_STYLE}/>
            {pinErr&&<div style={{ fontSize:'12px', fontWeight:'600', color:'#c0392b' }}>{pinErr}</div>}
            {pinMsg&&<div style={{ fontSize:'12px', fontWeight:'600', color:'#0f6e56' }}>{pinMsg}</div>}
            <button onClick={handleUpdatePin} disabled={pinBusy} style={{...BTN_PRIMARY,opacity:pinBusy?0.6:1}}>{pinBusy?'Updating…':'Update PIN'}</button>
          </div>
        )}

        {/* Admin PIN reset — only for admin */}
        {isAdmin && section('Reset director PIN',
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <select value={resetDir} onChange={e=>setResetDir(e.target.value)} style={INPUT_STYLE}>
              <option value="">— select director —</option>
              {DIR_ORDER.map(id=><option key={id} value={id}>{DIRS[id].name} · {DIRS[id].entity}</option>)}
            </select>
            <input type="password" placeholder="New PIN (4 digits)"  value={resetPin}  onChange={e=>setResetPin(e.target.value)}  maxLength={4} style={INPUT_STYLE}/>
            <input type="password" placeholder="Confirm new PIN"     value={resetConf} onChange={e=>setResetConf(e.target.value)} maxLength={4} style={INPUT_STYLE}/>
            {resetErr&&<div style={{ fontSize:'12px', fontWeight:'600', color:'#c0392b' }}>{resetErr}</div>}
            {resetMsg&&<div style={{ fontSize:'12px', fontWeight:'600', color:'#0f6e56' }}>{resetMsg}</div>}
            <button onClick={handleAdminReset} disabled={resetBusy} style={{...BTN_PRIMARY,opacity:resetBusy?0.6:1}}>{resetBusy?'Resetting…':'Reset PIN'}</button>
          </div>
        )}

        {/* WhatsApp */}
        {section('My WhatsApp number',
          <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
            <input type="tel" value={waLocal} onChange={e=>setWaLocal(e.target.value)} placeholder="+971 50 000 0000" style={INPUT_STYLE}/>
            {waMsg&&<div style={{ fontSize:'12px', fontWeight:'600', color:'#0f6e56' }}>{waMsg}</div>}
            <button onClick={handleUpdateWa} style={BTN_PRIMARY}>Update number</button>
          </div>
        )}

        {/* Sign out */}
        <button onClick={onSignOut} style={{ width:'100%', padding:'14px', border:'1px solid rgba(192,57,43,0.5)', borderRadius:'16px', background:'rgba(252,235,235,0.6)', backdropFilter:'blur(14px)', WebkitBackdropFilter:'blur(14px)', color:'#c0392b', fontSize:'15px', fontWeight:'600', cursor:'pointer' }}>
          Sign out
        </button>
      </div>
    </div>
  )
}
