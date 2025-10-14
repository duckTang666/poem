<script setup lang="ts">
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { useRouter } from 'vue-router';
import { useFavoritesStore } from '../stores/favorites';

const router = useRouter();
const fav = useFavoritesStore();

function openDetail(title: string) {
  router.push({ name: 'poem-detail', params: { title } });
}
</script>

<template>
  <div class="page-container">
    <TopNav title="我的收藏" @search="router.push({name:'search'})" @back="router.push({name:'home'})" />

    <div v-if="fav.list.length === 0" class="empty">
      <p>还没有收藏的诗词哦～</p>
      <button class="primary-btn" @click="router.push({name:'home'})">去首页看看</button>
    </div>

    <div v-else class="poem-list">
      <div class="poem-card" v-for="(poem, idx) in fav.list" :key="idx">
        <div class="card-content" @click="openDetail(poem.title)">
          <div class="poem-title">{{ poem.title }}</div>
          <div class="poem-meta">
            <span class="poem-author">{{ poem.author }}</span>
            <span class="poem-dynasty">{{ poem.dynasty }}</span>
          </div>
          <div class="poem-preview">{{ poem.preview }}</div>
        </div>
        <img class="poem-image" :src="poem.image" alt="诗图" />
        <button class="remove-btn" @click="fav.remove(poem.title)">取消收藏</button>
      </div>

      <div class="actions">
        <button class="danger-btn" @click="fav.clear()">清空收藏</button>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<style scoped>
.page-container{display:flex;flex-direction:column;min-height:100vh;background:#f9f6f1}
.empty{padding:24px;text-align:center;color:#6b4a3e}
.primary-btn{height:36px;border:none;border-radius:8px;background:#c69a5c;color:#fff;cursor:pointer;padding:0 16px}
.poem-list{flex:1;padding:12px;box-sizing:border-box}
.poem-card{display:flex;align-items:center;gap:10px;background:#fff;border-radius:12px;padding:16px;margin-bottom:12px;box-shadow:0 4px 16px rgba(0,0,0,.05)}
.card-content{flex:1;display:flex;flex-direction:column;padding-right:12px;cursor:pointer}
.poem-title{font-size:18px;font-weight:600;color:#3e2723;margin-bottom:8px}
.poem-meta{display:flex;gap:10px;margin-bottom:10px}
.poem-author{font-size:14px;color:#6b4a3e;font-weight:500}
.poem-dynasty{font-size:12px;color:#8d6e63;background:#f5f0e1;padding:2px 8px;border-radius:8px}
.poem-preview{font-size:14px;color:#5d4037;line-height:22px;display:-webkit-box;-webkit-box-orient:vertical;-webkit-line-clamp:2;overflow:hidden}
.poem-image{width:88px;height:88px;border-radius:12px;object-fit:cover;box-shadow:0 4px 12px rgba(0,0,0,.1)}
.remove-btn{height:32px;border:none;border-radius:8px;background:#eee;color:#333;cursor:pointer;padding:0 12px}
.actions{display:flex;justify-content:flex-end;gap:12px;margin-top:8px}
.danger-btn{height:32px;border:none;border-radius:8px;background:#c94f4f;color:#fff;cursor:pointer;padding:0 12px}
</style>