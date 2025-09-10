// src/stores/auth.js
import { reactive, computed } from 'vue'

const state = reactive({
  currentUser: JSON.parse(localStorage.getItem('wh_user') || 'null') // {email, name, role, token}
})

function persist(user) {
  state.currentUser = user
  localStorage.setItem('wh_user', JSON.stringify(user))
}

export function useAuth() {
  const isAuthenticated = computed(() => !!state.currentUser)
  const role = computed(() => state.currentUser?.role || 'guest')

  function register({ name, email, password, role = 'user' }) {
    // Fake database: users stored in localStorage
    const users = JSON.parse(localStorage.getItem('wh_users') || '[]')
    if (users.some(u => u.email === email)) throw new Error('Email already registered')
    users.push({ name, email, password, role })
    localStorage.setItem('wh_users', JSON.stringify(users))
    state.currentUser = { name, email, role, token: crypto.randomUUID() }
    save()
  }

  function login({ email, password }) {
    const users = JSON.parse(localStorage.getItem('wh_users') || '[]')
    const user = users.find(u => u.email === email && u.password === password)
    if (!user) throw new Error('Invalid email or password')
    state.currentUser = { name: user.name, email: user.email, role: user.role, token: crypto.randomUUID() }
    save()
  }

  function logout() {
    state.currentUser = null
    save()
  }

  return { state, isAuthenticated, role, register, login, logout }
}
