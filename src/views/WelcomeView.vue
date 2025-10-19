<template>
  <div class="welcome-container">
    <h1>欢迎来到诗词鉴赏系统</h1>
    <p>请登录或注册以继续</p>
    
    <!-- AI诗歌搜索区 -->
    <div class="search-section" style="margin: 2rem 0; padding: 1.5rem; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
      <h3 style="color: #2c3e50; margin-bottom: 1rem; font-size: 1.2rem;">AI诗歌搜索测试</h3>
      <div style="display: flex; gap: 0.5rem; margin: 1rem 0;">
        <input 
          v-model="searchInput" 
          style="flex: 1; padding: 0.75rem; border: 1px solid #ddd; border-radius: 4px; font-size: 1rem;"
          placeholder="输入关键词搜索诗歌..."
          @keyup.enter="searchPoetry"
        />
        <button 
          @click="searchPoetry"
          style="padding: 0 1.5rem; background: #42b983; color: white; border: none; border-radius: 4px; cursor: pointer;"
        >
          <span v-if="!searchLoading">搜索</span>
          <span v-else>搜索中...</span>
        </button>
      </div>
      
      <div v-if="searchLoading" style="text-align: center; padding: 1rem; color: #666;">
        正在搜索中，请稍候...
      </div>
      
      <div v-if="searchResults.length > 0" style="margin-top: 1rem;">
        <div v-for="(result, index) in searchResults" :key="index" style="padding: 1rem; margin-bottom: 0.5rem; background: #f8f9fa; border-radius: 4px; border-left: 3px solid #42b983;">
          <h4 v-if="result.title" style="color: #2c3e50; margin-bottom: 0.5rem;">{{ result.title }}</h4>
          <p v-if="result.author" style="color: #7f8c8d; font-size: 0.9rem; margin: 0.5rem 0;">作者: {{ result.author }}</p>
          <p v-if="result.content" style="color: #2c3e50; line-height: 1.6;">{{ result.content }}</p>
          <p v-if="result.error" style="color: #e74c3c;">{{ result.error }}</p>
        </div>
      </div>
    </div>

    <div class="auth-buttons">
      <router-link to="/login" class="btn login-btn">登录</router-link>
      <router-link to="/register" class="btn register-btn">注册</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser } from '../api/auth';
import axios from 'axios';

// AI诗歌搜索功能
interface SearchResult {
  title?: string;
  author?: string;
  content?: string;
  error?: string;
}

const searchInput = ref('');
const searchResults = ref<SearchResult[]>([]);
const searchLoading = ref(false);

const searchPoetry = async () => {
  if (!searchInput.value.trim()) {
    searchResults.value = [{ error: '请输入搜索关键词' }];
    return;
  }
  
  searchLoading.value = true;
  searchResults.value = [];
  
  try {
    console.log('正在搜索:', searchInput.value);
    const headers = {
      'Content-Type': 'application/json'
    };
    
    // 仅在已登录时添加认证头
    try {
      const user = await getCurrentUser();
      if (user) {
        const token = (user as any).access_token;
        if (token) {
          (headers as any)['Authorization'] = `Bearer ${token}`;
        }
      }
    } catch (authError) {
      console.log('未登录状态继续搜索');
    }
    
    const response = await axios.post(
      'https://ducktang.app.n8n.cloud/webhook-test/ai-chat',
      { 
        poetry: searchInput.value,
        action: 'search'
      },
      { headers }
    );
    console.log('搜索响应:', response.data);
    
    // 处理搜索结果
    if (response.data) {
      if (Array.isArray(response.data)) {
        searchResults.value = response.data;
      } else if (response.data.results) {
        searchResults.value = response.data.results;
      } else if (response.data.message) {
        searchResults.value = [{ content: response.data.message }];
      } else {
        searchResults.value = [response.data];
      }
    } else {
      searchResults.value = [{ error: '未收到有效响应' }];
    }
  } catch (error) {
    console.error('搜索失败:', error);
    searchResults.value = [{ 
      error: `搜索失败: ${error.response?.data?.message || error.message}`
    }];
  } finally {
    searchLoading.value = false;
  }
};

const router = useRouter();

let authInitialized = false;

onMounted(async () => {
  try {
    const user = await getCurrentUser();
    if (user && !authInitialized) {
      authInitialized = true;
      
      // 递归检查路由是否就绪
      const checkRouteAndNavigate = (attempts = 0) => {
        if (router.hasRoute('home')) {
          router.push({ name: 'home' });
        } else if (attempts < 5) {
          setTimeout(() => checkRouteAndNavigate(attempts + 1), 200);
        }
      };
      
      checkRouteAndNavigate();
    }
  } catch (error) {
    console.log('用户状态检查:', error.message);
  }
});
</script>

<style scoped>
/* 搜索区样式 */
.search-section {
  margin: 2rem 0;
  padding: 1.5rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.search-input-group {
  display: flex;
  gap: 0.5rem;
  margin: 1rem 0;
}

.search-input {
  flex: 1;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.search-btn {
  padding: 0 1.5rem;
  background: #42b983;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.search-btn:hover {
  opacity: 0.9;
}

.search-results {
  margin-top: 1rem;
}

.search-result {
  padding: 1rem;
  margin-bottom: 0.5rem;
  background: #f8f9fa;
  border-radius: 4px;
  border-left: 3px solid #42b983;
}

.search-meta {
  color: #7f8c8d;
  font-size: 0.9rem;
  margin: 0.5rem 0;
}

.search-content {
  color: #2c3e50;
  line-height: 1.6;
}

.search-error {
  color: #e74c3c;
}

.welcome-container {
  max-width: 600px;
  margin: 5rem auto;
  padding: 2rem;
  text-align: center;
  background-color: #f8f9fa;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

h1 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

p {
  color: #7f8c8d;
  margin-bottom: 2rem;
}

.auth-buttons {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
}

.login-btn {
  background-color: #42b983;
  color: white;
}

.register-btn {
  background-color: #3498db;
  color: white;
}

.btn:hover {
  opacity: 0.9;
  transform: translateY(-2px);
}
</style>