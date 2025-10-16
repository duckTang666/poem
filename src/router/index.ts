import { createRouter, createWebHistory, type RouteRecordRaw, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', redirect: '/login' }, // 根路径重定向到登录页
  { path: '/poems', name: 'poems', component: () => import('../views/PoemList.vue'), meta: { requiresAuth: true } },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue'), meta: { requiresAuth: false } },
  { path: '/search', name: 'search', component: () => import('../views/SearchView.vue'), meta: { requiresAuth: true } },
  { path: '/categories', name: 'categories', component: () => import('../views/CategoryNavView.vue'), meta: { requiresAuth: true } },
  { path: '/category/:name?', name: 'category', component: () => import('../views/CategoryView.vue'), meta: { requiresAuth: true } },
  { path: '/favorites', name: 'favorites', component: () => import('../views/FavoritesView.vue'), meta: { requiresAuth: true } },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue'), meta: { requiresAuth: true } },
  { path: '/poem/:title?', name: 'poem-detail', component: () => import('../views/PoemDetailView.vue'), meta: { requiresAuth: true } },
  { path: '/login', name: 'login', component: () => import('../views/auth/LoginView.vue'), meta: { requiresAuth: false } },
  { path: '/register', name: 'register', component: () => import('../views/auth/RegisterView.vue'), meta: { requiresAuth: false } }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

import { getCurrentUser } from '@/api/auth';

// 认证守卫
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  try {
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);
    const user = await getCurrentUser();

    if (requiresAuth && !user) {
      next({ name: 'login', query: { redirect: to.fullPath } });
    } else if ((to.name === 'login' || to.name === 'register') && user) {
      next({ name: 'poems' }); // 已登录用户访问登录/注册页时跳转到诗词页
    } else {
      next();
    }
  } catch (error) {
    console.error('路由守卫错误:', error);
    next('/login');
  }
});

export default router;