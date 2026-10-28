import { request, setToken } from './api';

export interface User {
  uid: string;
  email: string | null;
  username?: string;
}

let currentUser: User | null = null;
type Listener = (user: User | null) => void;
const listeners = new Set<Listener>();

const setUser = (user: User | null) => {
  currentUser = user;
  listeners.forEach((l) => l(user));
};

export const getCurrentUser = () => currentUser;

// Replacement for Firebase's onAuthStateChanged
export const onAuthChange = (listener: Listener): (() => void) => {
  listeners.add(listener);
  listener(currentUser);
  return () => {
    listeners.delete(listener);
  };
};

// identifier = e-mail or User ID
export const login = async (identifier: string, password: string): Promise<User> => {
  const data = await request<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: { identifier, password },
  });
  setToken(data.token);
  setUser(data.user);
  return data.user;
};

export const signup = async (username: string, email: string, password: string): Promise<User> => {
  const data = await request<{ token: string; user: User }>('/auth/signup', {
    method: 'POST',
    body: { username, email, password },
  });
  setToken(data.token);
  setUser(data.user);
  return data.user;
};

export const logout = async (): Promise<void> => {
  setToken(null);
  setUser(null);
};

export const resetPassword = async (email: string): Promise<void> => {
  await request('/auth/forgot-password', { method: 'POST', body: { email } });
};
