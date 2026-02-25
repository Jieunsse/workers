import CtaButton from '../CtaButton';
import styles from './CtaSection.module.css';

export default function CtaSection() {
  return (
    <section className={styles.section}>
      <div className={styles.inner}>
        <h2 className={styles.title}>지금 바로 시작해보세요</h2>
        <p className={styles.desc}>팀원 모두와 같은 방향, 같은 속도로 나아가는 가장 쉬운 방법</p>
        <CtaButton className={styles.ctaLink} />
      </div>
    </section>
  );
}
