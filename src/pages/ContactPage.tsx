import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle, Send, Loader2 } from 'lucide-react';
import { buildWhatsAppChatUrl, WHATSAPP_COMMUNITY_URL } from '@/lib/whatsapp';
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ContactPage = () => {
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase
        .from("contact_messages")
        .insert([
          { 
            name: formData.name, 
            email: formData.email, 
            subject: formData.subject,
            message: formData.message 
          }
        ]);

      if (error) throw error;

      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
      toast.success("Message sent successfully!");
      
      // Return to form view after 5 seconds
      setTimeout(() => setSubmitted(false), 5000);
    } catch (error: any) {
      console.error("Submission Error:", error.message);
      toast.error("Could not send message. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="section-padding bg-gradient-to-b from-[#f8f5f2] via-[#f1ebe5] to-[#eae3db]">
      <div className="container-narrow mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Get in Touch
          </p>
          <h1 className="text-5xl font-serif font-bold tracking-tight text-[#2D1B14]">
            Contact Us
          </h1>
        </div>

        {/* LAYOUT */}
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* LEFT SIDE — INFO & SOCIAL */}
          <div className="space-y-8">
            <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-3xl p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f1e3d2] to-[#e0d2c1] flex items-center justify-center shadow-sm">
                  <Phone size={18} className="text-[#5D3A26]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Phone</p>
                  <p className="font-bold text-lg text-[#2D1B14]">+92 321 0682000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f1e3d2] to-[#e0d2c1] flex items-center justify-center shadow-sm">
                  <Mail size={18} className="text-[#5D3A26]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Email</p>
                  <p className="font-bold text-lg text-[#2D1B14]">hello@eightyplus.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#f1e3d2] to-[#e0d2c1] flex items-center justify-center shadow-sm">
                  <MapPin size={18} className="text-[#5D3A26]" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground font-medium">Address</p>
                  <p className="font-bold text-lg text-[#2D1B14] leading-tight">
                    164-A, Sector C, Gulmohar, Bahria Town, Lahore
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-lg rounded-3xl p-6">
              <h3 className="font-serif font-bold mb-5 text-xl text-[#2D1B14]">Follow Us</h3>
              <div className="flex gap-4">
                <a href="https://www.instagram.com/eighty_pluscoffee" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/70 border border-white/40 flex items-center justify-center hover:scale-110 transition-all shadow-sm">
                  <Instagram size={18} className="text-[#5D3A26]" />
                </a>
                <a href="https://www.facebook.com/people/Eighty-Plus/61572608946241/" target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/70 border border-white/40 flex items-center justify-center hover:scale-110 transition-all shadow-sm">
                  <Facebook size={18} className="text-[#5D3A26]" />
                </a>
                <a href={buildWhatsAppChatUrl()} target="_blank" rel="noopener noreferrer" className="w-12 h-12 rounded-full bg-white/70 border border-white/40 flex items-center justify-center hover:scale-110 transition-all shadow-sm">
                  <MessageCircle size={18} className="text-[#5D3A26]" />
                </a>
              </div>
              <a href="https://chat.whatsapp.com/CHOek8R88Hk8qgnoCuRaek" target="_blank" rel="noopener noreferrer" className="inline-flex mt-6 text-sm text-[#5D3A26] font-bold hover:underline">
                Join WhatsApp Community →
              </a>
            </div>
          </div>

          {/* RIGHT SIDE — FORM */}
          <div className="bg-white/60 backdrop-blur-md border border-white/40 shadow-2xl rounded-3xl p-8 sm:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in py-12">
                <div className="w-20 h-20 rounded-full bg-[#EAD8C0] flex items-center justify-center shadow-inner">
                  <Send className="text-[#5D3A26]" size={32} />
                </div>
                <h3 className="font-serif text-2xl font-bold text-[#2D1B14]">Message Sent!</h3>
                <p className="text-stone-500 font-medium">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-bold text-[#2D1B14] mb-2 block">Name</label>
                  <Input
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-white/80 border-white/40 rounded-xl py-6 focus:ring-[#5D3A26]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#2D1B14] mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-white/80 border-white/40 rounded-xl py-6 focus:ring-[#5D3A26]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#2D1B14] mb-2 block">Subject</label>
                  <Input
                    placeholder="Regarding..."
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-white/80 border-white/40 rounded-xl py-6 focus:ring-[#5D3A26]"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-[#2D1B14] mb-2 block">Message</label>
                  <Textarea
                    placeholder="How can we help you?"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-white/80 border-white/40 rounded-xl resize-none focus:ring-[#5D3A26]"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-[#2D1B14] text-[#EAD8C0] rounded-full py-7 font-bold text-lg hover:bg-[#5D3A26] transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="animate-spin" size={20} /> Sending Message...
                    </span>
                  ) : (
                    "Send Message"
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
};

export default ContactPage;