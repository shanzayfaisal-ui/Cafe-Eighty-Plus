# Real-Time Order Notification System - Implementation Guide

## 📋 Overview

This implementation provides a complete real-time order notification system with the following features:

- ✅ Real-time order creation notifications for admin
- ✅ Real-time order status updates for customers
- ✅ WebSocket-based communication using Supabase Realtime
- ✅ Persistent notifications with auto-dismiss
- ✅ Order tracking dashboard for customers
- ✅ Admin order management with live updates

## 🏗️ Architecture

### Technology Stack

- **Backend**: Supabase (PostgreSQL + Realtime)
- **Frontend**: React + TypeScript
- **Real-time Communication**: Supabase Realtime (PostgreSQL NOTIFY)
- **State Management**: React Hooks + Context API
- **UI Components**: Shadcn/ui + Radix UI

### System Components

```
┌─────────────────────────────────────────────────────────┐
│                   Frontend Application                  │
├──────────────┬──────────────────────────┬───────────────┤
│   Customer   │      Admin Panel         │  Notification│
│              │                          │   System     │
│ - Order Form │ - Order Dashboard        │ - Real-time  │
│ - Tracker    │ - Status Management      │ - Alerts     │
│ - Updates    │ - Live Order List        │ - History    │
└──────┬───────┴──────────┬───────────────┴───────┬───────┘
       │                  │                       │
       └──────────────────┼───────────────────────┘
                          │
                   ┌──────▼──────────┐
                   │  Supabase SDK   │
                   │  - Realtime     │
                   │  - Storage      │
                   │  - Auth         │
                   └──────┬──────────┘
                          │
       ┌──────────────────┼───────────────────────┐
       │                  │                       │
   ┌───▼────┐    ┌───────▼──────┐    ┌──────────▼──┐
   │ Orders │    │ Realtime     │    │ Storage     │
   │ Table  │    │ Subscriptions│    │ (Receipts)  │
   └────────┘    └──────────────┘    └─────────────┘
```

## 📁 File Structure

```
src/
├── types/
│   └── order.ts                    # Order type definitions
├── hooks/
│   ├── useOrders.ts               # Order CRUD operations
│   └── useOrderNotifications.ts    # Real-time subscriptions
├── contexts/
│   └── NotificationContext.tsx     # Notification state management
├── components/
│   ├── OrderNotificationDisplay.tsx # Notification UI component
│   ├── OrderTracker.tsx            # Customer order tracker
│   ├── Payment.tsx                 # Enhanced with order creation
│   └── OrderSuccess.tsx            # Order confirmation page
├── pages/
│   └── admin/
│       └── AdminOrdersPage.tsx     # Real-time admin dashboard
└── supabase/
    └── migrations/
        └── 20260410000001_update_orders_table_with_realtime.sql
```

## 🚀 Getting Started

### 1. Database Setup

The migration automatically:
- Adds `status`, `address`, `payment_method`, `payment_receipt_url`, `customer_id`, and `updated_at` fields
- Creates indexes for better performance
- Sets up automatic `updated_at` timestamp triggers
- Updates RLS policies for public read access
- Enables Realtime for the orders table

To apply:
```bash
supabase migration up
```

### 2. Environment Variables

Ensure you have:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_key
```

### 3. OrderItem Type Migration

Update your imports if using CartItem:
```typescript
// Map CartItem to OrderItem
const orderItems: OrderItem[] = items.map(item => ({
  id: item.id,
  name: item.name,
  price: item.price,
  quantity: item.quantity,
  category: item.category,
  image: item.image,
}));
```

## 🔧 How It Works

### Customer Places Order

1. **Payment Component** → Creates order with customer_id
   ```
   Payment → useOrders.createOrder() → Supabase Insert
   ```

2. **Order Saved** with fields:
   - `id`: UUID
   - `customer_id`: For tracking
   - `status`: 'Pending' by default
   - `items`: JSONB array
   - `payment_receipt_url`: Bank transfer proof
   - `created_at`, `updated_at`: Timestamps

3. **Real-time Notification** → Admin sees new order
   ```
   Supabase Realtime → useNewOrders Hook → AdminOrdersPage
   ```

### Admin Updates Order Status

1. **Admin clicks action** → Confirm/Cancel/Complete
   ```
   AdminOrdersPage → useOrders.updateOrderStatus() → DB Update
   ```

2. **Trigger fires** → Timestamp auto-updates
   ```
   updated_at trigger → PostgreSQL function
   ```

3. **Real-time event** → Customer sees update
   ```
   Supabase Realtime → useOrderUpdates Hook → OrderTracker
   ```

### Customer Receives Notification

1. **Real-time listener** triggers on order update
2. **Notification shown** with status and message
3. **OrderTracker component** updates status display
4. **Auto-dismiss** after 5 seconds (optional)

## 📡 Real-Time Communication Flow

### New Order Event
```
Customer places order
   ↓
Order inserted → PostgreSQL NOTIFY
   ↓
Supabase Realtime publishes INSERT event
   ↓
useNewOrders() hook triggers
   ↓
Admin notification appears + list updates
```

### Status Update Event
```
Admin updates status
   ↓
Order updated → PostgreSQL NOTIFY
   ↓
Supabase Realtime publishes UPDATE event
   ↓
useOrderUpdates() hook triggers (if customer_id matches)
   ↓
Customer notification appears + tracker updates
```

## 🧠 Hooks API Reference

### useOrders()
```typescript
const {
  loading,
  error,
  createOrder,
  fetchOrders,
  fetchOrderById,
  updateOrderStatus,
  fetchCustomerOrders,
} = useOrders();

// Create order
const order = await createOrder(
  name, phone, items, total,
  address?, paymentMethod?, receiptUrl?, customerId?
);

// Update status
const updated = await updateOrderStatus(orderId, 'Confirmed');
```

### useNewOrders()
```typescript
useNewOrders((event: OrderEvent) => {
  console.log('New order:', event.order);
  // Add to notification
});
```

### useOrderUpdates()
```typescript
useOrderUpdates(customerId, (event: OrderEvent) => {
  console.log('Order updated:', event.order);
  // Update tracker
});
```

### useNotification()
```typescript
const {
  notifications,
  addNotification,
  removeNotification,
  markAsRead,
  clearAll,
  unreadCount,
} = useNotification();

addNotification({
  orderId: '123',
  message: 'Order confirmed',
  type: 'success',
  order: orderObject,
});
```

## 🎨 UI Components

### OrderNotificationDisplay
Auto-positioning notification toast at top-right:
```typescript
<OrderNotificationDisplay />
```

Features:
- Auto-dismiss after 5 seconds
- 4 types: success, error, warning, info
- Click to mark as read
- Close button

### OrderTracker
Visual status timeline for customers:
```typescript
<OrderTracker order={order} />
```

Shows:
- Status flow: Pending → Confirmed → Completed
- Current status animation
- Order summary
- Last updated timestamp

### NotificationBadge
Red badge for unread notifications:
```typescript
<NotificationBadge /> // Shows count
```

## 🔐 Security & RLS Policies

```sql
-- Anyone can create orders
CREATE POLICY "Anyone can place orders"
  ON orders FOR INSERT WITH CHECK (true);

-- Anyone can read (needed for realtime)
CREATE POLICY "Anyone can read orders"
  ON orders FOR SELECT USING (true);

-- Only admins can update
CREATE POLICY "Authenticated users can update"
  ON orders FOR UPDATE 
  USING (auth.role() = 'authenticated');
```

> ⚠️ **Important**: Consider adding customer_id verification for production to prevent customers from reading all orders.

## 🧪 Testing the System

### 1. Test New Order Notification
```bash
# Open Admin Dashboard in one tab
# Place order in another tab
# Admin tab should show live notification
```

### 2. Test Status Update
```bash
# Keep OrderSuccess page open
# Update status in Admin Dashboard
# Customer page updates in real-time
```

### 3. Test Database Directly
```sql
-- Insert test order
INSERT INTO orders (name, phone, items, total, customer_id, status)
VALUES ('Test', '123456789', '[]'::jsonb, 1000, 'cust_123', 'Pending');

-- Update in another connection - both sessions should see change
UPDATE orders SET status = 'Confirmed' WHERE id = '...';
```

## ⚙️ Configuration

### Auto-Dismiss Timeout
Edit `NotificationContext.tsx`:
```typescript
setTimeout(() => {
  removeNotification(newNotification.id);
}, 5000); // Change to desired milliseconds
```

### Notification Position
Edit `OrderNotificationDisplay.tsx`:
```typescript
<div className="fixed top-20 right-4 z-[200] ...">
  {/* Position: top-20 right-4 */}
</div>
```

### Order Status Values
Edit `types/order.ts`:
```typescript
export type OrderStatus = 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed';
```

## 🐛 Troubleshooting

### Real-time updates not working?

1. **Check Realtime is enabled**:
   ```sql
   SELECT * FROM pg_publication;
   SELECT * FROM pg_publication_tables;
   ```

2. **Verify RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'orders';
   ```

3. **Check browser console** for Supabase connection logs

### Notifications not appearing?

1. Ensure `NotificationProvider` wraps app
2. Verify `OrderNotificationDisplay` is mounted
3. Check notification type: 'success' | 'error' | 'warning' | 'info'

### Orders not saving?

1. Check `payment_receipts` storage bucket exists
2. Verify RLS INSERT policy allows inserts
3. Check browser DevTools → Network → orders request

## 📊 Order Status Flow

```
┌─────────────┐
│   Pending   │ (Initial state after order creation)
└──────┬──────┘
       │
       ├──────────────┬────────────────┐
       │              │                │
    (Confirm)    (Cancel)         (No action)
       │              │                │
   ┌───▼────┐    ┌────▼──┐       Times out
   │Confirmed│    │Cancelled│
   └───┬────┘    └────────┘
       │
    (Complete)
       │
   ┌───▼────────┐
   │  Completed │
   └────────────┘
```

## 🚀 Future Enhancements

- [ ] SMS notifications for customers
- [ ] Order history/archive
- [ ] Delivery person map tracking
- [ ] Customer rating system
- [ ] Scheduled orders
- [ ] Order cancellation by customer
- [ ] Estimated delivery time
- [ ] Multiple payment methods tracking
- [ ] Order analytics dashboard
- [ ] Push notifications (PWA)

## 📚 Useful Resources

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [PostgreSQL LISTEN/NOTIFY](https://www.postgresql.org/docs/current/sql-notify.html)
- [React Hooks Best Practices](https://react.dev/reference/react/hooks)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 💡 Best Practices

1. **Customer ID Generation**: Use UUID or user ID in production
2. **Order Validation**: Add order total and item validation
3. **Error Handling**: Implement retry logic for failed orders
4. **Performance**: Use pagination for order list (>1000 orders)
5. **Notifications**: Persist important notifications to database
6. **Testing**: Write tests for hooks and components
7. **Monitoring**: Log order creation/updates for analytics

## 📝 Notes

- This implementation uses Supabase Realtime which requires row-level security
- Browser notifications require user permission
- Large file uploads require higher rate limits
- Connection drops are handled by Supabase SDK automatically

---

**Version**: 1.0.0  
**Last Updated**: April 10, 2026  
**Author**: Implementation Guide
