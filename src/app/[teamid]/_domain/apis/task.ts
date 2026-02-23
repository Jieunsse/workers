import { requestJson } from '@/shared/apis/groups/http';
import type { Task } from './types';

export function updateTask(
  groupId: number,
  taskListId: number,
  taskId: number,
  data: { done?: boolean; name?: string; description?: string },
): Promise<Task> {
  return requestJson<Task>(
    `/groups/${groupId}/task-lists/${taskListId}/tasks/${taskId}`,
    '할 일 수정 실패',
    {
      method: 'PATCH',
      body: JSON.stringify(data),
    },
  );
}
