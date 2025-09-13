// src/stores/auth.js
import { reactive, computed } from 'vue'

const AUTH_KEY = 'wh_auth'
const USERS_KEY = 'wh_users'

const state = reactive({
  currentUser: safeParse(localStorage.getItem(AUTH_KEY))
})

function safeParse(json) {
  try { return JSON.parse(json) } catch { return null }
}

function setCurrentUser(user) {
  state.currentUser = user
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}

export function useAuth() {
  const isAuthenticated = computed(() => !!state.currentUser)
  const role = computed(() => state.currentUser?.role || 'guest')

  function register({ name, email, password, role = 'user' }) {
    // Fake database: users stored in localStorage
    const users = safeParse(localStorage.getItem(USERS_KEY)) || []
    if (users.some(u => u.email === email)) {
      throw new Error('Email already registered')
    }

    const newUSer = { name, email, password, role }
    users.push(newUSer)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    const { password: _, ...sessionUSer } = newUSer
    setCurrentUser(sessionUSer)
  }
  
  
  function login({ email, password }) {
    const users = safeParse(localStorage.getItem(USERS_KEY)) || []
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return false

    const { password: _, ...sessionUser } = found
    setCurrentUser(sessionUser)
    return true
  }

  function logout() {
    stetCurrentUser(null)
  }

  return { state, isAuthenticated, role, register, login, logout }
}
