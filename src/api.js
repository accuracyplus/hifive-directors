const BASE = 'https://hifive-directors-worker.sinusuresh.workers.dev'

async function call(method, path, body) {
  const opts = { method, headers: { 'Content-Type': 'application/json' } }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(BASE + path, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`)
  return data
}

export async function authLogin(user, pin) {
  return call('POST', '/auth', { user, pin })
}

export async function fetchEntries(dir) {
  const qs = dir && dir !== 'all' ? `?dir=${dir}` : ''
  return call('GET', `/entries${qs}`)
}

export async function saveEntries(entries) {
  return call('POST', '/entries', { entries })
}

export async function patchEntry(id, fields) {
  return call('PATCH', `/entries/${id}`, fields)
}

export async function changePin(user, cur_pin, new_pin) {
  return call('PATCH', '/pin', { user, cur_pin, new_pin })
}

export async function updateWa(user, wa) {
  return call('PATCH', '/wa', { user, wa })
}
