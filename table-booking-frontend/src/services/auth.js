export function getStoredUser() {
  try {
    const user = JSON.parse(localStorage.getItem('user'))
    return user && typeof user === 'object' ? user : null
  } catch {
    localStorage.removeItem('user')
    return null
  }
}

export function storeUser(user) {
  localStorage.setItem('user', JSON.stringify(user))
  window.dispatchEvent(new Event('tablebook-auth-change'))
}

export function removeStoredUser() {
  localStorage.removeItem('user')
  window.dispatchEvent(new Event('tablebook-auth-change'))
}