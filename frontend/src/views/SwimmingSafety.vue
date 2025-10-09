<template>
  <div class="page-wrapper">
    <div class="page-background"></div>
    
    <div class="main-content-wrapper">
      <section class="safety-section">
        <div class="d-flex justify-content-between align-items-start mb-3">
          <h2 class="mb-0">Today's Swimming Safety</h2>

          <div class="text-end">
        <div class="mb-2">
          <label for="statusFilter" class="form-label fw-bold me-2">Filter:</label>
          <select v-model="selectedStatus" id="statusFilter" class="form-select d-inline-block w-auto">
            <option value="">All</option>
            <option value="Safe">Safe</option>
            <option value="Moderate">Moderate</option>
            <option value="Dangerous">Dangerous</option>
          </select>
        </div>

            <ul class="list-group small" style="max-width: 220px; margin-left: auto;">
          <li v-for="beach in filteredBeaches" :key="beach.name"
              class="list-group-item d-flex justify-content-between align-items-center">
            {{ beach.name }}
            <span
              class="badge"
              :class="{
                'bg-success': beach.status === 'Safe',
                'bg-warning text-dark': beach.status === 'Moderate',
                'bg-danger': beach.status === 'Dangerous'
              }"
            >
              {{ beach.status }}
            </span>
          </li>
        </ul>
      </div>
    </div>

    <div class="mb-3 text-center">
      <label for="beach" class="form-label fw-bold">Select Beach:</label>
      <select v-model="selectedBeach" id="beach" class="form-select w-auto d-inline-block">
        <option v-for="beach in beachOptions" :key="beach.name" :value="beach.name">
          {{ beach.name }}
        </option>
      </select>
    </div>

    <div class="text-center mb-3">
      <button
        class="btn btn-primary"
        @click="goToPrediction"
        :disabled="!selectedBeach"
      >
        View 7-Day Prediction for {{ selectedBeach }}
      </button>
    </div>

    <div
      v-if="status"
      class="card text-center mx-auto shadow p-3 mb-4"
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
    </div>
    
    <footer class="footer">
      <small>© 2025 AquaProtect - TA22 Team </small>
      <small>Keeping families safe at Beaches</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch, computed } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const router = useRouter();

const selectedBeach = ref("Carrum Beach");
const status = ref("");
const reason = ref("");
const date = ref("");
const selectedStatus = ref("");

const map = ref<any>(null);
const markers = ref<any[]>([]);
const allBeachStatuses = ref<any[]>([]);

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

// Redirect to Prediction
const goToPrediction = () => {
  if (selectedBeach.value) {
    router.push({ path: "/predict", query: { beach: selectedBeach.value } });
  }
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

  updateSelectedBeach();
};

// Sync selected beach card + zoom
const updateSelectedBeach = () => {
  const beach = allBeachStatuses.value.find(b => b.name === selectedBeach.value);
  if (beach) {
    status.value = beach.status;
    reason.value = beach.reason;
    date.value = beach.date;

    const b = beachOptions.find(b => b.name === selectedBeach.value);
    if (b && map.value) {
      map.value.setView([b.lat, b.lng], 13);
    }
  }
};

const filteredBeaches = computed(() => {
  if (!selectedStatus.value) return allBeachStatuses.value;
  return allBeachStatuses.value.filter(b => b.status === selectedStatus.value);
});

const initMap = () => {
  map.value = L.map("map").setView([-37.9, 145.0], 9);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    attribution: "&copy; OpenStreetMap contributors",
  }).addTo(map.value);
};

onMounted(() => {
  initMap();
  fetchAllSafety();
});

watch(selectedBeach, updateSelectedBeach);
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
</style>
