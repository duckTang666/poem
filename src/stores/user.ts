import { defineStore } from 'pinia';

const KEY = 'poem_app_user';

export type UserProfile = {
  name: string;
  avatar: string;
  bio?: string;
};

export type UserSettings = {
  darkMode: boolean;
  notifications: boolean;
};

type State = {
  profile: UserProfile;
  settings: UserSettings;
};

function load(): State | null {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as State) : null;
  } catch {
    return null;
  }
}

function save(state: State) {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {}
}

export const useUserStore = defineStore('user', {
  state: (): State =>
    load() || {
      profile: {
        name: '诗友',
        avatar:
          'https://avatars.githubusercontent.com/u/9919?s=200&v=4',
        bio: '爱好古典诗词鉴赏'
      },
      settings: {
        darkMode: false,
        notifications: true
      }
    },
  actions: {
    setName(name: string) {
      this.profile.name = name;
      save(this.$state);
    },
    setAvatar(url: string) {
      this.profile.avatar = url;
      save(this.$state);
    },
    setBio(bio: string) {
      this.profile.bio = bio;
      save(this.$state);
    },
    toggleDarkMode() {
      this.settings.darkMode = !this.settings.darkMode;
      save(this.$state);
      document.documentElement.dataset.theme = this.settings.darkMode ? 'dark' : 'light';
    },
    toggleNotifications() {
      this.settings.notifications = !this.settings.notifications;
      save(this.$state);
    }
  }
});