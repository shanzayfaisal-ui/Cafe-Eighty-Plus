import React, { useEffect, useState } from 'react';
import { Order, OrderStatus } from '@/types/order';
import { Package, CheckCircle2, AlertCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OrderTrackerProps {
  order: Order;
}

const statuses: OrderStatus[] = ['Pending', 'Confirmed', 'Completed'];
const statusMessages: Record<OrderStatus, string> = {
  'Pending': 'Your order is being prepared',
  'Confirmed': 'Order confirmed by our team',
  'Completed': 'Ready for delivery',
  'Cancelled': 'Order has been cancelled',
};

const getStatusIcon = (status: OrderStatus, isActive: boolean, isCompleted: boolean) => {
  if (status === 'Cancelled') {
    return <AlertCircle className={cn('w-6 h-6', isActive ? 'text-rose-600' : 'text-rose-300')} />;
  }
  if (isCompleted) {
    return <CheckCircle2 className="w-6 h-6 text-emerald-600" />;
  }
  if (isActive) {
    return <Clock className="w-6 h-6 text-blue-600 animate-spin" />;
  }
  return <Package className="w-6 h-6 text-stone-300" />;
};

const OrderTracker: React.FC<OrderTrackerProps> = ({ order }) => {
  const [displayStatus, setDisplayStatus] = useState<OrderStatus>(order.status);

  useEffect(() => {
    setDisplayStatus(order.status);
  }, [order.status]);

  const currentStatusIndex = statuses.indexOf(displayStatus as OrderStatus);
  const isCompleted = displayStatus === 'Completed';
  const isCancelled = displayStatus === 'Cancelled';

  return (
    <div className="bg-white rounded-[2rem] border border-stone-100 p-8">
      <h3 className="text-xl font-serif font-bold text-[#2D1B14] mb-8">Order Status</h3>

      {isCancelled ? (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-6 text-center">
          <AlertCircle className="w-12 h-12 text-rose-600 mx-auto mb-3" />
          <p className="text-rose-900 font-bold">Order Cancelled</p>
          <p className="text-sm text-rose-700 mt-2">
            We're sorry, but your order has been cancelled.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="flex justify-between items-center mb-8">
            {statuses.map((status, index) => {
              const isActive = index === currentStatusIndex;
              const isCompleted = index < currentStatusIndex;

              return (
                <div key={status} className="flex flex-col items-center flex-1">
                  {/* Icon */}
                  <div className={cn(
                    'mb-3 p-3 rounded-full border-2 transition-all',
                    isCompleted ? 'bg-emerald-50 border-emerald-600' :
                    isActive ? 'bg-blue-50 border-blue-600 shadow-lg shadow-blue-200' :
                    'bg-stone-50 border-stone-200'
                  )}>
                    {getStatusIcon(status, isActive, isCompleted)}
                  </div>

                  {/* Label */}
                  <span className={cn(
                    'text-xs font-bold uppercase tracking-widest text-center',
                    isActive ? 'text-blue-600' :
                    isCompleted ? 'text-emerald-600' :
                    'text-stone-400'
                  )}>
                    {status}
                  </span>

                  {/* Connector Line */}
                  {index < statuses.length - 1 && (
                    <div className={cn(
                      'absolute w-[calc(100%-4rem)] h-1 mt-8 rounded-full -z-10',
                      isCompleted ? 'bg-emerald-600' : 'bg-stone-200'
                    )} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Current Status Message */}
          <div className="bg-stone-50 rounded-xl p-6 border border-stone-100">
            <p className="text-sm font-medium text-[#2D1B14]">
              {statusMessages[displayStatus] || 'Order status unknown'}
            </p>
            <p className="text-xs text-stone-500 mt-3">
              Last updated: {order.updated_at || order.created_at ? new Date(order.updated_at || order.created_at).toLocaleString() : 'Just now'}
            </p>
          </div>

          {/* Order Details Summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <p className="text-xs font-bold uppercase text-stone-400 mb-1">Order ID</p>
              <p className="font-mono text-sm font-bold text-[#2D1B14]">
                {order.id ? `#${order.id.slice(0, 8).toUpperCase()}` : '#N/A'}
              </p>
            </div>
            <div className="bg-stone-50 rounded-xl p-4 border border-stone-100">
              <p className="text-xs font-bold uppercase text-stone-400 mb-1">Total Amount</p>
              <p className="font-bold text-sm text-[#2D1B14]">Rs. {order.total ? order.total.toLocaleString() : '0'}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OrderTracker;
