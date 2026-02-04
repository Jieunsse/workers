'use client';

import { useEffect, useMemo, useRef } from 'react';
import styles from './ProgressBar.module.css';

export type ProgressBarProps = {
  /** 0~1 (0.3 = 30%) */
  value?: number;
  /** done/total로도 계산 가능 */
  done?: number;
  total?: number;

  /** 애니메이션 (default: true) */
  animate?: boolean;

  replayOnMount?: boolean;

  durationMs?: number;

  ariaLabel?: string;
  className?: string;
};

function clamp01(n: number): number {
  if (Number.isNaN(n)) return 0;
  return Math.max(0, Math.min(1, n));
}

export default function ProgressBar({
  value,
  done,
  total,
  animate = true,
  replayOnMount = true,
  durationMs = 800,
  ariaLabel = 'progress',
  className,
}: ProgressBarProps) {
  const ratio = useMemo(() => {
    if (typeof value === 'number') return clamp01(value);
    if (typeof done === 'number' && typeof total === 'number' && total > 0) {
      return clamp01(done / total);
    }
    return 0;
  }, [value, done, total]);

  const targetPercent = useMemo(() => ratio * 100, [ratio]);

  const fillRef = useRef<HTMLDivElement | null>(null);
  const didMountRef = useRef<boolean>(false);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const el = fillRef.current;
    if (!el) return;

    el.style.transition = animate ? `width ${durationMs}ms ease` : 'none';

    if (!animate) {
      el.style.width = `${targetPercent}%`;
      didMountRef.current = true;
      return;
    }

    const isFirstMount = !didMountRef.current;
    didMountRef.current = true;

    if (replayOnMount && isFirstMount) {
      el.style.width = '0%';

      if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        el.style.width = `${targetPercent}%`;
      });

      return () => {
        if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
      };
    }

    el.style.width = `${targetPercent}%`;
  }, [animate, durationMs, replayOnMount, targetPercent]);

  return (
    <div
      className={`${styles.track} ${className ?? ''}`}
      role="progressbar"
      aria-label={ariaLabel}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(targetPercent)}
    >
      <div
        ref={fillRef}
        className={styles.fill}
        style={{ width: animate && replayOnMount ? '0%' : `${targetPercent}%` }}
      />
    </div>
  );
}
