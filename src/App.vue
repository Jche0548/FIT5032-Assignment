<script setup>
import { RouterLink, RouterView, useRouter } from 'vue-router'
import { computed, onMounted } from 'vue'
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
  router.push('/').then(() => {
    const main = document.getElementById('main')
    if (main) main.focus()
    window.scrollTo(0, 0)
  })
}

onMounted(() => {
  router.afterEach(() => {
    setTimeout(() => {
      const main = document.getElementById('main')
      if (main) main.focus()
    }, 0)
  })
})
</script>

<template>
  <a class="visually-hidden-focusable" href="#main">Skip to main content</a>

  <header>
    <nav class="navbar navbar-expand-lg bg-light border-bottom" aria-label="Primary">
      <div class="container">
        <RouterLink class="navbar-brand fw-bold d-flex align-items-center" to="/">
          <img :src="logoUrl" alt="Wellness Hub Logo" height="32" class="me-2" />
          Wellness Hub
        </RouterLink>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#nav"
          aria-controls="nav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span class="navbar-toggler-icon"></span>
        </button>

        <div id="nav" class="collapse navbar-collapse">
          <ul class="navbar-nav ms-auto">
            <li class="nav-item"><RouterLink class="nav-link" to="/about">About</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/activities">Activities</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/resources">Resources</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/map">Community Map</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/contact">Contact</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/tables">Tables</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/calendar">Calendar</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/charts">Charts</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/genai">AI Plan</RouterLink></li>
            <li class="nav-item"><RouterLink class="nav-link" to="/progress">Progress</RouterLink></li>


            <!-- Only Admin -->
            <li v-if="isAdmin" class="nav-item ms-lg-2">
              <RouterLink class="btn btn-outline-secondary btn-sm" to="/admin">Admin</RouterLink>
            </li>

            <!-- Identity -->
            <li class="nav-item ms-lg-3" v-if="isAuthed">
              <span class="navbar-text small me-2">Hi, {{ displayName }}</span>
              <button class="btn btn-outline-dark btn-sm" type="button" @click="onLogout">Logout</button>
            </li>
            <li class="nav-item ms-lg-3" v-else>
              <RouterLink class="btn btn-primary btn-sm" to="/">Login / Register</RouterLink>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  </header>

  <!-- Main content: focusable -->
  <main id="main" class="container py-4" tabindex="-1">
    <RouterView />
  </main>

  <footer class="border-top py-4 text-center small text-muted">
    © 2025 Wellness Hub
  </footer>
</template>

<style scoped>
/* "Skip to main content" link that only appears when focused */
.visually-hidden-focusable {
  position: absolute;
  left: -9999px;
  top: auto;
  width: 1px;
  height: 1px;
  overflow: hidden;
}
.visually-hidden-focusable:focus {
  position: static;
  left: 0;
  width: auto;
  height: auto;
  padding: .5rem .75rem;
  margin: .5rem;
  background: #fff;
  border: 2px solid #000;
  border-radius: .25rem;
  z-index: 1000;
}

/* Users who prefer to reduce animation */
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: .01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: .01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>
