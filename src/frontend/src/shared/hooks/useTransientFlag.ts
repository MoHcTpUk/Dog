import { useCallback, useEffect, useRef, useState } from "react";

export const useTransientFlag = (timeoutMs = 3000) => {
  const [isVisible, setIsVisible] = useState(false);
  const timerRef = useRef<number | null>(null);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const hide = useCallback(() => {
    clearTimer();
    setIsVisible(false);
  }, [clearTimer]);

  const show = useCallback(() => {
    setIsVisible(true);
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      setIsVisible(false);
      timerRef.current = null;
    }, timeoutMs);
  }, [clearTimer, timeoutMs]);

  useEffect(() => clearTimer, [clearTimer]);

  return {
    isVisible,
    show,
    hide,
    setIsVisible,
  };
};
