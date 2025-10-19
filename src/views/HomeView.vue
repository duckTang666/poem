<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import axios from 'axios';
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
  { name: '李白' },
  { name: '苏轼' },
  { name: '李清照' },
  { name: '爱国诗' },
  { name: '思乡诗' },
  { name: '写景诗' }
]);

// 激活的分类索引
const activeCategory = ref(0);

import type { PoemRecord } from '../data/repository';

// 诗词列表数据
const poems = ref<PoemRecord[]>([]);
const loading = ref(true);

onMounted(async () => {
  try {
    loading.value = true;
    const data = await getAllPoems();
    poems.value = data;
    
    // 检查数据是否为空
    if (data.length === 0) {
      console.warn('获取到的诗词数据为空，请检查Supabase连接和数据');
    }
  } catch (e) {
    console.error('加载诗词失败:', e);
    // 回退到本地示例数据
    poems.value = [
      {
        id: 1,
        title: '静夜思',
        author: '李白',
        dynasty: '唐代',
        content: '床前明月光，疑是地上霜。举头望明月，低头思故乡。',
        favorite: false
      }
    ];
  } finally {
    loading.value = false;
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

// AI诗歌搜索功能
const searchInput = ref('');
const searchResults = ref([]);
const searchLoading = ref(false);

const searchPoetry = async () => {
  if (!searchInput.value.trim()) {
    searchResults.value = [{ error: '请输入搜索内容' }];
    return;
  }
  
  searchLoading.value = true;
  searchResults.value = [];
  
  try {
    const response = await axios.post(
      'https://ducktang.app.n8n.cloud/webhook-test/ai-chat',
      { 
        query: searchInput.value,
        type: 'poetry_search'
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    );
    
    // 处理不同格式的响应
    if (response.data?.results) {
      searchResults.value = response.data.results;
    } else if (Array.isArray(response.data)) {
      searchResults.value = response.data;
    } else {
      searchResults.value = [response.data];
    }
  } catch (error) {
    console.error('搜索请求失败:', error);
    searchResults.value = [{ 
      error: error.response?.data?.message || '请求失败，请稍后重试'
    }];
  } finally {
    searchLoading.value = false;
  }
};

// AI诗词鉴赏功能
const aiInput = ref('');
const aiResult = ref('');
const aiLoading = ref(false);

const submitPoetry = async () => {
  if (!aiInput.value.trim()) return;
  
  aiLoading.value = true;
  aiResult.value = '';
  
  try {
    const response = await axios.post(
      'https://ducktang.app.n8n.cloud/webhook-test/ai-chat/poetry',
      { poetry: aiInput.value },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    // 解析不同格式的响应
    if (typeof response.data === 'string') {
      aiResult.value = response.data;
    } else if (response.data?.message) {
      aiResult.value = response.data.message;
    } else if (response.data?.choices?.[0]?.message?.content) {
      aiResult.value = response.data.choices[0].message.content;
    } else {
      aiResult.value = '收到响应但无法解析结果';
    }
  } catch (error) {
    aiResult.value = '鉴赏失败，请稍后再试';
    console.error('AI鉴赏出错:', error);
    if (error.response) {
      console.error('响应状态:', error.response.status);
      console.error('响应数据:', error.response.data);
    }
  } finally {
    aiLoading.value = false;
  }
};
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

    <!-- AI诗歌搜索区 -->
    <div class="search-section" style="margin-top: 20px;">
      <div style="max-width: 800px; margin: 0 auto; background: white; padding: 20px; border-radius: 8px;">
        <h3 style="color: #4a2c2a; margin-bottom: 16px;">AI诗歌搜索</h3>
        <div style="display: flex; gap: 10px;">
          <input
            v-model="searchInput"
            style="flex:1; padding:12px; border:1px solid #ddd; border-radius:8px;"
            placeholder="输入诗句或关键词..."
            @keyup.enter="searchPoetry"
          />
          <button 
            @click="searchPoetry"
            style="padding:0 20px; background:#6b4a3e; color:white; border:none; border-radius:8px;"
          >
            {{ searchLoading ? '搜索中...' : '搜索' }}
          </button>
        </div>
        
        <div v-if="searchResults.length > 0" style="margin-top: 20px;">
          <div 
            v-for="(item, index) in searchResults" 
            :key="index" 
            style="padding:16px; margin-bottom:12px; background:#f9f6f1; border-radius:8px;"
          >
            <h4 v-if="item.title" style="color:#4a2c2a; margin-bottom:8px;">{{ item.title }}</h4>
            <p v-if="item.author" style="color:#6b4a3e;">{{ item.author }}</p>
            <p v-if="item.content" style="color:#5d4037; margin-top:8px; white-space:pre-line;">{{ item.content }}</p>
            <p v-if="item.error" style="color:#c00;">{{ item.error }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- 诗词鉴赏AI交互区 -->
    <div class="ai-section">
      <div class="ai-container">
        <h3 class="ai-title">诗词鉴赏AI助手</h3>
        <textarea 
          v-model="aiInput" 
          class="ai-input" 
          placeholder="请输入您想鉴赏的诗词..."
          rows="3"
        ></textarea>
        <button class="ai-submit" @click="submitPoetry">开始鉴赏</button>
        <div v-if="aiLoading" class="ai-loading">AI正在分析中...</div>
        <div v-if="aiResult" class="ai-result">
          <h4>鉴赏结果：</h4>
          <div class="ai-content">{{ aiResult }}</div>
        </div>
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
    <div v-if="loading" class="loading">加载诗词中...</div>
    <div v-else class="poem-list">
      <div v-if="poems.length === 0" class="empty">
        <p>暂无诗词数据</p>
        <button @click="router.push({name:'category',params:{name:'唐诗'}})">浏览唐诗</button>
      </div>
      <div v-else class="poem-card" v-for="(poem, index) in poems" :key="index" @click="router.push({ name: 'poem-detail', params: { title: poem.title } })">
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
/* 搜索区样式 */
.search-section {
  padding: 20px;
  background: linear-gradient(to right, #f0f7ff, #e6f0ff);
  border-bottom: 1px solid #d0e0ff;
}

.search-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.search-title {
  color: #2c4a7a;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.search-input-group {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}

.search-input {
  flex: 1;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 14px;
}

.search-submit {
  background: linear-gradient(to right, #4a6b9a, #3a5a8a);
  color: white;
  border: none;
  padding: 0 20px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.search-submit:hover {
  opacity: 0.9;
}

.search-results {
  margin-top: 16px;
}

.search-result-item {
  padding: 12px;
  margin-bottom: 12px;
  background: #f9f9f9;
  border-radius: 8px;
  border-left: 4px solid #4a6b9a;
}

.search-meta {
  color: #666;
  font-size: 13px;
  margin: 8px 0;
}

.search-content {
  color: #333;
  line-height: 1.6;
  white-space: pre-line;
}

.search-error {
  color: #c00;
}

/* AI交互区样式 */
.ai-section {
  padding: 20px;
  background: linear-gradient(to right, #f9f6f1, #f0e6d2);
  border-bottom: 1px solid #e0d0b1;
}

.ai-container {
  max-width: 800px;
  margin: 0 auto;
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
}

.ai-title {
  color: #4a2c2a;
  margin-bottom: 16px;
  font-size: 18px;
  font-weight: 600;
}

.ai-input {
  width: 100%;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 8px;
  margin-bottom: 12px;
  font-size: 14px;
  resize: none;
}

.ai-submit {
  background: linear-gradient(to right, #6b4a3e, #8c6b5a);
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s;
}

.ai-submit:hover {
  opacity: 0.9;
}

.ai-loading {
  text-align: center;
  padding: 12px;
  color: #666;
}

.ai-result {
  margin-top: 16px;
  padding: 12px;
  background: #f9f6f1;
  border-radius: 8px;
}

.ai-result h4 {
  color: #4a2c2a;
  margin-bottom: 8px;
  font-size: 16px;
}

.ai-content {
  color: #5d4037;
  line-height: 1.6;
  white-space: pre-line;
}

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

.loading, .empty {
  text-align: center;
  padding: 40px;
  color: #666;
}

.empty button {
  margin-top: 16px;
  padding: 8px 16px;
  background: #4a2c2a;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
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