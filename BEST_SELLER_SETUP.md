## Best Seller System - Setup & Troubleshooting Guide

### STEP 1: Apply the Database Migration

Run this command in your terminal to add the `is_best_seller` column to Supabase:

```bash
supabase db push
```

Expected output: Migration successfully created/applied.

---

### STEP 2: Regenerate TypeScript Types

After the migration is applied, regenerate the Supabase types:

```bash
supabase gen types typescript --project-id <your-project-id> > src/integrations/supabase/types.ts
```

Or if your project has a config:

```bash
supabase gen types typescript > src/integrations/supabase/types.ts
```

This ensures `is_best_seller` field is included in the `TablesInsert` and `TablesUpdate` types.

---

### STEP 3: Verify Admin Authorization

Make sure your admin user is set up in Supabase:

1. Go to Supabase Dashboard → Authentication → Users
2. Verify your admin account exists (e.g., admin@yahoo.com)
3. If not present, the RLS policy `public.is_admin()` will block updates

To manually authorize an admin, run in Supabase SQL Editor:

```sql
INSERT INTO public.admin_users (id, email)
SELECT id, email FROM auth.users WHERE email = 'admin@yahoo.com'
ON CONFLICT (id) DO UPDATE SET email = EXCLUDED.email;
```

---

### STEP 4: Check Browser Console for Actual Error

1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Try to save a product
4. Look for error messages that start with: `Save error:` or `Full error object:`

This will show the actual Supabase error (e.g., "column does not exist", "permission denied", etc.)

---

### STEP 5: Verify Column Exists in Supabase

If you're still getting errors, verify the column was created:

**In Supabase Dashboard:**
1. Go to Database → Tables
2. Select `menu_items` table
3. Look for `is_best_seller` column (should be BOOLEAN, default: false)

**Or run in SQL Editor:**

```sql
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'menu_items' AND column_name = 'is_best_seller';
```

Should return: `is_best_seller | boolean | NO | false`

---

### STEP 6: Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| "column 'is_best_seller' does not exist" | Run `supabase db push` |
| "TypeScript error: property 'is_best_seller' does not exist" | Run `supabase gen types typescript` |
| "permission denied" error | Verify admin user is in `admin_users` table |
| "Save failed. Please try again." (generic) | Check browser console (Step 4) for actual error |
| Column exists but updates still fail | Check RLS policy: `SELECT * FROM pg_policies WHERE tablename = 'menu_items'` |

---

### STEP 7: Expected Behavior After Setup

✅ **Add Product:**
- Admin form shows "Mark as Best Seller" checkbox
- Checking it saves `is_best_seller = true` to database
- No error in console

✅ **Home Page:**
- Best sellers fetch from products where `is_best_seller = true`
- If none exist, fallback shows first 4 products
- Images update instantly

---

### Files Involved

| File | What Changed |
|------|--------------|
| `supabase/migrations/20260401000000_add_is_best_seller_column.sql` | New column definition |
| `src/components/admin/ProductForm.tsx` | Added checkbox field |
| `src/pages/admin/AdminProductsPage.tsx` | Save/display logic + error logging |
| `src/pages/Index.tsx` | Fetch best sellers dynamically |

---

### Need Help?

If you still see errors after Step 4:
1. Copy the error message from browser console
2. Check if it mentions "RLS" or "policy" → Authorization issue
3. Check if it mentions "column" → Migration not applied
4. Check if it mentions "type" → Types not regenerated

Post the exact error message from the console, and I can provide specific fixes!
