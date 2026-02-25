'use client';

import { useRouter } from 'next/navigation';
import { useCurrentUserQuery } from '@/shared/queries/user/useCurrentUserQuery';
import BaseButton from '@/components/Button/base/BaseButton';

type CtaButtonProps = {
  className?: string;
};

/**
 * 랜딩페이지 "지금 시작하기" 버튼
 *
 * 로그인 상태 분기:
 * - 비로그인 → /login
 * - 로그인 → /{teamId} (팀이 있는 경우) 또는 /addteam
 */
export default function CtaButton({ className }: CtaButtonProps) {
  const router = useRouter();
  const { data: user, isPending } = useCurrentUserQuery({ retry: false });

  const handleClick = () => {
    if (isPending) return;

    if (!user) {
      router.push('/login');
      return;
    }

    // user.teamId는 프로젝트 식별자 문자열('20-1' 등)이라 팀 페이지 경로에 사용 불가
    // 실제 그룹 페이지 경로는 숫자 group.id를 사용해야 함
    const groupId = user.memberships?.[0]?.group?.id;
    router.push(groupId !== undefined ? `/${groupId}` : '/addteam');
  };

  return (
    <div className={className}>
      <BaseButton onClick={handleClick}>지금 시작하기</BaseButton>
    </div>
  );
}
