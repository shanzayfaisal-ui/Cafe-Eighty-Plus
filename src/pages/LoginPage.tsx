import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';

const LoginPage = () => {
  const navigate = useNavigate();
  const { user, login, loading } = useAuth();
  const { toast } = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      navigate('/profile', { replace: true });
    }
  }, [user, navigate]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    try {
      await login(email.trim(), password);
      toast({ title: 'Welcome back!', description: 'You are now logged in.' });
      navigate('/profile', { replace: true });
    } catch (error: any) {
      toast({ title: 'Login failed', description: error.message || 'Invalid credentials.', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FDFCFB] flex items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl border border-stone-100 p-8 sm:p-10">
        <div className="text-center mb-8">
          <p className="text-xs font-bold uppercase tracking-[0.35em] text-stone-400 mb-2">Account Login</p>
          <h1 className="text-3xl font-serif font-bold text-[#2D1B14]">Sign in to your account</h1>
          <p className="text-sm text-stone-500 mt-3">Track orders, save address details, and enjoy faster checkout.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Email</label>
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
              <Input
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                type="email"
                placeholder="you@example.com"
                required
                className="pl-12"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold uppercase tracking-widest text-stone-400">Password</label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-stone-300" />
              <Input
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                placeholder="Enter your password"
                required
                className="pl-12"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || loading}
            className="w-full bg-[#5D3A26] text-white rounded-2xl py-4 uppercase tracking-[0.2em] text-xs font-bold hover:bg-[#4A2E1E] transition-colors disabled:opacity-50"
          >
            {submitting ? 'Signing in...' : 'Sign in'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-stone-500">
          New here?{' '}
          <Link to="/signup" className="font-semibold text-[#5D3A26] hover:underline">
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
