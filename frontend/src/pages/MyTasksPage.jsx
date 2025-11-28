// src/pages/MyTasksPage.jsx
import { useEffect, useState } from 'react';
import { api } from '../api';

const PRIORITY_OPTIONS = ['LOW', 'MEDIUM', 'HIGH'];

export default function MyTasksPage() {
    const [tasks, setTasks] = useState([]);
    const [categories, setCategories] = useState([]);
    const [search, setSearch] = useState('');
    const [priority, setPriority] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({});
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchTasks = async () => {
        setLoading(true);
        try {
            const res = await api.get('/tasks');
            let data = Array.isArray(res.data) ? res.data : res.data.items || [];

            if (search) {
                data = data.filter((t) =>
                    t.title.toLowerCase().includes(search.toLowerCase())
                );
            }
            if (priority) {
                data = data.filter((t) => t.priority === priority);
            }
            if (categoryFilter) {
                data = data.filter((t) => t.category?.id === parseInt(categoryFilter));
            }

            setTasks(data);
        } catch (err) {
            console.error('Failed to fetch tasks', err);
            setTasks([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchCategories = async () => {
        try {
            const res = await api.get('/categories');
            setCategories(Array.isArray(res.data) ? res.data : res.data.items || []);
        } catch (err) {
            console.error('Failed to fetch categories', err);
        }
    };

    useEffect(() => {
        fetchTasks();
        fetchCategories();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const toggleTaskStatus = async (taskId, currentStatus) => {
        try {
            setError('');
            await api.patch(`/tasks/${taskId}/toggle`);
            setSuccess('Task status updated!');
            setTasks(tasks.map(t => 
                t.id === taskId 
                    ? { ...t, status: currentStatus === 'COMPLETED' ? 'PENDING' : 'COMPLETED' }
                    : t
            ));
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Failed to update task status');
            console.error(err);
        }
    };

    const deleteTask = async (taskId) => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            setError('');
            await api.delete(`/tasks/${taskId}`);
            setSuccess('Task deleted!');
            setTasks(tasks.filter(t => t.id !== taskId));
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Failed to delete task');
            console.error(err);
        }
    };

    const startEditing = (task) => {
        setEditingId(task.id);
        setEditForm({
            title: task.title,
            description: task.description || '',
            priority: task.priority,
            dueDate: task.dueDate ? task.dueDate.split('T')[0] : '',
            categoryId: task.category?.id || '',
        });
    };

    const saveEdit = async (taskId) => {
        try {
            setError('');
            await api.patch(`/tasks/${taskId}`, editForm);
            setSuccess('Task updated!');
            await fetchTasks();
            setEditingId(null);
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Failed to update task');
            console.error(err);
        }
    };

    const cancelEdit = () => {
        setEditingId(null);
        setEditForm({});
    };

    const applyFilters = () => {
        fetchTasks();
    };

    return (
        <div className="space-y-4">
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 text-red-700 text-sm rounded-lg">
                    {error}
                </div>
            )}
            {success && (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 text-green-700 text-sm rounded-lg">
                    {success}
                </div>
            )}

            {/* Filters */}
            <div className="bg-white rounded-xl border border-slate-200 p-4 space-y-3">
                <div className="flex flex-wrap gap-3 items-end">
                    <div className="flex-1 min-w-48">
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Search by title</label>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-all"
                            placeholder="Search tasks..."
                        />
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-all"
                        >
                            <option value="">All</option>
                            {PRIORITY_OPTIONS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none transition-all"
                        >
                            <option value="">All</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={applyFilters}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                        Apply
                    </button>
                </div>
            </div>

            {/* Tasks Grid */}
            {loading ? (
                <div className="text-center py-8 text-slate-500">Loading tasks...</div>
            ) : tasks.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No tasks found. Create one to get started! 🚀</div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {tasks.map((task) => (
                        <div
                            key={task.id}
                            className={`bg-white rounded-xl shadow-sm border transition-all ${
                                editingId === task.id
                                    ? 'border-blue-500 ring-2 ring-blue-200'
                                    : 'border-slate-200 hover:shadow-md'
                            } p-4 space-y-3`}
                        >
                            {editingId === task.id ? (
                                // Edit Mode
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        value={editForm.title}
                                        onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        placeholder="Task title"
                                    />
                                    <textarea
                                        value={editForm.description}
                                        onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                        placeholder="Description"
                                        rows="2"
                                    />
                                    <select
                                        value={editForm.priority}
                                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    >
                                        {PRIORITY_OPTIONS.map((p) => (
                                            <option key={p} value={p}>{p}</option>
                                        ))}
                                    </select>
                                    <input
                                        type="date"
                                        value={editForm.dueDate}
                                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    />
                                    <select
                                        value={editForm.categoryId}
                                        onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                                        className="w-full border-2 border-slate-200 rounded-lg px-3 py-2 text-sm focus:border-blue-500 focus:outline-none"
                                    >
                                        <option value="">No Category</option>
                                        {categories.map((cat) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => saveEdit(task.id)}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEdit}
                                            className="flex-1 bg-slate-300 hover:bg-slate-400 text-slate-800 px-3 py-2 rounded-lg text-sm font-medium transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                // View Mode
                                <>
                                    <div className="flex justify-between items-start gap-2">
                                        <div className="flex-1">
                                            <h2 className={`font-semibold text-sm ${
                                                task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800'
                                            }`}>
                                                {task.title}
                                            </h2>
                                            {task.category && (
                                                <span className="inline-block mt-1 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                                                    {task.category.name}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`text-xs px-2 py-1 rounded-full whitespace-nowrap ${
                                            task.priority === 'HIGH'
                                                ? 'bg-red-100 text-red-700'
                                                : task.priority === 'MEDIUM'
                                                    ? 'bg-yellow-100 text-yellow-700'
                                                    : 'bg-emerald-100 text-emerald-700'
                                        }`}>
                                            {task.priority}
                                        </span>
                                    </div>

                                    {task.description && (
                                        <p className="text-xs text-slate-600 line-clamp-2">
                                            {task.description}
                                        </p>
                                    )}

                                    <div className="flex justify-between items-center text-xs text-slate-500">
                                        <span>
                                            Status:{' '}
                                            <span className={`font-medium ${
                                                task.status === 'COMPLETED' ? 'text-green-600' : 'text-orange-600'
                                            }`}>
                                                {task.status === 'COMPLETED' ? '✓ Done' : 'Pending'}
                                            </span>
                                        </span>
                                        {task.dueDate && (
                                            <span>
                                                Due: {new Date(task.dueDate).toLocaleDateString('id-ID')}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2 pt-2 border-t border-slate-200">
                                        <button
                                            onClick={() => toggleTaskStatus(task.id, task.status)}
                                            className={`flex-1 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
                                                task.status === 'COMPLETED'
                                                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                                                    : 'bg-green-100 hover:bg-green-200 text-green-700'
                                            }`}
                                        >
                                            {task.status === 'COMPLETED' ? 'Undo' : 'Complete'}
                                        </button>
                                        <button
                                            onClick={() => startEditing(task)}
                                            className="flex-1 bg-blue-100 hover:bg-blue-200 text-blue-700 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => deleteTask(task.id)}
                                            className="flex-1 bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded-lg text-xs font-medium transition-all"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
