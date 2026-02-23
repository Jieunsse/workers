import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteGroup } from '../apis/group';
import { teamGroupKeys } from './queryKeys';
import { currentUserKeys } from '@/shared/queries/user/useCurrentUserQuery';

export function useDeleteGroupMutation(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: () => deleteGroup(groupId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: teamGroupKeys.all });
      // 유저 멤버십 목록도 갱신하여 사이드바에서 삭제된 팀이 사라지도록 처리
      void queryClient.invalidateQueries({ queryKey: currentUserKeys.all });
    },
  });
}
