<template>
  <div class="container">
    <h1 class="mb-3">Welcome to Wellness Hub</h1>
    <p class="text-muted">Community sport for healthier lives.</p>

    <div v-if="loading" class="alert alert-info mt-4">Loading featured venues...</div>
    <div v-else-if="error" class="alert alert-danger mt-4">
      Failed to load venues. Showing fallback data.
    </div>

    <div class="row g-3 mt-2">
      <div class="col-12 col-md-6" v-for="v in featured" :key="v.id">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h3 class="card-title mb-3">{{ v.name }}</h3>
            <ul class="list-unstyled mb-0">
              <li class="mb-2">
                <i class="bi bi-geo-alt-fill me-2 text-primary"></i>
                {{ v.address }}
              </li>
              <li class="mb-2">
                <i class="bi bi-aspect-ratio me-2 text-success"></i>
                {{ v.size }}
              </li>
              <li class="mb-2">
                <i class="bi bi-telephone-fill me-2 text-info"></i>
                {{ v.phone }}
              </li>
              <li class="mb-2">
                <i class="bi bi-globe me-2 text-secondary"></i>
                <a :href="'mailto:' + v.email">{{ v.email }}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>

  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const loading = ref(true)
const error = ref(false)
const venues = ref([])

onMounted(async () => {
  try {
    const res = await fetch('/venues.json')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    venues.value = await res.json()
  } catch (e) {
    error.value = true
    
    venues.value = [
      {
        id: 1,
        name: 'Clayton Stadium',
        address: '88 Super Road, Clayton VIC 3168',
        size: '2500 sq/m',
        phone: '1303789639',
        email: 'Clayton@stadium.com.au'
      },
      {
        id: 2,
        name: 'Monash Aquatic & Recreation Centre',
        address: '626 Waverley Rd, Glen Waverley VIC 3150',
        size: '3200 sq/m',
        phone: '0392654888',
        email: 'MonashAqu@gmail.com.au'
      },
      {
        id: 3,
        name: "Oakleigh Recreation Centre",
        address: "🏠 2A Park Rd, Oakleigh VIC 3166",
        size: "📐 2400 sq/m",
        phone: "📞 0392633938",
        email: "💻 OakleighRec@gmail.com.au"
      }
    ]
  } finally {
    loading.value = false
  }
})

const featured = computed(() => venues.value)
</script>
