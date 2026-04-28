"use client";

import { useLanguage } from '@/context/LanguageContext';
import Link from 'next/link';

const Footer = () => {
  const { t, language } = useLanguage();

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-8 mt-24">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center space-y-8">
          <div className="text-center">
            <h2 className={`text-3xl font-serif text-gray-900 ${language === 'ar' ? 'font-arabic-serif' : ''}`}>
              {t('storeName')}
            </h2>
            <div className="h-0.5 w-12 bg-primary-600 mx-auto mt-4"></div>
          </div>
          
          <div className="flex flex-wrap justify-center gap-8 text-sm font-medium text-gray-500 uppercase tracking-widest">
            <Link href="/" className="hover:text-primary-600 transition-colors">{t('home')}</Link>
            <Link href="/#categories" className="hover:text-primary-600 transition-colors">{t('shop')}</Link>
            <Link href="/cart" className="hover:text-primary-600 transition-colors">{t('cart')}</Link>
          </div>

          <div className="pt-8 border-t border-gray-50 w-full text-center text-gray-400 text-xs tracking-widest">
            © {new Date().getFullYear()} {t('storeName')}. All rights reserved.
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
