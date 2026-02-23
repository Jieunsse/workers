const PROXY = '/api/proxy';

export interface CommentWriter {
  image: string | null;
  nickname: string;
  id: number;
}

export interface Comment {
  id: number;
  content: string;
  writer: CommentWriter;
  createdAt: string;
  updatedAt: string;
}

export interface CommentListResponse {
  nextCursor: number | null;
  list: Comment[];
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${PROXY}${path}`, options);
  if (!response.ok) {
    throw new Error(`요청에 실패했습니다. (status: ${response.status})`);
  }
  return response.json() as Promise<T>;
}

export function getComments(
  articleId: number,
  limit: number,
  cursor?: number,
): Promise<CommentListResponse> {
  const params = new URLSearchParams({ limit: String(limit) });
  if (cursor) params.set('cursor', String(cursor));

  return request<CommentListResponse>(`/articles/${articleId}/comments?${params}`);
}

export function createComment(articleId: number, content: string): Promise<Comment> {
  return request<Comment>(`/articles/${articleId}/comments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export function updateComment(commentId: number, content: string): Promise<Comment> {
  return request<Comment>(`/comments/${commentId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
}

export function deleteComment(commentId: number): Promise<{ id: number }> {
  return request<{ id: number }>(`/comments/${commentId}`, {
    method: 'DELETE',
  });
}
