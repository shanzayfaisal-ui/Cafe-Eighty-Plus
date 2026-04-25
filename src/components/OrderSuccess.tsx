import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Check, Home, AlertCircle, MapPin, ArrowLeft, XCircle, Loader2 } from "lucide-react";
import { useCart, CartItem } from "@/contexts/CartContext"; // Removed DELIVERY_FEE from named imports
import { useOrders } from "@/hooks/useOrders";
import { useOrderUpdates } from "@/hooks/useOrderNotifications";
import { Order, OrderEvent } from "@/types/order";
import OrderTracker from "./OrderTracker";
import { useToast } from "@/hooks/use-toast";

// Defined locally to prevent the "requested module does not provide an export" SyntaxError
const DELIVERY_FEE = 150; 

const OrderSuccess = () => {
  const navigate = useNavigate();
  const { clearCart } = useCart();
  const { fetchOrderById, updateOrderStatus } = useOrders();
  const { toast } = useToast();
  
  const [orderDetails, setOrderDetails] = useState<{ cart: CartItem[]; customer: any } | null>(null);
  const [order, setOrder] = useState<Order | null>(null);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const [hasShownCancelNotification, setHasShownCancelNotification] = useState(false);
  
  // States for UI flow
  const [showTracker, setShowTracker] = useState(false);
  const [isCancelling, setIsCancelling] = useState(false);

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    const storedCustomer = localStorage.getItem("customer");
    const orderId = localStorage.getItem("lastOrderId");
    const custId = localStorage.getItem("customerId");

    if (storedCart && storedCustomer) {
      setOrderDetails({ cart: JSON.parse(storedCart), customer: JSON.parse(storedCustomer) });
      setCustomerId(custId);
      
      if (orderId) {
        fetchOrderById(orderId).then(fetchedOrder => {
          if (fetchedOrder) {
            setOrder(fetchedOrder);
          }
        });
      }

      clearCart();
      localStorage.removeItem("cart");
    } else if (orderId && custId) {
      setCustomerId(custId);
      fetchOrderById(orderId).then(fetchedOrder => {
        if (fetchedOrder) {
          setOrder(fetchedOrder);
          setOrderDetails({ 
            cart: [], 
            customer: { 
              name: fetchedOrder.name, 
              phone: fetchedOrder.phone, 
              email: fetchedOrder.email, 
              address: fetchedOrder.address 
            }
          });
        }
      });
    } else {
      navigate("/");
    }
  }, [navigate, clearCart, fetchOrderById]);

  useOrderUpdates(customerId || "", (event: OrderEvent) => {
    try {
      setOrder(event.order);
      
      if (event.order.status === 'Cancelled' && !hasShownCancelNotification) {
        setHasShownCancelNotification(true);
        toast({
          title: "Order Cancelled",
          description: "This order has been cancelled.",
          variant: "destructive"
        });
      } else if (event.order.status === 'Confirmed') {
        toast({
          title: "Order Confirmed",
          description: "Your order is being prepared!",
        });
      } else if (event.order.status === 'Completed') {
        toast({
          title: "Ready for Delivery",
          description: "Your order is ready for delivery!",
        });
      }
    } catch (err) {
      console.error('Error updating order:', err);
    }
  });

  const handleCancelOrder = async () => {
    if (!order?.id) return;

    const confirmCancel = window.confirm("Are you sure you want to cancel this order? This action cannot be undone.");
    if (!confirmCancel) return;

    setIsCancelling(true);
    try {
      await updateOrderStatus(order.id, 'Cancelled');
      toast({
        title: "Success",
        description: "Your order has been cancelled successfully.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to cancel order. It may already be in preparation.",
        variant: "destructive",
      });
    } finally {
      setIsCancelling(false);
    }
  };

  if (!orderDetails || !order) {
    return (
      <div className="min-h-screen bg-[#F5F2ED] py-8 px-4 sm:px-6 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="h-12 w-12 text-[#5D3A26] animate-spin mx-auto mb-4" />
          <p className="text-stone-600 font-medium">Loading your order details...</p>
        </div>
      </div>
    );
  }

  const subtotal = orderDetails.cart.length > 0 
    ? orderDetails.cart.reduce((acc, item) => acc + (item.price * item.quantity), 0)
    : (order?.total || 0) - DELIVERY_FEE;

  const isOrderCancelled = order.status === 'Cancelled';

  return (
    <div className="min-h-screen bg-[#F5F2ED] py-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {showTracker ? (
          <div className="space-y-6 animate-in fade-in zoom-in duration-300">
            <OrderTracker order={order} />
            <button 
              onClick={() => setShowTracker(false)}
              className="w-full py-4 text-stone-500 font-bold flex items-center justify-center gap-2 hover:text-stone-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Summary
            </button>
          </div>
        ) : (
          <div className="max-w-md mx-auto w-full bg-white rounded-[3rem] shadow-xl p-10 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className={`${isOrderCancelled ? 'bg-rose-100' : 'bg-[#5D3A26]'} p-4 rounded-full w-fit mx-auto mb-8 transition-colors duration-500`}>
              {isOrderCancelled ? (
                <XCircle className="h-10 w-10 text-rose-600" />
              ) : (
                <Check className="h-10 w-10 text-white" />
              )}
            </div>

            <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">
              {isOrderCancelled ? "Order Cancelled" : "Order Confirmed!"}
            </h2>
            <p className="text-stone-500 text-sm mb-8">
              {isOrderCancelled 
                ? "This order will no longer be processed." 
                : "Thank you for your order. Your meal is being prepared with care."}
            </p>

            <div className="bg-[#F5F2ED] rounded-3xl p-6 mb-8 text-left">
              <div className="space-y-2 mb-4">
                {(orderDetails.cart.length > 0 ? orderDetails.cart : order.items || []).slice(0, 3).map((item: any, idx: number) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-stone-600">{item.quantity}x {item.name}</span>
                    <span className="font-medium text-stone-800">Rs. {(item.price * item.quantity).toLocaleString()}</span>
                  </div>
                ))}
                {(orderDetails.cart.length > 3) && <p className="text-[10px] text-stone-400">...and more items</p>}
              </div>
              <div className="border-t border-stone-200 pt-4">
                <div className="flex justify-between font-serif font-bold text-lg text-[#5D3A26]">
                  <span>Total {isOrderCancelled ? 'Refundable' : 'Paid'}</span>
                  <span>Rs. {(subtotal + DELIVERY_FEE).toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <button 
                onClick={() => !isOrderCancelled && setShowTracker(true)} 
                disabled={isOrderCancelled}
                className={`w-full py-5 rounded-2xl font-bold uppercase text-xs flex items-center justify-center gap-2 transition-all 
                  ${isOrderCancelled 
                    ? 'bg-stone-200 text-stone-400 cursor-not-allowed opacity-70' 
                    : 'bg-[#5D3A26] text-white hover:bg-[#4a2e1e] shadow-lg shadow-stone-100'
                  }`}
              >
                <MapPin className="h-4 w-4" /> 
                {isOrderCancelled ? "Tracking Unavailable" : "Track Your Order"}
              </button>

              <button 
                onClick={() => navigate("/")} 
                className="w-full bg-stone-100 text-stone-600 py-5 rounded-2xl font-bold uppercase text-xs hover:bg-stone-200 transition-colors flex items-center justify-center gap-2"
              >
                <Home className="h-4 w-4" /> Back to Home
              </button>

              {order.status === 'Pending' && !isOrderCancelled && (
                <button 
                  onClick={handleCancelOrder}
                  disabled={isCancelling}
                  className="w-full mt-4 py-2 text-rose-500 text-[10px] font-bold uppercase tracking-widest hover:text-rose-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCancelling ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <XCircle className="h-3 w-3" />
                  )}
                  {isCancelling ? "Processing Cancellation..." : "Cancel Order"}
                </button>
              )}
            </div>

            <div className="mt-8 pt-6 border-t border-stone-50">
              <p className="text-[10px] font-bold uppercase text-stone-400 mb-1">Order Reference</p>
              <p className="font-mono text-sm font-bold text-[#2D1B14]">
                {order?.id ? `#${order.id.slice(0, 8).toUpperCase()}` : '...'}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderSuccess;