import { useEffect, useRef } from 'react';
import clsx from 'clsx';
import style from './style/Modal.module.css';
import type { ModalProps } from './types/types';
import { stopPropagation } from './utils/stopPropagation';
import { useFocusTrap } from './hooks/useFocusTrap';

/**
 * @param isOpen 모달을 렌더링할지 여부를 제어합니다.
 * @param onClose 모달을 닫아야 할 때 호출되는 콜백입니다.
 * @param children 모달 내부에 렌더링할 콘텐츠입니다.
 * @param ariaLabel 다이얼로그의 접근성 이름(필수)입니다.
 * @param ariaLabelledby 다이얼로그 제목 요소의 id입니다.
 * @param ariaDescribedby 다이얼로그 설명 요소의 id입니다.
 * @param className 오버레이에 적용할 추가 클래스입니다.
 * @param closeOnOverlayClick 오버레이 클릭 시 닫을지 여부(기본값: true)입니다.
 * @param closeOnEscape Escape 키 입력 시 닫을지 여부(기본값: true)입니다.
 */
export default function Modal({
  isOpen,
  onClose,
  children,
  ariaLabel,
  ariaLabelledby,
  ariaDescribedby,
  className,
  contentClassName,
  closeOnOverlayClick = true,
  closeOnEscape = true,
}: ModalProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const { onKeyDown } = useFocusTrap(isOpen, dialogRef);

  useEffect(() => {
    if (!isOpen || !closeOnEscape) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, closeOnEscape, onClose]);

  if (!isOpen) return null;

  const ariaProps = {
    ...(ariaLabelledby ? { 'aria-labelledby': ariaLabelledby } : {}),
    ...(ariaDescribedby ? { 'aria-describedby': ariaDescribedby } : {}),
  };

  return (
    <section
      className={clsx(style.overlay, className)}
      onClick={closeOnOverlayClick ? onClose : undefined}
      role="presentation"
    >
      <div
        className={clsx(style.contentsBox, contentClassName)}
        ref={dialogRef}
        onClick={stopPropagation}
        onKeyDown={onKeyDown}
        role="dialog"
        aria-modal="true"
        aria-label={ariaLabel}
        tabIndex={-1}
        {...ariaProps}
      >
        {children}
      </div>
    </section>
  );
}
