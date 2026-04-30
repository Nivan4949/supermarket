"use client";

import Link from 'next/link';
import { ShoppingCart, Globe, Search, User } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useSearch } from '@/context/SearchContext';

const Navbar = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { cartCount } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="w-full z-50 sticky top-0">
      {/* Announcement Bar */}
      <div className="bg-[#004d40] text-white py-1.5 px-4 text-center text-[10px] md:text-xs font-bold tracking-wider">
        <div className="container mx-auto flex justify-center items-center gap-4">
          <span className="opacity-90">{isRTL ? 'توصيل منزلي مجاني في رنية لمسافة 5 كم' : 'Free Home delivery in Raniyah 5 km'}</span>
          <div className="w-1 h-1 bg-white/30 rounded-full hidden md:block"></div>
          <span className="opacity-90 hidden md:inline">{isRTL ? 'Free Home delivery in Raniyah 5 km' : 'توصيل منزلي مجاني في رنية لمسافة 5 كم'}</span>
        </div>
      </div>

      <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <Link href="/" className="flex flex-col items-start leading-tight group">
            <span className={`text-xl md:text-2xl font-serif tracking-tight text-gray-900 group-hover:text-primary-600 transition-colors ${language === 'ar' ? 'font-arabic-serif' : ''}`}>
              {t('storeName')}
            </span>
            <div className="h-0.5 w-full bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex flex-1 max-w-md mx-8">
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-100 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-primary-500 transition-all"
              />
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 text-gray-400 w-5 h-5`} />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-4">
            {/* Language Toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors"
            >
              <Globe className="w-5 h-5" />
              <span className="text-xs font-bold uppercase">{language}</span>
            </button>

            {/* Cart */}
            <Link href="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
              <ShoppingCart className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>

          </div>
        </div>
      </div>
      </nav>
    </div>
  );
};

export default Navbar;
