'use client';

import { memo, useState, useRef, useEffect } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import TodoCard from '@/components/todo-card/TodoCard';
import styles from './KanbanItem.module.css';
import type { KanbanTask, TaskItem } from '../../interfaces/team';

interface KanbanItemProps {
  task: KanbanTask;
  onItemCheckedChange?: (taskId: string, itemId: string, checked: boolean) => void;
  onCardClick?: (taskId: string) => void;
  onDeleteTask?: (taskId: string) => void;
  onEditTask?: (taskId: string) => void;
  onUpdateTask?: (taskId: string, updatedData: { title: string; items: TaskItem[] }) => void;
}

function KanbanItem({
  task,
  onItemCheckedChange,
  onCardClick,
  onDeleteTask,
  onEditTask,
  onUpdateTask,
}: KanbanItemProps) {
  // 할일이 없거나 일부만 완료된 경우 펼침, 모두 완료된 경우 접힘
  const allChecked = task.items.length > 0 && task.items.every((item) => item.checked);
  const [isExpanded, setIsExpanded] = useState(!allChecked);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editItems, setEditItems] = useState<TaskItem[]>(task.items);
  const containerRef = useRef<HTMLDivElement>(null);

  const { listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  // 메뉴 외부 클릭 시 닫기
  useEffect(() => {
    if (!isMenuOpen) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMenuOpen]);

  const handleContainerClick = (e: React.MouseEvent) => {
    if (isEditing) return;
    const target = e.target as HTMLElement;
    if (!target.closest('button, input, label, a')) {
      setIsExpanded((prev) => !prev);
    }
  };

  const handleKebabClick = () => {
    setIsMenuOpen((prev) => !prev);
  };

  const handleEdit = () => {
    setIsMenuOpen(false);
    setEditTitle(task.title);
    setEditItems(task.items);
    setIsEditing(true);
    onEditTask?.(task.id);
  };

  const handleDelete = () => {
    setIsMenuOpen(false);
    onDeleteTask?.(task.id);
  };

  const handleSave = () => {
    onUpdateTask?.(task.id, { title: editTitle, items: editItems });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleItemTextChange = (itemId: string, newText: string) => {
    setEditItems((prev) =>
      prev.map((item) => (item.id === itemId ? { ...item, text: newText } : item)),
    );
  };

  return (
    // dnd-kit의 PointerSensor는 button 요소를 드래그 제외 대상으로 처리하므로
    // listeners를 item 컨테이너에 배치하여 카드 전체 영역에서 드래그 가능하게 함
    <div
      ref={setNodeRef}
      style={style}
      className={styles.item}
      onClick={handleContainerClick}
      {...(isEditing ? {} : listeners)}
    >
      <div ref={containerRef} className={styles.cardWrapper}>
        {isEditing ? (
          <div className={styles.editCard}>
            <input
              className={styles.editTitleInput}
              value={editTitle}
              onChange={(e) => setEditTitle(e.target.value)}
              placeholder="할 일 제목"
            />
            {editItems.length > 0 && (
              <div className={styles.editItems}>
                {editItems.map((item) => (
                  <input
                    key={item.id}
                    className={styles.editItemInput}
                    value={item.text}
                    onChange={(e) => handleItemTextChange(item.id, e.target.value)}
                    placeholder="항목 내용"
                  />
                ))}
              </div>
            )}
            <div className={styles.editActions}>
              <button type="button" className={styles.cancelButton} onClick={handleCancel}>
                취소
              </button>
              <button type="button" className={styles.saveButton} onClick={handleSave}>
                저장
              </button>
            </div>
          </div>
        ) : (
          <>
            <TodoCard
              title={task.title}
              items={task.items}
              expanded={isExpanded}
              onItemCheckedChange={
                onItemCheckedChange
                  ? (itemId, checked) => onItemCheckedChange(task.id, itemId, checked)
                  : undefined
              }
              onKebabClick={handleKebabClick}
              className={isExpanded ? styles.todoCard : styles.todoCardFolded}
            />
            {isMenuOpen && (
              <div className={styles.contextMenu}>
                <button type="button" className={styles.menuItem} onClick={handleEdit}>
                  수정하기
                </button>
                <button type="button" className={styles.menuItem} onClick={handleDelete}>
                  삭제하기
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default memo(KanbanItem);
