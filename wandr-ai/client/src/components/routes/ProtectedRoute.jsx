import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

function AuthGuardLoader() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center bg-[#f7f4ee] px-4">
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-5 text-sm font-medium text-slate-600 shadow-lg shadow-slate-900/5">
        Checking access...
      </div>
    </div>
  );
}

export function ProtectedRoute({
  children,
  requireAuth = true,
  allowedRoles,
  redirectTo = '/login',
  redirectAuthenticatedTo = null,
  forbiddenTo = '/',
}) {
  const { user, isCheckingAuth } = useAuthStore();
  const location = useLocation();

  if (isCheckingAuth) {
    return <AuthGuardLoader />;
  }

  if (!requireAuth) {
    if (user && redirectAuthenticatedTo) {
      return <Navigate to={redirectAuthenticatedTo} replace />;
    }

    return children;
  }

  if (!user) {
    return <Navigate to={redirectTo} replace state={{ from: location }} />;
  }

  if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
    return <Navigate to={forbiddenTo} replace />;
  }

  return children;
}
