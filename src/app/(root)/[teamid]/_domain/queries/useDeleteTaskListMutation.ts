import { useMutation, useQueryClient } from '@tanstack/react-query';
import { deleteTaskList } from '../apis/taskList';
import { teamGroupKeys } from './queryKeys';

export function useDeleteTaskListMutation(groupId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (taskListId: number) => deleteTaskList(groupId, taskListId),
    onSettled: () => {
      void queryClient.invalidateQueries({ queryKey: teamGroupKeys.detail(groupId) });
    },
  });
}
