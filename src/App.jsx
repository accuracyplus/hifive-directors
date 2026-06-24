import React, { useState, useCallback } from 'react'
import { DIRS, SEED_ENTRIES } from './constants.js'
import { toISO, shiftDay } from './utils.js'
import LoginScreen   from './components/LoginScreen.jsx'
import CalendarScreen from './components/CalendarScreen.jsx'
import CombinedScreen from './components/CombinedScreen.jsx'
import MyListScreen   from './components/MyListScreen.jsx'
import ProfileScreen  from './components/ProfileScreen.jsx'
import AddEntrySheet  from './components/AddEntrySheet.jsx'

const TODAY = toISO(new Date())

// ─── Nav tab icons ────────────────────────────────────────────────────────────
const ICONS = {
  calendar: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>
    </svg>
  ),
  combined: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 2 9 5-9 5-9-5 9-5Z"/><path d="m3 12 9 5 9-5"/><path d="m3 17 9 5 9-5"/>
    </svg>
  ),
  list: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>
    </svg>
  ),
  profile: (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="8" r="4"/><path d="M4 21c0-4 4-6 8-6s8 2 8 6"/>
    </svg>
  )
}

const TABS = [
  { id: 'calendar', label: 'Calendar' },
  { id: 'combined', label: 'Combined' },
  { id: 'list',     label: 'My list'  },
  { id: 'profile',  label: 'Profile'  }
]

// ─── Default add form ─────────────────────────────────────────────────────────
function defaultForm(userId) {
  const dir = userId === 'admin' ? 'ameen' : userId
  return {
    type: 'meeting',
    title: '',
    date: TODAY,
    time: '',
    location: '',
    entity: DIRS[dir]?.entity || 'APML',
    assignees: [dir],
    priority: 'medium',
    reminder: '1h'
  }
}

// ─── Glassmorphism app background ────────────────────────────────────────────
const BG = {
  background: `radial-gradient(120% 80% at 0% 0%, rgba(21,101,168,0.16), transparent 58%),
               radial-gradient(110% 70% at 100% 4%, rgba(43,166,164,0.15), transparent 55%),
               radial-gradient(120% 85% at 100% 100%, rgba(201,162,74,0.13), transparent 60%),
               radial-gradient(100% 80% at 0% 100%, rgba(153,53,86,0.10), transparent 60%),
               linear-gradient(180deg, #f5f7fc, #eef1f8)`
}

export default function App() {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const [loggedIn, setLoggedIn] = useState(false)
  const [selUser, setSelUser]   = useState('ameen')
  const [pin, setPin]           = useState('')

  // ── Navigation ────────────────────────────────────────────────────────────
  const [tab, setTab] = useState('calendar')

  // ── Calendar ──────────────────────────────────────────────────────────────
  const [monY, setMonY]       = useState(() => { const d = new Date(); return { y: d.getFullYear(), m: d.getMonth() } })
  const [selDate, setSelDate] = useState(TODAY)

  // ── Combined ──────────────────────────────────────────────────────────────
  const [combDate, setCombDate]     = useState(TODAY)
  const [combFilter, setCombFilter] = useState('all')

  // ── My list ───────────────────────────────────────────────────────────────
  const [listFilter, setListFilter] = useState('upcoming')

  // ── Entries ───────────────────────────────────────────────────────────────
  const [entries, setEntries] = useState(SEED_ENTRIES)

  // ── Add sheet ─────────────────────────────────────────────────────────────
  const [showAdd, setShowAdd] = useState(false)
  const [form, setForm]       = useState(() => defaultForm('ameen'))

  // ── Profile ───────────────────────────────────────────────────────────────
  const [waNumber, setWaNumber] = useState('+971 50 123 4567')

  // ── Derived: entries visible to current user ──────────────────────────────
  const visibleEntries = selUser === 'admin'
    ? entries
    : entries.filter(e => e.dir === selUser)

  // ── Handlers ──────────────────────────────────────────────────────────────
  const handleKey = useCallback((digit) => {
    setPin(prev => {
      if (prev.length >= 4) return prev
      const next = prev + digit
      if (next.length === 4) {
        setTimeout(() => { setLoggedIn(true); setPin('') }, 150)
      }
      return next
    })
  }, [])

  const handleBack = useCallback(() => setPin(p => p.slice(0, -1)), [])

  const handleSelectUser = useCallback((id) => {
    setSelUser(id)
    setPin('')
  }, [])

  const handlePrevMonth = () => setMonY(prev => {
    const nm = prev.m - 1
    return nm < 0 ? { y: prev.y - 1, m: 11 } : { y: prev.y, m: nm }
  })
  const handleNextMonth = () => setMonY(prev => {
    const nm = prev.m + 1
    return nm > 11 ? { y: prev.y + 1, m: 0 } : { y: prev.y, m: nm }
  })

  const handleOpenAdd = () => {
    setForm({ ...defaultForm(selUser), date: selDate })
    setShowAdd(true)
  }

  const handleFormChange = (key, val) => setForm(f => ({ ...f, [key]: val }))

  const handleToggleAssignee = (id) => setForm(f => {
    const has = f.assignees.includes(id)
    return {
      ...f,
      assignees: has
        ? f.assignees.filter(x => x !== id)
        : [...f.assignees, id]
    }
  })

  const handleSaveEntry = () => {
    if (!form.title.trim()) return
    const assignees = form.assignees.length
      ? form.assignees
      : [selUser === 'admin' ? 'ameen' : selUser]
    const base = Date.now()
    const newEntries = assignees.map((dir, i) => ({
      id: `n${base}${i}`,
      dir,
      title: form.title.trim(),
      time: form.time || '',
      location: form.location || form.entity,
      type: form.type,
      status: 'scheduled',
      date: form.date,
      priority: form.priority,
      entity: form.entity,
      reminder: form.reminder
    }))
    setEntries(prev => [...prev, ...newEntries])
    setSelDate(form.date)
    setMonY({ y: +form.date.slice(0, 4), m: +form.date.slice(5, 7) - 1 })
    setShowAdd(false)
    setTab('calendar')
  }

  const handleSignOut = () => {
    setLoggedIn(false)
    setPin('')
    setTab('calendar')
    setSelDate(TODAY)
  }

  // ── Bottom nav style ──────────────────────────────────────────────────────
  const navBtnStyle = (id) => ({
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '3px',
    padding: '9px 0 7px',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    fontSize: '10px',
    fontWeight: '600',
    color: tab === id ? '#1565a8' : '#9a958a'
  })

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div style={{
      minHeight: '100vh',
      ...BG,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'flex-start'
    }}>
      <div style={{
        width: '390px',
        maxWidth: '100%',
        height: '100vh',
        maxHeight: '880px',
        position: 'relative',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column'
      }}>

        {/* ── LOGIN ─────────────────────────────────────────────────────────── */}
        {!loggedIn && (
          <LoginScreen
            selUser={selUser}
            onSelectUser={handleSelectUser}
            pin={pin}
            onKey={handleKey}
            onBack={handleBack}
          />
        )}

        {/* ── MAIN APP ──────────────────────────────────────────────────────── */}
        {loggedIn && (
          <>
            {/* Screen content */}
            <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column', position: 'relative' }}>

              {tab === 'calendar' && (
                <CalendarScreen
                  curUser={selUser}
                  entries={visibleEntries}
                  monY={monY}
                  selDate={selDate}
                  today={TODAY}
                  onPrevMonth={handlePrevMonth}
                  onNextMonth={handleNextMonth}
                  onSelDate={setSelDate}
                  onAdd={handleOpenAdd}
                />
              )}

              {tab === 'combined' && (
                <CombinedScreen
                  entries={entries}
                  combDate={combDate}
                  combFilter={combFilter}
                  onFilter={setCombFilter}
                  onPrevDay={() => setCombDate(d => shiftDay(d, -1))}
                  onNextDay={() => setCombDate(d => shiftDay(d, +1))}
                />
              )}

              {tab === 'list' && (
                <MyListScreen
                  curUser={selUser}
                  entries={visibleEntries}
                  listFilter={listFilter}
                  onFilter={setListFilter}
                  onAdd={handleOpenAdd}
                  today={TODAY}
                />
              )}

              {tab === 'profile' && (
                <ProfileScreen
                  curUser={selUser}
                  waNumber={waNumber}
                  onWaChange={setWaNumber}
                  onSignOut={handleSignOut}
                />
              )}

              {/* Add entry sheet — floats over everything */}
              {showAdd && (
                <AddEntrySheet
                  curUser={selUser}
                  form={form}
                  onChange={handleFormChange}
                  onToggleAssignee={handleToggleAssignee}
                  onSave={handleSaveEntry}
                  onCancel={() => setShowAdd(false)}
                />
              )}
            </div>

            {/* ── BOTTOM NAV ──────────────────────────────────────────────────── */}
            <div style={{
              display: 'flex',
              background: 'rgba(255,255,255,0.70)',
              backdropFilter: 'blur(24px) saturate(180%)',
              WebkitBackdropFilter: 'blur(24px) saturate(180%)',
              borderTop: '1px solid rgba(255,255,255,0.6)',
              boxShadow: '0 -8px 30px -12px rgba(11,34,64,0.18)',
              flexShrink: 0
            }}>
              {TABS.map(t => (
                <button key={t.id} onClick={() => setTab(t.id)} style={navBtnStyle(t.id)}>
                  {ICONS[t.id]}
                  <span>{t.label}</span>
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  )
}
