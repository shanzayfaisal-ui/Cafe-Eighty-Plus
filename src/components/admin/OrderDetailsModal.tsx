import { X, Phone, MapPin, Package, Image as ImageIcon, ExternalLink } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Order, OrderStatus } from "@/types/order";

interface OrderDetailsModalProps {
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdate: (id: string, status: OrderStatus) => void;
}

const OrderDetailsModal = ({ order, isOpen, onClose, onUpdate }: OrderDetailsModalProps) => {
  if (!isOpen || !order) return null;

  // FIXED: Handles both Full URLs and relative paths
  const getScreenshotUrl = (path: string | null | undefined) => {
    if (!path) return null;
    
    // If it's already a full web link, return it directly
    if (path.startsWith('http')) {
      return path;
    }
    
    // Otherwise, generate it from the bucket
    const { data } = supabase.storage.from('payment_receipts').getPublicUrl(path);
    return data.publicUrl;
  };

  const screenshotPath = order.payment_receipt_url;
  const screenshotUrl = getScreenshotUrl(screenshotPath);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl overflow-hidden border border-stone-100 animate-in zoom-in-95 duration-200 text-[#2D1B14]">
        <header className="p-8 border-b border-stone-50 flex justify-between items-center">
          <div>
            <h3 className="text-2xl font-serif font-bold">
              Order #{order.id.slice(0, 8).toUpperCase()}
            </h3>
            <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mt-1">
              Full Order Details
            </p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-stone-50 rounded-full text-stone-400 transition-colors"
          >
            <X size={20} />
          </button>
        </header>

        <div className="p-8 space-y-6 max-h-[70vh] overflow-y-auto">
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
              <ImageIcon size={14} /> Payment Verification
            </div>
            
            {screenshotPath ? (
              <div className="group relative rounded-3xl overflow-hidden border border-stone-200 bg-stone-100 aspect-video flex items-center justify-center">
                <img 
                  src={screenshotUrl || ""} 
                  alt="Payment Proof" 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <button 
                  onClick={() => screenshotUrl && window.open(screenshotUrl, '_blank')}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center transition-opacity gap-2 text-white font-bold text-xs uppercase tracking-widest"
                >
                  <ExternalLink size={20} />
                  <span>View Full Image</span>
                </button>
              </div>
            ) : (
              <div className="py-8 px-4 rounded-3xl border border-dashed border-stone-200 flex flex-col items-center justify-center bg-stone-50 text-stone-400">
                <ImageIcon size={24} className="mb-2 opacity-20" />
                <p className="text-xs italic font-medium">No payment proof uploaded</p>
              </div>
            )}
          </div>

          <div className="h-px bg-stone-100 w-full" />

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-stone-400">
              Customer Information
            </div>
            <div className="grid gap-3">
              <div className="flex items-center gap-3 text-sm font-bold text-[#5D3A26]">
                <Phone size={14} className="shrink-0" /> 
                {order.phone}
              </div>
              <div className="flex items-start gap-3 text-sm text-stone-600">
                <MapPin size={14} className="mt-1 shrink-0" /> 
                <span className="leading-snug">{order.address || "No address provided"}</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-50 rounded-3xl p-6 border border-stone-100">
             <div className="flex items-center gap-2 mb-4 text-[10px] font-black uppercase tracking-widest text-stone-400">
               <Package size={14}/> Items Ordered
             </div>
             <div className="text-sm font-medium leading-relaxed whitespace-pre-wrap">
               {order.items_summary || "No items summary available"}
             </div>
             <div className="mt-4 pt-4 border-t border-stone-200 flex justify-between items-center">
                <span className="text-[10px] font-black uppercase text-stone-400 tracking-widest">Total Amount</span>
                <span className="text-lg font-bold text-[#5D3A26]">Rs. {order.total.toLocaleString()}</span>
             </div>
          </div>
        </div>

        <div className="p-8 bg-stone-50/50 border-t border-stone-100 flex gap-3">
          {order.status === 'Pending' ? (
            <>
              <button 
                onClick={() => onUpdate(order.id, 'Confirmed')}
                className="flex-1 bg-emerald-600 text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-700 transition-all shadow-lg shadow-emerald-100"
              >
                Confirm Order
              </button>
              <button 
                onClick={() => onUpdate(order.id, 'Cancelled')}
                className="flex-1 bg-rose-50 text-rose-600 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-100 transition-all"
              >
                Cancel Order
              </button>
            </>
          ) : (
            <button 
              onClick={onClose} 
              className="w-full bg-[#2D1B14] text-white py-4 rounded-2xl font-bold text-xs uppercase tracking-widest"
            >
              Close Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default OrderDetailsModal;