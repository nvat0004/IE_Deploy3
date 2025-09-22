<template>
  <main class="education-wrapper">
    <div class="page-background"></div>
    <section>
      <h2>Minerals</h2>
      <div class="carousel">
        <div
          v-for="(item, index) in minerals"
          :key="index"
          class="edu-card"
          @click="selectItem(item)"
        >
          <img :src="item.img" :alt="item.title" class="edu-img" />
          <div class="edu-info">
            <h4>{{ item.title }}</h4>
            <p class="pron">({{ item.pron }}) <button @click.stop="speak(item.pron)">🎤</button></p>
            <p class="blurb">{{ item.blurb }}</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2>Diseases</h2>
      <div class="carousel">
        <div
          v-for="(item, index) in diseases"
          :key="index"
          class="edu-card"
          @click="selectItem(item)"
        >
          <img :src="item.img" :alt="item.title" class="edu-img" />
          <div class="edu-info">
            <h4>{{ item.title }}</h4>
            <p class="pron">({{ item.pron }}) <button @click.stop="speak(item.pron)">🎤</button></p>
            <p class="blurb">{{ item.blurb }}</p>
          </div>
        </div>
      </div>
    </section>

    <section>
      <h2>Bacteria</h2>
      <div class="carousel">
        <div
          v-for="(item, index) in bacteria"
          :key="index"
          class="edu-card"
          @click="selectItem(item)"
        >
          <img :src="item.img" :alt="item.title" class="edu-img" />
          <div class="edu-info">
            <h4>{{ item.title }}</h4>
            <p class="pron">({{ item.pron }}) <button @click.stop="speak(item.pron)">🎤</button></p>
            <p class="blurb">{{ item.blurb }}</p>
          </div>
        </div>
      </div>
    </section>

    <div v-if="selected" class="overlay" @click="selected = null">
      <img :src="selected.img" class="overlay-img" />
      <div class="overlay-text">
        <h2>{{ selected.title }}</h2>
        <p><strong>Pronunciation:</strong> {{ selected.pron }}</p>
        <p>{{ selected.blurb }}</p>
      </div>
    </div>
    
    <!-- Footer -->
    <footer class="footer">
      <small>© 2025 AquaProtect - TA22 Team </small>
      <small>Keeping families safe at Beaches</small>
    </footer>
  </main>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import type { EduItem } from '@/types/edu'

// IMAGE IMPORTS (make sure these paths match your project structure)
import imgNa from '@/assets/edu/minerals/sodium.png'
import imgCl from '@/assets/edu/minerals/chloride.png'
import imgMg from '@/assets/edu/minerals/magnesium.png'
import imgCa from '@/assets/edu/minerals/calcium.png'
import imgK from '@/assets/edu/minerals/potassium.png'
import imgSO4 from '@/assets/edu/minerals/sulfate.png'
import imgO2 from '@/assets/edu/minerals/oxygen.png'
import imgCO2 from '@/assets/edu/minerals/carbon-dioxide.png'

import imgEColi from '@/assets/edu/diseases/e-coli.png'
import imgLegionella from '@/assets/edu/diseases/legionella.png'
import imgGiardia from '@/assets/edu/diseases/giardia.png'
import imgCholera from '@/assets/edu/diseases/cholera.png'
import imgSalmonella from '@/assets/edu/diseases/salmonella.png'

import imgSpirillum from '@/assets/edu/bacteria/spirillum.png'
import imgXenophilius from '@/assets/edu/bacteria/xenophilius.png'
import imgMethylobacterium from '@/assets/edu/bacteria/methylobacterium.png'
import imgRhodococcus from '@/assets/edu/bacteria/rhodococcus.png'

const selected = ref<EduItem | null>(null)
const selectItem = (item: EduItem) => (selected.value = item)

const speak = (text: string) => {
  const utterance = new SpeechSynthesisUtterance(text)
  speechSynthesis.speak(utterance)
}

const minerals: EduItem[] = [
  { title: 'Sodium (Na⁺)', pron: 'SO-dee-um', blurb: 'Hi, I’m Sodium! I love to join with Chloride...', img: imgNa },
  { title: 'Chloride (Cl⁻)', pron: 'KLOR-ide', blurb: 'Hello, I’m Chloride! I’m Sodium’s best friend...', img: imgCl },
  { title: 'Magnesium (Mg²⁺)', pron: 'Mag-NEE-zee-um', blurb: 'Hi, I’m Magnesium! I keep the ocean healthy...', img: imgMg },
  { title: 'Calcium (Ca²⁺)', pron: 'KAL-see-um', blurb: 'Hi, I’m Calcium! Shells, corals, and crabs love me...', img: imgCa },
  { title: 'Potassium (K⁺)', pron: 'Puh-TASS-ee-um', blurb: 'Hey, I’m Potassium! I’m also in bananas...', img: imgK },
  { title: 'Sulfate (SO₄²⁻)', pron: 'SUL-fate', blurb: 'Hi, I’m Sulfate! I float around in seawater...', img: imgSO4 },
  { title: 'Oxygen (O₂)', pron: 'OK-si-jen', blurb: 'Hi, I’m Oxygen! Fish and crabs breathe me...', img: imgO2 },
  { title: 'Carbon Dioxide (CO₂)', pron: 'KAR-bun Dye-ox-side', blurb: 'Hello, I’m Carbon Dioxide! Sea plants use me...', img: imgCO2 }
]

const diseases: EduItem[] = [
  { title: 'E. coli', pron: 'Ee KO-lie', blurb: 'I live in tummies. Some naughty kinds can cause tummy aches.', img: imgEColi },
  { title: 'Legionella', pron: 'LEE-juh-nel-uh', blurb: 'I like warm water in hot tubs and pipes.', img: imgLegionella },
  { title: 'Giardia', pron: 'JEE-ar-dee-uh', blurb: 'I live in lakes and cause tummy bugs.', img: imgGiardia },
  { title: 'Cholera', pron: 'KOL-uh-ruh', blurb: 'I sneak into dirty water and cause watery diarrhea.', img: imgCholera },
  { title: 'Salmonella', pron: 'SAL-muh-nel-uh', blurb: 'I hang out on raw food and cause food poisoning.', img: imgSalmonella }
]

const bacteria: EduItem[] = [
  { title: 'Spirillum', pron: 'Spy-RILL-um', blurb: 'I twirl like a corkscrew and live in water.', img: imgSpirillum },
  { title: 'Xenophilius', pron: 'ZEN-oh-fill-us', blurb: 'A recycling helper living in tricky places.', img: imgXenophilius },
  { title: 'Methylobacterium', pron: 'METH-ih-low-bak-TEER-ee-um', blurb: 'Lives on plants and helps them grow.', img: imgMethylobacterium },
  { title: 'Rhodococcus', pron: 'ROW-doe-kok-us', blurb: 'Breaks down oily pollution, cleaning up the environment.', img: imgRhodococcus }
]
</script>

<style scoped>
.education-wrapper {
  max-width: 1100px;
  margin: 0 auto;
  padding: 20px;
}
.carousel {
  display: flex;
  overflow-x: auto;
  gap: 20px;
  padding: 16px 0;
  scroll-snap-type: x mandatory;
}
.edu-card {
  min-width: 280px;
  flex: 0 0 auto;
  background: #f8f8f8;
  padding: 16px;
  border-radius: 12px;
  cursor: pointer;
  scroll-snap-align: start;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}
.edu-img {
  width: 100%;
  height: 180px;
  object-fit: contain;
  margin-bottom: 12px;
}
.edu-info h4 {
  margin: 0;
}
.pron button {
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
}
.overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.8);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  z-index: 999;
  padding: 20px;
}
.overlay-img {
  width: 200px;
  margin-bottom: 20px;
}
.overlay-text {
  max-width: 600px;
  text-align: center;
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

/* Update main wrapper */
.education-wrapper {
  position: relative;
  z-index: 1;
  min-height: 100vh;
  padding: 2rem 0 0 0;
}

/* Update section styling */
.education-wrapper section {
  background: linear-gradient(
    to bottom,
    rgba(240, 248, 255, 0.95) 0%,
    rgba(248, 250, 252, 0.98) 20%,
    rgba(255, 255, 255, 1) 100%
  );
  border-radius: 16px;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  padding: 2rem;
  margin: 2rem auto;
  max-width: 1200px;
  border: 1px solid rgba(59, 130, 246, 0.1);
  backdrop-filter: blur(10px);
}

.education-wrapper h2 {
  background: linear-gradient(135deg, #0891b2, #06b6d4, #67e8f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-size: 2.5rem;
  font-weight: 800;
  text-align: center;
  margin-bottom: 2rem;
}

/* Update card styling */
.edu-card {
  background: linear-gradient(135deg, rgba(240, 248, 255, 0.8), rgba(255, 255, 255, 0.9));
  border: 1px solid rgba(8, 145, 178, 0.2);
  box-shadow: 0 4px 16px rgba(8, 145, 178, 0.1);
  transition: all 0.3s ease;
}

.edu-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(8, 145, 178, 0.2);
  border-color: rgba(8, 145, 178, 0.3);
}

/* Footer */
.footer {
  background: #1e293b;
  color: white;
  padding: 3rem 0 1rem;
  margin: 2rem 0 0 0;
  position: relative;
  z-index: 2;
  width: 100vw;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
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
