import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createGroup } from '@/shared/apis/groups/group';
import { groupsKeys } from './queryKeys';

export function useCreateGroupMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: groupsKeys.create(),
    mutationFn: createGroup,
    onSuccess: (group) => {
      queryClient.setQueryData(groupsKeys.detail(group.id), group);
    },
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: groupsKeys.all });
    },
  });
}
