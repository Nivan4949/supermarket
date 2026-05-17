"use client";

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { ShoppingCart, ArrowLeft, ArrowRight, ShieldCheck, Truck, RefreshCcw } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import toast from 'react-hot-toast';

export default function ProductDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language, isRTL, t } = useLanguage();
  const { addToCart } = useCart();

  useEffect(() => {
    const fetchProduct = async () => {
      if (!id) return;
      try {
        const docRef = doc(db, 'products', id);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setProduct({ id: docSnap.id, ...docSnap.data() });
        }
      } catch (error) {
        toast.error('Failed to load product');
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [id]);

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div></div>;
  if (!product) return <div className="text-center py-20 font-bold">Product not found</div>;

  const name = language === 'en' ? product.name_en : product.name_ar;
  const desc = language === 'en' ? product.desc_en : product.desc_ar;

  return (
    <div className="max-w-7xl mx-auto px-4">
      <Link href="/" className="inline-flex items-center gap-2 text-gray-500 hover:text-primary-600 mb-8 transition-colors">
        {isRTL ? <ArrowRight className="w-5 h-5" /> : <ArrowLeft className="w-5 h-5" />}
        {isRTL ? 'العودة للتسوق' : 'Back to Shopping'}
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Product Image */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl overflow-hidden shadow-sm aspect-square">
          <img 
            src={product.image_url || 'https://via.placeholder.com/600'} 
            alt={name} 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Product Info */}
        <div className="flex flex-col space-y-8">
          <div className="space-y-4">
            <span className="bg-primary-50 text-primary-600 px-3 py-1 rounded-full text-sm font-bold uppercase tracking-wider">
              {product.categoryId || 'General'}
            </span>
            <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 dark:text-white leading-tight">
              {name}
            </h1>
            <div className="text-3xl font-bold text-primary-600">
              {Number(product.price || 0).toFixed(2)} <span className="text-xl uppercase">{isRTL ? 'ر.س' : 'SAR'}</span>
            </div>
          </div>

          <div className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
            {desc || (isRTL ? 'لا يوجد وصف متاح لهذا المنتج.' : 'No description available for this product.')}
          </div>

          <div className="flex items-center gap-6 pt-4">
            <button 
              onClick={() => { addToCart(product); toast.success('Added to cart!'); }}
              className="btn btn-primary flex-1 py-5 text-xl font-bold flex items-center justify-center gap-3"
            >
              <ShoppingCart className="w-6 h-6" />
              {t('addToCart')}
            </button>
          </div>

          {/* Features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-8 border-t border-gray-100 dark:border-gray-700">
            <Feature icon={<Truck className="w-5 h-5" />} label={isRTL ? 'توصيل سريع' : 'Fast Delivery'} sub={isRTL ? 'خلال ٢٤ ساعة' : 'Within 24h'} />
            <Feature icon={<ShieldCheck className="w-5 h-5" />} label={isRTL ? 'منتج مضمون' : 'Guaranteed'} sub={isRTL ? 'طازج وعضوي' : 'Fresh & Organic'} />
            <Feature icon={<RefreshCcw className="w-5 h-5" />} label={isRTL ? 'سياسة الاسترجاع' : 'Easy Return'} sub={isRTL ? 'خلال يومين' : 'Within 2 days'} />
          </div>
        </div>
      </div>
    </div>
  );
}

const Feature = ({ icon, label, sub }: any) => (
  <div className="flex items-start gap-3">
    <div className="text-primary-600 mt-1">{icon}</div>
    <div>
      <div className="font-bold text-sm text-gray-900 dark:text-white">{label}</div>
      <div className="text-xs text-gray-500">{sub}</div>
    </div>
  </div>
);
