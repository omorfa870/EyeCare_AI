'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Role = 'patient' | 'doctor' | 'admin' | null;

interface AuthState {
  user: any | null;
  role: Role;
  roleData: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isHydrated: boolean;
  setAuth: (user: any, token: string, roleData: any) => void;
  logout: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      role: null,
      roleData: null,
      token: null,
      isAuthenticated: false,
      isHydrated: false,
      setAuth: (user, token, roleData) =>
        set({
          user,
          token,
          role: user?.role ?? null,
          roleData,
          isAuthenticated: true,
        }),
      logout: () =>
        set({
          user: null,
          role: null,
          roleData: null,
          token: null,
          isAuthenticated: false,
        }),
      setHydrated: () => set({ isHydrated: true }),
    }),
    {
      name: 'auth',
      onRehydrateStorage: () => (state) => {
        if (state) state.setHydrated();
      },
    }
  )
);
