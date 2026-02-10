'use client';

import { useRef } from 'react';
import Image from 'next/image';
import styles from './ImageUpload.module.css';
import imgIcon from '@/assets/icons/img/img.svg';
import xMarkIcon from '@/assets/icons/xMark/xMarkBig.svg';

interface ImageUploadProps {
  /** 업로드된 이미지 URL 배열 */
  images: string[];
  /** 최대 업로드 개수 */
  maxImages?: number;
  /** 파일 선택 시 호출 (실제 업로드는 부모에서 처리) */
  onFileSelect: (file: File) => void;
  /** 이미지 삭제 */
  onRemove: (index: number) => void;
  /** 크기 */
  size?: 'large' | 'small';
}

/**
 * ImageUpload
 *
 * 이미지 업로드 UI 컴포넌트입니다.
 *
 * @remarks
 * - 최대 5개까지 이미지를 업로드할 수 있습니다.
 * - 업로드할 때마다 슬롯이 동적으로 추가됩니다.
 * - 각 업로드 슬롯에 "N/5" 형태로 현재 개수를 표시합니다.
 * - 실제 API 호출은 부모 컴포넌트에서 처리합니다 (1개씩 업로드).
 * - 업로드된 이미지는 미리보기와 함께 삭제 버튼이 표시됩니다.
 *
 * @example
 * ```tsx
 * const [images, setImages] = useState<string[]>([]);
 *
 * const handleFileSelect = async (file: File) => {
 *   const url = await uploadImage(file);  // API 호출
 *   setImages([...images, url]);
 * };
 *
 * <ImageUpload
 *   images={images}
 *   onFileSelect={handleFileSelect}
 *   onRemove={(index) => setImages(images.filter((_, i) => i !== index))}
 * />
 * ```
 */
export default function ImageUpload({
  images,
  maxImages = 5,
  onFileSelect,
  onRemove,
  size = 'large',
}: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleClick = () => {
    if (images.length >= maxImages) return;
    inputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 10MB 제한
    if (file.size > 10 * 1024 * 1024) {
      alert('파일 크기는 10MB를 초과할 수 없습니다.');
      return;
    }

    // 이미지 파일만
    if (!file.type.startsWith('image/')) {
      alert('이미지 파일만 업로드할 수 있습니다.');
      return;
    }

    onFileSelect(file);

    // input 초기화 (같은 파일 재선택 가능)
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  };

  // 동적 슬롯: 업로드된 이미지 + 업로드 버튼 (최대 개수 전까지)
  const showUploadButton = images.length < maxImages;

  return (
    <div className={styles.container}>
      {/* 업로드된 이미지들 */}
      {images.map((imageUrl, index) => (
        <div key={index} className={`${styles.slot} ${styles[size]}`}>
          <img src={imageUrl} alt="" className={styles.preview} />
          <button
            type="button"
            className={styles.removeButton}
            onClick={() => onRemove(index)}
            aria-label="이미지 삭제"
          >
            <Image src={xMarkIcon} alt="" width={20} height={20} />
          </button>
        </div>
      ))}

      {/* 업로드 버튼 (최대 개수 전까지만 표시) */}
      {showUploadButton && (
        <button
          type="button"
          className={`${styles.slot} ${styles[size]} ${styles.uploadSlot}`}
          onClick={handleClick}
        >
          <Image src={imgIcon} alt="" width={24} height={24} />
          <span className={styles.count}>
            {images.length}/{maxImages}
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className={styles.hiddenInput}
      />
    </div>
  );
}
