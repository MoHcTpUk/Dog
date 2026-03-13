// src/shared/hooks/useApp.ts
import { getAccessToken } from "@shared/api/auth/session";
import { useAppStore } from "@store/app.store";
import { useCallback } from "react";
import { useHistory } from "react-router-dom";
import { useTranslation } from "react-i18next";

export const useApp = () => {
  const history = useHistory();
  const { i18n } = useTranslation();

  const {
    owner,
    isAuthenticated,
    token,
    isLoading,
    isOnboarded,
    language,
    theme,
    setOwner,
    setToken,
    setLoading,
    setOnboarded,
    logout: logoutStore,
    setLanguage: setLanguageStore,
    setTheme,
  } = useAppStore();

  const login = useCallback(
    (nextToken: string) => {
      setToken(nextToken);
      history.push("/");
    },
    [history, setToken]
  );

  const logout = useCallback(() => {
    logoutStore();
    history.push("/welcome");
  }, [logoutStore, history]);

  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageStore(lang);
      i18n.changeLanguage(lang);
    },
    [setLanguageStore, i18n]
  );

  const checkAuth = useCallback(() => {
    const storedToken = getAccessToken();
    if (storedToken && !token) {
      setToken(storedToken);
    }
    return !!storedToken;
  }, [token, setToken]);

  return {
    // State
    owner,
    isAuthenticated,
    token,
    isLoading,
    isOnboarded,
    language,
    theme,

    // Actions
    login,
    logout,
    setOwner,
    setLoading,
    setOnboarded,
    setLanguage,
    setTheme,
    checkAuth,
  };
};

// Export types for convenience
export type UseAppReturn = ReturnType<typeof useApp>;
