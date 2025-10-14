<template>
  <div class="page-container">
    <!-- 顶部导航栏 -->
    <div class="top-nav">
      <span class="nav-title">诗词鉴赏</span>
      <div class="search-icon" @click="handleSearch">🔍</div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <div class="loading-text">加载中...</div>
    </div>
    <div v-else-if="error" class="error-container">
      <div class="error-text">{{ error }}</div>
      <button @click="loadPoems" class="retry-btn">重试</button>
    </div>

    <!-- 主要内容 -->
    <template v-else>
      <!-- 轮播推荐区 -->
      <div class="carousel-section">
        <div class="carousel-container">
          <div v-for="(item, index) in carouselItems" :key="index" 
               class="carousel-item" 
               :class="{ active: currentSlide === index }"
               @click="goToPoem(item)">
            <div class="carousel-bg" :style="{ backgroundImage: `url(${item.bgImage})` }"></div>
            <div class="carousel-content">
              <div class="carousel-poem-title">{{ item.title }}</div>
              <div class="carousel-poem-author">{{ item.author }} · {{ item.dynasty }}</div>
              <div class="carousel-poem-preview">{{ item.preview }}</div>
            </div>
          </div>
        </div>
        <div class="carousel-indicators">
          <span v-for="(item, index) in carouselItems" :key="index" 
                class="indicator" 
                :class="{ active: currentSlide === index }"
                @click="currentSlide = index"></span>
        </div>
      </div>

      <!-- 分类导航栏 -->
      <div class="category-scroll">
        <div class="category-container">
          <div v-for="(category, index) in categories" :key="index" 
               class="category-item"
               :class="{ active: activeCategory === index }"
               @click="selectCategory(index)">
            <span class="category-text">{{ category.name }}</span>
          </div>
        </div>
      </div>

      <!-- 热门诗词列表 -->
      <div class="poem-list">
        <div class="poem-card" v-for="poem in filteredPoems" :key="poem.id" @click="showPoemDetail(poem)">
          <div class="card-content">
            <div class="poem-title">{{ poem.title }}</div>
            <div class="poem-meta">
              <span class="poem-author">{{ poem.author }}</span>
              <span class="poem-dynasty">{{ poem.dynasty }}</span>
            </div>
            <div class="poem-preview">{{ getPreview(poem.content) }}</div>
            <div class="poem-actions">
              <button @click.stop="toggleFavorite(poem)" 
                      class="favorite-btn" 
                      :class="{ active: poem.favorite }">
                {{ poem.favorite ? '💖' : '🤍' }} {{ poem.favorite ? '已收藏' : '收藏' }}
              </button>
            </div>
          </div>
          <div class="poem-image" :style="{ backgroundImage: `url(${getPoemImage(poem)})` }"></div>
        </div>
      </div>
    </template>

    <!-- 底部导航栏 -->
    <div class="bottom-nav">
      <div v-for="(item, index) in bottomNavItems" :key="index" 
           class="nav-item" 
           :class="{ active: activeTab === index }"
           @click="switchTab(index)">
        <span class="nav-icon">{{ item.icon }}</span>
        <span class="nav-text">{{ item.text }}</span>
      </div>
    </div>

    <!-- 诗词详情弹窗 -->
    <div v-if="selectedPoem" class="poem-modal" @click="closePoemDetail">
      <div class="modal-content" @click.stop>
        <div class="modal-header">
          <h2>{{ selectedPoem.title }}</h2>
          <button @click="closePoemDetail" class="close-btn">✕</button>
        </div>
        <div class="modal-body">
          <div class="poem-info">
            <span class="author">{{ selectedPoem.author }}</span>
            <span class="dynasty">{{ selectedPoem.dynasty }}</span>
          </div>
          <div class="poem-content">{{ selectedPoem.content }}</div>
          <div v-if="selectedPoem.appreciation" class="poem-appreciation">
            <h4>赏析</h4>
            <p>{{ selectedPoem.appreciation }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import { fetchPoems, togglePoemFavorite, type PoemDTO } from '@/api/poems';
import '@/styles/poem-list.css';

// 数据状态
const poems = ref<PoemDTO[]>([]);
const loading = ref(true);
const error = ref('');
const selectedPoem = ref<PoemDTO | null>(null);

// UI状态
const currentSlide = ref(0);
const activeCategory = ref(0);
const activeTab = ref(0);

// 分类导航数据
const categories = ref([
  { name: "全部", filter: () => true },
  { name: "唐诗", filter: (p: PoemDTO) => p.dynasty === "唐" },
  { name: "宋词", filter: (p: PoemDTO) => p.dynasty === "宋" },
  { name: "已收藏", filter: (p: PoemDTO) => !!p.favorite },
  { name: "李白", filter: (p: PoemDTO) => p.author === "李白" },
  { name: "其他", filter: (p: PoemDTO) => !["唐", "宋"].includes(p.dynasty) }
]);

// 轮播图数据（基于实际诗词数据生成）
const carouselItems = computed(() => {
  const featured = poems.value.slice(0, 3);
  return featured.map(poem => ({
    ...poem,
    preview: getPreview(poem.content),
    bgImage: getPoemImage(poem)
  }));
});

// 底部导航数据
const bottomNavItems = ref([
  { icon: "🏠", text: "首页" },
  { icon: "📚", text: "分类" },
  { icon: "💖", text: "收藏" },
  { icon: "👤", text: "我的" }
]);

// 过滤后的诗词列表
const filteredPoems = computed(() => {
  const filterFn = categories.value[activeCategory.value]?.filter;
  return filterFn ? poems.value.filter(filterFn) : poems.value;
});

// 获取诗词预览文本
const getPreview = (content: string) => {
  return content.length > 50 ? content.substring(0, 50) + '...' : content;
};

// 获取诗词配图
const getPoemImage = (poem: PoemDTO) => {
  const images = [
    "https://ai-public.mastergo.com/ai/img_res/7ab50d73d71a134e9e055f4f5add4b11.jpg",
    "https://ai-public.mastergo.com/ai/img_res/790988e6fcdb2a724fab2beb7bce3a92.jpg",
    "https://ai-public.mastergo.com/ai/img_res/c7a6ca3ebf7247a2a7ed9a29aa01149b.jpg",
    "https://ai-public.mastergo.com/ai/img_res/07a2cddcadbe9cdc3bb84926b9a54577.jpg",
    "https://ai-public.mastergo.com/ai/img_res/135bbaccc77df04113a2253e3ba3e19b.jpg",
    "https://ai-public.mastergo.com/ai/img_res/a0654cd0c3afb4288952efa2d42d5094.jpg",
    "https://ai-public.mastergo.com/ai/img_res/74b98f74d8d66167af7e367105530077.jpg"
  ];
  return images[poem.id % images.length];
};

// 加载诗词数据
async function loadPoems() {
  loading.value = true;
  error.value = '';
  try {
    const res = await fetchPoems();
    if (res.code === 0) {
      poems.value = (res.data || []).map((p) => ({ 
        ...p, 
        favorite: !!p.favorite 
      }));
    } else {
      error.value = res.message || '加载失败';
    }
  } catch (e: any) {
    error.value = e?.message || '网络错误';
  } finally {
    loading.value = false;
  }
}

// 切换收藏状态
async function toggleFavorite(poem: PoemDTO) {
  try {
    const res = await togglePoemFavorite(poem.id);
    if (res.code === 0) {
      poem.favorite = !!res.data.favorite;
    }
  } catch (e) {
    console.error(e);
  }
}

// 事件处理
const handleSearch = () => {
  console.log("跳转到搜索页面");
};

const selectCategory = (index: number) => {
  activeCategory.value = index;
};

const switchTab = (index: number) => {
  activeTab.value = index;
  if (index === 2) { // 收藏页
    activeCategory.value = categories.value.findIndex(c => c.name === "已收藏");
  } else if (index === 0) { // 首页
    activeCategory.value = 0;
  }
};

const goToPoem = (poem: PoemDTO) => {
  selectedPoem.value = poem;
};

const showPoemDetail = (poem: PoemDTO) => {
  selectedPoem.value = poem;
};

const closePoemDetail = () => {
  selectedPoem.value = null;
};

// 轮播图自动切换
let carouselTimer: number;
const startCarousel = () => {
  carouselTimer = setInterval(() => {
    if (carouselItems.value.length > 0) {
      currentSlide.value = (currentSlide.value + 1) % carouselItems.value.length;
    }
  }, 5000);
};

const stopCarousel = () => {
  if (carouselTimer) {
    clearInterval(carouselTimer);
  }
};

onMounted(() => {
  loadPoems();
  startCarousel();
});

onUnmounted(() => {
  stopCarousel();
});
</script>

<style scoped>
/* 样式已移至 @/styles/poem-list.css */
</style>