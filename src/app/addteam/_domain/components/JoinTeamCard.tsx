'use client';

import { BaseButton } from '@/components/Button/base';
import { Input } from '@/components/input';
import joinCardStyles from './JoinTeamCard.module.css';
import clsx from 'clsx';
import commonStyles from '../styles/common.module.css';

interface JoinTeamCardProps {
  teamLink: string;
  onTeamLinkChange: (value: string) => void;
}

export default function JoinTeamCard({ teamLink, onTeamLinkChange }: JoinTeamCardProps) {
  const helperTextId = 'join-team-helper-text';

  return (
    <div className={clsx(commonStyles.flexColCenter, joinCardStyles.joinCard)}>
      <h2 className={joinCardStyles.title}>팀 참여하기</h2>

      <div className={clsx(commonStyles.flexCol, joinCardStyles.joinInputSection)}>
        <label htmlFor="team-link" className={joinCardStyles.joinLabel}>
          팀 링크
        </label>
        <Input
          id="team-link"
          value={teamLink}
          onChange={(event) => onTeamLinkChange(event.target.value)}
          aria-describedby={helperTextId}
          placeholder="팀 링크를 입력해주세요."
          className={joinCardStyles.teamLinkInput}
        />
      </div>

      <BaseButton className={joinCardStyles.joinSubmitButton}>참여하기</BaseButton>

      <p id={helperTextId} className={joinCardStyles.joinHelperText}>
        공유받은 팀 링크를 입력해 참여할 수 있어요.
      </p>
    </div>
  );
}
