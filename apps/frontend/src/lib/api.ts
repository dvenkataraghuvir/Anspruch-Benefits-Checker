import type { EligibilityResult, UserSituation } from '../contract/types';

// The frontend holds NO secrets and never calls an LLM/provider directly.
// Every call goes to our own backend; auth rides on an httpOnly cookie.
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function post<T>(path: string, body: unknown): Promise<T> {
  const res = await fetch(`${API_BASE}/api/v1${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    throw new Error(`Request failed: ${res.status}`);
  }
  return (await res.json()) as T;
}

export const api = {
  assess(situation: UserSituation): Promise<EligibilityResult[]> {
    return post<EligibilityResult[]>('/eligibility/assess', { situation });
  },
};
