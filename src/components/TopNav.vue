<script setup lang="ts">
defineProps<{
  title: string;
  showSearch?: boolean;
}>();
const emit = defineEmits<{ (e: 'search'): void; (e: 'back'): void }>();
</script>

<template>
  <div class="top-nav">
    <button class="back-btn" @click="emit('back')" aria-label="返回">←</button>
    <div class="nav-title">{{ title }}</div>
    <button
      v-if="showSearch !== false"
      class="search-btn"
      @click="emit('search')"
      aria-label="搜索"
    >
      🔍
    </button>
    <div v-else class="placeholder"></div>
  </div>
</template>

<style scoped>
.top-nav{display:flex;justify-content:space-between;align-items:center;padding:0 20px;height:60px;background:linear-gradient(to right,#4a2c2a,#6b3e3a);box-shadow:0 4px 12px rgba(0,0,0,.1);position:sticky;top:0;z-index:100}
.nav-title{font-size:20px;font-weight:600;color:#fff;letter-spacing:1px}
.search-btn,.back-btn{width:36px;height:36px;border-radius:8px;border:none;background:rgba(255,255,255,.16);color:#fff;cursor:pointer}
.placeholder{width:36px;height:36px}
</style>