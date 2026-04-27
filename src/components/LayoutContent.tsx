"use client";

import { usePathname } from 'next/navigation';
import Navbar from './Navbar';
import Footer from './Footer';
import AdminNavbar from './AdminNavbar';

export default function LayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const isLoginPage = pathname === '/admin/login';

  if (isAdmin && !isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <AdminNavbar />
        <main className="flex-1 container mx-auto px-4 py-8">
          {children}
        </main>
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        {children}
      </main>
      <Footer />
    </>
  );
}
