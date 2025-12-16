// Simple global loading bus with a counter
const listeners = new Set()
let count = 0

export function onLoadingChange(cb) {
  listeners.add(cb)
  return () => listeners.delete(cb)
}

function emit() {
  for (const cb of listeners) cb(count)
}

export function startLoading() {
  count += 1
  emit()
}

export function stopLoading() {
  count = Math.max(0, count - 1)
  emit()
}

export function getLoadingCount() {
  return count
}
