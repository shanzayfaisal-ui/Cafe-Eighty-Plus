import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, Clock3, ListChecks } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useOrders } from '@/hooks/useOrders';
import { useToast } from '@/hooks/use-toast';
import { Input } from '@/components/ui/input';
import { Order } from '@/types/order';

const ProfilePage = () => {
  const navigate = useNavigate();
  const { user, profile, loading, logout, updateProfile } = useAuth();
  const { fetchUserOrders } = useOrders();
  const { toast } = useToast();

  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ full_name: '', phone: '', address: '' });

  useEffect(() => {
    if (!loading && !user) {
      navigate('/login', { replace: true });
    }
  }, [loading, user, navigate]);

  useEffect(() => {
    if (profile) {
      setForm({
        full_name: profile.full_name ?? '',
        phone: profile.phone ?? '',
        address: profile.address ?? '',
      });
    } else if (user) {
      setForm({
        full_name: user.user_metadata?.full_name ?? '',
        phone: '',
        address: '',
      });
    }
  }, [profile, user]);

  useEffect(() => {
    const loadOrders = async () => {
      if (!user) {
        setLoadingOrders(false);
        return;
      }
      const data = await fetchUserOrders(user.id);
      setOrders(data);
      setLoadingOrders(false);
    };

    loadOrders();
  }, [fetchUserOrders, user]);

  const handleFieldChange = (field: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProfile({
        full_name: form.full_name,
        phone: form.phone,
        address: form.address,
      });
      toast({ title: 'Profile saved', description: 'Your checkout details are now updated.' });
    } catch (error: any) {
      toast({ title: 'Save failed', description: error.message || 'Unable to save profile.', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error: any) {
      toast({ title: 'Logout failed', description: error.message || 'Unable to log out.', variant: 'destructive' });
    }
  };

  const orderCount = useMemo(() => orders.length, [orders]);

  return (
    <div className="min-h-screen bg-[#FDFCFB] py-16 px-4 sm:px-6 lg:px-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="grid gap-6 xl:grid-cols-[1.3fr_0.7fr]">
          <div className="bg-white rounded-[2.5rem] border border-stone-100 p-8 shadow-sm">
            <div className="flex items-center justify-between gap-4 mb-8">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-stone-400 font-bold">Profile</p>
                <h1 className="text-3xl font-serif font-bold text-[#2D1B14] mt-2">My Account</h1>
              </div>
              <button
                onClick={handleLogout}
                className="inline-flex items-center gap-2 rounded-full border border-stone-200 px-4 py-3 text-sm font-bold uppercase tracking-[0.2em] text-stone-700 hover:bg-stone-50 transition"
              >
                <LogOut size={16} /> Logout
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-3xl bg-stone-50 border border-stone-100 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-stone-400 mb-2">Account</p>
                <div className="space-y-2 text-sm text-stone-700">
                  <p className="font-semibold">{user?.email ?? 'No email available'}</p>
                  <p className="text-stone-500">Member since {user?.created_at ? new Date(user.created_at).toLocaleDateString() : 'Unknown'}</p>
                </div>
              </div>
              <div className="rounded-3xl bg-stone-50 border border-stone-100 p-5">
                <p className="text-xs uppercase tracking-[0.35em] text-stone-400 mb-2">Saved details</p>
                <div className="space-y-2 text-sm text-stone-700">
                  <p>{form.full_name || 'Full name not saved'}</p>
                  <p>{form.phone || 'Phone not saved'}</p>
                  <p>{form.address || 'Address not saved'}</p>
                </div>
              </div>
            </div>

            <div className="mt-10">
              <h2 className="text-lg font-semibold text-stone-900 mb-4">Edit profile information</h2>
              <div className="grid gap-4">
                <label className="block space-y-2 text-sm text-stone-700">
                  <span className="font-semibold uppercase tracking-[0.2em] text-stone-400 text-[10px]">Full name</span>
                  <Input value={form.full_name} onChange={(event) => handleFieldChange('full_name', event.target.value)} placeholder="Name" />
                </label>

                <label className="block space-y-2 text-sm text-stone-700">
                  <span className="font-semibold uppercase tracking-[0.2em] text-stone-400 text-[10px]">Phone</span>
                  <Input value={form.phone} onChange={(event) => handleFieldChange('phone', event.target.value)} placeholder="03XXXXXXXXX" />
                </label>

                <label className="block space-y-2 text-sm text-stone-700">
                  <span className="font-semibold uppercase tracking-[0.2em] text-stone-400 text-[10px]">Address</span>
                  <Input value={form.address} onChange={(event) => handleFieldChange('address', event.target.value)} placeholder="House, Street, City, Country" />
                </label>

                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="w-full bg-[#5D3A26] text-white rounded-2xl py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#4A2E1E] transition-colors disabled:opacity-50"
                >
                  {saving ? 'Saving...' : 'Save profile'}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4 mb-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-stone-400 font-bold">Orders</p>
                  <p className="text-2xl font-bold text-stone-900 mt-2">{orderCount}</p>
                </div>
                <div className="rounded-3xl bg-stone-50 p-3">
                  <Clock3 className="text-[#5D3A26]" size={24} />
                </div>
              </div>
              <p className="text-sm text-stone-500">Review your order history and find the delivery details for each purchase.</p>
            </div>

            <div className="rounded-[2.5rem] border border-stone-100 bg-white p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="rounded-3xl bg-stone-50 p-3">
                  <ListChecks className="text-[#5D3A26]" size={20} />
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.35em] text-stone-400 font-bold">Order history</p>
                  <h2 className="text-xl font-semibold text-stone-900 mt-2">Recent activity</h2>
                </div>
              </div>

              {loadingOrders ? (
                <div className="space-y-3">
                  {Array.from({ length: 3 }).map((_, idx) => (
                    <div key={idx} className="h-24 rounded-3xl bg-stone-50 animate-pulse" />
                  ))}
                </div>
              ) : orders.length === 0 ? (
                <p className="text-sm text-stone-500">No past orders found. Place an order to see it here.</p>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => {
                    // Format payment method: "cash_on_delivery" → "Cash On Delivery"
                    const formatPaymentMethod = (method?: string | null) => {
                      if (!method) return 'Cash On Delivery';
                      return method
                        .split('_')
                        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                        .join(' ');
                    };

                    return (
                      <div key={order.id} className="rounded-3xl border border-stone-100 bg-stone-50 p-5">
                        <div className="flex items-start justify-between gap-3 mb-4">
                          <div>
                            <p className="text-xs uppercase tracking-[0.35em] text-stone-400 font-bold">{new Date(order.created_at).toLocaleDateString()}</p>
                            <p className="mt-2 text-lg font-semibold text-stone-900">Rs. {order.total.toLocaleString()}</p>
                          </div>
                          <span className="rounded-full bg-[#E9F7EF] text-[#1F5D34] px-3 py-1 text-[11px] font-bold uppercase tracking-[0.2em]">{order.status}</span>
                        </div>

                        <div className="space-y-3 text-sm text-stone-600">
                          <p><span className="font-semibold text-stone-800">Payment</span>: {formatPaymentMethod(order.payment_method)}</p>
                          {order.address && (
                            <p><span className="font-semibold text-stone-800">Delivery Address</span>: {order.address}</p>
                          )}
                        </div>

                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-semibold text-stone-800">Items ordered</p>
                          <div className="grid gap-2">
                            {Array.isArray(order.items) ? order.items.map((item: any) => (
                              <div key={`${order.id}-${item.id}`} className="rounded-2xl bg-white p-3 border border-stone-100">
                                <div className="flex justify-between items-start gap-2">
                                  <p className="font-semibold text-stone-800">{item.name}</p>
                                  <span className="text-xs font-bold text-stone-500 bg-stone-100 rounded-full px-2 py-1">×{item.quantity}</span>
                                </div>
                                <p className="text-xs text-stone-500 mt-1">Rs. {item.price.toLocaleString()}</p>
                              </div>
                            )) : (
                              <p className="text-sm text-stone-500">Item details unavailable</p>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
