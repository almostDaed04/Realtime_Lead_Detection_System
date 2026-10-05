import { Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute — guards routes that require authentication and/or specific roles.
 * Redirects to /login if not authenticated, or / if insufficient permissions.
 */
const ProtectedRoute = ({ children, requiredRole }) => {
  const { isAuthenticated, user, loading, logout } = useAuth();
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner spinner-lg"></div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user?.role !== requiredRole) {
    return (
      <div className="page-container flex min-h-[60vh] items-center justify-center">
        <div className="glass-card max-w-lg p-8 text-center">
          <h1 className="text-2xl font-bold text-slate-100">Admin access required</h1>
          <p className="mt-3 text-slate-400">
            This account is signed in as <span className="text-slate-200">{user?.role || 'unknown'}</span>.
            Ask an administrator to grant this account the admin role, then sign out and sign in again.
          </p>
          <button
            onClick={() => {
              logout();
              navigate('/login');
            }}
            className="btn btn-secondary mt-6"
          >
            Go to sign in
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;
