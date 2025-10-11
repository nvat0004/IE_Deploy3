<template>
  <div class="dashboard-card weather-card">
    <div class="card-header">
      <h4 class="card-title">Weather Trend (Next 6h)</h4>
    </div>

    <div v-if="loading" class="loading-state">
      <ProgressSpinner style="width: 3rem; height: 3rem" strokeWidth="4" animationDuration="1s" />
      <p>Loading weather data...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <Message severity="error" :closable="false">{{ error }}</Message>
      <Button label="Retry" @click="$emit('retry')" outlined size="small" />
    </div>

    <div v-else class="chart-container">
      <apexchart
        v-if="!loading && !error && times.length > 0 && temps.length > 0"
        type="area"
        :options="chartOptions"
        :series="chartSeries"
        height="200"
      ></apexchart>
      <div class="current-temp">
        Current: <strong>{{ currentTemp }}°C</strong>
      </div>
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
  times: string[]
  temps: number[]
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

const currentTemp = computed(() => props.temps.length > 0 ? Math.round(props.temps[0]) : '-')

const chartSeries = computed(() => [
  {
    name: 'Temperature',
    data: props.temps.map(temp => Math.round(temp))
  }
])

const chartOptions = computed(() => ({
  chart: {
    type: 'area',
    height: 200,
    sparkline: {
      enabled: false
    },
    toolbar: {
      show: false
    },
    zoom: {
      enabled: false
    }
  },
  dataLabels: {
    enabled: false
  },
  stroke: {
    curve: 'smooth',
    width: 2
  },
  fill: {
    type: 'gradient',
    gradient: {
      shadeIntensity: 1,
      opacityFrom: 0.7,
      opacityTo: 0.9,
      stops: [0, 100]
    }
  },
  xaxis: {
    categories: props.times,
    labels: {
      show: true,
      style: {
        fontSize: '12px',
        fontWeight: 500,
        colors: ['#64748b']
      },
      rotate: 0,
      trim: false,
      maxHeight: 20
    },
    axisBorder: {
      show: true,
      color: '#e2e8f0'
    },
    axisTicks: {
      show: true,
      color: '#e2e8f0'
    }
  },
  yaxis: {
    labels: {
      show: true,
      style: {
        fontSize: '12px',
        fontWeight: 500,
        colors: ['#64748b']
      },
      formatter: (val: number) => `${val}°C`
    }
  },
  grid: {
    show: true,
    borderColor: '#f1f5f9',
    strokeDashArray: 2,
    xaxis: {
      lines: {
        show: true
      }
    },
    yaxis: {
      lines: {
        show: true
      }
    }
  },
  tooltip: {
    enabled: true,
    x: {
      show: true,
      formatter: (_val: string, { dataPointIndex }: { dataPointIndex: number }) => {
        return props.times[dataPointIndex]
      }
    },
    y: {
      formatter: (val: number) => `${val}°C`
    }
  },
  colors: ['#3B82F6'] // Blue color for the temperature line
}))
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

.chart-container {
  width: 100%;
  margin-top: 2rem;
}

.current-temp {
  font-size: 1.5rem;
  color: #1e293b;
  margin-top: 0.5rem;
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
