// src/shared/store/app.store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  about?: string | null;
  avatar?: string;
  age?: number;
  gender?: "male" | "female" | "other";
  categories?: string[];
  contactMethod?: string;
  country?: string;
  city?: string;
  isOnboarded?: boolean;
}

export interface Dog {
  id: string;
  name: string;
  avatar: string;
  breed?: string;
  age?: number;
}

export interface AppState {
  // User data
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;

  // Dog data
  currentDog: Dog | null;
  setCurrentDog: (dog: Dog | null) => void;

  // App state
  isLoading: boolean;
  isInitializing: boolean;
  isOnboarded: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitializing: (initializing: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  initializeApp: () => Promise<void>;
  logout: () => void;

  // Preferences
  language: string;
  theme: "light" | "dark" | "auto";
  setLanguage: (language: string) => void;
  setTheme: (theme: "light" | "dark" | "auto") => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        token: null,
        currentDog: null,
        isLoading: false,
        isInitializing: true,
        isOnboarded: false,
        language: "en",
        theme: "auto",

        // Actions
        setUser: (user) =>
          set({
            user,
            isAuthenticated: !!user,
          }),

        setToken: (token) =>
          set({
            token,
            isAuthenticated: !!token,
          }),

        setCurrentDog: (currentDog) => set({ currentDog }),

        setLoading: (isLoading) => set({ isLoading }),

        setInitializing: (isInitializing) => set({ isInitializing }),

        initializeApp: async () => {
          set({ isInitializing: true });

          await new Promise(resolve => setTimeout(resolve, 2000));

          set({
            isInitializing: false,
            currentDog: {
              id: "1",
              name: "Рекс",
              avatar: "https://placehold.co/28x28/FF6B9D/white?text=R",
              breed: "Лабрадор",
              age: 3,
            }
          });
        },

        setOnboarded: (isOnboarded) => set({ isOnboarded }),

        logout: () =>
          set({
            user: null,
            token: null,
            currentDog: null,
            isAuthenticated: false,
            isOnboarded: false,
          }),

        setLanguage: (language) => set({ language }),

        setTheme: (theme) => set({ theme }),
      }),
      {
        name: "app-storage",
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          currentDog: state.currentDog,
          isOnboarded: state.isOnboarded,
          language: state.language,
          theme: state.theme,
        }),
      }
    )
  )
);
