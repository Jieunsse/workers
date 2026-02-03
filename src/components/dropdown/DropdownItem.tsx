import clsx from 'clsx';
import { forwardRef } from 'react';

import styles from './styles/DropdownItem.module.css';
import type { DropdownItemProps } from './types/types';

const DropdownItem = forwardRef<HTMLButtonElement, DropdownItemProps>(function DropdownItem(
  { label, isSelected, size, className, onSelect, tabIndex, onFocus },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      className={clsx(styles.item, styles[size], isSelected && styles.selected, className)}
      role="option"
      aria-selected={isSelected}
      tabIndex={tabIndex}
      onClick={onSelect}
      onFocus={onFocus}
    >
      {label}
    </button>
  );
});

DropdownItem.displayName = 'DropdownItem';

export default DropdownItem;
