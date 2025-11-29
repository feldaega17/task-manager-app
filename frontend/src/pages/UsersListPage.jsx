import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function UsersListPage() {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const fetchUsers = async () => {
            setLoading(true);
            try {
                setError('');
                const endpoint = search.trim()
                    ? `/users/search?q=${encodeURIComponent(search)}`
                    : '/users';
                const response = await api.get(endpoint);
                setUsers(Array.isArray(response.data) ? response.data : response.data.items || []);
            } catch (err) {
                console.error('Error fetching users:', err);
                setError('Failed to load users');
            } finally {
                setLoading(false);
            }
        };

        const debounceTimer = setTimeout(fetchUsers, 300);
        return () => clearTimeout(debounceTimer);
    }, [search]);

    const avatarColors = [
        'from-indigo-500 to-purple-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-rose-500 to-pink-500',
        'from-cyan-500 to-blue-500',
        'from-violet-500 to-fuchsia-500',
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header Card */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-6">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <span className="text-3xl">👥</span>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold text-white">Browse Users</h2>
                            <p className="text-indigo-200 text-sm">
                                Discover and explore other users' public tasks
                            </p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <div className="relative">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 text-lg">🔍</span>
                        <input
                            type="text"
                            placeholder="Search by username or email..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-12 pr-4 py-3.5 text-sm
                                focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10
                                transition-all duration-200"
                        />
                        {search && (
                            <button
                                onClick={() => setSearch('')}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                            >
                                ✕
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Error */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 text-red-700 text-sm rounded-2xl shadow-sm">
                    <span className="text-xl">❌</span>
                    <p>{error}</p>
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-xl">×</button>
                </div>
            )}

            {/* Stats */}
            {!loading && users.length > 0 && (
                <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                    <p className="text-sm text-indigo-700">
                        <span className="font-bold">{users.length}</span> user(s) found
                        {search && <span className="text-indigo-500"> for "{search}"</span>}
                    </p>
                </div>
            )}

            {/* Users List */}
            <div className="space-y-4">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-16 bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50">
                        <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                        <p className="text-slate-500">Loading users...</p>
                    </div>
                ) : users.length === 0 ? (
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 p-12 text-center shadow-xl">
                        <div className="text-6xl mb-4">{search ? '🔍' : '👤'}</div>
                        <h3 className="text-xl font-bold text-slate-800 mb-2">
                            {search ? 'No users found' : 'No users available'}
                        </h3>
                        <p className="text-slate-500">
                            {search ? `Try searching with different keywords` : 'Users will appear here'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {users.map((user, index) => (
                            <div
                                key={user.id}
                                className="group bg-white rounded-2xl border border-slate-200/50 hover:shadow-xl 
                                    transition-all duration-300 p-5 flex items-center justify-between
                                    hover:border-indigo-200 hover:scale-[1.01]"
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`
                                        w-14 h-14 bg-gradient-to-br ${avatarColors[index % avatarColors.length]}
                                        rounded-2xl flex items-center justify-center text-white font-bold text-xl
                                        shadow-lg group-hover:scale-110 transition-transform duration-300
                                    `}>
                                        {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                            @{user.username || 'user'}
                                        </h3>
                                        <p className="text-sm text-slate-500 flex items-center gap-1">
                                            <span>📧</span> {user.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate(`/users/${user.id}/public-tasks`)}
                                    className="bg-gradient-to-r from-indigo-600 to-purple-600 
                                     /* GANTI WARNA BACKGROUND HOVER */
                                    hover:bg-white hover:from-white hover:to-white 
        
                                    /* GANTI WARNA TEKS HOVER */
                                    text-white hover:text-black 
        
                                     px-5 py-2.5 rounded-xl text-sm font-semibold
        
                                     /* GANTI SHADOW HOVER AGAR LEBIH COCOK */
                                    shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-gray-300/60
        
                                    transition-all duration-200 transform hover:scale-105
                                    flex items-center gap-2 whitespace-nowrap"
                                >
                                    <span>👁️</span>
                                    View Tasks
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-cyan-50 to-blue-50 rounded-2xl p-5 border border-cyan-200">
                <div className="flex gap-4">
                    <div className="text-3xl">💡</div>
                    <div>
                        <h4 className="font-bold text-cyan-900 mb-1">Discover Public Tasks</h4>
                        <p className="text-sm text-cyan-700">
                            Browse through other users' public tasks for inspiration. You can view tasks that users have
                            marked as public to share with the community!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
