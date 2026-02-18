'use client';

import { useState } from 'react';
import Image from 'next/image';

import { useUser } from './hooks';

import Sidebar from '@/components/sidebar/Sidebar';
import SidebarButton from '@/components/sidebar/SidebarButton';
import SidebarTeamSelect from '@/components/sidebar/SidebarTeamSelect';
import SidebarAddButton from '@/components/sidebar/SidebarAddButton';
import MobileHeader from '@/components/sidebar/MobileHeader';
import MobileDrawer from '@/components/sidebar/MobileDrawer';
import { ProfileImage } from '@/components/profile-img';
import Input from '@/components/input/Input';
import accountInputStyles from '@/components/input/styles/AccountInput.module.css';
import BaseButton from '@/components/Button/base/BaseButton';
import Toast from '@/components/toast/Toast';
import ChangePassword from '@/components/Modal/domain/components/ChangePassword/ChangePassword';
import WarningModal from '@/components/Modal/domain/components/WarningModal/WarningModal';

import outIcon from '@/assets/icons/out/out.svg';
import chessSmall from '@/assets/icons/chess/chessSmall.svg';
import chessBig from '@/assets/icons/chess/chessBig.svg';
import boardSmall from '@/assets/icons/board/boardSmall.svg';
import boardLarge from '@/assets/icons/board/boardLarge.svg';

import styles from './page.module.css';

export default function ProfilePage() {
  const {
    user,
    teams,
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
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value);
    setShowToast(true);
  };

  const handleSave = async () => {
    const result = await updateProfile();
    if (result.success) {
      setShowToast(false);
    }
  };

  const handleChangePassword = () => {
    setIsPasswordModalOpen(true);
  };

  const handlePasswordSubmit = async () => {
    const result = await updatePassword({
      password: newPassword,
      passwordConfirmation: confirmPassword,
    });
    if (result.success) {
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
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

  const drawerContent = (
    <>
      <SidebarTeamSelect
        icon={<Image src={chessSmall} alt="" width={20} height={20} />}
        label="팀 선택"
        isSelected={false}
      />
      {teams.map((team: string) => (
        <SidebarButton
          key={team}
          icon={<Image src={chessSmall} alt="" width={20} height={20} />}
          label={team}
          isActive={team === teams[0]}
        />
      ))}
      <SidebarAddButton label="팀 추가하기" />
      <hr
        aria-hidden="true"
        style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }}
      />
      <SidebarButton
        icon={<Image src={boardSmall} alt="" width={20} height={20} />}
        label="자유게시판"
      />
    </>
  );

  if (isLoading) {
    return (
      <div className={styles.layout}>
        <div className={styles.main}>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      {/* 모바일 헤더 */}
      <div className={styles.mobileHeader}>
        <MobileHeader
          isLoggedIn
          onMenuClick={() => setIsDrawerOpen(true)}
          onProfileClick={() => {}}
          profileImage={
            user?.image ? (
              <Image src={user.image} alt="" width={32} height={32} style={{ borderRadius: 12 }} />
            ) : (
              <div style={{ width: 32, height: 32, borderRadius: 12, background: '#cbd5e1' }} />
            )
          }
        />
      </div>

      {/* 모바일 드로어 */}
      <MobileDrawer isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)}>
        {drawerContent}
      </MobileDrawer>

      {/* 데스크탑/태블릿 사이드바 */}
      <div className={styles.sidebar}>
        <Sidebar
          teamSelect={(isCollapsed) =>
            !isCollapsed && (
              <SidebarTeamSelect
                icon={<Image src={chessSmall} alt="" width={20} height={20} />}
                label="팀 선택"
                isSelected={false}
              />
            )
          }
          addButton={(isCollapsed) => (
            <>
              {!isCollapsed && <SidebarAddButton label="팀 추가하기" />}
              <hr
                aria-hidden="true"
                style={{ border: 'none', borderTop: '1px solid #e2e8f0', margin: '8px 0' }}
              />
              <SidebarButton
                icon={
                  <Image
                    src={isCollapsed ? boardLarge : boardSmall}
                    alt=""
                    width={isCollapsed ? 24 : 20}
                    height={isCollapsed ? 24 : 20}
                  />
                }
                label="자유게시판"
                iconOnly={isCollapsed}
              />
            </>
          )}
          profileImage={
            user?.image ? (
              <Image src={user.image} alt="" width={40} height={40} style={{ borderRadius: 12 }} />
            ) : (
              <div style={{ width: 40, height: 40, borderRadius: 12, background: '#cbd5e1' }} />
            )
          }
          profileName={user?.nickname ?? ''}
          profileTeam={teams[0] ?? ''}
        >
          {(isCollapsed) =>
            !isCollapsed ? (
              teams.map((team: string) => (
                <SidebarButton
                  key={team}
                  icon={<Image src={chessSmall} alt="" width={20} height={20} />}
                  label={team}
                  isActive={team === teams[0]}
                />
              ))
            ) : (
              <SidebarButton
                icon={<Image src={chessBig} alt="" width={24} height={24} />}
                label={teams[0] ?? ''}
                isActive
                iconOnly
              />
            )
          }
        </Sidebar>
      </div>

      <main className={styles.main}>
        {/* 모바일 타이틀 - 스크린 리더는 카드 내부 제목 사용 */}
        <p className={styles.mobileTitle} aria-hidden="true">
          계정 설정
        </p>

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
                  // 로컬 미리보기
                  const localUrl = URL.createObjectURL(file);
                  setProfileImage(localUrl);

                  // 서버에 업로드
                  const result = await uploadProfileImage(file);
                  if (result.success && result.url) {
                    setProfileImage(result.url);
                    setShowToast(true);
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

          {hasChanges && (
            <div className={styles.toastWrapper}>
              <Toast
                isOpen={showToast}
                message="저장하지 않은 변경사항이 있어요!"
                actionLabel="변경사항 저장하기"
                onAction={handleSave}
                onDismiss={() => setShowToast(false)}
                className={styles.toast}
              />
            </div>
          )}
        </div>
      </main>

      <ChangePassword
        isOpen={isPasswordModalOpen}
        onClose={() => {
          setIsPasswordModalOpen(false);
          setNewPassword('');
          setConfirmPassword('');
        }}
        onSubmit={handlePasswordSubmit}
        input={{
          newPassword: {
            value: newPassword,
            onChange: (e) => setNewPassword(e.target.value),
          },
          confirmPassword: {
            value: confirmPassword,
            onChange: (e) => setConfirmPassword(e.target.value),
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
