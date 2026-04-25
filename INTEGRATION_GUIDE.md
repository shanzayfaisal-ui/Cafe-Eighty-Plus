# Real-Time Order System - Quick Integration Guide

## ✅ What's Been Implemented

### 1. Database Layer
- ✅ Migration: `20260410000001_update_orders_table_with_realtime.sql`
  - Added order fields: status, address, payment_method, payment_receipt_url, customer_id
  - Auto-updating `updated_at` timestamp
  - Performance indexes
  - Realtime enabled

### 2. Type System
- ✅ `src/types/order.ts`
  - Order interface
  - OrderStatus type
  - OrderEvent and OrderNotification types
  - OrderItem interface for cart→order conversion

### 3. Hooks (Real-time Logic)
- ✅ `src/hooks/useOrders.ts`
  - createOrder() - Save order to DB
  - fetchOrders() - Get all orders (admin)
  - updateOrderStatus() - Change order status
  - fetchOrderById() - Get specific order
  - fetchCustomerOrders() - Get customer's orders

- ✅ `src/hooks/useOrderNotifications.ts`
  - useNewOrders() - Listen for new orders (admin)
  - useOrderUpdates() - Listen for status changes (customer)
  - useAllOrderEvents() - Listen for all events

### 4. State Management
- ✅ `src/contexts/NotificationContext.tsx`
  - NotificationProvider - Wraps app
  - useNotification() - Access notifications
  - useOrderNotificationHandler() - Helper functions

### 5. Components
- ✅ `src/components/OrderNotificationDisplay.tsx`
  - Toast notifications with auto-dismiss
  - 4 notification types
  - NotificationBadge for count

- ✅ `src/components/OrderTracker.tsx`
  - Visual order status timeline
  - Real-time updates
  - Customer-focused UI

### 6. Enhanced Components
- ✅ `src/components/Payment.tsx`
  - Integrated useOrders
  - Generates unique customer_id
  - Saves orders with full details

- ✅ `src/components/OrderSuccess.tsx`
  - Fetches order details
  - Listens for real-time updates
  - Displays OrderTracker component

- ✅ `src/pages/admin/AdminOrdersPage.tsx`
  - Uses useNewOrders() hook
  - Real-time order list updates
  - Live notification display
  - Integrated with NotificationContext

### 7. App Setup
- ✅ `src/App.tsx`
  - NotificationProvider wrapper
  - OrderNotificationDisplay component
  - Notification context available everywhere

## 🔄 Data Flow

### Placing Order
```
Customer fills form
  ↓
Payment.tsx → handleConfirm()
  ↓
useOrders.createOrder(items, total, customerId)
  ↓
INSERT into orders table
  ↓
Supabase Realtime publishes
  ↓
AdminOrdersPage useNewOrders() triggers
  ↓
Admin sees: notification + new order in list
```

### Customer Tracking
```
After order placed
  ↓
OrderSuccess.tsx mounts
  ↓
fetchOrderById() gets current order
  ↓
useOrderUpdates(customerId) starts listening
  ↓
AdminOrdersPage updates order status
  ↓
useOrderUpdates() detects change
  ↓
OrderTracker.tsx updates display
  ↓
Customer sees: live status update
```

### Real-time Notification
```
Order status changes
  ↓
Admin clicks "Confirm Order"
  ↓
updateOrderStatus(id, 'Confirmed')
  ↓
Table row updated + trigger fires
  ↓
PostgreSQL NOTIFY published
  ↓
Supabase Realtime broadcasts UPDATE event
  ↓
All listening clients receive event
  ↓
useOrderUpdates() fires callback
  ↓
addNotification() displays toast
```

## 🚀 How to Test

### Test 1: Admin Receives New Order Notification

1. Open browser with **Admin Dashboard** (`/admin/orders`)
2. Open another browser/tab with **Order Page** (`/order`)
3. Place test order:
   - Add items to cart
   - Go through checkout
   - Place order
4. **Expected**: Admin dashboard shows:
   - New order in table
   - Toast notification at top-right
   - Order details available on click

### Test 2: Customer Sees Live Status Update

1. Complete order and stay on **Order Success** page
2. Open another tab with **Admin Dashboard**
3. Locate the just-placed order
4. Click "Confirm Order"
5. **Expected** on Order Success page:
   - Notification toast appears
   - OrderTracker status changes to "Confirmed"
   - Updated timestamp changes

### Test 3: Full Order Lifecycle

1. Admin receives new order notification
2. Admin confirms order → Toast on customer page
3. Admin marks complete → Toast on customer page
4. OrderTracker shows full flow: Pending → Confirmed → Completed

## 🔍 What Changed in Existing Files

### **src/App.tsx**
```diff
+ import { NotificationProvider } from "@/contexts/NotificationContext";
+ import OrderNotificationDisplay from "@/components/OrderNotificationDisplay";

  const App = () => (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <CartProvider>
+         <NotificationProvider>
            <Toaster />
            <Sonner />
+           <OrderNotificationDisplay />
            <BrowserRouter>
              <AppContent />
            </BrowserRouter>
+         </NotificationProvider>
        </CartProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
```

### **src/components/Payment.tsx**
```diff
+ import { useOrders } from "@/hooks/useOrders";
+ import { OrderItem } from "@/types/order";

  const handleConfirm = async () => {
    // ... existing code ...
    
+   const customerId = `cust_${Date.now()}_${Math.random().toString(...)}`;
+   const orderItems: OrderItem[] = items.map(item => ({...}));
    
-   await supabase.from("orders").insert([orderData]);
+   const order = await createOrder(
+     customer.name, customer.phone, orderItems, finalTotal,
+     customer.address, paymentMethod, receiptUrl, customerId
+   );
    
+   localStorage.setItem("lastOrderId", order.id);
+   localStorage.setItem("customerId", customerId);
  }
```

### **src/components/OrderSuccess.tsx**
```diff
+ import { useOrders } from "@/hooks/useOrders";
+ import { useOrderUpdates } from "@/hooks/useOrderNotifications";
+ import { Order } from "@/types/order";
+ import OrderTracker from "./OrderTracker";

+ const { fetchOrderById } = useOrders();
+ const [order, setOrder] = useState<Order | null>(null);
+ const [customerId, setCustomerId] = useState<string | null>(null);

+ useOrderUpdates(customerId || "", (event) => {
+   setOrder(event.order);
+ });

  return (
    <div>
      {/* existing JSX */}
+     {order && <OrderTracker order={order} />}
    </div>
  );
```

### **src/pages/admin/AdminOrdersPage.tsx**
```diff
+ import { useOrders } from "@/hooks/useOrders";
+ import { useNewOrders } from "@/hooks/useOrderNotifications";
+ import { useNotification } from "@/contexts/NotificationContext";
+ import { Order, OrderEvent } from "@/types/order";

+ const { fetchOrders, updateOrderStatus } = useOrders();
+ const { addNotification } = useNotification();

+ useNewOrders((event: OrderEvent) => {
+   setOrders(prev => [event.order, ...prev]);
+   addNotification({...});
+ });

- const updateStatus = async (id, newStatus) => {
+ const handleStatusUpdate = async (id, newStatus) => {
+   const updated = await updateOrderStatus(id, newStatus);
    // Real-time list updates automatically
+ }
```

## 🎯 Minimum Requirements

- ✅ Supabase project with orders table
- ✅ `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` env vars
- ✅ Realtime enabled for orders table
- ✅ payment_receipts storage bucket exists
- ✅ Node.js 16+ and npm/bun

## 🔧 Installation Steps

1. **Update Database**
   ```bash
   supabase migration up
   ```
   Or in Supabase Dashboard → SQL Editor → Run migration

2. **Install Package** (if needed)
   ```bash
   npm install  # or bun install
   ```

3. **Verify Realtime is Enabled**
   - Supabase Dashboard → Database → Replication
   - Ensure `orders` table has realtime enabled

4. **Start Dev Server**
   ```bash
   npm run dev  # or bun run dev
   ```

5. **Test the System**
   - Follow "How to Test" section above

## 📊 File Checklist

- [ ] `supabase/migrations/20260410000001_update_orders_table_with_realtime.sql` created
- [ ] `src/types/order.ts` created
- [ ] `src/hooks/useOrders.ts` created
- [ ] `src/hooks/useOrderNotifications.ts` created
- [ ] `src/contexts/NotificationContext.tsx` created
- [ ] `src/components/OrderNotificationDisplay.tsx` created
- [ ] `src/components/OrderTracker.tsx` created
- [ ] `src/components/Payment.tsx` updated
- [ ] `src/components/OrderSuccess.tsx` updated
- [ ] `src/pages/admin/AdminOrdersPage.tsx` updated
- [ ] `src/App.tsx` updated with providers
- [ ] Database migration applied
- [ ] All imports working (run `npm run lint`)

## 🆘 Common Issues & Fixes

### Issue: "Real-time updates not showing"
**Fix**: Check Supabase Dashboard → Database → Replication → Enable for orders table

### Issue: "TypeError: Cannot read property 'subscribe'"
**Fix**: Verify Supabase client is initialized in `src/integrations/supabase/client.ts`

### Issue: "Notifications appear but don't update"
**Fix**: Ensure `customerId` is being set in Payment component and passed to `useOrderUpdates`

### Issue: "Order not saving"
**Fix**: Check RLS policies allow INSERT. Run in Supabase SQL:
```sql
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

### Issue: "Migration fails"
**Fix**: Check if orders table already exists:
```sql
SELECT * FROM information_schema.tables WHERE table_name = 'orders';
```

## 📞 Support

If you encounter issues:

1. Check browser console (DevTools F12) for errors
2. Check Supabase Dashboard → Logs for database errors
3. Verify all imports are correct
4. Ensure types are exported from order.ts
5. Check that NotificationProvider wraps app

## 🎉 You're All Set!

Your real-time order notification system is now fully integrated! 

**Key Features Implemented**:
- ✅ Instant admin notifications for new orders
- ✅ Real-time customer order tracking
- ✅ Auto-updating order status display
- ✅ Toast notifications with animations
- ✅ Order history and details
- ✅ Clean, type-safe architecture

**Next Steps**:
1. Customize notification messages in `NotificationContext.tsx`
2. Adjust notification position/styling in `OrderNotificationDisplay.tsx`
3. Add order confirmation emails (optional)
4. Implement SMS notifications (optional)
5. Add order analytics dashboard (optional)

---

**Implementation Version**: 1.0.0  
**Date**: April 10, 2026
