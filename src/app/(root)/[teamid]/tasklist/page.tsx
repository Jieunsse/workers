'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const TaskList = dynamic(
  () => import('@/app/(root)/[teamid]/_domain/components/TaskList/TaskList'),
  {
    ssr: false,
  },
);

export default function TaskListPage() {
  const params = useParams<{ teamid: string }>();

  return <TaskList key={params?.teamid} />;
}
