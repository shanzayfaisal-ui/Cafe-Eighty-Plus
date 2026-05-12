import { useEffect, useMemo, useState } from 'react';
import { NavLink as RouterNavLink, useNavigate, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package,        
  Settings, 
  LogOut, 
  ShoppingBag,    
  ListTree,
  Megaphone,
  Star,
  Coffee,
  Image,
  MessageSquare,
  BookOpen // Added for the Coffee Guide icon
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AdminLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
}

const AdminLayout = ({ title, description, children }: AdminLayoutProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const [adminEmail, setAdminEmail] = useState('Admin');
  const [loggingOut, setLoggingOut] = useState(false);
  const [pendingOrdersCount, setPendingOrdersCount] = useState(0);

  // --- REAL-TIME PENDING ORDERS COUNT ---
  useEffect(() => {
    const fetchCount = async () => {
      const { count, error } = await supabase
        .from('orders')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'Pending');
      
      if (!error) setPendingOrdersCount(count || 0);
    };

    fetchCount();

    const channel = supabase
      .channel('admin-sidebar-counts')
      .on('postgres_changes' as any, 
        { event: '*', table: 'orders' }, 
        () => { fetchCount(); }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const navItems = useMemo(() => [
    { label: 'Dashboard', to: '/admin', icon: LayoutDashboard },
    { label: 'Orders', to: '/admin/orders', icon: Coffee, badge: pendingOrdersCount }, 
    { label: 'Menu Items', to: '/admin/products', icon: ShoppingBag }, 
    { label: 'Stock Levels', to: '/admin/stock', icon: Package },     
    { label: 'Categories', to: '/admin/categories', icon: ListTree },
    { label: 'Gallery', to: '/admin/gallery', icon: Image },
    { label: 'Messages', to: '/admin/messages', icon: MessageSquare },
    { label: 'Announcements', to: '/admin/announcements', icon: Megaphone },
    { label: 'Reviews', to: '/admin/reviews', icon: Star },
    { label: 'Coffee Guide', to: '/admin/coffee-guide', icon: BookOpen }, 
    { label: 'Settings', to: '/admin/settings', icon: Settings },
  ], [pendingOrdersCount]);

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      localStorage.removeItem('isAdmin');
      navigate('/admin/login');
    } catch (error) {
      toast({ title: 'Logout failed', variant: 'destructive' });
    } finally {
      setLoggingOut(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex font-sans antialiased text-[#2D1B14]">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-[#2D1B14] text-white flex flex-col fixed h-full z-20 shadow-2xl">
        <div className="p-8">
          <h2 className="text-2xl font-serif font-bold text-[#EAD8C0] tracking-tight">
            Cafe Eighty <span className="text-white">Plus</span>
          </h2>
          <p className="text-[9px] text-stone-400 uppercase tracking-[0.3em] mt-1 font-bold">
            Administrator
          </p>
        </div>
        
        <nav className="flex-1 px-4 mt-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.to === '/admin' 
              ? location.pathname === '/admin' 
              : location.pathname.startsWith(item.to);

            return (
              <RouterNavLink
                key={item.label}
                to={item.to}
                className={cn(
                  "flex items-center justify-between px-4 py-3 rounded-xl text-sm transition-all duration-300 group",
                  isActive 
                    ? "bg-[#5D3A26] text-[#EAD8C0] shadow-lg shadow-black/20" 
                    : "text-stone-400 hover:text-white hover:bg-white/5"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon 
                    size={18} 
                    className={cn(
                      "transition-colors duration-300",
                      isActive ? "text-[#EAD8C0]" : "text-stone-500 group-hover:text-stone-300"
                    )} 
                  />
                  <span className={cn(
                    "transition-all",
                    isActive ? "font-semibold tracking-wide" : "font-medium"
                  )}>
                    {item.label}
                  </span>
                </div>

                {item.badge !== undefined && item.badge > 0 && (
                  <span className="flex items-center justify-center min-w-[20px] h-[20px] px-1.5 rounded-full bg-amber-500 text-[#2D1B14] text-[10px] font-black shadow-sm animate-in zoom-in duration-300">
                    {item.badge}
                  </span>
                )}
              </RouterNavLink>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/5">
          <button 
            onClick={handleLogout}
            disabled={loggingOut}
            className="flex items-center gap-3 w-full px-4 py-3 text-sm text-stone-400 hover:text-[#EAD8C0] hover:bg-white/5 rounded-xl transition-all group"
          >
            <LogOut size={18} className="group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium">{loggingOut ? "Logging out..." : "Sign Out"}</span>
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT AREA */}
      <div className="ml-64 flex-1 flex flex-col min-h-screen bg-[#FDFCFB]">
        <header className="px-10 py-8 flex justify-between items-center bg-[#FDFCFB]/80 backdrop-blur-md sticky top-0 z-10">
          <div>
            <h1 className="text-3xl font-bold text-[#2D1B14] tracking-tight">{title}</h1>
            {description && (
              <p className="text-sm text-stone-400 mt-1 font-medium">{description}</p>
            )}
          </div>
          
          <div className="flex items-center gap-4 bg-[#F5F1EE] px-4 py-2 rounded-2xl border border-[#EAE3DB] shadow-sm">
            <div className="flex flex-col text-right">
               <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Logged in as</span>
               <span className="text-sm font-bold text-[#5D3A26]">{adminEmail.split('@')[0]}</span>
            </div>
            <div className="w-10 h-10 rounded-xl bg-[#5D3A26] flex items-center justify-center text-[#EAD8C0] font-bold shadow-inner">
              {adminEmail.charAt(0).toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <main className="px-10 pb-10 flex-1">
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;