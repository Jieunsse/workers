'use client';

import Image from 'next/image';
import Modal from '../../../Modal';
import styles from './MemberInvite.module.css';
import BaseButton from '@/components/Button/base/BaseButton';
import xMarkBig from '@/assets/icons/xMark/xMarkBig.svg';
import {
  CLOSE_BUTTON_ARIA_LABEL,
  DEFAULT_COPY_LABEL,
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  DESCRIPTION_ID,
  TITLE_ID,
} from './MemberInvite.constants';
import type { MemberInviteProps } from './MemberInvite.types';
export type { MemberInviteProps } from './MemberInvite.types';

/**
 * @param props.isOpen 모달 표시 여부를 boolean으로 전달합니다.
 * @param props.onClose 모달을 닫을 때 실행할 함수를 전달합니다.
 * @param props.invite 초대 링크와 복사 핸들러를 객체로 전달합니다.
 * @param props.text 모달 제목과 설명과 버튼 문구를 객체로 전달합니다.
 * @param props.closeOptions 오버레이 클릭과 Escape 닫힘 옵션을 객체로 전달합니다.
 */
export default function MemberInvite({
  isOpen,
  onClose,
  invite,
  text,
  closeOptions,
}: MemberInviteProps) {
  const title = text?.title ?? DEFAULT_TITLE;
  const description = text?.description ?? DEFAULT_DESCRIPTION;
  const copyButtonLabel = text?.copyButtonLabel ?? DEFAULT_COPY_LABEL;
  const closeOnOverlayClick = closeOptions?.overlayClick ?? true;
  const closeOnEscape = closeOptions?.escape ?? true;

  const handleCopy = () => invite.onCopyLink?.(invite.link);

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
        <BaseButton
          type="button"
          className={styles.closeButton}
          onClick={onClose}
          aria-label={CLOSE_BUTTON_ARIA_LABEL}
        >
          <Image src={xMarkBig} alt="" width={24} height={24} aria-hidden />
        </BaseButton>
        <h2 id={TITLE_ID} className={styles.title}>
          {title}
        </h2>
        <p id={DESCRIPTION_ID} className={styles.description}>
          {description}
        </p>
        <BaseButton
          type="button"
          variant="primary"
          className={styles.copyButton}
          onClick={handleCopy}
        >
          {copyButtonLabel}
        </BaseButton>
      </article>
    </Modal>
  );
}
