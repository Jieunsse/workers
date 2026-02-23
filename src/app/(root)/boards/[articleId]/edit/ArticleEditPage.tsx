'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/input/Input';
import TextArea from '@/components/input/TextArea';
import ImageUpload from '@/components/Card/ImageUpload/ImageUpload';
import BaseButton from '@/components/Button/base/BaseButton';
import { useArticleDetail, useUpdateArticle } from '../../hooks/useArticles';
import { uploadImage } from '../../apis/image';
import styles from '../../write/ArticleWritePage.module.css';

interface ArticleEditPageProps {
  articleId: number;
}

interface ArticleData {
  title: string;
  content: string;
  image?: string | null;
}

function ArticleEditForm({ articleId, article }: { articleId: number; article: ArticleData }) {
  const router = useRouter();
  const updateArticleMutation = useUpdateArticle();

  const [title, setTitle] = useState(article.title);
  const [content, setContent] = useState(article.content);
  const [images, setImages] = useState<string[]>(article.image ? [article.image] : []);

  const isValid = title.trim().length > 0 && content.trim().length > 0;

  const handleFileSelect = async (file: File) => {
    try {
      const url = await uploadImage(file);
      setImages((prev) => [...prev, url]);
    } catch {
      alert('이미지 업로드에 실패했습니다.');
    }
  };

  const handleRemoveImage = (index: number) => {
    setImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    if (!isValid || updateArticleMutation.isPending) return;
    updateArticleMutation.mutate(
      {
        articleId,
        body: {
          title: title.trim(),
          content: content.trim(),
          ...(images[0] ? { image: images[0] } : {}),
        },
      },
      {
        onSuccess: () => router.push(`/boards/${articleId}`),
        onError: () => alert('게시글 수정에 실패했습니다.'),
      },
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.pageTitle}>게시글 수정</h1>

        <div className={styles.field}>
          <label className={styles.label}>
            제목 <span className={styles.required}>*</span>
          </label>
          <Input
            placeholder="제목을 입력해주세요."
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            내용 <span className={styles.required}>*</span>
          </label>
          <TextArea
            className={styles.contentTextarea}
            placeholder="내용을 입력하세요"
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>이미지</label>
          <ImageUpload
            images={images}
            onFileSelect={handleFileSelect}
            onRemove={handleRemoveImage}
          />
        </div>

        <BaseButton
          className={styles.submitButton}
          disabled={!isValid || updateArticleMutation.isPending}
          onClick={handleSubmit}
        >
          수정하기
        </BaseButton>
      </div>
    </div>
  );
}

export default function ArticleEditPage({ articleId }: ArticleEditPageProps) {
  const router = useRouter();
  const { data: article, isError } = useArticleDetail(articleId);

  if (isError) {
    alert('게시글을 불러오는데 실패했습니다.');
    router.back();
    return null;
  }

  if (!article) return null;

  return <ArticleEditForm articleId={articleId} article={article} />;
}
