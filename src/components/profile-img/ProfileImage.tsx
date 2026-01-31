'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties } from 'react';
import Image from 'next/image';
import styles from './ProfileImage.module.css';

import HumanBig from '@/assets/buttons/human/humanBig.svg';
import HumanSmall from '@/assets/buttons/human/humanSmall.svg';

import PencilLarge from '@/assets/buttons/edit/editButtonLarge.svg';
import PencilSmall from '@/assets/buttons/edit/editButtonSmall.svg';

import TeamDefault from '@/assets/icons/img/img.svg';

import { fetchApi } from '@/shared/apis/fetchApi';
import { TEAM_ID } from '@/shared/apis/config';

const BASE_URL: string = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';

export type ProfileImageSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type ProfileImageVariant = 'profile' | 'team';
export type ProfileImageRadius = 'r8' | 'r12' | 'r20' | 'r32';

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
type SizeSpec = { box: number; image: number };
type ResponsiveSize = Partial<Record<Breakpoint, ProfileImageSize>>;
type ResponsiveSpec = Partial<Record<Breakpoint, SizeSpec>>;

export type ProfileImageProps = {
  src?: string | null;
  variant?: ProfileImageVariant;
  size?: ProfileImageSize;
  responsiveSize?: ResponsiveSize;
  responsiveSpec?: ResponsiveSpec;
  radius?: ProfileImageRadius;

  /** edit on/off */
  editable?: boolean;

  /** edit 버튼 표시 여부 (기본 true) */
  showEditButton?: boolean;

  /** 버튼 숨길 때, 아바타 클릭으로 업로드 열기 */
  clickToEdit?: boolean;

  /**
   * 보더 제어(오버라이드)
   * - undefined: 기본(xl/lg만 2px)
   * - true: 모든 사이즈 2px
   * - false: 보더 없음
   */
  showBorder?: boolean;

  /** 업로드 + PATCH까지 실행할지 (기본 true) */
  enableApi?: boolean;

  /** 업로드 요청에 추가로 붙일 헤더 (ex. Authorization) */
  uploadHeaders?: HeadersInit;

  /** LCP 경고 방지: above-the-fold에서만 true */
  priority?: boolean;

  alt?: string;
  className?: string;
};

const SIZE_PRESET: Record<ProfileImageSize, SizeSpec> = {
  xl: { box: 112, image: 100 },
  lg: { box: 78, image: 64 },
  md: { box: 40, image: 32 },
  sm: { box: 32, image: 24 },
  xs: { box: 24, image: 16 },
};

const BP_ORDER: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

const BORDER_BY_SIZE: Record<ProfileImageSize, number> = {
  xl: 2,
  lg: 2,
  md: 0,
  sm: 0,
  xs: 0,
};

function getDefaultResponsiveSize(
  baseSize: ProfileImageSize,
): Record<Breakpoint, ProfileImageSize> {
  switch (baseSize) {
    case 'xl':
      return { base: 'lg', sm: 'lg', md: 'xl', lg: 'xl', xl: 'xl' };
    default:
      return { base: baseSize, sm: baseSize, md: baseSize, lg: baseSize, xl: baseSize };
  }
}

function resolveResponsiveSpec(
  baseSize: ProfileImageSize,
  responsiveSize?: ResponsiveSize,
  responsiveSpec?: ResponsiveSpec,
): { spec: Record<Breakpoint, SizeSpec>; sizeByBp: Record<Breakpoint, ProfileImageSize> } {
  const defaults = getDefaultResponsiveSize(baseSize);

  const sizeByBp: Record<Breakpoint, ProfileImageSize> = {
    base: responsiveSize?.base ?? defaults.base,
    sm: responsiveSize?.sm ?? defaults.sm,
    md: responsiveSize?.md ?? defaults.md,
    lg: responsiveSize?.lg ?? defaults.lg,
    xl: responsiveSize?.xl ?? defaults.xl,
  };

  const spec: Record<Breakpoint, SizeSpec> = {
    base: responsiveSpec?.base ?? SIZE_PRESET[sizeByBp.base],
    sm: responsiveSpec?.sm ?? SIZE_PRESET[sizeByBp.sm],
    md: responsiveSpec?.md ?? SIZE_PRESET[sizeByBp.md],
    lg: responsiveSpec?.lg ?? SIZE_PRESET[sizeByBp.lg],
    xl: responsiveSpec?.xl ?? SIZE_PRESET[sizeByBp.xl],
  };

  return { spec, sizeByBp };
}

function resolveResponsiveBorder(
  sizeByBp: Record<Breakpoint, ProfileImageSize>,
  responsiveSpec: ResponsiveSpec | undefined,
  showBorder: boolean | undefined,
): Record<Breakpoint, number> {
  const result: Partial<Record<Breakpoint, number>> = {};

  if (showBorder === false) {
    for (const bp of BP_ORDER) result[bp] = 0;
    return result as Record<Breakpoint, number>;
  }

  if (showBorder === true) {
    for (const bp of BP_ORDER) result[bp] = 2;
    return result as Record<Breakpoint, number>;
  }

  for (const bp of BP_ORDER) {
    if (responsiveSpec?.[bp]) {
      result[bp] = bp === 'lg' || bp === 'xl' ? 2 : 0;
      continue;
    }
    result[bp] = BORDER_BY_SIZE[sizeByBp[bp]];
  }

  return result as Record<Breakpoint, number>;
}

function getFallback(variant: ProfileImageVariant, baseSize: ProfileImageSize) {
  if (variant === 'team') return TeamDefault;
  return baseSize === 'xs' || baseSize === 'sm' ? HumanSmall : HumanBig;
}

function buildSizesAttr(spec: Record<Breakpoint, SizeSpec>) {
  return [
    `(min-width: 1280px) ${spec.xl.image}px`,
    `(min-width: 1024px) ${spec.lg.image}px`,
    `(min-width: 768px) ${spec.md.image}px`,
    `(min-width: 640px) ${spec.sm.image}px`,
    `${spec.base.image}px`,
  ].join(', ');
}

export default function ProfileImage({
  src,
  variant = 'profile',
  size = 'md',
  responsiveSize,
  responsiveSpec,
  radius = 'r12',
  editable = false,
  showEditButton = true,
  clickToEdit,
  showBorder,
  enableApi = true,
  uploadHeaders,
  priority = false,
  alt = 'profile image',
  className,
}: ProfileImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);

  useEffect(() => {
    return () => {
      if (previewUrl?.startsWith('blob:')) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const { spec: resolvedSpec, sizeByBp } = useMemo(
    () => resolveResponsiveSpec(size, responsiveSize, responsiveSpec),
    [size, responsiveSize, responsiveSpec],
  );

  const resolvedBorder = useMemo(
    () => resolveResponsiveBorder(sizeByBp, responsiveSpec, showBorder),
    [sizeByBp, responsiveSpec, showBorder],
  );

  const sizesAttr = useMemo(() => buildSizesAttr(resolvedSpec), [resolvedSpec]);
  const fallback = useMemo(() => getFallback(variant, size), [variant, size]);

  const imageSrc = previewUrl ?? src ?? null;
  const currentSrcKey = typeof imageSrc === 'string' ? imageSrc : null;
  const isErrored = !!currentSrcKey && erroredSrc === currentSrcKey;

  const effectiveSrc = isErrored ? fallback : imageSrc || fallback;
  const usingFallback = isErrored || !imageSrc;

  const shouldClickToEdit = clickToEdit ?? (editable && !showEditButton);

  const handleEditClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleAvatarClick = useCallback(() => {
    if (editable && shouldClickToEdit) handleEditClick();
  }, [editable, shouldClickToEdit, handleEditClick]);

  /**
   * 이미지 업로드
   * @param file 업로드할 이미지 파일
   * @returns 업로드 후 반환된 이미지 URL
   */
  const uploadImage = useCallback(
    async (file: File) => {
      if (!BASE_URL) throw new Error('NEXT_PUBLIC_API_BASE_URL is missing');

      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${BASE_URL}/${TEAM_ID}/images/upload`, {
        method: 'POST',
        body: formData,
        // ✅ 토큰 기반: Authorization 등은 상위에서 주입
        // ⚠️ FormData라 Content-Type을 직접 넣으면 안 됨
        headers: {
          ...(uploadHeaders ?? {}),
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`upload failed ${res.status}: ${text}`);
      }

      const data = (await res.json()) as { url: string };
      return data.url;
    },
    [uploadHeaders],
  );

  /**
   * 유저 프로필 이미지 PATCH
   * @param url 업로드된 이미지 URL
   */
  const patchUserImage = useCallback(async (url: string) => {
    const res = await fetchApi(`/${TEAM_ID}/user`, {
      method: 'PATCH',
      body: JSON.stringify({ image: url }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`patch failed ${res.status}: ${text}`);
    }
  }, []);

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setErroredSrc(null);

      // local preview
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return localUrl;
      });

      if (enableApi) {
        try {
          const url = await uploadImage(file);
          await patchUserImage(url);

          // preview를 서버 url로 교체
          setPreviewUrl((prev) => {
            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
            return url;
          });
        } catch (err) {
          console.error(err);
        }
      }

      e.target.value = '';
    },
    [enableApi, uploadImage, patchUserImage],
  );

  const styleVars = useMemo(() => {
    const s = resolvedSpec;
    const b = resolvedBorder;

    const vars: CSSProperties & Record<string, string> = {
      '--pi-box-base': `${s.base.box}px`,
      '--pi-img-base': `${s.base.image}px`,
      '--pi-border-base': `${b.base}px`,

      '--pi-box-sm': `${s.sm.box}px`,
      '--pi-img-sm': `${s.sm.image}px`,
      '--pi-border-sm': `${b.sm}px`,

      '--pi-box-md': `${s.md.box}px`,
      '--pi-img-md': `${s.md.image}px`,
      '--pi-border-md': `${b.md}px`,

      '--pi-box-lg': `${s.lg.box}px`,
      '--pi-img-lg': `${s.lg.image}px`,
      '--pi-border-lg': `${b.lg}px`,

      '--pi-box-xl': `${s.xl.box}px`,
      '--pi-img-xl': `${s.xl.image}px`,
      '--pi-border-xl': `${b.xl}px`,
    };

    return vars;
  }, [resolvedSpec, resolvedBorder]);

  const hasBorder =
    resolvedBorder.base > 0 ||
    resolvedBorder.sm > 0 ||
    resolvedBorder.md > 0 ||
    resolvedBorder.lg > 0 ||
    resolvedBorder.xl > 0;

  return (
    <div className={`${styles.frame} ${className ?? ''}`} style={styleVars}>
      <div className={styles.outer}>
        <div className={`${styles.box} ${styles[radius]}`}>
          <div
            className={`${styles.mask} ${styles[radius]} ${
              variant === 'team' ? styles.teamMask : styles.profileMask
            }`}
          >
            <div
              className={`${styles.avatar} ${styles[radius]} ${
                hasBorder ? styles.avatarBorder : ''
              } ${editable && shouldClickToEdit ? styles.clickable : ''}`}
              onClick={handleAvatarClick}
              role={editable && shouldClickToEdit ? 'button' : undefined}
              tabIndex={editable && shouldClickToEdit ? 0 : -1}
              aria-label={editable && shouldClickToEdit ? 'edit image' : undefined}
            >
              <Image
                src={effectiveSrc}
                alt={alt}
                fill
                sizes={sizesAttr}
                className={`${styles.img} ${styles[radius]} ${
                  usingFallback ? styles.contain : styles.cover
                }`}
                priority={priority}
                loading={priority ? 'eager' : 'lazy'}
                onError={() => {
                  if (typeof imageSrc === 'string') setErroredSrc(imageSrc);
                }}
              />
            </div>
          </div>

          {editable && showEditButton && (
            <button
              type="button"
              className={styles.editButton}
              onClick={handleEditClick}
              aria-label="edit image"
            >
              <span className={styles.pencilSmall}>
                <Image src={PencilSmall} alt="수정하기" width={18} height={18} />
              </span>
              <span className={styles.pencilLarge}>
                <Image src={PencilLarge} alt="수정하기" width={32} height={32} />
              </span>
            </button>
          )}

          {editable && (
            <input ref={inputRef} type="file" accept="image/*" hidden onChange={handleFileChange} />
          )}
        </div>
      </div>
    </div>
  );
}
