'use client';

import { useState, useRef } from 'react';
import Image from 'next/image';

import { useUser } from './hooks';

import { ProfileImage } from '@/components/profile-img';
import Input from '@/components/input/Input';
import accountInputStyles from '@/components/input/styles/AccountInput.module.css';
import BaseButton from '@/components/Button/base/BaseButton';
import Toast from '@/components/toast/Toast';
import ChangePassword from '@/components/Modal/domain/components/ChangePassword/ChangePassword';
import WarningModal from '@/components/Modal/domain/components/WarningModal/WarningModal';

import outIcon from '@/assets/icons/out/out.svg';

import styles from './page.module.css';

export default function ProfilePage() {
  const {
    user,
    isLoading,
    name,
    setName,
    profileImage,
    setProfileImage,
    hasChanges,
    updateProfile,
    deleteAccount,
    updatePassword,
    uploadProfileImage,
  } = useUser();

  const [showToast, setShowToast] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const newPasswordRef = useRef<HTMLInputElement>(null);
  const confirmPasswordRef = useRef<HTMLInputElement>(null);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setShowToast(true);
  };

  const handleSave = async () => {
    const result = await updateProfile();
    if (result.success) {
      setShowToast(false);
      setSuccessToast('이름이 변경되었습니다.');
    }
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async () => {
    const password = newPasswordRef.current?.value ?? '';
    const passwordConfirmation = confirmPasswordRef.current?.value ?? '';
    if (!password || !passwordConfirmation) return;
    const result = await updatePassword({ password, passwordConfirmation });
    if (result.success) {
      setIsPasswordModalOpen(false);
      if (newPasswordRef.current) newPasswordRef.current.value = '';
      if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
      setSuccessToast('비밀번호가 변경되었습니다.');
    }
  };

  const handleWithdraw = () => {
    setIsWithdrawModalOpen(true);
  };

  const handleWithdrawConfirm = async () => {
    const result = await deleteAccount();
    if (result.success) {
      setIsWithdrawModalOpen(false);
    }
  };

  if (isLoading) {
    return (
      <div className={styles.page}>
        <p>로딩 중...</p>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.cardWrapper}>
        <div className={styles.card}>
          <h1 className={styles.title}>계정 설정</h1>

          <div className={styles.profileImageWrapper}>
            <ProfileImage
              src={profileImage}
              size="xl"
              responsiveSize={{ base: 'lg', sm: 'xl', md: 'xl', lg: 'xl', xl: 'xl' }}
              editable
              showEditButton
              onFileChange={async (file) => {
                const localUrl = URL.createObjectURL(file);
                setProfileImage(localUrl);

                const result = await uploadProfileImage(file);
                if (result.success && result.url) {
                  setProfileImage(result.url);
                  await updateProfile({ image: result.url });
                }
              }}
            />
          </div>

          <form
            className={styles.form}
            onSubmit={(e) => {
              e.preventDefault();
              handleSave();
            }}
          >
            <div className={styles.field}>
              <label htmlFor="profile-name" className={styles.label}>
                이름
              </label>
              <Input
                id="profile-name"
                type="text"
                value={name}
                onChange={handleNameChange}
                placeholder="이름을 입력해 주세요."
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="profile-email" className={styles.label}>
                이메일
              </label>
              <Input
                id="profile-email"
                type="email"
                value={user?.email ?? ''}
                disabled
                className={accountInputStyles.readOnly}
              />
            </div>

            <div className={styles.field}>
              <label htmlFor="profile-password" className={styles.label}>
                비밀번호
              </label>
              <div className={styles.passwordField}>
                <Input
                  id="profile-password"
                  type="password"
                  value="••••••••"
                  disabled
                  className={`${accountInputStyles.readOnly} ${styles.passwordInput}`}
                />
                <div className={styles.changeButton}>
                  <BaseButton size="small" onClick={handleChangePassword}>
                    변경하기
                  </BaseButton>
                </div>
              </div>
            </div>

            <button type="button" className={styles.withdrawButton} onClick={handleWithdraw}>
              <Image src={outIcon} alt="" width={20} height={20} />
              회원 탈퇴하기
            </button>
          </form>
        </div>

        <div className={styles.toastWrapper}>
          {hasChanges && (
            <Toast
              isOpen={showToast}
              message="저장하지 않은 변경사항이 있어요!"
              actionLabel="변경사항 저장하기"
              onAction={handleSave}
              onDismiss={() => setShowToast(false)}
              className={styles.toast}
            />
          )}
          {successToast && (
            <Toast
              isOpen
              message={successToast}
              actionLabel=""
              onDismiss={() => setSuccessToast(null)}
              className={styles.toast}
            />
          )}
        </div>
      </div>

      <ChangePassword
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          if (newPasswordRef.current) newPasswordRef.current.value = '';
          if (confirmPasswordRef.current) confirmPasswordRef.current.value = '';
        }}
        onSubmit={handlePasswordSubmit}
        input={{
          newPassword: {
            ref: newPasswordRef,
          },
          confirmPassword: {
            ref: confirmPasswordRef,
          },
        }}
      />

      <WarningModal
        isOpen={isWithdrawModalOpen}
        onClose={() => setIsWithdrawModalOpen(false)}
        onConfirm={handleWithdrawConfirm}
        text={{
          title: '회원 탈퇴를 진행하시겠어요?',
          description: '그룹장으로 있는 그룹은 자동으로 삭제되고,\n모든 그룹에서 나가집니다.',
          closeLabel: '닫기',
          confirmLabel: '회원 탈퇴',
        }}
      />
    </div>
  );
}
