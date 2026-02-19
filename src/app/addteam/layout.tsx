import { MobileHeader, Sidebar } from '@/components/sidebar';
import styles from './page.module.css';

export default function AddTeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <Sidebar />
      <div className={styles.mobileOnlyHeader}>
        <MobileHeader />
      </div>
      <section className={styles.mainContents}>{children}</section>
    </main>
  );
}
