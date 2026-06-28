'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiPlus, FiEdit2, FiTrash2, FiUpload, FiX, FiSave, FiTag } from 'react-icons/fi';
import { getCategories, createCategory, updateCategory, deleteCategory } from '@/lib/firestore';
import { uploadCategoryImage } from '@/lib/storage';
import type { Category } from '@/types';
import { MOCK_CATEGORIES } from '@/lib/mockData';
import toast from 'react-hot-toast';

const ICONS = ['💻', '🖥️', '🎮', '📡', '📷', '⚙️', '🖱️', '⌨️', '🔌', '📱'];

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<Category | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '💻', description: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data.length ? data : MOCK_CATEGORIES);
    } catch {
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditing(null);
    setForm({ name: '', slug: '', icon: '💻', description: '' });
    setImageFile(null);
    setImagePreview('');
    setShowModal(true);
  };

  const openEdit = (cat: Category) => {
    setEditing(cat);
    setForm({
      name: cat.name,
      slug: cat.slug || '',
      icon: cat.icon || '💻',
      description: cat.description || '',
    });
    setImagePreview(cat.image || '');
    setImageFile(null);
    setShowModal(true);
  };

  const handleNameChange = (name: string) => {
    setForm(f => ({
      ...f,
      name,
      slug: f.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    }));
  };

  const handleImage = (file: File) => {
    setImageFile(file);
    const reader = new FileReader();
    reader.onload = e => setImagePreview(e.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Category name is required');

    setSaving(true);
    try {
      let image = editing?.image || '';
      if (imageFile) {
        const catId = editing?.id || `cat-${Date.now()}`;
        image = await uploadCategoryImage(imageFile, catId);
      }

      const payload = {
        name: form.name.trim(),
        slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-'),
        icon: form.icon,
        description: form.description.trim(),
        image,
        updatedAt: new Date(),
      };

      if (editing) {
        await updateCategory(editing.id, payload);
        setCategories(prev => prev.map(c => c.id === editing.id ? { ...c, ...payload } : c));
        toast.success('Category updated!');
      } else {
        const id = await createCategory({ ...payload, createdAt: new Date() });
        setCategories(prev => [...prev, { id, ...payload, createdAt: new Date() }]);
        toast.success('Category created!');
      }
      setShowModal(false);
    } catch {
      toast.success(editing ? 'Category updated (demo)!' : 'Category created (demo)!');
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted');
    } catch {
      setCategories(prev => prev.filter(c => c.id !== id));
      toast.success('Category deleted (demo)');
    } finally {
      setDeleteConfirm(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Categories</h1>
          <p className="text-sm text-gray-400">{categories.length} total</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-teal transition-colors"
        >
          <FiPlus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="bg-white rounded-xl h-28 animate-pulse" />)}
        </div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((cat, i) => (
            <motion.div
              key={cat.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden group"
            >
              {/* Image */}
              <div className="relative h-32 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
                {cat.image ? (
                  <img src={cat.image} alt={cat.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-4xl">
                    {cat.icon || <FiTag className="w-8 h-8 text-gray-400" />}
                  </div>
                )}
                {/* Hover actions */}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                  <button
                    onClick={() => openEdit(cat)}
                    className="p-2 bg-white rounded-xl text-brand-teal hover:bg-brand-teal hover:text-white transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => setDeleteConfirm(cat.id)}
                    className="p-2 bg-white rounded-xl text-red-500 hover:bg-red-500 hover:text-white transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="p-4">
                <div className="font-semibold text-gray-900 text-sm">{cat.name}</div>
                {cat.description && (
                  <div className="text-xs text-gray-400 mt-1 line-clamp-2">{cat.description}</div>
                )}
                <div className="flex items-center justify-between mt-3">
                  <span className="text-xs text-gray-400 font-mono">{cat.slug || cat.id}</span>
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => openEdit(cat)}
                      className="p-1.5 text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors"
                    >
                      <FiEdit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirm(cat.id)}
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="fixed inset-0 bg-black/50 z-50" />
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-md bg-white rounded-2xl z-50 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{editing ? 'Edit Category' : 'New Category'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Image */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Category Image</label>
                  <div
                    onClick={() => fileRef.current?.click()}
                    className="relative h-36 rounded-xl border-2 border-dashed border-gray-200 hover:border-brand-teal overflow-hidden cursor-pointer transition-colors group"
                  >
                    {imagePreview ? (
                      <img src={imagePreview} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-gray-400 group-hover:text-brand-teal">
                        <FiUpload className="w-6 h-6 mb-2" />
                        <span className="text-xs">Click to upload image</span>
                      </div>
                    )}
                  </div>
                  <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={e => e.target.files?.[0] && handleImage(e.target.files[0])} />
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-2">Icon</label>
                  <div className="flex flex-wrap gap-2">
                    {ICONS.map(icon => (
                      <button
                        key={icon}
                        onClick={() => setForm(f => ({ ...f, icon }))}
                        className={`w-9 h-9 rounded-lg text-lg flex items-center justify-center transition-all ${
                          form.icon === icon ? 'bg-brand-teal/20 ring-2 ring-brand-teal' : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                      >
                        {icon}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Name */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Name *</label>
                  <input
                    value={form.name}
                    onChange={e => handleNameChange(e.target.value)}
                    placeholder="e.g. Laptops"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                  />
                </div>

                {/* Slug */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Slug</label>
                  <input
                    value={form.slug}
                    onChange={e => setForm(f => ({ ...f, slug: e.target.value }))}
                    placeholder="auto-generated"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal font-mono text-gray-500"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={2}
                    placeholder="Brief description…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 px-5 py-4 border-t border-gray-100 bg-gray-50">
                <button onClick={() => setShowModal(false)} className="text-sm text-gray-500 px-4 py-2">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-teal transition-colors disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {saving ? 'Saving…' : editing ? 'Update' : 'Create'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Delete confirm */}
      <AnimatePresence>
        {deleteConfirm && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 bg-black/60 z-50" />
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }}
              className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 bg-white rounded-2xl p-6 z-50 w-80 shadow-2xl"
            >
              <h3 className="font-bold text-gray-900 mb-2">Delete Category?</h3>
              <p className="text-sm text-gray-500 mb-5">Products in this category will not be deleted, but they will lose their category association.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
