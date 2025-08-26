<template>
  <div>
    <h1 class="mb-3">Health Resources</h1>
    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-6">
        <label class="form-label">Search</label>
        <input v-model="q" type="text" class="form-control" placeholder="Search article..." />
      </div>
      <div class="col-12 col-md-3">
        <label class="form-label">Category</label>
        <select v-model="category" class="form-select">
          <option value="">All</option>
          <option>Exercise</option>
          <option>Nutrition</option>
        </select>
      </div>
    </div>

    <ul class="list-group">
      <li class="list-group-item" v-for="r in filtered" :key="r.id">
        {{ r.title }} <span class="badge bg-secondary ms-2">{{ r.category }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const q = ref('')
const category = ref('')
const items = ref([])

onMounted(async () => {
  const res = await fetch('/resources.json')
  items.value = await res.json()
})

const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return items.value.filter(r => {
    const byKw = !kw || r.title.toLowerCase().includes(kw)
    const byCat = !category.value || r.category === category.value
    return byKw && byCat
  })
})
</script>
