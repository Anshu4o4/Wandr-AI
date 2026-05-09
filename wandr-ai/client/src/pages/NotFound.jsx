import { Link } from 'react-router-dom';
import { Button } from '../components/common/Button';
import { Compass, ArrowLeft, Terminal, AlertTriangle } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4 py-32 bg-navy text-ivory relative overflow-hidden">
      {/* Background Lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60%] h-[60%] bg-primary-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-md text-center">
        <div className="mx-auto mb-10 flex h-24 w-24 items-center justify-center rounded-3xl bg-white/5 border border-white/10 text-primary-500 shadow-lg shadow-primary-500/10 animate-pulse">
          <AlertTriangle className="h-10 w-10" />
        </div>
        <p className="text-[10px] font-black text-primary-500 uppercase tracking-[0.4em] mb-4">Error 404 / Vector Not Found</p>
        <h1 className="text-5xl font-black text-ivory tracking-tighter mb-6 leading-none">Identity <span className="text-gradient">Severed.</span></h1>
        <p className="text-ivory/40 font-bold leading-relaxed mb-12 tracking-tight">
          The requested coordinate does not exist in the discovery matrix. The link may have been redacted or moved.
        </p>
        <Link to="/">
          <Button size="lg" className="h-16 px-10 rounded-2xl font-black uppercase tracking-[0.3em] text-[10px] shadow-glass">
            <ArrowLeft className="mr-3 h-5 w-5" /> Return to Origin
          </Button>
        </Link>

        <div className="mt-20 flex items-center justify-center gap-8 text-[10px] font-black text-ivory/5 uppercase tracking-[0.3em]">
           <span className="flex items-center gap-2"><Terminal className="h-4 w-4" /> System Core</span>
           <span className="flex items-center gap-2"><Compass className="h-4 w-4" /> Path Redirect</span>
        </div>
      </div>
    </div>
  );
}
