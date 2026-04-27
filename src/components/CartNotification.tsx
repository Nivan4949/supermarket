"use client";

import React from 'react';
import Link from 'next/link';
import { X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

interface CartNotificationProps {
  t: (key: string) => string;
  language: string;
  product: {
    name_en: string;
    name_ar: string;
    image_url: string;
  };
  toastId: string;
}

const CartNotification = ({ t, language, product, toastId }: CartNotificationProps) => {
  const name = language === 'en' ? product.name_en : product.name_ar;

  return (
    <div className={`bg-white rounded-2xl shadow-2xl border border-gray-100 p-4 w-[calc(100vw-2rem)] sm:w-[350px] transition-all duration-300 ease-out animate-in ${language === 'ar' ? 'slide-in-from-left' : 'slide-in-from-right'} fade-in fill-mode-both`}>
      <div className="flex items-start gap-4">
        <div className="w-16 h-16 rounded-xl overflow-hidden bg-gray-50 flex-shrink-0">
          <img src={product.image_url} alt={name} className="w-full h-full object-cover" />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{name}</h3>
            <button 
              onClick={() => toast.dismiss(toastId)}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          
          <div className="flex items-center gap-1 text-green-600 mt-1">
            <CheckCircle className="w-3.5 h-3.5" />
            <span className="text-xs font-bold uppercase tracking-wider">
              {language === 'en' ? 'Added to Cart' : 'تمت الإضافة للسلة'}
            </span>
          </div>

          <Link 
            href="/cart" 
            onClick={() => toast.dismiss(toastId)}
            className="mt-3 block w-full bg-primary-600 text-white text-center py-2 rounded-xl text-sm font-bold hover:bg-primary-700 transition-colors"
          >
            {t('cart')}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CartNotification;
