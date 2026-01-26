import clsx from 'clsx';
import Image from 'next/image';
import type { ChangeEvent } from 'react';

import styles from './styles/CheckBox.module.css';
import { CHECKBOX_ICON, ICON_SIZE } from './constants/constants';
import type { CheckBoxProps } from './types/types';

/**
 * 체크박스 컴포넌트.
 * @param isChecked 체크 여부(필수)
 * @param onChange 체크 상태 변경 콜백 (필요 시)
 * @param size 체크박스 크기('large' | 'small')
 * @param label 표시 라벨(없으면 ariaLabel 필수)
 * @param ariaLabel 라벨이 없을 때 사용하는 접근성 라벨(필수)
 */
export default function CheckBox({
  isChecked,
  size = 'large',
  label,
  ariaLabel,
  id,
  name,
  value,
  disabled = false,
  className,
  onChange,
}: CheckBoxProps) {
  const iconSrc = isChecked ? CHECKBOX_ICON.checked[size] : CHECKBOX_ICON.unchecked[size];
  const iconSize = ICON_SIZE[size];
  const inputAriaLabel = label ? undefined : ariaLabel;

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange?.(event.target.checked);
  };

  return (
    <label className={clsx(styles.checkbox, styles[size], disabled && styles.disabled, className)}>
      <input
        className={styles.input}
        type="checkbox"
        checked={isChecked}
        aria-label={inputAriaLabel}
        id={id}
        name={name}
        value={value}
        disabled={disabled}
        onChange={handleChange}
        readOnly={!onChange}
      />
      <span className={styles.box} aria-hidden="true">
        <Image className={styles.icon} src={iconSrc} alt="" width={iconSize} height={iconSize} />
      </span>
      {label ? <span className={styles.label}>{label}</span> : null}
    </label>
  );
}
