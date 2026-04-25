import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ShoppingBag, Check, Ban } from 'lucide-react';
import { useCart } from '@/contexts/CartContext';
import { supabase } from '@/integrations/supabase/client';
import { getImage } from '@/lib/imageMap';
import { Skeleton } from '@/components/ui/skeleton';

interface MenuItem {
  id: string;
  category_id: string;
  name: string;
  description: string;
  price: string;
  price_num: number;
  image_key: string;
  image_url?: string | null;
  image_path?: string | null;
  display_order: number;
  size?: string;
  stock?: number;
}

interface MenuCategory {
  id: string;
  name: string;
  cartable: boolean;
  display_order: number;
  items: MenuItem[];
}

const MenuPage = () => {
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('highlight') || '';
  const highlightRef = useRef<HTMLDivElement>(null);
  const { addItem, setIsCartOpen, totalItems } = useCart();
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [categories, setCategories] = useState<MenuCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMenu = async () => {
      const [catRes, itemRes] = await Promise.all([
        supabase.from('menu_categories').select('*').order('display_order', { ascending: true }),
        supabase.from('menu_items').select('*').order('display_order', { ascending: true }),
      ]);

      if (catRes.data && itemRes.data) {
        const cats: MenuCategory[] = catRes.data.map((c: any) => ({
          ...c,
          items: itemRes.data
            .filter((i: any) => i.category_id === c.id)
            .map((i: any) => i as MenuItem),
        }));
        setCategories(cats);
      }
      setLoading(false);
    };
    fetchMenu();
  }, []);

  useEffect(() => {
    if (highlight && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlight, categories]);

  const getMenuItemImage = (item: MenuItem) =>
    item.image_url || getImage(item.image_key || 'espresso');

  const handleAdd = (item: MenuItem, categoryName: string) => {
    // PREVENT ADDING IF: It's a retail category AND stock is 0
    const isRetailCategory = ["Coffee Beans", "Merchandise"].includes(categoryName);
    if (isRetailCategory && item.stock !== undefined && item.stock <= 0) return;

    const uniqueId = `menu-${item.id}`;
    addItem({
      id: uniqueId,
      name: item.name,
      price: item.price_num,
      image: getMenuItemImage(item),
      category: categoryName,
    });

    setAddedIds(prev => new Set(prev).add(uniqueId));
    setTimeout(() => {
      setAddedIds(prev => {
        const n = new Set(prev);
        n.delete(uniqueId);
        return n;
      });
    }, 1500);
  };

  return (
    <main className="section-padding bg-gradient-to-b from-[#f8f5f2] via-[#f1ebe5] to-[#eae3db] min-h-screen">
      <div className="container-narrow mx-auto">

        <div className="text-center mb-16 animate-fade-in">
          <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-3">What We Serve</p>
          <h1 className="text-5xl font-serif font-bold tracking-tight mb-4 text-[#2D1B14]">Our Menu</h1>
          <p className="text-muted-foreground max-w-md mx-auto leading-relaxed">
            Crafted with passion, served with love. Every cup is a masterpiece.
          </p>
          <p className="text-[10px] uppercase tracking-widest text-stone-400 mt-4">All prices exclusive of taxes</p>
        </div>

        {loading ? (
          Array.from({ length: 2 }).map((_, i) => (
            <section key={i} className="mb-16">
              <Skeleton className="h-8 w-48 mb-8 bg-stone-200" />
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {Array.from({ length: 4 }).map((_, j) => (
                  <Skeleton key={j} className="h-32 rounded-2xl bg-stone-200" />
                ))}
              </div>
            </section>
          ))
        ) : (
          categories.map((cat) => (
            <section key={cat.id} className="mb-20">
              <h2 className="text-2xl font-serif font-semibold mb-8 tracking-tight text-[#2D1B14] border-l-4 border-accent pl-4">
                {cat.name}
              </h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {cat.items.map((item) => {
                  const isHighlighted = highlight.toLowerCase() === item.name.toLowerCase();
                  const itemId = `menu-${item.id}`;
                  
                  // --- NEW LOGIC ---
                  // Only apply stock check if the category name matches retail items
                  const isRetailCategory = ["Coffee Beans", "Merchandise"].includes(cat.name);
                  const isOutOfStock = isRetailCategory && item.stock !== undefined && item.stock <= 0;

                  return (
                    <div
                      key={item.id}
                      ref={isHighlighted ? highlightRef : undefined}
                      className={`flex gap-4 p-4 rounded-2xl bg-white/70 backdrop-blur-md border border-white shadow-sm transition-all duration-300 ${
                        isHighlighted ? 'ring-2 ring-accent shadow-2xl bg-white' : ''
                      } ${
                        isOutOfStock 
                        ? 'opacity-60 grayscale-[0.5]' 
                        : 'hover:shadow-xl hover:-translate-y-1'
                      }`}
                    >
                      <div className="w-20 h-20 rounded-xl overflow-hidden flex-shrink-0 shadow-inner bg-stone-100 relative">
                        <img
                          src={getMenuItemImage(item)}
                          alt={item.name}
                          className={`w-full h-full object-cover transition-transform duration-500 ${!isOutOfStock && 'hover:scale-110'}`}
                        />
                        {isOutOfStock && (
                          <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                             <Ban className="text-white/80" size={20} />
                          </div>
                        )}
                      </div>

                      <div className="min-w-0 flex flex-col flex-1">
                        <div className="flex justify-between items-start">
                          <h3 className={`font-serif font-bold text-sm leading-tight ${isOutOfStock ? 'text-stone-500' : 'text-[#2D1B14]'}`}>
                            {item.name}
                          </h3>
                        </div>

                        <p className="text-[11px] text-stone-500 mt-1 line-clamp-2 leading-relaxed">
                          {item.description}
                        </p>

                        <div className="flex items-center justify-between mt-auto pt-3">
                          <span className={`text-xs font-bold ${isOutOfStock ? 'text-stone-400' : 'text-accent'}`}>
                            {item.price || `Rs. ${item.price_num}`}
                          </span>

                          {cat.cartable && (
                            <button
                              disabled={isOutOfStock}
                              onClick={() => handleAdd(item, cat.name)}
                              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all duration-200 ${
                                isOutOfStock
                                  ? 'bg-stone-200 text-stone-400 cursor-not-allowed'
                                  : addedIds.has(itemId)
                                    ? 'bg-green-100 text-green-700'
                                    : 'bg-[#2D1B14] text-white hover:bg-accent'
                              }`}
                            >
                              {isOutOfStock ? (
                                "Out of Stock"
                              ) : addedIds.has(itemId) ? (
                                <>
                                  <Check size={10} strokeWidth={3} /> Added
                                </>
                              ) : (
                                <>
                                  <ShoppingBag size={10} strokeWidth={3} /> Add
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          ))
        )}

        {totalItems > 0 && (
          <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-bounce-subtle">
            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-3 bg-[#2D1B14] text-white px-10 py-4 rounded-full shadow-2xl font-bold tracking-widest uppercase text-xs hover:bg-accent transition-all hover:scale-105"
            >
              <ShoppingBag size={18} /> View Cart ({totalItems})
            </button>
          </div>
        )}
      </div>
    </main>
  );
};

export default MenuPage;