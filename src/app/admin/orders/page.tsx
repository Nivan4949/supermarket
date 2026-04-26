"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { ShoppingBag, Clock, CheckCircle, XCircle, Phone, MapPin, ChevronDown, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status: newStatus });
      toast.success(`Order ${newStatus}`);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white dark:bg-gray-800 border-none rounded-xl px-4 py-2 shadow-sm font-bold text-gray-600"
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <div className="grid grid-cols-1 gap-6">
        {filteredOrders.map(order => (
          <div key={order.id} className="bg-white dark:bg-gray-800 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
            <div className="p-6 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50 dark:bg-gray-700/30">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-primary-100 rounded-2xl flex items-center justify-center text-primary-600">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Order ID</div>
                  <div className="font-mono font-bold">#{order.id.slice(0, 12)}</div>
                </div>
              </div>
              
              <div className="flex items-center gap-8">
                <div className="text-right">
                  <div className="text-xs text-gray-500 font-bold uppercase tracking-wider">Amount</div>
                  <div className="font-bold text-lg">{order.total?.toFixed(2)} SAR</div>
                </div>
                <div className="relative group">
                  <div className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 cursor-pointer ${
                    order.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                    order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {order.status.toUpperCase()}
                    <ChevronDown className="w-4 h-4" />
                  </div>
                  
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-100 dark:border-gray-700 hidden group-hover:block z-10">
                    {['pending', 'processing', 'delivered', 'cancelled'].map(s => (
                      <button 
                        key={s} 
                        onClick={() => updateStatus(order.id, s)}
                        className="w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50 dark:hover:bg-gray-700 first:rounded-t-xl last:rounded-b-xl capitalize"
                      >
                        Mark as {s}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Customer Details</h3>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 font-bold"><User className="w-4 h-4 text-gray-400" /> {order.customer?.name}</div>
                  <div className="flex items-center gap-2 text-gray-600"><Phone className="w-4 h-4 text-gray-400" /> {order.customer?.phone}</div>
                  <div className="flex items-center gap-2 text-gray-600"><MapPin className="w-4 h-4 text-gray-400" /> {order.customer?.address}</div>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Order Items</h3>
                <div className="space-y-2">
                  {order.items?.map((item: any) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span className="font-medium">{item.name_en} <span className="text-gray-400 text-xs">x{item.quantity}</span></span>
                      <span className="font-bold">{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
