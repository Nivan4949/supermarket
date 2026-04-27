"use client";

import Link from 'next/link';
import { ShoppingBag, Users, TrendingUp, Package, ChevronRight, Clock } from 'lucide-react';
import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, limit, orderBy } from 'firebase/firestore';

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    totalSales: 0,
    totalProducts: 0,
    pendingOrders: 0
  });
  const [recentOrders, setRecentOrders] = useState<any[]>([]);

  useEffect(() => {
    const unsubOrders = onSnapshot(collection(db, 'orders'), (snapshot) => {
      let sales = 0;
      let pending = 0;
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        sales += data.total || 0;
        if (data.status === 'pending') pending++;
      });
      setStats(prev => ({
        ...prev,
        totalOrders: snapshot.size,
        totalSales: sales,
        pendingOrders: pending
      }));
    });

    const unsubProducts = onSnapshot(collection(db, 'products'), (snapshot) => {
      setStats(prev => ({ ...prev, totalProducts: snapshot.size }));
    });

    const recentQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5));
    const unsubRecent = onSnapshot(recentQ, (snapshot) => {
      setRecentOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });

    return () => { unsubOrders(); unsubProducts(); unsubRecent(); };
  }, []);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <div className="text-sm text-gray-500 font-medium bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<ShoppingBag className="text-blue-600" />} label="Total Orders" value={stats.totalOrders} color="bg-blue-50" />
        <StatCard icon={<TrendingUp className="text-green-600" />} label="Total Sales" value={`${stats.totalSales.toFixed(2)} SAR`} color="bg-green-50" />
        <StatCard icon={<Package className="text-purple-600" />} label="Products" value={stats.totalProducts} color="bg-purple-50" />
        <StatCard icon={<Clock className="text-yellow-600" />} label="Pending" value={stats.pendingOrders} color="bg-yellow-50" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1 space-y-6">
          <h2 className="text-xl font-bold">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4">
            <QuickActionLink href="/admin/products" label="Add New Product" description="Manage your inventory" icon={<Package />} />
            <QuickActionLink href="/admin/orders" label="Process Orders" description={`${stats.pendingOrders} orders waiting`} icon={<ShoppingBag />} />
            <QuickActionLink href="/admin/categories" label="Categories" description="Organize your shop" icon={<TrendingUp />} />
          </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-bold">Recent Orders</h2>
            <Link href="/admin/orders" className="text-primary-600 text-sm font-bold hover:underline">View All</Link>
          </div>
          <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {recentOrders.map(order => (
              <div key={order.id} className="p-4 border-b border-gray-50 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center font-bold text-gray-500">
                    {order.customer?.name?.[0] || '?' }
                  </div>
                  <div>
                    <div className="font-bold">{order.customer?.name}</div>
                    <div className="text-xs text-gray-500">#{order.id.slice(0, 8)} • {order.createdAt?.toDate().toLocaleTimeString()}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-primary-600">{order.total?.toFixed(2)} SAR</div>
                  <div className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full inline-block ${order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700'}`}>
                    {order.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

const StatCard = ({ icon, label, value, color }: any) => (
  <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
    <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center mb-4`}>
      {icon}
    </div>
    <div className="text-gray-500 text-sm font-medium">{label}</div>
    <div className="text-2xl font-bold text-gray-900 mt-1">{value}</div>
  </div>
);

const QuickActionLink = ({ href, label, description, icon }: any) => (
  <Link href={href} className="flex items-center justify-between p-4 bg-white rounded-2xl border border-gray-100 hover:border-primary-500 transition-all group">
    <div className="flex items-center gap-4">
      <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400 group-hover:text-primary-600 transition-colors">
        {icon}
      </div>
      <div>
        <div className="font-bold text-gray-900">{label}</div>
        <div className="text-xs text-gray-500">{description}</div>
      </div>
    </div>
    <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-primary-600" />
  </Link>
);
