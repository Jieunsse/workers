import styles from './TaskCard.module.css';

interface TaskCardProps {
  label: string;
  count: number;
  onClick?: () => void;
  className?: string;
}

/**
 * TaskCard
 *
 * PC 환경에서 할 일 목록을 카드 형태로 표시하는 컴포넌트입니다.
 *
 * @remarks
 * - 모바일/태블릿에서는 Chip 컴포넌트가 대신 사용됩니다.
 * - 높이는 54px로 고정되며, 너비는 부모 컨테이너를 따릅니다.
 * - hover 시 미묘한 scale 효과가 적용됩니다.
 * - selected, pressed 같은 복잡한 상태는 없습니다.
 *
 * @example
 * ```tsx
 * <div style={{ width: '270px' }}>
 *   <TaskCard label="법인 설립" count={12} onClick={handleClick} />
 * </div>
 * ```
 */
export default function TaskCard({ label, count, onClick, className = '' }: TaskCardProps) {
  const cardClassName = [styles.card, className].filter(Boolean).join(' ');

  return (
    <button
      type="button"
      className={cardClassName}
      onClick={onClick}
      aria-label={`${label} ${count}개`}
    >
      <span className={styles.label}>{label}</span>
      <span className={styles.count}>{count}개</span>
    </button>
  );
}
