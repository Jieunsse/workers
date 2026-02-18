import { fetchApi } from '../fetchApi';
import { BASE_URL, TEAM_ID } from '../config';
import type {
  UserResponse,
  UpdateUserRequest,
  UpdateUserResponse,
  ChangePasswordRequest,
  ChangePasswordResponse,
  ImageUploadResponse,
} from './types';

/** 현재 유저 정보 조회 */
export async function getUser(): Promise<UserResponse> {
  const response = await fetchApi('/user');

  if (!response.ok) {
    throw new Error('유저 정보를 불러오는데 실패했습니다.');
  }

  return response.json();
}

/** 유저 정보 수정 */
export async function updateUser(data: UpdateUserRequest): Promise<UpdateUserResponse> {
  const response = await fetchApi('/user', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('유저 정보 수정에 실패했습니다.');
  }

  return response.json();
}

/** 회원 탈퇴 */
export async function deleteUser(): Promise<void> {
  const response = await fetchApi('/user', {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error('회원 탈퇴에 실패했습니다.');
  }
}

/** 비밀번호 변경 */
export async function changePassword(data: ChangePasswordRequest): Promise<ChangePasswordResponse> {
  const response = await fetchApi('/user/password', {
    method: 'PATCH',
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error('비밀번호 변경에 실패했습니다.');
  }

  return response.json();
}

/** 이미지 업로드 */
export async function uploadImage(file: File): Promise<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const response = await fetch(`${BASE_URL}/${TEAM_ID}/images/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    throw new Error('이미지 업로드에 실패했습니다.');
  }

  return response.json();
}
