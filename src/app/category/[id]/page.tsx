"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import ProductCard from '@/components/ProductCard';

export default function CategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [products, setProducts] = useState<any[]>([]);
  const [category, setCategory] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language, isRTL, t } = useLanguage();

  useEffect(() => {
    if (!id) return;

    // Fetch Category Details
    const fetchCategory = async () => {
      const docRef = doc(db, 'categories', id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setCategory({ id: docSnap.id, ...docSnap.data() });
      }
    };

    // Fetch Products in Category
    const q = query(collection(db, 'products'), where('categoryId', '==', id));
    const unsub = onSnapshot(q, (snapshot) => {
      const allProds = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(allProds.filter((p: any) => p.isActive !== false));
      setLoading(false);
    });

    fetchCategory();
    return () => unsub();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;

  const categoryName = category ? (language === 'en' ? category.name_en : category.name_ar) : 'Category';

  return (
    <div className="space-y-8 pb-20">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/" className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            {isRTL ? <ArrowRight className="w-6 h-6" /> : <ArrowLeft className="w-6 h-6" />}
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{categoryName}</h1>
        </div>
      </div>

      {products.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-8">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 rounded-[2rem] p-20 text-center border-2 border-dashed border-gray-200">
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            {isRTL ? 'لا توجد منتجات في هذا القسم' : 'No products found in this category'}
          </h3>
          <Link href="/" className="text-primary-600 font-bold hover:underline">
            {isRTL ? 'العودة للتسوق' : 'Back to Shopping'}
          </Link>
        </div>
      )}
    </div>
  );
}
