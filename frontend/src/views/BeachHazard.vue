<template>
  <div
    class="container-fluid py-4"
    style="background-image: url('/backgrounds/beach-bg.jpg'); background-size: cover; background-position: center; min-height: 100vh"
  >
    <div class="container">
      <h2 class="mb-4 text-white">🌊 {{ selectedBeach }}</h2>

      <!-- Beach Filter Dropdown -->
      <div class="row mb-4">
        <div class="col-md-6">
          <label for="beachSelect" class="form-label fw-bold text-white">Select a Beach</label>
          <select v-model="selectedBeach" class="form-select" id="beachSelect">
            <option v-for="beach in filteredBeaches" :key="beach">{{ beach }}</option>
          </select>
        </div>

        <!-- Safety Rating Filter -->
        <div class="col-md-6">
          <label for="ratingFilter" class="form-label fw-bold text-white">Filter by Safety Rating</label>
          <select v-model="ratingFilter" class="form-select" id="ratingFilter">
            <option value="">All</option>
            <option value="1">🛡️ Very Low (1)</option>
            <option value="2">✅ Low (2)</option>
            <!-- <option value="3">⚠️ Moderate (3)</option>
            <option value="4">High (4)</option>
            <option value="5">Very High (5)</option> -->
          </select>
        </div>
      </div>

      <!-- Map -->
      <div id="map" style="height: 400px" class="mb-4 rounded shadow"></div>

      <!-- Hazard Info Card -->
      <div class="card shadow-sm mb-4" :class="[hazardCardClass, 'text-white']">
        <div class="card-header fw-bold bg-dark text-white">Key Hazard Factors</div>
        <div class="card-body">
          <h5 class="mb-3">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Rating:
            <span class="badge" :class="badgeClass">
              {{ data.rating }}/5
            </span>
          </h5>
          <p><strong>Reason:</strong> {{ ratingReason }}</p>
          <hr />
          <div class="row">
            <div class="col-md-6 mb-2" v-for="(value, key) in displayableFields" :key="key">
              <i class="fas fa-info-circle me-2" v-tooltip="formatKey(key)"></i>
              <strong>{{ formatKey(key) }}:</strong> {{ value || 'N/A' }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

const hazardData = {
  'Dromana Beach': {
    lat: -38.334, lng: 144.967,
    wave_height: '0.5', rip_count: '0', beach_type: 'Reflective', current_strength: 'Low',
    shore_break: 'Weak', wave_type: 'Gentle', wind_direction: 'Northwest', wind_strength: 'Moderate', rating: 2
  },
  'Carrum Beach': {
    lat: -38.078, lng: 145.122,
    wave_height: '0.6', rip_count: '12', beach_type: 'LTT - TBR', current_strength: 'High',
    shore_break: 'Strong', wave_type: 'Moderate', wind_direction: 'West', wind_strength: 'Strong', rating: 3
  },
  'St Kilda Beach': {
    lat: -37.867, lng: 144.973,
    wave_height: '0.4', rip_count: '7', beach_type: 'LTT - TBR', current_strength: 'Moderate',
    shore_break: 'Moderate', wave_type: 'Choppy', wind_direction: 'Southwest', wind_strength: 'Moderate', rating: 3
  },
  'Port Melbourne Beach': {
    lat: -37.839, lng: 144.933,
    wave_height: '0.3', rip_count: '0', beach_type: 'LTT - TBR', current_strength: 'Low',
    shore_break: 'Weak', wave_type: 'Gentle', wind_direction: 'Southwest', wind_strength: 'Moderate', rating: 2
  },
  'Altona Beach': {
    lat: -37.867, lng: 144.829,
    wave_height: '0.1', rip_count: '0', beach_type: 'Reflective', current_strength: 'Low',
    shore_break: 'None', wave_type: 'Calm', wind_direction: 'Southwest', wind_strength: 'Mild', rating: 1
  }
}

const selectedBeach = ref('Dromana Beach')
const ratingFilter = ref('')
const map = ref(null)
const markers = ref({})

const filteredBeaches = computed(() => {
  if (!ratingFilter.value) return Object.keys(hazardData)
  return Object.keys(hazardData).filter(
    (beach) => hazardData[beach].rating.toString() === ratingFilter.value
  )
})

const data = computed(() => hazardData[selectedBeach.value])

const badgeClass = computed(() => {
  const r = data.value.rating
  if (r >= 4) return 'bg-danger'
  if (r >= 2) return 'bg-warning text-dark'
  return 'bg-success'
})

const hazardCardClass = computed(() => {
  const r = data.value.rating
  if (r >= 4) return 'bg-danger'
  if (r >= 2) return 'bg-warning text-dark'
  return 'bg-success'
})

const ratingReason = computed(() => {
  const { rating, rip_count, wave_height } = data.value
  if (rating >= 4) return `High risk due to ${rip_count} rips and strong wave conditions.`
  if (rating === 3) return `Moderate risk with ${rip_count} rips and mild waves.`
  if (rating === 2) return `Low risk — calm waves and no major hazards.`
  return `Very low risk — flat beach and no rips.`
})

const displayableFields = computed(() => {
  const exclude = ['rating', 'lat', 'lng']
  return Object.fromEntries(Object.entries(data.value).filter(([k]) => !exclude.includes(k)))
})

const formatKey = (k) => k.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

onMounted(() => {
  map.value = L.map('map').setView([-37.9, 145.0], 10)
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  }).addTo(map.value)

  for (const [beach, info] of Object.entries(hazardData)) {
    const marker = L.marker([info.lat, info.lng])
      .addTo(map.value)
      .bindPopup(`<strong>${beach}</strong><br/>Rating: ${info.rating}`)
    marker.on('click', () => {
      selectedBeach.value = beach
    })
    markers.value[beach] = marker
  }
})

watch(selectedBeach, (beach) => {
  const coords = hazardData[beach]
  if (coords) map.value.setView([coords.lat, coords.lng], 14)
})
</script>

<style scoped>
.card-body p {
  margin-bottom: 0.5rem;
}
#map {
  border: 2px solid #dee2e6;
}
</style>