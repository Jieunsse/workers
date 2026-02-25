import { queryOptions, useSuspenseQuery, useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/shared/apis/user';

export const currentUserKeys = {
  all: ['user'] as const,
  me: () => [...currentUserKeys.all, 'me'] as const,
};

export function currentUserQueryOptions() {
  return queryOptions({
    queryKey: currentUserKeys.me(),
    queryFn: () => getCurrentUser(),
    staleTime: 5 * 60 * 1000, // 5분
  });
}

export function useCurrentUserQuery(options?: { retry?: boolean | number }) {
  return useQuery({ ...currentUserQueryOptions(), ...options });
}

export function useSuspenseCurrentUserQuery() {
  return useSuspenseQuery(currentUserQueryOptions());
}
