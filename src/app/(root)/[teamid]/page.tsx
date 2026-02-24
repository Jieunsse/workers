import type { Metadata } from 'next';
import TeamDashboardClient from './_domain/components/Team/TeamDashboardClient';

export const metadata: Metadata = {
  title: 'Coworkers — 팀 대시보드',
  description: '팀원과 함께 할 일을 관리하고 칸반보드로 업무 현황을 한눈에 확인하세요.',
  openGraph: {
    title: 'Coworkers — 팀 대시보드',
    description: '팀원과 함께 할 일을 관리하고 칸반보드로 업무 현황을 한눈에 확인하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function TeamPage({ params }: { params: { teamid: string } }) {
  return <TeamDashboardClient teamid={params.teamid} />;
}
