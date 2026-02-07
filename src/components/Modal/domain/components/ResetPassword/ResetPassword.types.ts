import type { InputProps } from '@/components/input/types/types';
import type { BaseDomainModalProps } from '../../types/types';

export type EmailInputFieldProps = Omit<
  InputProps,
  'className' | 'type' | 'name' | 'autoComplete' | 'placeholder'
>;

export interface ResetPasswordTextOptions {
  title?: string;
  description?: string;
  closeLabel?: string;
  submitLabel?: string;
  emailPlaceholder?: string;
}

export interface ResetPasswordInputOptions {
  email?: EmailInputFieldProps;
}

export interface ResetPasswordProps extends BaseDomainModalProps {
  onSubmit: () => void;
  text?: ResetPasswordTextOptions;
  input?: ResetPasswordInputOptions;
}
