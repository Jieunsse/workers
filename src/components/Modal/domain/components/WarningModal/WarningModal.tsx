'use client';

import Image from 'next/image';

import Modal from '../../../Modal';
import BaseButton from '@/components/Button/base/BaseButton';
import styles from './WarningModal.module.css';
import alertSmall from '@/assets/icons/alert/alertSmall.svg';
import {
  DEFAULT_CLOSE_LABEL,
  DEFAULT_CONFIRM_LABEL,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  DESCRIPTION_ID,
  TITLE_ID,
} from './WarningModal.constants';
import type { WarningModalProps } from './WarningModal.types';
export type { WarningModalProps } from './WarningModal.types';

/**
 * @param props.isOpen 모달 표시 여부를 boolean으로 전달합니다.
 * @param props.onClose 모달을 닫을 때 실행할 함수를 전달합니다.
 * @param props.onConfirm 회원 탈퇴 확인 버튼 클릭 시 실행할 함수를 전달합니다.
 * @param props.text 경고 모달 제목과 설명과 버튼 문구를 객체로 전달합니다.
 * @param props.closeOptions 오버레이 클릭과 Escape 닫힘 옵션을 객체로 전달합니다.
 */
export default function WarningModal({
  isOpen,
  onClose,
  onConfirm,
  text,
  closeOptions,
}: WarningModalProps) {
  const title = text?.title ?? DEFAULT_TITLE;
  const description = text?.description ?? DEFAULT_DESCRIPTION;
  const closeLabel = text?.closeLabel ?? DEFAULT_CLOSE_LABEL;
  const confirmLabel = text?.confirmLabel ?? DEFAULT_CONFIRM_LABEL;
  const closeOnOverlayClick = closeOptions?.overlayClick ?? true;
  const closeOnEscape = closeOptions?.escape ?? true;

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
          <Image
            className={styles.icon}
            src={alertSmall}
            alt=""
            width={24}
            height={24}
            aria-hidden
          />
          <h2 id={TITLE_ID} className={styles.title}>
            {title}
          </h2>
        </header>

        <p id={DESCRIPTION_ID} className={styles.description}>
          {description}
        </p>

        <footer className={styles.actions}>
          <BaseButton
            type="button"
            variant="outline"
            className={styles.closeButton}
            onClick={onClose}
          >
            {closeLabel}
          </BaseButton>
          <BaseButton
            type="button"
            variant="danger"
            className={styles.confirmButton}
            onClick={onConfirm}
          >
            {confirmLabel}
          </BaseButton>
        </footer>
      </article>
    </Modal>
  );
}
