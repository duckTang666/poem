import { createRouter, createWebHistory, type RouteRecordRaw, type RouteLocationNormalized, type NavigationGuardNext } from 'vue-router';

const routes: RouteRecordRaw[] = [
  { path: '/', name: 'poems', component: () => import('../views/PoemList.vue') },
  { path: '/about', name: 'about', component: () => import('../views/AboutView.vue'), meta: { requiresAuth: false } },
  { path: '/search', name: 'search', component: () => import('../views/SearchView.vue') },
  { path: '/category/:name?', name: 'category', component: () => import('../views/CategoryView.vue') },
  { path: '/favorites', name: 'favorites', component: () => import('../views/FavoritesView.vue') },
  { path: '/profile', name: 'profile', component: () => import('../views/ProfileView.vue') },
  { path: '/poem/:title?', name: 'poem-detail', component: () => import('../views/PoemDetailView.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

// 示例守卫：可扩展为鉴权/埋点等
router.beforeEach((to: RouteLocationNormalized, _from: RouteLocationNormalized, next: NavigationGuardNext) => {
  next();
});

export default router;