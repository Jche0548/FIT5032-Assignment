<template>
  <div>
    <h1 class="mb-3">Activities & Events</h1>
    <p class="text-muted">Discover community sport programs and register online.</p>

    <!-- Search & Filters -->
    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-6">
        <label class="form-label" for="q">Search</label>
        <input id="q" v-model.trim="q" type="text" class="form-control"
               placeholder="Search by title or location..." />
      </div>
      <div class="col-6 col-md-3">
        <label class="form-label" for="type">Type</label>
        <select id="type" v-model="type" class="form-select">
          <option value="">All</option>
          <option value="Group">Group</option>
          <option value="Swimming">Swimming</option>
          <option value="Basketball">Basketball</option>
          <option value="Fitness">Fitness</option>
          <option value="Gymnastics">Gymnastics</option>
          <option value="Taekwondo">Taekwondo</option>
        </select>
      </div>
      <div class="col-6 col-md-3">
        <label class="form-label" for="maxFee">Max Fee ($)</label>
        <input id="maxFee" v-model.number="maxFee" type="number" min="0"
               class="form-control" placeholder="e.g. 5" />
      </div>
    </div>

    <!-- Filter state / actions -->
    <div class="d-flex align-items-center gap-3 mb-3">
      <span class="text-muted small">
        Showing <strong>{{ filtered.length }}</strong> {{ filtered.length === 1 ? 'result' : 'results' }}
      </span>
      <button v-if="hasActiveFilters" class="btn btn-outline-secondary btn-sm" @click="resetFilters">
        Reset filters
      </button>
    </div>

    <!-- Loading / Error -->
    <div v-if="loading" class="alert alert-info" role="status">Loading activities…</div>
    <div v-else-if="error" class="alert alert-danger" role="alert">
      Failed to load activities. Showing fallback data.
    </div>

    <!-- Cards -->
    <div class="row g-3">
      <div class="col-12 col-md-6 col-lg-4" v-for="a in filtered" :key="a.id">
        <div class="card h-100">
          <div class="card-body d-flex flex-column">
            <div class="d-flex justify-content-between align-items-start">
              <h5 class="card-title mb-1">{{ a.title }}</h5>
              <span class="badge" :class="badgeClass(a.type)">{{ a.type }}</span>
            </div>

            <p class="card-text mb-1">
              <strong>Date:</strong> {{ fmtDate(a.date) }}
              &nbsp; <strong>Time:</strong> {{ a.time }}
            </p>
            <p class="card-text mb-2">
              <strong>Location:</strong> {{ a.location }}
              &nbsp; | &nbsp;
              <strong>Fee:</strong>
              <span :class="a.fee === 0 ? 'badge bg-success' : ''">
                {{ a.fee === 0 ? 'Free' : fmtCurrency(a.fee) }}
              </span>
            </p>

            <p class="card-text text-muted small flex-grow-1">{{ a.desc }}</p>

            <RouterLink class="btn btn-primary mt-2" to="/contact" aria-label="Register for activity">
              Register
            </RouterLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div v-if="!loading && filtered.length === 0" class="alert alert-warning mt-3">
      No activities match your filters. Try clearing filters or searching a different keyword.
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const error = ref(false)
const activities = ref([])

// filters
const q = ref('')
const type = ref('')
const maxFee = ref(null)

const hasActiveFilters = computed(() =>
  q.value.trim() !== '' || type.value !== '' || maxFee.value !== null
)

function resetFilters () {
  q.value = ''
  type.value = ''
  maxFee.value = null
}

// load data
onMounted(async () => {
  try {
    const res = await fetch('/activities.json')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    activities.value = await res.json()
  } catch (e) {
    error.value = true
    // Fallback data (matches your new categories)
    activities.value = [
      { id: 9991, title: 'Group Pilates Classes', type: 'Group',       date: '2025-09-05', time: '10:00', location: 'Glen Waverley Community Centre', fee: 8, desc: 'Low-impact core strength and mobility.' },
      { id: 9992, title: 'Group Swimming Classes', type: 'Swimming',   date: '2025-09-07', time: '14:00', location: 'Monash Aquatic & Recreation Centre', fee: 5, desc: 'Technique and endurance for mixed abilities.' }
    ]
  } finally {
    loading.value = false
  }
})

// filtering
const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return activities.value.filter(a => {
    const byKw = !kw || a.title.toLowerCase().includes(kw) || a.location.toLowerCase().includes(kw)
    const byType = !type.value || a.type === type.value
    const byFee = maxFee.value == null || a.fee <= maxFee.value
    return byKw && byType && byFee
  })
})

// formatting
const fmtCurrency = (n) =>
  new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', maximumFractionDigits: 0 }).format(Number(n || 0))

const fmtDate = (iso) => {
  const d = new Date(iso)
  if (isNaN(d)) return iso // fallback
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}

// badge color by type
function badgeClass (t) {
  switch (t) {
    case 'Group':       return 'bg-primary'
    case 'Swimming':    return 'bg-info text-dark'
    case 'Basketball':  return 'bg-warning text-dark'
    case 'Fitness':     return 'bg-success'
    case 'Gymnastics':  return 'bg-secondary'
    case 'Taekwondo':   return 'bg-danger'
    default:            return 'bg-dark'
  }
}
</script>
