'use client';

import { useState, useMemo } from 'react';
import { useBestArticles, useArticles } from './hooks/useArticles';
import BoardsPage from './BoardsPage';

export default function Page() {
  const [keyword, setKeyword] = useState('');
  const [orderBy, setOrderBy] = useState<'recent' | 'like'>('recent');

  const { data: bestArticles = [] } = useBestArticles();
  const {
    data: articlesData,
    fetchNextPage,
    hasNextPage = false,
    isFetchingNextPage,
  } = useArticles(keyword, orderBy);

  const articles = useMemo(
    () => articlesData?.pages.flatMap((page) => page.list) ?? [],
    [articlesData],
  );

  return (
    <BoardsPage
      bestArticles={bestArticles}
      articles={articles}
      hasMore={hasNextPage && !isFetchingNextPage}
      isFetchingMore={isFetchingNextPage}
      onLoadMore={() => fetchNextPage()}
      onSearch={setKeyword}
      onSort={setOrderBy}
    />
  );
}
