'use client';

import clsx from 'clsx';
import Image from 'next/image';

import useToastLifecycle from './hooks/useToastLifecycle';
import checkIcon from '@/assets/icons/check/check-1.svg';
import styles from './styles/LinkPassToast.module.css';

const DEFAULT_AUTO_DISMISS_MS = 3000;
const DEFAULT_ANIMATION_MS = 600;

interface LinkPassToastProps {
  isOpen: boolean;
  onDismiss: () => void;
  autoDismissMs?: number;
  className?: string;
}

/**
 * LinkPassToast
 *
 * 비밀번호 재설정 이메일 전송 완료 시 사용하는 토스트 컴포넌트입니다.
 *
 * @remarks
 * - 공통 Toast 컴포넌트는 "변경사항 저장하기" 같은 액션 버튼이 필요한 케이스용으로,
 *   메시지 단독 표시가 필요한 이 케이스와 성격이 달라 별도 컴포넌트로 분리했습니다.
 * - 아이콘(체크), 메시지 모두 이 컴포넌트 안에 고정 → 사용처에서 신경 쓸 것 없음.
 * - useToastLifecycle 훅을 재사용해 공통 Toast와 동일한 애니메이션을 유지합니다.
 */
export default function LinkPassToast({
  isOpen,
  onDismiss,
  autoDismissMs = DEFAULT_AUTO_DISMISS_MS,
  className,
}: LinkPassToastProps) {
  const { isRendered, isClosing } = useToastLifecycle({
    isOpen,
    autoDismissMs,
    exitDurationMs: DEFAULT_ANIMATION_MS,
    onDismiss,
  });

  return isRendered ? (
    <div
      className={clsx(styles.toast, isClosing ? styles.exit : styles.enter, className)}
      role="status"
      aria-live="polite"
      aria-atomic="true"
      style={{ animationDuration: `${DEFAULT_ANIMATION_MS}ms` }}
    >
      <div className={styles.content}>
        <span className={styles.icon} aria-hidden="true">
          <Image src={checkIcon} alt="" width={16} height={16} />
        </span>
        <span className={styles.message}>비밀번호 재설정 이메일을 전송했습니다.</span>
      </div>
    </div>
  ) : null;
}
