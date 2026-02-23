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
      // 모바일에서 오버레이를 하단 정렬로 변경하는 클래스 주입
      className={styles.mobileOverlay}
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
