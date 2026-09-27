'use client';

import { ResetPasswordForm } from '@/components/auth/reset-password-form';
import { useSearchParams } from 'next/navigation';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  if (!token) {
    return (
      <div className='bg-gradient-to-b from-primary/20 via-background to-primary/20 flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
        <div className='w-full max-w-sm md:max-w-4xl'>
          <div className='bg-card rounded-lg p-6 md:p-8 text-center'>
            <h1 className='text-2xl font-bold mb-4'>Lỗi</h1>
            <p className='text-muted-foreground mb-4'>
              Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn.
            </p>
            <a
              href='/auth/forgot-password'
              className='font-medium text-primary hover:underline'
            >
              Yêu cầu link đặt lại mật khẩu mới
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='bg-gradient-to-b from-primary/20 via-background to-primary/20 flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
      <div className='w-full max-w-sm md:max-w-4xl'>
        <ResetPasswordForm token={token} />
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className='bg-gradient-to-b from-primary/20 via-background to-primary/20 flex min-h-svh flex-col items-center justify-center p-6 md:p-10'>
        <div className='w-full max-w-sm md:max-w-4xl'>
          <div className='bg-card rounded-lg p-6 md:p-8 text-center'>
            <p className='text-muted-foreground'>Đang tải...</p>
          </div>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  )
}
