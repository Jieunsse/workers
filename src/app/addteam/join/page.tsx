'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import JoinTeamCard from '../_domain/components/JoinTeamCard';
import { useJoinTeam } from '../_domain/hooks/useJoinTeam';
import type { CreateTeamFeedback } from '../_domain/interfaces/feedback';

function JoinTeamPageContent() {
  const searchParams = useSearchParams();
  // 초대 링크로 직접 접근 시 URL의 현재 주소를 입력값으로 자동 설정
  const [teamLink, setTeamLink] = useState(() => {
    if (typeof window === 'undefined') return '';
    return searchParams.get('token') ? window.location.href : '';
  });
  const [feedback, setFeedback] = useState<CreateTeamFeedback | null>(null);
  const { joinTeam, isPending } = useJoinTeam();
  const router = useRouter();

  const isSubmitDisabled = !teamLink.trim() || isPending;

  const handleSubmit = async () => {
    if (isSubmitDisabled) return;

    try {
      const group = await joinTeam(teamLink);
      setFeedback({ type: 'success', message: '팀에 참여했습니다.' });
      router.push(`/${group.id}`);
    } catch {
      setFeedback({ type: 'error', message: '유효하지 않은 팀 링크입니다.' });
    }
  };

  const handleTeamLinkChange = (value: string) => {
    setTeamLink(value);
    setFeedback(null);
  };

  return (
    <JoinTeamCard
      teamLink={teamLink}
      disabled={isSubmitDisabled}
      feedback={feedback}
      onTeamLinkChange={handleTeamLinkChange}
      onSubmit={handleSubmit}
    />
  );
}

export default function JoinTeamPage() {
  return (
    <Suspense>
      <JoinTeamPageContent />
    </Suspense>
  );
}
