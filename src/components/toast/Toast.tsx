'use client';

import clsx from 'clsx';

import useToastLifecycle from './hooks/useToastLifecycle';
import styles from './styles/Toast.module.css';
import type { ToastProps } from './types/types';

const DEFAULT_AUTO_DISMISS_MS = 3000;
const DEFAULT_ANIMATION_MS = 600;

export default function Toast({
  message = '저장하지 않은 변경사항이 있어요!',
  actionLabel = '변경사항 저장하기',
  isOpen = true,
  autoDismissMs = DEFAULT_AUTO_DISMISS_MS,
  enterDurationMs = DEFAULT_ANIMATION_MS,
  exitDurationMs = DEFAULT_ANIMATION_MS,
  className,
  actionClassName,
  onAction,
  onDismiss,
}: ToastProps) {
  const { isRendered, isClosing } = useToastLifecycle({
    isOpen,
    autoDismissMs,
    exitDurationMs,
    onDismiss,
  });

  return isRendered ? (
    <div
      className={clsx(styles.toast, isClosing ? styles.exit : styles.enter, className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{ animationDuration: `${isClosing ? exitDurationMs : enterDurationMs}ms` }}
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <circle cx="10" cy="10" r="9" stroke="white" strokeWidth="2" />
            <line x1="10" y1="6" x2="10" y2="11" stroke="white" strokeWidth="2" />
            <circle cx="10" cy="14" r="1.3" fill="white" />
          </svg>
        </span>
        <span className={styles.message}>{message}</span>
      </div>
      {actionLabel ? (
        <button type="button" className={clsx(styles.action, actionClassName)} onClick={onAction}>
          {actionLabel}
        </button>
      ) : null}
    </div>
  ) : null;
}
