'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { updateUser, deleteUser, changePassword, uploadImage } from '../apis';

export function useUser() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user, isLoading, error: queryError } = useCurrentUser();

  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [prevUserId, setPrevUserId] = useState<number | null>(null);

  // 렌더 시 상태 조정 — user 도착 시 1회 폼 초기화
  if (user && user.id !== prevUserId) {
    setPrevUserId(user.id);
    setName(user.nickname);
    setOriginalName(user.nickname);
    setProfileImage(user.image);
  }

  const hasChanges = name !== originalName || profileImage !== user?.image;

  // 프로필 수정
  const updateProfileMutation = useMutation({
    mutationFn: (body: { nickname?: string; image?: string }) => updateUser(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUser'] });
    },
  });

  const updateProfile = async (overrides?: { nickname?: string; image?: string }) => {
    try {
      setError(null);
      const body: { nickname?: string; image?: string } = {};
      if (overrides) {
        if (overrides.nickname) body.nickname = overrides.nickname;
        if (overrides.image) body.image = overrides.image;
      } else {
        if (name !== originalName) body.nickname = name;
        if (profileImage !== user?.image) body.image = profileImage ?? undefined;
      }
      if (Object.keys(body).length === 0) return { success: true };
      await updateProfileMutation.mutateAsync(body);
      setOriginalName(body.nickname ?? originalName);
      return { success: true };
    } catch {
      setError('프로필 수정에 실패했습니다.');
      return { success: false };
    }
  };

  // 회원 탈퇴
  const deleteAccount = async () => {
    try {
      setError(null);
      await deleteUser();
      await fetch('/api/auth/logout', { method: 'POST' }).catch(() => {});
      queryClient.removeQueries({ queryKey: ['currentUser'] });
      router.push('/');
      return { success: true };
    } catch {
      setError('회원 탈퇴에 실패했습니다.');
      return { success: false };
    }
  };

  // 비밀번호 변경
  const updatePassword = async (data: { password: string; passwordConfirmation: string }) => {
    try {
      setError(null);
      await changePassword(data);
      return { success: true };
    } catch {
      setError('비밀번호 변경에 실패했습니다.');
      return { success: false };
    }
  };

  // 프로필 이미지 업로드
  const uploadProfileImage = async (file: File) => {
    try {
      setError(null);
      const { url } = await uploadImage(file);
      return { success: true, url };
    } catch {
      setError('이미지 업로드에 실패했습니다.');
      return { success: false, url: null };
    }
  };

  // 팀 목록
  const teams = user?.memberships?.map((m) => m.group.name) ?? [];

  return {
    user,
    teams,
    isLoading,
    error: error ?? (queryError ? '유저 정보를 불러오는데 실패했습니다.' : null),
    // 폼 상태
    name,
    setName,
    profileImage,
    setProfileImage,
    hasChanges,
    // 액션
    updateProfile,
    deleteAccount,
    updatePassword,
    uploadProfileImage,
  };
}
