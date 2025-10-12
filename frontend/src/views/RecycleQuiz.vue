<template>
  <div class="quiz-container d-flex justify-content-center align-items-center">
    <div class="quiz-card">
      <div class="d-flex justify-content-between align-items-center mb-3">
        <h2 class="fw-bold">🛢️ Trash Bin Quiz</h2>
        <div>
          <button @click="toggleMute" class="btn btn-outline-secondary me-2">
            <font-awesome-icon :icon="isMuted ? ['fas', 'volume-mute'] : ['fas', 'volume-up']" /> Sound
          </button>
          <button v-if="quizCompleted" @click="restartQuiz" class="btn btn-outline-primary">Restart</button>
        </div>
      </div>

      <div v-if="!quizCompleted" class="text-center">
        <h4 class="mb-3">🗑️ Drag the item to the correct bin!</h4>

        <img
          :src="currentQuestion.image"
          :alt="currentQuestion.name"
          class="quiz-image mb-3 animate__animated"
          :class="{
            'animate__bounce': animateCorrect,
            'animate__wobble': animateWrong
          }"
          draggable="true"
          @dragstart="onDragStart($event, currentQuestion.bin)"
        />
        <h3 class="fw-bold">{{ currentQuestion.name }}</h3>
        <p class="text-muted">{{ progressText }}</p>

        <div class="progress mb-4" style="height: 20px;">
          <div class="progress-bar bg-success" role="progressbar"
               :style="{ width: progressPercent + '%' }">
          </div>
        </div>

        <div class="d-flex justify-content-around mt-4 bins-area">
          <div class="bin" @dragover.prevent @drop="onDrop('Red Bin')">
            <img src="/bins/red-bin.png" class="bin-img" />
            <p class="fw-bold">Red Bin</p>
          </div>

          <div class="bin" @dragover.prevent @drop="onDrop('Green Bin')">
            <img src="/bins/green-bin.png" class="bin-img" />
            <p class="fw-bold">Green Bin</p>
          </div>
        </div>

        <div v-if="answered" class="mt-3">
          <p :class="isCorrect ? 'text-success' : 'text-danger'" class="fw-bold fs-5">
            {{ isCorrect ? '✅ Correct!' : '❌ Oops! Wrong Bin!' }}
          </p>
          <p class="text-info">💡 Fun Fact: {{ currentQuestion.fact }}</p>
          <button @click="nextQuestion" class="btn btn-primary mt-3">Next ➡️</button>
        </div>
      </div>

      <div v-else class="text-center animate__animated animate__tada">
        <h3 class="text-success">🎉 Quiz Completed!</h3>
        <p class="fw-bold">You scored {{ score }} out of {{ questions.length }}</p>

        <audio ref="happyAudio" src="/sounds/happy.mp3"></audio>

        <h5 class="mt-4">Leaderboard 🏆</h5>
        <ul class="list-group leaderboard">
          <li class="list-group-item" v-for="(entry, index) in leaderboard" :key="index">
            {{ index + 1 }}. {{ entry.name }} - {{ entry.score }} pts
          </li>
        </ul>
      </div>
    </div>
    
    <footer class="footer">
      <small>© 2025 AquaProtect - TA22 Team </small>
      <small>Keeping families safe at Beaches</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { library } from '@fortawesome/fontawesome-svg-core';
import { faVolumeUp, faVolumeMute } from '@fortawesome/free-solid-svg-icons';
import 'animate.css';

// Add icons to library
library.add(faVolumeUp, faVolumeMute);
// @ts-ignore
import confetti from 'canvas-confetti';

// Questions (6 items, 2 bins only)
const questions = ref([
  { name: 'Chip Packets', bin: 'Red Bin', image: '/quiz/ChipPackets.png', fact: 'Chip packets cannot be recycled – they go in the red bin.' },
  { name: 'Clothing', bin: 'Red Bin', image: '/quiz/Clothing.png', fact: 'Clothing doesn’t belong in recycling. Donate if possible, otherwise red bin.' },
  { name: 'Dirty Food Containers', bin: 'Red Bin', image: '/quiz/FoodContainers.png', fact: 'Food containers that are dirty can’t be recycled – red bin.' },
  { name: 'Leftover Food', bin: 'Green Bin', image: '/quiz/LeftoverFood.png', fact: 'Food scraps and leftovers are compostable – green bin.' },
  { name: 'Styrofoam', bin: 'Red Bin', image: '/quiz/Styrofoam.png', fact: 'Styrofoam cannot be recycled – it belongs in the red bin.' },
  { name: 'Tin Cans', bin: 'Green Bin', image: '/quiz/TinCans.png', fact: 'Clean tin cans can be recycled – green bin.' },
]);

// State
const currentIndex = ref(0);
const score = ref(0);
const answered = ref(false);
const isCorrect = ref(false);
const quizCompleted = ref(false);
const isMuted = ref(false);
const animateCorrect = ref(false);
const animateWrong = ref(false);

// Sounds - with error handling
const correctSound = new Audio('/sounds/correct.mp3');
const wrongSound = new Audio('/sounds/wrong.mp3');
const happySound = new Audio('/sounds/happy.mp3');

// Add error handling for audio loading
[correctSound, wrongSound, happySound].forEach(audio => {
  audio.addEventListener('error', (e) => {
    console.warn('Audio file failed to load:', audio.src);
  });
});

const currentQuestion = computed(() => questions.value[currentIndex.value]);
const progressText = computed(() => `Question ${currentIndex.value + 1} of ${questions.value.length}`);
const progressPercent = computed(() => ((currentIndex.value + 1) / questions.value.length) * 100);
const leaderboard = ref<any[]>([]);

// Drag logic
function onDragStart(event: DragEvent, correctBin: string) {
  event.dataTransfer?.setData("bin", correctBin);
}

function onDrop(bin: string) {
  if (answered.value) return;

  const correctBin = currentQuestion.value.bin;
  answered.value = true;
  isCorrect.value = bin === correctBin;

  if (isCorrect.value) {
    score.value++;
    animateCorrect.value = true;
    if (!isMuted.value) {
      correctSound.play().catch(e => console.warn('Could not play correct sound:', e));
    }
    setTimeout(() => (animateCorrect.value = false), 1000);
  } else {
    animateWrong.value = true;
    if (!isMuted.value) {
      wrongSound.play().catch(e => console.warn('Could not play wrong sound:', e));
    }
    setTimeout(() => (animateWrong.value = false), 1000);
  }
}

// Next
function nextQuestion() {
  if (currentIndex.value < questions.value.length - 1) {
    currentIndex.value++;
    answered.value = false;
  } else {
    completeQuiz();
  }
}

// Complete
function completeQuiz() {
  quizCompleted.value = true;

  // 🎉 Confetti
  confetti({
    particleCount: 200,
    spread: 100,
    origin: { y: 0.6 }
  });

  if (!isMuted.value) {
    happySound.play().catch(e => console.warn('Could not play happy sound:', e));
  }

  const name = prompt('Enter your name for the leaderboard:') || 'Player';
  const entry = { name, score: score.value };
  const existing = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  existing.push(entry);
  existing.sort((a: any, b: any) => b.score - a.score);
  leaderboard.value = existing.slice(0, 5);
  localStorage.setItem('leaderboard', JSON.stringify(leaderboard.value));
}

// Restart
function restartQuiz() {
  shuffleArray(questions.value);
  currentIndex.value = 0;
  score.value = 0;
  answered.value = false;
  isCorrect.value = false;
  quizCompleted.value = false;
}

// Sound toggle
function toggleMute() {
  isMuted.value = !isMuted.value;
  // Background music removed as file doesn't exist
}

// Shuffle helper
function shuffleArray(array: any[]) {
  return array.sort(() => Math.random() - 0.5);
}

// Init
onMounted(() => {
  shuffleArray(questions.value);
  leaderboard.value = JSON.parse(localStorage.getItem('leaderboard') || '[]');
  // Background music removed as file doesn't exist
});
</script>

<style scoped>
.quiz-container {
  background: url('/backgrounds/trash-quiz-bg.png') no-repeat center center fixed;
  background-size: cover;
  min-height: 100vh;
  padding: 20px;
  display: flex;
  flex-direction: column;
}

.quiz-card {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 16px;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.25);
  padding: 30px;
  max-width: 700px;
  width: 100%;
}

.quiz-image {
  width: 160px;
  height: 160px;
  object-fit: contain;
  cursor: grab;
}

.bins-area {
  gap: 40px;
}

.bin {
  text-align: center;
}

.bin-img {
  width: 150px;
  height: 200px;
  object-fit: contain;
  cursor: pointer;
}

.leaderboard {
  max-width: 320px;
  margin: 0 auto;
  text-align: left;
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
  margin-top: auto;
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
