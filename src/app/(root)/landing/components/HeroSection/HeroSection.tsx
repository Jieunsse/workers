import Image from 'next/image';

import CtaButton from '../CtaButton';
import gradationLogo from '@/assets/icons/landing/gradation_logo.svg';
import landingPC01 from '@/assets/img/landing/pc/landingPC_01.svg';
import landingTablet01 from '@/assets/img/landing/tablet/landingTablet_01.svg';
import landingMobile01 from '@/assets/img/landing/mobile/mobileSmall_01.svg';

import styles from './HeroSection.module.css';

export default function HeroSection() {
  return (
    <section className={styles.section}>
      {/* 텍스트 + 버튼 영역 */}
      <div className={styles.copy}>
        <div className={styles.topGroup}>
          <Image
            src={gradationLogo}
            alt=""
            aria-hidden="true"
            className={styles.icon}
            width={48}
            height={48}
          />
          <div className={styles.textGroup}>
            <p className={styles.kicker}>함께 만들어가는 To do list</p>
            <h1 className={styles.title}>Coworkers</h1>
          </div>
        </div>

        <CtaButton className={styles.ctaLink} />
      </div>

      {/*
       * visual: 이미지만 담당
       * 모바일/태블릿: normal flow, 섹션 하단에 자연스럽게 배치
       * PC: absolute, 섹션 우측에 고정
       */}
      <div className={styles.visual} aria-hidden="true">
        <Image src={landingPC01} alt="" priority className={styles.imgPc} />
        <Image src={landingTablet01} alt="" priority className={styles.imgTablet} />
        <Image src={landingMobile01} alt="" priority className={styles.imgMobile} />
      </div>
    </section>
  );
}
