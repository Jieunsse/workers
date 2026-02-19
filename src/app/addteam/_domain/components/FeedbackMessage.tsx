import type { CreateTeamFeedback } from '../interfaces/feedback';
import feedbackMessageStyles from './FeedbackMessage.module.css';

interface FeedbackMessageProps {
  id: string;
  createTeamFeedback: CreateTeamFeedback | null;
}

export default function FeedbackMessage({ id, createTeamFeedback }: FeedbackMessageProps) {
  if (!createTeamFeedback) {
    return (
      <p id={id} className={feedbackMessageStyles.helperText}>
        팀 이름은 회사명이나 모임 이름 등으로 설정하면 좋아요.
      </p>
    );
  }

  if (createTeamFeedback.type === 'error') {
    return (
      <p id={id} role="alert" aria-live="assertive" className={feedbackMessageStyles.errorText}>
        {createTeamFeedback.message}
      </p>
    );
  }

  return (
    <p id={id} role="status" aria-live="polite" className={feedbackMessageStyles.successText}>
      {createTeamFeedback.message}
    </p>
  );
}
