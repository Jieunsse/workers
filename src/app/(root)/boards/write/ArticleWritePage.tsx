'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Input from '@/components/input/Input';
import TextArea from '@/components/input/TextArea';
import ImageUpload from '@/components/Card/ImageUpload/ImageUpload';
import BaseButton from '@/components/Button/base/BaseButton';
import { useCreateArticle } from '../hooks/useArticles';
import { uploadImage } from '../apis/image';
import styles from './ArticleWritePage.module.css';

export default function ArticleWritePage() {
  const router = useRouter();
  const createArticleMutation = useCreateArticle();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [images, setImages] = useState<string[]>([]);

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
    if (!isValid || createArticleMutation.isPending) return;
    createArticleMutation.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        ...(images[0] ? { image: images[0] } : {}),
      },
      {
        onSuccess: () => router.push('/boards'),
        onError: () => alert('게시글 작성에 실패했습니다.'),
      },
    );
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <h1 className={styles.pageTitle}>게시글 쓰기</h1>

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
          disabled={!isValid || createArticleMutation.isPending}
          onClick={handleSubmit}
        >
          등록하기
        </BaseButton>
      </div>
    </div>
  );
}
