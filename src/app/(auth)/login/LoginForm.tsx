'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/input';
import { PasswordInput } from '@/components/input';
import BaseButton from '@/components/Button/base/BaseButton';
import ResetPassword from '@/components/Modal/domain/components/ResetPassword/ResetPassword';
import LinkPassToast from '@/components/toast/LinkPassToast';
import kakaotalkButton from '@/assets/buttons/kakao/kakaotalkButton.svg';
import { loginSchema, type LoginFormValues } from './schema';
import styles from './LoginForm.module.css';

export default function LoginForm() {
  const router = useRouter();

  const [isResetModalOpen, setIsResetModalOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [isToastOpen, setIsToastOpen] = useState(false);
  // 임시: autoDismissMs를 매우 크게 줘서 사라지지 않게 함

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: LoginFormValues) => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorMessage = '이메일 혹은 비밀번호를 확인해주세요.';
        setError('email', { message: errorMessage });
        setError('password', { message: errorMessage });
        return;
      }

      // 로그인 API는 teamId(프로젝트 식별자 문자열)만 반환하므로
      // 실제 그룹 페이지 경로에 필요한 숫자 groupId를 얻기 위해
      // 유저 정보를 한 번 더 조회한다
      const userRes = await fetch('/api/proxy/user');
      if (userRes.ok) {
        const userData = await userRes.json();
        const groupId = userData?.memberships?.[0]?.group?.id;
        router.push(groupId !== undefined ? `/${groupId}` : '/addteam');
      } else {
        router.push('/addteam');
      }
      router.refresh();
    } catch {
      setError('email', { message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
  };

  const handleResetPasswordSubmit = async () => {
    try {
      await fetch('/api/auth/send-reset-password-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resetEmail }),
      });
    } finally {
      // API 성공/실패 여부와 관계없이 모달 닫고 토스트 표시
      // 보안상 이메일 존재 여부를 노출하지 않는 설계 (email enumeration attack 방어)
      setIsResetModalOpen(false);
      setResetEmail('');
      setIsToastOpen(true);
    }
  };

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
        <div className={styles.fields}>
          <div className={styles.fieldGroup}>
            <label htmlFor="login-email" className={styles.label}>
              이메일
            </label>
            <Input
              id="login-email"
              type="email"
              placeholder="이메일을 입력해주세요."
              errorMessage={errors.email?.message}
              {...register('email')}
            />
          </div>

          <div className={styles.fieldGroup}>
            <label htmlFor="login-password" className={styles.label}>
              비밀번호
            </label>
            <PasswordInput
              id="login-password"
              placeholder="비밀번호를 입력해주세요."
              errorMessage={errors.password?.message}
              {...register('password')}
            />
            <button
              type="button"
              className={styles.forgotButton}
              onClick={() => setIsResetModalOpen(true)}
            >
              비밀번호를 잊으셨나요?
            </button>
          </div>
        </div>

        <div className={styles.actions}>
          <BaseButton type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? '로그인 중...' : '로그인'}
          </BaseButton>

          <p className={styles.signupPrompt}>
            <span className={styles.promptText}>아직 계정이 없으신가요?</span>
            <Link href="/signup" className={styles.signupLink}>
              가입하기
            </Link>
          </p>
        </div>

        <div className={styles.divider}>
          <span className={styles.dividerLine} />
          <span className={styles.dividerText}>OR</span>
          <span className={styles.dividerLine} />
        </div>

        <div className={styles.social}>
          <span className={styles.socialLabel}>간편 로그인하기</span>
          <button
            type="button"
            className={styles.kakaoButton}
            aria-label="카카오톡으로 로그인"
            onClick={() => {
              window.location.href = '/api/auth/kakao';
            }}
          >
            <Image src={kakaotalkButton} alt="카카오톡 로그인" width={42} height={42} />
          </button>
        </div>
      </form>

      <ResetPassword
        isOpen={isResetModalOpen}
        onClose={() => {
          setIsResetModalOpen(false);
          setResetEmail('');
        }}
        onSubmit={handleResetPasswordSubmit}
        input={{
          email: {
            value: resetEmail,
            onChange: (e) => setResetEmail(e.target.value),
          },
        }}
      />

      {/* 비밀번호 재설정 이메일 전송 완료 토스트 */}
      <LinkPassToast isOpen={isToastOpen} onDismiss={() => setIsToastOpen(false)} />
    </>
  );
}
