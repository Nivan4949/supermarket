"use client";

import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: {
    id: string;
    name_en: string;
    name_ar: string;
    price: number;
    image_url: string;
    category?: string;
    categoryId?: string;
  };
}

const ProductCard = ({ product }: ProductCardProps) => {
  const { language, isRTL, t } = useLanguage();
  const { addToCart } = useCart();

  const name = language === 'en' ? product.name_en : product.name_ar;

  return (
    <div className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow overflow-hidden group">
      <Link href={`/product/${product.id}`} className="block relative aspect-square overflow-hidden bg-gray-100">
        <img
          src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400'}
          alt={name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=400';
          }}
        />
      </Link>
      <div className="p-4">
        <div className="text-xs text-primary-600 font-bold uppercase mb-1">{t((product.category || product.categoryId || '').toLowerCase())}</div>
        <Link href={`/product/${product.id}`} className="block mb-2">
          <h3 className="font-semibold text-gray-900 line-clamp-2 hover:text-primary-600 transition-colors">
            {name}
          </h3>
        </Link>
        <div className="flex items-center justify-between mt-auto">
          <div className="text-lg font-bold text-gray-900">
            {product.price.toFixed(2)} <span className="text-xs">{isRTL ? 'ر.س' : 'SAR'}</span>
          </div>
          <button
            onClick={() => addToCart(product)}
            className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 active:scale-95 transition-all"
            aria-label={t('addToCart')}
          >
            <Plus className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;
