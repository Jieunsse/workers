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
  onClick?: () => void;
}

/**
 * ArticleCard
 *
 * 자유게시판 게시글을 카드 형태로 표시하는 컴포넌트입니다.
 *
 * @remarks
 * - 목록 조회 API(ArticleListType)의 데이터 구조와 일치합니다.
 * - `isBest` prop은 페이지에서 계산하여 전달합니다 (좋아요 상위 N개).
 * - `content` 필드는 현재 API에 없지만, 추후 추가를 대비해 optional로 정의했습니다.
 * - 이미지가 있으면 우측에 표시되고, 없으면 텍스트가 전체 공간을 차지합니다.
 *
 * @example
 * ```tsx
 * <ArticleCard
 *   {...article}
 *   isBest={bestArticles.includes(article)}
 *   onClick={() => router.push(`/articles/${article.id}`)}
 * />
 * ```
 */
export default function ArticleCard({
  title,
  content,
  writer,
  createdAt,
  likeCount,
  image,
  isBest = false,
  onClick,
}: ArticleCardProps) {
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    return `${year}. ${month}. ${day}`;
  };

  const formatLikeCount = (count: number): string => {
    if (count >= 1000) {
      return '999+';
    }
    return count.toString();
  };

  return (
    <article className={styles.card} onClick={onClick}>
      <div className={styles.content}>
        {isBest && (
          <div className={styles.badge}>
            <Image src={bestIcon} alt="" width={16} height={16} />
            <span>인기</span>
          </div>
        )}

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
    </article>
  );
}
