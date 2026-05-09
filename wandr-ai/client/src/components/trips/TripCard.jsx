import { Link } from 'react-router-dom';
import { Star, Clock, MapPin, DollarSign, Heart, ArrowLeftRight, Check } from 'lucide-react';
import { useUserStore } from '../../store/userStore';
import { useAuthStore } from '../../store/authStore';
import { useCompareStore } from '../../store/compareStore';
import { useNavigate } from 'react-router-dom';
import { getOptimizedImageUrl } from '../../utils/image';

const FALLBACK_COVER_IMAGE = 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?q=80&w=1200&auto=format&fit=crop';

export const TripCard = ({ trip, showCompare = true, showRemoveAction = false, linkState }) => {
  const { user } = useAuthStore();
  const { savedTrips, toggleSaveTrip } = useUserStore();
  const { comparedTrips, toggleCompareTrip } = useCompareStore();
  const navigate = useNavigate();
  const safeTags = Array.isArray(trip.tags) ? trip.tags : Array.isArray(trip.category) ? trip.category : [];
  const safeHighlights = Array.isArray(trip.highlights) ? trip.highlights : [];
  const ratingValue = Number.isFinite(Number(trip.rating)) ? Number(trip.rating).toFixed(1) : 'NEW';
  const isSaved = savedTrips.some(t => (t._id || t) === trip._id);
  const isCompared = comparedTrips.some(t => t._id === trip._id);
  const imageSrc = getOptimizedImageUrl(trip.coverImage || trip.image || trip.thumbnail || FALLBACK_COVER_IMAGE, { width: 900, quality: 70 });

  const handleToggleSave = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) {
      navigate('/login');
      return;
    }
    await toggleSaveTrip(trip._id, trip);
  };

  const handleToggleCompare = (e) => {
    e.preventDefault();
    e.stopPropagation();
    toggleCompareTrip(trip);
  };

  return (
    <div className="group relative flex h-full flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl">
      {showCompare && (
        <div className="absolute left-4 top-4 z-10">
          <button
            onClick={handleToggleCompare}
            title={isCompared ? 'Remove from compare' : 'Add to compare'}
            className={`flex min-h-11 min-w-11 items-center justify-center rounded-full border backdrop-blur-sm transition-all ${
              isCompared
                ? 'border-primary-500 bg-primary-600 text-white shadow-lg shadow-primary-600/30'
                : 'border-white/70 bg-white/90 text-slate-500 shadow-sm hover:border-primary-300 hover:text-primary-600'
            }`}
          >
            {isCompared ? <Check className="h-4 w-4" /> : <ArrowLeftRight className="h-4 w-4" />}
          </button>
        </div>
      )}

      <div className="absolute top-4 right-4 z-10 flex gap-2">
        <button 
          onClick={handleToggleSave}
          title={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
          className={`rounded-full p-2.5 backdrop-blur-sm transition-all ${
            isSaved ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30' : 'bg-white/90 text-slate-400 shadow-sm hover:text-primary-600'
          }`}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
        </button>
        <div className="flex items-center rounded-full bg-white/90 px-2.5 py-1 backdrop-blur-sm shadow-sm">
          <Star className="w-4 h-4 text-secondary-500 fill-current" />
          <span className="ml-1 text-sm font-semibold text-slate-700">{ratingValue}</span>
        </div>
      </div>

      <div className="relative aspect-[4/3] overflow-hidden sm:aspect-auto sm:h-56">
        <img 
          src={imageSrc}
          alt={trip.title} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          loading="lazy"
          decoding="async"
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = FALLBACK_COVER_IMAGE;
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/25 to-transparent"></div>
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <div className="mb-2 inline-flex items-center rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] backdrop-blur-sm">
            Curated trip
          </div>
          <div className="mb-1 flex items-center text-sm font-medium opacity-90">
            <MapPin className="w-4 h-4 mr-1" />
            {trip.destination}
          </div>
          <h3 className="text-xl font-bold leading-tight line-clamp-1">{trip.title}</h3>
        </div>
      </div>

      <div className="flex flex-grow flex-col p-5">
        <p className="mb-4 flex-grow text-sm leading-6 line-clamp-2 text-slate-600">
          {trip.description}
        </p>

        <div className="mb-4 flex flex-wrap gap-2">
          {safeTags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600"
            >
              {tag}
            </span>
          ))}
        </div>

        {safeHighlights.length ? (
          <div className="mb-4 space-y-1.5 rounded-2xl bg-slate-50 p-3">
            <div className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Highlights</div>
            <p className="text-sm leading-6 text-slate-600 line-clamp-2">{safeHighlights.slice(0, 2).join(' • ')}</p>
          </div>
        ) : null}

        <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-4">
          <div className="flex flex-col">
            <span className="text-xs text-slate-500 uppercase tracking-wider font-semibold">From</span>
            <div className="flex items-center text-lg font-bold text-slate-900">
              <DollarSign className="w-5 h-5 text-primary-600" />
              {trip.priceRange || (trip.price ? `$${trip.price}` : 'View pricing')}
            </div>
          </div>

          <div className="flex items-center rounded-xl border border-slate-100 bg-slate-50 px-3 py-1.5 text-sm text-slate-600">
            <Clock className="w-4 h-4 mr-1.5 text-slate-400" />
            {trip.duration} Days
          </div>
        </div>

        <Link 
          to={`/trip/${trip._id}`}
          state={linkState}
          className="mt-4 block w-full rounded-2xl bg-gradient-to-r from-primary-600 to-secondary-500 py-3 text-center font-semibold text-white shadow-lg shadow-primary-600/20 transition-transform duration-300 hover:-translate-y-0.5"
        >
          View Details
        </Link>

        {showRemoveAction && isSaved && (
          <button
            type="button"
            onClick={handleToggleSave}
            className="mt-3 min-h-11 rounded-2xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 transition hover:bg-red-100"
          >
            Remove from wishlist
          </button>
        )}
      </div>
    </div>
  );
};
