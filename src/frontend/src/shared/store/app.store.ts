// src/shared/store/app.store.ts
import { create } from "zustand";
import { devtools, persist } from "zustand/middleware";

export interface OwnerProfile {
  id: string | null;
  name: string;
  birthdate: string | null;
}

export interface CurrentDogProfile {
  id: string | null;
  name: string;
  avatar?: string | null;
  breed?: string | null;
  age?: number | null;
}

interface HydrateSessionPayload {
  token?: string | null;
  owner: OwnerProfile | null;
  currentDog: CurrentDogProfile | null;
  isOnboarded: boolean;
}

export interface AppState {
  // Session data
  owner: OwnerProfile | null;
  isAuthenticated: boolean;
  token: string | null;

  // Dog data
  currentDog: CurrentDogProfile | null;
  setCurrentDog: (dog: CurrentDogProfile | null) => void;

  // App state
  isLoading: boolean;
  isInitializing: boolean;
  isOnboarded: boolean;

  // Actions
  setOwner: (owner: OwnerProfile | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  setInitializing: (initializing: boolean) => void;
  setOnboarded: (onboarded: boolean) => void;
  hydrateSession: (payload: HydrateSessionPayload) => void;
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
        owner: null,
        isAuthenticated: false,
        token: null,
        currentDog: null,
        isLoading: false,
        isInitializing: true,
        isOnboarded: false,
        language: "en",
        theme: "auto",

        // Actions
        setOwner: (owner) => set({ owner }),

        setToken: (token) =>
          set({
            token,
            isAuthenticated: !!token,
          }),

        setCurrentDog: (currentDog) => set({ currentDog }),

        setLoading: (isLoading) => set({ isLoading }),

        setInitializing: (isInitializing) => set({ isInitializing }),

        setOnboarded: (isOnboarded) => set({ isOnboarded }),

        hydrateSession: ({ token, owner, currentDog, isOnboarded }) =>
          set((state) => ({
            token: token === undefined ? state.token : token,
            isAuthenticated:
              token === undefined ? state.isAuthenticated : !!token,
            owner,
            currentDog,
            isOnboarded,
          })),

        logout: () =>
          set({
            owner: null,
            token: null,
            currentDog: null,
            isAuthenticated: false,
            isOnboarded: false,
            isInitializing: false,
          }),

        setLanguage: (language) => set({ language }),

        setTheme: (theme) => set({ theme }),
      }),
      {
        name: "app-storage",
        partialize: (state) => ({
          owner: state.owner,
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
