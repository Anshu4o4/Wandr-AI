import { lazy, Suspense, useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import { useAuthStore } from './store/authStore';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';
import { ProtectedRoute } from './components/routes/ProtectedRoute';

// Lazy load all pages for code splitting
const Home = lazy(() => import('./pages/Home'));
const Explore = lazy(() => import('./pages/Explore'));
const TripPlanner = lazy(() => import('./pages/TripPlanner'));
const TripDetail = lazy(() => import('./pages/TripDetail'));
const Booking = lazy(() => import('./pages/Booking'));
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Wishlist = lazy(() => import('./pages/Wishlist'));
const Compare = lazy(() => import('./pages/Compare'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const NotFound = lazy(() => import('./pages/NotFound'));
const AIChatBox = lazy(() => import('./components/ai/AIChatBox').then((mod) => ({ default: mod.AIChatBox })));

/**
 * Loading Fallback Component
 * Shown while a lazy page is being loaded
 */
function PageLoader() {
  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-slate-50">
      <div className="flex flex-col items-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mb-4"></div>
        <p className="text-slate-600 font-medium">Loading page...</p>
      </div>
    </div>
  );
}

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

function App() {
  const { refreshToken } = useAuthStore();

  useEffect(() => {
    const cookies = document.cookie.split('; ');
    const loggedInCookie = cookies.find(c => c.startsWith('logged_in='));
    const isLoggedIn = loggedInCookie === 'logged_in=true';
    
    if (isLoggedIn) {
      refreshToken();
    } else {
      useAuthStore.setState({ isCheckingAuth: false });
    }
  }, [refreshToken]);

  return (
    <GoogleOAuthProvider clientId={import.meta.env.VITE_GOOGLE_CLIENT_ID || process.env.REACT_APP_GOOGLE_CLIENT_ID}>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ScrollToTop />
        <div className="flex flex-col min-h-screen">
          <a
            href="#main-content"
            className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-white focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-primary-700 focus:shadow-lg"
          >
            Skip to content
          </a>
          <Navbar />
          
          <main id="main-content" tabIndex={-1} className="flex-grow">
            <Suspense fallback={<PageLoader />}>
              <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/explore" element={<Explore />} />
              <Route
                path="/planner"
                element={
                  <ProtectedRoute>
                    <TripPlanner />
                  </ProtectedRoute>
                }
              />
              <Route path="/trip/:id" element={<TripDetail />} />
              
              {/* Auth Routes */}
              <Route
                path="/login"
                element={
                  <ProtectedRoute requireAuth={false} redirectAuthenticatedTo="/">
                    <Login />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/register"
                element={
                  <ProtectedRoute requireAuth={false} redirectAuthenticatedTo="/">
                    <Register />
                  </ProtectedRoute>
                }
              />
              
              <Route
                path="/booking"
                element={
                  <ProtectedRoute>
                    <Booking />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/dashboard"
                element={
                  <ProtectedRoute>
                    <Dashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/wishlist"
                element={
                  <ProtectedRoute>
                    <Wishlist />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/compare"
                element={
                  <ProtectedRoute>
                    <Compare />
                  </ProtectedRoute>
                }
              />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Suspense>
        </main>

        <Footer />
        
        {/* Global floating AI chat */}
        <Suspense fallback={null}>
          <AIChatBox />
        </Suspense>
      </div>
    </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
