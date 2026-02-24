'use client';

import dynamic from 'next/dynamic';

const TeamDashboard = dynamic(() => import('./TeamDashboard'), {
  ssr: false,
});

export default function TeamDashboardClient({ teamid }: { teamid: string }) {
  return <TeamDashboard key={teamid} />;
}
