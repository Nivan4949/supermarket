"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, addDoc, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import { Plus, Edit2, Trash2, Search, Link as LinkIcon, Sparkles, Tag, Eye } from 'lucide-react';
import toast from 'react-hot-toast';

const gradientTemplates = [
  { name: 'Fresh Emerald (Green)', value: 'from-emerald-500 to-teal-600', preview: 'bg-gradient-to-br from-emerald-500 to-teal-600' },
  { name: 'Sunset Orange (Gold)', value: 'from-amber-500 to-orange-600', preview: 'bg-gradient-to-br from-amber-500 to-orange-600' },
  { name: 'Royal Indigo (Purple)', value: 'from-indigo-500 to-purple-600', preview: 'bg-gradient-to-br from-indigo-500 to-purple-600' },
  { name: 'Ruby Rose (Red)', value: 'from-rose-500 to-red-600', preview: 'bg-gradient-to-br from-rose-500 to-red-600' },
  { name: 'Deep Ocean (Blue)', value: 'from-blue-500 to-cyan-600', preview: 'bg-gradient-to-br from-blue-500 to-cyan-600' },
  { name: 'Sleek Dark (Black)', value: 'from-gray-800 to-black', preview: 'bg-gradient-to-br from-gray-800 to-black' },
];

function OffersContent() {
  const [offers, setOffers] = useState<any[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const searchParams = useSearchParams();

  const [formData, setFormData] = useState({
    title_en: '',
    title_ar: '',
    desc_en: '',
    desc_ar: '',
    badge_en: '',
    badge_ar: '',
    bgGradient: 'from-emerald-500 to-teal-600',
    image: '',
    link: '/shop'
  });

  const [isTranslating, setIsTranslating] = useState(false);

  const handleAutoTranslate = async () => {
    if (!formData.title_en && !formData.desc_en && !formData.badge_en) {
      toast.error('Please enter English content (Title, Description, or Badge) to translate');
      return;
    }
    setIsTranslating(true);
    const toastId = toast.loading('Translating to Arabic...');
    try {
      const translateText = async (text: string) => {
        if (!text.trim()) return '';
        const res = await fetch(`https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=en|ar`);
        if (!res.ok) throw new Error('Translation API request failed');
        const data = await res.json();
        if (data.responseStatus !== 200) {
          throw new Error(data.responseDetails || 'Translation API returned error status');
        }
        return data.responseData.translatedText;
      };

      const [titleAr, descAr, badgeAr] = await Promise.all([
        formData.title_en ? translateText(formData.title_en) : Promise.resolve(''),
        formData.desc_en ? translateText(formData.desc_en) : Promise.resolve(''),
        formData.badge_en ? translateText(formData.badge_en) : Promise.resolve('')
      ]);

      setFormData(prev => ({
        ...prev,
        title_ar: titleAr || prev.title_ar,
        desc_ar: descAr || prev.desc_ar,
        badge_ar: badgeAr || prev.badge_ar
      }));
      toast.success('Successfully translated to Arabic!', { id: toastId });
    } catch (err: any) {
      console.error('Translation error:', err);
      toast.error('Translation failed. Please try again or type manually.', { id: toastId });
    } finally {
      setIsTranslating(false);
    }
  };


  useEffect(() => {
    const search = searchParams.get('search');
    if (search) setSearchQuery(search);
  }, [searchParams]);

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'offers'), (snapshot) => {
      setOffers(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }, (err) => {
      console.error("Firestore offers subscribe error:", err);
    });
    return () => unsub();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingId) {
        await updateDoc(doc(db, 'offers', editingId), formData);
        toast.success('Offer updated successfully');
      } else {
        await addDoc(collection(db, 'offers'), formData);
        toast.success('Offer created successfully');
      }
      setIsModalOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Operation failed. Check permissions.');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this offer?')) {
      try {
        await deleteDoc(doc(db, 'offers', id));
        toast.success('Offer deleted');
      } catch (error) {
        toast.error('Delete failed');
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title_en: '',
      title_ar: '',
      desc_en: '',
      desc_ar: '',
      badge_en: '',
      badge_ar: '',
      bgGradient: 'from-emerald-500 to-teal-600',
      image: '',
      link: '/shop'
    });
    setEditingId(null);
  };

  const handleEdit = (offer: any) => {
    setFormData({
      title_en: offer.title_en || '',
      title_ar: offer.title_ar || '',
      desc_en: offer.desc_en || '',
      desc_ar: offer.desc_ar || '',
      badge_en: offer.badge_en || '',
      badge_ar: offer.badge_ar || '',
      bgGradient: offer.bgGradient || 'from-emerald-500 to-teal-600',
      image: offer.image || '',
      link: offer.link || '/shop'
    });
    setEditingId(offer.id);
    setIsModalOpen(true);
  };

  const filteredOffers = offers.filter(offer => {
    const query = searchQuery.toLowerCase();
    return (
      (offer.title_en?.toLowerCase() || '').includes(query) ||
      (offer.title_ar?.toLowerCase() || '').includes(query) ||
      (offer.badge_en?.toLowerCase() || '').includes(query) ||
      (offer.badge_ar?.toLowerCase() || '').includes(query)
    );
  });

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div className="space-y-1">
          <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight flex items-center gap-3">
            <span className="w-2.5 h-9 bg-primary-500 rounded-full"></span>
            Manage Offers & Promos
          </h1>
          <p className="text-gray-500 text-sm">Create and edit customer-facing homepage discount banner cards.</p>
        </div>
        <button 
          onClick={() => { resetForm(); setIsModalOpen(true); }} 
          className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-5 py-3 rounded-2xl transition-all shadow-lg hover:shadow-primary-100 flex items-center gap-2"
        >
          <Plus className="w-5 h-5" /> Add Offer Banner
        </button>
      </div>

      {/* Filter Row */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search offers by name or badge..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border-none rounded-xl pl-12 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium"
          />
        </div>
        <div className="text-xs font-bold text-gray-400">
          Showing {filteredOffers.length} of {offers.length} active promotions
        </div>
      </div>

      {filteredOffers.length === 0 ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-gray-100 shadow-sm flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-gray-50 flex items-center justify-center">
            <Tag className="w-8 h-8 text-gray-300 animate-pulse" />
          </div>
          <span className="font-bold text-gray-600 text-lg">No promotional offers found</span>
          <p className="text-gray-400 text-sm max-w-xs">
            {offers.length === 0 
              ? "You haven't created any offers yet. Click 'Add Offer Banner' to create your first promotion card!"
              : "No search results match your filters. Try adjusting your typing."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredOffers.map(offer => (
            <div key={offer.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden flex flex-col justify-between hover:shadow-md transition-all duration-300">
              {/* Card Thumbnail Preview */}
              <div className="relative h-40 w-full overflow-hidden flex items-end p-5">
                <div className={`absolute inset-0 bg-gradient-to-br ${offer.bgGradient || 'from-primary-500 to-primary-700'}`}></div>
                {offer.image && (
                  <img src={offer.image} alt="" className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                
                {/* Content Overlay */}
                <div className="relative z-10 text-white w-full space-y-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-white/20 backdrop-blur-md border border-white/20 uppercase tracking-wider">
                    {offer.badge_en || 'NO BADGE'}
                  </span>
                  <h3 className="font-extrabold text-base truncate">{offer.title_en}</h3>
                  <p className="text-[10px] text-white/80 line-clamp-1">{offer.desc_en}</p>
                </div>
              </div>

              {/* Card Meta & Control Area */}
              <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="block font-bold text-gray-400 uppercase text-[9px] tracking-wider mb-0.5">Title (Arabic)</span>
                    <span className="font-bold text-gray-700 block truncate">{offer.title_ar || '—'}</span>
                  </div>
                  <div>
                    <span className="block font-bold text-gray-400 uppercase text-[9px] tracking-wider mb-0.5">Badge (Arabic)</span>
                    <span className="font-bold text-gray-700 block truncate">{offer.badge_ar || '—'}</span>
                  </div>
                  <div className="col-span-2 border-t border-gray-50 pt-2 flex items-center justify-between text-gray-500">
                    <span className="font-medium">Link: <code className="bg-gray-50 px-1 py-0.5 rounded text-[10px]">{offer.link || '/shop'}</code></span>
                  </div>
                </div>

                <div className="flex gap-2 pt-2 border-t border-gray-100">
                  <button 
                    onClick={() => handleEdit(offer)} 
                    className="flex-1 py-2 bg-gray-50 hover:bg-gray-100 text-primary-600 font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5" /> Edit Details
                  </button>
                  <button 
                    onClick={() => handleDelete(offer.id)} 
                    className="py-2 px-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl text-xs transition-all flex items-center justify-center"
                    title="Delete Promo"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Modal with Realtime Interactive Card Preview */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900/40 backdrop-blur-md overflow-y-auto">
          <div className="bg-white rounded-[2.5rem] w-full max-w-4xl p-8 shadow-2xl border border-gray-100 flex flex-col lg:flex-row gap-8 max-h-[90vh] overflow-y-auto">
            {/* Form Side */}
            <div className="flex-1 space-y-6">
              <div className="space-y-1">
                <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">
                  {editingId ? 'Edit Offer Banner' : 'New Offer Banner'}
                </h2>
                <p className="text-gray-500 text-xs">Specify visual layout rules and localized text content.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Section 1: English Fields */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    🇬🇧 English Content
                  </h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Banner Title</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.title_en} 
                        onChange={e => setFormData({...formData, title_en: e.target.value})} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                        placeholder="e.g. Fresh Organic Harvest"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Description</label>
                      <textarea 
                        required 
                        rows={2}
                        value={formData.desc_en} 
                        onChange={e => setFormData({...formData, desc_en: e.target.value})} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm resize-none" 
                        placeholder="e.g. Get 25% off on all organic fresh vegetables and fruits this week."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Badge (e.g. 25% OFF, FREE SHIPPING)</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.badge_en} 
                        onChange={e => setFormData({...formData, badge_en: e.target.value})} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                        placeholder="e.g. 25% OFF"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 2: Arabic Fields */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-3" dir="rtl">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                      🇸🇦 المحتوى العربي
                    </h3>
                    <button
                      type="button"
                      disabled={isTranslating}
                      onClick={handleAutoTranslate}
                      className="bg-primary-50 hover:bg-primary-100 disabled:opacity-50 text-primary-700 font-bold px-3 py-1.5 rounded-xl text-[10px] transition-all flex items-center gap-1 border border-primary-100"
                    >
                      <Sparkles className={`w-3.5 h-3.5 ${isTranslating ? 'animate-spin' : ''}`} />
                      {isTranslating ? 'جاري الترجمة...' : 'Auto-Translate English to Arabic'}
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3 text-right">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">العنوان الرئيسي</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.title_ar} 
                        onChange={e => setFormData({...formData, title_ar: e.target.value})} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                        placeholder="مثال: حصاد عضوي طازج"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">الوصف الفرعي</label>
                      <textarea 
                        required 
                        rows={2}
                        value={formData.desc_ar} 
                        onChange={e => setFormData({...formData, desc_ar: e.target.value})} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm resize-none" 
                        placeholder="مثال: احصل على خصم 25٪ على جميع الخضروات والفواكه الطازجة هذا الأسبوع."
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">الشارة الترويجية (مثال: خصم 25٪)</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.badge_ar} 
                        onChange={e => setFormData({...formData, badge_ar: e.target.value})} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                        placeholder="مثال: خصم 25٪"
                      />
                    </div>
                  </div>
                </div>

                {/* Section 3: Design Rules */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    🎨 Visual Styles & Settings
                  </h3>
                  
                  {/* Predefined Gradients */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-2">Preset Colors & Gradients</label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                      {gradientTemplates.map((template) => (
                        <button
                          key={template.value}
                          type="button"
                          onClick={() => setFormData({ ...formData, bgGradient: template.value })}
                          className={`h-10 rounded-xl ${template.preview} border-2 transition-all flex items-center justify-center ${
                            formData.bgGradient === template.value ? 'border-primary-600 scale-105 shadow' : 'border-transparent opacity-85 hover:opacity-100'
                          }`}
                          title={template.name}
                        >
                          {formData.bgGradient === template.value && (
                            <span className="w-2.5 h-2.5 bg-white rounded-full shadow"></span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Gradient Input */}
                  <div>
                    <label className="block text-[11px] font-bold text-gray-500 mb-1">Custom Tailwind Gradient Classes</label>
                    <input 
                      type="text" 
                      value={formData.bgGradient} 
                      onChange={e => setFormData({...formData, bgGradient: e.target.value})} 
                      className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm font-mono text-xs" 
                      placeholder="e.g. from-indigo-500 to-purple-600"
                    />
                  </div>

                  {/* Image & Link URL */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Background Image URL (Optional)</label>
                      <input 
                        type="text" 
                        value={formData.image} 
                        onChange={e => setFormData({...formData, image: e.target.value})} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                        placeholder="Paste Unsplash or Storage url..."
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-gray-500 mb-1">Navigation Click Link</label>
                      <input 
                        required 
                        type="text" 
                        value={formData.link} 
                        onChange={e => setFormData({...formData, link: e.target.value})} 
                        className="w-full bg-white border border-gray-200 rounded-xl p-2.5 text-sm" 
                        placeholder="e.g. /shop"
                      />
                    </div>
                  </div>
                </div>

                <div className="flex justify-end gap-3 pt-4">
                  <button 
                    type="button" 
                    onClick={() => { setIsModalOpen(false); resetForm(); }} 
                    className="text-gray-500 hover:text-gray-700 font-bold px-4 py-2"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="bg-primary-600 hover:bg-primary-700 text-white font-bold px-8 py-3 rounded-2xl shadow transition-all"
                  >
                    Save Promotion
                  </button>
                </div>
              </form>
            </div>

            {/* Preview Side (Interactive) */}
            <div className="w-full lg:w-80 flex flex-col gap-6 justify-center bg-gray-50/50 p-6 rounded-[2rem] border border-gray-50 self-stretch">
              <div className="space-y-1">
                <h3 className="text-xs font-black text-gray-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-primary-500" /> Interactive Live Preview
                </h3>
                <p className="text-gray-500 text-[10px]">See how it renders dynamically in real time on the customer homepage.</p>
              </div>

              {/* Card Preview Component */}
              <div className="w-full relative h-60 rounded-[2rem] overflow-hidden shadow-2xl transition-all duration-300">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${formData.bgGradient || 'from-primary-500 to-primary-700'}`}></div>
                
                {/* Image Overlay */}
                {formData.image && (
                  <img
                    src={formData.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/20 backdrop-blur-md border border-white/20 tracking-wider uppercase">
                      {formData.badge_en || 'SAMPLE BADGE'}
                    </span>
                  </div>

                  <div className="space-y-2 mt-auto">
                    <h3 className="text-lg md:text-xl font-black leading-tight truncate">
                      {formData.title_en || 'Sample Promotional Title'}
                    </h3>
                    <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-relaxed">
                      {formData.desc_en || 'This is how your banner description will display to the users.'}
                    </p>
                    <div className="pt-2 flex">
                      <span className="bg-white text-gray-900 px-4 py-2 text-[10px] font-bold rounded-xl shadow-sm">
                        Shop Now →
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Arabic Card Preview */}
              <div className="w-full relative h-60 rounded-[2rem] overflow-hidden shadow-xl transition-all duration-300" dir="rtl">
                {/* Background Gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${formData.bgGradient || 'from-primary-500 to-primary-700'}`}></div>
                
                {/* Image Overlay */}
                {formData.image && (
                  <img
                    src={formData.image}
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                )}

                {/* Content Overlay */}
                <div className="absolute inset-0 p-6 flex flex-col justify-between text-white z-10">
                  <div className="flex justify-between items-start">
                    <span className="px-3 py-1 rounded-full text-[10px] font-black bg-white/20 backdrop-blur-md border border-white/20 tracking-wider uppercase">
                      {formData.badge_ar || 'شارة ترويجية'}
                    </span>
                  </div>

                  <div className="space-y-2 mt-auto text-right">
                    <h3 className="text-lg md:text-xl font-black leading-tight truncate">
                      {formData.title_ar || 'العنوان الرئيسي الترويجي'}
                    </h3>
                    <p className="text-[11px] text-white/90 font-medium line-clamp-2 leading-relaxed">
                      {formData.desc_ar || 'هذا النص يعرض طريقة ظهور الوصف الترويجي لعملائك باللغة العربية.'}
                    </p>
                    <div className="pt-2 flex">
                      <span className="bg-white text-gray-900 px-4 py-2 text-[10px] font-bold rounded-xl shadow-sm">
                        تسوق الآن ←
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default function AdminOffersPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    }>
      <OffersContent />
    </Suspense>
  );
}
