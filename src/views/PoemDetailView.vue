<script setup lang="ts">
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { useRoute, useRouter } from 'vue-router';
import { ref, onMounted } from 'vue';
import { getPoemByTitle, toggleFavorite } from '../data/repository';
import { useFavoritesStore } from '../stores/favorites';

const route = useRoute();
const router = useRouter();
const fav = useFavoritesStore();

const poem = ref<any>(null);
onMounted(async () => {
  const title = (route.params.title as string) || '';
  try {
    poem.value = await getPoemByTitle(title);
  } catch (e) {
    console.error('加载诗词详情失败', e);
  }
});
</script>

<template>
  <div class="page-container">
    <TopNav :title="poem?.title || '诗词详情'" @search="router.push({name:'search'})" @back="router.push({name:'home'})" />

    <div v-if="poem" class="detail">
      <img v-if="(poem as any).image" class="cover" :src="(poem as any).image" :alt="poem?.title" />
      <div class="meta">
        <div class="title">{{ poem.title }}</div>
        <div class="sub">{{ poem.author }} · {{ poem.dynasty }}</div>
        <div class="actions">
          <button class="primary-btn" @click="toggleFavorite(poem as any)">
            {{ fav.has(poem.title) ? '取消收藏' : '收藏' }}
          </button>
        </div>
      </div>

      <div class="section">
        <div class="section-title">原文</div>
        <div class="content-text">{{ poem.content }}</div>
      </div>

      <div v-if="poem.appreciation" class="section">
        <div class="section-title">赏析</div>
        <div class="content-text">{{ poem.appreciation }}</div>
      </div>
    </div>

    <div v-else class="empty">
      <p>未找到该诗词详情。</p>
      <button class="primary-btn" @click="router.push({name:'home'})">返回首页</button>
    </div>

    <BottomNav />
  </div>
</template>

<style scoped>
.page-container{display:flex;flex-direction:column;min-height:100vh;background:#f9f6f1}
.detail{display:flex;flex-direction:column;gap:12px;padding:16px}
.cover{width:100%;height:180px;object-fit:cover;border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,.08)}
.meta .title{font-size:22px;font-weight:700;color:#3e2723}
.meta .sub{font-size:14px;color:#6b4a3e}
.actions{margin-top:8px}
.section{background:#fff;border-radius:12px;padding:12px;box-shadow:0 4px 16px rgba(0,0,0,.05)}
.section-title{font-weight:600;color:#3e2723;margin-bottom:8px}
.content-text{font-size:14px;color:#5d4037;line-height:24px;white-space:pre-wrap}
.empty{padding:24px;text-align:center;color:#6b4a3e}
.primary-btn{height:36px;border:none;border-radius:8px;background:#c69a5c;color:#fff;cursor:pointer;padding:0 16px}
</style>