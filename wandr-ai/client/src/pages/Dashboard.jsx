import { useEffect, useMemo, useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { useUserStore } from '../store/userStore';
import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { LayoutDashboard, Compass, Star, Settings, Save, Loader2, Heart, Bot, Shield, Users, DollarSign, Briefcase, MapPin, Sparkles, ArrowRight, CheckCircle2, CalendarDays, Clock3, Activity, ExternalLink, Bookmark } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { TripCard } from '../components/trips/TripCard';
import { TripCardSkeleton, BookingRowSkeleton } from '../components/common/Skeleton';
import { EmptyState } from '../components/common/EmptyState';
import { getOptimizedImageUrl } from '../utils/image';

export default function Dashboard() {
  const { user } = useAuthStore();
  const { savedTrips, savedItineraries, isLoading: storeLoading, fetchSavedTrips, fetchSavedItineraries } = useUserStore();
   const [activeTab, setActiveTab] = useState('overview');
  const [savedSubTab, setSavedSubTab] = useState('curated'); // 'curated' or 'ai'
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const [profileData, setProfileData] = useState({ name: user?.name || '', email: user?.email || '', avatar: user?.avatar || '' });
  const [adminStats, setAdminStats] = useState(null);
  const [adminUsers, setAdminUsers] = useState([]);
  const [adminBookings, setAdminBookings] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      if (activeTab === 'admin') {
        setIsLoading(true);
        try {
          const [statsRes, usersRes, bookingsRes] = await Promise.all([
            axios.get('/admin/stats'),
            axios.get('/admin/users'),
            axios.get('/bookings/all'),
          ]);
          setAdminStats(statsRes.data.data.stats);
          setAdminUsers(usersRes.data.data.users);
          setAdminBookings(bookingsRes.data.data.bookings);
        } catch (err) {
          console.error('Failed to fetch admin data', err);
          toast.error('Failed to load admin data');
        } finally {
          setIsLoading(false);
        }
        return;
      }

      if (activeTab === 'saved') {
        if (savedSubTab === 'curated') {
          fetchSavedTrips();
        } else {
          fetchSavedItineraries();
        }
        return;
      }

      setIsLoading(true);
      try {
        const [bookingRes] = await Promise.all([
          axios.get('/bookings/my-bookings'),
          fetchSavedTrips(),
        ]);
        setBookings(bookingRes.data.data.bookings || []);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [user, activeTab, savedSubTab, fetchSavedTrips, fetchSavedItineraries]);

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    try {
      await axios.patch('/users/updateMe', profileData);
      toast.success('Profile updated successfully!');
    } catch (err) {
      toast.error('Failed to update profile.');
    } finally {
      setIsUpdating(false);
    }
  };

  const dashboardStats = [
    { label: 'Bookings', value: bookings.length || 0, icon: <Briefcase className="h-5 w-5" /> },
    { label: 'Saved trips', value: savedTrips.length || 0, icon: <Heart className="h-5 w-5" /> },
    { label: 'AI plans', value: savedItineraries.length || 0, icon: <Bot className="h-5 w-5" /> },
    { label: 'Role', value: user.role, icon: <Shield className="h-5 w-5" /> },
  ];

  const upcomingBookings = useMemo(() => {
    return [...bookings]
      .filter((booking) => booking?.startDate)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 3);
  }, [bookings]);

  const bookingTimeline = useMemo(() => {
    return [...bookings]
      .filter((booking) => booking?.startDate)
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate))
      .slice(0, 5)
      .map((booking) => ({
        id: booking._id,
        title: booking.trip?.title || 'Trip',
        destination: booking.trip?.destination || 'Trip',
        date: booking.startDate,
        status: booking.status || 'pending',
      }));
  }, [bookings]);

  const recentActivity = useMemo(() => {
    const activities = [
      ...bookings.map((booking) => ({
        id: `booking-${booking._id}`,
        title: booking.status === 'confirmed' ? 'Booking confirmed' : 'Booking pending',
        detail: booking.trip?.title || booking.trip?.destination || 'Upcoming trip',
        date: booking.updatedAt || booking.createdAt || booking.startDate,
        type: booking.status === 'confirmed' ? 'confirmed' : 'pending',
      })),
      ...savedTrips.map((trip) => ({
        id: `saved-${trip._id}`,
        title: 'Saved trip added',
        detail: trip.title || trip.destination || 'Wishlist item',
        date: trip.updatedAt || trip.createdAt,
        type: 'saved',
      })),
    ];

    return activities
      .filter((item) => item.date)
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 6);
  }, [bookings, savedTrips]);

  const confirmedCount = bookings.filter((booking) => booking.status === 'confirmed').length;
  const pendingCount = bookings.filter((booking) => booking.status === 'pending').length;
  const upcomingCount = upcomingBookings.length;
  const formatDateLabel = (value) =>
    value
      ? new Date(value).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
      : 'Date TBD';

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 sm:pt-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-r from-slate-950 via-primary-700 to-secondary-500 p-5 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4 text-secondary-300" />
                Your premium travel workspace
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Welcome back, {user.name}.</h1>
              <p className="mt-3 max-w-2xl text-white/80">
                Manage bookings, saved trips, AI itineraries, and profile settings from one polished dashboard.
              </p>
            </div>
            <Link to="/planner">
              <Button variant="premium" className="px-6 py-3">
                <ArrowRight className="mr-2 h-4 w-4" />
                Plan another trip
              </Button>
            </Link>
          </div>
        </section>

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {dashboardStats.map((stat) => (
            <div key={stat.label} className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
              <div className="mb-3 inline-flex rounded-2xl bg-primary-50 p-3 text-primary-600">{stat.icon}</div>
              <div className="text-3xl font-black text-slate-900">{stat.value}</div>
              <div className="text-sm text-slate-500">{stat.label}</div>
            </div>
          ))}
        </div>

        <section className="mb-8 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Overview</p>
              <h2 className="mt-2 text-2xl font-black text-slate-900">Your trip snapshot</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                See what is coming up, what is already saved, and what needs attention at a glance.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">
              <span className="rounded-full bg-emerald-50 px-3 py-2 text-emerald-700">{confirmedCount} confirmed</span>
              <span className="rounded-full bg-amber-50 px-3 py-2 text-amber-700">{pendingCount} pending</span>
              <span className="rounded-full bg-primary-50 px-3 py-2 text-primary-700">{savedTrips.length} saved</span>
            </div>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-primary-600 shadow-sm"><CalendarDays className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Upcoming trips</p>
                  <p className="text-2xl font-black text-slate-900">{upcomingCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-emerald-600 shadow-sm"><CheckCircle2 className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Confirmed</p>
                  <p className="text-2xl font-black text-slate-900">{confirmedCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-amber-600 shadow-sm"><Clock3 className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Pending</p>
                  <p className="text-2xl font-black text-slate-900">{pendingCount}</p>
                </div>
              </div>
            </div>
            <div className="rounded-3xl bg-slate-50 p-5">
              <div className="flex items-center gap-3">
                <div className="rounded-2xl bg-white p-3 text-secondary-600 shadow-sm"><Bookmark className="h-5 w-5" /></div>
                <div>
                  <p className="text-sm font-semibold text-slate-500">Wishlist</p>
                  <p className="text-2xl font-black text-slate-900">{savedTrips.length}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Upcoming trips</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">What is next</h3>
                </div>
                <Link to="/wishlist" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                  View wishlist
                </Link>
              </div>
              <div className="space-y-4">
                {upcomingBookings.length > 0 ? upcomingBookings.map((booking) => (
                  <div key={booking._id} className="flex flex-col gap-4 rounded-2xl bg-white p-4 shadow-sm sm:flex-row sm:items-center">
                    <img
                      src={getOptimizedImageUrl(booking.trip?.coverImage || 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop', { width: 240, quality: 68 })}
                      alt={booking.trip?.title || 'Upcoming trip'}
                      loading="lazy"
                      decoding="async"
                      className="h-20 w-full rounded-xl object-cover sm:w-24"
                    />
                    <div className="flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h4 className="font-bold text-slate-900">{booking.trip?.title || 'Trip'}</h4>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                          booking.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {booking.status || 'pending'}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-slate-500">{booking.trip?.destination || 'Destination'} · {formatDateLabel(booking.startDate)}</p>
                      <p className="mt-2 text-sm text-slate-600">{booking.groupSize} traveler(s) · Total ${booking.totalPrice}</p>
                    </div>
                    <Link to={`/trip/${booking.trip?._id || ''}`} className="inline-flex items-center rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition hover:border-primary-300 hover:text-primary-700">
                      Details <ExternalLink className="ml-2 h-4 w-4" />
                    </Link>
                  </div>
                )) : (
                  <EmptyState
                    icon={CalendarDays}
                    title="Nothing on the calendar yet"
                    description="Book a trip and your next departure will show up here automatically."
                    ctaLabel="Explore trips"
                    ctaTo="/explore"
                  />
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Recent activity</p>
                <h3 className="mt-1 text-lg font-bold text-slate-900">Latest updates</h3>
              </div>
              <div className="space-y-3">
                {recentActivity.length > 0 ? recentActivity.map((item) => (
                  <div key={item.id} className="flex items-start gap-3 rounded-2xl bg-white p-4 shadow-sm">
                    <div className={`rounded-2xl p-2 ${
                      item.type === 'confirmed' ? 'bg-emerald-50 text-emerald-600' : item.type === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-primary-50 text-primary-600'
                    }`}>
                      <Activity className="h-4 w-4" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <p className="truncate text-sm text-slate-500">{item.detail}</p>
                      <p className="mt-1 text-xs text-slate-400">{formatDateLabel(item.date)}</p>
                    </div>
                  </div>
                )) : (
                  <EmptyState
                    icon={Activity}
                    title="Activity will appear here"
                    description="Once you save or book a trip, this space will fill with your latest updates."
                    ctaLabel="Explore trips"
                    ctaTo="/explore"
                  />
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 grid gap-6 xl:grid-cols-2">
            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Trip timeline</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">Your next departures</h3>
                </div>
                <CalendarDays className="h-5 w-5 text-primary-500" />
              </div>
              <div className="space-y-4">
                {bookingTimeline.length > 0 ? bookingTimeline.map((item, index) => (
                  <div key={item.id} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white">
                        {index + 1}
                      </div>
                      {index !== bookingTimeline.length - 1 && <div className="mt-2 h-full w-px bg-slate-200" />}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="font-semibold text-slate-900">{item.title}</p>
                        <span className={`rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] ${
                          item.status === 'confirmed' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-500">{item.destination} · {formatDateLabel(item.date)}</p>
                    </div>
                  </div>
                )) : (
                  <EmptyState
                    icon={Clock3}
                    title="Your timeline is waiting"
                    description="As soon as you book a trip, your next departures will appear in order here."
                    ctaLabel="Explore trips"
                    ctaTo="/explore"
                  />
                )}
              </div>
            </div>

            <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
              <div className="mb-4 flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Wishlist integration</p>
                  <h3 className="mt-1 text-lg font-bold text-slate-900">Saved trips</h3>
                </div>
                <Link to="/wishlist" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                  Open wishlist
                </Link>
              </div>
              {savedTrips.length > 0 ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {savedTrips.slice(0, 2).map((trip) => (
                    <Link key={trip._id} to={`/trip/${trip._id}`} className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg">
                      <img
                        src={getOptimizedImageUrl(trip.coverImage || 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop', { width: 420, quality: 68 })}
                        alt={trip.title || trip.destination || 'Saved trip'}
                        loading="lazy"
                        decoding="async"
                        className="h-36 w-full object-cover"
                      />
                      <div className="p-4">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-bold text-slate-900 line-clamp-1">{trip.title || 'Saved trip'}</h4>
                          <Heart className="h-4 w-4 text-primary-500 fill-current" />
                        </div>
                        <p className="mt-1 text-sm text-slate-500">{trip.destination || 'Wishlist item'}</p>
                        <div className="mt-3 flex items-center justify-between text-xs font-semibold text-slate-500">
                          <span>{trip.duration || '--'} days</span>
                          <span>{trip.priceRange || 'View pricing'}</span>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="rounded-2xl border border-dashed border-slate-200 bg-white p-6 text-center text-slate-500">
                  Save trips from Explore to see them here.
                </div>
              )}
            </div>
          </div>
        </section>

        <div className="flex flex-col gap-8 md:flex-row">
          
          {/* Sidebar */}
          <div className="w-full flex-shrink-0 md:w-64">
            <div className="sticky top-24 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-6">
              <div className="flex items-center space-x-4 mb-8">
                <img
                  src={getOptimizedImageUrl(user.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop', { width: 240, quality: 68 })}
                  alt={user.name}
                  loading="lazy"
                  decoding="async"
                  className="w-12 h-12 rounded-full border-2 border-primary-100 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop';
                  }}
                />
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{user.name}</h3>
                  <p className="text-xs text-slate-500 capitalize">{user.role}</p>
                </div>
              </div>
              
              <nav className="space-y-2">
                {[
                  { id: 'overview', icon: <Sparkles className="w-5 h-5 mr-3" />, label: 'Overview' },
                  { id: 'bookings', icon: <LayoutDashboard className="w-5 h-5 mr-3" />, label: 'My Bookings' },
                  { id: 'saved', icon: <Compass className="w-5 h-5 mr-3" />, label: 'Saved Trips' },
                  { id: 'reviews', icon: <Star className="w-5 h-5 mr-3" />, label: 'My Reviews' },
                  { id: 'settings', icon: <Settings className="w-5 h-5 mr-3" />, label: 'Settings' },
                ].map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors text-sm font-medium ${
                      activeTab === item.id 
                        ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20' 
                        : 'text-slate-600 hover:bg-slate-50'
                    }`}
                  >
                    {item.icon}
                    {item.label}
                  </button>
                ))}

                {user.role === 'admin' && (
                  <button
                    onClick={() => setActiveTab('admin')}
                    className={`w-full flex items-center px-4 py-3 rounded-xl transition-colors text-sm font-bold mt-4 ${
                      activeTab === 'admin' 
                        ? 'bg-red-50 text-red-700' 
                        : 'text-red-600 hover:bg-red-50'
                    }`}
                  >
                    <Shield className="w-5 h-5 mr-3" />
                    Admin Panel
                  </button>
                )}
              </nav>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1">
            <div className="min-h-[500px] rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
              
              <h2 className="mb-6 text-2xl font-black capitalize text-slate-900">{activeTab.replace('-', ' ')}</h2>

              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="rounded-[2rem] border border-slate-100 bg-gradient-to-r from-primary-50 to-white p-6">
                    <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                      <div>
                        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">At a glance</p>
                        <h3 className="mt-2 text-2xl font-black text-slate-900">Your travel command center</h3>
                        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                          Upcoming trips, booking status, saved trips, and recent activity all live here.
                        </p>
                      </div>
                      <Link to="/planner">
                        <Button variant="premium" className="px-5 py-3">
                          <ArrowRight className="mr-2 h-4 w-4" />
                          Plan a trip
                        </Button>
                      </Link>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'bookings' && (
                <div>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[1, 2, 3].map(i => <BookingRowSkeleton key={i} />)}
                    </div>
                  ) : bookings.length > 0 ? (
                    <div className="space-y-4">
                      {bookings.map(booking => (
                      <div key={booking._id} className="flex flex-col items-center gap-4 rounded-2xl border border-slate-100 p-4 transition hover:bg-slate-50 sm:flex-row">
                          <img
                            src={getOptimizedImageUrl(booking.trip?.coverImage || 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop', { width: 320, quality: 68 })}
                            alt="Trip"
                            loading="lazy"
                            decoding="async"
                            className="w-full sm:w-24 h-24 object-cover rounded-lg"
                          />
                          <div className="flex-1 w-full text-center sm:text-left">
                            <h4 className="font-bold text-slate-900">{booking.trip?.title}</h4>
                            <p className="text-sm text-slate-500 mb-2">{new Date(booking.startDate).toLocaleDateString()} - {booking.groupSize} Travelers</p>
                            <span className={`inline-block px-2 py-1 text-xs font-bold rounded-full uppercase tracking-wider ${
                              booking.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                              booking.status === 'pending' ? 'bg-amber-100 text-amber-700' :
                              'bg-slate-100 text-slate-700'
                            }`}>
                              {booking.status}
                            </span>
                          </div>
                          <div className="font-bold text-lg text-slate-900 sm:text-right">
                            ${booking.totalPrice}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <EmptyState
                      icon={Briefcase}
                      title="No bookings yet"
                      description="When you book your first trip, it will appear here with the details you need."
                      ctaLabel="Explore trips"
                      ctaTo="/explore"
                    />
                  )}
                </div>
              )}

              {activeTab === 'saved' && (
                <div>
                  <div className="flex space-x-4 mb-8 bg-slate-50 p-1 rounded-xl w-fit">
                    <button 
                      onClick={() => setSavedSubTab('curated')}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        savedSubTab === 'curated' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Heart className="w-4 h-4 mr-2" /> Curated Trips
                    </button>
                    <button 
                      onClick={() => setSavedSubTab('ai')}
                      className={`flex items-center px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                        savedSubTab === 'ai' ? 'bg-white shadow-sm text-primary-600' : 'text-slate-500 hover:text-slate-700'
                      }`}
                    >
                      <Bot className="w-4 h-4 mr-2" /> AI Plans
                    </button>
                  </div>

                  {storeLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[1, 2, 3, 4].map(i => <TripCardSkeleton key={i} />)}
                    </div>
                  ) : savedSubTab === 'curated' ? (
                    savedTrips.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedTrips.map((trip) => (
                          <TripCard key={trip._id} trip={trip} />
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Heart}
                        title="No saved trips yet"
                        description="Save a few curated trips from Explore and they’ll show up here for quick access."
                        ctaLabel="Explore trips"
                        ctaTo="/explore"
                      />
                    )
                  ) : (
                    savedItineraries.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {savedItineraries.map((itinerary, i) => (
                          <div key={i} className="bg-white p-6 rounded-2xl border border-slate-200 hover:shadow-md transition relative group">
                            <div className="absolute top-4 right-4 text-primary-100 group-hover:text-primary-200 transition-colors">
                              <Bot className="w-8 h-8" />
                            </div>
                            <h4 className="font-extrabold text-slate-900 mb-2 pr-10">{itinerary.title}</h4>
                            <p className="text-sm text-slate-600 mb-4 line-clamp-2">{itinerary.description}</p>
                            <div className="flex justify-between items-center text-xs font-bold text-primary-700 bg-primary-50 px-3 py-2 rounded-lg">
                               <span className="flex items-center"><MapPin className="w-3 h-3 mr-1" /> {itinerary.destination}</span>
                               <span className="flex items-center"><Star className="w-3 h-3 mr-1" /> {itinerary.duration} Days</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <EmptyState
                        icon={Bot}
                        title="No AI plans yet"
                        description="Generate a custom itinerary in Planner and it’ll appear here."
                        ctaLabel="Plan a trip"
                        ctaTo="/planner"
                      />
                    )
                  )}
                </div>
              )}

              {activeTab === 'settings' && (
                <form onSubmit={handleUpdateProfile} className="max-w-md space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                    <input 
                      type="text" 
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 p-3" 
                      value={profileData.name}
                      onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                    <input 
                      type="email" 
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 p-3" 
                      value={profileData.email}
                      onChange={(e) => setProfileData({...profileData, email: e.target.value})}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Avatar URL</label>
                    <input 
                      type="text" 
                    className="w-full rounded-2xl border-slate-200 bg-slate-50 p-3" 
                      value={profileData.avatar}
                      onChange={(e) => setProfileData({...profileData, avatar: e.target.value})}
                    />
                  </div>
                  <button 
                    type="submit" 
                    className="flex w-full items-center justify-center rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 px-6 py-3 font-bold text-white shadow-lg shadow-primary-600/20 transition hover:shadow-xl"
                    disabled={isUpdating}
                  >
                    {isUpdating ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save className="w-5 h-5 mr-2" />}
                    Save Settings
                  </button>
                </form>
              )}

              {activeTab === 'admin' && (
                <div className="space-y-8">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    {[
                      { label: 'Total Revenue', value: `$${adminStats?.totalRevenue || 0}`, icon: <DollarSign />, color: 'text-green-600', bg: 'bg-green-50' },
                      { label: 'Total Users', value: adminStats?.totalUsers || 0, icon: <Users />, color: 'text-primary-600', bg: 'bg-primary-50' },
                      { label: 'Total Trips', value: adminStats?.totalTrips || 0, icon: <Compass />, color: 'text-primary-600', bg: 'bg-primary-50' },
                      { label: 'Total Bookings', value: adminStats?.totalBookings || 0, icon: <Briefcase />, color: 'text-amber-600', bg: 'bg-amber-50' },
                    ].map((stat, i) => (
                      <div key={i} className="p-4 rounded-xl border border-slate-100 flex items-center space-x-4">
                        <div className={`p-3 rounded-lg ${stat.bg} ${stat.color}`}>{stat.icon}</div>
                        <div>
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">{stat.label}</p>
                          <p className="text-xl font-black text-slate-900">{stat.value}</p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Users Table */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-900">User Management</h3>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{adminUsers.length} Users</span>
                    </div>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Email</th>
                            <th className="px-4 py-3">Role</th>
                            <th className="px-4 py-3">Joined</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {adminUsers.map(u => (
                            <tr key={u._id} className="text-sm hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 flex items-center space-x-3">
                                  <img
                                    src={getOptimizedImageUrl(u.avatar || 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop', { width: 160, quality: 68 })}
                                    className="w-8 h-8 rounded-full object-cover"
                                    alt={`${u.name || 'User'} avatar`}
                                    loading="lazy"
                                    decoding="async"
                                    onError={(e) => {
                                      e.currentTarget.src = 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=300&auto=format&fit=crop';
                                    }}
                                 />
                                <span className="font-bold text-slate-900">{u.name}</span>
                                {u._id === user._id && <span className="text-[10px] bg-primary-100 text-primary-700 px-1 rounded">You</span>}
                              </td>
                              <td className="px-4 py-3 text-slate-600">{u.email}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${u.role === 'admin' ? 'bg-red-100 text-red-700' : 'bg-primary-100 text-primary-700'}`}>
                                  {u.role}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-slate-500">{new Date(u.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Bookings Table */}
                  <div className="mt-8">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-bold text-slate-900">Recent Bookings</h3>
                      <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-1 rounded-md">{adminBookings.length} Bookings</span>
                    </div>
                    <div className="overflow-x-auto border border-slate-100 rounded-xl">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-600 text-xs font-bold uppercase tracking-wider">
                            <th className="px-4 py-3">Trip</th>
                            <th className="px-4 py-3">User</th>
                            <th className="px-4 py-3">Amount</th>
                            <th className="px-4 py-3">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {adminBookings.map(b => (
                            <tr key={b._id} className="text-sm hover:bg-slate-50 transition-colors">
                              <td className="px-4 py-3 font-bold text-slate-900">{b.trip?.title || 'Unknown Trip'}</td>
                              <td className="px-4 py-3 text-slate-600">{b.user?.name || 'Deleted User'}</td>
                              <td className="px-4 py-3 font-bold text-slate-900">${b.totalPrice}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                                  b.status === 'confirmed' ? 'bg-green-100 text-green-700' : 
                                  b.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
                                }`}>
                                  {b.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
