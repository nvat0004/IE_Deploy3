<template>
  <div class="beach-selector">
    <h3 class="beach-selector-title">Select a Beach:</h3>
    
    <div class="beach-buttons">
      <Button
        v-for="beach in beaches"
        :key="beach.id"
        :label="beach.name"
        :class="{ 'beach-button': true, 'beach-button-active': internalSelectedBeach?.id === beach.id }"
        :loading="loading"
        :disabled="disabled"
        @click="selectBeach(beach)"
      />
    </div>

    <div v-if="internalSelectedBeach" class="selected-info">
      <div class="selected-beach">
        <strong>{{ internalSelectedBeach.name }}</strong>
        <span v-if="lastUpdated" class="last-updated">Last updated: {{ formattedLastUpdated }}</span>
      </div>
    </div>

    <div v-if="error" class="error-message">
      <Message severity="error" :closable="false">{{ error }}</Message>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import Button from 'primevue/button'
import Message from 'primevue/message'

interface Beach {
  id: string
  name: string
  lat: number
  lon: number
}

const props = defineProps<{
  beaches: Beach[]
  selectedBeach: Beach | null
  loading?: boolean
  disabled?: boolean
  error?: string | null
  lastUpdated?: Date | string | null
}>()

const emit = defineEmits<{
  (e: 'select', beach: Beach): void
}>()

const internalSelectedBeach = ref<Beach | null>(props.selectedBeach)

// Format lastUpdated for display
const formattedLastUpdated = computed(() => {
  if (!props.lastUpdated) return ''
  
  const date = typeof props.lastUpdated === 'string' 
    ? new Date(props.lastUpdated) 
    : props.lastUpdated
  
  return date.toLocaleString()
})

watch(() => props.selectedBeach, (newVal) => {
  internalSelectedBeach.value = newVal
})

const selectBeach = (beach: Beach) => {
  internalSelectedBeach.value = beach
  emit('select', beach)
}

watch(internalSelectedBeach, (newVal) => {
  if (newVal) {
    emit('select', newVal)
  }
})
</script>

<style scoped>
.beach-selector {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1.5rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #e5e7eb;
}

.beach-selector-title {
  margin: 0 0 0.5rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #1f2937;
}

.beach-buttons {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 0.75rem;
}

.beach-button {
  padding: 0.75rem 1rem !important;
  font-size: 0.9rem !important;
  font-weight: 500 !important;
  border: 2px solid #e5e7eb !important;
  background: white !important;
  color: #374151 !important;
  transition: all 0.2s ease !important;
  border-radius: 8px !important;
}

.beach-button:hover {
  border-color: #3b82f6 !important;
  background: #f8fafc !important;
  color: #1e40af !important;
  transform: translateY(-1px) !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.15) !important;
}

.beach-button-active {
  border-color: #3b82f6 !important;
  background: #3b82f6 !important;
  color: white !important;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3) !important;
}

.beach-button-active:hover {
  background: #2563eb !important;
  border-color: #2563eb !important;
  color: white !important;
}

.selected-info {
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
}

.selected-beach {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.selected-beach strong {
  font-size: 1.1rem;
  color: #1f2937;
}

.last-updated {
  font-size: 0.85rem;
  color: #6b7280;
}

.error-message {
  margin-top: 0.5rem;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .beach-buttons {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
  
  .beach-button {
    padding: 0.6rem 0.8rem !important;
    font-size: 0.85rem !important;
  }
  
  .beach-selector {
    padding: 1rem;
  }
  
  .beach-selector-title {
    font-size: 1.1rem;
  }
}

@media (max-width: 480px) {
  .beach-buttons {
    grid-template-columns: 1fr;
  }
  
  .beach-button {
    padding: 0.5rem 0.6rem !important;
    font-size: 0.8rem !important;
  }
}
</style>
