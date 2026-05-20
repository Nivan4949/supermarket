"use client";

import { useEffect, useState } from 'react';
import Link from 'next/link';
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
  const [offers, setOffers] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);


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

    // Fetch Offers
    const unsubOffers = onSnapshot(collection(db, 'offers'), (snapshot) => {
      const offs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setOffers(offs);
    }, (err) => {
      console.warn("Offers collection fetch error (likely doesn't exist yet):", err);
    });

    return () => {
      unsubProducts();
      unsubCategories();
      unsubOffers();
    };
  }, []);

  useEffect(() => {
    const activeProducts = products.filter(p => p.isActive !== false);

    if (!searchQuery.trim()) {
      const featured = activeProducts.filter(p => p.isFeatured === true);
      setFilteredProducts(featured);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = activeProducts.filter(p => 
      (p.name_en?.toLowerCase() || '').includes(query) || 
      (p.name_ar?.toLowerCase() || '').includes(query) ||
      (p.desc_en?.toLowerCase() || '').includes(query) ||
      (p.desc_ar?.toLowerCase() || '').includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

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

        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/60 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay scale-110 motion-safe:animate-[pulse_10s_ease-in-out_infinite]"
          alt="Grocery Background"
        />
      </section>

      {/* Offers Section — single banner only */}
      {offers.length > 0 && (() => {
        const offer = offers[0];
        return (
          <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
                <span className="w-2 h-8 bg-primary-500 rounded-full"></span>
                {language === 'ar' ? 'العروض الحصرية' : 'Exclusive Offers'}
              </h2>
              <span className="bg-primary-50 text-primary-600 text-xs font-bold px-3 py-1 rounded-full border border-primary-100 flex items-center gap-1 animate-pulse">
                ● {language === 'ar' ? 'مباشر' : 'LIVE'}
              </span>
            </div>

            <Link
              href={offer.link || '/shop'}
              className="group relative w-full h-52 md:h-64 rounded-[2rem] overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1 flex"
            >
              {/* Background Gradient */}
              <div className={`absolute inset-0 bg-gradient-to-br ${offer.bgGradient || 'from-primary-500 to-primary-700'}`}></div>

              {/* Image Overlay */}
              {offer.image && (
                <img
                  src={offer.image}
                  alt=""
                  className="absolute inset-0 w-full h-full object-cover mix-blend-overlay opacity-25 group-hover:scale-105 transition-transform duration-500"
                />
              )}

              {/* Shine effect */}
              <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/5 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

              {/* Card Content */}
              <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-between text-white z-10">
                <div>
                  <span className="px-3 py-1 rounded-full text-[10px] md:text-xs font-black bg-white/20 backdrop-blur-md border border-white/20 tracking-wider uppercase">
                    {language === 'ar' ? offer.badge_ar : offer.badge_en}
                  </span>
                </div>
                <div className="space-y-2">
                  <h3 className="text-2xl md:text-4xl font-black leading-tight drop-shadow-sm">
                    {language === 'ar' ? offer.title_ar : offer.title_en}
                  </h3>
                  <p className="text-sm md:text-base text-white/90 font-medium leading-relaxed max-w-lg">
                    {language === 'ar' ? offer.desc_ar : offer.desc_en}
                  </p>
                </div>
              </div>
            </Link>
          </section>
        );
      })()}

      {/* Categories */}
      <section className="animate-in fade-in slide-in-from-bottom-4 duration-700">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-2 h-8 bg-primary-500 rounded-full"></span>
            {t('categories')}
          </h2>
        </div>

        {/* Unified 3-column grid — all categories visible on all screen sizes */}
        {categories.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 md:gap-6">
            {categories.map((cat) => (
              <Link
                key={cat.id}
                href={`/category/${cat.id}`}
                className="group cursor-pointer text-center space-y-2 md:space-y-3 flex flex-col items-center"
              >
                <div className="aspect-square w-full rounded-2xl md:rounded-3xl bg-gray-50 border border-gray-100 flex items-center justify-center overflow-hidden shadow-sm group-hover:shadow-md group-hover:border-primary-200 transition-all group-hover:-translate-y-1">
                  <img
                    src={cat.image_url}
                    alt=""
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
                    }}
                  />
                </div>
                <div className="font-bold text-xs md:text-sm text-gray-800 group-hover:text-primary-600 transition-colors truncate w-full text-center">
                  {language === 'en' ? cat.name_en : cat.name_ar}
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-gray-400 py-10 text-center w-full">No categories found</div>
        )}
      </section>

      {/* Featured Products */}
      <section className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <span className="w-2 h-8 bg-primary-500 rounded-full"></span>
            {searchQuery ? `${t('searching')} "${searchQuery}"` : t('featuredProducts')}
          </h2>
          {!searchQuery && (
            <Link href="/shop" className="text-primary-600 font-bold hover:underline bg-primary-50 px-4 py-2 rounded-xl">
              {t('viewAll')}
            </Link>
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
