import type { BaseDomainModalProps } from '../../types/types';

export interface LogoutModalTextOptions {
  title?: string;
  closeLabel?: string;
  confirmLabel?: string;
}

export interface LogoutModalProps extends BaseDomainModalProps {
  onConfirm: () => void;
  text?: LogoutModalTextOptions;
}
