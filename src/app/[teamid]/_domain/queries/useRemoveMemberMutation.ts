import { useMutation, useQueryClient } from '@tanstack/react-query';
import { removeGroupMember } from '@/shared/apis/groups/member';
import { teamGroupKeys } from './queryKeys';

export function useRemoveMemberMutation(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (memberUserId: number) => removeGroupMember(groupId, memberUserId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: teamGroupKeys.detail(groupId) });
    },
  });
}
