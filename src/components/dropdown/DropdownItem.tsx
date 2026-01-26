import clsx from 'clsx';

import styles from './styles/DropdownItem.module.css';
import type { DropdownItemProps } from './types/types';

export default function DropdownItem({
  label,
  isSelected,
  size,
  className,
  onSelect,
}: DropdownItemProps) {
  return (
    <button
      type="button"
      className={clsx(styles.item, styles[size], isSelected && styles.selected, className)}
      role="option"
      aria-selected={isSelected}
      onClick={onSelect}
    >
      {label}
    </button>
  );
}
