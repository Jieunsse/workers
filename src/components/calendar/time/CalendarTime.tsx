'use client';

import { useCallback, useMemo, useState } from 'react';
import styles from './CalendarTime.module.css';

type Period = 'AM' | 'PM';

export type CalendarTimeProps = {
  /**
   * value 허용:
   * - "H:MM" / "HH:MM" (예: "3:00", "13:30")
   * - "HHMM" / "HMM"  (예: "0300", "300", "1530")
   * - "오전 3:00" / "오후 3:30" (공백 있어도/없어도)
   */
  value?: string;
  defaultValue?: string;
  onChange?: (value: string) => void;

  stepMinutes?: 5 | 10 | 15 | 30 | 60;
  startHour?: number;
  endHour?: number;

  defaultPeriod?: Period;

  /** ✅ onChange로 내보낼 포맷 (default: '24h') */
  outputFormat?: '24h' | 'ko';

  ariaLabel?: string;
  className?: string;
};

function clampHour(n: number): number {
  return Math.max(0, Math.min(23, n));
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** hour는 0 padding 안 함 (3:00), minute만 2자리 */
function format24(h: number, m: number): string {
  return `${h}:${pad2(m)}`;
}

function to12hLabel(h24: number, m: number): string {
  const h = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h}:${pad2(m)}`;
}

function formatKo(h24: number, m: number): string {
  const isAM = h24 < 12;
  const periodLabel = isAM ? '오전' : '오후';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${periodLabel} ${h12}:${pad2(m)}`;
}

function parseCoreTime(v: string): { h: number; m: number } | null {
  const raw = v.trim();
  if (!raw) return null;

  const colon = /^(\d{1,2}):(\d{2})$/.exec(raw);
  if (colon) {
    const h = Number(colon[1]);
    const m = Number(colon[2]);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return { h, m };
  }

  const digits = /^(\d{3,4})$/.exec(raw);
  if (digits) {
    const s = digits[1];
    const hStr = s.length === 3 ? s.slice(0, 1) : s.slice(0, 2);
    const mStr = s.slice(-2);
    const h = Number(hStr);
    const m = Number(mStr);
    if (Number.isNaN(h) || Number.isNaN(m)) return null;
    if (h < 0 || h > 23 || m < 0 || m > 59) return null;
    return { h, m };
  }

  return null;
}

function parseTime(v: string): { h: number; m: number } | null {
  const raw = v.trim();
  if (!raw) return null;

  const periodMatch = /^(오전|오후|AM|PM)\s*/i.exec(raw);
  const periodToken = periodMatch ? periodMatch[1] : null;
  const rest = periodMatch ? raw.slice(periodMatch[0].length) : raw;

  const core = parseCoreTime(rest);
  if (!core) return null;

  if (!periodToken) return core;

  const tokenUpper = periodToken.toUpperCase();
  const nextPeriod: Period = periodToken === '오전' || tokenUpper === 'AM' ? 'AM' : 'PM';

  if (core.h >= 13) return core;

  const clockHour = core.h === 0 ? 12 : core.h;
  if (clockHour < 1 || clockHour > 12) return null;

  const h24 =
    nextPeriod === 'AM'
      ? clockHour === 12
        ? 0
        : clockHour
      : clockHour === 12
        ? 12
        : clockHour + 12;

  return { h: h24, m: core.m };
}

function convertKeepClockTime(h24: number, m: number, nextPeriod: Period): string {
  const clockHour = h24 % 12 === 0 ? 12 : h24 % 12;

  const nextH24 =
    nextPeriod === 'AM'
      ? clockHour === 12
        ? 0
        : clockHour
      : clockHour === 12
        ? 12
        : clockHour + 12;

  return format24(nextH24, m);
}

export default function CalendarTime({
  value,
  defaultValue,
  onChange,
  stepMinutes = 30,
  startHour = 0,
  endHour = 23,
  defaultPeriod = 'PM',
  outputFormat = '24h',
  ariaLabel = 'time selector',
  className,
}: CalendarTimeProps) {
  const isControlled = typeof value === 'string';
  const [internalValue, setInternalValue] = useState<string>(defaultValue ?? '');
  const [uiPeriod, setUiPeriod] = useState<Period>(defaultPeriod);

  const resolvedValue = (isControlled ? value : internalValue) ?? '';
  const parsed = resolvedValue ? parseTime(resolvedValue) : null;

  const derivedPeriod: Period = useMemo(() => {
    if (parsed) return parsed.h < 12 ? 'AM' : 'PM';
    return uiPeriod;
  }, [parsed, uiPeriod]);

  const hoursRange = useMemo(() => {
    const s = clampHour(startHour);
    const e = clampHour(endHour);
    if (s <= e) return { s, e };
    return { s: 0, e: 23 };
  }, [startHour, endHour]);

  const normalizeOutput = useCallback(
    (h: number, m: number) => (outputFormat === 'ko' ? formatKo(h, m) : format24(h, m)),
    [outputFormat],
  );

  const commitValue = useCallback(
    (nextRaw: string) => {
      const p = parseTime(nextRaw);
      const next = p ? normalizeOutput(p.h, p.m) : nextRaw;

      if (!isControlled) setInternalValue(next);
      onChange?.(next);
    },
    [isControlled, normalizeOutput, onChange],
  );

  const handleSetPeriod = useCallback(
    (next: Period) => {
      setUiPeriod(next);

      if (parsed) {
        const nextValue24 = convertKeepClockTime(parsed.h, parsed.m, next);
        commitValue(nextValue24);
      }
    },
    [commitValue, parsed],
  );

  const timeOptions = useMemo(() => {
    const list: Array<{ value24: string; label: string }> = [];

    const periodStart = derivedPeriod === 'AM' ? 0 : 12;
    const periodEnd = derivedPeriod === 'AM' ? 11 : 23;

    for (let h = periodStart; h <= periodEnd; h += 1) {
      if (h < hoursRange.s || h > hoursRange.e) continue;
      for (let m = 0; m < 60; m += stepMinutes) {
        const value24 = format24(h, m);
        list.push({ value24, label: to12hLabel(h, m) });
      }
    }

    return list;
  }, [derivedPeriod, hoursRange, stepMinutes]);

  const selected24 = parsed ? format24(parsed.h, parsed.m) : '';

  const handlePick = useCallback(
    (v24: string) => {
      commitValue(v24);

      const p = parseTime(v24);
      if (p) setUiPeriod(p.h < 12 ? 'AM' : 'PM');
    },
    [commitValue],
  );

  return (
    <div className={`${styles.container} ${className ?? ''}`} aria-label={ariaLabel}>
      <div className={styles.periodCol}>
        <button
          type="button"
          className={`${styles.periodBtn} ${derivedPeriod === 'AM' ? styles.periodBtnActive : ''}`}
          onClick={() => handleSetPeriod('AM')}
          aria-pressed={derivedPeriod === 'AM'}
        >
          오전
        </button>
        <button
          type="button"
          className={`${styles.periodBtn} ${derivedPeriod === 'PM' ? styles.periodBtnActive : ''}`}
          onClick={() => handleSetPeriod('PM')}
          aria-pressed={derivedPeriod === 'PM'}
        >
          오후
        </button>
      </div>

      <div className={styles.timeBox} role="listbox" aria-label="time list">
        <div className={styles.timeList}>
          {timeOptions.map((t) => {
            const active = t.value24 === selected24;
            return (
              <div key={t.value24} className={styles.timeRow}>
                <div
                  role="option"
                  aria-selected={active}
                  tabIndex={0}
                  className={`${styles.timeItem} ${active ? styles.timeItemActive : ''}`}
                  onClick={() => handlePick(t.value24)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      handlePick(t.value24);
                    }
                  }}
                >
                  {t.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
