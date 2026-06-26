import React, { useMemo, useState, useRef } from 'react'
import { DIRS, DIR_ORDER, TYPES, STATUS, PRIORITY } from '../constants.js'
import { pad, parseTime, fmtLong, chipStyle, pillStyle, TOP_BAR, ARROW_BTN } from '../utils.js'
import SwipeableCard from './SwipeableCard.jsx'

const WEEKDAYS  = ['Su','Mo','Tu','We','Th','Fr','Sa']
const MONTHS    = ['January','February','March','April','May','June','July','August','September','October','November','December']

function Avatar({ dir, size=36 }) {
  return <div style={{width:size,height:size,borderRadius:'50%',background:dir.color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:size*0.33,fontWeight:'700',flexShrink:0}}>{dir.initials}</div>
}

function EntryCard({ entry, onTap, onComplete, onCancel, today, canSwipe }) {
  const dir=DIRS[entry.dir]||DIRS['ameen']
  const t=TYPES[entry.type]||TYPES['meeting']
  const s=STATUS[entry.status]||STATUS['scheduled']
  const isOverdue=entry.status==='scheduled'&&entry.date<today
  const r=parseInt(dir.color.slice(1,3),16),g=parseInt(dir.color.slice(3,5),16),b=parseInt(dir.color.slice(5,7),16)
  const inner=(
    <div onClick={()=>onTap(entry)} style={{display:'flex',gap:'10px',alignItems:'flex-start',background:`rgba(${r},${g},${b},0.06)`,border:`1px solid rgba(${r},${g},${b},0.15)`,borderLeft:`3px solid ${entry.status==='cancelled'?'#c0392b':entry.status==='completed'?'#9ca3af':dir.color}`,borderRadius:'6px 16px 16px 6px',padding:'12px',cursor:'pointer',opacity:entry.status==='cancelled'?0.6:1}}>
      <Avatar dir={dir} size={34}/>
      <div style={{flex:1,minWidth:0}}>
        <div style={{fontSize:'13px',fontWeight:'700',color:'#1e293b',lineHeight:'1.3',textDecoration:entry.status==='cancelled'?'line-through':'none'}}>{entry.title}</div>
        <div style={{fontSize:'11px',color:'#64748b',marginTop:'2px',fontWeight:'600'}}>{dir.name}{entry.time?` · ${entry.time}`:''}{entry.location?` · ${entry.location}`:''}</div>
        <div style={{display:'flex',flexWrap:'wrap',gap:'4px',marginTop:'7px'}}>
          <span style={chipStyle(t.bg,t.fg)}>{t.label}</span>
          <span style={chipStyle(s.bg,s.fg)}>{s.label}</span>
          {entry.priority==='high'&&<span style={chipStyle('#fef2f2','#991b1b')}>High</span>}
          {isOverdue&&<span style={chipStyle('#fef2f2','#991b1b')}>⚠ Overdue</span>}
        </div>
      </div>
      <div style={{color:'#cbd5e1',fontSize:'16px',alignSelf:'center'}}>›</div>
    </div>
  )
  if (!canSwipe||entry.status!=='scheduled') return inner
  return <SwipeableCard onComplete={onComplete} onCancel={onCancel}>{inner}</SwipeableCard>
}

// ── Smart empty state ─────────────────────────────────────────────────────────
function SmartEmptyState({ entries, selDate, today }) {
  const nextEntry = useMemo(()=>{
    return entries
      .filter(e=>e.date>selDate&&e.status==='scheduled')
      .sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:parseTime(a.time)-parseTime(b.time))[0]
  },[entries,selDate])

  const isToday=selDate===today
  return (
    <div style={{textAlign:'center',padding:'28px 16px 0'}}>
      <div style={{fontSize:'38px',marginBottom:'10px'}}>{isToday?'🌟':'📅'}</div>
      <div style={{fontSize:'15px',fontWeight:'800',color:'#1e293b',marginBottom:'6px'}}>
        {isToday?"You're clear for the day!":"Nothing scheduled"}
      </div>
      {nextEntry ? (
        <div style={{fontSize:'12px',color:'#64748b',fontWeight:'600',lineHeight:'1.5',background:'#f1f5f9',borderRadius:'14px',padding:'10px 14px',marginTop:'8px'}}>
          Next up: <span style={{color:'#0a2240',fontWeight:'800'}}>{nextEntry.title}</span>
          {nextEntry.date===today
            ? ` today at ${nextEntry.time}`
            : ` on ${new Date(nextEntry.date+'T00:00:00').toLocaleDateString('en-GB',{weekday:'short',day:'numeric',month:'short'})}${nextEntry.time?` at ${nextEntry.time}`:''}`
          }
          {nextEntry.location?` · ${nextEntry.location}`:''}
        </div>
      ) : (
        <div style={{fontSize:'12px',color:'#94a3b8',fontWeight:'600',marginTop:'4px'}}>No upcoming entries found</div>
      )}
      <div style={{fontSize:'11px',color:'#cbd5e1',fontWeight:'600',marginTop:'10px'}}>Tap + to add an entry</div>
    </div>
  )
}

export default function CalendarScreen({ curUser, entries, myEntries, monY, selDate, onPrevMonth, onNextMonth, onSelDate, onAdd, onTapEntry, onStatusChange, onGoToday, today }) {
  const dir=DIRS[curUser]||DIRS['ameen']
  const {y,m}=monY
  const [expanded,setExpanded]=useState(false) // week strip vs full month
  const [calFilter,setCalFilter]=useState('all')
  const stripRef=useRef(null)
  // Swipe to expand/collapse
  const swipeStartY=useRef(null)

  function onStripTouchStart(e){swipeStartY.current=e.touches[0].clientY}
  function onStripTouchEnd(e){
    if (swipeStartY.current===null) return
    const dy=e.changedTouches[0].clientY-swipeStartY.current
    if (dy>40) setExpanded(true)
    if (dy<-40) setExpanded(false)
    swipeStartY.current=null
  }

  const filteredEntries=calFilter==='all'?entries:entries.filter(e=>e.dir===calFilter)
  const selEntries=useMemo(()=>filteredEntries.filter(e=>e.date===selDate).sort((a,b)=>parseTime(a.time)-parseTime(b.time)),[filteredEntries,selDate])

  // Week containing selDate
  const weekDays=useMemo(()=>{
    const base=new Date(selDate+'T00:00:00')
    const dow=base.getDay()
    return Array.from({length:7},(_,i)=>{
      const d=new Date(base); d.setDate(base.getDate()-dow+i)
      const ds=`${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`
      const dayEntries=filteredEntries.filter(e=>e.date===ds)
      return {ds,num:d.getDate(),dow:WEEKDAYS[i],isToday:ds===today,isSel:ds===selDate,count:dayEntries.length,hasOverdue:dayEntries.some(e=>e.status==='scheduled'&&ds<today)}
    })
  },[selDate,filteredEntries,today])

  // Full month grid
  const calCells=useMemo(()=>{
    const startDow=new Date(y,m,1).getDay()
    const dim=new Date(y,m+1,0).getDate()
    const cells=[]
    for(let i=0;i<42;i++){
      const dn=i-startDow+1
      const inM=dn>=1&&dn<=dim
      const ds=inM?`${y}-${pad(m+1)}-${pad(dn)}`:null
      const de=inM?filteredEntries.filter(e=>e.date===ds):[]
      cells.push({dn,inM,ds,isToday:ds===today,isSel:ds===selDate,dayEntries:de,hasOverdue:de.some(e=>e.status==='scheduled'&&ds<today)})
    }
    return cells
  },[y,m,filteredEntries,selDate,today])

  const todayCount=myEntries.filter(e=>e.date===today&&e.status!=='cancelled').length
  const filterDefs=[{id:'all',label:'All',color:'#0a2240'},...DIR_ORDER.map(id=>({id,label:DIRS[id].name,color:DIRS[id].color}))]
  const monthLabel=`${MONTHS[m]} ${y}`

  return (
    <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',background:'#f0f4f8',position:'relative'}}>
      {/* Top bar */}
      <div style={{background:'#0a2240',color:'#fff',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontSize:'17px',fontWeight:'900'}}>Calendar</div>
          <div style={{fontSize:'10px',opacity:.65,fontWeight:'700',letterSpacing:'.04em',marginTop:'1px',textTransform:'uppercase'}}>{dir.name} · {dir.entity}</div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          {todayCount>0&&<div style={{background:'#c0392b',color:'#fff',borderRadius:'10px',fontSize:'11px',fontWeight:'700',padding:'3px 8px'}}>{todayCount}</div>}
          <Avatar dir={dir} size={34}/>
        </div>
      </div>

      {/* Director filter */}
      <div style={{display:'flex',gap:'6px',overflowX:'auto',padding:'8px 14px 4px',background:'#fff',borderBottom:'1px solid #f1f5f9'}}>
        {filterDefs.map(f=>(
          <button key={f.id} onClick={()=>setCalFilter(f.id)} style={{
            flexShrink:0,padding:'5px 12px',borderRadius:'999px',fontSize:'11px',fontWeight:'700',cursor:'pointer',whiteSpace:'nowrap',
            border:`1.5px solid ${calFilter===f.id?f.color:'#e2e8f0'}`,
            background:calFilter===f.id?f.color:'#fff',
            color:calFilter===f.id?'#fff':'#64748b',
            display:'flex',alignItems:'center',gap:'5px'
          }}>
            {f.id!=='all'&&<div style={{width:'7px',height:'7px',borderRadius:'50%',background:calFilter===f.id?'rgba(255,255,255,0.7)':f.color,flexShrink:0}}/>}
            {f.label}
          </button>
        ))}
      </div>

      <div style={{flex:1,minHeight:0,overflowY:'auto',background:'#f0f4f8'}}>
        {/* Month label + Today btn */}
        <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:'10px 16px 6px',background:'#fff'}}>
          <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
            <button onClick={onPrevMonth} style={{background:'none',border:'none',fontSize:'18px',cursor:'pointer',color:'#94a3b8',padding:'0 2px'}}>‹</button>
            <div style={{fontSize:'14px',fontWeight:'800',color:'#1e293b'}}>{monthLabel}</div>
            <button onClick={onNextMonth} style={{background:'none',border:'none',fontSize:'18px',cursor:'pointer',color:'#94a3b8',padding:'0 2px'}}>›</button>
          </div>
          <div style={{display:'flex',alignItems:'center',gap:'6px'}}>
            {selDate!==today&&<button onClick={onGoToday} style={{background:'#0a2240',border:'none',borderRadius:'8px',padding:'4px 10px',fontSize:'11px',fontWeight:'700',color:'#fff',cursor:'pointer'}}>Today</button>}
            <button onClick={()=>setExpanded(e=>!e)} style={{background:'#f1f5f9',border:'none',borderRadius:'8px',padding:'4px 8px',fontSize:'11px',fontWeight:'700',color:'#64748b',cursor:'pointer'}}>
              {expanded?'↑ Week':'↓ Month'}
            </button>
          </div>
        </div>

        {/* WEEK STRIP (default) or FULL MONTH (expanded) */}
        <div
          ref={stripRef}
          onTouchStart={onStripTouchStart}
          onTouchEnd={onStripTouchEnd}
          style={{background:'#fff',borderBottom:'1px solid #f1f5f9',transition:'all 0.3s ease'}}
        >
          {!expanded ? (
            // ── Week strip ──────────────────────────────────────────────────
            <div style={{display:'flex',gap:'4px',padding:'6px 10px 10px',overflowX:'auto'}}>
              {weekDays.map(d=>(
                <button key={d.ds} onClick={()=>onSelDate(d.ds)} style={{flex:1,minWidth:'42px',display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',padding:'8px 4px',border:'none',borderRadius:'14px',cursor:'pointer',background:d.isSel?'#0a2240':d.isToday?'rgba(21,101,168,0.1)':'transparent',transition:'all 0.15s'}}>
                  <span style={{fontSize:'10px',fontWeight:'700',color:d.isSel?'rgba(255,255,255,0.65)':d.isToday?'#1565a8':'#94a3b8',textTransform:'uppercase'}}>{d.dow}</span>
                  <span style={{fontSize:'17px',fontWeight:'800',color:d.isSel?'#fff':d.isToday?'#1565a8':'#1e293b',lineHeight:'1'}}>{d.num}</span>
                  <div style={{height:'6px',display:'flex',gap:'2px',alignItems:'center',justifyContent:'center'}}>
                    {d.count>0&&Array.from({length:Math.min(d.count,3)},(_,i)=>(
                      <div key={i} style={{width:'4px',height:'4px',borderRadius:'50%',background:d.isSel?'rgba(255,255,255,0.6)':d.hasOverdue?'#c0392b':'#1565a8'}}/>
                    ))}
                  </div>
                </button>
              ))}
              <div style={{display:'flex',alignItems:'center',paddingLeft:'4px',borderLeft:'1px solid #f1f5f9'}}>
                <div style={{fontSize:'10px',color:'#cbd5e1',fontWeight:'600',writingMode:'vertical-rl',textOrientation:'mixed',cursor:'pointer'}} onClick={()=>setExpanded(true)}>▼</div>
              </div>
            </div>
          ) : (
            // ── Full month grid ──────────────────────────────────────────────
            <div style={{padding:'4px 10px 10px'}}>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',marginBottom:'2px'}}>
                {WEEKDAYS.map(w=><div key={w} style={{textAlign:'center',fontSize:'10px',fontWeight:'700',color:'#94a3b8',padding:'2px 0'}}>{w}</div>)}
              </div>
              <div style={{display:'grid',gridTemplateColumns:'repeat(7,1fr)',gap:'1px'}}>
                {calCells.map((c,i)=>(
                  <div key={i} onClick={()=>c.inM&&onSelDate(c.ds)} style={{minHeight:'40px',display:'flex',flexDirection:'column',alignItems:'center',cursor:c.inM?'pointer':'default',padding:'2px',borderRadius:'10px',background:c.isSel?'#0a2240':c.isToday?'rgba(21,101,168,0.1)':'transparent',transition:'background 0.12s'}}>
                    <div style={{width:'24px',height:'24px',display:'flex',alignItems:'center',justifyContent:'center',borderRadius:'50%',fontSize:'12px',fontWeight:c.isToday?'800':'500',color:c.isSel?'#fff':c.isToday?'#1565a8':c.inM?'#1e293b':'#cbd5e1'}}>
                      {c.inM?c.dn:''}
                    </div>
                    <div style={{display:'flex',gap:'1px',justifyContent:'center',height:'5px',marginTop:'1px'}}>
                      {c.dayEntries.slice(0,3).map((e,di)=><div key={di} style={{width:'4px',height:'4px',borderRadius:'50%',background:e.status==='cancelled'?'#cbd5e1':(DIRS[e.dir]?.color||'#64748b')}}/>)}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Day agenda */}
        <div style={{background:'#fff',borderRadius:'20px 20px 0 0',margin:'6px 0 0',padding:'14px 16px 0',minHeight:'200px'}}>
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:'12px'}}>
            <div style={{fontSize:'14px',fontWeight:'800',color:'#1e293b'}}>{fmtLong(selDate)}</div>
            {selEntries.length>0&&<div style={{fontSize:'11px',color:'#94a3b8',fontWeight:'700'}}>{selEntries.filter(e=>e.status!=='cancelled').length} entries</div>}
          </div>
          {selEntries.length>0 ? (
            <div style={{display:'flex',flexDirection:'column',gap:'8px',paddingBottom:'100px'}}>
              {selEntries.map(e=>(
                <EntryCard key={e.id} entry={e} today={today}
                  onTap={onTapEntry}
                  canSwipe={curUser==='admin'||curUser===e.dir}
                  onComplete={()=>onStatusChange(e.id,'completed')}
                  onCancel={()=>onStatusChange(e.id,'cancelled')}
                />
              ))}
            </div>
          ):(
            <div style={{paddingBottom:'100px'}}>
              <SmartEmptyState entries={entries} selDate={selDate} today={today}/>
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button onClick={onAdd} style={{position:'absolute',right:'16px',bottom:'76px',height:'50px',borderRadius:'25px',padding:'0 20px 0 16px',background:'#0a2240',color:'#fff',border:'none',display:'flex',alignItems:'center',gap:'8px',cursor:'pointer',zIndex:10,boxShadow:'0 8px 24px -6px rgba(10,34,64,0.5)',fontSize:'14px',fontWeight:'800'}}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add entry
      </button>
    </div>
  )
}
