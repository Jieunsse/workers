import Link from 'next/link';
import Image from 'next/image';
import logoLarge from '@/assets/logos/logoLarge.svg';
import logoSmall from '@/assets/logos/logoSmall.svg';
import styles from './AuthCard.module.css';

interface AuthCardProps {
  children: React.ReactNode;
}

export default function AuthCard({ children }: AuthCardProps) {
  return (
    <div className={styles.wrapper}>
      <div className={styles.card}>
        <Link href="/" className={styles.logoLink} aria-label="홈으로 이동">
          <Image src={logoLarge} alt="Coworkers 로고" className={styles.logoLarge} priority />
          <Image src={logoSmall} alt="Coworkers 로고" className={styles.logoSmall} priority />
        </Link>
        {children}
      </div>
    </div>
  );
}
