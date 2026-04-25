import { useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderEvent, OrderEventType } from '@/types/order';
import { RealtimeChannel } from '@supabase/supabase-js';

type OrderEventCallback = (event: OrderEvent) => void;

export const useOrderNotifications = () => {
  const channelRef = useRef<RealtimeChannel | null>(null);
  const callbacksRef = useRef<Map<OrderEventType | 'all', OrderEventCallback[]>>(
    new Map()
  );

  /**
   * Subscribe to a specific order event type
   */
  const subscribe = useCallback((
    eventType: OrderEventType | 'all',
    callback: OrderEventCallback
  ) => {
    if (!callbacksRef.current.has(eventType)) {
      callbacksRef.current.set(eventType, []);
    }
    callbacksRef.current.get(eventType)?.push(callback);

    // Return unsubscribe function
    return () => {
      const callbacks = callbacksRef.current.get(eventType);
      if (callbacks) {
        const index = callbacks.indexOf(callback);
        if (index > -1) {
          callbacks.splice(index, 1);
        }
      }
    };
  }, []);

  /**
   * Initialize real-time listener
   */
  const initializeListener = useCallback(() => {
    if (channelRef.current) {
      return; // Already initialized
    }

    // Subscribe to orders table changes
    channelRef.current = supabase
      .channel('public.orders')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as Order;
          const event: OrderEvent = {
            type: 'newOrder',
            order,
            timestamp: new Date(),
          };

          // Trigger callbacks
          callbacksRef.current.get('newOrder')?.forEach(cb => cb(event));
          callbacksRef.current.get('all')?.forEach(cb => cb(event));
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'orders',
        },
        (payload) => {
          const order = payload.new as Order;
          const previousOrder = payload.old as Order;

          // Determine the specific event type based on status change
          let eventType: OrderEventType = 'orderUpdated';

          if (previousOrder.status !== order.status) {
            if (order.status === 'Confirmed') {
              eventType = 'orderConfirmed';
            } else if (order.status === 'Cancelled') {
              eventType = 'orderCancelled';
            } else if (order.status === 'Completed') {
              eventType = 'orderCompleted';
            }
          }

          const event: OrderEvent = {
            type: eventType,
            order,
            timestamp: new Date(),
          };

          // Trigger callbacks
          callbacksRef.current.get(eventType)?.forEach(cb => cb(event));
          callbacksRef.current.get('orderUpdated')?.forEach(cb => cb(event));
          callbacksRef.current.get('all')?.forEach(cb => cb(event));
        }
      )
      .subscribe();
  }, []);

  /**
   * Cleanup listener
   */
  const cleanup = useCallback(() => {
    if (channelRef.current) {
      supabase.removeChannel(channelRef.current);
      channelRef.current = null;
    }
    callbacksRef.current.clear();
  }, []);

  return {
    subscribe,
    initializeListener,
    cleanup,
  };
};

/**
 * Hook to listen for new orders (Admin use)
 */
export const useNewOrders = (callback: OrderEventCallback) => {
  const { subscribe, initializeListener, cleanup } = useOrderNotifications();

  useEffect(() => {
    initializeListener();
    const unsubscribe = subscribe('newOrder', callback);

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [callback, subscribe, initializeListener, cleanup]);
};

/**
 * Hook to listen for order status updates for a specific customer
 */
export const useOrderUpdates = (customerId: string, callback: OrderEventCallback) => {
  const { subscribe, initializeListener, cleanup } = useOrderNotifications();

  useEffect(() => {
    initializeListener();
    
    // Wrap callback to filter by customer - handle both customer_id and order tracking by ID
    const filteredCallback = (event: OrderEvent) => {
      // Allow updates if customer_id matches OR if customerId is not empty (for order tracking)
      if (customerId && (event.order.customer_id === customerId || event.order.customer_id === null)) {
        callback(event);
      }
    };

    const unsubscribe = subscribe('orderUpdated', filteredCallback);

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [customerId, callback, subscribe, initializeListener, cleanup]);
};

/**
 * Hook to listen for all order events
 */
export const useAllOrderEvents = (callback: OrderEventCallback) => {
  const { subscribe, initializeListener, cleanup } = useOrderNotifications();

  useEffect(() => {
    initializeListener();
    const unsubscribe = subscribe('all', callback);

    return () => {
      unsubscribe();
      cleanup();
    };
  }, [callback, subscribe, initializeListener, cleanup]);
};
