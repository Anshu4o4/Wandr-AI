import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTripStore } from '../store/tripStore';
import { TripCard } from '../components/trips/TripCard';
import { TripCardSkeleton } from '../components/common/Skeleton';
import { Button } from '../components/common/Button';
import { ArrowRight, Check, Compass, Filter, MapPin, Search, Sparkles, Star, X } from 'lucide-react';
import { DESTINATION_COLLECTIONS } from '../data/travelCatalog';

const STORAGE_KEY = 'wandr-recent-searches';
const PRICE_OPTIONS = [
  { label: 'Budget', value: 'budget' },
  { label: 'Mid-range', value: 'mid-range' },
  { label: 'Luxury', value: 'luxury' },
];
const DURATION_OPTIONS = [
  { label: '2-4 days', value: 'short' },
  { label: '5-6 days', value: 'medium' },
  { label: '7+ days', value: 'long' },
];
const RATING_OPTIONS = [
  { label: '4.3+', value: '4.3' },
  { label: '4.5+', value: '4.5' },
  { label: '4.7+', value: '4.7' },
];
const TYPE_OPTIONS = ['Beach', 'Mountain', 'City', 'Cultural', 'Adventure', 'Food', 'Luxury', 'Budget', 'Family'];
const SORT_OPTIONS = [
  { label: 'Recommended', value: 'popular' },
  { label: 'Price: Low → High', value: 'price-asc' },
  { label: 'Price: High → Low', value: 'price-desc' },
  { label: 'Rating', value: 'rating' },
  { label: 'Popularity', value: 'popularity' },
];

const normalize = (value) => value?.toString().trim().toLowerCase() || '';

export default function Explore() {
  const { allTrips, isLoading, fetchAllTrips } = useTripStore();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [priceFilter, setPriceFilter] = useState('');
  const [durationFilter, setDurationFilter] = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [typeFilters, setTypeFilters] = useState([]);
  const [recentSearches, setRecentSearches] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  useEffect(() => {
    void fetchAllTrips();

    const storedRecent = localStorage.getItem(STORAGE_KEY);
    if (storedRecent) {
      try {
        setRecentSearches(JSON.parse(storedRecent));
      } catch {
        setRecentSearches([]);
      }
    }

    const initialDestination = searchParams.get('destination') || '';
    if (initialDestination) {
      setSearchQuery(initialDestination);
    }
  }, [fetchAllTrips, searchParams]);

  useEffect(() => {
    const destination = searchParams.get('destination') || '';
    if (destination && destination !== searchQuery) {
      setSearchQuery(destination);
    }
  }, [searchParams, searchQuery]);

  const suggestionPool = useMemo(() => {
    const values = [
      ...DESTINATION_COLLECTIONS.map((item) => item.destination),
      ...allTrips.flatMap((trip) => [trip.destination, trip.title, ...(trip.category || []), ...(trip.tags || [])]),
      ...recentSearches,
      'Bali',
      'Manali',
      'Dubai',
      'Paris',
      'Tokyo',
      'Santorini',
    ];

    return Array.from(new Set(values.filter(Boolean)));
  }, [allTrips, recentSearches]);

  const suggestions = useMemo(() => {
    const query = normalize(searchQuery);
    const base = query
      ? suggestionPool.filter((item) => normalize(item).includes(query))
      : [...recentSearches, ...DESTINATION_COLLECTIONS.map((item) => item.destination)];

    return Array.from(new Set(base)).slice(0, 6);
  }, [searchQuery, suggestionPool, recentSearches]);

  const filteredTrips = useMemo(() => {
    const query = normalize(searchQuery);

    const list = allTrips.filter((trip) => {
      const searchTarget = [
        trip.title,
        trip.destination,
        trip.description,
        ...(trip.category || []),
        ...(trip.tags || []),
      ].join(' ').toLowerCase();

      const matchesSearch = !query || searchTarget.includes(query);
      const matchesPrice = !priceFilter || trip.budget === priceFilter;
      const matchesDuration =
        !durationFilter ||
        (durationFilter === 'short' && trip.duration <= 4) ||
        (durationFilter === 'medium' && trip.duration >= 5 && trip.duration <= 6) ||
        (durationFilter === 'long' && trip.duration >= 7);
      const matchesRating = !ratingFilter || Number(trip.rating || 0) >= Number(ratingFilter);
      const typePool = [...(trip.category || []), ...(trip.tags || [])].map(normalize);
      const matchesType = typeFilters.length === 0 || typeFilters.some((type) => typePool.includes(normalize(type)));

      return matchesSearch && matchesPrice && matchesDuration && matchesRating && matchesType;
    });

    const sorted = [...list].sort((a, b) => {
      if (sortBy === 'price-asc') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-desc') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      if (sortBy === 'popularity') return (b.ratingsCount || 0) - (a.ratingsCount || 0);
      const popularityDelta = (b.ratingsCount || 0) - (a.ratingsCount || 0);
      return popularityDelta !== 0 ? popularityDelta : (b.rating || 0) - (a.rating || 0);
    });

    return sorted;
  }, [allTrips, searchQuery, priceFilter, durationFilter, ratingFilter, typeFilters, sortBy]);

  const activeFilterPills = [
    searchQuery ? { label: `Search: ${searchQuery}`, onRemove: () => setSearchQuery('') } : null,
    priceFilter ? { label: `Price: ${PRICE_OPTIONS.find((item) => item.value === priceFilter)?.label || priceFilter}`, onRemove: () => setPriceFilter('') } : null,
    durationFilter ? { label: `Duration: ${DURATION_OPTIONS.find((item) => item.value === durationFilter)?.label || durationFilter}`, onRemove: () => setDurationFilter('') } : null,
    ratingFilter ? { label: `Rating: ${ratingFilter}+`, onRemove: () => setRatingFilter('') } : null,
    ...typeFilters.map((type) => ({ label: `Type: ${type}`, onRemove: () => setTypeFilters((prev) => prev.filter((item) => item !== type)) })),
  ].filter(Boolean);

  const clearAllFilters = () => {
    setSearchQuery('');
    setPriceFilter('');
    setDurationFilter('');
    setRatingFilter('');
    setTypeFilters([]);
    setSortBy('popular');
    setSearchParams({});
    setShowSuggestions(false);
  };

  const saveRecentSearch = (value) => {
    const next = [value, ...recentSearches.filter((item) => item !== value)].slice(0, 6);
    setRecentSearches(next);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  };

  const handleSearchSubmit = (value) => {
    const query = value.trim();
    setSearchQuery(query);
    if (query) {
      saveRecentSearch(query);
      setSearchParams({ destination: query });
    } else {
      setSearchParams({});
    }
    setShowSuggestions(false);
  };

  const toggleType = (type) => {
    setTypeFilters((prev) =>
      prev.includes(type) ? prev.filter((item) => item !== type) : [...prev, type]
    );
  };

  return (
    <div className="min-h-screen bg-[#f7f4ee] pt-20 pb-12 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-slate-200 bg-gradient-to-r from-primary-50 via-white to-secondary-50 p-5 text-slate-900 shadow-lg shadow-slate-900/5 sm:p-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-white px-4 py-2 text-sm font-medium text-primary-700 shadow-sm">
                <Sparkles className="h-4 w-4 text-secondary-500" />
                Curated travel marketplace
              </div>
              <h1 className="mt-4 text-3xl font-black tracking-tight sm:text-4xl lg:text-5xl">Find the right trip in seconds.</h1>
              <p className="mt-4 text-base leading-7 text-slate-600">
                Search naturally, filter instantly, and compare destinations with clear pricing, ratings, and trip styles.
              </p>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 sm:gap-4">
              {[
                { value: `${allTrips.length || 0}+`, label: 'destinations' },
                { value: '4.8/5', label: 'avg. rating' },
                { value: 'Instant', label: 'filtering' },
                { value: 'Smart', label: 'search' },
              ].map((stat) => (
                <div key={stat.label} className="rounded-3xl border border-slate-200 bg-white p-4 text-center shadow-sm">
                  <div className="text-2xl font-black">{stat.value}</div>
                  <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="mb-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {DESTINATION_COLLECTIONS.map((item) => (
            <button
              key={item.title}
              type="button"
              onClick={() => handleSearchSubmit(item.destination)}
              className="rounded-3xl border border-slate-200 bg-white px-4 py-4 text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg hover:shadow-slate-900/5"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.2em] text-primary-600">Quick pick</p>
                  <h3 className="mt-1 text-lg font-black text-slate-900">{item.title}</h3>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </div>
            </button>
          ))}
        </div>

        <div className="mb-8 rounded-[2rem] border border-slate-100 bg-white p-5 shadow-lg shadow-slate-900/5 sm:p-6">
          <div className="relative">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSuggestions(true);
                  }}
                  onFocus={() => setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 120)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchSubmit(searchQuery);
                    }
                  }}
                  placeholder="Search by destination, city, style, or vibe..."
                  className="w-full rounded-full border border-slate-200 bg-slate-50 py-4 pl-12 pr-4 text-slate-800 shadow-sm focus:border-primary-500 focus:bg-white focus:ring-2 focus:ring-primary-500/20"
                />

                {showSuggestions && suggestions.length > 0 && (
                  <div className="absolute left-0 right-0 top-[calc(100%+0.5rem)] z-20 overflow-hidden rounded-3xl border border-slate-100 bg-white shadow-2xl">
                    <div className="border-b border-slate-100 px-4 py-3 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">
                      Suggestions
                    </div>
                    <div className="max-h-72 overflow-y-auto">
                      {suggestions.map((suggestion) => (
                        <button
                          key={suggestion}
                          type="button"
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => handleSearchSubmit(suggestion)}
                          className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm text-slate-700 transition hover:bg-slate-50"
                        >
                          <MapPin className="h-4 w-4 text-primary-500" />
                          <span>{suggestion}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button type="button" variant="secondary" className="rounded-full" onClick={() => setIsFilterOpen((prev) => !prev)}>
                  <Filter className="mr-2 h-4 w-4" />
                  Filters
                </Button>
                <select
                  className="min-h-11 rounded-full border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20"
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {recentSearches.length > 0 && (
            <div className="mt-5">
              <div className="mb-2 text-xs font-bold uppercase tracking-[0.2em] text-slate-400">Recent searches</div>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((item) => (
                  <button
                    key={item}
                    type="button"
                    onClick={() => handleSearchSubmit(item)}
                    className="rounded-full border border-slate-200 bg-slate-50 px-4 py-2 text-sm font-medium text-slate-600 transition hover:border-primary-300 hover:text-primary-700"
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="mt-6 flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              {PRICE_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setPriceFilter((prev) => (prev === item.value ? '' : item.value))}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    priceFilter === item.value
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:text-primary-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {DURATION_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setDurationFilter((prev) => (prev === item.value ? '' : item.value))}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    durationFilter === item.value
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:text-primary-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}

              {RATING_OPTIONS.map((item) => (
                <button
                  key={item.value}
                  type="button"
                  onClick={() => setRatingFilter((prev) => (prev === item.value ? '' : item.value))}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    ratingFilter === item.value
                      ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/20'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:text-primary-700'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            <div className="flex flex-wrap gap-2">
              {TYPE_OPTIONS.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    typeFilters.includes(type)
                      ? 'bg-slate-900 text-white shadow-lg shadow-slate-900/20'
                      : 'border border-slate-200 bg-white text-slate-700 hover:border-primary-300 hover:text-primary-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
        </div>

        {activeFilterPills.length > 0 && (
          <div className="mb-6 rounded-[2rem] border border-slate-100 bg-white p-4 shadow-sm sm:p-5">
            <div className="mb-3 flex items-center justify-between">
              <div className="text-sm font-semibold text-slate-700">Active filters</div>
              <button type="button" onClick={clearAllFilters} className="text-sm font-semibold text-primary-600 hover:text-primary-700">
                Clear all
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {activeFilterPills.map((pill) => (
                <button
                  key={pill.label}
                  type="button"
                  onClick={pill.onRemove}
                  className="inline-flex items-center gap-2 rounded-full border border-primary-100 bg-primary-50 px-4 py-2 text-sm font-medium text-primary-700"
                >
                  {pill.label}
                  <X className="h-3.5 w-3.5" />
                </button>
              ))}
            </div>
          </div>
        )}

        <div className="mb-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-slate-900">Trips</h2>
            <p className="mt-1 text-slate-600">{filteredTrips.length} results match your search</p>
          </div>
          <button
            type="button"
            onClick={clearAllFilters}
            className="hidden rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-600 shadow-sm hover:border-primary-300 hover:text-primary-700 sm:inline-flex"
          >
            Reset discovery
          </button>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {[...Array(6)].map((_, i) => (
              <TripCardSkeleton key={i} />
            ))}
          </div>
        ) : filteredTrips.length > 0 ? (
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
            {filteredTrips.map((trip) => (
              <TripCard key={trip._id} trip={trip} />
            ))}
          </div>
        ) : (
          <div className="rounded-[2rem] border border-dashed border-slate-300 bg-white px-6 py-16 text-center shadow-sm">
            <Compass className="mx-auto mb-4 h-12 w-12 text-slate-300" />
            <h3 className="text-2xl font-black text-slate-900">No trips match those filters</h3>
            <p className="mx-auto mt-3 max-w-lg text-slate-600">
              Try a broader search or clear one of the chips to discover more options.
            </p>
            <Button onClick={clearAllFilters} className="mt-6 rounded-full">
              Clear filters
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
