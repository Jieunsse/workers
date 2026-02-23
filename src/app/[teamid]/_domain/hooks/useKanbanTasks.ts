import { useState, useCallback, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useQueries } from '@tanstack/react-query';
import type { KanbanTask, KanbanStatus, TaskItem } from '../interfaces/team';
import type { TaskList } from '../apis/types';
import { taskListQueryOptions } from '../queries/useTaskListQuery';
import { useCreateTaskListMutation } from '../queries/useCreateTaskListMutation';
import { useDeleteTaskListMutation } from '../queries/useDeleteTaskListMutation';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
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
      return {
        id: String(tl.id),
        title: tl.name,
        items,
        status: deriveStatus(items),
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

  // 태스크 아이템 체크 상태 변경은 할 일 목록 상세 페이지에서 처리하므로 빈 함수
  const handleItemCheckedChange = useCallback(() => {}, []);

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

  return {
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
  };
}
