import { queryOptions, useSuspenseQuery } from '@tanstack/react-query';
import { getGroup } from '../apis/group';
import { teamGroupKeys } from './queryKeys';

export function groupQueryOptions(groupId: number) {
  return queryOptions({
    queryKey: teamGroupKeys.detail(groupId),
    queryFn: () => getGroup(groupId),
  });
}

export function useGroupQuery(groupId: number) {
  return useSuspenseQuery(groupQueryOptions(groupId));
}
