'use client';

import { useState } from 'react';
import Image from 'next/image';
import styles from './TaskDetailCard.module.css';
import KebabMenu from '@/components/KebabMenu/KebabMenu';
import ProfileImage from '@/components/profile-img/ProfileImage';
import FilledRoundButton from '@/components/Button/domain/FilledRoundButton/FilledRoundButton';
import CommentCard from '@/components/comment/CommentCard';
import CommentInput from '@/components/input/CommentInput';

import calendarIcon from '@/assets/icons/calender/calenderBig.svg';
import repeatIcon from '@/assets/icons/repeat/repeatBig.svg';
import closeIcon from '@/assets/icons/xMark/xMarkBig.svg';

/* API 응답 구조 - 작성자 정보 */
interface Writer {
  id: number;
  nickname: string;
  image: string | null;
}

/* API 응답 구조 - 댓글 정보 */
interface Comment {
  id: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  taskId: number;
  userId: number;
  user: {
    id: number;
    nickname: string;
    image: string | null;
  };
}

interface TaskDetailCardProps {
  id: number;
  name: string;
  description: string;
  date: string;
  frequency: 'ONCE' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  writer: Writer;
  doneAt: string | null;
  comments: Comment[];
  onComplete?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onClose?: () => void;
  onCommentSubmit?: (content: string) => void;
}

const FREQUENCY_LABEL: Record<TaskDetailCardProps['frequency'], string> = {
  ONCE: '한번',
  DAILY: '매일',
  WEEKLY: '주 반복',
  MONTHLY: '월 반복',
};

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const period = hours >= 12 ? '오후' : '오전';
  const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;

  return `${year}년 ${month}월 ${day}일 ${period} ${displayHours}:${minutes.toString().padStart(2, '0')}`;
}

function formatCommentDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');

  return `${year}. ${month}. ${day}`;
}

/**
 * TaskDetailCard
 *
 * 할 일 상세 정보를 표시하는 카드 컴포넌트입니다.
 *
 * @remarks
 * - API 응답 구조(Task, Comment)와 일치하는 Props를 받습니다.
 * - frequency 값을 컴포넌트 내부에서 한글로 변환합니다 (ONCE → "한번").
 * - ISO 8601 날짜를 한국어 형식으로 자동 변환합니다.
 * - 완료 상태(doneAt)에 따라 버튼 텍스트가 자동으로 변경됩니다.
 * - KebabMenu를 통해 수정/삭제 액션을 제공합니다.
 *
 * @example
 * ```tsx
 * <TaskDetailCard
 *   {...task}
 *   comments={comments}
 *   onComplete={() => completeMutation.mutate(task.id)}
 *   onEdit={() => router.push(`/edit`)}
 *   onDelete={() => deleteMutation.mutate(task.id)}
 * />
 * ```
 */
export default function TaskDetailCard({
  name,
  writer,
  date,
  frequency,
  description,
  comments,
  doneAt,
  onComplete,
  onEdit,
  onDelete,
  onClose,
  onCommentSubmit,
}: TaskDetailCardProps) {
  const [commentValue, setCommentValue] = useState('');

  const isCompleted = !!doneAt;
  const frequencyLabel = FREQUENCY_LABEL[frequency];
  const formattedDate = formatDate(date);

  const handleCommentSubmit = () => {
    if (!commentValue.trim()) return;
    onCommentSubmit?.(commentValue);
    setCommentValue('');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button type="button" className={styles.closeButton} onClick={onClose} aria-label="닫기">
          <Image src={closeIcon} alt="" width={24} height={24} />
        </button>

        <h2 className={styles.title}>{name}</h2>

        <div className={styles.kebabWrapper}>
          <KebabMenu onEdit={() => onEdit?.()} onDelete={() => onDelete?.()} />
        </div>
      </div>

      <div className={styles.assigneeSection}>
        <ProfileImage
          src={writer.image}
          variant="profile"
          size="md"
          radius="r12"
          alt={writer.nickname}
        />
        <span className={styles.assigneeName}>{writer.nickname}</span>
      </div>

      <div className={styles.metaSection}>
        <div className={styles.metaRow}>
          <Image src={calendarIcon} alt="" width={16} height={16} />
          <span className={styles.metaLabel}>시작 날짜</span>
          <span className={styles.metaValue}>{formattedDate}</span>
        </div>

        <div className={styles.metaRow}>
          <Image src={repeatIcon} alt="" width={16} height={16} />
          <span className={styles.metaLabel}>반복 설정</span>
          <span className={styles.metaValue}>{frequencyLabel}</span>
        </div>
      </div>

      <div className={styles.descriptionSection}>
        <p className={styles.description}>{description}</p>
      </div>

      <div className={styles.actionSection}>
        <FilledRoundButton appearance={isCompleted ? 'inverse' : 'filled'} onClick={onComplete}>
          {isCompleted ? '완료 취소하기' : '완료하기'}
        </FilledRoundButton>
      </div>

      <div className={styles.commentSection}>
        <h3 className={styles.commentTitle}>
          댓글 <span className={styles.commentCount}>{comments.length}</span>
        </h3>

        <div className={styles.commentInputWrapper}>
          <CommentInput
            value={commentValue}
            onChange={(e) => setCommentValue(e.target.value)}
            onSubmit={handleCommentSubmit}
            placeholder="댓글을 입력해주세요"
          />
        </div>

        <div className={styles.commentList}>
          {comments.map((comment) => (
            <CommentCard
              key={comment.id}
              name={comment.user.nickname}
              content={comment.content}
              date={formatCommentDate(comment.createdAt)}
              dateTime={comment.createdAt}
              profileImage={
                <ProfileImage
                  src={comment.user.image}
                  variant="profile"
                  size="sm"
                  radius="r12"
                  alt={comment.user.nickname}
                />
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}
