<template>
  <div class="container my-4 beach-facilities-page">
    <div class="d-flex justify-content-between align-items-center mb-3">
      <h2 class="fw-bold">Beach Facilities</h2>
      <div class="text-end">
        <div class="legend border p-2 rounded shadow-sm bg-white">
          <strong>Legend:</strong>
          <div><span class="badge bg-success">Green</span> = Available</div>
          <div><span class="badge bg-danger">Red</span> = Not Available</div>
          <div><span class="badge bg-secondary">Number</span> = Count / Risk Rating</div>
        </div>
      </div>
    </div>

    <div class="mb-4">
      <label for="beach-select" class="form-label fw-semibold">Select Beach:</label>
      <select v-model="selectedBeach" class="form-select" id="beach-select">
        <option v-for="beach in Object.keys(facilitiesData)" :key="beach" :value="beach">
          {{ beach }}
        </option>
      </select>
    </div>

    <!-- 🌍 Leaflet Map -->
    <div id="map" class="mb-4 shadow-sm rounded"></div>

    <div class="row g-4">
      <div v-for="(facility, key) in facilityList" :key="key" class="col-6 col-md-4 col-lg-3">
        <div
          class="card text-center shadow-sm"
          :class="{
            'bg-success text-white': isAvailable(key),
            'bg-danger text-white': isUnavailable(key),
            'bg-light': isCountValue(key),
          }"
        >
          <div class="card-body">
            <img
              :src="`/icons/${key}.png`"
              :alt="facility.label"
              class="img-fluid mb-2"
              style="height: 60px"
            />
            <h6 class="card-title">{{ facility.label }}</h6>
            <span v-if="isCountValue(key)" class="badge bg-secondary fs-6">
              {{ getValue(key) }}
            </span>
            <span v-else class="badge bg-white text-dark">
              {{ getValue(key) }}
            </span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 🌊 Facilities dataset
const selectedBeach = ref('Dromana Beach')

const facilitiesData = {
  'Dromana Beach': { shower: 'Yes', swimmingpool: 'No', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', barbique: 'Yes', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes' },
  'Carrum Beach': { shower: 'Yes', swimmingpool: 'Yes', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', barbique: 'Yes', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes' },
  'St Kilda Beach': { shower: 'No', swimmingpool: 'Yes', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', barbique: 'No', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes' },
  'Port Melbourne Beach': { shower: 'No', swimmingpool: 'No', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', barbique: 'No', picnic: 'No', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes' },
  'Altona Beach': { shower: 'No', swimmingpool: 'No', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', barbique: 'No', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'No', phonecharging: 'Yes' },
}

const facilityList = {
  shower: { label: 'Shower' },
  swimmingpool: { label: 'Swimming Pool' },
  tapwater: { label: 'Fresh Tap Water' },
  shop: { label: 'Shops' },
  toilet: { label: 'Toilet' },
  parking: { label: 'Car Park' },
  barbique: { label: 'Barbique' },
  picnic: { label: 'Picnic' },
  shades: { label: 'Shades' },
  shelter: { label: 'Shelter' },
  playground: { label: 'Playground' },
  phonecharging: { label: 'Phone Charge' },
}

// 🔍 Helper methods
const getValue = (key) => facilitiesData[selectedBeach.value]?.[key] || 'N/A'
const isAvailable = (key) => getValue(key) === 'Yes'
const isUnavailable = (key) => getValue(key) === 'No'
const isCountValue = (key) => {
  const val = getValue(key)
  return val !== 'Yes' && val !== 'No' && !isNaN(Number(val))
}

// 🗺️ Map logic
const beachLocations = {
  'Dromana Beach': [-38.3318, 145.0169],
  'Carrum Beach': [-38.0836, 145.1235],
  'St Kilda Beach': [-37.8675, 144.9730],
  'Port Melbourne Beach': [-37.8361, 144.9281],
  'Altona Beach': [-37.8678, 144.8296],
}

let map = null
let markers = {}

onMounted(() => {
  map = L.map('map').setView(beachLocations[selectedBeach.value], 12)

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; OpenStreetMap, CartoDB',
  }).addTo(map)

  // Add markers
  Object.entries(beachLocations).forEach(([name, coords]) => {
    const marker = L.marker(coords).addTo(map).bindPopup(name)
    marker.on('click', () => {
      selectedBeach.value = name
    })
    markers[name] = marker
  })
})

// Update map view when dropdown changes
watch(selectedBeach, (newBeach) => {
  const coords = beachLocations[newBeach]
  if (coords && map) {
    map.setView(coords, 13)
    markers[newBeach]?.openPopup()
  }
})
</script>

<style scoped>
.card img {
  max-height: 60px;
}

.legend {
  font-size: 0.85rem;
  min-width: 200px;
}

#map {
  height: 350px;
  width: 100%;
  border: 2px solid #ccc;
  border-radius: 12px;
}

/* Vibrant beach-themed background */
.beach-facilities-page {
  background-image: url('/backgrounds/beach-bg.jpg');
  background-size: cover;
  background-position: center;
  padding: 2rem;
  border-radius: 20px;
}
</style>
