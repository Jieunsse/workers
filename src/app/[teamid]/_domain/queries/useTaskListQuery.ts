import { queryOptions, useQuery } from '@tanstack/react-query';
import { getTaskList } from '../apis/taskList';
import { taskListKeys } from './queryKeys';

export function taskListQueryOptions(groupId: number, taskListId: number, date?: string) {
  return queryOptions({
    queryKey: taskListKeys.detail(groupId, taskListId, date),
    queryFn: () => getTaskList(groupId, taskListId, date),
  });
}

export function useTaskListQuery(groupId: number, taskListId: number, date?: string) {
  return useQuery(taskListQueryOptions(groupId, taskListId, date));
}
