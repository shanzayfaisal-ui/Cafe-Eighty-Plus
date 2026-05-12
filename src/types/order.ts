export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
  image?: string;
}

export interface Order {
  id: string;
  name: string;
  phone: string;
  email?: string | null;
  address?: string | null;
  items: OrderItem[] | any;
  items_summary?: string;
  total: number;
  status: OrderStatus;
  payment_method?: string | null;
  // This matches your database/storage logic
  payment_receipt_url?: string | null; 
  payment_screenshot?: string | null; 
  customer_id?: string | null;
  user_id?: string | null;
  created_at: string;
  updated_at?: string | null;
}

export interface OrderNotification {
  id: string;
  orderId: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  order: Order;
  createdAt: Date;
  read?: boolean;
}

export interface OrderStatusUpdate {
  orderId: string;
  newStatus: OrderStatus;
  message?: string;
  timestamp: Date;
}

export type OrderEventType = 'newOrder' | 'orderUpdated' | 'orderConfirmed' | 'orderCancelled' | 'orderCompleted';

export interface OrderEvent {
  type: OrderEventType;
  order: Order;
  timestamp: Date;
}