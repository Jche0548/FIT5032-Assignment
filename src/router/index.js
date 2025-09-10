// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import { useAuth } from '../stores/auth' 


const routes = [
  { path: '/',            name: 'home',      component: Home },
  { path: '/about',       name: 'about',     component: () => import('../views/About.vue') },
  { path: '/activities',  name: 'activities',component: () => import('../views/Activities.vue') },
  { path: '/resources',   name: 'resources', component: () => import('../views/Resources.vue') },
  { path: '/map',         name: 'map',       component: () => import('../views/Map.vue') },
  { path: '/contact',     name: 'contact',   component: () => import('../views/Contact.vue') },
  { path: '/admin', component: () => import('../views/protected/Admin.vue'), meta: { requiresAuth: true, roles: ['admin'] }},
  { path: '/unauthorized', component: () => import('../views/Unauthorized.vue') },


  // Protected Pages
  // { path: '/dashboard',   name: 'dashboard', component: () => import('../views/protected/Dashboard.vue'), meta: { requiresAuth: true } },
  // { path: '/admin',       name: 'admin',     component: () => import('../views/protected/Admin.vue'),     meta: { requiresAuth: true, roles: ['admin'] } },

  // 404
  // { path: '/:pathMatch(.*)*', name: 'notfound', component: () => import('../views/NotFound.vue') }
]

// Creating a Router Instance
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  }
})


router.beforeEach((to) => {
  const { isAuthenticated, role } = useAuth()

  if (to.meta?.guestOnly && isAuthenticated.value) {
    return { path: '/' }
  }

  // Login required
  if (to.meta?.requiresAuth && !isAuthenticated.value) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  // Requires a specific role
  if (to.meta?.roles && !to.meta.roles.includes(role.value)) {
    return { path: '/unauthorized' }
  }


  return true
})

export default router
