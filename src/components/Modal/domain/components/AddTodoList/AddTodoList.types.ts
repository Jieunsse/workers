import type { InputProps } from '@/components/input/types/types';
import type { BaseDomainModalProps } from '../../types/types';

export type TodoInputProps = Omit<InputProps, 'className' | 'type' | 'name' | 'placeholder'>;

export interface AddTodoListTextOptions {
  title?: string;
  submitLabel?: string;
  inputPlaceholder?: string;
}

export interface AddTodoListInputOptions {
  props?: TodoInputProps;
}

export interface AddTodoListProps extends BaseDomainModalProps {
  onSubmit: () => void;
  text?: AddTodoListTextOptions;
  input?: AddTodoListInputOptions;
}
