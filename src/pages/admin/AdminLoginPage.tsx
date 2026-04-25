import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { LoaderCircle, LockKeyhole, ShieldAlert, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';
import { getAdminAccessState, signInAdmin, signOutAdmin } from '@/lib/adminAuth';

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
    const [unauthorizedEmail, setUnauthorizedEmail] = useState<string | null>(null);

    useEffect(() => {
        let isMounted = true;

        const checkExistingSession = async () => {
            try {
                const accessState = await getAdminAccessState();

                if (!isMounted) {
                    return;
                }

                if (accessState.session && accessState.isAdmin) {
                    navigate(redirectTo, { replace: true });
                    return;
                }

                if (accessState.session && !accessState.isAdmin) {
                    setUnauthorizedEmail(accessState.user?.email ?? '');
                }
            } catch (error) {
                console.error('Unable to check admin session.', error);
            } finally {
                if (isMounted) {
                    setCheckingSession(false);
                }
            }
        };

        void checkExistingSession();

        return () => {
            isMounted = false;
        };
    }, [navigate, redirectTo]);

    const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setLoading(true);
        setUnauthorizedEmail(null);

        try {
            const { error } = await signInAdmin(email, password);

            if (error) {
                throw error;
            }

            const accessState = await getAdminAccessState();

            if (!accessState.isAdmin) {
                setUnauthorizedEmail(accessState.user?.email ?? email);
                toast({
                    title: 'Unauthorized account',
                    description: 'This login is valid, but it is not listed in admin_users.',
                    variant: 'destructive',
                });
                return;
            }

            toast({
                title: 'Welcome back',
                description: 'Admin access granted successfully.',
            });
            navigate(redirectTo, { replace: true });
        } catch (error) {
            toast({
                title: 'Login failed',
                description: error instanceof Error ? error.message : 'Please check your email and password.',
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
                        <CardDescription>Sign in with your real Supabase Auth admin account.</CardDescription>
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
                            {unauthorizedEmail && (
                                <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm">
                                    <div className="flex items-center gap-2 font-medium text-destructive">
                                        <ShieldAlert className="h-4 w-4" />
                                        Unauthorized
                                    </div>
                                    <p className="mt-2 text-muted-foreground">
                                        <span className="font-medium text-foreground">{unauthorizedEmail}</span> is signed in, but not authorized for admin access.
                                    </p>
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="mt-3"
                                        onClick={async () => {
                                            await signOutAdmin();
                                            setUnauthorizedEmail(null);
                                        }}
                                    >
                                        Sign out this account
                                    </Button>
                                </div>
                            )}

                            <form onSubmit={handleSubmit} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="admin-email">Email</Label>
                                    <Input
                                        id="admin-email"
                                        type="email"
                                        value={email}
                                        onChange={(event) => setEmail(event.target.value)}
                                        autoComplete="email"
                                        placeholder="admin@yahoo.com"
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

                            <p className="text-xs text-center text-muted-foreground">
                                Use the Supabase setup steps to create and authorize the initial admin account before signing in here.
                            </p>

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
