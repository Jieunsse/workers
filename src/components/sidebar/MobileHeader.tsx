import type { ReactNode } from 'react';
import Image from 'next/image';
import clsx from 'clsx';

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
  /** 햄버거 메뉴 버튼 클릭 시 호출되는 콜백 */
  onMenuClick?: () => void;
  /** 프로필 버튼 클릭 시 호출되는 콜백 */
  onProfileClick?: () => void;
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
  onMenuClick,
  onProfileClick,
  logoWidth = 102,
  logoHeight = 20,
}: MobileHeaderProps) {
  if (!isLoggedIn) {
    return (
      <header className={styles.header}>
        <div className={styles.logo}>
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
          onClick={onMenuClick}
          aria-label="메뉴 열기"
        >
          <Image src={hamburger} alt="" width={24} height={24} />
        </button>
        <div className={styles.logo}>
          <Image src={logoIcon} alt="COWORKERS" width={24} height={24} />
        </div>
      </div>
      <button
        type="button"
        className={styles.profileButton}
        onClick={onProfileClick}
        aria-label="프로필"
      >
        {profileImage ?? <Image src={humanBig} alt="" width={32} height={32} />}
      </button>
    </header>
  );
}
