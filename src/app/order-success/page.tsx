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

  useEffect(() => {
    const fetchOrderAndBuildMessage = async () => {
      if (!orderId || orderId === 'N/A') return;

      try {
        const orderDoc = await getDoc(doc(db, 'orders', orderId));
        if (orderDoc.exists()) {
          const orderData = orderDoc.data();
          const whatsappNumber = '966506725651';
          const itemsText = orderData.items.map((item: any) => 
            `${item.quantity} x ${item.name_en} – ${item.name_ar}`
          ).join('\n');

          const dateStr = orderData.createdAt?.toDate ? orderData.createdAt.toDate().toLocaleDateString('en-GB') : new Date().toLocaleDateString('en-GB');

          const message = encodeURIComponent(
            `Order from https://supermarket-sand.vercel.app\n\n` +
            `Order Number: ${orderId.slice(0, 8)}\n` +
            `Date: ${dateStr}\n` +
            `Name: ${orderData.customer.name}\n` +
            `Phone: ${orderData.customer.fullPhone}\n\n` +
            `Products:\n${itemsText}\n\n` +
            `Shipping: ${orderData.customer.deliveryMethod === 'homeDelivery' ? 'Home Delivery' : 'Pick up'}\n` +
            `Total: ${orderData.total.toFixed(2)} SAR\n\n` +
            `Track your order https://supermarket-sand.vercel.app/track?orderId=${orderId}`
          );

          const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
          const finalUrl = isMobile 
            ? `whatsapp://send?phone=${whatsappNumber}&text=${message}`
            : `https://wa.me/${whatsappNumber}?text=${message}`;

          setWhatsappUrl(finalUrl);
        }
      } catch (error) {
        console.error('Error fetching order for WhatsApp link:', error);
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

      <div className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-100 dark:border-gray-700 space-y-6">
        <div className="flex items-center gap-4 text-left rtl:text-right">
          <div className="w-12 h-12 bg-primary-50 rounded-2xl flex items-center justify-center text-primary-600">
            <Package className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold">{isRTL ? 'تتبع طلبك' : 'Track Order'}</h3>
            <p className="text-sm text-gray-500">{isRTL ? 'يمكنك تتبع حالة طلبك في أي وقت.' : 'You can track your order status anytime.'}</p>
          </div>
        </div>

        {whatsappUrl ? (
          <a 
            href={whatsappUrl}
            className="flex items-center gap-4 p-4 rounded-2xl bg-green-50 border-2 border-green-100 hover:border-green-200 transition-all text-left rtl:text-right"
          >
            <div className="w-12 h-12 bg-green-500 rounded-xl flex items-center justify-center text-white">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-green-700">{isRTL ? 'إكمال الطلب عبر واتساب' : 'Complete Order on WhatsApp'}</h3>
              <p className="text-sm text-green-600/80">{isRTL ? 'اضغط هنا لإرسال تفاصيل طلبك إلينا.' : 'Click here to send your order details to us.'}</p>
            </div>
          </a>
        ) : (
          <div className="flex items-center gap-4 text-left rtl:text-right">
            <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
              <MessageCircle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold">{isRTL ? 'تواصل معنا' : 'WhatsApp Support'}</h3>
              <p className="text-sm text-gray-500">{isRTL ? 'إذا كان لديك أي استفسار، تواصل معنا عبر واتساب.' : 'If you have any questions, contact us on WhatsApp.'}</p>
            </div>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/track" className="btn btn-secondary px-8 py-4 flex items-center justify-center gap-2">
          {t('trackOrder')}
        </Link>
        <Link href="/" className="btn btn-primary px-8 py-4 flex items-center justify-center gap-2">
          {isRTL ? 'العودة للمتجر' : 'Back to Shop'}
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
