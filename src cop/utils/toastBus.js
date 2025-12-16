const listeners = new Set()
let idSeq = 1

export function subscribe(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function emit(toast) {
  for (const cb of listeners) cb(toast)
}

export function toast(message, type = 'info', duration = 3000) {
  const t = { id: idSeq++, message, type, duration }
  emit(t)
}

toast.success = (m, d) => toast(m, 'success', d)
toast.error = (m, d) => toast(m, 'error', d)
toast.info = (m, d) => toast(m, 'info', d)

export default toast
