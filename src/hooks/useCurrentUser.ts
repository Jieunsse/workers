'use client';

import { useQuery } from '@tanstack/react-query';
import { getUser } from '@/app/(root)/mypage/apis';
import type { UserResponse } from '@/app/(root)/mypage/apis';

export function useCurrentUser() {
  return useQuery<UserResponse | null>({
    queryKey: ['currentUser'],
    queryFn: async () => {
      try {
        return await getUser();
      } catch {
        return null;
      }
    },
    staleTime: 60_000,
    retry: 1,
  });
}
