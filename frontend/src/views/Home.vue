<template>
  <div class="home">
    <HeroVideo :dashboardRef="dashboardRef" :featuresRef="featuresRef" />

    <div class="main-content-wrapper">
      <section ref="dashboardRef" class="dashboard-section">
        <div class="dashboard-header">
          <h2 class="dashboard-title">Beach Conditions Dashboard</h2>
        </div>
        <div class="grid panels">

        <div class="panel">
          <Card class="panel-card">
            <template #header>
              <div class="panel-head"><h5>UV Index</h5></div>
            </template>
            <template #content>
              <p class="panel-sub">UV index and sun safety information</p>
              <div class="panel-body">
                <div v-if="isLoadingUv" class="loading">
                  <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" animationDuration="1s" />
                  <p class="muted">Loading...</p>
                </div>
                <Message v-else-if="uvError" severity="error" :closable="false" class="w-100">{{ uvError }}</Message>
                <div v-else class="kpi"><span>{{ uvIndex ?? '-' }}</span></div>
              </div>
            </template>
          </Card>
        </div>

        <div class="panel">
          <Card class="panel-card">
            <template #header>
              <div class="panel-head"><h5>Weather Conditions</h5></div>
            </template>
            <template #content>
              <p class="panel-sub">Current weather data</p>
              <div class="panel-body">
                <div v-if="isLoadingWeather" class="loading">
                  <ProgressSpinner style="width: 2rem; height: 2rem" strokeWidth="4" animationDuration="1s" />
                  <p class="muted">Loading...</p>
                </div>
                <Message v-else-if="weatherError" severity="error" :closable="false" class="w-100">{{ weatherError }}</Message>
                <div v-else class="weather">
                  <p><strong>{{ weather?.temp }}°C</strong></p>
                  <p>{{ weather?.description }}</p>
                  <p>Humidity: {{ weather?.humidity }}%</p>
                  <p>Wind: {{ weather?.windSpeed }} m/s</p>
                </div>
              </div>
            </template>
          </Card>
        </div>

        <router-link to="/safety" class="panel">
          <Card class="panel-card">
            <template #header>
              <div class="panel-head"><h5>Swimming Safety</h5></div>
            </template>
            <template #content>
              <p class="panel-sub">Today's safety status</p>
              <div class="panel-body">
                <p class="muted">Click to view full details</p>
              </div>
            </template>
          </Card>
        </router-link>
        </div>
      </section>


      <section ref="featuresRef" class="features-section">
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
      </section>

      <section class="audiences-section">
        <div class="audiences-header">
          <h2 class="audiences-title">Who We Help</h2>
          <p class="audiences-subtitle">Supporting different groups with beach safety information</p>
        </div>
        
        <div class="audiences-grid">
          <div v-for="(group, index) in audiences" :key="index" class="audience-card">
            <h3 class="audience-title">{{ group.title }}</h3>
            <p class="audience-description">{{ group.description }}</p>
          </div>
        </div>
      </section>

      <section class="articles-section">
        <div class="articles-header">
          <h2 class="articles-title">Latest News</h2>
          <p class="articles-subtitle">Stay updated with beach safety news and alerts</p>
        </div>
        <ArticleSlider :articles="articleLinks" />
      </section>
    </div>

    <footer class="footer">
      <small>© 2025 AquaProtect - TA22 Team </small>
      <small>Keeping families safe at Beaches</small>
    </footer>
  </div>

  <Button 
    class="back-to-top-button"
    icon="pi pi-arrow-up" 
    severity="secondary"
    outlined
    rounded
    size="large"
    @click="scrollToTop"
    aria-label="Scroll to top of page"
    v-show="showBackToTop"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue';
import ArticleSlider from '@/components/ArticleSlider.vue';
import HeroVideo from '@/components/HeroVideo.vue';

// ✅ ensure API key always resolves
const OPEN_WEATHER_API_KEY = import.meta.env.VITE_OPEN_WEATHER_API_KEY || 'a7f7e34d892b94d341f19b3252f8c992';

const dashboardRef = ref<HTMLElement | null>(null);
const featuresRef = ref<HTMLElement | null>(null);

const beaches = [
  { name: 'Carrum Beach', lat: -38.0652, lon: 145.1214 },
  { name: 'St Kilda Beach', lat: -37.8679, lon: 144.9740 },
  { name: 'Dromana Beach', lat: -38.3319, lon: 144.9649 },
  { name: 'Port Melbourne Beach', lat: -37.8470, lon: 144.9455 },
  { name: 'Altona Beach', lat: -37.8710, lon: 144.8300 },
];

const selectedWeatherBeach = ref(beaches[0]);
const selectedUvBeach = ref(beaches[0]);

const weather = ref<any>(null);
const uvIndex = ref<number | null>(null);
const isLoadingWeather = ref(true);
const isLoadingUv = ref(true);
const weatherError = ref<string | null>(null);
const uvError = ref<string | null>(null);

const fetchWeather = async () => {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${selectedWeatherBeach.value.lat}&lon=${selectedWeatherBeach.value.lon}&units=metric&appid=${OPEN_WEATHER_API_KEY}`);
    if (!res.ok) throw new Error(`Weather ${res.status}`);
    const data = await res.json();
    weather.value = {
      temp: data.main?.temp,
      description: data.weather?.[0]?.description ?? '',
      humidity: data.main?.humidity,
      windSpeed: data.wind?.speed
    };
  } catch (err: any) {
    weatherError.value = err?.message ?? 'Failed to fetch weather';
  } finally {
    isLoadingWeather.value = false;
  }
};

const fetchUv = async () => {
  try {
    const res = await fetch(`https://api.openweathermap.org/data/2.5/uvi?lat=${selectedUvBeach.value.lat}&lon=${selectedUvBeach.value.lon}&appid=${OPEN_WEATHER_API_KEY}`);
    if (!res.ok) throw new Error(`UV ${res.status}`);
    const data = await res.json();
    uvIndex.value = typeof data.value === 'number' ? data.value : null;
  } catch (err: any) {
    uvError.value = err?.message ?? 'Failed to fetch UV index';
  } finally {
    isLoadingUv.value = false;
  }
};

const articleLinks = [
  { title: 'Poor water quality forecast for all beaches in Victoria’s Port Phillip Bay, EPA warns', url: 'https://www.abc.net.au/news/2017-01-20/poor-water-quality-forecast-at-all-beaches-in-port-phillip-bay/8197404' },
  { title: 'Filthy reason some Melbourne beaches are closed to swimmers', url: 'https://www.heraldsun.com.au/news/victoria/melbourne-beaches-not-suitable-for-swimming-after-severe-storms/news-story/6d37ab96514f5fb1fd585be957831f3d' },
  { title: 'Water Quality in Port Phillip Bay still recovering after Victoria’s record floods', url: 'https://www.abc.net.au/news/2023-01-05/victoria-beach-bay-water-quality-epa-melbourne-floods/101826148' },
  { title: 'Health risks at bay and ocean beaches', url: 'https://www.mpnews.com.au/2022/10/31/health-risks-at-bay-and-ocean-beaches/' },
  { title: 'Melbourne’s Port Phillip Bay not suitable for swimming after severe storms', url: 'https://www.abc.net.au/news/2023-12-29/melbourne-bays-poor-water-quality-explainer/103269472' },
  { title: 'The bay has turned brown and swimmers are emerged coated in a strange goo', url: 'https://www.theage.com.au/politics/victoria/the-bay-has-turned-brown-and-swimmers-are-emerging-coated-in-a-strange-goo-20240118-p5ey9u.html' },
  { title: 'Why you should check the water quality before going for a swim in Victoria', url: 'https://www.racv.com.au/royalauto/travel/victoria/swimming-water-quality-victoria.html' }
];

const features = [
  { icon: '📊', title: 'Real-Time Water Quality', description: 'Instant updates on different Beaches water quality after rainfall' },
  { icon: '⏰', title: 'Advance Planning', description: 'Forecasts that help plan your beach visits safely' },
  { icon: '🛡️', title: 'Safety Alerts', description: 'Get notified when water becomes unsafe for swimming' },
  { icon: '📚', title: 'Educational Resources', description: 'Understand water safety, indicators, and tips' },
  { icon: '☔️', title: 'Rainfall Impact Analysis', description: 'Know how rain affects beach water quality' }
];

const audiences = [
  { icon: '👨‍👩‍👧', title: 'Parents & Families', description: 'Parents aged 30–50 who prioritize children’s safety and informed beach decisions' },
  { icon: '🌺', title: 'Beach Visitors', description: 'Tourists from Victoria suburbs visiting Dromana Beach after rain' },
  { icon: '🌊', title: 'Water Safety Advocates', description: 'Health-conscious families promoting child-focused beach safety' }
];

const showBackToTop = ref(false);

const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

const handleScroll = () => {
  showBackToTop.value = window.scrollY > 300;
};

onMounted(() => {
  fetchWeather();
  fetchUv();
  window.addEventListener('scroll', handleScroll);
});

// Cleanup on unmount
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll);
});

watch(selectedWeatherBeach, fetchWeather);
watch(selectedUvBeach, fetchUv);
</script>

<style scoped>
* {
  box-sizing: border-box;
}

.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background-image: url('@/assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  position: relative;
  margin: 0;
  padding: 0;
  width: 100%;
  box-sizing: border-box;
}

.home::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(
    to right,
    rgba(0, 0, 0, 0.4) 0%,
    rgba(0, 0, 0, 0.2) 15%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.05) 40%,
    rgba(0, 0, 0, 0.05) 60%,
    rgba(0, 0, 0, 0.1) 70%,
    rgba(0, 0, 0, 0.2) 85%,
    rgba(0, 0, 0, 0.4) 100%
  );
  z-index: 1;
  pointer-events: none;
}



/* Main Content Wrapper */
.main-content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  background: linear-gradient(
    to bottom,
    rgba(240, 248, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.98) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  padding: 3rem 2rem;
  position: relative;
  z-index: 2;
  margin-top: 2rem;
  transition: all 0.6s ease-in-out;
  opacity: 0;
  transform: translateY(30px);
  animation: slideInUp 0.8s ease-out 0.3s forwards;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

.main-content-wrapper::before {
  content: '';
  position: absolute;
  top: -20px;
  left: 0;
  right: 0;
  height: 20px;
  background: linear-gradient(
    to bottom,
    rgba(240, 248, 255, 0) 0%,
    rgba(240, 248, 255, 0.8) 100%
  );
  border-radius: 16px 16px 0 0;
  z-index: -1;
}

@keyframes slideInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

/* Dashboard Section */
.dashboard-section {
  padding: 0 0 2rem 0;
  background: transparent;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

.dashboard-header {
  text-align: center;
  margin-bottom: 3rem;
}

.dashboard-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #1e40af, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}





.grid { 
  display: grid; 
  gap: 2rem; 
}

.grid.panels { 
  grid-template-columns: repeat(4, 1fr); 
}

.grid.four { 
  grid-template-columns: repeat(4, 1fr); 
}

.grid.five { 
  grid-template-columns: repeat(5, 1fr); 
}

.grid.three { 
  grid-template-columns: repeat(3, 1fr); 
}

.grid.one { 
  grid-template-columns: 1fr; 
}

.panel-card {
  background: linear-gradient(135deg, rgba(240, 248, 255, 0.9), rgba(255, 255, 255, 0.95));
  border-radius: 12px;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-card.fancy-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  padding: 0;
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.panel-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.2);
  border-color: rgba(59, 130, 246, 0.3);
}

.panel-card.fancy-card.hoverable:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.tall-box {
  min-height: 220px;
}

.panel-head {
  padding: 1.5rem 1.5rem 1rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
}

.panel-head h5 {
  font-size: 1.125rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
  text-align: center;
}

.panel-sub {
  color: #64748b;
  font-size: 0.875rem;
  margin: 0.5rem 0;
  text-align: center;
}

.panel a {
  color: inherit;
  text-decoration: none;
  display: block;
  height: 100%;
}

.panel a:hover {
  text-decoration: none;
  color: inherit;
}

.panel a .panel-card {
  height: 100%;
}

.panel a .panel-sub {
  color: #64748b;
  text-decoration: none;
  margin: 0.5rem 0;
}

.panel a .muted {
  color: #64748b;
  text-decoration: none;
  font-size: 0.875rem;
  margin: 0.25rem 0;
}

.panel-body {
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  text-align: center;
}

.kpi {
  text-align: center;
  padding: 1rem 0;
}

.kpi span {
  font-size: 3rem;
  font-weight: 700;
  color: #2563eb;
  display: block;
  line-height: 1;
  margin-bottom: 0.5rem;
}

.weather {
  text-align: center;
  padding: 1rem 0;
}

.weather p {
  margin: 0.5rem 0;
  text-align: center;
}

.weather strong {
  color: #2563eb;
  font-size: 2.5rem;
  font-weight: 700;
  display: block;
  line-height: 1;
  margin: 0.5rem 0;
}

.weather .fw-bold {
  color: #1e293b;
  font-size: 1rem;
  font-weight: 600;
  margin: 0.75rem 0;
}

.weather .d-flex {
  margin: 1rem 0;
  gap: 2rem;
}

.weather .d-flex p {
  margin: 0;
  font-size: 0.875rem;
  color: #64748b;
}

.tile {
  padding: 2rem;
  text-align: center;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.tile h5 {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
  line-height: 1.3;
}

.tile p {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  font-size: 0.875rem;
  flex-grow: 1;
}

/* Features Section */
.features-section {
  padding: 2rem 0;
  background: transparent;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

.features-header {
  text-align: center;
  margin-bottom: 3rem;
}

.features-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #0891b2, #06b6d4, #67e8f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
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
  background: linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(255, 255, 255, 0.9));
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(8, 145, 178, 0.1);
  border: 1px solid rgba(8, 145, 178, 0.2);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(8, 145, 178, 0.2);
  border-color: rgba(8, 145, 178, 0.3);
}

.feature-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
  text-align: center;
}

.feature-description {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

/* Audiences Section */
.audiences-section {
  padding: 2rem 0;
  background: transparent;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

.audiences-header {
  text-align: center;
  margin-bottom: 3rem;
}

.audiences-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #dc2626, #ef4444, #f87171);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.audiences-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  margin: 0;
}

.audiences-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.audience-card {
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.8), rgba(255, 255, 255, 0.9));
  padding: 2rem;
  border-radius: 16px;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.1);
  border: 1px solid rgba(220, 38, 38, 0.2);
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.audience-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.3);
}

.audience-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0 0 1rem 0;
  text-align: center;
}

.audience-description {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
  text-align: center;
}

/* Articles Section */
.articles-section {
  padding: 2rem 0 0 0;
  background: transparent;
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

.articles-header {
  text-align: center;
  margin-bottom: 3rem;
}

.articles-title {
  font-size: 2.5rem;
  font-weight: 800;
  color: #0f172a;
  margin: 0 0 1rem 0;
  background: linear-gradient(135deg, #ea580c, #f97316, #fb923c);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.articles-subtitle {
  font-size: 1.25rem;
  color: #64748b;
  margin: 0;
}


.loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 2rem;
}

.muted {
  color: #64748b;
  font-size: 0.875rem;
  text-align: center;
}

.small {
  font-size: 0.75rem;
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

/* Back to top button */
.back-to-top-button {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 1000;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.back-to-top-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
}

/* Responsive */
@media (max-width: 1200px) {
  .grid.panels,
  .grid.four { 
    grid-template-columns: repeat(3, 1fr); 
  }
}

@media (max-width: 1024px) {
  .grid.panels,
  .grid.four { 
    grid-template-columns: repeat(2, 1fr); 
  }
  .grid.five { 
    grid-template-columns: repeat(3, 1fr); 
  }
  .grid.three { 
    grid-template-columns: repeat(2, 1fr); 
  }
}

@media (max-width: 768px) {
  
  
  .grid.panels,
  .grid.four,
  .grid.five,
  .grid.three { 
    grid-template-columns: 1fr; 
  }
  
  .panel-card.fancy-card {
    margin-bottom: 1rem;
  }
  
  .weather .d-flex {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  /* Features, Audiences, Articles responsive */
  .features-section,
  .audiences-section,
  .articles-section {
    padding: 3rem 0;
  }
  
  .features-container,
  .audiences-container,
  .articles-container {
    padding: 2rem 1.5rem;
  }
  
  /* Main content wrapper responsive */
  .main-content-wrapper {
    padding: 2rem 1.5rem;
  }
  
  /* Dashboard responsive */
  .dashboard-section {
    padding: 1.5rem 0;
  }
  
  .features-title,
  .audiences-title,
  .articles-title,
  .dashboard-title {
    font-size: 2rem;
  }
  
  .features-subtitle,
  .audiences-subtitle,
  .articles-subtitle {
    font-size: 1.125rem;
  }
  
  .features-grid,
  .audiences-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .feature-card,
  .audience-card {
    padding: 1.5rem;
  }
  
  .back-to-top-button {
    bottom: 1rem;
    right: 1rem;
  }
}

@media (max-width: 390px) {
  
  .main-content-wrapper {
    padding: 1.5rem 1rem;
  }
  
  .features-title,
  .audiences-title,
  .articles-title,
  .dashboard-title {
    font-size: 1.75rem;
  }
  
  .feature-card,
  .audience-card {
    padding: 1.25rem;
  }
  
  .back-to-top-button {
    bottom: 0.75rem;
    right: 0.75rem;
    width: 2.5rem;
    height: 2.5rem;
  }
}
</style>
