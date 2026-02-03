import type { ReactNode } from 'react';

export type DropdownMenuSize = 'default' | 'small' | 'repeat';

export interface DropdownItemData {
  value: string;
  label: ReactNode;
}

export interface DropdownProps {
  items: DropdownItemData[];
  defaultValue?: string;
  value?: string;
  placeholder?: string;
  size?: DropdownMenuSize;
  disabled?: boolean;
  ariaLabel?: string;
  className?: string;
  buttonClassName?: string;
  menuClassName?: string;
  itemClassName?: string;
  onChange?: (value: string) => void;
}

export interface DropdownItemProps {
  label: ReactNode;
  isSelected: boolean;
  size: DropdownMenuSize;
  className?: string;
  onSelect: () => void;
  tabIndex?: number;
  onFocus?: () => void;
}

export interface UseDropdownOptions {
  items: DropdownItemData[];
  defaultValue?: string;
  value?: string;
  disabled?: boolean;
  onChange?: (value: string) => void;
}
