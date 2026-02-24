'use client';

import { useState } from 'react';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import {
  Sidebar,
  SidebarButton,
  SidebarTeamSelect,
  SidebarAddButton,
  MobileHeader,
  MobileDrawer,
} from '@/components/sidebar';
import boardSmall from '@/assets/icons/board/boardSmall.svg';
import boardLarge from '@/assets/icons/board/boardLarge.svg';
import chessSmall from '@/assets/icons/chess/chessSmall.svg';
import chessBig from '@/assets/icons/chess/chessBig.svg';
import humanBig from '@/assets/buttons/human/humanBig.svg';
import styles from './layout.module.css';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const { data: user, isPending } = useCurrentUser();

  // isPending: 최초 로딩 중 (undefined)
  // user === null: 로딩 완료 후 비로그인
  // user !== null: 로그인
  const isLoggedIn = !isPending && user !== null && user !== undefined;
  const isLanding = pathname === '/';
  const firstGroup = user?.memberships?.[0]?.group;

  // [teamid] 페이지는 자체 모바일 헤더(TeamNavClient)를 사용하므로 root layout의 MobileHeader를 숨김
  const knownPaths = ['/', '/addteam', '/boards', '/mypage', '/history', '/list'];
  const isTeamIdPage = !knownPaths.some((p) => pathname === p || pathname.startsWith(p + '/'));

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
      <Sidebar
        defaultCollapsed={isLanding}
        isLoggedIn={isLoggedIn}
        onProfileClick={handleProfileClick}
        onLogout={handleLogout}
        onLogoClick={() => router.push('/addteam')}
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
        profileTeam={firstGroup?.name ?? ''}
        teamSelect={(isCollapsed: boolean) =>
          firstGroup ? (
            !isCollapsed ? (
              <SidebarTeamSelect
                icon={
                  firstGroup.image ? (
                    <Image
                      src={firstGroup.image}
                      alt=""
                      width={20}
                      height={20}
                      style={{ borderRadius: 4, objectFit: 'cover' }}
                    />
                  ) : (
                    <Image src={chessSmall} alt="" width={20} height={20} />
                  )
                }
                label={firstGroup.name}
                isSelected
                onClick={() => router.push(`/${firstGroup.id}`)}
              />
            ) : (
              <SidebarButton
                icon={
                  firstGroup.image ? (
                    <Image
                      src={firstGroup.image}
                      alt=""
                      width={24}
                      height={24}
                      style={{ borderRadius: 4, objectFit: 'cover' }}
                    />
                  ) : (
                    <Image src={chessBig} alt="" width={24} height={24} />
                  )
                }
                label={firstGroup.name}
                isActive
                iconOnly
                onClick={() => router.push(`/${firstGroup.id}`)}
              />
            )
          ) : null
        }
        addButton={
          isLoggedIn
            ? (isCollapsed: boolean) => (
                <>
                  {!isCollapsed && (
                    <SidebarAddButton label="팀 추가하기" onClick={() => router.push('/addteam')} />
                  )}
                  <hr style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }} />
                  <SidebarButton
                    icon={
                      <Image
                        src={isCollapsed ? boardLarge : boardSmall}
                        alt=""
                        width={isCollapsed ? 24 : 20}
                        height={isCollapsed ? 24 : 20}
                      />
                    }
                    label="자유게시판"
                    isActive
                    iconOnly={isCollapsed}
                    href="/boards"
                  />
                </>
              )
            : undefined
        }
      />
      {!isTeamIdPage && (
        <>
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
            onMenuClick={() => setIsDrawerOpen(true)}
            onProfileClick={handleProfileClick}
          />
          <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
            <SidebarButton
              icon={<Image src={boardSmall} alt="" width={20} height={20} />}
              label="자유게시판"
              isActive
              href="/boards"
              onClick={() => setIsDrawerOpen(false)}
            />
          </MobileDrawer>
        </>
      )}
      <main className={styles.main}>{children}</main>
    </div>
  );
}
