'use client';

import { use } from 'react';
import { useArticleDetail } from '../hooks/useArticles';
import { useComments } from '../hooks/useComments';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import ArticleDetailPage from './ArticleDetailPage';

export default function Page({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = use(params);
  const id = Number(articleId);

  const { data: article } = useArticleDetail(id);
  const { data: comments = [] } = useComments(id);
  const { data: user } = useCurrentUser();

  if (!article) return null;

  return (
    <ArticleDetailPage
      article={article}
      comments={comments}
      currentUserImage={user?.image ?? null}
    />
  );
}
