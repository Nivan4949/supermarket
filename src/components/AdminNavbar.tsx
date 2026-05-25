"use client";

import Link from 'next/link';
import { LayoutDashboard, Package, ListTree, ShoppingBag, LogOut, Home, Settings, Search, Tag, Menu, X } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot } from 'firebase/firestore';

const AdminNavbar = () => {
  const pathname = usePathname();
  const dropdownRef = useRef<HTMLDivElement>(null);

  const [products, setProducts] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Products', href: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Categories', href: '/admin/categories', icon: <ListTree className="w-5 h-5" /> },
    { label: 'Offers', href: '/admin/offers', icon: <Tag className="w-5 h-5" /> },
    { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
    { label: 'Settings', href: '/admin/settings', icon: <Settings className="w-5 h-5" /> },
  ];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setProducts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    const unsubCategories = onSnapshot(collection(db, 'categories'), (snapshot) => {
      setCategories(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => { unsubProducts(); unsubCategories(); };
  }, []);

  const filteredProducts = searchQuery ? products.filter(product => (
    product.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.name_ar?.toLowerCase().includes(searchQuery.toLowerCase())
  )).slice(0, 5) : [];

  const filteredCategories = searchQuery ? categories.filter(cat => (
    cat.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    cat.name_ar?.toLowerCase().includes(searchQuery.toLowerCase())
  )).slice(0, 5) : [];

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-8">
            <Link href="/admin" className="font-bold text-xl text-primary-600 flex items-center gap-2">
              <span className="font-serif">Sanabel Admin</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all ${
                    pathname === item.href 
                      ? 'bg-primary-50 text-primary-600' 
                      : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                  }`}
                >
                  {item.icon}
                  {item.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Global Search Bar */}
          <div ref={dropdownRef} className="hidden lg:block relative flex-1 max-w-md mx-8">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search products & categories..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsFocused(true);
                }}
                onFocus={() => setIsFocused(true)}
                className="w-full bg-gray-50 border-none rounded-xl pl-10 pr-4 py-2 text-sm focus:ring-2 focus:ring-primary-500 transition-all font-medium text-gray-700"
              />
            </div>

            {/* Dropdown Overlay */}
            {isFocused && searchQuery && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-[70] max-h-96 overflow-y-auto animate-in fade-in slide-in-from-top-2 duration-200">
                {/* Categories Header */}
                {filteredCategories.length > 0 && (
                  <div className="p-2 border-b border-gray-50">
                    <div className="text-[10px] uppercase font-bold text-gray-400 px-3 py-1.5 tracking-wider">Categories</div>
                    {filteredCategories.map(cat => (
                      <Link
                        key={cat.id}
                        href={`/admin/categories?search=${encodeURIComponent(cat.name_en)}`}
                        onClick={() => {
                          setIsFocused(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <img src={cat.image_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-50" />
                        <div>
                          <div className="text-sm font-bold text-gray-800">{cat.name_en}</div>
                          <div className="text-xs text-gray-400">{cat.name_ar}</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {/* Products Header */}
                {filteredProducts.length > 0 && (
                  <div className="p-2 border-b border-gray-50">
                    <div className="text-[10px] uppercase font-bold text-gray-400 px-3 py-1.5 tracking-wider">Products</div>
                    {filteredProducts.map(product => (
                      <Link
                        key={product.id}
                        href={`/admin/products?search=${encodeURIComponent(product.name_en)}`}
                        onClick={() => {
                          setIsFocused(false);
                          setSearchQuery('');
                        }}
                        className="flex items-center gap-3 px-3 py-2 hover:bg-gray-50 rounded-xl transition-all"
                      >
                        <img src={product.image_url} alt="" className="w-8 h-8 rounded-lg object-cover bg-gray-50" />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-bold text-gray-800 truncate">{product.name_en}</div>
                          <div className="text-xs text-gray-400 truncate">{product.name_ar}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold text-primary-600">{product.price?.toFixed(2)} SAR</div>
                          <div className="text-[9px] text-gray-400">{product.stock} in stock</div>
                        </div>
                      </Link>
                    ))}
                  </div>
                )}

                {filteredCategories.length === 0 && filteredProducts.length === 0 && (
                  <div className="p-8 text-center text-gray-400 flex flex-col items-center justify-center gap-2">
                    <Search className="w-8 h-8 text-gray-300" />
                    <span className="font-bold text-sm text-gray-500">No results match "{searchQuery}"</span>
                    <span className="text-xs text-gray-400">Try a different search term</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors text-sm font-bold"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:block">View Site</span>
            </Link>
            <Link 
              href="/admin/login"
              onClick={() => localStorage.removeItem('isAdminAuthenticated')}
              className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all text-sm font-bold"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:block">Logout</span>
            </Link>

            {/* Hamburger Button */}
            <button 
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition-all"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Panel */}
      {isMenuOpen && (
        <div className="md:hidden border-t border-gray-100 py-3 px-2 space-y-1 bg-white animate-in fade-in slide-in-from-top-4 duration-200 shadow-lg">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsMenuOpen(false)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all ${
                pathname === item.href 
                  ? 'bg-primary-50 text-primary-600' 
                  : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
  );
};

export default AdminNavbar;
