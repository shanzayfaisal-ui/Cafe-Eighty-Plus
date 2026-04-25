import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Receipt, Truck, ArrowLeft, ChevronRight } from "lucide-react";
import { useCart } from "@/contexts/CartContext"; // UPDATED: Import useCart

type CartItem = {
  id: string;
  name: string;
  price: number;
  quantity: number;
};

const Billing = () => {
  const navigate = useNavigate();
  const [cart, setCart] = useState<CartItem[]>([]);
  
  // UPDATED: Destructure deliveryFee from useCart hook
  const { deliveryFee } = useCart();

  useEffect(() => {
    const storedCart = localStorage.getItem("cart");
    if (!storedCart) {
      navigate("/");
      return;
    }
    setCart(JSON.parse(storedCart));
  }, [navigate]);

  const total = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // UPDATED: Now uses deliveryFee from context
  const grandTotal = total + deliveryFee;

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-6 font-sans antialiased">
      <div className="max-w-md w-full bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/40 p-10 border border-stone-50">
        
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="flex items-center gap-2 text-[10px] font-bold text-stone-400 uppercase tracking-widest hover:text-[#5D3A26] transition-colors mb-6"
        >
          <ArrowLeft size={12} /> Edit Details
        </button>

        <header className="mb-8 text-center">
          <p className="text-[10px] font-bold text-stone-400 uppercase tracking-[0.3em] mb-2">Step 2 of 3</p>
          <h2 className="text-3xl font-serif font-bold text-[#2D1B14]">Order Summary</h2>
          <div className="h-0.5 w-12 bg-[#5D3A26] mx-auto mt-4"></div>
        </header>

        {/* 🛒 Items List */}
        <div className="space-y-4 mb-8 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
          {cart.map((item) => (
            <div key={item.id} className="flex justify-between items-center py-2 border-b border-stone-50 last:border-b-0">
              <div className="flex flex-col">
                <span className="text-sm font-bold text-[#2D1B14]">{item.name}</span>
                <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider">Qty: {item.quantity}</span>
              </div>
              <span className="text-sm font-bold text-stone-600">
                Rs. {(item.price * item.quantity).toLocaleString()}
              </span>
            </div>
          ))}
        </div>

        {/* 💰 Calculations */}
        <div className="bg-stone-50/50 rounded-3xl p-6 space-y-3">
          <div className="flex justify-between text-xs font-bold text-stone-400 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Receipt size={14} /> Subtotal</span>
            <span>Rs. {total.toLocaleString()}</span>
          </div>

          <div className="flex justify-between text-xs font-bold text-stone-400 uppercase tracking-widest">
            <span className="flex items-center gap-2"><Truck size={14} /> Delivery</span>
            {/* UPDATED: Displays dynamic deliveryFee */}
            <span>
              {deliveryFee > 0 ? `Rs. ${deliveryFee.toLocaleString()}` : 'Free'}
            </span>
          </div>

          <div className="pt-4 mt-2 border-t border-stone-200/50 flex justify-between items-end">
            <div className="flex flex-col">
              <span className="text-[10px] font-bold text-[#5D3A26] uppercase tracking-[0.2em]">Total Amount</span>
              <span className="text-2xl font-serif font-black text-[#2D1B14]">Rs. {grandTotal.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* ✅ Payment Button */}
        <button
          onClick={() => navigate("/payment")}
          className="w-full bg-[#2D1B14] text-[#EAD8C0] py-5 rounded-2xl font-bold uppercase tracking-[0.2em] text-xs shadow-lg shadow-stone-200/50 hover:bg-[#5D3A26] transition-all mt-8 flex items-center justify-center gap-2"
        >
          Select Payment Method <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
};

export default Billing;