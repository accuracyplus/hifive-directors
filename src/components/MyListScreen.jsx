import React, { useMemo } from 'react'
import { DIRS, TYPES, STATUS, PRIORITY } from '../constants.js'
import { pad, parseTime, groupLabel, GROUP_ORDER, glass, chipStyle, pillStyle, TOP_BAR } from '../utils.js'

const LIST_FILTERS = [
  { id: 'upcoming',  label: 'Upcoming'  },
  { id: 'meetings',  label: 'Meetings'  },
  { id: 'tasks',     label: 'Tasks'     },
  { id: 'deadlines', label: 'Deadlines' },
  { id: 'completed', label: 'Completed' }
]

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

export default function MyListScreen({ curUser, entries, listFilter, onFilter, onAdd, today }) {
  const dir = DIRS[curUser]

  const listGroups = useMemo(() => {
    let base = entries.slice()
    if (listFilter === 'upcoming')  base = base.filter(e => e.status !== 'completed')
    else if (listFilter === 'meetings')  base = base.filter(e => e.type === 'meeting')
    else if (listFilter === 'tasks')     base = base.filter(e => e.type === 'task')
    else if (listFilter === 'deadlines') base = base.filter(e => e.type === 'deadline')
    else if (listFilter === 'completed') base = base.filter(e => e.status === 'completed')

    base.sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : parseTime(a.time) - parseTime(b.time)
    )

    const buckets = {}
    base.forEach(e => {
      const g = groupLabel(e.date, today)
      if (!buckets[g]) buckets[g] = []
      buckets[g].push(e)
    })

    return GROUP_ORDER.filter(g => buckets[g]).map(g => ({ label: g, items: buckets[g] }))
  }, [entries, listFilter, today])

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={TOP_BAR}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>My assignments</div>
          <div style={{ fontSize: '12px', opacity: .78, marginTop: '1px' }}>
            {curUser === 'admin' ? 'Admin / PA · HiFive Holdings' : `${dir.name} · ${dir.entity}`}
          </div>
        </div>
        <Avatar dir={dir} size={38} />
      </div>

      {/* Filter pills */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 16px', flexShrink: 0 }}>
        {LIST_FILTERS.map(f => (
          <button key={f.id} onClick={() => onFilter(f.id)} style={pillStyle(listFilter === f.id)}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '6px 16px 96px' }}>
        {listGroups.length > 0 ? listGroups.map(group => (
          <div key={group.label} style={{ marginBottom: '20px' }}>
            <div style={{
              fontSize: '12px', fontWeight: '700', color: '#9a958a',
              textTransform: 'uppercase', letterSpacing: '.05em', marginBottom: '10px'
            }}>{group.label}</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {group.items.map(e => {
                const d = DIRS[e.dir]
                const t = TYPES[e.type]
                const s = STATUS[e.status]
                const dt = new Date(e.date + 'T00:00:00')
                return (
                  <div key={e.id} style={{
                    display: 'flex', gap: '12px', alignItems: 'flex-start',
                    ...glass(0.55, 18),
                    borderRadius: '18px',
                    padding: '13px',
                    boxShadow: '0 6px 22px -12px rgba(11,34,64,0.28)'
                  }}>
                    {/* Date column */}
                    <div style={{ flexShrink: 0, width: '42px', textAlign: 'center' }}>
                      <div style={{ fontSize: '20px', fontWeight: '700', color: '#1f2937', lineHeight: '1' }}>
                        {pad(dt.getDate())}
                      </div>
                      <div style={{ fontSize: '10px', color: '#9a958a', textTransform: 'uppercase', marginTop: '3px', letterSpacing: '.03em' }}>
                        {dt.toLocaleDateString('en-GB', { month: 'short' })}
                      </div>
                    </div>
                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0, borderLeft: `3px solid ${d.color}`, paddingLeft: '11px' }}>
                      <div style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', lineHeight: '1.3' }}>
                        {e.title}
                      </div>
                      <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>
                        {e.time}{e.location ? ` · ${e.location}` : ''}
                      </div>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                        <span style={chipStyle(t.bg, t.fg)}>{t.label}</span>
                        <span style={chipStyle(null, null)}>{d.entity}</span>
                        <span style={chipStyle(s.bg, s.fg)}>{s.label}</span>
                        {e.priority === 'high' && (
                          <span style={chipStyle(PRIORITY.high.bg, PRIORITY.high.fg)}>High</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )) : (
          <div style={{ textAlign: 'center', color: '#9a958a', fontSize: '13px', padding: '30px 0' }}>
            Nothing here
          </div>
        )}
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
