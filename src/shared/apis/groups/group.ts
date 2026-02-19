import { requestJson } from './http';
import { CreateGroupBody, Group } from './types';

const GROUP_ERROR_MESSAGE = {
  create: '그룹 생성 실패',
} as const;

export function createGroup(body: CreateGroupBody): Promise<Group> {
  return requestJson<Group>('/groups', GROUP_ERROR_MESSAGE.create, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
