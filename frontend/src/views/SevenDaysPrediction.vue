<template>
  <div class="page-wrapper">
    <div class="page-background"></div>
    
    <div class="main-content-wrapper">
      <section class="prediction-section">
        <h2 class="mb-4 text-center">7-Day Swimming Safety Prediction</h2>

    <div class="mb-3 text-center">
      <label for="beach" class="form-label fw-bold">Select Beach:</label>
      <select v-model="selectedBeach" id="beach" class="form-select w-auto d-inline-block">
        <option v-for="beach in beachOptions" :key="beach" :value="beach">
          {{ beach }}
        </option>
      </select>
    </div>

    <div class="text-center mb-3">
      <span class="badge bg-success me-2">Safe</span>
      <span class="badge bg-warning text-dark me-2">Moderate</span>
      <span class="badge bg-danger">Dangerous</span>
    </div>

    <div class="row row-cols-1 row-cols-md-3 g-4">
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

        <div v-if="predictions.length === 0" class="text-center mt-4 text-muted">
          No predictions available. Please try another beach.
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
import { ref, onMounted, watch } from "vue";
import { useRoute } from "vue-router";
import axios from "axios";

const route = useRoute();
const selectedBeach = ref("Carrum Beach");
const predictions = ref([]);

const beachOptions = [
  "Carrum Beach",
  "St Kilda Beach",
  "Dromana Beach",
  "Port Melbourne Beach",
  "Altona Beach",
];

const fetchPredictions = async () => {
  try {
    const response = await axios.get(`/api/predict?beach=${encodeURIComponent(selectedBeach.value)}`);
    predictions.value = response.data;
  } catch {
    predictions.value = [];
  }
};

// ✅ Auto-load from query param
onMounted(() => {
  const queryBeach = route.query.beach as string | undefined;
  if (queryBeach && beachOptions.includes(queryBeach)) {
    selectedBeach.value = queryBeach;
  }
  fetchPredictions();
});

watch(selectedBeach, fetchPredictions);

const formatDate = (isoDate: string): string => {
  const options: Intl.DateTimeFormatOptions = { weekday: "short", year: "numeric", month: "short", day: "numeric" };
  return new Date(isoDate).toLocaleDateString(undefined, options);
};
</script>

<style scoped>
.card-title {
  font-size: 1.1rem;
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
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  padding: 3rem 2rem;
  position: relative;
  z-index: 2;
  margin: 2rem auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(59, 130, 246, 0.1);
}

/* Prediction Section */
.prediction-section {
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

/* Update title */
h2 {
  background: linear-gradient(135deg, #1e40af, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
  font-weight: 800;
}

/* Update cards */
.card {
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid rgba(59, 130, 246, 0.3);
  box-shadow: 0 4px 16px rgba(59, 130, 246, 0.2);
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(59, 130, 246, 0.3);
  border-color: rgba(59, 130, 246, 0.4);
  background: rgba(255, 255, 255, 1);
}

/* Override Bootstrap card colors for better visibility */
.card.bg-success {
  background: rgba(21, 128, 61, 0.8) !important;
  color: white !important;
  border-color: rgba(21, 128, 61, 0.7) !important;
}

.card.bg-warning {
  background: rgba(245, 158, 11, 0.9) !important;
  color: white !important;
  border-color: rgba(245, 158, 11, 0.8) !important;
}

.card.bg-danger {
  background: rgba(239, 68, 68, 0.9) !important;
  color: white !important;
  border-color: rgba(239, 68, 68, 0.8) !important;
}

/* Ensure text is always visible */
.card .card-title,
.card .fw-bold,
.card p {
  color: inherit !important;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
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
