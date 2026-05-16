import { useEffect, useMemo, useState } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { 
  ShoppingBag, 
  Clock, 
  TrendingUp, 
  Star, 
  RefreshCcw,
  X,
  Phone,
  MapPin,
  Package
} from "lucide-react";
import AdminLayout from "@/components/admin/AdminLayout";
import { ChartContainer, ChartTooltipContent, ChartLegendContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";

interface Order {
  id: string;
  created_at: string;
  name: string;
  phone: string;
  items: any;
  items_summary?: string; // Added for the view modal
  address?: string; // Added for the view modal
  total: number;
  status: string; 
}

interface DailyMetric {
  date: string;
  label: string;
  orders: number;
  revenue: number;
}

const AdminDashboardPage = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null); // State for the View Modal
  const [stats, setStats] = useState({
    todayOrders: 0,
    pendingOrders: 0,
    monthlyRevenue: 0,
    totalOrders: 0
  });
  const [loading, setLoading] = useState(true);
  const [chartPeriod, setChartPeriod] = useState<'7d' | '30d' | 'all'>('7d');

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      if (data) {
        const ordersData = data as unknown as Order[];
        const today = new Date().toISOString().split('T')[0];
        
        const todayCount = ordersData.filter(o => o.created_at?.startsWith(today)).length;
        const pendingCount = ordersData.filter(o => o.status === 'Pending' || o.status === 'Confirmed').length;
        const totalRev = ordersData.reduce((acc, o) => acc + (Number(o.total) || 0), 0);

        setOrders(ordersData);
        setStats({
          todayOrders: todayCount,
          pendingOrders: pendingCount,
          monthlyRevenue: totalRev,
          totalOrders: ordersData.length
        });
      }
    } catch (err) {
      toast.error("Failed to sync dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const chartMetrics = useMemo<DailyMetric[]>(() => {
    const today = new Date();

    if (chartPeriod === 'all') {
      const monthMap = new Map<string, DailyMetric>();

      orders.forEach((order) => {
        const date = order.created_at?.split('T')[0];
        if (!date) return;
        const [year, month] = date.split('-');
        const monthKey = `${year}-${month}`;
        const label = new Date(Number(year), Number(month) - 1).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

        if (!monthMap.has(monthKey)) {
          monthMap.set(monthKey, { date: monthKey, label, orders: 0, revenue: 0 });
        }

        const entry = monthMap.get(monthKey);
        if (entry) {
          entry.orders += 1;
          entry.revenue += Number(order.total) || 0;
        }
      });

      return Array.from(monthMap.values()).sort((a, b) => a.date.localeCompare(b.date));
    }

    const days = chartPeriod === '7d' ? 7 : 30;
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - (days - 1));

    const range = Array.from({ length: days }).map((_, index) => {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + index);
      const dateKey = date.toISOString().split('T')[0];
      const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      return { date: dateKey, label, orders: 0, revenue: 0 };
    });

    const metricMap = new Map(range.map((item) => [item.date, item]));

    orders.forEach((order) => {
      const orderDate = order.created_at?.split('T')[0];
      if (!orderDate) return;
      const entry = metricMap.get(orderDate);
      if (entry) {
        entry.orders += 1;
        entry.revenue += Number(order.total) || 0;
      }
    });

    return range;
  }, [orders, chartPeriod]);

  const getStatusStyles = (status: string) => {
    switch (status) {
      case "Pending": return "bg-amber-100 text-amber-700";
      case "Confirmed": return "bg-blue-100 text-blue-700";
      case "Completed": return "bg-emerald-100 text-emerald-700";
      case "Cancelled": return "bg-rose-100 text-rose-700";
      default: return "bg-stone-100 text-stone-600";
    }
  };

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <p className="text-sm text-stone-500 font-medium">Today's Orders</p>
              <div className="p-2 bg-orange-50 rounded-lg text-orange-400"><ShoppingBag size={20} /></div>
            </div>
            <p className="text-4xl font-bold text-stone-800">{stats.todayOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <p className="text-sm text-stone-500 font-medium">Pending / Confirmed</p>
              <div className="p-2 bg-amber-50 rounded-lg text-amber-400"><Clock size={20} /></div>
            </div>
            <p className="text-4xl font-bold text-stone-800">{stats.pendingOrders}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <p className="text-sm text-stone-500 font-medium">Revenue</p>
              <div className="p-2 bg-emerald-50 rounded-lg text-emerald-400"><TrendingUp size={20} /></div>
            </div>
            <p className="text-3xl font-bold text-stone-800">Rs. {stats.monthlyRevenue.toLocaleString()}</p>
          </div>
          <div className="bg-white p-6 rounded-[2rem] border border-stone-100 shadow-sm flex flex-col justify-between h-40">
            <div className="flex justify-between items-start">
              <p className="text-sm text-stone-500 font-medium">Total Orders</p>
              <div className="p-2 bg-purple-50 rounded-lg text-purple-400"><Star size={20} /></div>
            </div>
            <p className="text-4xl font-bold text-stone-800">{stats.totalOrders}</p>
          </div>
        </div>

        {/* Analytics Chart */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between mb-6">
            <div>
              <h3 className="text-xl font-bold text-stone-800">Sales Analytics</h3>
              <p className="text-sm text-stone-500">Orders and revenue over the selected reporting period.</p>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center sm:gap-3 gap-2 text-right">
              <div className="rounded-full bg-stone-50 border border-stone-200 overflow-hidden inline-flex">
                {(['7d', '30d', 'all'] as const).map((period) => (
                  <button
                    key={period}
                    type="button"
                    onClick={() => setChartPeriod(period)}
                    className={cn(
                      'px-4 py-2 text-xs font-semibold transition',
                      chartPeriod === period ? 'bg-stone-900 text-white' : 'text-stone-500 hover:bg-stone-100'
                    )}
                  >
                    {period === '7d' ? '7 Days' : period === '30d' ? '30 Days' : 'All'}
                  </button>
                ))}
              </div>
              <div>
                <p className="text-[11px] uppercase tracking-[0.3em] text-stone-400 mb-1">Current period</p>
                <p className="text-2xl font-bold text-stone-800">
                  {chartMetrics.reduce((sum, day) => sum + day.orders, 0)} orders
                </p>
                <p className="text-sm text-stone-500">Rs. {chartMetrics.reduce((sum, day) => sum + day.revenue, 0).toLocaleString()}</p>
              </div>
            </div>
          </div>

          <ChartContainer className="h-[320px]" config={{ orders: { label: 'Orders', color: '#D97706' }, revenue: { label: 'Revenue', color: '#10B981' } }}>
            <LineChart data={chartMetrics} margin={{ top: 6, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" vertical={false} />
              <XAxis dataKey="label" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="left" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="right" orientation="right" tick={{ fill: '#71717A', fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip content={<ChartTooltipContent />} />
              <Legend content={<ChartLegendContent />} />
              <Line type="monotone" dataKey="orders" name="Orders" yAxisId="left" stroke="#D97706" strokeWidth={3} dot={{ r: 4, fill: '#D97706' }} activeDot={{ r: 6 }} />
              <Line type="monotone" dataKey="revenue" name="Revenue" yAxisId="right" stroke="#10B981" strokeWidth={3} dot={{ r: 4, fill: '#10B981' }} activeDot={{ r: 6 }} />
            </LineChart>
          </ChartContainer>
        </div>

        {/* Recent Activity Table */}
        <div className="bg-white rounded-[2rem] border border-stone-100 shadow-sm overflow-hidden">
          <div className="p-8 flex justify-between items-center border-b border-stone-50">
            <h3 className="text-xl font-bold text-stone-800">Recent Activity</h3>
            <button 
              onClick={fetchDashboardData} 
              disabled={loading}
              className={cn(
                "flex items-center gap-2 text-xs font-bold text-[#5D3A26] uppercase tracking-widest transition-opacity",
                loading && "opacity-50 cursor-not-allowed"
              )}
            >
              <RefreshCcw size={14} className={cn(loading && "animate-spin")} /> 
              {loading ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-stone-400 uppercase tracking-widest bg-stone-50/50">
                  <th className="px-8 py-4">Order #</th>
                  <th className="px-8 py-4">Customer</th>
                  <th className="px-8 py-4">Total</th>
                  <th className="px-8 py-4">Status</th>
                  <th className="px-8 py-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-50">
                {orders.map((order) => (
                  <tr key={order.id} className="hover:bg-stone-50/30 transition-colors">
                    <td className="px-8 py-5 text-sm font-medium text-stone-500 uppercase tracking-tighter">CE-{order.id.slice(0, 6)}</td>
                    <td className="px-8 py-5 text-sm font-bold text-stone-800">{order.name}</td>
                    <td className="px-8 py-5 text-sm font-bold text-stone-800">Rs. {order.total}</td>
                    <td className="px-8 py-5">
                      <span className={cn("text-[10px] font-bold px-3 py-1 rounded-full uppercase", getStatusStyles(order.status))}>
                        {order.status}
                      </span>
                    </td>
                    <td className="px-8 py-5 text-right">
                      <button 
                        onClick={() => setSelectedOrder(order)}
                        className="text-xs font-bold text-[#5D3A26] hover:underline"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* --- VIEW ORDER MODAL --- */}
      {selectedOrder && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white w-full max-w-lg rounded-[2.5rem] shadow-2xl p-8 relative animate-in zoom-in-95 duration-300">
            <button 
              onClick={() => setSelectedOrder(null)} 
              className="absolute top-6 right-6 p-2 hover:bg-stone-100 rounded-full text-stone-400"
            >
              <X size={20} />
            </button>
            
            <h3 className="text-2xl font-serif font-bold text-[#2D1B14] mb-6">Order Details</h3>
            
            <div className="space-y-6 mb-8">
               <div className="flex items-center gap-4 text-stone-600">
                 <Phone size={18} className="text-[#5D3A26]" /> 
                 <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Phone</p>
                    <p className="text-sm font-bold">{selectedOrder.phone}</p>
                 </div>
               </div>
               
               <div className="flex items-start gap-4 text-stone-600">
                 <MapPin size={18} className="text-[#5D3A26] mt-1" /> 
                 <div>
                    <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Address</p>
                    <p className="text-sm font-medium leading-relaxed">{selectedOrder.address || "No address provided"}</p>
                 </div>
               </div>

               <div className="bg-[#FDFCFB] p-6 rounded-3xl border border-stone-100">
                 <div className="flex items-center gap-2 mb-3 text-[10px] font-black uppercase text-stone-400 tracking-widest">
                   <Package size={14} /> Items Summary
                 </div>
                 <p className="text-sm font-medium text-[#2D1B14] leading-relaxed whitespace-pre-wrap">
                   {selectedOrder.items_summary || "No items listed."}
                 </p>
               </div>
            </div>

            <button 
              onClick={() => setSelectedOrder(null)} 
              className="w-full bg-[#2D1B14] text-[#EAD8C0] py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:opacity-90 transition-opacity"
            >
              Close Details
            </button>
          </div>
        </div>
      )}
    </AdminLayout>
  );
};

export default AdminDashboardPage;