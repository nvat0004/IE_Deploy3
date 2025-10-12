<template>
  <div class="container-fluid py-4 beach-info-page">
    <div class="container">
      <!-- Title row -->
      <div class="row align-items-center mb-4">
        <div class="col">
          <h2 class="mb-0 text-white">{{ selectedBeach }}</h2>
        </div>
      </div>

      <!-- Guide Modal/Overlay -->
      <div v-if="showGuide" class="guide-overlay" @click="showGuide = false">
        <div class="guide-content" @click.stop>
          <div class="guide-header">
            <h4 class="mb-0">Beach Information Guide</h4>
            <button @click="showGuide = false" class="btn-close" aria-label="Close">
              <span class="close-icon">X</span>
            </button>
          </div>
          <div class="guide-body">
            <p class="mb-3">Planning a visit to the beach? This page provides a complete overview of the safety conditions, natural features, and available facilities to help you decide the right beach for you and your family!</p>
            
            <p class="mb-3">Use the interactive tools below to:</p>
            
            <ul class="guide-list">
              <li>Select a beach from the Dropdown list to view live data for that location</li>
              <li>Check the beach's safety hazard rating, calculated from marine conditions like wave height, rip currents, and current strength</li>
              <li>Explore natural features such as beach type, wave conditions, presence of rocks, reefs, sharks, and more</li>
              <li>View a full list of available facilities like toilets, showers, barbecues, shelters, picnic areas, playgrounds, shops, and parking</li>
              <li>See all beaches on the map, color-coded by risk level (Green = Safe, Orange = Moderate, Red = Dangerous)</li>
              <li>Hover or click on any beach on the map to select it and view more details instantly</li>
            </ul>
          </div>
        </div>
      </div>

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

    <!-- Fixed Side Guide Button -->
    <button 
      @click="showGuide = !showGuide" 
      class="fixed-guide-button"
      :class="{ 'guide-button-active': showGuide }"
      :title="showGuide ? 'Close Guide' : 'Open Guide'"
    >
      <i class="fas fa-info-circle"></i>
      <span class="guide-text">Guide</span>
    </button>
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
const showGuide = ref(false)

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

/* Fixed Side Guide Button Styles */
.fixed-guide-button {
  position: fixed;
  top: 50%;
  right: 20px;
  transform: translateY(-50%);
  background: linear-gradient(135deg, #1e40af 0%, #3b82f6 100%);
  border: 2px solid #3b82f6;
  color: white;
  font-weight: 600;
  font-size: 1rem;
  padding: 16px 12px;
  border-radius: 12px 0 0 12px;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.4);
  z-index: 1000;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  min-width: 60px;
  cursor: pointer;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.fixed-guide-button:hover {
  background: linear-gradient(135deg, #1e3a8a 0%, #2563eb 100%);
  border-color: #2563eb;
  transform: translateY(-50%) translateX(-5px);
  box-shadow: 0 6px 20px rgba(59, 130, 246, 0.5);
  color: white;
}

.fixed-guide-button.guide-button-active {
  background: linear-gradient(135deg, #dc2626 0%, #ef4444 100%);
  border-color: #ef4444;
  box-shadow: 0 4px 16px rgba(220, 38, 38, 0.4);
}

.fixed-guide-button.guide-button-active:hover {
  background: linear-gradient(135deg, #b91c1c 0%, #dc2626 100%);
  border-color: #dc2626;
  box-shadow: 0 6px 20px rgba(220, 38, 38, 0.5);
}

.guide-text {
  font-size: 0.8rem;
  font-weight: 700;
  writing-mode: vertical-rl;
  text-orientation: mixed;
}

.fixed-guide-button i {
  font-size: 1.2rem;
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
  max-width: 600px;
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
  border-radius: 12px 12px 0 0;
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

.guide-list {
  margin: 0;
  padding-left: 20px;
}

.guide-list li {
  margin-bottom: 12px;
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
  .risk-badge { font-size: 1rem; }
  .legend { display: inline-block; margin-top: 0.5rem; }
  
  .fixed-guide-button {
    right: 10px;
    padding: 12px 8px;
    min-width: 50px;
    font-size: 0.9rem;
  }
  
  .guide-text {
    font-size: 0.7rem;
  }
  
  .fixed-guide-button i {
    font-size: 1rem;
  }
  
  .guide-content {
    margin: 10px;
    max-height: 90vh;
  }
  
  .guide-header {
    padding: 15px 20px 10px;
  }
  
  .btn-close {
    width: 32px;
    height: 32px;
    font-size: 1rem;
  }
  
  .close-icon {
    font-size: 1.2rem;
  }
  
  .guide-body {
    padding: 20px;
  }
  
  .guide-body p {
    font-size: 1rem;
  }
  
  .guide-list li {
    font-size: 0.95rem;
  }
}
</style>
