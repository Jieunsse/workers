import type { ReactNode } from 'react';

export type CheckBoxSize = 'large' | 'small';

export type CheckBoxIconSet = {
  checked: ReactNode;
  unchecked: ReactNode;
};

export type CheckBoxOptions = {
  ariaLabel?: string;
  readOnly?: boolean;
  icons?: CheckBoxIconSet;
};

export type CheckBoxOptionsWithAriaLabel = Omit<CheckBoxOptions, 'ariaLabel'> & {
  ariaLabel: string;
};

interface CheckBoxBaseProps {
  checked: boolean;
  size?: CheckBoxSize;
  id?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  onCheckedChange?: (checked: boolean) => void;
}

export type CheckBoxProps =
  | (CheckBoxBaseProps & {
      label: ReactNode;
      options?: CheckBoxOptions;
    })
  | (CheckBoxBaseProps & {
      label?: undefined;
      options: CheckBoxOptionsWithAriaLabel;
    });
