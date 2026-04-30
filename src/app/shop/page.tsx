"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';

export default function ShopPage() {
  const [products, setProducts] = useState<any[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { language, isRTL, t } = useLanguage();

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const allProds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const activeProds = allProds.filter((p: any) => p.isActive !== false);
      setProducts(activeProds);
      setFilteredProducts(activeProds);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProducts(products);
      return;
    }

    const query = searchQuery.toLowerCase();
    const filtered = products.filter(p => 
      p.name_en?.toLowerCase().includes(query) || 
      p.name_ar?.toLowerCase().includes(query) ||
      p.desc_en?.toLowerCase().includes(query) ||
      p.desc_ar?.toLowerCase().includes(query)
    );
    setFilteredProducts(filtered);
  }, [searchQuery, products]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {isRTL ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{t('shop')}</h1>
        </div>

        <div className="relative flex-1 max-w-md">
          <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
          <input
            type="text"
            placeholder={t('search')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-white border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
          />
        </div>
      </div>

      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isRTL ? 'لا توجد منتجات' : 'No products found'}
          </h3>
          <p className="text-gray-500">
            {isRTL ? 'جرب البحث عن شيء آخر' : 'Try searching for something else'}
          </p>
        </div>
      )}
    </div>
  );
}
