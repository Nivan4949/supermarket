import { useState } from 'react';
import { db } from '../../services/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Search, Package, Clock, Truck, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const OrderTracking = () => {
  const [orderId, setOrderId] = useState('');
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderId) return;

    setLoading(true);
    try {
      const docRef = doc(db, 'orders', orderId);
      const docSnap = await getDoc(docRef);
      
      if (docSnap.exists()) {
        setOrder({ id: docSnap.id, ...docSnap.data() });
      } else {
        toast.error('Order not found. Please check the ID.');
        setOrder(null);
      }
    } catch (error) {
      toast.error('Error tracking order');
    } finally {
      setLoading(false);
    }
  };

  const statusSteps = ['pending', 'processing', 'shipped', 'delivered'];
  const currentStepIndex = statusSteps.indexOf(order?.status || 'pending');

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      <div className="text-center space-y-4">
        <h1 className="text-3xl font-bold">Track Your Order</h1>
        <p className="text-gray-500">Enter your order ID to see the current status</p>
      </div>

      <form onSubmit={handleTrack} className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-3.5 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Order ID (e.g. xY789...)"
            value={orderId}
            onChange={(e) => setOrderId(e.target.value)}
            className="w-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl py-3.5 pl-12 pr-4 focus:ring-2 focus:ring-primary-500 shadow-sm"
          />
        </div>
        <button 
          type="submit" 
          disabled={loading}
          className="btn btn-primary px-8 rounded-2xl font-bold"
        >
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {order && (
        <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 space-y-12">
          {/* Header Info */}
          <div className="flex justify-between items-start border-b border-gray-100 dark:border-gray-700 pb-6">
            <div>
              <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-1">Order Status</div>
              <h2 className="text-2xl font-bold text-primary-600 uppercase">{order.status}</h2>
            </div>
            <div className="text-right">
              <div className="text-sm text-gray-400 uppercase font-bold tracking-wider mb-1">Estimated Delivery</div>
              <div className="font-bold">2-3 Business Days</div>
            </div>
          </div>

          {/* Progress Tracker */}
          <div className="relative">
            <div className="absolute top-5 left-0 w-full h-1 bg-gray-100 dark:bg-gray-700 -z-10"></div>
            <div 
              className="absolute top-5 left-0 h-1 bg-primary-600 transition-all duration-1000 -z-10" 
              style={{ width: `${(currentStepIndex / (statusSteps.length - 1)) * 100}%` }}
            ></div>
            
            <div className="flex justify-between">
              {statusSteps.map((step, index) => (
                <div key={step} className="flex flex-col items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center border-4 ${
                    index <= currentStepIndex 
                      ? 'bg-primary-600 border-primary-100 text-white' 
                      : 'bg-white border-gray-100 text-gray-300'
                  }`}>
                    {index < currentStepIndex ? <CheckCircle className="w-5 h-5" /> : index === currentStepIndex ? <Clock className="w-5 h-5" /> : index + 1}
                  </div>
                  <span className={`text-xs font-bold uppercase ${index <= currentStepIndex ? 'text-primary-600' : 'text-gray-400'}`}>
                    {step}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Order Summary */}
          <div className="space-y-4">
            <h3 className="font-bold">Items in this order</h3>
            <div className="space-y-3">
              {order.items?.map((item: any) => (
                <div key={item.id} className="flex justify-between text-sm py-2 border-b border-gray-50 last:border-0">
                  <span className="text-gray-600">{item.name_en} x {item.quantity}</span>
                  <span className="font-bold">{(item.price * item.quantity).toFixed(2)} SAR</span>
                </div>
              ))}
            </div>
            <div className="flex justify-between pt-4 text-lg font-extrabold">
              <span>Total Amount</span>
              <span className="text-primary-600">{order.total?.toFixed(2)} SAR</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracking;
