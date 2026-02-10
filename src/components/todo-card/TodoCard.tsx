'use client';

import clsx from 'clsx';
import Image from 'next/image';

import Badge from '@/components/badge/Badge';
import CheckBox from '@/components/checkbox/CheckBox';

import styles from './styles/TodoCard.module.css';
import { TODO_CARD_ICONS } from './constants/todoCardConstants';
import type { TodoCardProps } from './types/types';

/**
 * 할일 카드 컴포넌트.
 * 제목, 진행 상태 뱃지, 체크박스 리스트를 포함합니다.
 * expanded가 false이면 헤더만 표시됩니다.
 */
export default function TodoCard({
  title,
  items,
  onItemCheckedChange,
  onKebabClick,
  expanded = true,
  className,
}: TodoCardProps) {
  const checkedCount = items.filter((item) => item.checked).length;
  const totalCount = items.length;
  const badgeLabel = `${checkedCount}/${totalCount}`;
  const badgeState = checkedCount === totalCount && totalCount > 0 ? 'done' : 'ongoing';

  return (
    <div className={clsx(styles.card, className)}>
      <div className={styles.header}>
        <span className={styles.title}>{title}</span>
        <Badge state={badgeState} size="small" label={badgeLabel} />
        <button type="button" className={styles.kebab} onClick={onKebabClick} aria-label="더보기">
          <Image src={TODO_CARD_ICONS.kebab} alt="" width={16} height={16} />
        </button>
      </div>

      {expanded && items.length > 0 && (
        <div className={styles.body}>
          {items.map((item) => (
            <div key={item.id} className={clsx(styles.item, item.checked && styles.itemChecked)}>
              <CheckBox
                checked={item.checked}
                size="small"
                label={<span className={styles.itemLabel}>{item.text}</span>}
                onCheckedChange={
                  onItemCheckedChange
                    ? (checked) => onItemCheckedChange(item.id, checked)
                    : undefined
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
