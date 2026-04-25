import { useEffect, useState, useCallback } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { useOrders } from "@/hooks/useOrders";
import { useNewOrders } from "@/hooks/useOrderNotifications";
import { useNotification } from "@/contexts/NotificationContext";
import { Order, OrderEvent } from "@/types/order";
import { supabase } from "@/integrations/supabase/client";
import { 
  Eye, CheckCircle, XCircle, X, MapPin, Package, 
  Phone, CheckCircle2, Bell, Clock, Calendar,
  Image as ImageIcon, ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminOrdersPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const { fetchOrders, updateOrderStatus } = useOrders();
  const { addNotification } = useNotification();

  const formatOrderTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatOrderDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isRecentOrder = (dateString: string) => {
    const diff = Date.now() - new Date(dateString).getTime();
    return diff < 30 * 60 * 1000; 
  };

  // FIXED: Handles both Full URLs and relative paths
  const getScreenshotUrl = (path: string | null | undefined) => {
    if (!path) return null;
    if (path.startsWith('http')) return path;
    
    const { data } = supabase.storage.from('payment_receipts').getPublicUrl(path);
    return data.publicUrl;
  };

  const loadOrders = useCallback(async () => {
    setLoading(true);
    const data = await fetchOrders();
    setOrders(data);
    setLoading(false);
  }, [fetchOrders]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  useNewOrders((event: OrderEvent) => {
    setOrders(prev => [event.order, ...prev]);
    addNotification({
      orderId: event.order.id,
      message: `New order from ${event.order.name}`,
      type: 'info',
      order: event.order,
    });
  });

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    const updated = await updateOrderStatus(id, newStatus as any);
    if (updated) {
      if (selectedOrder?.id === id) setSelectedOrder(updated);
      setOrders(prev => prev.map(o => o.id === id ? updated : o));
      
      addNotification({
        orderId: id,
        message: `Order ${newStatus.toLowerCase()}`,
        type: newStatus === 'Cancelled' ? 'warning' : 'success',
        order: updated,
      });
    }
  };

  return (
    <AdminLayout title="Orders" description="Manage and track customer orders in real-time">
      <div className="bg-white rounded-[2rem] shadow-sm border border-stone-100 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-stone-500">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="p-8 text-center">
            <Bell size={32} className="mx-auto text-stone-300 mb-4" />
            <p className="text-stone-500">No orders yet.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-stone-50 border-b border-stone-100">
                <tr className="text-[10px] font-black uppercase tracking-widest text-stone-400">
                  <th className="px-8 py-5">Order ID & Time</th>
                  <th className="px-8 py-5">Customer</th>
                  <th className="px-8 py-5">Items</th>
                  <th className="px-8 py-5">Status</th>
                  <th className="px-8 py-5">Total</th>
                  <th className="px-8 py-5">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {orders.map((order) => (
                  <tr key={order.id} className={cn(
                    "hover:bg-stone-50/50 transition-colors",
                    isRecentOrder(order.created_at) && order.status === 'Pending' && "bg-amber-50/30"
                  )}>
                    <td className="px-8 py-5">
                      <div className="flex flex-col">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-[#2D1B14]">#{order.id.slice(0, 8).toUpperCase()}</span>
                          {isRecentOrder(order.created_at) && order.status === 'Pending' && (
                            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                          )}
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-stone-400 mt-1 font-bold">
                          <Clock size={10} /> {formatOrderTime(order.created_at)}
                        </div>
                      </div>
                    </td>
                    <td className="px-8 py-5">
                      <div className="text-sm font-bold text-[#2D1B14]">{order.name}</div>
                      <div className="text-[10px] text-stone-400">{order.phone}</div>
                    </td>
                    <td className="px-8 py-5 text-xs text-stone-600 font-medium">
                      {Array.isArray(order.items) ? order.items.length : 0} items
                    </td>
                    <td className="px-8 py-5">
                      <span className={cn(
                        "px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest",
                        order.status === 'Pending' ? "bg-amber-100 text-amber-700" :
                        order.status === 'Confirmed' ? "bg-emerald-100 text-emerald-700" : 
                        order.status === 'Completed' ? "bg-purple-100 text-purple-700" :
                        "bg-rose-100 text-rose-700"
                      )}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 font-bold text-[#2D1B14]">Rs. {order.total.toLocaleString()}</td>
                    <td className="px-8 py-5">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="p-2 bg-stone-100 text-stone-500 hover:bg-[#2D1B14] hover:text-white rounded-xl transition-all"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-10 relative animate-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto text-[#2D1B14]">
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute top-8 right-8 p-2 hover:bg-stone-100 rounded-full text-stone-400 z-10"
            >
              <X size={20}/>
            </button>
            
            <div className="mb-8">
              <h3 className="text-2xl font-serif font-bold">Order Details</h3>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex items-center gap-1.5 text-xs font-bold text-[#5D3A26] bg-[#F5F1EE] px-3 py-1 rounded-lg">
                  <Clock size={14} /> {formatOrderTime(selectedOrder.created_at)}
                </div>
                <div className="flex items-center gap-1.5 text-xs font-bold text-stone-400">
                  <Calendar size={14} /> {formatOrderDate(selectedOrder.created_at)}
                </div>
              </div>
            </div>
            
            <div className="space-y-6 mb-10">
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
                    <ImageIcon size={14} /> Payment Verification
                  </div>
                  {selectedOrder.payment_receipt_url ? (
                    <div className="group relative rounded-3xl overflow-hidden border border-stone-200 bg-stone-100 aspect-video flex items-center justify-center">
                      <img 
                        src={getScreenshotUrl(selectedOrder.payment_receipt_url) || ''} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        alt="Proof"
                      />
                      <button 
                        onClick={() => window.open(getScreenshotUrl(selectedOrder.payment_receipt_url!) || '', '_blank')}
                        className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity gap-2 text-white font-bold text-xs uppercase tracking-widest"
                      >
                        <ExternalLink size={16} /> View Proof
                      </button>
                    </div>
                  ) : (
                    <div className="py-6 px-4 rounded-3xl border border-dashed border-stone-200 flex flex-col items-center justify-center bg-stone-50 text-stone-400">
                      <p className="text-[10px] font-bold uppercase">No proof uploaded</p>
                    </div>
                  )}
                </div>

                <div className="h-px bg-stone-100 w-full" />

                <div className="flex items-center gap-4 text-stone-600">
                  <Phone size={18} className="text-[#5D3A26]" /> 
                  <span className="text-sm font-bold">{selectedOrder.phone}</span>
                </div>
                {selectedOrder.address && (
                  <div className="flex items-start gap-4 text-stone-600">
                    <MapPin size={18} className="text-[#5D3A26] mt-1" /> 
                    <span className="text-sm font-medium leading-relaxed">{selectedOrder.address}</span>
                  </div>
                )}

                <div className="bg-[#FDFCFB] p-6 rounded-3xl border border-stone-100">
                  <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-stone-400 tracking-widest">
                    <Package size={14} /> Items Summary
                  </div>
                  <div className="text-sm font-medium text-[#2D1B14] leading-relaxed">
                    {Array.isArray(selectedOrder.items) ? (
                      <ul className="space-y-1">
                        {selectedOrder.items.map((item: any, idx: number) => (
                          <li key={idx}>• {item.name} (x{item.quantity}) - Rs. {(item.price * item.quantity).toLocaleString()}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{selectedOrder.items_summary || "No items listed"}</p>
                    )}
                  </div>
                </div>

                <div className="bg-stone-50 p-4 rounded-2xl border border-stone-100">
                  <p className="text-[10px] font-black uppercase text-stone-400 mb-2">Order Total</p>
                  <p className="text-xl font-bold text-[#2D1B14]">Rs. {selectedOrder.total.toLocaleString()}</p>
                </div>
            </div>

            <div className="flex flex-col gap-3">
              {selectedOrder.status === 'Pending' && (
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'Confirmed')} 
                    className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all flex items-center justify-center gap-2"
                  >
                    <CheckCircle size={16} /> Confirm
                  </button>
                  <button 
                    onClick={() => handleStatusUpdate(selectedOrder.id, 'Cancelled')} 
                    className="flex-1 bg-rose-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-700 transition-all flex items-center justify-center gap-2"
                  >
                    <XCircle size={16} /> Cancel
                  </button>
                </div>
              )}

              {selectedOrder.status === 'Confirmed' && (
                <button 
                  onClick={() => handleStatusUpdate(selectedOrder.id, 'Completed')} 
                  className="w-full bg-purple-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-purple-700 transition-all flex items-center justify-center gap-2"
                >
                  <CheckCircle2 size={16} /> Mark as Completed
                </button>
              )}

              {(selectedOrder.status === 'Completed' || selectedOrder.status === 'Cancelled') && (
                <button 
                  onClick={() => setSelectedOrder(null)} 
                  className="w-full bg-[#2D1B14] text-[#EAD8C0] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest"
                >
                  Close View
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminOrdersPage;