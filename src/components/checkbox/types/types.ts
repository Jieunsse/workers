export type CheckBoxSize = 'large' | 'small';

interface CheckBoxBaseProps {
  isChecked: boolean;
  size?: CheckBoxSize;
  id?: string;
  name?: string;
  value?: string;
  disabled?: boolean;
  className?: string;
  onChange?: (isChecked: boolean) => void;
}

export interface CheckBoxPropsWithLabel extends CheckBoxBaseProps {
  label: string;
  ariaLabel?: string;
}

export interface CheckBoxPropsWithAriaLabel extends CheckBoxBaseProps {
  label?: undefined;
  ariaLabel: string;
}

export type CheckBoxProps = CheckBoxPropsWithLabel | CheckBoxPropsWithAriaLabel;
