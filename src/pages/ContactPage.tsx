import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Phone, Mail, MapPin, Instagram, Facebook, MessageCircle, Send, Loader2 } from 'lucide-react';
import { buildWhatsAppChatUrl } from '@/lib/whatsapp';
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
    <main className="section-padding bg-background text-foreground min-h-screen transition-colors duration-300">
      <div className="container-narrow mx-auto max-w-6xl">

        {/* HEADER */}
        <div className="text-center mb-16 animate-fade-in">
          <p className="text-accent text-sm font-medium tracking-[0.2em] uppercase mb-3">
            Get in Touch
          </p>
          <h1 className="text-5xl font-serif font-bold tracking-tight">
            Contact Us
          </h1>
        </div>

        {/* LAYOUT */}
        <div className="grid md:grid-cols-2 gap-12 items-start">

          {/* LEFT SIDE — INFO & SOCIAL */}
          <div className="space-y-8">
            <div className="bg-card border border-border/50 shadow-sm rounded-3xl p-6 space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shadow-sm">
                  <Phone size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Phone</p>
                  <p className="font-bold text-lg">+92 321 0682000</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shadow-sm">
                  <Mail size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Email</p>
                  <p className="font-bold text-lg">hello@eightyplus.com</p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center shadow-sm">
                  <MapPin size={18} className="text-accent" />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-semibold uppercase tracking-wider">Address</p>
                  <p className="font-bold text-lg leading-tight">
                    164-A, Sector C, Gulmohar, Bahria Town, Lahore
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-card border border-border/50 shadow-sm rounded-3xl p-6">
              <h3 className="font-serif font-bold mb-5 text-xl">Follow Us</h3>
              <div className="flex gap-4">
                {[
                  { icon: Instagram, url: "https://www.instagram.com/eighty_pluscoffee" },
                  { icon: Facebook, url: "https://www.facebook.com/people/Eighty-Plus/61572608946241/" },
                  { icon: MessageCircle, url: buildWhatsAppChatUrl() }
                ].map((social, i) => (
                  <a 
                    key={i} 
                    href={social.url} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-12 h-12 rounded-full bg-background border border-border/60 flex items-center justify-center hover:scale-110 hover:border-accent transition-all shadow-sm"
                  >
                    <social.icon size={18} className="text-accent" />
                  </a>
                ))}
              </div>
              <a 
                href="https://chat.whatsapp.com/CHOek8R88Hk8qgnoCuRaek" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="inline-flex mt-6 text-sm text-accent font-bold hover:underline"
              >
                Join WhatsApp Community →
              </a>
            </div>
          </div>

          {/* RIGHT SIDE — FORM */}
          <div className="bg-card border border-border/50 shadow-xl rounded-3xl p-8 sm:p-10">
            {submitted ? (
              <div className="flex flex-col items-center justify-center h-full gap-4 animate-fade-in py-12">
                <div className="w-20 h-20 rounded-full bg-accent/20 flex items-center justify-center">
                  <Send className="text-accent" size={32} />
                </div>
                <h3 className="font-serif text-2xl font-bold">Message Sent!</h3>
                <p className="text-muted-foreground font-medium">We'll get back to you soon.</p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="text-sm font-bold mb-2 block">Name</label>
                  <Input
                    placeholder="Your name"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="bg-background border-border/60 rounded-xl py-6 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Email</label>
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="bg-background border-border/60 rounded-xl py-6 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Subject</label>
                  <Input
                    placeholder="Regarding..."
                    required
                    value={formData.subject}
                    onChange={(e) => setFormData({...formData, subject: e.target.value})}
                    className="bg-background border-border/60 rounded-xl py-6 focus:ring-accent"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold mb-2 block">Message</label>
                  <Textarea
                    placeholder="How can we help you?"
                    rows={5}
                    required
                    value={formData.message}
                    onChange={(e) => setFormData({...formData, message: e.target.value})}
                    className="bg-background border-border/60 rounded-xl resize-none focus:ring-accent"
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-primary text-primary-foreground rounded-full py-7 font-bold text-lg hover:bg-accent transition-all duration-300 disabled:opacity-50"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <Loader2 className="animate-spin" size={20} /> Sending...
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