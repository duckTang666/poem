<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { poems } from '../data/poems';

const router = useRouter();
const q = ref('');
const results = computed(() =>
  poems.filter(
    (p) =>
      p.title.includes(q.value) ||
      p.author.includes(q.value) ||
      p.dynasty.includes(q.value)
  )
);
function doSearch() {
  if (!q.value.trim()) return;
  const first = results.value[0];
  if (first) {
    router.push({ name: 'poem-detail', params: { title: first.title } });
  }
}
</script>

<template>
  <div class="page-container">
    <TopNav title="搜索诗词" @back="router.push({name:'home'})" :showSearch="false" />
    <div class="content">
      <input
        class="search-input"
        v-model="q"
        type="text"
        placeholder="输入诗词、作者或朝代"
      />
      <button class="primary-btn" @click="doSearch">搜索</button>
    </div>

    <div class="poem-list">
      <div
        class="poem-card"
        v-for="(poem, idx) in results"
        :key="idx"
        @click="router.push({ name: 'poem-detail', params: { title: poem.title } })"
      >
        <div class="card-content">
          <div class="poem-title">{{ poem.title }}</div>
          <div class="poem-meta"><span class="poem-author">{{ poem.author }}</span><span class="poem-dynasty">{{ poem.dynasty }}</span></div>
          <div class="poem-preview">{{ poem.preview }}</div>
        </div>
        <img class="poem-image" :src="poem.image" alt="诗图" />
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<style scoped>
.page-container{display:flex;flex-direction:column;min-height:100vh;background:#f9f6f1}
.content{padding:16px;display:flex;gap:12px;align-items:center}
.search-input{flex:1;height:36px;border-radius:8px;border:1px solid #ddd;padding:0 10px}
.primary-btn{height:36px;border:none;border-radius:8px;background:#c69a5c;color:#fff;cursor:pointer;padding:0 16px}
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