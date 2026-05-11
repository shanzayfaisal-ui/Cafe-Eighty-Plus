import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Trash2, User, Calendar, Reply, MessageSquare, Loader2, CheckCircle2 } from "lucide-react";

// 1. Interface must include these fields for TypeScript to recognize them
interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
  is_read: boolean;    
  is_replied: boolean; 
}

const AdminMessagesPage = () => {
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchMessages = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;

      // 2. Type cast the data so TypeScript doesn't throw errors on is_read/is_replied
      setMessages((data as ContactMessage[]) || []);
    } catch (error: any) {
      console.error("Fetch Error:", error.message);
      toast.error("Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
  }, []);

  // 3. Mark as Read Logic
  const markAsRead = async (id: string, currentReadStatus: boolean) => {
    if (currentReadStatus) return; // Skip if already read

    try {
      const { error } = await supabase
        .from("contact_messages")
        .update({ is_read: true })
        .eq("id", id);

      if (error) throw error;
      
      // Update local state immediately
      setMessages(prev => prev.map(m => m.id === id ? { ...m, is_read: true } : m));
    } catch (error: any) {
      console.error("Update Error:", error.message);
    }
  };

  const deleteMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    
    setActionLoading(id);
    try {
      const { error } = await supabase
        .from("contact_messages")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Message deleted");
      setMessages(prev => prev.filter(msg => msg.id !== id));
    } catch (error: any) {
      toast.error("Delete failed");
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = async (msg: ContactMessage) => {
    if (!msg.email) {
      toast.error("User email not found");
      return;
    }
    
    // 4. Update status to Replied (and Read) in Database
    try {
      await supabase
        .from("contact_messages")
        .update({ is_replied: true, is_read: true })
        .eq("id", msg.id);
      
      setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, is_replied: true, is_read: true } : m));
    } catch (err) {
      console.error("Failed to update reply status");
    }

    const encodedSubject = encodeURIComponent(`Re: ${msg.subject || 'Inquiry'}`);
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${msg.email}&su=${encodedSubject}`;
    
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    toast.success(`Opening Gmail for ${msg.email}`);
  };

  return (
    <AdminLayout title="Inbox" description="Manage inquiries and respond to customers">
      <div className="max-w-6xl space-y-6">
        {loading ? (
          <div className="py-20 text-center flex flex-col items-center gap-3">
            <Loader2 className="animate-spin text-stone-300" size={32} />
            <p className="text-stone-400 font-medium">Checking your mail...</p>
          </div>
        ) : (
          <div className="grid gap-6">
            {messages.map((msg) => (
              <div 
                key={msg.id} 
                onClick={() => markAsRead(msg.id, msg.is_read)}
                className={`bg-white rounded-[2rem] border transition-all p-8 group relative cursor-pointer ${
                  !msg.is_read 
                    ? 'border-accent/40 shadow-md ring-1 ring-accent/5' 
                    : 'border-stone-100 shadow-sm'
                }`}
              >
                {/* Status Badges */}
                <div className="absolute top-8 right-8 flex gap-2">
                  {!msg.is_read && (
                    <span className="bg-accent text-white text-[9px] font-black uppercase px-2 py-1 rounded-full animate-pulse">
                      New
                    </span>
                  )}
                  {msg.is_replied && (
                    <span className="bg-green-100 text-green-700 text-[9px] font-black uppercase px-2 py-1 rounded-full flex items-center gap-1">
                      <CheckCircle2 size={10} /> Replied
                    </span>
                  )}
                </div>

                <div className="flex flex-col md:flex-row justify-between gap-6">
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-colors ${
                        !msg.is_read ? 'bg-accent text-white' : 'bg-stone-50 text-stone-400'
                      }`}>
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className={`font-bold transition-colors ${!msg.is_read ? 'text-black' : 'text-stone-600'}`}>
                          {msg.name}
                        </h4>
                        <div className="flex items-center gap-1.5 text-stone-400 text-xs mt-0.5">
                          <Mail size={12} />
                          {msg.email}
                        </div>
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-black uppercase tracking-[0.1em] text-[#5D3A26] bg-[#F5F1EE] px-3 py-1.5 rounded-lg">
                        Subject: {msg.subject || "No Subject"}
                      </span>
                      <div className={`mt-4 text-sm leading-relaxed p-5 rounded-2xl border italic transition-colors ${
                        !msg.is_read 
                          ? 'bg-white border-accent/10 text-stone-800' 
                          : 'bg-stone-50/50 border-stone-100 text-stone-500'
                      }`}>
                        "{msg.message}"
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-stone-300 font-bold uppercase tracking-widest">
                      <Calendar size={12} /> 
                      {new Date(msg.created_at).toLocaleDateString()} at {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-3 shrink-0 justify-end">
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents markAsRead from firing
                        handleReply(msg);
                      }}
                      className={`flex items-center justify-center gap-2 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest transition-all shadow-sm ${
                        msg.is_replied 
                          ? 'bg-stone-100 text-stone-400 hover:bg-stone-200' 
                          : 'bg-[#2D1B14] text-[#EAD8C0] hover:bg-[#5D3A26]'
                      }`}
                    >
                      <Reply size={16} /> {msg.is_replied ? "Reply Again" : "Reply"}
                    </button>
                    
                    <button 
                      onClick={(e) => {
                        e.stopPropagation(); // Prevents markAsRead from firing
                        deleteMessage(msg.id);
                      }}
                      disabled={actionLoading === msg.id}
                      className="flex items-center justify-center gap-2 bg-white text-stone-400 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-stone-100 hover:border-rose-100"
                    >
                      {actionLoading === msg.id ? (
                        <Loader2 className="animate-spin" size={16} />
                      ) : (
                        <Trash2 size={16} />
                      )} 
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {messages.length === 0 && (
              <div className="text-center py-20 bg-stone-50/50 rounded-[3rem] border border-dashed border-stone-200">
                <MessageSquare size={48} className="mx-auto mb-4 text-stone-200" />
                <h3 className="text-stone-500 font-bold">Your inbox is empty</h3>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessagesPage;