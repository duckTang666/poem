<template>
  <div class="welcome-container">
    <h1>欢迎来到诗词鉴赏系统</h1>
    <p>请登录或注册以继续</p>
    <div class="auth-buttons">
      <router-link to="/login" class="btn login-btn">登录</router-link>
      <router-link to="/register" class="btn register-btn">注册</router-link>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { getCurrentUser } from '../api/auth';

const router = useRouter();

onMounted(async () => {
  const user = await getCurrentUser();
  if (user) {
    router.push('/');
  }
});
</script>

<style scoped>
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