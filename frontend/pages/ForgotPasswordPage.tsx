import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import { forgotPassword } from '../services/auth.service';
import { ForgotPasswordSchema, ForgotPasswordData } from '@/src/lib/validators/auth';

const ForgotPasswordPage = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordData>({
    resolver: zodResolver(ForgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordData) => {
    setApiError(null);
    try {
      await forgotPassword(data.email);
      setSuccess(true);
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  if (success) {
    return (
      <div className="max-w-md w-full">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Check your email
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            We've sent a password reset link to your email address.
          </p>
        </div>
        <div className="mt-8">
          <Card>
            <div className="text-center">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                If you don't see the email, check your spam folder.
              </p>
              <a
                href="#/login"
                className="mt-4 inline-block text-indigo-600 hover:text-indigo-500"
              >
                Back to sign in
              </a>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-md w-full">
      <div>
        <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
          Forgot your password?
        </h2>
        <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
          Enter your email address and we'll send you a link to reset your password.
        </p>
      </div>
      <div className="mt-8">
        <Card>
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <Input
              id="email-address"
              label="Email address"
              type="email"
              autoComplete="email"
              placeholder="test@example.com"
              {...register('email')}
              error={errors.email?.message}
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
                Send reset link
              </Button>
            </div>
          </form>

          <div className="mt-6 text-center">
            <a href="#/login" className="text-sm text-indigo-600 hover:text-indigo-500">
              Back to sign in
            </a>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
