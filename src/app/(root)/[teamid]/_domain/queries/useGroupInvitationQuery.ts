import { queryOptions, useQuery } from '@tanstack/react-query';
import { getGroupInvitation } from '../apis/group';
import { teamGroupKeys } from './queryKeys';

export function groupInvitationQueryOptions(groupId: number) {
  return queryOptions({
    queryKey: teamGroupKeys.invitation(groupId),
    queryFn: () => getGroupInvitation(groupId),
    staleTime: 0,
  });
}

export function useGroupInvitationQuery(groupId: number, enabled: boolean) {
  return useQuery({
    ...groupInvitationQueryOptions(groupId),
    enabled,
  });
}
