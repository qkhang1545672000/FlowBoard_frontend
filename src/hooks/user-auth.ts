import { authService } from '@/services/auth.services';
import {
  ForgotPasswordDto,
  ResetPasswordDto,
  SignInDto,
  SignUpDto,
} from '@/types/api.types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

type AuthToastMessages = {
  success?: string;
  error?: string;
};

export const useSignUp = (
  messages?: AuthToastMessages & { verifyEmail?: string },
) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignUpDto) => authService.signUp(data),

    onSuccess: (response) => {
      queryClient.setQueriesData(
        { queryKey: ['auth', 'session'] },
        {
          user: response.user,
          isGuest: false,
          isAuthenticated: true,
        },
      );

      if (response.token) {
        toast.success(messages?.success ?? 'Account created successfully!');

        router.push('/product/catalog');
        return;
      }

      toast.info(
        messages?.verifyEmail ??
          messages?.success ??
          'Account created! Please check your email to verify your account.',
      );

      router.push('/auth/signin');
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === 'string'
          ? message
          : (messages?.error ?? 'Sign up failed'),
      );
    },
  });
};

export const useResendVerificationEmail = (messages?: AuthToastMessages) => {
  return useMutation({
    mutationFn: (email: string) => authService.resendVerificationEmail(email),

    onSuccess: () => {
      toast.success(
        messages?.success ??
          'Verification email sent! Please check your inbox.',
      );
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === 'string'
          ? message
          : (messages?.error ?? 'Failed to send verification email'),
      );
    },
  });
};

export const useSignIn = (
  messages?: AuthToastMessages,
  redirectTo?: string,
) => {
  const router = useRouter();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: SignInDto & { rememberMe?: boolean }) =>
      authService.signIn(data),

    onSuccess: (response) => {
      queryClient.setQueriesData(
        { queryKey: ['auth', 'session'] },
        {
          user: response.user,
          isGuest: false,
          isAuthenticated: true,
        },
      );

      toast.success(messages?.success ?? 'Sign in successful');

      router.push(redirectTo ?? '/product/catalog');
    },

    onError: (error: unknown) => {
      const message = (
        error as {
          response?: { data?: { message?: string } };
        }
      )?.response?.data?.message;

      toast.error(
        typeof message === 'string'
          ? message
          : (messages?.error ?? 'Sign in failed'),
      );
    },
  });
};

export const useForgotPassword = (messages?: AuthToastMessages) => {
  return useMutation({
    mutationFn: (data: ForgotPasswordDto) => authService.forgotPassword(data),

    onSuccess: () => {
      toast.success(messages?.success ?? 'Password reset email sent!');
    },

    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      toast.error(
        typeof message === 'string'
          ? message
          : (messages?.error ?? 'Failed to send reset email'),
      );
    },
  });
};

export const useResetPassword = (messages?: AuthToastMessages) => {
  const router = useRouter();
  return useMutation({
    mutationFn: (data: ResetPasswordDto) => authService.resetPassword(data),

    onSuccess: () => {
      toast.success(messages?.success ?? 'Password reset successful!');
      router.push('/auth/signin');
    },

    onError: (error: unknown) => {
      const message = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message;

      toast.error(
        typeof message === 'string'
          ? message
          : (messages?.error ?? 'Password reset failed'),
      );
    },
  });
};

export const useGoogleSignIn = (messages?: { error?: string }) => {
  const [isLoading, setIsLoading] = useState(false);

  const signInWithGoogle = async (redirectPath?: string) => {
    try {
      setIsLoading(true);
      await authService.signInWithGoogle(redirectPath);
    } catch (error: unknown) {
      const msg = (error as Error)?.message;
      setIsLoading(false);
      toast.error(
        (messages?.error ?? 'Unable to initialize Google sign in: ') +
          (msg ?? ''),
      );
      return;
    }

    setIsLoading(false);
  };

  return { signInWithGoogle, isLoading };
};
