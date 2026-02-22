import Link from 'next/link';
import clsx from 'clsx';

import styles from './styles/SidebarButton.module.css';
import type { SidebarButtonProps } from './types/types';

/**
 * 사이드바 내 메뉴 항목 버튼.
 * iconOnly가 true이면 아이콘만 표시하고 라벨은 aria-label로 전환됩니다.
 * href가 있으면 Link로 렌더링됩니다.
 */
export default function SidebarButton({
  icon,
  label,
  isActive,
  iconOnly,
  onClick,
  href,
}: SidebarButtonProps) {
  const className = clsx(styles.button, isActive && styles.active, iconOnly && styles.iconOnly);
  const content = (
    <>
      <span className={styles.icon}>{icon}</span>
      {!iconOnly && label}
    </>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={className}
        onClick={onClick}
        aria-label={iconOnly ? label : undefined}
      >
        {content}
      </Link>
    );
  }

  return (
    <button
      type="button"
      className={className}
      onClick={onClick}
      aria-label={iconOnly ? label : undefined}
    >
      {content}
    </button>
  );
}
