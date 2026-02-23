import { requestJson, requestVoid } from '@/shared/apis/groups/http';
import type { TaskList } from './types';

const TASK_LIST_ERROR_MESSAGE = {
  create: '작업 목록 생성 실패',
  fetch: '작업 목록 조회 실패',
  delete: '작업 목록 삭제 실패',
} as const;

export function createTaskList(groupId: number, name: string): Promise<TaskList> {
  return requestJson<TaskList>(`/groups/${groupId}/task-lists`, TASK_LIST_ERROR_MESSAGE.create, {
    method: 'POST',
    body: JSON.stringify({ name }),
  });
}

export function getTaskList(groupId: number, taskListId: number, date?: string): Promise<TaskList> {
  const query = date ? `?date=${encodeURIComponent(date)}` : '';
  return requestJson<TaskList>(
    `/groups/${groupId}/task-lists/${taskListId}${query}`,
    TASK_LIST_ERROR_MESSAGE.fetch,
  );
}

export function deleteTaskList(groupId: number, taskListId: number): Promise<void> {
  return requestVoid(
    `/groups/${groupId}/task-lists/${taskListId}`,
    TASK_LIST_ERROR_MESSAGE.delete,
    { method: 'DELETE' },
  );
}
