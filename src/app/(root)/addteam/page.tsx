import type { Metadata } from 'next';
import NoTeamState from './_domain/components/NoTeamState';

export const metadata: Metadata = {
  title: 'Coworkers — 팀 추가',
  description: '새로운 팀을 만들거나 기존 팀에 참가하세요. Coworkers로 팀 협업을 시작하세요.',
  openGraph: {
    title: 'Coworkers — 팀 추가',
    description: '새로운 팀을 만들거나 기존 팀에 참가하세요.',
    type: 'website',
    locale: 'ko_KR',
  },
  robots: {
    index: false,
    follow: false,
  },
};

export default function AddTeamPage() {
  return <NoTeamState />;
}
