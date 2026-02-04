import { ReactNode } from 'react';

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  children?: ReactNode;
  ariaDescribedby?: string;
  className?: string;
  closeOnOverlayClick?: boolean;
  closeOnEscape?: boolean;
}

export type ModalProps =
  | (BaseModalProps & { ariaLabel: string; ariaLabelledby?: never })
  | (BaseModalProps & { ariaLabel?: never; ariaLabelledby: string });
