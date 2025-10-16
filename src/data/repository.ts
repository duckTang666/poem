import { useFavoritesStore } from '../stores/favorites';
import { supabase } from '../api/supabase';

export interface PoemRecord {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string;
  appreciation?: string | null;
  favorite: boolean;
  image?: string;
  created_at?: string;
}

// 直接从Supabase获取诗词数据
export async function getAllPoems(): Promise<PoemRecord[]> {
  try {
    const favStore = useFavoritesStore();
    const favoriteTitles = new Set(favStore.list.map(id => id.toString()));
    
    const { data, error } = await supabase
      .from('poems')
      .select('*');

    if (error) throw error;
    
    return (data || []).map(poem => ({
      id: poem.id,
      title: poem.title,
      author: poem.author,
      dynasty: poem.dynasty,
      content: poem.content,
      appreciation: poem.appreciation,
      favorite: favoriteTitles.has(poem.id.toString()) || poem.favorite,
      image: poem.image,
      created_at: poem.created_at
    }));
  } catch (error) {
    console.error('获取诗词失败:', error);
    return [];
  }
}

// 根据分类获取诗词
export async function getPoemsByCategory(category: string): Promise<PoemRecord[]> {
  try {
    const favStore = useFavoritesStore();
    const favoriteTitles = new Set(favStore.list.map(id => id.toString()));

    // 处理朝代分类
    const dynastyMap: Record<string, string> = {
      '唐诗': '唐',
      '宋词': '宋',
      '元曲': '元',
      '现代诗': '近现代'
    };

    let query = supabase
      .from('poems')
      .select('*');

    if (dynastyMap[category]) {
      query = query.ilike('dynasty', `%${dynastyMap[category]}%`);
    } else {
      // 处理作者分类
      const authorMap: Record<string, string> = {
        '李白': '李白',
        '苏轼': '苏轼',
        '李清照': '李清照'
      };

      if (authorMap[category]) {
        query = query.eq('author', authorMap[category]);
      } else {
        // 处理主题分类
        query = query.or(`content.ilike.%${category}%,appreciation.ilike.%${category}%`);
      }
    }

    const { data, error } = await query;

    if (error) throw error;
    
    return (data || []).map(poem => ({
      id: poem.id,
      title: poem.title,
      author: poem.author,
      dynasty: poem.dynasty,
      content: poem.content,
      appreciation: poem.appreciation,
      favorite: favoriteTitles.has(poem.id.toString()) || poem.favorite,
      image: poem.image,
      created_at: poem.created_at
    }));
  } catch (error) {
    console.error(`获取"${category}"分类诗词失败:`, error);
    return [];
  }
}

// 根据标题获取单条诗词
export async function getPoemByTitle(title: string): Promise<PoemRecord | null> {
  try {
    const { data, error } = await supabase
      .from('poems')
      .select('*')
      .eq('title', title)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error(`获取诗词"${title}"失败:`, error);
    return null;
  }
}

// 切换收藏状态
export async function toggleFavorite(poem: PoemRecord) {
  if (!poem?.id) return;
  
  try {
    const favStore = useFavoritesStore();
    const newFavoriteState = !favStore.list.includes(poem.id);
    
    // 更新Supabase中的收藏状态
    const { error } = await supabase
      .from('poems')
      .update({ favorite: newFavoriteState })
      .eq('id', poem.id);

    if (error) throw error;

    // 更新本地收藏状态
    if (newFavoriteState) {
      favStore.add(poem.id);
    } else {
      favStore.remove(poem.id);
    }
  } catch (error) {
    console.error('切换收藏状态失败:', error);
  }
}