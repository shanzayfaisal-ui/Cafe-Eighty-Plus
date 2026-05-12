import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X, Megaphone, ChevronRight } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import logoImg from '@/assets/logo.jpeg';

// Interface matching your Admin Announcement schema
interface Announcement {
  id: string;
  title: string;
  content: string;
  type: string;
}

const navLinks = [
  { to: '/', label: 'Home' },
  { to: '/our-story', label: 'Our Story' },
  { to: '/menu', label: 'Menu' },
  { to: '/order', label: 'Order' },
  { to: '/coffee-guide', label: 'Coffee Guide' },
  { to: '/gallery', label: 'Gallery' },
  { to: '/feedback', label: 'Feedback' },
  { to: '/about', label: 'About Us' },
  { to: '/contact', label: 'Contact' },
];

const Header = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{ name: string }[]>([]);
  
  // Announcement States
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const isHome = location.pathname === '/';

  // 1. Fetch live announcement from Admin database
  useEffect(() => {
    const fetchAnnouncement = async () => {
      const { data, error } = await supabase
        .from('announcements' as any)
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!error && data) {
        setAnnouncement(data as unknown as Announcement);
      }
    };
    fetchAnnouncement();
  }, []);

  // 2. Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 3. Search Logic & Click Outside
  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults([]);
        return;
      }
      const { data, error } = await supabase
        .from('menu_items')
        .select('name')
        .ilike('name', `%${query}%`)
        .limit(6);

      if (!error && data) setResults(data);
    };
    const timer = setTimeout(fetchResults, 300);
    return () => clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const headerBg = scrolled
    ? 'bg-[#FDFBF9] shadow-lg border-b border-stone-200' 
    : isHome
    ? 'bg-transparent'
    : 'bg-[#FDFBF9]/95 backdrop-blur-md';

  const textColor = !scrolled && isHome ? 'text-white' : 'text-[#5D3A26]';

  return (
    <>
      <header className={`fixed top-0 inset-x-0 transition-all duration-300 ease-in-out z-[9999] flex flex-col`}>
        
        {/* ANNOUNCEMENT BAR */}
        {announcement && (
          <div className="bg-[#5D3A26] text-white py-2 px-4 z-[10000] border-b border-white/10">
            <div className="container mx-auto flex justify-center items-center gap-3 text-[10px] sm:text-[11px] font-bold uppercase tracking-widest">
              <div className="flex items-center gap-2">
                <Megaphone size={12} className={announcement.type === 'urgent' ? "text-rose-400 animate-pulse" : "text-stone-300"} />
                <span className="truncate max-w-[180px] sm:max-w-none">{announcement.title}</span>
              </div>
              <button 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  setShowDetailsModal(true);
                }}
                className="shrink-0 px-2.5 py-1 bg-white/10 hover:bg-white/20 border border-white/20 rounded-md text-[9px] transition-all flex items-center gap-1"
              >
                DETAILS <ChevronRight size={10} />
              </button>
            </div>
          </div>
        )}

        {/* MAIN NAVBAR */}
        <div className={`${headerBg} transition-all duration-300`}>
          <div className="container mx-auto px-5 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-3 group">
                  <img src={logoImg} className="w-10 h-10 rounded-full object-cover border border-stone-200 group-hover:scale-105 transition-transform" alt="Logo" />
                  <span className={`text-xl lg:text-2xl font-serif font-bold tracking-tight ${textColor}`}>Eighty Plus</span>
                </Link>
              </div>

              {/* Desktop Nav */}
              <nav className="hidden xl:flex items-center gap-1">
                {navLinks.map(link => {
                  const isActive = location.pathname === link.to;
                  return (
                    <Link
                      key={link.to}
                      to={link.to}
                      className={`px-3 py-2 text-[11px] font-bold uppercase tracking-wider transition-all relative group ${textColor} ${
                        isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-1 left-3 right-3 h-0.5 bg-current rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-1 sm:gap-3">
                <div className="relative" ref={searchRef}>
                  <button 
                    onClick={() => setShowSearch(!showSearch)} 
                    className={`p-2.5 rounded-full ${textColor} hover:bg-stone-500/10 transition-colors`}
                  >
                    <Search size={20} />
                  </button>
                  
                  {showSearch && (
                    <div className="absolute right-0 top-full mt-4 w-72 sm:w-80 bg-white rounded-2xl shadow-2xl border border-stone-100 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3 bg-stone-50 border-b border-stone-100">
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Search our menu..."
                          className="w-full bg-transparent border-none outline-none text-sm text-stone-800 placeholder:text-stone-400"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                      </div>
                      {results.length > 0 && (
                        <div className="max-h-60 overflow-y-auto">
                          {results.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                navigate(`/menu?search=${item.name}`);
                                setShowSearch(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-stone-600 hover:bg-stone-50 border-b border-stone-50 last:border-none transition-colors"
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button onClick={() => setIsCartOpen(true)} className={`relative p-2.5 rounded-full ${textColor} hover:bg-stone-500/10 transition-colors`}>
                  <ShoppingBag size={20} />
                  {totalItems > 0 && (
                    <span className="absolute top-1.5 right-1.5 bg-[#5D3A26] text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold border-2 border-white">
                      {totalItems}
                    </span>
                  )}
                </button>

                <Link
                  to={user ? '/profile' : '/login'}
                  className={`hidden sm:inline-flex items-center rounded-full border border-stone-200 px-4 py-2 text-[11px] font-bold uppercase tracking-widest transition-colors ${textColor} hover:bg-stone-100`}
                >
                  {user ? 'Profile' : 'Login'}
                </Link>

                <button onClick={() => setMobileOpen(!mobileOpen)} className={`xl:hidden p-2.5 rounded-full ${textColor} hover:bg-stone-500/10 transition-colors`}>
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="xl:hidden bg-white border-t border-stone-100 absolute top-full left-0 w-full shadow-2xl animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col p-4">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`py-4 px-6 rounded-xl font-bold uppercase text-xs tracking-widest transition-colors ${
                    location.pathname === link.to ? 'bg-stone-50 text-[#5D3A26]' : 'text-stone-500 hover:bg-stone-50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <Link
                to={user ? '/profile' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="mt-2 py-4 px-6 rounded-xl font-bold uppercase text-xs tracking-widest text-stone-500 hover:bg-stone-50"
              >
                {user ? 'Profile' : 'Login'}
              </Link>
            </nav>
          </div>
        )}
      </header>

      {/* ANNOUNCEMENT DETAILS MODAL */}
      {showDetailsModal && announcement && (
        <div className="fixed inset-0 z-[10001] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md transition-all">
          <div 
            className="bg-white rounded-[2.5rem] p-8 sm:p-10 max-w-lg w-full shadow-2xl animate-in fade-in zoom-in duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-start mb-6">
              <div className="bg-stone-100 p-4 rounded-3xl text-[#5D3A26]">
                <Megaphone size={28} />
              </div>
              <button 
                onClick={() => setShowDetailsModal(false)} 
                className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-stone-600"
              >
                <X size={24} />
              </button>
            </div>
            <h2 className="text-3xl font-serif font-bold text-[#2D1B14] mb-4 leading-tight">{announcement.title}</h2>
            <div className="h-px bg-stone-100 w-full mb-6" />
            <p className="text-stone-600 leading-relaxed mb-8 whitespace-pre-wrap text-lg">
              {announcement.content}
            </p>
            <button 
              onClick={() => setShowDetailsModal(false)}
              className="w-full py-4 bg-[#5D3A26] text-white rounded-2xl font-bold hover:bg-[#4A2E1E] transition-all shadow-lg shadow-stone-200 active:scale-[0.98]"
            >
              Got it, thanks!
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;