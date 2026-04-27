"use client";

import { useState } from 'react';
import ProductCard from '@/components/ProductCard';
import { useLanguage } from '@/context/LanguageContext';

const MOCK_PRODUCTS = [
  {
    id: '1',
    name_en: 'Fresh Organic Milk',
    name_ar: 'حليب عضوي طازج',
    price: 12.50,
    image_url: 'https://images.unsplash.com/photo-1563636619-e9107da8a7ac?auto=format&fit=crop&q=80&w=400',
    category: 'Dairy'
  },
  {
    id: '2',
    name_en: 'Premium Dates',
    name_ar: 'تمور فاخرة',
    price: 45.00,
    image_url: 'https://images.unsplash.com/photo-1594910357426-91b337c9511d?auto=format&fit=crop&q=80&w=400',
    category: 'Fruits'
  },
  {
    id: '3',
    name_en: 'Arabic Coffee (Gold)',
    name_ar: 'قهوة عربية (ذهبي)',
    price: 85.00,
    image_url: 'https://images.unsplash.com/photo-1559496417-e7f25cb247f3?auto=format&fit=crop&q=80&w=400',
    category: 'Beverages'
  },
  {
    id: '4',
    name_en: 'Olive Oil (Extra Virgin)',
    name_ar: 'زيت زيتون (بكر ممتاز)',
    price: 65.00,
    image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbadcbaf?auto=format&fit=crop&q=80&w=400',
    category: 'Pantry'
  }
];

export default function Home() {
  const { t } = useLanguage();
  const [products] = useState(MOCK_PRODUCTS);

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative h-64 md:h-96 rounded-3xl overflow-hidden bg-primary-600 flex items-center px-8 md:px-16">
        <div className="relative z-10 max-w-lg space-y-4">
          <h1 className="text-3xl md:text-5xl font-extrabold text-white leading-tight">
            {t('home')} - Sanabel Mini Mart
          </h1>
          <p className="text-primary-100 text-lg">
            Fresh groceries delivered to your door with just a few clicks.
          </p>
          <button className="bg-white text-primary-600 px-8 py-3 rounded-full font-bold shadow-xl hover:bg-gray-100 transition-all">
            {t('shop')} Now
          </button>
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-primary-900/50 to-transparent"></div>
        <img 
          src="https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=1200" 
          className="absolute inset-0 w-full h-full object-cover mix-blend-overlay"
          alt="Grocery Background"
        />
      </section>

      {/* Categories */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{t('categories')}</h2>
          <button className="text-primary-600 font-semibold hover:underline">{t('shop')} All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {['Dairy', 'Fruits', 'Vegetables', 'Beverages', 'Pantry', 'Bakery'].map((cat) => (
            <div key={cat} className="bg-white p-6 rounded-2xl shadow-sm text-center hover:shadow-md transition-shadow cursor-pointer border border-gray-100">
              <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 text-primary-600">
                {/* Icon Placeholder */}
              </div>
              <div className="font-bold text-gray-900">{cat}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">{t('featuredProducts')}</h2>
          <button className="text-primary-600 font-semibold hover:underline">View All</button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
