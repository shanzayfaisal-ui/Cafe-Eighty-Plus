# ✅ Real-Time Order System - Testing & Deployment Checklist

## 🔍 Pre-Deployment Checklist

### Code Quality
- [ ] Run `npm run lint` - No errors
- [ ] Run `npm run build` - Builds successfully
- [ ] Run `npm run test` - All tests pass (if applicable)
- [ ] Check TypeScript errors - `npm run tsc --noEmit` (if available)
- [ ] Review all imported types - No broken imports

### Environment Setup
- [ ] `VITE_SUPABASE_URL` set in `.env.local`
- [ ] `VITE_SUPABASE_ANON_KEY` set in `.env.local`
- [ ] Environment file NOT committed to git (.env.local in .gitignore)
- [ ] Verify no hardcoded API keys in code

### Database Setup
- [ ] Migration file exists: `20260410000001_update_orders_table_with_realtime.sql`
- [ ] Migration applied to Supabase project
- [ ] Table `orders` has all columns:
  - [ ] id, name, phone, items, total
  - [ ] status, address, payment_method, payment_receipt_url
  - [ ] customer_id, created_at, updated_at
- [ ] Realtime enabled for `orders` table
  - Check: Supabase Dashboard → Database → Replication
- [ ] RLS policies configured:
  - [ ] INSERT: Anyone can place orders
  - [ ] SELECT: Anyone can read
  - [ ] UPDATE: Authenticated users only (admin)
- [ ] Indexes created for performance:
  - [ ] idx_orders_status
  - [ ] idx_orders_created_at
  - [ ] idx_orders_customer_id
- [ ] Storage bucket `payment_receipts` exists

### File Verification
- [ ] `src/types/order.ts` exists and exports all types
- [ ] `src/hooks/useOrders.ts` exists
- [ ] `src/hooks/useOrderNotifications.ts` exists
- [ ] `src/contexts/NotificationContext.tsx` exists
- [ ] `src/components/OrderNotificationDisplay.tsx` exists
- [ ] `src/components/OrderTracker.tsx` exists
- [ ] All imports in modified files are correct

### Modified Files Checklist
- [ ] `src/App.tsx` - NotificationProvider added
- [ ] `src/components/Payment.tsx` - useOrders hook integrated
- [ ] `src/components/OrderSuccess.tsx` - OrderTracker added
- [ ] `src/pages/admin/AdminOrdersPage.tsx` - Real-time hooks integrated

## 🧪 Testing Scenarios

### Test 1: Admin Receives New Order Notification
**Setup**: Two browser windows/tabs
1. [ ] Open Admin Dashboard in Tab A (`/admin/orders`)
2. [ ] Open Order Page in Tab B (`/order`)
3. [ ] In Tab B:
   - [ ] Add items to cart
   - [ ] Click checkout
   - [ ] Fill customer info
   - [ ] Select payment method
   - [ ] If bank transfer: upload screenshot
   - [ ] Click "Complete Order"
4. [ ] Expected results in Tab A:
   - [ ] Toast notification appears at top-right
   - [ ] New order appears in table
   - [ ] Status shows as "Pending"
   - [ ] Can click eye icon to see details

### Test 2: Customer Receives Real-Time Update
**Setup**: Two browser windows - one on Order Success page, one on Admin
1. [ ] Complete an order and stay on Order Success page
2. [ ] Open Admin Dashboard in another window
3. [ ] In Admin window:
   - [ ] Find the order just placed
   - [ ] Click eye icon to view details
   - [ ] Click "Confirm Order"
4. [ ] Expected on Order Success page:
   - [ ] Toast notification appears
   - [ ] OrderTracker status changes from "Pending" to "Confirmed"
   - [ ] Timeline shows animated progress
   - [ ] Updated timestamp changes

### Test 3: Full Order Lifecycle
**Steps**:
1. [ ] **Customer**: Place order
   - [ ] Admin gets notification
   - [ ] Customer stays on success page
2. [ ] **Admin**: Confirm Order
   - [ ] Customer gets notification
   - [ ] Tracker shows "Confirmed"
3. [ ] **Admin**: Mark Completed
   - [ ] Customer gets notification
   - [ ] Tracker shows "Completed"
   - [ ] Timeline shows all statuses visited

### Test 4: Cancelled Order
**Steps**:
1. [ ] **Customer**: Place order (stays on page)
2. [ ] **Admin**: Cancel Order
   - [ ] Expected: Customer gets notification
   - [ ] Expected: OrderTracker shows cancel message

### Test 5: Multiple Customers
**Steps**:
1. [ ] **Customer A**: Place order
   - [ ] Admin sees notification for A
2. [ ] **Customer B**: Place order
   - [ ] Admin sees notification for B
   - [ ] Order A still in list
3. [ ] **Admin**: Update Order A's status
   - [ ] Customer A gets notification (if still on page)
   - [ ] Customer B is unaffected
   - [ ] List shows updated order A

### Test 6: Bank Transfer Flow
**Steps**:
1. [ ] Select "Bank Transfer" payment method
   - [ ] [ ] Bank details display correctly
   - [ ] [ ] File input shows
   - [ ] [ ] Help text visible
2. [ ] Click file input
   - [ ] [ ] File picker opens
   - [ ] [ ] Only JPEG/PNG shown
3. [ ] Select image file
   - [ ] [ ] File name displays
   - [ ] [ ] Checkmark icon shows
   - [ ] [ ] Success toast shows
4. [ ] Click "Complete Order"
   - [ ] [ ] File uploads to storage
   - [ ] [ ] Order saved with receipt URL
   - [ ] [ ] Admin can see "View Receipt" link

### Test 7: Notification Auto-Dismiss
**Steps**:
1. [ ] Place order → Notification appears
2. [ ] Wait 5 seconds
   - [ ] [ ] Notification auto-dismisses
3. [ ] Manually close notification
   - [ ] [ ] Close button works
   - [ ] [ ] Notification disappears immediately

### Test 8: Connection Recovery
**Steps**:
1. [ ] Open browser DevTools → Network tab
2. [ ] Select Admin Dashboard
3. [ ] Throttle connection (DevTools → Network → Slow 3G)
4. [ ] Place order in another tab
   - [ ] [ ] Notification still arrives (maybe delayed)
5. [ ] Back online → Normal speed
   - [ ] [ ] Realtime resumes

## 🔧 Debugging Commands

### Check Database
```sql
-- View all orders
SELECT id, name, phone, status, created_at FROM orders ORDER BY created_at DESC;

-- Check realtime is enabled
SELECT * FROM pg_publication WHERE pubname = 'supabase_realtime';

-- Test UPDATE trigger
UPDATE orders SET status = 'Confirmed' WHERE id = '<test-id>';

-- Check RLS policies
SELECT * FROM pg_policies WHERE tablename = 'orders';
```

### Check Browser Console
```javascript
// Check Supabase client
console.log(supabase);

// Test realtime subscription manually
const channel = supabase.channel('test');
channel.on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
  console.log('Change: ', payload);
}).subscribe();

// List all subscriptions
console.log(supabase.getChannels());
```

### Verify Files
```bash
# Check if all files exist
test -f "src/types/order.ts" && echo "✓ order.ts"
test -f "src/hooks/useOrders.ts" && echo "✓ useOrders.ts"
test -f "src/hooks/useOrderNotifications.ts" && echo "✓ useOrderNotifications.ts"
test -f "src/contexts/NotificationContext.tsx" && echo "✓ NotificationContext.tsx"
test -f "src/components/OrderNotificationDisplay.tsx" && echo "✓ OrderNotificationDisplay.tsx"
test -f "src/components/OrderTracker.tsx" && echo "✓ OrderTracker.tsx"

# Check migrations
ls -la supabase/migrations | grep "20260410"
```

## 🚨 Common Issues & Solutions

### Issue: "Real-time not working"
**Checklist**:
- [ ] Realtime enabled on orders table
- [ ] RLS SELECT policy allows public read
- [ ] Browser connected (DevTools shows no errors)
- [ ] Supabase status is OK (check status.supabase.com)

**Solution**:
```sql
-- Re-enable realtime
ALTER PUBLICATION supabase_realtime ADD TABLE orders;
```

### Issue: "Can't update order status"
**Checklist**:
- [ ] Admin is logged in (check auth)
- [ ] Row-level security allows authenticated UPDATE
- [ ] No foreign key constraint violations

**Solution**:
```sql
-- Check if admin auth is working
SELECT jwt_to_jsonb(current_setting('request.jwt_claims'));
```

### Issue: "Notifications appear but don't show details"
**Checklist**:
- [ ] Order object is passed to addNotification
- [ ] OrderItem types match CartItem fields
- [ ] customer_id is set correctly

### Issue: "File upload fails"
**Checklist**:
- [ ] payment_receipts bucket exists
- [ ] Bucket is public (Storage → Buckets → Edit)
- [ ] File size < 5MB
- [ ] File type is JPEG/PNG

## 📈 Performance Testing

### Load Test Scenario
```javascript
// Simulate 100 orders being placed
for (let i = 0; i < 100; i++) {
  useOrders().createOrder(
    `Customer ${i}`,
    `123456789${i}`,
    [{id: '1', name: 'Coffee', price: 300, quantity: 1, category: 'Drink'}],
    300 + DELIVERY_FEE,
  );
  await new Promise(r => setTimeout(r, 100)); // 100ms delay between orders
}
```

**Expected**:
- [ ] All orders created successfully
- [ ] admin page responsive throughout
- [ ] No memory leaks (DevTools → Memory)
- [ ] WebSocket connections stable

## 🎯 User Acceptance Testing

### Admin User Tests
- [ ] [ ] Can see all orders in dashboard
- [ ] [ ] Receives notification when new order comes
- [ ] [ ] Can view order details by clicking eye icon
- [ ] [ ] Can confirm order
- [ ] [ ] Can cancel order
- [ ] [ ] Can mark order as complete
- [ ] [ ] Notification dismisses automatically
- [ ] [ ] Can see bank transfer receipts

### Customer User Tests
- [ ] [ ] Can add items to cart
- [ ] [ ] Can proceed to checkout
- [ ] [ ] Can enter delivery address
- [ ] [ ] Can select payment method
- [ ] [ ] Can upload receipt for bank transfer
- [ ] [ ] Can see order success page
- [ ] [ ] Can see order tracker with timeline
- [ ] [ ] Receives notification when status changes
- [ ] [ ] Notification shows on page
- [ ] [ ] Tracker updates in real-time

## 🚀 Deployment Steps

1. **Staging Deployment**
   - [ ] Deploy to staging environment
   - [ ] Run all tests from "Testing Scenarios"
   - [ ] Have test user run UAT tests
   - [ ] Check browser console for errors
   - [ ] Monitor performance in Production

2. **Production Deployment**
   - [ ] Create database backup
   - [ ] Apply migration to production
   - [ ] Deploy code to production
   - [ ] Run smoke tests
   - [ ] Monitor error logs
   - [ ] Have limited set of users test

3. **Post-Deployment**
   - [ ] Monitor realtime connections
   - [ ] Check order creation rate
   - [ ] Monitor notification delivery
   - [ ] Review any error logs
   - [ ] Get user feedback

## 📊 Monitoring

### Key Metrics to Watch
- [ ] Order creation rate
- [ ] Average notification delivery time
- [ ] WebSocket connection count
- [ ] Database query performance
- [ ] Storage space used

### Commands to Monitor
```sql
-- Orders per hour
SELECT DATE_TRUNC('hour', created_at), COUNT(*) 
FROM orders 
GROUP BY DATE_TRUNC('hour', created_at);

-- Average order value
SELECT AVG(total), MIN(total), MAX(total) FROM orders;

-- Orders by status
SELECT status, COUNT(*) FROM orders GROUP BY status;
```

## ✅ Final Sign-Off

Before going live:

- [ ] All tests passed
- [ ] No console errors
- [ ] Database migration applied
- [ ] Environment variables set
- [ ] Code reviewed
- [ ] Documentation reviewed
- [ ] Performance acceptable
- [ ] Security audit passed
- [ ] Backup created
- [ ] Rollback plan documented

## 🎉 Go Live!

Deployment date: _______________  
Deployed by: _______________  
Reviewed by: _______________  

---

**Checklist Version**: 1.0  
**Last Updated**: April 10, 2026
