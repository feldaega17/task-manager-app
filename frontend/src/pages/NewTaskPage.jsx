// src/pages/NewTaskPage.jsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api';

export default function NewTaskPage() {
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        priority: 'LOW',
        dueDate: '',
        categoryId: null,
        isPublic: false,
    });
    const [error, setError] = useState('');
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);

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

    const onSubmit = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await api.post('/tasks', {
                title: form.title,
                description: form.description,
                priority: form.priority,
                dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : null,
                categoryId: form.categoryId ? parseInt(form.categoryId) : null,
                isPublic: form.isPublic,
            });
            navigate('/');
        } catch (err) {
            console.error('Task creation error:', err);
            const errMsg = err.response?.data?.message || err.message || 'Failed to create task';
            setError(errMsg);
        }
    };

    return (
        <div className="max-w-xl bg-white rounded-2xl shadow border border-slate-200 p-6 space-y-4">
            <h2 className="text-lg font-semibold text-slate-800">New Task</h2>

            {error && (
                <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded p-2">
                    {error}
                </div>
            )}

            <form className="space-y-4" onSubmit={onSubmit}>
                <div>
                    <label className="block text-sm mb-1">Title</label>
                    <input
                        name="title"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={form.title}
                        onChange={onChange}
                        required
                    />
                </div>
                <div>
                    <label className="block text-sm mb-1">Description</label>
                    <textarea
                        name="description"
                        className="w-full border rounded-lg px-3 py-2 text-sm"
                        value={form.description}
                        onChange={onChange}
                        rows={3}
                    />
                </div>
                <div className="flex flex-wrap gap-4">
                    <div>
                        <label className="block text-sm mb-1">Priority</label>
                        <select
                            name="priority"
                            className="border rounded-lg px-3 py-2 text-sm"
                            value={form.priority}
                            onChange={onChange}
                        >
                            <option value="LOW">LOW</option>
                            <option value="MEDIUM">MEDIUM</option>
                            <option value="HIGH">HIGH</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Due Date</label>
                        <input
                            type="date"
                            name="dueDate"
                            className="border rounded-lg px-3 py-2 text-sm"
                            value={form.dueDate}
                            onChange={onChange}
                        />
                    </div>
                    <div>
                        <label className="block text-sm mb-1">Category</label>
                        <select
                            name="categoryId"
                            className="border rounded-lg px-3 py-2 text-sm"
                            value={form.categoryId || ''}
                            onChange={onChange}
                        >
                            <option value="">No Category</option>
                            {categories.map((cat) => (
                                <option key={cat.id} value={cat.id}>
                                    {cat.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        name="isPublic"
                        checked={form.isPublic}
                        onChange={onChange}
                    />
                    <span className="text-xs text-slate-600">
                        Make this task public (for other users to view)
                    </span>
                </div>
                <button
                    type="submit"
                    className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm"
                >
                    Create
                </button>
            </form>
        </div>
    );
}
