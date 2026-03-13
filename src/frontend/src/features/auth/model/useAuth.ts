import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAppStore } from "@shared/store/app.store";
import { getGetOwnersGetQueryKey, getGetDogsGetQueryKey } from "@shared/api/generated";
import { authApi } from "../api/authApi";

export const useAuth = () => {
  const { setToken, logout: logoutStore } = useAppStore();
  const queryClient = useQueryClient();
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

      await queryClient.invalidateQueries({ queryKey: getGetOwnersGetQueryKey() });
      await queryClient.invalidateQueries({ queryKey: getGetDogsGetQueryKey() });

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
    queryClient.clear();
  };

  return {
    sendVerificationCode,
    verifyCode,
    logout,
    isLoading,
    error,
  };
};
