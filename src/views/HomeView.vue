<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { useFavoritesStore } from '../stores/favorites';
import { getAllPoems, toggleFavorite } from '../data/repository';

// 轮播图数据
const carouselItems = ref([
  {
    title: '静夜思',
    author: '李白',
    dynasty: '唐代',
    preview: '床前明月光，疑是地上霜。',
    bgImage: 'https://ai-public.mastergo.com/ai/img_res/7ab50d73d71a134e9e055f4f5add4b11.jpg'
  },
  {
    title: '水调歌头',
    author: '苏轼',
    dynasty: '宋代',
    preview: '明月几时有？把酒问青天。',
    bgImage: 'https://ai-public.mastergo.com/ai/img_res/790988e6fcdb2a724fab2beb7bce3a92.jpg'
  },
  {
    title: '春晓',
    author: '孟浩然',
    dynasty: '唐代',
    preview: '春眠不觉晓，处处闻啼鸟。',
    bgImage: 'https://ai-public.mastergo.com/ai/img_res/c7a6ca3ebf7247a2a7ed9a29aa01149b.jpg'
  }
]);

// 分类导航数据
const categories = ref([
  { name: '唐诗' },
  { name: '宋词' },
  { name: '元曲' },
  { name: '现代诗' },
  { name: '古风' },
  { name: '乐府' }
]);

// 激活的分类索引
const activeCategory = ref(0);

import type { PoemRecord } from '../data/repository';

// 诗词列表数据（改为异步加载后端数据）
const poems = ref<PoemRecord[]>([]);
onMounted(async () => {
  try {
    poems.value = await getAllPoems();
  } catch (e) {
    console.error('加载诗词失败', e);
  }
});

// 底部导航数据
const bottomNavItems = ref([
  { icon: '🏠', text: '首页' },
  { icon: '📋', text: '分类' },
  { icon: '❤️', text: '收藏' },
  { icon: '👤', text: '我的' }
]);

// 激活的底部导航索引
const activeTab = ref(0);

// 轮播状态
const currentSlide = ref(0);
let timer: number | null = null;

function startAutoplay() {
  stopAutoplay();
  timer = window.setInterval(() => {
    currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length;
  }, 5000);
}
function stopAutoplay() {
  if (timer) {
    clearInterval(timer);
    timer = null;
  }
}

const router = useRouter();
const fav = useFavoritesStore();

const handleSearch = () => {
  router.push({ name: 'search' });
};

const selectCategory = (index: number) => {
  activeCategory.value = index;
  const name = categories.value[index].name;
  router.push({ name: 'category', params: { name } });
};

const switchTab = (index: number) => {
  activeTab.value = index;
  const map = ['home', 'category', 'favorites', 'profile'];
  router.push({ name: map[index] });
};

onMounted(startAutoplay);
onBeforeUnmount(stopAutoplay);
</script>

<template>
  <div class="page-container">
    <TopNav title="诗词鉴赏" @search="handleSearch" @back="router.push({name:'home'})" />

    <!-- 轮播推荐区 -->
    <div class="carousel-section" @mouseenter="stopAutoplay" @mouseleave="startAutoplay">
      <div
        class="carousel-swiper"
        :style="{ transform: `translateX(-${currentSlide * 100}%)` }"
      >
        <div v-for="(item, index) in carouselItems" :key="index" class="carousel-item">
          <img class="carousel-bg" :src="item.bgImage" alt="背景图" />
          <div class="carousel-content">
            <div class="carousel-poem-title">{{ item.title }}</div>
            <div class="carousel-poem-author">{{ item.author }} · {{ item.dynasty }}</div>
            <div class="carousel-poem-preview">{{ item.preview }}</div>
          </div>
        </div>
      </div>

      <!-- 指示点 -->
      <div class="indicators">
        <span
          v-for="(item, idx) in carouselItems"
          :key="idx"
          class="dot"
          :class="{ active: currentSlide === idx }"
          @click="currentSlide = idx"
        ></span>
      </div>
    </div>

    <!-- 分类导航栏 -->
    <div class="category-scroll">
      <div class="category-container">
        <div
          v-for="(category, index) in categories"
          :key="index"
          class="category-item"
          :class="{ active: activeCategory === index }"
          @click="selectCategory(index)"
        >
          <span class="category-text">{{ category.name }}</span>
        </div>
      </div>
    </div>

    <!-- 热门诗词列表 -->
    <div class="poem-list">
      <div class="poem-card" v-for="(poem, index) in poems" :key="index" @click="router.push({ name: 'poem-detail', params: { title: poem.title } })">
        <div class="card-content">
          <div class="poem-title">{{ poem.title }}</div>
          <div class="poem-meta">
            <span class="poem-author">{{ poem.author }}</span>
            <span class="poem-dynasty">{{ poem.dynasty }}</span>
          </div>
          <div class="poem-preview">{{ ((poem.appreciation || poem.content) || '').slice(0, 40) + '…' }}</div>
        </div>
        <img v-if="poem.image" class="poem-image" :src="poem.image" alt="诗图" />
        <button class="fav-btn" @click.stop="toggleFavorite(poem as any)">
          {{ fav.has(poem.title) ? '已收藏' : '收藏' }}
        </button>
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
  background-color: #f9f6f1;
}

/* 顶部导航栏 */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
  background: linear-gradient(to right, #4a2c2a, #6b3e3a);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-title {
  font-size: 20px;
  font-weight: 600;
  color: #ffffff;
  letter-spacing: 1px;
}

.search-btn {
  width: 36px;
  height: 36px;
  border-radius: 8px;
  border: none;
  background: rgba(255, 255, 255, 0.16);
  color: #fff;
  cursor: pointer;
}

/* 轮播推荐区 */
.carousel-section {
  position: relative;
  height: 260px;
  overflow: hidden;
  background: #000;
}

.carousel-swiper {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 1s ease;
}

.carousel-item {
  position: relative;
  min-width: 100%;
  height: 100%;
  border-radius: 12px;
  overflow: hidden;
}

.carousel-bg {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: blur(6px) brightness(0.85);
}

.carousel-content {
  position: absolute;
  inset: 0;
  display: flex;
  flex-direction: column;
  justify-content: center;
  padding: 0 24px;
  background: rgba(0, 0, 0, 0.28);
  backdrop-filter: blur(6px);
  box-sizing: border-box;
  text-align: center;
}

.carousel-poem-title {
  font-size: 22px;
  font-weight: 600;
  color: #ffffff;
  margin-bottom: 8px;
}

.carousel-poem-author {
  font-size: 14px;
  color: #f0e6d2;
  margin-bottom: 12px;
}

.carousel-poem-preview {
  font-size: 14px;
  color: #ffffff;
  line-height: 22px;
}

/* 指示点 */
.indicators {
  position: absolute;
  bottom: 10px;
  width: 100%;
  display: flex;
  justify-content: center;
  gap: 6px;
}
.dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.5);
  cursor: pointer;
}
.dot.active {
  background: #ffffff;
}

/* 分类导航栏 */
.category-scroll {
  height: 80px;
  padding: 12px 0;
  background-color: #f9f6f1;
  border-bottom: 1px solid #ede0d4;
  overflow-x: auto;
}
.category-container {
  display: inline-flex;
  padding: 0 12px;
  gap: 12px;
}
.category-item {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 16px;
  height: 40px;
  background-color: #ffffff;
  border-radius: 20px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
  white-space: nowrap;
}
.category-item.active {
  background: linear-gradient(to right, #6b4a3e, #8c6b5a);
  box-shadow: 0 6px 16px rgba(107, 74, 62, 0.3);
}
.category-text {
  font-size: 14px;
  color: #5d4037;
}
.category-item.active .category-text {
  color: #ffffff;
  font-weight: 500;
}

/* 热门诗词列表 */
.poem-list {
  flex: 1;
  padding: 12px;
  box-sizing: border-box;
}
.poem-card {
  display: flex;
  background-color: #ffffff;
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.05);
  transition: all 0.3s ease;
}
.poem-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
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
  background-color: #f5f0e1;
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
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}
.fav-btn {
  height: 32px;
  border: none;
  border-radius: 8px;
  background: #eee;
  color: #333;
  cursor: pointer;
  padding: 0 12px;
}

/* 底部导航栏由组件 BottomNav 提供样式 */
</style>