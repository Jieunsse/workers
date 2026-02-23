'use client';

import { DndContext, DragOverlay } from '@dnd-kit/core';
import TodoCard from '@/components/todo-card/TodoCard';
import AddTodoList from '@/components/Modal/domain/components/AddTodoList/AddTodoList';
import KanbanColumn from './KanbanColumn';
import styles from './KanbanBoard.module.css';
import type { KanbanStatus } from '../../interfaces/team';
import type { TaskList } from '../../apis/types';
import { useKanbanTasks } from '../../hooks/useKanbanTasks';
import { useKanbanDnd } from '../../hooks/useKanbanDnd';

export const KANBAN_COLUMNS: { id: KanbanStatus; label: string }[] = [
  { id: 'todo', label: '할 일' },
  { id: 'inProgress', label: '진행중' },
  { id: 'done', label: '완료' },
];

const COLUMN_IDS = KANBAN_COLUMNS.map((c) => c.id);

interface KanbanBoardProps {
  groupId: number;
  teamId: string;
  taskLists: Omit<TaskList, 'tasks'>[];
}

export default function KanbanBoard({ groupId, teamId, taskLists }: KanbanBoardProps) {
  const {
    tasks,
    setTasks,
    addingStatus,
    newListTitle,
    handleItemCheckedChange,
    handleCardClick,
    handleDeleteTask,
    handleUpdateTask,
    handleAddTask,
    handleAddListSubmit,
    handleAddListClose,
    handleNewListTitleChange,
  } = useKanbanTasks(groupId, teamId, taskLists);

  const { activeTask, sensors, handleDragStart, handleDragEnd } = useKanbanDnd(
    tasks,
    setTasks,
    COLUMN_IDS,
  );

  return (
    <div className={styles.wrapper}>
      <div className={styles.boardHeader}>
        <h2 className={styles.boardTitle}>
          할 일 목록 <span className={styles.boardCount}>({tasks.length}개)</span>
        </h2>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className={styles.board}>
          {KANBAN_COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              status={col.id}
              label={col.label}
              tasks={tasks.filter((t) => t.status === col.id)}
              onItemCheckedChange={handleItemCheckedChange}
              onCardClick={handleCardClick}
              onAddTask={handleAddTask}
              onDeleteTask={handleDeleteTask}
              onUpdateTask={handleUpdateTask}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className={styles.dragOverlay}>
              <TodoCard title={activeTask.title} items={activeTask.items} />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      <AddTodoList
        isOpen={addingStatus !== null}
        onClose={handleAddListClose}
        onSubmit={() => void handleAddListSubmit()}
        input={{
          props: {
            value: newListTitle,
            onChange: (e) => handleNewListTitleChange(e.target.value),
          },
        }}
      />
    </div>
  );
}
