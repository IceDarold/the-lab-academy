
import * as React from 'react';
import { navItems } from './Sidebar'; // Import navItems to get labels

// SVG Icon for the search bar
const MagnifyingGlassIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
    <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" />
  </svg>
);

interface HeaderProps {
    activePath: string;
}

const Header: React.FC<HeaderProps> = ({ activePath }) => {
  const currentPage = navItems.find(item => item.href === activePath) || { label: 'Dashboard' };

  return (
    <header className="bg-gray-800 border-b border-gray-700 p-4 shrink-0">
      <div className="flex justify-between items-center w-full">
        {/* Left Side: Breadcrumbs */}
        <div>
          <p className="text-sm text-gray-400">
            <a href="#" onClick={(e) => e.preventDefault()} className="hover:text-gray-100">Home</a>
            <span className="mx-2">/</span>
            <span className="text-gray-100 font-medium">{currentPage.label}</span>
          </p>
        </div>

        {/* Right Side: Search and User Profile */}
        <div className="flex items-center gap-4">
          <div className="relative hidden md:block">
            <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute top-1/2 left-3 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search..."
              className="bg-gray-900 border border-gray-700 rounded-md pl-10 pr-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500 w-64"
            />
          </div>
          <a
            href="/admin/profile"
            onClick={(e) => e.preventDefault()}
            className="p-1 rounded-full hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-blue-500"
            aria-label="User menu"
          >
            <img
              className="h-8 w-8 rounded-full"
              src="https://picsum.photos/32/32"
              alt="User profile"
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;