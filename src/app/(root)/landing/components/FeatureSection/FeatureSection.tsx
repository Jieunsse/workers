import Image, { StaticImageData } from 'next/image';

import gradationFolder from '@/assets/icons/landing/gradation_folder.svg';
import gradationCheck from '@/assets/icons/landing/gradation_check.svg';
import gradationMessage from '@/assets/icons/landing/gradation_message.svg';

import landingPC02 from '@/assets/img/landing/pc/landingPC_02.svg';
import landingPC03 from '@/assets/img/landing/pc/landingPC_03.svg';
import landingPC04 from '@/assets/img/landing/pc/landingPC_04.svg';
import landingTablet02 from '@/assets/img/landing/tablet/landingTablet_02.svg';
import landingTablet03 from '@/assets/img/landing/tablet/landingTablet_03.svg';
import landingTablet04 from '@/assets/img/landing/tablet/landingTablet_04.svg';
import landingMobile02 from '@/assets/img/landing/mobile/mobileSmall_02.svg';
import landingMobile03 from '@/assets/img/landing/mobile/mobileSmall_03.svg';
import landingMobile04 from '@/assets/img/landing/mobile/mobileSmall_04.svg';

import styles from './FeatureSection.module.css';

type Variant = 'two' | 'three' | 'four';

type FeatureData = {
  bg: 'slate' | 'brand';
  icon: StaticImageData;
  title: string;
  desc: string;
  imgPc: StaticImageData;
  imgTablet: StaticImageData;
  imgMobile: StaticImageData;
  copyClass: string;
  mediaClass: string;
  /** PC 이미지에 추가로 붙는 클래스 (없으면 undefined) */
  imgPcClass?: string;
};

const FEATURE_DATA: Record<Variant, FeatureData> = {
  two: {
    bg: 'slate',
    icon: gradationFolder,
    title: '칸반보드로 함께\n할 일 목록을 관리해요',
    desc: '팀원과 함께 실시간으로 할 일을 추가하고\n지금 무엇을 해야 하는지 한눈에 볼 수 있어요',
    imgPc: landingPC02,
    imgTablet: landingTablet02,
    imgMobile: landingMobile02,
    copyClass: styles.copyLeft,
    mediaClass: styles.mediaTwo,
  },
  three: {
    bg: 'brand',
    icon: gradationCheck,
    title: '세부적으로 할 일들을\n간편하게 체크해요',
    desc: '일정에 맞춰 해야 할 세부 항목을 정리하고,\n하나씩 빠르게 완료해보세요',
    imgPc: landingPC03,
    imgTablet: landingTablet03,
    imgMobile: landingMobile03,
    copyClass: styles.copyRight,
    mediaClass: styles.mediaThree,
    /*
     * 3번 이미지(966×649)는 가로 비율이 커서
     * imgPc 공통값 height:100%를 그대로 쓰면 가로가 섹션 너비를 초과함
     * → imgPcWide 클래스로 width:100%, height:auto 적용
     */
  },
  four: {
    bg: 'slate',
    icon: gradationMessage,
    title: '할 일 공유를 넘어\n의견을 나누고 함께 결정해요',
    desc: '댓글로 진행상황을 기록하고 피드백을 주고받으며\n함께 결정을 내릴 수 있어요.',
    imgPc: landingPC04,
    imgTablet: landingTablet04,
    imgMobile: landingMobile04,
    copyClass: styles.copyLeftWide,
    mediaClass: styles.mediaFour,
  },
};

export default function FeatureSection({ variant }: { variant: Variant }) {
  const { bg, icon, title, desc, imgPc, imgTablet, imgMobile, copyClass, mediaClass, imgPcClass } =
    FEATURE_DATA[variant];

  return (
    <section
      className={[styles.section, bg === 'brand' ? styles.bgBrand : styles.bgSlate].join(' ')}
    >
      <div className={[styles.copy, copyClass].join(' ')}>
        <Image src={icon} alt="" aria-hidden="true" className={styles.icon} />
        <div className={styles.textGroup}>
          <h2 className={styles.title}>{title}</h2>
          <p className={styles.desc}>{desc}</p>
        </div>
      </div>

      <div className={[styles.media, mediaClass].join(' ')}>
        <Image
          src={imgPc}
          alt=""
          className={[styles.imgPc, imgPcClass].filter(Boolean).join(' ')}
        />
        <Image src={imgTablet} alt="" className={styles.imgTablet} />
        <Image src={imgMobile} alt="" className={styles.imgMobile} />
      </div>
    </section>
  );
}
