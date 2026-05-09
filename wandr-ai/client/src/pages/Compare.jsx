import { Link } from 'react-router-dom';
import { useCompareStore } from '../store/compareStore';
import { Button } from '../components/common/Button';
import { ArrowLeft, ArrowLeftRight, Sparkles, Trash2, Heart } from 'lucide-react';

export default function Compare() {
  const { comparedTrips, removeCompareTrip, clearCompareTrips } = useCompareStore();

  if (comparedTrips.length === 0) {
    return (
      <div className="min-h-screen bg-slate-50 pt-20 pb-12 sm:pt-24">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="rounded-[2rem] border border-white/10 bg-gradient-to-r from-slate-950 via-primary-700 to-secondary-500 p-6 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
            <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
              <Sparkles className="h-4 w-4 text-secondary-300" />
              Compare trips
            </div>
            <h1 className="mt-4 text-4xl font-black">Pick up to 3 trips to compare.</h1>
            <p className="mt-3 max-w-2xl text-white/80">
              Use the compare buttons on trip cards, then return here to review pricing, duration, ratings, and inclusions side by side.
            </p>
            <Link to="/explore" className="mt-6 inline-flex">
              <Button variant="premium">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to explore
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const rows = [
    { label: 'Price', value: (trip) => trip.priceRange || (trip.price ? `$${trip.price}` : '—') },
    { label: 'Duration', value: (trip) => `${trip.duration || '—'} days` },
    { label: 'Rating', value: (trip) => (trip.rating ? `${trip.rating.toFixed(1)}/5` : '—') },
    { label: 'Budget', value: (trip) => trip.budget || '—' },
    { label: 'Inclusions', value: (trip) => (trip.highlights?.length ? trip.highlights.slice(0, 3).join(', ') : (trip.tags?.length ? trip.tags.slice(0, 3).join(', ') : '—')) },
  ];

  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12 sm:pt-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <section className="mb-8 overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-r from-slate-950 via-primary-700 to-secondary-500 p-5 text-white shadow-2xl shadow-slate-900/20 sm:p-8">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur">
                <ArrowLeftRight className="h-4 w-4 text-secondary-300" />
                Trip comparison
              </div>
              <h1 className="mt-4 text-4xl font-black tracking-tight sm:text-5xl">Compare your top picks.</h1>
              <p className="mt-3 max-w-2xl text-white/80">
                Review the important details side by side before you book.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link to="/wishlist">
                <Button variant="secondary" className="w-full sm:w-auto">
                  <Heart className="mr-2 h-4 w-4" />
                  Wishlist
                </Button>
              </Link>
              <Button variant="premium" onClick={clearCompareTrips}>
                <Trash2 className="mr-2 h-4 w-4" />
                Clear compare
              </Button>
            </div>
          </div>
        </section>

        <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-xl shadow-slate-900/5">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse text-left">
              <thead>
                <tr className="bg-slate-50 text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
                  <th className="sticky left-0 z-10 bg-slate-50 px-5 py-4">Compare</th>
                  {comparedTrips.map((trip) => (
                    <th key={trip._id} className="px-5 py-4 align-top">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="text-base font-black text-slate-900">{trip.title}</div>
                          <div className="mt-1 text-sm font-medium normal-case tracking-normal text-slate-500">{trip.destination}</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeCompareTrip(trip._id)}
                          className="rounded-full p-2 text-slate-400 transition hover:bg-slate-100 hover:text-red-600"
                          title="Remove trip"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {rows.map((row) => (
                  <tr key={row.label}>
                    <th className="sticky left-0 z-10 bg-white px-5 py-4 text-sm font-bold text-slate-700">{row.label}</th>
                    {comparedTrips.map((trip) => (
                      <td key={trip._id} className="px-5 py-4 text-sm leading-6 text-slate-600">
                        {row.value(trip)}
                      </td>
                    ))}
                  </tr>
                ))}
                <tr>
                  <th className="sticky left-0 z-10 bg-white px-5 py-4 text-sm font-bold text-slate-700">Action</th>
                  {comparedTrips.map((trip) => (
                    <td key={trip._id} className="px-5 py-4">
                      <Link to={`/trip/${trip._id}`}>
                        <Button variant="outline" className="w-full">
                          View trip
                        </Button>
                      </Link>
                    </td>
                  ))}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
