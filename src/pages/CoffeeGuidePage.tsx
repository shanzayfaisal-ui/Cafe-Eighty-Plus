import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';

interface CoffeeLayer {
  label: string;
  pct: number;
  color: string;
}

interface CoffeeGuide {
  id: string;
  name: string;
  description: string;
  ratio: string;
  milk: string;
  strength: string;
  image_key: string;
  layers: CoffeeLayer[];
  display_order: number;
}

const CoffeeGuidePage = () => {
  const [coffees, setCoffees] = useState<CoffeeGuide[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoffees = async () => {
      const { data } = await supabase
        .from('coffee_guide')
        .select('*')
        .order('display_order', { ascending: true });

      if (data) {
        setCoffees(
          data.map(item => ({
            ...item,
            layers: (item.layers as unknown as CoffeeLayer[]) || [],
          }))
        );
      }
      setLoading(false);
    };
    fetchCoffees();
  }, []);

  const getImageUrl = (imageKey: string) => {
    if (!imageKey) return '/placeholder.svg';
    const { data } = supabase.storage.from('coffee-guides').getPublicUrl(imageKey);
    return data.publicUrl;
  };

  const getContrastColor = (hexcolor: string) => {
    if (!hexcolor) return '#ffffff';
    const hex = hexcolor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    const yiq = (r * 299 + g * 587 + b * 114) / 1000;
    return yiq >= 128 ? '#2D1B14' : '#ffffff';
  };

  return (
    <main className="section-padding bg-gradient-to-b from-background to-secondary/30">
      <div className="container-narrow mx-auto">

        {/* HEADER */}
        <div className="text-center mb-20 animate-fade-in">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-3">
            Learn & Explore
          </p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold mb-4">
            Coffee Guide
          </h1>
          <p className="text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Discover the art behind every cup. Learn the differences between your favorite coffee drinks.
          </p>
        </div>

        {/* LIST */}
        <div className="space-y-14">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="warm-card p-6 sm:p-8 flex flex-col md:flex-row gap-8 items-center">
                <Skeleton className="w-full md:w-64 h-64 rounded-2xl flex-shrink-0" />
                <div className="flex-1 space-y-3 w-full">
                  <Skeleton className="h-8 w-48" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-6 w-full" />
                </div>
              </div>
            ))
          ) : (
            coffees.map((coffee, idx) => (
              <div
                key={coffee.id}
                className={`warm-card p-6 sm:p-10 flex flex-col ${
                  idx % 2 === 0 ? 'md:flex-row' : 'md:flex-row-reverse'
                } gap-10 items-center transition-all duration-300 hover:shadow-xl hover:-translate-y-1`}
              >

                {/* IMAGE */}
                <img
                  src={getImageUrl(coffee.image_key)}
                  alt={coffee.name}
                  className="w-full md:w-64 h-64 rounded-2xl object-cover flex-shrink-0 shadow-md"
                />

                {/* CONTENT */}
                <div className="flex-1 w-full">
                  <h2 className="text-2xl font-serif font-bold mb-3 tracking-tight">
                    {coffee.name}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed mb-5">
                    {coffee.description}
                  </p>

                  {/* INFO GRID */}
                  <div className="grid grid-cols-2 gap-4 text-sm mb-6">
                    <div>
                      <span className="text-muted-foreground">Ratio:</span>{' '}
                      <span className="font-medium">{coffee.ratio}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Milk:</span>{' '}
                      <span className="font-medium">{coffee.milk}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Strength:</span>{' '}
                      <span className="font-medium">{coffee.strength}</span>
                    </div>
                  </div>

                  {/* 🔥 DYNAMIC LUXURY COFFEE BAR */}
                  <div className="w-full h-8 bg-secondary/50 rounded-full overflow-hidden flex shadow-inner border border-stone-100">
                    {coffee.layers.map((layer, i) => {
                      const textColor = getContrastColor(layer.color);
                      return (
                        <div
                          key={i}
                          className="flex items-center justify-center text-[10px] font-bold transition-all duration-500"
                          style={{
                            width: `${layer.pct}%`,
                            backgroundColor: layer.color, // Fixed: Only use the DB color
                            color: textColor,
                            textShadow: textColor === '#ffffff' ? '0px 1px 2px rgba(0,0,0,0.3)' : 'none'
                          }}
                        >
                          {/* UPDATED: Threshold lowered to 8% so "Honey" shows up on thin layers */}
                          {layer.pct > 8 && (
                            <span className="truncate px-1 uppercase tracking-tighter">
                              {layer.label}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
};

export default CoffeeGuidePage;