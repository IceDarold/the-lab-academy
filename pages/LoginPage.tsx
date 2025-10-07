import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import SocialLoginButton from '../components/SocialLoginButton';
import { useAuth } from '../contexts/AuthContext';
import { LoginSchema, LoginData } from '../lib/validators/auth';

const LoginPage = () => {
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const { login } = useAuth();

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginData>({
    resolver: zodResolver(LoginSchema),
  });

  const onSubmit = async (data: LoginData) => {
    setApiError(null);
    try {
        await login(data.email, data.password);
        // Redirect is handled within the login function in AuthContext
    } catch (err) {
        setApiError((err as Error).message);
    }
  };

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    // Placeholder for forgot password link
  };

  return (
    <div className="max-w-md w-full">
        <div>
            <h2 className="text-center text-3xl font-bold text-gray-900 dark:text-gray-100">
            Sign in to your account
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Or{' '}
            <a href="#/register" onClick={(e) => { e.preventDefault(); window.location.hash = '#/register'; }} className="font-medium text-indigo-600 hover:text-indigo-500">
                create an account
            </a>
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
                        // FIX: Cast message to string to resolve TypeScript type mismatch from react-hook-form.
                        error={errors.email?.message as string}
                        disabled={isSubmitting}
                    />
                    <Input
                        id="password"
                        label="Password"
                        type={showPassword ? "text" : "password"}
                        autoComplete="current-password"
                        placeholder="password"
                        {...register('password')}
                        // FIX: Cast message to string to resolve TypeScript type mismatch from react-hook-form.
                        error={errors.password?.message as string}
                        disabled={isSubmitting}
                                        />

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

                    <div className="flex items-center justify-between"></search>
</search_and_replace>
                        <div className="flex items-center">
                            <input
                                id="remember-me"
                                name="remember-me"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRememberMe(e.target.checked)}
                                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                disabled={isSubmitting}
                            />
                            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900 dark:text-gray-300">
                                Remember me
                            </label>
                        </div>

                        <div className="text-sm">
                            <a href="#" onClick={handleLinkClick} className="font-medium text-indigo-600 hover:text-indigo-500">
                                Forgot your password?
                            </a>
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
                            Sign in
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
                            Sign in with Google
                        </SocialLoginButton>
                        <SocialLoginButton provider="github">
                            Sign in with GitHub
                        </SocialLoginButton>
                    </div>
                </div>
            </Card>
        </div>
    </div>
  );
};

export default LoginPage;