<template>
  <div class="container-fluid py-4 beach-info-page">
    <div class="container">
      <h2 class="mb-4 text-white">{{ selectedBeach }}</h2>

      <!-- Beach selector (left) + facilities legend (center) + risk level (right) -->
      <div class="row mb-4 align-items-end gx-3">
        <div class="col-md-4">
          <label for="beachSelect" class="form-label fw-bold text-white">Select a Beach</label>
          <select v-model="selectedBeach" class="form-select" id="beachSelect">
            <option v-for="beach in Object.keys(beachData)" :key="beach">{{ beach }}</option>
          </select>
        </div>
        <div class="col-md-4 mt-3 mt-md-0 text-md-center">
          <div class="legend d-inline-block p-2 rounded shadow-sm bg-white text-start">
            <div class="fw-semibold small mb-1">Legend (for facilities below)</div>
            <div class="small"><span class="badge bg-success">Green</span> = Available</div>
            <div class="small"><span class="badge bg-danger">Red</span> = Not Available</div>
            <div class="small"><span class="badge bg-secondary">Number</span> = Count / Risk Rating</div>
          </div>
        </div>
        <div class="col-md-4 text-md-end mt-3 mt-md-0">
          <div class="fw-bold text-white mb-1">Risk level</div>
          <span class="badge risk-badge" :class="badgeClass">{{ currentBeachData.rating }}/10</span>
        </div>
      </div>

      <!-- Map  -->
      <div class="position-relative mb-4">
        <div id="map" style="height: 400px" class="rounded shadow"></div>
      </div>

      <!-- Key Hazard Factors Card -->
      <div class="card shadow-sm mb-4" :class="[hazardCardClass, 'text-white']">
        <div class="card-header fw-bold bg-dark text-white">Key Hazard Factors</div>
        <div class="card-body">
          <h5 class="mb-3">
            <i class="fas fa-exclamation-triangle me-2"></i>
            Overall Safety Hazard Rating:
            <span class="badge" :class="badgeClass">
              {{ currentBeachData.rating }}/10
            </span>
          </h5>
          <p><strong>Justification:</strong> {{ ratingReason }}</p>
          <p style="font-size: 0.875rem; color: #dcdcdc;">The Safety Hazard Rating is calculated based on marine hazards such as wave conditions, currents and beach features.</p>
          <p style="font-size: 0.875rem; color: #dcdcdc;">Higher-risk factors increase the score, while calm and safe conditions lower it.</p>
          <hr />
          <div class="row">
            <div class="col-md-6 mb-2" v-for="(value, key) in displayableHazardFields" :key="key">
              <i class="fas fa-info-circle me-2" v-tooltip="formatKey(key)"></i>
              <strong>{{ formatKey(key) }}:</strong> {{ value || 'N/A' }}
              <div class="small mt-1" style="color: #dcdcdc;">{{ explanations[key] || '' }}
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Beach Facilities -->
      <div class="card shadow-sm">
        <div class="card-header fw-bold bg-primary text-white">Beach Facilities</div>
        <div class="card-body">
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
                    {{ getFacilityValue(key) }}
                  </span>
                  <span v-else class="badge bg-white text-dark">
                    {{ getFacilityValue(key) }}
                  </span>
                </div>
              </div>
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

const getRiskStatus = (rating) => {
  if (rating >= 8) return 'Dangerous';
  if (rating >= 4) return 'Moderate';
  return 'Safe';
};

// Combined beach data
const beachData = {
  'Dromana Beach': {
    lat: -38.3318, lng: 145.0169,
    // Hazard data
    wave_height: '0.5', rip_current_count: '0', beach_type: 'Reflective', current_strength: 'Low',
    shore_break: 'Weak', wave_type: 'Gentle', dominant_swell_direction: 'Northwest', mean_wave_period: '5', 
    has_rocks: "No", has_reefs: "No" , has_structures: "Yes" , has_headlands: "No" ,	has_outfalls: "No" ,	has_sharks: "Yes" ,	has_bluebottles: "No" ,	
    has_stingers: "No", rating: 2,
    // Facility data
    shower: 'Yes', swimmingpool: 'No', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', 
    barbique: 'Yes', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes'
  },
  'Carrum Beach': {
    lat: -38.0836, lng: 145.1235,
    // Hazard data
    wave_height: '0.6', rip_current_count: '12', beach_type: 'LTT - TBR', current_strength: 'High',
    shore_break: 'Strong', wave_type: 'Moderate', dominant_swell_direction: 'West', mean_wave_period: '5', 
    has_rocks: "Yes", has_reefs: "Yes" , has_structures: "Yes" , has_headlands: "No" ,	has_outfalls: "No" ,	has_sharks: "Yes" ,	has_bluebottles: "No" ,	
    has_stingers: "No", rating: 3,
    // Facility data
    shower: 'Yes', swimmingpool: 'Yes', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', 
    barbique: 'Yes', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes'
  },
  'St Kilda Beach': {
    lat: -37.8675, lng: 144.9730,
    // Hazard data
    wave_height: '0.4', rip_current_count: '7', beach_type: 'LTT - TBR', current_strength: 'Moderate',
    shore_break: 'Moderate', wave_type: 'Choppy', dominant_swell_direction: 'Southwest', mean_wave_period: '5',  
    has_rocks: "No", has_reefs: "No" , has_structures: "Yes" , has_headlands: "No" ,	has_outfalls: "No" ,	has_sharks: "Yes" ,	has_bluebottles: "No" ,	
    has_stingers: "No", rating: 3,
    shower: 'No', swimmingpool: 'Yes', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', 
    barbique: 'No', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes'
  },
  'Port Melbourne Beach': {
    lat: -37.8361, lng: 144.9281,
    // Hazard data
    wave_height: '0.3', rip_current_count: '0', beach_type: 'LTT - TBR', current_strength: 'Low',
    shore_break: 'Weak', wave_type: 'Gentle', dominant_swell_direction: 'Southwest', mean_wave_period: '5',  
    has_rocks: "No", has_reefs: "No" , has_structures: "Yes" , has_headlands: "No" ,	has_outfalls: "No" ,	has_sharks: "Yes" ,	has_bluebottles: "No" ,	
    has_stingers: "No", rating: 2,
    // Facility data
    shower: 'No', swimmingpool: 'No', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', 
    barbique: 'No', picnic: 'No', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes'
  },
  'Altona Beach': {
    lat: -37.8678, lng: 144.8296,
    // Hazard data
     wave_height: '0.1', rip_current_count: '0', beach_type: 'Reflective', current_strength: 'Low',
    shore_break: 'None', wave_type: 'Calm', dominant_swell_direction: 'Southwest', mean_wave_period: '5',   
    has_rocks: "No", has_reefs: "No" , has_structures: "Yes" , has_headlands: "No" ,	has_outfalls: "No" ,	has_sharks: "Yes" ,	has_bluebottles: "No" ,	
    has_stingers: "No", rating: 1,
    // Facility data
    shower: 'No', swimmingpool: 'No', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes', 
    barbique: 'No', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'No', phonecharging: 'Yes'
  }
}

const facilityList = {
  shower: { label: 'Shower' },
  swimmingpool: { label: 'Swimming Pool' },
  tapwater: { label: 'Fresh Tap Water' },
  shop: { label: 'Shops' },
  toilet: { label: 'Toilet' },
  parking: { label: 'Car Park' },
  barbique: { label: 'Barbecue' },
  picnic: { label: 'Picnic' },
  shades: { label: 'Shades' },
  shelter: { label: 'Shelter' },
  playground: { label: 'Playground' },
  phonecharging: { label: 'Phone Charge' },
}

const selectedBeach = ref('Dromana Beach')
const map = ref(null)
const markers = ref({})

// Computed properties
const currentBeachData = computed(() => beachData[selectedBeach.value])

const badgeClass = computed(() => {
  const r = currentBeachData.value.rating
  if (r >= 8) return 'bg-danger'
  if (r >= 4) return 'bg-warning text-dark'
  return 'bg-success'
})

const hazardCardClass = computed(() => {
  const r = currentBeachData.value.rating
  if (r >= 8) return 'bg-danger'
  if (r >= 4) return 'bg-warning text-dark'
  return 'bg-success'
})

const ratingReason = computed(() => {
  const { rating, rip_current_count, wave_height } = currentBeachData.value
  if (rating >= 8) return `Very High Risk: Dangerous Waves or Rips.`
  if (rating >= 6) return `High Risk: Hazardous Wave or Rip Conditions.`
  if (rating >= 4) return `Moderate Risk: Some Safety Hazards Present.`
  if (rating >= 2) return `Low Risk: Generally Calm with Minor Hazards.`
  return `Very Low Risk: Flat Beach and No Rips.`
})

const explanations = {
  wave_height: "Estimated wave height in metres",
  rip_current_count: "Number of rip currents where more rips mean higher swimmer risk",
  beach_type: "Reflective = Steep & calm, LTT-TBR = Flat with rip-prone sandbars",
  current_strength: "Strength of water movement where stronger currents are riskier",
  shore_break: "Impact of waves at the shoreline where stronger shore breaks can be hazardous",
  wave_type: "Describes the nature of the waves, Gentle, Choppy, etc",
  dominant_swell_direction: "Main direction waves approach the beach which affects wave strength and safety",
  mean_wave_period: "Average time (in seconds) between wave crests where longer crests means more powerful waves",
  has_rocks: "Presence of rocks that may pose injury risks to swimmers", 
  has_reefs: "Presence of coral or rocky reefs causing potential sharp injuries and create strong currents" , 
  has_structures: "Presence of man-made structures like piers that can alter currents and trap swimmers near edges" , 
  has_headlands: "Presence of natural elevated land causing uneven wave patterns and currents",	
  has_outfalls: "Presence of stormwater or sewage outflow pipes that can pollute water quality at the beach" ,	
  has_sharks: "Presence of sharks" ,	
  has_bluebottles: "Presence of bluebottle jellyfish" ,	
  has_stingers: "presence of stinging marine life like jellyfish or sea lice",
}

const displayableHazardFields = computed(() => {
  const exclude = ['rating', 'lat', 'lng', 'shower', 'swimmingpool', 'tapwater', 'shop', 'toilet', 'parking', 'barbique', 'picnic', 'shades', 'shelter', 'playground', 'phonecharging']
  return Object.fromEntries(Object.entries(currentBeachData.value).filter(([k]) => !exclude.includes(k)))
})

// Helper methods
const formatKey = (k) => k.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())

const getFacilityValue = (key) => currentBeachData.value[key] || 'N/A'
const isAvailable = (key) => getFacilityValue(key) === 'Yes'
const isUnavailable = (key) => getFacilityValue(key) === 'No'
const isCountValue = (key) => {
  const val = getFacilityValue(key)
  return val !== 'Yes' && val !== 'No' && !isNaN(Number(val))
}

// Map initialization
onMounted(() => {
  map.value = L.map('map').setView([-37.9, 145.0], 10);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
  }).addTo(map.value);

  for (const [beachName, info] of Object.entries(beachData)) {
    const status = getRiskStatus(info.rating);
    const marker = createMarker(info, status, beachName); // 👈 pass beachName
    markers.value[beachName] = marker;
  }
});

// Watch for beach selection changes
watch(selectedBeach, (beach) => {
  const coords = beachData[beach]
  if (coords) map.value.setView([coords.lat, coords.lng], 14)
})

const createMarker = (beach, status, beachName) => {
  const color = status === "Safe" ? "green" : status === "Moderate" ? "orange" : "red";

  const marker = L.circleMarker([beach.lat, beach.lng], {
    radius: 10,
    fillColor: color,
    color: "#000",
    weight: 1,
    fillOpacity: 0.8,
  })
    .addTo(map.value)
    .bindPopup(`<b>${beachName}</b><br>Status: ${status}`);

   marker.on("click", () => {
    selectedBeach.value = beachName;
  });

  return marker;
};
</script>

<style scoped>
.beach-info-page {
  background-image: url('/backgrounds/beach-bg.jpg');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
}

.card img {
  max-height: 60px;
}

.legend {
  font-size: 0.85rem;
  min-width: 200px;
}

.risk-badge { /* enlarged risk display */
  font-size: 1.1rem;
  padding: 0.4rem 0.6rem;
}

#map {
  border: 2px solid #dee2e6;
}

.card-body p {
  margin-bottom: 0.5rem;
}

@media (max-width: 768px) {
  .risk-badge { font-size: 1rem; }
  .legend { display: inline-block; margin-top: 0.5rem; }
}
</style>
