import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { supabase } from "@/integrations/supabase/client";

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  quantity: number;
  category: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: Omit<CartItem, 'quantity'>) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalPrice: number;
  deliveryFee: number;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  refreshDeliveryFee: () => Promise<void>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  
  // Default to 0 to avoid computational layout "flicker" on initial paint
  const [deliveryFee, setDeliveryFee] = useState<number>(0); 

  const fetchDeliveryFee = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('app_settings' as any)
        .select('value')
        .eq('key', 'delivery_fee')
        .maybeSingle();

      if (error) {
        console.error("Supabase error:", error.message);
        return;
      }

      if (data && (data as any).value !== undefined) {
        // Safe robust float parsing from the newly converted text database column
        const parsedFee = parseFloat((data as any).value);
        setDeliveryFee(isNaN(parsedFee) ? 0 : parsedFee);
      }
    } catch (err) {
      console.error("Error fetching delivery fee:", err);
    }
  }, []);

  // 1. Initial Fetch on Mount
  useEffect(() => {
    fetchDeliveryFee();
  }, [fetchDeliveryFee]);

  // 2. REAL-TIME DATABASE SUBSCRIPTION: Listens for updates live
  useEffect(() => {
    const channel = supabase
      .channel('schema-db-changes')
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'app_settings',
          filter: `key=eq.delivery_fee`
        },
        (payload) => {
          if (payload.new && (payload.new as any).value !== undefined) {
            // Safe parsing to ensure real-time changes don't inject bad string data types
            const realTimeFee = Number((payload.new as any).value);
            setDeliveryFee(isNaN(realTimeFee) ? 0 : realTimeFee);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addItem = useCallback((item: Omit<CartItem, 'quantity'>) => {
    setItems(prev => {
      const existing = prev.find(i => i.id === item.id);
      if (existing) {
        return prev.map(i => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems(prev => prev.filter(i => i.id !== id));
  }, []);

  const updateQuantity = useCallback((id: string, quantity: number) => {
    if (quantity <= 0) {
      setItems(prev => prev.filter(i => i.id !== id));
    } else {
      setItems(prev => prev.map(i => i.id === id ? { ...i, quantity } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce((sum, i) => sum + i.price * i.quantity, 0);

  return (
    <CartContext.Provider 
      value={{ 
        items, 
        addItem, 
        removeItem, 
        updateQuantity, 
        clearCart, 
        totalItems, 
        totalPrice, 
        deliveryFee, 
        isCartOpen, 
        setIsCartOpen,
        refreshDeliveryFee: fetchDeliveryFee 
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};