import { defineStore } from 'pinia';
import type { Poem } from '../data/poems';

type FavItem = Poem;

const KEY = 'poem_app_favorites';

function load(): FavItem[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as FavItem[]) : [];
  } catch {
    return [];
  }
}

function save(list: FavItem[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    list: load() as FavItem[]
  }),
  getters: {
    titles(state): string[] {
      return state.list.map((p) => p.title);
    },
    has:
      (state) =>
      (title: string): boolean =>
        state.list.some((p) => p.title === title)
  },
  actions: {
    add(item: FavItem) {
      if (!this.list.find((p) => p.title === item.title)) {
        this.list.push(item);
        save(this.list);
      }
    },
    remove(title: string) {
      this.list = this.list.filter((p) => p.title !== title);
      save(this.list);
    },
    toggle(item: FavItem) {
      if (this.has(item.title)) {
        this.remove(item.title);
      } else {
        this.add(item);
      }
    },
    clear() {
      this.list = [];
      save(this.list);
    }
  }
});