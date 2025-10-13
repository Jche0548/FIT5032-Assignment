<template>
    <div class="container">
      <header class="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
        <div>
          <h1 class="mb-1">Interactive Charts</h1>
          <p class="text-muted mb-0">
            Explore activities by <strong>type</strong> and <strong>date</strong>, with live filters and export.
          </p>
        </div>
        <div class="d-flex gap-2">
          <button class="btn btn-outline-secondary btn-sm" @click="exportCSV" :disabled="!rows.length">
            Export CSV
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="exportPNG('type')" :disabled="!rows.length">
            Download Type Chart PNG
          </button>
          <button class="btn btn-outline-secondary btn-sm" @click="exportPNG('trend')" :disabled="!rows.length">
            Download Trend Chart PNG
          </button>
        </div>
      </header>
  
      <!-- Filters -->
      <div class="row g-2 align-items-end mb-3" role="region" aria-label="Chart filters">
        <div class="col-12 col-md-4">
          <label class="form-label" for="typeSel">Type</label>
          <select id="typeSel" class="form-select" v-model="type">
            <option value="">All</option>
            <option v-for="t in typeOptions" :key="t" :value="t">{{ t }}</option>
          </select>
        </div>
        <div class="col-6 col-md-4">
          <label class="form-label" for="maxFee">Max Fee ($)</label>
          <input id="maxFee" class="form-control" v-model.number="maxFee" type="number" min="0" placeholder="e.g. 10" />
        </div>
        <div class="col-6 col-md-4">
          <label class="form-label" for="rangeSel">Range</label>
          <select id="rangeSel" class="form-select" v-model="range">
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="all">All dates</option>
          </select>
        </div>
      </div>
  
      <!-- Status -->
      <div v-if="loading" class="alert alert-info">Loading activities...</div>
      <div v-else-if="error" class="alert alert-danger">Failed to load activities. Showing fallback.</div>
  
      <!-- Charts -->
      <div v-if="rows.length" class="row g-3">
        <div class="col-12 col-lg-5">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Activity Type Distribution</h5>
              <canvas ref="typeCanvas" role="img" aria-label="Pie chart of activity type distribution"></canvas>
            </div>
          </div>
        </div>
  
        <div class="col-12 col-lg-7">
          <div class="card h-100">
            <div class="card-body">
              <h5 class="card-title">Activities Over Time</h5>
              <canvas ref="trendCanvas" role="img" aria-label="Line chart of daily activity counts"></canvas>
            </div>
          </div>
        </div>
      </div>
  
      <div v-else-if="!loading" class="alert alert-warning mt-3">
        No activities match your filters.
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
  
  /* ---------- load Chart.js via CDN (no install required) ---------- */
  let Chart = null
  async function loadChartJS () {
    if (window.Chart) { return window.Chart }
    await new Promise((resolve, reject) => {
      const s = document.createElement('script')
      s.src = 'https://cdn.jsdelivr.net/npm/chart.js@4.4.4/dist/chart.umd.min.js'
      s.async = true
      s.onload = resolve
      s.onerror = () => reject(new Error('Chart.js load failed'))
      document.head.appendChild(s)
    })
    return window.Chart
  }
  
  /* ---------- state ---------- */
  const loading = ref(true)
  const error = ref(false)
  const rows = ref([]) // activities
  
  // filters
  const type = ref('')
  const maxFee = ref(null)
  const range = ref('30') // '7' | '30' | 'all'
  
  // charts refs & instances
  const typeCanvas = ref(null)
  const trendCanvas = ref(null)
  let typeChart = null
  let trendChart = null
  
  onMounted(async () => {
    try {
      Chart = await loadChartJS()
      await loadActivities()
    } catch (e) {
      error.value = true
      rows.value = fallbackRows()
    } finally {
      loading.value = false
      drawCharts()
    }
  })
  
  onBeforeUnmount(() => {
    if (typeChart) typeChart.destroy()
    if (trendChart) trendChart.destroy()
  })
  
  /* ---------- data load ---------- */
  async function loadActivities () {
    const res = await fetch('/activities.json')
    if (!res.ok) throw new Error('HTTP ' + res.status)
    const data = await res.json()
    rows.value = Array.isArray(data) ? data : (data.data ?? [])
  }
  
  function fallbackRows () {
    return [
      { id: 1, title: 'Group Pilates', type: 'Pilates', date: '2025-09-05', time: '10:00', location: 'Glen Waverley', fee: 8 },
      { id: 2, title: 'Swimming',     type: 'Swimming', date: '2025-09-07', time: '14:00', location: 'Monash ARC', fee: 5 },
      { id: 3, title: 'Basketball',   type: 'Basketball', date: '2025-09-10', time: '18:30', location: 'Clayton', fee: 0 },
    ]
  }
  
  /* ---------- filters ---------- */
  const filtered = computed(() => {
    const r = range.value
    const today = new Date()
    let start = null
    if (r !== 'all') {
      const days = Number(r)
      start = new Date(today)
      start.setDate(start.getDate() - (days - 1))
      start.setHours(0,0,0,0)
    }
  
    return rows.value.filter(a => {
      const hitType = !type.value || a.type === type.value
      const hitFee = maxFee.value == null || Number(a.fee || 0) <= maxFee.value
      const hitDate = (() => {
        if (!start) return true
        const d = new Date(a.date)
        if (isNaN(d)) return false
        d.setHours(0,0,0,0)
        return d >= start && d <= today
      })()
      return hitType && hitFee && hitDate
    })
  })
  
  /* ---------- options ---------- */
  const typeOptions = computed(() => {
    const set = new Set(rows.value.map(r => r.type).filter(Boolean))
    return Array.from(set).sort((a,b)=>a.localeCompare(b))
  })
  
  /* ---------- chart builders ---------- */
  watch([filtered, type, maxFee, range], () => drawCharts(), { deep: true })
  
  function drawCharts () {
    drawTypeChart()
    drawTrendChart()
  }
  
  function colorsFor(n) {
    const palette = [
      '#0dcaf0','#a78bfa','#20c997','#f59f00','#6c757d','#dc3545','#495057','#198754','#0d6efd','#6610f2'
    ]
    const bg = []; const border = []
    for (let i=0;i<n;i++){
      const c = palette[i % palette.length]
      bg.push(c + '33')     
      border.push(c)
    }
    return { bg, border }
  }
  
  function drawTypeChart () {
    if (!Chart || !typeCanvas.value) return
    const map = new Map()
    filtered.value.forEach(a => map.set(a.type || 'Unknown', (map.get(a.type || 'Unknown') || 0) + 1))
    const labels = Array.from(map.keys())
    const data = Array.from(map.values())
    const { bg, border } = colorsFor(labels.length)
  
    if (typeChart) typeChart.destroy()
    typeChart = new Chart(typeCanvas.value.getContext('2d'), {
      type: 'pie',
      data: { labels, datasets: [{ data, backgroundColor: bg, borderColor: border, borderWidth: 1 }] },
      options: {
        responsive: true,
        plugins: {
          legend: { position: 'bottom' },
          tooltip: {
            callbacks: {
              label: (ctx) => {
                const total = data.reduce((s,x)=>s+x,0) || 1
                const val = ctx.parsed
                const pct = ((val/total)*100).toFixed(1)
                return `${ctx.label}: ${val} (${pct}%)`
              }
            }
          }
        }
      }
    })
  }
  
  function drawTrendChart () {
    if (!Chart || !trendCanvas.value) return
    // group by date (YYYY-MM-DD)
    const map = new Map()
    filtered.value.forEach(a => {
      const k = String(a.date)
      map.set(k, (map.get(k) || 0) + 1)
    })
    const labels = Array.from(map.keys()).sort()
    const data = labels.map(k => map.get(k))
  
    if (trendChart) trendChart.destroy()
    trendChart = new Chart(trendCanvas.value.getContext('2d'), {
      type: 'line',
      data: {
        labels,
        datasets: [{
          label: 'Activities',
          data,
          fill: false,
          borderColor: '#0d6efd',
          backgroundColor: '#0d6efd',
          tension: 0.25,
          pointRadius: 3,
          pointHoverRadius: 5
        }]
      },
      options: {
        responsive: true,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: { display: true },
          tooltip: { enabled: true }
        },
        scales: {
          x: { title: { display: true, text: 'Date' } },
          y: { title: { display: true, text: 'Count' }, beginAtZero: true, ticks: { precision: 0 } }
        }
      }
    })
  }
  
  /* ---------- export helpers ---------- */
  function exportPNG(which) {
    const c = which === 'type' ? typeCanvas.value : trendCanvas.value
    if (!c) return
    const url = c.toDataURL('image/png')
    const a = document.createElement('a')
    a.href = url
    a.download = `chart-${which}-${Date.now()}.png`
    a.click()
  }
  
  function exportCSV() {
    // export the current filtered dataset (subset of fields)
    const header = ['id','title','type','date','time','location','fee']
    const lines = [header.join(',')]
    filtered.value.forEach(a => {
      const row = header.map(k => {
        const v = a[k] ?? ''
        const s = String(v).replace(/"/g,'""')
        return /[,"\n]/.test(s) ? `"${s}"` : s
      })
      lines.push(row.join(','))
    })
    const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `activities-${Date.now()}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }
  </script>
  
  <style scoped>
  .card { box-shadow: 0 1px 2px rgba(0,0,0,.04); }
  </style>