<script setup lang="ts">
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { useFavoritesStore } from '../stores/favorites';
import { ref, computed, onMounted } from 'vue';
import { supabaseRequest } from '@/api/http';
import { logout } from '@/api/auth';
import type { PoemDTO } from '@/api/poems';
import type { PoemRecord } from '../data/repository';

const router = useRouter();
const user = useUserStore();
const favorites = useFavoritesStore();

const nameInput = ref(user.profile.name);
const avatarInput = ref(user.profile.avatar);
const bioInput = ref(user.profile.bio || '');
const isEditing = ref(false);

// 统计数据
const allPoems = ref<PoemRecord[]>([]);
const readingStats = computed(() => {
  const totalPoems = allPoems.value.length;
  const favoriteCount = favorites.list.length;
  const readingProgress = totalPoems > 0 ? Math.round((favoriteCount / totalPoems) * 100) : 0;
  
  return {
    totalPoems,
    favoriteCount,
    readingProgress,
    todayReading: Math.floor(Math.random() * 5) + 1, // 模拟今日阅读数
    weeklyReading: Math.floor(Math.random() * 20) + 10, // 模拟本周阅读数
    monthlyReading: Math.floor(Math.random() * 50) + 30 // 模拟本月阅读数
  };
});

// 成就系统
const achievements = computed(() => {
  const favCount = favorites.list.length;
  return [
    { name: '初学者', desc: '收藏第一首诗', unlocked: favCount >= 1, icon: '🌱' },
    { name: '诗词爱好者', desc: '收藏10首诗', unlocked: favCount >= 10, icon: '📚' },
    { name: '文学达人', desc: '收藏50首诗', unlocked: favCount >= 50, icon: '🎓' },
    { name: '诗词大师', desc: '收藏100首诗', unlocked: favCount >= 100, icon: '👑' },
  ];
});

// 最近收藏的诗词
const recentFavorites = computed(() => {
  return allPoems.value
    .filter(p => favorites.list.includes(p.id))
    .slice(0, 3);
});

onMounted(async () => {
  try {
    // 从Supabase获取诗词数据
    const data = await supabaseRequest<PoemDTO>('poems');
    allPoems.value = data || [];
    
    // 获取收藏统计
    const favRes = await supabaseRequest('poems', {
      params: {
        favorite: 'eq.true',
        select: 'count'
      }
    });
    readingStats.value.favoriteCount = favRes.length || 0;
  } catch (e) {
    console.error('加载数据失败', e);
  }
});

function toggleEdit() {
  if (isEditing.value) {
    saveProfile();
  }
  isEditing.value = !isEditing.value;
}

function saveProfile() {
  user.setName(nameInput.value);
  user.setAvatar(avatarInput.value);
  user.setBio(bioInput.value);
  alert('资料已保存');
}

function goToFavorites() {
  router.push({ name: 'favorites' });
}

function goToCategory(categoryName: string) {
  router.push({ name: 'category', params: { name: categoryName } });
}

async function handleLogout() {
  try {
    await logout();
    router.push('/login');
  } catch (error) {
    console.error('退出登录失败:', error);
    alert('退出登录失败，请重试');
  }
}
</script>

<template>
  <div class="page-container">
    <TopNav title="我的" @search="router.push({name:'search'})" @back="router.push({name:'home'})" />

    <div class="content">
      <!-- 用户信息卡片 -->
      <div class="profile-card">
        <div class="profile-header">
          <img class="avatar" :src="user.profile.avatar" alt="头像" />
          <div class="info">
            <div class="name">{{ user.profile.name }}</div>
            <div class="bio">{{ user.profile.bio || '这个人很懒，什么都没留下...' }}</div>
            <div class="join-date">加入时间：2024年1月</div>
          </div>
          <button class="edit-btn" @click="toggleEdit">
            {{ isEditing ? '保存' : '编辑' }}
          </button>
        </div>
        
        <!-- 编辑表单 -->
        <div v-if="isEditing" class="edit-form">
          <div class="form-row">
            <label>昵称</label>
            <input v-model="nameInput" type="text" placeholder="请输入昵称" />
          </div>
          <div class="form-row">
            <label>头像URL</label>
            <input v-model="avatarInput" type="text" placeholder="请输入头像链接" />
          </div>
          <div class="form-row">
            <label>个人简介</label>
            <textarea v-model="bioInput" placeholder="介绍一下自己吧..." rows="3"></textarea>
          </div>
        </div>
      </div>

      <!-- 阅读统计 -->
      <div class="stats-card">
        <h3>📊 阅读统计</h3>
        <div class="stats-grid">
          <div class="stat-item">
            <div class="stat-number">{{ readingStats.favoriteCount }}</div>
            <div class="stat-label">收藏诗词</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ readingStats.todayReading }}</div>
            <div class="stat-label">今日阅读</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ readingStats.weeklyReading }}</div>
            <div class="stat-label">本周阅读</div>
          </div>
          <div class="stat-item">
            <div class="stat-number">{{ readingStats.monthlyReading }}</div>
            <div class="stat-label">本月阅读</div>
          </div>
        </div>
        <div class="progress-section">
          <div class="progress-label">阅读进度 {{ readingStats.readingProgress }}%</div>
          <div class="progress-bar">
            <div class="progress-fill" :style="{ width: readingStats.readingProgress + '%' }"></div>
          </div>
        </div>
      </div>

      <!-- 成就系统 -->
      <div class="achievements-card">
        <h3>🏆 我的成就</h3>
        <div class="achievements-grid">
          <div v-for="achievement in achievements" :key="achievement.name" 
               class="achievement-item" 
               :class="{ unlocked: achievement.unlocked }">
            <div class="achievement-icon">{{ achievement.icon }}</div>
            <div class="achievement-info">
              <div class="achievement-name">{{ achievement.name }}</div>
              <div class="achievement-desc">{{ achievement.desc }}</div>
            </div>
            <div v-if="achievement.unlocked" class="achievement-badge">✓</div>
          </div>
        </div>
      </div>

      <!-- 最近收藏 -->
      <div class="recent-card">
        <div class="card-header">
          <h3>💖 最近收藏</h3>
          <button @click="goToFavorites" class="more-btn">查看全部</button>
        </div>
        <div v-if="recentFavorites.length === 0" class="empty-state">
          <div class="empty-icon">📚</div>
          <div class="empty-text">还没有收藏任何诗词</div>
          <button @click="goToCategory('唐诗')" class="explore-btn">去探索</button>
        </div>
        <div v-else class="recent-list">
          <div v-for="poem in recentFavorites" :key="poem.id" class="recent-item">
            <div class="poem-info">
              <div class="poem-title">{{ poem.title }}</div>
              <div class="poem-author">{{ poem.author }} · {{ poem.dynasty }}</div>
            </div>
          </div>
        </div>
      </div>

      <!-- 快捷功能 -->
      <div class="quick-actions">
        <div class="action-item" @click="goToCategory('唐诗')">
          <div class="action-icon">🏛️</div>
          <div class="action-text">唐诗</div>
        </div>
        <div class="action-item" @click="goToCategory('宋词')">
          <div class="action-icon">🌸</div>
          <div class="action-text">宋词</div>
        </div>
        <div class="action-item" @click="goToCategory('元曲')">
          <div class="action-icon">🎭</div>
          <div class="action-text">元曲</div>
        </div>
        <div class="action-item" @click="goToCategory('现代诗')">
          <div class="action-icon">🌟</div>
          <div class="action-text">现代诗</div>
        </div>
      </div>

      <!-- 设置选项 -->
      <div class="settings-card">
        <h3>⚙️ 设置</h3>
        <div class="settings-list">
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-name">暗色模式</div>
              <div class="setting-desc">保护您的眼睛</div>
            </div>
            <input type="checkbox" :checked="user.settings.darkMode" @change="user.toggleDarkMode" class="toggle" />
          </div>
          <div class="setting-item">
            <div class="setting-info">
              <div class="setting-name">消息通知</div>
              <div class="setting-desc">接收诗词推荐</div>
            </div>
            <input type="checkbox" :checked="user.settings.notifications" @change="user.toggleNotifications" class="toggle" />
          </div>
        </div>

        <!-- 退出登录按钮 -->
        <div class="logout-section">
          <button @click="handleLogout" class="logout-btn">
            <span class="logout-icon">🚪</span>
            <span>退出登录</span>
          </button>
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<style scoped>
.page-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.content {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  flex: 1;
}

/* 用户信息卡片 */
.profile-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
  border: 1px solid rgba(255,255,255,0.2);
}

.profile-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 16px;
}

.avatar {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #e3f2fd;
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.info {
  flex: 1;
}

.name {
  font-size: 24px;
  font-weight: 700;
  color: #2c3e50;
  margin-bottom: 8px;
}

.bio {
  font-size: 14px;
  color: #7f8c8d;
  line-height: 1.4;
  margin-bottom: 4px;
}

.join-date {
  font-size: 12px;
  color: #95a5a6;
}

.edit-btn {
  padding: 8px 16px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.3s ease;
}

.edit-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.edit-form {
  border-top: 1px solid #ecf0f1;
  padding-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.form-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-row label {
  font-size: 14px;
  font-weight: 600;
  color: #34495e;
}

.form-row input, .form-row textarea {
  padding: 12px;
  border: 2px solid #ecf0f1;
  border-radius: 8px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.form-row input:focus, .form-row textarea:focus {
  outline: none;
  border-color: #3498db;
}

/* 统计卡片 */
.stats-card {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.stats-card h3 {
  margin: 0 0 20px 0;
  font-size: 18px;
  font-weight: 600;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  margin-bottom: 20px;
}

.stat-item {
  text-align: center;
  background: rgba(255,255,255,0.1);
  border-radius: 12px;
  padding: 16px;
  backdrop-filter: blur(10px);
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 12px;
  opacity: 0.9;
}

.progress-section {
  margin-top: 16px;
}

.progress-label {
  font-size: 14px;
  margin-bottom: 8px;
  opacity: 0.9;
}

.progress-bar {
  height: 8px;
  background: rgba(255,255,255,0.2);
  border-radius: 4px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #f093fb 0%, #f5576c 100%);
  border-radius: 4px;
  transition: width 0.6s ease;
}

/* 成就卡片 */
.achievements-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.achievements-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #2c3e50;
}

.achievements-grid {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.achievement-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: #f8f9fa;
  transition: all 0.3s ease;
}

.achievement-item.unlocked {
  background: linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%);
  transform: scale(1.02);
}

.achievement-icon {
  font-size: 24px;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255,255,255,0.8);
  border-radius: 50%;
}

.achievement-info {
  flex: 1;
}

.achievement-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 2px;
}

.achievement-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.achievement-badge {
  color: #27ae60;
  font-size: 18px;
  font-weight: bold;
}

/* 最近收藏卡片 */
.recent-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.card-header h3 {
  margin: 0;
  font-size: 18px;
  color: #2c3e50;
}

.more-btn {
  padding: 6px 12px;
  background: #e74c3c;
  color: white;
  border: none;
  border-radius: 16px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.more-btn:hover {
  background: #c0392b;
  transform: translateY(-1px);
}

.empty-state {
  text-align: center;
  padding: 32px 16px;
}

.empty-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.empty-text {
  color: #7f8c8d;
  margin-bottom: 16px;
}

.explore-btn {
  padding: 10px 20px;
  background: #3498db;
  color: white;
  border: none;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.explore-btn:hover {
  background: #2980b9;
  transform: translateY(-2px);
}

.recent-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recent-item {
  padding: 12px;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #e74c3c;
}

.poem-title {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.poem-author {
  font-size: 12px;
  color: #7f8c8d;
}

/* 快捷功能 */
.quick-actions {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}

.action-item {
  background: #fff;
  border-radius: 12px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 16px rgba(0,0,0,0.1);
}

.action-item:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0,0,0,0.15);
}

.action-icon {
  font-size: 24px;
  margin-bottom: 8px;
}

.action-text {
  font-size: 12px;
  color: #2c3e50;
  font-weight: 600;
}

/* 设置卡片 */
.settings-card {
  background: #fff;
  border-radius: 16px;
  padding: 20px;
  box-shadow: 0 8px 32px rgba(0,0,0,0.1);
}

.settings-card h3 {
  margin: 0 0 16px 0;
  font-size: 18px;
  color: #2c3e50;
}

.settings-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #ecf0f1;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-info {
  flex: 1;
}

.setting-name {
  font-weight: 600;
  color: #2c3e50;
  margin-bottom: 4px;
}

.setting-desc {
  font-size: 12px;
  color: #7f8c8d;
}

.toggle {
  width: 44px;
  height: 24px;
  appearance: none;
  background: #bdc3c7;
  border-radius: 12px;
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
}

.toggle:checked {
  background: #3498db;
}

.toggle::before {
  content: '';
  position: absolute;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  top: 2px;
  left: 2px;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0,0,0,0.2);
}

.toggle:checked::before {
  transform: translateX(20px);
}

/* 退出登录按钮 */
.logout-section {
  margin-top: 24px;
  text-align: center;
}

.logout-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 24px;
  background: #f8f9fa;
  color: #e74c3c;
  border: 1px solid #e74c3c;
  border-radius: 24px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.logout-btn:hover {
  background: #e74c3c;
  color: white;
  transform: translateY(-2px);
}

.logout-icon {
  font-size: 18px;
}
</style>