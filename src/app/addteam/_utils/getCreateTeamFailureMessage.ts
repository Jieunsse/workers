import { CREATE_TEAM_MESSAGES } from '../_constants/createTeam';

export function getCreateTeamFailureMessage(error: unknown) {
  if (!(error instanceof Error)) {
    return CREATE_TEAM_MESSAGES.defaultFailure;
  }

  if (error.message === CREATE_TEAM_MESSAGES.emptyTeamNameError) {
    return CREATE_TEAM_MESSAGES.emptyTeamNameError;
  }

  if (
    error.message === CREATE_TEAM_MESSAGES.duplicatedTeamNameError ||
    error.message.includes('status: 409')
  ) {
    return CREATE_TEAM_MESSAGES.duplicatedTeamNameFailure;
  }

  if (error.message.includes('status: 400')) {
    return CREATE_TEAM_MESSAGES.invalidRequestFailure;
  }

  if (error.message.includes('status: 401') || error.message.includes('status: 403')) {
    return CREATE_TEAM_MESSAGES.unauthorizedFailure;
  }

  return CREATE_TEAM_MESSAGES.defaultFailure;
}
