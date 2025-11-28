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
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-500 via-blue-500 to-purple-500 p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute top-0 left-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl" style={{ animation: 'float 6s ease-in-out infinite' }} />
            <div className="absolute bottom-0 right-0 w-96 h-96 bg-white opacity-5 rounded-full blur-3xl" style={{ animation: 'float 8s ease-in-out infinite 1s' }} />

            <div className="relative w-full max-w-md">
                {/* Card */}
                <div className="bg-white rounded-3xl shadow-2xl p-8 space-y-6" style={{
                    boxShadow: '0 20px 60px rgba(0,0,0,0.15)',
                }}>
                    {/* Header */}
                    <div className="text-center">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-green-500 to-blue-600 rounded-2xl mb-4">
                            <span className="text-2xl">🚀</span>
                        </div>
                        <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
                            Welcome Back
                        </h1>
                        <p className="text-slate-500 text-sm mt-2">Sign in to your account</p>
                    </div>

                    {/* Error Alert */}
                    {error && (
                        <div className="text-sm text-red-600 bg-red-50 border-l-4 border-red-500 rounded-lg p-4" style={{ animation: 'slideIn 0.3s ease-out' }}>
                            <div className="flex gap-2">
                                <span className="text-lg">❌</span>
                                <div>{error}</div>
                            </div>
                        </div>
                    )}

                    {/* Form */}
                    <form className="space-y-4" onSubmit={onSubmit}>
                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Email Address</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">📧</span>
                                <input
                                    name="email"
                                    type="email"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
                                    placeholder="your@email.com"
                                    value={form.email}
                                    onChange={onChange}
                                    required
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
                            <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-lg">🔐</span>
                                <input
                                    name="password"
                                    type="password"
                                    className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:outline-none focus:border-green-500 focus:ring-2 focus:ring-green-100 transition-all"
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
                            className="w-full bg-gradient-to-r from-green-500 to-blue-600 text-white py-3 rounded-xl text-sm font-semibold hover:shadow-lg transition-all disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Signing in...' : 'Sign In'}
                        </button>
                    </form>

                    {/* Divider */}
                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                    </div>

                    {/* Register Link */}
                    <p className="text-center text-slate-600">
                        Don't have an account?{' '}
                        <Link to="/register" className="text-green-600 font-semibold hover:text-blue-600 transition-colors">
                            Create one
                        </Link>
                    </p>
                </div>
            </div>

            <style>{`
                @keyframes float {
                    0%, 100% { transform: translateY(0px); }
                    50% { transform: translateY(20px); }
                }
                @keyframes slideIn {
                    from { opacity: 0; transform: translateY(-10px); }
                    to { opacity: 1; transform: translateY(0); }
                }
            `}</style>
        </div>
    );
}
