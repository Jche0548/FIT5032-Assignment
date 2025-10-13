<script setup>
import { ref, onMounted, computed, watch } from 'vue'
import { useAuth } from '../stores/auth'

const { state } = useAuth()
const isAuthed = computed(() => !!state.currentUser)
const userEmail = computed(() => state.currentUser?.email || '')

const calEl = ref(null)
let Calendar = null
let calendar = null

const keyFor = (email) => email ? `wh_calendar_events_${email}` : null

function loadFullCalendarFromCDN () {
  return new Promise((resolve, reject) => {
    // CSS
    if (!document.querySelector('link[href*="fullcalendar"]')) {
      const css = document.createElement('link')
      css.rel = 'stylesheet'
      css.href = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.css'
      document.head.appendChild(css)
    }
    // JS
    if (window.FullCalendar) return resolve(window.FullCalendar)
    const script = document.createElement('script')
    script.src = 'https://cdn.jsdelivr.net/npm/fullcalendar@6.1.15/index.global.min.js'
    script.async = true
    script.onload = () => resolve(window.FullCalendar)
    script.onerror = reject
    document.head.appendChild(script)
  })
}

const CATEGORY_LIST = [
  'Swimming', 'Pilates', 'Fitness', 'Basketball', 'Gymnastics', 'Taekwondo', 'Other'
]
function normalizeType(input = '') {
  const t = String(input).trim().toLowerCase()
  const hit = CATEGORY_LIST.find(c => c.toLowerCase() === t)
  return hit || 'Other'
}

function loadUserEvents () {
  const k = keyFor(userEmail.value)
  if (!k) return [] 
  try { return JSON.parse(localStorage.getItem(k) || '[]') } catch { return [] }
}
function saveUserEvents (events) {
  const k = keyFor(userEmail.value)
  if (!k) return
  localStorage.setItem(k, JSON.stringify(events.map(e => ({
    id: e.id,
    title: e.title,
    start: e.startStr || e.start?.toISOString(),
    end: e.endStr || e.end?.toISOString(),
    allDay: e.allDay,
    type: e.extendedProps?.type || 'Other'
  }))))
}

function isOverlap(start, end, ignoreId = null) {
  const s = start.getTime()
  const e = end ? end.getTime() : s
  return calendar.getEvents().some(ev => {
    if (ignoreId && ev.id === ignoreId) return false
    const a = ev.start?.getTime() ?? 0
    const b = ev.end?.getTime() ?? a
    return s < b && e > a
  })
}

onMounted(async () => {
  try {
    const FC = await loadFullCalendarFromCDN()
    Calendar = FC.Calendar

    const initialEvents = loadUserEvents().map(e => ({
      ...e,
      extendedProps: { type: e.type || 'Other' }
    }))

    calendar = new Calendar(calEl.value, {
      initialView: 'dayGridMonth',
      height: 'auto',
      headerToolbar: {
        left: 'prev,next today',
        center: 'title',
        right: 'dayGridMonth,timeGridWeek,timeGridDay'
      },

      selectable: isAuthed.value,  
      selectMirror: true,
      editable: isAuthed.value,     
      eventStartEditable: isAuthed.value,
      eventDurationEditable: isAuthed.value,

      eventClassNames: (arg) => {
        const t = (arg.event.extendedProps?.type || 'Other').toLowerCase()
        return [`ev-${t}`]
      },

      select: (info) => {
        if (!isAuthed.value) { alert('Please login to add bookings.'); return }
        const title = window.prompt('Booking title? (e.g., Pilates)')
        if (!title) return

        const defaultType = 'Pilates'
        const typeInput = window.prompt(
          `Category? One of:\n${CATEGORY_LIST.join(', ')}\n\n(press OK to use "${defaultType}")`,
          defaultType
        )
        const type = normalizeType(typeInput || defaultType)
        const start = info.start
        const end = info.end ?? new Date(start.getTime() + 60 * 60 * 1000)

        if (isOverlap(start, end)) {
          alert('❌ Time slot conflicts with an existing booking.')
          return
        }

        calendar.addEvent({
          id: String(Date.now()),
          title: title.trim(),
          start,
          end,
          allDay: info.allDay,
          extendedProps: { type }
        })
        saveUserEvents(calendar.getEvents())
      },

      eventClick: (info) => {
        const a = info.event.extendedProps || {}
        const details = [
          `Title: ${info.event.title}`,
          a.type ? `Type: ${a.type}` : '',
          `Start: ${info.event.start?.toLocaleString()}`,
          info.event.end ? `End: ${info.event.end?.toLocaleString()}` : ''
        ].filter(Boolean).join('\n')

        if (!isAuthed.value) { alert(details); return }
        const ok = window.confirm(`${details}\n\nDelete this booking?`)
        if (!ok) return
        info.event.remove()
        saveUserEvents(calendar.getEvents())
      },

      eventDrop: (info) => {
        if (!isAuthed.value) { info.revert(); return }
        const { event } = info
        if (isOverlap(event.start, event.end, event.id)) {
          alert('❌ Conflict with another booking. Move cancelled.')
          info.revert()
          return
        }
        saveUserEvents(calendar.getEvents())
      },
      eventResize: (info) => {
        if (!isAuthed.value) { info.revert(); return }
        const { event } = info
        if (isOverlap(event.start, event.end, event.id)) {
          alert('❌ Conflict with another booking. Resize cancelled.')
          info.revert()
          return
        }
        saveUserEvents(calendar.getEvents())
      },

      events: initialEvents
    })

    calendar.render()
  } catch (err) {
    console.error('Calendar init failed:', err)
    if (calEl.value) {
      calEl.value.innerHTML = `
        <div class="alert alert-danger m-3">
          Calendar failed to load. See console for details.
        </div>`
    }
  }
})

watch(userEmail, (newEmail, oldEmail) => {
  if (!calendar) return
  calendar.getEvents().forEach(e => e.remove())
  const fresh = loadUserEvents().map(e => ({ ...e, extendedProps: { type: e.type || 'Other' } }))
  fresh.forEach(e => calendar.addEvent(e))

  const canEdit = !!newEmail
  calendar.setOption('selectable', canEdit)
  calendar.setOption('editable', canEdit)
  calendar.setOption('eventStartEditable', canEdit)
  calendar.setOption('eventDurationEditable', canEdit)
})


function clearAll() {
  if (!calendar) return
  if (!isAuthed.value) { alert('Please login to manage bookings.'); return }
  if (!window.confirm('Clear ALL your bookings?')) return
  calendar.getEvents().forEach(e => e.remove())
  saveUserEvents(calendar.getEvents())
}
</script>

<template>
  <div class="container">
    <div class="d-flex justify-content-between align-items-center mb-2">
      <div>
        <h1 class="mb-1">Booking Calendar</h1>
        <p class="text-muted mb-0">
          <template v-if="!isAuthed">
            View only. Please <strong>login</strong> to add, edit, or delete your bookings.
          </template>
          <template v-else>
            Your personal calendar — only <strong>{{ state.currentUser.name }}</strong> can see & manage these bookings.
          </template>
        </p>
      </div>
      <button class="btn btn-outline-danger btn-sm" @click="clearAll" :disabled="!isAuthed">
        Clear all
      </button>
    </div>

    <div ref="calEl" class="card p-2 shadow-sm" />
  </div>
</template>

<style scoped>
:deep(.fc) { font-size: 0.95rem; }

:deep(.fc .ev-swimming)    { background-color:#0dcaf0; border-color:#0dcaf0; color:#000; }
:deep(.fc .ev-pilates)     { background-color:#a78bfa; border-color:#a78bfa; }
:deep(.fc .ev-fitness)     { background-color:#20c997; border-color:#20c997; }
:deep(.fc .ev-basketball)  { background-color:#f59f00; border-color:#f59f00; color:#000; }
:deep(.fc .ev-gymnastics)  { background-color:#6c757d; border-color:#6c757d; }
:deep(.fc .ev-taekwondo)   { background-color:#dc3545; border-color:#dc3545; }
:deep(.fc .ev-other)       { background-color:#495057; border-color:#495057; }

:deep(.fc .ev-swimming .fc-event-main),
:deep(.fc .ev-pilates .fc-event-main),
:deep(.fc .ev-fitness .fc-event-main),
:deep(.fc .ev-basketball .fc-event-main),
:deep(.fc .ev-gymnastics .fc-event-main),
:deep(.fc .ev-taekwondo .fc-event-main),
:deep(.fc .ev-other .fc-event-main) {
  color: inherit;
}
</style>