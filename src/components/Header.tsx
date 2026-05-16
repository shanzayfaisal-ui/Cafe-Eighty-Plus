import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, Menu, X } from 'lucide-react'; 
import { useCart } from '@/contexts/CartContext';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import logoImg from '@/assets/logo.jpeg';

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
  
  // ☕ Added back an internal check to dynamically calculate the top offset position
  const [hasAnnouncement, setHasAnnouncement] = useState(false);

  const searchRef = useRef<HTMLDivElement>(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { totalItems, setIsCartOpen } = useCart();
  const { user } = useAuth();

  const isHome = location.pathname === '/';

  // Check if an active announcement is currently visible to calculate spacing
  useEffect(() => {
    const checkAnnouncement = async () => {
      const { data, error } = await supabase
        .from('announcements')
        .select('id')
        .eq('is_active', true)
        .limit(1)
        .maybeSingle();

      if (!error && data) {
        setHasAnnouncement(true);
      }
    };
    checkAnnouncement();
  }, []);

  // 1. Handle Scroll Effect
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 2. Search Logic
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

  // Logic for dynamic header coloring
  const headerBg = scrolled
    ? 'bg-background/95 backdrop-blur-md shadow-sm border-b border-border/40' 
    : isHome
    ? 'bg-transparent'
    : 'bg-background/95 backdrop-blur-md';

  const textColor = !scrolled && isHome ? 'text-white' : 'text-foreground';
  const iconHoverBg = !scrolled && isHome ? 'hover:bg-white/10' : 'hover:bg-accent/10';
  const buttonBorderColor = !scrolled && isHome 
    ? 'border-white/40 hover:border-white' 
    : 'border-border hover:border-foreground/40';

  return (
    <>
      {/* 🚀 RESTORED ORIGINAL: Keeps original 'fixed' placement, but safely shifts down 'top-[41px]' only when the banner is visible! */}
      <header 
        className={`fixed inset-x-0 transition-all duration-300 ease-in-out z-[9999] flex flex-col ${
          hasAnnouncement ? 'top-[41px]' : 'top-0'
        }`}
      >
        
        {/* MAIN NAVBAR */}
        <div className={`${headerBg} transition-all duration-300`}>
          <div className="container-narrow mx-auto px-5 sm:px-8 lg:px-10">
            <div className="flex items-center justify-between h-20 sm:h-24 transition-all duration-300">
              <div className="flex items-center gap-3">
                <Link to="/" className="flex items-center gap-3 group">
                  <img 
                    src={logoImg} 
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full object-cover border border-border/50 group-hover:scale-105 transition-transform" 
                    alt="Logo" 
                  />
                  <span className={`text-xl lg:text-2xl font-serif font-bold tracking-tight ${textColor}`}>
                    Eighty Plus
                  </span>
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
                      className={`px-4 py-2 text-[11px] font-bold uppercase tracking-wider transition-all relative group ${textColor} ${
                        isActive ? 'opacity-100' : 'opacity-60 hover:opacity-100'
                      }`}
                    >
                      {link.label}
                      {isActive && (
                        <span className="absolute bottom-1 left-4 right-4 h-0.5 bg-current rounded-full" />
                      )}
                    </Link>
                  );
                })}
              </nav>

              {/* Actions */}
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative" ref={searchRef}>
                  <button 
                    onClick={() => setShowSearch(!showSearch)} 
                    className={`p-2.5 rounded-full ${textColor} ${iconHoverBg} transition-colors`}
                    aria-label="Search"
                  >
                    <Search size={20} strokeWidth={2} />
                  </button>
                  
                  {showSearch && (
                    <div className="absolute right-0 top-full mt-4 w-72 sm:w-80 bg-card rounded-2xl shadow-2xl border border-border overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
                      <div className="p-3 bg-muted/30 border-b border-border flex items-center gap-2">
                        <input 
                          autoFocus
                          type="text" 
                          placeholder="Search our menu..."
                          className="w-full bg-transparent border-none outline-none text-sm text-foreground placeholder:text-muted-foreground"
                          value={query}
                          onChange={(e) => setQuery(e.target.value)}
                        />
                        {query && <X size={14} className="cursor-pointer opacity-50" onClick={() => setQuery("")} />}
                      </div>
                      {results.length > 0 && (
                        <div className="max-h-60 overflow-y-auto">
                          {results.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                navigate(`/menu?search=${encodeURIComponent(item.name)}`);
                                setShowSearch(false);
                              }}
                              className="w-full text-left px-4 py-3 text-sm text-muted-foreground hover:bg-muted hover:text-foreground border-b border-border/50 last:border-none transition-colors"
                            >
                              {item.name}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => setIsCartOpen(true)} 
                  className={`relative p-2.5 rounded-full ${textColor} ${iconHoverBg} transition-colors mr-1`}
                  aria-label="Shopping Cart"
                >
                  <ShoppingBag size={20} strokeWidth={2} />
                  {totalItems > 0 && (
                    <span className="absolute top-1 right-1 bg-primary text-primary-foreground text-[9px] w-5 h-5 rounded-full flex items-center justify-center font-bold border-2 border-background">
                      {totalItems}
                    </span>
                  )}
                </button>

                {/* Profile Button */}
                <Link
                  to={user ? '/profile' : '/login'}
                  className={`hidden sm:inline-flex items-center justify-center border ${buttonBorderColor} rounded-full px-5 py-2 text-[10px] font-bold uppercase tracking-[0.25em] ${textColor} transition-all duration-300`}
                >
                  {user ? 'Profile' : 'Login'}
                </Link>

                <button 
                  onClick={() => setMobileOpen(!mobileOpen)} 
                  className={`xl:hidden p-2.5 rounded-full ${textColor} ${iconHoverBg} transition-colors`}
                >
                  {mobileOpen ? <X size={22} /> : <Menu size={22} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="xl:hidden bg-background border-t border-border absolute top-full left-0 w-full shadow-2xl animate-in slide-in-from-top duration-300">
            <nav className="flex flex-col p-4 max-h-[80vh] overflow-y-auto">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={() => setMobileOpen(false)}
                  className={`py-4 px-6 rounded-xl font-bold uppercase text-[11px] tracking-widest transition-colors ${
                    location.pathname === link.to ? 'bg-muted text-primary' : 'text-muted-foreground hover:bg-muted/50'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="h-px bg-border my-2 mx-6" />
              <Link
                to={user ? '/profile' : '/login'}
                onClick={() => setMobileOpen(false)}
                className="py-4 px-6 rounded-xl font-bold uppercase text-[11px] tracking-widest text-muted-foreground hover:bg-muted/50 transition-colors"
              >
                {user ? 'Profile' : 'Login / Register'}
              </Link>
            </nav>
          </div>
        )}
      </header>
    </>
  );
};

export default Header;