import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, MapPin, User, MessageSquare } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useLanguage } from '../../context/LanguageContext';
import { db } from '../../services/firebase';
import { collection, doc, writeBatch, serverTimestamp } from 'firebase/firestore';
import toast from 'react-hot-toast';

const Checkout = () => {
  const { cart, cartTotal, clearCart } = useCart();
  const { t, isRTL, language } = useLanguage();
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: '',
    notes: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;

    setIsSubmitting(true);
    try {
      const batch = writeBatch(db);
      
      // 1. Prepare Order Document
      const orderRef = doc(collection(db, 'orders'));
      const orderData = {
        customer: formData,
        items: cart,
        total: cartTotal,
        status: 'pending',
        createdAt: serverTimestamp(),
        language
      };
      batch.set(orderRef, orderData);

      // 2. Reduce Stock for each item
      cart.forEach((item) => {
        const productRef = doc(db, 'products', item.id);
        // Note: Using atomic increment with negative value to decrement
        batch.update(productRef, {
          stock: (item.stock || 0) - item.quantity // Fallback if stock is not provided
        });

        // 3. Create stock movement log
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
      
      // 4. Format WhatsApp Message
      const whatsappNumber = '966500000000'; // Replace with actual shop number
      const itemsText = cart.map(item => 
        `- ${language === 'en' ? item.name_en : item.name_ar} (x${item.quantity}): ${(item.price * item.quantity).toFixed(2)}`
      ).join('\n');

      const message = encodeURIComponent(
        `*New Order #${orderId}*\n\n` +
        `*Customer:* ${formData.name}\n` +
        `*Phone:* ${formData.phone}\n` +
        `*Address:* ${formData.address}\n\n` +
        `*Items:*\n${itemsText}\n\n` +
        `*Total:* ${cartTotal.toFixed(2)} SAR\n\n` +
        `*Notes:* ${formData.notes || 'None'}`
      );

      // 5. Clear Cart & Navigate
      clearCart();
      toast.success('Order placed successfully!');
      
      // Open WhatsApp
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
      
      navigate('/order-success', { state: { orderId: orderId } });
    } catch (error) {
      console.error('Checkout error:', error);
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">{t('checkout')}</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? 'الاسم الكامل' : 'Full Name'}
              </label>
              <div className="relative">
                <User className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                <input
                  required
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
                  placeholder="John Doe"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? 'رقم الجوال' : 'Phone Number'}
              </label>
              <div className="relative">
                <Phone className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                <input
                  required
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
                  placeholder="05xxxxxxx"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? 'عنوان التوصيل' : 'Delivery Address'}
              </label>
              <div className="relative">
                <MapPin className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                <textarea
                  required
                  rows={3}
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
                  placeholder="Street, District, City"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 dark:text-gray-300 mb-1">
                {isRTL ? 'ملاحظات إضافية' : 'Additional Notes'}
              </label>
              <div className="relative">
                <MessageSquare className={`absolute ${isRTL ? 'right-3' : 'left-3'} top-3 w-5 h-5 text-gray-400`} />
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className={`w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl py-3 ${isRTL ? 'pr-10' : 'pl-10'} focus:ring-2 focus:ring-primary-500`}
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
            {isSubmitting ? 'Processing...' : t('whatsappOrder')}
          </button>
        </form>

        {/* Order Summary Recap */}
        <div className="bg-gray-100 dark:bg-gray-800/50 p-6 rounded-3xl h-fit">
          <h2 className="text-xl font-bold mb-6">Order Details</h2>
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
};

export default Checkout;
