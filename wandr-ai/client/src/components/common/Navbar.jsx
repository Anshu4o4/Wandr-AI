import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Button } from './Button';
import { Plane, Menu, LogOut, LayoutDashboard, X, Sparkles, ChevronDown, MapPin, Compass, Heart, ArrowLeftRight } from 'lucide-react';
import { useState, useEffect, useLayoutEffect, useCallback, useRef } from 'react';
import { useCompareStore } from '../../store/compareStore';

export const Navbar = () => {
  const { user, logout } = useAuthStore();
  const { comparedTrips } = useCompareStore();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const mobileMenuButtonRef = useRef(null);
  const mobileMenuPanelRef = useRef(null);
  const mobileMenuCloseRef = useRef(null);
  const previouslyFocusedElementRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const getFocusableElements = useCallback((root) => {
    if (!root) return [];
    return Array.from(
      root.querySelectorAll(
        [
          'a[href]',
          'button:not([disabled])',
          'input:not([disabled])',
          'select:not([disabled])',
          'textarea:not([disabled])',
          '[tabindex]:not([tabindex="-1"])',
        ].join(',')
      )
    ).filter((element) => !element.hasAttribute('disabled') && element.getAttribute('aria-hidden') !== 'true');
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMenuOpen(false);
  }, []);

  const openMobileMenu = useCallback(() => {
    previouslyFocusedElementRef.current = document.activeElement;
    setIsMenuOpen(true);
  }, []);

  useLayoutEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    const previousPaddingRight = document.body.style.paddingRight;
    document.body.style.overflow = 'hidden';
    const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
    if (scrollbarWidth > 0) {
      document.body.style.paddingRight = `${scrollbarWidth}px`;
    }

    const focusFirstItem = () => {
      const focusables = getFocusableElements(mobileMenuPanelRef.current);
      const target = mobileMenuCloseRef.current || focusables[0];
      target?.focus({ preventScroll: true });
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMobileMenu();
        return;
      }

      if (event.key !== 'Tab') {
        return;
      }

      const focusables = getFocusableElements(mobileMenuPanelRef.current);
      if (focusables.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      const activeElement = document.activeElement;

      if (!mobileMenuPanelRef.current?.contains(activeElement)) {
        event.preventDefault();
        first.focus({ preventScroll: true });
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus({ preventScroll: true });
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus({ preventScroll: true });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    const timer = window.setTimeout(focusFirstItem, 0);

    return () => {
      window.clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = previousOverflow;
      document.body.style.paddingRight = previousPaddingRight;
      const focusTarget =
        previouslyFocusedElementRef.current instanceof HTMLElement
          ? previouslyFocusedElementRef.current
          : mobileMenuButtonRef.current;
      focusTarget?.focus({ preventScroll: true });
      previouslyFocusedElementRef.current = null;
    };
  }, [getFocusableElements, isMenuOpen]);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsDropdownOpen(false);
    closeMobileMenu();
  };

  const navLinkClassName = (path) => {
    const isActive = pathname === path;
    return `rounded-full px-4 py-2 text-sm font-medium transition-all duration-200 ${
      isActive
        ? 'bg-primary-600 text-white shadow-md shadow-primary-600/20'
        : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
    }`;
  };

  return (
    <header className={`fixed top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'border-b border-slate-200/80 bg-white/90 py-3 shadow-lg shadow-slate-900/5 backdrop-blur-xl' : 'bg-transparent py-4'}`}>
      <nav aria-label="Primary" className="w-full">
      <div className="mx-auto max-w-7xl px-3 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white shadow-lg shadow-primary-600/20">
              <Plane className="h-6 w-6" />
            </div>
            <div>
              <span className={`block text-lg font-black tracking-tight ${isScrolled ? 'text-slate-900' : 'text-slate-900'}`}>
                Wandr AI
              </span>
              <span className="hidden text-xs font-medium text-slate-500 sm:block">Premium travel planning</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden items-center gap-2 rounded-full border border-white/70 bg-white/75 p-2 shadow-lg shadow-slate-900/5 backdrop-blur-xl md:flex">
            <Link to="/explore" className={navLinkClassName('/explore')}>
              Explore
            </Link>
            <Link to="/planner" className={navLinkClassName('/planner')}>
              AI Planner
            </Link>
            <Link to="/wishlist" className={navLinkClassName('/wishlist')}>
              Wishlist
            </Link>
            <Link to="/compare" className={navLinkClassName('/compare')}>
              <span className="relative">
              Compare
              {comparedTrips.length > 0 && (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-secondary-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {comparedTrips.length}
                </span>
              )}
              </span>
            </Link>
            
            <Link to="/planner">
              <Button variant="premium" className="px-5 py-3 text-sm">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Planning
              </Button>
            </Link>

            {user ? (
              <div className="relative">
                <button 
                  type="button"
                  aria-haspopup="menu"
                  aria-expanded={isDropdownOpen}
                  aria-label="Open user menu"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 rounded-full border border-slate-200 bg-white px-2 py-1 shadow-sm transition hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                >
                  <img src={user.avatar} alt={`${user.name} avatar`} className="h-9 w-9 rounded-full border-2 border-white object-cover" />
                  <ChevronDown className="h-4 w-4 text-slate-500" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-3 w-56 overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-2xl animate-fadeIn">
                    <Link to="/dashboard" onClick={() => setIsDropdownOpen(false)} className="flex items-center px-4 py-2 text-sm text-slate-700 hover:bg-slate-50">
                      <LayoutDashboard className="h-4 w-4 mr-2" /> Dashboard
                    </Link>
                    <button type="button" onClick={handleLogout} className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 focus-visible:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500 focus-visible:ring-inset">
                      <LogOut className="h-4 w-4 mr-2" /> Sign out
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-4">
                <Link to="/login">
                  <Button variant="ghost">Log in</Button>
                </Link>
                <Link to="/register">
                  <Button variant="outline">Sign up</Button>
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              ref={mobileMenuButtonRef}
              type="button"
              aria-label={isMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={isMenuOpen}
              aria-controls="mobile-navigation"
              onClick={() => (isMenuOpen ? closeMobileMenu() : openMobileMenu())}
              className="min-h-11 min-w-11 rounded-full border border-slate-200 bg-white/90 p-2 text-slate-700 shadow-sm backdrop-blur hover:text-primary-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed inset-0 z-40 transition-[opacity,transform] duration-300 ease-out transform-gpu ${
          isMenuOpen ? 'pointer-events-auto opacity-100' : 'pointer-events-none opacity-0'
        }`}
        aria-hidden={!isMenuOpen}
      >
        {/* Backdrop */}
        <button
          type="button"
          aria-label="Close mobile navigation"
          tabIndex={-1}
          className={`absolute inset-0 bg-slate-900/20 backdrop-blur-sm transition-opacity duration-300 ease-out ${
            isMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={closeMobileMenu}
        />
        
        {/* Menu Content */}
        <div
          id="mobile-navigation"
          ref={mobileMenuPanelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Mobile navigation"
          className={`absolute right-0 top-0 flex h-full w-[min(88vw,20rem)] flex-col border-l border-slate-200 bg-white/95 p-5 text-slate-900 shadow-2xl backdrop-blur-xl transition-[transform,opacity] duration-300 ease-out motion-reduce:transition-none sm:w-80 ${
            isMenuOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
          style={{ willChange: 'transform, opacity' }}
        >
          <div className="mb-6 flex justify-end">
            <button
              ref={mobileMenuCloseRef}
              type="button"
              onClick={closeMobileMenu}
              className="min-h-11 min-w-11 rounded-full bg-slate-100 p-2 text-slate-600 hover:bg-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
              aria-label="Close mobile navigation"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          
          <div className="flex flex-col space-y-3">
            <Link to="/explore" onClick={closeMobileMenu} className="min-h-11 rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900">Explore</Link>
            <Link to="/planner" onClick={closeMobileMenu} className="min-h-11 rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900">AI Planner</Link>
            <Link to="/wishlist" onClick={closeMobileMenu} className="min-h-11 rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900">Wishlist</Link>
            <Link to="/compare" onClick={closeMobileMenu} className="relative flex min-h-11 items-center rounded-2xl px-4 py-3 text-base font-semibold text-slate-700 hover:bg-slate-100 hover:text-slate-900">
              Compare
              {comparedTrips.length > 0 && (
                <span className="ml-2 inline-flex min-w-5 items-center justify-center rounded-full bg-secondary-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                  {comparedTrips.length}
                </span>
              )}
            </Link>
            <Link to="/planner" onClick={closeMobileMenu} className="py-2">
              <Button variant="premium" className="w-full py-3 text-md">
                <Sparkles className="mr-2 h-4 w-4" />
                Start Planning
              </Button>
            </Link>
            
            <div className="pt-4 mt-auto">
              {user ? (
                <div className="space-y-4">
                  <div className="mb-4 flex items-center space-x-3 rounded-2xl bg-slate-100 p-4">
                  <img src={user.avatar} alt={`${user.name} avatar`} className="h-10 w-10 rounded-full border border-slate-200" />
                    <span className="truncate font-bold text-slate-900">{user.name}</span>
                  </div>
                  <Link to="/dashboard" onClick={closeMobileMenu} className="flex min-h-11 items-center rounded-2xl px-4 py-3 font-medium text-slate-700 transition-colors hover:bg-slate-100 hover:text-slate-900">
                     <LayoutDashboard className="h-5 w-5 mr-3" /> Dashboard
                  </Link>
                    <button type="button" onClick={() => { handleLogout(); }} className="flex min-h-11 w-full items-center rounded-2xl px-4 py-3 font-medium text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-400 focus-visible:ring-offset-2 focus-visible:ring-offset-white">
                        <LogOut className="h-5 w-5 mr-3" /> Sign out
                    </button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Link to="/login" onClick={closeMobileMenu}><Button variant="secondary" className="w-full">Log in</Button></Link>
                  <Link to="/register" onClick={closeMobileMenu}><Button variant="premium" className="w-full">Sign up</Button></Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      </nav>
    </header>
  );
};
