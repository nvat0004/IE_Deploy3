<template>
  <NavBar v-if="showNav" />
  <router-view />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import NavBar from './components/NavBar.vue'

const route = useRoute()
const showNav = computed(() => route.name !== 'Auth')
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body { 
  margin: 0; 
  padding: 0;
  font-family: system-ui, Arial, sans-serif; 
}

#app {
  margin: 0;
  padding: 0;
}
</style>
