'use client';

/**
 * ProfileImage Component
 *
 *
 * Props 요약
 * @param src             표시할 이미지 URL (없으면 fallback)
 * @param variant         'profile' | 'team' (마스크 배경색/기본 fallback 분기)
 * @param size            'xl' | 'lg' | 'md' | 'sm' | 'xs' (기본 스펙 프리셋)
 * @param responsiveSize  브레이크포인트별 size 오버라이드 (선택)
 * @param responsiveSpec  브레이크포인트별 box/image px 직접 지정 (선택)
 * @param radius          'r8' | 'r12' | 'r20' | 'r32' (컨테이너/마스크/이미지 동일 적용)
 *
 * @param editable        true면 input(file) 활성화 + edit 버튼 표시 가능
 * @param showEditButton  edit 버튼 자체 표시 여부 (default true)
 * @param clickToEdit     showEditButton=false일 때 avatar 클릭으로 업로드 열기 (선택)
 *
 * @param showBorder      보더 표시 제어 (undefined=기본: xl/lg만 2px, true=항상 2px, false=없음)
 *
 * @param enableApi       true면 업로드 -> PATCH까지 실행 (default true)
 * @param authHeaders     토큰 기반 인증 헤더를 상위에서 주입 (upload + patch 둘 다 사용)
 *                        예) { Authorization: `Bearer ${token}` }
 * @param uploadHeaders   (하위호환) 업로드에만 붙일 헤더. authHeaders와 병합됨.
 *
 * @param priority        above-the-fold일 때 true로 주면 LCP warning 줄어듦 (next/image)
 * @param alt             이미지 alt
 * @param className       wrapper 클래스 추가
 *
 * 추가:
 * @param teamGroupId     variant='team'일 때 PATCH /groups/{id} 호출에 필요한 그룹 id
 * @param onError         업로드/패치 실패 시 상위에서 토스트 등 처리할 수 있게 콜백 제공
 *
 * - fetchApi는 JSON 전용(Content-Type 강제)이라 업로드(multipart)는 fetch로 유지
 */

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, CSSProperties, KeyboardEvent } from 'react';
import Image from 'next/image';
import styles from './ProfileImage.module.css';

import HumanBig from '@/assets/buttons/human/humanBig.svg';
import HumanSmall from '@/assets/buttons/human/humanSmall.svg';

import PencilLarge from '@/assets/buttons/edit/editButtonLarge.svg';
import PencilSmall from '@/assets/buttons/edit/editButtonSmall.svg';

import TeamDefault from '@/assets/icons/img/img.svg';

import { fetchApi } from '@/shared/apis/fetchApi';
import { BASE_URL, TEAM_ID } from '@/shared/apis/config';

export type ProfileImageSize = 'xl' | 'lg' | 'md' | 'sm' | 'xs';
export type ProfileImageVariant = 'profile' | 'team';
export type ProfileImageRadius = 'r8' | 'r12' | 'r20' | 'r32';

type Breakpoint = 'base' | 'sm' | 'md' | 'lg' | 'xl';
type SizeSpec = { box: number; image: number };
type ResponsiveSize = Partial<Record<Breakpoint, ProfileImageSize>>;
type ResponsiveSpec = Partial<Record<Breakpoint, SizeSpec>>;

type ErrorStage = 'upload' | 'patch-profile' | 'patch-team';

export type ProfileImageProps = {
  src?: string | null;
  variant?: ProfileImageVariant;
  size?: ProfileImageSize;
  responsiveSize?: ResponsiveSize;
  responsiveSpec?: ResponsiveSpec;
  radius?: ProfileImageRadius;

  editable?: boolean;
  showEditButton?: boolean;
  clickToEdit?: boolean;

  showBorder?: boolean;

  enableApi?: boolean;

  /** variant='team'에서 그룹 이미지 PATCH에 필요한 groupId */
  teamGroupId?: number;

  /** 업로드/패치 실패 시 상위에서 처리 (토스트 등) */
  onError?: (error: unknown, ctx: { stage: ErrorStage }) => void;

  /** 업로드 + PATCH 공용 인증 헤더(권장) */
  authHeaders?: HeadersInit;

  /** (하위 호환) 업로드 전용 헤더 */
  uploadHeaders?: HeadersInit;

  priority?: boolean;
  alt?: string;
  className?: string;
};

const BORDER_WIDTH = 2;

const SIZE_PRESET: Record<ProfileImageSize, SizeSpec> = {
  xl: { box: 112, image: 100 },
  lg: { box: 78, image: 64 },
  md: { box: 40, image: 32 },
  sm: { box: 32, image: 24 },
  xs: { box: 24, image: 16 },
};

const BP_ORDER: Breakpoint[] = ['base', 'sm', 'md', 'lg', 'xl'];

const BORDER_BY_SIZE: Record<ProfileImageSize, number> = {
  xl: BORDER_WIDTH,
  lg: BORDER_WIDTH,
  md: 0,
  sm: 0,
  xs: 0,
};

function getDefaultResponsiveSize(
  baseSize: ProfileImageSize,
): Record<Breakpoint, ProfileImageSize> {
  if (baseSize === 'xl') return { base: 'lg', sm: 'lg', md: 'xl', lg: 'xl', xl: 'xl' };
  return { base: baseSize, sm: baseSize, md: baseSize, lg: baseSize, xl: baseSize };
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
    for (const bp of BP_ORDER) result[bp] = BORDER_WIDTH;
    return result as Record<Breakpoint, number>;
  }

  for (const bp of BP_ORDER) {
    if (responsiveSpec?.[bp]) {
      result[bp] = bp === 'lg' || bp === 'xl' ? BORDER_WIDTH : 0;
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
  teamGroupId,
  onError,
  authHeaders,
  uploadHeaders,
  priority = false,
  alt = 'profile image',
  className,
}: ProfileImageProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [erroredSrc, setErroredSrc] = useState<string | null>(null);

  // blob url 정리
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

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (!editable || !shouldClickToEdit) return;
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleEditClick();
      }
    },
    [editable, shouldClickToEdit, handleEditClick],
  );

  const mergedUploadHeaders = useMemo<HeadersInit | undefined>(() => {
    if (!authHeaders && !uploadHeaders) return undefined;

    const h = new Headers();

    if (authHeaders) {
      const a = new Headers(authHeaders);
      a.forEach((v, k) => h.set(k, v));
    }
    if (uploadHeaders) {
      const u = new Headers(uploadHeaders);
      u.forEach((v, k) => h.set(k, v));
    }

    return h;
  }, [authHeaders, uploadHeaders]);

  const uploadImage = useCallback(
    async (file: File) => {
      if (!BASE_URL) throw new Error('NEXT_PUBLIC_API_BASE_URL is missing');

      const formData = new FormData();
      formData.append('image', file);

      const res = await fetch(`${BASE_URL}/${TEAM_ID}/images/upload`, {
        method: 'POST',
        body: formData,
        headers: mergedUploadHeaders,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`upload failed ${res.status}: ${text}`);
      }

      const data = (await res.json()) as { url: string };
      return data.url;
    },
    [mergedUploadHeaders],
  );

  const patchProfileImage = useCallback(
    async (url: string) => {
      const res = await fetchApi('/user', {
        method: 'PATCH',
        body: JSON.stringify({ image: url }),
        headers: authHeaders,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`patch profile failed ${res.status}: ${text}`);
      }
    },
    [authHeaders],
  );

  const patchTeamImage = useCallback(
    async (url: string, groupId: number) => {
      const res = await fetchApi(`/groups/${groupId}`, {
        method: 'PATCH',
        body: JSON.stringify({ image: url }),
        headers: authHeaders,
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`patch team failed ${res.status}: ${text}`);
      }
    },
    [authHeaders],
  );

  const handleFileChange = useCallback(
    async (e: ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;

      setErroredSrc(null);

      const prevPreview = previewUrl;

      // local preview
      const localUrl = URL.createObjectURL(file);
      setPreviewUrl((prev) => {
        if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
        return localUrl;
      });

      if (enableApi) {
        try {
          const url = await uploadImage(file);

          if (variant === 'team') {
            if (!teamGroupId) {
              throw new Error('teamGroupId is required when variant="team" and enableApi=true');
            }
            await patchTeamImage(url, teamGroupId);
          } else {
            await patchProfileImage(url);
          }

          // 서버 url로 교체
          setPreviewUrl((prev) => {
            if (prev?.startsWith('blob:')) URL.revokeObjectURL(prev);
            return url;
          });
        } catch (err) {
          // 실패 시 사용자가 "바뀐 줄" 착각하지 않게 되돌림
          setPreviewUrl(prevPreview ?? null);

          const stage: ErrorStage =
            err instanceof Error && err.message.includes('upload failed')
              ? 'upload'
              : variant === 'team'
                ? 'patch-team'
                : 'patch-profile';

          onError?.(err, { stage });
          console.error(err);
        }
      }

      e.target.value = '';
    },
    [
      enableApi,
      uploadImage,
      patchProfileImage,
      patchTeamImage,
      variant,
      teamGroupId,
      onError,
      previewUrl,
    ],
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
          <div className={`${styles.mask} ${styles[radius]}`}>
            <div
              className={`${styles.avatar} ${styles[radius]} ${hasBorder ? styles.avatarBorder : ''} ${
                editable && shouldClickToEdit ? styles.clickable : ''
              }`}
              onClick={handleAvatarClick}
              onKeyDown={handleKeyDown}
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
