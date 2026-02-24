'use client';

import { useState, useRef } from 'react';
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
  const titleRef = useRef<HTMLInputElement>(null);
  const contentRef = useRef<HTMLTextAreaElement>(null);
  const [isValid, setIsValid] = useState(false);
  const [images, setImages] = useState<string[]>([]);

  const checkValidity = () => {
    const valid =
      (titleRef.current?.value.trim().length ?? 0) > 0 &&
      (contentRef.current?.value.trim().length ?? 0) > 0;
    setIsValid((prev) => (prev !== valid ? valid : prev));
  };

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
    const title = titleRef.current?.value.trim() ?? '';
    const content = contentRef.current?.value.trim() ?? '';
    if (!title || !content || createArticleMutation.isPending) return;
    createArticleMutation.mutate(
      {
        title,
        content,
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
            ref={titleRef}
            placeholder="제목을 입력해주세요."
            defaultValue=""
            onChange={checkValidity}
          />
        </div>

        <div className={styles.field}>
          <label className={styles.label}>
            내용 <span className={styles.required}>*</span>
          </label>
          <TextArea
            ref={contentRef}
            className={styles.contentTextarea}
            placeholder="내용을 입력하세요"
            defaultValue=""
            onChange={checkValidity}
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
