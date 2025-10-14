<script setup lang="ts">
import { ref, computed, onMounted, watchEffect } from 'vue';
import { useRouter } from 'vue-router';
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { getAllPoems } from '../data/repository';
import type { PoemRecord } from '../data/repository';

const router = useRouter();
const q = ref('');
const allPoems = ref<PoemRecord[]>([]);
const loading = ref(true);
const searchHistory = ref<string[]>(JSON.parse(localStorage.getItem('searchHistory') || '[]'));

// 搜索结果
const results = computed(() => {
  if (!q.value.trim()) return [];
  const query = q.value.toLowerCase();
  return allPoems.value.filter(
    (p) =>
      p.title.toLowerCase().includes(query) ||
      p.author.toLowerCase().includes(query) ||
      p.dynasty.toLowerCase().includes(query) ||
      p.content.toLowerCase().includes(query)
  );
});

// 热门搜索词
const hotKeywords = ref([
  '李白', '苏轼', '唐诗', '宋词', '思乡', '爱国', '春天', '月亮', '山水', '离别'
]);

// 搜索建议
const suggestions = computed(() => {
  if (!q.value.trim()) return [];
  const query = q.value.toLowerCase();
  const titleSuggestions = allPoems.value
    .filter(p => p.title.toLowerCase().includes(query))
    .slice(0, 3)
    .map(p => ({ type: 'title', text: p.title, poem: p }));
  
  const authorSuggestions = [...new Set(allPoems.value
    .filter(p => p.author.toLowerCase().includes(query))
    .map(p => p.author))]
    .slice(0, 3)
    .map(author => ({ type: 'author', text: author }));
    
  return [...titleSuggestions, ...authorSuggestions].slice(0, 5);
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

// 保存搜索历史
watchEffect(() => {
  localStorage.setItem('searchHistory', JSON.stringify(searchHistory.value));
});

function doSearch() {
  if (!q.value.trim()) return;
  
  // 添加到搜索历史
  if (!searchHistory.value.includes(q.value)) {
    searchHistory.value.unshift(q.value);
    searchHistory.value = searchHistory.value.slice(0, 10); // 只保留最近10条
  }
}

function selectKeyword(keyword: string) {
  q.value = keyword;
  doSearch();
}

function selectSuggestion(suggestion: any) {
  if (suggestion.type === 'title' && suggestion.poem) {
    router.push({ name: 'poem-detail', params: { title: suggestion.poem.title } });
  } else {
    q.value = suggestion.text;
    doSearch();
  }
}

function openDetail(poem: PoemRecord) {
  router.push({ name: 'poem-detail', params: { title: poem.title } });
}

function clearHistory() {
  searchHistory.value = [];
}

function removeHistoryItem(item: string) {
  const index = searchHistory.value.indexOf(item);
  if (index > -1) {
    searchHistory.value.splice(index, 1);
  }
}
</script>

<template>
  <div class="page-container">
    <TopNav title="搜索发现" @back="router.push({name:'home'})" :showSearch="false" />

    <div class="content">
      <!-- 搜索框 -->
      <div class="search-section" style="width:100%;">
        <div class="search-box" style="display:flex; gap:8px; align-items:center; width:100%;">
          <div class="search-input-wrapper" style="flex:1; display:flex; align-items:center; gap:8px; background:#fff; border:1px solid #ddd; border-radius:8px; padding:0 10px; height:36px;">
            <span class="search-icon">🔍</span>
            <input
              v-model="q"
              placeholder="搜索诗词、作者、朝代..."
              @keyup.enter="doSearch"
              class="search-input"
              type="text"
              style="flex:1; border:none; outline:none; height:100%;"
            />
            <button v-if="q" @click="q = ''" class="clear-btn" style="border:none; background:transparent; cursor:pointer;">✕</button>
          </div>
          <button @click="doSearch" class="primary-btn">搜索</button>
        </div>

        <!-- 搜索建议 -->
        <div v-if="suggestions.length && q" class="suggestions" style="margin-top:8px; background:#fff; border:1px solid #eee; border-radius:8px; overflow:hidden;">
          <div
            v-for="suggestion in suggestions"
            :key="suggestion.text"
            @click="selectSuggestion(suggestion)"
            class="suggestion-item"
            style="display:flex; align-items:center; gap:8px; padding:10px 12px; cursor:pointer; border-bottom:1px solid #f5f5f5;"
          >
            <span class="suggestion-icon">
              {{ suggestion.type === 'title' ? '📖' : '👤' }}
            </span>
            <span class="suggestion-text" style="flex:1;">{{ suggestion.text }}</span>
            <span class="suggestion-type" style="font-size:12px; color:#888;">
              {{ suggestion.type === 'title' ? '诗词' : '作者' }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- 搜索结果 -->
    <div v-if="results.length" class="poem-list">
      <div
        class="poem-card"
        v-for="(poem, idx) in results"
        :key="idx"
        @click="router.push({ name: 'poem-detail', params: { title: poem.title } })"
      >
        <div class="card-content">
          <div class="poem-title">{{ poem.title }}</div>
          <div class="poem-meta">
            <span class="poem-author">{{ poem.author }}</span>
            <span class="poem-dynasty">{{ poem.dynasty }}</span>
          </div>
          <div class="poem-preview">
            {{ poem.preview || (poem.content ? (poem.content.length > 60 ? poem.content.substring(0, 60) + '...' : poem.content) : '') }}
          </div>
        </div>
        <img class="poem-image" :src="poem.image" alt="诗图" />
      </div>
    </div>

    <!-- 无搜索结果 -->
    <div v-else-if="q && !loading" class="content" style="flex-direction:column; align-items:center;">
      <div class="no-results-icon" style="font-size:28px;">🔍</div>
      <h3 style="margin:8px 0 4px;">未找到相关结果</h3>
      <p style="color:#666;">试试搜索其他关键词，或浏览下方推荐内容</p>
    </div>

    <!-- 默认内容：搜索历史和热门推荐 -->
    <div v-if="!q" class="content" style="flex-direction:column; gap:12px;">
      <!-- 搜索历史 -->
      <div v-if="searchHistory.length" class="history-section" style="width:100%;">
        <div class="section-header" style="display:flex; justify-content:space-between; align-items:center; margin-bottom:8px;">
          <h3>搜索历史</h3>
          <button @click="clearHistory" class="clear-history-btn" style="border:none; background:transparent; color:#a66; cursor:pointer;">清空</button>
        </div>
        <div class="history-tags" style="display:flex; flex-wrap:wrap; gap:8px;">
          <div
            v-for="item in searchHistory"
            :key="item"
            class="history-tag"
            style="background:#fff; border:1px solid #eee; border-radius:16px; padding:4px 10px; display:flex; align-items:center; gap:6px;"
          >
            <span @click="selectKeyword(item)" class="tag-text" style="cursor:pointer;">{{ item }}</span>
            <span @click="removeHistoryItem(item)" class="tag-remove" style="cursor:pointer; color:#999;">✕</span>
          </div>
        </div>
      </div>

      <!-- 热门搜索 -->
      <div class="hot-section" style="width:100%;">
        <div class="section-header" style="margin-bottom:8px;">
          <h3>热门搜索</h3>
        </div>
        <div class="hot-tags" style="display:flex; flex-wrap:wrap; gap:8px;">
          <div
            v-for="keyword in hotKeywords"
            :key="keyword"
            @click="selectKeyword(keyword)"
            class="hot-tag"
            style="background:#f5f0e1; color:#6b4a3e; border-radius:16px; padding:4px 10px; cursor:pointer;"
          >
            {{ keyword }}
          </div>
        </div>
      </div>
    </div>

    <!-- 加载状态 -->
    <div v-if="loading" class="content" style="flex-direction:column; align-items:center;">
      <div class="loading-spinner" style="width:24px; height:24px; border:3px solid #ddd; border-top-color:#c69a5c; border-radius:50%; animation:spin 1s linear infinite;"></div>
      <p class="loading-text" style="color:#666; margin-top:8px;">正在加载诗词库...</p>
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