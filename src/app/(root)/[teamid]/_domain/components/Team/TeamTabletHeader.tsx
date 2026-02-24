'use client';

import Image from 'next/image';

import ProfileImage from '@/components/profile-img/ProfileImage';
import { useCurrentUserQuery } from '@/shared/queries/user/useCurrentUserQuery';
import logoLarge from '@/assets/logos/logoLarge.svg';
import hamburgerIcon from '@/assets/buttons/hamburger/hamburger.svg';
import styles from './TeamTabletHeader.module.css';

type Props = {
  onMenuClick?: () => void;
  onProfileClick?: () => void;
};

export default function TeamTabletHeader({ onMenuClick, onProfileClick }: Props) {
  const { data: currentUser } = useCurrentUserQuery();

  return (
    <header className={styles.tabletHeader}>
      <button
        type="button"
        className={styles.hamburgerButton}
        onClick={onMenuClick}
        aria-label="메뉴 열기"
      >
        <Image src={hamburgerIcon} alt="" width={24} height={24} />
      </button>
      <div className={styles.logo}>
        <Image src={logoLarge} alt="COWORKERS" width={120} height={24} />
      </div>
      <button
        type="button"
        className={styles.profileArea}
        onClick={onProfileClick}
        aria-label="프로필"
      >
        <ProfileImage src={currentUser?.image} size="sm" variant="profile" showBorder={false} />
      </button>
    </header>
  );
}
