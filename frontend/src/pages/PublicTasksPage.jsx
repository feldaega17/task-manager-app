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

    const getPriorityColor = (priority) => {
        switch (priority) {
            case 'HIGH':
                return 'text-red-600 bg-red-50';
            case 'MEDIUM':
                return 'text-yellow-600 bg-yellow-50';
            case 'LOW':
                return 'text-green-600 bg-green-50';
            default:
                return 'text-slate-600 bg-slate-50';
        }
    };

    const getStatusIcon = (status) => {
        return status === 'COMPLETED' ? '✓' : '○';
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            {/* Header */}
            {loading ? (
                <div className="text-center py-12 text-slate-500">
                    <div className="inline-block animate-spin">⏳</div>
                    {' '}Loading...
                </div>
            ) : error ? (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-lg">
                    {error}
                </div>
            ) : user ? (
                <>
                    <div className="bg-white rounded-xl border border-slate-200 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-slate-800">@{user.username}</h2>
                                <p className="text-slate-600 text-sm">{user.email}</p>
                            </div>
                            <button
                                onClick={() => navigate('/users')}
                                className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg text-sm font-medium transition-all"
                            >
                                ← Back
                            </button>
                        </div>
                        <p className="text-slate-600 text-sm">
                            Public Tasks: <span className="font-semibold">{tasks.length}</span>
                        </p>
                    </div>

                    {/* Tasks List */}
                    <div className="space-y-3">
                        {tasks.length === 0 ? (
                            <div className="text-center py-12 text-slate-500 bg-white rounded-lg border border-slate-200">
                                📭 No public tasks available
                            </div>
                        ) : (
                            tasks.map((task) => (
                                <div
                                    key={task.id}
                                    className={`bg-white rounded-lg border border-slate-200 p-4 hover:shadow-md transition-all ${task.status === 'COMPLETED' ? 'opacity-70' : ''
                                        }`}
                                >
                                    <div className="flex items-start justify-between gap-3">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <span className="text-lg font-semibold">
                                                    {getStatusIcon(task.status)}
                                                </span>
                                                <h3
                                                    className={`font-semibold ${task.status === 'COMPLETED'
                                                            ? 'line-through text-slate-500'
                                                            : 'text-slate-800'
                                                        }`}
                                                >
                                                    {task.title}
                                                </h3>
                                            </div>

                                            {task.description && (
                                                <p className="text-sm text-slate-600 mb-2">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex flex-wrap gap-2 items-center">
                                                {task.category && (
                                                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                                                        📁 {task.category.name}
                                                    </span>
                                                )}
                                                <span
                                                    className={`text-xs px-2 py-1 rounded font-medium ${getPriorityColor(
                                                        task.priority,
                                                    )}`}
                                                >
                                                    {task.priority}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-xs text-slate-500">
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
                                        <span
                                            className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${task.status === 'COMPLETED'
                                                    ? 'bg-green-100 text-green-700'
                                                    : 'bg-slate-100 text-slate-700'
                                                }`}
                                        >
                                            {task.status === 'COMPLETED' ? '✓ Done' : 'Pending'}
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}
