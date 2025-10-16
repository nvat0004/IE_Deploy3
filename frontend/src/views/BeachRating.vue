<template>
  <div class="container-fluid py-4 beach-rating-page">
    <div class="container">
      <!-- ===== Main Content Container ===== -->
      <div class="main-content-container">
        <!-- ===== Header ===== -->
        <div class="row align-items-center mb-3">
          <div class="col">
            <h2 class="page-title mb-0">{{ selectedBeach }}</h2>
          </div>
          <div class="col text-end">
            <button class="btn btn-info" @click="showGuide = !showGuide">
              {{ showGuide ? "Hide Guide" : "Open Guide" }}
            </button>
          </div>
        </div>
<!-- ===== Guide Overlay (Updated Professional Version) ===== -->
<div v-if="showGuide" class="guide-overlay" @click="showGuide = false">
  <div class="guide-content" @click.stop>
    <div class="guide-header">
      <h4 class="mb-0">Planning a Visit to the Beach?</h4>
      <button @click="showGuide = false" class="btn-close" aria-label="Close">
        <span class="close-icon">X</span>
      </button>
    </div>

    <div class="guide-body">
      <p class="mb-3">
        This page provides a complete overview of beach safety, natural features, and facilities to help you
        choose the best beach for you and your family, whether you're heading out today or planning ahead!
      </p>

      <h5 class="fw-bold text-primary">How does BeachProtect determine the safety of your beach?</h5>
      <p>The Overall Beach Safety Score is determined through two key systems:</p>

      <ul class="guide-list">
        <li>
          <strong>Beach Risk Rating</strong> - calculated based on real-time marine conditions such as wave height,
          rip currents, and current strength, as well as natural hazards and features like sharks, rocks, and bluebottles.
        </li>
        <li>
          <strong>Water Quality (Enterococci Levels)</strong> - swimming safety is monitored through Enterococci bacteria,
          a key indicator of faecal contamination and overall water quality.
        </li>
      </ul>

      <p class="mt-3 mb-2">
        According to the U.S. Environmental Protection Agency (EPA, 2012) and NSW Government's Guidelines for Beach
        Water Quality (2020), Enterococci levels are classified as follows:
      </p>

      <ul class="guide-list">
        <li>✅<strong>0-35 organisms/100 mL</strong>: Safe for swimming</li>
        <li>⚠️<strong>36-104 organisms/100 mL</strong>: Moderately safe</li>
        <li>❌<strong>105+ organisms/100 mL</strong>: Unsafe - avoid contact</li>
      </ul>

      <h5 class="fw-bold text-primary mt-4">Use the Interactive Tools Below!</h5>
      <ul class="guide-list">
        <li>
          <strong>Select a Beach from the Dropdown List</strong> - view live safety data, natural features,
          and facilities for your chosen beach instantly.
        </li>
        <li>
          <strong>Check Current and Upcoming Beach Safety</strong> - instantly see whether the water at a beach
          is Safe, Moderate, or Dangerous for swimming today, and plan ahead with a 7-day predicted water quality forecast.
        </li>
        <li>
          <strong>Check Beach Risk Rating</strong> - view each beach's risk score (1-10), calculated from real-time
          marine data and environmental features like wave patterns, beach type, and presence of hazards.
        </li>
        <li>
          <strong>Use the Interactive Safety Map</strong> - all beaches appear on a real-time color-coded map:
          <span class="text-success">Safe</span>, <span class="text-warning">Moderate</span>, <span class="text-danger">Dangerous</span>.
        </li>
        <li>
          <strong>Available Facilities</strong> - explore amenities such as toilets, showers, barbecues, shelters,
          picnic areas, playgrounds, shops, and parking at your selected beach.
        </li>
      </ul>

      <p class="mt-4 mb-0">
        Whether you're going for a swim, surf, or picnic, this page helps you stay safe, informed, and prepared.
        <strong>Ready to dive in?</strong> Select a beach or explore the map now!
      </p>
    </div>
  </div>
</div>


        <!-- ===== Beach Selector ===== -->
        <div class="beach-selector-wrapper mb-4">
          <BeachSelector
            :beaches="beachOptions"
            @select="handleBeachSelect"
            :selectedBeach="selectedBeachObject"
            :lastUpdated="new Date()"
          />
        </div>

        <!-- ===== Ratings ===== -->
        <div class="row mb-4 align-items-end gx-3">
          <div class="col-md-6 text-center">
            <h3 class="overall-rating-title mb-3">Overall Rating</h3>
            <div class="overall-rating-badge" :class="overallBadgeClass">{{ overallRating }}</div>
            <p class="rating-description mt-3 mb-0">
              <strong>Justification:</strong> {{ overallReason }}
            </p>
          </div>

          <div class="col-md-6 text-center">
            <h3 class="overall-rating-title mb-3">Hazard Risk</h3>
            <div class="hazard-rating-badge" :class="hazardBadgeClass">{{ currentBeachData.rating }}/10</div>
            <p class="rating-description mt-3 mb-0">
              <strong>Risk Level:</strong> {{ hazardReason }}
            </p>
          </div>
        </div>

      <!-- ===== Predictions & Hazard side-by-side ===== -->
      <div class="row g-4 mb-4">
        <!-- Predictions -->
        <div class="col-md-6">
          <div class="card shadow-sm h-100">
            <div class="card-header bg-primary text-white fw-bold">7-Day Swimming Safety Prediction</div>
            <div class="card-body overflow-auto equal-box">
              <div class="text-center mb-3">
                <span class="badge bg-success me-2">Safe</span>
                <span class="badge bg-warning text-dark me-2">Moderate</span>
                <span class="badge bg-danger">Dangerous</span>
              </div>

              <div v-if="predictionsLoading" class="text-center text-muted">Loading…</div>
              <div v-else-if="predictionsError" class="text-center text-danger">{{ predictionsError }}</div>

              <div v-else class="row row-cols-1 row-cols-md-2 g-3">
                <div v-for="(p, i) in predictions" :key="i" class="col">
                  <div
                    class="card text-center text-white h-100"
                    :class="{
                      'bg-success': p.status === 'Safe',
                      'bg-warning text-dark': p.status === 'Moderate',
                      'bg-danger': p.status === 'Dangerous'
                    }"
                  >
                    <div class="card-body">
                      <h6 class="card-title mb-1">{{ formatDate(p.date) }}</h6>
                      <p class="fw-bold fs-5 mb-1">{{ p.status }}</p>
                      <p class="mb-0">{{ p.reason }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="!predictionsLoading && predictions.length === 0" class="text-center mt-3 text-muted">
                No predictions available.
              </div>
            </div>
          </div>
        </div>

        <!-- Hazard Factors (full box color-coded) -->
        <div class="col-md-6">
          <div class="card shadow-sm h-100 text-white" :class="hazardCardClass">
            <div class="card-header bg-dark text-white fw-bold">Key Hazard Factors</div>
            <div class="card-body overflow-auto equal-box">
              <h5 class="mb-3">
                Hazard Rating:
                <span class="badge" :class="hazardBadgeClass">{{ currentBeachData.rating }}/10</span>
              </h5>
              <p><strong>Justification:</strong> {{ hazardReason }}</p>
              <p class="small text-light mb-3">
                Calculated from wave height, rip currents, current strength, shore break, wave type and beach features.
              </p>
              <hr />
              <div class="row">
                <div v-for="(value, key) in displayableHazardFields" :key="key" class="col-md-6 mb-2">
                  <strong>{{ formatKey(key) }}:</strong> {{ value || "N/A" }}
                  <div class="small text-light">{{ explanations[key] || "" }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

        <!-- ===== Map with precise centering/zoom + legend ===== -->
        <div class="card shadow-sm mb-4">
          <div class="card-header bg-dark text-white fw-bold d-flex justify-content-between align-items-center">
            <span>Beach Map</span>
            <div class="small">
              <span class="legend-dot bg-success me-1"></span>Safe
              <span class="legend-dot bg-warning ms-3 me-1"></span>Moderate
              <span class="legend-dot bg-danger ms-3 me-1"></span>Dangerous
            </div>
          </div>
          <div class="card-body p-0">
            <div id="map" class="rounded-bottom" style="height:400px;"></div>
          </div>
        </div>
      </div>

      <!-- ===== Facilities (original logic kept) ===== -->
      <div class="card shadow-sm">
        <div class="card-header bg-primary text-white fw-bold">Beach Facilities</div>
        <div class="card-body">
          <div class="row g-4">
            <div
              v-for="(facility, key) in facilityList"
              :key="key"
              class="col-6 col-md-4 col-lg-3"
            >
              <div
                class="card text-center shadow-sm"
                :class="{
                  'bg-success text-white': isAvailable(key),
                  'bg-danger text-white': isUnavailable(key),
                  'bg-light': isCountValue(key)
                }"
              >
                <div class="card-body">
                  <img
                    :src="`/icons/${key}.png`"
                    :alt="facility.label"
                    class="img-fluid mb-2"
                    style="height:60px"
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

          <!-- Facilities legend (kept) -->
          <div class="mt-3 small">
            <span class="badge bg-success me-2">Green</span>Available
            <span class="badge bg-danger mx-2">Red</span>Not Available
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted } from "vue";
import axios from "axios";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import BeachSelector from '@/components/BeachSelector.vue';

/* -------------------- Accurate coordinates (from your working code) -------------------- */
const beachCoords: Record<string, { lat: number; lng: number }> = {
  "Carrum Beach": { lat: -38.07586976390836, lng: 145.12064080966894 },
  "St Kilda Beach": { lat: -37.8679, lng: 144.9740 },
  "Dromana Beach": { lat: -38.33018662094219, lng: 144.9645389732838 },
  "Port Melbourne Beach": { lat: -37.846462248390225, lng: 144.94543732576963 },
  "Altona Beach": { lat: -37.87069961874303, lng: 144.82995078528268 },
};

/* -------------------- Hazard + Facilities (original fields preserved) -------------------- */
const beachData: Record<string, any> = {
  "Dromana Beach": {
    lat: beachCoords["Dromana Beach"].lat, lng: beachCoords["Dromana Beach"].lng,
    wave_height: '0.5', rip_current_count: '0', beach_type: 'Reflective', current_strength: 'Low',
    shore_break: 'Weak', wave_type: 'Gentle', dominant_swell_direction: 'Northwest', mean_wave_period: '5',
    has_rocks: "No", has_reefs: "No", has_structures: "Yes", has_headlands: "No", has_outfalls: "No",
    has_sharks: "Yes", has_bluebottles: "No", has_stingers: "No", rating: 2,
    shower: 'Yes', swimmingpool: 'No', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes',
    barbique: 'Yes', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes'
  },
  "Carrum Beach": {
    lat: beachCoords["Carrum Beach"].lat, lng: beachCoords["Carrum Beach"].lng,
    wave_height: '0.6', rip_current_count: '12', beach_type: 'LTT - TBR', current_strength: 'High',
    shore_break: 'Strong', wave_type: 'Moderate', dominant_swell_direction: 'West', mean_wave_period: '5',
    has_rocks: "Yes", has_reefs: "Yes", has_structures: "Yes", has_headlands: "No", has_outfalls: "No",
    has_sharks: "Yes", has_bluebottles: "No", has_stingers: "No", rating: 3,
    shower: 'Yes', swimmingpool: 'Yes', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes',
    barbique: 'Yes', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes'
  },
  "St Kilda Beach": {
    lat: beachCoords["St Kilda Beach"].lat, lng: beachCoords["St Kilda Beach"].lng,
    wave_height: '0.4', rip_current_count: '7', beach_type: 'LTT - TBR', current_strength: 'Moderate',
    shore_break: 'Moderate', wave_type: 'Choppy', dominant_swell_direction: 'Southwest', mean_wave_period: '5',
    has_rocks: "No", has_reefs: "No", has_structures: "Yes", has_headlands: "No", has_outfalls: "No",
    has_sharks: "Yes", has_bluebottles: "No", has_stingers: "No", rating: 3,
    shower: 'No', swimmingpool: 'Yes', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes',
    barbique: 'No', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes'
  },
  "Port Melbourne Beach": {
    lat: beachCoords["Port Melbourne Beach"].lat, lng: beachCoords["Port Melbourne Beach"].lng,
    wave_height: '0.3', rip_current_count: '0', beach_type: 'LTT - TBR', current_strength: 'Low',
    shore_break: 'Weak', wave_type: 'Gentle', dominant_swell_direction: 'Southwest', mean_wave_period: '5',
    has_rocks: "No", has_reefs: "No", has_structures: "Yes", has_headlands: "No", has_outfalls: "No",
    has_sharks: "Yes", has_bluebottles: "No", has_stingers: "No", rating: 2,
    shower: 'No', swimmingpool: 'No', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes',
    barbique: 'No', picnic: 'No', shades: 'Yes', shelter: 'Yes', playground: 'Yes', phonecharging: 'Yes'
  },
  "Altona Beach": {
    lat: beachCoords["Altona Beach"].lat, lng: beachCoords["Altona Beach"].lng,
    wave_height: '0.1', rip_current_count: '0', beach_type: 'Reflective', current_strength: 'Low',
    shore_break: 'None', wave_type: 'Calm', dominant_swell_direction: 'Southwest', mean_wave_period: '5',
    has_rocks: "No", has_reefs: "No", has_structures: "Yes", has_headlands: "No", has_outfalls: "No",
    has_sharks: "Yes", has_bluebottles: "No", has_stingers: "No", rating: 1,
    shower: 'No', swimmingpool: 'No', tapwater: 'Yes', shop: 'Yes', toilet: 'Yes', parking: 'Yes',
    barbique: 'No', picnic: 'Yes', shades: 'Yes', shelter: 'Yes', playground: 'No', phonecharging: 'Yes'
  }
};

const facilityList: Record<string, { label: string }> = {
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
};

/* -------------------- Reactive -------------------- */
const selectedBeach = ref<string>("Dromana Beach");
const showGuide = ref<boolean>(false);
const predictions = ref<any[]>([]);
const predictionsLoading = ref<boolean>(false);
const predictionsError = ref<string>("");

const map = ref<L.Map | null>(null);
const markers = ref<Record<string, L.CircleMarker>>({});
const statusByBeach = ref<Record<string, "Safe" | "Moderate" | "Dangerous">>({}); // today's status per beach (if available)

/* -------------------- Computed -------------------- */
const beachOptions = [
  { id: 'dromana', name: 'Dromana Beach', lat: -38.3319, lon: 144.9649 },
  { id: 'carrum', name: 'Carrum Beach', lat: -38.0765, lon: 145.1205 },
  { id: 'stkilda', name: 'St Kilda Beach', lat: -37.8679, lon: 144.9740 },
  { id: 'portmelbourne', name: 'Port Melbourne Beach', lat: -37.8470, lon: 144.9455 },
  { id: 'altona', name: 'Altona Beach', lat: -37.8710, lon: 144.8300 }
];

const selectedBeachObject = computed(() => {
  return beachOptions.find(beach => beach.name === selectedBeach.value) || beachOptions[0];
});

const currentBeachData = computed(() => beachData[selectedBeach.value]);

/* -------------------- Methods -------------------- */
const handleBeachSelect = (beach: any) => {
  selectedBeach.value = beach.name;
};

const hazardTier = computed(() => { // 1=safe,2=moderate,3=dangerous
  const r = currentBeachData.value.rating;
  if (r >= 7) return 3;
  if (r >= 4) return 2;
  return 1;
});

const hazardBadgeClass = computed(() => {
  const r = currentBeachData.value.rating;
  if (r >= 7) return "bg-danger";
  if (r >= 4) return "bg-warning text-dark";
  return "bg-success";
});
const hazardCardClass = computed(() => hazardBadgeClass.value);

const hazardReason = computed(() => {
  const r = currentBeachData.value.rating;
  if (r >= 7)
    return "Forecast indicates hazardous swimming conditions — Dangerous: Swimming is not advised due to elevated bacteria levels exceeding 104 orgs/100 mL.";
  if (r >= 4)
    return "Forecast indicates cautionary swimming conditions — Moderate: Water quality shows slight contamination, with bacteria levels between 36 and 104 orgs/100 mL.";
  return "Forecast indicates favourable swimming conditions — Safe: Water quality is excellent, with bacteria levels within the safe threshold (≤ 35 orgs/100 mL).";
});


// Map prediction status to tier
const predTier = computed(() => {
  const p = predictions.value?.[0]?.status as "Safe" | "Moderate" | "Dangerous" | undefined;
  if (p === "Dangerous") return 3;
  if (p === "Moderate") return 2;
  if (p === "Safe") return 1;
  return 0; // no prediction
});

// Conflict-free overall rating = max(hazard tier, prediction tier)
const overallTier = computed(() => Math.max(hazardTier.value, predTier.value || 0));
const overallRating = computed(() => (overallTier.value === 3 ? "Dangerous" : overallTier.value === 2 ? "Moderate" : "Safe"));
const overallBadgeClass = computed(() =>
  overallRating.value === "Dangerous" ? "bg-danger" :
  overallRating.value === "Moderate" ? "bg-warning text-dark" : "bg-success"
);

// Clear justification explaining which signal dominates
const overallReason = computed(() => {
  const pred = predictions.value?.[0];

  // Dangerous case (prediction dominates)
  if (predTier.value > hazardTier.value && pred?.status === "Dangerous") {
    return "Forecast indicates hazardous swimming conditions — Dangerous: Swimming is not advised due to elevated bacteria levels exceeding 104 orgs/100 mL.";
  }

  // Moderate case (prediction dominates)
  if (predTier.value > hazardTier.value && pred?.status === "Moderate") {
    return "Forecast indicates cautionary swimming conditions — Moderate: Water quality shows slight contamination, with bacteria levels between 36 and 104 orgs/100 mL.";
  }

  // Safe case (prediction dominates)
  if (predTier.value > hazardTier.value && pred?.status === "Safe") {
    return "Forecast indicates favourable swimming conditions — Safe: Water quality is excellent, with bacteria levels within the safe threshold (≤ 35 orgs/100 mL).";
  }

  // When hazard rating dominates (no prediction or equal risk)
  if (hazardTier.value >= (predTier.value || 0)) {
    return hazardReason.value;
  }

  // When both are equal
  if (pred && predTier.value === hazardTier.value) {
    return `${hazardReason.value} (prediction also ${pred.status.toLowerCase()}).`;
  }

  return hazardReason.value;
});

/* -------------------- Hazard Explanations + Fields -------------------- */
const explanations: Record<string, string> = {
  wave_height: "Estimated wave height in metres",
  rip_current_count: "Number of rip currents (higher = riskier)",
  beach_type: "Reflective = Steep & calm, LTT-TBR = rip-prone bars",
  current_strength: "Water movement strength (higher = riskier)",
  shore_break: "Wave impact at the shoreline",
  wave_type: "Nature of waves (Gentle, Choppy, etc.)",
  dominant_swell_direction: "Main direction waves approach from",
  mean_wave_period: "Avg seconds between wave crests",
  has_rocks: "Rocks present (injury hazard)",
  has_reefs: "Reefs can create strong currents / sharp hazards",
  has_structures: "Piers/walls that alter currents",
  has_headlands: "Headlands cause uneven wave patterns",
  has_outfalls: "Storm/sewer outfalls (water quality risk)",
  has_sharks: "Shark presence",
  has_bluebottles: "Bluebottle jellyfish presence",
  has_stingers: "Stinging marine life presence",
};

const displayableHazardFields = computed(() => {
  const exclude = [
    "rating", "lat", "lng",
    ...Object.keys(facilityList)
  ];
  return Object.fromEntries(
    Object.entries(currentBeachData.value).filter(([k]) => !exclude.includes(k))
  );
});

/* -------------------- Facilities (original logic preserved) -------------------- */
const getFacilityValue = (key: string) => currentBeachData.value[key] || "N/A";
const isAvailable = (key: string) => getFacilityValue(key) === "Yes";
const isUnavailable = (key: string) => getFacilityValue(key) === "No";
const isCountValue = (key: string) => {
  const val = getFacilityValue(key);
  return val !== "Yes" && val !== "No" && !isNaN(Number(val));
};

const initMap = () => {
  // Initialize the map slightly north to show both beach + coastline clearly
  const initial = beachCoords[selectedBeach.value] || { lat: -37.9, lng: 145.0 };
  map.value = L.map("map").setView([initial.lat - 0.001, initial.lng], 9);

  // Use a beach-friendly tile layer for better coastal contour and terrain
  L.tileLayer("https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png", {
    maxZoom: 18,
    attribution: "© OpenStreetMap contributors, © OpenTopoMap",
  }).addTo(map.value!);

  // Add markers for all beaches
  for (const [name, b] of Object.entries(beachData)) {
    const color = tierToColor(hazardTierFromRating(b.rating));
    const m = L.circleMarker([b.lat, b.lng], {
      radius: 10,
      fillColor: color,
      color: "#000",
      weight: 1,
      fillOpacity: 0.85,
    })
      .addTo(map.value!)
      .bindPopup(`<b>${name}</b>`)
      .on("click", () => (selectedBeach.value = name));

    markers.value[name] = m;
  }

  // Center map precisely on current selection with offset
  centerOnSelected(14);

  // Keep the beach centered when window is resized
  window.addEventListener("resize", () => {
    centerOnSelected(14);
  });
};


const tierToColor = (t: number) => (t === 3 ? "red" : t === 2 ? "orange" : "green");
const hazardTierFromRating = (r: number) => (r >= 7 ? 3 : r >= 4 ? 2 : 1);

const centerOnSelected = (zoom = 14) => {
  const c = beachCoords[selectedBeach.value];
  if (map.value && c) {
    // Slightly offset the latitude upward so the beach + sea are both visible
    //map.value.setView([c.lat - 0.001, c.lng], zoom, { animate: true });
    map.value.panTo([c.lat - 0.001, c.lng], { animate: true, duration: 1.2 });

  }
};


const updateMarkerColors = () => {
  for (const [name, m] of Object.entries(markers.value)) {
    // Prefer live "today-safety" if fetched; fallback to hazard rating
    const live = statusByBeach.value[name];
    let tier = live === "Dangerous" ? 3 : live === "Moderate" ? 2 : live === "Safe" ? 1 : hazardTierFromRating(beachData[name].rating);

    // For the currently selected beach, we can reflect the computed overall tier (hazard + prediction)
    if (name === selectedBeach.value) tier = overallTier.value || tier;

    const color = tierToColor(tier);
    m.setStyle({ fillColor: color, color });
  }
};

/* -------------------- API Calls -------------------- */
const fetchPredictions = async () => {
  predictionsLoading.value = true;
  predictionsError.value = "";
  try {
    const res = await axios.get(`/api/predict?beach=${encodeURIComponent(selectedBeach.value)}`);
    predictions.value = Array.isArray(res.data) ? res.data : [];
  } catch (e: any) {
    predictions.value = [];
    predictionsError.value = e?.message || "Failed to load predictions.";
  } finally {
    predictionsLoading.value = false;
    updateMarkerColors(); // reflect any change in overall tier color for selected marker
  }
};

// Optional: fetch today's safety to color ALL markers precisely (non-breaking enhancement)
const fetchTodayForAll = async () => {
  const results: Record<string, "Safe" | "Moderate" | "Dangerous"> = {};
  await Promise.all(
    beachOptions.map(async (name) => {
      try {
        const r = await axios.get(`/api/today-safety?beach=${encodeURIComponent(name)}`);
        const s = r.data?.status as "Safe" | "Moderate" | "Dangerous";
        if (s) results[name] = s;
      } catch {
        /* ignore; fallback to hazard */
      }
    })
  );
  statusByBeach.value = results;
  updateMarkerColors();
};

/* -------------------- Lifecycle -------------------- */
onMounted(async () => {
  initMap();
  await fetchTodayForAll(); // colors map using live status if available
  await fetchPredictions(); // fills predictions + adjusts selected marker
  centerOnSelected(14);
});

watch(selectedBeach, async () => {
  centerOnSelected(14);
  await fetchPredictions();
});

/* -------------------- Utils -------------------- */
const formatKey = (k: string) => k.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
const formatDate = (d: string) =>
  new Date(d).toLocaleDateString(undefined, { weekday: "short", month: "short", day: "numeric" });
</script>

<style scoped>
.beach-rating-page {
  background-image: url('@/assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  min-height: 100vh;
  padding-bottom: 3rem;
}

/* Main Content Container */
.main-content-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 20px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

/* Text colors for main content container */
.page-title {
  color: #1e293b;
  font-size: 2rem;
  font-weight: 700;
  margin: 0;
}

.selector-label {
  color: #374151;
  font-weight: 600;
  font-size: 1.1rem;
}

.rating-title {
  color: #374151;
  font-weight: 600;
  font-size: 1.1rem;
  margin: 0 0 0.5rem 0;
}

.rating-description {
  color: #6b7280;
  font-size: 0.9rem;
  line-height: 1.5;
  margin: 0;
}

/* Overall Rating - Large */
.overall-rating-title {
  color: #1e293b;
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.overall-rating-badge {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-weight: 800;
  font-size: 2rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  min-width: 200px;
}

.overall-rating-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.overall-rating-badge.bg-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.overall-rating-badge.bg-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.overall-rating-badge.bg-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* Hazard Rating - Same style as Overall Rating */
.hazard-rating-badge {
  display: inline-block;
  padding: 1rem 2rem;
  border-radius: 16px;
  font-weight: 800;
  font-size: 2rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  min-width: 200px;
}

.hazard-rating-badge:hover {
  transform: translateY(-2px);
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
}

.hazard-rating-badge.bg-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.hazard-rating-badge.bg-warning {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
}

.hazard-rating-badge.bg-danger {
  background: linear-gradient(135deg, #ef4444, #dc2626);
  color: white;
}

/* equal height scrollable boxes */
.equal-box { max-height: 420px; }

/* Guide Modal */
.guide-overlay {
  position: fixed; inset: 0; background: rgba(0, 0, 0, 0.6);
  display: flex; align-items: center; justify-content: center; z-index: 1050;
}
.guide-content {
  background: #fff;
  border-radius: 12px;
  max-width: 600px;
  width: 90%;
  max-height: 85vh;              /* limits box height to 85% of screen */
  overflow-y: auto;              /* makes content scrollable */
  padding: 0;
  box-shadow: 0 8px 32px rgba(59,130,246,.25);
  display: flex;
  flex-direction: column;
}

.guide-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 14px 18px;
  background: #0d6efd;
  color: #fff;
  border-radius: 12px 12px 0 0;
  position: sticky;              /* keeps header visible when scrolling */
  top: 0;
  z-index: 2;
}

.guide-body {
  flex: 1;
  overflow-y: auto;              /* scrolls only the inner text */
  padding: 20px 22px;
  color: #1e293b;
  line-height: 1.55;
}

.guide-body h5 {
  margin-top: 1.2rem;
  margin-bottom: 0.5rem;
  color: #0d6efd;
}

.guide-body ul.guide-list li {
  margin-bottom: 0.6rem;
  line-height: 1.5;
}

.btn-close {
  background: rgba(255,255,255,.2);
  border: 2px solid rgba(255,255,255,.3);
  border-radius: 50%;
  width: 32px;
  height: 32px;
  color: #fff;
  font-weight: bold;
  display: flex;
  justify-content: center;
  align-items: center;
  transition: background 0.3s ease;
}

.btn-close:hover {
  background: rgba(255,255,255,.35);
}

.guide-body { padding: 20px; color: #1e293b; }
.guide-list { padding-left: 18px; }
.close-icon { font-size: 1.1rem; }

/* Map */
#map { border: 2px solid #dee2e6; border-radius: 0 0 12px 12px; }
.legend-dot { display: inline-block; width: 12px; height: 12px; border-radius: 50%; vertical-align: middle; }
.legend-dot.bg-warning { background: #ffc107 !important; }

/* Cards + badges */
.card { border: none; border-radius: 12px; }
.card-header { border-radius: 12px 12px 0 0; }
.badge { padding: 0.6rem 1rem; font-size: 1rem; }

@media (max-width: 768px) {
  .badge { font-size: 0.9rem; }
}

.guide-body h5 {
  margin-top: 1.2rem;
  margin-bottom: 0.5rem;
  color: #0d6efd;
}

.guide-body ul.guide-list li {
  margin-bottom: 0.6rem;
  line-height: 1.5;
}

</style>
