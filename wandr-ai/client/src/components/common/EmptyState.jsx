import { Link } from 'react-router-dom';
import { Button } from './Button';

export function EmptyState({
  icon: Icon,
  title,
  description,
  ctaLabel,
  ctaTo,
  secondaryAction,
  className = '',
}) {
  return (
    <div className={`rounded-[2rem] border border-dashed border-slate-200 bg-white px-6 py-16 text-center shadow-sm ${className}`}>
      {Icon && (
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-primary-50 text-primary-600">
          <Icon className="h-8 w-8" />
        </div>
      )}
      <h2 className="text-2xl font-black text-slate-900">{title}</h2>
      <p className="mx-auto mt-3 max-w-lg text-slate-600">{description}</p>
      <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
        {ctaTo && ctaLabel && (
          <Link to={ctaTo}>
            <Button variant="premium">{ctaLabel}</Button>
          </Link>
        )}
        {secondaryAction}
      </div>
    </div>
  );
}
