"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MapPin, User, MessageSquare, Mail, Truck } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { db } from '@/lib/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { t, isRTL, language } = useLanguage();
  const router = useRouter();
  
  const [formData, setFormData] = useState({
    name: '',
    countryCode: '+966',
    phone: '',
    email: '',
    address: '',
    notes: '',
    deliveryMethod: 'homeDelivery'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      toast.error('Geolocation is not supported by your browser');
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;
          const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`
          );
          const data = await response.json();
          
          if (data.display_name) {
            setFormData(prev => ({ ...prev, address: data.display_name }));
            toast.success(t('locationFetched'));
          } else {
            setFormData(prev => ({ ...prev, address: `${latitude}, ${longitude}` }));
          }
        } catch (error) {
          console.error('Reverse geocoding error:', error);
          toast.error('Failed to get address. Please enter manually.');
        } finally {
          setIsLocating(false);
        }
      },
      (error) => {
        console.error('Geolocation error:', error);
        toast.error(t('locationDenied'));
        setIsLocating(false);
      }
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      const orderRef = doc(collection(db, 'orders'));
      const orderData = {
        customer: {
          ...formData,
          fullPhone: `${formData.countryCode}${formData.phone}`
        },
        items: cart,
        total: cartTotal,
        status: 'pending',
        createdAt: serverTimestamp(),
        language
      };
      batch.set(orderRef, orderData);

      cart.forEach((item) => {
        const productRef = doc(db, 'products', item.id);
        batch.update(productRef, {
          stock: (item.stock || 0) - item.quantity
        });

        const logRef = doc(collection(db, 'stock_movements'));
        batch.set(logRef, {
          productId: item.id,
          orderId: orderRef.id,
          type: 'sale',
          quantity: item.quantity,
          createdAt: serverTimestamp(),
        });
      });

      await batch.commit();
      const orderId = orderRef.id;
      
      const whatsappNumber = '+966506725651'; // Replace with your actual WhatsApp number
      const fullPhone = `${formData.countryCode}${formData.phone}`;
      const dateStr = new Date().toLocaleDateString('en-GB'); // dd/mm/yyyy
      
      const itemsText = cart.map(item => 
        `${item.quantity} x ${item.name_en} – ${item.name_ar}`
      ).join('\n');

      const message = encodeURIComponent(
        `Order from https://supermarket-sand.vercel.app\n\n` +
        `Order Number: ${orderId.slice(0, 8)}\n` +
        `Date: ${dateStr}\n` +
        `Name: ${formData.name}\n` +
        `Email: ${formData.email || 'N/A'}\n` +
        `Phone: ${fullPhone}\n\n` +
        `Products:\n${itemsText}\n\n` +
        `Shipping: ${formData.deliveryMethod === 'homeDelivery' ? 'Home Delivery' : 'Pick up'}\n` +
        `Total: ${cartTotal.toFixed(2)} SAR\n\n` +
        `Track your order https://supermarket-sand.vercel.app/track?orderId=${orderId}`
      );

      clearCart();
      toast.success('Order placed successfully!');
      
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      
      router.push(`/order-success?orderId=${orderId}`);
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">{t('checkout')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {t('fullName')}
              </label>
              <div className="relative">
                <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full bg-white border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {t('phoneNumber')}
              </label>
              <div className="flex gap-2">
                <div className="relative w-1/3">
                  <select
                    value={formData.countryCode}
                    onChange={(e) => setFormData({...formData, countryCode: e.target.value})}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-3 focus:ring-2 focus:ring-primary-500 appearance-none font-bold"
                  >
                    <option value="+966">🇸🇦 +966</option>
                    <option value="+971">🇦🇪 +971</option>
                    <option value="+965">🇰🇼 +965</option>
                    <option value="+974">🇶🇦 +974</option>
                    <option value="+973">🇧🇭 +973</option>
                    <option value="+968">🇴🇲 +968</option>
                    <option value="+20">🇪🇬 +20</option>
                    <option value="+91">🇮🇳 +91</option>
                  </select>
                </div>
                <div className="relative flex-1">
                  <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                  <input
                    required
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className={`w-full bg-white border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
                    placeholder="05xxxxxxx"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {t('email')}
              </label>
              <div className="relative">
                <Mail className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                <input
                  required
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                  className={`w-full bg-white border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {t('deliveryMethod')}
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, deliveryMethod: 'homeDelivery'})}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.deliveryMethod === 'homeDelivery' ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-gray-100 text-gray-500'}`}
                >
                  <Truck className="w-5 h-5" />
                  <span className="font-bold">{t('homeDelivery')}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, deliveryMethod: 'pickup'})}
                  className={`flex items-center justify-center gap-2 p-3 rounded-xl border-2 transition-all ${formData.deliveryMethod === 'pickup' ? 'border-primary-600 bg-primary-50 text-primary-600' : 'border-gray-100 text-gray-500'}`}
                >
                  <MapPin className="w-5 h-5" />
                  <span className="font-bold">{t('pickup')}</span>
                </button>
              </div>
            </div>

            {formData.deliveryMethod === 'homeDelivery' && (
              <div>
                <div className="flex justify-between items-end mb-1">
                  <label className="block text-sm font-bold text-gray-700">
                    {t('deliveryAddress')}
                  </label>
                  <button
                    type="button"
                    onClick={handleGetLocation}
                    disabled={isLocating}
                    className="text-xs font-bold text-primary-600 flex items-center gap-1 hover:underline disabled:opacity-50"
                  >
                    <MapPin className="w-3 h-3" />
                    {isLocating ? t('locating') : t('getCurrentLocation')}
                  </button>
                </div>
                <div className="relative">
                  <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                  <textarea
                    required
                    rows={3}
                    value={formData.address}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    className={`w-full bg-white border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
                    placeholder="Street, District, City"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                {t('additionalNotes')}
              </label>
              <div className="relative">
                <MessageSquare className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className={`w-full bg-white border border-gray-200 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
                  placeholder="Extra instructions..."
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting || cart.length === 0}
            className="btn btn-primary w-full py-4 text-lg font-bold flex items-center justify-center gap-3"
          >
            {isSubmitting ? t('processing') : t('whatsappOrder')}
          </button>
        </form>

        {/* Order Summary Recap */}
        <div className="bg-gray-100 p-6 rounded-3xl h-fit">
          <h2 className="text-xl font-bold mb-6">{t('orderDetails')}</h2>
          <div className="space-y-4 mb-6">
            {cart.map(item => (
              <div key={item.id} className="flex justify-between text-sm">
                <span>{language === 'en' ? item.name_en : item.name_ar} (x{item.quantity})</span>
                <span className="font-bold">{(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-4 flex justify-between font-extrabold text-xl">
            <span>{t('total')}</span>
            <span className="text-primary-600">{cartTotal.toFixed(2)} SAR</span>
          </div>
        </div>
      </div>
    </div>
  );
}
