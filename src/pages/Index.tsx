import { Link } from 'react-router-dom';
import { Clock, MapPin, ArrowRight, MessageCircle, Instagram, Facebook, ChevronLeft, ChevronRight } from 'lucide-react';
import { useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { getImage } from '@/lib/imageMap';
import { buildWhatsAppChatUrl } from '@/lib/whatsapp';
import { Skeleton } from '@/components/ui/skeleton';
import { useScrollReveal } from '@/hooks/useScrollReveal';
import espressoImg from '@/assets/espresso.jpg';
import cappuccinoImg from '@/assets/cappuccino.jpg';
import icedImg from '@/assets/iced-coffee.jpg';
import croissantImg from '@/assets/croissant.jpg';

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
        setLoading(false);
      } catch (err) {
        console.error(err);
        setLoading(false);
      }
    };
    fetchBestSellers();
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    let frame: number;
    const scroll = () => {
      el.scrollLeft += 0.3;
      if (el.scrollLeft >= el.scrollWidth / 3) {
        el.scrollLeft = 0;
      }
      frame = requestAnimationFrame(scroll);
    };
    frame = requestAnimationFrame(scroll);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <main className="bg-background text-foreground transition-colors duration-300">
      {/* Hero Carousel */}
      <section id="home" className="relative w-full overflow-hidden bg-black">
        <div className="relative h-[85vh] min-h-[500px] max-h-[900px] w-full overflow-hidden bg-black">
          {heroSlides.map((slide, index) => (
            <div
              key={index}
              className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                index === currentSlide ? 'opacity-100' : 'opacity-0'
              }`}
            >
              <img
                src={slide.image}
                alt={slide.alt}
                className="w-full h-full object-cover transition-transform duration-[5000ms] ease-linear"
                style={{ transform: index === currentSlide ? 'scale(1.1)' : 'scale(1)' }}
              />
            </div>
          ))}
          
          {/* FIXED: Using Black gradients instead of 'background' to eliminate white fog */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-transparent z-10" />

          <div className="absolute inset-0 flex items-end pb-24 sm:pb-32 z-20">
            <div className="container-narrow mx-auto px-5 sm:px-8 lg:px-10 w-full">
              {heroSlides.map((slide, index) => (
                <div
                  key={index}
                  className={`transition-all duration-700 ${
                    index === currentSlide ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6 absolute'
                  }`}
                  style={{ display: index === currentSlide ? 'block' : 'none' }}
                >
                  {/* Text forced to white for maximum contrast against the new dark gradients */}
                  <h1 className="text-4xl sm:text-5xl lg:text-7xl font-serif font-bold text-white leading-[1.05] tracking-tight whitespace-pre-line">
                    {slide.title}
                  </h1>
                  <p className="text-white/80 text-base sm:text-lg mt-4 max-w-md font-light tracking-wide">
                    {slide.subtitle}
                  </p>
                  <Link
                    to="/menu"
                    className="inline-flex items-center gap-2 mt-8 px-7 py-3.5 bg-primary text-primary-foreground font-medium text-sm tracking-wide rounded-full hover:opacity-90 transition-all duration-300 hover:gap-3 group"
                  >
                    Explore Menu
                    <ArrowRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-30">
            {heroSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`h-1 rounded-full transition-all duration-500 ${
                  i === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/30 hover:bg-white/50'
                }`}
                aria-label={`Go to slide ${i + 1}`}
              />
            ))}
          </div>

          <button
            onClick={prevSlide}
            className="absolute left-4 sm:left-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <ChevronLeft size={20} className="text-white" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 sm:right-8 top-1/2 -translate-y-1/2 z-30 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 hover:bg-white/20 transition-all duration-300"
          >
            <ChevronRight size={20} className="text-white" />
          </button>
        </div>
      </section>

      {/* Best Sellers */}
      <section id="best-sellers" className="section-padding bg-background transition-colors duration-300">
        <div className="container-narrow mx-auto">
          <div className="reveal mb-12">
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">Favourites</p>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold tracking-tight text-foreground">Our Best Sellers</h2>
            <p className="text-muted-foreground text-sm mt-2 max-w-md">
              Discover our most loved drinks and pastries, handcrafted daily with premium ingredients.
            </p>
          </div>

          <div ref={scrollRef} className="flex gap-5 overflow-x-auto pb-6 -mx-5 px-5 scrollbar-hide">
            {loading
              ? Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="flex-shrink-0 w-44 sm:w-52 snap-start">
                    <Skeleton className="aspect-square rounded-2xl mb-3 bg-muted" />
                    <Skeleton className="h-4 w-28 bg-muted" />
                    <Skeleton className="h-4 w-16 mt-1.5 bg-muted" />
                  </div>
                ))
              : loopedProducts.map((item, index) => (
                  <Link
                    to={`/menu?highlight=${encodeURIComponent(item.name)}`}
                    key={index}
                    className="flex-shrink-0 w-44 sm:w-52 snap-start group"
                  >
                    <div className="warm-card bg-card text-card-foreground overflow-hidden transition-all duration-300 ease-in-out group-hover:shadow-warm group-hover:-translate-y-1">
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
      <section id="story" className="section-padding bg-background border-t border-border/10">
        <div className="container-narrow mx-auto grid md:grid-cols-2 gap-14 items-center">
          <div className="relative overflow-hidden rounded-2xl shadow-warm transition duration-500 hover:-translate-y-2">
            <img src="/story.jpg" alt="Coffee story" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
          </div>
          <div className="max-w-lg ml-auto">
            <p className="text-accent text-xs tracking-[0.25em] uppercase mb-3">Our Story</p>
            <div className="w-12 h-[2px] bg-accent mb-6" />
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-foreground leading-tight">More Than Just Coffee</h2>
            <p className="text-muted-foreground leading-relaxed text-[15px] tracking-wide">
              At Eighty Plus, we believe coffee is more than a drink — it's an experience.
              Every cup is crafted with precision, passion, and a deep love for quality.
            </p>
          </div>
        </div>
      </section>

      {/* Experience Section */}
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto grid md:grid-cols-2 gap-14 items-center md:[&>*:first-child]:order-2">
          <div className="relative overflow-hidden rounded-2xl shadow-warm transition duration-500 hover:-translate-y-2">
            <img src="/experience.jpg" alt="Cafe experience" className="w-full h-full object-cover" />
          </div>
          <div className="max-w-lg">
            <p className="text-accent text-xs tracking-[0.25em] uppercase mb-3">Experience</p>
            <div className="w-12 h-[2px] bg-accent mb-6" />
            <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-6 text-foreground">A Place You’ll Always Come Back To</h2>
            <p className="text-muted-foreground italic text-lg leading-relaxed mb-6">
              “It’s not just coffee — it’s the feeling. The calm, the aroma, the people. Eighty Plus has become my daily escape.”
            </p>
            <p className="font-semibold text-sm text-foreground">— A Regular Customer</p>
          </div>
        </div>
      </section>

      {/* Feedback Section */}
      <section id="reviews" className="section-padding bg-background transition-colors duration-300">
        <div className="container-narrow mx-auto text-center">
          <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-3">Feedback</p>
          <h2 className="text-3xl sm:text-4xl font-serif font-bold mb-12 text-foreground">What Our Customers Say</h2>
          <div className="grid md:grid-cols-3 gap-6">
            {['Ayesha', 'Hamza', 'Sara'].map((name, i) => (
              <div key={i} className="warm-card bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl">
                <p className="text-sm italic text-muted-foreground leading-relaxed">
                  {i === 0 && "“Best coffee in town. The vibe is unmatched.”"}
                  {i === 1 && "“Feels like home. I come here almost every day.”"}
                  {i === 2 && "“The desserts are just as amazing as the coffee.”"}
                </p>
                <div className="w-8 h-[1px] bg-border mx-auto my-4" />
                <p className="text-sm font-medium text-foreground">— {name}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Info Section */}
      <section className="section-padding bg-background">
        <div className="container-narrow mx-auto">
          <div className="grid md:grid-cols-3 gap-6 lg:gap-8 reveal-children">
            {[
              { icon: Clock, title: "Opening Hours", lines: ["Mon – Fri: 7 AM – 9 PM", "Sat – Sun: 8 AM – 10 PM"] },
              { icon: MapPin, title: "Our Location", lines: ["164-A, Sector C, Gulmohar,", "Bahria Town, Lahore"] },
              { icon: MessageCircle, title: "Community", lines: ["Join our WhatsApp community"], link: true }
            ].map((item, i) => (
              <div key={i} className="warm-card bg-card p-10 text-center group">
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mx-auto mb-5 transition-colors duration-300 group-hover:bg-accent/20">
                  <item.icon className="text-accent" size={26} strokeWidth={1.5} />
                </div>
                <h3 className="font-serif text-lg font-semibold mb-3 text-foreground">{item.title}</h3>
                {item.lines.map((line, idx) => (
                  <p key={idx} className="text-sm text-muted-foreground leading-relaxed">{line}</p>
                ))}
                {item.link && (
                  <a href="https://chat.whatsapp.com/CHOek8R88Hk8qgnoCuRaek" className="inline-flex items-center gap-1.5 text-sm text-accent font-medium mt-4 hover:gap-2.5 transition-all duration-300">
                    Join Now <ArrowRight size={14} />
                  </a>
                )}
              </div>
            ))}
          </div>

          {/* Social Section */}
          <div className="mt-20 text-center reveal relative z-50">
            <p className="text-accent text-xs font-semibold tracking-[0.2em] uppercase mb-6">Follow Us</p>
            <div className="flex items-center justify-center gap-4">
              {[
                { icon: Instagram, url: "https://www.instagram.com/eighty_pluscoffee/", label: "Instagram" },
                { icon: Facebook, url: "https://www.facebook.com/people/Eighty-Plus/61572608946241/", label: "Facebook" },
                { icon: MessageCircle, url: buildWhatsAppChatUrl(), label: "WhatsApp" }
              ].map((social, i) => (
                <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-card border border-border/60 flex items-center justify-center hover:bg-secondary hover:scale-110 transition-all duration-300 relative z-50" aria-label={social.label}>
                  <social.icon size={20} className="text-accent" strokeWidth={1.5} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
};

export default Index;