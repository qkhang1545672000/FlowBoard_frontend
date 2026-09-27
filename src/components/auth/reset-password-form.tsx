'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { useResetPassword } from '@/hooks/user-auth';
import { cn } from '@/lib/utils';
import { zodResolver } from '@hookform/resolvers/zod';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import z from 'zod';

type ResetPasswordFormValues = {
  newPassword: string;
  confirmPassword: string;
};

interface ResetPasswordFormProps extends React.ComponentProps<'div'> {
  token: string;
}

export function ResetPasswordForm({
  className,
  token,
  ...props
}: ResetPasswordFormProps) {
  const resetPasswordMutation = useResetPassword({
    success: 'Đặt lại mật khẩu thành công!',
    error: 'Đặt lại mật khẩu thất bại',
  });

  const resetPasswordSchema = useMemo(
    () =>
      z
        .object({
          newPassword: z
            .string()
            .min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
            .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất một chữ hoa')
            .regex(/[0-9]/, 'Mật khẩu phải có ít nhất một chữ số'),
          confirmPassword: z.string(),
        })
        .refine((data) => data.newPassword === data.confirmPassword, {
          message: 'Mật khẩu không khớp',
          path: ['confirmPassword'],
        }),
    [],
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { newPassword: '', confirmPassword: '' },
  });

  const onSubmit = async (data: ResetPasswordFormValues) => {
    await resetPasswordMutation.mutateAsync({
      token,
      newPassword: data.newPassword,
    });
  };

  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className='overflow-hidden'>
        <CardContent className='p-6 md:p-8'>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FieldGroup>
              <div className='flex flex-col items-center gap-2 text-center'>
                <h1 className='text-2xl font-bold'>Đặt lại mật khẩu</h1>
                <p className='text-muted-foreground text-balance'>
                  Nhập mật khẩu mới cho tài khoản của bạn
                </p>
              </div>

              <Field>
                <FieldLabel htmlFor='newPassword'>Mật khẩu mới</FieldLabel>
                <Input
                  id='newPassword'
                  type='password'
                  placeholder='Nhập mật khẩu mới'
                  {...register('newPassword')}
                  disabled={resetPasswordMutation.isPending}
                />
                {errors.newPassword && (
                  <FieldError>{errors.newPassword.message}</FieldError>
                )}
              </Field>

              <Field>
                <FieldLabel htmlFor='confirmPassword'>
                  Xác nhận mật khẩu
                </FieldLabel>
                <Input
                  id='confirmPassword'
                  type='password'
                  placeholder='Nhập lại mật khẩu mới'
                  {...register('confirmPassword')}
                  disabled={resetPasswordMutation.isPending}
                />
                {errors.confirmPassword && (
                  <FieldError>{errors.confirmPassword.message}</FieldError>
                )}
              </Field>

              <Field>
                <Button
                  type='submit'
                  className='w-full'
                  disabled={resetPasswordMutation.isPending}
                >
                  {resetPasswordMutation.isPending
                    ? 'Đang đặt lại...'
                    : 'Đặt lại mật khẩu'}
                </Button>
              </Field>

              <FieldDescription className='text-center'>
                <a
                  href='/auth/signin'
                  className='font-medium text-primary hover:underline'
                >
                  Quay lại đăng nhập
                </a>
              </FieldDescription>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
