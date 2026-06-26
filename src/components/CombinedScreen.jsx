import React, { useMemo, useRef, useState } from 'react'
import { DIRS, DIR_ORDER, TYPES, STATUS } from '../constants.js'
import { toISO, parseTime, fmtFull, chipStyle, TOP_BAR } from '../utils.js'

export default function CombinedScreen({ entries, combDate, combFilter, onFilter, onPrevDay, onNextDay, onGoToday, onTapEntry, today }) {

  // ── Horizontal swipe to change day ───────────────────────────────────────
  const swipeRef   = useRef(null)
  const swipeStart = useRef(null)
  const [swipeDelta, setSwipeDelta] = useState(0)
  const [swiping, setSwiping] = useState(false)

  function onTouchStart(e) {
    swipeStart.current = e.touches[0].clientX
    setSwiping(false)
  }
  function onTouchMove(e) {
    if (swipeStart.current===null) return
    const dx = e.touches[0].clientX - swipeStart.current
    if (Math.abs(dx)>10) { setSwiping(true); setSwipeDelta(dx) }
  }
  function onTouchEnd() {
    if (swipeDelta < -60) onNextDay()
    else if (swipeDelta > 60) onPrevDay()
    setSwipeDelta(0); setSwiping(false); swipeStart.current=null
  }

  const timelineRows = useMemo(()=>{
    let list = entries.filter(e=>e.date===combDate)
    if (combFilter!=='all') list=list.filter(e=>e.dir===combFilter)
    return list.sort((a,b)=>parseTime(a.time)-parseTime(b.time))
  },[entries,combDate,combFilter])

  // Director counts for badges on pills
  const dirCounts = useMemo(()=>{
    const c={}
    entries.filter(e=>e.date===combDate&&e.status!=='cancelled').forEach(e=>{c[e.dir]=(c[e.dir]||0)+1})
    return c
  },[entries,combDate])

  const totalToday = entries.filter(e=>e.date===today&&e.status!=='cancelled').length
  const isToday    = combDate===today

  // Week strip
  const weekDays = useMemo(()=>{
    const base=new Date(combDate+'T00:00:00')
    const dow=base.getDay()
    return Array.from({length:7},(_,i)=>{
      const d=new Date(base); d.setDate(base.getDate()-dow+i)
      const ds=toISO(d)
      const cnt=entries.filter(e=>e.date===ds&&e.status!=='cancelled').length
      return {ds,num:d.getDate(),label:['Su','Mo','Tu','We','Th','Fr','Sa'][i],isToday:ds===today,isSel:ds===combDate,cnt}
    })
  },[combDate,entries,today])

  const filterDefs=[
    {id:'all',label:'All'},
    ...DIR_ORDER.map(id=>({id,label:DIRS[id].name,color:DIRS[id].color,count:dirCounts[id]||0}))
  ]

  return (
    <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',background:'#f0f4f8'}}>
      {/* Top bar — no redundant date text, just title + avatar row */}
      <div style={{background:'#0a2240',color:'#fff',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',flexShrink:0}}>
        <div>
          <div style={{fontSize:'17px',fontWeight:'900'}}>Combined view</div>
          <div style={{fontSize:'10px',opacity:.65,fontWeight:'700',letterSpacing:'.04em',marginTop:'1px',textTransform:'uppercase'}}>
            {isToday?'Today':'All directors'}
          </div>
        </div>
        {/* Stacked avatars */}
        <div style={{display:'flex'}}>
          {DIR_ORDER.map((id,i)=>{
            const d=DIRS[id]
            return (
              <div key={id} style={{width:'28px',height:'28px',borderRadius:'50%',background:d.color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'10px',fontWeight:'700',marginLeft:i===0?0:'-7px',boxShadow:'0 0 0 2px #0a2240',zIndex:DIR_ORDER.length-i,position:'relative'}}>
                {d.initials}
                {dirCounts[id]>0&&<div style={{position:'absolute',top:'-3px',right:'-3px',width:'12px',height:'12px',borderRadius:'50%',background:'#c0392b',border:'1.5px solid #0a2240',fontSize:'8px',fontWeight:'700',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center'}}>{dirCounts[id]}</div>}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{flex:1,minHeight:0,overflowY:'auto'}}>
        {/* Week strip day selector — replaces prev/next arrows */}
        <div style={{background:'#fff',borderBottom:'1px solid #f1f5f9',padding:'8px 10px 10px'}}>
          <div style={{display:'flex',gap:'3px',overflowX:'auto'}}>
            {weekDays.map(d=>(
              <button key={d.ds} onClick={()=>onGoToday(d.ds)} style={{flex:1,minWidth:'40px',display:'flex',flexDirection:'column',alignItems:'center',gap:'3px',padding:'7px 3px',border:'none',borderRadius:'12px',cursor:'pointer',background:d.isSel?'#0a2240':d.isToday?'rgba(21,101,168,0.1)':'transparent',transition:'all 0.15s'}}>
                <span style={{fontSize:'10px',fontWeight:'700',color:d.isSel?'rgba(255,255,255,0.6)':d.isToday?'#1565a8':'#94a3b8',textTransform:'uppercase'}}>{d.label}</span>
                <span style={{fontSize:'16px',fontWeight:'800',color:d.isSel?'#fff':d.isToday?'#1565a8':'#1e293b',lineHeight:'1'}}>{d.num}</span>
                {d.cnt>0&&<div style={{width:'5px',height:'5px',borderRadius:'50%',background:d.isSel?'rgba(255,255,255,0.6)':'#1565a8'}}/>}
              </button>
            ))}
          </div>
          {/* Today + date label — single line, no duplication */}
          <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginTop:'8px',paddingTop:'8px',borderTop:'1px solid #f8fafc'}}>
            <div style={{fontSize:'13px',fontWeight:'800',color:'#1e293b'}}>{fmtFull(combDate)}</div>
            {!isToday&&<button onClick={()=>onGoToday(today)} style={{background:'#0a2240',border:'none',borderRadius:'8px',padding:'4px 10px',fontSize:'10px',fontWeight:'800',color:'#fff',cursor:'pointer'}}>Today</button>}
          </div>
        </div>

        {/* Director filter pills — with colour dots + count merged in */}
        <div style={{display:'flex',gap:'6px',overflowX:'auto',padding:'10px 14px',background:'#f8fafc',borderBottom:'1px solid #f1f5f9'}}>
          {filterDefs.map(f=>{
            const sel=combFilter===f.id
            return (
              <button key={f.id} onClick={()=>onFilter(f.id)} style={{flexShrink:0,padding:'6px 12px',borderRadius:'999px',fontSize:'11px',fontWeight:'700',cursor:'pointer',border:`1.5px solid ${sel?(f.color||'#0a2240'):'#e2e8f0'}`,background:sel?(f.color||'#0a2240'):'#fff',color:sel?'#fff':'#64748b',display:'flex',alignItems:'center',gap:'5px',transition:'all 0.15s'}}>
                {f.color&&<div style={{width:'7px',height:'7px',borderRadius:'50%',background:sel?'rgba(255,255,255,0.7)':f.color,flexShrink:0}}/>}
                {f.label}
                {f.count>0&&<span style={{background:sel?'rgba(255,255,255,0.25)':'rgba(10,34,64,0.08)',borderRadius:'8px',padding:'0 5px',fontSize:'10px',fontWeight:'800'}}>{f.count}</span>}
              </button>
            )
          })}
        </div>

        {/* Timeline — swipeable */}
        <div
          ref={swipeRef}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          style={{padding:'10px 14px 16px',display:'flex',flexDirection:'column',gap:'8px',transform:`translateX(${swiping?swipeDelta*0.15:0}px)`,transition:swiping?'none':'transform 0.2s ease',userSelect:'none'}}
        >
          {timelineRows.length>0 ? timelineRows.map(e=>{
            const d=DIRS[e.dir]||DIRS['ameen']
            const t=TYPES[e.type]||TYPES['meeting']
            const s=STATUS[e.status]||STATUS['scheduled']
            const r=parseInt(d.color.slice(1,3),16),g=parseInt(d.color.slice(3,5),16),b=parseInt(d.color.slice(5,7),16)
            return (
              <div key={e.id} onClick={()=>onTapEntry(e)} style={{display:'flex',gap:'8px',alignItems:'stretch',cursor:'pointer'}}>
                <div style={{flexShrink:0,width:'48px',textAlign:'right',fontSize:'10px',color:'#94a3b8',fontWeight:'600',paddingTop:'12px',lineHeight:'1.3'}}>{e.time||'—'}</div>
                <div style={{flex:1,background:`rgba(${r},${g},${b},0.08)`,border:`1px solid rgba(${r},${g},${b},0.18)`,borderLeft:`3px solid ${e.status==='cancelled'?'#c0392b':e.status==='completed'?'#9ca3af':d.color}`,borderRadius:'5px 14px 14px 5px',padding:'10px 12px',opacity:e.status==='cancelled'?0.55:1}}>
                  <div style={{display:'flex',alignItems:'center',gap:'7px',marginBottom:'4px'}}>
                    <div style={{width:'22px',height:'22px',borderRadius:'50%',background:d.color,color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'9px',fontWeight:'700',flexShrink:0}}>{d.initials}</div>
                    <div style={{fontSize:'12px',fontWeight:'800',color:'#1e293b',flex:1,lineHeight:'1.3',textDecoration:e.status==='cancelled'?'line-through':'none'}}>{e.title}</div>
                  </div>
                  <div style={{display:'flex',flexWrap:'wrap',gap:'4px',paddingLeft:'29px'}}>
                    <span style={chipStyle(t.bg,t.fg)}>{t.label}</span>
                    <span style={{fontSize:'10px',color:'#94a3b8',fontWeight:'600',alignSelf:'center'}}>{d.entity}</span>
                    {e.status!=='scheduled'&&<span style={chipStyle(s.bg,s.fg)}>{s.label}</span>}
                    {e.location&&<span style={{fontSize:'10px',color:'#94a3b8',fontWeight:'600',alignSelf:'center'}}>📍 {e.location}</span>}
                  </div>
                </div>
                <div style={{color:'#cbd5e1',fontSize:'14px',alignSelf:'center',flexShrink:0}}>›</div>
              </div>
            )
          }) : (
            <div style={{textAlign:'center',padding:'32px 0'}}>
              <div style={{fontSize:'36px',marginBottom:'8px'}}>📋</div>
              <div style={{fontSize:'14px',fontWeight:'700',color:'#94a3b8'}}>No entries for this day</div>
              <div style={{fontSize:'11px',color:'#cbd5e1',fontWeight:'600',marginTop:'4px'}}>Swipe left/right to move between days</div>
            </div>
          )}
        </div>

        {/* Swipe hint */}
        <div style={{textAlign:'center',padding:'0 0 24px',fontSize:'11px',color:'#cbd5e1',fontWeight:'600'}}>← Swipe to navigate days →</div>
      </div>
    </div>
  )
}
