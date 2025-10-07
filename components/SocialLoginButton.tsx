import React from 'react';

const GoogleIcon = () => (
    <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="google" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 488 512">
        <path fill="currentColor" d="M488 261.8C488 403.3 381.5 512 244 512 111.8 512 0 398.8 0 261.8S111.8 11.6 244 11.6c70.3 0 129.8 28.7 173.4 74.5l-64.8 64.2c-24.1-22.9-58.2-37.1-98.6-37.1-77.5 0-140.5 63.4-140.5 141.6s63 141.6 140.5 141.6c85.6 0 119.2-60.9 123.6-92.8H244v-79.2h236.1c2.3 12.7 3.9 26.9 3.9 41.4z"></path>
    </svg>
);

const GitHubIcon = () => (
    <svg className="w-5 h-5" aria-hidden="true" focusable="false" data-prefix="fab" data-icon="github" role="img" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512">
        <path fill="currentColor" d="M165.9 397.4c0 2-2.3 3.6-5.2 3.6-3.3.3-5.6-1.3-5.6-3.6 0-2 2.3-3.6 5.2-3.6 3.3-.3 5.6 1.3 5.6 3.6zm-31.1-4.5c-.7 2 1.3 4.3 4.3 4.9 2.6 1 5.6 0 6.2-2s-1.3-4.3-4.3-5.2c-2.6-.7-5.5.3-6.2 2.3zm44.2-1.7c-2.9.7-4.9 2.6-4.6 4.9.3 2 2.9 3.3 5.9 2.6 2.9-.7 4.9-2.6 4.6-4.6-.3-1.9-3-3.2-5.9-2.9zM244.8 8C106.1 8 0 113.3 0 252c0 110.9 69.8 205.8 169.5 239.2 12.8 2.3 17.3-5.6 17.3-12.1 0-6.2-.3-40.4-.3-61.4 0 0-70 15-84.7-29.8 0 0-11.4-29.1-27.8-36.6 0 0-22.9-15.7 1.6-15.4 0 0 24.9 2 38.6 25.8 21.9 38.6 58.6 27.5 72.9 20.9 2.3-16 8.8-27.1 16-33.7-55.9-6.2-112.3-27.9-112.3-124.3 0-27.5 10.1-49.9 26.4-67.5-2.6-6.2-11.5-32.2 2.6-66.2 0 0 21.1-6.7 69.2 25.8 20.1-5.6 41.6-8.3 62.2-8.3 20.6 0 42.1 2.8 62.2 8.3 48.1-32.4 69.2-25.8 69.2-25.8 14.1 34 5.2 60 2.6 66.2 16.3 17.6 26.4 40 26.4 67.5 0 96.6-56.4 118-112.3 124.3 9.7 8.3 18.3 24.5 18.3 48.7 0 35.1-.3 63.5-.3 72.2 0 6.5 4.6 14.4 17.3 12.1C428.2 457.8 496 362.9 496 252 496 113.3 389.9 8 244.8 8zM97.2 352.9c-1.3 1-1 3.3.7 5.2 1.6 1.6 3.9 2.3 5.2 1 1.3-1 1-3.3-.7-5.2-1.6-1.6-3.9-2.3-5.2-1zm-10.8-8.1c-.7 1.3.3 2.9 2.3 3.9 1.6 1 3.6.7 4.3-.7.7-1.3-.3-2.9-2.3-3.9-2-.6-3.6-.3-4.3.7zm32.4 35.6c-1.6 1.3-1 4.3 1.3 6.2 2.3 2.3 5.2 2.6 6.5 1 1.3-1.3.7-4.3-1.3-6.2-2.2-2.3-5.2-2.6-6.5-1zm-11.4-14.7c-1.6 1-1.6 3.6 0 5.9 1.6 2.3 4.3 3.3 5.6 2.3 1.6-1.3 1.6-3.9 0-6.2-1.4-2.3-4-3.3-5.6-2z"></path>
    </svg>
);


interface SocialLoginButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'github';
  children: React.ReactNode;
}

const SocialLoginButton: React.FC<SocialLoginButtonProps> = ({ provider, children, ...props }) => {
  const icons = {
    google: <GoogleIcon />,
    github: <GitHubIcon />,
  };

  return (
    <button
      type="button"
      className="w-full inline-flex items-center justify-center py-2.5 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm bg-white dark:bg-gray-800 text-sm font-medium text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors"
      {...props}
    >
      <span className="mr-3">{icons[provider]}</span>
      {children}
    </button>
  );
};

export default SocialLoginButton;
