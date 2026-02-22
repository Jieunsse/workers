'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { getUser, updateUser, deleteUser, changePassword, uploadImage } from '@/shared/apis/user';
import type { UserResponse } from '@/shared/apis/user';

export function useUser() {
  const router = useRouter();

  const [user, setUser] = useState<UserResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 폼 상태
  const [name, setName] = useState('');
  const [originalName, setOriginalName] = useState('');
  const [profileImage, setProfileImage] = useState<string | null>(null);

  const hasChanges = name !== originalName || profileImage !== user?.image;

  // 유저 정보 조회
  useEffect(() => {
    async function fetchUser() {
      try {
        setError(null);
        const data = await getUser();
        setUser(data);
        // 폼 초기화
        setName(data.nickname);
        setOriginalName(data.nickname);
        setProfileImage(data.image);
      } catch (err) {
        console.error('유저 정보 조회 실패:', err);
        setError('유저 정보를 불러오는데 실패했습니다.');
      } finally {
        setIsLoading(false);
      }
    }

    fetchUser();
  }, []);

  // 프로필 수정
  const updateProfile = useCallback(async () => {
    try {
      setError(null);
      await updateUser({
        nickname: name,
        image: profileImage ?? undefined,
      });
      // 수정 성공 후 유저 정보 다시 조회
      const refreshedUser = await getUser();
      setUser(refreshedUser);
      setOriginalName(refreshedUser.nickname);
      return { success: true };
    } catch (err) {
      console.error('프로필 수정 실패:', err);
      setError('프로필 수정에 실패했습니다.');
      return { success: false };
    }
  }, [name, profileImage]);

  // 회원 탈퇴
  const deleteAccount = useCallback(async () => {
    try {
      setError(null);
      await deleteUser();
      router.push('/');
      return { success: true };
    } catch (err) {
      console.error('회원 탈퇴 실패:', err);
      setError('회원 탈퇴에 실패했습니다.');
      return { success: false };
    }
  }, [router]);

  // 비밀번호 변경
  const updatePassword = useCallback(
    async (data: { password: string; passwordConfirmation: string }) => {
      try {
        setError(null);
        await changePassword(data);
        return { success: true };
      } catch (err) {
        console.error('비밀번호 변경 실패:', err);
        setError('비밀번호 변경에 실패했습니다.');
        return { success: false };
      }
    },
    [],
  );

  // 프로필 이미지 업로드
  const uploadProfileImage = useCallback(async (file: File) => {
    try {
      setError(null);
      const { url } = await uploadImage(file);
      return { success: true, url };
    } catch (err) {
      console.error('이미지 업로드 실패:', err);
      setError('이미지 업로드에 실패했습니다.');
      return { success: false, url: null };
    }
  }, []);

  // 팀 목록
  const teams = user?.memberships.map((m) => m.group.name) ?? [];

  return {
    user,
    teams,
    isLoading,
    error,
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
