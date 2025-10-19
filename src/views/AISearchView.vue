<template>
  <div class="ai-search-container">
    <h1>AI诗词鉴赏</h1>
    <div class="search-box">
      <input 
        v-model="searchQuery"
        placeholder="请输入作者或诗歌题目，如：李白 或 《静夜思》"
        @keyup.enter="searchPoetry"
      />
      <button @click="searchPoetry" :disabled="loading">
        {{ loading ? '搜索中...' : '开始鉴赏' }}
      </button>
    </div>

    <div v-if="error" class="error-message">
      {{ error }}
    </div>

    <div v-if="result" class="result-container">
      <h2>{{ result.name || result.poet || '诗人信息' }}</h2>
      
      <div class="poet-basic-info">
        <div v-if="result.dynasty" class="info-item">
          <strong>朝代：</strong>{{ result.dynasty }}
        </div>
        <div v-if="result.lifespan" class="info-item">
          <strong>生卒年：</strong>{{ result.lifespan }}
        </div>
      </div>

      <div v-if="result.biography" class="result-section">
        <h3>生平简介：</h3>
        <p>{{ result.biography }}</p>
      </div>

      <div v-if="result.works?.length" class="result-section">
        <h3>代表作品：</h3>
        <ul class="works-list">
          <li v-for="(work, index) in result.works" :key="index">
            《{{ work }}》
          </li>
        </ul>
      </div>

      <div v-if="result.style" class="result-section">
        <h3>创作风格：</h3>
        <p>{{ result.style }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import axios from 'axios';

const searchQuery = ref('');
const result = ref(null);
const error = ref('');
const loading = ref(false);

const searchPoetry = async () => {
  if (!searchQuery.value.trim()) {
    error.value = '请输入作者或诗歌题目';
    return;
  }

  loading.value = true;
  error.value = '';
  result.value = null;

  try {
    console.log('正在发送请求:', {
      query: searchQuery.value,
      timestamp: new Date().toISOString()
    });

    const response = await axios.post(
      'https://ducktang.app.n8n.cloud/webhook/ai-chat',
      {
        query: searchQuery.value,
        task: 'poetry_analysis',
        options: {
          search_type: 'poet',
          requested_fields: {
            basic_info: true,
            works: true,
            biography: true,
            style: true,
            timeline: true
          },
          output_format: 'markdown',
          detail_level: 'complete',
          language: 'zh-CN'
        }
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        timeout: 30000
      }
    );

    console.log('收到API响应:', {
      status: response.status,
      data: response.data
    });

    if (response.data) {
      console.log('API原始响应:', response.data);
      result.value = response.data;
      
      if (response.data.error) {
        error.value = response.data.error.message || '查询失败';
      } else if (!response.data.name && !response.data.poet) {
        error.value = `未找到与"${searchQuery.value}"相关的诗人信息，请尝试：
        - 检查姓名拼写
        - 使用更常见的称呼
        - 查询其他诗人`;
      }
    } else {
      error.value = '服务器返回空响应';
      console.error('API返回空数据', response);
    }
  } catch (err) {
    console.error('API请求错误:', err);
    error.value = err.code === 'ECONNABORTED' 
      ? '请求超时，请稍后再试' 
      : '请求失败: ' + (err.response?.data?.message || err.message || '服务器无响应');
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.ai-search-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.search-box {
  display: flex;
  gap: 10px;
  margin: 20px 0;
}

.search-box input {
  flex: 1;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.search-box button {
  padding: 10px 20px;
  background: #4a6b3e;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.search-box button:disabled {
  background: #cccccc;
}

.error-message {
  color: #c00;
  margin: 10px 0;
}

.result-container {
  margin-top: 20px;
  padding: 20px;
  background: #f9f8f5;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.poet-basic-info {
  display: flex;
  gap: 20px;
  margin: 15px 0;
  padding-bottom: 15px;
  border-bottom: 1px solid #eee;
}

.info-item {
  font-size: 16px;
}

.works-list {
  columns: 2;
  column-gap: 30px;
}

.works-list li {
  margin-bottom: 8px;
  break-inside: avoid;
}

.result-item {
  margin: 5px 0;
}

.result-content {
  margin: 15px 0;
  white-space: pre-wrap;
}

.result-analysis {
  margin-top: 20px;
  padding-top: 10px;
  border-top: 1px solid #ddd;
}
</style>