<template>
  <div class="page-wrapper">
    <div class="page-background"></div>
    
    <div class="main-content-wrapper">
      <section class="safety-section">
        <div class="mb-4">
          <h2 class="mb-3 text-center">Today's Swimming Safety</h2>
          
          <!-- Beach Selector -->
          <div class="beach-selector">
            <h3 class="beach-selector-title">Select a Beach:</h3>
            
            <div class="beach-buttons">
              <button
                v-for="beach in beachOptions"
                :key="beach.name"
                :class="{ 'beach-button': true, 'beach-button-active': selectedBeach === beach.name }"
                @click="selectBeach(beach.name)"
              >
                {{ beach.name }}
              </button>
            </div>

            <div v-if="selectedBeach" class="selected-info">
              <div class="selected-beach">
                <strong>{{ selectedBeach }}</strong>
                <span class="last-updated">Last updated: {{ formattedDate }}</span>
              </div>
            </div>
          </div>
        </div>

    

    <!-- Water Status and Guide Button Row -->
    <div v-if="status" class="row justify-content-center mb-4">
      <div class="col-auto">
        <div
          class="card text-center shadow p-3"
          style="max-width: 500px;"
          :class="{
            'border-success': status === 'Safe',
            'border-warning': status === 'Moderate',
            'border-danger': status === 'Dangerous'
          }"
        >
          <div class="card-body">
            <h5 class="card-title">{{ formattedDate }}</h5>
        <p
          class="card-text fw-bold fs-4"
          :class="{
            'text-success': status === 'Safe',
            'text-warning': status === 'Moderate',
            'text-danger': status === 'Dangerous'
          }"
        >
          {{ status }}
        </p>
        <p class="card-text">{{ reason }}</p>
          </div>
        </div>
      </div>
      <div class="col-auto d-flex align-items-center">
        <button 
          @click="showGuide = !showGuide" 
          class="btn guide-button"
          :class="{ 'guide-button-active': showGuide }"
          :title="showGuide ? 'Close Guide' : 'Open Guide'"
        >
          <i class="fas fa-info-circle me-1"></i>
          Guide
        </button>
      </div>
    </div>

    <div v-if="!status" class="text-center mt-4 text-muted">
      No safety data available for the selected beach.
    </div>

    <div class="position-relative mb-4">
      <div id="map" style="height: 400px; width: 100%; border-radius: 10px;"></div>

      <div class="map-legend position-absolute top-0 end-0 p-2 bg-white rounded shadow-sm m-2">
        <strong class="d-block mb-1">Legend</strong>
        <div><span class="legend-dot bg-success"></span> Safe</div>
        <div><span class="legend-dot bg-warning"></span> Moderate</div>
        <div><span class="legend-dot bg-danger"></span> Dangerous</div>
      </div>
    </div>
      </section>  

      <!-- Prediction Section placed below safety content -->
      <section class="prediction-section mt-5">
        <h2 class="mb-4 text-center">7-Day Swimming Safety Prediction</h2>

        <div class="mb-3 text-center">
          <span class="badge bg-success me-2">Safe</span>
          <span class="badge bg-warning text-dark me-2">Moderate</span>
          <span class="badge bg-danger">Dangerous</span>
        </div>

        <div v-if="predictionsLoading" class="text-center text-muted mb-3">Loading…</div>
        <div v-else-if="predictionsError" class="text-center text-danger mb-3">{{ predictionsError }}</div>

        <div v-else class="row row-cols-1 row-cols-md-3 g-4">
          <div class="col" v-for="(prediction, index) in predictions" :key="index">
            <div
              class="card h-100 shadow text-center text-white"
              :class="{
                'bg-success': prediction.status === 'Safe',
                'bg-warning text-dark': prediction.status === 'Moderate',
                'bg-danger': prediction.status === 'Dangerous'
              }"
            >
              <div class="card-body">
                <h5 class="card-title">{{ formatDate(prediction.date) }}</h5>
                <p class="fw-bold fs-4">{{ prediction.status }}</p>
                <p>{{ prediction.reason }}</p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="!predictionsLoading && predictions.length === 0" class="text-center mt-4 text-muted">
          No predictions available. Please try another beach.
        </div>
      </section>
    </div>
    
    <footer class="footer">
      <small>© 2025 AquaProtect - TA22 Team </small>
      <small>Keeping families safe at Beaches</small>
    </footer>

    <!-- Guide Modal/Overlay -->
    <div v-if="showGuide" class="guide-overlay" @click="showGuide = false">
      <div class="guide-content" @click.stop>
        <div class="guide-header">
          <h4 class="mb-0">Swimming Safety Guide</h4>
          <button @click="showGuide = false" class="btn-close" aria-label="Close">
            <span class="close-icon">X</span>
          </button>
        </div>
        <div class="guide-body">
          <p class="mb-3">Planning a visit to the beach? This page provides a complete overview of the current swimming safety status of the beach to help you decide the right beach for you and your family!</p>
          
          <h5 class="mb-3">How does BeachProtect determine the safety of your beach?</h5>
          <p class="mb-3">Swimming safety is determined based on Enterococci bacteria levels in the water which is a key indicator of faecal contamination and general water quality.</p>
          
          <p class="mb-3">According to the U.S. Environmental Protection Agency (EPA, 2012) and NSW Government's Guidelines for Beach Water Quality (2020), Enterococci levels are classified as follows:</p>
          
          <div class="safety-levels mb-4">
            <div class="safety-level safe">
              <span class="level-icon">✅</span>
              <span class="level-text"><strong>0 to 35 organisms/100 mL:</strong> Safe for swimming</span>
            </div>
            <div class="safety-level moderate">
              <span class="level-icon">⚠️</span>
              <span class="level-text"><strong>36 to 104 organisms/100 mL:</strong> Moderately safe for swimming</span>
            </div>
            <div class="safety-level dangerous">
              <span class="level-icon">❌</span>
              <span class="level-text"><strong>105+ organisms/100 mL:</strong> Unsafe for swimming, avoid contact</span>
            </div>
          </div>
          
          <p class="mb-3">Use the interactive tools below to:</p>
          
          <ul class="guide-list">
            <li><strong>Check Today's Safety Status!</strong> Select your favourite beach from the interactive list to instantly see whether it's currently Safe, Moderate, or Dangerous to swim, along with a detailed reason and last updated time.</li>
            <li><strong>Explore our Interactive Safety Map!</strong> View real-time statuses of all listed beaches on a beautifully styled map. Coloured markers quickly indicate each beach's safety level: 🟢 Green: Safe, 🟠 Orange: Moderate, 🔴 Red: Dangerous.</li>
            <li><strong>7-Day Safety Forecast!</strong> Planning ahead? Our 7-day predictive tool uses advanced predictive modelling to show you the expected swimming conditions for the upcoming week. Each forecast card gives a clear status and reason so you can plan your beach trips safely and confidently.</li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const selectedBeach = ref("Carrum Beach");
const status = ref("");
const reason = ref("");
const date = ref("");
const showGuide = ref(false);

const map = ref<any>(null);
const markers = ref<any[]>([]);
const allBeachStatuses = ref<any[]>([]);

// Predictions state 
const predictions = ref<any[]>([]);
const predictionsLoading = ref(false);
const predictionsError = ref<string | null>(null);

const beachOptions = [
  { name: "Carrum Beach", lat: -38.0652, lng: 145.1214 },
  { name: "St Kilda Beach", lat: -37.8675, lng: 144.9731 },
  { name: "Dromana Beach", lat: -38.3337, lng: 144.9658 },
  { name: "Port Melbourne Beach", lat: -37.8399, lng: 144.939 },
  { name: "Altona Beach", lat: -37.8686, lng: 144.8297 },
];

const formattedDate = computed(() => {
  if (!date.value) return "";
  const options: Intl.DateTimeFormatOptions = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
  return new Date(date.value).toLocaleDateString(undefined, options);
});

const formatDate = (isoDate: string): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
  return new Date(isoDate).toLocaleDateString(undefined, options);
};

// Fetch all beaches and sync map + card
const fetchAllSafety = async () => {
  markers.value.forEach(m => m.remove());
  markers.value = [];
  allBeachStatuses.value = [];

  for (const beach of beachOptions) {
    try {
      const res = await axios.get(`/api/today-safety?beach=${encodeURIComponent(beach.name)}`);
      const s = res.data.status;
      const r = res.data.reason;
      const d = res.data.date;

      allBeachStatuses.value.push({ name: beach.name, status: s, reason: r, date: d });

      const color = s === "Safe" ? "green" : s === "Moderate" ? "orange" : "red";

      const marker = L.circleMarker([beach.lat, beach.lng], {
        radius: 10,
        fillColor: color,
        color: "#000",
        weight: 1,
        fillOpacity: 0.8,
      })
        .addTo(map.value)
        .bindPopup(`<b>${beach.name}</b><br>Status: ${s}`)
        .on("click", () => {
          selectedBeach.value = beach.name;
        });

      markers.value.push(marker);
    } catch {}
  }

};

// Fetch safety data for selected beach
const fetchSafetyData = async () => {
  if (!selectedBeach.value) return;
  
  try {
    const res = await axios.get(`/api/today-safety?beach=${encodeURIComponent(selectedBeach.value)}`);
    status.value = res.data.status;
    reason.value = res.data.reason;
    date.value = res.data.date;
  } catch (error) {
    console.error('Error fetching safety data:', error);
    status.value = '';
    reason.value = '';
    date.value = '';
  }
};

// Beach selection method
const selectBeach = (beachName: string) => {
  selectedBeach.value = beachName;
  fetchSafetyData();
};

const initMap = () => {
  map.value = L.map("map").setView([-37.9, 145.0], 9);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map.value);
};

const fetchPredictions = async () => {
  try {
    predictionsLoading.value = true;
    predictionsError.value = null;
    const response = await axios.get(`/api/predict?beach=${encodeURIComponent(selectedBeach.value)}`);
    predictions.value = response.data;
  } catch (e: any) {
    predictions.value = [];
    predictionsError.value = e?.message ?? 'Failed to load predictions';
  } finally {
    predictionsLoading.value = false;
  }
};

onMounted(() => {
  initMap();
  fetchAllSafety();
  fetchSafetyData();
  fetchPredictions();
});

watch(selectedBeach, () => {
  fetchSafetyData();
  fetchPredictions();
});
</script>

<style scoped>
.card-title {
  font-size: 1.2rem;
}
#map {
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  z-index: 1;
}
.map-legend {
  font-size: 0.9rem;
  z-index: 1000;
  width: 120px;
}
.legend-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  margin-right: 6px;
}

/* Page Background */
.page-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: url('@/assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  z-index: -2;
}

.page-background::before {
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
  z-index: -1;
  pointer-events: none;
}

/* Page Wrapper */
.page-wrapper {
  position: relative;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  width: 100%;
  box-sizing: border-box;
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
  box-shadow: 0 8px 32px rgba(220, 38, 38, 0.15);
  padding: 3rem 2rem;
  position: relative;
  z-index: 2;
  margin: 2rem auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(220, 38, 38, 0.1);
}

/* Safety Section */
.safety-section {
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

/* Beach Selector */
.beach-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
  margin-bottom: 2rem;
}

.beach-selector-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.beach-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.beach-button {
  padding: 0.75rem 1rem;
  font-size: 0.9rem;
  font-weight: 500;
  border: 2px solid #e5e7eb;
  background: white;
  color: #374151;
  transition: all 0.2s ease;
  border-radius: 8px;
  cursor: pointer;
}

.beach-button:hover {
  border-color: #3b82f6;
  background: #f8fafc;
  color: #1e40af;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15);
}

.beach-button-active {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.beach-button-active:hover {
  background: #2563eb;
  border-color: #2563eb;
  color: white;
}

.selected-info {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.selected-beach {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-beach strong {
  font-size: 1.1rem;
  color: #1f2937;
}

.last-updated {
  font-size: 0.85rem;
  color: #6b7280;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .beach-buttons {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .beach-button {
    padding: 0.6rem 0.8rem;
    font-size: 0.85rem;
  }
  
  .beach-selector {
    padding: 1rem;
  }
  
  .beach-selector-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .beach-buttons {
    grid-template-columns: 1fr;
  }
  
  .beach-button {
    padding: 0.5rem 0.6rem;
    font-size: 0.8rem;
  }
}

/* Prediction Section  */
.prediction-section h2 {
  background: linear-gradient(135deg, #1e40af, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.prediction-section .card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.prediction-section .card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(255, 255, 255, 1);
}

.prediction-section .card.bg-success {
  background: rgba(21, 128, 61, 0.8) !important;
  color: white !important;
  border-color: rgba(21, 128, 61, 0.7) !important;
}

.prediction-section .card.bg-warning {
  background: rgba(245, 158, 11, 0.9) !important;
  color: white !important;
  border-color: rgba(245, 158, 11, 0.8) !important;
}

.prediction-section .card.bg-danger {
  background: rgba(239, 68, 68, 0.9) !important;
  color: white !important;
  border-color: rgba(239, 68, 68, 0.8) !important;
}

/* Update title */
h2 {
  background: linear-gradient(135deg, #dc2626, #ef4444, #f87171);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
  font-weight: 800;
}

/* Update cards */
.card {
  background: linear-gradient(135deg, rgba(254, 242, 242, 0.8), rgba(255, 255, 255, 0.9));
  border: 1px solid rgba(220, 38, 38, 0.2);
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.1);
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(220, 38, 38, 0.2);
  border-color: rgba(220, 38, 38, 0.3);
}

/* Footer */
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

/* Guide Button Styles */
.guide-button {
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border: 2px solid #3b82f6;
  color: white;
  font-weight: 600;
  font-size: 0.9rem;
  padding: 8px 16px;
  border-radius: 6px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 8px rgba(59, 130, 246, 0.3);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.guide-button:hover {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-color: #2563eb;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.4);
  color: white;
}

.guide-button.guide-button-active {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  border-color: #ef4444;
  box-shadow: 0 2px 8px rgba(220, 38, 38, 0.3);
}

.guide-button.guide-button-active:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
  border-color: #dc2626;
  box-shadow: 0 4px 12px rgba(220, 38, 38, 0.4);
}

/* Guide Modal Styles */
.guide-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.7);
  z-index: 1050;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
}

.guide-content {
  background: linear-gradient(
    to bottom,
    rgba(240, 248, 255, 0.98) 0%,
    rgba(248, 250, 252, 0.99) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.2);
  border: 1px solid rgba(59, 130, 246, 0.1);
  max-width: 700px;
  width: 100%;
  max-height: 80vh;
  overflow-y: auto;
  animation: guideSlideIn 0.3s ease-out;
  backdrop-filter: blur(10px);
}

.guide-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px 25px 15px;
  border-bottom: 1px solid #e9ecef;
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 50%, #06b6d4 100%);
  color: white;
  border-radius: 16px 16px 0 0;
}

.guide-header h4 {
  font-weight: 600;
  margin: 0;
}

.guide-body {
  padding: 25px;
  color: #1e293b;
  line-height: 1.6;
}

.guide-body p {
  color: #475569;
  font-size: 1.05rem;
}

.guide-body h5 {
  color: #1e40af;
  font-weight: 700;
  font-size: 1.2rem;
}

.safety-levels {
  background: #f8fafc;
  border-radius: 12px;
  padding: 20px;
  border: 1px solid #e2e8f0;
}

.safety-level {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
}

.safety-level:last-child {
  margin-bottom: 0;
}

.level-icon {
  font-size: 1.2rem;
  margin-right: 12px;
  min-width: 24px;
}

.level-text {
  color: #374151;
  font-size: 1rem;
}

.guide-list {
  margin: 0;
  padding-left: 20px;
}

.guide-list li {
  margin-bottom: 16px;
  color: #475569;
  font-size: 1rem;
  position: relative;
}

.guide-list li::marker {
  color: #3b82f6;
  font-weight: bold;
}

.btn-close {
  background: rgba(255, 255, 255, 0.2);
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  font-size: 1.2rem;
  color: white;
  opacity: 0.9;
  cursor: pointer;
  padding: 0;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-weight: bold;
}

.btn-close:hover {
  opacity: 1;
  background: rgba(255, 255, 255, 0.3);
  border-color: rgba(255, 255, 255, 0.5);
  transform: scale(1.1);
}

.btn-close:active {
  transform: scale(0.95);
}

.close-icon {
  font-size: 1.5rem;
  font-weight: bold;
  line-height: 1;
  display: block;
}

@keyframes guideSlideIn {
  from {
    opacity: 0;
    transform: translateY(-50px) scale(0.9);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@media (max-width: 768px) {
  .guide-button {
    font-size: 0.8rem;
    padding: 6px 12px;
  }
  
  .guide-content {
    margin: 10px;
    max-height: 90vh;
  }
  
  .guide-header {
    padding: 15px 20px 10px;
  }
  
  .guide-body {
    padding: 20px;
  }
  
  .guide-body p {
    font-size: 1rem;
  }
  
  .guide-body h5 {
    font-size: 1.1rem;
  }
  
  .guide-list li {
    font-size: 0.95rem;
  }
  
  .btn-close {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .close-icon {
    font-size: 1.2rem;
  }
  
  .safety-levels {
    padding: 15px;
  }
  
  .level-text {
    font-size: 0.9rem;
  }
}
</style>
