import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, User } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const SignupPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signup } = useAuth();
  const { toast } = useToast();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/profile';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!fullName || !email || !password) {
      toast({ title: 'Missing fields', description: 'Please complete all required fields.', variant: 'destructive' });
      return;
    }

    if (password !== confirmPassword) {
      toast({ title: 'Password mismatch', description: 'Both passwords must match.', variant: 'destructive' });
      return;
    }

    setSubmitting(true);

    try {
      await signup(email.trim(), password, fullName.trim());
      toast({ title: 'Account created', description: 'Welcome! Your profile is ready.' });
      navigate(from, { replace: true });
    } catch (error: any) {
      toast({ title: 'Signup failed', description: error.message || 'Unable to create account.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    // ☕ OUTER BACKGROUND: Uses 'bg-background' to turn into the deep pitch-dark color seen behind your profile cards
    <div className="min-h-screen bg-background text-foreground py-20 px-4 sm:px-6 flex items-center justify-center transition-colors duration-300">
      <div className="w-full max-w-md mx-auto">
        
        {/* ☕ THE INNER CARD: Uses 'bg-card' and your custom 'border-border' properties to perfectly adapt to your rich coffee-brown look */}
        <div className="bg-card rounded-[2.5rem] border border-border/60 dark:border-border/20 p-8 sm:p-10 shadow-soft transition-colors duration-300">
          
          <div className="text-center mb-8">
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground font-bold">Profile</p>
            <h1 className="text-3xl font-serif font-bold text-foreground mt-2">Welcome to Eighty Plus</h1>
            <p className="text-sm text-muted-foreground mt-3">Create an account to view and check your orders history layout.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Full Name */}
            <label className="block space-y-2 text-sm">
              <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground text-[10px]">Full name</span>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input 
                  value={fullName} 
                  onChange={(event) => setFullName(event.target.value)} 
                  placeholder="Name"
                  required
                  className="pl-12 bg-background dark:bg-input border-border/60 text-foreground dark:border-border/40" 
                />
              </div>
            </label>

            {/* Email */}
            <label className="block space-y-2 text-sm">
              <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground text-[10px]">Email Address</span>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input 
                  type="email"
                  value={email} 
                  onChange={(event) => setEmail(event.target.value)} 
                  placeholder="you@example.com"
                  required
                  className="pl-12 bg-background dark:bg-input border-border/60 text-foreground dark:border-border/40" 
                />
              </div>
            </label>

            {/* Password */}
            <label className="block space-y-2 text-sm">
              <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground text-[10px]">Password</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input 
                  type="password"
                  value={password} 
                  onChange={(event) => setPassword(event.target.value)} 
                  placeholder="••••••••"
                  required
                  className="pl-12 bg-background dark:bg-input border-border/60 text-foreground dark:border-border/40" 
                />
              </div>
            </label>

            {/* Confirm Password */}
            <label className="block space-y-2 text-sm">
              <span className="font-semibold uppercase tracking-[0.2em] text-muted-foreground text-[10px]">Confirm Password</span>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground z-10" />
                <Input 
                  type="password"
                  value={confirmPassword} 
                  onChange={(event) => setConfirmPassword(event.target.value)} 
                  placeholder="••••••••"
                  required
                  className="pl-12 bg-background dark:bg-input border-border/60 text-foreground dark:border-border/40" 
                />
              </div>
            </label>

            {/* Sign Up Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#5D3A26] dark:bg-primary text-white dark:text-primary-foreground rounded-2xl py-4 uppercase tracking-[0.2em] text-xs font-bold hover:opacity-90 transition-all shadow-md disabled:opacity-50 pt-2"
            >
              {submitting ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          {/* Bottom Redirect */}
          <p className="mt-6 text-center text-sm text-muted-foreground">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-[#5D3A26] dark:text-primary hover:underline">
              Sign in
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
};

export default SignupPage;