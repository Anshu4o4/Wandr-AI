/**
 * Reusable Skeleton Loader Component
 * Use for showing loading states while data is being fetched
 */
export function Skeleton({ width = '100%', height = '1rem', className = '' }) {
  return (
    <div
      className={`animate-pulse rounded-2xl bg-slate-200/80 ${className}`}
      style={{
        width,
        height,
      }}
    />
  );
}

/**
 * Trip Card Skeleton - matches TripCard dimensions
 * Height: 280px, with image placeholder (60%) and content area (40%)
 */
export function TripCardSkeleton() {
  return (
    <div className="flex h-[320px] flex-col overflow-hidden rounded-[2rem] border border-slate-100 bg-white shadow-sm animate-pulse">
      {/* Image placeholder - 60% of height */}
      <div className="h-[180px] w-full bg-slate-200/80"></div>
      
      {/* Content area - 40% of height */}
      <div className="flex flex-1 flex-col justify-between p-5">
        {/* Title skeleton */}
        <Skeleton height="1.125rem" className="mb-3" />
        
        {/* Description skeleton - 2 lines */}
        <div className="space-y-2">
          <Skeleton height="0.875rem" width="95%" />
          <Skeleton height="0.875rem" width="80%" />
        </div>
        
        {/* Price skeleton */}
        <Skeleton height="1.25rem" width="40%" />
      </div>
    </div>
  );
}

/**
 * Trip Detail Page Skeleton
 * Matches the TripDetail page layout
 */
export function TripDetailSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 pt-20 pb-12">
      {/* Hero Image Placeholder */}
      <div className="h-[50vh] w-full animate-pulse bg-slate-200/80"></div>
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Main Content */}
          <div className="lg:w-2/3">
            {/* Tabs skeleton */}
            <div className="sticky top-20 z-10 mb-4 flex space-x-4 rounded-t-2xl border-b border-slate-200 bg-white px-2 pt-2 p-6 animate-pulse">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} width="80px" height="2rem" className="rounded-lg" />
              ))}
            </div>

            {/* Content area */}
            <div className="rounded-b-2xl border border-t-0 border-slate-200 bg-white p-8 shadow-sm">
              {/* Title skeleton */}
              <Skeleton height="2rem" width="40%" className="mb-4" />
              
              {/* Content lines */}
              <div className="space-y-3">
                <Skeleton height="1rem" width="100%" />
                <Skeleton height="1rem" width="98%" />
                <Skeleton height="1rem" width="95%" />
                <Skeleton height="1rem" width="90%" />
                <Skeleton height="1rem" width="85%" />
              </div>
            </div>
          </div>

          {/* Sidebar Booking Card */}
          <div className="lg:w-1/3">
            <div className="sticky top-24 rounded-2xl border border-slate-200 bg-white p-6 shadow-xl animate-pulse">
              {/* Price skeleton */}
              <Skeleton height="2.5rem" width="60%" className="mb-6" />
              
              {/* Form fields skeletons */}
              <div className="space-y-4 mb-6">
                <Skeleton height="3rem" width="100%" className="rounded-lg" />
                <Skeleton height="3rem" width="100%" className="rounded-lg" />
              </div>

              {/* Button skeleton */}
              <Skeleton height="2.5rem" width="100%" className="rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/**
 * Booking Row Skeleton - for table-like layouts
 * Height: 96px (matches booking card height)
 */
export function BookingRowSkeleton() {
  return (
    <div className="flex flex-col sm:flex-row border border-slate-100 rounded-xl p-4 gap-4 items-center bg-white animate-pulse">
      {/* Image placeholder */}
      <Skeleton width="120px" height="96px" className="rounded-lg sm:w-24 sm:h-24 flex-shrink-0" />
      
      {/* Content area */}
      <div className="flex-1 w-full space-y-2">
        <Skeleton height="1.25rem" width="40%" />
        <Skeleton height="0.875rem" width="60%" />
        <Skeleton height="1.5rem" width="30%" className="rounded-full" />
      </div>
      
      {/* Price placeholder */}
      <Skeleton width="100px" height="1.5rem" />
    </div>
  );
}
