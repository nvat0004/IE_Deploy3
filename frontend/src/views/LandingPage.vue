<template>
  <div class="landing-page">
    <!-- HeroVideo (reused, Get Started scrolls to #content) -->
    <HeroVideo :dashboardRef="contentRef" :featuresRef="featuresRef" />

    <!-- HeroSecondary (new component) -->
    <HeroSecondary
      title="Real-Time Beach Safety"
      subtitle="Get instant water quality updates and weather forecasts for Melbourne's beaches. Stay informed, stay safe."
      imgSrc=""
    />

    <!-- Main Content Section -->
    <section id="content" ref="contentRef" class="content-section">
      <div class="content-container">
        <!-- BeachSelector (new component) -->
        <div class="beach-selector-wrapper">
          <BeachSelector
            :beaches="beachOptions"
            @select="handleBeachSelect"
            :selectedBeach="selectedBeach"
            :lastUpdated="new Date()"
          />
        </div>


        <!-- Two-column layout (lg:grid-cols-2, gap-6; mobile: stacked) -->
        <div class="dashboard-grid">
          <!-- Left: MiniMap -->
          <div class="dashboard-left">
            <MiniMap
              :lat="selectedBeach?.lat"
              :lon="selectedBeach?.lon"
              :name="selectedBeach?.name"
              :zoom="13"
            />
          </div>

          <!-- Right: Vertical 3 cards (gap-4) -->
          <div class="dashboard-right">
            <div class="dashboard-cards">
              <!-- DashboardUV -->
              <DashboardUV
                :value="weatherData?.uvData?.value || null"
                :loading="loadingWeather"
                :error="weatherError"
                @retry="fetchWeatherData"
              />

              <!-- DashboardWeather -->
              <DashboardWeather
                :times="weatherData?.weatherData?.times || []"
                :temps="weatherData?.weatherData?.temps || []"
                :loading="loadingWeather"
                :error="weatherError"
                @retry="fetchWeatherData"
              />

              <!-- Water Quality Status -->
<div class="water-quality-status">
  <h4>Water Quality Status</h4>
  <div v-if="loadingWaterQuality" class="loading-state">
    <span>Loading water quality data...</span>
  </div>
  <div v-else-if="waterQualityError" class="error-state">
    <span class="error-text">{{ waterQualityError }}</span>
    <button @click="fetchWaterQualityData" class="retry-button">Retry</button>
  </div>
  <div v-else-if="waterQualityData" class="status-content">
    <div class="status-badge" :class="getStatusClass(waterQualityData.label)">
      {{ waterQualityData.label }}
    </div>
    <p class="status-reason">{{ waterQualityData.reason }}</p>

    <div class="overall-rating" :class="getOverallClass(waterQualityData.label)">
  <h5 class="overall-title">Overall Rating</h5>
  <p class="overall-message">{{ waterQualityData.overallReason }}</p>
</div>

  </div>
  <div v-else class="no-data">
    <span>No water quality data available</span>
  </div>
</div>

            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section ref="featuresRef" class="features-section">
      <div class="features-container">
        <div class="features-header">
          <h2 class="features-title">What We Provide</h2>
          <p class="features-subtitle">Comprehensive beach safety information at your fingertips</p>
        </div>
        
        <div class="features-grid">
          <div v-for="(feature, index) in features" :key="index" class="feature-card">
            <h3 class="feature-title">{{ feature.title }}</h3>
            <p class="feature-description">{{ feature.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Articles Section -->
    <section class="articles-section">
      <div class="articles-container">
        <div class="articles-header">
          <h2 class="articles-title">Latest News</h2>
          <p class="articles-subtitle">Stay updated with beach safety news and alerts</p>
        </div>
        <ArticleSlider :articles="articleLinks" />
      </div>
    </section>

    <!-- Footer -->
    <footer class="footer">
      <small>© 2025 AquaProtect - TA22 Team </small>
      <small>Keeping families safe at Beaches</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import HeroVideo from '@/components/HeroVideo.vue'
import HeroSecondary from '@/components/HeroSecondary.vue'
import BeachSelector from '@/components/BeachSelector.vue'
import MiniMap from '@/components/MiniMap.vue'
import DashboardUV from '@/components/DashboardUV.vue'
import DashboardWeather from '@/components/DashboardWeather.vue'
import ArticleSlider from '@/components/ArticleSlider.vue'
import { fetchWeatherPack, type WeatherPack } from '@/services/openweather.ts'

// Refs
const contentRef = ref<HTMLElement | null>(null)
const featuresRef = ref<HTMLElement | null>(null)

interface Beach {
  id: string
  name: string
  lat: number
  lon: number
}

interface WaterQualityData {
  score: number
  label: 'Safe' | 'Moderate' | 'Dangerous' | 'Unknown'
  reason?: string
  overallReason?: string
}


const beachOptions: Beach[] = [
  { id: 'dromana', name: 'Dromana Beach', lat: -38.3319, lon: 144.9649 },
  { id: 'carrum', name: 'Carrum Beach', lat: -38.0765, lon: 145.1205 },
  { id: 'stkilda', name: 'St Kilda Beach', lat: -37.8679, lon: 144.9740 },
  { id: 'portmelbourne', name: 'Port Melbourne Beach', lat: -37.8470, lon: 144.9455 },
  { id: 'altona', name: 'Altona Beach', lat: -37.8710, lon: 144.8300 }
]

const selectedBeach = ref<Beach | null>(null)

const weatherData = ref<WeatherPack | null>(null)
const loadingWeather = ref(false)
const weatherError = ref<string | null>(null)

const waterQualityData = ref<WaterQualityData | null>(null)
const loadingWaterQuality = ref(false)
const waterQualityError = ref<string | null>(null)


const articleLinks = [
  { title: 'Poor water quality forecast for all beaches in Victoria\'s Port Phillip Bay, EPA warns', url: 'https://www.abc.net.au/news/2017-01-20/poor-water-quality-forecast-at-all-beaches-in-port-phillip-bay/8197404' },
  { title: 'Filthy reason some Melbourne beaches are closed to swimmers', url: 'https://www.heraldsun.com.au/news/victoria/melbourne-beaches-not-suitable-for-swimming-after-severe-storms/news-story/6d37ab96514f5fb1fd585be957831f3d' },
  { title: 'Water Quality in Port Phillip Bay still recovering after Victoria\'s record floods', url: 'https://www.abc.net.au/news/2023-01-05/victoria-beach-bay-water-quality-epa-melbourne-floods/101826148' },
  { title: 'Health risks at bay and ocean beaches', url: 'https://www.mpnews.com.au/2022/10/31/health-risks-at-bay-and-ocean-beaches/' },
  { title: 'Melbourne\'s Port Phillip Bay not suitable for swimming after severe storms', url: 'https://www.abc.net.au/news/2023-12-29/melbourne-bays-poor-water-quality-explainer/103269472' },
  { title: 'The bay has turned brown and swimmers are emerging coated in a strange goo', url: 'https://www.theage.com.au/politics/victoria/the-bay-has-turned-brown-and-swimmers-are-emerging-coated-in-a-strange-goo-20240118-p5ey9u.html' },
  { title: 'Why you should check the water quality before going for a swim in Victoria', url: 'https://www.racv.com.au/royalauto/travel/victoria/swimming-water-quality-victoria.html' }
];

const features = [
  {
    title: 'Real-Time Monitoring',
    description: 'Live water quality updates and weather conditions for all major beaches'
  },
  {
    title: 'Advance Planning',
    description: '7-day forecasts to help you plan your beach visits safely'
  },
  {
    title: 'Educational Resources',
    description: 'Learn about water safety, health risks, and environmental factors'
  },
  {
    title: 'Interactive Maps',
    description: 'Visual representation of beach conditions across Victoria'
  },
  {
    title: 'Mobile Friendly',
    description: 'Access all features on any device, anywhere, anytime'
  }
];

// Interaction flow: onSelect(beach) → update selectedBeach → MiniMap auto flyTo → call fetchWeatherPack → update UV/Weather cards; async request backend prediction, update Water Quality card
const handleBeachSelect = async (beach: Beach) => {
  selectedBeach.value = beach
  try { localStorage.setItem('selectedBeachName', beach.name) } catch {}
  await fetchWeatherData()
  await fetchWaterQualityData()
}

const fetchWeatherData = async () => {
  if (!selectedBeach.value) return

  try {
    loadingWeather.value = true
    weatherError.value = null
    const result = await fetchWeatherPack(selectedBeach.value.lat, selectedBeach.value.lon)
    
    // Only update if result is not null (not aborted)
    if (result) {
      weatherData.value = result
    }
  } catch (error) {
    weatherError.value = error instanceof Error ? error.message : 'Failed to fetch weather data'
    console.error('Weather fetch error:', error)
  } finally {
    loadingWeather.value = false
  }
}

const fetchWaterQualityData = async () => {
  if (!selectedBeach.value) return

  try {
    loadingWaterQuality.value = true
    waterQualityError.value = null

    // Connect to existing backend prediction API
    const response = await fetch(`/api/today-safety?beach=${encodeURIComponent(selectedBeach.value.name)}`)

    if (!response.ok) {
      throw new Error(`Water quality API error: ${response.status} ${response.statusText}`)
    }

    const data = await response.json()

    // Determine status label and score
    let score: number
    let label: 'Safe' | 'Moderate' | 'Dangerous' | 'Unknown'

    if (data.status === 'Safe') {
      score = 85
      label = 'Safe'
    } else if (data.status === 'Moderate') {
      score = 60
      label = 'Moderate'
    } else if (data.status === 'Dangerous') {
      score = 25
      label = 'Dangerous'
    } else {
      score = 50
      label = 'Unknown'
    }

    // Add refined justifications based on overall rating logic
    let overallReason = ''
    if (label === 'Safe') {
      overallReason = 'Forecast indicates favourable swimming conditions — Safe: Water quality is excellent, with bacteria levels within the safe threshold (≤ 35 orgs/100 mL).'
    } else if (label === 'Moderate') {
      overallReason = 'Forecast indicates cautionary swimming conditions — Moderate: Water quality shows slight contamination, with bacteria levels between 36 and 104 orgs/100 mL.'
    } else if (label === 'Dangerous') {
      overallReason = 'Forecast indicates hazardous swimming conditions — Dangerous: Swimming is not advised due to elevated bacteria levels exceeding 104 orgs/100 mL.'
    } else {
      overallReason = 'Unable to determine safety level — data currently unavailable.'
    }

    // Build transformed response
    const transformedData: WaterQualityData = {
      score,
      label,
      reason: data.reason || 'Based on recent water quality measurements',
      overallReason
    }

    waterQualityData.value = transformedData
  } catch (error) {
    waterQualityError.value = error instanceof Error ? error.message : 'Failed to fetch water quality data'
    console.error('Water quality fetch error:', error)
  } finally {
    loadingWaterQuality.value = false
  }
}


// Get status class for styling
const getStatusClass = (label: string) => {
  switch (label) {
    case 'Safe': return 'status-safe'
    case 'Moderate': return 'status-moderate'
    case 'Dangerous': return 'status-dangerous'
    default: return 'status-unknown'
  }
}

// Match overall rating color with main status badge
const getOverallClass = (label: string) => {
  switch (label) {
    case 'Safe':
      return 'overall-safe'
    case 'Moderate':
      return 'overall-moderate'
    case 'Dangerous':
      return 'overall-dangerous'
    default:
      return 'overall-unknown'
  }
}



// Initialize
onMounted(() => {
  const savedName = (() => { try { return localStorage.getItem('selectedBeachName') || '' } catch { return '' } })()
  const saved = beachOptions.find(b => b.name === savedName)
  if (saved) {
    selectedBeach.value = saved
  } else if (beachOptions.length > 0) {
    selectedBeach.value = beachOptions[0]
  }
})

// Watch for beach selection changes
watch(selectedBeach, async (newBeach) => {
  if (newBeach) {
    await fetchWeatherData()
    await fetchWaterQualityData()
  }
}, { immediate: true })
</script>

<style scoped>
.landing-page {
  min-height: 100vh;
  background: #f8fafc;
}

.content-section {
  padding: 4rem 0;
  background: white;
}

.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.beach-selector-wrapper {
  margin-bottom: 2rem;
}

.water-quality-status {
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.water-quality-status h4 {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
}

.loading-state, .no-data {
  text-align: center;
  color: #6b7280;
  font-style: italic;
}

.error-state {
  text-align: center;
}

.error-text {
  color: #dc2626;
  display: block;
  margin-bottom: 0.5rem;
}

.retry-button {
  background: #3b82f6;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: background-color 0.2s ease;
}

.retry-button:hover {
  background: #2563eb;
}

.status-content {
  text-align: center;
}

.status-badge {
  display: inline-block;
  padding: 0.75rem 1.5rem;
  border-radius: 25px;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 1rem;
}

.status-safe {
  background-color: #dcfce7;
  color: #166534;
  border: 2px solid #bbf7d0;
}

.status-moderate {
  background-color: #fef3c7;
  color: #92400e;
  border: 2px solid #fde68a;
}

.status-dangerous {
  background-color: #fee2e2;
  color: #991b1b;
  border: 2px solid #fecaca;
}

.status-unknown {
  background-color: #f3f4f6;
  color: #6b7280;
  border: 2px solid #d1d5db;
}

.status-reason {
  margin: 0;
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
}


/* Two-column layout (lg:grid-cols-2, gap-6; mobile: stacked) */
.dashboard-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
}

@media (min-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
  }
}


.dashboard-cards {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.features-section {
  padding: 4rem 0;
  background: #f8fafc;
}

.features-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.features-header {
  text-align: center;
  margin-bottom: 3rem;
}

.features-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.features-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  margin: 0;
}

.features-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.feature-card {
  background: white;
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}


.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.feature-description {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.articles-section {
  padding: 4rem 0;
  background: white;
}

.articles-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.25rem;
}

.articles-header {
  text-align: center;
  margin-bottom: 3rem;
}

.articles-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0 0 1rem 0;
}

.articles-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  margin: 0;
}

.footer {
  background: #1e293b;
  color: white;
  padding: 3rem 0 1rem;
  margin: 0;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
  margin-top: auto;
}

.footer small {
  display: block;
  text-align: center;
  color: #94a3b8;
  margin: 0.25rem 0;
}

.footer small:first-child {
  font-weight: 600;
  color: white;
}

/* Good mobile adaptation (<390px not crowded) */
@media (max-width: 1024px) {
  .dashboard-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .dashboard-cards {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .content-section,
  .features-section,
  .articles-section {
    padding: 3rem 0;
  }
  
  .content-container,
  .features-container,
  .articles-container {
    padding: 0 1rem;
  }
  
  .features-title,
  .articles-title {
    font-size: 2rem;
  }
  
  .features-subtitle,
  .articles-subtitle {
    font-size: 1.125rem;
  }
  
  .features-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card {
    padding: 1.5rem;
  }
  
}

@media (max-width: 390px) {
  .features-title,
  .articles-title {
    font-size: 1.75rem;
  }
  
  .feature-card {
    padding: 1.25rem;
  }
  
}


.overall-rating {
  background: #f9fafb;
  border-radius: 10px;
  padding: 0.8rem 1rem;
  margin-top: 1rem;
  border: 1px solid #e5e7eb;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.05);
}

.overall-title {
  font-size: 1rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.25rem;
}

.overall-message {
  font-size: 0.9rem;
  color: #475569;
  margin: 0;
  line-height: 1.5;
}

/* Base container remains same */
.overall-rating {
  border-radius: 10px;
  padding: 0.8rem 1rem;
  margin-top: 1rem;
  border: 2px solid transparent;
  transition: all 0.3s ease;
}

/* Green - Safe */
.overall-safe {
  background-color: #10e35a;
  border-color: #11de59;
  color: #166534;
}

/* Yellow - Moderate */
.overall-moderate {
  background-color: #f1d04a;
  border-color: #e5c236;
  color: #92400e;
}

/* Red - Dangerous */
.overall-dangerous {
  background-color: #edb3b3;
  border-color: #dc0a0a;
  color: #f11717;
}

/* Gray - Unknown */
.overall-unknown {
  background-color: #f3f4f6;
  border-color: #d1d5db;
  color: #6b7280;
}


</style>
