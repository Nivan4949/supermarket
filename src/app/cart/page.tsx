"use client";

import Link from 'next/link';
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartTotal, clearCart } = useCart();
  const { t, isRTL, language } = useLanguage();

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
        <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center">
          <Trash2 className="w-12 h-12 text-gray-400" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{t('cartEmpty')}</h2>
        <p className="text-gray-500">{t('cartEmptyDesc')}</p>
        <Link href="/" className="btn btn-primary mt-4">
          {t('startShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('cart')}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cart Items */}
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
            <div key={item.id} className="bg-white p-4 rounded-2xl shadow-sm flex items-center gap-4">
              <img 
                src={item.image_url || 'https://via.placeholder.com/100'} 
                alt={language === 'en' ? item.name_en : item.name_ar} 
                className="w-20 h-20 rounded-lg object-cover"
              />
              <div className="flex-1">
                <h3 className="font-bold text-gray-900 dark:text-white">
                  {language === 'en' ? item.name_en : item.name_ar}
                </h3>
                <div className="text-primary-600 font-bold">
                  {Number(item.price || 0).toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="p-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="w-8 text-center font-bold">{item.quantity}</span>
                <button 
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="p-1 rounded-full border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <button 
                onClick={() => removeFromCart(item.id)}
                className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              >
                <Trash2 className="w-5 h-5" />
              </button>
            </div>
          ))}

          <button 
            onClick={clearCart}
            className="text-gray-500 hover:text-red-500 text-sm font-medium transition-colors"
          >
            {t('clearCart')}
          </button>
        </div>

        {/* Summary */}
        <div className="bg-gray-100 p-6 rounded-2xl shadow-sm h-fit space-y-6">
          <h2 className="text-xl font-bold text-gray-900 border-bottom pb-4 border-gray-100">{t('orderSummary')}</h2>
          
          <div className="space-y-3">
            <div className="flex justify-between text-gray-500">
              <span>{t('subtotal')}</span>
              <span>{cartTotal.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>{t('deliveryFee')}</span>
              <span>0.00 {isRTL ? 'ر.س' : 'SAR'}</span>
            </div>
            <div className="border-t border-gray-100 pt-3 flex justify-between font-extrabold text-xl text-gray-900 dark:text-white">
              <span>{t('total')}</span>
              <span className="text-primary-600">{cartTotal.toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}</span>
            </div>
          </div>

          <Link href="/checkout" className="btn btn-primary w-full flex items-center justify-center gap-2 py-4 text-lg">
            {t('checkout')}
            {isRTL ? <ArrowLeft className="w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
          </Link>
        </div>
      </div>
    </div>
  );
}
