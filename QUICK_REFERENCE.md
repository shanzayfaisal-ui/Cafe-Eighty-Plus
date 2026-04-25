# 🚀 Real-Time Order System - Quick Reference Card

## File Locations Reference

```
src/
├── App.tsx                              ← Updated (NotificationProvider)
├── types/
│   └── order.ts                         ← NEW (Order types)
├── hooks/
│   ├── useOrders.ts                     ← NEW (CRUD operations)
│   └── useOrderNotifications.ts          ← NEW (Real-time listeners)
├── contexts/
│   ├── CartContext.tsx                  (Existing)
│   └── NotificationContext.tsx          ← NEW (Notification state)
├── components/
│   ├── OrderNotificationDisplay.tsx     ← NEW (Toast UI)
│   ├── OrderTracker.tsx                 ← NEW (Status timeline)
│   ├── Payment.tsx                      ← Updated (useOrders)
│   └── OrderSuccess.tsx                 ← Updated (Tracker + tracking)
└── pages/
    └── admin/
        └── AdminOrdersPage.tsx          ← Updated (Real-time)

supabase/
└── migrations/
    └── 20260410000001_*.sql             ← NEW (DB schema)

Documentation/
├── REALTIME_ORDER_SYSTEM.md             (Full technical docs)
├── INTEGRATION_GUIDE.md                 (Quick start)
├── IMPLEMENTATION_SUMMARY.md            (What was built)
├── TESTING_CHECKLIST.md                 (QA checklist)
└── QUICK_REFERENCE.md                   (This file)
```

## 🔥 Most Important Files to Know

### 1. Type Definitions
**File**: `src/types/order.ts`
```typescript
// What types exist?
Order, OrderStatus, OrderItem, OrderEvent, OrderNotification

// Importing
import { Order, OrderStatus, OrderItem } from "@/types/order";
```

### 2. CRUD Operations
**File**: `src/hooks/useOrders.ts`
```typescript
// Create order
const order = await createOrder(name, phone, items, total, address, paymentMethod, receiptUrl, customerId);

// Fetch orders
const orders = await fetchOrders();

// Update status
await updateOrderStatus(orderId, 'Confirmed');
```

### 3. Real-Time Listeners
**File**: `src/hooks/useOrderNotifications.ts`
```typescript
// Listen for new orders (Admin)
useNewOrders((event) => {
  console.log('New order:', event.order);
});

// Listen for updates (Customer)
useOrderUpdates(customerId, (event) => {
  console.log('Order updated:', event.order);
});
```

### 4. Notifications
**File**: `src/contexts/NotificationContext.tsx`
```typescript
const { addNotification, notifications, removeNotification } = useNotification();

addNotification({
  orderId: '123',
  message: 'Order confirmed',
  type: 'success', // or 'error', 'warning', 'info'
  order: orderObject,
});
```

## 📡 Real-Time Event Flow

```
┌─────────────────────────────────────────────┐
│ Customer Places Order                       │
│ Payment.tsx → createOrder(...)              │
└────────────────┬────────────────────────────┘
                 │
              INSERT
                 ↓
        ┌────────────────┐
        │ orders table   │←──── Trigger: update timestamps
        └────┬───────────┘
             │
          NOTIFY
             ↓
    ┌────────────────────────┐
    │ Supabase Realtime      │
    │ (WebSocket broadcast)  │
    └────┬─────────────────┬─┘
         │                 │
    useNewOrders()   useOrderUpdates()
         │                 │
    Admin gets         Customer gets
    notification       notification
         │                 │
    AdminOrdersPage    OrderTracker
    updates            updates
```

## 🎯 Code Snippets for Common Tasks

### Add a New Notification
```typescript
import { useNotification } from "@/contexts/NotificationContext";

function MyComponent() {
  const { addNotification } = useNotification();
  
  const notifyUser = () => {
    addNotification({
      orderId: "123",
      message: "Order confirmed!",
      type: "success",
      order: orderObject,
    });
  };
  
  return <button onClick={notifyUser}>Notify</button>;
}
```

### Listen for New Orders (Admin)
```typescript
import { useNewOrders } from "@/hooks/useOrderNotifications";

function AdminDashboard() {
  useNewOrders((event) => {
    console.log("New order arrived!", event.order);
    // Update UI, refresh list, etc
  });
  
  return <div>Orders: ...</div>;
}
```

### Track Customer Order Status
```typescript
import { useOrderUpdates } from "@/hooks/useOrderNotifications";
import OrderTracker from "@/components/OrderTracker";

function OrderSuccess() {
  const [order, setOrder] = useState(null);
  const customerId = localStorage.getItem("customerId");
  
  useOrderUpdates(customerId, (event) => {
    setOrder(event.order); // Auto-update when status changes
  });
  
  return order && <OrderTracker order={order} />;
}
```

### Create an Order
```typescript
import { useOrders } from "@/hooks/useOrders";

function Checkout() {
  const { createOrder, loading } = useOrders();
  
  const handleCheckout = async () => {
    const order = await createOrder(
      "John Doe",
      "03001234567",
      [{id: "1", name: "Espresso", price: 300, quantity: 2, category: "Coffee", image: "espresso"}],
      600 + 200, // total + delivery fee
      "123 Main Street",
      "cash_on_delivery",
      null,
      "cust_" + Date.now()
    );
    
    if (order) {
      // Order created, notify customer
      localStorage.setItem("lastOrderId", order.id);
    }
  };
  
  return <button onClick={handleCheckout} disabled={loading}>Order</button>;
}
```

## ⚡ Quick Commands

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Run linter
npm run lint

# Check types
npx tsc --noEmit

# View Supabase logs
supabase functions list
```

## 🔑 Environment Variables

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anonymous-key-here
```

## 🧩 Component Props

### OrderTracker
```typescript
interface OrderTrackerProps {
  order: Order;
}

// Usage
<OrderTracker order={orderData} />
```

### OrderNotificationDisplay
```typescript
// No props needed, uses NotificationContext internally
<OrderNotificationDisplay />
```

## 🔄 State Management Map

```
App.tsx
└── NotificationProvider
    ├── OrderNotificationDisplay (reads notifications)
    ├── AdminOrdersPage (uses useNewOrders hook)
    ├── OrderSuccess (uses useOrderUpdates hook)
    └── Payment (uses useOrders hook)

CartContext (separate)
└── Used in Payment, CartDrawer, etc
```

## 🗄️ Database Schema Quick Reference

```sql
orders(
  id: uuid PRIMARY KEY,
  name: text,              -- Customer name
  phone: text,             -- Customer phone
  items: jsonb,            -- [{id, name, price, quantity, category, image}]
  total: integer,          -- Total amount in rupees
  status: text,            -- 'Pending', 'Confirmed', 'Cancelled', 'Completed'
  address: text,           -- Delivery address
  payment_method: text,    -- 'cash_on_delivery', 'bank_transfer'
  payment_receipt_url: text, -- S3 URL for receipt
  customer_id: text,       -- For tracking customer orders
  created_at: timestamp,   -- When order was created
  updated_at: timestamp    -- When order was last updated (auto)
)

Indexes:
- idx_orders_status
- idx_orders_created_at
- idx_orders_customer_id

Realtime: ENABLED
RLS: ENABLED
```

## 🔍 Debugging Tips

### Check if Realtime is Working
```javascript
// In browser console
const channel = supabase.channel('test-orders');
channel.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, 
  (payload) => console.log('Realtime working!', payload)
).subscribe();

// Make DB change in another tab - console should log it
```

### Verify Order Data
```javascript
// Check what's in localStorage
JSON.parse(localStorage.getItem('lastOrderId')); // Order ID
JSON.parse(localStorage.getItem('customerId'));  // Customer ID
```

### Test Database Directly
```sql
-- Insert test order
INSERT INTO orders (name, phone, items, total, customer_id, status)
VALUES ('Test', '123456789', '[]'::jsonb, 500, 'test_cust', 'Pending');

-- This will trigger realtime event for all listening clients
```

## 📚 Hook Return Values

### useOrders()
```typescript
{
  loading: boolean,
  error: string | null,
  createOrder: async (...) => Order | null,
  fetchOrders: async () => Order[],
  fetchOrderById: async (id: string) => Order | null,
  updateOrderStatus: async (id: string, status) => Order | null,
  fetchCustomerOrders: async (customerId: string) => Order[],
}
```

### useNotification()
```typescript
{
  notifications: OrderNotification[],
  addNotification: (notification) => void,
  removeNotification: (id: string) => void,
  markAsRead: (id: string) => void,
  clearAll: () => void,
  unreadCount: number,
}
```

## 🎨 UI Component Colors

```
Status Colors:
- Pending: amber-100 / amber-700
- Confirmed: emerald-100 / emerald-700
- Completed: purple-100 / purple-700
- Cancelled: rose-100 / rose-700

Primary: #2D1B14 (dark brown)
Secondary: #5D3A26 (medium brown)
Background: #F5F2ED (cream)

Toast Types:
- success: emerald background
- error: rose background
- warning: amber background
- info: blue background
```

## 📞 Quick Support Checklist

Having issues? Check:
- [ ] Migration applied: `supabase migration up`
- [ ] Realtime enabled: Supabase → Database → Replication
- [ ] RLS policies correct: Supabase → Security → Policies
- [ ] Environment vars set: `.env.local` file
- [ ] All imports correct: Check src/ paths
- [ ] Types exported: order.ts exports all types
- [ ] Hooks mounted: Check React DevTools
- [ ] No console errors: DevTools → Console tab
- [ ] Supabase status OK: status.supabase.com

## 🏆 Best Practices

1. **Always use hooks** - Don't call Supabase directly
2. **Handle errors** - Wrap in try-catch
3. **Clean up subscriptions** - They auto-cleanup on unmount
4. **Type everything** - Use OrderItem, Order types
5. **Test locally first** - Before pushing to production
6. **Monitor logs** - Check browser console for errors
7. **Use localStorage wisely** - Only for user session data
8. **Secure customer IDs** - Use cryptographically safe IDs
9. **Validate on backend** - RLS policies protect data
10. **Document changes** - Keep team informed

---

**Quick Reference v1.0** | April 10, 2026 | Keep this handy!
