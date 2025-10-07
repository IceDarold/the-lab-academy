import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import SocialLoginButton from '../components/SocialLoginButton';
import { useAuth } from '../contexts/AuthContext';
import { RegisterSchema, RegisterData } from '../lib/validators/auth';

const RegistrationPage = () => {
  const [apiError, setApiError] = useState<string | null>(null);
  const { register: registerUser } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterData>({
    resolver: zodResolver(RegisterSchema),
  });

  const onSubmit = async (data: RegisterData) => {
    setApiError(null);
    try {
      await registerUser(data.fullName, data.email, data.password);
      // Redirect is handled within the register function in AuthContext
    } catch (err) {
      setApiError((err as Error).message);
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
                    <Input
                        id="full-name"
                        label="Full Name"
                        type="text"
                        autoComplete="name"
                        placeholder="Ada Lovelace"
                        {...register('fullName')}
                        // FIX: Cast message to string to resolve TypeScript type mismatch from react-hook-form.
                        error={errors.fullName?.message as string}
                        disabled={isSubmitting}
                    />
                    <Input
                        id="email-address"
                        label="Email address"
                        type="email"
                        autoComplete="email"
                        placeholder="you@example.com"
                        {...register('email')}
                        // FIX: Cast message to string to resolve TypeScript type mismatch from react-hook-form.
                        error={errors.email?.message as string}
                        disabled={isSubmitting}
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        autoComplete="new-password"
                        placeholder="••••••••"
                        {...register('password')}
                        // FIX: Cast message to string to resolve TypeScript type mismatch from react-hook-form.
                        error={errors.password?.message as string}
                        disabled={isSubmitting}
                    />

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                type="checkbox"
                                {...register('terms')}
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
                                    {/* FIX: Cast message to string to render it as a valid ReactNode. */}
                                    {errors.terms.message as string}
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
    </div>
  );
};

export default RegistrationPage;