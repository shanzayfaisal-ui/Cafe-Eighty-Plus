import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoaderCircle, LockKeyhole, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

// Fixed admin credentials
const ADMIN_EMAIL = 'amnashafi@gmail.com';
const ADMIN_PASSWORD = 'hehe1234';

const AdminLoginPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const redirectTo = useMemo(() => {
        const state = location.state as { from?: { pathname?: string } } | null;
        return state?.from?.pathname ?? '/admin';
    }, [location.state]);

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [checkingSession, setCheckingSession] = useState(true);

    useEffect(() => {
        // Check if already logged in as admin
        const isAdmin = localStorage.getItem('isAdmin') === 'true';
        if (isAdmin) {
            navigate(redirectTo, { replace: true });
            return;
        }
        setCheckingSession(false);
    }, [navigate, redirectTo]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);

        try {
            // Check credentials
            if (email.trim().toLowerCase() === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
                // Set admin session in localStorage
                localStorage.setItem('isAdmin', 'true');

                toast({
                    title: 'Welcome back',
                    description: 'Admin access granted successfully.',
                });
                navigate(redirectTo, { replace: true });
            } else {
                toast({
                    title: 'Invalid admin credentials',
                    description: 'The email or password you entered is incorrect.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Login failed',
                description: 'An unexpected error occurred. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="min-h-screen bg-muted/30 px-4 py-10 flex items-center justify-center">
            <Card className="w-full max-w-md shadow-sm">
                <CardHeader className="text-center space-y-3">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                        <LockKeyhole className="h-6 w-6 text-accent" />
                    </div>
                    <div>
                        <p className="text-xs font-medium uppercase tracking-[0.3em] text-accent">Cafe Eighty Plus</p>
                        <CardTitle className="mt-2">Admin Login</CardTitle>
                        <CardDescription>Enter admin credentials to access the dashboard.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    {checkingSession ? (
                        <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
                            <LoaderCircle className="h-4 w-4 animate-spin" />
                            Checking session...
                        </div>
                    ) : (
                        <div className="space-y-5">
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-email">Email</Label>
                                    <Input
                                        id="admin-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        autoComplete="email"
                                        placeholder="admin@example.com"
                                        required
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="admin-password">Password</Label>
                                    <Input
                                        id="admin-password"
                                        type="password"
                                        value={password}
                                        onChange={(event) => setPassword(event.target.value)}
                                        autoComplete="current-password"
                                        placeholder="Enter your password"
                                        required
                                    />
                                </div>

                                <Button type="submit" className="w-full" disabled={loading}>
                                    {loading ? <LoaderCircle className="animate-spin" /> : <ShieldCheck />}
                                    {loading ? 'Signing in...' : 'Login to admin'}
                                </Button>
                            </form>

                            <div className="text-center">
                                <Link to="/" className="text-sm text-accent hover:underline">
                                    ← Back to public site
                                </Link>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>
        </main>
    );
};

export default AdminLoginPage;
