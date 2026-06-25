import React, { useMemo } from 'react'
import { DIRS, DIR_ORDER, TYPES, STATUS } from '../constants.js'
import { toISO, parseTime, fmtFull, fmtShort, shiftDay, chipStyle, pillStyle, TOP_BAR, ARROW_BTN } from '../utils.js'

function WeekStrip({ combDate, entries, onSelDate, today }) {
  const days = useMemo(() => {
    const d = new Date(combDate+'T00:00:00')
    const dow = d.getDay()
    const monday = new Date(d); monday.setDate(d.getDate() - dow)
    return Array.from({length:7},(_,i)=>{
      const day = new Date(monday); day.setDate(monday.getDate()+i)
      const dateStr = toISO(day)
      const count = entries.filter(e=>e.date===dateStr&&e.status!=='cancelled').length
      const hasOverdue = entries.some(e=>e.date===dateStr&&e.status==='scheduled'&&dateStr<today)
      return { dateStr, dayNum:day.getDate(), dayLabel:day.toLocaleDateString('en-GB',{weekday:'short'}).slice(0,2), isToday:dateStr===today, isSel:dateStr===combDate, count, hasOverdue }
    })
  },[combDate,entries,today])

  return (
    <div style={{ display:'flex', gap:'4px', padding:'8px 14px 4px', overflowX:'auto' }}>
      {days.map(d=>(
        <button key={d.dateStr} onClick={()=>onSelDate(d.dateStr)} style={{ flex:1, minWidth:'42px', display:'flex', flexDirection:'column', alignItems:'center', gap:'3px', padding:'8px 4px', border:'none', borderRadius:'14px', cursor:'pointer', background:d.isSel?'#0a2240':d.isToday?'rgba(21,101,168,0.12)':'transparent', transition:'background 0.15s' }}>
          <span style={{ fontSize:'10px', fontWeight:'600', color:d.isSel?'rgba(255,255,255,0.7)':d.isToday?'#1565a8':'#9a958a', textTransform:'uppercase' }}>{d.dayLabel}</span>
          <span style={{ fontSize:'15px', fontWeight:'700', color:d.isSel?'#fff':d.isToday?'#1565a8':'#1f2937', lineHeight:'1' }}>{d.dayNum}</span>
          <div style={{ height:'6px', display:'flex', gap:'2px', alignItems:'center', justifyContent:'center' }}>
            {d.count>0&&Array.from({length:Math.min(d.count,3)},(_,i)=>(
              <div key={i} style={{ width:'4px', height:'4px', borderRadius:'50%', background:d.isSel?'rgba(255,255,255,0.6)':d.hasOverdue?'#c0392b':'#1565a8' }}/>
            ))}
          </div>
        </button>
      ))}
    </div>
  )
}

export default function CombinedScreen({ entries, combDate, combFilter, onFilter, onPrevDay, onNextDay, onGoToday, onTapEntry, today }) {

  const timelineRows = useMemo(()=>{
    let list=entries.filter(e=>e.date===combDate)
    if (combFilter!=='all') list=list.filter(e=>e.dir===combFilter)
    return list.sort((a,b)=>parseTime(a.time)-parseTime(b.time))
  },[entries,combDate,combFilter])

  const filterDefs = [
    {id:'all',label:'All',color:'#0a2240'},
    ...DIR_ORDER.map(id=>({id,label:DIRS[id].name,color:DIRS[id].color}))
  ]

  const dirCounts = useMemo(()=>{
    const c={}
    entries.filter(e=>e.date===combDate&&e.status!=='cancelled').forEach(e=>{c[e.dir]=(c[e.dir]||0)+1})
    return c
  },[entries,combDate])

  // Combined nav tab badge — total entries today across all directors
  const totalToday = entries.filter(e=>e.date===today&&e.status!=='cancelled').length

  const isToday = combDate===today

  return (
    <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
      <div style={TOP_BAR}>
        <div>
          <div style={{ fontSize:'18px', fontWeight:'700' }}>Combined view</div>
          <div style={{ fontSize:'12px', opacity:.78, marginTop:'1px' }}>{fmtFull(combDate)}</div>
        </div>
        <div style={{ display:'flex' }}>
          {DIR_ORDER.map((id,i)=>{
            const d=DIRS[id]
            return (
              <div key={id} style={{ width:'28px', height:'28px', borderRadius:'50%', background:d.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'10px', fontWeight:'700', marginLeft:i===0?'0':'-7px', boxShadow:'0 0 0 2px #0a2240', zIndex:DIR_ORDER.length-i, position:'relative' }}>
                {d.initials}
                {dirCounts[id]>0&&<div style={{ position:'absolute', top:'-3px', right:'-3px', width:'12px', height:'12px', borderRadius:'50%', background:'#c0392b', border:'1.5px solid #0a2240', fontSize:'8px', fontWeight:'700', color:'#fff', display:'flex', alignItems:'center', justifyContent:'center' }}>{dirCounts[id]}</div>}
              </div>
            )
          })}
        </div>
      </div>

      <div style={{ flex:1, minHeight:0, overflowY:'auto' }}>
        {/* Week strip */}
        <WeekStrip combDate={combDate} entries={entries} onSelDate={onGoToday} today={today}/>

        {/* Legend */}
        <div style={{ display:'flex', flexWrap:'wrap', gap:'8px 14px', padding:'6px 16px 6px', borderBottom:'1px solid #f0ede4' }}>
          {DIR_ORDER.map(id=>{
            const d=DIRS[id]
            return (
              <div key={id} style={{ display:'flex', alignItems:'center', gap:'5px' }}>
                <div style={{ width:'9px', height:'9px', borderRadius:'50%', background:d.color }}/>
                <span style={{ fontSize:'11px', color:'#6b7280' }}>{d.name}</span>
                {dirCounts[id]>0&&<span style={{ fontSize:'10px', color:d.color, fontWeight:'700' }}>({dirCounts[id]})</span>}
              </div>
            )
          })}
        </div>

        {/* Filter pills */}
        <div style={{ display:'flex', gap:'8px', overflowX:'auto', padding:'10px 16px' }}>
          {filterDefs.map(f=>(
            <button key={f.id} onClick={()=>onFilter(f.id)} style={pillStyle(combFilter===f.id,f.color)}>{f.label}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ padding:'4px 16px 16px', display:'flex', flexDirection:'column', gap:'10px' }}>
          {timelineRows.length>0 ? timelineRows.map(e=>{
            const d=DIRS[e.dir]||DIRS['ameen']
            const t=TYPES[e.type]; const s=STATUS[e.status]
            const tintR=parseInt(d.color.slice(1,3),16)
            const tintG=parseInt(d.color.slice(3,5),16)
            const tintB=parseInt(d.color.slice(5,7),16)
            return (
              <div key={e.id} onClick={()=>onTapEntry(e)} style={{ display:'flex', gap:'10px', alignItems:'stretch', cursor:'pointer' }}>
                <div style={{ flexShrink:0, width:'52px', textAlign:'right', fontSize:'11px', color:'#9a958a', paddingTop:'14px', lineHeight:'1.3' }}>{e.time||'—'}</div>
                <div style={{ flex:1, background:`rgba(${tintR},${tintG},${tintB},0.10)`, border:`1px solid rgba(${tintR},${tintG},${tintB},0.25)`, borderLeft:`3px solid ${e.status==='cancelled'?'#c0392b':e.status==='completed'?'#9a958a':d.color}`, borderRadius:'5px 16px 16px 5px', padding:'12px 14px', opacity:e.status==='cancelled'?0.55:1 }}>
                  <div style={{ fontSize:'13px', fontWeight:'600', color:'#1f2937', textDecoration:e.status==='cancelled'?'line-through':'none' }}>{d.name} — {e.title}</div>
                  <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'6px', alignItems:'center' }}>
                    <span style={chipStyle(t.bg,t.fg)}>{t.label}</span>
                    <span style={{ fontSize:'10px', color:'#6b7280' }}>{d.entity}</span>
                    {e.status!=='scheduled'&&<span style={chipStyle(s.bg,s.fg)}>{s.label}</span>}
                  </div>
                </div>
                <div style={{ color:'#c9c5ba', fontSize:'16px', alignSelf:'center', flexShrink:0 }}>›</div>
              </div>
            )
          }) : (
            <div style={{ textAlign:'center', padding:'32px 0' }}>
              <div style={{ fontSize:'32px', marginBottom:'10px' }}>📋</div>
              <div style={{ fontSize:'14px', fontWeight:'600', color:'#9a958a' }}>No entries for this day</div>
            </div>
          )}
        </div>

        {/* Day navigation */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:'12px', padding:'8px 0 24px' }}>
          <button onClick={onPrevDay} style={ARROW_BTN}>‹</button>
          <div style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:'4px' }}>
            <div style={{ fontSize:'13px', fontWeight:'600', color:'#4b5563', minWidth:'120px', textAlign:'center' }}>{fmtShort(combDate)}</div>
            {!isToday&&<button onClick={onGoToday} style={{ background:'rgba(21,101,168,0.1)', border:'none', borderRadius:'8px', padding:'3px 10px', fontSize:'11px', fontWeight:'600', color:'#1565a8', cursor:'pointer' }}>Go to today</button>}
          </div>
          <button onClick={onNextDay} style={ARROW_BTN}>›</button>
        </div>
      </div>
    </div>
  )
}
