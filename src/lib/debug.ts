import { supabase } from '@/integrations/supabase/client';

/**
 * Debug helper - run this in browser console to verify system
 */
export async function debugPaymentSystem() {
  console.log('=== PAYMENT SYSTEM DEBUG ===\n');

  try {
    // 1. Check Supabase connection
    console.log('1. Checking Supabase connection...');
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    console.log('Auth status:', session ? 'Authenticated' : 'Anonymous');
    if (authError) console.warn('Auth error:', authError);

    // 2. Check orders table exists
    console.log('\n2. Checking orders table...');
    const { data: tableData, error: tableError } = await supabase
      .from('orders')
      .select('id')
      .limit(1);
    
    if (tableError) {
      console.error('❌ Table error:', tableError.message);
    } else {
      console.log('✓ Orders table accessible');
    }

    // 3. Test insert without auth (simulating customer)
    console.log('\n3. Testing insert permission...');
    const testOrder = {
      name: 'Test User',
      phone: '1234567890',
      items: [{ id: '1', name: 'Test', price: 100, quantity: 1, category: 'Test' }],
      items_summary: 'Test (x1)',
      total: 300,
      address: 'Test Address',
      payment_method: 'cash_on_delivery',
      payment_receipt_url: null,
      customer_id: 'test_' + Date.now(),
      status: 'Pending',
    };

    const { data: insertData, error: insertError } = await supabase
      .from('orders')
      .insert([testOrder])
      .select()
      .single();

    if (insertError) {
      console.error('❌ Insert failed:');
      console.error('  Code:', insertError.code);
      console.error('  Message:', insertError.message);
      console.error('  Details:', insertError.details);
    } else {
      console.log('✓ Insert successful! Order ID:', insertData?.id);
      // Clean up test order
      await supabase.from('orders').delete().eq('id', insertData.id);
    }

    // 4. Check payment_receipts bucket
    console.log('\n4. Checking storage bucket...');
    const { data: buckets, error: bucketsError } = await supabase
      .storage
      .listBuckets();

    if (bucketsError) {
      console.error('❌ Storage error:', bucketsError.message);
    } else {
      const hasPaymentBucket = buckets.some(b => b.name === 'payment_receipts');
      if (hasPaymentBucket) {
        console.log('✓ payment_receipts bucket exists');
      } else {
        console.error('❌ payment_receipts bucket not found');
      }
    }

    console.log('\n=== DEBUG COMPLETE ===');
    return true;

  } catch (err) {
    console.error('Debug error:', err);
    return false;
  }
}

// Usage: In browser console, import and run:
// import { debugPaymentSystem } from '@/lib/debug'
// debugPaymentSystem()
