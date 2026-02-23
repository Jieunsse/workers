export const teamGroupKeys = {
  all: ['groups'] as const,
  details: () => [...teamGroupKeys.all, 'detail'] as const,
  detail: (groupId: number) => [...teamGroupKeys.details(), groupId] as const,
  tasks: (groupId: number, date?: string) =>
    [...teamGroupKeys.all, groupId, 'tasks', date] as const,
  invitation: (groupId: number) => [...teamGroupKeys.all, groupId, 'invitation'] as const,
};

export const taskListKeys = {
  detail: (groupId: number, taskListId: number, date?: string) =>
    ['groups', groupId, 'task-lists', taskListId, date] as const,
};
