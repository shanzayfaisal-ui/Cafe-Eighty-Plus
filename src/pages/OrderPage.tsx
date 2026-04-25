import { Button } from '@/components/ui/button';
import { useCart } from '@/contexts/CartContext';
import { ShoppingBag, Package, Check } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { getImage } from '@/lib/imageMap';
import { Skeleton } from '@/components/ui/skeleton';

interface OrderItem {
  id: string;
  name: string;
  description: string;
  price: string;
  price_num: number;
  image_key: string;
  image_url?: string | null;
  category_id: string;
  category_name: string;
  display_order?: number;
  stock?: number;
}

interface OrderCategory {
  id: string;
  name: string;
}

const OrderPage = () => {
  const { addItem, items: cartItems, setIsCartOpen } = useCart();
  const [searchParams] = useSearchParams();
  const highlight = searchParams.get('highlight') || '';
  const highlightRef = useRef<HTMLDivElement>(null);
  const [filter, setFilter] = useState('All');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [categories, setCategories] = useState<OrderCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrderItems = async () => {
      try {
        // 1. Fetch all cartable categories
        const { data: catData } = await supabase
          .from('menu_categories')
          .select('id, name')
          .eq('cartable', true)
          .order('display_order');
        
        if (!catData || catData.length === 0) {
          setLoading(false);
          return;
        }

        // 2. Fetch menu items - Use 'as any' for table and data to bypass TS errors
        const { data, error: itemError } = await supabase
          .from('menu_items' as any)
          .select('id, name, description, price, price_num, image_key, image_url, category_id, display_order, stock')
          .in('category_id', catData.map(c => c.id))
          .order('display_order');
        
        if (itemError) throw itemError;

        // Cast to any[] to allow access to stock and display_order
        const itemData = data as any[];

        if (itemData) {
          const items = itemData.map(item => {
            const cat = catData.find(c => c.id === item.category_id);
            return {
              id: item.id,
              name: item.name,
              description: item.description,
              price: item.price,
              price_num: item.price_num,
              image_key: item.image_key || 'espresso',
              image_url: item.image_url,
              category_id: item.category_id,
              category_name: cat?.name || 'Other',
              display_order: item.display_order,
              stock: item.stock || 0,
            };
          });
          setOrderItems(items);
          setCategories(catData);
        }
      } catch (err) {
        console.error('Error fetching order items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderItems();
  }, []);

  useEffect(() => {
    if (highlight && highlightRef.current) {
      highlightRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [highlight, orderItems]);

  // Build category list for filter buttons
  const categoryOptions = ['All', ...categories.map(c => c.name)];

  // Filter items by selected category with proper sorting
  const filtered = [...orderItems] // Create a copy to avoid mutating state
    .filter(item => filter === 'All' || item.category_name === filter)
    .sort((a, b) => {
      if (filter === 'All') {
        // Coffee Beans category should come first (priority 1)
        if (a.category_name === 'Coffee Beans' && b.category_name !== 'Coffee Beans') return -1;
        if (a.category_name !== 'Coffee Beans' && b.category_name === 'Coffee Beans') return 1;
      }
      // Within same category or other categories, maintain display_order
      return (a.display_order || 0) - (b.display_order || 0);
    });

  const handleAdd = (item: OrderItem) => {
    if ((item.stock || 0) <= 0) return; // Don't add if out of stock
    addItem({ 
      id: item.id, 
      name: item.name, 
      price: item.price_num, 
      image: item.image_url || getImage(item.image_key), 
      category: item.category_name 
    });
    setAddedIds(prev => new Set(prev).add(item.id));
    setTimeout(() => {
      setAddedIds(prev => {
        const n = new Set(prev);
        n.delete(item.id);
        return n;
      });
    }, 1500);
  };

  return (
    <main className="section-padding">
      <div className="container-narrow mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">Delivery & Pickup</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold">Order Online</h1>
          <p className="text-muted-foreground mt-3">Add items to cart and order via WhatsApp</p>
        </div>

        <div className="flex flex-wrap gap-2 justify-center mb-10">
          {categoryOptions.map(cat => (
            <button
              key={cat}
              onClick={() => setFilter(cat)}
              className={`px-5 py-2 rounded-full text-sm font-medium transition-colors ${
                filter === cat ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-40 rounded-xl" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map(item => {
              const isHighlighted = highlight.toLowerCase() === item.name.toLowerCase();
              const outOfStock = (item.stock || 0) <= 0;
              
              return (
                <div 
                  key={item.id} 
                  ref={isHighlighted ? highlightRef : undefined} 
                  className={`warm-card p-5 flex gap-4 transition-all duration-300 ease-in-out group hover:shadow-[0_15px_35px_rgba(0,0,0,0.1)] hover:-translate-y-1.5 ${isHighlighted ? 'ring-2 ring-accent shadow-[0_15px_35px_rgba(0,0,0,0.1)] scale-[1.02]' : ''}`}
                >
                  <div className="w-24 h-24 rounded-xl overflow-hidden flex-shrink-0">
                    <img 
                      src={item.image_url || getImage(item.image_key)} 
                      alt={item.name} 
                      className={`w-full h-full object-cover transition-transform duration-500 ease-in-out group-hover:scale-110 ${outOfStock ? 'grayscale opacity-50' : ''}`} 
                    />
                  </div>
                  <div className="flex-1 flex flex-col">
                    <h3 className="font-serif font-semibold">{item.name}</h3>
                    <p className="text-accent font-semibold mt-1">Rs. {item.price_num.toLocaleString()}</p>
                    <div className="flex items-center gap-2 mt-auto pt-2">
                      <span className={`text-xs flex items-center gap-1 ${
                        !outOfStock ? 'text-green-600' : 'text-red-600'
                      }`}>
                        <Package size={12} /> 
                        {!outOfStock ? `In Stock (${item.stock})` : 'Out of Stock'}
                      </span>
                      <Button
                        size="sm"
                        onClick={() => handleAdd(item)}
                        disabled={outOfStock}
                        className={`ml-auto text-xs gap-1 transition-all duration-200 ${
                          outOfStock
                            ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                            : addedIds.has(item.id)
                            ? 'bg-accent/20 text-accent hover:bg-accent/20'
                            : 'bg-accent hover:bg-accent/90 text-accent-foreground shadow-sm'
                        }`}
                      >
                        {outOfStock ? 'Unavailable' : addedIds.has(item.id) ? <><Check size={14} /> Added</> : <><ShoppingBag size={14} /> Add</>}
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {cartItems.length > 0 && (
          <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fade-in">
            <Button onClick={() => setIsCartOpen(true)} className="bg-accent hover:bg-accent/90 text-accent-foreground px-8 py-6 rounded-full shadow-lg gap-2">
              <ShoppingBag size={20} /> View Cart ({cartItems.reduce((s, i) => s + i.quantity, 0)})
            </Button>
          </div>
        )}
      </div>
    </main>
  );
};

export default OrderPage;