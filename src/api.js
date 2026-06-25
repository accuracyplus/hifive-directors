const BASE = 'https://hifive-directors-worker.sinusuresh.workers.dev'

async function call(method, path, body) {
  const opts = { method, headers:{'Content-Type':'application/json'} }
  if (body) opts.body = JSON.stringify(body)
  const res = await fetch(BASE+path, opts)
  const data = await res.json()
  if (!res.ok) throw new Error(data.error||`HTTP ${res.status}`)
  return data
}

export const authLogin     = (user, pin)               => call('POST','/auth',{user,pin})
export const fetchEntries  = (dir)                     => call('GET', `/entries${dir&&dir!=='all'?`?dir=${dir}`:''}`)
export const saveEntries   = (entries)                 => call('POST','/entries',{entries})
export const patchEntry    = (id, fields)              => call('PATCH',`/entries/${id}`,fields)
export const changePin     = (user,cur_pin,new_pin)    => call('PATCH','/pin',{user,cur_pin,new_pin})
export const adminResetPin = (admin_pin,target_user,new_pin) => call('PATCH','/pin/reset',{admin_pin,target_user,new_pin})
export const updateWa      = (user, wa)                => call('PATCH','/wa',{user,wa})
