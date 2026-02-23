'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getComments, createComment, updateComment, deleteComment } from '../apis/comments';

export function useComments(articleId: number) {
  return useQuery({
    queryKey: ['comments', articleId],
    queryFn: () => getComments(articleId, 100),
    select: (data) => data.list,
    enabled: articleId > 0,
    staleTime: 60_000,
    retry: 1,
  });
}

export function useCreateComment(articleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (content: string) => createComment(articleId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    },
  });
}

export function useUpdateComment(articleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ commentId, content }: { commentId: number; content: string }) =>
      updateComment(commentId, content),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    },
  });
}

export function useDeleteComment(articleId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (commentId: number) => deleteComment(commentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comments', articleId] });
    },
  });
}
