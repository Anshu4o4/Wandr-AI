import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Plane } from 'lucide-react';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || { pathname: '/' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await login(email, password);
    if (success) {
      navigate(`${from.pathname || '/'}${from.search || ''}`, { replace: true });
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-100">
        <div className="text-center">
          <Link to="/" className="inline-flex items-center justify-center space-x-2">
            <Plane className="h-10 w-10 text-primary-600" />
            <span className="text-3xl font-extrabold text-slate-900 tracking-tight">Wandr AI</span>
          </Link>
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Welcome back</h2>
          <p className="mt-2 text-sm text-slate-600">
            Please enter your details to sign in.
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 text-red-700 p-3 rounded-md text-sm text-center">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="block text-sm font-medium text-slate-700">Password</label>
                <div className="text-sm">
                  <Link to="#" className="font-medium text-primary-600 hover:text-primary-500">
                    Forgot password?
                  </Link>
                </div>
              </div>
              <Input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-slate-300 rounded"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-slate-700">
              Remember me
            </label>
          </div>

          <Button type="submit" className="w-full text-lg" isLoading={isLoading}>
            Sign in
          </Button>

          <div className="mt-6 relative">
            <div className="absolute inset-0 flex items-center" aria-hidden="true">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Or continue with</span>
            </div>
          </div>

          <div className="flex justify-center">
            <GoogleLogin
              onSuccess={async (credentialResponse) => {
                clearError();
                const success = await loginWithGoogle(credentialResponse.credential);
                if (success) {
                  navigate(`${from.pathname || '/'}${from.search || ''}`, { replace: true });
                }
              }}
              onError={() => clearError()}
              useOneTap={false}
              theme="outline"
              size="large"
              width="320"
              text="signin_with"
              shape="pill"
            />
          </div>

        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Not a member?{' '}
          <Link to="/register" className="font-medium text-primary-600 hover:text-primary-500">
            Sign up now
          </Link>
        </p>

      </div>
    </div>
  );
}
