'use client';

import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';

export default function AddTeamSidebarWrapper() {
  const router = useRouter();

  return <Sidebar onProfileClick={() => router.push('/mypage')} />;
}
