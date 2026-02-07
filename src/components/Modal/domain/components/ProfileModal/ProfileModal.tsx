'use client';

import Image from 'next/image';

import Modal from '../../../Modal';
import styles from './ProfileModal.module.css';
import BaseButton from '@/components/Button/base/BaseButton';
import profileFallback from '@/assets/icons/img/img.svg';
import xMarkBig from '@/assets/icons/xMark/xMarkBig.svg';
import {
  CLOSE_BUTTON_ARIA_LABEL,
  DEFAULT_COPY_LABEL,
  DEFAULT_PROFILE_ALT,
  EMAIL_ID,
  TITLE_ID,
} from './ProfileModal.constants';
import type { ProfileModalProps } from './ProfileModal.types';
export type { ProfileModalProps } from './ProfileModal.types';

/**
 * @param props.isOpen 모달 표시 여부를 boolean으로 전달합니다.
 * @param props.onClose 모달을 닫을 때 실행할 함수를 전달합니다.
 * @param props.onCopyEmail 이메일 복사 버튼 클릭 시 실행할 함수를 전달합니다.
 * @param props.profile 프로필 정보와 표시 텍스트를 객체로 전달합니다.
 * @param props.closeOptions 오버레이 클릭과 Escape 닫힘 옵션을 객체로 전달합니다.
 */
export default function ProfileModal({
  isOpen,
  onClose,
  onCopyEmail,
  profile,
  closeOptions,
}: ProfileModalProps) {
  const profileImageAlt = profile.imageAlt ?? DEFAULT_PROFILE_ALT;
  const copyButtonLabel = profile.copyButtonLabel ?? DEFAULT_COPY_LABEL;
  const closeOnOverlayClick = closeOptions?.overlayClick ?? true;
  const closeOnEscape = closeOptions?.escape ?? true;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      ariaLabelledby={TITLE_ID}
      ariaDescribedby={EMAIL_ID}
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

        <div className={styles.content}>
          <div className={styles.profileImage}>
            <Image
              src={profile.imageSrc ?? profileFallback}
              alt={profileImageAlt}
              width={40}
              height={40}
            />
          </div>

          <h2 id={TITLE_ID} className={styles.title}>
            {profile.title}
          </h2>
          <p id={EMAIL_ID} className={styles.email}>
            {profile.email}
          </p>

          <BaseButton
            type="button"
            variant="primary"
            className={styles.copyButton}
            onClick={onCopyEmail}
          >
            {copyButtonLabel}
          </BaseButton>
        </div>
      </article>
    </Modal>
  );
}
