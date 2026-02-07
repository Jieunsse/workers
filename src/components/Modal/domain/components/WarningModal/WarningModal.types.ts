import type { BaseDomainModalProps } from '../../types/types';

export interface WarningModalTextOptions {
  title?: string;
  description?: string;
  closeLabel?: string;
  confirmLabel?: string;
}

export interface WarningModalProps extends BaseDomainModalProps {
  onConfirm: () => void;
  text?: WarningModalTextOptions;
}
