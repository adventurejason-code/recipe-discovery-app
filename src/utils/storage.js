export function storageGet(key) {
  try {
    const raw = localStorage.getItem(key)
    return raw === null ? null : JSON.parse(raw)
  } catch {
    return null
  }
}

export function storageSet(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value))
    return true
  } catch {
    return false
  }
}

export function storageRemove(key) {
  try {
    localStorage.removeItem(key)
    return true
  } catch {
    return false
  }
}

export function storageGetString(key) {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}

export function storageSetString(key, value) {
  try {
    localStorage.setItem(key, value)
    return true
  } catch {
    return false
  }
}
