import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useOrders } from "@/hooks/useOrders";
import { CreditCard, Wallet, ChevronLeft, Loader2, Upload, CheckCircle2, AlertCircle } from "lucide-react";
import { useCart } from "@/contexts/CartContext"; // Removed DELIVERY_FEE import
import { useToast } from "@/hooks/use-toast";
import { Input } from "@/components/ui/input";
import { OrderItem } from "@/types/order";

const Payment = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  
  // Get dynamic deliveryFee and refresh function from context
  const { items, totalPrice, clearCart, deliveryFee, refreshDeliveryFee } = useCart();
  
  const { createOrder, loading: orderLoading, error: orderError } = useOrders();
  const [customer, setCustomer] = useState<any>(null);
  const [paymentMethod, setPaymentMethod] = useState("cash_on_delivery");
  const [loading, setLoading] = useState(false);
  
  // Bank Transfer States
  const [screenshot, setScreenshot] = useState<File | null>(null);

  // Bank Information
  const bankDetails = {
    bankName: "Meezan Bank",
    accountTitle: "Eighty Plus Coffee",
    accountNumber: "0123-456789-01",
    iban: "PK00 MEZN 0000 0123 4567 8901"
  };

  useEffect(() => {
    // Refresh fee when entering the page to ensure accuracy
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
      toast({
        title: "Invalid file type",
        description: "Please upload a valid image (JPEG or PNG).",
        variant: "destructive"
      });
      e.target.value = ""; 
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum file size is 5MB.",
        variant: "destructive"
      });
      e.target.value = "";
      return;
    }

    setScreenshot(file);
    toast({
      title: "Screenshot Validated",
      description: "Payment proof attached successfully."
    });
  };

  const handleConfirm = async () => {
    if (paymentMethod === "bank_transfer" && !screenshot) {
      toast({
        title: "Proof Required",
        description: "Please upload your bank transfer screenshot to proceed.",
        variant: "destructive"
      });
      return;
    }

    if (!customer) {
      toast({ title: "Error", description: "Customer information missing.", variant: "destructive" });
      return;
    }

    setLoading(true);
    // Use dynamic deliveryFee from hook
    const finalTotal = totalPrice + deliveryFee;
    let receiptUrl: string | null = null;

    try {
      if (paymentMethod === "bank_transfer" && screenshot) {
        const fileExt = screenshot.name.split('.').pop();
        const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
        const filePath = `${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('payment_receipts')
          .upload(filePath, screenshot);

        if (uploadError) throw new Error('Failed to upload receipt: ' + uploadError.message);

        const { data: { publicUrl } } = supabase.storage
          .from('payment_receipts')
          .getPublicUrl(filePath);
        
        receiptUrl = publicUrl;
      }

      const customerId = `cust_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      const orderItems: OrderItem[] = items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        category: item.category,
        image: item.image || undefined,
      }));

      const order = await createOrder(
        customer.name,
        customer.phone,
        orderItems,
        finalTotal,
        customer.address,
        paymentMethod,
        receiptUrl || undefined,
        customerId,
        customer.email || undefined
      );

      if (order) {
        localStorage.setItem("lastOrderId", order.id);
        localStorage.setItem("customerId", order.customer_id || customerId);
        clearCart();
        toast({ title: "Order Placed!", description: "Your coffee is on the way!" });
        navigate("/order-success");
      }

    } catch (err: any) {
      toast({
        title: "Order Failed",
        description: err.message || "An unexpected error occurred.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F2ED] flex items-center justify-center p-4 sm:p-6">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-xl p-8 sm:p-10 border border-white">
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-stone-400 text-xs font-bold uppercase mb-6 hover:text-stone-600 transition-colors"
        >
          <ChevronLeft size={16} /> Back
        </button>

        <h2 className="text-3xl font-serif font-bold text-stone-800 mb-2">Payment</h2>
        <p className="text-stone-500 text-sm mb-8">Select your payment method below</p>

        <div className="space-y-3 mb-8">
          {["cash_on_delivery", "bank_transfer"].map((method) => (
            <label 
              key={method} 
              className={`flex items-center gap-4 p-5 rounded-2xl border-2 cursor-pointer transition-all ${
                paymentMethod === method ? "border-[#5D3A26] bg-stone-50 shadow-sm" : "border-stone-100 hover:border-stone-200"
              }`}
            >
              <input 
                type="radio" 
                className="hidden" 
                checked={paymentMethod === method} 
                onChange={() => {
                  setPaymentMethod(method);
                  if (method === 'cash_on_delivery') setScreenshot(null);
                }} 
              />
              <div className="flex-1 font-bold text-stone-700 capitalize">
                {method.replace(/_/g, ' ')}
              </div>
              {method === "bank_transfer" ? (
                <CreditCard className={paymentMethod === method ? "text-[#5D3A26]" : "text-stone-300"} />
              ) : (
                <Wallet className={paymentMethod === method ? "text-[#5D3A26]" : "text-stone-300"} />
              )}
            </label>
          ))}
        </div>

        {paymentMethod === "bank_transfer" && (
          <div className="mb-8 p-6 bg-stone-50 rounded-3xl border border-stone-200 animate-in fade-in slide-in-from-top-4">
            <h3 className="font-bold text-[#2D1B14] mb-3 text-xs uppercase tracking-wider">Meezan Bank Details</h3>
            <div className="space-y-1 text-[11px] text-stone-600 mb-6 leading-relaxed font-medium">
              <p><span className="text-stone-400">BANK:</span> {bankDetails.bankName}</p>
              <p><span className="text-stone-400">TITLE:</span> {bankDetails.accountTitle}</p>
              <p><span className="text-stone-400">A/C:</span> {bankDetails.accountNumber}</p>
              <p><span className="text-stone-400">IBAN:</span> {bankDetails.iban}</p>
            </div>

            <div className="relative">
              <div className="relative group">
                <Input
                  type="file"
                  accept=".jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  className="cursor-pointer py-10 h-auto border-dashed border-2 border-stone-200 bg-white hover:border-[#5D3A26]/50 transition-colors"
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-stone-400">
                  {screenshot ? (
                    <>
                      <CheckCircle2 className="text-green-500 mb-1" size={24} />
                      <span className="text-stone-800 text-[10px] font-bold truncate px-4">{screenshot.name}</span>
                    </>
                  ) : (
                    <>
                      <Upload size={20} className="mb-1 group-hover:text-[#5D3A26]" />
                      <span className="text-[10px] uppercase font-bold">Upload Payment Receipt</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 p-5 bg-stone-50 rounded-2xl border border-stone-100 flex justify-between items-center">
          <span className="text-stone-500 text-sm font-medium">Total Amount Due</span>
          <span className="font-bold text-[#5D3A26] text-xl">
            Rs. {(totalPrice + deliveryFee).toLocaleString()}
          </span>
        </div>

        <button 
          onClick={handleConfirm} 
          disabled={loading || (paymentMethod === "bank_transfer" && !screenshot)} 
          className="w-full bg-[#5D3A26] text-white py-5 rounded-2xl font-bold uppercase text-xs tracking-widest shadow-lg shadow-[#5D3A26]/20 disabled:opacity-40 hover:bg-[#4A2E1E] transition-all flex items-center justify-center"
        >
          {loading ? (
            <>
              <Loader2 className="animate-spin mr-2" size={18} />
              Placing Order...
            </>
          ) : (
            "Complete Order"
          )}
        </button>

        {paymentMethod === "bank_transfer" && !screenshot && (
          <p className="mt-4 text-center text-[10px] text-rose-500 font-bold uppercase flex items-center justify-center gap-1">
            <AlertCircle size={12} /> Receipt required for bank transfers
          </p>
        )}
      </div>
    </div>
  );
};

export default Payment;