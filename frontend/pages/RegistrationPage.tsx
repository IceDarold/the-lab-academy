import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import SocialLoginButton from '../components/SocialLoginButton';
import Modal from '../components/Modal';
import { useAuth } from '@/src/contexts/AuthContext.tsx';
import { RegisterSchema, RegisterData } from '@/src/lib/validators/auth.ts';

const RegistrationPage = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const [emailExistsError, setEmailExistsError] = useState<string | null>(null);
  const [showConfirmationModal, setShowConfirmationModal] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register: registerUser, checkEmail } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    watch,
  } = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),
  });

  const { onChange: emailOnChange, ...emailRest } = register('email');

  React.useEffect(() => {
  }, [errors]);

  const onSubmit = async (data: RegisterData) => {
    if (emailExistsError) {
      return;
    }
    setApiError(null);
    try {
      const result = await registerUser(data.fullName, data.email, data.password);
      if (result.status === 'pending_confirmation') {
        setShowConfirmationModal(true);
      }
      // For authenticated, redirect is handled in AuthContext
    } catch (err) {
      setApiError((err as Error).message);
    }
  };

  const handleEmailBlur = async (e: React.FocusEvent<HTMLInputElement>) => {
    const email = e.target.value;
    if (email) {
      try {
        const exists = await checkEmail(email);
        if (exists) {
          setEmailExistsError('This email is already registered');
        } else {
          setEmailExistsError(null);
        }
      } catch (error) {
        // If error, assume not exists to allow registration
        setEmailExistsError(null);
      }
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (emailExistsError) {
      setEmailExistsError(null);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Placeholder for terms/privacy links
  };

  return (
    <div className="max-w-md w-full">
        <div>
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Create your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <a href="#/login" onClick={(e) => { e.preventDefault(); window.location.hash = '#/login'; }} className="font-medium text-indigo-600 hover:text-indigo-500">
                sign in to your existing account
            </a>
            </p>
        </div>
        <div className="mt-8">
            <Card>
                <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                    <div>
                        <label htmlFor="full-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Full Name
                        </label>
                        <div className="mt-1">
                            <Input
                                id="full-name"
                                type="text"
                                autoComplete="name"
                                placeholder="Ada Lovelace"
                                {...register('fullName')}
                                value={watch('fullName') || ''}
                                error={errors.fullName?.message}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="email-address" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Email address
                        </label>
                        <div className="mt-1">
                            <Input
                                id="email-address"
                                type="email"
                                autoComplete="email"
                                placeholder="you@example.com"
                                {...emailRest}
                                value={watch('email') || ''}
                                onBlur={handleEmailBlur}
                                onChange={(e) => {
                                  emailOnChange(e);
                                  handleEmailChange(e);
                                }}
                                error={errors.email?.message || emailExistsError}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                            Password
                        </label>
                        <div className="mt-1">
                            <Input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="••••••••"
                                {...register('password')}
                                value={watch('password') || ''}
                                error={errors.password?.message}
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className="flex items-center">
                        <input
                            id="show-password"
                            name="show-password"
                            type="checkbox"
                            checked={showPassword}
                            onChange={(e) => setShowPassword(e.target.checked)}
                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                            disabled={isSubmitting}
                        />
                        <label htmlFor="show-password" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                            Show password
                        </label>
                    </div>

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                type="checkbox"
                                {...register('terms')}
                                checked={watch('terms') || false}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className="ml-3 text-sm">
                            <label htmlFor="terms" className="font-medium text-gray-700 dark:text-gray-300">
                                I agree to the{' '}
                                <a href="#" onClick={handleLinkClick} className="text-indigo-600 hover:text-indigo-500">
                                Terms
                                </a>{' '}
                                and{' '}
                                <a href="#" onClick={handleLinkClick} className="text-indigo-600 hover:text-indigo-500">
                                Privacy Policy
                                </a>
                            </label>
                             {errors.terms && (
                                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                                    {errors.terms.message}
                                </p>
                            )}
                        </div>
                    </div>

                    {apiError && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-md">
                            <p className="text-sm text-red-700 dark:text-red-300 text-center font-medium">
                                {apiError}
                            </p>
                        </div>
                    )}

                    <div>
                        <Button type="submit" variant="primary" className="w-full" loading={isSubmitting}>
                            Create account
                        </Button>
                    </div>
                </form>

                <div className="mt-6">
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-gray-300 dark:border-gray-600" />
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                            OR
                            </span>
                        </div>
                    </div>

                    <div className="mt-6 grid grid-cols-1 gap-3">
                       <SocialLoginButton provider="google">
                            Sign up with Google
                        </SocialLoginButton>
                        <SocialLoginButton provider="github">
                            Sign up with GitHub
                        </SocialLoginButton>
                    </div>
                </div>
            </Card>
        </div>
        <Modal isOpen={showConfirmationModal} onClose={() => setShowConfirmationModal(false)}>
            <div className="text-center">
                <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-indigo-100 dark:bg-indigo-900 mb-4">
                    <svg className="h-6 w-6 text-indigo-600 dark:text-indigo-400" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                </div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                    Email Confirmation
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                    Please confirm your email to complete registration. Check your email and follow the instructions in the message.
                </p>
                <Button variant="primary" onClick={() => setShowConfirmationModal(false)}>
                    OK
                </Button>
            </div>
        </Modal>
    </div>
  );
};

export default RegistrationPage;
