'use client';

import { useMemo, useState } from 'react';
import styles from './WeekDateBar.module.css';
import CalendarDayButton from './CalendarDayButton';

export type WeekDateBarProps = {
  /** 선택된 날짜(컨트롤드) */
  value?: Date;
  /** 선택된 날짜(언컨트롤드) */
  defaultValue?: Date;
  /** 날짜 선택 */
  onChange?: (date: Date) => void;

  /** “현재 보고 있는 주” 기준 날짜(화살표로 주 이동할 때 이 값만 바꾸면 됨) */
  viewDate?: Date;

  className?: string;
};

function addDays(d: Date, days: number) {
  const next = new Date(d);
  next.setDate(d.getDate() + days);
  return next;
}

/** 월요일 시작 */
function startOfWeekMonday(d: Date) {
  const day = d.getDay(); // 0=일
  const diff = (day + 6) % 7; // 월=0 ... 일=6
  const start = new Date(d);
  start.setHours(0, 0, 0, 0);
  start.setDate(d.getDate() - diff);
  return start;
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function WeekDateBar({
  value,
  defaultValue,
  onChange,
  viewDate,
  className,
}: WeekDateBarProps) {
  const isControlled = value instanceof Date;
  const [internalValue, setInternalValue] = useState<Date>(defaultValue ?? new Date());

  const selectedDate = isControlled ? (value as Date) : internalValue;

  // ✅ viewDate가 있으면 그 주를 보여주고, 없으면 선택된 날짜 기준 주
  const anchor = viewDate ?? selectedDate;

  const weekDates = useMemo(() => {
    const start = startOfWeekMonday(anchor);
    return Array.from({ length: 7 }, (_, i) => addDays(start, i));
  }, [anchor]);

  const handleSelect = (d: Date) => {
    if (!isControlled) setInternalValue(d);
    onChange?.(d);
  };

  return (
    <div
      className={`${styles.container} ${className ?? ''}`}
      role="group"
      aria-label="week date bar"
    >
      {weekDates.map((d) => (
        <CalendarDayButton
          key={`${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`}
          date={d}
          selected={isSameDay(d, selectedDate)}
          onSelect={handleSelect}
        />
      ))}
    </div>
  );
}
