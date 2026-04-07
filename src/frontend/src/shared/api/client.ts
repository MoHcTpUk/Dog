import Axios, { AxiosRequestConfig } from "axios";
import { getAccessToken } from "./auth/session";

export const API_BASE_URL =
  "https://api.dogappa.com";

export const resolveApiPath = (path: string) => {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;

  return API_BASE_URL ? `${API_BASE_URL}${normalizedPath}` : normalizedPath;
};

export const AXIOS_INSTANCE = Axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  paramsSerializer: {
    indexes: null,
  },
  headers: {
    "Content-Type": "application/json",
  },
});

AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    if (typeof FormData !== "undefined" && config.data instanceof FormData) {
      if (typeof config.headers?.delete === "function") {
        config.headers.delete("Content-Type");
      } else if (config.headers) {
        delete (config.headers as Record<string, unknown>)["Content-Type"];
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Функция-клиент для Orval - имя должно совпадать с тем, что указано в orval.config.ts
export const customInstance = <T>(config: AxiosRequestConfig): Promise<T> => {
  const source = Axios.CancelToken.source();
  const promise = AXIOS_INSTANCE({
    ...config,
    cancelToken: source.token,
  }).then(({ data }) => data);

  // @ts-expect-error - нужно для совместимости с React Query
  promise.cancel = () => {
    source.cancel("Query was cancelled");
  };

  return promise;
};
