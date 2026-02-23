import SidebarWrapper from './_domain/components/Team/SidebarWrapper';
import TeamNavClient from './_domain/components/Team/TeamNavClient';
import styles from './page.module.css';

export default function TeamLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className={styles.page}>
      <div className={styles.desktopSidebar}>
        <SidebarWrapper />
      </div>
      <TeamNavClient />
      <section className={styles.mainContents}>{children}</section>
    </main>
  );
}
