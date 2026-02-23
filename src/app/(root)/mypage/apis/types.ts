/** 그룹 정보 */
export type Group = {
  teamId: string;
  updatedAt: string;
  createdAt: string;
  image: string;
  name: string;
  id: number;
};

/** 멤버십 (유저가 속한 그룹) */
export type Membership = {
  group: Group;
  role: 'ADMIN' | 'MEMBER';
  userImage: string;
  userEmail: string;
  userName: string;
  groupId: number;
  userId: number;
};

/** 유저 정보 응답 */
export type UserResponse = {
  teamId: string;
  image: string;
  nickname: string;
  updatedAt: string;
  createdAt: string;
  email: string;
  id: number;
  memberships: Membership[];
};

/** 유저 정보 수정 요청 */
export type UpdateUserRequest = {
  nickname?: string;
  image?: string;
};

/** 유저 정보 수정 응답 */
export type UpdateUserResponse = {
  message: string;
};

/** 비밀번호 변경 요청 */
export type ChangePasswordRequest = {
  password: string;
  passwordConfirmation: string;
};

/** 비밀번호 변경 응답 */
export type ChangePasswordResponse = {
  message: string;
};

/** 이미지 업로드 응답 */
export type ImageUploadResponse = {
  url: string;
};
