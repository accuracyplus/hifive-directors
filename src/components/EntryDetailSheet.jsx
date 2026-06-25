import React, { useState } from 'react'
import { DIRS, TYPES, STATUS, PRIORITY, ENTITIES, REMINDERS } from '../constants.js'
import { chipStyle, pillStyle, INPUT_STYLE, BTN_PRIMARY, TOP_BAR } from '../utils.js'

const TYPE_LIST   = ['meeting','task','sitevisit','appointment','deadline']
const PRIORITY_LIST = ['high','medium','low']
const STATUS_LIST = ['scheduled','completed','cancelled']

const STATUS_COLORS = {
  scheduled: { border:'#0f6e56', bg:'rgba(15,110,86,0.08)' },
  completed:  { border:'#6b7280', bg:'rgba(107,114,128,0.08)' },
  cancelled:  { border:'#c0392b', bg:'rgba(192,57,43,0.08)' },
}

export default function EntryDetailSheet({ entry, curUser, onClose, onSave, onStatusChange }) {
  const [editing, setEditing]   = useState(false)
  const [form,    setForm]      = useState({ ...entry })
  const [saving,  setSaving]    = useState(false)
  const [statusBusy, setStatusBusy] = useState(false)

  const dir = DIRS[entry.dir] || DIRS['ameen']
  const t   = TYPES[entry.type]
  const s   = STATUS[entry.status]

  const canEdit = curUser === 'admin' || curUser === entry.dir

  const isOverdue = entry.status === 'scheduled' && entry.date < new Date().toISOString().slice(0,10)

  async function handleSave() {
    if (!form.title.trim()) return
    setSaving(true)
    try {
      await onSave(entry.id, form)
      setEditing(false)
    } finally {
      setSaving(false)
    }
  }

  async function handleStatus(newStatus) {
    setStatusBusy(true)
    try { await onStatusChange(entry.id, newStatus) }
    finally { setStatusBusy(false) }
  }

  function field(label, children) {
    return (
      <div>
        <div style={{ fontSize:'11px', fontWeight:'600', color:'#9a958a', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.04em' }}>{label}</div>
        {children}
      </div>
    )
  }

  return (
    <div style={{
      position:'absolute', inset:0, zIndex:40,
      display:'flex', flexDirection:'column'
    }}>
      {/* Backdrop */}
      <div onClick={onClose} style={{ position:'absolute', inset:0, background:'rgba(10,34,64,0.35)', backdropFilter:'blur(4px)', WebkitBackdropFilter:'blur(4px)' }} />

      {/* Sheet — slides up from bottom */}
      <div style={{
        position:'absolute', bottom:0, left:0, right:0,
        background:'#f8fafc',
        backdropFilter:'blur(30px) saturate(180%)',
        WebkitBackdropFilter:'blur(30px) saturate(180%)',
        borderRadius:'24px 24px 0 0',
        boxShadow:'0 -20px 60px -10px rgba(10,34,64,0.3)',
        maxHeight:'88vh',
        display:'flex', flexDirection:'column'
      }}>
        {/* Handle */}
        <div style={{ display:'flex', justifyContent:'center', padding:'12px 0 4px' }}>
          <div style={{ width:'36px', height:'4px', borderRadius:'2px', background:'rgba(10,34,64,0.15)' }} />
        </div>

        {/* Header */}
        <div style={{
          display:'flex', alignItems:'center', justifyContent:'space-between',
          padding:'4px 18px 14px', borderBottom:'1px solid rgba(10,34,64,0.08)'
        }}>
          <div style={{ display:'flex', alignItems:'center', gap:'10px' }}>
            <div style={{
              width:'38px', height:'38px', borderRadius:'50%',
              background:dir.color, color:'#fff',
              display:'flex', alignItems:'center', justifyContent:'center',
              fontSize:'13px', fontWeight:'700'
            }}>{dir.initials}</div>
            <div>
              <div style={{ fontSize:'11px', color:dir.color, fontWeight:'700', textTransform:'uppercase', letterSpacing:'.04em' }}>{dir.name} · {dir.entity}</div>
              <div style={{ fontSize:'13px', color:'#6b7280', marginTop:'1px' }}>{entry.date}{entry.time ? ` · ${entry.time}` : ''}</div>
            </div>
          </div>
          <div style={{ display:'flex', gap:'8px', alignItems:'center' }}>
            {canEdit && !editing && (
              <button onClick={() => setEditing(true)} style={{
                background:'rgba(21,101,168,0.1)', border:'none', borderRadius:'10px',
                padding:'7px 14px', fontSize:'12px', fontWeight:'600', color:'#1565a8', cursor:'pointer'
              }}>Edit</button>
            )}
            <button onClick={onClose} style={{
              background:'rgba(10,34,64,0.08)', border:'none', borderRadius:'10px',
              padding:'7px 12px', fontSize:'18px', color:'#6b7280', cursor:'pointer', lineHeight:'1'
            }}>×</button>
          </div>
        </div>

        {/* Body */}
        <div style={{ flex:1, overflowY:'auto', padding:'18px 18px 28px', display:'flex', flexDirection:'column', gap:'16px' }}>

          {!editing ? (
            // ── VIEW MODE ─────────────────────────────────────────────────────
            <>
              {/* Title + overdue */}
              <div>
                <div style={{ fontSize:'20px', fontWeight:'700', color:'#1f2937', lineHeight:'1.3' }}>{entry.title}</div>
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px', marginTop:'10px' }}>
                  <span style={chipStyle(t.bg, t.fg)}>{t.label}</span>
                  <span style={chipStyle(s.bg, s.fg)}>{s.label}</span>
                  {entry.priority === 'high' && <span style={chipStyle(PRIORITY.high.bg, PRIORITY.high.fg)}>High priority</span>}
                  {isOverdue && <span style={chipStyle('#fef2f2','#991b1b')}>⚠ Overdue</span>}
                </div>
              </div>

              {/* Details grid */}
              <div style={{ display:'flex', flexDirection:'column', gap:'12px' }}>
                {entry.location && (
                  <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'16px', flexShrink:0, marginTop:'1px' }}>📍</span>
                    <span style={{ fontSize:'14px', color:'#374151' }}>{entry.location}</span>
                  </div>
                )}
                <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                  <span style={{ fontSize:'16px', flexShrink:0, marginTop:'1px' }}>🏢</span>
                  <span style={{ fontSize:'14px', color:'#374151' }}>{entry.entity}</span>
                </div>
                {entry.reminder && entry.reminder !== 'none' && (
                  <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'16px', flexShrink:0, marginTop:'1px' }}>🔔</span>
                    <span style={{ fontSize:'14px', color:'#374151' }}>
                      {entry.reminder === '1h' ? '1 hour before' : 'Same day AM'}
                    </span>
                  </div>
                )}
                {entry.created_by && (
                  <div style={{ display:'flex', gap:'10px', alignItems:'flex-start' }}>
                    <span style={{ fontSize:'16px', flexShrink:0, marginTop:'1px' }}>✍️</span>
                    <span style={{ fontSize:'14px', color:'#374151' }}>Added by {DIRS[entry.created_by]?.name || entry.created_by}</span>
                  </div>
                )}
              </div>

              {/* Status actions — only if can edit and not cancelled */}
              {canEdit && entry.status !== 'cancelled' && (
                <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
                  {entry.status === 'scheduled' && (
                    <button
                      onClick={() => handleStatus('completed')}
                      disabled={statusBusy}
                      style={{
                        flex:1, padding:'12px', border:'none', borderRadius:'14px',
                        background:'linear-gradient(180deg,#16a06d,#0f6e56)',
                        color:'#fff', fontWeight:'600', fontSize:'14px', cursor:'pointer',
                        boxShadow:'0 8px 20px -8px rgba(15,110,86,0.5)',
                        opacity: statusBusy ? 0.6 : 1
                      }}
                    >✓ Mark complete</button>
                  )}
                  {entry.status === 'completed' && (
                    <button
                      onClick={() => handleStatus('scheduled')}
                      disabled={statusBusy}
                      style={{
                        flex:1, padding:'12px', border:'1px solid #d1d5db', borderRadius:'14px',
                        background:'rgba(255,255,255,0.7)', color:'#374151',
                        fontWeight:'600', fontSize:'14px', cursor:'pointer',
                        opacity: statusBusy ? 0.6 : 1
                      }}
                    >↩ Reopen</button>
                  )}
                  <button
                    onClick={() => handleStatus('cancelled')}
                    disabled={statusBusy}
                    style={{
                      flex: entry.status === 'scheduled' ? '0 0 auto' : 1,
                      padding:'12px 16px', border:'1px solid rgba(192,57,43,0.3)',
                      borderRadius:'14px', background:'rgba(252,235,235,0.6)',
                      color:'#c0392b', fontWeight:'600', fontSize:'14px', cursor:'pointer',
                      opacity: statusBusy ? 0.6 : 1
                    }}
                  >Cancel</button>
                </div>
              )}
            </>
          ) : (
            // ── EDIT MODE ─────────────────────────────────────────────────────
            <>
              {field('Title',
                <input value={form.title} onChange={e=>setForm(f=>({...f,title:e.target.value}))} style={INPUT_STYLE} />
              )}
              {field('Type',
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {TYPE_LIST.map(tp => (
                    <button key={tp} onClick={() => setForm(f=>({...f,type:tp}))} style={pillStyle(form.type===tp)}>
                      {TYPES[tp].label}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px' }}>
                <div>
                  <div style={{ fontSize:'11px', fontWeight:'600', color:'#9a958a', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.04em' }}>Date</div>
                  <input type="date" value={form.date} onChange={e=>setForm(f=>({...f,date:e.target.value}))} style={INPUT_STYLE} />
                </div>
                <div>
                  <div style={{ fontSize:'11px', fontWeight:'600', color:'#9a958a', marginBottom:'6px', textTransform:'uppercase', letterSpacing:'.04em' }}>Time</div>
                  <input value={form.time} onChange={e=>setForm(f=>({...f,time:e.target.value}))} placeholder="10:00 AM" style={INPUT_STYLE} />
                </div>
              </div>
              {field('Location',
                <input value={form.location} onChange={e=>setForm(f=>({...f,location:e.target.value}))} style={INPUT_STYLE} />
              )}
              {field('Entity',
                <select value={form.entity} onChange={e=>setForm(f=>({...f,entity:e.target.value}))} style={INPUT_STYLE}>
                  {ENTITIES.map(en => <option key={en}>{en}</option>)}
                </select>
              )}
              {field('Priority',
                <div style={{ display:'flex', gap:'6px' }}>
                  {PRIORITY_LIST.map(p => (
                    <button key={p} onClick={() => setForm(f=>({...f,priority:p}))} style={pillStyle(form.priority===p)}>
                      {p.charAt(0).toUpperCase()+p.slice(1)}
                    </button>
                  ))}
                </div>
              )}
              {field('Reminder',
                <div style={{ display:'flex', flexWrap:'wrap', gap:'6px' }}>
                  {REMINDERS.map(r => (
                    <button key={r.id} onClick={() => setForm(f=>({...f,reminder:r.id}))} style={pillStyle(form.reminder===r.id)}>
                      {r.label}
                    </button>
                  ))}
                </div>
              )}
              <div style={{ display:'flex', gap:'8px', marginTop:'4px' }}>
                <button onClick={() => setEditing(false)} style={{
                  flex:1, padding:'13px', border:'1px solid #d1d5db', borderRadius:'14px',
                  background:'rgba(255,255,255,0.7)', color:'#374151', fontWeight:'600', fontSize:'14px', cursor:'pointer'
                }}>Cancel</button>
                <button onClick={handleSave} disabled={saving} style={{
                  ...BTN_PRIMARY, flex:2, borderRadius:'14px', opacity: saving ? 0.6 : 1
                }}>{saving ? 'Saving…' : 'Save changes'}</button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
