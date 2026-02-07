'use client';

import type { FormEvent } from 'react';

import Modal from '../../../Modal';
import BaseButton from '@/components/Button/base/BaseButton';
import { Input } from '@/components/input';
import styles from './ResetPassword.module.css';
import {
  DEFAULT_CLOSE_LABEL,
  DEFAULT_DESCRIPTION,
  DEFAULT_EMAIL_PLACEHOLDER,
  DEFAULT_SUBMIT_LABEL,
  DEFAULT_TITLE,
  DESCRIPTION_ID,
  TITLE_ID,
} from './ResetPassword.constants';
import type { ResetPasswordProps } from './ResetPassword.types';
export type { ResetPasswordProps } from './ResetPassword.types';

/**
 * @param props.isOpen 모달 표시 여부를 boolean으로 전달합니다.
 * @param props.onClose 모달을 닫을 때 실행할 함수를 전달합니다.
 * @param props.onSubmit 링크 보내기 제출 시 실행할 함수를 전달합니다.
 * @param props.text 제목과 버튼 문구와 안내 문구 같은 텍스트 옵션을 객체로 전달합니다.
 * @param props.input 이메일 입력창에 적용할 옵션을 객체로 전달합니다.
 * @param props.closeOptions 오버레이 클릭과 Escape 닫힘 옵션을 객체로 전달합니다.
 */
export default function ResetPassword({
  isOpen,
  onClose,
  onSubmit,
  text,
  input,
  closeOptions,
}: ResetPasswordProps) {
  const title = text?.title ?? DEFAULT_TITLE;
  const description = text?.description ?? DEFAULT_DESCRIPTION;
  const closeLabel = text?.closeLabel ?? DEFAULT_CLOSE_LABEL;
  const submitLabel = text?.submitLabel ?? DEFAULT_SUBMIT_LABEL;
  const emailPlaceholder = text?.emailPlaceholder ?? DEFAULT_EMAIL_PLACEHOLDER;
  const closeOnOverlayClick = closeOptions?.overlayClick ?? true;
  const closeOnEscape = closeOptions?.escape ?? true;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledby={TITLE_ID}
      ariaDescribedby={DESCRIPTION_ID}
      contentClassName={styles.modalContent}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
    >
      <article className={styles.container}>
        <header className={styles.header}>
          <h2 id={TITLE_ID} className={styles.title}>
            {title}
          </h2>
          <p id={DESCRIPTION_ID} className={styles.description}>
            {description}
          </p>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            {...input?.email}
            className={styles.input}
            type="email"
            name="email"
            autoComplete="email"
            placeholder={emailPlaceholder}
          />

          <footer className={styles.actions}>
            <BaseButton
              type="button"
              variant="outline"
              className={styles.closeButton}
              onClick={onClose}
            >
              {closeLabel}
            </BaseButton>
            <BaseButton type="submit" variant="primary" className={styles.sendButton}>
              {submitLabel}
            </BaseButton>
          </footer>
        </form>
      </article>
    </Modal>
  );
}
