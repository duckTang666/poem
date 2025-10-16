<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { getPoemsByCategory } from '../data/repository';
import type { PoemRecord } from '../data/repository';

const route = useRoute();
const router = useRouter();
const activeName = computed(() => (route.params.name as string) || '全部分类');

const poems = ref<PoemRecord[]>([]);
const loading = ref(false);

// 监听分类变化
watch(() => route.params.name, async (newCategory) => {
  if (newCategory) {
    try {
      loading.value = true;
      poems.value = await getPoemsByCategory(newCategory as string);
    } catch (e) {
      console.error('加载分类诗词失败', e);
    } finally {
      loading.value = false;
    }
  }
}, { immediate: true });
</script>

<template>
  <div class="page-container">
    <TopNav :title="`分类：${activeName}`" @search="router.push({name:'search'})" @back="router.push({name:'home'})" />
    
    <div v-if="loading" class="loading">加载中...</div>
    
    <div v-else class="poem-list">
      <div
        class="poem-card"
        v-for="(poem, idx) in poems"
        :key="idx"
        @click="router.push({ name: 'poem-detail', params: { title: poem.title } })"
      >
        <div class="card-content">
          <div class="poem-title">{{ poem.title }}</div>
          <div class="poem-meta">
            <span class="poem-author">{{ poem.author }}</span>
            <span class="poem-dynasty">{{ poem.dynasty }}</span>
          </div>
          <div class="poem-preview">{{ ((poem.appreciation || poem.content) || '').slice(0, 40) + '…' }}</div>
        </div>
        <img v-if="poem.image" class="poem-image" :src="poem.image" alt="诗图" />
      </div>
    </div>
    
    <BottomNav />
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: #f9f6f1;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}

.poem-list {
  flex: 1;
  padding: 12px;
  box-sizing: border-box;
}

.poem-card {
  display: flex;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0,0,0,.05);
  transition: all .3s ease;
}

.card-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding-right: 12px;
}

.poem-title {
  font-size: 18px;
  font-weight: 600;
  color: #3e2723;
  margin-bottom: 8px;
}

.poem-meta {
  display: flex;
  gap: 10px;
  margin-bottom: 10px;
}

.poem-author {
  font-size: 14px;
  color: #6b4a3e;
  font-weight: 500;
}

.poem-dynasty {
  font-size: 12px;
  color: #8d6e63;
  background: #f5f0e1;
  padding: 2px 8px;
  border-radius: 8px;
}

.poem-preview {
  font-size: 14px;
  color: #5d4037;
  line-height: 22px;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.poem-image {
  width: 100px;
  height: 100px;
  border-radius: 12px;
  object-fit: cover;
  box-shadow: 0 4px 12px rgba(0,0,0,.1);
}
</style>