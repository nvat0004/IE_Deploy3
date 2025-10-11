<template>
  <div class="mini-map">
    <div class="mini-map-header">
      <h3 class="mini-map-title">Beach Location</h3>
      <div v-if="name" class="mini-map-beach-name">
        <span>{{ name }}</span>
      </div>
    </div>

    <div class="mini-map-container">
      <div v-if="loading" class="mini-map-loading">
        <span>Loading map...</span>
      </div>

      <div v-else-if="error" class="mini-map-error">
        <span>{{ error }}</span>
        <Button
          label="Retry"
          size="small"
          outlined
          @click="initMap"
        />
      </div>

      <div v-else class="mini-map-view">
        <div 
          ref="mapContainer" 
          id="mini-map" 
          class="map-container"
        ></div>
        <div v-if="!lat || !lon" class="mini-map-empty-state">
          <span>Select a beach to view location</span>
        </div>
      </div>

      <div v-if="!loading && !error" class="mini-map-legend">
        <div class="legend-item">
          <div class="legend-color" style="background: #ef4444;"></div>
          <span>Selected Beach</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #10b981;"></div>
          <span>Other Beaches</span>
        </div>
        <div class="legend-item">
          <div class="legend-color" style="background: #3b82f6; opacity: 0.3;"></div>
          <span>Beach Area</span>
        </div>
      </div>

      <div v-if="lat && lon && !loading && !error" class="mini-map-actions">
        <Button
          :label="`Open in Google Maps`"
          size="small"
          outlined
          @click="openInGoogleMaps"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted, watch } from 'vue'
import Button from 'primevue/button'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Props {
  lat?: number | null
  lon?: number | null
  name?: string
  zoom?: number
}

const props = withDefaults(defineProps<Props>(), {
  zoom: 13
})

const mapContainer = ref<HTMLElement | null>(null)
const map = ref<L.Map | null>(null)
const marker = ref<L.CircleMarker | null>(null)
const beachCircles = ref<L.Circle[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Beach data with different radius for each beach
const beachData = [
  { id: 'dromana', name: 'Dromana Beach', lat: -38.3333, lon: 144.9667, radius: 500 },
  { id: 'carrum', name: 'Carrum Beach', lat: -38.0786, lon: 145.1214, radius: 400 },
  { id: 'stkilda', name: 'St Kilda Beach', lat: -37.8675, lon: 144.9731, radius: 600 },
  { id: 'portmelbourne', name: 'Port Melbourne Beach', lat: -37.8399, lon: 144.939, radius: 450 },
  { id: 'altona', name: 'Altona Beach', lat: -37.8686, lon: 144.8297, radius: 550 }
]

// Fix for default markers in Leaflet
const fixLeafletIcons = () => {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

const initMap = () => {
  try {
    loading.value = true
    error.value = null
    
    // Fix Leaflet icons
    fixLeafletIcons()
    
    // Simple map initialization like SwimmingSafety.vue
    map.value = L.map('mini-map').setView([-37.9, 145.0], 9)
    
    // Add tile layer
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map.value as L.Map)
    
    console.log('Map initialized successfully')
    
    // Add all beach markers and circles
    addAllBeachMarkers()
    
    // If we have coordinates, add specific marker
    if (props.lat && props.lon) {
      addMarker()
    }
    
  } catch (err) {
    error.value = 'Failed to load map'
    console.error('Map initialization error:', err)
  } finally {
    loading.value = false
  }
}

const addAllBeachMarkers = () => {
  if (!map.value) return
  
  try {
    // Clear existing circles
    beachCircles.value.forEach(circle => {
      map.value?.removeLayer(circle)
    })
    beachCircles.value = []
    
    // Add markers and circles for all beaches
    beachData.forEach(beach => {
      // Add beach marker
      const beachMarker = L.circleMarker([beach.lat, beach.lon], {
        radius: 8,
        fillColor: '#10b981',
        color: '#059669',
        weight: 2,
        fillOpacity: 0.9
      })
        .addTo(map.value as L.Map)
        .bindPopup(beach.name)
      
      // Add beach area circle
      const beachCircle = L.circle([beach.lat, beach.lon], {
        radius: beach.radius,
        color: '#3b82f6',
        weight: 2,
        fillColor: '#3b82f6',
        fillOpacity: 0.1
      })
        .addTo(map.value as L.Map)
        .bindPopup(`${beach.name} - Beach Area`)
      
      beachCircles.value.push(beachCircle)
    })
    
  } catch (err) {
    console.error('Error adding beach markers:', err)
  }
}

const addMarker = () => {
  if (!map.value || !props.lat || !props.lon) return
  
  try {
    // Remove existing marker
    if (marker.value) {
      map.value.removeLayer(marker.value as unknown as L.Layer)
    }
    
    // Add new marker using circleMarker like SwimmingSafety.vue
    marker.value = L.circleMarker([props.lat, props.lon], {
      radius: 15,
      fillColor: '#ef4444',
      color: '#dc2626',
      weight: 3,
      fillOpacity: 0.9
    })
      .addTo(map.value as L.Map)
      .bindPopup(props.name || 'Selected Beach')
      .openPopup()
    
    // Fly to the location
    map.value.flyTo([props.lat, props.lon], props.zoom, {
      duration: 1.2
    })
    
  } catch (err) {
    console.error('Error adding marker:', err)
  }
}

const openInGoogleMaps = () => {
  if (props.lat && props.lon) {
    window.open(`https://www.google.com/maps?q=${props.lat},${props.lon}`, '_blank')
  }
}

onMounted(() => {
  // Simple initialization like SwimmingSafety.vue
  initMap()
})

onUnmounted(() => {
  if (map.value) {
    // Clean up all beach circles
    beachCircles.value.forEach(circle => {
      map.value?.removeLayer(circle)
    })
    beachCircles.value = []
    
    // Clean up marker
    if (marker.value) {
      map.value.removeLayer(marker.value as unknown as L.Layer)
    }
    
    map.value.remove()
    map.value = null
  }
})

// Watch for coordinate changes
watch([() => props.lat, () => props.lon, () => props.name], () => {
  if (props.lat && props.lon) {
    addMarker()
  } else if (map.value && marker.value) {
    map.value.removeLayer(marker.value as unknown as L.Layer)
    marker.value = null
    map.value.flyTo([-37.9, 145.0], 9, { duration: 1.2 }) // Reset to Victoria view
  }
})
</script>

<style scoped>
.mini-map {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  height: 100%;
  min-height: 400px; /* Ensure map has a minimum height */
  width: 100%; /* Ensure full width */
}

.mini-map-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.5rem;
}

.mini-map-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.mini-map-beach-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 1rem;
  font-weight: 500;
  color: #3b82f6;
}

.mini-map-container {
  flex-grow: 1;
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  min-height: 200px; /* Minimum height for the map view itself */
}

.mini-map-view {
  width: 100%;
  height: 100%;
  min-height: 300px;
  position: relative;
}

.map-container {
  width: 100%;
  height: 100%;
  min-height: 300px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}

.mini-map-empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #94a3b8;
  font-size: 1.1rem;
}


.mini-map-loading, .mini-map-error {
  position: absolute;
  inset: 0;
  background: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  z-index: 10;
  border-radius: 12px;
  font-size: 1.1rem;
  color: #475569;
}


.mini-map-legend {
  margin-top: 1rem;
  padding: 0.75rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  font-size: 0.85rem;
  color: #374151;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.mini-map-actions {
  margin-top: 1rem;
  text-align: right;
}

/* Leaflet overrides */
.mini-map-view :deep(.leaflet-control-container) {
  display: none; /* Hide default Leaflet controls if not needed */
}

/* Ensure marker positioning works correctly */
.map-container :deep(.leaflet-marker-icon) {
  position: absolute !important;
}

.map-container :deep(.leaflet-marker-pane) {
  z-index: 600;
}

.map-container :deep(.leaflet-popup-pane) {
  z-index: 700;
}
</style>
