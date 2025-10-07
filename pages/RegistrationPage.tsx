import React, { useState } from 'react';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import SocialLoginButton from '../components/SocialLoginButton';
import { useAuth } from '../contexts/AuthContext';

const RegistrationPage = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreed) {
        setError("You must agree to the terms and privacy policy.");
        return;
    }
    setError(null);
    setIsLoading(true);
    try {
        await register(name, email, password);
        // Redirect is handled within the register function in AuthContext
    } catch (err) {
        setError((err as Error).message);
    } finally {
        setIsLoading(false);
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
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <Input
                        id="full-name"
                        label="Full Name"
                        type="text"
                        name="name"
                        autoComplete="name"
                        required
                        placeholder="Ada Lovelace"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={isLoading}
                    />
                    <Input
                        id="email-address"
                        label="Email address"
                        type="email"
                        name="email"
                        autoComplete="email"
                        required
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                    />
                    <Input
                        id="password"
                        label="Password"
                        type="password"
                        name="password"
                        autoComplete="new-password"
                        required
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                    />

                    <div className="flex items-start">
                        <div className="flex items-center h-5">
                            <input
                                id="terms"
                                name="terms"
                                type="checkbox"
                                checked={agreed}
                                onChange={(e) => setAgreed(e.target.checked)}
                                className="focus:ring-indigo-500 h-4 w-4 text-indigo-600 border-gray-300 rounded"
                                disabled={isLoading}
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
                        </div>
                    </div>

                    {error && (
                        <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-400 dark:border-red-600 rounded-md">
                            <p className="text-sm text-red-700 dark:text-red-300 text-center font-medium">
                                {error}
                            </p>
                        </div>
                    )}

                    <div>
                        <Button type="submit" variant="primary" className="w-full" loading={isLoading}>
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