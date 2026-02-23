import type {
  ArticleListResponse,
  ArticleDetail,
  Article,
  CreateArticleRequest,
  UpdateArticleRequest,
  DeleteArticleResponse,
} from './types';

const PROXY = '/api/proxy';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${PROXY}${path}`, options);
  if (!response.ok) {
    throw new Error(`요청에 실패했습니다. (status: ${response.status})`);
  }
  return response.json() as Promise<T>;
}

interface GetArticlesParams {
  page?: number;
  pageSize?: number;
  orderBy?: 'recent' | 'like';
  keyword?: string;
}

export function getArticles({
  page = 1,
  pageSize = 10,
  orderBy = 'recent',
  keyword,
}: GetArticlesParams = {}): Promise<ArticleListResponse> {
  const params = new URLSearchParams({
    page: String(page),
    pageSize: String(pageSize),
    orderBy,
  });
  if (keyword) params.set('keyword', keyword);

  return request<ArticleListResponse>(`/articles?${params}`);
}

export function getArticleDetail(articleId: number): Promise<ArticleDetail> {
  return request<ArticleDetail>(`/articles/${articleId}`);
}

export function createArticle(body: CreateArticleRequest): Promise<Article> {
  return request<Article>('/articles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function updateArticle(
  articleId: number,
  body: UpdateArticleRequest,
): Promise<ArticleDetail> {
  return request<ArticleDetail>(`/articles/${articleId}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export function deleteArticle(articleId: number): Promise<DeleteArticleResponse> {
  return request<DeleteArticleResponse>(`/articles/${articleId}`, {
    method: 'DELETE',
  });
}

export function likeArticle(articleId: number): Promise<ArticleDetail> {
  return request<ArticleDetail>(`/articles/${articleId}/like`, {
    method: 'POST',
  });
}

export function unlikeArticle(articleId: number): Promise<ArticleDetail> {
  return request<ArticleDetail>(`/articles/${articleId}/like`, {
    method: 'DELETE',
  });
}
