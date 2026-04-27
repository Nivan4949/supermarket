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
    storeName: 'Super market Sanabel oula',
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
    dairy: 'Dairy',
    fruits: 'Fruits',
    vegetables: 'Vegetables',
    beverages: 'Beverages',
    pantry: 'Pantry',
    bakery: 'Bakery',
    cartEmpty: 'Your cart is empty',
    cartEmptyDesc: "Looks like you haven't added anything to your cart yet.",
    startShopping: 'Start Shopping',
    clearCart: 'Clear Cart',
    orderSummary: 'Order Summary',
    orderDetails: 'Order Details',
    processing: 'Processing...',
    fullName: 'Full Name',
    phoneNumber: 'Phone Number',
    deliveryAddress: 'Delivery Address',
    additionalNotes: 'Additional Notes',
    shopNow: 'Shop Now',
    viewAll: 'View All',
    trackYourOrder: 'Track Your Order',
    trackOrderDesc: 'Enter your order ID to see the current status',
    orderIdPlaceholder: 'Order ID (e.g. xY789...)',
    track: 'Track',
    orderStatus: 'Order Status',
    estimatedDelivery: 'Estimated Delivery',
    businessDays: '2-3 Business Days',
    itemsInOrder: 'Items in this order',
    totalAmount: 'Total Amount',
    searching: 'Searching...',
    pending: 'Pending',
    shipped: 'Shipped',
    delivered: 'Delivered',
  },
  ar: {
    home: 'الرئيسية',
    storeName: 'تموينات السنابل الأولى',
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
    dairy: 'الألبان',
    fruits: 'الفواكه',
    vegetables: 'الخضروات',
    beverages: 'المشروبات',
    pantry: 'المؤونة',
    bakery: 'المخبوزات',
    cartEmpty: 'سلتك فارغة',
    cartEmptyDesc: 'يبدو أنك لم تضف أي شيء إلى سلتك بعد.',
    startShopping: 'ابدأ التسوق',
    clearCart: 'مسح السلة',
    orderSummary: 'ملخص الطلب',
    orderDetails: 'تفاصيل الطلب',
    processing: 'جاري المعالجة...',
    fullName: 'الاسم الكامل',
    phoneNumber: 'رقم الجوال',
    deliveryAddress: 'عنوان التوصيل',
    additionalNotes: 'ملاحظات إضافية',
    shopNow: 'تسوق الآن',
    viewAll: 'عرض الكل',
    trackYourOrder: 'تتبع طلبك',
    trackOrderDesc: 'أدخل رقم الطلب لرؤية الحالة الحالية',
    orderIdPlaceholder: 'رقم الطلب (مثال: xY789...)',
    track: 'تتبع',
    orderStatus: 'حالة الطلب',
    estimatedDelivery: 'التوصيل المتوقع',
    businessDays: '2-3 أيام عمل',
    itemsInOrder: 'الأصناف في هذا الطلب',
    totalAmount: 'المبلغ الإجمالي',
    searching: 'جاري البحث...',
    pending: 'قيد الانتظار',
    shipped: 'تم الشحن',
    delivered: 'تم التوصيل',
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
