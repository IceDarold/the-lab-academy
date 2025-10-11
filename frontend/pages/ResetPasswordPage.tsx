import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { resetPassword } from '../services/auth.service';
import { ResetPasswordSchema, ResetPasswordData } from '@/src/lib/validators/auth';
import toast from 'react-hot-toast';

const ResetPasswordPage = () => {
  const [token, setToken] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const hash = window.location.hash;
    const urlParams = new URLSearchParams(hash.split('?')[1]);
    const tokenParam = urlParams.get('token');
    if (tokenParam) {
      setToken(tokenParam);
    } else {
      setApiError('Invalid reset link. Please request a new password reset.');
    }
  }, []);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<Omit<ResetPasswordData, 'token'>>({
    resolver: zodResolver(ResetPasswordSchema.omit({ token: true })),
  });

  const onSubmit = async (data: { newPassword: string; confirmPassword: string }) => {
    if (!token) return;
    setApiError(null);
    try {
      await resetPassword(token, data.newPassword);
      setSuccess(true);
      toast.success('Password reset successfully!');
      setTimeout(() => {
        window.location.hash = '#/login';
      }, 2000);
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  if (!token && !apiError) {
    return <div>Loading...</div>;
  }

  if (apiError && !token) {
    return (
      <div className="max-w-md w-full mx-auto mt-8">
        <Card>
          <div className="text-center">
            <p className="text-red-600 dark:text-red-400">{apiError}</p>
            <a href="#/forgot-password" className="text-indigo-600 hover:text-indigo-500">
              Request new reset link
            </a>
          </div>
        </Card>
      </div>
    );
  }

  if (success) {
    return (
      <div className="max-w-md w-full mx-auto mt-8">
        <Card>
          <div className="text-center">
            <p className="text-green-600 dark:text-green-400">Password reset successfully!</p>
            <p className="text-sm text-gray-600 dark:text-gray-400">Redirecting to login...</p>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      <div>
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          Reset your password
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your new password below.
        </p>
      </div>
      <div className="mt-8">
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="new-password"
              label="New password"
              type="password"
              autoComplete="new-password"
              placeholder="Enter new password"
              {...register('newPassword')}
              error={errors.newPassword?.message}
              disabled={isSubmitting}
            />
            <Input
              id="confirm-password"
              label="Confirm new password"
              type="password"
              autoComplete="new-password"
              placeholder="Confirm new password"
              {...register('confirmPassword')}
              error={errors.confirmPassword?.message}
              disabled={isSubmitting}
            />

            {apiError && (
              <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-md">
                <p className="text-sm text-red-700 dark:text-red-300 text-center font-medium">
                  {apiError}
                </p>
              </div>
            )}

            <div>
              <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                Reset password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default ResetPasswordPage;
