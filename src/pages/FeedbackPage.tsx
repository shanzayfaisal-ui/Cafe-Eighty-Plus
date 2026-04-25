import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Star, Send, Quote } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Skeleton } from '@/components/ui/skeleton';
import { useToast } from '@/hooks/use-toast';

interface Feedback {
  id: string;
  name: string;
  rating: number;
  message: string;
  created_at: string;
}

const FeedbackPage = () => {
  const [rating, setRating] = useState(0);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [submitted, setSubmitted] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [message, setMessage] = useState('');
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const fetchFeedbacks = async () => {
    const { data } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setFeedbacks(data as Feedback[]);
    setLoading(false);
  };

  useEffect(() => { fetchFeedbacks(); }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (rating === 0) {
      toast({ title: 'Please select a rating', variant: 'destructive' });
      return;
    }
    // Name validation: both first and last name required, start with capital
    if (!firstName.trim() || !lastName.trim()) {
      toast({ title: 'First and last name are required.', variant: 'destructive' });
      return;
    }
    if (!/^[A-Z][a-z]+$/.test(firstName) || !/^[A-Z][a-z]+$/.test(lastName)) {
      toast({ title: 'First and last name must start with a capital letter and contain only letters.', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.from('feedback').insert({
      name: firstName + ' ' + lastName,
      rating,
      message,
    });
    setSubmitting(false);

    if (error) {
      toast({ title: 'Something went wrong', description: error.message, variant: 'destructive' });
      return;
    }

    setSubmitted(true);
    setFirstName('');
    setLastName('');
    setMessage('');
    setRating(0);
    // Refresh feedbacks to show new one
    fetchFeedbacks();
    setTimeout(() => setSubmitted(false), 3000);
  };

  return (
    <main className="section-padding">
      <div className="container-narrow mx-auto max-w-4xl">
        <div className="text-center mb-12 animate-fade-in">
          <p className="text-accent text-sm font-medium tracking-widest uppercase mb-2">We Value Your Voice</p>
          <h1 className="text-4xl sm:text-5xl font-serif font-bold">Feedback</h1>
        </div>

        {/* Testimonials from DB */}
        <div className="grid sm:grid-cols-2 gap-5 mb-16">
          {loading ? (
            Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-36 rounded-xl" />
            ))
          ) : feedbacks.length === 0 ? (
            <p className="text-muted-foreground col-span-2 text-center">No feedback yet. Be the first to share!</p>
          ) : (
            feedbacks.map((t) => (
              <div key={t.id} className="warm-card p-6">
                <Quote size={24} className="text-accent/30 mb-3" />
                <p className="text-foreground/80 mb-3 italic">"{t.message}"</p>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">{t.name}</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 5 }).map((_, j) => (
                      <Star key={j} size={14} className={j < t.rating ? 'fill-accent text-accent' : 'text-border'} />
                    ))}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Google Reviews Link */}
        <div className="text-center mb-12">
          <a href="#" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-secondary text-secondary-foreground font-medium text-sm hover:bg-secondary/80 transition-colors">
            <Star size={16} className="text-accent" /> See our Google Reviews
          </a>
        </div>

        {/* Feedback Form */}
        <div className="warm-card p-6 sm:p-10 max-w-xl mx-auto">
          <h2 className="text-xl font-serif font-bold text-center mb-6">Share Your Experience</h2>
          {submitted ? (
            <div className="flex flex-col items-center gap-4 py-8 animate-fade-in">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center"><Send className="text-accent" size={28} /></div>
              <h3 className="font-serif text-lg">Thank You!</h3>
              <p className="text-sm text-muted-foreground">Your feedback helps us brew better.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="text-sm font-medium mb-1.5 block">First Name</label>
                <Input placeholder="First Name" required value={firstName} onChange={e => setFirstName(e.target.value)} className="bg-secondary border-0" />
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Last Name</label>
                <Input placeholder="Last Name" required value={lastName} onChange={e => setLastName(e.target.value)} className="bg-secondary border-0" />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      onMouseEnter={() => setHoveredStar(s)}
                      onMouseLeave={() => setHoveredStar(0)}
                      className="p-1 transition-transform hover:scale-110"
                    >
                      <Star size={28} className={s <= (hoveredStar || rating) ? 'fill-accent text-accent' : 'text-border'} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1.5 block">Your Feedback</label>
                <Textarea placeholder="Tell us about your experience..." rows={4} required value={message} onChange={e => setMessage(e.target.value)} className="bg-secondary border-0 resize-none" />
              </div>
              <Button type="submit" disabled={submitting} className="w-full bg-accent hover:bg-accent/90 text-accent-foreground">
                {submitting ? 'Submitting...' : 'Submit Feedback'}
              </Button>
            </form>
          )}
        </div>
      </div>
    </main>
  );
};

export default FeedbackPage;
