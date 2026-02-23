import { Suspense } from 'react';
import AuthCard from '@/app/(auth)/_components/AuthCard';
import ResetPasswordForm from './ResetPasswordForm';

export default function ResetPasswordPage() {
  return (
    <AuthCard>
      {/* useSearchParams는 Suspense boundary 필요 */}
      <Suspense>
        <ResetPasswordForm />
      </Suspense>
    </AuthCard>
  );
}
