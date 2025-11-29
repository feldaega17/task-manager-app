import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function PublicTasksPage() {
    const { userId } = useParams();
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [tasks, setTasks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                setError('');
                // Fetch user info
                const userRes = await api.get(`/users/${userId}`);
                setUser(userRes.data);

                // Fetch user's public tasks
                const tasksRes = await api.get(`/tasks/public/${userId}`);
                setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : tasksRes.data.items || []);
            } catch (err) {
                console.error('Error fetching data:', err);
                setError('Failed to load user or tasks');
            } finally {
                setLoading(false);
            }
        };

        if (userId) {
            fetchData();
        }
    }, [userId]);

    const getPriorityConfig = (priority) => {
        switch (priority) {
            case 'HIGH':
                return { bg: 'bg-gradient-to-r from-red-500 to-rose-500', text: 'text-white', icon: '🔥' };
            case 'MEDIUM':
                return { bg: 'bg-gradient-to-r from-amber-400 to-orange-400', text: 'text-white', icon: '⚡' };
            default:
                return { bg: 'bg-gradient-to-r from-emerald-400 to-teal-400', text: 'text-white', icon: '🌱' };
        }
    };

    const avatarColors = [
        'from-indigo-500 to-purple-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-rose-500 to-pink-500',
        'from-cyan-500 to-blue-500',
    ];

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Loading State */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16 bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 shadow-xl">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-slate-500">Loading user tasks...</p>
                </div>
            ) : error ? (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 text-red-700 text-sm rounded-2xl shadow-sm">
                    <span className="text-xl">❌</span>
                    <p>{error}</p>
                    <button
                        onClick={() => navigate('/users')}
                        className="ml-auto bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl text-sm font-medium transition-all"
                    >
                        Go Back
                    </button>
                </div>
            ) : user ? (
                <>
                    {/* User Profile Card */}
                    <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-8">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-5">
                                    <div className={`
                                        w-20 h-20 bg-gradient-to-br ${avatarColors[parseInt(userId) % avatarColors.length]}
                                        rounded-2xl flex items-center justify-center text-white font-bold text-3xl
                                        shadow-xl ring-4 ring-white/20
                                    `}>
                                        {user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase() || 'U'}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-white">@{user.username || 'user'}</h2>
                                        <p className="text-indigo-200 text-sm flex items-center gap-1">
                                            <span>📧</span> {user.email}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/users')}
                                    className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-5 py-2.5 rounded-xl text-sm font-medium transition-all
                                        flex items-center gap-2 border border-white/20"
                                >
                                    <span>←</span> Back to Users
                                </button>
                            </div>
                        </div>
                        <div className="px-6 py-4 bg-gradient-to-r from-indigo-50 to-purple-50">
                            <div className="flex items-center gap-6">
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                                        <span className="text-lg">📋</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-indigo-700">{tasks.length}</p>
                                        <p className="text-xs text-indigo-600">Public Tasks</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                                        <span className="text-lg">✅</span>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-emerald-700">
                                            {tasks.filter(t => t.status === 'COMPLETED').length}
                                        </p>
                                        <p className="text-xs text-emerald-600">Completed</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-4">
                        <div className="flex items-center gap-2 px-2">
                            <span className="text-2xl">📝</span>
                            <h3 className="font-bold text-slate-800">Public Tasks</h3>
                        </div>

                        {tasks.length === 0 ? (
                            <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 p-12 text-center shadow-xl">
                                <div className="text-6xl mb-4">📭</div>
                                <h3 className="text-xl font-bold text-slate-800 mb-2">No public tasks</h3>
                                <p className="text-slate-500">This user hasn't shared any public tasks yet</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {tasks.map((task) => {
                                    const priorityConfig = getPriorityConfig(task.priority);
                                    return (
                                        <div
                                            key={task.id}
                                            className={`
                                                bg-white rounded-2xl border border-slate-200/50 shadow-lg overflow-hidden
                                                hover:shadow-xl transition-all duration-300 hover:scale-[1.01]
                                                ${task.status === 'COMPLETED' ? 'opacity-80' : ''}
                                            `}
                                        >
                                            {/* Priority indicator bar */}
                                            <div className={`h-1.5 ${priorityConfig.bg}`}></div>

                                            <div className="p-5">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-3 mb-2">
                                                            <span className={`text-xl ${task.status === 'COMPLETED' ? 'text-emerald-500' : 'text-slate-300'}`}>
                                                                {task.status === 'COMPLETED' ? '✅' : '⭕'}
                                                            </span>
                                                            <h3 className={`font-bold text-lg ${task.status === 'COMPLETED'
                                                                    ? 'line-through text-slate-400'
                                                                    : 'text-slate-800'
                                                                }`}>
                                                                {task.title}
                                                            </h3>
                                                        </div>

                                                        {task.description && (
                                                            <p className="text-sm text-slate-600 mb-3 bg-slate-50 rounded-xl p-3 line-clamp-2">
                                                                {task.description}
                                                            </p>
                                                        )}

                                                        <div className="flex flex-wrap gap-2 items-center">
                                                            {task.category && (
                                                                <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-3 py-1.5 rounded-full font-medium">
                                                                    📁 {task.category.name}
                                                                </span>
                                                            )}
                                                            <span className={`inline-flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-semibold ${priorityConfig.bg} ${priorityConfig.text}`}>
                                                                {priorityConfig.icon} {task.priority}
                                                            </span>
                                                            {task.dueDate && (
                                                                <span className="text-xs text-slate-500 flex items-center gap-1 bg-slate-100 px-3 py-1.5 rounded-full">
                                                                    📅{' '}
                                                                    {new Date(task.dueDate).toLocaleDateString('id-ID', {
                                                                        year: 'numeric',
                                                                        month: 'short',
                                                                        day: 'numeric',
                                                                    })}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>

                                                    <span className={`
                                                        px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap
                                                        ${task.status === 'COMPLETED'
                                                            ? 'bg-emerald-100 text-emerald-700'
                                                            : 'bg-amber-100 text-amber-700'
                                                        }
                                                    `}>
                                                        {task.status === 'COMPLETED' ? '✓ Completed' : '⏳ Pending'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}
