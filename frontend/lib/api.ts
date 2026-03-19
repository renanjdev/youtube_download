const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:8000';
const STORAGE_KEY = 'media-user-id';

const getOrCreateUserId = () => {
  if (typeof window === 'undefined') return '00000000-0000-0000-0000-000000000000';
  let userId = localStorage.getItem(STORAGE_KEY);
  if (!userId) {
    userId = crypto.randomUUID();
    localStorage.setItem(STORAGE_KEY, userId);
  }
  return userId;
};

const request = async (path: string, opts: RequestInit = {}, userId?: string) => {
  const headers = new Headers(opts.headers as HeadersInit);
  headers.set('X-User-Id', userId ?? getOrCreateUserId());
  if (opts.body) {
    headers.set('Content-Type', 'application/json');
  }
  const res = await fetch(${API_BASE}, { ...opts, headers });
  if (!res.ok) {
    const payload = await res.json().catch(() => ({}));
    throw new Error(payload.detail ?? 'Erro desconhecido');
  }
  if (res.status === 204) return null;
  return res.json();
};

export const createJob = async (payload: { url: string; mode: 'video' | 'audio'; type: 'single' | 'playlist' }) => {
  return request('/jobs', { method: 'POST', body: JSON.stringify(payload) });
};

export const listJobs = async () => {
  return request('/jobs');
};

export const getUserId = () => getOrCreateUserId();
