<script setup lang="ts">
import { computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { getAllPoems } from '../data/repository';

const route = useRoute();
const router = useRouter();
const activeName = computed(() => (route.params.name as string) || '全部分类');

import { ref, onMounted } from 'vue';
import type { PoemRecord } from '../data/repository';

const all = ref<PoemRecord[]>([]);
onMounted(async () => {
  try {
    all.value = await getAllPoems();
  } catch (e) {
    console.error('加载分类诗词失败', e);
  }
});
const filtered = computed(() => {
  if (!route.params.name) return all.value;
  const name = route.params.name as string;
  return all.value.filter((p) => {
    if (name === '唐诗') return p.dynasty.includes('唐');
    if (name === '宋词') return p.dynasty.includes('宋');
    if (name === '元曲') return p.dynasty.includes('元');
    if (name === '明诗') return p.dynasty.includes('明');
    if (name === '清诗') return p.dynasty.includes('清');
    if (name === '现代诗') return p.dynasty.includes('近现代');
    if (name === '李白') return p.author === '李白';
    if (name === '苏轼') return p.author === '苏轼';
    if (name === '李清照') return p.author === '李清照';
    if (name === '毛泽东') return p.author === '毛泽东';
    if (name === '徐志摩') return p.author === '徐志摩';
    if (name === '爱国诗') return p.content.includes('国') || p.content.includes('家') || p.appreciation?.includes('爱国');
    if (name === '思乡诗') return p.content.includes('乡') || p.content.includes('家') || p.appreciation?.includes('思乡');
    if (name === '写景诗') return p.content.includes('山') || p.content.includes('水') || p.content.includes('花') || p.content.includes('月');
    return true;
  });
});
</script>

<template>
  <div class="page-container">
    <TopNav :title="`分类：${activeName}`" @search="router.push({name:'search'})" @back="router.push({name:'home'})" />
    <div class="poem-list">
      <div
        class="poem-card"
        v-for="(poem, idx) in filtered"
        :key="idx"
        @click="router.push({ name: 'poem-detail', params: { title: poem.title } })"
      >
        <div class="card-content">
          <div class="poem-title">{{ poem.title }}</div>
          <div class="poem-meta"><span class="poem-author">{{ poem.author }}</span><span class="poem-dynasty">{{ poem.dynasty }}</span></div>
          <div class="poem-preview">{{ ((poem.appreciation || poem.content) || '').slice(0, 40) + '…' }}</div>
        </div>
        <img v-if="poem.image" class="poem-image" :src="poem.image" alt="诗图" />
      </div>
    </div>
    <BottomNav />
  </div>
</template>

<style scoped>
.page-container{display:flex;flex-direction:column;min-height:100vh;background:#f9f6f1}
.poem-list{flex:1;padding:12px;box-sizing:border-box}
.poem-card{display:flex;background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(0,0,0,.05);transition:all .3s ease}
.card-content{flex:1;display:flex;flex-direction:column;padding-right:12px}
.poem-title{font-size:18px;font-weight:600;color:#3e2723;margin-bottom:8px}
.poem-meta{display:flex;gap:10px;margin-bottom:10px}
.poem-author{font-size:14px;color:#6b4a3e;font-weight:500}
.poem-dynasty{font-size:12px;color:#8d6e63;background:#f5f0e1;padding:2px 8px;border-radius:8px}
.poem-preview{font-size:14px;color:#5d4037;line-height:22px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.poem-image{width:100px;height:100px;border-radius:12px;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,.1)}
</style>