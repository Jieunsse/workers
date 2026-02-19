import { requestJson, requestVoid } from './http';
import { AddMemberBody, Group, GroupMember } from './types';

const MEMBER_ERROR_MESSAGE = {
  fetch: 'Failed to fetch group member',
  add: 'Failed to add member',
  remove: 'Failed to remove group member',
} as const;

export function addMember(groupId: number, body: AddMemberBody): Promise<Group> {
  return requestJson<Group>(`/groups/${groupId}/member`, MEMBER_ERROR_MESSAGE.add, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

export function getGroupMember(groupId: number, memberUserId: number): Promise<GroupMember> {
  return requestJson<GroupMember>(
    `/groups/${groupId}/member/${memberUserId}`,
    MEMBER_ERROR_MESSAGE.fetch,
  );
}

export function removeGroupMember(groupId: number, memberUserId: number): Promise<void> {
  return requestVoid(`/groups/${groupId}/member/${memberUserId}`, MEMBER_ERROR_MESSAGE.remove, {
    method: 'DELETE',
  });
}
