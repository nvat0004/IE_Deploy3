<template>
  <div class="dashboard-card uv-card">
    <div class="card-header">
      <h4 class="card-title">UV Index</h4>
      <span :class="['risk-label', `risk-${riskLevel}`]">{{ riskLabel }}</span>
    </div>

    <div v-if="loading" class="loading-state">
      <ProgressSpinner style="width: 3rem; height: 3rem" strokeWidth="4" animationDuration="1s" />
      <p>Loading UV data...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <Message severity="error" :closable="false">{{ error }}</Message>
      <Button label="Retry" @click="$emit('retry')" outlined size="small" />
    </div>

    <div v-else class="chart-container">
      <apexchart
        v-if="!loading && !error && value !== null && value !== undefined"
        type="radialBar"
        :options="chartOptions"
        :series="chartSeries"
        height="180"
      ></apexchart>
      <p class="uv-value">{{ value ?? '-' }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import VueApexCharts from 'vue3-apexcharts'
import ProgressSpinner from 'primevue/progressspinner'
import Message from 'primevue/message'
import Button from 'primevue/button'

const apexchart = VueApexCharts

interface Props {
  value: number | null
  loading?: boolean
  error?: string | null
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  error: null
})

defineEmits<{
  retry: []
}>()

const riskLevel = computed(() => {
  if (props.value === null) return 'unknown'
  if (props.value <= 2) return 'low'
  if (props.value <= 5) return 'moderate'
  if (props.value <= 7) return 'high'
  if (props.value <= 10) return 'very-high'
  return 'extreme'
})

const riskLabel = computed(() => {
  switch (riskLevel.value) {
    case 'low': return 'Low'
    case 'moderate': return 'Moderate'
    case 'high': return 'High'
    case 'very-high': return 'Very High'
    case 'extreme': return 'Extreme'
    default: return 'Unknown'
  }
})

const chartSeries = computed(() => {
  if (props.value === null) return [0]
  // Max UV index is typically 11-12, so scale to 100% for chart
  return [Math.min(Math.round((props.value / 12) * 100), 100)]
})

const chartOptions = computed(() => ({
  chart: {
    height: 180,
    type: 'radialBar',
    sparkline: {
      enabled: true
    }
  },
  plotOptions: {
    radialBar: {
      hollow: {
        margin: 0,
        size: '70%'
      },
      track: {
        background: '#e0e0e0',
        margin: 0,
      },
      dataLabels: {
        name: {
          show: false
        },
        value: {
          show: false
        }
      }
    }
  },
  fill: {
    colors: [getChartColor(riskLevel.value)]
  },
  stroke: {
    lineCap: 'round'
  },
  labels: ['UV Index'],
  responsive: [
    {
      breakpoint: 480,
      options: {
        chart: {
          height: 150
        }
      }
    }
  ]
}))

function getChartColor(level: string): string {
  switch (level) {
    case 'low': return '#4CAF50' // Green
    case 'moderate': return '#FFC107' // Amber
    case 'high': return '#FF9800' // Orange
    case 'very-high': return '#F44336' // Red
    case 'extreme': return '#9C27B0' // Purple
    default: return '#9E9E9E' // Grey
  }
}
</script>

<style scoped>
.dashboard-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #e2e8f0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  min-height: 220px;
  position: relative;
}

.card-header {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  right: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.card-title {
  font-size: 1.25rem;
  font-weight: 700;
  color: #1e293b;
  margin: 0;
}

.risk-label {
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.3rem 0.7rem;
  border-radius: 8px;
  color: white;
}

.risk-low { background-color: #4CAF50; }
.risk-moderate { background-color: #FFC107; color: #333; }
.risk-high { background-color: #FF9800; }
.risk-very-high { background-color: #F44336; }
.risk-extreme { background-color: #9C27B0; }
.risk-unknown { background-color: #9E9E9E; }

.chart-container {
  position: relative;
  width: 100%;
  max-width: 200px;
  margin-top: 2rem;
}

.uv-value {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 2.5rem;
  font-weight: 800;
  color: #1e293b;
  margin: 0;
}

.loading-state, .error-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  height: 100%;
  width: 100%;
}

.error-state .p-message {
  width: auto;
  margin-bottom: 0.5rem;
}
</style>
