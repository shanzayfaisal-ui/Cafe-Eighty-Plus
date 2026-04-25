import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { OrderNotification, OrderEventType } from '@/types/order';

interface NotificationContextType {
  notifications: OrderNotification[];
  addNotification: (notification: Omit<OrderNotification, 'id' | 'createdAt'>, persistent?: boolean) => void;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  clearAll: () => void;
  unreadCount: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<OrderNotification[]>([]);

  // Load persistent notifications from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('persistent_notifications');
      if (stored) {
        const parsed = JSON.parse(stored);
        setNotifications(parsed);
        // Clear persistent notifications after loading them
        localStorage.removeItem('persistent_notifications');
      }
    } catch (err) {
      console.error('Failed to load persistent notifications:', err);
    }
  }, []);

  const addNotification = useCallback((
    notification: Omit<OrderNotification, 'id' | 'createdAt'>,
    persistent: boolean = false
  ) => {
    const newNotification: OrderNotification = {
      ...notification,
      id: `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date(),
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Save important notifications to localStorage for persistence
    if (persistent && (notification.type === 'error' || notification.type === 'warning')) {
      try {
        const current = notifications;
        localStorage.setItem('persistent_notifications', JSON.stringify([newNotification, ...current]));
      } catch (err) {
        console.error('Failed to save persistent notification:', err);
      }
    }

    // Auto-remove notification after 5 seconds (unless it's persistent and error/warning)
    if (!persistent) {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 5000);
    }
  }, [notifications]);

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <NotificationContext.Provider value={{
      notifications,
      addNotification,
      removeNotification,
      markAsRead,
      clearAll,
      unreadCount,
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

/**
 * Hook to add order notifications with standard formatting
 */
export const useOrderNotificationHandler = () => {
  const { addNotification } = useNotification();

  const notifyNewOrder = useCallback((orderId: string, customerName: string) => {
    addNotification({
      orderId,
      message: `New order from ${customerName}`,
      type: 'info',
      order: {} as any, // This will be overridden
    });
  }, [addNotification]);

  const notifyOrderConfirmed = useCallback((orderId: string) => {
    addNotification({
      orderId,
      message: 'Your order has been confirmed!',
      type: 'success',
      order: {} as any,
    });
  }, [addNotification]);

  const notifyOrderCancelled = useCallback((orderId: string) => {
    addNotification({
      orderId,
      message: 'Your order has been cancelled.',
      type: 'warning',
      order: {} as any,
    });
  }, [addNotification]);

  const notifyOrderCompleted = useCallback((orderId: string) => {
    addNotification({
      orderId,
      message: 'Your order is ready!',
      type: 'success',
      order: {} as any,
    });
  }, [addNotification]);

  return {
    notifyNewOrder,
    notifyOrderConfirmed,
    notifyOrderCancelled,
    notifyOrderCompleted,
    addNotification,
  };
};
