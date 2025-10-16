import { createApp } from 'vue';
import { createPinia } from 'pinia';
import App from './App.vue';
import router from './router';
import { supabase } from './api/supabase';

const app = createApp(App);
app.use(createPinia());
app.use(router);

// 初始化Supabase认证状态监听
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Supabase auth state changed:', event, session);
});

app.mount('#app');