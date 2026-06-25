import React, { useState, useCallback, useEffect } from 'react'
import { DIRS } from './constants.js'
import { toISO, shiftDay } from './utils.js'
import { authLogin, fetchEntries, saveEntries, patchEntry, changePin, adminResetPin, updateWa } from './api.js'
import LoginScreen       from './components/LoginScreen.jsx'
import CalendarScreen    from './components/CalendarScreen.jsx'
import CombinedScreen    from './components/CombinedScreen.jsx'
import MyListScreen      from './components/MyListScreen.jsx'
import ProfileScreen     from './components/ProfileScreen.jsx'
import AddEntrySheet     from './components/AddEntrySheet.jsx'
import EntryDetailSheet  from './components/EntryDetailSheet.jsx'

const TODAY = toISO(new Date())

const ICONS = {
  calendar:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>,
  combined:<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/></svg>,
  list:    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/></svg>,
  profile: <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/></svg>
}
const TABS = [{id:'calendar',label:'Calendar'},{id:'combined',label:'Combined'},{id:'list',label:'My list'},{id:'profile',label:'Profile'}]

function defaultForm(userId) {
  const dir=userId==='admin'?'ameen':userId
  return { type:'meeting',title:'',date:TODAY,time:'',location:'',entity:DIRS[dir]?.entity||'APML',assignees:[dir],priority:'medium',reminder:'1h' }
}

const BG={background:'#f0f4f8'}

export default function App() {
  const [loggedIn, setLoggedIn]   = useState(false)
  const [selUser,  setSelUser]    = useState('ameen')
  const [pin,      setPin]        = useState('')
  const [authErr,  setAuthErr]    = useState('')
  const [authBusy, setAuthBusy]   = useState(false)
  const [adminPin, setAdminPin]   = useState('') // stored after admin login for reset

  const [tab, setTab] = useState('calendar')

  const [monY,    setMonY]    = useState(()=>{const d=new Date();return{y:d.getFullYear(),m:d.getMonth()}})
  const [selDate, setSelDate] = useState(TODAY)
  const [combDate,   setCombDate]   = useState(TODAY)
  const [combFilter, setCombFilter] = useState('all')
  const [listFilter, setListFilter] = useState('upcoming')

  const [entries,        setEntries]        = useState([])
  const [entriesLoading, setEntriesLoading] = useState(false)

  const [showAdd,  setShowAdd]  = useState(false)
  const [form,     setForm]     = useState(()=>defaultForm('ameen'))
  const [detailEntry, setDetailEntry] = useState(null)
  const [waNumber, setWaNumber] = useState('')

  useEffect(()=>{
    if (!loggedIn) return
    setEntriesLoading(true)
    const dir=selUser==='admin'?undefined:selUser
    fetchEntries(dir).then(d=>setEntries(d.entries||[])).catch(console.error).finally(()=>setEntriesLoading(false))
  },[loggedIn,selUser])

  useEffect(()=>{
    if (detailEntry) {
      const updated=entries.find(e=>e.id===detailEntry.id)
      if (updated) setDetailEntry(updated)
    }
  },[entries])

  const visibleEntries = selUser==='admin'?entries:entries.filter(e=>e.dir===selUser)
  const todayCount    = visibleEntries.filter(e=>e.date===TODAY&&e.status!=='cancelled').length
  const overdueCount  = visibleEntries.filter(e=>e.status==='scheduled'&&e.date<TODAY).length
  const combinedToday = entries.filter(e=>e.date===TODAY&&e.status!=='cancelled').length

  const handleKey = useCallback((digit)=>{
    if (authBusy) return
    setAuthErr('')
    setPin(prev=>{
      if (prev.length>=4) return prev
      const next=prev+digit
      if (next.length===4) setTimeout(()=>attemptLogin(selUser,next),10)
      return next
    })
  },[selUser,authBusy])

  const handleBack = useCallback(()=>{setAuthErr('');setPin(p=>p.slice(0,-1))},[])

  async function attemptLogin(user, enteredPin) {
    if (!user){setPin('');setAuthErr('Please select a user first.');return}
    setAuthBusy(true)
    try {
      const res=await authLogin(user,enteredPin)
      if (res.ok){
        if (res.wa) setWaNumber(res.wa)
        if (user==='admin') setAdminPin(enteredPin)
        setLoggedIn(true);setPin('')
      } else {setAuthErr('Incorrect PIN.');setPin('')}
    } catch(e){setAuthErr(e.message||'Login failed.');setPin('')}
    finally{setAuthBusy(false)}
  }

  const handleSelectUser=useCallback(id=>{setSelUser(id);setPin('');setAuthErr('')},[])
  const handlePrevMonth=()=>setMonY(p=>{const nm=p.m-1;return nm<0?{y:p.y-1,m:11}:{y:p.y,m:nm}})
  const handleNextMonth=()=>setMonY(p=>{const nm=p.m+1;return nm>11?{y:p.y+1,m:0}:{y:p.y,m:nm}})
  const handleOpenAdd=()=>{setForm({...defaultForm(selUser),date:selDate});setShowAdd(true)}

  const handleFormChange=(k,v)=>setForm(f=>({...f,[k]:v}))
  const handleToggleAssignee=id=>setForm(f=>{
    const has=f.assignees.includes(id)
    return{...f,assignees:has?f.assignees.filter(x=>x!==id):[...f.assignees,id]}
  })

  const handleSaveEntry=async()=>{
    if (!form.title.trim()) return
    const assignees=form.assignees.length?form.assignees:[selUser==='admin'?'ameen':selUser]
    const base=Date.now()
    const newEntries=assignees.map((dir,i)=>({
      id:`n${base}${i}`,dir,title:form.title.trim(),time:form.time||'',
      location:form.location||form.entity,type:form.type,status:'scheduled',
      date:form.date,priority:form.priority,entity:form.entity,
      reminder:form.reminder,created_by:selUser,created_at:new Date().toISOString(),wa_sent:''
    }))
    setEntries(prev=>[...prev,...newEntries])
    setSelDate(form.date)
    setMonY({y:+form.date.slice(0,4),m:+form.date.slice(5,7)-1})
    setShowAdd(false);setTab('calendar')
    try {
      const res=await saveEntries(newEntries)
      if (res.entries){
        const localIds=newEntries.map(e=>e.id)
        setEntries(prev=>[...prev.filter(e=>!localIds.includes(e.id)),...res.entries])
      }
    } catch(e){console.error('saveEntries:',e)}
  }

  const handleStatusChange=async(id,newStatus)=>{
    setEntries(prev=>prev.map(e=>e.id===id?{...e,status:newStatus}:e))
    if (detailEntry?.id===id) setDetailEntry(prev=>({...prev,status:newStatus}))
    try{await patchEntry(id,{status:newStatus})}catch(e){console.error(e)}
  }

  const handleDetailSave=async(id,fields)=>{
    setEntries(prev=>prev.map(e=>e.id===id?{...e,...fields}:e))
    if (detailEntry?.id===id) setDetailEntry(prev=>({...prev,...fields}))
    try{await patchEntry(id,fields)}catch(e){console.error(e)}
  }

  const handleChangePin=async(curPin,newPin)=>changePin(selUser,curPin,newPin)

  const handleAdminResetPin=async(targetUser,newPin)=>{
    return adminResetPin(adminPin,targetUser,newPin)
  }

  const handleUpdateWa=async wa=>{
    setWaNumber(wa)
    try{await updateWa(selUser,wa)}catch(e){console.error(e)}
  }

  const handleSignOut=()=>{
    setLoggedIn(false);setPin('');setTab('calendar')
    setSelDate(TODAY);setEntries([]);setDetailEntry(null);setAdminPin('')
  }

  const navBtnStyle = id => `hf-nav-btn${tab===id?' active':''}`

  return (
    <div style={{minHeight:'100vh',...BG,display:'flex',justifyContent:'center',alignItems:'flex-start'}}>
      <div style={{width:'390px',maxWidth:'100%',height:'100vh',maxHeight:'880px',position:'relative',overflow:'hidden',display:'flex',flexDirection:'column'}}>

        {!loggedIn&&<LoginScreen selUser={selUser} onSelectUser={handleSelectUser} pin={pin} onKey={handleKey} onBack={handleBack} error={authErr} busy={authBusy}/>}

        {loggedIn&&(
          <>
            <div style={{flex:1,minHeight:0,display:'flex',flexDirection:'column',position:'relative'}}>
              {entriesLoading&&<div style={{position:'absolute',inset:0,background:'rgba(245,247,252,0.7)',backdropFilter:'blur(4px)',display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,fontSize:'13px',color:'#6b7280'}}>Loading…</div>}

              {tab==='calendar'&&<CalendarScreen curUser={selUser} entries={visibleEntries} monY={monY} selDate={selDate} today={TODAY} onPrevMonth={handlePrevMonth} onNextMonth={handleNextMonth} onSelDate={setSelDate} onAdd={handleOpenAdd} onTapEntry={setDetailEntry} onStatusChange={handleStatusChange}/>}
              {tab==='combined'&&<CombinedScreen entries={entries} combDate={combDate} combFilter={combFilter} onFilter={setCombFilter} onPrevDay={()=>setCombDate(d=>shiftDay(d,-1))} onNextDay={()=>setCombDate(d=>shiftDay(d,+1))} onGoToday={date=>setCombDate(date||TODAY)} onTapEntry={setDetailEntry} today={TODAY}/>}
              {tab==='list'&&<MyListScreen curUser={selUser} entries={visibleEntries} listFilter={listFilter} onFilter={setListFilter} onAdd={handleOpenAdd} onTapEntry={setDetailEntry} onStatusChange={handleStatusChange} today={TODAY}/>}
              {tab==='profile'&&<ProfileScreen curUser={selUser} waNumber={waNumber} onWaChange={handleUpdateWa} onChangePin={handleChangePin} onAdminResetPin={handleAdminResetPin} onSignOut={handleSignOut}/>}

              {showAdd&&<AddEntrySheet curUser={selUser} form={form} onChange={handleFormChange} onToggleAssignee={handleToggleAssignee} onSave={handleSaveEntry} onCancel={()=>setShowAdd(false)}/>}
              {detailEntry&&<EntryDetailSheet entry={detailEntry} curUser={selUser} onClose={()=>setDetailEntry(null)} onSave={handleDetailSave} onStatusChange={handleStatusChange}/>}
            </div>

            <div className="hf-nav">
              {TABS.map(t=>(
                <button key={t.id} onClick={()=>setTab(t.id)} className={navBtnStyle(t.id)} style={{position:'relative'}}>
                  {ICONS[t.id]}
                  <span>{t.label}</span>
                  {t.id==='calendar'&&todayCount>0&&<div style={{position:'absolute',top:'6px',right:'calc(50% - 14px)',background:'#c0392b',color:'#fff',borderRadius:'8px',fontSize:'9px',fontWeight:'700',padding:'1px 5px',minWidth:'14px',textAlign:'center'}}>{todayCount}</div>}
                  {t.id==='combined'&&combinedToday>0&&<div style={{position:'absolute',top:'6px',right:'calc(50% - 14px)',background:'#1565a8',color:'#fff',borderRadius:'8px',fontSize:'9px',fontWeight:'700',padding:'1px 5px',minWidth:'14px',textAlign:'center'}}>{combinedToday}</div>}
                  {t.id==='list'&&overdueCount>0&&<div style={{position:'absolute',top:'6px',right:'calc(50% - 14px)',background:'#c0392b',color:'#fff',borderRadius:'8px',fontSize:'9px',fontWeight:'700',padding:'1px 5px',minWidth:'14px',textAlign:'center'}}>{overdueCount}</div>}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
