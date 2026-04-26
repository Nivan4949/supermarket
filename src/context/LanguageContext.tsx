"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';

type Language = 'en' | 'ar';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
  isRTL: boolean;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const translations = {
  en: {
    home: 'Home',
    shop: 'Shop',
    cart: 'Cart',
    checkout: 'Checkout',
    admin: 'Admin',
    search: 'Search products...',
    addToCart: 'Add to Cart',
    categories: 'Categories',
    featuredProducts: 'Featured Products',
    orderSuccess: 'Order Success',
    trackOrder: 'Track Order',
    whatsappOrder: 'Order via WhatsApp',
    total: 'Total',
    subtotal: 'Subtotal',
    deliveryFee: 'Delivery Fee',
    language: 'Language',
    login: 'Login',
    logout: 'Logout',
  },
  ar: {
    home: 'الرئيسية',
    shop: 'المتجر',
    cart: 'السلة',
    checkout: 'الدفع',
    admin: 'لوحة التحكم',
    search: 'البحث عن منتجات...',
    addToCart: 'أضف إلى السلة',
    categories: 'التصنيفات',
    featuredProducts: 'منتجات مميزة',
    orderSuccess: 'تم الطلب بنجاح',
    trackOrder: 'تتبع الطلب',
    whatsappOrder: 'طلب عبر واتساب',
    total: 'الإجمالي',
    subtotal: 'المجموع الفرعي',
    deliveryFee: 'رسوم التوصيل',
    language: 'اللغة',
    login: 'تسجيل الدخول',
    logout: 'تسجيل الخروج',
  }
};

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('lang') as Language;
    if (savedLang) setLanguageState(savedLang);
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    localStorage.setItem('lang', lang);
  };

  useEffect(() => {
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = language;
  }, [language]);

  const t = (key: string) => {
    const keys = key.split('.');
    let value: any = translations[language];
    for (const k of keys) {
      value = value?.[k];
    }
    return value || key;
  };

  const isRTL = language === 'ar';

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t, isRTL }}>
      <div dir={isRTL ? 'rtl' : 'ltr'}>
        {children}
      </div>
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
