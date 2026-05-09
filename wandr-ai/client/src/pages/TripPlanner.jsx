import { lazy, Suspense, useCallback, useEffect, useRef, useState } from 'react';
import { useTripStore } from '../store/tripStore';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { useNavigate, useSearchParams } from 'react-router-dom';
import axios from '../api/axios';
import { toast } from 'react-hot-toast';
import { getOptimizedImageUrl } from '../utils/image';
import { calculatePriceRange } from '../utils/costOfLivingIndex';
import {
  Bot,
  Sparkles,
  MapPin,
  Calendar,
  Users,
  DollarSign,
  Check,
  ChevronDown,
  ChevronUp,
  Save,
  CreditCard,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Clock3,
  Compass,
  Globe,
  CheckCircle2,
} from 'lucide-react';

const INTERESTS = ['Culture', 'Nature', 'Food', 'Adventure', 'Relaxation', 'Nightlife', 'Shopping', 'History'];
const QUICK_DESTINATIONS = ['Bali', 'Tokyo', 'Paris', 'Dubai', 'Swiss Alps', 'Iceland'];
const AIChatBox = lazy(() => import('../components/ai/AIChatBox').then((mod) => ({ default: mod.AIChatBox })));
const initialFormData = {
  destination: '',
  days: 3,
  budget: 'mid-range',
  groupSize: 1,
  interests: [],
};

export default function TripPlanner() {
  const { user } = useAuthStore();
  const { generateItinerary, isGenerating, generatedItinerary, error, clearError, clearGenerated } = useTripStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const lastAutoDestinationRef = useRef('');

  const [formData, setFormData] = useState(initialFormData);
  const [expandedDay, setExpandedDay] = useState(1);
  const [isBooking, setIsBooking] = useState(false);

  const toggleInterest = (interest) => {
    setFormData(prev => ({
      ...prev,
      interests: prev.interests.includes(interest)
        ? prev.interests.filter(i => i !== interest)
        : [...prev.interests, interest]
    }));
  };

  const fillDestination = (destination) => {
    setFormData(prev => ({ ...prev, destination }));
  };

  const resetPlanner = () => {
    clearGenerated();
    clearError();
    setFormData(initialFormData);
    setExpandedDay(1);
    lastAutoDestinationRef.current = '';
    navigate('/planner', { replace: true });
  };

  const submitItinerary = useCallback(async (payload, fromSearch = '') => {
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/planner', search: fromSearch } } });
      return;
    }
    clearError();
    await generateItinerary(payload);
    setExpandedDay(1);
    // Smooth scroll to results
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [user, navigate, clearError, generateItinerary]);

  useEffect(() => {
    const destination = searchParams.get('destination')?.trim();

    if (!destination) {
      lastAutoDestinationRef.current = '';
      return;
    }

    setFormData(prev => (
      prev.destination === destination ? prev : { ...prev, destination }
    ));

    if (lastAutoDestinationRef.current === destination || isGenerating) {
      return;
    }

    lastAutoDestinationRef.current = destination;
    clearGenerated();
    void submitItinerary(
      { ...formData, destination },
      `?destination=${encodeURIComponent(destination)}`
    );
  }, [searchParams, isGenerating, submitItinerary, clearGenerated, formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    await submitItinerary(formData);
  };

  const handleSaveToProfile = async () => {
    if (!generatedItinerary) return;
    try {
      await axios.post('/users/save-itinerary', { itinerary: generatedItinerary });
      toast.success('Itinerary saved to your profile!');
    } catch (err) {
      toast.error('Failed to save itinerary.');
    }
  };

  const handleBookNow = async () => {
    if (!generatedItinerary) return;
    if (!user) {
      navigate('/login', { state: { from: { pathname: '/planner' } } });
      return;
    }

    setIsBooking(true);
    try {
      // 1. Parse price from estimatedCost string (e.g. "$1,200 - $2,000")
      const costMatch = generatedItinerary.estimatedCost.match(/\$(\d+(?:,\d+)?)/);
      const price = costMatch ? parseInt(costMatch[1].replace(/,/g, '')) : 1000;

      // 2. Create a Trip from the AI result
      const tripData = {
        title: generatedItinerary.title,
        description: generatedItinerary.description,
        destination: generatedItinerary.destination,
        duration: generatedItinerary.duration,
        budget: formData.budget,
        price: price,
        itinerary: generatedItinerary.itinerary,
        isAIGenerated: true,
        isPublished: false, // Keep it private for this user
        localTips: generatedItinerary.localTips,
        packingList: generatedItinerary.packingList,
        coverImage: getOptimizedImageUrl('https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop', { width: 1600, quality: 72 })
      };

      const res = await axios.post('/trips', tripData);
      const newTrip = res.data.data.trip;

      // 3. Navigate to booking with this new trip
      navigate('/booking', { 
        state: { 
          trip: newTrip, 
          groupSize: formData.groupSize, 
          startDate: new Date().toISOString().split('T')[0] // Default to today
        } 
      });
    } catch (err) {
      toast.error('Failed to initiate booking.');
      console.error(err);
    } finally {
      setIsBooking(false);
    }
  };

  // Extract country from destination (e.g., "Barot, Himachal Pradesh, India" -> "India")
  const extractCountry = (destination) => {
    const parts = destination.split(',').map(p => p.trim());
    return parts[parts.length - 1] || destination;
  };

  // Calculate dynamic cost based on current form inputs
  const calculateDynamicCost = () => {
    if (!generatedItinerary) return generatedItinerary?.estimatedCost;
    
    try {
      const country = extractCountry(generatedItinerary.destination);
      const priceData = calculatePriceRange(country, formData.days, formData.budget);
      const totalForGroup = (priceData.averagePrice * formData.groupSize);
      return `$${priceData.minPrice * formData.groupSize} - $${priceData.maxPrice * formData.groupSize}`;
    } catch (error) {
      return generatedItinerary?.estimatedCost;
    }
  };

  const itineraryDays = generatedItinerary?.itinerary || [];
  const plannerFacts = generatedItinerary ? [
    { label: 'Destination', value: generatedItinerary.destination },
    { label: 'Duration', value: `${formData.days} days` },
    { label: 'Cost', value: calculateDynamicCost() },
    { label: 'Travelers', value: `${formData.groupSize}` },
  ] : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#f7f4ee] pt-20 pb-16 sm:pt-24">
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(47,157,132,0.12),transparent_32%),linear-gradient(135deg,#fffdfa_0%,#f7f3ec_42%,#eef3f7_100%)]" />
        <div className="absolute left-0 top-20 h-80 w-80 rounded-full bg-primary-200/40 blur-3xl" />
        <div className="absolute right-0 top-36 h-96 w-96 rounded-full bg-secondary-200/30 blur-3xl" />
        <div className="absolute bottom-0 left-1/3 h-96 w-96 rounded-full bg-accent-200/30 blur-3xl" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-8 lg:p-10">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1.4fr)_minmax(280px,0.8fr)] lg:items-center">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700">
                <Sparkles className="h-4 w-4 text-secondary-500" />
                Premium AI trip planning
              </div>
              <h1 className="mt-5 max-w-2xl text-3xl font-black tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
                Build a trip that feels curated, elegant, and easy to trust.
              </h1>
              <p className="mt-4 max-w-2xl text-lg leading-8 text-slate-600">
                Set your destination, style, and budget — Wandr AI turns it into a polished itinerary with routes, tips, and booking-ready details.
              </p>

              <div className="mt-6 flex flex-wrap gap-3">
                {['Smart itinerary', 'Budget aware', 'Save & book', 'AI follow-up chat'].map((item) => (
                  <span key={item} className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm text-slate-700">
                    {item}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {[
                { label: 'Traveler rating', value: '4.9/5' },
                { label: 'Itineraries', value: '10K+' },
                { label: 'Destinations', value: '120+' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-center shadow-sm">
                  <div className="text-3xl font-black text-slate-900">{stat.value}</div>
                  <div className="mt-1 text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mt-10 grid gap-8 lg:grid-cols-[420px_minmax(0,1fr)]">
          <aside className="self-start lg:sticky lg:top-24">
            <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
              <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 px-6 py-5 text-white">
                <div className="flex items-center gap-3">
                  <div className="rounded-2xl bg-white/15 p-3">
                    <Compass className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-[0.2em] text-white/75">Trip builder</p>
                    <h2 className="text-2xl font-bold">Tell us your vibe</h2>
                  </div>
                </div>
                <p className="mt-3 max-w-sm text-sm leading-6 text-white/80">
                  Use quick picks or customize every detail. The more you add, the better the itinerary gets.
                </p>
              </div>

              <div className="p-6">
                {error && (
                  <div className="mb-5 flex items-start rounded-2xl border border-red-100 bg-red-50 p-4 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 mr-3 h-5 w-5 flex-shrink-0" />
                    <p>{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                  <div>
                    <label className="mb-2 flex items-center text-sm font-semibold text-slate-700">
                      <MapPin className="mr-1 h-4 w-4 text-primary-500" /> Destination
                    </label>
                    <Input
                      required
                      placeholder="e.g. Tokyo, Paris, Bali"
                      value={formData.destination}
                      onChange={(e) => fillDestination(e.target.value)}
                      className="rounded-2xl border-slate-200 bg-slate-50 px-4 py-3 text-base shadow-sm focus:bg-white"
                    />
                  </div>

                  <div>
                    <p className="mb-2 text-sm font-semibold text-slate-700">Quick destinations</p>
                    <div className="flex flex-wrap gap-2">
                      {QUICK_DESTINATIONS.map((destination) => (
                        <button
                          key={destination}
                          type="button"
                          onClick={() => fillDestination(destination)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            formData.destination === destination
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-primary-300 hover:text-primary-600'
                          }`}
                        >
                          {destination}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 flex items-center text-sm font-semibold text-slate-700">
                        <Calendar className="mr-1 h-4 w-4 text-primary-500" /> Days
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="30"
                        required
                        className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:bg-white focus:ring-primary-500"
                        value={formData.days}
                        onChange={(e) => setFormData({ ...formData, days: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                    <div>
                      <label className="mb-2 flex items-center text-sm font-semibold text-slate-700">
                        <Users className="mr-1 h-4 w-4 text-primary-500" /> Travelers
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        required
                        className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:bg-white focus:ring-primary-500"
                        value={formData.groupSize}
                        onChange={(e) => setFormData({ ...formData, groupSize: parseInt(e.target.value) || 1 })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="mb-2 flex items-center text-sm font-semibold text-slate-700">
                      <DollarSign className="mr-1 h-4 w-4 text-primary-500" /> Budget level
                    </label>
                    <select
                      className="block w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:bg-white focus:ring-primary-500"
                      value={formData.budget}
                      onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                    >
                      <option value="budget">Budget-friendly</option>
                      <option value="mid-range">Mid-range / Comfort</option>
                      <option value="luxury">Luxury / Premium</option>
                    </select>
                  </div>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-slate-700">Interests & vibes</label>
                      <span className="text-xs font-medium text-slate-500">{formData.interests.length} selected</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {INTERESTS.map((interest) => (
                        <button
                          key={interest}
                          type="button"
                          onClick={() => toggleInterest(interest)}
                          className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                            formData.interests.includes(interest)
                              ? 'border-primary-500 bg-primary-600 text-white shadow-sm'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {interest}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/25"
                    isLoading={isGenerating}
                    disabled={!formData.destination}
                  >
                    <Sparkles className="mr-2 h-5 w-5" />
                    {isGenerating ? 'Crafting itinerary...' : 'Generate premium trip'}
                  </Button>

                  <div className="flex items-center justify-between gap-3">
                    <button
                      type="button"
                      onClick={resetPlanner}
                      className="text-sm font-medium text-slate-500 transition-colors hover:text-slate-900"
                    >
                      Reset planner
                    </button>
                    <p className="text-xs text-slate-400">You can save or book once your itinerary is ready.</p>
                  </div>
                </form>

                <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {[
                    { icon: <ShieldCheck className="h-4 w-4" />, label: 'Trusted routes' },
                    { icon: <Clock3 className="h-4 w-4" />, label: 'Fast generation' },
                    { icon: <Globe className="h-4 w-4" />, label: 'Global discovery' },
                    { icon: <CheckCircle2 className="h-4 w-4" />, label: 'Save & book' },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-3 text-sm text-slate-600">
                      <span className="text-primary-600">{item.icon}</span>
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>

                {generatedItinerary && (
                  <div className="mt-8 border-t border-slate-100 pt-6">
                    <h3 className="mb-3 flex items-center text-base font-bold text-slate-800">
                      <Bot className="mr-2 h-5 w-5 text-primary-600" /> Need adjustments?
                    </h3>
                    <div className="h-[320px] overflow-hidden rounded-2xl border border-slate-200">
                      <Suspense fallback={<div className="flex h-full items-center justify-center bg-slate-50 text-sm text-slate-500">Loading travel assistant...</div>}>
                        <AIChatBox
                          inline={true}
                          initialContext={`User generated an itinerary for ${generatedItinerary.destination} for ${generatedItinerary.duration} days. Title: ${generatedItinerary.title}. They may want adjustments.`}
                        />
                      </Suspense>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </aside>

          <section className="space-y-6">
            {!generatedItinerary && !isGenerating ? (
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-lg shadow-slate-900/5">
                <div className="border-b border-slate-100 bg-gradient-to-r from-primary-50 to-secondary-50 p-6">
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-700">Planning preview</p>
                  <h3 className="mt-2 text-2xl font-bold text-slate-900">Your itinerary will appear here</h3>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                    Fill in the planner and Wandr AI will build a polished trip with daily structure, dining ideas, local tips, and packing guidance.
                  </p>
                </div>
                <div className="grid gap-4 p-6 sm:grid-cols-2 lg:grid-cols-3">
                  {[
                    { title: 'Day-by-day route', desc: 'Activities arranged with a clear pace and flow.' },
                    { title: 'Local insights', desc: 'Tips to make the trip feel easier and more authentic.' },
                    { title: 'Booking-ready details', desc: 'Enough structure to move from plan to action fast.' },
                  ].map((item) => (
                    <div key={item.title} className="rounded-3xl border border-slate-200 bg-slate-50 p-5 text-slate-900">
                      <div className="mb-3 inline-flex rounded-2xl bg-white p-3 shadow-sm">
                        <ArrowRight className="h-5 w-5 text-secondary-500" />
                      </div>
                      <h4 className="text-lg font-semibold">{item.title}</h4>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{item.desc}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : isGenerating ? (
              <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white p-8 text-center text-slate-900 shadow-lg shadow-slate-900/5 sm:p-10">
                <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-full border border-slate-200 bg-slate-50">
                  <div className="relative h-16 w-16">
                    <div className="absolute inset-0 rounded-full border-4 border-slate-200"></div>
                    <div className="absolute inset-0 animate-spin rounded-full border-4 border-secondary-500 border-t-transparent"></div>
                    <Sparkles className="absolute inset-0 m-auto h-6 w-6 text-secondary-500" />
                  </div>
                </div>
                <h3 className="text-3xl font-black">Crafting your premium trip...</h3>
                <p className="mt-3 text-slate-600">Analyzing routes, pacing, budget, and local experiences for {formData.destination || 'your destination'}.</p>
                <div className="mx-auto mt-8 grid max-w-xl gap-3">
                  {['Balancing activities', 'Choosing stay options', 'Adding local tips'].map((item) => (
                    <div key={item} className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left">
                      <CheckCircle2 className="h-5 w-5 text-accent-500" />
                      <span className="text-sm text-slate-700">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-6 animate-fadeIn">
                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
                  <div className="bg-gradient-to-r from-primary-700 via-primary-600 to-secondary-500 px-8 py-7 text-white">
                    <div className="flex flex-wrap items-start justify-between gap-6">
                      <div>
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em]">
                          <MapPin className="h-4 w-4" /> {generatedItinerary.destination}
                        </div>
                        <h2 className="text-3xl font-black sm:text-4xl">{generatedItinerary.title}</h2>
                        <p className="mt-3 max-w-3xl text-sm leading-7 text-white/85 sm:text-base">
                          {generatedItinerary.description}
                        </p>
                      </div>
                      <div className="rounded-3xl border border-white/15 bg-white/10 p-4 text-center backdrop-blur">
                        <span className="block text-xs uppercase tracking-[0.2em] text-white/70">Estimated cost</span>
                        <span className="mt-2 block text-3xl font-black">{generatedItinerary.estimatedCost}</span>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4 border-b border-slate-100 bg-slate-50 p-4 sm:grid-cols-2 sm:p-6 lg:grid-cols-4">
                    {plannerFacts.map((fact) => (
                      <div key={fact.label} className="rounded-2xl border border-slate-200 bg-white p-4">
                        <div className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{fact.label}</div>
                        <div className="mt-2 text-sm font-bold text-slate-900">{fact.value}</div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-col gap-4 p-5 sm:flex-row sm:p-6">
                    <Button variant="outline" className="flex-1 rounded-2xl py-3" onClick={handleSaveToProfile}>
                      <Save className="mr-2 h-4 w-4" /> Save to Profile
                    </Button>
                    <Button
                      variant="primary"
                      className="flex-1 rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 py-3 text-base font-semibold text-white shadow-lg shadow-primary-600/25"
                      onClick={handleBookNow}
                      isLoading={isBooking}
                    >
                      <CreditCard className="mr-2 h-5 w-5" /> Book This Trip
                    </Button>
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div className="rounded-[2rem] border border-amber-100 bg-gradient-to-br from-amber-50 to-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-lg font-bold text-amber-950">
                      <Sparkles className="mr-2 h-5 w-5 text-amber-500" /> Local tips
                    </h3>
                    <ul className="space-y-3">
                      {generatedItinerary.localTips?.map((tip, i) => (
                        <li key={i} className="rounded-2xl bg-white/80 px-4 py-3 text-sm leading-6 text-amber-900 shadow-sm">
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="rounded-[2rem] border border-primary-100 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm">
                    <h3 className="mb-4 flex items-center text-lg font-bold text-primary-950">
                      <Check className="mr-2 h-5 w-5 text-primary-500" /> Packing list
                    </h3>
                    <ul className="space-y-3">
                      {generatedItinerary.packingList?.map((item, i) => (
                        <li key={i} className="rounded-2xl bg-white/80 px-4 py-3 text-sm leading-6 text-primary-900 shadow-sm">
                          {item}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-slate-200 bg-white shadow-2xl">
                  <div className="border-b border-slate-100 px-6 py-5">
                    <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Daily route</p>
                    <h3 className="mt-2 text-2xl font-black text-slate-900">Daily itinerary</h3>
                  </div>
                  <div className="space-y-4 p-6">
                    {itineraryDays.map((day) => (
                      <div key={day.day} className="overflow-hidden rounded-[1.5rem] border border-slate-200 bg-slate-50">
                        <button
                          onClick={() => setExpandedDay(expandedDay === day.day ? null : day.day)}
                          className="flex w-full items-center justify-between gap-4 p-5 text-left transition-colors hover:bg-white"
                        >
                          <div className="flex items-center gap-4">
                            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary-600 font-black text-white">
                              D{day.day}
                            </div>
                            <div>
                              <h4 className="text-lg font-bold text-slate-900">{day.title}</h4>
                              <p className="text-sm text-slate-500">{day.theme}</p>
                            </div>
                          </div>
                          <div className="rounded-full bg-white p-2 text-slate-500 shadow-sm">
                            {expandedDay === day.day ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                          </div>
                        </button>

                        {expandedDay === day.day && (
                          <div className="border-t border-slate-200 bg-white p-5">
                            <div className="relative space-y-6 border-l-2 border-slate-200 pl-6">
                              {day.activities?.map((activity, idx) => (
                                <div key={idx} className="relative">
                                  <div className="absolute -left-[31px] top-1 h-4 w-4 rounded-full border-4 border-white bg-primary-500"></div>
                                  <div className="flex items-start justify-between gap-4">
                                    <div>
                                      <span className="inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-600">{activity.time}</span>
                                      <h5 className="mt-2 text-base font-semibold text-slate-900">{activity.activity}</h5>
                                      <div className="mt-1 flex flex-wrap items-center gap-2 text-sm text-slate-500">
                                        <span className="inline-flex items-center gap-1">
                                          <MapPin className="h-3.5 w-3.5" /> {activity.location}
                                        </span>
                                        {activity.activityType && (
                                          <span className="rounded-full bg-primary-50 px-2 py-0.5 text-xs font-medium text-primary-700">
                                            {activity.activityType}
                                          </span>
                                        )}
                                      </div>
                                      {activity.tips && (
                                        <p className="mt-3 inline-block rounded-2xl border border-slate-100 bg-slate-50 px-3 py-2 text-sm text-slate-600">
                                          {activity.tips}
                                        </p>
                                      )}
                                    </div>
                                    <div className="rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 text-sm font-semibold text-slate-600">
                                      {activity.estimatedCost}
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>

                            <div className="mt-6 grid gap-4 sm:grid-cols-2">
                              {day.accommodation && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Accommodation</div>
                                  <h6 className="font-semibold text-slate-900">{day.accommodation.name}</h6>
                                  <p className="mt-1 text-sm text-slate-600">
                                    {day.accommodation.accommodationType} • {day.accommodation.pricePerNight}
                                  </p>
                                </div>
                              )}

                              {day.meals?.length > 0 && (
                                <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                                  <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Dining highlights</div>
                                  <div className="space-y-2">
                                    {day.meals.map((meal, idx) => (
                                      <div key={idx} className="text-sm text-slate-700">
                                        <span className="font-semibold text-slate-900">{meal.name}</span> <span className="text-slate-500">({meal.time})</span> · {meal.priceRange}
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
