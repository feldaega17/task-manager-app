// src/pages/NewTaskPage.jsx
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function NewTaskPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef(null);
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'LOW',
        dueDate: '',
        categoryId: null,
        isPublic: false,
    });
    const [file, setFile] = useState(null);
    const [filePreview, setFilePreview] = useState(null);
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await api.get('/categories');
                setCategories(response.data.items || response.data);
            } catch (err) {
                console.error('Error fetching categories:', err);
            }
        };
        fetchCategories();
    }, []);

    const onChange = (e) => {
        const { name, value, type, checked } = e.target;
        setForm((f) => ({
            ...f,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const onFileChange = (e) => {
        const selectedFile = e.target.files[0];
        if (selectedFile) {
            // Check file size (max 5MB)
            if (selectedFile.size > 5 * 1024 * 1024) {
                setError('File size must be less than 5MB');
                return;
            }
            setFile(selectedFile);

            // Create preview for images
            if (selectedFile.type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setFilePreview(reader.result);
                };
                reader.readAsDataURL(selectedFile);
            } else {
                setFilePreview(null);
            }
        }
    };

    const removeFile = () => {
        setFile(null);
        setFilePreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
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

    const formatFileSize = (bytes) => {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    };

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        setUploadProgress(0);

        try {
            // Step 1: Create the task
            const taskResponse = await api.post('/tasks', {
                title: form.title,
                description: form.description,
                priority: form.priority,
                dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
                categoryId: form.categoryId ? parseInt(form.categoryId) : null,
                isPublic: form.isPublic,
            });

            const taskId = taskResponse.data.id;

            // Step 2: Upload file if selected
            if (file && taskId) {
                setUploadProgress(10);
                const formData = new FormData();
                formData.append('file', file);

                await api.post(`/tasks/${taskId}/attachment`, formData, {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    },
                    onUploadProgress: (progressEvent) => {
                        const progress = Math.round((progressEvent.loaded * 90) / progressEvent.total) + 10;
                        setUploadProgress(progress);
                    },
                });
            }

            navigate('/');
        } catch (err) {
            console.error('Task creation error:', err);
            const errMsg = err.response?.data?.message || err.message || 'Failed to create task';
            setError(errMsg);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    const getPriorityConfig = (priority) => {
        switch (priority) {
            case 'HIGH':
                return { color: 'from-red-500 to-rose-500', icon: '🔥', label: 'High Priority' };
            case 'MEDIUM':
                return { color: 'from-amber-400 to-orange-400', icon: '⚡', label: 'Medium Priority' };
            default:
                return { color: 'from-emerald-400 to-teal-400', icon: '🌱', label: 'Low Priority' };
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="bg-white/70 backdrop-blur-lg rounded-3xl shadow-xl border border-slate-200/50 overflow-hidden">
                {/* Header */}
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-8 py-6">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center">
                            <span className="text-2xl">✨</span>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-white">Create New Task</h2>
                            <p className="text-indigo-200 text-sm">Fill in the details below</p>
                        </div>
                    </div>
                </div>

                <div className="p-8 space-y-6">
                    {/* Error Alert */}
                    {error && (
                        <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl p-4 text-red-700 text-sm">
                            <span className="text-xl">❌</span>
                            <p>{error}</p>
                            <button onClick={() => setError('')} className="ml-auto text-red-400 hover:text-red-600 text-xl">×</button>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={onSubmit}>
                        {/* Title */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                <span>📝</span> Task Title
                            </label>
                            <input
                                name="title"
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm
                                    focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10
                                    transition-all duration-200"
                                placeholder="What needs to be done?"
                                value={form.title}
                                onChange={onChange}
                                required
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                <span>📄</span> Description
                            </label>
                            <textarea
                                name="description"
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm
                                    focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10
                                    transition-all duration-200 resize-none"
                                placeholder="Add more details about this task..."
                                value={form.description}
                                onChange={onChange}
                                rows={4}
                            />
                        </div>

                        {/* Priority Selection */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-3">
                                <span>🎯</span> Priority Level
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {['LOW', 'MEDIUM', 'HIGH'].map((p) => {
                                    const config = getPriorityConfig(p);
                                    return (
                                        <button
                                            key={p}
                                            type="button"
                                            onClick={() => setForm(f => ({ ...f, priority: p }))}
                                            className={`
                                                relative p-4 rounded-xl border-2 transition-all duration-200
                                                ${form.priority === p
                                                    ? `bg-gradient-to-r ${config.color} text-white border-transparent shadow-lg`
                                                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700'
                                                }
                                            `}
                                        >
                                            <span className="text-2xl">{config.icon}</span>
                                            <p className="text-xs font-semibold mt-1">{p}</p>
                                            {form.priority === p && (
                                                <span className="absolute top-2 right-2 w-2 h-2 bg-white rounded-full"></span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Date and Category Row */}
                        <div className="grid md:grid-cols-2 gap-4">
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <span>📅</span> Due Date
                                </label>
                                <input
                                    type="date"
                                    name="dueDate"
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm
                                        focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10
                                        transition-all duration-200"
                                    value={form.dueDate}
                                    onChange={onChange}
                                />
                            </div>
                            <div>
                                <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                    <span>📁</span> Category
                                </label>
                                <select
                                    name="categoryId"
                                    className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl px-4 py-3 text-sm
                                        focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10
                                        transition-all duration-200 cursor-pointer"
                                    value={form.categoryId || ''}
                                    onChange={onChange}
                                >
                                    <option value="">Select a category</option>
                                    {categories.map((cat) => (
                                        <option key={cat.id} value={cat.id}>
                                            {cat.name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Public Toggle */}
                        <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl p-4 border border-indigo-100">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        name="isPublic"
                                        checked={form.isPublic}
                                        onChange={onChange}
                                        className="sr-only peer"
                                    />
                                    <div className="w-11 h-6 bg-slate-300 rounded-full peer peer-checked:bg-indigo-600 transition-colors"></div>
                                    <div className="absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform peer-checked:translate-x-5"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-semibold text-slate-700">
                                        🌐 Make this task public
                                    </p>
                                    <p className="text-xs text-slate-500">
                                        Other users will be able to view this task
                                    </p>
                                </div>
                            </label>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="flex items-center gap-2 text-sm font-semibold text-slate-700 mb-2">
                                <span>📎</span> Attachment
                            </label>

                            {!file ? (
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className="border-2 border-dashed border-slate-300 rounded-xl p-8 text-center cursor-pointer
                                        hover:border-indigo-400 hover:bg-indigo-50/50 transition-all duration-200"
                                >
                                    <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                        <span className="text-3xl">📤</span>
                                    </div>
                                    <p className="text-sm font-medium text-slate-700">
                                        Click to upload a file
                                    </p>
                                    <p className="text-xs text-slate-500 mt-1">
                                        Documents, images, etc. (Max 5MB)
                                    </p>
                                </div>
                            ) : (
                                <div className="bg-slate-50 border-2 border-slate-200 rounded-xl p-4">
                                    <div className="flex items-center gap-4">
                                        {/* File Preview or Icon */}
                                        {filePreview ? (
                                            <img
                                                src={filePreview}
                                                alt="Preview"
                                                className="w-16 h-16 object-cover rounded-lg border border-slate-200"
                                            />
                                        ) : (
                                            <div className="w-16 h-16 bg-indigo-100 rounded-lg flex items-center justify-center">
                                                <span className="text-3xl">{getFileIcon(file.name)}</span>
                                            </div>
                                        )}

                                        {/* File Info */}
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-slate-700 truncate">
                                                {file.name}
                                            </p>
                                            <p className="text-xs text-slate-500 mt-0.5">
                                                {formatFileSize(file.size)}
                                            </p>
                                        </div>

                                        {/* Remove Button */}
                                        <button
                                            type="button"
                                            onClick={removeFile}
                                            className="w-8 h-8 bg-red-100 hover:bg-red-200 text-red-600 rounded-full flex items-center justify-center transition-colors"
                                        >
                                            ✕
                                        </button>
                                    </div>

                                    {/* Upload Progress */}
                                    {loading && uploadProgress > 0 && (
                                        <div className="mt-3">
                                            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300"
                                                    style={{ width: `${uploadProgress}%` }}
                                                ></div>
                                            </div>
                                            <p className="text-xs text-slate-500 mt-1 text-center">
                                                Uploading... {uploadProgress}%
                                            </p>
                                        </div>
                                    )}
                                </div>
                            )}

                            <input
                                ref={fileInputRef}
                                type="file"
                                onChange={onFileChange}
                                className="hidden"
                                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.zip,.rar,.jpg,.jpeg,.png,.gif,.mp4,.mp3"
                            />
                        </div>

                        {/* Submit Button */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
                                text-white py-4 rounded-xl text-sm font-bold
                                shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40
                                transition-all duration-200 transform hover:scale-[1.02]
                                disabled:opacity-60 disabled:cursor-not-allowed disabled:transform-none
                                flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                                    Creating...
                                </>
                            ) : (
                                <>
                                    <span>🚀</span>
                                    <span style={{ color: 'black' }}>Create Task</span> {/* <--- Tambahkan style di sini */}
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
