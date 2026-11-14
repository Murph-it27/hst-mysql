import { API_URL } from '../config/api';

// JWT kept in memory only (same behaviour as before: you log in again after restarting the app)
let authToken: string | null = null;
export const setToken = (token: string | null) => {
  authToken = token;
};
export const getToken = () => authToken;

export async function request<T = any>(path: string, options: { method?: string; body?: unknown } = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
      },
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });
  } catch {
    throw new Error('Cannot reach the server. Check your connection and the API address.');
  }

  let data: any = null;
  try {
    data = await response.json();
  } catch {
    // empty / non-JSON body
  }
  if (!response.ok) {
    throw new Error(data?.error || `Request failed (${response.status})`);
  }
  return data as T;
}
