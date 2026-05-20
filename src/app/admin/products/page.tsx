"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Plus, Edit2, Trash2, Search, Link as LinkIcon } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, addDoc, updateDoc, deleteDoc, onSnapshot, doc } from 'firebase/firestore';
import toast from 'react-hot-toast';

function ProductsContent() {
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');

  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    desc_en: '',
    desc_ar: '',
    price: 0,
    stock: 0,
    categoryId: '',
    image_url: '',
    isActive: true,
    isFeatured: false
  });

  const searchParams = useSearchParams();

  useEffect(() => {
    const search = searchParams.get('search');
    const category = searchParams.get('category');
    if (search) setSearchQuery(search);
    if (category) setSelectedCategory(category);
  }, [searchParams]);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubProducts(); unsubCategories(); };
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'products', editingId), formData);
        toast.success('Product updated');
      } else {
        await addDoc(collection(db, 'products'), formData);
        toast.success('Product added');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Save failed');
    }
  };

  const resetForm = () => {
    setFormData({
      name_en: '',
      name_ar: '',
      desc_en: '',
      desc_ar: '',
      price: 0,
      stock: 0,
      categoryId: '',
      image_url: '',
      isActive: true,
      isFeatured: false
    });
    setEditingId(null);
  };

  const filteredProducts = products.filter(product => {
    const matchesSearch = searchQuery ? (
      product.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_ar?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.desc_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.desc_ar?.toLowerCase().includes(searchQuery.toLowerCase())
    ) : true;
    const matchesCategory = selectedCategory ? product.categoryId === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Products</h1>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Product
        </button>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search products by name, description..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
          />
        </div>
        
        <div className="w-full md:w-64">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-600"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name_en} ({cat.name_ar})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Product List */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/50">
              <th className="p-4 border-b border-gray-100 text-gray-400 text-xs uppercase font-bold tracking-wider">Image</th>
              <th className="p-4 border-b border-gray-100 text-gray-400 text-xs uppercase font-bold tracking-wider">Name (EN/AR)</th>
              <th className="p-4 border-b border-gray-100 text-gray-400 text-xs uppercase font-bold tracking-wider">Price</th>
              <th className="p-4 border-b border-gray-100 text-gray-400 text-xs uppercase font-bold tracking-wider">Stock</th>
              <th className="p-4 border-b border-gray-100 text-gray-400 text-xs uppercase font-bold tracking-wider">Status</th>
              <th className="p-4 border-b border-gray-100 text-gray-400 text-xs uppercase font-bold tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredProducts.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-gray-400">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <span className="font-bold text-gray-500">No products found</span>
                    <span className="text-xs">Try adjusting your search terms or filters</span>
                  </div>
                </td>
              </tr>
            ) : (
              filteredProducts.map(product => (
              <tr key={product.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                <td className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <img src={product.image_url} alt="" className="w-12 h-12 rounded-lg object-cover bg-gray-100" />
                </td>
                <td className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="font-bold">{product.name_en}</div>
                  <div className="text-sm text-gray-500">{product.name_ar}</div>
                </td>
                <td className="p-4 border-b border-gray-100 dark:border-gray-700 font-bold">
                  {product.price} SAR
                </td>
                <td className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <span className={`px-3 py-1 rounded-full text-[10px] font-extrabold uppercase ${product.stock > 10 ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {product.stock} {product.stock > 1 ? 'items' : 'item'}
                  </span>
                </td>
                <td className="p-4 border-b border-gray-100 dark:border-gray-700">
                  <div className="flex flex-col gap-1">
                    {product.isFeatured && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-700 uppercase">
                        Featured
                      </span>
                    )}
                    <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold uppercase ${product.isActive ? 'bg-blue-50 text-blue-700' : 'bg-gray-100 text-gray-500'}`}>
                      {product.isActive ? 'Active' : 'Hidden'}
                    </span>
                  </div>
                </td>
                <td className="p-4 border-b border-gray-100 text-gray-900">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => { setFormData(product); setEditingId(product.id); setIsModalOpen(true); }}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={() => deleteDoc(doc(db, 'products', product.id))}
                      className="p-2 text-red-600 hover:bg-red-50 rounded"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl max-h-[90vh] overflow-y-auto p-10 shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Product' : 'Add New Product'}</h2>
            
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Image URL Input */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-2">Product Image URL</label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-24 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border-2 border-gray-100">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <LinkIcon className="text-gray-400" />
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Paste image link here (e.g. https://...)" 
                    value={formData.image_url} 
                    onChange={e => setFormData({...formData, image_url: e.target.value})} 
                    className="flex-1 bg-gray-50 border-none rounded-xl p-3" 
                  />
                </div>
              </div>

              {/* EN Name */}
              <div>
                <label className="block text-sm font-bold mb-1">Name (English)</label>
                <input required type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3" />
              </div>
              {/* AR Name */}
              <div dir="rtl">
                <label className="block text-sm font-bold mb-1">الاسم (عربي)</label>
                <input required type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3" />
              </div>

              {/* Prices & Stock */}
              <div>
                <label className="block text-sm font-bold mb-1">Price (SAR)</label>
                <input required type="number" step="0.01" value={formData.price} onChange={e => setFormData({...formData, price: parseFloat(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-1">Stock Quantity</label>
                <input required type="number" value={formData.stock} onChange={e => setFormData({...formData, stock: parseInt(e.target.value)})} className="w-full bg-gray-50 border-none rounded-xl p-3" />
              </div>

              {/* Category Selection */}
              <div className="md:col-span-2">
                <label className="block text-sm font-bold mb-1">Category</label>
                <select 
                  required 
                  value={formData.categoryId} 
                  onChange={e => setFormData({...formData, categoryId: e.target.value})} 
                  className="w-full bg-gray-50 border-none rounded-xl p-3"
                >
                  <option value="">Select a category</option>
                  {categories.map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name_en} ({cat.name_ar})</option>
                  ))}
                </select>
              </div>

              {/* Description */}
              <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-bold mb-1">Description (English)</label>
                  <textarea rows={3} value={formData.desc_en} onChange={e => setFormData({...formData, desc_en: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3" />
                </div>
                <div dir="rtl">
                  <label className="block text-sm font-bold mb-1">الوصف (عربي)</label>
                  <textarea rows={3} value={formData.desc_ar} onChange={e => setFormData({...formData, desc_ar: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3" />
                </div>
              </div>

              {/* Toggles */}
              <div className="md:col-span-2 flex gap-8">
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.isActive} 
                    onChange={e => setFormData({...formData, isActive: e.target.checked})} 
                    className="w-5 h-5 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900">Active (Visible in shop)</span>
                </label>
                
                <label className="flex items-center gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={formData.isFeatured} 
                    onChange={e => setFormData({...formData, isFeatured: e.target.checked})} 
                    className="w-5 h-5 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-sm font-bold text-gray-700 group-hover:text-gray-900 text-amber-600">Featured (Show on Home Page)</span>
                </label>
              </div>

              <div className="md:col-span-2 flex justify-end gap-4 mt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="btn btn-secondary">Cancel</button>
                <button type="submit" className="btn btn-primary px-8">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <ProductsContent />
    </Suspense>
  );
}
