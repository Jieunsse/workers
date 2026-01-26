import { useCallback, useEffect, useRef, useState } from 'react';

interface UseToastLifecycleOptions {
  isOpen: boolean;
  autoDismissMs: number;
  exitDurationMs: number;
  onDismiss?: () => void;
}

export default function useToastLifecycle({
  isOpen,
  autoDismissMs,
  exitDurationMs,
  onDismiss,
}: UseToastLifecycleOptions) {
  const [isRendered, setIsRendered] = useState(isOpen);
  const [isClosing, setIsClosing] = useState(false);
  const autoTimerRef = useRef<number | null>(null);
  const exitTimerRef = useRef<number | null>(null);
  const prevIsOpenRef = useRef(isOpen);

  const clearTimers = useCallback(() => {
    if (autoTimerRef.current) {
      window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    if (exitTimerRef.current) {
      window.clearTimeout(exitTimerRef.current);
      exitTimerRef.current = null;
    }
  }, []);

  const startDismiss = useCallback(() => {
    if (exitTimerRef.current) return;
    setIsClosing(true);
    exitTimerRef.current = window.setTimeout(() => {
      setIsRendered(false);
      setIsClosing(false);
      exitTimerRef.current = null;
      onDismiss?.();
    }, exitDurationMs);
  }, [exitDurationMs, onDismiss]);

  useEffect(() => {
    let rafId: number | null = null;
    const wasOpen = prevIsOpenRef.current;

    if (isOpen) {
      prevIsOpenRef.current = true;
      const isOpening = !wasOpen;
      if (isOpening) {
        clearTimers();
        rafId = window.requestAnimationFrame(() => {
          setIsRendered(true);
          setIsClosing(false);
        });
      }

      if ((isOpening || isRendered) && !isClosing && autoDismissMs > 0) {
        clearTimers();
        autoTimerRef.current = window.setTimeout(startDismiss, autoDismissMs);
      }

      return () => {
        if (rafId !== null) window.cancelAnimationFrame(rafId);
      };
    }

    if (isRendered && !isClosing) {
      clearTimers();
      rafId = window.requestAnimationFrame(() => startDismiss());
    }
    prevIsOpenRef.current = false;

    return () => {
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, [autoDismissMs, clearTimers, isClosing, isOpen, isRendered, startDismiss]);

  useEffect(() => () => clearTimers(), [clearTimers]);

  return { isRendered, isClosing };
}
