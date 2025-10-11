<template>
  <section class="hero-secondary">
    <div class="hero-secondary-content">
      <h2 class="hero-secondary-title">{{ title }}</h2>
      <p class="hero-secondary-subtitle">{{ subtitle }}</p>
      <Button
        label="Learn More"
        class="hero-secondary-button"
        @click="scrollToContent"
      />
    </div>
    <div class="hero-secondary-image-wrapper">
      <img :src="imgSrc" :alt="title" class="hero-secondary-image" />
    </div>
  </section>
</template>

<script setup lang="ts">
import Button from 'primevue/button'

const props = defineProps<{
  title: string
  subtitle: string
  imgSrc: string
}>()

const scrollToContent = () => {
  const contentSection = document.getElementById('content')
  if (contentSection) {
    contentSection.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}
</script>

<style scoped>
.hero-secondary {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem 1.5rem;
  background: #f8fafc;
  gap: 2rem;
}

@media (min-width: 768px) {
  .hero-secondary {
    flex-direction: row;
    text-align: left;
    padding: 6rem 3rem;
  }
}

.hero-secondary-content {
  flex: 1;
  max-width: 600px;
  text-align: center;
}

@media (min-width: 768px) {
  .hero-secondary-content {
    text-align: left;
    padding-right: 2rem;
  }
}

.hero-secondary-title {
  font-size: 2.5rem;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.hero-secondary-subtitle {
  font-size: 1.125rem;
  color: #475569;
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-secondary-button {
  background: #3b82f6 !important;
  color: white !important;
  border: none !important;
  font-weight: 600 !important;
  padding: 12px 24px !important;
  font-size: 1rem !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15) !important;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.hero-secondary-button:hover {
  transform: translateY(-2px) scale(1.02);
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2) !important;
}

.hero-secondary-image-wrapper {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  max-width: 500px;
}

.hero-secondary-image {
  max-width: 100%;
  height: auto;
  border-radius: 16px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
}
</style>
