'use client';

import { memo } from 'react';
import { useDroppable, useDndContext } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';

import KanbanItem from './KanbanItem';
import styles from './KanbanColumn.module.css';
import type { KanbanTask, KanbanStatus, TaskItem } from '../../interfaces/team';
import Image from 'next/image';
import Plus from '@/assets/buttons/plus/plusBoxButton.svg';

interface KanbanColumnProps {
  status: KanbanStatus;
  label: string;
  tasks: KanbanTask[];
  onItemCheckedChange?: (taskId: string, itemId: string, checked: boolean) => void;
  onCardClick?: (taskId: string) => void;
  onAddTask?: (status: KanbanStatus) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updatedData: { title: string; items: TaskItem[] }) => void;
}

function KanbanColumn({
  status,
  label,
  tasks,
  onItemCheckedChange,
  onCardClick,
  onAddTask,
  onDeleteTask,
  onEditTask,
  onUpdateTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const { active, over } = useDndContext();
  const itemIds = tasks.map((t) => t.id);

  // 현재 컬럼의 아이템이 드래그 중인지 확인
  const isActiveFromThisColumn = active ? tasks.some((t) => t.id === String(active.id)) : false;

  // 다른 컬럼 아이템을 이 컬럼의 기존 아이템 위로 드래그 중인지 확인
  const isOverThisColumnItem = over ? tasks.some((t) => t.id === String(over.id)) : false;

  // 다른 컬럼에서 이 컬럼으로 드래그 진입 시 드롭 가이드 표시
  const showDropGuide = !!active && !isActiveFromThisColumn && (isOver || isOverThisColumnItem);

  // 드래그 중인 아이템의 초기 높이 (가이드 크기를 아이템과 동일하게 맞추기 위함)
  const draggedItemHeight = active?.rect.current.initial?.height ?? 54;

  return (
    <div className={styles.column}>
      <div className={styles.columnHeader}>
        <h3 className={styles.columnTitle}>{label}</h3>
        <button
          type="button"
          className={styles.addButton}
          onClick={() => onAddTask?.(status)}
          aria-label={`${label}에 할 일 추가`}
        >
          <Image src={Plus} width={24} height={24} alt="더하기 버튼" />
        </button>
      </div>

      <SortableContext items={itemIds} strategy={verticalListSortingStrategy}>
        <div ref={setNodeRef} className={`${styles.itemList} ${isOver ? styles.isOver : ''}`}>
          {tasks.map((task) => (
            <KanbanItem
              key={task.id}
              task={task}
              onItemCheckedChange={onItemCheckedChange}
              onCardClick={onCardClick}
              onDeleteTask={onDeleteTask}
              onEditTask={onEditTask}
              onUpdateTask={onUpdateTask}
            />
          ))}
          {showDropGuide && (
            <div className={styles.dropGuide} style={{ height: draggedItemHeight }} />
          )}
        </div>
      </SortableContext>
    </div>
  );
}

export default memo(KanbanColumn);
