import { useEffect, useState } from 'react';
import { Link, Navigate, Outlet, useLocation } from 'react-router-dom';
import { AlertTriangle, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { getAdminAccessState, onAdminAuthStateChange, signOutAdmin, type AdminAccessState } from '@/lib/adminAuth';

type ProtectedAdminRouteProps = {
    children?: React.ReactNode;
};

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
    const location = useLocation();
    const [accessState, setAccessState] = useState<AdminAccessState | null>(null);

    useEffect(() => {
        let isMounted = true;

        const checkAccess = async () => {
            try {
                const nextState = await getAdminAccessState();

                if (isMounted) {
                    setAccessState(nextState);
                }
            } catch (error) {
                console.error('Unable to validate admin access.', error);

                if (isMounted) {
                    setAccessState({
                        session: null,
                        user: null,
                        isAdmin: false,
                    });
                }
            }
        };

        void checkAccess();

        const { data } = onAdminAuthStateChange(() => {
            void checkAccess();
        });

        return () => {
            isMounted = false;
            data.subscription.unsubscribe();
        };
    }, []);

    if (!accessState) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Checking admin access...
                </div>
            </div>
        );
    }

    if (!accessState.session) {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    if (!accessState.isAdmin) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="w-full max-w-md rounded-2xl border bg-card p-6 shadow-sm text-center space-y-4">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
                        <AlertTriangle className="h-6 w-6 text-destructive" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-serif font-semibold">Unauthorized</h1>
                        <p className="mt-2 text-sm text-muted-foreground">
                            {accessState.user?.email ?? 'This account'} is signed in, but it is not allowed to open the admin panel.
                        </p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        <Button asChild variant="outline">
                            <Link to="/">Back to site</Link>
                        </Button>
                        <Button
                            onClick={async () => {
                                await signOutAdmin();
                            }}
                        >
                            Sign out
                        </Button>
                    </div>
                </div>
            </div>
        );
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedAdminRoute;
