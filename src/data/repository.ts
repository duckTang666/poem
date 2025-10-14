import { useFavoritesStore } from '../stores/favorites';
import { fetchPoems, togglePoemFavorite, type PoemDTO } from '../api/poems';

export type PoemRecord = {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string;
  appreciation?: string | null;
  favorite: boolean;
  image?: string; // 保持与视图兼容（后端暂无则为空）
};

// 获取所有诗词（来自后端），并合并收藏状态（以用户收藏为准）
export async function getAllPoems(): Promise<PoemRecord[]> {
  const fav = safeFavorites();
  const titles = new Set<string>((fav?.titles as string[]) || []);
  const res = await fetchPoems(); // Result<PoemDTO[]>
  const list = res.data || [];
  return list.map(mapDtoToRecord(titles));
}

// 根据标题获取单条（从后端列表中过滤）
export async function getPoemByTitle(title: string): Promise<PoemRecord | undefined> {
  const all = await getAllPoems();
  return all.find((p) => p.title === title);
}

// 切换收藏状态：后端更新 + 本地收藏 store 同步
export async function toggleFavorite(poem: PoemRecord) {
  if (!poem?.id) return;
  await togglePoemFavorite(poem.id);
  const fav = safeFavorites(true);
  if (!fav) return;
  const plain = {
    title: poem.title,
    author: poem.author,
    dynasty: poem.dynasty,
    preview: (poem.appreciation || poem.content || '').slice(0, 30) + '…',
    image: (poem as any).image || ''
  };
  fav.toggle(plain as any);
}

function mapDtoToRecord(titles: Set<string>) {
  return (dto: PoemDTO): PoemRecord => ({
    id: dto.id,
    title: dto.title,
    author: dto.author,
    dynasty: dto.dynasty,
    content: dto.content,
    appreciation: dto.appreciation ?? null,
    favorite: titles.has(dto.title) ? true : dto.favorite === true || dto.favorite === 1,
    image: (dto as any).image || '' // 后端若无该字段则为空
  });
}

// 优雅获取收藏 store（在组件外调用时避免 SSR/初始化问题）
function safeFavorites(mutate = false): any {
  try {
    const store = useFavoritesStore();
    return mutate ? store : { titles: store.titles };
  } catch {
    return null;
  }
}