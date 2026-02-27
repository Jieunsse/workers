'use client';

import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUserQuery } from '@/shared/queries/user/useCurrentUserQuery';
import { Sidebar, MobileHeader } from '@/components/sidebar';
import TeamSidebarDropdown from './[teamid]/_domain/components/Team/TeamSidebarDropdown';
import humanBig from '@/assets/buttons/human/humanBig.svg';
import styles from './layout.module.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: user, isPending } = useCurrentUserQuery({ retry: false });

  // user가 존재하면 로그인, 없으면 비로그인
  // isPending 중엔도 캐시된 데이터가 있으면 user는 정의되므로
  // isPending으로 차단하지 않아 캐시 히트 시 깨박임 방지
  const isLoggedIn = !!user;
  const isLanding = pathname === '/';

  // 자체 사이드바가 없는 페이지에서만 root layout 사이드바 표시
  const rootSidebarPaths = ['/', '/boards', '/mypage', '/myhistory'];
  const showRootSidebar = rootSidebarPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/'),
  );

  const handleProfileClick = () => {
    if (isLoggedIn) {
      router.push('/mypage');
    } else {
      router.push('/login');
    }
  };

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  };

  return (
    <div className={styles.layout}>
      {showRootSidebar && (
        <Sidebar
          defaultCollapsed={isLanding}
          isLoggedIn={isLoggedIn}
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
          onLogoClick={() => router.push('/')}
          profileImage={
            user?.image ? (
              <Image
                src={user.image}
                alt=""
                width={40}
                height={40}
                style={{ borderRadius: 12, objectFit: 'cover' }}
              />
            ) : (
              <Image src={humanBig} alt="" width={40} height={40} />
            )
          }
          profileName={user?.nickname ?? '사용자'}
          profileTeam={user?.memberships?.[0]?.group?.name ?? ''}
          teamSelect={
            isLoggedIn
              ? (isCollapsed: boolean) => <TeamSidebarDropdown isCollapsed={isCollapsed} />
              : undefined
          }
        />
      )}
      {showRootSidebar && (
        <MobileHeader
          isLoggedIn={isLoggedIn}
          profileImage={
            user?.image ? (
              <Image
                src={user.image}
                alt=""
                width={32}
                height={32}
                style={{ borderRadius: 8, objectFit: 'cover' }}
              />
            ) : undefined
          }
          onProfileClick={handleProfileClick}
          onLogout={handleLogout}
          drawerContent={<TeamSidebarDropdown />}
        />
      )}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
