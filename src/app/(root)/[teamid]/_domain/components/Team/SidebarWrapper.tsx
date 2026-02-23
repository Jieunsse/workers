'use client';

import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/sidebar';
import ProfileImage from '@/components/profile-img/ProfileImage';
import { useCurrentUserQuery } from '@/shared/queries/user/useCurrentUserQuery';
import TeamSidebarDropdown from './TeamSidebarDropdown';

export default function SidebarWrapper() {
  const { data: currentUser } = useCurrentUserQuery();
  const router = useRouter();

  return (
    <Sidebar
      teamSelect={(isCollapsed) => <TeamSidebarDropdown isCollapsed={isCollapsed} />}
      isLoggedIn={!!currentUser}
      profileImage={
        <ProfileImage src={currentUser?.image} size="sm" variant="profile" showBorder={false} />
      }
      profileName={currentUser?.nickname}
      profileTeam={currentUser?.email}
      onProfileClick={() => router.push('/mypage')}
    />
  );
}
