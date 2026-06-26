import React, { useState, useRef } from 'react'
import { DIRS, DIR_ORDER, TYPES, ENTITIES, REMINDERS } from '../constants.js'
import { pillStyle, INPUT_STYLE, BTN_PRIMARY } from '../utils.js'

const TYPE_LIST   = ['meeting','task','sitevisit','appointment','deadline']
const PRIORITY_LIST=['high','medium','low']
const REMINDER_OPTS=[
  {id:'15m',label:'15 min before'},
  {id:'1h', label:'1 hour before'},
  {id:'amday',label:'Same day 7 AM'},
  {id:'1day',label:'1 day before'},
  {id:'none',label:'No reminder'}
]

// ── NLP parser: "Meeting with Ameen tomorrow at 10am at Herbal Park" ──────────
function nlpParse(text, today) {
  const lower = text.toLowerCase()
  const result = {}

  // Type detection
  if (/\bmeeting\b/.test(lower))     result.type='meeting'
  else if (/\btask\b|\bdo\b|\bcomplete\b/.test(lower)) result.type='task'
  else if (/\bvisit\b/.test(lower))  result.type='sitevisit'
  else if (/\bappointment\b|\bappt\b/.test(lower)) result.type='appointment'
  else if (/\bdeadline\b|\bdue\b|\bsubmit\b/.test(lower)) result.type='deadline'

  // Date detection
  const todayDate = new Date(today+'T00:00:00')
  if (/\btoday\b/.test(lower)) {
    result.date = today
  } else if (/\btomorrow\b/.test(lower)) {
    const d = new Date(todayDate); d.setDate(d.getDate()+1)
    result.date = d.toISOString().slice(0,10)
  } else if (/\bnext week\b/.test(lower)) {
    const d = new Date(todayDate); d.setDate(d.getDate()+7)
    result.date = d.toISOString().slice(0,10)
  } else {
    // Try "on Monday", "on 25th", etc.
    const days=['sunday','monday','tuesday','wednesday','thursday','friday','saturday']
    const dayMatch = days.findIndex(d=>lower.includes(d))
    if (dayMatch>=0) {
      const d=new Date(todayDate)
      const diff=(dayMatch-d.getDay()+7)%7||7
      d.setDate(d.getDate()+diff)
      result.date=d.toISOString().slice(0,10)
    }
  }

  // Time detection
  const timeMatch = text.match(/\b(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i)
  if (timeMatch) {
    const h=timeMatch[1], mn=timeMatch[2]||'00', ampm=timeMatch[3]
    result.time = `${h}:${mn} ${ampm.toUpperCase()}`
  }

  // Entity detection
  const entityMap = {
    'apml':'APML','herbal park':'Herbal Park','atomic':'Atomic Drugstore',
    'pine pharmacy':'Pine Pharmacy','pine':'Pine Pharmacy',
    'al jebal':'Al Jebal Opticals','jebal':'Al Jebal Opticals','opticals':'Al Jebal Opticals',
    'hifive':'Group / HiFive','group':'Group / HiFive'
  }
  for (const [key,val] of Object.entries(entityMap)) {
    if (lower.includes(key)){ result.entity=val; break }
  }

  // Assignee detection
  const dirNames={ameen:'ameen',junaid:'junaid',praveen:'praveen',sajeed:'sajeed',suhail:'suhail'}
  const foundDirs=[]
  for (const [name,id] of Object.entries(dirNames)) {
    if (lower.includes(name)) foundDirs.push(id)
  }
  if (foundDirs.length) result.assignees=foundDirs

  // Title: strip detected keywords to get clean title
  let title = text
    .replace(/\b(meeting|task|visit|appointment|deadline|with|at|on|tomorrow|today|next week|am|pm|\d{1,2}(:\d{2})?\s*(am|pm))/gi,'')
    .replace(new RegExp(Object.keys(entityMap).join('|'),'gi'),'')
    .replace(new RegExp(Object.keys(dirNames).join('|'),'gi'),'')
    .replace(/\s+/g,' ').trim()
  if (title) result.title = title.charAt(0).toUpperCase()+title.slice(1)

  return result
}

export default function AddEntrySheet({ curUser, form, onChange, onToggleAssignee, onSave, onCancel }) {
  const curDir = DIRS[curUser] || DIRS['ameen']
  const [nlpText, setNlpText] = useState('')
  const [nlpActive, setNlpActive] = useState(false)
  const [nlpParsed, setNlpParsed] = useState(null)
  const inputRef = useRef(null)

  function applyNlp() {
    if (!nlpText.trim()) return
    const parsed = nlpParse(nlpText, form.date)
    setNlpParsed(parsed)
    Object.entries(parsed).forEach(([k,v])=>{
      if (k==='assignees') { /* handle separately */ return }
      onChange(k,v)
    })
    if (parsed.assignees) {
      // Reset and set
      DIR_ORDER.forEach(id=>{
        const inNew=parsed.assignees.includes(id)
        const inCurr=form.assignees.includes(id)
        if (inNew&&!inCurr) onToggleAssignee(id)
        if (!inNew&&inCurr) onToggleAssignee(id)
      })
    }
    setNlpActive(false)
    setNlpText('')
  }

  function label(text) {
    return <div style={{fontSize:'11px',fontWeight:'800',color:'#94a3b8',marginBottom:'7px',letterSpacing:'.06em',textTransform:'uppercase'}}>{text}</div>
  }

  return (
    <div style={{position:'absolute',inset:0,zIndex:30,display:'flex',flexDirection:'column'}}>
      {/* Backdrop */}
      <div onClick={onCancel} style={{position:'absolute',inset:0,background:'rgba(15,23,42,0.4)',backdropFilter:'blur(4px)'}}/>

      {/* Sheet */}
      <div style={{position:'absolute',bottom:0,left:0,right:0,background:'#f8fafc',borderRadius:'24px 24px 0 0',boxShadow:'0 -20px 60px -10px rgba(15,23,42,0.25)',maxHeight:'92vh',display:'flex',flexDirection:'column'}}>
        {/* Handle */}
        <div style={{display:'flex',justifyContent:'center',padding:'10px 0 2px'}}>
          <div style={{width:'36px',height:'4px',borderRadius:'2px',background:'#e2e8f0'}}/>
        </div>

        {/* Header */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'6px 18px 14px',borderBottom:'1px solid #f1f5f9'}}>
          <div style={{fontSize:'18px',fontWeight:'900',color:'#0a2240'}}>New entry</div>
          <button onClick={onCancel} style={{background:'#f1f5f9',border:'none',borderRadius:'10px',padding:'6px 12px',fontSize:'13px',fontWeight:'700',color:'#64748b',cursor:'pointer'}}>Cancel</button>
        </div>

        {/* Form */}
        <div style={{flex:1,overflowY:'auto',padding:'16px 18px 32px',display:'flex',flexDirection:'column',gap:'16px'}}>

          {/* Smart NLP bar */}
          <div style={{background:'linear-gradient(135deg,#0a2240,#1565a8)',borderRadius:'18px',padding:'14px 16px'}}>
            <div style={{fontSize:'11px',fontWeight:'800',color:'rgba(255,255,255,0.7)',letterSpacing:'.06em',textTransform:'uppercase',marginBottom:'8px'}}>✨ Smart fill</div>
            <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
              <input
                ref={inputRef}
                value={nlpText}
                onChange={e=>setNlpText(e.target.value)}
                onKeyDown={e=>e.key==='Enter'&&applyNlp()}
                placeholder='e.g. "Meeting with Ameen tomorrow at 10am at Herbal Park"'
                style={{flex:1,padding:'10px 12px',borderRadius:'12px',border:'none',fontSize:'13px',color:'#1e293b',background:'rgba(255,255,255,0.95)',fontFamily:'inherit',outline:'none'}}
              />
              <button onClick={applyNlp} style={{background:'#fff',border:'none',borderRadius:'12px',padding:'10px 14px',fontSize:'13px',fontWeight:'800',color:'#0a2240',cursor:'pointer',flexShrink:0}}>Fill ↵</button>
            </div>
            {nlpParsed&&(
              <div style={{marginTop:'8px',display:'flex',flexWrap:'wrap',gap:'4px'}}>
                {Object.entries(nlpParsed).filter(([k])=>k!=='assignees'&&k!=='title').map(([k,v])=>(
                  <div key={k} style={{background:'rgba(255,255,255,0.2)',borderRadius:'8px',padding:'3px 8px',fontSize:'10px',fontWeight:'700',color:'#fff'}}>
                    {k}: {String(v)}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Type */}
          <div>
            {label('Entry type')}
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {TYPE_LIST.map(tp=>(
                <button key={tp} onClick={()=>onChange('type',tp)} style={pillStyle(form.type===tp)}>
                  {TYPES[tp].label}
                </button>
              ))}
            </div>
          </div>

          {/* Title */}
          <div>
            {label('Title')}
            <input value={form.title} onChange={e=>onChange('title',e.target.value)} placeholder="Entry title" style={{...INPUT_STYLE,fontSize:'15px',fontWeight:'600'}}/>
          </div>

          {/* Date + Time */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
            <div>
              {label('Date')}
              <input type="date" value={form.date} onChange={e=>onChange('date',e.target.value)} style={INPUT_STYLE}/>
            </div>
            <div>
              {label('Time')}
              <input value={form.time} onChange={e=>onChange('time',e.target.value)} placeholder="e.g. 10:00 AM" list="hf-time-opts" style={INPUT_STYLE}/>
              <datalist id="hf-time-opts">
                {['7:00 AM','7:30 AM','8:00 AM','8:30 AM','9:00 AM','9:30 AM','10:00 AM','10:30 AM',
                  '11:00 AM','11:30 AM','12:00 PM','12:30 PM','1:00 PM','1:30 PM','2:00 PM','2:30 PM',
                  '3:00 PM','3:30 PM','4:00 PM','4:30 PM','5:00 PM','5:30 PM','6:00 PM','End of day'
                ].map(t=><option key={t} value={t}/>)}
              </datalist>
            </div>
          </div>

          {/* Location */}
          <div>
            {label('Location / notes')}
            <input value={form.location} onChange={e=>onChange('location',e.target.value)} placeholder="Location or notes" style={INPUT_STYLE}/>
          </div>

          {/* Entity */}
          <div>
            {label('Entity')}
            <select value={form.entity} onChange={e=>onChange('entity',e.target.value)} style={INPUT_STYLE}>
              {ENTITIES.map(en=><option key={en}>{en}</option>)}
            </select>
          </div>

          {/* Assign directors — highly distinct states */}
          <div>
            {label('Assign to directors')}
            <div style={{display:'flex',gap:'10px',flexWrap:'wrap'}}>
              {DIR_ORDER.map(id=>{
                const d=DIRS[id]; const sel=form.assignees.includes(id)
                return (
                  <button key={id} onClick={()=>onToggleAssignee(id)} style={{
                    width:'54px',height:'54px',borderRadius:'16px',
                    background:sel?d.color:'#f1f5f9',
                    border:sel?`3px solid ${d.color}`:'2.5px solid #e2e8f0',
                    cursor:'pointer',display:'flex',flexDirection:'column',
                    alignItems:'center',justifyContent:'center',gap:'2px',
                    boxShadow:sel?`0 6px 18px -6px ${d.color},0 0 0 4px ${d.color}22`:'none',
                    transition:'all 0.18s cubic-bezier(.2,.7,.2,1)',
                    transform:sel?'scale(1.08)':'scale(1)'
                  }}>
                    {sel
                      ? <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3" strokeLinecap="round"><path d="m20 6-11 11-5-5"/></svg>
                      : <span style={{fontSize:'13px',fontWeight:'800',color:'#94a3b8'}}>{d.initials}</span>
                    }
                    <span style={{fontSize:'9px',fontWeight:'700',color:sel?'rgba(255,255,255,0.8)':'#94a3b8',lineHeight:'1'}}>{d.name.split(' ')[0]}</span>
                  </button>
                )
              })}
            </div>
          </div>

          {/* Priority */}
          <div>
            {label('Priority')}
            <div style={{display:'flex',gap:'6px'}}>
              {PRIORITY_LIST.map(p=>(
                <button key={p} onClick={()=>onChange('priority',p)} style={pillStyle(form.priority===p,p==='high'?'#c0392b':p==='medium'?'#0a2240':'#64748b')}>
                  {p.charAt(0).toUpperCase()+p.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Reminder */}
          <div>
            {label('Reminder / Alert')}
            <div style={{display:'flex',flexWrap:'wrap',gap:'6px'}}>
              {REMINDER_OPTS.map(r=>(
                <button key={r.id} onClick={()=>onChange('reminder',r.id)} style={pillStyle(form.reminder===r.id)}>
                  {r.label}
                </button>
              ))}
            </div>
          </div>

          <button onClick={onSave} style={{...BTN_PRIMARY,marginTop:'4px',padding:'16px',fontSize:'16px',fontWeight:'800',borderRadius:'18px'}}>
            Save entry
          </button>
        </div>
      </div>
    </div>
  )
}
