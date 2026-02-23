import { useMutation, useQueryClient } from '@tanstack/react-query';
import { updateGroup } from '../apis/group';
import type { Group } from '../apis/types';
import { teamGroupKeys } from './queryKeys';

export function useUpdateGroupMutation(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: Parameters<typeof updateGroup>[1]) => updateGroup(groupId, body),
    onSuccess: (updatedGroup) => {
      queryClient.setQueryData(teamGroupKeys.detail(groupId), (prev: Group | undefined) =>
        prev ? { ...prev, ...updatedGroup } : updatedGroup,
      );
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: teamGroupKeys.detail(groupId) });
    },
  });
}
