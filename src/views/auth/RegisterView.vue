<template>
  <div class="register-container">
    <h1>注册</h1>
    <form @submit.prevent="handleRegister">
      <div class="form-group">
        <label for="email">邮箱</label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          required
          placeholder="请输入邮箱"
        />
      </div>
      <div class="form-group">
        <label for="password">密码</label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          required
          placeholder="请输入密码"
        />
      </div>
      <div class="form-group">
        <label for="name">昵称</label>
        <input
          id="name"
          v-model="form.name"
          type="text"
          required
          placeholder="请输入昵称"
        />
      </div>
      <button type="submit" :disabled="loading">
        {{ loading ? '注册中...' : '注册' }}
      </button>
      <p class="login-link">
        已有账号？<router-link to="/login">立即登录</router-link>
      </p>
    </form>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { register } from '../../api/auth';

const router = useRouter();
const loading = ref(false);
const form = ref({
  email: '',
  password: '',
  name: ''
});

const handleRegister = async () => {
  try {
    loading.value = true;
    await register(form.value);
    // 清除URL中的错误参数
    if (window.location.hash.includes('error=')) {
      window.location.hash = '';
    }
    router.push('/login');
  } catch (error) {
    // 清除URL中的错误参数
    if (window.location.hash.includes('error=')) {
      window.location.hash = '';
    }
    alert('注册失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  max-width: 420px;
  margin: 2rem auto;
  padding: 2.5rem;
  background: rgba(255, 253, 245, 0.85);
  border: 1px solid #6d4c3e;
  border-radius: 0;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  position: relative;
  z-index: 1;
  font-family: 'KaiTi', '楷体', serif;
  border-top: 8px solid #6d4c3e;
}

.register-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0e6d2 url('https://pic.616pic.com/bg_w1180/00/04/00/VdkbYYU0FV.jpg') center/cover no-repeat;
  padding: 2rem;
  position: relative;
}

.register-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(240, 230, 210, 0.6);
  z-index: 0;
}

.register-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(240, 230, 210, 0.7);
  z-index: 0;
}

.register-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, #8b5a2b, #c19a6b, #8b5a2b);
}

h1 {
  text-align: center;
  margin-bottom: 1rem;
  color: #4a2b1a;
  font-weight: normal;
  letter-spacing: 4px;
  font-size: 2.2rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #5c3317;
  font-weight: normal;
}

input {
  width: 100%;
  padding: 0.9rem 1.2rem;
  border: 1px solid #c19a6b;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  background: rgba(255, 253, 245, 0.95);
  font-family: 'SimSun', '宋体', serif;
  margin-bottom: 0.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  color: #4a2b1a;
}

input::placeholder {
  color: #a38b76;
  opacity: 0.8;
}

input:focus {
  outline: none;
  border-color: #8b5a2b;
  box-shadow: 0 0 0 3px rgba(139, 90, 43, 0.2), 
              0 4px 6px -1px rgba(0, 0, 0, 0.1), 
              0 2px 4px -1px rgba(0, 0, 0, 0.06);
  transform: translateY(-1px);
}

label {
  font-size: 0.9rem;
  color: #5c3317;
  font-weight: 500;
  letter-spacing: 0.5px;
  margin-bottom: 0.3rem;
}

button {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #8b5a2b 0%, #c19a6b 100%);
  color: #fff8e8;
  border: none;
  border-radius: 2px;
  cursor: pointer;
  margin-top: 1rem;
  font-family: 'SimSun', '宋体', serif;
  letter-spacing: 1px;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(139, 90, 43, 0.3);
}

button:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: #8b5a2b;
  text-decoration: none;
  border-bottom: 1px dotted #8b5a2b;
  transition: all 0.2s ease;
}

.login-link a:hover {
  color: #5c3317;
}
</style>