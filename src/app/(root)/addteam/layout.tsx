import { MobileHeader } from '@/components/sidebar';
import AddTeamSidebarWrapper from './_domain/components/AddTeamSidebarWrapper';
import styles from './page.module.css';

export default function AddTeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <AddTeamSidebarWrapper />
      <div className={styles.mobileOnlyHeader}>
        <MobileHeader />
      </div>
      <section className={styles.mainContents}>{children}</section>
    </main>
  );
}
