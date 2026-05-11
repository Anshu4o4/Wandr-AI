import { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '../store/authStore';
import { GOOGLE_CLIENT_ID } from '../config/googleOAuth';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { Plane } from 'lucide-react';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, loginWithGoogle, isLoading, error, clearError } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from || { pathname: '/' };

  const handleSubmit = async (e) => {
    e.preventDefault();
    clearError();
    const success = await register(name, email, password);
    if (success) {
      navigate(
        { pathname: from.pathname || '/', search: from.search || '', hash: from.hash || '' },
        { replace: true, state: from.state }
      );
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
          <h2 className="mt-6 text-2xl font-bold text-slate-900">Create an account</h2>
          <p className="mt-2 text-sm text-slate-600">
            Start planning your dream trip today.
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
              label="Full name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="John Doe"
            />
            
            <Input
              label="Email address"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
            
            <Input
              label="Password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              minLength={8}
            />
          </div>

          <Button type="submit" className="w-full text-lg" isLoading={isLoading}>
            Sign up
          </Button>

          {GOOGLE_CLIENT_ID && (
            <>
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
                      navigate(
                        { pathname: from.pathname || '/', search: from.search || '', hash: from.hash || '' },
                        { replace: true, state: from.state }
                      );
                    }
                  }}
                  onError={() => clearError()}
                  useOneTap={false}
                  theme="outline"
                  size="large"
                  width="320"
                  text="signup_with"
                  shape="pill"
                />
              </div>
            </>
          )}
        </form>

        <p className="mt-8 text-center text-sm text-slate-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500">
            Log in here
          </Link>
        </p>

      </div>
    </div>
  );
}
