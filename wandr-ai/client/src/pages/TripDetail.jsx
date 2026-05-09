import { lazy, Suspense, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams, useNavigate } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { TripDetailSkeleton } from '../components/common/Skeleton';
import { MapPin, Star, Clock, DollarSign, Calendar, Users, ChevronLeft, ChevronRight, Loader2, Sparkles, ShieldCheck, Route, Globe, CheckCircle2, Image, Map } from 'lucide-react';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { getOptimizedImageUrl } from '../utils/image';
import { clearTripCache } from '../store/tripStore';
import { calculatePriceRange } from '../utils/costOfLivingIndex';

// Lazy load map component to keep initial bundle small (~200KB saved)
const TripMap = lazy(() => import('../components/TripMap'));

const GALLERY_BY_DESTINATION = {
  baliindonesia: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1537953773345-d172ccf13cf1?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1537996194471-e657df975ab4?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518544887879-0fa4a4e8f9e4?q=80&w=1200&auto=format&fit=crop',
  ],
  manaliindia: [
    'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1509043759401-136742328bb3?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1544735716-392fe2489ffa?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1512813195386-6cf811ad3542?q=80&w=1200&auto=format&fit=crop',
  ],
  dubaiuae: [
    'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1518684079-3c830dcef090?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1503596476-1c12a8ba09a9?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1526495124232-a04e1849168c?q=80&w=1200&auto=format&fit=crop',
  ],
  parisfrance: [
    'https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549144511-f099e773c147?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511739001486-6bfe10ce785f?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1520939817895-060bdaf4fe1b?q=80&w=1200&auto=format&fit=crop',
  ],
  tokyojapan: [
    'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1542051841857-5f90071e7989?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1528164344705-47542687000d?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?q=80&w=1200&auto=format&fit=crop',
  ],
  santorinigreece: [
    'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1505731134054-3d2bc2f5f0bf?q=80&w=1200&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1533105079780-92b9be482077?q=80&w=1200&auto=format&fit=crop',
  ],
};

export default function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { currentTrip, fetchTrip, isLoading, error } = useTripStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [groupSize, setGroupSize] = useState(2);
  const [startDate, setStartDate] = useState('');
  const { user } = useAuthStore();
  const [reviews, setReviews] = useState([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, review: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [hasBooking, setHasBooking] = useState(false);
  const [galleryIndex, setGalleryIndex] = useState(0);
  const touchStartX = useRef(0);
  
  useEffect(() => {
    if (id) {
      fetchTrip(id);
    }
  }, [id, fetchTrip]);

  useEffect(() => {
    const fetchReviewsData = async () => {
      setReviewsLoading(true);
      try {
        const res = await axios.get(`/trips/${id}/reviews`);
        setReviews(res.data.data.reviews || []);
      } catch (err) {
        console.error('Failed to fetch reviews data:', err);
      } finally {
        setReviewsLoading(false);
      }
    };

    if (id) {
      fetchReviewsData();
    }
  }, [id]);

  useEffect(() => {
    if (activeTab !== 'reviews' || !user) return;

    const fetchBookingStatus = async () => {
      try {
        const bookingRes = await axios.get('/bookings/my-bookings');
        const bookings = bookingRes.data.data.bookings;
        const tripBooking = bookings.find((b) => b.trip?._id === id && b.status === 'confirmed');
        if (tripBooking) setHasBooking(true);
      } catch (err) {
        console.error('Failed to fetch booking status:', err);
      }
    };

    fetchBookingStatus();
  }, [activeTab, id, user]);

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!newReview.review) return;
    setIsSubmittingReview(true);
    try {
      const res = await axios.post(`/trips/${id}/reviews`, newReview);
      setReviews([res.data.data.review, ...reviews]);
      clearTripCache(() => true);
      setNewReview({ rating: 5, review: '' });
      toast.success('Review submitted!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review');
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const tripFacts = [
    { label: 'Duration', value: `${currentTrip?.duration || 0} days` },
    { label: 'Budget', value: currentTrip?.budget || 'Flexible' },
    { label: 'Rating', value: Number.isFinite(Number(currentTrip?.rating)) ? Number(currentTrip.rating).toFixed(1) : 'New' },
    { label: 'Price (Per Person)', value: currentTrip?.calculatedPrices ? `$${currentTrip.calculatedPrices.dailyAverage}/day` : currentTrip?.priceRange || `$${currentTrip?.price || 0}` },
  ];

  const priceRange = currentTrip?.calculatedPrices ? {
    min: currentTrip.calculatedPrices.minPrice,
    max: currentTrip.calculatedPrices.maxPrice,
    avg: currentTrip.calculatedPrices.averagePrice,
    dailyMin: currentTrip.calculatedPrices.dailyMin,
    dailyMax: currentTrip.calculatedPrices.dailyMax,
  } : null;

  const safeCategories = Array.isArray(currentTrip?.category) ? currentTrip.category : [];
  const safeTags = Array.isArray(currentTrip?.tags) ? currentTrip.tags : [];
  const safeHighlights = Array.isArray(currentTrip?.highlights) ? currentTrip.highlights : [];
  const safeItinerary = Array.isArray(currentTrip?.itinerary) ? currentTrip.itinerary : [];
  const safeReviews = Array.isArray(reviews) ? reviews : [];

  const reviewSummary = useMemo(() => {
    const count = safeReviews.length || currentTrip?.ratingsCount || 0;
    const avg = safeReviews.length
      ? safeReviews.reduce((sum, review) => sum + Number(review.rating || 0), 0) / safeReviews.length
      : Number(currentTrip?.rating || 0);
    const distribution = [5, 4, 3, 2, 1].map((stars) => {
      const matching = safeReviews.filter((review) => Math.round(Number(review.rating || 0)) === stars).length;
      return { stars, count: matching };
    });

    return { count, avg, distribution };
  }, [safeReviews, currentTrip?.rating, currentTrip?.ratingsCount]);

  const galleryImages = useMemo(() => {
    const key = (currentTrip?.destination || '').toLowerCase().replace(/[^a-z]/g, '');
    const fallback = [
      getOptimizedImageUrl(currentTrip?.coverImage || 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop', { width: 1400, quality: 72 }),
      getOptimizedImageUrl('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=1200&auto=format&fit=crop', { width: 1400, quality: 72 }),
      getOptimizedImageUrl('https://images.unsplash.com/photo-1502602898657-3e91760cbb34?q=80&w=1200&auto=format&fit=crop', { width: 1400, quality: 72 }),
    ];
    return (GALLERY_BY_DESTINATION[key] || fallback).map((image) => getOptimizedImageUrl(image, { width: 1400, quality: 72 }));
  }, [currentTrip?.coverImage, currentTrip?.destination]);

  const showIncludedHighlights = safeHighlights.length > 0 ? safeHighlights : ['Curated itinerary', 'Route guidance', 'Booking-ready plan'];
  const fromExploreSearch = location.state?.fromExploreSearch || '';
  const restoreScrollY = location.state?.restoreScrollY;

  const handleBackToResults = () => {
    navigate(`/explore${fromExploreSearch ? `?${fromExploreSearch}` : ''}`, {
      state: typeof restoreScrollY === 'number' ? { restoreScrollY } : undefined,
    });
  };

  const handleGalleryTouchStart = (event) => {
    touchStartX.current = event.touches[0].clientX;
  };

  const handleGalleryTouchEnd = (event) => {
    const deltaX = touchStartX.current - event.changedTouches[0].clientX;
    if (Math.abs(deltaX) < 50 || galleryImages.length <= 1) return;

    setGalleryIndex((prev) => {
      if (deltaX > 0) return (prev + 1) % galleryImages.length;
      return (prev - 1 + galleryImages.length) % galleryImages.length;
    });
  };

  if (isLoading || !currentTrip) {
    return <TripDetailSkeleton />;
  }

  if (error) {
    return (
      <div className="min-h-screen pt-24 pb-12 flex items-center justify-center bg-slate-50 text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  const handleBookNow = () => {
    if (!startDate) {
      alert("Please select a start date.");
      return;
    }
    // Navigate to booking page, pass state
    navigate('/booking', { state: { trip: currentTrip, groupSize, startDate }});
  };

  return (
    <div className="min-h-screen bg-slate-50 pt-16 pb-12 sm:pt-20">
      
      {/* Hero Image */}
      <div className="relative h-[44vh] w-full overflow-hidden sm:h-[56vh]">
        <img 
          src={getOptimizedImageUrl(currentTrip.coverImage || 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop', { width: 1600, quality: 72 })} 
          alt={currentTrip.title} 
          fetchpriority="high"
          loading="eager"
          decoding="async"
          className="h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/35 to-transparent"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.08),transparent_28%)]"></div>
        
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="absolute left-6 top-6 z-10 rounded-full bg-white/15 p-2 text-white backdrop-blur-md transition hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
          <ChevronLeft className="w-6 h-6" />
        </button>

        <div className="absolute bottom-0 left-0 w-full p-5 sm:p-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-5 px-4 sm:px-6 lg:px-8">
            <button
              type="button"
              onClick={handleBackToResults}
              className="inline-flex w-fit items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to results
            </button>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-sm font-medium text-white/90 backdrop-blur">
              <Sparkles className="h-4 w-4 text-secondary-300" />
              Premium curated trip
            </div>
            <div className="flex items-center space-x-2 font-semibold text-secondary-200">
              <MapPin className="w-5 h-5" />
              <span className="uppercase tracking-[0.25em] text-sm">{currentTrip.destination}</span>
            </div>
            <h1 className="max-w-4xl text-3xl font-black text-white sm:text-4xl lg:text-5xl">{currentTrip.title}</h1>
            <div className="flex flex-wrap gap-2 text-sm font-medium text-white/90 sm:gap-3">
              <span className="flex items-center rounded-full bg-white/10 px-3 py-1.5 backdrop-blur"><Star className="mr-1 h-4 w-4 text-secondary-300" /> {Number.isFinite(Number(currentTrip.rating)) ? Number(currentTrip.rating).toFixed(1) : 'NEW'} ({currentTrip.ratingsCount || 0} reviews)</span>
              <span className="flex items-center rounded-full bg-white/10 px-3 py-1.5 backdrop-blur"><Clock className="mr-1 h-4 w-4" /> {currentTrip.duration} Days</span>
              <span className="flex items-center rounded-full bg-white/10 px-3 py-1.5 backdrop-blur capitalize"><DollarSign className="mr-1 h-4 w-4" /> {currentTrip.budget}</span>
              {currentTrip.isAIGenerated && (
                <span className="flex items-center rounded-full bg-white/10 px-3 py-1.5 backdrop-blur"><ShieldCheck className="mr-1 h-4 w-4" /> AI crafted</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Tabs */}
            <div className="sticky top-20 z-10 rounded-t-[2rem] border border-slate-100 bg-white/90 px-2 pt-2 backdrop-blur-xl transition-all">
              <nav className="-mb-px flex space-x-6 overflow-x-auto px-4 no-scrollbar scroll-smooth sm:px-6" aria-label="Tabs" style={{ WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                {['overview', 'itinerary', 'reviews', 'map'].map((tab) => (
                    <button
                      type="button"
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      aria-current={activeTab === tab ? 'page' : undefined}
                      className={`${
                        activeTab === tab
                          ? 'border-primary-500 text-primary-600'
                          : 'border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300'
                    } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`}
                    >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            <div className="min-h-[400px] rounded-b-[2rem] border border-t-0 border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
              
              {activeTab === 'overview' && (
                <div className="animate-fadeIn">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">About this trip</h3>
                  <p className="text-slate-600 leading-relaxed text-lg mb-8">{currentTrip.description}</p>
                  
                  <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    {safeCategories.map(cat => (
                      <div key={cat} className="rounded-xl border border-slate-100 bg-slate-50 p-3 text-center font-medium capitalize text-slate-700">
                        {cat}
                      </div>
                    ))}
                  </div>

                  {safeTags.length > 0 && (
                    <div className="mb-8 flex flex-wrap gap-2">
                      {safeTags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-full border border-primary-100 bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-primary-700"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="mb-8 grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">What&apos;s included</h4>
                          <p className="mt-1 text-sm text-slate-500">Clear value before you book.</p>
                        </div>
                        <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2">
                        {showIncludedHighlights.map((item) => (
                          <div key={item} className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">What&apos;s not included</h4>
                          <p className="mt-1 text-sm text-slate-500">Helpful exclusions to set expectations.</p>
                        </div>
                        <Route className="h-5 w-5 text-slate-400" />
                      </div>
                      <div className="mt-4 space-y-2">
                        {['Flights or transfers', 'Visa fees and travel insurance', 'Personal spending / optional add-ons'].map((item) => (
                          <div key={item} className="rounded-2xl bg-white px-4 py-3 text-sm text-slate-600 shadow-sm">
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {safeItinerary.length > 0 && (
                    <div className="mb-8 rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-5 w-5 text-primary-600" />
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Itinerary timeline</h4>
                      </div>
                      <div className="mt-5 space-y-5">
                        {safeItinerary.map((day) => (
                          <div key={day.day} className="relative pl-10">
                            <div className="absolute left-3 top-1 h-full w-px bg-slate-200" />
                            <div className="absolute left-0 top-1 flex h-7 w-7 items-center justify-center rounded-full bg-primary-600 text-xs font-bold text-white shadow-lg shadow-primary-600/20">
                              {day.day}
                            </div>
                            <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4">
                              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                  <h5 className="text-base font-bold text-slate-900">{day.title || `Day ${day.day}`}</h5>
                                  <p className="text-sm text-slate-500">{day.theme || 'Curated day plan'}</p>
                                </div>
                                <div className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-600">
                                  <Clock className="mr-1 h-3.5 w-3.5 text-primary-500" />
                                  Day {day.day}
                                </div>
                              </div>
                              <div className="mt-4 grid gap-2">
                                {(Array.isArray(day.activities) ? day.activities.slice(0, 3) : []).map((activity, index) => (
                                  <div key={index} className="flex items-start gap-3 rounded-xl bg-white px-3 py-3 text-sm text-slate-700 shadow-sm">
                                    <span className="mt-0.5 min-w-14 rounded-full bg-primary-50 px-2 py-1 text-center text-[11px] font-bold text-primary-700">{activity.time}</span>
                                    <div>
                                      <p className="font-medium">{activity.activity}</p>
                                      <p className="text-xs text-slate-500">{activity.location}</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {safeHighlights.length > 0 && (
                    <div className="mb-8 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                      <div className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-primary-600" />
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Highlights</h4>
                      </div>
                      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {safeHighlights.map((highlight, index) => {
                          const HighlightIcon = [Globe, Route, MapPin, CheckCircle2][index % 4];
                          return (
                            <div key={highlight} className="rounded-2xl bg-white p-4 text-sm leading-6 text-slate-700 shadow-sm">
                              <HighlightIcon className="mb-3 h-5 w-5 text-primary-600" />
                              {highlight}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <div className="mb-8 grid gap-4 lg:grid-cols-2">
                    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Star className="h-5 w-5 text-secondary-500" />
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Reviews summary</h4>
                      </div>
                      <div className="mt-4 flex items-end gap-4">
                        <div>
                          <div className="text-4xl font-black text-slate-900">{reviewSummary.avg.toFixed(1)}</div>
                          <div className="text-sm text-slate-500">{reviewSummary.count} reviews</div>
                        </div>
                        <div className="flex-1 space-y-2">
                          {reviewSummary.distribution.map((item) => (
                            <div key={item.stars} className="flex items-center gap-3 text-xs text-slate-500">
                              <span className="w-7 font-semibold">{item.stars}★</span>
                              <div className="h-2 flex-1 rounded-full bg-slate-100">
                                <div
                                  className="h-2 rounded-full bg-secondary-500"
                                  style={{ width: `${reviewSummary.count ? Math.max((item.count / reviewSummary.count) * 100, 10) : 10}%` }}
                                />
                              </div>
                              <span className="w-6 text-right">{item.count}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                      <div className="mt-4 rounded-2xl bg-slate-50 p-4 text-sm text-slate-600">
                        {reviewSummary.count > 0
                          ? safeReviews.slice(0, 2).map((review) => (
                              <p key={review._id} className="mb-3 last:mb-0 italic">
                                “{review.review}”
                              </p>
                            ))
                          : 'Traveler reviews will appear here after your first bookings.'}
                      </div>
                    </div>

                    <div className="rounded-3xl border border-slate-100 bg-white p-5 shadow-sm">
                      <div className="flex items-center gap-2">
                        <Map className="h-5 w-5 text-primary-600" />
                        <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Location preview</h4>
                      </div>
                      <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200">
                        <Suspense fallback={<div className="h-[260px] animate-pulse bg-slate-100" />}>
                          <TripMap trip={currentTrip} />
                        </Suspense>
                      </div>
                    </div>
                  </div>

                  <div className="mb-8 rounded-3xl border border-slate-100 bg-slate-50 p-5">
                    <div className="flex items-center gap-2">
                      <Image className="h-5 w-5 text-primary-600" />
                      <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-slate-500">Image gallery</h4>
                    </div>
                    <div className="mt-4 grid gap-4 lg:grid-cols-[1.4fr_0.6fr]">
                      <div
                        className="relative overflow-hidden rounded-3xl touch-pan-y"
                        onTouchStart={handleGalleryTouchStart}
                        onTouchEnd={handleGalleryTouchEnd}
                      >
                          <img
                            src={galleryImages[galleryIndex]}
                            alt={currentTrip.title}
                            loading="lazy"
                            decoding="async"
                            className="h-[320px] w-full object-cover sm:h-[420px]"
                          />
                        <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-slate-950/80 to-transparent p-4 text-white">
                          <button
                            type="button"
                            onClick={() => setGalleryIndex((prev) => (prev - 1 + galleryImages.length) % galleryImages.length)}
                            aria-label="Previous image"
                            className="rounded-full bg-white/15 p-2 backdrop-blur hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                          >
                            <ChevronLeft className="h-5 w-5" />
                          </button>
                          <div className="text-sm font-semibold">
                            {galleryIndex + 1} / {galleryImages.length}
                          </div>
                          <button
                            type="button"
                            onClick={() => setGalleryIndex((prev) => (prev + 1) % galleryImages.length)}
                            aria-label="Next image"
                            className="rounded-full bg-white/15 p-2 backdrop-blur hover:bg-white/25 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
                          >
                            <ChevronRight className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                      <div className="flex gap-3 overflow-x-auto pb-1 sm:grid sm:grid-cols-3 lg:grid-cols-1 lg:overflow-visible">
                        {galleryImages.map((image, index) => (
                          <button
                            key={image}
                            type="button"
                            onClick={() => setGalleryIndex(index)}
                            className={`min-w-24 overflow-hidden rounded-2xl border transition sm:min-w-0 ${
                              galleryIndex === index ? 'border-primary-500 ring-2 ring-primary-500/20' : 'border-slate-200'
                            } focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2`}
                            aria-label={`View gallery image ${index + 1}`}
                          >
                            <img src={image} alt={`${currentTrip.title} ${index + 1}`} loading="lazy" decoding="async" className="h-24 w-full object-cover sm:h-28" />
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {currentTrip.isAIGenerated && (
                    <div className="flex items-start rounded-2xl border border-primary-100 bg-gradient-to-r from-primary-50 to-white p-4 sm:p-5">
                      <Sparkles className="mt-0.5 mr-3 h-6 w-6 flex-shrink-0 text-primary-500" />
                      <div>
                        <h4 className="font-bold text-primary-900">AI-Crafted Itinerary</h4>
                        <p className="mt-1 text-sm text-primary-700">This itinerary was specially curated by Wandr AI for maximum engagement and authentic experiences.</p>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'itinerary' && (
                <div className="animate-fadeIn">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Daily Itinerary</h3>
                  {safeItinerary.length > 0 ? (
                    <div className="space-y-6">
                      {safeItinerary.map(day => (
                        <div key={day.day} className="flex flex-col bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
                          <div className="p-4 bg-white border-b border-slate-100 flex items-center">
                            <div className="bg-primary-100 text-primary-700 w-10 h-10 rounded-lg flex items-center justify-center font-bold mr-4">D{day.day}</div>
                            <div>
                              <h4 className="font-bold text-slate-900">{day.title || `Day ${day.day}`}</h4>
                              {day.theme && <p className="text-xs text-slate-500">{day.theme}</p>}
                            </div>
                          </div>
                          <div className="p-6">
                            <ul className="space-y-4">
                                  {(Array.isArray(day.activities) ? day.activities : []).map((act, i) => (
                                <li key={i} className="flex text-sm text-slate-700">
                                  <span className="font-semibold w-16 flex-shrink-0">{act.time}</span>
                                  <div>
                                    <span className="font-medium">{act.activity}</span> - <span className="text-slate-500">{act.location}</span>
                                  </div>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      ))}
                    </div>
                   ) : (
                    <p className="text-slate-500">No detailed itinerary available for this trip yet.</p>
                  )}
                </div>
              )}

              {activeTab === 'reviews' && (
                <div className="animate-fadeIn">
                  <h3 className="text-2xl font-bold text-slate-900 mb-6">Traveler Reviews</h3>
                  
                  {user && hasBooking && (
                    <form onSubmit={handleSubmitReview} className="mb-10 bg-slate-50 p-6 rounded-2xl border border-slate-200">
                      <h4 className="font-bold text-slate-900 mb-4 text-lg">Write a Review</h4>
                      <div className="flex items-center mb-4">
                        <span className="text-sm font-medium text-slate-700 mr-4">Your Rating:</span>
                        <div className="flex text-secondary-500">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              type="button"
                              onClick={() => setNewReview({ ...newReview, rating: star })}
                              aria-label={`Set rating to ${star} star${star > 1 ? 's' : ''}`}
                              className="rounded focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
                            >
                              <Star className={`w-6 h-6 ${star <= newReview.rating ? 'fill-current' : 'text-slate-300'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <label htmlFor="trip-review" className="sr-only">Your review</label>
                      <textarea
                        id="trip-review"
                        className="w-full rounded-xl border-slate-300 bg-white p-4 text-sm focus:ring-primary-500 focus:border-primary-500 min-h-[100px]"
                        placeholder="Share your experience with this trip..."
                        aria-label="Your review"
                        value={newReview.review}
                        onChange={(e) => setNewReview({ ...newReview, review: e.target.value })}
                        required
                      />
                      <Button 
                        type="submit" 
                        className="mt-4 px-8" 
                        isLoading={isSubmittingReview}
                        disabled={!newReview.review}
                      >
                        Submit Review
                      </Button>
                    </form>
                  )}

                  {reviewsLoading ? (
                    <div className="flex flex-col items-center justify-center py-12">
                      <Loader2 className="w-8 h-8 text-primary-500 animate-spin mb-4" />
                      <p className="text-slate-500">Loading reviews...</p>
                    </div>
                  ) : safeReviews.length > 0 ? (
                    <div className="space-y-6">
                      {safeReviews.map((review) => (
                        <div key={review._id} className="border-b border-slate-100 pb-6 last:border-0 hover:bg-slate-50/50 transition-colors p-4 rounded-xl">
                          <div className="flex items-center mb-3">
                            {review.user?.avatar ? (
                              <img src={review.user.avatar} className="w-12 h-12 rounded-full mr-4 border-2 border-primary-50 object-cover" alt={`${review.user.name || 'Traveler'} avatar`} loading="lazy" decoding="async" />
                            ) : (
                              <div className="w-12 h-12 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center font-bold mr-4 border-2 border-primary-50">
                                {review.user?.name?.charAt(0) || 'U'}
                              </div>
                            )}
                            <div>
                              <p className="font-bold text-slate-900">{review.user?.name || 'Anonymous'}</p>
                              <div className="flex items-center mt-0.5">
                                <div className="flex text-secondary-500 mr-2">
                                    {[...Array(5)].map((_, j) => (
                                      <Star key={j} className={`w-3.5 h-3.5 ${j < Number(review.rating || 0) ? 'fill-current' : 'text-slate-300'}`} />
                                    ))}
                                  </div>
                                <span className="text-xs text-slate-400">
                                  {new Date(review.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>
                          <p className="text-slate-600 leading-relaxed italic pr-4">"{review.review}"</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                      <Star className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                      <p className="text-slate-500 font-medium">No reviews yet.</p>
                      <p className="text-slate-400 text-sm mt-1">Be the first to review this trip!</p>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'map' && (
                <Suspense fallback={
                  <div className="h-[400px] w-full rounded-2xl overflow-hidden border border-slate-200 flex items-center justify-center bg-slate-100">
                    <div className="flex flex-col items-center">
                      <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary-600 mb-3"></div>
                      <p className="text-slate-600 font-medium">Loading map...</p>
                    </div>
                  </div>
                }>
                  <TripMap trip={currentTrip} />
                </Suspense>
              )}

            </div>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-2xl shadow-slate-900/5">
              <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 px-6 py-5 text-white">
                <p className="text-xs uppercase tracking-[0.2em] text-white/70">Trip summary</p>
                <div className="mt-2 flex items-end gap-2">
                  {priceRange ? (
                    <>
                      <span className="text-4xl font-black">${priceRange.dailyAverage}</span>
                      <span className="pb-1 text-white/80">per person/day</span>
                    </>
                  ) : (
                    <>
                      <span className="text-4xl font-black">${currentTrip.price}</span>
                      <span className="pb-1 text-white/80">per person</span>
                    </>
                  )}
                </div>
                {priceRange && (
                  <p className="mt-2 text-xs text-white/70">
                    Total: ${priceRange.min} - ${priceRange.max} ({currentTrip?.duration} days)
                  </p>
                )}
              </div>

              <div className="p-6">
                <div className="mb-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {tripFacts.map((fact) => (
                    <div key={fact.label} className="rounded-2xl border border-slate-100 bg-slate-50 p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">{fact.label}</div>
                      <div className="mt-1 text-sm font-semibold text-slate-900">{fact.value}</div>
                    </div>
                  ))}
                </div>

                <div className="mb-6 space-y-4">
                  <div>
                    <label className="mb-1 flex items-center text-sm font-semibold text-slate-700">
                      <Calendar className="mr-1 h-4 w-4 text-primary-500" /> Start Date
                    </label>
                    <input 
                      type="date" 
                      className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:bg-white focus:ring-primary-500"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </div>

                  <div>
                    <label className="mb-1 flex items-center text-sm font-semibold text-slate-700">
                      <Users className="mr-1 h-4 w-4 text-primary-500" /> Travelers
                    </label>
                    <input 
                      type="number" 
                      min="1" 
                      max={currentTrip.maxGroupSize || 10}
                      className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:bg-white focus:ring-primary-500"
                      value={groupSize}
                      onChange={(e) => setGroupSize(Number(e.target.value))}
                    />
                  </div>
                </div>

                <div className="mb-6 rounded-2xl bg-slate-50 p-4">
                  {priceRange ? (
                    <>
                      <div className="mb-2 flex justify-between text-slate-600">
                        <span>${priceRange.dailyMin} - ${priceRange.dailyMax}/day x {groupSize} person(s)</span>
                        <span>${priceRange.min * groupSize} - ${priceRange.max * groupSize}</span>
                      </div>
                      <div className="mb-4 flex justify-between text-slate-600">
                        <span>Taxes & Fees</span>
                        <span>~${Math.round((priceRange.avg * groupSize) * 0.1)}</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-900">
                        <span>Estimated Total</span>
                        <span>${Math.round((priceRange.max * groupSize) * 1.1)}</span>
                      </div>
                      <p className="mt-3 text-xs text-slate-500">
                        💡 Price based on {currentTrip?.country} cost of living index. Includes accommodation, meals, activities & transport.
                      </p>
                    </>
                  ) : (
                    <>
                      <div className="mb-2 flex justify-between text-slate-600">
                        <span>${currentTrip.price} x {groupSize} person(s)</span>
                        <span>${currentTrip.price * groupSize}</span>
                      </div>
                      <div className="mb-4 flex justify-between text-slate-600">
                        <span>Taxes & Fees</span>
                        <span>$0</span>
                      </div>
                      <div className="flex justify-between border-t border-slate-200 pt-4 text-lg font-bold text-slate-900">
                        <span>Total</span>
                        <span>${currentTrip.price * groupSize}</span>
                      </div>
                    </>
                  )}
                </div>

                <Button onClick={handleBookNow} variant="premium" className="w-full py-4 text-lg font-bold">
                  Book This Trip
                </Button>
                <p className="mt-4 text-center text-xs text-slate-400">You won't be charged yet</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
