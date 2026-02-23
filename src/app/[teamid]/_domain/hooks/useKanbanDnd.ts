import { useState } from 'react';
import {
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import type { KanbanTask, KanbanStatus } from '../interfaces/team';

// 드래그 시작으로 인식하는 최소 이동 거리(px)
const DRAG_ACTIVATION_DISTANCE = 8;

export function useKanbanDnd(
  tasks: KanbanTask[],
  setTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>>,
  columnIds: KanbanStatus[],
) {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: DRAG_ACTIVATION_DISTANCE },
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    setActiveTask(tasks.find((t) => t.id === String(event.active.id)) ?? null);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over || active.id === over.id) return;

    const activeId = String(active.id);
    const overId = String(over.id);

    // over가 컬럼인 경우 (빈 컬럼에 드롭)
    const isOverColumn = columnIds.includes(overId as KanbanStatus);
    if (isOverColumn) {
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: overId as KanbanStatus } : t)),
      );
      return;
    }

    // over가 다른 태스크인 경우
    const overTaskItem = tasks.find((t) => t.id === overId);
    const activeTaskItem = tasks.find((t) => t.id === activeId);
    if (!overTaskItem || !activeTaskItem) return;

    if (activeTaskItem.status === overTaskItem.status) {
      // 같은 컬럼 내 순서 변경
      setTasks((prev) => {
        const colTasks = prev.filter((t) => t.status === activeTaskItem.status);
        const otherTasks = prev.filter((t) => t.status !== activeTaskItem.status);
        const oldIdx = colTasks.findIndex((t) => t.id === activeId);
        const newIdx = colTasks.findIndex((t) => t.id === overId);
        return [...otherTasks, ...arrayMove(colTasks, oldIdx, newIdx)];
      });
    } else {
      // 다른 컬럼으로 이동
      setTasks((prev) =>
        prev.map((t) => (t.id === activeId ? { ...t, status: overTaskItem.status } : t)),
      );
    }
  };

  return {
    activeTask,
    sensors,
    handleDragStart,
    handleDragEnd,
  };
}
