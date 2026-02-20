import { ComponentPropsWithoutRef, ReactNode, Ref } from 'react';

export type InputProps = ComponentPropsWithoutRef<'input'> & {
  /** 입력 필드 하단에 표시할 에러 메시지 */
  errorMessage?: string;
  /** 에러 스타일 적용 여부 (errorMessage 없이 테두리만 빨갛게 할 때 사용) */
  isError?: boolean;
};

export type PasswordInputProps = Omit<ComponentPropsWithoutRef<'input'>, 'type'> & {
  /** 입력 필드 하단에 표시할 에러 메시지 */
  errorMessage?: string;
};

export type TextAreaProps = ComponentPropsWithoutRef<'textarea'> & {
  /** textarea DOM 참조 */
  ref?: Ref<HTMLTextAreaElement>;
};

export type ActionTextAreaProps = TextAreaProps & {
  /** 엔터 키 또는 제출 버튼 클릭 시 호출되는 콜백 */
  onSubmit?: () => void;
  /** 외부 래퍼 div에 적용할 추가 CSS 클래스 */
  wrapperClassName?: string;
};

export type CommentInputProps = Omit<ActionTextAreaProps, 'wrapperClassName'> & {
  /** 입력 필드 왼쪽에 표시할 프로필 이미지 */
  profileImage?: ReactNode;
};

export type AccountInputProps = {
  /** 표시할 이메일 주소 (읽기 전용) */
  email?: string;
  /** 우측에 주입할 버튼 등 (예: 변경하기 버튼) */
  children?: ReactNode;
};

export type ChangePasswordProps = {
  /** 비밀번호 수정 모드 활성화 여부 */
  isEditing?: boolean;
  /** 새 비밀번호 입력 필드에 전달할 props */
  newPasswordProps?: PasswordInputProps;
  /** 비밀번호 확인 입력 필드에 전달할 props */
  confirmPasswordProps?: PasswordInputProps;
  /** 하단에 주입할 버튼 등 (예: 변경하기 버튼) */
  children?: ReactNode;
};
