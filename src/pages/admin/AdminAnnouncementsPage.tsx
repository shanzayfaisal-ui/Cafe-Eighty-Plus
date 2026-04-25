import { useEffect, useState } from 'react';
import { Megaphone, Plus, Trash2, Edit2, Loader2, X } from 'lucide-react';
import AdminLayout from '@/components/admin/AdminLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

// 1. Interface matching your Supabase 'announcements' table
interface Announcement {
  id: string;
  title: string;
  content: string; // This maps to the 'Details' in your UI
  type: 'promotion' | 'event' | 'news' | 'urgent';
  is_active: boolean;
  created_at: string;
}

const AdminAnnouncementsPage = () => {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  // Form State
  const [title, setTitle] = useState('');
  const [content, setContent] = useState(''); // Stores the "Details"
  const [type, setType] = useState<Announcement['type']>('news');
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchAnnouncements = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('announcements' as any)
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Double-cast to handle Supabase auto-generated types
      const fetchedData = (data as unknown as Announcement[]) || [];
      setAnnouncements(fetchedData);
      
    } catch (error: any) {
      console.error("Fetch error:", error);
      toast({ 
        title: "Error fetching data", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnnouncements();
  }, []);

  const resetForm = () => {
    setTitle('');
    setContent('');
    setType('news');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    // Prepare payload using 'content' column name for the database
    const payload = { 
      title, 
      content, 
      type, 
      is_active: true 
    };

    try {
      const { error } = editingId 
        ? await supabase.from('announcements' as any).update(payload).eq('id', editingId)
        : await supabase.from('announcements' as any).insert([payload]);

      if (error) throw error;

      toast({ 
        title: editingId ? "Announcement updated" : "Announcement posted",
        description: "Your changes are now live on the website."
      });
      resetForm();
      fetchAnnouncements();
    } catch (error: any) {
      toast({ 
        title: "Action failed", 
        description: error.message, 
        variant: "destructive" 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const deleteAnnouncement = async (id: string) => {
    if (!confirm("Are you sure you want to delete this announcement?")) return;
    
    try {
      const { error } = await supabase.from('announcements'as any).delete().eq('id', id);
      if (error) throw error;
      
      toast({ title: "Announcement deleted" });
      fetchAnnouncements();
    } catch (error: any) {
      toast({ title: "Delete failed", description: error.message, variant: "destructive" });
    }
  };

  return (
    <AdminLayout 
      title="Announcements" 
      description="Manage the notification banner displayed at the top of your website."
    >
      <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
        
        {/* CREATE/EDIT FORM */}
        <div className="bg-white p-8 rounded-[2rem] border border-stone-100 shadow-sm h-fit sticky top-24">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-serif font-bold text-xl text-[#2D1B14]">
              {editingId ? 'Edit Post' : 'New Announcement'}
            </h2>
            {editingId && (
              <Button variant="ghost" size="icon" onClick={resetForm} className="rounded-full">
                <X size={18} />
              </Button>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-400">Headline (Title)</label>
              <Input 
                value={title} 
                onChange={e => setTitle(e.target.value)} 
                placeholder="Short catchy title..." 
                required 
              />
            </div>
            
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-400">Category</label>
              <select 
                className="w-full h-10 px-3 rounded-md border border-stone-200 bg-white text-sm outline-none focus:ring-2 focus:ring-[#5D3A26]/20 transition-all"
                value={type} 
                onChange={(e) => setType(e.target.value as Announcement['type'])}
              >
                <option value="news">General News</option>
                <option value="promotion">Promotion/Discount</option>
                <option value="event">Special Event</option>
                <option value="urgent">Urgent/Holiday</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase text-stone-400">Details (Expanded Content)</label>
              <textarea 
                className="w-full p-3 rounded-md border border-stone-200 text-sm h-32 outline-none focus:ring-2 focus:ring-[#5D3A26]/20 transition-all resize-none"
                value={content} 
                onChange={e => setContent(e.target.value)}
                placeholder="The detailed message users see when they click 'Details'..."
                required
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isSubmitting} className="flex-1 bg-[#5D3A26] hover:bg-[#4A2E1E] text-white">
                {isSubmitting ? (
                  <Loader2 className="animate-spin mr-2" size={16} />
                ) : editingId ? (
                  <Edit2 size={16} className="mr-2" />
                ) : (
                  <Plus size={16} className="mr-2" />
                )}
                {editingId ? 'Update Post' : 'Post Announcement'}
              </Button>
            </div>
          </form>
        </div>

        {/* LIST VIEW */}
        <div className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-20 text-stone-400">
              <Loader2 className="animate-spin" size={32} />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-20 bg-stone-50 rounded-[2rem] text-stone-400 border border-dashed border-stone-200">
              No announcements found.
            </div>
          ) : (
            announcements.map((item) => (
              <div 
                key={item.id} 
                className={cn(
                  "bg-white p-6 rounded-3xl border transition-all group relative",
                  item.id === editingId ? "border-[#5D3A26] ring-1 ring-[#5D3A26]" : "border-stone-100 hover:shadow-md"
                )}
              >
                <div className="flex gap-4">
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center shrink-0",
                    item.type === 'urgent' ? "bg-rose-50 text-rose-500" : "bg-stone-50 text-stone-400"
                  )}>
                    <Megaphone size={20} />
                  </div>

                  <div className="flex-1">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          {item.type} • {new Date(item.created_at).toLocaleDateString()}
                        </span>
                        <h3 className="font-bold text-[#2D1B14] text-lg">{item.title}</h3>
                      </div>
                      
                      <div className="flex gap-1 md:opacity-0 group-hover:opacity-100 transition-all">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-stone-100" 
                          onClick={() => {
                            setEditingId(item.id); 
                            setTitle(item.title); 
                            setContent(item.content); 
                            setType(item.type);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                        >
                          <Edit2 size={14} className="text-stone-400" />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 hover:bg-rose-50" 
                          onClick={() => deleteAnnouncement(item.id)}
                        >
                          <Trash2 size={14} className="text-rose-300 group-hover:text-rose-500" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 bg-stone-50/50 p-3 rounded-xl border border-stone-100/50">
                      <p className="text-sm text-stone-500 leading-relaxed italic">
                        "{item.content}"
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminAnnouncementsPage;