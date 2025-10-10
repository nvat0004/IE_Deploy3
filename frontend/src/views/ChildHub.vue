<template>
  <div class="childhub-page">
    <div class="page-background"></div>
    
    <div class="main-content-wrapper">
      <section class="childhub-section">
        <div class="childhub-header">
          <h1 class="childhub-title">Kids' Learning Hub</h1>
          <p class="childhub-subtitle">Fun activities to learn about water safety and recycling!</p>
        </div>

        <div class="activities-grid">
          <!-- Education Card -->
          <div class="activity-card education-card">
            <h3 class="card-title">Water Education</h3>
            <p class="card-description">Discover bacteria, diseases, and minerals in water. Learn to stay safe!</p>
            <div class="card-features">
              <span class="feature-tag">Diseases</span>
              <span class="feature-tag">Bacteria</span>
              <span class="feature-tag">Minerals</span>
            </div>
            <router-link to="/education" class="activity-button education-button">
              Learn More
            </router-link>
          </div>

          <!-- Sanitation Guide Card (Placeholder) -->
          <div class="activity-card sanitation-card">
            <h3 class="card-title">Sanitation Guide</h3>
            <p class="card-description">Coming soon! Learn about proper hygiene and sanitation practices.</p>
            <div class="card-features">
              <span class="feature-tag">Coming Soon</span>
              <span class="feature-tag">Hygiene</span>
              <span class="feature-tag">Safety</span>
            </div>
            <button class="activity-button sanitation-button" disabled>
              Coming Soon
            </button>
          </div>
          
          <!-- Trash Quiz Card -->
          <div class="activity-card trash-quiz-card">
            <h3 class="card-title">Trash Quiz</h3>
            <p class="card-description">Learn which bin to use for different items. Drag and drop to play!</p>
            <div class="card-features">
              <span class="feature-tag">Interactive</span>
              <span class="feature-tag">Leaderboard</span>
              <span class="feature-tag">Sound Effects</span>
            </div>
            <router-link to="/recycle-quiz" class="activity-button trash-button">
              Play Quiz
            </router-link>
          </div>
        </div>

        <!-- Fun Facts Section -->
        <div class="fun-facts-section">
          <h2 class="facts-title">Did You Know?</h2>
          <div class="facts-grid">
            <div class="fact-card">
              <p>Water covers 71% of Earth's surface, but only 2.5% is fresh water!</p>
            </div>
            <div class="fact-card">
              <p>Recycling one plastic bottle saves enough energy to power a light bulb for 3 hours!</p>
            </div>
            <div class="fact-card">
              <p>Some bacteria in water can be helpful, but others can make us sick!</p>
            </div>
          </div>
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
// No complex logic needed for this hub page
</script>

<style scoped>
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
    rgba(0, 0, 0, 0.3) 0%,
    rgba(0, 0, 0, 0.15) 15%,
    rgba(0, 0, 0, 0.1) 30%,
    rgba(0, 0, 0, 0.05) 40%,
    rgba(0, 0, 0, 0.05) 60%,
    rgba(0, 0, 0, 0.1) 70%,
    rgba(0, 0, 0, 0.15) 85%,
    rgba(0, 0, 0, 0.3) 100%
  );
  z-index: -1;
  pointer-events: none;
}

/* Page Wrapper */
.childhub-page {
  position: relative;
  min-height: 100vh;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
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
  box-shadow: 0 8px 32px rgba(34, 197, 94, 0.15);
  padding: 3rem 2rem;
  position: relative;
  z-index: 2;
  margin: 2rem auto;
  backdrop-filter: blur(10px);
  border: 1px solid rgba(34, 197, 94, 0.1);
  flex: 1;
}

/* ChildHub Section */
.childhub-section {
  position: relative;
  z-index: 2;
  width: 100%;
  box-sizing: border-box;
}

/* Header */
.childhub-header {
  text-align: center;
  margin-bottom: 3rem;
}

.childhub-title {
  font-size: 3rem;
  font-weight: 800;
  background: linear-gradient(135deg, #0369a1, #0ea5e9, #67e8f9);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin: 0 0 1rem 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.childhub-subtitle {
  font-size: 1.25rem;
  color: #0e7490; /* ocean blue for subtitle */
  margin: 0;
  font-weight: 500;
}

/* Activities Grid */
.activities-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

/* Activity Cards */
.activity-card {
  background: linear-gradient(135deg, rgba(255, 255, 255, 0.9), rgba(248, 250, 252, 0.95));
  border-radius: 20px;
  padding: 2rem;
  text-align: center;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;
}

.activity-card::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 4px;
  background: linear-gradient(90deg, #22c55e, #16a34a, #15803d);
}

.activity-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 16px 32px rgba(0, 0, 0, 0.15);
}


/* Card Titles */
.card-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #0c4a6e; /* deep ocean blue */
  margin: 0 0 1rem 0;
}

/* Card Descriptions */
.card-description {
  color: #0e7490; /* ocean blue text */
  line-height: 1.6;
  margin: 0 0 1.5rem 0;
  font-size: 1rem;
}

/* Feature Tags */
.card-features {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  justify-content: center;
  margin-bottom: 2rem;
}

.feature-tag {
  background: rgba(14, 165, 233, 0.12); /* sky-500 */
  color: #0c4a6e;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.875rem;
  font-weight: 500;
  border: 1px solid rgba(14, 165, 233, 0.25);
}

/* Activity Buttons */
.activity-button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1.1rem;
  text-decoration: none;
  transition: all 0.3s ease;
  border: none;
  cursor: pointer;
  width: 100%;
  justify-content: center;
}

.trash-button {
  background: linear-gradient(135deg, #f59e0b, #d97706);
  color: white;
  box-shadow: 0 4px 12px rgba(245, 158, 11, 0.3);
}

.trash-button:hover {
  background: linear-gradient(135deg, #d97706, #b45309);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(245, 158, 11, 0.4);
  color: white;
  text-decoration: none;
}

.education-button {
  background: linear-gradient(135deg, #3b82f6, #2563eb);
  color: white;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.education-button:hover {
  background: linear-gradient(135deg, #2563eb, #1d4ed8);
  transform: translateY(-2px);
  box-shadow: 0 6px 16px rgba(59, 130, 246, 0.4);
  color: white;
  text-decoration: none;
}

.sanitation-button {
  background: linear-gradient(135deg, #9ca3af, #6b7280);
  color: white;
  box-shadow: 0 4px 12px rgba(156, 163, 175, 0.3);
  cursor: not-allowed;
  opacity: 0.7;
}

.sanitation-button:hover {
  transform: none;
  box-shadow: 0 4px 12px rgba(156, 163, 175, 0.3);
}


/* Fun Facts Section */
.fun-facts-section {
  background: linear-gradient(135deg, rgba(14, 165, 233, 0.06), rgba(59, 130, 246, 0.1));
  border-radius: 16px;
  padding: 2rem;
  border: 1px solid rgba(14, 165, 233, 0.25);
}

.facts-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  color: #0c4a6e; /* deep ocean blue */
  margin: 0 0 2rem 0;
}

.facts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.fact-card {
  background: rgba(255, 255, 255, 0.8);
  padding: 1.5rem;
  border-radius: 12px;
  text-align: center;
  border: 1px solid rgba(34, 197, 94, 0.2);
  transition: transform 0.2s ease;
}

.fact-card:hover {
  transform: translateY(-4px);
}


.fact-card p {
  color: #0e7490; /* ocean blue body text */
  line-height: 1.6;
  margin: 0;
  font-weight: 500;
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

/* Responsive Design */
@media (max-width: 768px) {
  .childhub-title {
    font-size: 2.5rem;
  }
  
  .activities-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
  
  .main-content-wrapper {
    padding: 2rem 1.5rem;
    margin: 1rem auto;
  }
  
  .facts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 480px) {
  .childhub-title {
    font-size: 2rem;
  }
  
  .childhub-subtitle {
    font-size: 1.1rem;
  }
  
  .activity-card {
    padding: 1.5rem;
  }
  
}
</style>

