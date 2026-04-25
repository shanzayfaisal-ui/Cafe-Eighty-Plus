import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Mail, Trash2, User, Calendar, Reply, MessageSquare, Loader2 } from "lucide-react";

interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  created_at: string;
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
      setMessages(data || []);
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
      console.error("Delete Error:", error.message);
      toast.error(`Delete failed: ${error.message}`);
    } finally {
      setActionLoading(null);
    }
  };

  const handleReply = (email: string, subject: string) => {
    if (!email) {
      toast.error("User email not found");
      return;
    }
    
    // 1. Encode details for the URL
    const encodedSubject = encodeURIComponent(`Re: ${subject || 'Inquiry'}`);
    const encodedBody = encodeURIComponent("\n\n--- Original Message Below ---\n\n");
    
    // 2. Direct Gmail Compose URL
    // This bypasses the computer's default app and opens Gmail in a new tab
    const gmailUrl = `https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${encodedSubject}&body=${encodedBody}`;
    
    // 3. Open in new tab
    window.open(gmailUrl, '_blank', 'noopener,noreferrer');
    
    toast.success(`Opening Gmail for ${email}`);
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
                className="bg-white rounded-[2rem] border border-stone-100 shadow-sm p-8 hover:shadow-md transition-all group"
              >
                <div className="flex flex-col md:flex-row justify-between gap-6">
                  
                  <div className="space-y-4 flex-1">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-[#5D3A26]">
                        <User size={20} />
                      </div>
                      <div>
                        <h4 className="font-bold text-[#2D1B14]">{msg.name}</h4>
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
                      <div className="mt-4 text-stone-600 text-sm leading-relaxed bg-stone-50/50 p-5 rounded-2xl border border-stone-100 italic">
                        "{msg.message}"
                      </div>
                    </div>

                    <div className="flex items-center gap-4 text-[10px] text-stone-300 font-bold uppercase tracking-widest">
                      <Calendar size={12} /> 
                      {new Date(msg.created_at).toLocaleDateString(undefined, { 
                        year: 'numeric', 
                        month: 'short', 
                        day: 'numeric' 
                      })} at {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="flex md:flex-col gap-3 shrink-0">
                    <button 
                      onClick={() => handleReply(msg.email, msg.subject)}
                      className="flex items-center justify-center gap-2 bg-[#2D1B14] text-[#EAD8C0] px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-[#5D3A26] transition-all shadow-sm"
                    >
                      <Reply size={16} /> Reply
                    </button>
                    <button 
                      onClick={() => deleteMessage(msg.id)}
                      disabled={actionLoading === msg.id}
                      className="flex items-center justify-center gap-2 bg-white text-stone-400 px-6 py-4 rounded-2xl font-bold text-xs uppercase tracking-widest hover:bg-rose-50 hover:text-rose-600 transition-all border border-stone-100 hover:border-rose-100 disabled:opacity-50"
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
                <p className="text-stone-400 text-xs uppercase tracking-widest mt-1">No new inquiries from customers</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminMessagesPage;