<!-- src/views/GenAI.vue -->
<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../stores/auth'
import { generatePlan } from '../utils/genai'

const { state } = useAuth()
const isAuthed = computed(() => !!state.currentUser)
const userEmail = computed(() => state.currentUser?.email || '')

const goals = ref('Improve overall fitness and consistency')
const level = ref('beginner')             // beginner / intermediate / advanced
const injuries = ref('none')              // none / knee / shoulder / back
const daysPerWeek = ref(3)
const minutesPerSession = ref(60)
const useMyBookings = ref(true)
const useAllActivities = ref(false)

const loading = ref(false)
const output = ref('')
const error = ref('')

const activities = ref([])

onMounted(async () => {
  try {
    const res = await fetch('/activities.json')
    const raw = await res.json()
    activities.value = Array.isArray(raw) ? raw : (raw.data ?? [])
  } catch {
    activities.value = [
      { id: 1, title: 'Group Swimming Classes', type: 'Swimming',   date: '2025-09-07', time: '14:00', location: 'Monash Aquatic & Recreation Centre', fee: 5 },
      { id: 2, title: 'Group Pilates Classes',   type: 'Pilates',    date: '2025-09-05', time: '10:00', location: 'Glen Waverley Community Centre',    fee: 8 },
      { id: 3, title: 'Basic Basketball Classes',type: 'Basketball', date: '2025-09-10', time: '18:30', location: 'Clayton Community Gym',              fee: 0 }
    ]
  }
})

function loadMyBookings() {
  if (!userEmail.value) return []
  const key = `wh_calendar_events_${userEmail.value}`
  try {
    const list = JSON.parse(localStorage.getItem(key) || '[]')
    return list.map(e => ({
      title: e.title,
      start: e.start,
      end: e.end,
      type: e.type || 'Other',
      location: e.location || ''
    }))
  } catch {
    return []
  }
}

async function runAnalysis () {
  error.value = ''
  output.value = ''
  loading.value = true

  try {
    const prefs = {
      goals: goals.value,
      level: level.value,
      injuries: injuries.value,
      daysPerWeek: daysPerWeek.value,
      minutesPerSession: minutesPerSession.value,
      useBookings: useMyBookings.value,
      useCommunity: useAllActivities.value
    }

    const myBookings = useMyBookings.value ? loadMyBookings() : []
    const pool = useAllActivities.value ? activities.value : []

    const result = await generatePlan({
      prefs,
      bookings: myBookings,
      activities: pool
    })

    if (result.ok) {
      output.value = result.text || '(No response)'
    } else {
      error.value = result.error || 'Failed to generate plan.'
    }
  } catch (e) {
    error.value = e?.message || 'Failed to call Gemini.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="container">
    <h1 class="mb-2">AI Training Plan & Activity Analysis</h1>
    <p class="text-muted">
      Powered by <strong>Gemini</strong>. It can draft a two-week plan using your bookings and our community activities.
    </p>

    <div class="row g-3">
      <div class="col-12 col-lg-4">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Your preferences</h5>

            <div class="mb-2">
              <label class="form-label">Goals</label>
              <textarea v-model="goals" class="form-control" rows="2"></textarea>
            </div>

            <div class="row g-2">
              <div class="col-6">
                <label class="form-label">Level</label>
                <select v-model="level" class="form-select">
                  <option>beginner</option>
                  <option>intermediate</option>
                  <option>advanced</option>
                </select>
              </div>
              <div class="col-6">
                <label class="form-label">Injuries</label>
                <select v-model="injuries" class="form-select">
                  <option>none</option>
                  <option>knee</option>
                  <option>shoulder</option>
                  <option>back</option>
                </select>
              </div>
            </div>

            <div class="row g-2 mt-1">
              <div class="col-6">
                <label class="form-label">Days / week</label>
                <input v-model.number="daysPerWeek" type="number" min="1" max="7" class="form-control" />
              </div>
              <div class="col-6">
                <label class="form-label">Minutes / session</label>
                <input v-model.number="minutesPerSession" type="number" min="20" max="180" class="form-control" />
              </div>
            </div>

            <div class="form-check mt-3">
              <input id="useMine" class="form-check-input" type="checkbox" v-model="useMyBookings" :disabled="!isAuthed">
              <label class="form-check-label" for="useMine">
                Use my bookings ({{ isAuthed ? 'enabled' : 'login to use' }})
              </label>
            </div>

            <div class="form-check">
              <input id="useAll" class="form-check-input" type="checkbox" v-model="useAllActivities">
              <label class="form-check-label" for="useAll">
                Use all community activities as options
              </label>
            </div>

            <button class="btn btn-primary w-100 mt-3" :disabled="loading" @click="runAnalysis">
                <span v-if="loading">
                    <i class="spinner-border spinner-border-sm me-2"></i> Generating plan...
                </span>
                <span v-else>Generate plan</span>
            </button>
          </div>
        </div>
      </div>

      <div class="col-12 col-lg-8">
        <div class="card shadow-sm">
          <div class="card-body">
            <h5 class="card-title">Result</h5>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            <div v-else-if="!output && !loading" class="text-muted">Click "Generate plan" to start.</div>
            <div v-if="output" style="white-space: pre-wrap;">{{ output }}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>