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

    return (
        <div className="max-w-2xl mx-auto space-y-4">
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

            {/* Create Category Form */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">✨ Create New Category</h2>
                <form onSubmit={createCategory} className="flex gap-2">
                    <input
                        type="text"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}
                        placeholder="Enter category name (e.g., Work, Personal, Shopping...)"
                        className="flex-1 border-2 border-slate-200 rounded-lg px-4 py-2 text-sm focus:border-blue-500 focus:outline-none transition-all"
                    />
                    <button
                        type="submit"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg text-sm font-medium transition-all"
                    >
                        Create
                    </button>
                </form>
            </div>

            {/* Categories List */}
            <div className="bg-white rounded-xl border border-slate-200 p-6">
                <h2 className="text-lg font-semibold text-slate-800 mb-4">📁 Your Categories</h2>

                {loading ? (
                    <div className="text-center py-8 text-slate-500">Loading categories...</div>
                ) : categories.length === 0 ? (
                    <div className="text-center py-8 text-slate-500">
                        No categories yet. Create one to get started! 🎯
                    </div>
                ) : (
                    <div className="space-y-2">
                        {categories.map((category) => (
                            <div
                                key={category.id}
                                className={`flex items-center justify-between gap-3 p-4 rounded-lg border transition-all ${
                                    editingId === category.id
                                        ? 'border-blue-500 bg-blue-50'
                                        : 'border-slate-200 hover:bg-slate-50'
                                }`}
                            >
                                {editingId === category.id ? (
                                    <div className="flex-1 flex gap-2">
                                        <input
                                            type="text"
                                            value={editName}
                                            onChange={(e) => setEditName(e.target.value)}
                                            className="flex-1 border-2 border-slate-200 rounded-lg px-3 py-1 text-sm focus:border-blue-500 focus:outline-none"
                                            placeholder="Category name"
                                        />
                                        <button
                                            onClick={() => updateCategory(category.id)}
                                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-lg text-sm font-medium transition-all"
                                        >
                                            Save
                                        </button>
                                        <button
                                            onClick={cancelEditing}
                                            className="bg-slate-300 hover:bg-slate-400 text-slate-800 px-4 py-1 rounded-lg text-sm font-medium transition-all"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                ) : (
                                    <>
                                        <div>
                                            <h3 className="font-medium text-slate-800">{category.name}</h3>
                                            <p className="text-xs text-slate-500">
                                                {category.tasks?.length || 0} task(s)
                                            </p>
                                        </div>
                                        <div className="flex gap-2">
                                            <button
                                                onClick={() => startEditing(category)}
                                                className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-3 py-1 rounded-lg text-xs font-medium transition-all"
                                            >
                                                Edit
                                            </button>
                                            <button
                                                onClick={() => deleteCategory(category.id)}
                                                className="bg-red-100 hover:bg-red-200 text-red-700 px-3 py-1 rounded-lg text-xs font-medium transition-all"
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

            {/* Info Box */}
            <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                <p className="text-sm text-blue-900">
                    <strong>💡 Tip:</strong> Categories help organize your tasks. Create categories like "Work", "Personal", "Shopping", etc., then assign tasks to them when creating or editing.
                </p>
            </div>
        </div>
    );
}
