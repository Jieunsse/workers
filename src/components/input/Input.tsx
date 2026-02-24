'use client';

import { useId } from 'react';
import clsx from 'clsx';
import { InputProps } from './types/types';
import styles from './styles/Input.module.css';

/**
 * 범용 텍스트 입력 컴포넌트.
 * 네이티브 `<input>`의 모든 속성을 지원하며, errorMessage를 전달하면
 * 빨간 테두리 + 하단 에러 텍스트가 자동으로 표시됩니다.
 */
export default function Input({ className, errorMessage, isError, ref, ...props }: InputProps) {
  const hasError = isError || !!errorMessage;
  const errorId = useId();

  return (
    <>
      <input
        ref={ref}
        aria-invalid={hasError || undefined}
        aria-describedby={errorMessage ? errorId : undefined}
        {...props}
        className={clsx(styles.input, hasError && styles.error, className)}
      />
      {errorMessage && (
        <p id={errorId} role="alert" className={styles.errorMessage}>
          {errorMessage}
        </p>
      )}
    </>
  );
}
