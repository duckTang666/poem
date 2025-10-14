<template>
  <div class="page-container">
    <TopNav title="诗词分类" @search="router.push({name:'search'})" @back="router.push({name:'home'})" />
    
    <div class="content">
      <!-- 朝代分类 -->
      <div class="category-section">
        <h2 class="section-title">📚 按朝代分类</h2>
        <div class="category-grid">
          <div v-for="dynasty in dynastyCategories" :key="dynasty.name" 
               class="category-card"
               @click="goToCategory(dynasty.name)">
            <div class="card-icon">{{ dynasty.icon }}</div>
            <div class="card-content">
              <div class="card-title">{{ dynasty.name }}</div>
              <div class="card-desc">{{ dynasty.desc }}</div>
              <div class="card-count">{{ getCount(dynasty.filter) }}首</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 诗人分类 -->
      <div class="category-section">
        <h2 class="section-title">✍️ 著名诗人</h2>
        <div class="poet-grid">
          <div v-for="poet in poetCategories" :key="poet.name"
               class="poet-card"
               @click="goToCategory(poet.name)">
            <div class="poet-avatar" :style="{ backgroundImage: `url(${poet.avatar})` }"></div>
            <div class="poet-info">
              <div class="poet-name">{{ poet.name }}</div>
              <div class="poet-period">{{ poet.period }}</div>
              <div class="poet-count">{{ getCount(poet.filter) }}首作品</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 主题分类 -->
      <div class="category-section">
        <h2 class="section-title">🎨 按主题分类</h2>
        <div class="theme-grid">
          <div v-for="theme in themeCategories" :key="theme.name"
               class="theme-card"
               @click="goToCategory(theme.name)">
            <div class="theme-bg" :style="{ background: theme.gradient }">
              <div class="theme-icon">{{ theme.icon }}</div>
            </div>
            <div class="theme-info">
              <div class="theme-name">{{ theme.name }}</div>
              <div class="theme-desc">{{ theme.desc }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 特色推荐 -->
      <div class="category-section">
        <h2 class="section-title">⭐ 特色推荐</h2>
        <div class="special-grid">
          <div v-for="special in specialCategories" :key="special.name"
               class="special-card"
               @click="goToCategory(special.name)">
            <div class="special-header" :style="{ background: special.color }">
              <div class="special-icon">{{ special.icon }}</div>
              <div class="special-badge">{{ special.badge }}</div>
            </div>
            <div class="special-content">
              <div class="special-title">{{ special.name }}</div>
              <div class="special-desc">{{ special.desc }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { getAllPoems } from '../data/repository';
import type { PoemRecord } from '../data/repository';

const router = useRouter();
const allPoems = ref<PoemRecord[]>([]);

// 朝代分类
const dynastyCategories = ref([
  {
    name: '唐诗',
    icon: '🏛️',
    desc: '盛唐气象，诗歌黄金时代',
    filter: (p: PoemRecord) => p.dynasty.includes('唐')
  },
  {
    name: '宋词',
    icon: '🌸',
    desc: '婉约豪放，词韵悠长',
    filter: (p: PoemRecord) => p.dynasty.includes('宋')
  },
  {
    name: '元曲',
    icon: '🎭',
    desc: '曲韵天成，雅俗共赏',
    filter: (p: PoemRecord) => p.dynasty.includes('元')
  },
  {
    name: '明诗',
    icon: '🏮',
    desc: '明代诗风，继承创新',
    filter: (p: PoemRecord) => p.dynasty.includes('明')
  },
  {
    name: '清诗',
    icon: '🎋',
    desc: '清代诗韵，多元并存',
    filter: (p: PoemRecord) => p.dynasty.includes('清')
  },
  {
    name: '现代诗',
    icon: '🌟',
    desc: '现代新韵，时代之声',
    filter: (p: PoemRecord) => p.dynasty.includes('近现代')
  }
]);

// 诗人分类
const poetCategories = ref([
  {
    name: '李白',
    period: '唐代 · 诗仙',
    avatar: 'https://ai-public.mastergo.com/ai/img_res/7ab50d73d71a134e9e055f4f5add4b11.jpg',
    filter: (p: PoemRecord) => p.author === '李白'
  },
  {
    name: '苏轼',
    period: '宋代 · 文豪',
    avatar: 'https://ai-public.mastergo.com/ai/img_res/790988e6fcdb2a724fab2beb7bce3a92.jpg',
    filter: (p: PoemRecord) => p.author === '苏轼'
  },
  {
    name: '李清照',
    period: '宋代 · 词人',
    avatar: 'https://ai-public.mastergo.com/ai/img_res/c7a6ca3ebf7247a2a7ed9a29aa01149b.jpg',
    filter: (p: PoemRecord) => p.author === '李清照'
  },
  {
    name: '毛泽东',
    period: '近现代 · 伟人',
    avatar: 'https://ai-public.mastergo.com/ai/img_res/07a2cddcadbe9cdc3bb84926b9a54577.jpg',
    filter: (p: PoemRecord) => p.author === '毛泽东'
  },
  {
    name: '徐志摩',
    period: '近现代 · 诗人',
    avatar: 'https://ai-public.mastergo.com/ai/img_res/135bbaccc77df04113a2253e3ba3e19b.jpg',
    filter: (p: PoemRecord) => p.author === '徐志摩'
  }
]);

// 主题分类
const themeCategories = ref([
  {
    name: '爱国诗',
    icon: '🇨🇳',
    desc: '家国情怀，民族精神',
    gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
  },
  {
    name: '思乡诗',
    icon: '🌙',
    desc: '月是故乡明，人是故乡亲',
    gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
  },
  {
    name: '写景诗',
    icon: '🏔️',
    desc: '山水田园，自然之美',
    gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
  }
]);

// 特色推荐
const specialCategories = ref([
  {
    name: '经典必读',
    icon: '📖',
    badge: 'HOT',
    desc: '千古传诵的经典名篇',
    color: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)'
  },
  {
    name: '入门推荐',
    icon: '🌱',
    badge: 'NEW',
    desc: '适合初学者的精选诗词',
    color: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
  }
]);

onMounted(async () => {
  try {
    allPoems.value = await getAllPoems();
  } catch (e) {
    console.error('加载诗词数据失败', e);
  }
});

// 获取分类下的诗词数量
const getCount = (filter: (p: PoemRecord) => boolean) => {
  return allPoems.value.filter(filter).length;
};

// 跳转到分类页面
const goToCategory = (categoryName: string) => {
  router.push({ name: 'category', params: { name: categoryName } });
};
</script>

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
  gap: 24px;
}

.category-section {
  background: rgba(255, 255, 255, 0.9);
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  backdrop-filter: blur(10px);
}

.section-title {
  margin: 0 0 16px 0;
  font-size: 20px;
  font-weight: 700;
  color: #2c3e50;
}

/* 朝代分类样式 */
.category-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.category-card {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.category-card:hover {
  transform: translateY(-4px);
  border-color: #3498db;
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.card-icon {
  font-size: 32px;
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.card-desc {
  font-size: 12px;
  color: #7f8c8d;
  margin-bottom: 8px;
  line-height: 1.4;
}

.card-count {
  font-size: 14px;
  color: #3498db;
  font-weight: 600;
}

/* 诗人分类样式 */
.poet-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.poet-card {
  display: flex;
  align-items: center;
  gap: 16px;
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.poet-card:hover {
  transform: translateX(8px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.poet-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  background-size: cover;
  background-position: center;
  border: 3px solid #e3f2fd;
}

.poet-info {
  flex: 1;
}

.poet-name {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.poet-period {
  font-size: 14px;
  color: #7f8c8d;
  margin-bottom: 4px;
}

.poet-count {
  font-size: 12px;
  color: #3498db;
  font-weight: 600;
}

/* 主题分类样式 */
.theme-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
}

.theme-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.theme-card:hover {
  transform: scale(1.05);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.theme-bg {
  height: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.theme-icon {
  font-size: 28px;
}

.theme-info {
  background: #fff;
  padding: 12px;
  text-align: center;
}

.theme-name {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.theme-desc {
  font-size: 11px;
  color: #7f8c8d;
  line-height: 1.3;
}

/* 特色推荐样式 */
.special-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.special-card {
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.special-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.special-header {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  color: white;
}

.special-icon {
  font-size: 24px;
}

.special-badge {
  background: rgba(255,255,255,0.3);
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 10px;
  font-weight: 600;
}

.special-content {
  background: #fff;
  padding: 12px 16px;
}

.special-title {
  font-size: 14px;
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.special-desc {
  font-size: 11px;
  color: #7f8c8d;
  line-height: 1.3;
}
</style>