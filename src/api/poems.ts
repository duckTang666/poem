import http from './http';

export type PoemDTO = {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string;
  appreciation?: string | null;
  favorite: 0 | 1 | boolean;
};

export type Result<T> = { code: number; data: T; message?: string };

export async function fetchPoems() {
  const res = await http.get<Result<PoemDTO[]>>('/poems');
  return res.data;
}

export async function fetchPoemById(id: number) {
  const res = await http.get<Result<PoemDTO>>(`/poems/${id}`);
  return res.data;
}

export async function togglePoemFavorite(id: number) {
  const res = await http.post<Result<{ id: number; favorite: boolean }>>(`/poems/${id}/favorite`);
  return res.data;
}