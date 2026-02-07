'use client';

import Image from 'next/image';
import type { FormEvent } from 'react';
import BaseButton from '@/components/Button/base/BaseButton';
import { Input } from '@/components/input';
import Modal from '../../../Modal';
import styles from './AddTodoList.module.css';
import xMarkBig from '@/assets/icons/xMark/xMarkBig.svg';
import {
  CLOSE_BUTTON_ARIA_LABEL,
  DEFAULT_PLACEHOLDER,
  DEFAULT_SUBMIT_LABEL,
  DEFAULT_TITLE,
  TITLE_ID,
} from './AddTodoList.constants';
import type { AddTodoListProps } from './AddTodoList.types';
export type { AddTodoListProps } from './AddTodoList.types';

/**
 * @param props.isOpen 모달 표시 여부를 boolean으로 전달합니다.
 * @param props.onClose 모달을 닫을 때 실행할 함수를 전달합니다.
 * @param props.onSubmit 할 일 생성 버튼 클릭 시 실행할 함수를 전달합니다.
 * @param props.text 모달 제목과 버튼 문구 같은 텍스트 옵션을 객체로 전달합니다.
 * @param props.input 할 일 입력창에 적용할 옵션을 객체로 전달합니다.
 * @param props.closeOptions 오버레이 클릭과 Escape 닫힘 옵션을 객체로 전달합니다.
 */
export default function AddTodoList({
  isOpen,
  onClose,
  onSubmit,
  text,
  input,
  closeOptions,
}: AddTodoListProps) {
  const title = text?.title ?? DEFAULT_TITLE;
  const submitLabel = text?.submitLabel ?? DEFAULT_SUBMIT_LABEL;
  const inputPlaceholder = text?.inputPlaceholder ?? DEFAULT_PLACEHOLDER;
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
      contentClassName={styles.modalContent}
      closeOnOverlayClick={closeOnOverlayClick}
      closeOnEscape={closeOnEscape}
    >
      <article className={styles.container}>
        <div className={styles.buttonContainer}>
          <BaseButton
            type="button"
            className={styles.closeButton}
            aria-label={CLOSE_BUTTON_ARIA_LABEL}
            onClick={onClose}
          >
            <Image src={xMarkBig} alt="" width={24} height={24} />
          </BaseButton>
        </div>
        <header className={styles.header}>
          <h2 id={TITLE_ID} className={styles.title}>
            {title}
          </h2>
        </header>

        <form className={styles.form} onSubmit={handleSubmit}>
          <Input
            {...input?.props}
            className={styles.input}
            type="text"
            name="todo"
            placeholder={inputPlaceholder}
          />
          <footer className={styles.footer}>
            <BaseButton type="submit" variant="primary" className={styles.button}>
              {submitLabel}
            </BaseButton>
          </footer>
        </form>
      </article>
    </Modal>
  );
}
