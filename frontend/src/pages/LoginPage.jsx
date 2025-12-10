// src/pages/LoginPage.jsx
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function LoginPage() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [form, setForm] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const onChange = (e) =>
        setForm({ ...form, [e.target.name]: e.target.value });

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            await login(form.email, form.password);
            navigate('/');
        } catch (err) {
            console.error(err);
            setError('Invalid email or password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-500 p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -left-40 w-80 h-80 bg-white/10 rounded-full blur-3xl animate-pulse"></div>
                <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-white/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-white/5 rounded-full blur-3xl"></div>
            </div>

            {/* Floating shapes */}
            <div className="absolute top-20 left-20 w-20 h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-2xl rotate-12 opacity-60 animate-bounce" style={{ animationDuration: '3s' }}></div>
            <div className="absolute bottom-32 left-32 w-16 h-16 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full opacity-60 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}></div>
            <div className="absolute top-40 right-20 w-12 h-12 bg-gradient-to-br from-pink-400 to-rose-500 rounded-xl rotate-45 opacity-60 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}></div>

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white/95 backdrop-blur-xl rounded-3xl shadow-2xl p-8 space-y-6 border border-white/20">
                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl mb-4 shadow-xl shadow-indigo-500/30">
                            <span className="text-4xl">✨</span>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">Sign in to continue to TaskFlow</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm animate-shake">
                            <span className="text-xl">❌</span>
                            <p>{error}</p>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-5" onSubmit={onSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400 group-focus-within:text-indigo-500 transition-colors">📧</span>
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm 
                                        focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 
                                        transition-all duration-200"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative group">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl text-slate-400 group-focus-within:text-indigo-500 transition-colors">🔐</span>
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full pl-12 pr-4 py-3.5 bg-slate-50 border-2 border-slate-200 rounded-xl text-sm 
                                        focus:outline-none focus:border-indigo-500 focus:bg-white focus:ring-4 focus:ring-indigo-500/10 
                                        transition-all duration-200"
                                    placeholder="••••••••"
                                    value={form.password}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
                                text-white py-4 rounded-xl text-sm font-bold
                                shadow-xl shadow-indigo-500/30 hover:shadow-2xl hover:shadow-indigo-500/40
                                transition-all duration-300 transform hover:scale-[1.02]
                                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                                flex items-center justify-center gap-2"
                        >
                            {isLoading ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Signing in...
                                </>
                            ) : (
                                <>
                                    <span>🚀</span>
                                    <span style={{ color: 'black' }}>Sign In</span>
                                </>
                            )}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-xs">
                            <span className="px-4 bg-white text-slate-400">or</span>
                        </div>
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-slate-600">
                        Don't have an account?{' '}
                        <Link
                            to="/register"
                            className="font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent hover:from-indigo-700 hover:to-purple-700 transition-all"
                        >
                            Create one →
                        </Link>
                    </p>
                </div>

                {/* Bottom text */}
                <p className="text-center text-white/60 text-xs mt-6">
                    © 2025 TaskFlow. Manage your tasks efficiently.
                </p>
            </div>

            <style>{`
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    25% { transform: translateX(-5px); }
                    75% { transform: translateX(5px); }
                }
                .animate-shake {
                    animation: shake 0.3s ease-in-out;
                }
            `}</style>
        </div>
    );
}
