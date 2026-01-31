'use client';

import { useState } from 'react';
import Image from 'next/image';
import clsx from 'clsx';
import Input from './Input';
import { PasswordInputProps } from './types/types';
import visibilityTrue from '@/assets/icons/visibility/visibillityTrue.svg';
import visibilityFalse from '@/assets/icons/visibility/visibillityFalse.svg';
import styles from './styles/PasswordInput.module.css';

/**
 * 비밀번호 Input 컴포넌트.
 * @param className 추가 CSS 클래스
 * @param props 네이티브 input의 모든 속성(type 제외)
 */
export default function PasswordInput({ className, ...props }: PasswordInputProps) {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className={styles.wrapper}>
      <Input
        type={showPassword ? 'text' : 'password'}
        className={clsx(styles.input, className)}
        {...props}
      />
      <button
        type="button"
        className={styles.toggleButton}
        onClick={() => setShowPassword((prev) => !prev)}
        aria-label={showPassword ? '비밀번호 숨기기' : '비밀번호 보기'}
      >
        <Image
          src={showPassword ? visibilityTrue : visibilityFalse}
          alt=""
          width={24}
          height={24}
        />
      </button>
    </div>
  );
}
