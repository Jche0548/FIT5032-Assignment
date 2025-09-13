<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { computed } from 'vue'
import { useAuth } from './stores/auth'
import logoUrl from './assets/wellness.png'  

const router = useRouter()
const { state, logout } = useAuth()
const isAuthed = computed(() => !!state.currentUser)
const isAdmin = computed(() => state.currentUser?.role === 'admin')
const displayName = computed(() => state.currentUser?.name || '')

function onLogout () {
  logout()
  localStorage.removeItem('login_msg')
  router.push('/').then(() => window.scrollTo(0, 0))
}
</script>

<template>
  <header>
    <nav class="navbar navbar-expand-lg bg-light border-bottom">
      <div class="container">
        <RouterLink class="navbar-brand fw-bold d-flex align-items-center" to="/">
          <img :src="logoUrl" alt="Wellness Hub Logo" height="32" class="me-2" />
          Wellness Hub
        </RouterLink>

        <button class="navbar-toggler" type="button"
                data-bs-toggle="collapse" data-bs-target="#nav"
                aria-controls="nav" aria-expanded="false" aria-label="Toggle navigation">
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="nav" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><RouterLink class="nav-link" to="/about">About</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/activities">Activities</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/resources">Resources</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/map">Community Map</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/contact">Contact</RouterLink></li>

            <!--Only Admin can see-->
            <li v-if="isAdmin" class="nav-item ms-lg-2">
              <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">Admin</RouterLink>
            </li>

            <!--Identity Zone-->
            <li class="nav-item ms-lg-3" v-if="isAuthed">
              <span class="navbar-text small me-2">Hi, {{ displayName }}</span>
              <button class="btn btn-outline-dark btn-sm" @click="logout">Logout</button>
            </li>
            <li class="nav-item ms-lg-3" v-else>
              <RouterLink class="btn btn-primary btn-sm" to="/">Login / Register</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <main class="container py-4">
    <RouterView />
  </main>

  <footer class="border-top py-4 text-center small text-muted">
    © 2025 Wellness Hub
  </footer>
</template>
