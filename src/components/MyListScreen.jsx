import React, { useMemo } from 'react'
import { DIRS, TYPES, STATUS, PRIORITY } from '../constants.js'
import { pad, parseTime, groupLabel, GROUP_ORDER, chipStyle, pillStyle, TOP_BAR } from '../utils.js'
import SwipeableCard from './SwipeableCard.jsx'

const LIST_FILTERS = [
  { id:'upcoming', label:'Upcoming' },
  { id:'meetings', label:'Meetings' },
  { id:'tasks',    label:'Tasks'    },
  { id:'deadlines',label:'Deadlines'},
  { id:'completed',label:'Completed'}
]

function Avatar({ dir, size=38 }) {
  return (
    <div style={{ width:size, height:size, borderRadius:'50%', background:dir.color, color:'#fff', display:'flex', alignItems:'center', justifyContent:'center', fontSize:size*0.34, fontWeight:'700', flexShrink:0 }}>{dir.initials}</div>
  )
}

export default function MyListScreen({ curUser, entries, listFilter, onFilter, onAdd, onTapEntry, onStatusChange, today }) {
  const dir = DIRS[curUser] || DIRS['ameen']

  const listGroups = useMemo(() => {
    let base = entries.slice()
    if (listFilter==='upcoming')  base=base.filter(e=>e.status!=='completed'&&e.status!=='cancelled')
    else if (listFilter==='meetings')  base=base.filter(e=>e.type==='meeting')
    else if (listFilter==='tasks')     base=base.filter(e=>e.type==='task')
    else if (listFilter==='deadlines') base=base.filter(e=>e.type==='deadline')
    else if (listFilter==='completed') base=base.filter(e=>e.status==='completed')
    base.sort((a,b)=>a.date<b.date?-1:a.date>b.date?1:parseTime(a.time)-parseTime(b.time))
    const buckets={}
    base.forEach(e=>{ const g=groupLabel(e.date,today); if(!buckets[g])buckets[g]=[]; buckets[g].push(e) })
    return GROUP_ORDER.filter(g=>buckets[g]).map(g=>({label:g,items:buckets[g]}))
  },[entries,listFilter,today])

  const upcomingCount = entries.filter(e=>e.status==='scheduled').length
  const overdueCount  = entries.filter(e=>e.status==='scheduled'&&e.date<today).length

  return (
    <div style={{ flex:1, minHeight:0, display:'flex', flexDirection:'column' }}>
      <div style={TOP_BAR}>
        <div>
          <div style={{ fontSize:'18px', fontWeight:'700' }}>My assignments</div>
          <div style={{ fontSize:'12px', opacity:.78, marginTop:'1px' }}>{curUser==='admin'?'Admin / PA · HiFive Holdings':`${dir.name} · ${dir.entity}`}</div>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'6px' }}>
          {overdueCount>0&&<div style={{ background:'#c0392b', color:'#fff', borderRadius:'10px', fontSize:'11px', fontWeight:'700', padding:'3px 8px' }}>{overdueCount} overdue</div>}
          <Avatar dir={dir} size={38}/>
        </div>
      </div>

      <div style={{ display:'flex', gap:'8px', overflowX:'auto', padding:'12px 16px', flexShrink:0 }}>
        {LIST_FILTERS.map(f=>(
          <button key={f.id} onClick={()=>onFilter(f.id)} style={pillStyle(listFilter===f.id)}>
            {f.label}
            {f.id==='upcoming'&&upcomingCount>0&&<span style={{ marginLeft:'5px', background:'rgba(255,255,255,0.3)', borderRadius:'8px', padding:'0 5px', fontSize:'10px' }}>{upcomingCount}</span>}
          </button>
        ))}
      </div>

      {listFilter==='upcoming'&&<div style={{ padding:'4px 16px 8px', fontSize:'11px', color:'#9a958a' }}>← Swipe left on scheduled entries to complete or cancel</div>}

      <div style={{ flex:1, minHeight:0, overflowY:'auto', padding:'6px 16px 96px' }}>
        {listGroups.length>0 ? listGroups.map(group=>(
          <div key={group.label} style={{ marginBottom:'22px' }}>
            <div style={{ fontSize:'11px', fontWeight:'700', color:'#9a958a', textTransform:'uppercase', letterSpacing:'.05em', marginBottom:'10px' }}>{group.label}</div>
            <div style={{ display:'flex', flexDirection:'column', gap:'10px' }}>
              {group.items.map(e=>{
                const d=DIRS[e.dir]||DIRS['ameen']
                const t=TYPES[e.type]; const s=STATUS[e.status]
                const dt=new Date(e.date+'T00:00:00')
                const isOverdue=e.status==='scheduled'&&e.date<today
                const tintR=parseInt(d.color.slice(1,3),16)
                const tintG=parseInt(d.color.slice(3,5),16)
                const tintB=parseInt(d.color.slice(5,7),16)
                const canSwipe=curUser==='admin'||curUser===e.dir

                const cardInner=(
                  <div onClick={()=>onTapEntry(e)} style={{ display:'flex', gap:'12px', alignItems:'flex-start', background:`rgba(${tintR},${tintG},${tintB},0.06)`, backdropFilter:'blur(18px) saturate(180%)', WebkitBackdropFilter:'blur(18px) saturate(180%)', border:`1px solid rgba(${tintR},${tintG},${tintB},0.18)`, borderRadius:'18px', padding:'13px', boxShadow:'0 4px 18px -10px rgba(11,34,64,0.22)', cursor:'pointer', opacity:e.status==='cancelled'?0.55:1 }}>
                    <div style={{ flexShrink:0, width:'40px', textAlign:'center', borderRight:`2px solid ${d.color}`, paddingRight:'10px' }}>
                      <div style={{ fontSize:'19px', fontWeight:'700', color:'#1f2937', lineHeight:'1' }}>{pad(dt.getDate())}</div>
                      <div style={{ fontSize:'10px', color:'#9a958a', textTransform:'uppercase', marginTop:'2px', letterSpacing:'.03em' }}>{dt.toLocaleDateString('en-GB',{month:'short'})}</div>
                    </div>
                    <div style={{ flex:1, minWidth:0 }}>
                      <div style={{ fontSize:'14px', fontWeight:'600', color:'#1f2937', lineHeight:'1.3', textDecoration:e.status==='cancelled'?'line-through':'none' }}>{e.title}</div>
                      <div style={{ fontSize:'12px', color:'#6b7280', marginTop:'2px' }}>{e.time}{e.location?` · ${e.location}`:''}</div>
                      <div style={{ display:'flex', flexWrap:'wrap', gap:'5px', marginTop:'7px', alignItems:'center' }}>
                        <span style={chipStyle(t.bg,t.fg)}>{t.label}</span>
                        <span style={chipStyle(null,null)}>{d.entity}</span>
                        <span style={chipStyle(s.bg,s.fg)}>{s.label}</span>
                        {e.priority==='high'&&<span style={chipStyle(PRIORITY.high.bg,PRIORITY.high.fg)}>High</span>}
                        {isOverdue&&<span style={chipStyle('#fef2f2','#991b1b')}>⚠ Overdue</span>}
                      </div>
                    </div>
                    <div style={{ color:'#c9c5ba', fontSize:'16px', alignSelf:'center', flexShrink:0 }}>›</div>
                  </div>
                )

                if (!canSwipe||e.status!=='scheduled') return <div key={e.id}>{cardInner}</div>
                return (
                  <SwipeableCard key={e.id} onComplete={()=>onStatusChange(e.id,'completed')} onCancel={()=>onStatusChange(e.id,'cancelled')}>
                    {cardInner}
                  </SwipeableCard>
                )
              })}
            </div>
          </div>
        )) : (
          <div style={{ textAlign:'center', padding:'40px 0' }}>
            <div style={{ fontSize:'32px', marginBottom:'10px' }}>✅</div>
            <div style={{ fontSize:'14px', fontWeight:'600', color:'#9a958a' }}>Nothing here</div>
            <div style={{ fontSize:'12px', color:'#c9c5ba', marginTop:'4px' }}>All clear</div>
          </div>
        )}
      </div>

      <button onClick={onAdd} style={{ position:'absolute', right:'16px', bottom:'76px', height:'50px', borderRadius:'25px', padding:'0 20px 0 16px', background:'linear-gradient(180deg,#16406d,#0a2240)', color:'#fff', border:'1px solid rgba(255,255,255,0.2)', display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', zIndex:10, boxShadow:'0 14px 30px -10px rgba(10,34,64,0.65)', fontSize:'14px', fontWeight:'600' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M12 5v14M5 12h14"/></svg>
        Add entry
      </button>
    </div>
  )
}
