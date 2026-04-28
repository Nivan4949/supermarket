"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { CheckCircle, Package, ArrowRight, MessageCircle } from 'lucide-react';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';

function OrderSuccessContent() {
  const searchParams = useSearchParams();
  const { t, isRTL, language } = useLanguage();
  const orderId = searchParams.get('orderId') || 'N/A';
  const [whatsappUrl, setWhatsappUrl] = useState<string | null>(null);
  const [orderData, setOrderData] = useState<any>(null);

  useEffect(() => {
    const fetchOrderAndBuildMessage = async () => {
      if (!orderId || orderId === 'N/A') return;

      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          const data = orderDoc.data();
          setOrderData(data);
          const whatsappNumber = '966506725651';
          const itemsText = data.items.map((item: any) => 
            `${item.quantity} x ${item.name_en} – ${item.name_ar}`
          ).join('\n');

          const dateStr = data.createdAt?.toDate ? data.createdAt.toDate().toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

          const message = encodeURIComponent(
            `Order from https://supermarket-sand.vercel.app\n\n` +
            `Order Number: ${orderId.slice(0, 8)}\n` +
            `Date: ${dateStr}\n` +
            `Name: ${data.customer.name}\n` +
            `Phone: ${data.customer.fullPhone}\n\n` +
            `Products:\n${itemsText}\n\n` +
            `Shipping: ${data.customer.deliveryMethod === 'homeDelivery' ? 'Home Delivery' : 'Pick up'}\n` +
            `Total: ${data.total.toFixed(2)} SAR\n\n` +
            `Track your order https://supermarket-sand.vercel.app/track?orderId=${orderId}`
          );

          const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
          setWhatsappUrl(whatsappUrl);
        }
      } catch (error) {
        console.error('Error fetching order:', error);
      }
    };

    fetchOrderAndBuildMessage();
  }, [orderId]);

  return (
    <div className="max-w-2xl mx-auto text-center py-12 space-y-8">
      <div className="flex justify-center">
        <div className="w-24 h-24 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center text-green-600 animate-bounce">
          <CheckCircle className="w-12 h-12" />
        </div>
      </div>

      <div className="space-y-4">
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white">
          {isRTL ? 'تم استلام طلبك بنجاح!' : 'Order Placed Successfully!'}
        </h1>
        <p className="text-gray-500 text-lg">
          {isRTL 
            ? 'شكراً لتسوقك معنا. رقم طلبك هو: ' 
            : 'Thank you for shopping with us. Your order ID is: '}
          <span className="font-mono font-bold text-primary-600">#{orderId.slice(0, 8)}</span>
        </p>
      </div>

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-8">
        {orderData && (
          <div className="space-y-6 border-b border-gray-100 dark:border-gray-700 pb-8">
            <div className="text-left rtl:text-right space-y-2">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">{t('orderSummary')}</h3>
              <div className="space-y-3">
                {orderData.items.map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm text-gray-600 dark:text-gray-400">
                    <span>{language === 'en' ? item.name_en : item.name_ar} (x{item.quantity})</span>
                    <span className="font-bold">{(item.price * item.quantity).toFixed(2)} SAR</span>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-50 dark:border-gray-800 flex justify-between items-center">
                <span className="font-extrabold text-lg text-gray-900 dark:text-white">{t('total')}</span>
                <span className="font-extrabold text-2xl text-primary-600">{orderData.total.toFixed(2)} SAR</span>
              </div>
            </div>

            <div className="text-left rtl:text-right space-y-1">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">{t('deliveryAddress')}</p>
              <p className="text-sm text-gray-700 dark:text-gray-300 font-medium">{orderData.customer.address}</p>
            </div>
          </div>
        )}

        <div className="space-y-4">
          {whatsappUrl && (
            <a 
              href={whatsappUrl}
              className="flex items-center gap-4 p-5 rounded-2xl bg-green-50 border-2 border-green-100 hover:border-green-200 transition-all text-left rtl:text-right group"
            >
              <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-green-200 group-hover:scale-110 transition-transform">
                <MessageCircle className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-bold text-green-700">{isRTL ? 'إرسال الفاتورة عبر واتساب' : 'Send Receipt via WhatsApp'}</h3>
                <p className="text-sm text-green-600/80">{isRTL ? 'اضغط هنا لتأكيد طلبك وتجهيزه.' : 'Click here to confirm and process your order.'}</p>
              </div>
            </a>
          )}

          )}
        </div>
      </div>

      <div className="flex justify-center pt-4">
        <Link href="/" className="btn btn-primary px-10 py-4 flex items-center justify-center gap-2 text-lg">
          {isRTL ? 'العودة للمتجر والتسوق' : 'Back to Shop & Shopping'}
          {isRTL ? <ArrowRight className="rotate-180 w-5 h-5" /> : <ArrowRight className="w-5 h-5" />}
        </Link>
      </div>
    </div>
  );
}

export default function OrderSuccessPage() {
  return (
    <Suspense fallback={<div className="text-center py-20">Loading order details...</div>}>
      <OrderSuccessContent />
    </Suspense>
  );
}
