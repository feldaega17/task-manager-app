// src/pages/CategoriesPage.jsx
import { useEffect, useState } from 'react';
import { api } from '../api';

export default function CategoriesPage() {
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState(null);
    const [editName, setEditName] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/categories');
            setCategories(Array.isArray(res.data) ? res.data : res.data.items || []);
        } catch (err) {
            console.error('Failed to fetch categories', err);
            setError('Failed to load categories');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCategories();
    }, []);

    const createCategory = async (e) => {
        e.preventDefault();
        if (!newCategory.trim()) {
            setError('Category name cannot be empty');
            return;
        }

        try {
            setError('');
            await api.post('/categories', { name: newCategory });
            setSuccess('Category created!');
            setNewCategory('');
            await fetchCategories();
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to create category');
            console.error(err);
        }
    };

    const updateCategory = async (id) => {
        if (!editName.trim()) {
            setError('Category name cannot be empty');
            return;
        }

        try {
            setError('');
            await api.patch(`/categories/${id}`, { name: editName });
            setSuccess('Category updated!');
            setEditingId(null);
            await fetchCategories();
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Failed to update category');
            console.error(err);
        }
    };

    const deleteCategory = async (id) => {
        if (!window.confirm('Are you sure? Tasks assigned to this category will lose their category.')) return;

        try {
            setError('');
            await api.delete(`/categories/${id}`);
            setSuccess('Category deleted!');
            await fetchCategories();
            setTimeout(() => setSuccess(''), 2000);
        } catch (err) {
            setError('Failed to delete category');
            console.error(err);
        }
    };

    const startEditing = (category) => {
        setEditingId(category.id);
        setEditName(category.name);
    };

    const cancelEditing = () => {
        setEditingId(null);
        setEditName('');
    };

    const categoryColors = [
        'from-indigo-500 to-purple-500',
        'from-emerald-500 to-teal-500',
        'from-amber-500 to-orange-500',
        'from-rose-500 to-pink-500',
        'from-cyan-500 to-blue-500',
        'from-violet-500 to-fuchsia-500',
    ];

    return (
        <div className="max-w-3xl mx-auto space-y-6">
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

            {/* Create Category Form */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
                            <span className="text-xl">✨</span>
                        </div>
                        <div>
                            <h2 className="font-bold text-white">Create New Category</h2>
                            <p className="text-indigo-200 text-xs">Organize your tasks better</p>
                        </div>
                    </div>
                </div>
                <div className="p-6">
                    <form onSubmit={createCategory} className="flex gap-3">
                        <div className="flex-1 relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">📁</span>
                            <input
                                type="text"
                                value={newCategory}
                                onChange={(e) => setNewCategory(e.target.value)}
                                placeholder="Enter category name (e.g., Work, Personal, Shopping...)"
                                className="w-full bg-slate-50 border-2 border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm
                                    focus:border-indigo-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-indigo-500/10
                                    transition-all duration-200"
                            />
                        </div>
                        <button
                            type="submit"
                            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700
                                text-white px-6 py-3 rounded-xl text-sm font-semibold
                                shadow-lg shadow-indigo-500/30 hover:shadow-xl hover:shadow-indigo-500/40
                                transition-all duration-200 transform hover:scale-105
                                flex items-center gap-2"
                        >
                            <span>➕</span>
                            <span style={{ color: 'black' }}>Create</span>
                        </button>
                    </form>
                </div>
            </div>

            {/* Categories List */}
            <div className="bg-white/70 backdrop-blur-lg rounded-2xl border border-slate-200/50 shadow-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">📁</span>
                            <div>
                                <h2 className="font-bold text-slate-800">Your Categories</h2>
                                <p className="text-xs text-slate-500">{categories.length} categories</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-6">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-12">
                            <div className="animate-spin w-10 h-10 border-4 border-indigo-500 border-t-transparent rounded-full mb-4"></div>
                            <p className="text-slate-500">Loading categories...</p>
                        </div>
                    ) : categories.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-6xl mb-4">📂</div>
                            <h3 className="text-xl font-bold text-slate-800 mb-2">No categories yet</h3>
                            <p className="text-slate-500">Create your first category to organize tasks! 🎯</p>
                        </div>
                    ) : (
                        <div className="grid gap-3">
                            {categories.map((category, index) => (
                                <div
                                    key={category.id}
                                    className={`
                                        group flex items-center justify-between gap-4 p-4 rounded-xl border-2 transition-all duration-200
                                        ${editingId === category.id
                                            ? 'border-indigo-500 bg-indigo-50 ring-4 ring-indigo-500/20'
                                            : 'border-slate-200 hover:border-indigo-200 hover:shadow-md bg-white'
                                        }
                                    `}
                                >
                                    {editingId === category.id ? (
                                        <div className="flex-1 flex items-center gap-3">
                                            <input
                                                type="text"
                                                value={editName}
                                                onChange={(e) => setEditName(e.target.value)}
                                                className="flex-1 bg-white border-2 border-slate-200 rounded-xl px-4 py-2.5 text-sm
                                                    focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10"
                                                placeholder="Category name"
                                                autoFocus
                                            />
                                            <button
                                                onClick={() => updateCategory(category.id)}
                                                className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600
                                                    text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg shadow-emerald-500/30 transition-all"
                                            >
                                                💾 Save
                                            </button>
                                            <button
                                                onClick={cancelEditing}
                                                className="bg-slate-200 hover:bg-slate-300 text-slate-700 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="flex items-center gap-4">
                                                <div className={`w-12 h-12 bg-gradient-to-br ${categoryColors[index % categoryColors.length]} 
                                                    rounded-xl flex items-center justify-center text-white font-bold shadow-lg`}>
                                                    {category.name.charAt(0).toUpperCase()}
                                                </div>
                                                <div>
                                                    <h3 className="font-semibold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                                        {category.name}
                                                    </h3>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <span>📋</span> {category.tasks?.length || 0} task(s)
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button
                                                    onClick={() => startEditing(category)}
                                                    className="bg-indigo-100 hover:bg-indigo-200 text-indigo-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all
                                                        flex items-center gap-1"
                                                >
                                                    ✏️ Edit
                                                </button>
                                                <button
                                                    onClick={() => deleteCategory(category.id)}
                                                    className="bg-red-100 hover:bg-red-200 text-red-700 px-4 py-2 rounded-xl text-xs font-semibold transition-all
                                                        flex items-center gap-1"
                                                >
                                                    🗑️ Delete
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Info Box */}
            <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-2xl p-5 border border-indigo-200">
                <div className="flex gap-4">
                    <div className="text-3xl">💡</div>
                    <div>
                        <h4 className="font-bold text-indigo-900 mb-1">Pro Tip</h4>
                        <p className="text-sm text-indigo-700">
                            Categories help organize your tasks efficiently. Create categories like "Work", "Personal", "Shopping", etc.,
                            then assign tasks to them when creating or editing. This makes it easier to filter and find tasks!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
