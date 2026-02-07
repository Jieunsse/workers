'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import ReactCalendar from 'react-calendar';
import type { CalendarProps as ReactCalendarProps } from 'react-calendar';
import 'react-calendar/dist/Calendar.css';

import ArrowIcon from '@/assets/icons/arrow/downArrowLarge.svg';
import styles from './Calendar.module.css';

export type CalendarValue = Date | null;

export type CalendarProps = {
  value?: CalendarValue;
  onChange?: (value: CalendarValue) => void;

  inputValue?: string;
  inputYear?: number;

  onInputValueChange?: (next: string) => void;
};

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function formatYYYYMMDD(d: Date): string {
  return `${d.getFullYear()}${pad2(d.getMonth() + 1)}${pad2(d.getDate())}`;
}

function isValidDate(y: number, m: number, d: number): boolean {
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function parseInputDate(inputValue?: string, inputYear?: number): Date | null {
  const raw = (inputValue ?? '').trim();
  if (!raw) return null;

  const digits = raw.replace(/\D/g, '');

  // YYYYMMDD
  if (digits.length === 8) {
    const y = Number(digits.slice(0, 4));
    const m = Number(digits.slice(4, 6));
    const d = Number(digits.slice(6, 8));
    if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return null;
    if (!isValidDate(y, m, d)) return null;
    return new Date(y, m - 1, d);
  }

  // MMDD
  if (digits.length === 4) {
    const y = inputYear ?? new Date().getFullYear();
    const m = Number(digits.slice(0, 2));
    const d = Number(digits.slice(2, 4));
    if (!Number.isFinite(m) || !Number.isFinite(d)) return null;
    if (!isValidDate(y, m, d)) return null;
    return new Date(y, m - 1, d);
  }

  return null;
}

export default function Calendar({
  value,
  onChange,
  inputValue,
  inputYear,
  onInputValueChange,
}: CalendarProps) {
  const [internalValue, setInternalValue] = useState<Date>(() => {
    const initial = parseInputDate(inputValue, inputYear);
    return (value ?? initial ?? new Date()) as Date;
  });

  const inputDate = useMemo(() => parseInputDate(inputValue, inputYear), [inputValue, inputYear]);

  const currentValue = useMemo<CalendarValue>(() => {
    if (typeof value !== 'undefined') return value; // Date 컨트롤드 우선
    if (inputDate) return inputDate; // inputValue 컨트롤드
    return internalValue; // 내부 상태
  }, [value, inputDate, internalValue]);

  const handleChange: NonNullable<ReactCalendarProps['onChange']> = (v) => {
    const nextDate = Array.isArray(v) ? v[0] : v;
    if (!nextDate) return;

    setInternalValue(nextDate);
    onChange?.(nextDate);

    onInputValueChange?.(formatYYYYMMDD(nextDate));
  };

  return (
    <div className={styles.wrapper}>
      <ReactCalendar
        value={currentValue}
        onChange={handleChange}
        locale="ko-KR"
        calendarType="gregory"
        formatDay={(_, date) => String(date.getDate())}
        prev2Label={null}
        next2Label={null}
        prevLabel={
          <span className={styles.arrowButton}>
            <Image src={ArrowIcon} alt="prev" className={`${styles.arrowIcon} ${styles.prev}`} />
          </span>
        }
        nextLabel={
          <span className={styles.arrowButton}>
            <Image src={ArrowIcon} alt="next" className={`${styles.arrowIcon} ${styles.next}`} />
          </span>
        }
      />
    </div>
  );
}
