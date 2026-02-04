import type { ReactNode } from 'react';

export interface ToastProps {
  message?: ReactNode;
  actionLabel?: ReactNode;
  isOpen?: boolean;
  autoDismissMs?: number;
  enterDurationMs?: number;
  exitDurationMs?: number;
  className?: string;
  actionClassName?: string;
  onAction?: () => void;
  onDismiss?: () => void;
}
