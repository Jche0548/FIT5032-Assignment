<template>
  <div class="container">
    <h1 class="mb-2">Welcome to Wellness Hub</h1>
    <p class="text-muted">Community sport for healthier lives.</p>

    <!-- Login area -->
    <div v-if="isAuthenticated" class="alert alert-success d-flex justify-content-between align-items-center mt-3">
      <div>
        <strong>Hi, {{ user.name }}</strong>
        <span class="ms-2 badge bg-secondary text-uppercase">{{ user.role }}</span>
      </div>
      <button class="btn btn-outline-light btn-sm" @click="onLogout">Logout</button>
    </div>

    <div v-else class="card shadow-sm mt-3" style="max-width: 520px;">
      <div class="card-body">
        <h5 class="card-title mb-3">
          {{ showLoginForm ? 'Login to get started' : 'Create your account' }}
        </h5>

        <form @submit.prevent="onSubmit" novalidate>
          <div class="mb-3" v-if="!showLoginForm">
            <label class="from-label">Name</label>
            <input v-model.trim="name" class="form-control" placeholder="Your name" />
          </div>

          <div class="mb-3">
            <label class="form-label">Email</label>
            <input v-model.trim="email" type="email" class="form-control" placeholder="name@example.com" />
          </div>

          <div class="mb-3">
            <label class="form-label">Password</label>
            <input v-model="password" type="password" class="form-control" placeholder="......" />
          </div>

          <!--Demo: Can select actor when register-->
          <div class="mb-3" v-if="!showLoginForm">
            <label class="form-label">Role</label>
            <select v-model="role" class="form-select">
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>

          <button class="btn btn-primary w-100">
            {{ showLoginForm ? 'Login' : 'Register' }}
          </button>
          
          <button type="button" class="btn btn-link w-100 mt-2" @click="toggleForm">
              {{ showLoginForm ? " Become one of us!! Register Now!!" : "Already have an account? Login" }}
        </button>

          <div v-if="msg" :class="['alert', ok ? 'alert-success' : 'alert-danger']">
            {{ msg }}
          </div>
        </form>
      </div>
    </div>

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
import { useAuth } from '../stores/auth'

const { state, login, logout, register } = useAuth()

const isAuthenticated = computed(() => !!state.currentUser)
const user = computed(() => state.currentUser || { name: '', role: '' })

const showLoginForm = ref(true)
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('user')  

const msg = ref('')
const ok = ref(false)

onMounted(() => {
  const stored = localStorage.getItem('login_msg')
  if (stored) {
    msg.value = stored
    ok.value = true
    localStorage.removeItem('login_msg') 
  }
})

function toggleForm () {
  showLoginForm.value = !showLoginForm.value

  name.value = ''
  email.value = ''
  password.value = ''
  role.value = 'user'     
  msg.value = ''
  ok.value = false
}

function onLogout () {
  logout()
  localStorage.removeItem('login_msg')
  msg.value = ''
  ok.value = false
  showLoginForm.value = true
}

async function onSubmit () {
  msg.value = ''
  ok.value = false

  try {
    if (!email.value || !password.value) {
      throw new Error('Please enter email and password')
    }

    if (showLoginForm.value) {
      // Login
      const success = await login({ email: email.value, password: password.value })
      if (!success) {
        throw new Error('Invalid email or password')
      }
      ok.value = true
      msg.value = 'Login successful'
    } else {
      // Register
      if (name.value.trim().length < 2) {
        throw new Error('Name must be at least 2 characters')
      }
      await register({
        name: name.value.trim(),
        email: email.value.trim(),
        password: password.value,
        role: role.value || 'user'
      })
      ok.value = true
      msg.value = 'Register successful'
    }

    name.value = ''
    email.value = ''
    password.value = ''
  } catch (e) {
    msg.value = e?.message || 'Something went wrong'
    ok.value = false
  }
}

// ========== Venue ==========
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
        address: '🏠 88 Super Road, Clayton VIC 3168',
        size: '📐 2500 sq/m',
        phone: '📞 1303789639',
        email: '💻 Clayton@stadium.com.au'
      },
      {
        id: 2,
        name: 'Monash Aquatic & Recreation Centre',
        address: '🏠 626 Waverley Rd, Glen Waverley VIC 3150',
        size: '📐 3200 sq/m',
        phone: '📞 0392654888',
        email: '💻 MonashAqu@gmail.com.au'
      },
      {
        id: 3,
        name: 'Oakleigh Recreation Centre',
        address: '🏠 2A Park Rd, Oakleigh VIC 3166',
        size: '📐 2400 sq/m',
        phone: '📞 0392633938',
        email: '💻 OakleighRec@gmail.com.au'
      }
    ]
  } finally {
    loading.value = false
  }
})

const featured = computed(() => venues.value)
</script>