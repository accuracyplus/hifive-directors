import React, { useMemo } from 'react'
import { DIRS, TYPES, STATUS, PRIORITY } from '../constants.js'
import { pad, parseTime, fmtLong, chipStyle, TOP_BAR, ARROW_BTN } from '../utils.js'
import SwipeableCard from './SwipeableCard.jsx'

const WEEKDAYS = ['Su','Mo','Tu','We','Th','Fr','Sa']

function Avatar({ dir, size=38 }) {
  return (
    <div style={{
      width:size, height:size, borderRadius:'50%', background:dir.color, color:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:size*0.34, fontWeight:'700', flexShrink:0
    }}>{dir.initials}</div>
  )
}

function EntryCard({ entry, onTap, onComplete, onCancel, today, canSwipe }) {
  const dir = DIRS[entry.dir] || DIRS['ameen']
  const t   = TYPES[entry.type]
  const s   = STATUS[entry.status]
  const hi  = entry.priority === 'high'
  const isOverdue = entry.status==='scheduled' && entry.date < today
  const tintR = parseInt(dir.color.slice(1,3),16)
  const tintG = parseInt(dir.color.slice(3,5),16)
  const tintB = parseInt(dir.color.slice(5,7),16)

  const cardInner = (
    <div
      onClick={() => onTap(entry)}
      style={{
        display:'flex', gap:'10px', alignItems:'flex-start',
        background:`rgba(${tintR},${tintG},${tintB},0.06)`,
        backdropFilter:'blur(18px) saturate(180%)',
        WebkitBackdropFilter:'blur(18px) saturate(180%)',
        border:`1px solid rgba(${tintR},${tintG},${tintB},0.18)`,
        borderLeft:`3px solid ${entry.status==='cancelled'?'#c0392b':entry.status==='completed'?'#9a958a':dir.color}`,
        borderRadius:'5px 18px 18px 5px',
        padding:'13px 13px 13px 12px',
        boxShadow:'0 6px 22px -12px rgba(11,34,64,0.22)',
        cursor:'pointer',
        opacity:entry.status==='cancelled'?0.6:1,
        WebkitTapHighlightColor:'transparent'
      }}
    >
      <Avatar dir={dir} size={34}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:'14px', fontWeight:'600', lineHeight:'1.3', color:entry.status==='cancelled'?'#9a958a':'#1f2937', textDecoration:entry.status==='cancelled'?'line-through':'none' }}>{entry.title}</div>
        <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'2px' }}>{entry.time}{entry.location?` · ${entry.location}`:''}</div>
        <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'8px', alignItems:'center' }}>
          <span style={chipStyle(t.bg,t.fg)}>{t.label}</span>
          <span style={chipStyle(s.bg,s.fg)}>{s.label}</span>
          {hi&&<span style={chipStyle(PRIORITY.high.bg,PRIORITY.high.fg)}>High</span>}
          {isOverdue&&<span style={chipStyle('#fef2f2','#991b1b')}>⚠ Overdue</span>}
        </div>
      </div>
      <div style={{ color:'#c9c5ba', fontSize:'16px', alignSelf:'center', flexShrink:0 }}>›</div>
    </div>
  )

  if (!canSwipe || entry.status !== 'scheduled') return cardInner

  return (
    <SwipeableCard onComplete={onComplete} onCancel={onCancel}>
      {cardInner}
    </SwipeableCard>
  )
}

export default function CalendarScreen({ curUser, entries, monY, selDate, onPrevMonth, onNextMonth, onSelDate, onAdd, onTapEntry, onStatusChange, today }) {
  const dir = DIRS[curUser] || DIRS['ameen']
  const { y, m } = monY

  const calCells = useMemo(() => {
    const startDow = new Date(y,m,1).getDay()
    const dim = new Date(y,m+1,0).getDate()
    const cells = []
    for (let i=0;i<42;i++) {
      const dayNum = i-startDow+1
      const inMonth = dayNum>=1&&dayNum<=dim
      const dateStr = inMonth?`${y}-${pad(m+1)}-${pad(dayNum)}`:null
      const isToday = dateStr===today
      const isSel   = dateStr===selDate
      const dayEntries = inMonth?entries.filter(e=>e.date===dateStr):[]
      const hasOverdue = dayEntries.some(e=>e.status==='scheduled'&&dateStr<today)
      cells.push({dayNum,inMonth,dateStr,isToday,isSel,dayEntries,hasOverdue})
    }
    return cells
  },[y,m,entries,selDate,today])

  const selEntries = useMemo(()=>
    entries.filter(e=>e.date===selDate).sort((a,b)=>parseTime(a.time)-parseTime(b.time)),
    [entries,selDate]
  )

  const todayCount = useMemo(()=>entries.filter(e=>e.date===today&&e.status!=='cancelled').length,[entries,today])
  const monthLabel = new Date(y,m,1).toLocaleDateString('en-GB',{month:'long',year:'numeric'})
  const isCurrentMonth = y===new Date().getFullYear()&&m===new Date().getMonth()

  return (
    <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column', background:'#f0f4f8' }}>
      <div style={TOP_BAR}>
        <div>
          <div style={{ fontSize:'18px', fontWeight:'700' }}>My calendar</div>
          <div style={{ fontSize:'12px', opacity:.78, marginTop:'1px' }}>{curUser==='admin'?'Admin / PA · HiFive Holdings':`${dir.name} · ${dir.entity}`}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
          {todayCount>0&&<div style={{ background:'#c0392b', color:'#fff', borderRadius:'10px', fontSize:'11px', fontWeight:'700', padding:'3px 8px' }}>{todayCount} today</div>}
          <Avatar dir={dir} size={38}/>
        </div>
      </div>

      <div style={{ flex:1, minHeight:0, overflowY:'auto' , background:'#f0f4f8' }}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'14px 16px 8px' }}>
          <button onClick={onPrevMonth} style={ARROW_BTN}>‹</button>
          <div style={{ display:'flex', alignItems:'center', gap:'8px' }}>
            <div style={{ fontSize:'15px', fontWeight:'700', color:'#1f2937' }}>{monthLabel}</div>
            {!isCurrentMonth&&(
              <button onClick={()=>onSelDate(today)} style={{ background:'rgba(21,101,168,0.1)', border:'none', borderRadius:'8px', padding:'4px 10px', fontSize:'11px', fontWeight:'600', color:'#1565a8', cursor:'pointer' }}>Today</button>
            )}
          </div>
          <button onClick={onNextMonth} style={ARROW_BTN}>›</button>
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'0 12px' }}>
          {WEEKDAYS.map(w=><div key={w} style={{ textAlign:'center', fontSize:'11px', fontWeight:'600', color:'#9a958a', padding:'2px 0' }}>{w}</div>)}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', padding:'2px 12px 8px' }}>
          {calCells.map((c,i)=>(
            <div key={i} onClick={()=>c.inMonth&&onSelDate(c.dateStr)} style={{ minHeight:'44px', display:'flex', flexDirection:'column', alignItems:'center', cursor:c.inMonth?'pointer':'default', padding:'3px 0', borderRadius:'12px', background:c.isSel?'rgba(21,101,168,0.12)':'transparent', border:c.isSel?'1px solid rgba(21,101,168,0.25)':'1px solid transparent' }}>
              <div style={{ width:'26px', height:'26px', display:'flex', alignItems:'center', justifyContent:'center', borderRadius:'50%', fontSize:'13px', fontWeight:c.isToday?'700':'500', background:c.isToday?'#1565a8':'transparent', color:c.isToday?'#fff':(c.inMonth?'#1f2937':'#cfcbc0') }}>
                {c.inMonth?c.dayNum:''}
              </div>
              <div style={{ display:'flex', gap:'2px', justifyContent:'center', height:'6px', marginTop:'2px' }}>
                {c.dayEntries.slice(0,3).map((e,di)=>(
                  <div key={di} style={{ width:'5px', height:'5px', borderRadius:'50%', background:e.status==='cancelled'?'#cfcbc0':TYPES[e.type].fg }}/>
                ))}
                {c.hasOverdue&&<div style={{ width:'5px', height:'5px', borderRadius:'50%', background:'#c0392b' }}/>}
              </div>
            </div>
          ))}
        </div>

        <div style={{ height:'1px', background:'#e6e1d6', margin:'4px 16px 0' }}/>

        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 16px 8px' }}>
          <div style={{ fontSize:'13px', fontWeight:'700', color:'#1f2937' }}>{fmtLong(selDate)}</div>
          {selEntries.length>0&&<div style={{ fontSize:'11px', color:'#9a958a', fontWeight:'600' }}>{selEntries.filter(e=>e.status!=='cancelled').length} entries</div>}
        </div>

        <div style={{ padding:'0 16px 96px', display:'flex', flexDirection:'column', gap:'10px' }}>
          {selEntries.length>0 ? selEntries.map(e=>(
            <EntryCard
              key={e.id} entry={e} today={today}
              onTap={onTapEntry}
              canSwipe={curUser==='admin'||curUser===e.dir}
              onComplete={()=>onStatusChange(e.id,'completed')}
              onCancel={()=>onStatusChange(e.id,'cancelled')}
            />
          )) : (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ fontSize:'32px', marginBottom:'10px' }}>📅</div>
              <div style={{ fontSize:'14px', fontWeight:'600', color:'#9a958a' }}>No entries for this day</div>
              <div style={{ fontSize:'12px', color:'#c9c5ba', marginTop:'4px' }}>Tap + to add one</div>
            </div>
          )}
        </div>
      </div>

      <button onClick={onAdd} style={{ position:'absolute', right:'16px', bottom:'76px', height:'50px', borderRadius:'25px', padding:'0 20px 0 16px', background:'linear-gradient(180deg,#16406d,#0a2240)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', zIndex:10, boxShadow:'0 14px 30px -10px rgba(10,34,64,0.65)', fontSize:'14px', fontWeight:'600' }} aria-label="Add entry">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add entry
      </button>
    </div>
  )
}
