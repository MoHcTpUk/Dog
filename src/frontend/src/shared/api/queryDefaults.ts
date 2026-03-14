import { isAxiosError } from "axios";

export const SESSION_QUERY_STALE_TIME = 5 * 60 * 1000;

export const shouldRetryQuery = (
  failureCount: number,
  error: unknown
) => {
  if (failureCount >= 1) {
    return false;
  }

  if (isAxiosError(error)) {
    if (error.code === "ERR_CANCELED") {
      return false;
    }

    const status = error.response?.status;

    if (status == null) {
      return true;
    }

    return status >= 500 || status === 408 || status === 429;
  }

  return true;
};
