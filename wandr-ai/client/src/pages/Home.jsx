import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { TripCard } from '../components/trips/TripCard';
import { TripCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { Search, Sparkles, Map, Star, Navigation, ArrowRight, ShieldCheck, Globe, Wallet, Compass, CheckCircle2, Route, Quote, TrendingUp, Users, BadgeCheck } from 'lucide-react';
import { useState } from 'react';
import { FEATURED_VIBES, FEATURED_TRIPS, SOCIAL_PROOF_STATS, TESTIMONIALS, TRAVELER_REVIEW_HIGHLIGHTS } from '../data/travelCatalog';
import { getOptimizedImageUrl } from '../utils/image';

export default function Home() {
  const { fetchFeaturedTrips, featuredTrips } = useTripStore();
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const premiumFeatures = [
    {
      icon: <Compass className="h-5 w-5" />,
      title: 'Smart itinerary builder',
      desc: 'Plan every day around your budget, interests, and travel pace.',
    },
    {
      icon: <ShieldCheck className="h-5 w-5" />,
      title: 'Trusted travel choices',
      desc: 'See curated trips with ratings, details, and save-worthy picks.',
    },
    {
      icon: <Wallet className="h-5 w-5" />,
      title: 'Budget-first planning',
      desc: 'Compare options and keep costs visible before you book.',
    },
    {
      icon: <Globe className="h-5 w-5" />,
      title: 'Global destination discovery',
      desc: 'Browse premium trips across cities, beaches, and adventure hubs.',
    },
    {
      icon: <Route className="h-5 w-5" />,
      title: 'Personalized route planning',
      desc: 'Turn one destination into a full trip with sights, stays, and timing.',
    },
  ];

  const trustSignals = [
    'Luxury trip layouts',
    'Smart itinerary generation',
    'Curated destination discovery',
    'Flexible budget planning',
  ];

  const popularTrips = [...FEATURED_TRIPS].sort((a, b) => (b.ratingsCount || 0) - (a.ratingsCount || 0)).slice(0, 3);
  const trendingDestinations = [...FEATURED_TRIPS].slice(0, 4);

  useEffect(() => {
    fetchFeaturedTrips();
  }, [fetchFeaturedTrips]);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explore?destination=${encodeURIComponent(searchQuery)}`);
    }
  };

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* Hero Section */}
      <section className="relative flex min-h-[82vh] items-center justify-center overflow-hidden bg-[#f7f4ee] md:h-[90vh]">
        {/* Background */}
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[linear-gradient(135deg,#fffdfa_0%,#f8f3eb_45%,#edf4f6_100%)]" />
          <div className="absolute -left-24 top-16 h-80 w-80 rounded-full bg-primary-200/50 blur-3xl" />
          <div className="absolute right-0 top-1/3 h-96 w-96 rounded-full bg-secondary-200/40 blur-3xl" />
          <div className="absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-accent-200/40 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.75),transparent_32%),linear-gradient(to_bottom,rgba(255,255,255,0.15),rgba(247,244,238,0.84))]" />
        </div>

        {/* Hero Content */}
        <div className="relative z-10 mx-auto mt-16 max-w-7xl px-4 text-center sm:px-6 lg:px-8 md:mt-20">
          <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white/80 px-4 py-2 text-sm font-medium text-slate-700 backdrop-blur-md shadow-lg shadow-slate-900/5">
            <Sparkles className="h-4 w-4 text-secondary-500" />
            Premium AI travel planning
          </div>
          <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-slate-900 animate-fadeInUp sm:text-5xl md:mb-8 md:text-6xl">
            Plan Your Perfect Trip <br className="hidden sm:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-700 to-secondary-500">
              with AI
            </span>
          </h1>
          <p className="mt-4 mx-auto mb-10 max-w-2xl text-lg font-light text-slate-600 sm:text-xl">
            Discover destinations, generate custom itineraries, and book unforgettable experiences tailored just for you.
          </p>

          {/* Search Bar */}
          <div className="mx-auto mb-8 flex max-w-3xl transform flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white p-2 shadow-xl shadow-slate-900/5 transition-transform hover:scale-[1.02] md:flex-row md:rounded-full">
            <div className="flex-grow flex items-center pl-4 pr-2 w-full">
              <Search className="mr-2 h-6 w-6 flex-shrink-0 text-slate-400" />
              <form onSubmit={handleSearch} className="w-full">
                <label htmlFor="home-search" className="sr-only">Search destinations</label>
                <input 
                  id="home-search"
                  type="text" 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Where do you want to go?" 
                  aria-label="Search destinations"
                  className="w-full bg-transparent py-3 text-lg text-slate-800 placeholder-slate-400 focus:outline-none focus-visible:outline-none"
                />
              </form>
            </div>
            <div className="w-full p-1 md:w-auto md:p-0">
              <Button
                type="button"
                size="lg"
                onClick={() => {
                  const destination = searchQuery.trim();
                  navigate(destination ? `/planner?destination=${encodeURIComponent(destination)}` : '/planner');
                }}
                className="w-full rounded-xl border-none px-8 py-4 text-lg font-bold bg-gradient-to-r from-primary-600 to-accent-500 hover:from-primary-700 hover:to-accent-600"
              >
                <Sparkles className="h-5 w-5 mr-2" />
                Auto Generate
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 text-sm font-medium text-slate-600 sm:grid-cols-2 sm:gap-6 sm:justify-center">
            <span className="flex items-center justify-center"><Star className="mr-1 h-4 w-4 text-secondary-500" /> 4.9/5 Average Rating</span>
            <span className="flex items-center justify-center"><Map className="mr-1 h-4 w-4 text-primary-500" /> 10,000+ Itineraries generated</span>
          </div>
        </div>
      </section>

      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-5">
            {premiumFeatures.map((feature) => (
              <div
                key={feature.title}
                className="group rounded-3xl border border-slate-100 bg-slate-50 p-6 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-600 to-secondary-500 text-white shadow-lg shadow-primary-500/20">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-bold text-slate-900">{feature.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-100 bg-gradient-to-r from-primary-50 via-white to-secondary-50 p-5 shadow-sm sm:p-8">
            <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-2">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Why travelers choose Wandr</p>
                <h2 className="mt-3 text-3xl font-extrabold text-slate-900">A cleaner, more premium way to plan travel</h2>
                <p className="mt-3 text-lg text-slate-600">
                  Everything feels more curated, more confident, and easier to use from the first click.
                </p>
                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {trustSignals.map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl bg-white px-4 py-3 shadow-sm">
                      <CheckCircle2 className="h-5 w-5 text-accent-500" />
                      <span className="text-sm font-medium text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {SOCIAL_PROOF_STATS.map((stat) => (
                  <div key={stat.label} className="rounded-3xl bg-white p-5 text-center shadow-sm border border-slate-100">
                    <div className="text-3xl font-extrabold text-slate-900">{stat.value}</div>
                    <div className="mt-1 text-sm text-slate-500">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-8 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-8">
            <div className="mb-6 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Social proof</p>
                <h2 className="mt-2 text-3xl font-extrabold text-slate-900">Travelers trust Wandr for the right reasons</h2>
                <p className="mt-3 max-w-2xl text-slate-600">Realistic traveler feedback, trending picks, and popular destinations help users make faster decisions.</p>
              </div>
              <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
                <span className="inline-flex items-center gap-2 rounded-full bg-primary-50 px-3 py-2 text-primary-700"><Users className="h-4 w-4" /> 10,000+ travelers</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-2 text-emerald-700"><BadgeCheck className="h-4 w-4" /> Verified reviews</span>
                <span className="inline-flex items-center gap-2 rounded-full bg-amber-50 px-3 py-2 text-amber-700"><TrendingUp className="h-4 w-4" /> Popular right now</span>
              </div>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="rounded-3xl bg-slate-50 p-5">
                <div className="mb-4 flex items-center gap-2">
                  <Quote className="h-5 w-5 text-primary-600" />
                  <h3 className="text-lg font-bold text-slate-900">Testimonials</h3>
                </div>
                <div className="grid gap-4 md:grid-cols-3">
                  {TESTIMONIALS.map((item) => (
                    <article key={item.name} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="mb-4 flex items-center gap-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-sm font-black text-primary-700">
                          {item.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900">{item.name}</p>
                          <p className="text-xs text-slate-500">{item.location}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 text-secondary-500">
                        {[...Array(5)].map((_, idx) => (
                          <Star key={idx} className={`h-4 w-4 ${idx < item.rating ? 'fill-current' : 'text-slate-300'}`} />
                        ))}
                      </div>
                      <p className="mt-4 text-sm leading-6 text-slate-600">“{item.quote}”</p>
                      <p className="mt-4 text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">{item.trip}</p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="space-y-6">
                <div className="rounded-3xl bg-gradient-to-br from-primary-50 to-white p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-primary-600" />
                    <h3 className="text-lg font-bold text-slate-900">Popular right now</h3>
                  </div>
                  <div className="space-y-3">
                    {popularTrips.map((trip, index) => (
                      <Link key={trip._id} to={`/trip/${trip._id}`} className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm transition hover:-translate-y-0.5">
                        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-50 text-sm font-black text-primary-700">{index + 1}</span>
                        <img src={getOptimizedImageUrl(trip.coverImage, { width: 160, quality: 68 })} alt={trip.title} loading="lazy" decoding="async" className="h-16 w-16 rounded-xl object-cover" />
                        <div className="min-w-0 flex-1">
                          <p className="font-semibold text-slate-900 line-clamp-1">{trip.title}</p>
                          <p className="text-sm text-slate-500">{trip.destination}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-slate-900">{trip.priceRange}</p>
                          <p className="text-xs text-slate-500">{trip.rating}★ · {trip.ratingsCount}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-slate-50 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <Map className="h-5 w-5 text-primary-600" />
                    <h3 className="text-lg font-bold text-slate-900">Trending destinations</h3>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {trendingDestinations.map((trip) => (
                      <Link key={trip.destination} to={`/explore?destination=${encodeURIComponent(trip.destination.split(',')[0])}`} className="group overflow-hidden rounded-2xl bg-white shadow-sm">
                        <img src={getOptimizedImageUrl(trip.coverImage, { width: 500, quality: 68 })} alt={trip.destination} loading="lazy" decoding="async" className="h-28 w-full object-cover transition duration-500 group-hover:scale-105" />
                        <div className="p-3">
                          <p className="text-sm font-bold text-slate-900">{trip.destination}</p>
                          <p className="text-xs text-slate-500">{trip.rating}★ · {trip.priceRange}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-slate-100 bg-white p-5">
              <div className="mb-4 flex items-center gap-2">
                <Star className="h-5 w-5 text-secondary-500" />
                <h3 className="text-lg font-bold text-slate-900">User review highlights</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-3">
                {TRAVELER_REVIEW_HIGHLIGHTS.map((item) => (
                  <div key={item.title} className="rounded-2xl bg-slate-50 p-4">
                    <p className="font-bold text-slate-900">{item.title}</p>
                    <p className="mt-2 text-sm leading-6 text-slate-600">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-gradient-to-b from-slate-50 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-10 flex flex-col items-start justify-between gap-6 sm:items-end lg:flex-row">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Discover by vibe</p>
              <h2 className="mt-3 text-3xl sm:text-4xl font-extrabold text-slate-900">Find a style that feels premium</h2>
              <p className="mt-3 text-lg text-slate-600">Choose a mood, then let Wandr AI shape the trip around it.</p>
            </div>
            <Link to="/explore" className="hidden md:inline-flex">
              <Button variant="outline" className="rounded-full px-5">
                Explore all trips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {FEATURED_VIBES.map((vibe) => (
              <button
                key={vibe.title}
                type="button"
                onClick={() => navigate(`/explore?destination=${encodeURIComponent(vibe.destination)}`)}
                className="group relative overflow-hidden rounded-[2rem] text-left shadow-lg transition-transform duration-300 hover:-translate-y-1"
              >
                <img
                  src={getOptimizedImageUrl(vibe.image, { width: 900, quality: 70 })}
                  alt={vibe.title}
                  loading="lazy"
                  decoding="async"
                  className="h-72 w-full object-cover transition-transform duration-700 group-hover:scale-110 sm:h-80"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 text-white">
                  <p className="text-xs font-semibold uppercase tracking-[0.25em] text-secondary-300">{vibe.destination}</p>
                  <h3 className="mt-2 text-2xl font-bold">{vibe.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/80">{vibe.blurb}</p>
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-white/90">
                    Start exploring <ArrowRight className="ml-2 h-4 w-4" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 sm:text-4xl">How Wandr Works</h2>
            <p className="mt-4 text-xl text-slate-600">A premium planning flow in three simple steps</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            {[
              {
                icon: <Search className="w-8 h-8 text-primary-600" />,
                title: "1. Tell us your preferences",
                desc: "Share your destination, dates, budget, and preferred travel style."
              },
              {
                icon: <Sparkles className="w-8 h-8 text-secondary-500" />,
                title: "2. AI generates your plan",
                desc: "Our AI crafts a day-by-day itinerary tailored to your exact trip."
              },
              {
                icon: <Navigation className="w-8 h-8 text-accent-500" />,
                title: "3. Book & Travel",
                desc: "Review, save, and book from a polished experience built for travelers."
              }
            ].map((step, idx) => (
              <div key={idx} className="relative p-8 bg-slate-50 rounded-2xl border border-slate-100 hover:shadow-lg transition-shadow text-center">
                <div className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-xl shadow-md border border-slate-100">
                  {step.icon}
                </div>
                <h3 className="mt-8 text-xl font-bold text-slate-900 mb-4">{step.title}</h3>
                <p className="text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Trips */}
      <section className="py-24 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-end mb-12">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Curated escapes</p>
              <h2 className="mt-3 text-3xl font-extrabold text-slate-900 sm:text-4xl">Featured Trips</h2>
              <p className="mt-4 text-lg text-slate-600">Hand-picked premium itineraries to inspire your next booking.</p>
            </div>
            <Link to="/explore">
              <Button variant="outline" className="hidden sm:inline-flex rounded-full">
                View All Trips
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {featuredTrips.length > 0 
              ? featuredTrips.map(trip => <TripCard key={trip._id} trip={trip} />)
              : [...Array(6)].map((_, i) => (
                  <TripCardSkeleton key={i} />
                ))
            }
          </div>
          
          <div className="mt-10 text-center sm:hidden">
             <Link to="/explore">
              <Button variant="outline" className="w-full">View All Trips</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-24 overflow-hidden bg-primary-900">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-br from-primary-800 to-primary-900 opacity-100"></div>
          {/* Abstract pattern */}
          <svg className="absolute top-0 left-0 transform -translate-x-1/2 -translate-y-1/2 opacity-10" width="800" height="800" fill="none" viewBox="0 0 800 800"><circle cx="400" cy="400" r="400" fill="url(#paint0_radial)"/><defs><radialGradient id="paint0_radial" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(400 400) rotate(90) scale(400)"><stop stopColor="#fff"/><stop offset="1" stopColor="#fff" stopOpacity="0"/></radialGradient></defs></svg>
        </div>
        
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center z-10">
          <h2 className="text-3xl font-extrabold text-white sm:text-4xl mb-6">
            Ready to start your adventure?
          </h2>
          <p className="text-xl text-primary-100 mb-10 max-w-2xl mx-auto font-light">
            Join thousands of travelers who are planning better trips faster with Wandr AI. Experience the future of travel planning today.
          </p>
          <Link to="/planner">
            <Button size="lg" className="bg-white text-primary-800 hover:bg-slate-50 border border-transparent shadow-xl px-10 py-4 text-lg rounded-full font-bold">
              Start Planning Free
            </Button>
          </Link>
        </div>
      </section>

    </div>
  );
}
