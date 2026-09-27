'use client';

import { useForgotPassword } from '@/hooks/user-auth';
import { useMemo } from 'react';
import * as z from 'zod';
import { ForgotPasswordDto } from '@/types/api.types';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { cn } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/card';
import {
  Field,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  const forgotPasswordMutation = useForgotPassword({
    success:
      'Email đặt lại mật khẩu đã được gửi! Vui lòng kiểm tra hộp thư của bạn.',
    error: 'Gửi email đặt lại mật khẩu thất bại',
  });

  const forgotPasswordSchema = useMemo(
    () =>
      z.object({
        email: z.string().email('Email không hợp lệ'),
      }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordDto>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: '' },
  });

  const onSubmit = async (data: ForgotPasswordDto) => {
    await forgotPasswordMutation.mutateAsync(data);
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden'>
        <CardContent className='p-6 md:p-8'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-2xl font-bold'>Quên mật khẩu</h1>
                <p className='text-muted-foreground text-balance'>
                  Nhập email của bạn để nhận link đặt lại mật khẩu
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor='email'>Email</FieldLabel>
                <Input
                  id='email'
                  type='email'
                  placeholder='m@example.com'
                  {...register('email')}
                  disabled={forgotPasswordMutation.isPending}
                />
                {errors.email && (
                  <FieldError>{errors.email.message}</FieldError>
                )}
              </Field>

              <Field>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={forgotPasswordMutation.isPending}
                >
                  {forgotPasswordMutation.isPending
                    ? 'Đang gửi...'
                    : 'Gửi email đặt lại mật khẩu'}
                </Button>
              </Field>

              <FieldDescription className='text-center'>
                Nhớ mật khẩu?{' '}
                <a
                  href='/auth/signin'
                  className='font-medium text-primary hover:underline'
                >
                  Đăng nhập
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
