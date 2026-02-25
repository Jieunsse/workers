'use client';

import { type ReactNode, useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import clsx from 'clsx';
import MobileDrawer from './MobileDrawer';

import styles from './styles/MobileHeader.module.css';
import logoSmall from '@/assets/logos/logoSmall.svg';
import logoIcon from '@/assets/logos/logoIcon.svg';
import hamburger from '@/assets/buttons/hamburger/hamburger.svg';
import humanBig from '@/assets/buttons/human/humanBig.svg';

type MobileHeaderProps = {
  /** 로그인 여부 (false면 로고만 표시) */
  isLoggedIn?: boolean;
  /** 프로필 이미지 (ReactNode로 자유롭게 주입, 미전달 시 기본 아이콘) */
  profileImage?: ReactNode;
  /** @deprecated 내부 드로어로 대체됨. 호환성을 위해 유지 */
  onMenuClick?: () => void;
  /** 드로어 내부 콘텐츠 (전달 시 햄버거 메뉴 클릭으로 드로어 표시) */
  drawerContent?: ReactNode;
  /** 프로필 버튼 클릭 시 호출되는 콜백 */
  onProfileClick?: () => void;
  /** 로그아웃 클릭 시 호출되는 콜백 */
  onLogout?: () => void;
  /** 로고 클릭 시 호출되는 콜백 */
  onLogoClick?: () => void;
  /** 로고 너비 (기본값: 102) */
  logoWidth?: number;
  /** 로고 높이 (기본값: 20) */
  logoHeight?: number;
};

/**
 * 모바일 상단 헤더 컴포넌트.
 * 비로그인 시 로고만 표시하고, 로그인 시 햄버거 메뉴 + 프로필 버튼을 함께 표시합니다.
 * profileImage 슬롯에 커스텀 프로필 이미지를 주입할 수 있습니다.
 */
export default function MobileHeader({
  isLoggedIn,
  profileImage,
  drawerContent,
  onProfileClick,
  onLogout,
  onLogoClick,
  logoWidth = 102,
  logoHeight = 20,
}: MobileHeaderProps) {
  const router = useRouter();
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  const defaultLogout = useCallback(async () => {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.push('/login');
  }, [router]);

  const handleLogout = onLogout ?? defaultLogout;
  const handleProfileClick = onProfileClick ?? (() => router.push('/mypage'));
  const handleLogoClick = onLogoClick ?? (() => router.push('/'));

  useEffect(() => {
    if (!showProfileMenu) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(e.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showProfileMenu]);

  if (!isLoggedIn) {
    return (
      <header className={styles.header}>
        <div className={styles.logo} onClick={handleLogoClick} role="button" tabIndex={0}>
          <Image src={logoSmall} alt="COWORKERS" width={logoWidth} height={logoHeight} />
        </div>
      </header>
    );
  }

  return (
    <header className={clsx(styles.header, styles.loggedIn)}>
      <div className={styles.left}>
        <button
          type="button"
          className={styles.menuButton}
          onClick={() => setIsDrawerOpen(true)}
          aria-label="메뉴 열기"
        >
          <Image src={hamburger} alt="" width={24} height={24} />
        </button>
        <div className={styles.logo} onClick={handleLogoClick} role="button" tabIndex={0}>
          <Image src={logoIcon} alt="COWORKERS" width={24} height={24} />
        </div>
      </div>
      <div className={styles.profileWrapper} ref={profileMenuRef}>
        <button
          type="button"
          className={styles.profileButton}
          onClick={() => setShowProfileMenu((prev) => !prev)}
          aria-label="프로필"
        >
          {profileImage ?? <Image src={humanBig} alt="" width={32} height={32} />}
        </button>
        {showProfileMenu && (
          <div className={styles.profileMenu}>
            <button
              type="button"
              className={styles.profileMenuItem}
              onClick={() => {
                setShowProfileMenu(false);
                handleProfileClick();
              }}
            >
              마이페이지
            </button>
            <button
              type="button"
              className={`${styles.profileMenuItem} ${styles.profileMenuDanger}`}
              onClick={() => {
                setShowProfileMenu(false);
                handleLogout();
              }}
            >
              로그아웃
            </button>
          </div>
        )}
      </div>
      {drawerContent && (
        <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
          {drawerContent}
        </MobileDrawer>
      )}
    </header>
  );
}
