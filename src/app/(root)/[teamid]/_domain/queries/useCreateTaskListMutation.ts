import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTaskList } from '../apis/taskList';
import { teamGroupKeys } from './queryKeys';

export function useCreateTaskListMutation(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (name: string) => createTaskList(groupId, name),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: teamGroupKeys.detail(groupId) });
    },
  });
}
