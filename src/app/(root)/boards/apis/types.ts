export interface Writer {
  image: string | null;
  nickname: string;
  id: number;
}

export interface Article {
  id: number;
  title: string;
  content: string;
  image: string | null;
  writer: Writer;
  likeCount: number;
  commentCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface ArticleDetail extends Article {
  isLiked: boolean;
}

export interface ArticleListResponse {
  totalCount: number;
  list: Article[];
}

export interface CreateArticleRequest {
  title: string;
  content: string;
  image?: string;
}

export type UpdateArticleRequest = Partial<CreateArticleRequest>;

export interface DeleteArticleResponse {
  id: number;
}
