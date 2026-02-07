'use client';

import type { FormEvent } from 'react';
import { useId } from 'react';

import Modal from '../../../Modal';
import BaseButton from '@/components/Button/base/BaseButton';
import { Input } from '@/components/input';
import styles from './ChangePassword.module.css';
import {
  CONFIRM_PASSWORD_NAME,
  DEFAULT_CLOSE_LABEL,
  DEFAULT_CONFIRM_PASSWORD_LABEL,
  DEFAULT_CONFIRM_PASSWORD_PLACEHOLDER,
  DEFAULT_NEW_PASSWORD_LABEL,
  DEFAULT_NEW_PASSWORD_PLACEHOLDER,
  DEFAULT_SUBMIT_LABEL,
  DEFAULT_TITLE,
  NEW_PASSWORD_NAME,
  TITLE_ID,
} from './ChangePassword.constants';
import type { ChangePasswordProps } from './ChangePassword.types';
export type { ChangePasswordProps } from './ChangePassword.types';

/**
 * @param props.isOpen 모달 표시 여부를 boolean으로 전달합니다.
 * @param props.onClose 모달을 닫을 때 실행할 함수를 전달합니다.
 * @param props.onSubmit 비밀번호 변경 제출 시 실행할 함수를 전달합니다.
 * @param props.text 제목과 버튼 문구와 라벨 같은 텍스트 옵션을 객체로 전달합니다.
 * @param props.input 비밀번호 입력창들에 적용할 옵션을 객체로 전달합니다.
 * @param props.closeOptions 오버레이 클릭과 Escape 닫힘 옵션을 객체로 전달합니다.
 */
export default function ChangePassword({
  isOpen,
  onClose,
  onSubmit,
  text,
  input,
  closeOptions,
}: ChangePasswordProps) {
  const title = text?.title ?? DEFAULT_TITLE;
  const newPasswordLabel = text?.newPasswordLabel ?? DEFAULT_NEW_PASSWORD_LABEL;
  const confirmPasswordLabel = text?.confirmPasswordLabel ?? DEFAULT_CONFIRM_PASSWORD_LABEL;
  const newPasswordPlaceholder = text?.newPasswordPlaceholder ?? DEFAULT_NEW_PASSWORD_PLACEHOLDER;
  const confirmPasswordPlaceholder =
    text?.confirmPasswordPlaceholder ?? DEFAULT_CONFIRM_PASSWORD_PLACEHOLDER;
  const closeLabel = text?.closeLabel ?? DEFAULT_CLOSE_LABEL;
  const submitLabel = text?.submitLabel ?? DEFAULT_SUBMIT_LABEL;
  const closeOnOverlayClick = closeOptions?.overlayClick ?? true;
  const closeOnEscape = closeOptions?.escape ?? true;

  const generatedNewPasswordId = useId();
  const generatedConfirmPasswordId = useId();
  const newPasswordId = input?.newPassword?.id ?? generatedNewPasswordId;
  const confirmPasswordId = input?.confirmPassword?.id ?? generatedConfirmPasswordId;

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledby={TITLE_ID}
      contentClassName={styles.modalContent}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
    >
      <article className={styles.container}>
        <h2 id={TITLE_ID} className={styles.title}>
          {title}
        </h2>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor={newPasswordId} className={styles.label}>
              {newPasswordLabel}
            </label>
            <Input
              {...input?.newPassword}
              id={newPasswordId}
              className={styles.input}
              type="password"
              name={NEW_PASSWORD_NAME}
              autoComplete="new-password"
              placeholder={newPasswordPlaceholder}
            />
          </div>

          <div className={styles.field}>
            <label htmlFor={confirmPasswordId} className={styles.label}>
              {confirmPasswordLabel}
            </label>
            <Input
              {...input?.confirmPassword}
              id={confirmPasswordId}
              className={styles.input}
              type="password"
              name={CONFIRM_PASSWORD_NAME}
              autoComplete="new-password"
              placeholder={confirmPasswordPlaceholder}
            />
          </div>

          <footer className={styles.actions}>
            <BaseButton
              type="button"
              variant="outline"
              className={styles.closeButton}
              onClick={onClose}
            >
              {closeLabel}
            </BaseButton>
            <BaseButton type="submit" variant="primary" className={styles.submitButton}>
              {submitLabel}
            </BaseButton>
          </footer>
        </form>
      </article>
    </Modal>
  );
}
