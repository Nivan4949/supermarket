"use client";

import { useEffect, useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/context/LanguageContext';
import { useSearch } from '@/context/SearchContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

export default function Home() {
  const { t, language } = useLanguage();
  const { searchQuery } = useSearch();
  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);

  useEffect(() => {
    // Fetch Products
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods);
    });

    // Fetch Categories
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      const cats = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setCategories(cats);
    });

    return () => {
      unsubProducts();
      unsubCategories();
    };
  }, []);

  useEffect(() => {
    let filtered = products;

    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(p => 
        p.name_en?.toLowerCase().includes(query) || 
        p.name_ar?.toLowerCase().includes(query) ||
        p.desc_en?.toLowerCase().includes(query) ||
        p.desc_ar?.toLowerCase().includes(query)
      );
    }

    if (selectedCategoryId) {
      filtered = filtered.filter(p => p.categoryId === selectedCategoryId);
    }

    setFilteredProducts(filtered);
  }, [searchQuery, products, selectedCategoryId]);

  const selectedCategory = categories.find(c => c.id === selectedCategoryId);
  const categoryName = selectedCategory ? (language === 'en' ? selectedCategory.name_en : selectedCategory.name_ar) : null;

  return (
    <div className="space-y-12 pb-20">
      {/* Hero Section */}
      <section className="relative h-64 md:h-96 rounded-[2.5rem] overflow-hidden bg-primary-600 flex items-center px-8 md:px-16 shadow-2xl">
        <div className="relative z-10 max-w-lg space-y-6">
          <h1 className={`text-4xl md:text-6xl font-serif font-extrabold text-white leading-tight drop-shadow-lg ${language === 'ar' ? 'font-arabic-serif' : ''}`}>
            {t('storeName')}
          </h1>
          <p className="text-primary-100 text-lg md:text-xl font-medium max-w-sm">
            {language === 'ar' ? 'خضروات طازجة تصل إلى باب منزلك بضغطة زر.' : 'Fresh groceries delivered to your door with just a few clicks.'}
          </p>
          <button className="bg-white text-primary-600 px-10 py-4 rounded-2xl font-bold shadow-xl hover:scale-105 transition-all active:scale-95">
            {t('shopNow')}
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay scale-110 motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
          alt="Grocery Background"
        />
      </section>

      {/* Categories */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-2 h-8 bg-primary-500 rounded-full"></span>
            {t('categories')}
          </h2>
          <button 
            onClick={() => setSelectedCategoryId(null)}
            className="text-primary-600 font-bold hover:underline bg-primary-50 px-4 py-2 rounded-xl"
          >
            {t('viewAll')}
          </button>
        </div>
        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar -mx-4 px-4">
          {categories.length > 0 ? categories.map((cat) => (
            <div 
              key={cat.id} 
              onClick={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
              className={`flex-shrink-0 group cursor-pointer text-center space-y-3 p-2 rounded-3xl transition-all ${selectedCategoryId === cat.id ? 'bg-primary-50 ring-2 ring-primary-500 scale-105' : 'hover:bg-gray-50'}`}
            >
              <div className="w-24 h-24 md:w-32 md:h-32 rounded-3xl bg-white border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md group-hover:border-primary-200 transition-all">
                <img 
                  src={cat.image_url} 
                  alt="" 
                  className="w-full h-full object-cover" 
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
                  }}
                />
              </div>
              <div className={`font-bold transition-colors ${selectedCategoryId === cat.id ? 'text-primary-600' : 'text-gray-800 group-hover:text-primary-600'}`}>
                {language === 'en' ? cat.name_en : cat.name_ar}
              </div>
            </div>
          )) : (
            <div className="text-gray-400 py-10 text-center w-full">No categories found</div>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-2 h-8 bg-primary-500 rounded-full"></span>
            {searchQuery ? `${t('searching')} "${searchQuery}"` : (categoryName || t('featuredProducts'))}
          </h2>
          {(searchQuery || selectedCategoryId) && (
            <button 
              onClick={() => { setSelectedCategoryId(null); /* Resetting search might be needed too if we want a full clear */ }}
              className="text-primary-600 font-bold hover:underline bg-primary-50 px-4 py-2 rounded-xl"
            >
              {t('viewAll')}
            </button>
          )}
        </div>
        
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">No products found</h3>
            <p className="text-gray-500">Try searching for something else or check your spelling.</p>
          </div>
        )}
      </section>
    </div>
  );
}
