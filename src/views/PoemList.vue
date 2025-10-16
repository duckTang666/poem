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
                      :class="{ active: favoritesStore.has(poem.id) }">
                {{ favoritesStore.has(poem.id) ? '💖' : '🤍' }} {{ favoritesStore.has(poem.id) ? '已收藏' : '收藏' }}
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
import { type PoemDTO } from '@/api/poems';
import { supabaseRequest, supabaseUpdate } from '@/api/http';
import '@/styles/poem-list.css';
import { useRouter } from 'vue-router';
import { useFavoritesStore } from '../stores/favorites';

const router = useRouter();
const favoritesStore = useFavoritesStore();

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
  { 
    name: "全部", 
    filter: () => true, 
    query: {},
    route: 'home'
  },
  { 
    name: "收藏", 
    filter: (p: PoemDTO) => p.favorite, 
    query: { favorite: 'eq.true' },
    route: 'favorites'
  },
  // 其他分类...
]);

// 共享的诗词数据获取方法
async function fetchPoemsFromSupabase(filterParams = {}) {
  try {
    const poemsData = await supabaseRequest<PoemDTO>('poems', {
      params: {
        select: '*',
        ...filterParams
      }
    });
    
    if (!poemsData) return [];
    
    return poemsData.map((p: PoemDTO) => ({
      ...p,
      favorite: !!p.favorite
    }));
  } catch (error) {
    console.error('获取诗词失败:', error);
    return [];
  }
}

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
  // 从Supabase获取过滤后的数据
  return poems.value.filter(poem => {
    const category = categories.value[activeCategory.value];
    if (!category) return true;
    
    // 特殊分类处理
    if (category.name === "收藏") {
      return poem.favorite;
    }
    return category.filter(poem);
  });
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
    const currentCategory = categories.value[activeCategory.value];
    const result = await fetchPoemsFromSupabase(currentCategory.query);
    
    if (!result || result.length === 0) {
      throw new Error('没有找到诗词数据');
    }
    
    poems.value = result;
  } catch (e: any) {
    error.value = e?.message || '加载诗词失败';
    console.error('加载诗词错误:', e);
    poems.value = [];
  } finally {
    loading.value = false;
  }
}

// 切换收藏状态
async function toggleFavorite(poem: PoemDTO) {
  const newFavoriteState = !poem.favorite;
  try {
    // 先更新本地状态以获得即时反馈
    poem.favorite = newFavoriteState;
    favoritesStore.toggle(poem.id);
    
    // 同步到Supabase
    const { error } = await supabaseUpdate<PoemDTO>('poems', poem.id, {
      favorite: newFavoriteState
    });

    if (error) throw new Error(error.message);
    
  } catch (error) {
    // 出错时回滚状态
    poem.favorite = !newFavoriteState;
    favoritesStore.toggle(poem.id);
    console.error('收藏操作失败:', error);
    alert('收藏状态更新失败，请重试');
  }
}

// 事件处理
const handleSearch = () => {
  router.push({ name: 'search' });
};

const selectCategory = async (index: number) => {
  activeCategory.value = index;
  await loadPoems(); // 切换分类时重新加载数据
};

const switchTab = (index: number) => {
  activeTab.value = index;
  if (index === 0) { // 首页
    activeCategory.value = 0;
  } else if (index === 1) { // 分类页
    router.push({ name: 'categories' });
  } else if (index === 2) { // 收藏页
    router.push({ name: 'favorites' });
  } else if (index === 3) { // 我的页面
    router.push({ name: 'profile' });
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