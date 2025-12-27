import Axios, { AxiosRequestConfig } from "axios";

// Использовать явное значение для URL API
const API_BASE_URL =
  process.env.NODE_ENV === "production"
    ? "https://api.dogappa.local:8443/" // TODO: заменить
    : "https://api.dogappa.local:8443/";

export const AXIOS_INSTANCE = Axios.create({
  baseURL: API_BASE_URL,
  timeout: 60000, // 1 минута (было 10 секунд)
  // Важно для cookie-based auth / установки Set-Cookie в браузере при запросах к API на другом origin (например, другой порт).
  // Браузер сохранит куки ТОЛЬКО если сервер прислал заголовок `Set-Cookie` и CORS разрешает credentials.
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Интерцептор для добавления JWT токена
AXIOS_INSTANCE.interceptors.request.use(
  (config) => {
    // Получаем токен из localStorage или Zustand store
    const token = localStorage.getItem("auth_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
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
