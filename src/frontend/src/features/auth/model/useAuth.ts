import { useState } from "react";
import { useAppStore } from "@shared/store/app.store";
import { authApi } from "../api/authApi";

export const useAuth = () => {
  const { setToken, logout: logoutStore } = useAppStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendVerificationCode = async (email: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.sendVerificationCode(email);
      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to send verification code";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const verifyCode = async (code: string, registrationId: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authApi.verifyCode(code, registrationId);

      setToken(response.accessToken);

      return response;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Invalid verification code";
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authApi.logout();
    logoutStore();
  };

  return {
    sendVerificationCode,
    verifyCode,
    logout,
    isLoading,
    error,
  };
};
