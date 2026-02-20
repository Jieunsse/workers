import clsx from 'clsx';
import ActionTextArea from './ActionTextArea';
import { CommentInputProps } from './types/types';
import styles from './styles/CommentInput.module.css';

/**
 * 댓글 입력 컴포넌트.
 * ActionTextArea를 위아래 보더 스타일로 감싸서 댓글 영역에 맞는 디자인을 제공합니다.
 * 전송 버튼과 높이 자동 조절은 ActionTextArea에서 상속됩니다.
 */
export default function CommentInput({ className, profileImage, ...props }: CommentInputProps) {
  if (profileImage) {
    return (
      <div className={styles.withProfile}>
        <div className={styles.profileImage}>{profileImage}</div>
        <div className={styles.inputArea}>
          <ActionTextArea className={clsx(styles.textarea, className)} {...props} />
        </div>
      </div>
    );
  }

  return (
    <ActionTextArea
      wrapperClassName={styles.wrapper}
      className={clsx(styles.textarea, className)}
      {...props}
    />
  );
}
