import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

// Supabase REST API 配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseKey = import.meta.env.VITE_SUPABASE_KEY || '';

let token: string | null = null;
export function setToken(t: string | null) {
  token = t;
}

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true
});

// Supabase专用实例
const supabaseHttp: AxiosInstance = axios.create({
  baseURL: `${supabaseUrl.replace(/\/$/, '')}/rest/v1`,
  timeout: 10000,
  headers: {
    'apikey': supabaseKey,
    'Authorization': `Bearer ${supabaseKey}`,
    'Content-Type': 'application/json',
    'Prefer': 'return=representation'
  } as Record<string, string>
});

http.interceptors.request.use((config) => {
  if (token) {
    config.headers = { ...(config.headers || {}), Authorization: `Bearer ${token}` };
  }
  return config;
});

http.interceptors.response.use(
  (resp: AxiosResponse<Result<unknown>>) => resp,
  async (error) => {
    const status = error?.response?.status;
    if (status === 401) {
      // TODO: 刷新令牌或跳转登录
    }
    console.error('[HTTP ERROR]', status, error?.message);
    return Promise.reject(error);
  }
);

// Supabase API 方法
export async function supabaseRequest<T>(table: string, config: AxiosRequestConfig = {}): Promise<T[]> {
  try {
    // 验证表名有效性
    if (!table || !/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(table)) {
      throw new Error(`无效的表名: ${table}`);
    }

    // 确保不包含无效字段
    const safeConfig = {
      ...config,
      params: {
        ...config.params,
        select: '*',
        order: config.params?.order?.replace('created_at', 'id') // 替换无效排序字段
      }
    };

    const resp = await supabaseHttp.get<T[]>(`/${table}`, safeConfig);

    if (resp.status === 404) {
      throw new Error(`表 ${table} 不存在或无权访问`);
    }

    return resp.data || [];
  } catch (error: any) {
    console.error(`Supabase请求错误[${table}]:`, error);
    throw new Error(`Supabase请求失败: ${error.response?.data?.message || error.message}`);
  }
}

export async function supabaseInsert<T>(table: string, data: any): Promise<T> {
  try {
    const resp = await supabaseHttp.post<T>(table, data, {
      params: {
        select: '*'
      },
      headers: {
        'Prefer': 'return=representation'
      }
    });
    return resp.data;
  } catch (error) {
    console.error(`Supabase插入错误[${table}]:`, error);
    throw new Error(`数据插入失败: ${error.message}`);
  }
}

export async function supabaseUpdate<T>(table: string, id: number, data: Partial<T>): Promise<T> {
  try {
    const resp = await supabaseHttp.patch<T>(`${table}?id=eq.${id}`, data, {
      params: {
        select: '*'
      },
      headers: {
        'Prefer': 'return=representation'
      }
    });
    return resp.data;
  } catch (error) {
    console.error(`Supabase更新错误[${table}#${id}]:`, error);
    throw new Error(`数据更新失败: ${error.message}`);
  }
}

// 新增：删除数据方法
export async function supabaseDelete<T>(table: string, id: number): Promise<boolean> {
  try {
    await supabaseHttp.delete(`${table}?id=eq.${id}`);
    return true;
  } catch (error) {
    console.error(`Supabase删除错误[${table}#${id}]:`, error);
    throw new Error(`数据删除失败: ${error.message}`);
  }
}

// 批量插入数据
export async function supabaseBulkInsert<T>(table: string, data: T[]): Promise<T[]> {
  const results: T[] = [];
  for (const item of data) {
    try {
      const inserted = await supabaseInsert<T>(table, item);
      results.push(inserted);
    } catch (e: any) {
      console.error(`插入失败: ${JSON.stringify(item)}`, e);
    }
  }
  return results;
}

export async function request<T>(config: AxiosRequestConfig): Promise<Result<T>> {
  const resp = await http.request<Result<T>>(config);
  return resp.data;
}

export default http;