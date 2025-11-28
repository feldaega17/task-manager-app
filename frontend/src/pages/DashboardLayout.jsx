// src/pages/DashboardLayout.jsx
import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext';

export default function DashboardLayout() {
    const { user, logout } = useAuth();
    const location = useLocation();

    if (!user) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-slate-100">
                <div className="text-center">
                    <p className="text-slate-600 mb-4">Loading user information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="h-screen flex bg-slate-100">
            {/* Sidebar */}
            <aside className="w-64 bg-slate-900 text-slate-100 flex flex-col">
                <div className="px-4 py-4 font-bold text-xl border-b border-slate-700">
                    Todo Dashboard
                </div>
                <nav className="flex-1 px-2 py-4 space-y-2">
                    <Link
                        to="/"
                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname === '/'
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-800'
                            }`}
                    >
                        📋 My Tasks
                    </Link>
                    <Link
                        to="/tasks/new"
                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname.startsWith('/tasks/new')
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-800'
                            }`}
                    >
                        ➕ New Task
                    </Link>
                    <Link
                        to="/categories"
                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname === '/categories'
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-800'
                            }`}
                    >
                        📁 Categories
                    </Link>
                    <Link
                        to="/users"
                        className={`block px-3 py-2 rounded-lg text-sm transition-all ${location.pathname === '/users' || location.pathname.startsWith('/users/')
                            ? 'bg-blue-600 text-white'
                            : 'hover:bg-slate-800'
                            }`}
                    >
                        👥 Browse Users
                    </Link>
                </nav>
                <div className="px-4 py-4 border-t border-slate-700 text-xs">
                    <div className="mb-2">Logged in as:</div>
                    <div className="font-semibold text-sm">{user?.email}</div>
                    <button
                        onClick={logout}
                        className="mt-3 w-full text-left text-red-300 hover:text-red-200 text-sm"
                    >
                        Logout
                    </button>
                </div>
            </aside>

            {/* Main content */}
            <main className="flex-1 flex flex-col">
                <header className="h-14 bg-white border-b border-slate-200 flex items-center px-6">
                    <h1 className="text-lg font-semibold">Todo List</h1>
                </header>
                <div className="flex-1 overflow-y-auto p-6">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
