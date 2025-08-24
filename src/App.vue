<script setup>
import { RouterLink, RouterView } from 'vue-router'
import logoUrl from './assets/wellness.png'  
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
