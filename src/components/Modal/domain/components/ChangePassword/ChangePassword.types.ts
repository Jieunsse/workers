import type { InputProps } from '@/components/input/types/types';
import type { BaseDomainModalProps } from '../../types/types';

export type PasswordInputFieldProps = Omit<
  InputProps,
  'className' | 'type' | 'name' | 'autoComplete' | 'placeholder'
>;

export interface ChangePasswordTextOptions {
  title?: string;
  newPasswordLabel?: string;
  confirmPasswordLabel?: string;
  newPasswordPlaceholder?: string;
  confirmPasswordPlaceholder?: string;
  closeLabel?: string;
  submitLabel?: string;
}

export interface ChangePasswordInputOptions {
  newPassword?: PasswordInputFieldProps;
  confirmPassword?: PasswordInputFieldProps;
}

export interface ChangePasswordProps extends BaseDomainModalProps {
  onSubmit: () => void;
  text?: ChangePasswordTextOptions;
  input?: ChangePasswordInputOptions;
}
