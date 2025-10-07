<template>
  <div class="auth-page">
    <div class="auth-card shadow">
      <div class="text-center mb-3">
        <Avatar :image="logoUrl" size="xlarge" shape="circle" />
      </div>
      <h2 class="text-center mb-3">Enter Access Password</h2>
      <p class="text-center text-muted mb-4">This site is protected. Please enter the access password to continue.</p>

      <form @submit.prevent="onSubmit">
        <div class="mb-3">
          <label for="password" class="form-label fw-bold">Password</label>
          <input
            id="password"
            v-model="password"
            type="password"
            class="form-control form-control-lg"
            placeholder="Enter password"
            autocomplete="current-password"
            :class="{'is-invalid': error}"
          />
          <div v-if="error" class="invalid-feedback d-block">{{ error }}</div>
        </div>

        <Button type="submit" label="Unlock" icon="pi pi-lock-open" class="w-100" />
      </form>
    </div>
    <footer class="auth-footer">
      <small>© 2025 AquaProtect - TA22 Team</small>
    </footer>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import logo from '@/assets/logo.png'

const router = useRouter()
const route = useRoute()
const password = ref('')
const error = ref<string | null>(null)
const logoUrl = logo

const CORRECT_PASSWORD = 'BeachProtector'

const onSubmit = () => {
  if (password.value === CORRECT_PASSWORD) {
    localStorage.setItem('siteAuthed', 'true')
    const redirect = (route.query.redirect as string) || '/'
    router.replace(redirect)
  } else {
    error.value = 'Incorrect password. Please try again.'
  }
}
</script>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-image: url('@/assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  background-attachment: fixed;
  padding: 2rem 1rem;
}

.auth-card {
  width: 100%;
  max-width: 420px;
  background: linear-gradient(135deg, rgba(240, 248, 255, 0.95), rgba(255, 255, 255, 0.98));
  border: 1px solid rgba(59, 130, 246, 0.15);
  border-radius: 16px;
  padding: 2rem;
  box-shadow: 0 8px 32px rgba(59, 130, 246, 0.15);
  backdrop-filter: blur(10px);
}

h2 {
  background: linear-gradient(135deg, #1e40af, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  font-weight: 800;
}

.auth-footer {
  margin-top: auto;
  text-align: center;
  color: #94a3b8;
}
</style>


