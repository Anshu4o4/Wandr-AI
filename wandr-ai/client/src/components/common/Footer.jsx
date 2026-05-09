import { Plane, Facebook, Twitter, Instagram, Github, Sparkles, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer = () => {
  return (
    <footer className="border-t border-slate-200 bg-[#f7f4ee] text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-12 sm:py-16">
          <div className="mb-10 rounded-[2rem] border border-slate-200 bg-white p-8 shadow-lg shadow-slate-900/5">
            <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
              <div className="max-w-2xl">
                <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-primary-700">
                  <Sparkles className="h-4 w-4 text-secondary-500" />
                  Premium travel planning
                </div>
                <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">Plan smarter, travel better, and book with confidence.</h2>
                <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600">
                  Wandr AI blends polished design, curated trip discovery, and AI itinerary generation in one place.
                </p>
              </div>
              <Link
                to="/planner"
                className="inline-flex items-center rounded-full bg-gradient-to-r from-primary-600 to-accent-500 px-6 py-3 font-semibold text-white shadow-lg shadow-primary-600/15 transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-300 focus-visible:ring-offset-2 focus-visible:ring-offset-[#f7f4ee]"
              >
                Start planning
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 sm:grid-cols-2 lg:grid-cols-4">
            <div className="md:col-span-1">
              <Link to="/" className="flex items-center space-x-2 mb-4">
                <Plane className="h-8 w-8 text-primary-600" />
                <span className="text-2xl font-bold tracking-tight text-slate-900">Wandr AI</span>
              </Link>
              <p className="text-sm leading-6 text-slate-600">
                Your intelligent travel companion for premium planning, discovery, and booking.
              </p>
            </div>

            <div>
              <h3 className="mb-4 font-medium text-slate-900">Discover</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/explore" className="transition-colors hover:text-primary-700">Explore Destinations</Link></li>
                <li><Link to="/planner" className="transition-colors hover:text-primary-700">AI Trip Planner</Link></li>
                <li><Link to="/explore?sort=rating" className="transition-colors hover:text-primary-700">Top Rated Trips</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-medium text-slate-900">Company</h3>
              <ul className="space-y-2 text-sm text-slate-600">
                <li><Link to="/dashboard" className="transition-colors hover:text-primary-700">Dashboard</Link></li>
                <li><Link to="/login" className="transition-colors hover:text-primary-700">Sign In</Link></li>
                <li><Link to="/register" className="transition-colors hover:text-primary-700">Create Account</Link></li>
              </ul>
            </div>

            <div>
              <h3 className="mb-4 font-medium text-slate-900">Connect With Us</h3>
              <div className="flex space-x-4">
                <a href="https://www.facebook.com" target="_blank" rel="noreferrer" aria-label="Visit our Facebook page" className="text-slate-500 transition-colors hover:text-primary-700">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="Visit our X profile" className="text-slate-500 transition-colors hover:text-primary-700">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="https://www.instagram.com" target="_blank" rel="noreferrer" aria-label="Visit our Instagram profile" className="text-slate-500 transition-colors hover:text-primary-700">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="Visit our GitHub profile" className="text-slate-500 transition-colors hover:text-primary-700">
                  <Github className="h-5 w-5" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200 pt-8 text-sm text-slate-500 md:flex-row">
            <p>&copy; {new Date().getFullYear()} Wandr AI. All rights reserved.</p>
            <div className="mt-4 flex space-x-4 md:mt-0">
              <a href="mailto:support@wandr.ai" className="transition-colors hover:text-primary-700">Contact Support</a>
              <a href="mailto:legal@wandr.ai" className="transition-colors hover:text-primary-700">Legal</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
