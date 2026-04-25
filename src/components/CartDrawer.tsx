import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2, ShoppingCart } from 'lucide-react';
import { useCart } from '@/contexts/CartContext'; 
import { useNavigate } from 'react-router-dom';

const CartDrawer = () => {
  const navigate = useNavigate();
  const {
    items,
    isCartOpen,
    setIsCartOpen,
    updateQuantity,
    removeItem,
    totalPrice,
    totalItems,
    deliveryFee // UPDATED: Pulling dynamic fee from Context
  } = useCart();

  const handleCheckout = () => {
    if (items.length === 0) return;
    localStorage.setItem("cart", JSON.stringify(items));
    setIsCartOpen(false);
    navigate("/checkout");
  };

  // UPDATED: Now uses the dynamic deliveryFee from context
  const grandTotal = totalPrice + (items.length > 0 ? deliveryFee : 0);

  return (
    <Sheet open={isCartOpen} onOpenChange={setIsCartOpen}>
      <SheetContent className="bg-white w-full sm:max-w-md flex flex-col p-0 border-l border-stone-100">
        <div className="p-6 border-b border-stone-50">
          <SheetHeader>
            <SheetTitle className="font-serif text-2xl text-[#2D1B14] flex items-center gap-2">
              <ShoppingCart size={24} className="text-[#5D3A26]" />
              Your Order ({totalItems})
            </SheetTitle>
          </SheetHeader>
        </div>

        {items.length === 0 ? (
          <div className="flex flex-col items-center justify-center flex-1 text-stone-400 p-10 text-center">
            <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center mb-4">
              <ShoppingCart size={32} />
            </div>
            <p className="text-stone-500 font-medium">Your cart is empty</p>
            <p className="text-xs mt-1">Add some delicious coffee to get started!</p>
            <Button 
              variant="link" 
              onClick={() => setIsCartOpen(false)}
              className="mt-4 text-[#5D3A26] font-bold"
            >
              Continue Shopping
            </Button>
          </div>
        ) : (
          <div className="flex flex-col flex-1 overflow-hidden">
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between pb-4 border-b border-stone-50 last:border-b-0 group">
                  <div className="flex items-center gap-4">
                    <div className="relative w-16 h-16 flex-shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full rounded-xl object-cover border border-stone-100 shadow-sm" 
                      />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#2D1B14] mb-2 group-hover:text-[#5D3A26] transition-colors">
                        {item.name}
                      </h4>
                      <div className="flex items-center gap-1 bg-stone-50 w-fit rounded-lg p-1 border border-stone-100">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 hover:bg-white hover:shadow-sm" 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        >
                          <Minus size={10} />
                        </Button>
                        <span className="text-xs font-bold w-6 text-center">{item.quantity}</span>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-6 w-6 hover:bg-white hover:shadow-sm" 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        >
                          <Plus size={10} />
                        </Button>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    <span className="text-sm font-black text-[#5D3A26]">
                      Rs. {(item.price * item.quantity).toLocaleString()}
                    </span>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => removeItem(item.id)} 
                      className="text-stone-300 hover:text-rose-500 h-8 w-8 transition-colors"
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              ))}
            </div>

            <div className="p-6 bg-stone-50/50 border-t border-stone-100 mt-auto">
              <div className="space-y-2 mb-6">
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Subtotal</span>
                  <span className="font-medium text-stone-700">Rs. {totalPrice.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-stone-500">
                  <span>Delivery Fee</span>
                  {/* UPDATED: Now shows the dynamic fee or "Free" if 0 */}
                  <span className="font-medium text-stone-700">
                    {deliveryFee > 0 ? `Rs. ${deliveryFee.toLocaleString()}` : 'Free'}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-serif font-black pt-4 border-t border-stone-200 mt-2 text-[#2D1B14]">
                  <span>Grand Total</span>
                  <span>Rs. {grandTotal.toLocaleString()}</span>
                </div>
              </div>

              <Button 
                onClick={handleCheckout} 
                className="w-full bg-[#5D3A26] text-white py-7 text-sm font-black uppercase tracking-widest rounded-2xl hover:bg-[#2D1B14] shadow-lg shadow-stone-200 transition-all active:scale-[0.98]"
              >
                Proceed to Checkout
              </Button>
            </div>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
};

export default CartDrawer;