import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosResponse } from 'axios';

export interface Result<T> {
  code: number;
  message: string;
  data: T;
}

let token: string | null = null;
export function setToken(t: string | null) {
  token = t;
}

const http: AxiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  withCredentials: true
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
    // 统一日志
    console.error('[HTTP ERROR]', status, error?.message);
    return Promise.reject(error);
  }
);

export async function request<T>(config: AxiosRequestConfig): Promise<Result<T>> {
  const resp = await http.request<Result<T>>(config);
  return resp.data;
}

export default http;