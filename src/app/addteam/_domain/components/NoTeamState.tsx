'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { BaseButton } from '@/components/Button/base';
import noTeamImage from '../../svg/noTeamImg.svg';
import noTeamStateStyles from './NoTeamState.module.css';
import clsx from 'clsx';
import commonStyles from '../styles/common.module.css';

export default function NoTeamState() {
  const router = useRouter();

  return (
    <section className={clsx(commonStyles.flexColCenter, noTeamStateStyles.noTeamState)}>
      <Image
        className={noTeamStateStyles.noTeamIllustration}
        src={noTeamImage}
        alt="소속된 팀이 없는 상태 일러스트"
        priority
      />
      <p className={noTeamStateStyles.noTeamMessage}>
        아직 소속된 팀이 없습니다.
        <br />
        팀을 생성하거나 팀에 참여해보세요.
      </p>
      <div className={clsx(commonStyles.flexCol, noTeamStateStyles.noTeamActions)}>
        <BaseButton
          className={noTeamStateStyles.noTeamActionButton}
          onClick={() => router.push('/addteam/create')}
        >
          팀 생성하기
        </BaseButton>
        <BaseButton
          variant="outline"
          className={noTeamStateStyles.noTeamActionButton}
          onClick={() => router.push('/addteam/join')}
        >
          팀 참가하기
        </BaseButton>
      </div>
    </section>
  );
}
