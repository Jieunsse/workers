import { useState } from 'react';
import type React from 'react';
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

// input, label 등 인터랙티브 요소 클릭 시 드래그를 시작하지 않는 커스텀 센서
class SmartPointerSensor extends PointerSensor {
  static activators = [
    {
      eventName: 'onPointerDown' as const,
      handler: ({ nativeEvent: event }: React.PointerEvent): boolean => {
        if (!event.isPrimary || event.button !== 0) return false;
        const target = event.target as Element;
        if (target.closest('input, button, a, label, textarea, select')) return false;
        return true;
      },
    },
  ];
}

export function useKanbanDnd(
  tasks: KanbanTask[],
  setTasks: React.Dispatch<React.SetStateAction<KanbanTask[]>>,
  columnIds: KanbanStatus[],
  onStatusChange?: (taskId: string, fromStatus: KanbanStatus, toStatus: KanbanStatus) => void,
) {
  const [activeTask, setActiveTask] = useState<KanbanTask | null>(null);

  const sensors = useSensors(
    useSensor(SmartPointerSensor, {
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
      const activeTaskItem = tasks.find((t) => t.id === activeId);
      if (activeTaskItem && activeTaskItem.status !== overId) {
        const fromStatus = activeTaskItem.status;
        const toStatus = overId as KanbanStatus;
        setTasks((prev) => prev.map((t) => (t.id === activeId ? { ...t, status: toStatus } : t)));
        onStatusChange?.(activeId, fromStatus, toStatus);
      }
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
      const fromStatus = activeTaskItem.status;
      const toStatus = overTaskItem.status;
      setTasks((prev) => prev.map((t) => (t.id === activeId ? { ...t, status: toStatus } : t)));
      onStatusChange?.(activeId, fromStatus, toStatus);
    }
  };

  return {
    activeTask,
    sensors,
    handleDragStart,
    handleDragEnd,
  };
}
