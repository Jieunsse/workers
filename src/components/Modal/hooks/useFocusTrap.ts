import { useEffect, useRef, useCallback } from 'react';
import { getFocusableElements } from '../utils/focusable';
import type React from 'react';

export function useFocusTrap(isOpen: boolean, dialogRef: React.RefObject<HTMLDivElement | null>) {
  const lastActiveElementRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    const dialogEl = dialogRef.current;
    if (!dialogEl) return;

    lastActiveElementRef.current = document.activeElement as HTMLElement | null;

    const focusable = getFocusableElements(dialogEl);
    (focusable[0] ?? dialogEl).focus();

    return () => {
      lastActiveElementRef.current?.focus?.();
    };
  }, [isOpen, dialogRef]);

  const onKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLDivElement>) => {
      if (e.key !== 'Tab') return;

      const dialogEl = dialogRef.current;
      if (!dialogEl) return;

      const focusable = getFocusableElements(dialogEl);
      if (focusable.length === 0) {
        e.preventDefault();
        dialogEl.focus();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    },
    [dialogRef],
  );

  return { onKeyDown };
}
