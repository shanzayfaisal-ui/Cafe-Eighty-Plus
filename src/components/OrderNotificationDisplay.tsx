import React, { useEffect } from 'react';
import { useNotification } from '@/contexts/NotificationContext';
import { AlertCircle, CheckCircle, AlertTriangle, Info, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const OrderNotificationDisplay = () => {
  const { notifications, removeNotification, markAsRead } = useNotification();

  const getIcon = (type: string) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-5 h-5" />;
      case 'error':
        return <AlertCircle className="w-5 h-5" />;
      case 'warning':
        return <AlertTriangle className="w-5 h-5" />;
      case 'info':
      default:
        return <Info className="w-5 h-5" />;
    }
  };

  const getStyles = (type: string) => {
    switch (type) {
      case 'success':
        return 'bg-emerald-50 border-emerald-200 text-emerald-900';
      case 'error':
        return 'bg-rose-50 border-rose-200 text-rose-900';
      case 'warning':
        return 'bg-amber-50 border-amber-200 text-amber-900';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200 text-blue-900';
    }
  };

  const getIconColorClass = (type: string) => {
    switch (type) {
      case 'success':
        return 'text-emerald-600';
      case 'error':
        return 'text-rose-600';
      case 'warning':
        return 'text-amber-600';
      case 'info':
      default:
        return 'text-blue-600';
    }
  };

  return (
    <div className="fixed top-20 right-4 z-[200] space-y-3 pointer-events-none">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={cn(
            'pointer-events-auto p-4 rounded-lg border shadow-lg',
            'animate-in slide-in-from-top-4 duration-300',
            'max-w-sm',
            getStyles(notification.type)
          )}
          onClick={() => markAsRead(notification.id)}
        >
          <div className="flex items-start gap-3">
            <div className={getIconColorClass(notification.type)}>
              {getIcon(notification.type)}
            </div>
            <div className="flex-1">
              <p className="font-semibold text-sm">{notification.message}</p>
              <p className="text-xs opacity-75 mt-1">
                Order #{notification.orderId.slice(0, 8)}
              </p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                removeNotification(notification.id);
              }}
              className="ml-2 opacity-50 hover:opacity-100 transition-opacity"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
};

export default OrderNotificationDisplay;

/**
 * Badge component to show notification count for Admin panel
 */
export const NotificationBadge = () => {
  const { unreadCount } = useNotification();

  if (unreadCount === 0) return null;

  return (
    <span className="absolute -top-2 -right-2 bg-rose-600 text-white text-[10px] font-bold rounded-full w-5 h-5 flex items-center justify-center">
      {unreadCount > 9 ? '9+' : unreadCount}
    </span>
  );
};
