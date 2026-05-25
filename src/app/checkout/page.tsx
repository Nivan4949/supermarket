"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MapPin, User, MessageSquare, Truck, Search, ChevronDown } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useLanguage } from '@/context/LanguageContext';
import { countries } from '@/constants/countries';
import { useEffect, useRef } from 'react';
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
    address: '',
    notes: '',
    deliveryMethod: 'homeDelivery'
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Load saved customer data on mount
  useEffect(() => {
    const savedData = localStorage.getItem('customerData');
    if (savedData) {
      try {
        const parsed = JSON.parse(savedData);
        setFormData(prev => ({
          ...prev,
          name: parsed.name || '',
          phone: parsed.phone || '',
          countryCode: parsed.countryCode || '+966',
          address: parsed.address || ''
        }));
      } catch (e) {
        console.error('Error parsing saved customer data', e);
      }
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCountries = countries.filter(c => 
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    c.dial_code.includes(searchQuery)
  );

  const selectedCountry = countries.find(c => c.dial_code === formData.countryCode) || countries[0];

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
      const orderRef = doc(collection(db, 'orders'));
      const orderId = orderRef.id;
      
      const whatsappNumber = '966506725651';
      const fullPhone = `${formData.countryCode}${formData.phone}`;
      const dateStr = new Date().toLocaleDateString('en-GB');
      
      const itemsText = cart.map(item => 
        `${item.quantity} x ${item.name_en} – ${item.name_ar}`
      ).join('\n');

      const message = encodeURIComponent(
        `Order from https://supermarket-sand.vercel.app\n\n` +
        `Order Number: ${orderId.slice(0, 8)}\n` +
        `Date: ${dateStr}\n` +
        `Name: ${formData.name}\n` +
        `Phone: ${fullPhone}\n\n` +
        `Products:\n${itemsText}\n\n` +
        `Shipping: ${formData.deliveryMethod === 'homeDelivery' ? 'Home Delivery' : 'Pick up'}\n` +
        (formData.deliveryMethod === 'homeDelivery' ? `Address: ${formData.address}\n` : '') +
        `Total: ${cartTotal.toFixed(2)} SAR\n\n` +
        `Track your order https://supermarket-sand.vercel.app/track?orderId=${orderId}`
      );

      // 1. SAVE ORDER TO FIRESTORE FIRST
      const batch = writeBatch(db);
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
      await batch.commit();

      // 2. TRIGGER EMAIL & STOCK API
      try {
        await fetch('/api/order', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ orderId })
        }).then(async res => {
          if (!res.ok) {
            const data = await res.json();
            console.error('Email API Error:', data.error);
          } else {
            console.log('Email API Success');
          }
        });
      } catch (err) {
        console.error('API Network Error:', err);
      }

      // 3. TRIGGER WHATSAPP REDIRECT
      const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${message}`;
      window.location.href = whatsappUrl;
      
      // Save customer data for next time
      localStorage.setItem('customerData', JSON.stringify({
        name: formData.name,
        phone: formData.phone,
        countryCode: formData.countryCode,
        address: formData.address
      }));

      clearCart();
      toast.success('Order placed successfully!');
      
      // Delay the success page redirect to allow the user to see the toast if they come back
      setTimeout(() => {
        router.push(`/order-success?orderId=${orderId}`);
      }, 2000);
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
                <div className="relative w-1/3 country-selector" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="w-full bg-white border border-gray-200 rounded-xl py-3 px-3 focus:ring-2 focus:ring-primary-500 flex items-center justify-between font-bold"
                  >
                    <span className="flex items-center gap-2">
                      <span>{selectedCountry.flag}</span>
                      <span>{selectedCountry.dial_code}</span>
                    </span>
                    <ChevronDown className={`w-4 h-4 transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>

                  {isDropdownOpen && (
                    <div className={`absolute z-50 mt-2 w-64 bg-white border border-gray-200 rounded-xl shadow-xl overflow-hidden ${isRTL ? 'right-0' : 'left-0'}`}>
                      <div className="p-2 border-b border-gray-100">
                        <div className="relative">
                          <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                          <input
                            type="text"
                            placeholder="Search country..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-gray-50 border-none rounded-lg text-sm focus:ring-2 focus:ring-primary-500"
                            autoFocus
                          />
                        </div>
                      </div>
                      <div className="max-h-60 overflow-y-auto">
                        {filteredCountries.map((country) => (
                          <button
                            key={`${country.code}-${country.dial_code}`}
                            type="button"
                            onClick={() => {
                              setFormData({...formData, countryCode: country.dial_code});
                              setIsDropdownOpen(false);
                              setSearchQuery('');
                            }}
                            className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center justify-between text-sm"
                          >
                            <span className="flex items-center gap-3">
                              <span>{country.flag}</span>
                              <span className="truncate max-w-[120px]">{country.name}</span>
                            </span>
                            <span className="text-gray-500 font-medium">{country.dial_code}</span>
                          </button>
                        ))}
                        {filteredCountries.length === 0 && (
                          <div className="px-4 py-3 text-sm text-gray-500 text-center">
                            No results found
                          </div>
                        )}
                      </div>
                    </div>
                  )}
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
            className="w-full py-4 text-lg font-bold flex items-center justify-center gap-3 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
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
