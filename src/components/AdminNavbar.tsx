"use client";

import Link from 'next/link';
import { LayoutDashboard, Package, ListTree, ShoppingBag, LogOut, Home } from 'lucide-react';
import { usePathname } from 'next/navigation';

const AdminNavbar = () => {
  const pathname = usePathname();

  const navItems = [
    { label: 'Dashboard', href: '/admin', icon: <LayoutDashboard className="w-5 h-5" /> },
    { label: 'Products', href: '/admin/products', icon: <Package className="w-5 h-5" /> },
    { label: 'Categories', href: '/admin/categories', icon: <ListTree className="w-5 h-5" /> },
    { label: 'Orders', href: '/admin/orders', icon: <ShoppingBag className="w-5 h-5" /> },
  ];

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

          <div className="flex items-center gap-4">
            <Link 
              href="/" 
              className="flex items-center gap-2 text-gray-500 hover:text-primary-600 transition-colors text-sm font-bold"
            >
              <Home className="w-5 h-5" />
              <span className="hidden sm:block">View Site</span>
            </Link>
            <Link 
              href="/"
              onClick={() => localStorage.removeItem('isAdminAuthenticated')}
              className="flex items-center gap-2 text-red-500 hover:bg-red-50 px-4 py-2 rounded-xl transition-all text-sm font-bold"
            >
              <LogOut className="w-5 h-5" />
              <span className="hidden sm:block">Logout</span>
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default AdminNavbar;
