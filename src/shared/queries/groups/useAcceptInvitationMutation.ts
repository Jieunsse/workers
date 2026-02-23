import { useMutation, useQueryClient } from '@tanstack/react-query';
import { acceptInvitation } from '@/shared/apis/groups/invitation';
import { groupsKeys } from './queryKeys';
import { currentUserKeys } from '@/shared/queries/user/useCurrentUserQuery';

export function useAcceptInvitationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: groupsKeys.acceptInvitation(),
    mutationFn: acceptInvitation,
    onSuccess: (group) => {
      queryClient.setQueryData(groupsKeys.detail(group.id), group);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: groupsKeys.all });
      // 사이드바가 사용하는 유저 정보(memberships)도 갱신
      void queryClient.invalidateQueries({ queryKey: currentUserKeys.all });
    },
  });
}
