import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Link as LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminCategories = () => {
  const [categories, setCategories] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name_en: '',
    name_ar: '',
    image_url: '',
    isActive: true
  });

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

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Categories</h1>
        <button onClick={() => setIsModalOpen(true)} className="btn btn-primary flex items-center gap-2">
          <Plus className="w-5 h-5" /> Add Category
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map(cat => (
          <div key={cat.id} className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex items-center gap-4">
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

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-md p-8 shadow-2xl">
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
};

export default AdminCategories;
