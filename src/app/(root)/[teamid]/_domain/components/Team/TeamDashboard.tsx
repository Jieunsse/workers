'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useQuery, useQueries } from '@tanstack/react-query';
import KanbanBoard from '../Kanban/KanbanBoard';
import TodayReport from '../TodayReport/TodayReport';
import MemberSection from '../Member/MemberSection';
import WarningModal from '@/components/Modal/domain/components/WarningModal/WarningModal';
import styles from './TeamDashboard.module.css';
import { groupQueryOptions } from '../../queries/useGroupQuery';
import { taskListQueryOptions } from '../../queries/useTaskListQuery';
import { useCurrentUserQuery } from '@/shared/queries/user/useCurrentUserQuery';
import { useDeleteGroupMutation } from '../../queries/useDeleteGroupMutation';
import type { GroupMember } from '../../apis/types';

function getTodayDateString(): string {
  return new Date().toISOString().split('T')[0];
}

function isGroupAdmin(members: GroupMember[] | undefined, userId: number): boolean {
  return members?.some((m) => m.userId === userId && m.role === 'ADMIN') ?? false;
}

function isTaskListDone(tasks: { doneAt: string | null }[]): boolean {
  return tasks.length > 0 && tasks.every((t) => t.doneAt !== null);
}

export default function TeamDashboard() {
  const params = useParams<{ teamid: string }>();
  const router = useRouter();
  const teamid = params?.teamid ?? '';
  const groupId = Number(teamid);

  const {
    data: group,
    isPending,
    isError,
  } = useQuery({
    ...groupQueryOptions(groupId),
    enabled: groupId > 0,
  });
  const today = getTodayDateString();

  const taskListQueries = useQueries({
    queries: (group?.taskLists ?? []).map((tl) => taskListQueryOptions(groupId, tl.id, today)),
  });

  const { data: currentUser } = useCurrentUserQuery();
  const { mutate: deleteGroup } = useDeleteGroupMutation(groupId);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isNavigating, setIsNavigating] = useState(false);

  if (isNaN(groupId) || groupId <= 0) {
    return (
      <div className={styles.container}>
        <p>유효하지 않은 팀 ID입니다.</p>
      </div>
    );
  }

  if (isPending) {
    return <div className={styles.container}>로딩 중...</div>;
  }

  if (isError || !group) {
    if (isNavigating) return <div className={styles.container} />;
    return (
      <div className={styles.container}>
        <p>그룹을 찾을 수 없습니다.</p>
      </div>
    );
  }

  const totalTasks = taskListQueries.length;
  const doneTasks = taskListQueries.filter((q) => isTaskListDone(q.data?.tasks ?? [])).length;
  const isAdmin = currentUser ? isGroupAdmin(group.members, currentUser.id) : false;

  const handleConfirmDelete = () => {
    // onSettled가 currentUser 쿼리를 invalidate하기 전에 미리 계산
    const remaining = (currentUser?.memberships ?? [])
      .filter((m) => m.group.id !== groupId)
      .map((m) => m.group);

    setIsDeleteModalOpen(false);
    setIsNavigating(true);

    deleteGroup(undefined, {
      onSuccess: () => {
        router.push(remaining.length > 0 ? `/${remaining[0].id}` : '/addteam');
      },
      onError: () => {
        setIsNavigating(false);
      },
    });
  };

  return (
    <div className={styles.container}>
      <TodayReport
        teamName={group.name}
        totalTasks={totalTasks}
        doneTasks={doneTasks}
        onDeleteGroup={isAdmin ? () => setIsDeleteModalOpen(true) : undefined}
      />

      <WarningModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        text={{
          title: '팀을 삭제하시겠어요?',
          description: '팀을 삭제하면 모든 데이터가\n영구적으로 삭제됩니다.',
          closeLabel: '취소',
          confirmLabel: '삭제하기',
        }}
      />

      <div className={styles.divider} />

      <div className={styles.content}>
        <div className={styles.kanbanArea}>
          <KanbanBoard groupId={groupId} teamId={teamid} taskLists={group.taskLists ?? []} />
        </div>

        <aside className={styles.rightPanel}>
          <Link href={`/list?groupId=${teamid}`} className={styles.listLink}>
            리스트 보기
          </Link>
          <MemberSection
            members={group.members ?? []}
            isAdmin={isAdmin}
            groupId={groupId}
            teamId={teamid}
          />
        </aside>
      </div>
    </div>
  );
}
