import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderStatus, OrderItem } from '@/types/order';
import { useToast } from './use-toast';

export const useOrders = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  /**
   * Create a new order
   */
  const createOrder = useCallback(async (
    name: string,
    phone: string,
    items: OrderItem[],
    total: number,
    address?: string,
    paymentMethod?: string,
    paymentReceiptUrl?: string,
    customerId?: string,
    email?: string,
    userId?: string
  ): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!name || !phone) {
        throw new Error('Customer name and phone are required');
      }

      if (!items || items.length === 0) {
        throw new Error('Order must contain at least one item');
      }

      if (total <= 0) {
        throw new Error('Invalid order total');
      }

      // Build order data - only include fields that exist in database
      const orderData: any = {
        name: name.trim(),
        phone: phone.trim(),
        items: items,
        total: total,
        status: 'Pending',
      };

      // Add optional fields only if they have values
      if (address) orderData.address = address.trim();
      if (paymentMethod) orderData.payment_method = paymentMethod;
      if (paymentReceiptUrl) orderData.payment_receipt_url = paymentReceiptUrl;
      if (customerId) orderData.customer_id = customerId;
      if (userId) orderData.user_id = userId;
      if (email) orderData.email = email.trim();
      orderData.created_at = new Date().toISOString();

      console.log('Order being inserted:', orderData);
      
      const { data, error: insertError } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (insertError) {
        console.error('Order insert failed:', insertError);
        toast({
          title: 'Order failed',
          description: insertError.message || 'Unable to place order.',
          variant: 'destructive',
        });

        if (insertError.code === 'PGRST301') {
          throw new Error('Permission denied. Please try again.');
        }
        if (insertError.message.includes('customer_id') || insertError.message.includes('items_summary')) {
          console.warn('Schema column not found, retrying with minimal fields');
          const retryData: any = {
            name: orderData.name,
            phone: orderData.phone,
            items: orderData.items,
            total: orderData.total,
            status: orderData.status,
            created_at: orderData.created_at,
          };
          if (orderData.address) retryData.address = orderData.address;
          if (orderData.payment_method) retryData.payment_method = orderData.payment_method;
          if (orderData.payment_receipt_url) retryData.payment_receipt_url = orderData.payment_receipt_url;

          const { data: retryData2, error: retryError } = await supabase
            .from('orders')
            .insert([retryData])
            .select()
            .single();

          if (retryError) throw retryError;
          if (!retryData2) throw new Error('No data returned from server');
          console.log('Inserted order response:', retryData2);
          return retryData2 as Order;
        }
        throw new Error(insertError.message || 'Failed to insert order');
      }

      if (!data) {
        throw new Error('No data returned from server');
      }

      console.log('Inserted order response:', data);

      // Decrease stock for each item in the order
      if (Array.isArray(items) && items.length > 0) {
        try {
          for (const item of items) {
            // Get current stock
            const { data: currentItem, error: fetchErr } = await supabase
              .from('menu_items')
              .select('stock')
              .eq('id', item.id)
              .single();

            if (fetchErr) {
              console.warn(`Could not fetch stock for item ${item.id}:`, fetchErr);
              continue;
            }

            const currentStock = currentItem?.stock || 0;
            const newStock = Math.max(0, currentStock - (item.quantity || 1));

            // Update stock
            const { error: updateErr } = await supabase
              .from('menu_items')
              .update({ stock: newStock })
              .eq('id', item.id);

            if (updateErr) {
              console.warn(`Could not update stock for item ${item.id}:`, updateErr);
            } else {
              console.log(`Stock updated for ${item.name}: ${currentStock} → ${newStock}`);
            }
          }
        } catch (err) {
          console.error('Error updating stock:', err);
          // Don't throw - order created successfully, stock update is secondary
        }
      }

      return data as Order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create order';
      console.error('Create order error:', message, err);
      toast({
        title: 'Order failed',
        description: message,
        variant: 'destructive',
      });
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch all orders (admin)
   */
  const fetchOrders = useCallback(async (): Promise<Order[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return (data as Order[]) || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch orders';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Fetch single order by ID
   */
  const fetchOrderById = useCallback(async (orderId: string): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single();

      if (fetchError) throw fetchError;

      return data as Order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch order';
      setError(message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  /**
   * Update order status
   */
  const updateOrderStatus = useCallback(async (
    orderId: string,
    newStatus: OrderStatus
  ): Promise<Order | null> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: updateError } = await supabase
        .from('orders')
        .update({
          status: newStatus,
          updated_at: new Date().toISOString(),
        })
        .eq('id', orderId)
        .select()
        .single();

      if (updateError) throw updateError;

      toast({
        title: 'Success',
        description: `Order status updated to ${newStatus}`,
      });

      return data as Order;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update order status';
      setError(message);
      toast({
        title: 'Error',
        description: message,
        variant: 'destructive',
      });
      return null;
    } finally {
      setLoading(false);
    }
  }, [toast]);

  /**
   * Fetch orders for a specific customer
   */
  const fetchCustomerOrders = useCallback(async (customerId: string): Promise<Order[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return (data as Order[]) || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch customer orders';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUserOrders = useCallback(async (userId: string): Promise<Order[]> => {
    setLoading(true);
    setError(null);

    try {
      const { data, error: fetchError } = await supabase
        .from('orders')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return (data as Order[]) || [];
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch user orders';
      setError(message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    createOrder,
    fetchOrders,
    fetchOrderById,
    updateOrderStatus,
    fetchCustomerOrders,
    fetchUserOrders,
  };
};
