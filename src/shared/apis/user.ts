import { requestJson } from './groups/http';

export type UserRole = 'ADMIN' | 'MEMBER';

export interface UserMembershipGroup {
  id: number;
  name: string;
  image: string | null;
  teamId: string;
}

export interface UserMembership {
  userId: number;
  groupId: number;
  role: UserRole;
  group: UserMembershipGroup;
}

export interface User {
  id: number;
  teamId: string;
  nickname: string;
  email: string;
  image: string | null;
  memberships: UserMembership[];
}

const USER_ERROR_MESSAGE = {
  fetch: '유저 정보 조회 실패',
} as const;

export function getCurrentUser(): Promise<User> {
  return requestJson<User>('/user', USER_ERROR_MESSAGE.fetch);
}
