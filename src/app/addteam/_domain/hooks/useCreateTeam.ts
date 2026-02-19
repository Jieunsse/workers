import { Group } from '@/shared/apis/groups/types';
import { useCreateGroupMutation } from '@/shared/queries/groups/useCreateGroupMutation';
import { groupsKeys } from '@/shared/queries/groups/queryKeys';
import { QueryClient, useQueryClient } from '@tanstack/react-query';
import { CREATE_TEAM_MESSAGES } from '../constants/createTeam';
import { isDuplicated, normalizeTeamName } from '../utils/duplicationCalculator';

function getCachedTeamNames(queryClient: QueryClient) {
  const cachedDetails = queryClient.getQueriesData<Group>({
    queryKey: groupsKeys.details(),
  });

  return cachedDetails
    .map(([, group]) => group?.name)
    .filter((name): name is string => typeof name === 'string');
}

export function useCreateTeam() {
  const queryClient = useQueryClient();
  const createGroupMutation = useCreateGroupMutation();

  const createTeam = async (name: string) => {
    const normalizedName = normalizeTeamName(name);
    if (!normalizedName) {
      throw new Error(CREATE_TEAM_MESSAGES.emptyTeamNameError);
    }

    const cachedNames = getCachedTeamNames(queryClient);
    if (isDuplicated(cachedNames, normalizedName)) {
      throw new Error(CREATE_TEAM_MESSAGES.duplicatedTeamNameError);
    }

    return createGroupMutation.mutateAsync({ name: normalizedName });
  };

  return {
    ...createGroupMutation,
    createTeam,
  };
}
