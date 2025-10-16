import { supabaseRequest, supabaseInsert, supabaseUpdate } from './http';

export type PoemDTO = {
  id: number;
  title: string;
  author: string;
  dynasty: string;
  content: string;
  appreciation?: string | null;
  favorite: boolean;
  created_at?: string;
  updated_at?: string;
};

const TABLE_NAME = 'poems';

// 创建poems表的SQL语句
export const CREATE_POEMS_TABLE_SQL = `
CREATE TABLE IF NOT EXISTS poems (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  dynasty TEXT NOT NULL,
  content TEXT NOT NULL,
  appreciation TEXT,
  favorite BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_poems_updated_at
BEFORE UPDATE ON poems
FOR EACH ROW EXECUTE FUNCTION update_updated_at();
`;

export async function fetchPoems(): Promise<PoemDTO[]> {
  try {
    return await supabaseRequest<PoemDTO>(TABLE_NAME, {
      params: {
        select: '*',
        order: 'created_at.desc'
      }
    });
  } catch (error) {
    console.error('Failed to fetch poems:', error);
    return [];
  }
}

export async function fetchPoemById(id: number): Promise<PoemDTO | null> {
  try {
    const { data } = await supabaseRequest<PoemDTO>(TABLE_NAME, {
      params: {
        id: `eq.${id}`,
        select: '*'
      }
    });
    return data[0] || null;
  } catch (error) {
    console.error(`Failed to fetch poem ${id}:`, error);
    return null;
  }
}

export async function togglePoemFavorite(id: number): Promise<PoemDTO | null> {
  try {
    const poem = await fetchPoemById(id);
    if (!poem) return null;
    
    return await supabaseUpdate<PoemDTO>(TABLE_NAME, id, {
      favorite: !poem.favorite
    });
  } catch (error) {
    console.error(`Failed to toggle favorite for poem ${id}:`, error);
    return null;
  }
}

export async function createPoem(poem: Omit<PoemDTO, 'id'>): Promise<PoemDTO | null> {
  try {
    return await supabaseInsert<PoemDTO>(TABLE_NAME, poem);
  } catch (error) {
    console.error('Failed to create poem:', error);
    return null;
  }
}