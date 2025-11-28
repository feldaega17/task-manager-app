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

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-2xl font-bold text-slate-800 mb-4">👥 Browse Users</h2>
                <p className="text-slate-600 text-sm mb-4">
                    Search for users and explore their public tasks
                </p>
                <input
                    type="text"
                    placeholder="Search by username or email..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full border-2 border-slate-200 rounded-lg px-4 py-3 text-sm focus:border-blue-500 focus:outline-none transition-all"
                />
            </div>

            {/* Error */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-lg">
                    {error}
                </div>
            )}

            {/* Users List */}
            <div className="space-y-3">
                {loading ? (
                    <div className="text-center py-12 text-slate-500">
                        <div className="inline-block animate-spin">⏳</div>
                        {' '}Loading users...
                    </div>
                ) : users.length === 0 ? (
                    <div className="text-center py-12 text-slate-500">
                        {search ? '❌ No users found' : '📭 No users available'}
                    </div>
                ) : (
                    users.map((user) => (
                        <div
                            key={user.id}
                            className="bg-white rounded-lg border border-slate-200 hover:shadow-lg transition-all p-4 flex items-center justify-between"
                        >
                            <div>
                                <h3 className="font-semibold text-slate-800">@{user.username}</h3>
                                <p className="text-xs text-slate-500">{user.email}</p>
                            </div>
                            <button
                                onClick={() => navigate(`/users/${user.id}/public-tasks`)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ml-4"
                            >
                                View Tasks
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
