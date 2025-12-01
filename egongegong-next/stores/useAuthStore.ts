import { create } from 'zustand';
import type { User } from 'firebase/auth';

export interface AppUser {
  uid: string;
  email: string | null;
  role: 'admin' | 'user';
  status: 'active' | 'approved' | 'pending' | 'inactive';
  name?: string;
  displayName?: string;
}

interface AuthState {
  user: User | null;
  appUser: AppUser | null;
  loading: boolean;
  setUser: (user: User | null) => void;
  setAppUser: (appUser: AppUser | null) => void;
  setLoading: (loading: boolean) => void;
  signOut: () => void;
  reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  appUser: null,
  loading: true,
  
  setUser: (user) => set({ user }),
  setAppUser: (appUser) => set({ appUser }),
  setLoading: (loading) => set({ loading }),
  
  signOut: () =>
    set({
      user: null,
      appUser: null,
    }),
    
  reset: () =>
    set({
      user: null,
      appUser: null,
      loading: false,
    }),
}));
