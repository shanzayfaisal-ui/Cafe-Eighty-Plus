import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrders } from "@/hooks/useOrders";
import { useAuth } from "@/contexts/AuthContext";
import { CreditCard, Wallet, ChevronLeft, Loader2, Upload, CheckCircle2, AlertCircle, Smartphone } from "lucide-react";
import { useCart } from "@/contexts/CartContext";
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { OrderItem } from "@/types/order";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  const { items, totalPrice, clearCart, deliveryFee, refreshDeliveryFee } = useCart();
  const { createOrder } = useOrders();
  const { user } = useAuth();
  
  const [customer, setCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [loading, setLoading] = useState(false);
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // --- MANUAL PAYMENT CONFIGURATION ---
  // Update your account details here
  const paymentConfigs: Record<string, any> = {
    bank_transfer: {
      title: "Meezan Bank Details",
      account: "0123-456789-01",
      holder: "Eighty Plus Coffee",
      extra: "IBAN: PK00 MEZN 0000 0123 4567 8901"
    },
    jazzcash: {
      title: "JazzCash Details",
      account: "0300-1234567",
      holder: "Admin Name",
      extra: "Send amount to this mobile wallet"
    },
    easypaisa: {
      title: "EasyPaisa Details",
      account: "0345-1234567",
      holder: "Admin Name",
      extra: "Send amount to this mobile wallet"
    }
  };

  useEffect(() => {
    refreshDeliveryFee();
    const storedCustomer = localStorage.getItem("customer");
    if (items.length === 0 || !storedCustomer) {
      navigate("/");
      return;
    }
    setCustomer(JSON.parse(storedCustomer));
  }, [navigate, items, refreshDeliveryFee]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: "Invalid file type", description: "Please upload a PNG or JPG image.", variant: "destructive" });
      return;
    }
    setScreenshot(file);
  };

  const handleConfirm = async () => {
    // Validation: If not COD, a screenshot is mandatory
    if (paymentMethod !== "cash_on_delivery" && !screenshot) {
      toast({ title: "Proof Required", description: "Please upload the payment screenshot.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const finalTotal = totalPrice + deliveryFee;
    let receiptUrl: string | null = null;

    try {
      // Upload screenshot if provided (for Bank, JazzCash, or EasyPaisa)
      if (screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage.from('payment_receipts').upload(fileName, screenshot);
        
        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage.from('payment_receipts').getPublicUrl(fileName);
        receiptUrl = publicUrl;
      }

      const orderItems: OrderItem[] = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        image: item.image || undefined,
      }));

      const orderCustomerId = `cust_${Date.now()}`;
      const order = await createOrder(
        customer.name,
        customer.phone,
        orderItems,
        finalTotal,
        customer.address,
        paymentMethod,
        receiptUrl || undefined,
        orderCustomerId,
        customer.email || undefined,
        user?.id
      );

      if (!order || !order.id) {
        console.error('[Payment] Order creation failed or returned no id');
        return;
      }

      console.log('[Payment] Order created successfully:', order.id);
      clearCart();
      const redirectUrl = `/order-success?order_id=${order.id}`;
      console.log('[Payment] Redirecting to:', redirectUrl);
      navigate(redirectUrl);
    } catch (err: any) {
      toast({ title: "Order Failed", description: err.message || 'Unable to place order.', variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  // Check if current method requires a screenshot
  const needsScreenshot = paymentMethod !== "cash_on_delivery";

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 border border-white">
        <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase mb-6 hover:text-stone-600 transition-colors">
          <ChevronLeft size={16} /> Back
        </button>

        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">Payment</h2>
        <p className="text-stone-500 text-sm mb-8">Select your payment method</p>

        <div className="space-y-3 mb-8">
          {[
            { id: "cash_on_delivery", label: "Cash on Delivery", icon: Wallet },
            { id: "bank_transfer", label: "Bank Transfer", icon: CreditCard },
            { id: "jazzcash", label: "JazzCash", icon: Smartphone },
            { id: "easypaisa", label: "EasyPaisa", icon: Smartphone },
          ].map((method) => (
            <label 
              key={method.id} 
              className={`flex items-center gap-4 p-4 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === method.id ? "border-[#5D3A26] bg-stone-50" : "border-stone-100 hover:border-stone-200"
              }`}
            >
              <input 
                type="radio" 
                className="hidden" 
                checked={paymentMethod === method.id} 
                onChange={() => {
                  setPaymentMethod(method.id);
                  setScreenshot(null); // Reset screenshot when switching
                }} 
              />
              <div className="flex-1 font-bold text-stone-700 text-sm">{method.label}</div>
              <method.icon className={paymentMethod === method.id ? "text-[#5D3A26]" : "text-stone-300"} size={20} />
            </label>
          ))}
        </div>

        {/* Manual Details Display (Show for Bank, JC, or EP) */}
        {needsScreenshot && (
          <div className="mb-8 p-6 bg-stone-50 rounded-3xl border border-stone-200 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-[#2D1B14] mb-3 text-xs uppercase tracking-wider">
              {paymentConfigs[paymentMethod].title}
            </h3>
            
            <div className="space-y-1 text-[11px] text-stone-600 mb-6 font-medium">
              <p><span className="text-stone-400 font-bold">NUMBER/ACC:</span> {paymentConfigs[paymentMethod].account}</p>
              <p><span className="text-stone-400 font-bold">TITLE:</span> {paymentConfigs[paymentMethod].holder}</p>
              <p className="text-[#5D3A26] mt-2 italic">{paymentConfigs[paymentMethod].extra}</p>
            </div>

            <div className="relative group">
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleFileChange} 
                className="cursor-pointer py-10 h-auto border-dashed border-2 bg-white hover:border-[#5D3A26]/50 transition-colors" 
              />
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-stone-400">
                {screenshot ? (
                  <div className="flex flex-col items-center">
                    <CheckCircle2 className="text-green-500 mb-1" size={24} />
                    <span className="text-stone-800 text-[10px] font-bold max-w-[150px] truncate">{screenshot.name}</span>
                  </div>
                ) : (
                  <div className="flex flex-col items-center">
                    <Upload size={20} className="mb-1" />
                    <span className="text-[10px] uppercase font-bold">Upload Screenshot</span>
                  </div>
                )}
              </div>
            </div>
            <p className="text-[9px] text-center text-stone-400 mt-3 font-medium">
              Transfer amount & upload receipt to complete order.
            </p>
          </div>
        )}

        <div className="mb-8 p-5 bg-stone-50 rounded-2xl flex justify-between items-center border border-stone-100">
          <span className="text-stone-500 text-sm">Total Amount</span>
          <span className="font-bold text-[#5D3A26] text-xl">Rs. {(totalPrice + deliveryFee).toLocaleString()}</span>
        </div>

        <button 
          onClick={handleConfirm} 
          disabled={loading || (needsScreenshot && !screenshot)} 
          className="w-full bg-[#5D3A26] text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg disabled:opacity-40 hover:bg-[#4A2E1E] transition-all flex items-center justify-center"
        >
          {loading ? <Loader2 className="animate-spin mr-2" size={18} /> : "Complete Order"}
        </button>

        {needsScreenshot && !screenshot && !loading && (
          <p className="mt-4 text-center text-[10px] text-rose-500 font-bold uppercase flex items-center justify-center gap-1">
            <AlertCircle size={12} /> Payment screenshot is required
          </p>
        )}
      </div>
    </div>
  );
};

export default Payment;