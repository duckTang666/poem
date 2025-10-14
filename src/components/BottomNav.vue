<script setup lang="ts">
import { useRouter, useRoute } from 'vue-router';

const router = useRouter();
const route = useRoute();

const items = [
  { name: 'home', icon: '🏠', text: '首页' },
  { name: 'category', icon: '📋', text: '分类' },
  { name: 'favorites', icon: '❤️', text: '收藏' },
  { name: 'profile', icon: '👤', text: '我的' }
];

function go(name: string) {
  router.push({ name });
}
</script>

<template>
  <div class="bottom-nav">
    <div
      v-for="it in items"
      :key="it.name"
      class="nav-item"
      role="button"
      :aria-pressed="route.name === it.name"
      @click="go(it.name)"
    >
      <div class="nav-icon">{{ it.icon }}</div>
      <div class="nav-text" :class="{ active: route.name === it.name }">{{ it.text }}</div>
    </div>
  </div>
</template>

<style scoped>
.bottom-nav{position:sticky;bottom:0;display:flex;justify-content:space-around;align-items:center;height:64px;background:#fff;border-top:1px solid #ede0d4;box-shadow:0 -4px 12px rgba(0,0,0,.05)}
.nav-item{display:flex;flex-direction:column;align-items:center;justify-content:center;padding:6px 0;min-width:56px;cursor:pointer}
.nav-icon{font-size:20px;line-height:20px}
.nav-text{font-size:12px;color:#999;margin-top:6px}
.nav-text.active{color:#c69a5c;font-weight:500}
</style>