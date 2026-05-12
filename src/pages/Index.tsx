import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight,Star, MessageCircle, Instagram, Facebook, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getImage } from '@/lib/imageMap';
import { buildWhatsAppChatUrl, WHATSAPP_COMMUNITY_URL } from '@/lib/whatsapp';
import { Skeleton } from '@/components/ui/skeleton';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import espressoImg from '@/assets/espresso.jpg';
import cappuccinoImg from '@/assets/cappuccino.jpg';
import icedImg from '@/assets/iced-coffee.jpg';
import croissantImg from '@/assets/croissant.jpg';
import { useRef } from 'react';
const heroSlides = [
  { image: espressoImg, alt: 'Classic espresso', title: 'Crafted with\nPrecision', subtitle: 'Every cup tells a story of passion and expertise' },
  { image: cappuccinoImg, alt: 'Cappuccino with latte art', title: 'Art in\nEvery Cup', subtitle: 'Where barista craft meets artisan coffee beans' },
  { image: icedImg, alt: 'Iced coffee', title: 'Cool &\nRefreshing', subtitle: 'Premium iced beverages for every season' },
  { image: croissantImg, alt: 'Fresh croissant', title: 'Freshly\nBaked Daily', subtitle: 'Handcrafted pastries to complement your coffee' },
];

interface BestSeller {
  id: string;
  name: string;
  price: string;
  image_key: string;
  image_url?: string | null;
  rating: number;
}

const Index = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [bestSellers, setBestSellers] = useState<BestSeller[]>([]);
  const [loading, setLoading] = useState(true);

const scrollRef = useRef<HTMLDivElement | null>(null);
const loopedProducts = [...bestSellers, ...bestSellers, ...bestSellers];
  useScrollReveal();
  

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + heroSlides.length) % heroSlides.length);
  }, []);

  useEffect(() => {
    const timer = setInterval(nextSlide, 5000);
    return () => clearInterval(timer);
  }, [nextSlide]);

 useEffect(() => {
const fetchBestSellers = async () => {
  try {
    let { data, error } = await supabase
      .from('menu_items')
      .select('id, name, price, image_key, image_url')
      .eq('is_best_seller', true);

    if (error) throw error;

    // ✅ IF LESS ITEMS → GET MORE
    if (!data || data.length < 10) {
      const { data: allItems } = await supabase
        .from('menu_items')
        .select('id, name, price, image_key, image_url')
        .limit(10);

      data = allItems || [];
    }

    setBestSellers(
      data.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        image_key: item.image_key || 'espresso',
        image_url: item.image_url,
        rating: (item as any).rating || 0,
      }))
    );

  } catch (err) {
    console.error('Error fetching best sellers:', err);
  } finally {
    setLoading(false);
  }
};

  fetchBestSellers();
}, []);useEffect(() => {
  const el = scrollRef.current;
  if (!el) return;

  let frame: number;

  const scroll = () => {
    el.scrollLeft += 0.3;

    // ✅ RESET AT PERFECT POINT
    if (el.scrollLeft >= el.scrollWidth / 3) {
      el.scrollLeft = 0;
    }

    frame = requestAnimationFrame(scroll);
  };

  frame = requestAnimationFrame(scroll);

  return () => cancelAnimationFrame(frame);
}, []);
  return (
    <main>
      {/* Hero Carousel */}
      <section id="home" className="relative w-full overflow-hidden bg-espresso">
        <div className="relative h-[85vh] min-h-[500px] max-h-[900px] w-full overflow-hidden">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-all duration-1000 ease-out ${
                index === currentSlide ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
          <div className="absolute inset-0 bg-gradient-to-t from-espresso/80 via-espresso/30 to-espresso/10" />
          <div className="absolute inset-0 bg-gradient-to-r from-espresso/40 to-transparent" />

          <div className="absolute inset-0 flex items-end pb-24 sm:pb-32">
            <div className="container-narrow mx-auto px-5 sm:px-8 lg:px-10 w-full">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 absolute'
                  }`}
                  style={{ display: index === currentSlide ? 'block' : 'none' }}
                >
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-cream leading-[1.05] tracking-tight whitespace-pre-line">
                    {slide.title}
                  </h1>
                  <p className="text-cream/70 text-base sm:text-lg mt-4 max-w-md font-light tracking-wide">
                    {slide.subtitle}
                  </p>
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-cream text-espresso font-medium text-sm tracking-wide rounded-full hover:bg-cream/90 transition-all duration-300 hover:gap-3 group"
                  >
                    Explore Menu
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-8 bg-cream' : 'w-2 bg-cream/30 hover:bg-cream/50'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-cream/10 backdrop-blur-md flex items-center justify-center border border-cream/20 hover:bg-cream/20 transition-all duration-300"
            aria-label="Previous slide"
          >
            <ChevronLeft size={20} className="text-cream" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-10 w-11 h-11 rounded-full bg-cream/10 backdrop-blur-md flex items-center justify-center border border-cream/20 hover:bg-cream/20 transition-all duration-300"
            aria-label="Next slide"
          >
            <ChevronRight size={20} className="text-cream" />
          </button>
        </div>
      </section>
{/* Best Sellers */}
<section id="best-sellers" className="section-padding bg-gradient-warm">
  <div className="container-narrow mx-auto">
    <div className="reveal mb-12">
      <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">Favourites</p>
      <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight">Our Best Sellers</h2>
      <p className="text-muted-foreground text-sm mt-2 max-w-md">
        Discover our most loved drinks and pastries, handcrafted daily with premium ingredients.
      </p>
    </div>

 <div
  ref={scrollRef}
  className="flex gap-5 overflow-x-auto pb-6 -mx-5 px-5 scrollbar-hide"
>
      {loading
        ? Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex-shrink-0 w-44 sm:w-52 snap-start">
              <Skeleton className="aspect-square rounded-2xl mb-3" />
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-16 mt-1.5" />
            </div>
          ))
        : loopedProducts.map((item, index) => (   // ✅ changed
            <Link
              to={`/menu?highlight=${encodeURIComponent(item.name)}`}
              key={index}   // ✅ changed
              className="flex-shrink-0 w-44 sm:w-52 snap-start group"
            >
              <div className="warm-card overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-[0_20px_40px_rgba(0,0,0,0.12)] group-hover:-translate-y-1">
                <div className="aspect-square overflow-hidden rounded-t-xl">
                  <img
                    src={item.image_url || getImage(item.image_key)}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-105"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-serif font-semibold text-sm truncate">{item.name}</h3>
                  
                  <p className="text-accent font-semibold text-sm mt-2">{item.price}</p>
                </div>
              </div>
            </Link>
          ))}
    </div>
  </div>
</section>
{/* Story Section */}
{/* OUR STORY */}
<section id="story" className="section-padding bg-gradient-warm">
  <div className="container-narrow mx-auto grid md:grid-cols-2 gap-14 items-center">

    {/* IMAGE */}
    <div className="relative overflow-hidden rounded-2xl shadow-xl transition duration-500 hover:-translate-y-2">
      <img
        src="/story.jpg"
        alt="Coffee story"
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>

    {/* TEXT */}
    <div className="max-w-lg ml-auto">
      <p className="text-accent text-xs tracking-[0.25em] uppercase mb-3">
        Our Story
      </p>

      <div className="w-12 h-[2px] bg-accent mb-6" />

      <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 leading-tight">
        More Than Just Coffee
      </h2>

      <p className="text-muted-foreground leading-relaxed text-[15px] tracking-wide">
        At Eighty Plus, we believe coffee is more than a drink — it's an experience.
        Every cup is crafted with precision, passion, and a deep love for quality.
        From ethically sourced beans to handcrafted recipes, we bring you moments
        worth slowing down for.
      </p>
    </div>

  </div>
</section>

{/* EXPERIENCE */}<section className="section-padding bg-gradient-warm">
  <div className="container-narrow mx-auto grid md:grid-cols-2 gap-14 items-center md:[&>*:first-child]:order-2">

    {/* IMAGE (RIGHT on desktop) */}
    <div className="relative overflow-hidden rounded-2xl shadow-xl transition duration-500 hover:-translate-y-2">
      <img
        src="/experience.jpg"
        alt="Cafe experience"
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
    </div>

    {/* TEXT (LEFT on desktop) */}
    <div className="max-w-lg">
      <p className="text-accent text-xs tracking-[0.25em] uppercase mb-3">
        Experience
      </p>

      <div className="w-12 h-[2px] bg-accent mb-6" />

      <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 leading-tight">
        A Place You’ll Always Come Back To
      </h2>

      <p className="text-muted-foreground italic text-lg leading-relaxed mb-6">
        “It’s not just coffee — it’s the feeling. The calm, the aroma, the people.
        Eighty Plus has become my daily escape.”
      </p>

      <p className="font-semibold text-sm">
        — A Regular Customer
      </p>
    </div>

  </div>
</section>
{/* Reviews Section */}<section id="reviews" className="section-padding bg-gradient-warm">
  <div className="container-narrow mx-auto text-center">

    {/* HEADER */}
   <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">
  Feedback
</p>
    <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-12">
      What Our Customers Say
    </h2>

    {/* CARDS */}
    <div className="grid md:grid-cols-3 gap-6">

      {/* CARD 1 */}
      <div className="warm-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <p className="text-sm italic text-muted-foreground leading-relaxed">
          “Best coffee in town. The vibe is unmatched.”
        </p>

        <div className="w-8 h-[1px] bg-border mx-auto my-4" />

        <p className="text-sm font-medium">
          — Ayesha
        </p>
      </div>

      {/* CARD 2 */}
      <div className="warm-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <p className="text-sm italic text-muted-foreground leading-relaxed">
          “Feels like home. I come here almost every day.”
        </p>

        <div className="w-8 h-[1px] bg-border mx-auto my-4" />

        <p className="text-sm font-medium">
          — Hamza
        </p>
      </div>

      {/* CARD 3 */}
      <div className="warm-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
        <p className="text-sm italic text-muted-foreground leading-relaxed">
          “The desserts are just as amazing as the coffee.”
        </p>

        <div className="w-8 h-[1px] bg-border mx-auto my-4" />

        <p className="text-sm font-medium">
          — Sara
        </p>
      </div>

    </div>

  </div>
</section>
      {/* Info Section */}
      <section className="section-padding">
        <div className="container-narrow mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 reveal-children">
            <div className="warm-card p-10 text-center group">
              <div className="w-14 h-14 rounded-2xl bg-accent/8 flex items-center justify-center mx-auto mb-5 transition-colors duration-300 group-hover:bg-accent/15">
                <Clock className="text-accent" size={26} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-3">Opening Hours</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">Mon – Fri: 7 AM – 9 PM</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Sat – Sun: 8 AM – 10 PM</p>
            </div>
            <div className="warm-card p-10 text-center group">
              <div className="w-14 h-14 rounded-2xl bg-accent/8 flex items-center justify-center mx-auto mb-5 transition-colors duration-300 group-hover:bg-accent/15">
                <MapPin className="text-accent" size={26} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-3">Our Location</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">164-A, Sector C, Gulmohar, Bahria Town, Lahore</p>
              <p className="text-sm text-muted-foreground leading-relaxed">Free parking available</p>
            </div>
            <div className="warm-card p-10 text-center group">
              <div className="w-14 h-14 rounded-2xl bg-accent/8 flex items-center justify-center mx-auto mb-5 transition-colors duration-300 group-hover:bg-accent/15">
                <MessageCircle className="text-accent" size={26} strokeWidth={1.5} />
              </div>
              <h3 className="font-serif text-lg font-semibold mb-3">Community</h3>
              <p className="text-sm text-muted-foreground mb-4 leading-relaxed">Join our WhatsApp community</p>
              <a
                href="https://chat.whatsapp.com/CHOek8R88Hk8qgnoCuRaek"
                rel="noopener noreferrer"
                target="_blank"
                className="inline-flex items-center gap-1.5 text-sm text-accent font-medium hover:gap-2.5 transition-all duration-300"
              >
                Join Now <ArrowRight size={14} />
              </a>
            </div>
          </div>

          {/* Social Section - UPDATED TO FIX CLICK ISSUE */}
          <div className="mt-20 text-center reveal relative z-50">
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-6">Follow Us</p>
            <div className="flex items-center justify-center gap-4 pointer-events-auto">
              <a
                href="https://www.instagram.com/eighty_pluscoffee/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-card border border-border/60 flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300 relative z-50"
                aria-label="Instagram"
              >
                <Instagram size={20} className="text-accent" strokeWidth={1.5} />
              </a>
              <a
                href="https://www.facebook.com/people/Eighty-Plus/61572608946241/"
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-card border border-border/60 flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300 relative z-50"
                aria-label="Facebook"
              >
                <Facebook size={20} className="text-accent" strokeWidth={1.5} />
              </a>
              <a
                href={buildWhatsAppChatUrl()}
                target="_blank"
                rel="noopener noreferrer"
                className="w-12 h-12 rounded-full bg-card border border-border/60 flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300 relative z-50"
                aria-label="WhatsApp"
              >
                <MessageCircle size={20} className="text-accent" strokeWidth={1.5} />
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;