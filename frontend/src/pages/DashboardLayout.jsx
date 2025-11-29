// src/pages/DashboardLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';
import { useState } from 'react';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 via-white to-cyan-50">
                <div className="text-center">
                    <div className="animate-spin inline-block w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-slate-600">Loading user information...</p>
                </div>
            </div>
        );
    }

    const navItems = [
        { path: '/', icon: '📋', label: 'My Tasks', exact: true },
        { path: '/tasks/new', icon: '➕', label: 'New Task', exact: false },
        { path: '/categories', icon: '📁', label: 'Categories', exact: true },
        { path: '/users', icon: '👥', label: 'Browse Users', exact: false },
    ];

    const isActive = (item) => {
        if (item.exact) return location.pathname === item.path;
        return location.pathname.startsWith(item.path);
    };

    return (
        <div className="h-screen flex bg-gradient-to-br from-slate-50 via-white to-indigo-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
                fixed lg:static inset-y-0 left-0 z-50
                w-72 bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 
                text-slate-100 flex flex-col
                transform transition-transform duration-300 ease-in-out
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
                shadow-2xl lg:shadow-xl
            `}>
                {/* Logo */}
                <div className="px-6 py-6 border-b border-slate-700/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                            <span className="text-xl">✨</span>
                        </div>
                        <div>
                            <h1 className="font-bold text-lg bg-gradient-to-r from-white to-indigo-200 bg-clip-text text-transparent">
                                TaskFlow
                            </h1>
                            <p className="text-xs text-slate-400">Manage your tasks</p>
                        </div>
                    </div>
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-4">
                        Menu
                    </p>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={() => setSidebarOpen(false)}
                            className={`
                                flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium
                                transition-all duration-200 group
                                ${isActive(item)
                                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/30'
                                    : 'text-slate-300 hover:bg-white/10 hover:text-white'
                                }
                            `}
                        >
                            <span className={`text-lg transition-transform duration-200 ${isActive(item) ? '' : 'group-hover:scale-110'}`}>
                                {item.icon}
                            </span>
                            {item.label}
                            {isActive(item) && (
                                <span className="ml-auto w-2 h-2 bg-white rounded-full animate-pulse"></span>
                            )}
                        </Link>
                    ))}
                </nav>

                {/* User section */}
                <div className="p-4 border-t border-slate-700/50 bg-slate-900/50">
                    <div className="flex items-center gap-3 p-3 rounded-xl bg-slate-800/50 mb-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-emerald-400 to-cyan-500 rounded-full flex items-center justify-center text-white font-semibold shadow-lg">
                            {user?.email?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-white truncate">
                                {user?.name || 'User'}
                            </p>
                            <p className="text-xs text-slate-400 truncate">
                                {user?.email}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={logout}
                        className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl
                            text-red-300 hover:text-white hover:bg-red-500/20 
                            border border-red-500/30 hover:border-red-500/50
                            transition-all duration-200 text-sm font-medium"
                    >
                        <span>🚪</span>
                        Sign Out
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-slate-200/50 flex items-center px-6 sticky top-0 z-30">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden mr-4 p-2 hover:bg-slate-100 rounded-lg transition-colors"
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    </button>
                    <div className="flex-1">
                        <h1 className="text-xl font-bold text-slate-800">
                            {navItems.find(item => isActive(item))?.label || 'Dashboard'}
                        </h1>
                        <p className="text-xs text-slate-500">
                            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-100">
                            <span className="text-indigo-600">👋</span>
                            <span className="text-sm font-medium text-indigo-700">Welcome back!</span>
                        </div>
                    </div>
                </header>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </div>
            </main>
        </div>
    );
}
