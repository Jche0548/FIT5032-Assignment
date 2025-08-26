<template>
  <div>
    <h1 class="mb-3">Activities & Events</h1>
    <p class="text-muted">Discover community sport programs and register online.</p>

    <!-- Search and filter -->
    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-6">
        <label class="form-label">Search</label>
        <input v-model="q" type="text" class="form-control" placeholder="Search by title or location..." />
      </div>
      <div class="col-6 col-md-3">
        <label class="form-label">Type</label>
        <select v-model="type" class="form-select">
          <option value="">All</option>
          <option value="Fitness">Fitness</option>
          <option value="Family">Family</option>
          <option value="Team">Team</option>
        </select>
      </div>
      <div class="col-6 col-md-3">
        <label class="form-label">Max Fee ($)</label>
        <input v-model.number="maxFee" type="number" class="form-control" min="0" placeholder="e.g. 5" />
      </div>
    </div>

    <!-- Loading Status / Errors -->
    <div v-if="loading" class="alert alert-info">Loading activities...</div>
    <div v-else-if="error" class="alert alert-danger">Failed to load activities. Showing fallback data.</div>

    <!-- Active card list (dynamic rendering) -->
    <div class="row g-3">
      <div class="col-12 col-md-6 col-lg-4" v-for="a in filtered" :key="a.id">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <h5 class="card-title">{{ a.title }}</h5>
            <p class="card-text mb-1">
              <strong>Date:</strong> {{ a.date }} &nbsp; <strong>Time:</strong> {{ a.time }}
            </p>
            <p class="card-text mb-2">
              <strong>Location:</strong> {{ a.location }} &nbsp; | &nbsp;
              <strong>Type:</strong> {{ a.type }} &nbsp; | &nbsp;
              <strong>Fee:</strong> {{ a.fee === 0 ? 'Free' : '$' + a.fee }}
            </p>
            <p class="card-text text-muted small flex-grow-1">{{ a.desc }}</p>
            <RouterLink class="btn btn-primary mt-2" :to="`/contact`">Register</RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- No results -->
    <div v-if="!loading && filtered.length === 0" class="alert alert-warning mt-3">
      No activities match your filters.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const error = ref(false)
const activities = ref([])

// Search and filter state
const q = ref('')
const type = ref('')
const maxFee = ref(null)

// Load from public/activities.json
onMounted(async () => {
  try {
    const res = await fetch('/activities.json')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    activities.value = await res.json()
  } catch (e) {
    error.value = true
    // Fallback: If loading fails, use the built-in array
    activities.value = [
      { id: 201, title: 'Fallback Yoga', type: 'Fitness', date: '2025-09-12', time: '09:00', location: 'Oakleigh', fee: 0, desc: 'Fallback data.' }
    ]
  } finally {
    loading.value = false
  }
})

// Filtering logic
const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return activities.value.filter(a => {
    const matchKw = !kw || a.title.toLowerCase().includes(kw) || a.location.toLowerCase().includes(kw)
    const matchType = !type.value || a.type === type.value
    const matchFee = maxFee.value == null || a.fee <= maxFee.value
    return matchKw && matchType && matchFee
  })
})
</script>
