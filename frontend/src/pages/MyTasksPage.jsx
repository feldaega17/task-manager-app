// src/pages/MyTasksPage.jsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        const icons = {
            pdf: '📕',
            doc: '📘',
            docx: '📘',
            xls: '📗',
            xlsx: '📗',
            ppt: '📙',
            pptx: '📙',
            txt: '📄',
            zip: '📦',
            rar: '📦',
            jpg: '🖼️',
            jpeg: '🖼️',
            png: '🖼️',
            gif: '🖼️',
            mp4: '🎬',
            mp3: '🎵',
        };
        return icons[ext] || '📎';
    };

    const isImageFile = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    };

    const getAttachmentUrl = (filename) => {
        return `http://localhost:3000/uploads/${filename}`;
    };

    return (
        <div className="space-y-6">
            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 text-red-700 text-sm rounded-2xl shadow-sm animate-in slide-in-from-top">
                    <span className="text-xl">❌</span>
                    <p>{error}</p>
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600">×</button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm rounded-2xl shadow-sm animate-in slide-in-from-top">
                    <span className="text-xl">✅</span>
                    <p>{success}</p>
                </div>
            )}

            {/* Stats Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-4 text-white shadow-lg shadow-indigo-500/20">
                    <p className="text-indigo-100 text-xs font-medium">Total Tasks</p>
                    <p className="text-3xl font-bold">{tasks.length}</p>
                </div>
                <div className="bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl p-4 text-white shadow-lg shadow-emerald-500/20">
                    <p className="text-emerald-100 text-xs font-medium">Completed</p>
                    <p className="text-3xl font-bold">{tasks.filter(t => t.status === 'COMPLETED').length}</p>
                </div>
                <div className="bg-gradient-to-br from-amber-500 to-orange-600 rounded-2xl p-4 text-white shadow-lg shadow-amber-500/20">
                    <p className="text-amber-100 text-xs font-medium">Pending</p>
                    <p className="text-3xl font-bold">{tasks.filter(t => t.status !== 'COMPLETED').length}</p>
                </div>
                <div className="bg-gradient-to-br from-rose-500 to-pink-600 rounded-2xl p-4 text-white shadow-lg shadow-rose-500/20">
                    <p className="text-rose-100 text-xs font-medium">High Priority</p>
                    <p className="text-3xl font-bold">{tasks.filter(t => t.priority === 'HIGH').length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 p-6 shadow-xl shadow-slate-200/50">
                <div className="flex items-center gap-2 mb-4">
                    <span className="text-xl">🔍</span>
                    <h3 className="font-semibold text-slate-800">Filter Tasks</h3>
                </div>
                <div className="flex flex-wrap gap-4 items-end">
                    <div className="flex-1 min-w-[200px]">
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Search by title</label>
                        <input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm 
                                focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 
                                transition-all duration-200"
                            placeholder="Type to search..."
                        />
                    </div>
                    <div className="min-w-[140px]">
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Priority</label>
                        <select
                            value={priority}
                            onChange={(e) => setPriority(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm 
                                focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 
                                transition-all duration-200 cursor-pointer"
                        >
                            <option value="">All Priorities</option>
                            {PRIORITY_OPTIONS.map((p) => (
                                <option key={p} value={p}>{p}</option>
                            ))}
                        </select>
                    </div>
                    <div className="min-w-[160px]">
                        <label className="block text-xs font-semibold text-slate-600 mb-2">Category</label>
                        <select
                            value={categoryFilter}
                            onChange={(e) => setCategoryFilter(e.target.value)}
                            className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm 
                                focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 
                                transition-all duration-200 cursor-pointer"
                        >
                            <option value="">All Categories</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>{cat.name}</option>
                            ))}
                        </select>
                    </div>
                    <button
                        onClick={applyFilters}
                        className="bg-gradient-to-r from-indigo-600 to-purple-600 
        /* GANTI BG HOVER MENJADI PUTIH */
        hover:from-white hover:to-white 
        
        text-purple-500 
        /* GANTI TEKS HOVER MENJADI HITAM */
        hover:text-black 
        
        px-6 py-2.5 rounded-xl text-sm font-semibold 
        
        /* Ubah Shadow agar cocok saat hover */
        shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-gray-300/50
        
        transition-all duration-200 transform hover:scale-105"
                    >
                        Apply Filters
                    </button>
                </div>
            </div>

            {/* Tasks Grid */}
            {loading ? (
                <div className="flex flex-col items-center justify-center py-16">
                    <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                    <p className="text-slate-500">Loading your tasks...</p>
                </div>
            ) : tasks.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 p-12 text-center shadow-xl">
                    <div className="text-6xl mb-4">📭</div>
                    <h3 className="text-xl font-bold text-slate-800 mb-2">No tasks found</h3>
                    <p className="text-slate-500">Create your first task to get started! 🚀</p>
                </div>
            ) : (
                <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
                    {tasks.map((task) => {
                        const priorityConfig = getPriorityConfig(task.priority);
                        return (
                            <div
                                key={task.id}
                                className={`
                                    bg-white rounded-2xl shadow-lg border transition-all duration-300 overflow-hidden
                                    ${editingId === task.id
                                        ? 'border-indigo-500 ring-4 ring-indigo-500/20 scale-[1.02]'
                                        : 'border-slate-200/50 hover:shadow-xl hover:scale-[1.02] hover:border-indigo-200'
                                    }
                                `}
                            >
                                {/* Priority indicator bar */}
                                <div className={`h-1.5 ${priorityConfig.bg}`}></div>

                                <div className="p-5 space-y-4">
                                    {editingId === task.id ? (
                                        // Edit Mode
                                        <div className="space-y-3">
                                            <input
                                                type="text"
                                                value={editForm.title}
                                                onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm 
                                                    focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                                placeholder="Task title"
                                            />
                                            <textarea
                                                value={editForm.description}
                                                onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm 
                                                    focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none"
                                                placeholder="Description"
                                                rows="2"
                                            />
                                            <select
                                                value={editForm.priority}
                                                onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm 
                                                    focus:border-indigo-500 focus:bg-white focus:outline-none"
                                            >
                                                {PRIORITY_OPTIONS.map((p) => (
                                                    <option key={p} value={p}>{p}</option>
                                                ))}
                                            </select>
                                            <input
                                                type="date"
                                                value={editForm.dueDate}
                                                onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm 
                                                    focus:border-indigo-500 focus:bg-white focus:outline-none"
                                            />
                                            <select
                                                value={editForm.categoryId}
                                                onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm 
                                                    focus:border-indigo-500 focus:bg-white focus:outline-none"
                                            >
                                                <option value="">No Category</option>
                                                {categories.map((cat) => (
                                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                                ))}
                                            </select>
                                            <div className="flex gap-2 pt-2">
                                                <button
                                                    onClick={() => saveEdit(task.id)}
                                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 
                                                        text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/30 transition-all"
                                                >
                                                    💾 Save
                                                </button>
                                                <button
                                                    onClick={cancelEdit}
                                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                                >
                                                    Cancel
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        // View Mode
                                        <>
                                            <div className="flex justify-between items-start gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <Link
                                                        to={`/tasks/${task.id}`}
                                                        className={`font-bold text-base mb-1 block hover:text-indigo-600 transition-colors ${task.status === 'COMPLETED' ? 'line-through text-slate-400' : 'text-slate-800'
                                                            }`}
                                                    >
                                                        {task.title}
                                                    </Link>
                                                    {task.category && (
                                                        <span className="inline-flex items-center gap-1 text-xs bg-indigo-100 text-indigo-700 px-2.5 py-1 rounded-full font-medium">
                                                            📁 {task.category.name}
                                                        </span>
                                                    )}
                                                </div>
                                                <span className={`flex items-center gap-1 text-xs px-3 py-1.5 rounded-full font-semibold ${priorityConfig.bg} ${priorityConfig.text}`}>
                                                    {priorityConfig.icon} {task.priority}
                                                </span>
                                            </div>

                                            {task.description && (
                                                <p className="text-sm text-slate-600 line-clamp-2 bg-slate-50 rounded-xl p-3">
                                                    {task.description}
                                                </p>
                                            )}

                                            <div className="flex justify-between items-center text-xs">
                                                <span className={`flex items-center gap-1.5 font-medium px-3 py-1.5 rounded-full ${task.status === 'COMPLETED'
                                                    ? 'bg-emerald-100 text-emerald-700'
                                                    : 'bg-amber-100 text-amber-700'
                                                    }`}>
                                                    {task.status === 'COMPLETED' ? '✅ Completed' : '⏳ Pending'}
                                                </span>
                                                {task.dueDate && (
                                                    <span className="text-slate-500 flex items-center gap-1">
                                                        📅 {new Date(task.dueDate).toLocaleDateString('id-ID')}
                                                    </span>
                                                )}
                                            </div>

                                            {/* Attachment Display */}
                                            {task.attachmentPath && (
                                                <div className="bg-slate-50 rounded-xl p-3 border border-slate-200">
                                                    <p className="text-xs font-semibold text-slate-600 mb-2 flex items-center gap-1">
                                                        📎 Attachment
                                                    </p>
                                                    {isImageFile(task.attachmentPath) ? (
                                                        <a
                                                            href={getAttachmentUrl(task.attachmentPath)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="block"
                                                        >
                                                            <img
                                                                src={getAttachmentUrl(task.attachmentPath)}
                                                                alt="Attachment"
                                                                className="w-full h-32 object-cover rounded-lg hover:opacity-90 transition-opacity cursor-pointer"
                                                            />
                                                        </a>
                                                    ) : (
                                                        <a
                                                            href={getAttachmentUrl(task.attachmentPath)}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800 transition-colors"
                                                        >
                                                            <span className="text-xl">{getFileIcon(task.attachmentPath)}</span>
                                                            <span className="truncate">{task.attachmentPath}</span>
                                                            <span className="text-xs bg-indigo-100 px-2 py-0.5 rounded-full">Download</span>
                                                        </a>
                                                    )}
                                                </div>
                                            )}

                                            <div className="flex gap-2 pt-3 border-t border-slate-100">
                                                <Link
                                                    to={`/tasks/${task.id}`}
                                                    className="flex-1 flex items-center justify-center gap-1.5 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                                                >
                                                    👁️ View
                                                </Link>
                                                <button
                                                    onClick={() => toggleTaskStatus(task.id, task.status)}
                                                    className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold transition-all ${task.status === 'COMPLETED'
                                                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-600'
                                                        : 'bg-emerald-100 hover:bg-emerald-200 text-emerald-700'
                                                        }`}
                                                >
                                                    {task.status === 'COMPLETED' ? '↩️ Undo' : '✓ Done'}
                                                </button>
                                                <button
                                                    onClick={() => startEditing(task)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 bg-amber-100 hover:bg-amber-200 text-amber-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteTask(task.id)}
                                                    className="flex-1 flex items-center justify-center gap-1.5 bg-red-100 hover:bg-red-200 text-red-700 px-3 py-2 rounded-xl text-xs font-semibold transition-all"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
