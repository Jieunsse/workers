import { useAcceptInvitationMutation } from '@/shared/queries/groups/useAcceptInvitationMutation';
import { useCurrentUserQuery } from '@/shared/queries/user/useCurrentUserQuery';

// 팀 링크(URL) 또는 토큰 문자열에서 inviteToken을 추출
function extractToken(teamLink: string): string {
  try {
    const url = new URL(teamLink.trim());
    const token = url.searchParams.get('token');
    if (token) return token;
  } catch {
    // URL 파싱 실패 시 입력값 자체를 토큰으로 사용
  }
  return teamLink.trim();
}

export function useJoinTeam() {
  const acceptInvitationMutation = useAcceptInvitationMutation();
  const { data: currentUser } = useCurrentUserQuery();

  const joinTeam = async (teamLink: string) => {
    const token = extractToken(teamLink);
    if (!token) {
      throw new Error('팀 링크를 입력해주세요.');
    }
    const userEmail = currentUser?.email;
    if (!userEmail) {
      throw new Error('로그인이 필요합니다.');
    }
    return acceptInvitationMutation.mutateAsync({ userEmail, token });
  };

  return {
    ...acceptInvitationMutation,
    joinTeam,
  };
}
