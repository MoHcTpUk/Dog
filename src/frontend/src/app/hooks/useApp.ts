import { useCallback } from "react";
import { useTranslation } from "react-i18next";
import { useHistory } from "react-router-dom";
import { useSessionStore } from "@entities/session";
import { getAccessToken } from "@shared/api/auth/session";

export const useApp = () => {
  const history = useHistory();
  const { i18n } = useTranslation();

  const {
    owner,
    isAuthenticated,
    token,
    isLoading,
    isInitializing,
    isOnboarded,
    currentDog,
    language,
    theme,
    setOwner,
    setToken,
    setLoading,
    setOnboarded,
    setCurrentDog,
    logout: logoutStore,
    setLanguage: setLanguageStore,
    setTheme,
  } = useSessionStore();

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
  }, [history, logoutStore]);

  const setLanguage = useCallback(
    (lang: string) => {
      setLanguageStore(lang);
      i18n.changeLanguage(lang);
    },
    [i18n, setLanguageStore]
  );

  const checkAuth = useCallback(() => {
    const storedToken = getAccessToken();

    if (storedToken && !token) {
      setToken(storedToken);
    }

    return Boolean(storedToken);
  }, [setToken, token]);

  return {
    owner,
    isAuthenticated,
    token,
    isLoading,
    isInitializing,
    isOnboarded,
    currentDog,
    language,
    theme,
    login,
    logout,
    setOwner,
    setLoading,
    setOnboarded,
    setCurrentDog,
    setLanguage,
    setTheme,
    checkAuth,
  };
};

export type UseAppReturn = ReturnType<typeof useApp>;
