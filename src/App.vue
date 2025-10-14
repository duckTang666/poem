<script setup lang="ts">
import { ref } from 'vue';
import BaseButton from './components/BaseButton.vue';
</script>

<template>
  <main class="container">



    <router-view />
  </main>
</template>

<style scoped>
.container {
  padding: 24px;
  font-family: system-ui, -apple-system, Segoe UI, Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Liberation Sans', sans-serif;
}
</style>