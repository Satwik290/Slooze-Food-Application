import { create } from 'zustand';

interface Region {
  id: string;
  name: string;
}

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  regionId: string;
  region?: Region;
}

interface AppState {
  user: User | null;
  token: string | null;
  _hydrated: boolean;
  hydrate: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useStore = create<AppState>((set, get) => ({
  user: null,
  token: null,
  _hydrated: false,

  hydrate: () => {
    if (get()._hydrated) return;
    try {
      const token = localStorage.getItem('slooze_token');
      const raw = localStorage.getItem('slooze_user');
      const user: User | null = raw ? (JSON.parse(raw) as User) : null;
      set({ token, user, _hydrated: true });
    } catch {
      set({ _hydrated: true });
    }
  },

  setUser: (user) => {
    if (user) {
      localStorage.setItem('slooze_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('slooze_user');
    }
    set({ user });
  },

  setToken: (token) => {
    if (token) {
      localStorage.setItem('slooze_token', token);
    } else {
      localStorage.removeItem('slooze_token');
    }
    set({ token });
  },

  logout: () => {
    localStorage.removeItem('slooze_token');
    localStorage.removeItem('slooze_user');
    set({ user: null, token: null });
  },
}));