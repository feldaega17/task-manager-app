// src/pages/TaskDetailPage.jsx
import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { api } from '../api';

export default function TaskDetailPage() {
    const { taskId } = useParams();
    const navigate = useNavigate();
    const fileInputRef = useRef(null);

    const [task, setTask] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [editForm, setEditForm] = useState({});
    const [uploadingFile, setUploadingFile] = useState(false);

    useEffect(() => {
        fetchTask();
        fetchCategories();
    }, [taskId]);

    const fetchTask = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/tasks/${taskId}`);
            setTask(res.data);
            setEditForm({
                title: res.data.title,
                description: res.data.description || '',
                priority: res.data.priority,
                dueDate: res.data.dueDate ? res.data.dueDate.split('T')[0] : '',
                categoryId: res.data.category?.id || '',
                isPublic: res.data.isPublic || false,
            });
        } catch (err) {
            console.error('Failed to fetch task', err);
            setError('Failed to load task details');
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

    const handleSave = async () => {
        try {
            setError('');
            await api.patch(`/tasks/${taskId}`, {
                ...editForm,
                categoryId: editForm.categoryId ? parseInt(editForm.categoryId) : null,
            });
            setSuccess('Task updated successfully!');
            setIsEditing(false);
            await fetchTask();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update task');
            console.error(err);
        }
    };

    const handleToggleStatus = async () => {
        try {
            setError('');
            await api.patch(`/tasks/${taskId}/toggle`);
            setSuccess('Task status updated!');
            await fetchTask();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to update task status');
            console.error(err);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this task?')) return;
        try {
            await api.delete(`/tasks/${taskId}`);
            navigate('/');
        } catch (err) {
            setError('Failed to delete task');
            console.error(err);
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        if (file.size > 5 * 1024 * 1024) {
            setError('File size must be less than 5MB');
            return;
        }

        setUploadingFile(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            await api.post(`/tasks/${taskId}/attachment`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setSuccess('File uploaded successfully!');
            await fetchTask();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err) {
            setError('Failed to upload file');
            console.error(err);
        } finally {
            setUploadingFile(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const getPriorityConfig = (priority) => {
        switch (priority) {
            case 'HIGH':
                return { bg: 'bg-gradient-to-r from-red-500 to-rose-500', lightBg: 'bg-red-50', text: 'text-white', textColor: 'text-red-700', icon: '🔥', label: 'High Priority' };
            case 'MEDIUM':
                return { bg: 'bg-gradient-to-r from-amber-400 to-orange-400', lightBg: 'bg-amber-50', text: 'text-white', textColor: 'text-amber-700', icon: '⚡', label: 'Medium Priority' };
            default:
                return { bg: 'bg-gradient-to-r from-emerald-400 to-teal-400', lightBg: 'bg-emerald-50', text: 'text-white', textColor: 'text-emerald-700', icon: '🌱', label: 'Low Priority' };
        }
    };

    const getFileIcon = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        const icons = {
            pdf: '📕', doc: '📘', docx: '📘', xls: '📗', xlsx: '📗',
            ppt: '📙', pptx: '📙', txt: '📄', zip: '📦', rar: '📦',
            jpg: '🖼️', jpeg: '🖼️', png: '🖼️', gif: '🖼️', mp4: '🎬', mp3: '🎵',
        };
        return icons[ext] || '📎';
    };

    const isImageFile = (filename) => {
        const ext = filename?.split('.').pop()?.toLowerCase();
        return ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext);
    };

    const getAttachmentUrl = (filename) => `http://localhost:3000/uploads/${filename}`;

    const formatDate = (dateString) => {
        if (!dateString) return 'Not set';
        return new Date(dateString).toLocaleDateString('id-ID', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatDateTime = (dateString) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-20">
                <div className="animate-spin w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                <p className="text-slate-500">Loading task details...</p>
            </div>
        );
    }

    if (!task) {
        return (
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 p-12 text-center shadow-xl">
                <div className="text-6xl mb-4">😕</div>
                <h3 className="text-xl font-bold text-slate-800 mb-2">Task not found</h3>
                <p className="text-slate-500 mb-4">The task you're looking for doesn't exist or has been deleted.</p>
                <Link to="/" className="text-indigo-600 hover:text-indigo-800 font-semibold">
                    ← Back to Tasks
                </Link>
            </div>
        );
    }

    const priorityConfig = getPriorityConfig(task.priority);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Alerts */}
            {error && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-200 p-4 text-red-700 text-sm rounded-2xl shadow-sm">
                    <span className="text-xl">❌</span>
                    <p>{error}</p>
                    <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-xl">×</button>
                </div>
            )}
            {success && (
                <div className="flex items-center gap-3 bg-emerald-50 border border-emerald-200 p-4 text-emerald-700 text-sm rounded-2xl shadow-sm">
                    <span className="text-xl">✅</span>
                    <p>{success}</p>
                </div>
            )}

            {/* Back Button */}
            <Link
                to="/"
                className="inline-flex items-center gap-2 text-slate-600 hover:text-indigo-600 font-medium transition-colors"
            >
                <span>←</span> Back to My Tasks
            </Link>

            {/* Main Card */}
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                {/* Header with Priority */}
                <div className={`${priorityConfig.bg} px-8 py-6`}>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                                <span className="text-3xl">{priorityConfig.icon}</span>
                            </div>
                            <div>
                                <span className="text-white/80 text-sm font-medium">{priorityConfig.label}</span>
                                <h1 className="text-2xl font-bold text-white mt-0.5">
                                    {isEditing ? 'Edit Task' : task.title}
                                </h1>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            {task.isPublic && (
                                <span className="bg-white/20 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium">
                                    🌐 Public
                                </span>
                            )}
                            <span className={`${task.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-white/20'} backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full font-medium`}>
                                {task.status === 'COMPLETED' ? '✅ Completed' : '⏳ Pending'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="p-8">
                    {isEditing ? (
                        /* Edit Mode */
                        <div className="space-y-6">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    📝 Task Title
                                </label>
                                <input
                                    type="text"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm
                                        focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                />
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    📄 Description
                                </label>
                                <textarea
                                    value={editForm.description}
                                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                                    rows={4}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm
                                        focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10 resize-none"
                                />
                            </div>

                            <div className="grid md:grid-cols-2 gap-4">
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        🎯 Priority
                                    </label>
                                    <select
                                        value={editForm.priority}
                                        onChange={(e) => setEditForm({ ...editForm, priority: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm
                                            focus:border-indigo-500 focus:bg-white focus:outline-none"
                                    >
                                        <option value="LOW">Low</option>
                                        <option value="MEDIUM">Medium</option>
                                        <option value="HIGH">High</option>
                                    </select>
                                </div>
                                <div>
                                    <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                        📅 Due Date
                                    </label>
                                    <input
                                        type="date"
                                        value={editForm.dueDate}
                                        onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                                        className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm
                                            focus:border-indigo-500 focus:bg-white focus:outline-none"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    📁 Category
                                </label>
                                <select
                                    value={editForm.categoryId}
                                    onChange={(e) => setEditForm({ ...editForm, categoryId: e.target.value })}
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm
                                        focus:border-indigo-500 focus:bg-white focus:outline-none"
                                >
                                    <option value="">No Category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <div className="relative">
                                        <input
                                            type="checkbox"
                                            checked={editForm.isPublic}
                                            onChange={(e) => setEditForm({ ...editForm, isPublic: e.target.checked })}
                                            className="sr-only peer"
                                        />
                                        <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                                        <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-700">🌐 Make this task public</p>
                                        <p className="text-xs text-slate-500">Other users will be able to view this task</p>
                                    </div>
                                </label>
                            </div>

                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={handleSave}
                                    className="flex-1 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600
                                        text-white py-3 rounded-xl text-sm font-bold shadow-lg shadow-emerald-500/30 transition-all"
                                >
                                    💾 Save Changes
                                </button>
                                <button
                                    onClick={() => setIsEditing(false)}
                                    className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-700 py-3 rounded-xl text-sm font-bold transition-all"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    ) : (
                        /* View Mode */
                        <div className="space-y-8">
                            {/* Description Section */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                                    📄 Description
                                </h3>
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <p className="text-slate-700 whitespace-pre-wrap">
                                        {task.description || 'No description provided.'}
                                    </p>
                                </div>
                            </div>

                            {/* Details Grid */}
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className={`${priorityConfig.lightBg} rounded-xl p-4 border border-slate-200`}>
                                    <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                                        🎯 Priority
                                    </h3>
                                    <p className={`text-lg font-bold ${priorityConfig.textColor} flex items-center gap-2`}>
                                        {priorityConfig.icon} {task.priority}
                                    </p>
                                </div>

                                <div className="bg-blue-50 rounded-xl p-4 border border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                                        📅 Due Date
                                    </h3>
                                    <p className="text-lg font-bold text-blue-700">
                                        {formatDate(task.dueDate)}
                                    </p>
                                </div>

                                <div className="bg-purple-50 rounded-xl p-4 border border-slate-200">
                                    <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                                        📁 Category
                                    </h3>
                                    <p className="text-lg font-bold text-purple-700">
                                        {task.category?.name || 'Uncategorized'}
                                    </p>
                                </div>

                                <div className={`${task.status === 'COMPLETED' ? 'bg-emerald-50' : 'bg-amber-50'} rounded-xl p-4 border border-slate-200`}>
                                    <h3 className="text-sm font-semibold text-slate-500 mb-2 flex items-center gap-2">
                                        📊 Status
                                    </h3>
                                    <p className={`text-lg font-bold ${task.status === 'COMPLETED' ? 'text-emerald-700' : 'text-amber-700'}`}>
                                        {task.status === 'COMPLETED' ? '✅ Completed' : '⏳ Pending'}
                                    </p>
                                </div>
                            </div>

                            {/* Attachment Section */}
                            <div>
                                <h3 className="text-sm font-semibold text-slate-500 mb-3 flex items-center gap-2">
                                    📎 Attachment
                                </h3>
                                {task.attachmentPath ? (
                                    <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                        {isImageFile(task.attachmentPath) ? (
                                            <div className="space-y-3">
                                                <a
                                                    href={getAttachmentUrl(task.attachmentPath)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                >
                                                    <img
                                                        src={getAttachmentUrl(task.attachmentPath)}
                                                        alt="Attachment"
                                                        className="max-w-full max-h-96 object-contain rounded-lg hover:opacity-90 transition-opacity cursor-pointer mx-auto"
                                                    />
                                                </a>
                                                <a
                                                    href={getAttachmentUrl(task.attachmentPath)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:text-indigo-800"
                                                >
                                                    <span>📥</span> Download Image
                                                </a>
                                            </div>
                                        ) : (
                                            <a
                                                href={getAttachmentUrl(task.attachmentPath)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 text-indigo-600 hover:text-indigo-800 transition-colors"
                                            >
                                                <span className="text-4xl">{getFileIcon(task.attachmentPath)}</span>
                                                <div>
                                                    <p className="font-medium">{task.attachmentPath}</p>
                                                    <p className="text-sm text-slate-500">Click to download</p>
                                                </div>
                                            </a>
                                        )}
                                    </div>
                                ) : (
                                    <div className="bg-slate-50 rounded-xl p-6 border-2 border-dashed border-slate-300 text-center">
                                        <p className="text-slate-500 mb-3">No attachment yet</p>
                                        <button
                                            onClick={() => fileInputRef.current?.click()}
                                            disabled={uploadingFile}
                                            className="inline-flex items-center gap-2 bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-50"
                                        >
                                            {uploadingFile ? (
                                                <>
                                                    <div className="animate-spin w-4 h-4 border-2 border-indigo-600 border-t-transparent rounded-full"></div>
                                                    Uploading...
                                                </>
                                            ) : (
                                                <>📤 Upload File</>
                                            )}
                                        </button>
                                        <input
                                            ref={fileInputRef}
                                            type="file"
                                            onChange={handleFileUpload}
                                            className="hidden"
                                            accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
                                        />
                                    </div>
                                )}
                            </div>

                            {/* Timestamps */}
                            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                <div className="grid md:grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-slate-500">Created:</span>
                                        <span className="ml-2 text-slate-700 font-medium">{formatDateTime(task.createdAt)}</span>
                                    </div>
                                    <div>
                                        <span className="text-slate-500">Last Updated:</span>
                                        <span className="ml-2 text-slate-700 font-medium">{formatDateTime(task.updatedAt)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Action Buttons */}
                            <div className="flex flex-wrap gap-3 pt-4 border-t border-slate-200">
                                <button
                                    onClick={handleToggleStatus}
                                    className={`flex-1 min-w-[140px] flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-bold transition-all ${task.status === 'COMPLETED'
                                            ? 'bg-slate-200 hover:bg-slate-300 text-slate-700'
                                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-black shadow-lg shadow-emerald-500/30'
                                        }`}
                                >
                                    {task.status === 'COMPLETED' ? '↩️ Mark as Pending' : '✅ Mark as Complete'}
                                </button>
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600
                                        text-black py-3 rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/30 transition-all"
                                >
                                    ✏️ Edit Task
                                </button>
                                <button
                                    onClick={handleDelete}
                                    className="flex-1 min-w-[140px] flex items-center justify-center gap-2 bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600
                                        text-black py-3 rounded-xl text-sm font-bold shadow-lg shadow-red-500/30 transition-all"
                                >
                                    🗑️ Delete Task
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
