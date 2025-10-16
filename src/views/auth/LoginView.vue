<template>
  <div class="login-wrapper">
    <div class="login-container">
      <div class="login-header">
        <h1>欢迎回来</h1>
        <p>请登录您的账号</p>
      </div>
      
      <form @submit.prevent="handleLogin" class="login-form">
        <div class="form-group">
          <label for="email">邮箱</label>
          <input
            id="email"
            v-model="form.email"
            type="email"
            required
            placeholder="请输入邮箱"
            class="input-field"
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
            class="input-field"
          />
        </div>
        
        <button type="submit" :disabled="loading" class="login-btn">
          {{ loading ? '登录中...' : '登录' }}
        </button>
        
        <div class="login-footer">
          <p class="register-link">
            还没有账号？<router-link to="/register" class="link">立即注册</router-link>
          </p>
          <router-link to="/forgot-password" class="forgot-link">忘记密码？</router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { login } from '../../api/auth';

const router = useRouter();
const loading = ref(false);
const form = ref({
  email: '',
  password: ''
});

const handleLogin = async () => {
  try {
    loading.value = true;
    const user = await login(form.value.email, form.value.password);
    
    // 跳转到首页
    router.push('/poems');
  } catch (error: any) {
    alert('登录失败: ' + error.message);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-wrapper {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f0e6d2 url('https://pic.616pic.com/bg_w1180/00/04/52/p27G91tQAZ.jpg') center/cover no-repeat;
  padding: 2rem;
  font-family: 'KaiTi', '楷体', serif;
  position: relative;
}

.login-wrapper::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(240, 230, 210, 0.6);
  z-index: 0;
}

.login-container {
  width: 100%;
  max-width: 380px;
  background: rgba(255, 253, 245, 0.85);
  border: 1px solid #6d4c3e;
  border-radius: 0;
  box-shadow: 0 0 15px rgba(0, 0, 0, 0.2);
  padding: 2.5rem;
  position: relative;
  z-index: 1;
  margin: 2rem;
  border-top: 8px solid #6d4c3e;
}

.login-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 8px;
  background: linear-gradient(90deg, #8b5a2b, #c19a6b, #8b5a2b);
}

.login-header {
  text-align: center;
  margin-bottom: 2rem;
}

.login-header h1 {
  font-size: 2.2rem;
  color: #4a2b1a;
  margin-bottom: 0.5rem;
  font-weight: normal;
  letter-spacing: 4px;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.1);
}

.login-header p {
  color: #8b5a2b;
  font-size: 1rem;
}

.login-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

label {
  font-size: 0.9rem;
  color: #2c3e50;
  font-weight: 500;
}

.input-field {
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

.input-field::placeholder {
  color: #a38b76;
  opacity: 0.8;
}

.input-field:focus {
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

.login-btn {
  width: 100%;
  padding: 1rem;
  background: linear-gradient(135deg, #8b5a2b 0%, #c19a6b 100%);
  color: #fff8e8;
  border: none;
  border-radius: 2px;
  font-size: 1rem;
  font-weight: normal;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 1rem;
  letter-spacing: 1px;
  font-family: 'SimSun', '宋体', serif;
}

.login-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 3px 10px rgba(139, 90, 43, 0.3);
}

.login-btn:disabled {
  background: #bdc3c7;
  cursor: not-allowed;
}

.login-footer {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  margin-top: 1.5rem;
}

.register-link {
  color: #7f8c8d;
  font-size: 0.9rem;
}

.link {
  color: #8b5a2b;
  font-weight: normal;
  text-decoration: none;
  transition: all 0.2s ease;
  border-bottom: 1px dotted #8b5a2b;
}

.link:hover {
  color: #5c3317;
}

.forgot-link {
  color: #8b5a2b;
  font-size: 0.85rem;
  text-decoration: none;
  transition: all 0.2s ease;
  border-bottom: 1px dotted #8b5a2b;
}

.forgot-link:hover {
  color: #5c3317;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>