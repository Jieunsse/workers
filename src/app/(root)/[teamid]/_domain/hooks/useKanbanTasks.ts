import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import type { KanbanTask, KanbanStatus, TaskItem } from '../interfaces/team';
import type { TaskList } from '../apis/types';
import { taskListQueryOptions } from '../queries/useTaskListQuery';
import { useCreateTaskListMutation } from '../queries/useCreateTaskListMutation';
import { useDeleteTaskListMutation } from '../queries/useDeleteTaskListMutation';
import { updateTask } from '../apis/task';
import { taskListKeys } from '../queries/queryKeys';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

// localStorage에 컬럼 위치를 저장하여 새로고침 후에도 유지
function getStoredStatus(groupId: number, taskListId: number): KanbanStatus | null {
  try {
    const stored = localStorage.getItem(`kanban-status-${groupId}-${taskListId}`);
    if (stored === 'todo' || stored === 'inProgress' || stored === 'done') return stored;
    return null;
  } catch {
    return null;
  }
}

function setStoredStatus(groupId: number, taskListId: number, status: KanbanStatus): void {
  try {
    localStorage.setItem(`kanban-status-${groupId}-${taskListId}`, status);
  } catch {}
}

function deriveStatus(items: TaskItem[]): KanbanStatus {
  if (items.length === 0) return 'todo';
  const doneCount = items.filter((item) => item.checked).length;
  if (doneCount === 0) return 'todo';
  if (doneCount === items.length) return 'done';
  return 'inProgress';
}

export function useKanbanTasks(
  groupId: number,
  teamId: string,
  taskLists: Omit<TaskList, 'tasks'>[],
) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const today = getTodayDateString();

  // 각 할 일 목록의 태스크를 병렬로 조회
  const taskListQueries = useQueries({
    queries: taskLists.map((tl) => taskListQueryOptions(groupId, tl.id, today)),
  });

  // API 데이터 → KanbanTask 변환 (목록 ID와 쿼리 갱신 시각 기준으로 메모이제이션)
  const taskListIds = taskLists.map((tl) => tl.id).join(',');
  const queriesKey = taskListQueries.map((q) => q.dataUpdatedAt).join(',');

  const computedTasks = useMemo(() => {
    return taskLists.map((tl, i) => {
      const apiTasks = taskListQueries[i]?.data?.tasks ?? [];
      const items: TaskItem[] = apiTasks.map((task) => ({
        id: String(task.id),
        text: task.name,
        checked: task.doneAt !== null,
      }));
      // localStorage 저장값 우선, 없으면 item 완료 비율로 파생
      const storedStatus = getStoredStatus(groupId, tl.id);
      return {
        id: String(tl.id),
        title: tl.name,
        items,
        status: storedStatus ?? deriveStatus(items),
      };
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskListIds, queriesKey]);

  // DnD를 위한 로컬 상태 (API 데이터 변경 시 초기화)
  const [prevComputed, setPrevComputed] = useState<KanbanTask[]>(computedTasks);
  const [tasks, setTasks] = useState<KanbanTask[]>(computedTasks);

  if (prevComputed !== computedTasks) {
    setPrevComputed(computedTasks);
    setTasks(computedTasks);
  }

  // 할 일 목록 추가 모달 상태
  const [addingStatus, setAddingStatus] = useState<KanbanStatus | null>(null);
  const [newListTitle, setNewListTitle] = useState('');

  const createTaskListMutation = useCreateTaskListMutation(groupId);
  const deleteTaskListMutation = useDeleteTaskListMutation(groupId);

  // 카드 클릭 시 할 일 목록 상세 페이지로 이동
  const handleCardClick = useCallback(
    (taskId: string) => {
      router.push(`/${teamId}/tasks/${taskId}`);
    },
    [router, teamId],
  );

  // 할 일 목록 삭제
  const handleDeleteTask = useCallback(
    (taskId: string) => {
      deleteTaskListMutation.mutate(Number(taskId));
    },
    [deleteTaskListMutation],
  );

  // 체크박스 클릭 시 낙관적 업데이트 후 서버에 완료 상태 반영
  // 컬럼 이동은 발생하지 않음 (드래그앤 드롭으로만 이동 가능)
  const handleItemCheckedChange = useCallback(
    async (taskId: string, itemId: string, checked: boolean) => {
      const taskListId = Number(taskId);
      const queryKey = taskListKeys.detail(groupId, taskListId, today);

      // 진행 중인 백그라운드 리패치 취소 (낙관적 업데이트가 덮어씌워지는 것을 방지)
      await queryClient.cancelQueries({ queryKey });

      // 낙관적 업데이트: items만 변경하고 status(컬럼 위치)는 유지
      setTasks((prev) =>
        prev.map((task) => {
          if (task.id !== taskId) return task;
          const updatedItems = task.items.map((item) =>
            item.id === itemId ? { ...item, checked } : item,
          );
          // 현재 컬럼 위치를 localStorage에 고정 (deriveStatus 재계산으로 인한 이동 방지)
          setStoredStatus(groupId, taskListId, task.status);
          return { ...task, items: updatedItems };
        }),
      );

      try {
        await updateTask(groupId, taskListId, Number(itemId), { done: checked });
      } finally {
        // 성공/실패 관계없이 서버 상태와 동기화
        await queryClient.invalidateQueries({ queryKey });
      }
    },
    [groupId, today, queryClient],
  );

  // 할 일 목록 추가 모달 열기
  const handleAddTask = useCallback((status: KanbanStatus) => {
    setAddingStatus(status);
  }, []);

  // 새 할 일 목록 생성
  const handleAddListSubmit = useCallback(async () => {
    if (!newListTitle.trim() || !addingStatus) return;
    try {
      await createTaskListMutation.mutateAsync(newListTitle.trim());
      setNewListTitle('');
      setAddingStatus(null);
    } catch {
      // 에러는 상위에서 처리
    }
  }, [newListTitle, addingStatus, createTaskListMutation]);

  const handleAddListClose = useCallback(() => {
    setAddingStatus(null);
    setNewListTitle('');
  }, []);

  const handleNewListTitleChange = useCallback((value: string) => {
    setNewListTitle(value);
  }, []);

  // 수정 기능은 할 일 목록 상세 페이지에서 처리
  const handleUpdateTask = useCallback(() => {}, []);

  // 드래그로 컬럼 이동 시 컬럼 위치만 localStorage에 저장 (체크박스 상태는 변경하지 않음)
  const handleStatusChange = useCallback(
    (taskId: string, fromStatus: KanbanStatus, toStatus: KanbanStatus) => {
      if (fromStatus === toStatus) return;
      setStoredStatus(groupId, Number(taskId), toStatus);
    },
    [groupId],
  );

  return {
    tasks,
    setTasks,
    addingStatus,
    newListTitle,
    handleItemCheckedChange,
    handleCardClick,
    handleDeleteTask,
    handleUpdateTask,
    handleStatusChange,
    handleAddTask,
    handleAddListSubmit,
    handleAddListClose,
    handleNewListTitleChange,
  };
}
