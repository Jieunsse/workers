'use client';

import dynamic from 'next/dynamic';
import { useParams } from 'next/navigation';

const TeamDashboard = dynamic(() => import('./_domain/components/Team/TeamDashboard'), {
  ssr: false,
});

export default function TeamPage() {
  const params = useParams<{ teamid: string }>();

  return <TeamDashboard key={params?.teamid} />;
}
