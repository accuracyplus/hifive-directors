import React, { useMemo } from 'react'
import { DIRS, TYPES, STATUS, PRIORITY } from '../constants.js'
import { pad, parseTime, fmtLong, glass, chipStyle, TOP_BAR, ARROW_BTN } from '../utils.js'

const WEEKDAYS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa']

function Avatar({ dir, size = 38 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: dir.color, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: size * 0.34, fontWeight: '700', flexShrink: 0
    }}>{dir.initials}</div>
  )
}

function EntryCard({ entry }) {
  const dir = DIRS[entry.dir]
  const t = TYPES[entry.type]
  const s = STATUS[entry.status]
  const hi = entry.priority === 'high'
  return (
    <div style={{
      display: 'flex', gap: '10px', alignItems: 'flex-start',
      ...glass(0.55, 18),
      borderLeft: `3px solid ${dir.color}`,
      borderRadius: '5px 18px 18px 5px',
      padding: '13px 13px 13px 12px',
      boxShadow: '0 6px 22px -12px rgba(11,34,64,0.28)'
    }}>
      <Avatar dir={dir} size={34} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', lineHeight: '1.3' }}>{entry.title}</div>
        <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
          {entry.time}{entry.location ? ` · ${entry.location}` : ''}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
          <span style={chipStyle(t.bg, t.fg)}>{t.label}</span>
          <span style={chipStyle(s.bg, s.fg)}>{s.label}</span>
          {hi && <span style={chipStyle(PRIORITY.high.bg, PRIORITY.high.fg)}>High</span>}
        </div>
      </div>
    </div>
  )
}

export default function CalendarScreen({ curUser, entries, monY, selDate, onPrevMonth, onNextMonth, onSelDate, onAdd, today }) {
  const dir = DIRS[curUser]
  const { y, m } = monY

  const calCells = useMemo(() => {
    const startDow = new Date(y, m, 1).getDay()
    const dim = new Date(y, m + 1, 0).getDate()
    const cells = []
    for (let i = 0; i < 42; i++) {
      const dayNum = i - startDow + 1
      const inMonth = dayNum >= 1 && dayNum <= dim
      const dateStr = inMonth ? `${y}-${pad(m + 1)}-${pad(dayNum)}` : null
      const isToday = dateStr === today
      const isSel = dateStr === selDate
      const dayEntries = inMonth ? entries.filter(e => e.date === dateStr) : []
      cells.push({ dayNum, inMonth, dateStr, isToday, isSel, dayEntries })
    }
    return cells
  }, [y, m, entries, selDate, today])

  const selEntries = useMemo(() =>
    entries.filter(e => e.date === selDate).sort((a, b) => parseTime(a.time) - parseTime(b.time)),
    [entries, selDate]
  )

  const monthLabel = new Date(y, m, 1).toLocaleDateString('en-GB', { month: 'long', year: 'numeric' })

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={TOP_BAR}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>My calendar</div>
          <div style={{ fontSize: '12px', opacity: .78, marginTop: '1px' }}>
            {curUser === 'admin' ? 'Admin / PA · HiFive Holdings' : `${dir.name} · ${dir.entity}`}
          </div>
        </div>
        <Avatar dir={dir} size={38} />
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/* Month nav */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 18px 8px' }}>
          <button onClick={onPrevMonth} style={ARROW_BTN}>‹</button>
          <div style={{ fontSize: '15px', fontWeight: '700', color: '#1f2937' }}>{monthLabel}</div>
          <button onClick={onNextMonth} style={ARROW_BTN}>›</button>
        </div>

        {/* Weekday headers */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '0 12px' }}>
          {WEEKDAYS.map(w => (
            <div key={w} style={{ textAlign: 'center', fontSize: '11px', fontWeight: '600', color: '#9a958a', padding: '4px 0' }}>{w}</div>
          ))}
        </div>

        {/* Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', padding: '2px 12px 8px' }}>
          {calCells.map((c, i) => (
            <div
              key={i}
              onClick={() => c.inMonth && onSelDate(c.dateStr)}
              style={{
                minHeight: '44px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                cursor: c.inMonth ? 'pointer' : 'default',
                padding: '3px 0',
                borderRadius: '12px',
                background: c.isSel ? 'rgba(21,101,168,0.12)' : 'transparent',
                border: c.isSel ? '1px solid rgba(21,101,168,0.25)' : '1px solid transparent'
              }}
            >
              <div style={{
                width: '26px', height: '26px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                fontSize: '13px',
                fontWeight: c.isToday ? '700' : '500',
                background: c.isToday ? '#1565a8' : 'transparent',
                color: c.isToday ? '#fff' : (c.inMonth ? '#1f2937' : '#cfcbc0')
              }}>
                {c.inMonth ? c.dayNum : ''}
              </div>
              {/* Dots */}
              <div style={{ display: 'flex', gap: '2px', justifyContent: 'center', height: '6px', marginTop: '2px' }}>
                {c.dayEntries.slice(0, 4).map((e, di) => (
                  <div key={di} style={{
                    width: '5px', height: '5px', borderRadius: '50%',
                    background: TYPES[e.type].fg
                  }} />
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div style={{ height: '1px', background: '#e6e1d6', margin: '4px 16px 0' }} />

        {/* Day detail */}
        <div style={{ padding: '14px 16px 96px' }}>
          <div style={{ fontSize: '13px', fontWeight: '700', color: '#1f2937', marginBottom: '12px' }}>
            {fmtLong(selDate)}
          </div>
          {selEntries.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {selEntries.map(e => <EntryCard key={e.id} entry={e} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', color: '#9a958a', fontSize: '13px', padding: '24px 0' }}>
              No entries for this day
            </div>
          )}
        </div>
      </div>

      {/* FAB */}
      <button
        onClick={onAdd}
        style={{
          position: 'absolute', right: '18px', bottom: '78px',
          width: '56px', height: '56px', borderRadius: '50%',
          background: 'linear-gradient(180deg, #16406d, #0a2240)',
          color: '#fff', border: '1px solid rgba(255,255,255,0.25)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', zIndex: 10,
          boxShadow: '0 14px 30px -10px rgba(10,34,64,0.7)'
        }}
        aria-label="Add entry"
      >
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
    </div>
  )
}
