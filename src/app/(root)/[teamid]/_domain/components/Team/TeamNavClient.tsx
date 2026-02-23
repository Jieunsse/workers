'use client';

import { useState } from 'react';

import { MobileHeader, MobileDrawer } from '@/components/sidebar';
import ProfileImage from '@/components/profile-img/ProfileImage';
import { useCurrentUserQuery } from '@/shared/queries/user/useCurrentUserQuery';
import TeamTabletHeader from './TeamTabletHeader';
import TeamSidebarDropdown from './TeamSidebarDropdown';
import styles from './TeamNavClient.module.css';

export default function TeamNavClient() {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: currentUser } = useCurrentUserQuery();

  const openDrawer = () => setIsDrawerOpen(true);
  const closeDrawer = () => setIsDrawerOpen(false);

  return (
    <>
      {/* 태블릿 헤더 */}
      <div className={styles.tabletWrapper}>
        <TeamTabletHeader onMenuClick={openDrawer} />
      </div>

      {/* 모바일 헤더 */}
      <div className={styles.mobileWrapper}>
        <MobileHeader
          isLoggedIn={!!currentUser}
          profileImage={
            <ProfileImage src={currentUser?.image} size="sm" variant="profile" showBorder={false} />
          }
          onMenuClick={openDrawer}
        />
      </div>

      {/* 태블릿/모바일 공통 사이드바 드로어 */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={closeDrawer}>
        <TeamSidebarDropdown />
      </MobileDrawer>
    </>
  );
}
