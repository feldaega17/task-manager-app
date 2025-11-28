// src/pages/MyTasksPage.jsx
import { useEffect, useState } from 'react';
import { api } from '../api';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

export default function MyTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [search, setSearch] = useState('');
    const [priority, setPriority] = useState('');
    const [loading, setLoading] = useState(true);

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tasks'); // backend: GET /tasks → my tasks
            let data = Array.isArray(res.data) ? res.data : res.data.items || [];

            if (search) {
                data = data.filter((t) =>
                    t.title.toLowerCase().includes(search.toLowerCase())
                );
            }
            if (priority) {
                data = data.filter((t) => t.priority === priority);
            }

            setTasks(data);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchTasks();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const onSearchChange = (e) => setSearch(e.target.value);
    const onPriorityChange = (e) => setPriority(e.target.value);

    const applyFilters = () => {
        fetchTasks();
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-wrap gap-3 items-end">
                <div>
                    <label className="block text-xs mb-1">Search by title</label>
                    <input
                        value={search}
                        onChange={onSearchChange}
                        className="border rounded-lg px-3 py-2 text-sm"
                        placeholder="Search..."
                    />
                </div>
                <div>
                    <label className="block text-xs mb-1">Priority</label>
                    <select
                        value={priority}
                        onChange={onPriorityChange}
                        className="border rounded-lg px-3 py-2 text-sm"
                    >
                        <option value="">All</option>
                        {PRIORITY_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
                </div>
                <button
                    onClick={applyFilters}
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm"
                >
                    Apply
                </button>
            </div>

            {loading ? (
                <div>Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="text-sm text-slate-500">No tasks found.</div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className="bg-white rounded-xl shadow-sm border border-slate-200 p-4 space-y-2"
                        >
                            <div className="flex justify-between items-start gap-2">
                                <h2 className="font-semibold text-slate-800 text-sm">
                                    {task.title}
                                </h2>
                                <span
                                    className={`text-xs px-2 py-1 rounded-full ${task.priority === 'HIGH'
                                        ? 'bg-red-100 text-red-700'
                                        : task.priority === 'MEDIUM'
                                            ? 'bg-yellow-100 text-yellow-700'
                                            : 'bg-emerald-100 text-emerald-700'
                                        }`}
                                >
                                    {task.priority}
                                </span>
                            </div>
                            <p className="text-xs text-slate-500 line-clamp-2">
                                {task.description}
                            </p>
                            <div className="flex justify-between items-center text-xs text-slate-500">
                                <span>
                                    Status:{' '}
                                    <span className="font-medium">
                                        {task.status === 'COMPLETED' ? 'Completed' : 'Pending'}
                                    </span>
                                </span>
                                {task.dueDate && (
                                    <span>
                                        Due:{' '}
                                        {new Date(task.dueDate).toLocaleDateString('id-ID')}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
