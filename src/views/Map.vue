<!-- src/views/Map.vue -->
<script setup>
import { ref, onMounted, computed } from 'vue'

/* ============== Utils ============== */
const stripEmoji = (s = '') =>
  String(s).replace(/\p{Emoji_Presentation}|\p{Extended_Pictographic}/gu, '')
const cleanAddress = (addr = '') =>
  stripEmoji(String(addr)).replace(/^🏠\s*/u, '').trim()

/* ============== Refs / State ============== */
const mapEl = ref(null)
const panelEl = ref(null)
const searchEl = ref(null)

const map = ref(null)
const markers = ref([])
const venues = ref([])

const selectedVenueId = ref(null)
const selectedVenue = computed(
  () => venues.value.find(v => Number(v.id) === Number(selectedVenueId.value)) || null
)

const travelMode = ref('DRIVING') // DRIVING | WALKING | BICYCLING | TRANSIT

const origin = ref(null)     // {lat, lng}
const originText = ref('')   // UI 顯示

let g = null
let directionsService = null
let directionsRenderer = null
let searchMarker = null
let autocomplete = null

/* ============== Load Google Maps (Functional API) ============== */
function loadMaps() {
  return new Promise((resolve, reject) => {
    if (window.google?.maps?.importLibrary) return resolve(window.google)

    const key = import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    if (!key) return reject(new Error('Missing VITE_GOOGLE_MAPS_API_KEY'))

    const cbName = '__gmaps_cb_' + Math.random().toString(36).slice(2)
    window[cbName] = () => resolve(window.google)

    const script = document.createElement('script')
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&v=weekly&callback=${cbName}`
    script.async = true
    script.defer = true
    script.onerror = (e) => reject(e)
    document.head.appendChild(script)
  })
}

/* ============== Init ============== */
onMounted(async () => {
  g = await loadMaps()

  await g.maps.importLibrary('maps')
  await g.maps.importLibrary('places')

  map.value = new g.maps.Map(mapEl.value, {
    center: { lat: -37.9105, lng: 145.1373 }, 
    zoom: 12,
    mapTypeControl: false,
    streetViewControl: false
  })

  // Directions
  directionsService = new g.maps.DirectionsService()
  directionsRenderer = new g.maps.DirectionsRenderer({
    map: map.value,
    panel: panelEl.value,
    suppressMarkers: false
  })

  // Venue Marking
  await loadVenuesAndMarkers()

  // Places Autocomplete
  autocomplete = new g.maps.places.Autocomplete(searchEl.value, {
    fields: ['geometry', 'name', 'formatted_address']
  })
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace()
    if (!place?.geometry?.location) return
    const loc = place.geometry.location
    origin.value = loc.toJSON()
    originText.value = place.formatted_address || place.name || 'Selected place'

    if (searchMarker) searchMarker.setMap(null)
    searchMarker = new g.maps.Marker({
      map: map.value,
      position: loc,
      icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
      title: originText.value
    })
    map.value.panTo(loc)
    map.value.setZoom(13)
  })
})

/* ============== Venues & Markers ============== */
async function loadVenuesAndMarkers () {
  try {
    const res = await fetch('/venues.json')
    const raw = await res.json()
    const list = Array.isArray(raw) ? raw : (raw.data ?? [])
    const geocoder = new g.maps.Geocoder()

    const bounds = new g.maps.LatLngBounds()

    for (const v of list) {
      let position = null

      if (v.lat && v.lng) {
        const lat = Number(v.lat)
        const lng = Number(v.lng)
        if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
          position = new g.maps.LatLng(lat, lng)
          v._latLng = { lat, lng }
        }
      }

      if (!position) {
        const addr = cleanAddress(v.address)
        try {
          const { results } = await geocoder.geocode({ address: addr })
          if (results?.[0]) {
            position = results[0].geometry.location
            v._latLng = position.toJSON()
          }
        } catch { /* ignore geocode error */ }
      }

      if (!position) continue

      const marker = new g.maps.Marker({
        map: map.value,
        position,
        title: v.name
      })
      const info = new g.maps.InfoWindow({
        content: `<strong>${v.name}</strong><br>${cleanAddress(v.address)}`
      })
      marker.addListener('click', () => {
        info.open(map.value, marker)
        selectedVenueId.value = v.id
      })
      markers.value.push(marker)
      bounds.extend(position)
    }

    venues.value = list
    if (markers.value.length) {
      map.value.fitBounds(bounds)
      selectedVenueId.value = venues.value.find(v => v._latLng)?.id ?? venues.value[0]?.id
      onVenueChange()
    }
  } catch (e) {
    console.error('Load venues failed:', e)
  }
}

/* ============== UI Handlers ============== */
function onVenueChange () {
  const v = selectedVenue.value
  if (!v) return
  const dest = v._latLng || (v.lat && v.lng ? { lat: Number(v.lat), lng: Number(v.lng) } : null)
  if (!dest) return
  const pos = new g.maps.LatLng(dest.lat, dest.lng)
  map.value.panTo(pos)
  map.value.setZoom(14)
}

function useMyLocation () {
  if (!navigator.geolocation) {
    alert('Geolocation is not supported by your browser')
    return
  }
  navigator.geolocation.getCurrentPosition(
    pos => {
      const { latitude, longitude } = pos.coords
      origin.value = { lat: latitude, lng: longitude }
      originText.value = 'My location'

      if (searchMarker) searchMarker.setMap(null)
      searchMarker = new g.maps.Marker({
        map: map.value,
        position: origin.value,
        icon: { url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png' },
        title: 'My location'
      })
      map.value.panTo(origin.value)
      map.value.setZoom(13)
    },
    () => alert('Unable to get your location')
  )
}

function drawRoute () {
  const v = selectedVenue.value
  const dest = v?._latLng || (v?.lat && v?.lng ? { lat: Number(v.lat), lng: Number(v.lng) } : null)
  if (!origin.value) return alert('Please set origin (search or use my location).')
  if (!dest) return alert('Please select a valid destination venue.')

  directionsService.route(
    {
      origin: origin.value,
      destination: dest,
      travelMode: travelMode.value
    },
    (res, status) => {
      if (status === 'OK') {
        directionsRenderer.setDirections(res)
      } else {
        alert('Directions request failed: ' + status)
        console.warn('Directions error:', status, { origin: origin.value, dest })
      }
    }
  )
}
</script>

<template>
  <div class="container">
    <h1 class="mb-3">Community Map</h1>

    <div class="row g-2 align-items-end mb-3" role="region" aria-label="Map controls">
      <div class="col-12 col-md-5">
        <label for="originSearch" class="form-label">Origin (search any place)</label>
        <input
          id="originSearch"
          ref="searchEl"
          type="text"
          class="form-control"
          placeholder="e.g., Monash University Clayton"
          aria-label="Search origin"
        />
      </div>

      <div class="col-12 col-sm-6 col-md-3">
        <label class="form-label" for="venueSel">Destination (venue)</label>
        <select
          id="venueSel"
          class="form-select"
          v-model="selectedVenueId"
          @change="onVenueChange"
          aria-label="Destination venue"
        >
          <option v-for="v in venues" :key="v.id" :value="v.id">
            {{ v.name }}
          </option>
        </select>
      </div>

      <div class="col-6 col-md-2">
        <label class="form-label" for="modeSel">Mode</label>
        <select id="modeSel" class="form-select" v-model="travelMode" aria-label="Travel mode">
          <option value="DRIVING">Driving</option>
          <option value="WALKING">Walking</option>
          <option value="BICYCLING">Bicycling</option>
          <option value="TRANSIT">Transit</option>
        </select>
      </div>

      <div class="col-6 col-md-2 d-grid">
        <button class="btn btn-outline-secondary" type="button" @click="useMyLocation">
          Use my location
        </button>
      </div>
    </div>

    <div class="d-flex gap-3 flex-column flex-lg-row">
      <div class="flex-grow-1">
        <div
          ref="mapEl"
          style="height: 460px; width: 100%; border-radius: 8px; border: 1px solid #e5e7eb;"
          role="application"
          aria-label="Interactive map showing venues and routes"
        />
      </div>

      <div class="flex-shrink-0" style="width: 360px; max-width: 100%;">
        <div class="card h-100">
          <div class="card-body">
            <div class="d-flex justify-content-between align-items-end mb-2">
              <div class="small text-muted">
                <div><strong>Origin:</strong> {{ originText || 'Not set' }}</div>
                <div><strong>Destination:</strong> {{ selectedVenue?.name || '-' }}</div>
              </div>
              <button class="btn btn-primary btn-sm" @click="drawRoute">Route</button>
            </div>
            <div ref="panelEl" style="max-height: 390px; overflow: auto;" aria-live="polite"></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card :deep(.adp),
.card :deep(.adp-directions) { font-size: 0.95rem; }
</style>