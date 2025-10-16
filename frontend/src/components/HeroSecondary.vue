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
      <div class="image-carousel">
        <div class="carousel-container">
          <img 
            v-for="(image, index) in images" 
            :key="index"
            :src="image" 
            :alt="`Beach Activity ${index + 1}`" 
            class="hero-secondary-image"
            :class="{ 'active': currentImageIndex === index }"
          />
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import Button from 'primevue/button'

const props = defineProps<{
  title: string
  subtitle: string
  imgSrc: string
}>()

// Import images
const imageModules = import.meta.glob('@/assets/landingpage/*.jpg', { eager: true })
const images = Object.values(imageModules).map((module: any) => module.default)

const currentImageIndex = ref(0)
let carouselInterval: number | null = null

const nextSlide = () => {
  currentImageIndex.value = (currentImageIndex.value + 1) % images.length
}


const startCarousel = () => {
  carouselInterval = setInterval(nextSlide, 4000)
}

const stopCarousel = () => {
  if (carouselInterval) {
    clearInterval(carouselInterval)
    carouselInterval = null
  }
}

const router = useRouter()

const scrollToContent = () => {
  router.push('/beach-rating')
}

onMounted(() => {
  startCarousel()
})

onUnmounted(() => {
  stopCarousel()
})
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

.image-carousel {
  position: relative;
  width: 100%;
  max-width: 500px;
}

.carousel-container {
  position: relative;
  width: 100%;
  height: 400px;
  overflow: hidden;
  border-radius: 20px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);
}

.hero-secondary-image {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.5s ease-in-out;
}

.hero-secondary-image.active {
  opacity: 1;
}

</style>
