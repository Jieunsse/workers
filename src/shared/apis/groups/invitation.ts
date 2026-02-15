import { requestJson } from './http';
import { AcceptInvitationBody, Group, InvitationInfo } from './types';

const INVITATION_ERROR_MESSAGE = {
  fetch: 'Failed to fetch invitation info',
  accept: 'Failed to accept invitation',
} as const;

export function getInvitationInfo(groupId: number): Promise<InvitationInfo> {
  return requestJson<InvitationInfo>(
    `/groups/${groupId}/invitation`,
    INVITATION_ERROR_MESSAGE.fetch,
  );
}

export function acceptInvitation(body: AcceptInvitationBody): Promise<Group> {
  return requestJson<Group>('/groups/accept-invitation', INVITATION_ERROR_MESSAGE.accept, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}
