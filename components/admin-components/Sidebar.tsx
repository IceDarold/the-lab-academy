
import * as React from 'react';
import { Home, FileText, Users, Cog } from 'lucide-react';
import type { NavItem } from '../types';

export const navItems: NavItem[] = [
    { href: '/admin', label: 'Dashboard', icon: Home },
    { href: '/admin/content', label: 'Content Management', icon: FileText },
    { href: '/admin/users', label: 'Users', icon: Users },
    { href: '/admin/settings', label: 'Settings', icon: Cog },
];

interface SidebarProps {
    activePath: string;
    onNavigate: (path: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activePath, onNavigate }) => {
    const handleNavigate = (path: string) => {
        console.log(`[Sidebar] Navigating to: ${path}`);
        onNavigate(path);
    };

    return (
        <aside className="w-72 bg-gray-800 flex flex-col shrink-0">
            {/* Logo Area */}
            <div className="h-16 flex items-center justify-center border-b border-gray-700 shrink-0">
                <h1 className="text-2xl font-bold tracking-tight text-white">ML-Practicum</h1>
            </div>

            {/* Navigation */}
            <nav className="flex-1 overflow-y-auto p-4">
                <ul className="space-y-2">
                    {navItems.map((item) => {
                        const isActive = activePath === item.href;
                        return (
                            <li key={item.label}>
                                <a
                                    href={item.href}
                                    onClick={(e) => {
                                        e.preventDefault(); // Prevent page reload
                                        handleNavigate(item.href);
                                    }}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                                        isActive
                                            ? 'bg-blue-600 text-white'
                                            : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                                    }`}
                                >
                                    <item.icon className="h-5 w-5" />
                                    <span>{item.label}</span>
                                </a>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* User Area */}
            <div className="p-4 border-t border-gray-700 shrink-0">
                <div className="flex items-center gap-3">
                    <img
                        className="h-10 w-10 rounded-full"
                        src="https://picsum.photos/40/40"
                        alt="Admin User"
                    />
                    <div>
                        <p className="text-sm font-semibold text-white">Admin User</p>
                        <p className="text-xs text-gray-400">Administrator</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;