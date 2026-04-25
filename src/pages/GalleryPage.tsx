import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getImage } from '@/lib/imageMap';
import { Skeleton } from '@/components/ui/skeleton';

interface GalleryItem {
  id: string;
  alt?: string;
  title?: string | null;
  image_key?: string | null;
  image_url?: string | null;
  span?: string;
  display_order: number;
}

const GalleryPage = () => {
  const [images, setImages] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await supabase.from('gallery').select('*').order('display_order');
      if (data) setImages(data as GalleryItem[]);
      setLoading(false);
    };
    fetch();
  }, []);

  return (
    <main className="section-padding">
      <div className="container-narrow mx-auto">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">Our Vibes</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold">Gallery</h1>
          <p className="text-muted-foreground mt-3">A peek into the world of Eighty Plus</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px] sm:auto-rows-[250px]">
          {loading
            ? Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className={`rounded-2xl ${i % 4 === 0 ? 'row-span-2' : ''}`} />
            ))
            : images.map((img) => (
              <div key={img.id} className={`${img.span} rounded-2xl overflow-hidden group`}>
                <img
                  src={img.image_url || getImage(img.image_key || 'gallery-1')}
                  alt={img.alt || img.title || 'Gallery image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  loading="lazy"
                />
              </div>
            ))}
        </div>
      </div>
    </main>
  );
};

export default GalleryPage;
