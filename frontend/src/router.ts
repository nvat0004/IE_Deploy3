import { createRouter, createWebHistory } from 'vue-router'

// Corrected imports based on actual folder structure
import Education from './views/Education.vue'
import SwimmingSafety from './views/SwimmingSafety.vue'
import SevenDaysPrediction from './views/SevenDaysPrediction.vue'
// @ts-ignore
import RecycleQuiz from './views/RecycleQuiz.vue'
import ChildHub from './views/ChildHub.vue'
import BeachInfo from './views/BeachInfo.vue'
import LandingPage from './views/LandingPage.vue'
import BeachRating from './views/BeachRating.vue'



const routes = [
  { path: '/', name: 'Home', component: LandingPage },
  { path: '/education', name: 'Education', component: Education },
  { path: '/safety', name: 'SwimmingSafety', component: SwimmingSafety },
  { path: '/predict', name: 'SevenDaysPrediction', component: SevenDaysPrediction },
  { path: '/recycle-quiz', name: 'RecycleQuiz', component: RecycleQuiz },
  { path: '/childhub', name: 'ChildHub', component: ChildHub },
  { path: '/beach-info', name: 'BeachInfo', component: BeachInfo },
  { path: '/beach-rating', name: 'BeachRating', component: BeachRating },
  
]

const router = createRouter({
  history: createWebHistory(),
  routes
})



export default router
