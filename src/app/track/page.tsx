"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Search, Package, Clock, Truck, CheckCircle, XCircle, Printer, Phone, Mail, User, Calendar, MessageCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { useLanguage } from '@/context/LanguageContext';

function TrackContent() {
  const searchParams = useSearchParams();
  const [orderId, setOrderId] = useState(searchParams.get('orderId') || '');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const { t, isRTL, language } = useLanguage();

  useEffect(() => {
    const urlOrderId = searchParams.get('orderId');
    if (urlOrderId) {
      performTrack(urlOrderId);
    }
  }, []);

  const performTrack = async (id: string) => {
    if (!id) return;
    setLoading(true);
    try {
      const docRef = doc(db, 'orders', id);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error('Order not found. Please check the ID.');
        setOrder(null);
      }
    } catch (error) {
      console.error('Track error:', error);
      toast.error('Error tracking order');
    } finally {
      setLoading(false);
    }
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    performTrack(orderId);
  };

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order?.status || 'pending');

  if (!searchParams.get('orderId')) {
    return (
      <div className="max-w-md mx-auto text-center py-20 space-y-4">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto text-gray-300">
          <Package className="w-10 h-10" />
        </div>
        <h1 className="text-2xl font-bold text-gray-900">Direct Access Restricted</h1>
        <p className="text-gray-500">Please use the tracking link provided in your WhatsApp message to view order details.</p>
        <Link href="/" className="btn btn-primary inline-block px-8 py-3 rounded-xl mt-4">Back to Shop</Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {loading && <div className="text-center py-10 font-bold text-primary-600 animate-pulse">Loading order tracking data...</div>}
      
      {order && (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          {/* Header */}
          <div className="flex justify-between items-center bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">Order Number #{order.id.slice(0, 8)}</h2>
              <p className="text-sm text-gray-500">
                {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'N/A'}
              </p>
            </div>
          </div>

          {/* Order Status Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-4">Order status</h3>
            <div className="flex items-start gap-4">
              <div className={`mt-1 w-3 h-3 rounded-full ${order.status === 'pending' ? 'bg-[#004d40]' : 'bg-green-500'}`}></div>
              <div>
                <p className="font-bold text-gray-900 dark:text-white capitalize">Order {order.status}</p>
                <p className="text-xs text-gray-400">
                  {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleString('en-GB', { hour: '2-digit', minute: '2-digit', hour12: true }) : 'Today'}
                </p>
              </div>
            </div>
          </div>

          {/* Order Details Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-6">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Order details</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Calendar className="w-3 h-3" /> Date
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    {order.createdAt?.toDate ? order.createdAt.toDate().toLocaleDateString('en-GB') : 'N/A'}
                  </p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Phone className="w-3 h-3" /> Phone
                  </p>
                  <a href={`tel:${order.customer.fullPhone}`} className="font-medium text-[#006064] hover:underline">
                    {order.customer.fullPhone}
                  </a>
                </div>
              </div>

              <div className="space-y-4">
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <User className="w-3 h-3" /> Name
                  </p>
                  <p className="font-medium text-gray-800 dark:text-gray-200">{order.customer.name}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Mail className="w-3 h-3" /> Email
                  </p>
                  <a href={`mailto:${order.customer.email}`} className="font-medium text-[#006064] hover:underline break-all">
                    {order.customer.email || 'N/A'}
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Order Summary Card */}
          <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm space-y-8">
            <h3 className="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Order Summary</h3>
            
            <div className="space-y-6">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex items-center gap-4">
                  <div className="w-16 h-16 bg-gray-50 rounded-xl overflow-hidden flex-shrink-0">
                    <img src={item.image_url} alt={item.name_en} className="w-full h-full object-contain p-2" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white line-clamp-1">{language === 'en' ? item.name_en : item.name_ar}</p>
                  </div>
                  <div className="text-right font-bold text-gray-900 dark:text-white">
                    x{item.quantity}
                  </div>
                </div>
              ))}
            </div>

            <div className="pt-6 border-t border-gray-50 dark:border-gray-800 space-y-3">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Subtotal</span>
                <span>{order.total?.toFixed(2)} SAR</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Shipping</span>
                <span>0.00 SAR</span>
              </div>
              <div className="flex justify-between pt-4 border-t border-gray-50 dark:border-gray-800">
                <span className="font-bold text-lg text-gray-900 dark:text-white">Total</span>
                <span className="font-bold text-lg text-gray-900 dark:text-white">{order.total?.toFixed(2)} SAR</span>
              </div>
            </div>
          </div>

          {/* WhatsApp Button */}
          <a 
            href={`https://wa.me/966506725651?text=${encodeURIComponent(`Tracking Order: #${order.id.slice(0, 8)}`)}`}
            className="w-full flex items-center justify-center gap-3 bg-[#8fdfd0] hover:bg-[#7bcbc0] text-gray-700 py-4 rounded-xl font-medium transition-all shadow-sm active:scale-[0.98]"
          >
            <MessageCircle className="w-5 h-5" />
            Order on WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={<div className="text-center py-20 font-bold text-gray-500">Loading tracking system...</div>}>
      <TrackContent />
    </Suspense>
  );
}
