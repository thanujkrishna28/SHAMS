import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

interface ProtectedRouteProps {
    allowedRoles?: string[];
}

const ProtectedRoute = ({ allowedRoles }: ProtectedRouteProps) => {
    const { user, isAuthenticated, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-screen bg-background text-primary">
                <div className="animate-pulse font-medium">Loading Smart HMS...</div>
            </div>
        );
    }

    if (!isAuthenticated || !user) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        // Redirect to appropriate dashboard based on role validity
        if (user.role === 'admin') return <Navigate to="/admin/dashboard" replace />;
        if (user.role === 'student') return <Navigate to="/student/dashboard" replace />;
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
