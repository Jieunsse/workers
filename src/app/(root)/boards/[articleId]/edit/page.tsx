'use client';

import { use } from 'react';
import ArticleEditPage from './ArticleEditPage';

export default function Page({ params }: { params: Promise<{ articleId: string }> }) {
  const { articleId } = use(params);

  return <ArticleEditPage articleId={Number(articleId)} />;
}
