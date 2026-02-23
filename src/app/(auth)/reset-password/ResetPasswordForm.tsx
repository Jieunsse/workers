'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter, useSearchParams } from 'next/navigation';
import { PasswordInput } from '@/components/input';
import BaseButton from '@/components/Button/base/BaseButton';
import { resetPasswordSchema, type ResetPasswordFormValues } from './schema';
import styles from './ResetPasswordForm.module.css';

export default function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token') ?? '';

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    mode: 'onBlur',
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    if (!token) {
      setError('root', {
        message: '유효하지 않은 링크입니다. 비밀번호 재설정 이메일을 다시 요청해주세요.',
      });
      return;
    }

    try {
      const response = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          password: data.password,
          passwordConfirmation: data.passwordConfirmation,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const message = errorData?.message ?? '비밀번호 재설정에 실패했습니다. 다시 시도해주세요.';
        setError('root', { message });
        return;
      }

      // 명세: 재설정 완료 후 로그인 페이지로 이동
      router.push('/login');
    } catch {
      setError('root', { message: '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해주세요.' });
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className={styles.form} noValidate>
      <div className={styles.fields}>
        <div className={styles.fieldGroup}>
          <label htmlFor="reset-password" className={styles.label}>
            새 비밀번호
          </label>
          <PasswordInput
            id="reset-password"
            placeholder="새 비밀번호를 입력해주세요."
            errorMessage={errors.password?.message}
            {...register('password')}
          />
        </div>

        <div className={styles.fieldGroup}>
          <label htmlFor="reset-password-confirm" className={styles.label}>
            새 비밀번호 확인
          </label>
          <PasswordInput
            id="reset-password-confirm"
            placeholder="새 비밀번호를 다시 입력해주세요."
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

      <BaseButton type="submit" variant="primary" disabled={isSubmitting || !token}>
        {isSubmitting ? '변경 중...' : '변경하기'}
      </BaseButton>
    </form>
  );
}
