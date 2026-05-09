import { useLocation, useNavigate, Navigate } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { CheckCircle2, CreditCard, Lock, ShieldCheck, BadgeCheck, HelpCircle, ChevronDown, Sparkles, Star, X } from 'lucide-react';
import { useState, useEffect } from 'react';
import axios from '../api/axios';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { getOptimizedImageUrl } from '../utils/image';
import { useAuthStore } from '../store/authStore';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || 'pk_test_placeholder');
const BOOKING_DRAFT_STORAGE_KEY = 'wandr-booking-draft';

const serializeTripDraft = (trip) => ({
  _id: trip._id,
  title: trip.title,
  destination: trip.destination,
  price: trip.price,
  duration: trip.duration,
  coverImage: trip.coverImage,
  highlights: trip.highlights,
  rating: trip.rating,
  ratingsCount: trip.ratingsCount,
});

const createBookingDraft = (state) => {
  if (!state?.trip) {
    return null;
  }

  const trip = serializeTripDraft(state.trip);
  const groupSize = Number(state.groupSize) || 1;
  const startDate = state.startDate || new Date().toISOString().split('T')[0];
  const endDate =
    state.endDate ||
    new Date(new Date(startDate).getTime() + (trip.duration || 0) * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0];

  return {
    trip,
    groupSize,
    startDate,
    endDate,
    travelerInfo: {
      groupSize,
      travelerName: state.travelerInfo?.travelerName || state.cardholderName || '',
    },
    savedAt: new Date().toISOString(),
  };
};

const readBookingDraft = () => {
  try {
    const raw = window.localStorage.getItem(BOOKING_DRAFT_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    return parsed?.trip?._id ? parsed : null;
  } catch (error) {
    console.error('Failed to read booking draft', error);
    return null;
  }
};

const saveBookingDraft = (draft) => {
  try {
    window.localStorage.setItem(BOOKING_DRAFT_STORAGE_KEY, JSON.stringify(draft));
  } catch (error) {
    console.error('Failed to save booking draft', error);
  }
};

const clearBookingDraft = () => {
  try {
    window.localStorage.removeItem(BOOKING_DRAFT_STORAGE_KEY);
  } catch (error) {
    console.error('Failed to clear booking draft', error);
  }
};

// Stripe payment form component
function PaymentForm({ trip, groupSize, startDate, bookingDetails, onSuccess }) {
  const stripe = useStripe();
  const elements = useElements();
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [isMockMode, setIsMockMode] = useState(false);

  useEffect(() => {
    // Check if we're in mock mode (no valid publishable key)
    if (!import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY === 'pk_test_placeholder') {
      setIsMockMode(true);
    }
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);
    setError(null);

    try {
      // Step 1: Create booking with payment intent
      const bookingRes = await axios.post('/bookings', {
        tripId: trip._id,
        startDate,
        endDate: bookingDetails.endDate,
        groupSize,
      });

      const { clientSecret, booking } = bookingRes.data.data;

      // If mock mode, skip Stripe confirmation
      if (isMockMode || clientSecret.startsWith('mock_')) {
        console.log('Running in mock mode - skipping Stripe confirmation');
        onSuccess(booking);
        return;
      }

      // Step 2: Confirm payment with Stripe
      const cardElement = elements.getElement(CardElement);
      const { error: confirmError, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: {
            name: bookingDetails.name,
          },
        },
      });

      if (confirmError) {
        setError(confirmError.message);
        setIsProcessing(false);
        return;
      }

      if (paymentIntent.status === 'succeeded') {
        onSuccess(booking);
      } else {
        setError('Payment was not completed. Please try again.');
        setIsProcessing(false);
      }
    } catch (err) {
      console.error('Payment error:', err);
      setError(err.response?.data?.message || err.message || 'Payment failed');
      setIsProcessing(false);
    }
  };

  return (
    <form onSubmit={handlePayment} className="space-y-6">
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4">
        <div className="flex items-center gap-2 text-sm font-semibold text-emerald-700">
          <ShieldCheck className="h-4 w-4" />
          Secure Payment
        </div>
        <p className="mt-2 text-sm text-emerald-700/90">Your payment is encrypted and processed through Stripe.</p>
        <p className="mt-1 text-xs font-medium text-emerald-700/80">No hidden charges — the total shown here is the amount you pay.</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Card Details</label>
        <div className="p-4 rounded-md border border-slate-300 bg-white">
          <CardElement
            options={{
              style: {
                base: {
                  fontSize: '16px',
                  color: '#1e293b',
                  '::placeholder': {
                    color: '#cbd5e1',
                  },
                },
                invalid: {
                  color: '#dc2626',
                },
              },
            }}
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-slate-700 mb-2">Cardholder Name</label>
        <input
          type="text"
          placeholder="Full name on card"
          className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-primary-500 focus:border-primary-500"
          required
          defaultValue={bookingDetails.name}
        />
      </div>

      <p className="text-xs text-slate-500 flex items-center mt-2">
        <Lock className="w-3 h-3 mr-1" /> Payments are secure and encrypted. {isMockMode ? '(Mock mode)' : '(Live mode)'}
      </p>

      {isMockMode && (
        <div className="p-3 bg-primary-50 border border-primary-200 rounded text-xs text-primary-700">
          💡 <strong>Test Mode:</strong> Use card 4242 4242 4242 4242, any future date, any CVC
        </div>
      )}

      <Button
        type="submit"
        disabled={!stripe || isProcessing}
        className="w-full py-4 text-lg"
        isLoading={isProcessing}
      >
        Pay ${trip.price * (Number(groupSize) || 1)} & Book
      </Button>
    </form>
  );
}

export default function Booking() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [success, setSuccess] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [isResumedBooking, setIsResumedBooking] = useState(false);

  const [bookingDraft, setBookingDraft] = useState(() => createBookingDraft(location.state) || readBookingDraft());

  useEffect(() => {
    const routeDraft = createBookingDraft(location.state);

    if (routeDraft) {
      setBookingDraft(routeDraft);
      setIsResumedBooking(false);
      return;
    }

    const storedDraft = readBookingDraft();
    setBookingDraft(storedDraft);
    setIsResumedBooking(Boolean(storedDraft));
  }, [location.state]);

  useEffect(() => {
    if (!bookingDraft || success) {
      if (success) {
        clearBookingDraft();
      }
      return;
    }

    saveBookingDraft(bookingDraft);
  }, [bookingDraft, success]);

  const trip = bookingDraft?.trip;
  const groupSize = bookingDraft?.groupSize;
  const startDate = bookingDraft?.startDate;

  if (!trip) {
    return <Navigate to="/" replace />;
  }

  const safeGroupSize = Number(groupSize) || 1;
  const safeStartDate = startDate || new Date().toISOString().split('T')[0];
  const safeEndDate = bookingDraft?.endDate || new Date(new Date(safeStartDate).getTime() + (trip.duration || 0) * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  const total = (trip.price || 0) * safeGroupSize;
  const endDate = new Date(new Date(safeStartDate).getTime() + (trip.duration || 0) * 24 * 60 * 60 * 1000);
  const reviewCount = trip.ratingsCount || 0;
  const rating = Number.isFinite(Number(trip.rating)) ? Number(trip.rating).toFixed(1) : '4.8';
  const inclusions = Array.isArray(trip.highlights) && trip.highlights.length
    ? trip.highlights
    : [
        'Curated itinerary and route plan',
        'Destination recommendations',
        'Booking-ready trip summary',
      ];
  const exclusions = [
    'Flights or international airfare',
    'Visa fees and travel insurance',
    'Personal shopping and optional add-ons',
  ];
  const faqItems = [
    {
      question: 'What is your cancellation policy?',
      answer:
        'Free cancellation is available up to 7 days before departure. Cancellations made 3-6 days before departure receive a partial refund. Within 48 hours of departure, the booking is non-refundable.',
    },
    {
      question: 'Are there any hidden fees?',
      answer:
        'No hidden charges are added at checkout. The total shown on the page reflects what you pay before any optional extras you choose later.',
    },
    {
      question: 'What is included in the trip?',
      answer:
        'Your booking includes the curated trip plan, destination details, and the itinerary structure shown on the page. Flights, visas, and insurance are excluded unless stated otherwise.',
    },
    {
      question: 'How do I know this trip is trustworthy?',
      answer:
        'You can review the verified listing badge, traveler rating, reviews count, and the clear inclusions/exclusions before booking.',
    },
  ];

  const handlePaymentSuccess = (booking) => {
    clearBookingDraft();
    setBookingId(booking._id);
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen pt-32 pb-12 bg-slate-50 flex items-center justify-center px-4">
      <div className="max-w-md w-full rounded-[2rem] border border-slate-100 bg-white p-6 text-center shadow-xl sm:p-8">
          <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 mb-2">Booking Confirmed!</h2>
          <p className="text-slate-600 mb-8">
            You're successfully booked for <strong>{trip.title}</strong>. 
            We've sent a confirmation email with details.
          </p>
          <div className="bg-slate-50 rounded-xl p-4 mb-8 text-left border border-slate-100">
            <p className="text-sm text-slate-500 mb-1">Booking Reference ID</p>
            <p className="font-mono font-medium text-slate-800 break-all">{bookingId}</p>
          </div>
          <Button onClick={() => navigate('/dashboard')} variant="premium" className="w-full py-3 text-lg">
            View in Dashboard
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 sm:pt-24">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-r from-slate-950 via-primary-700 to-secondary-500 p-5 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm font-semibold uppercase tracking-[0.2em] text-secondary-200">Secure checkout</p>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <BadgeCheck className="h-3.5 w-3.5 text-secondary-300" />
              Verified listing
            </span>
            {isResumedBooking && (
              <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1 text-xs font-semibold backdrop-blur">
                <Sparkles className="h-3.5 w-3.5 text-secondary-300" />
                Resume Booking
              </span>
            )}
          </div>
          <h1 className="mt-3 text-4xl font-black sm:text-5xl">Complete your booking</h1>
          <p className="mt-3 max-w-2xl text-white/80">Review your trip, confirm the details, and finish checkout in a polished, secure flow.</p>
          {isResumedBooking && (
            <div className="mt-5 rounded-2xl border border-white/15 bg-white/10 p-4 backdrop-blur">
              <p className="text-sm font-semibold text-white">Your booking draft was restored.</p>
              <p className="mt-1 text-sm text-white/75">Trip, dates, and traveler count are back so you can continue without starting over.</p>
            </div>
          )}
          <div className="mt-5 flex flex-wrap gap-3 text-sm font-medium text-white/90">
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur">
              <Star className="h-4 w-4 text-secondary-300" />
              {rating}/5 rating
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur">
              <HelpCircle className="h-4 w-4 text-secondary-300" />
              {reviewCount} reviews
            </span>
            <span className="inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-2 backdrop-blur">
              <ShieldCheck className="h-4 w-4 text-secondary-300" />
              No hidden charges
            </span>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Payment Form Area */}
          <div className="lg:w-2/3">
            <div className="rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
              <h2 className="mb-6 flex items-center text-xl font-black text-slate-900">
                <CreditCard className="w-5 h-5 mr-2 text-primary-600" /> Payment Details
              </h2>
              
              <Elements stripe={stripePromise}>
                  <PaymentForm
                    trip={trip}
                    groupSize={safeGroupSize}
                    startDate={safeStartDate}
                    bookingDetails={{
                    name: user?.name || bookingDraft?.travelerInfo?.travelerName || '',
                    endDate: safeEndDate,
                    }}
                    onSuccess={handlePaymentSuccess}
                  />
                </Elements>
            </div>
          </div>

          {/* Summary Sidebar */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-900/5">
              <div className="bg-gradient-to-r from-primary-700 to-secondary-500 px-6 py-5 text-white">
                <h2 className="text-lg font-black">Summary</h2>
                <div className="mt-2 flex items-center gap-2 text-sm text-white/85">
                  <BadgeCheck className="h-4 w-4 text-secondary-200" />
                  Verified trip details
                </div>
              </div>
              <div className="p-5 sm:p-6">
              
              <div className="mb-6 flex flex-col gap-4 pb-6 border-b border-slate-100 sm:flex-row sm:space-x-4">
                <img
                  src={getOptimizedImageUrl(trip.coverImage || 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop', { width: 240, quality: 68 })}
                  alt="Trip"
                  loading="lazy"
                  decoding="async"
                  className="h-20 w-20 rounded-lg object-cover"
                />
                <div>
                  <h3 className="font-bold text-slate-900 line-clamp-1">{trip.title}</h3>
                  <p className="text-sm text-slate-500">{trip.destination}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs font-semibold">
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      <Star className="h-3.5 w-3.5 text-secondary-500" />
                      {rating}
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full bg-slate-100 px-2.5 py-1 text-slate-700">
                      <HelpCircle className="h-3.5 w-3.5 text-slate-500" />
                      {reviewCount} reviews
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-3 mb-6 pb-6 border-b border-slate-100 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-500">Date</span>
                  <span className="font-medium text-slate-800">{safeStartDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Travelers</span>
                  <span className="font-medium text-slate-800">{safeGroupSize} Person(s)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Duration</span>
                  <span className="font-medium text-slate-800">{trip.duration} Days</span>
                </div>
              </div>

              <div className="mb-6 space-y-3 rounded-2xl bg-slate-50 p-4">
                <div className="flex justify-between text-slate-600">
                  <span>${trip.price} x {safeGroupSize}</span>
                  <span>${trip.price * safeGroupSize}</span>
                </div>
                <div className="flex justify-between text-lg font-black text-slate-900 pt-4 border-t border-slate-200">
                  <span>Total (USD)</span>
                  <span>${total}</span>
                </div>
                <p className="flex items-center gap-2 text-xs font-semibold text-slate-500">
                  <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
                  No hidden charges
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Inclusions</h3>
                  <div className="mt-3 space-y-2">
                    {inclusions.map((item) => (
                      <div key={item} className="flex items-start gap-2 rounded-2xl bg-emerald-50 px-3 py-2 text-sm text-emerald-800">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Exclusions</h3>
                  <div className="mt-3 space-y-2">
                    {exclusions.map((item) => (
                      <div key={item} className="flex items-start gap-2 rounded-2xl bg-slate-50 px-3 py-2 text-sm text-slate-600">
                        <X className="mt-0.5 h-4 w-4 flex-shrink-0 text-slate-400" />
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              </div>
            </div>
          </div>
        </div>

        <section className="mt-8 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-xl shadow-slate-900/5 sm:p-8">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary-600" />
            <h2 className="text-xl font-black text-slate-900">Booking policies and FAQs</h2>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">Refund & cancellation policy</h3>
              <div className="mt-4 space-y-3 text-sm leading-6 text-slate-600">
                <p>Free cancellation up to 7 days before departure.</p>
                <p>Partial refunds apply for cancellations made 3-6 days before departure.</p>
                <p>Bookings cancelled within 48 hours of departure are non-refundable.</p>
              </div>
            </div>

            <div className="rounded-3xl bg-slate-50 p-5">
              <h3 className="text-sm font-black uppercase tracking-[0.2em] text-slate-500">FAQ</h3>
              <div className="mt-4 space-y-3">
                {faqItems.map((item) => (
                  <details key={item.question} className="group rounded-2xl border border-slate-100 bg-white p-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-semibold text-slate-800">
                      {item.question}
                      <ChevronDown className="h-4 w-4 text-slate-400 transition group-open:rotate-180" />
                    </summary>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{item.answer}</p>
                  </details>
                ))}
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
