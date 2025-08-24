import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'

const routes = [
  { path: '/',         name: 'home',       component: Home },
  { path: '/about',    name: 'about',      component: () => import('../views/About.vue') },
  { path: '/activities', name: 'activities', component: () => import('../views/Activities.vue') },
  { path: '/resources',  name: 'resources',  component: () => import('../views/Resources.vue') },
  { path: '/map',        name: 'map',        component: () => import('../views/Map.vue') },
  { path: '/contact',    name: 'contact',    component: () => import('../views/Contact.vue') }
]

export default createRouter({
  history: createWebHistory(),
  routes
})
