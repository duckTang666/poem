<script setup lang="ts">
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { useRouter } from 'vue-router';
import { useFavoritesStore } from '../stores/favorites';
import { ref, computed, onMounted } from 'vue';
import { getAllPoems } from '../data/repository';
import type { PoemRecord } from '../data/repository';

const router = useRouter();
const fav = useFavoritesStore();
const allPoems = ref<PoemRecord[]>([]);
const loading = ref(true);

// 获取收藏的诗词详细信息
const favoritePoems = computed(() => {
  return allPoems.value.filter(poem => fav.list.includes(poem.id));
});

// 统计信息
const stats = computed(() => {
  const total = favoritePoems.value.length;
  const dynastyCount = new Map();
  favoritePoems.value.forEach(poem => {
    dynastyCount.set(poem.dynasty, (dynastyCount.get(poem.dynasty) || 0) + 1);
  });
  
  return {
    total,
    dynastyCount: Array.from(dynastyCount.entries()).sort((a, b) => b[1] - a[1])
  };
});

onMounted(async () => {
  try {
    allPoems.value = await getAllPoems();
  } catch (e) {
    console.error('加载诗词数据失败', e);
  } finally {
    loading.value = false;
  }
});

function openDetail(poem: PoemRecord) {
  router.push({ name: 'poem-detail', params: { title: poem.title } });
}

function removeFavorite(poemId: number) {
  fav.remove(poemId);
}

function clearAll() {
  if (confirm('确定要清空所有收藏吗？')) {
    fav.clear();
  }
}

function goToCategory(dynasty: string) {
  router.push({ name: 'category', params: { name: dynasty } });
}
</script>

<template>
  <div class="page-container">
    <TopNav title="我的收藏" @search="router.push({name:'search'})" @back="router.push({name:'poems'})" />

    <div class="content">
      <!-- 加载状态 -->
      <div v-if="loading" class="loading-container">
        <div class="loading-spinner"></div>
        <div class="loading-text">加载中...</div>
      </div>

      <!-- 空状态 -->
      <div v-else-if="favoritePoems.length === 0" class="empty-state">
        <div class="empty-icon">💖</div>
        <div class="empty-title">还没有收藏任何诗词</div>
        <div class="empty-desc">去发现一些美好的诗词吧</div>
        <div class="empty-actions">
          <button @click="router.push({name:'poems'})" class="explore-btn">
            <span class="btn-icon">🏠</span>
            回到首页
          </button>
          <button @click="router.push({name:'categories'})" class="category-btn">
            <span class="btn-icon">📚</span>
            浏览分类
          </button>
        </div>
      </div>

      <!-- 收藏内容 -->
      <template v-else>
        <!-- 统计信息卡片 -->
        <div class="stats-card">
          <h3>📊 收藏统计</h3>
          <div class="stats-overview">
            <div class="stat-item">
              <div class="stat-number">{{ stats.total }}</div>
              <div class="stat-label">收藏诗词</div>
            </div>
            <div class="stat-item">
              <div class="stat-number">{{ stats.dynastyCount.length }}</div>
              <div class="stat-label">涉及朝代</div>
            </div>
          </div>
          <div class="dynasty-distribution">
            <div class="distribution-title">朝代分布</div>
            <div class="dynasty-tags">
              <div v-for="[dynasty, count] in stats.dynastyCount.slice(0, 4)" 
                   :key="dynasty" 
                   class="dynasty-tag"
                   @click="goToCategory(dynasty)">
                {{ dynasty }} ({{ count }})
              </div>
            </div>
          </div>
        </div>

        <!-- 诗词列表 -->
        <div class="poems-section">
          <div class="section-header">
            <h3>💖 收藏的诗词</h3>
            <button @click="clearAll" class="clear-btn">清空收藏</button>
          </div>
          
          <div class="poem-grid">
            <div v-for="poem in favoritePoems" :key="poem.id" class="poem-card">
              <div class="card-header">
                <div class="poem-title" @click="openDetail(poem)">{{ poem.title }}</div>
                <button @click="removeFavorite(poem.id)" class="remove-btn" title="取消收藏">
                  💔
                </button>
              </div>
              
              <div class="poem-meta">
                <span class="poem-author">{{ poem.author }}</span>
                <span class="poem-dynasty">{{ poem.dynasty }}</span>
              </div>
              
              <div class="poem-content" @click="openDetail(poem)">
                {{ poem.content.length > 60 ? poem.content.substring(0, 60) + '...' : poem.content }}
              </div>
              
              <div v-if="poem.appreciation" class="poem-appreciation">
                <div class="appreciation-label">赏析</div>
                <div class="appreciation-text">
                  {{ poem.appreciation.length > 80 ? poem.appreciation.substring(0, 80) + '...' : poem.appreciation }}
                </div>
              </div>
              
              <div class="card-actions">
                <button @click="openDetail(poem)" class="read-btn">
                  <span class="btn-icon">👁️</span>
                  阅读全文
                </button>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>

    <BottomNav />
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.content {
  flex: 1;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

/* 加载状态 */
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
}

.loading-spinner {
  width: 40px;
  height: 40px;
  border: 3px solid #e3f2fd;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-bottom: 16px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #7f8c8d;
  font-size: 16px;
}

/* 空状态 */
.empty-state {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 60px 30px;
  text-align: center;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.empty-icon {
  font-size: 80px;
  margin-bottom: 24px;
  opacity: 0.8;
}

.empty-title {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 12px;
}

.empty-desc {
  font-size: 16px;
  color: #7f8c8d;
  margin-bottom: 32px;
  line-height: 1.5;
}

.empty-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
}

.explore-btn, .category-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  border: none;
  border-radius: 25px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0,0,0,0.1);
}

.explore-btn {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
}

.category-btn {
  background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
  color: white;
}

.explore-btn:hover, .category-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(0,0,0,0.15);
}

/* 统计卡片 */
.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(102, 126, 234, 0.3);
}

.stats-card h3 {
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
}

.stats-overview {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
  margin-bottom: 24px;
}

.stat-item {
  text-align: center;
  background: rgba(255,255,255,0.15);
  border-radius: 15px;
  padding: 20px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 32px;
  font-weight: 700;
  margin-bottom: 8px;
}

.stat-label {
  font-size: 14px;
  opacity: 0.9;
}

.dynasty-distribution {
  border-top: 1px solid rgba(255,255,255,0.2);
  padding-top: 20px;
}

.distribution-title {
  font-size: 16px;
  font-weight: 600;
  margin-bottom: 12px;
  opacity: 0.9;
}

.dynasty-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.dynasty-tag {
  background: rgba(255,255,255,0.2);
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
  backdrop-filter: blur(10px);
}

.dynasty-tag:hover {
  background: rgba(255,255,255,0.3);
  transform: scale(1.05);
}

/* 诗词部分 */
.poems-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 20px;
  padding: 24px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.section-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

.clear-btn {
  padding: 8px 16px;
  background: linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(255, 107, 107, 0.3);
}

.clear-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(255, 107, 107, 0.4);
}

/* 诗词网格 */
.poem-grid {
  display: grid;
  gap: 16px;
}

.poem-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 6px 25px rgba(0,0,0,0.08);
  transition: all 0.3s ease;
  border: 1px solid rgba(255,255,255,0.2);
}

.poem-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 35px rgba(0,0,0,0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 12px;
}

.poem-title {
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
  cursor: pointer;
  flex: 1;
  transition: color 0.3s ease;
}

.poem-title:hover {
  color: #3498db;
}

.remove-btn {
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  padding: 4px;
  border-radius: 50%;
  transition: all 0.3s ease;
  opacity: 0.7;
}

.remove-btn:hover {
  opacity: 1;
  transform: scale(1.2);
  background: rgba(255, 107, 107, 0.1);
}

.poem-meta {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.poem-author {
  font-size: 14px;
  color: #e74c3c;
  font-weight: 600;
  background: rgba(231, 76, 60, 0.1);
  padding: 4px 12px;
  border-radius: 15px;
}

.poem-dynasty {
  font-size: 14px;
  color: #3498db;
  font-weight: 600;
  background: rgba(52, 152, 219, 0.1);
  padding: 4px 12px;
  border-radius: 15px;
}

.poem-content {
  font-size: 16px;
  color: #34495e;
  line-height: 1.8;
  margin-bottom: 16px;
  cursor: pointer;
  transition: color 0.3s ease;
}

.poem-content:hover {
  color: #2c3e50;
}

.poem-appreciation {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  padding: 16px;
  border-radius: 12px;
  margin-bottom: 16px;
}

.appreciation-label {
  font-size: 12px;
  font-weight: 600;
  color: #8b4513;
  margin-bottom: 8px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.appreciation-text {
  font-size: 14px;
  color: #5d4037;
  line-height: 1.6;
  font-style: italic;
}

.card-actions {
  display: flex;
  justify-content: flex-end;
}

.read-btn {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 16px;
  background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
  color: white;
  border: none;
  border-radius: 20px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(79, 172, 254, 0.3);
}

.read-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(79, 172, 254, 0.4);
}

.btn-icon {
  font-size: 14px;
}

/* 响应式设计 */
@media (min-width: 768px) {
  .poem-grid {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .stats-overview {
    grid-template-columns: repeat(4, 1fr);
  }
}

@media (min-width: 1024px) {
  .poem-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>