import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { PageLoader } from '../ui/LoadingSpinner';
import type { UserRole } from '../../types';

interface ProtectedRouteProps {
  children: React.ReactNode;
  role: 'admin' | 'voter';
}

export default function ProtectedRoute({ children, role }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role: userRole } = useAuth();

  if (isLoading) {
    return <PageLoader />;
  }

  if (!isAuthenticated) {
    const loginPath = role === 'admin' ? '/admin/login' : '/voter/login';
    return <Navigate to={loginPath} replace />;
  }

  if (userRole !== role) {
    const loginPath = role === 'admin' ? '/admin/login' : '/voter/login';
    return <Navigate to={loginPath} replace />;
  }

  return <>{children}</>;
}
