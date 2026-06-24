// ─── Date helpers ─────────────────────────────────────────────────────────────
export function pad(n) { return String(n).padStart(2, '0') }

export function toISO(d) {
  return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate())
}

export function shiftDay(dateStr, delta) {
  const d = new Date(dateStr + 'T00:00:00')
  d.setDate(d.getDate() + delta)
  return toISO(d)
}

export function parseTime(t) {
  if (!t) return 9999
  if (/end of day/i.test(t)) return 1438
  const m = t.match(/(\d{1,2}):(\d{2})\s*(am|pm)/i)
  if (!m) return 9999
  let h = (+m[1]) % 12
  if (/pm/i.test(m[3])) h += 12
  return h * 60 + (+m[2])
}

export function fmtLong(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long'
  })
}

export function fmtFull(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric'
  })
}

export function fmtShort(dateStr) {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-GB', {
    weekday: 'short', day: 'numeric', month: 'short'
  })
}

export function TODAY() {
  return toISO(new Date())
}

export function groupLabel(dateStr, todayStr) {
  const today = new Date(todayStr + 'T00:00:00')
  const d = new Date(dateStr + 'T00:00:00')
  const diff = Math.round((d - today) / 864e5)
  if (diff < 0)  return 'Earlier'
  if (diff === 0) return 'Today'
  if (diff <= 6)  return 'This week'
  if (diff <= 13) return 'Next week'
  return 'Later'
}

export const GROUP_ORDER = ['Earlier', 'Today', 'This week', 'Next week', 'Later']

// ─── Style helpers ────────────────────────────────────────────────────────────
export const NAVY = '#0a2240'

export function glass(opacity = 0.55, blur = 18) {
  return {
    background: `rgba(255,255,255,${opacity})`,
    backdropFilter: `blur(${blur}px) saturate(180%)`,
    WebkitBackdropFilter: `blur(${blur}px) saturate(180%)`,
    border: '1px solid rgba(255,255,255,0.6)'
  }
}

export function chipStyle(bg, fg) {
  return {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '3px 9px',
    borderRadius: '999px',
    fontSize: '11px',
    fontWeight: '600',
    background: bg || '#f0f0f0',
    color: fg || '#555',
    whiteSpace: 'nowrap',
    flexShrink: 0
  }
}

export function pillStyle(active, color = NAVY) {
  if (active) {
    return {
      flexShrink: 0,
      padding: '8px 15px',
      borderRadius: '999px',
      fontSize: '12px',
      fontWeight: '600',
      cursor: 'pointer',
      whiteSpace: 'nowrap',
      border: `1px solid ${color}`,
      background: color,
      color: '#fff',
      boxShadow: `0 6px 16px -8px ${color}`
    }
  }
  return {
    flexShrink: 0,
    padding: '8px 15px',
    borderRadius: '999px',
    fontSize: '12px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    border: '1px solid rgba(255,255,255,0.7)',
    background: 'rgba(255,255,255,0.5)',
    backdropFilter: 'blur(14px) saturate(180%)',
    WebkitBackdropFilter: 'blur(14px) saturate(180%)',
    color: '#4b5563'
  }
}

export const TOP_BAR = {
  background: 'rgba(10,34,64,0.60)',
  backdropFilter: 'blur(24px) saturate(180%)',
  WebkitBackdropFilter: 'blur(24px) saturate(180%)',
  borderBottom: '1px solid rgba(255,255,255,0.12)',
  color: '#fff',
  padding: '14px 16px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  flexShrink: 0,
  zIndex: 5
}

export const INPUT_STYLE = {
  width: '100%',
  padding: '13px',
  borderRadius: '14px',
  background: 'rgba(255,255,255,0.55)',
  backdropFilter: 'blur(14px) saturate(180%)',
  WebkitBackdropFilter: 'blur(14px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.6)',
  fontSize: '15px',
  color: '#1f2937',
  boxSizing: 'border-box',
  boxShadow: '0 4px 18px -10px rgba(11,34,64,0.25)'
}

export const BTN_PRIMARY = {
  width: '100%',
  padding: '14px',
  border: 'none',
  borderRadius: '16px',
  background: 'linear-gradient(180deg, #16406d, #0a2240)',
  color: '#fff',
  fontSize: '15px',
  fontWeight: '600',
  cursor: 'pointer',
  boxShadow: '0 10px 26px -10px rgba(10,34,64,0.6)'
}

export const ARROW_BTN = {
  width: '36px',
  height: '36px',
  borderRadius: '12px',
  background: 'rgba(255,255,255,0.5)',
  backdropFilter: 'blur(14px) saturate(180%)',
  WebkitBackdropFilter: 'blur(14px) saturate(180%)',
  border: '1px solid rgba(255,255,255,0.6)',
  fontSize: '20px',
  color: '#1f2937',
  cursor: 'pointer',
  lineHeight: '1',
  boxShadow: '0 4px 14px -8px rgba(11,34,64,0.3)'
}
