'use client';

import { type FormEvent } from 'react';
import { BaseButton } from '@/components/Button/base';
import { Input } from '@/components/input';
import type { CreateTeamFeedback } from '../interfaces/feedback';
import joinCardStyles from './JoinTeamCard.module.css';
import feedbackStyles from './FeedbackMessage.module.css';
import clsx from 'clsx';
import commonStyles from '../styles/common.module.css';

const JOIN_TEAM_FEEDBACK_ID = 'join-team-helper-text';

interface JoinTeamCardProps {
  teamLink: string;
  disabled: boolean;
  feedback: CreateTeamFeedback | null;
  onTeamLinkChange: (value: string) => void;
  onSubmit: () => void | Promise<void>;
}

export default function JoinTeamCard({
  teamLink,
  disabled,
  feedback,
  onTeamLinkChange,
  onSubmit,
}: JoinTeamCardProps) {
  const handleFormSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    void onSubmit();
  };

  return (
    <form
      className={clsx(commonStyles.flexColCenter, joinCardStyles.joinCard)}
      onSubmit={handleFormSubmit}
    >
      <h2 className={joinCardStyles.title}>팀 참여하기</h2>

      <div className={clsx(commonStyles.flexCol, joinCardStyles.joinInputSection)}>
        <label htmlFor="team-link" className={joinCardStyles.joinLabel}>
          팀 링크
        </label>
        <Input
          id="team-link"
          value={teamLink}
          onChange={(event) => onTeamLinkChange(event.target.value)}
          aria-describedby={JOIN_TEAM_FEEDBACK_ID}
          placeholder="팀 링크를 입력해주세요."
          className={joinCardStyles.teamLinkInput}
        />
      </div>

      <BaseButton className={joinCardStyles.joinSubmitButton} type="submit" disabled={disabled}>
        참여하기
      </BaseButton>

      {feedback ? (
        feedback.type === 'error' ? (
          <p
            id={JOIN_TEAM_FEEDBACK_ID}
            role="alert"
            aria-live="assertive"
            className={feedbackStyles.errorText}
          >
            {feedback.message}
          </p>
        ) : (
          <p
            id={JOIN_TEAM_FEEDBACK_ID}
            role="status"
            aria-live="polite"
            className={feedbackStyles.successText}
          >
            {feedback.message}
          </p>
        )
      ) : (
        <p id={JOIN_TEAM_FEEDBACK_ID} className={joinCardStyles.joinHelperText}>
          공유받은 팀 링크를 입력해 참여할 수 있어요.
        </p>
      )}
    </form>
  );
}
