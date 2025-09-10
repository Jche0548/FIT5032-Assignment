<template>
    <div class="container">
      <h1 class="mb-3">Admin Dashboard</h1>
  
      <p class="text-muted">Only accessible to users with the admin role.</p>
  
      <!-- Login Information -->
      <div class="alert alert-success mb-4">
        Logged in as: <strong>{{ user?.name }}</strong>
        <span class="ms-2">({{ user?.email }})</span>
      </div>
  
      <!-- User list -->
      <h5 class="mb-2">All Registered Users:</h5>
      <ul class="list-group">
        <li class="list-group-item" v-for="u in users" :key="u.email">
          <strong>{{ u.name }}</strong> - {{ u.email }}
          <span class="badge bg-secondary ms-2">{{ u.role }}</span>
        </li>
      </ul>
    </div>
  </template>
  
  <script setup>
  import { computed, ref, onMounted } from 'vue'
  import { useAuth } from '../../stores/auth'
  
  const { state } = useAuth()
  const user = computed(() => state.currentUser)
  
  const users = ref([])
  
  onMounted(() => {
    try {
      users.value = JSON.parse(localStorage.getItem('wh_users') || '[]')
    } catch {
      users.value = []
    }
  })
  </script>
  