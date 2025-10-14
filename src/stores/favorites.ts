import { defineStore } from 'pinia';
import type { PoemRecord } from '../data/repository';

type FavItem = PoemRecord;

const KEY = 'poem_app_favorites';

function load(): number[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as number[]) : [];
  } catch {
    return [];
  }
}

function save(list: number[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {}
}

export const useFavoritesStore = defineStore('favorites', {
  state: () => ({
    list: load() as number[]
  }),
  getters: {
    has:
      (state) =>
      (poemId: number): boolean =>
        state.list.includes(poemId)
  },
  actions: {
    add(poemId: number) {
      if (!this.list.includes(poemId)) {
        this.list.push(poemId);
        save(this.list);
      }
    },
    remove(poemId: number) {
      this.list = this.list.filter(id => id !== poemId);
      save(this.list);
    },
    toggle(poemId: number) {
      if (this.has(poemId)) {
        this.remove(poemId);
      } else {
        this.add(poemId);
      }
    },
    clear() {
      this.list = [];
      save(this.list);
    }
  }
});