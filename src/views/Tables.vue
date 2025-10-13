<!-- src/views/Tables.vue -->
<template>
  <div class="container">
    <h1 class="mb-4">Interactive Tables</h1>

    <!-- ============ Venues ============ -->
    <section class="mb-5">
      <header class="d-flex flex-wrap align-items-end gap-3 mb-3">
        <div>
          <h2 class="h4 mb-1">Venues</h2>
          <small class="text-muted">Sort, search and paginate (up to 10 rows / page)</small>
        </div>

        <div class="ms-auto d-flex gap-2 align-items-end">
          <div class="form-group">
            <label class="form-label" for="vSearch">Search</label>
            <input
              id="vSearch"
              v-model.trim="vSearch"
              type="search"
              class="form-control"
              placeholder="name / address / phone / email"
              inputmode="search"
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="vSuburb">Suburb</label>
            <select id="vSuburb" v-model="vFilters.suburb" class="form-select">
              <option value="">All</option>
              <option v-for="s in vSuburbOptions" :key="s" :value="s">{{ s }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="vMinSize">Min Size (m²)</label>
            <input
              id="vMinSize"
              v-model.number="vFilters.minSize"
              type="number"
              min="0"
              class="form-control"
              placeholder="e.g. 2000"
              inputmode="numeric"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="vPageSize">Rows / page</label>
            <select id="vPageSize" v-model.number="vPageSize" class="form-select">
              <option v-for="n in [5,10]" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label visually-hidden" for="vExport">Export</label>
            <button id="vExport" class="btn btn-outline-primary" type="button" @click="exportVenuesCSV">
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col" role="button" @click="toggleVSort('name')">
                Name <SortIcon :by="vSort.by" :dir="vSort.dir" col="name" />
              </th>
              <th scope="col" role="button" @click="toggleVSort('address')">
                Address <SortIcon :by="vSort.by" :dir="vSort.dir" col="address" />
              </th>
              <th scope="col" role="button" @click="toggleVSort('sizeNum')">
                Size (m²) <SortIcon :by="vSort.by" :dir="vSort.dir" col="sizeNum" />
              </th>
              <th scope="col" role="button" @click="toggleVSort('phone')">
                Phone <SortIcon :by="vSort.by" :dir="vSort.dir" col="phone" />
              </th>
              <th scope="col" role="button" @click="toggleVSort('email')">
                Email <SortIcon :by="vSort.by" :dir="vSort.dir" col="email" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="v in vPageRows" :key="v.id">
              <td>{{ v.name }}</td>
              <td>{{ v.address }}</td>
              <td>{{ v.sizeNum.toLocaleString() }}</td>
              <td>{{ v.phone }}</td>
              <td>{{ v.email }}</td>
            </tr>
            <tr v-if="!vPageRows.length">
              <td colspan="5" class="text-center text-muted py-4">No venues found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pager
        :page="vPage"
        :page-size="vPageSize"
        :total="vFilteredSorted.length"
        @setPage="vPage = $event"
      />
    </section>

    <!-- ============ Activities ============ -->
    <section>
      <header class="d-flex flex-wrap align-items-end gap-3 mb-3">
        <div>
          <h2 class="h4 mb-1">Activities</h2>
          <small class="text-muted">Column search + sort + pagination</small>
        </div>

        <div class="ms-auto d-flex gap-2 align-items-end">
          <div class="form-group">
            <label class="form-label" for="aSearch">Search</label>
            <input
              id="aSearch"
              v-model.trim="aSearch"
              type="search"
              class="form-control"
              placeholder="title / location / description"
              inputmode="search"
              autocomplete="off"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="aType">Type</label>
            <select id="aType" v-model="aFilters.type" class="form-select">
              <option value="">All</option>
              <option v-for="t in aTypeOptions" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label" for="aMaxFee">Max Fee ($)</label>
            <input
              id="aMaxFee"
              v-model.number="aFilters.maxFee"
              type="number"
              min="0"
              class="form-control"
              placeholder="e.g. 5"
              inputmode="numeric"
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="aPageSize">Rows / page</label>
            <select id="aPageSize" v-model.number="aPageSize" class="form-select">
              <option v-for="n in [5,10]" :key="n" :value="n">{{ n }}</option>
            </select>
          </div>

          <div class="form-group">
            <label class="form-label visually-hidden" for="aExport">Export</label>
            <button id="aExport" class="btn btn-outline-primary" type="button" @click="exportActivitiesCSV">
              Export CSV
            </button>
          </div>
        </div>
      </header>

      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead>
            <tr>
              <th scope="col" role="button" @click="toggleASort('title')">
                Title <SortIcon :by="aSort.by" :dir="aSort.dir" col="title" />
              </th>
              <th scope="col" role="button" @click="toggleASort('type')">
                Type <SortIcon :by="aSort.by" :dir="aSort.dir" col="type" />
              </th>
              <th scope="col" role="button" @click="toggleASort('date')">
                Date <SortIcon :by="aSort.by" :dir="aSort.dir" col="date" />
              </th>
              <th scope="col" role="button" @click="toggleASort('time')">
                Time <SortIcon :by="aSort.by" :dir="aSort.dir" col="time" />
              </th>
              <th scope="col" role="button" @click="toggleASort('location')">
                Location <SortIcon :by="aSort.by" :dir="aSort.dir" col="location" />
              </th>
              <th scope="col" role="button" @click="toggleASort('fee')">
                Fee ($) <SortIcon :by="aSort.by" :dir="aSort.dir" col="fee" />
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="r in aPageRows" :key="r.id">
              <td class="fw-medium">{{ r.title }}</td>
              <td><span class="badge bg-secondary">{{ r.type }}</span></td>
              <td>{{ fmtDate(r.date) }}</td>
              <td>{{ r.time }}</td>
              <td>{{ r.location }}</td>
              <td>{{ r.fee === 0 ? 'Free' : r.fee }}</td>
            </tr>
            <tr v-if="!aPageRows.length">
              <td colspan="6" class="text-center text-muted py-4">No activities found.</td>
            </tr>
          </tbody>
        </table>
      </div>

      <Pager
        :page="aPage"
        :page-size="aPageSize"
        :total="aFilteredSorted.length"
        @setPage="aPage = $event"
      />
    </section>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue'
import { toCSV, downloadCSV } from '../utils/export'

/* ---------- small presentational icon for sort ---------- */
const SortIcon = {
  props: { by: String, dir: String, col: String },
  template: `
    <span class="ms-1 text-muted">
      <i v-if="by!==col" class="bi bi-arrow-down-up" aria-hidden="true"></i>
      <i v-else-if="dir==='asc'" class="bi bi-sort-down" aria-hidden="true"></i>
      <i v-else class="bi bi-sort-up" aria-hidden="true"></i>
    </span>`
}

/* ---------- simple pager component ---------- */
const Pager = {
  props: { page: Number, pageSize: Number, total: Number },
  emits: ['setPage'],
  computed: {
    pages () {
      const n = Math.max(1, Math.ceil(this.total / this.pageSize))
      return Array.from({ length: n }, (_, i) => i + 1)
    }
  },
  template: `
    <nav class="d-flex justify-content-between align-items-center" aria-label="Table pagination">
      <small class="text-muted">
        <strong>{{ total }}</strong> results · Page <strong>{{ page }}</strong> / {{ pages.length }}
      </small>
      <ul class="pagination mb-0">
        <li class="page-item" :class="{ disabled: page<=1 }">
          <button class="page-link" @click="$emit('setPage', Math.max(1, page-1))">Prev</button>
        </li>
        <li v-for="p in pages" :key="p" class="page-item" :class="{ active: p===page }">
          <button class="page-link" @click="$emit('setPage', p)">{{ p }}</button>
        </li>
        <li class="page-item" :class="{ disabled: page>=pages.length }">
          <button class="page-link" @click="$emit('setPage', Math.min(pages.length, page+1))">Next</button>
        </li>
      </ul>
    </nav>
  `
}

/* ---------- helpers ---------- */
const stripEmoji = (s='') => s.replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
const norm = (s='') => stripEmoji(String(s)).toLowerCase().trim()

/* ---------- Venues state ---------- */
const venues = ref([])

const vSearch = ref('')
const vFilters = reactive({
  suburb: '',
  minSize: null
})
const vSort = reactive({ by: 'name', dir: 'asc' })
const vPage = ref(1)
const vPageSize = ref(10) 

/* ---------- Activities state ---------- */
const activities = ref([])

const aSearch = ref('')
const aFilters = reactive({
  type: '',
  maxFee: null
})
const aSort = reactive({ by: 'date', dir: 'asc' })
const aPage = ref(1)
const aPageSize = ref(10)

/* ---------- data loading ---------- */
onMounted(async () => {
  // venues.json: array of { id, name, address, size, phone, email }
  const vRes = await fetch('/venues.json')
  const vRaw = await vRes.json()
  venues.value = (Array.isArray(vRaw) ? vRaw : (vRaw.data ?? []))
    .map(x => ({
      ...x,
      sizeNum: Number(String(x.size).match(/\d[\d,]*/)?.[0]?.replace(/,/g, '') || 0),
      suburb: stripEmoji(String(x.address)).split(',').at(-2)?.trim() || ''
    }))

  // activities.json: array of { id, title, type, date, time, location, fee, desc }
  const aRes = await fetch('/activities.json')
  const aRaw = await aRes.json()
  activities.value = Array.isArray(aRaw) ? aRaw : (aRaw.data ?? [])
})

/* ---------- Venues computed ---------- */
const vSuburbOptions = computed(() => {
  const set = new Set(venues.value.map(v => v.suburb).filter(Boolean))
  return Array.from(set).sort((a,b)=>a.localeCompare(b))
})

const vFilteredSorted = computed(() => {
  const kw = norm(vSearch.value)
  let rows = venues.value.filter(r => {
    const hitKw = !kw || [r.name, r.address, r.phone, r.email].some(x => norm(x).includes(kw))
    const hitSuburb = !vFilters.suburb || r.suburb === vFilters.suburb
    const hitSize = vFilters.minSize == null || r.sizeNum >= vFilters.minSize
    return hitKw && hitSuburb && hitSize
  })
  rows.sort((a,b) => {
    const by = vSort.by
    const dir = vSort.dir === 'asc' ? 1 : -1
    const A = typeof a[by] === 'string' ? a[by].toLowerCase() : a[by]
    const B = typeof b[by] === 'string' ? b[by].toLowerCase() : b[by]
    return (A > B ? 1 : A < B ? -1 : 0) * dir
  })
  return rows
})

const vPageRows = computed(() => {
  const start = (vPage.value - 1) * vPageSize.value
  return vFilteredSorted.value.slice(start, start + vPageSize.value)
})

function toggleVSort(col) {
  if (vSort.by === col) vSort.dir = vSort.dir === 'asc' ? 'desc' : 'asc'
  else { vSort.by = col; vSort.dir = 'asc' }
  vPage.value = 1
}

/* ---------- Activities computed ---------- */
const aTypeOptions = computed(() => {
  const set = new Set(activities.value.map(a => a.type).filter(Boolean))
  return Array.from(set).sort((a,b)=>a.localeCompare(b))
})

const aFilteredSorted = computed(() => {
  const kw = norm(aSearch.value)
  let rows = activities.value.filter(r => {
    const hitKw = !kw || [r.title, r.location, r.desc].some(x => norm(x).includes(kw))
    const hitType = !aFilters.type || r.type === aFilters.type
    const hitFee = aFilters.maxFee == null || Number(r.fee || 0) <= aFilters.maxFee
    return hitKw && hitType && hitFee
  })
  rows.sort((a,b) => {
    const by = aSort.by
    const dir = aSort.dir === 'asc' ? 1 : -1
    const A = typeof a[by] === 'string' ? a[by].toLowerCase() : a[by]
    const B = typeof b[by] === 'string' ? b[by].toLowerCase() : b[by]
    return (A > B ? 1 : A < B ? -1 : 0) * dir
  })
  return rows
})

const aPageRows = computed(() => {
  const start = (aPage.value - 1) * aPageSize.value
  return aFilteredSorted.value.slice(start, start + aPageSize.value)
})

function toggleASort(col) {
  if (aSort.by === col) aSort.dir = aSort.dir === 'asc' ? 'desc' : 'asc'
  else { aSort.by = col; aSort.dir = 'asc' }
  aPage.value = 1
}

/* ---------- Export CSV ---------- */
function exportVenuesCSV() {
  const rows = vFilteredSorted.value
  const columns = [
    { key: 'name',    label: 'Name' },
    { key: 'address', label: 'Address' },
    { key: 'sizeNum', label: 'Size (m²)' },
    { key: 'phone',   label: 'Phone' },
    { key: 'email',   label: 'Email' }
  ]
  const csv = toCSV(rows, columns)
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')
  downloadCSV(csv, `venues-${ts}.csv`)
}

function exportActivitiesCSV() {
  const rows = aFilteredSorted.value
  const columns = [
    { key: 'title',    label: 'Title' },
    { key: 'type',     label: 'Type' },
    { key: 'date',     label: 'Date' },
    { key: 'time',     label: 'Time' },
    { key: 'location', label: 'Location' },
    { key: 'fee',      label: 'Fee ($)' }
  ]
  const csv = toCSV(rows, columns)
  const ts = new Date().toISOString().slice(0,19).replace(/[:T]/g,'-')
  downloadCSV(csv, `activities-${ts}.csv`)
}

/* ---------- formatting ---------- */
function fmtDate(iso) {
  const d = new Date(iso)
  if (Number.isNaN(+d)) return iso
  return d.toLocaleDateString('en-AU', { day: '2-digit', month: 'short', year: 'numeric' })
}
</script>

<style scoped>
.form-group { min-width: 160px; }
.table { font-size: 0.95rem; }
th[role="button"] { user-select: none; cursor: pointer; }
</style>