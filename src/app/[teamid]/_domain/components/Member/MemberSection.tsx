'use client';

import { useState, useCallback } from 'react';
import MemberInvite from '@/components/Modal/domain/components/MemberInvite/MemberInvite';
import Toast from '@/components/toast/Toast';
import MemberCard from './MemberCard';
import styles from './MemberSection.module.css';
import type { GroupMember } from '../../apis/types';
import { useGroupInvitationQuery } from '../../queries/useGroupInvitationQuery';

const BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

function buildInviteLink(inviteToken: string): string {
  // 프론트엔드 도메인에서 초대 수락 경로로 이동하는 링크 생성
  if (typeof window !== 'undefined') {
    return `${window.location.origin}/addteam/join?token=${inviteToken}`;
  }
  return `${BASE_URL}/addteam/join?token=${inviteToken}`;
}

interface MemberSectionProps {
  members: GroupMember[];
  isAdmin: boolean;
  groupId: number;
  teamId: string;
}

export default function MemberSection({ members, isAdmin, groupId }: MemberSectionProps) {
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [isToastOpen, setIsToastOpen] = useState(false);

  const { data: invitationData } = useGroupInvitationQuery(groupId, isInviteOpen);

  const inviteLink = invitationData ? buildInviteLink(invitationData) : '';

  const handleCopyLink = useCallback((link: string) => {
    navigator.clipboard.writeText(link).catch(() => {});
    setIsToastOpen(true);
  }, []);

  return (
    <section className={styles.section} aria-label="팀 멤버">
      <div className={styles.header}>
        <h2 className={styles.title}>
          멤버 <span className={styles.count}>({members.length}명)</span>
        </h2>
        <button
          type="button"
          className={styles.inviteButton}
          onClick={() => setIsInviteOpen(true)}
          aria-label="멤버 초대하기"
        >
          + 초대하기
        </button>
      </div>

      <div className={styles.list}>
        {members.map((member) => (
          <MemberCard key={member.userId} member={member} isAdmin={isAdmin} groupId={groupId} />
        ))}
      </div>

      <MemberInvite
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        invite={{
          link: inviteLink,
          onCopyLink: handleCopyLink,
        }}
      />

      <Toast
        message="링크가 복사되었습니다."
        isOpen={isToastOpen}
        onDismiss={() => setIsToastOpen(false)}
        actionLabel={null}
        className={styles.toastCenter}
      />
    </section>
  );
}
