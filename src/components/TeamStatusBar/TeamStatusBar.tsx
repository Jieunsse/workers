import styles from './style/TeamStatusBar.module.css';
import type { TeamStatusBarProps } from './interface/interface';
import Image from 'next/image';
import settingBigIcon from '@/assets/icons/setting/SettingBig.svg';
import ProgressBar from '../progressbar';

export default function TeamStatusBar({
  title,
  percentage,
  taskCount,
  completed,
}: TeamStatusBarProps) {
  return (
    <section className={styles.mainContainer} aria-label={title}>
      <h2 className={styles.title}>{title}</h2>
      <header className={styles.subContainer}>
        <dl>
          <dt className={styles.subTitle}>오늘의 진행 상황</dt>
          <dd className={styles.percent}>{percentage}%</dd>
        </dl>
        <dl className={styles.countContainer}>
          <div>
            <dt className={styles.subTitle}>오늘의 할 일</dt>
            <dd className={styles.taskNumber}>{taskCount}</dd>
          </div>
          <span className={styles.line} role="separator" aria-hidden />
          <div>
            <dt className={styles.subTitle}>완료 🙌</dt>
            <dd className={styles.completedNumber}>{completed}</dd>
          </div>
        </dl>
      </header>

      <div className={styles.barContainer}>
        <ProgressBar
          value={percentage / 100}
          done={completed}
          total={taskCount}
          ariaLabel="team progress"
          className={styles.progressBar}
        />
        <button className={styles.settingButton} aria-label="settings">
          <Image src={settingBigIcon} alt="" width={24} height={24} />
        </button>
      </div>
    </section>
  );
}
