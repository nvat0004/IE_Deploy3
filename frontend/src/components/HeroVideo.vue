<template>
  <div class="hero-video-container">
    <!-- Video Background -->
    <video
      class="hero-video"
      autoplay
      muted
      loop
      playsinline
    >
      <source src="@/assets/video/beach.mp4" type="video/mp4" />
      Your browser does not support the video tag.
    </video>

    <!-- Overlay -->
    <div class="hero-overlay"></div>

    <!-- Content using PrimeVue Card -->
    <Card class="hero-content-card">
      <template #content>
        <div class="hero-content">
          <!-- Main Title -->
          <h1 class="hero-title">
            Keep Your Family Safe
          </h1>
          
          <!-- Subtitle -->
          <p class="hero-subtitle">
            Real-time water quality updates for Melbourne's Beaches
          </p>
        </div>
      </template>
    </Card>

  </div>
</template>

<script setup lang="ts">
import Card from 'primevue/card'

</script>

<style scoped>
.hero-video-container {
  position: relative;
  height: 75vh;
  width: 100%;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  max-height: 75vh;
  max-width: 100%;
  min-height: 75vh;
  min-width: 100%;
  transition: all 0.8s ease-in-out;
}

.hero-video-container::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 100px;
  background: linear-gradient(
    to bottom,
    transparent 0%,
    rgba(240, 248, 255, 0.1) 20%,
    rgba(240, 248, 255, 0.3) 50%,
    rgba(240, 248, 255, 0.6) 80%,
    rgba(240, 248, 255, 0.8) 100%
  );
  z-index: 2;
  pointer-events: none;
}

.hero-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 75vh;
  object-fit: cover;
  object-position: center;
  z-index: 1;
  max-width: 100%;
  max-height: 75vh;
  min-width: 100%;
  min-height: 75vh;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 75vh;
  background: rgba(0, 0, 0, 0.4);
  z-index: 2;
}

.hero-content-card {
  position: relative;
  z-index: 3;
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  width: 100%;
  max-width: 800px;
  margin: 0 20px;
  max-height: 100vh;
  overflow: hidden;
}

.hero-content {
  text-align: center;
  color: white;
}

.hero-title {
  font-size: 3rem;
  font-weight: bold;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.7);
  line-height: 1.2;
}

.hero-subtitle {
  font-size: 1.25rem;
  margin-bottom: 2rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.7);
  line-height: 1.5;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

.hero-button {
  background: white !important;
  color: #2563eb !important;
  border: none !important;
  font-weight: 600 !important;
  padding: 12px 32px !important;
  font-size: 1.1rem !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3) !important;
}

.hero-button:hover {
  transform: scale(1.05) !important;
  transition: transform 0.2s ease !important;
}



@media (max-width: 768px) {
  .hero-video-container {
    height: 40vh;
    min-height: 40vh;
    max-height: 40vh;
  }
  
  .hero-video {
    height: 40vh;
    min-height: 40vh;
    max-height: 40vh;
  }
  
  .hero-overlay {
    height: 40vh;
  }
  
  .hero-title {
    font-size: 1.8rem;
    margin-bottom: 0.8rem;
  }
  
  .hero-subtitle {
    font-size: 0.9rem;
    margin-bottom: 1.2rem;
  }
  
  .hero-content {
    padding: 0 1rem;
  }
  
  .hero-button {
    padding: 8px 20px !important;
    font-size: 0.85rem !important;
  }
  
}

@media (max-width: 480px) {
  .hero-video-container {
    height: 35vh;
    min-height: 35vh;
    max-height: 35vh;
  }
  
  .hero-video {
    height: 35vh;
    min-height: 35vh;
    max-height: 35vh;
  }
  
  .hero-overlay {
    height: 35vh;
  }
  
  .hero-title {
    font-size: 1.5rem;
    margin-bottom: 0.6rem;
  }
  
  .hero-subtitle {
    font-size: 0.8rem;
    margin-bottom: 1rem;
  }
  
  .hero-content {
    padding: 0 0.75rem;
  }
  
  .hero-button {
    padding: 6px 16px !important;
    font-size: 0.8rem !important;
  }
  
}


@media (orientation: landscape) and (max-height: 600px) {
  .hero-title {
    font-size: 2rem;
    margin-bottom: 0.5rem;
  }
  
  .hero-subtitle {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  
  .hero-button {
    padding: 8px 20px !important;
    font-size: 0.9rem !important;
  }
  
}
</style>
