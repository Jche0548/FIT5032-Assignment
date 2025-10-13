// src/stores/auth.js
import { reactive, computed } from 'vue'

import { auth, googleProvider } from '../firebase'
import { signInWithPopup, signOut, onAuthStateChanged } from 'firebase/auth'

const AUTH_KEY  = 'wh_auth'   
const USERS_KEY = 'wh_users' 

// ---- helpers ----
function safeParse(json) {
  try { return JSON.parse(json) } catch { return null }
}

const state = reactive({
  currentUser: safeParse(localStorage.getItem(AUTH_KEY))
})

function setCurrentUser(user) {
  state.currentUser = user
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user))
  } else {
    localStorage.removeItem(AUTH_KEY)
  }
}

// ---- store API ----
export function useAuth() {
  const isAuthenticated = computed(() => !!state.currentUser)
  const role = computed(() => state.currentUser?.role || 'guest')

  function register({ name, email, password, role = 'user' }) {
    const users = safeParse(localStorage.getItem(USERS_KEY)) || []
    if (users.some(u => u.email === email)) {
      throw new Error('Email already registered')
    }
    const newUser = { name, email, password, role }
    users.push(newUser)
    localStorage.setItem(USERS_KEY, JSON.stringify(users))

    const { password: _, ...sessionUser } = newUser
    setCurrentUser({ ...sessionUser, provider: 'local' })
  }

  function login({ email, password }) {
    const users = safeParse(localStorage.getItem(USERS_KEY)) || []
    const found = users.find(u => u.email === email && u.password === password)
    if (!found) return false
    const { password: _, ...sessionUser } = found
    setCurrentUser({ ...sessionUser, provider: 'local' })
    return true
  }

  // Google Login
  async function loginWithGoogle() {
    const res = await signInWithPopup(auth, googleProvider)
    const user = res.user
    setCurrentUser({
      name: user.displayName || 'Google User',
      email: user.email,
      photoURL: user.photoURL,
      role: 'user',
      provider: 'google',
      uid: user.uid,
    })
    return true
  }

  async function logout() {
    try {
      if (state.currentUser?.provider === 'google') {
        await signOut(auth)
      }
    } finally {
      setCurrentUser(null)
    }
  }

  onAuthStateChanged(auth, (fbUser) => {
    if (fbUser) {
      if (!state.currentUser || state.currentUser.provider === 'google') {
        setCurrentUser({
          name: fbUser.displayName || 'Google User',
          email: fbUser.email,
          photoURL: fbUser.photoURL,
          role: 'user',
          provider: 'google',
          uid: fbUser.uid,
        })
      }
    } else {
      if (state.currentUser?.provider === 'google') {
        setCurrentUser(null)
      }
    }
  })

  return {
    state,
    isAuthenticated,
    role,
    register,
    login,
    logout,       
    loginWithGoogle,  
  }
}