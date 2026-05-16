import { Link } from 'react-router-dom';
import { MapPin, Clock, Phone, Mail, Instagram, Facebook, MessageCircle, ArrowRight } from 'lucide-react';
import { useSiteSettings } from '@/hooks/useSiteSettings';

const Footer = () => {
  const { settings: siteSettings } = useSiteSettings();
  const locationText = siteSettings.site_location || '164-A, Sector C, Gulmohar, Bahria Town, Lahore';
  const phoneText = siteSettings.site_phone || '+92 321 0682000';
  const emailText = siteSettings.site_email || 'hello@eightyplus.com';
  const peakHoursText = siteSettings.site_peak_hours || 'Mon – Fri: 7:00 AM – 9:00 PM | Sat – Sun: 8:00 AM – 10:00 PM';
  const availabilityText = siteSettings.site_availability || 'Open daily';
  const instagramUrl = siteSettings.site_instagram_url || 'https://www.instagram.com/eighty_pluscoffee?igsh=enhpeGZ3MGk1eXFj';
  const facebookUrl = siteSettings.site_facebook_url || 'https://www.facebook.com/people/Eighty-Plus/61572608946241/';
  const whatsappNumber = siteSettings.site_whatsapp_number || '+923210682000';
  const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\D/g, '')}`;
  const showFooterLocation = siteSettings.site_location_placement
    ? (Array.isArray(siteSettings.site_location_placement) ? siteSettings.site_location_placement.includes('footer') : siteSettings.site_location_placement === 'footer')
    : true;
  const showFooterPhone = siteSettings.site_phone_placement
    ? (Array.isArray(siteSettings.site_phone_placement) ? siteSettings.site_phone_placement.includes('footer') : siteSettings.site_phone_placement === 'footer')
    : true;
  const showFooterEmail = siteSettings.site_email_placement
    ? (Array.isArray(siteSettings.site_email_placement) ? siteSettings.site_email_placement.includes('footer') : siteSettings.site_email_placement === 'footer')
    : true;
  const showFooterPeakHours = siteSettings.site_peak_hours_placement
    ? (Array.isArray(siteSettings.site_peak_hours_placement) ? siteSettings.site_peak_hours_placement.includes('footer') : siteSettings.site_peak_hours_placement === 'footer')
    : true;
  const showFooterAvailability = siteSettings.site_availability_placement
    ? (Array.isArray(siteSettings.site_availability_placement) ? siteSettings.site_availability_placement.includes('footer') : siteSettings.site_availability_placement === 'footer')
    : true;
  const showFooterInstagram = siteSettings.site_instagram_placement
    ? (Array.isArray(siteSettings.site_instagram_placement) ? siteSettings.site_instagram_placement.includes('footer') : siteSettings.site_instagram_placement === 'footer')
    : true;
  const showFooterFacebook = siteSettings.site_facebook_placement
    ? (Array.isArray(siteSettings.site_facebook_placement) ? siteSettings.site_facebook_placement.includes('footer') : siteSettings.site_facebook_placement === 'footer')
    : true;
  const showFooterWhatsApp = siteSettings.site_whatsapp_placement
    ? (Array.isArray(siteSettings.site_whatsapp_placement) ? siteSettings.site_whatsapp_placement.includes('footer') : siteSettings.site_whatsapp_placement === 'footer')
    : true;

  return (
    <footer className="bg-gradient-to-b from-espresso to-[#2a1f1a] text-espresso-foreground">
    
    <div className="container-narrow mx-auto px-5 sm:px-8 lg:px-10 py-20 sm:py-24">
      
      {/* TOP SECTION */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-14">

        {/* LEFT — Brand */}
        <div>
          <div className="flex items-center gap-3 mb-5">
  <img 
    src="/logo.png" 
    alt="Eighty Plus Logo" 
    className="w-11 h-11 object-contain"
  />
  <h3 className="text-3xl font-serif font-bold tracking-tight">
    Eighty Plus
  </h3>
</div>

          <p className="text-espresso-foreground/60 text-sm leading-relaxed mb-6">
            A cozy corner where every cup tells a story. Crafted with love, served with warmth.
          </p>

          <Link
            to="/order"
            className="inline-flex items-center gap-2 bg-accent text-accent-foreground px-5 py-2.5 rounded-full text-sm font-medium hover:bg-accent/90 transition-all duration-300 shadow-md hover:shadow-lg"
          >
            Order Now <ArrowRight size={14} />
          </Link>

          <div className="mt-6">
            <a
              href={whatsappLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-espresso-foreground/70 hover:text-espresso-foreground transition-all duration-300"
            >
              Chat on WhatsApp →
            </a>
          </div>
        </div>

        {/* MIDDLE */}
        <div className="grid grid-cols-2 gap-10">

          <div>
            <h4 className="font-serif font-semibold text-base mb-5 tracking-tight">Explore</h4>
            <div className="flex flex-col gap-3">
              {[['/', 'Home'], ['/menu', 'Menu'], ['/order', 'Order Online'], ['/coffee-guide', 'Coffee Guide'], ['/gallery', 'Gallery']].map(([to, label]) => (
                <Link
                  key={to}
                  to={to}
                  className="text-sm text-espresso-foreground/60 hover:text-accent transition-colors duration-300"
                >
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h4 className="font-serif font-semibold text-base mb-5 tracking-tight">Hours</h4>
            <div className="space-y-3 text-sm text-espresso-foreground/60">
              {showFooterPeakHours ? (
                <div className="whitespace-pre-line">{peakHoursText}</div>
              ) : (
                <>
                  <div className="flex items-center gap-2.5">
                    <Clock size={14} strokeWidth={1.5} /> Mon – Fri: 7:00 AM – 9:00 PM
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Clock size={14} strokeWidth={1.5} /> Sat – Sun: 8:00 AM – 10:00 PM
                  </div>
                </>
              )}
              {showFooterAvailability && (
                <div className="text-sm text-espresso-foreground/60">
                  {availabilityText}
                </div>
              )}
            </div>
          </div>

        </div>

        {/* RIGHT — Contact */}
        <div>
          <h4 className="font-serif font-semibold text-base mb-5 tracking-tight">Contact</h4>
          <div className="space-y-4 text-sm text-espresso-foreground/60">

            {showFooterLocation && (
              <div className="flex items-start gap-3">
                <MapPin size={16} className="mt-0.5" />
                <span>{locationText}</span>
              </div>
            )}

            {showFooterPhone && (
              <div className="flex items-center gap-3">
                <Phone size={16} />
                <span>{phoneText}</span>
              </div>
            )}

            {showFooterEmail && (
              <div className="flex items-center gap-3">
                <Mail size={16} />
                <span>{emailText}</span>
              </div>
            )}

          </div>
        </div>

      </div>

      {/* BOTTOM */}
      <div className="border-t border-espresso-foreground/10 mt-16 pt-8 flex flex-col items-center gap-6">

        {/* Social Icons (Centered + Fancy + Safe) */}
        <div className="flex gap-5">
            {showFooterInstagram && (
              <a
                href={instagramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group w-12 h-12 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-pink-500/20"
              >
                <Instagram size={18} className="transition-all duration-300 group-hover:text-pink-400" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 text-xs rounded-md bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                  Instagram
                </span>
              </a>
            )}

            {showFooterFacebook && (
              <a
                href={facebookUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group w-12 h-12 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-blue-500/20"
              >
                <Facebook size={18} className="transition-all duration-300 group-hover:text-blue-400" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 text-xs rounded-md bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                  Facebook
                </span>
              </a>
            )}

            {showFooterWhatsApp && (
              <a
                href={whatsappLink}
                target="_blank"
                rel="noopener noreferrer"
                className="relative group w-12 h-12 rounded-full bg-white/5 flex items-center justify-center backdrop-blur-md border border-white/10 shadow-lg transition-all duration-300 hover:scale-110 hover:-translate-y-1 hover:bg-green-500/20"
              >
                <MessageCircle size={18} className="transition-all duration-300 group-hover:text-green-400" />
                <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-3 py-1 text-xs rounded-md bg-black/80 text-white opacity-0 group-hover:opacity-100 transition-all duration-300 whitespace-nowrap">
                  WhatsApp
                </span>
              </a>
            )}

          </div>
        {/* Copyright */}
        <div className="text-sm text-espresso-foreground/40 text-center">
          © {new Date().getFullYear()} Eighty Plus. All rights reserved.
        </div>

      </div>

    </div>
  </footer>
  );
};

export default Footer;