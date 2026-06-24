import React, { useMemo } from 'react'
import { DIRS, DIR_ORDER, TYPES } from '../constants.js'
import { parseTime, fmtFull, fmtShort, shiftDay, pillStyle, TOP_BAR, ARROW_BTN } from '../utils.js'

export default function CombinedScreen({ entries, combDate, combFilter, onFilter, onPrevDay, onNextDay }) {

  const timelineRows = useMemo(() => {
    let list = entries.filter(e => e.date === combDate)
    if (combFilter !== 'all') list = list.filter(e => e.dir === combFilter)
    return list.sort((a, b) => parseTime(a.time) - parseTime(b.time))
  }, [entries, combDate, combFilter])

  const filterDefs = [
    { id: 'all', label: 'All', color: '#0a2240' },
    ...DIR_ORDER.map(id => ({ id, label: DIRS[id].name, color: DIRS[id].color }))
  ]

  return (
    <div style={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
      {/* Top bar */}
      <div style={TOP_BAR}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>Combined view</div>
          <div style={{ fontSize: '12px', opacity: .78, marginTop: '1px' }}>{fmtFull(combDate)}</div>
        </div>
        {/* All 5 avatars */}
        <div style={{ display: 'flex' }}>
          {DIR_ORDER.map((id, i) => {
            const d = DIRS[id]
            return (
              <div key={id} style={{
                width: '28px', height: '28px', borderRadius: '50%',
                background: d.color, color: '#fff',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '10px', fontWeight: '700',
                marginLeft: i === 0 ? '0' : '-7px',
                boxShadow: '0 0 0 2px #0a2240',
                zIndex: DIR_ORDER.length - i
              }}>{d.initials}</div>
            )
          })}
        </div>
      </div>

      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto' }}>
        {/* Legend */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px 14px', padding: '12px 16px', borderBottom: '1px solid #f0ede4' }}>
          {DIR_ORDER.map(id => {
            const d = DIRS[id]
            return (
              <div key={id} style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                <div style={{ width: '9px', height: '9px', borderRadius: '50%', background: d.color }} />
                <span style={{ fontSize: '11px', color: '#6b7280' }}>{d.name}</span>
              </div>
            )
          })}
        </div>

        {/* Filter pills */}
        <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', padding: '12px 16px' }}>
          {filterDefs.map(f => (
            <button
              key={f.id}
              onClick={() => onFilter(f.id)}
              style={pillStyle(combFilter === f.id, f.color)}
            >{f.label}</button>
          ))}
        </div>

        {/* Timeline */}
        <div style={{ padding: '4px 16px 16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {timelineRows.length > 0 ? timelineRows.map(e => {
            const d = DIRS[e.dir]
            const t = TYPES[e.type]
            return (
              <div key={e.id} style={{ display: 'flex', gap: '10px', alignItems: 'stretch' }}>
                <div style={{
                  flexShrink: 0, width: '62px', textAlign: 'right',
                  fontSize: '11px', color: '#9a958a', paddingTop: '13px'
                }}>{e.time || '—'}</div>
                <div style={{
                  flex: 1, background: d.color, color: '#fff',
                  borderRadius: '16px', padding: '13px 15px',
                  boxShadow: `0 8px 22px -12px ${d.color}`
                }}>
                  <div style={{ fontSize: '14px', fontWeight: '600' }}>{e.title}</div>
                  <div style={{ fontSize: '11px', opacity: '.85', marginTop: '2px' }}>
                    {t.label} · {d.entity}
                  </div>
                </div>
              </div>
            )
          }) : (
            <div style={{ textAlign: 'center', color: '#9a958a', fontSize: '13px', padding: '24px 0' }}>
              No entries for this day
            </div>
          )}
        </div>

        {/* Day navigation */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '18px', padding: '6px 0 24px' }}>
          <button onClick={onPrevDay} style={ARROW_BTN}>‹</button>
          <div style={{ fontSize: '13px', fontWeight: '600', color: '#4b5563', minWidth: '120px', textAlign: 'center' }}>
            {fmtShort(combDate)}
          </div>
          <button onClick={onNextDay} style={ARROW_BTN}>›</button>
        </div>
      </div>
    </div>
  )
}
