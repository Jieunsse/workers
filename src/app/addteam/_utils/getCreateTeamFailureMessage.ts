import { CREATE_TEAM_MESSAGES } from '../_constants/createTeam';

const DUPLICATED_STATUS = 'status: 409';
const INVALID_REQUEST_STATUS = 'status: 400';
const UNAUTHORIZED_STATUSES = ['status: 401', 'status: 403'] as const;

function hasStatusMessage(message: string, status: string) {
  return message.includes(status);
}

export function getCreateTeamFailureMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return CREATE_TEAM_MESSAGES.defaultFailure;
  }

  const { message } = error;

  if (message === CREATE_TEAM_MESSAGES.emptyTeamNameError) {
    return CREATE_TEAM_MESSAGES.emptyTeamNameError;
  }

  if (
    message === CREATE_TEAM_MESSAGES.duplicatedTeamNameError ||
    hasStatusMessage(message, DUPLICATED_STATUS)
  ) {
    return CREATE_TEAM_MESSAGES.duplicatedTeamNameFailure;
  }

  if (hasStatusMessage(message, INVALID_REQUEST_STATUS)) {
    return CREATE_TEAM_MESSAGES.invalidRequestFailure;
  }

  if (UNAUTHORIZED_STATUSES.some((status) => hasStatusMessage(message, status))) {
    return CREATE_TEAM_MESSAGES.unauthorizedFailure;
  }

  return CREATE_TEAM_MESSAGES.defaultFailure;
}
