import { useState, useEffect } from 'react';
import { db } from '../../services/firebase';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { Eye, CheckCircle, Clock, Truck, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';

const AdminOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  useEffect(() => {
    const q = query(collection(db, 'orders'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snapshot) => {
      setOrders(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsub();
  }, []);

  const updateStatus = async (orderId: string, status: string) => {
    try {
      await updateDoc(doc(db, 'orders', orderId), { status });
      toast.success(`Order status updated to ${status}`);
    } catch (error) {
      toast.error('Update failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'processing': return 'bg-blue-100 text-blue-700';
      case 'delivered': return 'bg-green-100 text-green-700';
      case 'cancelled': return 'bg-red-100 text-red-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">Orders Management</h1>

      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-700/50">
              <th className="p-4">Order ID</th>
              <th className="p-4">Customer</th>
              <th className="p-4">Total</th>
              <th className="p-4">Status</th>
              <th className="p-4">Date</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 border-b border-gray-100 dark:border-gray-700">
                <td className="p-4 font-mono text-sm">#{order.id.slice(0, 8)}</td>
                <td className="p-4">
                  <div className="font-bold">{order.customer?.name}</div>
                  <div className="text-xs text-gray-500">{order.customer?.phone}</div>
                </td>
                <td className="p-4 font-bold">{order.total?.toFixed(2)} SAR</td>
                <td className="p-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-bold uppercase ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="p-4 text-sm text-gray-500">
                  {order.createdAt?.toDate().toLocaleDateString()}
                </td>
                <td className="p-4">
                  <div className="flex gap-2">
                    <button 
                      onClick={() => setSelectedOrder(order)}
                      className="p-2 text-primary-600 hover:bg-primary-50 rounded"
                    >
                      <Eye className="w-4 h-4" />
                    </button>
                    <select 
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      className="text-xs bg-gray-50 border-none rounded p-1"
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Order Details Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-2xl p-8 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold">Order Details #{selectedOrder.id.slice(0, 8)}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600"><XCircle /></button>
            </div>

            <div className="grid grid-cols-2 gap-8 mb-8">
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Customer Info</h3>
                <div className="space-y-1">
                  <p className="font-bold">{selectedOrder.customer?.name}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer?.phone}</p>
                  <p className="text-sm text-gray-600">{selectedOrder.customer?.address}</p>
                </div>
              </div>
              <div>
                <h3 className="text-xs font-bold text-gray-400 uppercase mb-2">Order Info</h3>
                <div className="space-y-1">
                  <p className="text-sm">Date: {selectedOrder.createdAt?.toDate().toLocaleString()}</p>
                  <p className="text-sm uppercase">Status: <span className="font-bold text-primary-600">{selectedOrder.status}</span></p>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 pt-6">
              <h3 className="font-bold mb-4">Items</h3>
              <div className="space-y-4">
                {selectedOrder.items?.map((item: any) => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 dark:bg-gray-700/50 p-3 rounded-xl">
                    <div className="flex items-center gap-3">
                      <img src={item.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                      <div>
                        <div className="font-bold text-sm">{item.name_en}</div>
                        <div className="text-xs text-gray-500">Qty: {item.quantity} x {item.price}</div>
                      </div>
                    </div>
                    <div className="font-bold">{(item.price * item.quantity).toFixed(2)} SAR</div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
              <div className="text-gray-500">Grand Total</div>
              <div className="text-3xl font-extrabold text-primary-600">{selectedOrder.total?.toFixed(2)} SAR</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
