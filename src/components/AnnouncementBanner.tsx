import { useEffect, useState } from 'react';
import { Megaphone, X, ChevronDown, ChevronUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// We define the interface to match your Supabase table columns exactly
interface Announcement {
  id: string;
  title: string;
  content?: string; // This holds the "Details" written by the Admin
  type: 'promotion' | 'event' | 'news' | 'urgent';
}

const AnnouncementBanner = () => {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false); // Controls the "Details" dropdown

  useEffect(() => {
    const fetchLatestAnnouncement = async () => {
      try {
        const { data, error } = await supabase
          .from('announcements' as any)
          .select('id, title, type, content') // We fetch 'content' from your table
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

  // Hidden if no announcement exists or if user clicked 'X'
  if (!announcement || !isVisible) return null;

  const isUrgent = announcement.type === 'urgent';
  
  const bannerStyles = isUrgent 
    ? "bg-rose-600 text-white" 
    : "bg-[#5D3A26] text-[#EAD8C0]";

  return (
    <div className={cn(
      "relative w-full flex flex-col transition-all animate-in fade-in slide-in-from-top duration-500 z-[60]",
      bannerStyles
    )}>
      {/* 1. Main Banner Row */}
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
            <p className="tracking-wide text-[12px] md:text-sm line-clamp-1">
              {announcement.title}
            </p>
          </div>

          {/* Details Toggle Button - Only shows if 'content' has data */}
          {announcement.content && (
            <button 
              onClick={() => setIsExpanded(!isExpanded)}
              className="flex items-center gap-1 ml-2 px-2 py-0.5 rounded bg-white/10 hover:bg-white/20 text-[10px] uppercase font-bold transition-all whitespace-nowrap shadow-sm"
            >
              {isExpanded ? 'Close' : 'Details'} 
              {isExpanded ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
            </button>
          )}
        </div>

        {/* Close Button */}
        <button 
          onClick={() => setIsVisible(false)}
          aria-label="Close announcement"
          className="absolute right-2 md:right-4 hover:rotate-90 transition-transform p-1 opacity-70 hover:opacity-100"
        >
          <X size={16} />
        </button>
      </div>

      {/* 2. Expandable Details Section (Dropdown) */}
      {isExpanded && announcement.content && (
        <div className="w-full bg-black/10 px-4 py-4 animate-in slide-in-from-top-2 duration-300 border-t border-white/5">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-[13px] md:text-sm leading-relaxed font-light opacity-90 italic">
              {announcement.content}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementBanner;