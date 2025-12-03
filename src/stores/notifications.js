import { ref } from 'vue'

export const toasts = ref([])

let seq = 1

export function notify({ type = 'info', message = '', timeout = 4000 } = {}) {
  const id = `${Date.now()}-${seq++}`
  toasts.value.push({ id, type, message })
  if (timeout && timeout > 0) {
    setTimeout(() => remove(id), timeout)
  }
  return id
}

export function remove(id) {
  toasts.value = toasts.value.filter(t => t.id !== id)
}

export function notifySuccess(message, timeout = 3500) {
  return notify({ type: 'success', message, timeout })
}
export function notifyError(message, timeout = 6000) {
  return notify({ type: 'error', message, timeout })
}
export function notifyWarn(message, timeout = 5000) {
  return notify({ type: 'warn', message, timeout })
}
export function notifyInfo(message, timeout = 4000) {
  return notify({ type: 'info', message, timeout })
}
