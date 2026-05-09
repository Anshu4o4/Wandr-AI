import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useUserStore } from '../store/userStore';
import { useCompareStore } from '../store/compareStore';
import { TripCard } from '../components/trips/TripCard';
import { TripCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { EmptyState } from '../components/common/EmptyState';
import { Heart, ArrowRight, ArrowLeftRight, Sparkles } from 'lucide-react';

export default function Wishlist() {
  const { savedTrips, isLoading, fetchSavedTrips } = useUserStore();
  const { comparedTrips } = useCompareStore();

  useEffect(() => {
    fetchSavedTrips();
  }, [fetchSavedTrips]);

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-r from-slate-950 via-primary-700 to-secondary-500 p-5 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <Sparkles className="h-4 w-4 text-secondary-300" />
                Your travel wishlist
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Saved trips in one place.</h1>
              <p className="mt-3 max-w-2xl text-white/80">
                Review, compare, and remove trips before you book. Everything stays synced with your saved trips list.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur">
                <div className="text-2xl font-black">{savedTrips.length}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/70">saved trips</div>
              </div>
              <div className="rounded-3xl border border-white/10 bg-white/10 p-4 text-center backdrop-blur">
                <div className="text-2xl font-black">{comparedTrips.length}</div>
                <div className="text-xs uppercase tracking-[0.2em] text-white/70">in compare</div>
              </div>
            </div>
          </div>
        </section>

        {comparedTrips.length > 0 && (
          <div className="mb-8 rounded-[2rem] border border-primary-100 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Comparison ready</p>
                <h2 className="mt-2 text-xl font-black text-slate-900">{comparedTrips.length} trip(s) selected for comparison</h2>
              </div>
              <Link to="/compare">
                <Button variant="premium" className="w-full md:w-auto">
                  <ArrowLeftRight className="mr-2 h-4 w-4" />
                  Compare now
                </Button>
              </Link>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[1, 2, 3].map((item) => (
              <TripCardSkeleton key={item} />
            ))}
          </div>
        ) : savedTrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {savedTrips.map((trip) => (
              <TripCard key={trip._id} trip={trip} showRemoveAction />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            description="Save trips from Explore or the homepage to build a shortlist you can compare and book later."
            ctaLabel="Explore trips"
            ctaTo="/explore"
          />
        )}
      </div>
    </div>
  );
}
