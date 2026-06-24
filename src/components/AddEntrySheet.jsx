import React from 'react'
import { DIRS, DIR_ORDER, TYPES, ENTITIES, REMINDERS } from '../constants.js'
import { pillStyle, TOP_BAR, INPUT_STYLE, BTN_PRIMARY } from '../utils.js'

const TYPE_LIST = [
  { id: 'meeting',     label: 'Meeting'     },
  { id: 'task',        label: 'Task'        },
  { id: 'sitevisit',   label: 'Site visit'  },
  { id: 'appointment', label: 'Appointment' },
  { id: 'deadline',    label: 'Deadline'    }
]

const PRIORITY_LIST = [
  { id: 'high',   label: 'High'   },
  { id: 'medium', label: 'Medium' },
  { id: 'low',    label: 'Low'    }
]

export default function AddEntrySheet({ curUser, form, onChange, onToggleAssignee, onSave, onCancel }) {
  const curDir = DIRS[curUser] || DIRS['ameen']

  function field(label, children) {
    return (
      <div>
        <div style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>{label}</div>
        {children}
      </div>
    )
  }

  return (
    <div style={{
      position: 'absolute', inset: 0,
      background: 'rgba(248,250,253,0.82)',
      backdropFilter: 'blur(30px) saturate(180%)',
      WebkitBackdropFilter: 'blur(30px) saturate(180%)',
      zIndex: 30, display: 'flex', flexDirection: 'column'
    }}>
      {/* Top bar */}
      <div style={TOP_BAR}>
        <div>
          <div style={{ fontSize: '18px', fontWeight: '700' }}>New entry</div>
          <div style={{ fontSize: '12px', opacity: .78, marginTop: '1px' }}>Adding as {curDir.name}</div>
        </div>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', color: '#fff', fontSize: '14px', fontWeight: '600', cursor: 'pointer' }}>
          Cancel
        </button>
      </div>

      {/* Form */}
      <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '20px 18px 30px', display: 'flex', flexDirection: 'column', gap: '18px' }}>

        {field('Entry type',
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {TYPE_LIST.map(t => (
              <button key={t.id} onClick={() => onChange('type', t.id)} style={pillStyle(form.type === t.id)}>
                {t.label}
              </button>
            ))}
          </div>
        )}

        {field('Title',
          <input
            value={form.title}
            onChange={e => onChange('title', e.target.value)}
            placeholder="Entry title"
            style={INPUT_STYLE}
          />
        )}

        <div style={{ display: 'flex', gap: '12px' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Date</div>
            <input type="date" value={form.date} onChange={e => onChange('date', e.target.value)} style={INPUT_STYLE} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: '12px', fontWeight: '600', color: '#4b5563', marginBottom: '8px' }}>Time</div>
            <input value={form.time} onChange={e => onChange('time', e.target.value)} placeholder="10:00 AM" style={INPUT_STYLE} />
          </div>
        </div>

        {field('Location / notes',
          <input value={form.location} onChange={e => onChange('location', e.target.value)} placeholder="Location or notes" style={INPUT_STYLE} />
        )}

        {field('Entity',
          <select value={form.entity} onChange={e => onChange('entity', e.target.value)} style={INPUT_STYLE}>
            {ENTITIES.map(en => <option key={en} value={en}>{en}</option>)}
          </select>
        )}

        {field('Assign to directors',
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            {DIR_ORDER.map(id => {
              const d = DIRS[id]
              const sel = form.assignees.includes(id)
              return (
                <button
                  key={id}
                  onClick={() => onToggleAssignee(id)}
                  style={{
                    width: '46px', height: '46px', borderRadius: '50%',
                    background: d.color, color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: '700', fontSize: '13px',
                    border: 'none', cursor: 'pointer',
                    opacity: sel ? 1 : 0.4,
                    boxShadow: sel ? `0 0 0 2px #fff, 0 0 0 4px ${d.color}` : 'none',
                    transition: 'all 0.15s ease'
                  }}
                >{d.initials}</button>
              )
            })}
          </div>
        )}

        {field('Priority',
          <div style={{ display: 'flex', gap: '8px' }}>
            {PRIORITY_LIST.map(p => (
              <button key={p.id} onClick={() => onChange('priority', p.id)} style={pillStyle(form.priority === p.id)}>
                {p.label}
              </button>
            ))}
          </div>
        )}

        {field('WhatsApp reminder',
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {REMINDERS.map(r => (
              <button key={r.id} onClick={() => onChange('reminder', r.id)} style={pillStyle(form.reminder === r.id)}>
                {r.label}
              </button>
            ))}
          </div>
        )}

        <button onClick={onSave} style={BTN_PRIMARY}>Save entry</button>
      </div>
    </div>
  )
}
