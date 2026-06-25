/**
 * HiFive Director Tracker — API service layer
 * Set VITE_WORKER_URL in Cloudflare Pages environment variables
 * e.g. https://hifive-directors-worker.sinusuresh.workers.dev
 */

const BASE = import.meta.env.VITE_WORKER_URL || ''

async function call(method, path, body) {
  const opts = {
    method,
    headers: { 'Content-Type': 'application/json' }
  }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(BASE + path, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

// POST /auth — returns { ok, user, wa }
export async function authLogin(user, pin) {
  return call('POST', '/auth', { user, pin })
}

// GET /entries?dir=ameen — returns { entries: [...] }
export async function fetchEntries(dir) {
  const qs = dir && dir !== 'all' ? `?dir=${dir}` : ''
  return call('GET', `/entries${qs}`)
}

// POST /entries — body: { entries: [...] }  returns { ok, entries }
export async function saveEntries(entries) {
  return call('POST', '/entries', { entries })
}

// PATCH /entries/:id — body: partial entry fields
export async function patchEntry(id, fields) {
  return call('PATCH', `/entries/${id}`, fields)
}

// PATCH /pin
export async function changePin(user, cur_pin, new_pin) {
  return call('PATCH', '/pin', { user, cur_pin, new_pin })
}

// PATCH /wa
export async function updateWa(user, wa) {
  return call('PATCH', '/wa', { user, wa })
}
