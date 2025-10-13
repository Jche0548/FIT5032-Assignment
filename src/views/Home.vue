<template>
  <div class="container">
    <h1 class="mb-2">Welcome to Wellness Hub</h1>
    <p class="text-muted">Community sport for healthier lives.</p>

    <!-- 已登入 -->
    <div v-if="isAuthenticated" class="alert alert-success d-flex justify-content-between align-items-center mt-3">
      <div>
        <strong>Hi, {{ user.name }}</strong>
        <span class="ms-2 badge bg-secondary text-uppercase">{{ user.role }}</span>
      </div>
      <button class="btn btn-outline-light btn-sm" @click="onLogout">Logout</button>
    </div>

    <!-- 未登入：本地帳密 + Google -->
    <div v-else class="card shadow-sm mt-3" style="max-width: 520px;">
      <div class="card-body">
        <h5 class="card-title mb-3">
          {{ showLoginForm ? 'Login to get started' : 'Create your account' }}
        </h5>

        <form @submit.prevent="onSubmit" novalidate>
          <div class="mb-3" v-if="!showLoginForm">
            <label class="form-label">Name</label> <!-- ← 修正 from-label -->
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

          <!-- 分隔線 -->
          <div class="text-center text-muted my-2">— or —</div>

          <!-- Google 登入 -->
          <button type="button" class="btn btn-outline-dark w-100" @click="onGoogle">
            <!-- 你有載入 Bootstrap Icons 的話可以加：<i class="bi bi-google me-1"></i> -->
            Continue with Google
          </button>

          <div v-if="msg" :class="['alert', ok ? 'alert-success' : 'alert-danger', 'mt-3']">
            {{ msg }}
          </div>
        </form>
      </div>
    </div>

    <!-- 下面 featured venues 保持原樣 -->
    <!-- ... -->
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useAuth } from '../stores/auth'

// ⚠️ 只呼叫一次 useAuth，並在這裡一次解構需要的方法
const auth = useAuth()
const { state, register, login, logout, loginWithGoogle } = auth

const isAuthenticated = computed(() => !!state.currentUser)
const user = computed(() => state.currentUser || { name: '', role: '' })

const showLoginForm = ref(true)
const name = ref('')
const email = ref('')
const password = ref('')
const role = ref('user')

const msg = ref('')
const ok = ref(false)

function toggleForm () {
  showLoginForm.value = !showLoginForm.value
  name.value = ''
  email.value = ''
  password.value = ''
  role.value = 'user'
  msg.value = ''
  ok.value = false
}

async function onGoogle () {
  try {
    await loginWithGoogle()
    msg.value = 'Login successful'
    ok.value = true
  } catch (e) {
    msg.value = e?.message || 'Google sign-in failed'
    ok.value = false
  }
}

function onLogout () {
  logout()
  msg.value = ''
  ok.value = false
  showLoginForm.value = true
}

async function onSubmit () {
  msg.value = ''
  ok.value = false
  try {
    if (!email.value || !password.value) throw new Error('Please enter email and password')

    if (showLoginForm.value) {
      const success = await login({ email: email.value, password: password.value })
      if (!success) throw new Error('Invalid email or password')
      ok.value = true
      msg.value = 'Login successful'
    } else {
      if (name.value.trim().length < 2) throw new Error('Name must be at least 2 characters')
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