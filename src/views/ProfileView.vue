<script setup lang="ts">
import TopNav from '../components/TopNav.vue';
import BottomNav from '../components/BottomNav.vue';
import { useRouter } from 'vue-router';
import { useUserStore } from '../stores/user';
import { ref } from 'vue';

const router = useRouter();
const user = useUserStore();

const nameInput = ref(user.profile.name);
const avatarInput = ref(user.profile.avatar);
const bioInput = ref(user.profile.bio || '');

function saveProfile() {
  user.setName(nameInput.value);
  user.setAvatar(avatarInput.value);
  user.setBio(bioInput.value);
  alert('资料已保存');
}
</script>

<template>
  <div class="page-container">
    <TopNav title="我的" @search="router.push({name:'search'})" @back="router.push({name:'home'})" />

    <div class="content">
      <div class="profile">
        <img class="avatar" :src="user.profile.avatar" alt="头像" />
        <div class="info">
          <div class="name">{{ user.profile.name }}</div>
          <div class="bio">{{ user.profile.bio }}</div>
        </div>
      </div>

      <div class="form">
        <label class="row">
          <span>昵称</span>
          <input v-model="nameInput" type="text" />
        </label>
        <label class="row">
          <span>头像URL</span>
          <input v-model="avatarInput" type="text" />
        </label>
        <label class="row">
          <span>简介</span>
          <input v-model="bioInput" type="text" />
        </label>
        <button class="primary-btn" @click="saveProfile">保存资料</button>
      </div>

      <div class="settings">
        <div class="row">
          <span>暗色模式</span>
          <input type="checkbox" :checked="user.settings.darkMode" @change="user.toggleDarkMode" />
        </div>
        <div class="row">
          <span>消息通知</span>
          <input type="checkbox" :checked="user.settings.notifications" @change="user.toggleNotifications" />
        </div>
      </div>
    </div>

    <BottomNav />
  </div>
</template>

<style scoped>
.page-container{display:flex;flex-direction:column;min-height:100vh;background:#f9f6f1}
.content{padding:16px;display:flex;flex-direction:column;gap:16px}
.profile{display:flex;gap:12px;align-items:center;background:#fff;border-radius:12px;padding:12px;box-shadow:0 4px 16px rgba(0,0,0,.05)}
.avatar{width:64px;height:64px;border-radius:50%;object-fit:cover}
.info .name{font-weight:600;color:#3e2723}
.info .bio{font-size:12px;color:#6b4a3e}
.form{display:flex;flex-direction:column;gap:10px;background:#fff;border-radius:12px;padding:12px;box-shadow:0 4px 16px rgba(0,0,0,.05)}
.row{display:flex;align-items:center;gap:10px}
.row input{flex:1;height:32px;border:1px solid #ddd;border-radius:8px;padding:0 8px}
.primary-btn{height:36px;border:none;border-radius:8px;background:#c69a5c;color:#fff;cursor:pointer;padding:0 16px}
.settings{display:flex;flex-direction:column;gap:10px;background:#fff;border-radius:12px;padding:12px;box-shadow:0 4px 16px rgba(0,0,0,.05)}
.settings .row{display:flex;align-items:center;justify-content:space-between}
</style>