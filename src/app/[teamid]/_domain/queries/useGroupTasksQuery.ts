import { queryOptions, useQuery } from '@tanstack/react-query';
import { getGroupTasks } from '../apis/group';
import { teamGroupKeys } from './queryKeys';

export function groupTasksQueryOptions(groupId: number, date?: string) {
  return queryOptions({
    queryKey: teamGroupKeys.tasks(groupId, date),
    queryFn: () => getGroupTasks(groupId, date),
  });
}

export function useGroupTasksQuery(groupId: number, date?: string) {
  return useQuery(groupTasksQueryOptions(groupId, date));
}
