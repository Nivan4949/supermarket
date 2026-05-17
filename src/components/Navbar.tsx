"use client";

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { ShoppingCart, Globe, Search, LogOut } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { useCart } from '@/context/CartContext';
import { useSearch } from '@/context/SearchContext';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const Navbar = () => {
  const { language, setLanguage, t, isRTL } = useLanguage();
  const { cartCount } = useCart();
  const { searchQuery, setSearchQuery } = useSearch();

  // Autocomplete search states
  const [products, setProducts] = useState<any[]>([]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  
  const dropdownRef = useRef<HTMLDivElement>(null);
  const mobileDropdownRef = useRef<HTMLDivElement>(null);

  // Fetch all active products on mount for fast instant searching
  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'products'), (snapshot) => {
      const prods = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setProducts(prods.filter((p: any) => p.isActive !== false));
    });
    return () => unsub();
  }, []);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      const clickedOutsideDesktop = dropdownRef.current && !dropdownRef.current.contains(target);
      const clickedOutsideMobile = mobileDropdownRef.current && !mobileDropdownRef.current.contains(target);

      if (clickedOutsideDesktop && clickedOutsideMobile) {
        setIsDropdownOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Handle Escape key to close the search dropdown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsDropdownOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  // Filter matching products for live autocomplete results
  const query = searchQuery.toLowerCase().trim();
  const matchingProducts = query
    ? products.filter((p: any) =>
        (p.name_en?.toLowerCase() || '').includes(query) ||
        (p.name_ar?.toLowerCase() || '').includes(query) ||
        (p.desc_en?.toLowerCase() || '').includes(query) ||
        (p.desc_ar?.toLowerCase() || '').includes(query)
      )
    : [];

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

      <nav className="bg-white shadow-sm border-b border-gray-100">
        <div className="container mx-auto px-4">
          {/* Main Top Row */}
          <div className="flex items-center justify-between h-16">
            {/* Logo & Brand */}
            <Link href="/" className="flex flex-col items-start leading-tight group">
              <span className={`text-xl md:text-2xl font-serif tracking-tight text-gray-900 group-hover:text-primary-600 transition-colors ${language === 'ar' ? 'font-arabic-serif' : ''}`}>
                {t('storeName')}
              </span>
              <div className="h-0.5 w-full bg-primary-600 scale-x-0 group-hover:scale-x-100 transition-transform origin-left"></div>
            </Link>

            {/* Desktop Search Bar (Floating dropdown relative container) */}
            <div className="hidden md:flex flex-1 max-w-md mx-8 relative" ref={dropdownRef}>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={t('search')}
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setIsDropdownOpen(true);
                  }}
                  onFocus={() => setIsDropdownOpen(true)}
                  className="w-full bg-gray-100 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-primary-500 transition-all text-sm outline-none"
                />
                <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 text-gray-400 w-5 h-5`} />
              </div>

              {/* Desktop Autocomplete Results Dropdown */}
              {isDropdownOpen && query && (
                <div className={`absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto custom-scrollbar ${isRTL ? 'text-right' : 'text-left'}`}>
                  {matchingProducts.length > 0 ? (
                    <div className="p-2 space-y-1">
                      {matchingProducts.slice(0, 8).map((product) => (
                        <Link
                          key={product.id}
                          href={`/product/${product.id}`}
                          onClick={() => {
                            setIsDropdownOpen(false);
                            setSearchQuery('');
                          }}
                          className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all hover:translate-x-1 duration-150"
                        >
                          <img
                            src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'}
                            alt={language === 'en' ? product.name_en : product.name_ar}
                            className="w-12 h-12 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100';
                            }}
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 truncate text-sm">
                              {language === 'en' ? product.name_en : product.name_ar}
                            </h4>
                            <p className="text-xs text-primary-600 font-extrabold mt-0.5">
                              {Number(product.price || 0).toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                            </p>
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center text-gray-400 text-sm font-medium">
                      🔍 {isRTL ? 'لا توجد نتائج مطابقة' : 'No matching products found'}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-4">
              {/* Language Toggle */}
              <button
                onClick={toggleLanguage}
                className="flex items-center gap-1 text-gray-600 hover:text-primary-600 transition-colors cursor-pointer"
              >
                <Globe className="w-5 h-5" />
                <span className="text-xs font-bold uppercase">{language}</span>
              </button>

              {/* Cart */}
              <Link href="/cart" className="relative text-gray-600 hover:text-primary-600 transition-colors">
                <ShoppingCart className="w-6 h-6" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-red-500 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                    {cartCount}
                  </span>
                )}
              </Link>
            </div>
          </div>

          {/* Mobile Search Bar Row (Only visible on mobile screens) */}
          <div className="md:hidden pb-3 relative" ref={mobileDropdownRef}>
            <div className="relative w-full">
              <input
                type="text"
                placeholder={t('search')}
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsDropdownOpen(true);
                }}
                onFocus={() => setIsDropdownOpen(true)}
                className="w-full bg-gray-100 border-none rounded-full py-2 px-10 focus:ring-2 focus:ring-primary-500 transition-all text-sm outline-none"
              />
              <Search className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-2.5 text-gray-400 w-4 h-4`} />
            </div>

            {/* Mobile Autocomplete Results Dropdown */}
            {isDropdownOpen && query && (
              <div className={`absolute top-full left-0 right-0 mt-1 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50 max-h-80 overflow-y-auto custom-scrollbar ${isRTL ? 'text-right' : 'text-left'}`}>
                {matchingProducts.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {matchingProducts.slice(0, 8).map((product) => (
                      <Link
                        key={product.id}
                        href={`/product/${product.id}`}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <img
                          src={product.image_url || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100'}
                          alt={language === 'en' ? product.name_en : product.name_ar}
                          className="w-10 h-10 rounded-lg object-cover bg-gray-50 flex-shrink-0"
                          onError={(e) => {
                            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&q=80&w=100';
                          }}
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-bold text-gray-900 truncate text-sm">
                            {language === 'en' ? product.name_en : product.name_ar}
                          </h4>
                          <p className="text-xs text-primary-600 font-extrabold mt-0.5">
                            {Number(product.price || 0).toFixed(2)} {isRTL ? 'ر.س' : 'SAR'}
                          </p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-6 text-center text-gray-400 text-sm font-medium">
                    🔍 {isRTL ? 'لا توجد نتائج مطابقة' : 'No matching products found'}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </nav>
    </div>
  );
};

export default Navbar;
