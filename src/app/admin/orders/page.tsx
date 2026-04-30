"use client";

import { useState, useEffect } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, updateDoc, doc, query, orderBy } from 'firebase/firestore';
import { ShoppingBag, Clock, CheckCircle, XCircle, Phone, MapPin, ChevronDown, User, Printer } from 'lucide-react';
import toast from 'react-hot-toast';

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [filter, setFilter] = useState('all');
  const [activeOrderId, setActiveOrderId] = useState<string | null>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeOrderId && !(event.target as Element).closest('.status-dropdown')) {
        setActiveOrderId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [activeOrderId]);

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

  const printBill = (order: any) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const date = order.createdAt?.seconds 
      ? new Date(order.createdAt.seconds * 1000).toLocaleString()
      : new Date().toLocaleString();

    const itemsHtml = order.items.map((item: any) => `
      <tr>
        <td style="padding: 10px; border-bottom: 1px solid #eee;">
          <div style="font-weight: bold;">${item.name_en}</div>
          <div style="font-size: 0.85em; color: #666;">${item.name_ar}</div>
        </td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">${item.quantity}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${item.price.toFixed(2)}</td>
        <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: right;">${(item.price * item.quantity).toFixed(2)}</td>
      </tr>
    `).join('');

    const html = `
      <html>
        <head>
          <title>Bill - ${order.id.slice(0, 8)}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 40px; color: #1a1a1a; line-height: 1.6; }
            .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #f0f0f0; padding-bottom: 20px; }
            .store-name { font-size: 24px; font-weight: bold; color: #000; margin: 0; }
            .bill-title { font-size: 14px; text-transform: uppercase; letter-spacing: 2px; color: #666; margin-top: 5px; }
            .info-grid { display: grid; grid-template-cols: 1fr 1fr; gap: 40px; margin-bottom: 40px; }
            .info-section h3 { font-size: 12px; text-transform: uppercase; color: #999; margin-bottom: 10px; }
            .info-content { font-size: 14px; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
            th { text-align: left; font-size: 12px; text-transform: uppercase; color: #999; padding: 10px; border-bottom: 2px solid #f0f0f0; }
            .total-section { text-align: right; border-top: 2px solid #000; padding-top: 20px; }
            .total-row { display: flex; justify-content: flex-end; gap: 20px; align-items: baseline; }
            .total-label { font-size: 14px; font-weight: bold; color: #666; }
            .total-amount { font-size: 24px; font-weight: bold; color: #000; }
            .footer { margin-top: 50px; text-align: center; font-size: 12px; color: #999; }
            @media print { body { padding: 0; } .no-print { display: none; } }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          <div class="header">
            <h1 class="store-name">SUPER MARKET SANABEL OULA</h1>
            <div class="bill-title">Official Order Bill</div>
          </div>

          <div class="info-grid">
            <div class="info-section">
              <h3>Order Information</h3>
              <div class="info-content">
                <strong>Order ID:</strong> #${order.id}<br>
                <strong>Date:</strong> ${date}<br>
                <strong>Status:</strong> ${order.status.toUpperCase()}
              </div>
            </div>
            <div class="info-section">
              <h3>Customer Details</h3>
              <div class="info-content">
                <strong>Name:</strong> ${order.customer?.name}<br>
                <strong>Phone:</strong> ${order.customer?.phone}<br>
                <strong>Address:</strong> ${order.customer?.address}
              </div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Item Description</th>
                <th style="text-align: center;">Qty</th>
                <th style="text-align: right;">Unit Price</th>
                <th style="text-align: right;">Total</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <div class="total-section">
            <div class="total-row">
              <span class="total-label">Grand Total</span>
              <span class="total-amount">${order.total?.toFixed(2)} SAR</span>
            </div>
          </div>

          <div class="footer">
            Thank you for shopping with us!<br>
            Super market Sanabel oula - Quality & Freshness
          </div>
        </body>
      </html>
    `;

    printWindow.document.write(html);
    printWindow.document.close();
  };

  const filteredOrders = filter === 'all' ? orders : orders.filter(o => o.status === filter);

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manage Orders</h1>
        <select 
          value={filter} 
          onChange={(e) => setFilter(e.target.value)}
          className="bg-white border-none rounded-xl px-4 py-2 shadow-sm font-bold text-gray-600 focus:ring-2 focus:ring-primary-500"
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
          <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-6 flex flex-wrap items-center justify-between gap-4 bg-gray-50/50">
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
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => printBill(order)}
                    className="p-2 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded-xl transition-all mr-2"
                    title="Print Bill"
                  >
                    <Printer className="w-5 h-5" />
                  </button>
                  <div className="relative status-dropdown">
                    <button 
                      onClick={() => setActiveOrderId(activeOrderId === order.id ? null : order.id)}
                      className={`px-4 py-2 rounded-xl font-bold text-sm flex items-center gap-2 transition-all active:scale-95 ${
                      order.status === 'pending' ? 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200' :
                      order.status === 'delivered' ? 'bg-green-100 text-green-700 hover:bg-green-200' :
                      'bg-blue-100 text-blue-700 hover:bg-blue-200'
                    }`}>
                      {order.status.toUpperCase()}
                      <ChevronDown className={`w-4 h-4 transition-transform ${activeOrderId === order.id ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeOrderId === order.id && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in duration-200">
                        {['pending', 'processing', 'delivered', 'cancelled'].map(s => (
                          <button 
                            key={s} 
                            onClick={() => {
                              updateStatus(order.id, s);
                              setActiveOrderId(null);
                            }}
                            className={`w-full text-left px-4 py-3 text-sm font-bold hover:bg-gray-50 first:rounded-t-xl last:rounded-b-xl capitalize transition-colors ${order.status === s ? 'text-primary-600 bg-primary-50/50' : 'text-gray-700'}`}
                          >
                            Mark as {s}
                          </button>
                        ))}
                      </div>
                    )}
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
