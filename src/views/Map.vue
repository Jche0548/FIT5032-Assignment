<template>
  <div>
    <h1 class="mb-3">Community Map</h1>

    <div class="row g-2 align-items-end mb-3">
      <div class="col-12 col-md-4">
        <label class="form-label">Search</label>
        <input v-model="q" type="text" class="form-control" placeholder="Search by name or suburb..." />
      </div>
      <div class="col-6 col-md-4">
        <label class="form-label">Category</label>
        <select v-model="category" class="form-select">
          <option value="">All</option>
          <option>Park</option>
          <option>Gym</option>
          <option>Pool</option>
        </select>
      </div>
      <div class="col-6 col-md-4 form-check mt-4">
        <input id="acc" class="form-check-input" type="checkbox" v-model="onlyAccessible" />
        <label for="acc" class="form-check-label">Accessible only</label>
      </div>
    </div>

    <div class="row">
      <div class="col-12 col-md-8">
        <div class="border bg-light d-flex justify-content-center align-items-center" style="height:300px;">
          Map Area (Placeholder)
        </div>
      </div>
      <div class="col-12 col-md-4">
        <ul class="list-group">
          <li class="list-group-item" v-for="f in filtered" :key="f.id">
            <strong>{{ f.name }}</strong> - {{ f.suburb }} ({{ f.category }}) <span v-if="f.accessible" class="badge bg-success ms-2">Accessible</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'

const q = ref('')
const category = ref('')
const onlyAccessible = ref(false)
const facilities = ref([])

onMounted(async () => {
  const res = await fetch('/facilities.json')
  facilities.value = await res.json()
})

const filtered = computed(() => {
  const kw = q.value.trim().toLowerCase()
  return facilities.value.filter(f => {
    const byKw = !kw || f.name.toLowerCase().includes(kw) || f.suburb.toLowerCase().includes(kw)
    const byCat = !category.value || f.category === category.value
    const byAcc = !onlyAccessible.value || f.accessible
    return byKw && byCat && byAcc
  })
})
</script>
