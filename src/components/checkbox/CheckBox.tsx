'use client';

import clsx from 'clsx';
import Image from 'next/image';
import type { ChangeEvent, CSSProperties, KeyboardEvent, MouseEvent } from 'react';

import styles from './styles/CheckBox.module.css';
import { CHECKBOX_STYLE } from './constants/styleConstants';
import type { CheckBoxProps } from './types/types';

/**
 * 체크박스 컴포넌트.
 * @param checked 체크 여부
 * @param onCheckedChange 체크 상태 변경 콜백
 * @param size 체크박스 크기('large' | 'small')
 * @param label 접근성 용도의 라벨(없으면 options.ariaLabel 필수)
 * @param options 고급 옵션(ariaLabel/readOnly/icons)
 */
export default function CheckBox({
  checked,
  size = 'large',
  label,
  id,
  name,
  value,
  disabled = false,
  className,
  options,
  onCheckedChange,
}: CheckBoxProps) {
const hasLabel = label != null && (typeof label === 'string' ? label.trim() !== '' : true);
  const isReadOnly = options?.readOnly || !onCheckedChange;
  const isDisabled = disabled;
  const iconSrc = checked
    ? CHECKBOX_STYLE.icons.checked[size]
    : CHECKBOX_STYLE.icons.unchecked[size];
  const boxSize = CHECKBOX_STYLE.boxSize[size];
  const inputAriaLabel = hasLabel ? undefined : options?.ariaLabel;
  const checkboxStyle = {
    '--checkbox-box-size': `${boxSize}px`,
  } as CSSProperties;
  const iconNode = options?.icons ? (
    checked ? (
      options.icons.checked
    ) : (
      options.icons.unchecked
    )
  ) : (
    <Image className={styles.icon} src={iconSrc} alt="" width={boxSize} height={boxSize} />
  );

  const handleClick = (event: MouseEvent<HTMLInputElement>) => {
    if (isReadOnly) {
      event.preventDefault();
    }
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (isReadOnly && (event.key === ' ' || event.key === 'Enter')) {
      event.preventDefault();
    }
  };

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    if (isReadOnly || isDisabled) {
      event.preventDefault();
      return;
    }
    onCheckedChange?.(event.target.checked);
  };

  if (process.env.NODE_ENV !== 'production' && !hasLabel && !options?.ariaLabel) {
    console.warn('CheckBox: label이 비어있다면 ariaLabel이 필요합니다.');
  }

  return (
    <label
      className={clsx(styles.checkbox, styles[size], isDisabled && styles.disabled, className)}
      style={checkboxStyle}
    >
      <input
        className={styles.input}
        type="checkbox"
        checked={checked}
        aria-label={inputAriaLabel}
        aria-disabled={isReadOnly || isDisabled ? true : undefined}
        id={id}
        name={name}
        value={value}
        disabled={isDisabled}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        onChange={handleChange}
      />
      <span className={styles.box} aria-hidden="true">
        {iconNode}
      </span>
      {hasLabel ? <span className={styles.label}>{label}</span> : null}
    </label>
  );
}
