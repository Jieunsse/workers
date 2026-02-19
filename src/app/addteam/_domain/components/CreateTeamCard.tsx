'use client';

import { type FormEvent } from 'react';
import { BaseButton } from '@/components/Button/base';
import { Input } from '@/components/input';
import { ProfileImage } from '@/components/profile-img';
import type { CreateTeamFeedback } from '../interfaces/feedback';
import FeedbackMessage from './FeedbackMessage';
import cardStyles from './CreateTeamCard.module.css';
import clsx from 'clsx';
import commonStyles from '../styles/common.module.css';

const CREATE_TEAM_FEEDBACK_ID = 'create-team-feedback';

interface CreateTeamCardProps {
  value: string;
  disabled: boolean;
  feedback: CreateTeamFeedback | null;
  onChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
}

export default function CreateTeamCard({
  value,
  disabled,
  feedback,
  onChange,
  onSubmit,
}: CreateTeamCardProps) {
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <form className={clsx(commonStyles.flexCol, cardStyles.card)} onSubmit={handleFormSubmit}>
      <h2 className={cardStyles.title}>팀 생성하기</h2>

      <div className={clsx(commonStyles.flexColCenter, cardStyles.profileSection)}>
        <ProfileImage variant="team" size="xl" editable />
      </div>

      <div className={clsx(commonStyles.flexCol, cardStyles.inputSection)}>
        <label htmlFor="team-name" className={cardStyles.label}>
          팀 이름
        </label>
        <Input
          id="team-name"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          aria-describedby={CREATE_TEAM_FEEDBACK_ID}
          placeholder="팀 이름을 입력해주세요"
          className={cardStyles.teamNameInput}
        />
      </div>

      <BaseButton className={cardStyles.submitButton} type="submit" disabled={disabled}>
        생성하기
      </BaseButton>

      <FeedbackMessage id={CREATE_TEAM_FEEDBACK_ID} createTeamFeedback={feedback} />
    </form>
  );
}
