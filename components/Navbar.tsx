import React, { useState } from 'react';
import Button from './Button';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const [isProfileMenuOpen, setProfileMenuOpen] = useState(false);
  const { isAuthenticated, logout, user } = useAuth();

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <a href="#/" onClick={(e) => { e.preventDefault(); window.location.hash = '#/'; }} className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              ML-Practical
            </a>
          </div>

          {/* Centered Navigation Links */}
          <div className="hidden md:flex md:items-center md:space-x-8">
            <a
              href="#/dashboard"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#/dashboard'; }}
              className="font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
            >
              My Courses
            </a>
            <a
              href="#/courses"
              onClick={(e) => { e.preventDefault(); window.location.hash = '#/courses'; }}
              className="font-medium text-gray-500 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white transition-colors duration-200"
            >
              Catalog
            </a>
          </div>

          {/* Auth controls */}
          <div className="flex items-center">
            {isAuthenticated ? (
                <div className="relative">
                <div>
                  <button
                    onClick={() => setProfileMenuOpen(!isProfileMenuOpen)}
                    className="bg-white dark:bg-gray-800 rounded-full flex text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-100 dark:focus:ring-offset-gray-800 focus:ring-indigo-500"
                    id="user-menu-button"
                    aria-expanded={isProfileMenuOpen}
                    aria-haspopup="true"
                  >
                    <span className="sr-only">Open user menu</span>
                    <img
                      className="h-8 w-8 rounded-full"
                      src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                      alt=""
                    />
                  </button>
                </div>
                {isProfileMenuOpen && (
                  <div
                    className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg py-1 bg-white dark:bg-gray-700 ring-1 ring-black ring-opacity-5 focus:outline-none"
                    role="menu"
                    aria-orientation="vertical"
                    aria-labelledby="user-menu-button"
                  >
                    <a href="#/dashboard/profile" onClick={(e) => { e.preventDefault(); window.location.hash = '#/dashboard/profile'; setProfileMenuOpen(false); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">
                      Your Profile
                    </a>
                    <a href="#" onClick={(e) => { e.preventDefault(); setProfileMenuOpen(false);}} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">
                      Settings
                    </a>
                    <a href="#/" onClick={(e) => { e.preventDefault(); setProfileMenuOpen(false); logout(); }} className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-600" role="menuitem">
                      Sign out
                    </a>
                  </div>
                )}
              </div>
            ) : (
                <div className="hidden md:flex items-center space-x-2">
                    <Button variant="secondary" onClick={() => window.location.hash = '#/login'}>
                        Login
                    </Button>
                    <Button variant="primary" onClick={() => window.location.hash = '#/register'}>
                        Register
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;