<template>
  <div class="fallback-container">
    <h1>诗词鉴赏功能加载中...</h1>
    <p>如果长时间未响应，请尝试：</p>
    <ul>
      <li>1. 刷新页面</li>
      <li>2. 检查网络连接</li>
      <li>3. 联系技术支持</li>
    </ul>
    <button @click="reloadPage">立即刷新</button>
  </div>
</template>

<script setup>
const reloadPage = () => location.reload();
</script>

<script setup lang="ts">
</script>

<style scoped>
.fallback-container {
  text-align: center;
  padding: 2rem;
  color: #666;
}
</style>