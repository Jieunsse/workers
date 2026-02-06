import styles from './Chip.module.css';

interface ChipProps {
  label: string;
  count?: number;
  size?: 'large' | 'small';
  selected?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

/**
 * Chip 컴포넌트
 *
 * @description
 * 필터, 카테고리, 상태 선택 등에 사용되는 선택형 UI 컴포넌트입니다.
 * 텍스트(label)와 선택적으로 개수(count)를 표시할 수 있으며,
 * 크기(size)에 따라 large / small 두 가지 형태를 제공합니다.
 *
 * @remarks
 * - `selected`는 선택이 유지되는 상태를 의미합니다. (Figma 시안의 "pressed" 상태)
 * - 마우스로 누르는 순간의 상태는 CSS `:active`로 처리하며,
 *   선택 상태(`selected`)와는 개념적으로 분리되어 있습니다.
 * - 주로 모바일/태블릿 환경에서 Chip 형태로 사용되며,
 *   PC 환경에서는 동일한 데이터를 카드(Card) 컴포넌트로 표현할 수 있습니다.
 *
 * @param label - 칩에 표시될 텍스트
 * @param count - 선택적으로 표시되는 개수
 * @param size - 칩 크기 (`large` | `small`)
 * @param selected - 선택된 상태 여부
 * @param disabled - 비활성화 여부
 * @param onClick - 클릭 이벤트 핸들러
 *
 * @example
 * ```tsx
 * <Chip label="법인 설립" count={3} selected onClick={handleClick} />
 * ```
 */
export default function Chip({
  label,
  count,
  size = 'large',
  selected = false,
  disabled = false,
  onClick,
  className = '',
}: ChipProps) {
  const chipClassName = [styles.chip, styles[size], selected && styles.selected, className]
    .filter(Boolean)
    .join(' ');

  const isClickable = Boolean(onClick) && !disabled;

  return (
    <button
      type="button"
      className={chipClassName}
      onClick={isClickable ? onClick : undefined}
      disabled={disabled}
      aria-pressed={selected}
    >
      <span className={styles.label}>{label}</span>
      {typeof count === 'number' && <span className={styles.count}>{count}</span>}
    </button>
  );
}
