export const groupsKeys = {
  all: ['groups'] as const,
  details: () => [...groupsKeys.all, 'detail'] as const,
  detail: (groupId: number) => [...groupsKeys.details(), groupId] as const,
  create: () => [...groupsKeys.all, 'create'] as const,
};
