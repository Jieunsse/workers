'use client';

import { useQuery, useInfiniteQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getArticles,
  getArticleDetail,
  createArticle,
  updateArticle,
  deleteArticle,
  likeArticle,
  unlikeArticle,
} from '../apis/article';
import type { CreateArticleRequest, UpdateArticleRequest } from '../apis/types';

const PAGE_SIZE = 10;
const BEST_PAGE_SIZE = 15;

export function useBestArticles() {
  return useQuery({
    queryKey: ['bestArticles'],
    queryFn: () => getArticles({ page: 1, pageSize: BEST_PAGE_SIZE, orderBy: 'like' }),
    select: (data) => data.list,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useArticles(keyword: string, orderBy: 'recent' | 'like') {
  return useInfiniteQuery({
    queryKey: ['articles', { keyword: keyword || undefined, orderBy }],
    queryFn: ({ pageParam = 1 }) =>
      getArticles({ page: pageParam, pageSize: PAGE_SIZE, orderBy, keyword: keyword || undefined }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, allPages) => {
      const loaded = allPages.length * PAGE_SIZE;
      return loaded < lastPage.totalCount ? allPages.length + 1 : undefined;
    },
    staleTime: 60_000,
    retry: 1,
  });
}

export function useArticleDetail(articleId: number) {
  return useQuery({
    queryKey: ['article', articleId],
    queryFn: () => getArticleDetail(articleId),
    enabled: articleId > 0,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCreateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateArticleRequest) => createArticle(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['bestArticles'] });
    },
  });
}

export function useUpdateArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, body }: { articleId: number; body: UpdateArticleRequest }) =>
      updateArticle(articleId, body),
    onSuccess: (_, { articleId }) => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['bestArticles'] });
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
  });
}

export function useDeleteArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (articleId: number) => deleteArticle(articleId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles'] });
      queryClient.invalidateQueries({ queryKey: ['bestArticles'] });
    },
  });
}

export function useLikeArticle() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ articleId, isLiked }: { articleId: number; isLiked: boolean }) =>
      isLiked ? unlikeArticle(articleId) : likeArticle(articleId),
    onSuccess: (data, { articleId }) => {
      queryClient.setQueryData(['article', articleId], data);
    },
  });
}
