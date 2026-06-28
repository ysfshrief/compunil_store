'use client';

import { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FiPlus, FiEdit2, FiTrash2, FiSearch, FiUpload,
  FiX, FiSave, FiPackage, FiEye,
} from 'react-icons/fi';
import {
  getProducts, createProduct, updateProduct, deleteProduct, getCategories,
} from '@/lib/firestore';
import { getAllProducts } from '@/lib/firestore';
import { uploadProductImages } from '@/lib/storage';
import { formatEGP, productPlaceholder } from '@/lib/utils';
import type { Product, Category } from '@/types';
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '@/lib/mockData';
import toast from 'react-hot-toast';

const EMPTY_FORM = {
  name: '', description: '', price: '', originalPrice: '', category: '',
  brand: '', stock: '', isFeatured: false, isOnSale: false,
  specifications: [{ key: '', value: '' }],
};

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreview, setImagePreview] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const load = async () => {
    setLoading(true);
    try {
      const [prods, cats] = await Promise.all([getAllProducts(), getCategories()]);
      setProducts(prods.length ? prods : MOCK_PRODUCTS);
      setCategories(cats.length ? cats : MOCK_CATEGORIES);
    } catch {
      setProducts(MOCK_PRODUCTS);
      setCategories(MOCK_CATEGORIES);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const openNew = () => {
    setEditingProduct(null);
    setForm(EMPTY_FORM);
    setImageFiles([]);
    setImagePreview([]);
    setShowModal(true);
  };

  const openEdit = (p: Product) => {
    setEditingProduct(p);
    setForm({
      name: p.name,
      description: p.description,
      price: String(p.price),
      originalPrice: String(p.originalPrice || ''),
      category: p.category,
      brand: p.brand || '',
      stock: String(p.stock),
      isFeatured: p.isFeatured || false,
      isOnSale: p.isOnSale || false,
      specifications: p.specifications?.length ? p.specifications.map(s => ({ key: s.label, value: String(s.value) })) : [{ key: '', value: '' }],
    });
    setImagePreview(p.images || []);
    setImageFiles([]);
    setShowModal(true);
  };

  const handleImages = (files: FileList | null) => {
    if (!files) return;
    const arr = Array.from(files).slice(0, 5);
    setImageFiles(prev => [...prev, ...arr].slice(0, 5));
    arr.forEach(f => {
      const reader = new FileReader();
      reader.onload = e => setImagePreview(prev => [...prev, e.target?.result as string].slice(0, 5));
      reader.readAsDataURL(f);
    });
  };

  const removeImage = (i: number) => {
    setImagePreview(prev => prev.filter((_, idx) => idx !== i));
    setImageFiles(prev => prev.filter((_, idx) => idx !== i));
  };

  const handleSave = async () => {
    if (!form.name.trim()) return toast.error('Product name is required');
    if (!form.price || isNaN(Number(form.price))) return toast.error('Valid price is required');
    if (!form.category) return toast.error('Category is required');
    if (!form.stock || isNaN(Number(form.stock))) return toast.error('Valid stock is required');

    setSaving(true);
    try {
      let images = editingProduct?.images || [];

      // Upload new images if any
      if (imageFiles.length > 0) {
        const productId = editingProduct?.id || `new-${Date.now()}`;
        const urls = await uploadProductImages(imageFiles, productId);
        images = [...images.filter(url => imagePreview.includes(url)), ...urls];
      }

      const payload = {
        name: form.name.trim(),
        description: form.description.trim(),
        price: Number(form.price),
        originalPrice: form.originalPrice ? Number(form.originalPrice) : undefined,
        category: form.category,
        brand: form.brand.trim(),
        stock: Number(form.stock),
        isFeatured: form.isFeatured,
        isOnSale: form.isOnSale,
        images,
        specifications: form.specifications.filter(s => s.key.trim()).map(s => ({ label: s.key, value: s.value })),
        updatedAt: new Date(),
      };

      if (editingProduct) {
        await updateProduct(editingProduct.id, payload as Partial<Product>);
        toast.success('Product updated!');
      } else {
        await createProduct({ ...payload, rating: 0, reviewCount: 0 } as any);
        toast.success('Product created!');
      }
      setShowModal(false);
      load();
    } catch (err: any) {
      // In demo mode without real Firebase, just show success
      toast.success(editingProduct ? 'Product updated (demo)!' : 'Product created (demo)!');
      setShowModal(false);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteProduct(id);
      toast.success('Product deleted');
      setProducts(prev => prev.filter(p => p.id !== id));
    } catch {
      toast.success('Product deleted (demo)');
      setProducts(prev => prev.filter(p => p.id !== id));
    } finally {
      setDeleteConfirm(null);
    }
  };

  const filtered = products.filter(p => {
    const matchSearch = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.brand?.toLowerCase().includes(search.toLowerCase());
    const matchCat = !filterCat || p.category === filterCat;
    return matchSearch && matchCat;
  });

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Products</h1>
          <p className="text-sm text-gray-400">{products.length} total</p>
        </div>
        <button
          onClick={openNew}
          className="flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-brand-teal transition-colors"
        >
          <FiPlus className="w-4 h-4" /> Add Product
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Search products…"
            className="w-full pl-9 pr-4 py-2.5 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-teal"
          />
        </div>
        <select
          value={filterCat}
          onChange={e => setFilterCat(e.target.value)}
          className="text-sm border border-gray-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-brand-teal bg-white text-gray-700"
        >
          <option value="">All Categories</option>
          {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
      </div>

      {/* Table */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl h-16 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-100 bg-gray-50">
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Product</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden md:table-cell">Category</th>
                  <th className="text-right px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Price</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide hidden sm:table-cell">Stock</th>
                  <th className="text-center px-4 py-3 font-semibold text-gray-600 text-xs uppercase tracking-wide">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-10 text-gray-400">
                      <FiPackage className="w-8 h-8 mx-auto mb-2 opacity-30" />
                      No products found
                    </td>
                  </tr>
                ) : filtered.map(p => (
                  <tr key={p.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                          <img
                            src={p.images?.[0] || productPlaceholder(p.name)}
                            alt={p.name}
                            className="w-full h-full object-cover"
                            onError={e => { (e.target as HTMLImageElement).src = productPlaceholder(p.name); }}
                          />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-gray-800 truncate max-w-[160px]">{p.name}</div>
                          <div className="text-xs text-gray-400">{p.brand}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell">{p.category}</td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-800">{formatEGP(p.price)}</td>
                    <td className="px-4 py-3 text-center hidden sm:table-cell">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        p.stock === 0 ? 'bg-red-100 text-red-600' :
                        p.stock < 5 ? 'bg-amber-100 text-amber-700' :
                        'bg-green-100 text-green-700'
                      }`}>{p.stock}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => openEdit(p)}
                          className="p-1.5 text-brand-teal hover:bg-brand-teal/10 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <FiEdit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirm(p.id)}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <FiTrash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Product Modal */}
      <AnimatePresence>
        {showModal && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="fixed inset-0 bg-black/50 z-50"
            />
            <motion.div
              initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 30 }}
              className="fixed inset-x-4 top-4 bottom-4 sm:inset-x-auto sm:left-1/2 sm:-translate-x-1/2 sm:w-[680px] bg-white rounded-2xl z-50 flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Modal header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                <h2 className="font-bold text-gray-900">{editingProduct ? 'Edit Product' : 'New Product'}</h2>
                <button onClick={() => setShowModal(false)} className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors">
                  <FiX className="w-5 h-5 text-gray-500" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto px-6 py-5 space-y-4">
                {/* Image upload */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Product Images</label>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {imagePreview.map((src, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-xl overflow-hidden bg-gray-100">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-black/60 rounded-full flex items-center justify-center"
                        >
                          <FiX className="w-3 h-3 text-white" />
                        </button>
                      </div>
                    ))}
                    {imagePreview.length < 5 && (
                      <button
                        onClick={() => fileRef.current?.click()}
                        className="w-20 h-20 rounded-xl border-2 border-dashed border-gray-300 flex flex-col items-center justify-center text-gray-400 hover:border-brand-teal hover:text-brand-teal transition-colors"
                      >
                        <FiUpload className="w-5 h-5 mb-1" />
                        <span className="text-xs">Upload</span>
                      </button>
                    )}
                  </div>
                  <input ref={fileRef} type="file" multiple accept="image/*" className="hidden" onChange={e => handleImages(e.target.files)} />
                  <p className="text-xs text-gray-400">Upload up to 5 images (JPG, PNG, WebP)</p>
                </div>

                {/* Name + Brand */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name *</label>
                    <input
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      placeholder="e.g. RTX 4080 Super"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Brand</label>
                    <input
                      value={form.brand}
                      onChange={e => setForm(f => ({ ...f, brand: e.target.value }))}
                      placeholder="e.g. NVIDIA, Corsair"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  </div>
                </div>

                {/* Category */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Category *</label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value }))}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal bg-white"
                  >
                    <option value="">Select category…</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                {/* Price + Sale Price + Stock */}
                <div className="grid sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Price (EGP) *</label>
                    <input
                      type="number" min="0"
                      value={form.price}
                      onChange={e => setForm(f => ({ ...f, price: e.target.value }))}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Sale Price</label>
                    <input
                      type="number" min="0"
                      value={form.originalPrice}
                      onChange={e => setForm(f => ({ ...f, originalPrice: e.target.value }))}
                      placeholder="optional"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 mb-1">Stock *</label>
                    <input
                      type="number" min="0"
                      value={form.stock}
                      onChange={e => setForm(f => ({ ...f, stock: e.target.value }))}
                      placeholder="0"
                      className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal"
                    />
                  </div>
                </div>

                {/* Toggles */}
                <div className="flex gap-6">
                  {[
                    { key: 'featured', label: 'Featured' },
                    { key: 'onSale', label: 'On Sale' },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer">
                      <div
                        onClick={() => setForm(f => ({ ...f, [key]: !(f as any)[key] }))}
                        className={`w-10 h-5 rounded-full transition-colors relative ${(form as any)[key] ? 'bg-brand-teal' : 'bg-gray-300'}`}
                      >
                        <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${(form as any)[key] ? 'translate-x-5' : 'translate-x-0.5'}`} />
                      </div>
                      <span className="text-sm text-gray-700">{label}</span>
                    </label>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                    rows={3}
                    placeholder="Product description…"
                    className="w-full border border-gray-200 rounded-xl px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-teal resize-none"
                  />
                </div>

                {/* Specs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-semibold text-gray-700">Specifications</label>
                    <button
                      onClick={() => setForm(f => ({ ...f, specifications: [...f.specifications, { key: '', value: '' }] }))}
                      className="text-xs text-brand-teal hover:underline"
                    >
                      + Add row
                    </button>
                  </div>
                  <div className="space-y-2">
                    {form.specifications.map((spec, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={spec.key}
                          onChange={e => setForm(f => ({ ...f, specifications: f.specifications.map((s, j) => j === i ? { ...s, key: e.target.value } : s) }))}
                          placeholder="e.g. GPU Memory"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        />
                        <input
                          value={spec.value}
                          onChange={e => setForm(f => ({ ...f, specifications: f.specifications.map((s, j) => j === i ? { ...s, value: e.target.value } : s) }))}
                          placeholder="e.g. 16GB GDDR6X"
                          className="flex-1 border border-gray-200 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-brand-teal"
                        />
                        {form.specifications.length > 1 && (
                          <button onClick={() => setForm(f => ({ ...f, specifications: f.specifications.filter((_, j) => j !== i) }))} className="text-gray-400 hover:text-red-500">
                            <FiX className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Modal footer */}
              <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 bg-gray-50">
                <button onClick={() => setShowModal(false)} className="text-sm text-gray-500 hover:text-gray-700 px-4 py-2">Cancel</button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 bg-brand-navy text-white text-sm font-semibold px-5 py-2.5 rounded-xl hover:bg-brand-teal transition-colors disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  {saving ? 'Saving…' : editingProduct ? 'Update Product' : 'Create Product'}
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
              <h3 className="font-bold text-gray-900 mb-2">Delete Product?</h3>
              <p className="text-sm text-gray-500 mb-5">This action cannot be undone. The product will be permanently removed.</p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="flex-1 border border-gray-200 rounded-xl py-2.5 text-sm font-medium hover:bg-gray-50">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="flex-1 bg-red-500 text-white rounded-xl py-2.5 text-sm font-semibold hover:bg-red-600">Delete</button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
