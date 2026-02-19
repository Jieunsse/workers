export const CREATE_TEAM_MESSAGES = {
  success: '팀이 생성되었습니다.',
  emptyTeamNameError: '팀 이름을 입력해주세요.',
  duplicatedTeamNameError: '중복된 팀 이름입니다.',
  duplicatedTeamNameFailure: '이미 존재하는 팀 이름이라 생성에 실패했어요.',
  invalidRequestFailure: '요청 값이 올바르지 않아 팀 생성에 실패했어요.',
  unauthorizedFailure: '팀을 생성할 권한이 없어 실패했어요.',
  defaultFailure: '팀 생성에 실패했어요. 잠시 후 다시 시도해주세요.',
} as const;
