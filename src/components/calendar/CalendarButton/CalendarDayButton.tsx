'use client';

import styles from './CalendarDayButton.module.css';

export type CalendarDayButtonProps = {
  date: Date;
  selected?: boolean;
  onSelect?: (date: Date) => void;
  className?: string;
};

const WEEKDAY_KO = ['일', '월', '화', '수', '목', '금', '토'] as const;

export default function CalendarDayButton({
  date,
  selected,
  onSelect,
  className,
}: CalendarDayButtonProps) {
  const weekday = WEEKDAY_KO[date.getDay()];
  const day = date.getDate();

  return (
    <button
      type="button"
      className={[styles.button, selected ? styles.selected : '', className ?? ''].join(' ')}
      onClick={() => onSelect?.(date)}
      aria-pressed={!!selected}
    >
      <span className={styles.weekday}>{weekday}</span>
      <span className={styles.day}>{day}</span>
    </button>
  );
}
