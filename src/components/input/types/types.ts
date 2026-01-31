import { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

export type InputProps = ComponentPropsWithoutRef<'input'>;

export type PasswordInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'>;

export type TextAreaProps = ComponentPropsWithoutRef<'textarea'> & {
  ref?: Ref<HTMLTextAreaElement>;
};

export type ActionTextAreaProps = TextAreaProps & {
  onSubmit?: () => void;
  wrapperClassName?: string;
};

export type CommentInputProps = Omit<ActionTextAreaProps, 'wrapperClassName'>;

export type AccountInputProps = {
  email?: string;
  children?: ReactNode;
};

export type ChangePasswordProps = {
  isEditing?: boolean;
  newPasswordProps?: PasswordInputProps;
  confirmPasswordProps?: PasswordInputProps;
  children?: ReactNode;
};
