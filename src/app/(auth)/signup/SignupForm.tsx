'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Input } from '@/components/input';
import { PasswordInput } from '@/components/input';
import BaseButton from '@/components/Button/base/BaseButton';
import kakaotalkButton from '@/assets/buttons/kakao/kakaotalkButton.svg';
import { signupSchema, type SignupFormValues } from './schema';
import styles from './SignupForm.module.css';

export default function SignupForm() {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: SignupFormValues) => {
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.message ?? '회원가입에 실패했습니다. 다시 시도해주세요.';
        setError('root', { message });
        return;
      }

      // 신규 가입자는 소속 팀이 없으므로 무조건 팀 생성/참여 페이지로 이동
      router.push('/addteam');
    } catch {
      setError('root', { message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <div className={styles.fields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="signup-nickname" className={styles.label}>
            이름
          </label>
          <Input
            id="signup-nickname"
            type="text"
            placeholder="이름을 입력해주세요."
            errorMessage={errors.nickname?.message}
            {...register('nickname')}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="signup-email" className={styles.label}>
            이메일
          </label>
          <Input
            id="signup-email"
            type="email"
            placeholder="이메일을 입력해주세요."
            errorMessage={errors.email?.message}
            {...register('email')}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="signup-password" className={styles.label}>
            비밀번호
          </label>
          <PasswordInput
            id="signup-password"
            placeholder="비밀번호를 입력해주세요."
            errorMessage={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="signup-password-confirm" className={styles.label}>
            비밀번호 확인
          </label>
          <PasswordInput
            id="signup-password-confirm"
            placeholder="비밀번호를 다시 입력해주세요."
            errorMessage={errors.passwordConfirmation?.message}
            {...register('passwordConfirmation')}
          />
        </div>
      </div>

      {errors.root && (
        <p role="alert" className={styles.rootError}>
          {errors.root.message}
        </p>
      )}

      <div className={styles.actions}>
        <BaseButton type="submit" variant="primary" disabled={isSubmitting}>
          {isSubmitting ? '가입 중...' : '회원가입'}
        </BaseButton>

        <p className={styles.loginPrompt}>
          <span className={styles.promptText}>이미 계정이 있으신가요?</span>
          <Link href="/login" className={styles.loginLink}>
            로그인하기
          </Link>
        </p>
      </div>

      <div className={styles.divider}>
        <span className={styles.dividerLine} />
        <span className={styles.dividerText}>OR</span>
        <span className={styles.dividerLine} />
      </div>

      <div className={styles.social}>
        {/* 회원가입 페이지이므로 "간편 회원가입하기" */}
        <span className={styles.socialLabel}>간편 회원가입하기</span>
        <button
          type="button"
          className={styles.kakaoButton}
          aria-label="카카오톡으로 회원가입"
          onClick={() => {
            window.location.href = '/api/auth/kakao';
          }}
        >
          <Image src={kakaotalkButton} alt="카카오톡 회원가입" width={42} height={42} />
        </button>
      </div>
    </form>
  );
}
