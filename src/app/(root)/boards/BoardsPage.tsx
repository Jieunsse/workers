'use client';

import { useState, useEffect, useRef, useCallback, memo } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import ArticleCard from '@/components/Card/ArticleCard/ArticleCard';
import FloatingButton from '@/components/Button/domain/FloatingButton/FloatingButton';
import Dropdown from '@/components/dropdown/Dropdown';
import useBreakpoint from './useBreakpoint';
import searchIcon from '@/assets/icons/search/searchLarge.svg';
import arrowLeftIcon from '@/assets/buttons/arrow/leftArrowButton.svg';
import arrowRightIcon from '@/assets/buttons/arrow/rightArrowButton.svg';
import arrowRightLarge from '@/assets/icons/arrow/arrowRightLarge.svg';
import styles from './BoardsPage.module.css';

interface Article {
  id: number;
  title: string;
  content?: string;
  writer: { nickname: string; id: number };
  createdAt: string;
  likeCount: number;
  image?: string | null;
}

interface BoardsPageProps {
  bestArticles?: Article[];
  articles?: Article[];
  hasMore?: boolean;
  isFetchingMore?: boolean;
  onLoadMore?: () => void;
  onSearch?: (keyword: string) => void;
  onSort?: (orderBy: 'recent' | 'like') => void;
}

const VISIBLE_COUNT_MAP = { desktop: 3, tablet: 2, mobile: 1 } as const;

const SORT_OPTIONS = [
  { value: 'latest', label: '최신순' },
  { value: 'likes', label: '좋아요 많은순' },
];

const SORT_ORDER_MAP: Record<string, 'recent' | 'like'> = {
  latest: 'recent',
  likes: 'like',
};

const ArticleSortHeader = memo(function ArticleSortHeader({
  onSortChange,
}: {
  onSortChange: (value: string) => void;
}) {
  return (
    <div className={styles.sectionHeader}>
      <h2 className={styles.sectionTitle}>전체</h2>
      <Dropdown
        items={SORT_OPTIONS}
        defaultValue="latest"
        ariaLabel="정렬 기준"
        menuClassName={styles.dropdownMenu}
        onChange={onSortChange}
      />
    </div>
  );
});

const BestSection = memo(function BestSection({ bestArticles }: { bestArticles: Article[] }) {
  const breakpoint = useBreakpoint();
  const visibleCount = VISIBLE_COUNT_MAP[breakpoint];

  const [currentPage, setCurrentPage] = useState(0);
  const [direction, setDirection] = useState(0);

  const totalPages = Math.ceil(bestArticles.length / visibleCount);
  const safePage = Math.min(currentPage, Math.max(0, totalPages - 1));

  if (safePage !== currentPage) {
    setCurrentPage(safePage);
  }

  const visibleBestArticles = bestArticles.slice(
    safePage * visibleCount,
    safePage * visibleCount + visibleCount,
  );

  const handlePrev = () => {
    setDirection(-1);
    setCurrentPage((prev) => Math.max(0, prev - 1));
  };
  const handleNext = () => {
    setDirection(1);
    setCurrentPage((prev) => Math.min(totalPages - 1, prev + 1));
  };

  return (
    <section className={styles.bestSection}>
      <div className={styles.sectionHeader}>
        <h2 className={styles.sectionTitle}>베스트 게시글</h2>
        <button type="button" className={styles.moreButton}>
          더보기
          <Image src={arrowRightLarge} alt="" width={16} height={16} />
        </button>
      </div>

      <div className={styles.carouselContainer}>
        <AnimatePresence initial={false} custom={direction} mode="wait">
          <motion.div
            key={currentPage}
            custom={direction}
            variants={{
              enter: (d: number) => ({ x: d > 0 ? 40 : -40, opacity: 0 }),
              center: { x: 0, opacity: 1 },
              exit: (d: number) => ({ x: d > 0 ? -40 : 40, opacity: 0 }),
            }}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className={styles.carouselTrack}
          >
            {visibleBestArticles.map((article) => (
              <div key={article.id} className={styles.bestCardWrapper}>
                <ArticleCard {...article} image={article.image ?? undefined} isBest />
              </div>
            ))}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className={styles.carouselControls}>
        <div className={styles.dots}>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={i}
              type="button"
              className={`${styles.dot} ${i === currentPage ? styles.dotActive : ''}`}
              onClick={() => {
                setDirection(i > currentPage ? 1 : -1);
                setCurrentPage(i);
              }}
              aria-label={`페이지 ${i + 1}`}
            />
          ))}
        </div>
        <div className={styles.arrows}>
          <button
            type="button"
            className={styles.arrowButton}
            onClick={handlePrev}
            aria-label="이전"
            disabled={currentPage === 0}
          >
            <Image src={arrowLeftIcon} alt="" width={32} height={32} />
          </button>
          <button
            type="button"
            className={styles.arrowButton}
            onClick={handleNext}
            aria-label="다음"
            disabled={currentPage >= totalPages - 1}
          >
            <Image src={arrowRightIcon} alt="" width={32} height={32} />
          </button>
        </div>
      </div>
    </section>
  );
});

export default function BoardsPage({
  bestArticles = [],
  articles = [],
  hasMore = false,
  isFetchingMore = false,
  onLoadMore,
  onSearch,
  onSort,
}: BoardsPageProps) {
  const router = useRouter();
  const searchRef = useRef<HTMLInputElement>(null);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const handleIntersect = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      if (entries[0].isIntersecting && hasMore) {
        onLoadMore?.();
      }
    },
    [hasMore, onLoadMore],
  );

  useEffect(() => {
    const el = sentinelRef.current;
    if (!el) return;
    const observer = new IntersectionObserver(handleIntersect, { rootMargin: '200px' });
    observer.observe(el);
    return () => observer.disconnect();
  }, [handleIntersect]);

  const handleSearchSubmit = useCallback(() => {
    onSearch?.(searchRef.current?.value ?? '');
  }, [onSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearchSubmit();
    }
  };

  const handleSortChange = useCallback(
    (value: string) => {
      onSort?.(SORT_ORDER_MAP[value] || 'recent');
    },
    [onSort],
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.pageTitle}>자유게시판</h1>
        <div className={styles.searchWrapper}>
          <Image
            src={searchIcon}
            alt="검색"
            width={32}
            height={32}
            className={styles.searchIcon}
            onClick={handleSearchSubmit}
          />
          <input
            ref={searchRef}
            type="text"
            className={styles.searchInput}
            placeholder="검색어를 입력해주세요"
            defaultValue=""
            onKeyDown={handleKeyDown}
          />
        </div>
      </header>

      <BestSection bestArticles={bestArticles} />

      <section className={styles.allSection}>
        <ArticleSortHeader onSortChange={handleSortChange} />

        <div className={styles.articleGrid}>
          {articles.map((article) => (
            <ArticleCard key={article.id} {...article} image={article.image ?? undefined} />
          ))}
        </div>
        <div ref={sentinelRef} className={styles.sentinel}>
          {isFetchingMore && (
            <div className={styles.loadingIndicator} role="status" aria-label="더 불러오는 중">
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
              <span className={styles.loadingDot} />
            </div>
          )}
        </div>
      </section>

      <div className={styles.floatingButtonWrapper}>
        <FloatingButton icon="edit" onClick={() => router.push('/boards/write')} />
      </div>
    </div>
  );
}
