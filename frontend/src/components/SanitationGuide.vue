<template>
  <div class="sanitation-guide">
    <div class="guide-header">
      <h2 class="guide-title">Sanitation Guide</h2>
      <p class="guide-subtitle">Learn proper beach hygiene practices through interactive scenarios</p>
    </div>

    <div class="scenario-container">
      <div class="scenario-header">
        <h3 class="scenario-title">{{ currentScenario.title }}</h3>
        <div class="scenario-counter">
          {{ currentIndex + 1 }} / {{ scenarios.length }}
        </div>
      </div>

      <div class="scenario-content">
        <div class="image-container">
          <img 
            :src="currentScenario.centerImage" 
            :alt="currentScenario.title"
            class="center-image"
          />
        </div>

        <div class="options-container">
          <button 
            class="option-button left-option"
            :class="{ 'selected': selectedOption === 'left' }"
            @click="selectOption('left')"
          >
            <span class="option-text">{{ currentScenario.leftOption }}</span>
          </button>

          <button 
            class="option-button right-option"
            :class="{ 'selected': selectedOption === 'right' }"
            @click="selectOption('right')"
          >
            <span class="option-text">{{ currentScenario.rightOption }}</span>
          </button>
        </div>

        <div v-if="selectedOption" class="result-container">
          <div class="result-image-container">
            <img 
              :src="getResultImage()" 
              :alt="`${currentScenario.title} - ${isCorrect ? 'Correct' : 'Wrong'}`"
              class="result-image"
            />
          </div>
          <div class="result-text">
            <h4 class="result-title" :class="{ 'correct': isCorrect, 'wrong': !isCorrect }">
              {{ isCorrect ? 'Correct!' : 'Not quite right' }}
            </h4>
            <p class="result-description">{{ getResultDescription() }}</p>
          </div>
        </div>
      </div>

      <div class="navigation-container">
        <button 
          class="nav-button prev-button"
          :disabled="currentIndex === 0"
          @click="previousScenario"
        >
          <i class="pi pi-chevron-left"></i>
          Previous
        </button>

        <button 
          class="nav-button next-button"
          :disabled="currentIndex === scenarios.length - 1"
          @click="nextScenario"
        >
          Next
          <i class="pi pi-chevron-right"></i>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

// Import images
import clothesCenter from '@/assets/Comics/Clothes/Clothes.png'
import clothesCorrect from '@/assets/Comics/Clothes/Clothes Correct.png'
import clothesWrong from '@/assets/Comics/Clothes/Clothes Wrong.png'

import flagCenter from '@/assets/Comics/Flag/Flag.png'
import flagCorrect from '@/assets/Comics/Flag/Flag Correct.png'
import flagWrong from '@/assets/Comics/Flag/Flag Wrong.png'

import lifeguardCenter from '@/assets/Comics/Lifeguard/Lifeguard.png'
import lifeguardCorrect from '@/assets/Comics/Lifeguard/Lifeguard Correct.png'
import lifeguardWrong from '@/assets/Comics/Lifeguard/Lifeguard Wrong.png'

import showerCenter from '@/assets/Comics/Shower/Shower.png'
import showerCorrect from '@/assets/Comics/Shower/Shower Correct.png'
import showerWrong from '@/assets/Comics/Shower/Shower Wrong.png'

import sunscreenCenter from '@/assets/Comics/Sunscreen/Sunscreen.png'
import sunscreenCorrect from '@/assets/Comics/Sunscreen/Sunscreen Correct.png'
import sunscreenWrong from '@/assets/Comics/Sunscreen/Sunscreen Wrong.png'

import swimmingCenter from '@/assets/Comics/Swimming/Swimming.png'
import swimmingCorrect from '@/assets/Comics/Swimming/Swimming Correct.png'
import swimmingWrong from '@/assets/Comics/Swimming/Swimming Wrong.png'

import washHandsCenter from '@/assets/Comics/Wash Hands/Wash Hands.png'
import washHandsCorrect from '@/assets/Comics/Wash Hands/Wash Hands Correct.png'
import washHandsWrong from '@/assets/Comics/Wash Hands/Wash Hands Wrong.png'

interface Scenario {
  title: string
  centerImage: string
  leftOption: string
  rightOption: string
  correctAnswer: 'left' | 'right'
  correctImage: string
  wrongImage: string
  correctDescription: string
  wrongDescription: string
}

const scenarios: Scenario[] = [
  {
    title: "Changing Wet Clothes After Swimming",
    centerImage: clothesCenter,
    leftOption: "Keep wearing wet clothes",
    rightOption: "Change to dry clothes immediately",
    correctAnswer: 'right',
    correctImage: clothesCorrect,
    wrongImage: clothesWrong,
    correctDescription: "Excellent! Changing to dry clothes after swimming prevents skin irritation, bacterial growth, and helps maintain good hygiene.",
    wrongDescription: "Wearing wet clothes for too long can cause skin irritation, bacterial infections, and discomfort. Always change to dry clothes after water activities."
  },
  {
    title: "Beach Safety Flags",
    centerImage: flagCenter,
    leftOption: "Ignore the flag colors",
    rightOption: "Check flag colors before swimming",
    correctAnswer: 'right',
    correctImage: flagCorrect,
    wrongImage: flagWrong,
    correctDescription: "Excellent! Always check beach flags - they indicate water conditions and safety levels for swimming.",
    wrongDescription: "Beach flags are important safety indicators. Ignoring them can put you at risk of dangerous water conditions."
  },
  {
    title: "Lifeguard Instructions",
    centerImage: lifeguardCenter,
    leftOption: "Follow lifeguard directions",
    rightOption: "Do whatever you want",
    correctAnswer: 'left',
    correctImage: lifeguardCorrect,
    wrongImage: lifeguardWrong,
    correctDescription: "Perfect! Lifeguards are trained professionals who keep everyone safe. Always follow their instructions.",
    wrongDescription: "Lifeguards are there for your safety. Ignoring their instructions can be dangerous for you and others."
  },
  {
    title: "Shower After Swimming",
    centerImage: showerCenter,
    leftOption: "Skip showering after swimming",
    rightOption: "Take a shower to clean your body",
    correctAnswer: 'right',
    correctImage: showerCorrect,
    wrongImage: showerWrong,
    correctDescription: "Excellent! Showering after swimming removes salt, sand, chlorine, and bacteria from your skin, keeping you healthy and comfortable.",
    wrongDescription: "Not showering after swimming can leave salt, sand, and bacteria on your skin, which may cause irritation and skin problems."
  },
  {
    title: "Sunscreen Protection",
    centerImage: sunscreenCenter,
    leftOption: "Skip using sunscreen",
    rightOption: "Apply sunscreen for protection",
    correctAnswer: 'right',
    correctImage: sunscreenCorrect,
    wrongImage: sunscreenWrong,
    correctDescription: "Great choice! Sunscreen protects your skin from harmful UV rays and prevents sunburn, especially important during beach activities.",
    wrongDescription: "Skipping sunscreen can lead to sunburn, skin damage, and increased risk of skin cancer. Always protect your skin from UV rays."
  },
  {
    title: "Swimming with Mouth Closed",
    centerImage: swimmingCenter,
    leftOption: "Swim with mouth open",
    rightOption: "Keep your mouth closed while swimming",
    correctAnswer: 'right',
    correctImage: swimmingCorrect,
    wrongImage: swimmingWrong,
    correctDescription: "Perfect! Keeping your mouth closed while swimming prevents swallowing water, bacteria, and potential contaminants.",
    wrongDescription: "Swimming with your mouth open can cause you to swallow dirty water, bacteria, and other contaminants that may make you sick."
  },
  {
    title: "Hand Washing",
    centerImage: washHandsCenter,
    leftOption: "Wash hands after beach activities",
    rightOption: "Skip hand washing",
    correctAnswer: 'left',
    correctImage: washHandsCorrect,
    wrongImage: washHandsWrong,
    correctDescription: "Excellent! Washing hands after beach activities prevents the spread of germs and keeps you healthy.",
    wrongDescription: "Hand washing is crucial after beach activities to remove sand, salt, and potential bacteria."
  }
]

const currentIndex = ref(0)
const selectedOption = ref<'left' | 'right' | null>(null)

const currentScenario = computed(() => scenarios[currentIndex.value])

const isCorrect = computed(() => {
  if (!selectedOption.value) return false
  return selectedOption.value === currentScenario.value.correctAnswer
})

const selectOption = (option: 'left' | 'right') => {
  selectedOption.value = option
}

const getResultImage = () => {
  return isCorrect.value ? currentScenario.value.correctImage : currentScenario.value.wrongImage
}

const getResultDescription = () => {
  return isCorrect.value ? currentScenario.value.correctDescription : currentScenario.value.wrongDescription
}

const nextScenario = () => {
  if (currentIndex.value < scenarios.length - 1) {
    currentIndex.value++
    selectedOption.value = null
  }
}

const previousScenario = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
    selectedOption.value = null
  }
}
</script>

<style scoped>
.sanitation-guide {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.guide-header {
  text-align: center;
  margin-bottom: 2rem;
}

.guide-title {
  font-size: 2rem;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 0.5rem;
}

.guide-subtitle {
  color: #64748b;
  font-size: 1.1rem;
}

.scenario-container {
  background: #f8fafc;
  border-radius: 12px;
  padding: 2rem;
}

.scenario-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.scenario-title {
  font-size: 1.5rem;
  font-weight: 600;
  color: #1e293b;
  margin: 0;
}

.scenario-counter {
  background: #3b82f6;
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-weight: 600;
  font-size: 0.9rem;
}

.scenario-content {
  text-align: center;
}

.image-container {
  margin-bottom: 2rem;
}

.center-image {
  max-width: 300px;
  width: 100%;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.options-container {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.option-button {
  flex: 1;
  max-width: 200px;
  padding: 1rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 1rem;
  font-weight: 500;
}

.option-button:hover {
  border-color: #3b82f6;
  background: #f0f9ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
}

.option-button.selected {
  border-color: #3b82f6;
  background: #3b82f6;
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.option-text {
  display: block;
  text-align: center;
}

.result-container {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  margin-top: 1rem;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.result-image-container {
  margin-bottom: 1rem;
}

.result-image {
  max-width: 250px;
  width: 100%;
  height: auto;
  border-radius: 8px;
}

.result-text {
  text-align: center;
}

.result-title {
  font-size: 1.25rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.result-title.correct {
  color: #059669;
}

.result-title.wrong {
  color: #dc2626;
}

.result-description {
  color: #64748b;
  line-height: 1.6;
  margin: 0;
}

.navigation-container {
  display: flex;
  justify-content: space-between;
  margin-top: 2rem;
}

.nav-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 2px solid #e5e7eb;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-button:hover:not(:disabled) {
  border-color: #3b82f6;
  background: #f0f9ff;
  color: #3b82f6;
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.prev-button {
  color: #64748b;
}

.next-button {
  color: #3b82f6;
}

/* Responsive Design */
@media (max-width: 768px) {
  .sanitation-guide {
    padding: 1rem;
  }
  
  .scenario-container {
    padding: 1.5rem;
  }
  
  .scenario-header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }
  
  .options-container {
    flex-direction: column;
    align-items: center;
  }
  
  .option-button {
    max-width: 100%;
    width: 100%;
  }
  
  .navigation-container {
    flex-direction: column;
    gap: 1rem;
  }
  
  .nav-button {
    justify-content: center;
  }
}
</style>
