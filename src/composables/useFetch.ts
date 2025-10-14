import { ref } from 'vue';

export function useFetch<T>() {
  const loading = ref(false);
  const error = ref<string | null>(null);
  const data = ref<T | null>(null);
  let controller: AbortController | null = null;

  async function run(url: string, init?: RequestInit) {
    loading.value = true;
    error.value = null;
    data.value = null;
    controller?.abort();
    controller = new AbortController();
    try {
      const resp = await fetch(url, { ...(init || {}), signal: controller.signal });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      data.value = (await resp.json()) as T;
    } catch (e: any) {
      error.value = e?.message ?? 'Unknown error';
    } finally {
      loading.value = false;
    }
  }

  function cancel() {
    controller?.abort();
  }

  return { loading, error, data, run, cancel };
}