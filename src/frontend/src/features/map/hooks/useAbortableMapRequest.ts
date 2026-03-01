import { useCallback, useEffect, useRef } from "react";

type MapCoordinates = [number, number];

interface UseAbortableMapRequestOptions<TResult> {
  request: (coords: MapCoordinates, signal?: AbortSignal) => Promise<TResult>;
  onStart?: () => void;
  onSuccess: (result: TResult) => void;
  onError?: (error: unknown) => void;
  onFinally?: () => void;
  debounceMs?: number;
}

export const useAbortableMapRequest = <TResult>({
  request,
  onStart,
  onSuccess,
  onError,
  onFinally,
  debounceMs = 500,
}: UseAbortableMapRequestOptions<TResult>) => {
  const abortRef = useRef<AbortController | null>(null);
  const debounceRef = useRef<number | null>(null);
  const requestRef = useRef(request);
  const onStartRef = useRef(onStart);
  const onSuccessRef = useRef(onSuccess);
  const onErrorRef = useRef(onError);
  const onFinallyRef = useRef(onFinally);

  requestRef.current = request;
  onStartRef.current = onStart;
  onSuccessRef.current = onSuccess;
  onErrorRef.current = onError;
  onFinallyRef.current = onFinally;

  const cancelRequest = useCallback(() => {
    if (debounceRef.current) {
      window.clearTimeout(debounceRef.current);
      debounceRef.current = null;
    }

    abortRef.current?.abort();
    abortRef.current = null;
  }, []);

  const runRequest = useCallback(async (coords: MapCoordinates) => {
    abortRef.current?.abort();

    const controller = new AbortController();
    abortRef.current = controller;

    onStartRef.current?.();

    try {
      const result = await requestRef.current(coords, controller.signal);

      if (!controller.signal.aborted) {
        onSuccessRef.current(result);
      }
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      if (!controller.signal.aborted) {
        onErrorRef.current?.(error);
      }
    } finally {
      if (!controller.signal.aborted) {
        onFinallyRef.current?.();
      }

      if (abortRef.current === controller) {
        abortRef.current = null;
      }
    }
  }, []);

  const scheduleRequest = useCallback(
    (coords: MapCoordinates, delay = debounceMs) => {
      if (debounceRef.current) {
        window.clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        debounceRef.current = null;
        void runRequest(coords);
      }, delay);
    },
    [debounceMs, runRequest],
  );

  useEffect(() => cancelRequest, [cancelRequest]);

  return {
    runRequest,
    scheduleRequest,
    cancelRequest,
  };
};
