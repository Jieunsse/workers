import { requestJson } from './http';
import { GroupTask } from './types';

const TASK_ERROR_MESSAGE = {
  fetch: 'Failed to fetch group tasks',
} as const;

export function getGroupTasks(groupId: number): Promise<GroupTask[]> {
  return requestJson<GroupTask[]>(`/groups/${groupId}/tasks`, TASK_ERROR_MESSAGE.fetch, {
    cache: 'no-store',
  });
}
