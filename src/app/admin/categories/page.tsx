"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Search, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

function CategoriesContent() {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    image_url: '',
    isActive: true
  });

  useEffect(() => {
    const search = searchParams.get('search');
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'categories', editingId), formData);
        toast.success('Category updated');
      } else {
        await addDoc(collection(db, 'categories'), formData);
        toast.success('Category added');
      }
      setIsModalOpen(false);
      setFormData({ name_en: '', name_ar: '', image_url: '', isActive: true });
      setEditingId(null);
    } catch (error) {
      toast.error('Operation failed');
    }
  };

  const filteredCategories = categories.filter(cat => {
    const query = searchQuery.toLowerCase();
    return (
      cat.name_en?.toLowerCase().includes(query) ||
      cat.name_ar?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      {/* Search Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search categories by name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
          />
        </div>
      </div>

      {filteredCategories.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-2">
          <Search className="w-12 h-12 text-gray-300 animate-pulse" />
          <span className="font-bold text-gray-600 text-lg">No categories found</span>
          <span className="text-gray-400 text-sm">Try adjusting your search terms</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCategories.map(cat => (
            <div key={cat.id} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4">
              <img src={cat.image_url} alt="" className="w-16 h-16 rounded-xl object-cover bg-gray-50" />
              <div className="flex-1">
                <div className="font-bold">{cat.name_en}</div>
                <div className="text-sm text-gray-500">{cat.name_ar}</div>
              </div>
              <div className="flex flex-col gap-2">
                <button onClick={() => { setFormData(cat); setEditingId(cat.id); setIsModalOpen(true); }} className="p-2 text-primary-600 hover:bg-primary-50 rounded">
                  <Edit2 className="w-4 h-4" />
                </button>
                <button onClick={() => deleteDoc(doc(db, 'categories', cat.id))} className="p-2 text-red-600 hover:bg-red-50 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md">
          <div className="bg-white rounded-[2.5rem] w-full max-w-md p-8 shadow-2xl border border-gray-100">
            <h2 className="text-2xl font-bold mb-6">{editingId ? 'Edit Category' : 'New Category'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-1">Name (English)</label>
                <input required type="text" value={formData.name_en} onChange={e => setFormData({...formData, name_en: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3" />
              </div>
              <div dir="rtl">
                <label className="block text-sm font-bold mb-1">الاسم (عربي)</label>
                <input required type="text" value={formData.name_ar} onChange={e => setFormData({...formData, name_ar: e.target.value})} className="w-full bg-gray-50 border-none rounded-xl p-3" />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Category Image URL</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center overflow-hidden border">
                    {formData.image_url ? (
                      <img src={formData.image_url} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <LinkIcon className="text-gray-400" />
                    )}
                  </div>
                  <input 
                    type="text" 
                    placeholder="Paste link..." 
                    value={formData.image_url} 
                    onChange={e => setFormData({...formData, image_url: e.target.value})} 
                    className="flex-1 bg-gray-50 border-none rounded-xl p-3" 
                  />
                </div>
              </div>
              <div className="flex justify-end gap-3 mt-6">
                <button type="button" onClick={() => setIsModalOpen(false)} className="text-gray-500 font-bold">Cancel</button>
                <button type="submit" className="btn btn-primary px-6">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminCategoriesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <CategoriesContent />
    </Suspense>
  );
}
