import { memo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './ArticleCard.module.css';
import bestIcon from '@/assets/icons/best/best.svg';
import emptyHeartIcon from '@/assets/icons/heart/emptyHeartLarge.svg';

interface ArticleCardProps {
  id: number;
  title: string;
  /** 게시글 본문 (API 추가 시 사용) */
  content?: string;
  writer: {
    nickname: string;
    id: number;
  };
  createdAt: string;
  likeCount: number;
  image?: string;
  isBest?: boolean;
  href?: string;
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, '0');
  const day = date.getDate().toString().padStart(2, '0');
  return `${year}. ${month}. ${day}`;
}

function formatLikeCount(count: number): string {
  if (count >= 1000) {
    return '999+';
  }
  return count.toString();
}

function ArticleCard({
  id,
  title,
  content,
  writer,
  createdAt,
  likeCount,
  image,
  isBest = false,
  href,
}: ArticleCardProps) {
  const cardHref = href ?? `/boards/${id}`;

  if (isBest) {
    return (
      <Link href={cardHref} className={`${styles.card} ${styles.best}`}>
        <div className={styles.badge}>
          <Image src={bestIcon} alt="" width={16} height={16} />
          <span>인기</span>
        </div>

        <div className={styles.bestBody}>
          <div className={styles.bestText}>
            <h3 className={styles.title}>{title}</h3>
            {content && (
              <p className={styles.preview}>
                {content.length > 100 ? `${content.slice(0, 100)}...` : content}
              </p>
            )}
          </div>
          {image && (
            <div className={styles.bestImageWrapper}>
              <img src={image} alt="" className={styles.image} />
            </div>
          )}
        </div>

        <div className={styles.bestFooter}>
          <div className={styles.meta}>
            <span className={styles.writer}>{writer.nickname}</span>
            <span className={styles.divider}>|</span>
            <time className={styles.date} dateTime={createdAt}>
              {formatDate(createdAt)}
            </time>
          </div>
          <div className={styles.like}>
            <Image src={emptyHeartIcon} alt="" width={16} height={16} />
            <span>{formatLikeCount(likeCount)}</span>
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link href={cardHref} className={styles.card}>
      <div className={styles.content}>
        <h3 className={styles.title}>{title}</h3>

        {content && (
          <p className={styles.preview}>
            {content.length > 100 ? `${content.slice(0, 100)}...` : content}
          </p>
        )}

        <div className={styles.meta}>
          <span className={styles.writer}>{writer.nickname}</span>
          <span className={styles.divider}>|</span>
          <time className={styles.date} dateTime={createdAt}>
            {formatDate(createdAt)}
          </time>
        </div>
      </div>

      <div className={styles.rightSection}>
        {image && (
          <div className={styles.imageWrapper}>
            <img src={image} alt="" className={styles.image} />
          </div>
        )}

        <div className={styles.like}>
          <Image src={emptyHeartIcon} alt="" width={16} height={16} />
          <span>{formatLikeCount(likeCount)}</span>
        </div>
      </div>
    </Link>
  );
}

export default memo(ArticleCard);
