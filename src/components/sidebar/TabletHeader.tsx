'use client';

import Image from 'next/image';
import styles from './styles/TabletHeader.module.css';
import logoLarge from '@/assets/logos/logoLarge.svg';
import hamburgerIcon from '@/assets/buttons/hamburger/hamburger.svg'; // Assuming a hamburger icon exists
import ProfileImage from '@/components/profile-img/ProfileImage'; // Import ProfileImage
import { useCurrentUserQuery } from '@/shared/queries/user/useCurrentUserQuery'; // Import the query

export default function TabletHeader() {
  // No props needed for profileImage
  const { data: currentUser } = useCurrentUserQuery(); // Fetch user data internally

  const handleHamburgerClick = () => {
    console.log('Hamburger menu clicked');
    // Implement logic to open a drawer/menu
  };

  return (
    <header className={styles.tabletHeader}>
      <button className={styles.hamburgerButton} onClick={handleHamburgerClick}>
        <Image src={hamburgerIcon} alt="메뉴" width={24} height={24} />
      </button>
      <div className={styles.logo}>
        <Image src={logoLarge} alt="COWORKERS" width={120} height={24} />
      </div>
      <div className={styles.profileArea}>
        <ProfileImage src={currentUser?.image} size="sm" variant="profile" showBorder={false} />
      </div>
    </header>
  );
}
