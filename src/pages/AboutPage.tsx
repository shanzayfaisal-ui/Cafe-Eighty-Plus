import { MapPin, Clock, Users } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const AboutPage = () => {
  const { settings: siteSettings } = useSiteSettings();
  const mapEmbedUrl = siteSettings.site_map_embed_url || 'https://www.google.com/maps?q=Eighty+Plus+164-A+Gulmohar+Sector+C+Bahria+Town+Lahore+Pakistan&z=19&output=embed';

  return (
    <main className="section-padding">
    <div className="container-narrow mx-auto max-w-4xl">
      <div className="text-center mb-12 animate-fade-in">
        <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">Get to Know Us</p>
        <h1 className="text-4xl sm:text-5xl font-serif font-bold">About Us</h1>
      </div>

      {/* Map */}
      <div className="warm-card overflow-hidden mb-10">
        <iframe
          src={mapEmbedUrl}
          width="100%"
          height="400"
          style={{ border: 0 }}
          allowFullScreen
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          title="Eighty Plus Café - 164-A Gulmohar, Sector C, Bahria Town Lahore"
          className="w-full"
        />
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="warm-card p-8 text-center">
          <MapPin className="mx-auto mb-4 text-accent" size={32} />
          <h3 className="font-serif text-lg font-semibold mb-2">Location</h3>
          <p className="text-sm text-muted-foreground">164-A, Sector C, Gulmohar</p>
          <p className="text-sm text-muted-foreground">Bahria Town, Lahore</p>
          <p className="text-sm text-muted-foreground mt-1">Free parking available</p>
        </div>

        <div className="warm-card p-8 text-center">
          <Clock className="mx-auto mb-4 text-accent" size={32} />
          <h3 className="font-serif text-lg font-semibold mb-2">Availability</h3>
          <p className="text-sm text-muted-foreground">Mon–Fri: 7 AM – 9 PM</p>
          <p className="text-sm text-muted-foreground">Sat–Sun: 8 AM – 10 PM</p>
          <p className="text-sm text-muted-foreground mt-1">Open all holidays</p>
        </div>

        <div className="warm-card p-8 text-center">
          <Users className="mx-auto mb-4 text-accent" size={32} />
          <h3 className="font-serif text-lg font-semibold mb-2">Peak Hours</h3>
          <p className="text-sm text-muted-foreground">Weekdays: 8–10 AM</p>
          <p className="text-sm text-muted-foreground">Weekends: 10 AM – 12 PM</p>
          <p className="text-sm text-muted-foreground mt-1 text-accent">Best visit: 2–4 PM ☕</p>
        </div>
      </div>
    </div>
  </main>
  );
};

export default AboutPage;
