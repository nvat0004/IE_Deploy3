import { createRouter, createWebHistory } from 'vue-router'

// Corrected imports based on actual folder structure
import Home from './views/Home.vue'
import Education from './views/Education.vue'
import SwimmingSafety from './views/SwimmingSafety.vue'
import SevenDaysPrediction from './views/SevenDaysPrediction.vue'
// @ts-ignore
import RecycleQuiz from './views/RecycleQuiz.vue'
import ChildHub from './views/ChildHub.vue'
import Auth from './views/Auth.vue'
import BeachFacilities from './views/BeachFacilities.vue'
import BeachHazard from './views/BeachHazard.vue'

const routes = [
  { path: '/auth', name: 'Auth', component: Auth },
  { path: '/', name: 'Home', component: Home, meta: { requiresAuth: true } },
  { path: '/education', name: 'Education', component: Education, meta: { requiresAuth: true } },
  { path: '/safety', name: 'SwimmingSafety', component: SwimmingSafety, meta: { requiresAuth: true } },
  { path: '/predict', name: 'SevenDaysPrediction', component: SevenDaysPrediction, meta: { requiresAuth: true } },
  { path: '/recycle-quiz', name: 'RecyleQuiz', component: RecycleQuiz, meta: { requiresAuth: true } },
  { path: '/childhub', name: 'ChildHub', component: ChildHub, meta: { requiresAuth: true } },
  { path: '/facilities', name: 'BeachFacilities', component: BeachFacilities, meta: { requiresAuth: true } },
  { path: '/hazard', name: 'BeachHazard', component: BeachHazard, meta: { requiresAuth: true } }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Simple auth guard
router.beforeEach((to, _from, next) => {
  const isAuthed = localStorage.getItem('siteAuthed') === 'true'
  if (to.name === 'Auth') return next()
  if (to.matched.some(r => r.meta?.requiresAuth)) {
    if (!isAuthed) return next({ name: 'Auth', query: { redirect: to.fullPath } })
  }
  next()
})

export default router
