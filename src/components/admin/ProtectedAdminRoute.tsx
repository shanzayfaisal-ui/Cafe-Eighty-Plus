import { useEffect, useState } from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { LoaderCircle } from 'lucide-react';

type ProtectedAdminRouteProps = {
    children?: React.ReactNode;
};

const ProtectedAdminRoute = ({ children }: ProtectedAdminRouteProps) => {
    const location = useLocation();
    const [isAdmin, setIsAdmin] = useState<boolean | null>(null);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        // Check admin status from localStorage
        const adminStatus = localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminStatus);
        setChecking(false);
    }, []);

    if (checking) {
        return (
            <div className="min-h-screen bg-background flex items-center justify-center px-4">
                <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <LoaderCircle className="h-5 w-5 animate-spin" />
                    Checking admin access...
                </div>
            </div>
        );
    }

    if (!isAdmin) {
        return <Navigate to="/admin/login" replace state={{ from: location }} />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default ProtectedAdminRoute;
