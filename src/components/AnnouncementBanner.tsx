import { useEffect, useState } from 'react';
import { Megaphone, X, ChevronRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface Announcement {
  id: string;
  title: string;
  content?: string; 
  type: 'promotion' | 'event' | 'news' | 'urgent';
}

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [showDetailsModal, setShowDetailsModal] = useState(false); 

  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements' as any)
          .select('id, title, type, content') 
          .eq('is_active', true)
          .order('created_at', { ascending: false })
          .limit(1)
          .maybeSingle();

        if (error) throw error;
        if (data) setAnnouncement(data as unknown as Announcement);
      } catch (error) {
        console.error('Error fetching announcement:', error);
      }
    };

    fetchLatestAnnouncement();
  }, []);

  if (!announcement || !isVisible) return null;

  const isUrgent = announcement.type === 'urgent';
  
  const bannerStyles = isUrgent 
    ? "bg-rose-600 text-white" 
    : "bg-[#5D3A26] text-[#EAD8C0]";

  return (
    <>
      {/* 1. Main Banner Row */}
      <div className={cn(
        "w-full flex flex-col transition-colors duration-500 z-[60]",
        bannerStyles
      )}>
        <div className="w-full py-2.5 px-4 flex items-center justify-center relative">
          <div className="flex items-center gap-3 max-w-7xl mx-auto text-sm font-medium pr-8">
            <Megaphone 
              size={16} 
              className={cn("shrink-0", isUrgent ? "animate-pulse" : "opacity-80")} 
            />
            
            <div className="flex items-center gap-2 overflow-hidden">
              <span className="hidden xs:inline-block font-bold uppercase text-[9px] tracking-tighter opacity-80 border-r border-current/20 pr-2 whitespace-nowrap">
                {announcement.type}
              </span>
              <p className="tracking-wide text-[12px] md:text-sm line-clamp-1 font-medium uppercase">
                {announcement.title}
              </p>
            </div>

            {/* Details Trigger Button styled exactly like your image */}
            {announcement.content && (
              <button 
                onClick={() => setShowDetailsModal(true)}
                className="flex items-center gap-1 ml-2 px-3 py-0.5 rounded-full bg-white/10 hover:bg-white/20 text-[10px] uppercase font-bold tracking-wider transition-all whitespace-nowrap shadow-sm border border-white/5"
              >
                Details 
                <ChevronRight size={12} className="opacity-90" />
              </button>
            )}
          </div>

          {/* Close Banner Button */}
          <button 
            onClick={() => setIsVisible(false)}
            aria-label="Close announcement"
            className="absolute right-2 md:right-4 bg-transparent hover:rotate-90 transition-transform p-1 opacity-70 hover:opacity-100"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* 2. Overlaid Center Details Pop-up Modal */}
      {showDetailsModal && announcement.content && (
        <div 
          className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-all animate-in fade-in duration-200"
          onClick={() => setShowDetailsModal(false)}
        >
          <div 
            className="bg-[#F5EFE6] text-[#5D3A26] rounded-[2.5rem] p-8 sm:p-10 max-w-md w-full shadow-2xl border border-[#EAD8C0]/60 animate-in zoom-in-95 duration-300 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Right Corner Close Icon Button */}
            <button 
              onClick={() => setShowDetailsModal(false)} 
              className="absolute right-6 top-6 p-1.5 hover:bg-[#5D3A26]/5 rounded-full transition-colors text-[#5D3A26]/60 hover:text-[#5D3A26]"
            >
              <X size={20} />
            </button>

            <div className="flex flex-col items-start text-left mt-2">
              {/* Circular Icon Container Badge */}
              <div className="bg-[#5D3A26]/10 p-3.5 rounded-full text-[#5D3A26] mb-6">
                <Megaphone size={24} />
              </div>
              
              {/* Main Headline Title */}
              <h2 className="text-3xl font-serif font-bold text-[#5D3A26] tracking-tight mb-2">
                {announcement.title}
              </h2>
              
              <div className="h-px bg-[#5D3A26]/10 w-full my-3" />
              
              {/* Detailed Extended Text Body */}
              <p className="text-[#5D3A26]/80 text-base font-normal leading-relaxed mb-8 whitespace-pre-wrap">
                {announcement.content}
              </p>
              
              {/* Bottom Dismiss Action Button */}
              <button 
                onClick={() => setShowDetailsModal(false)}
                className="w-full py-3.5 bg-[#5D3A26] text-[#EAD8C0] rounded-2xl font-bold text-sm tracking-wider hover:opacity-95 transition-all shadow-md active:scale-[0.99]"
              >
                Got it, thanks!
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AnnouncementBanner;