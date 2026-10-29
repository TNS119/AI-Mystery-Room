import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { soundEngine } from '../utils/sound';

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const isCaseRoute = location.pathname.startsWith('/case/');
  const pathParts = location.pathname.split('/');
  const caseId = isCaseRoute ? pathParts[2] : null;
  const isAccuse = location.pathname.endsWith('/accuse');
  const isResult = location.pathname.endsWith('/result');
  const isInvestigate = isCaseRoute && !isAccuse && !isResult;
  const isCreate = location.pathname === '/create';

  const [muted, setMuted] = useState(soundEngine.isMuted());

  useEffect(() => {
    const unsubscribe = soundEngine.subscribe((newMuted) => {
      setMuted(newMuted);
    });
    return unsubscribe;
  }, []);

  const handleToggleSound = () => {
    const isNowMuted = soundEngine.toggleMute();
    setMuted(isNowMuted);
  };

  return (
    <header className="border-b border-amber-900/40 bg-[#0a0d14]/95 backdrop-blur-md sticky top-0 z-40 w-full">
      {/* Caution Stripe Accent */}
      <div className="h-1 crime-tape-stripe opacity-40"></div>

      <div className="w-full px-3 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand Logo & Bureau Seal */}
        <div className="flex items-center gap-4">
          <Link
            to="/"
            onClick={() => soundEngine.playClick()}
            className="flex items-center gap-3 group"
          >
            <div className="w-9 h-9 rounded bg-[#161b26] border border-amber-500/40 flex items-center justify-center text-amber-400 font-serif-noir font-bold text-sm tracking-wider shadow-inner group-hover:border-amber-400 transition-colors">
              MR
            </div>
            <div>
              <span className="font-serif-noir text-base font-bold tracking-wider text-slate-100 group-hover:text-amber-400 transition-colors block leading-tight">
                AI MYSTERY ROOM
              </span>
              <span className="font-mono-dossier text-[10px] text-amber-500/70 uppercase tracking-widest block">
                Special Investigation Bureau
              </span>
            </div>
          </Link>
        </div>

        {/* Step Indicator (Clickable breadcrumbs when inside a case) */}
        {isCaseRoute && caseId && (
          <nav aria-label="Investigation progress" className="hidden sm:flex items-center gap-2 text-xs uppercase tracking-widest font-mono-dossier">
            <Link
              to={`/case/${caseId}`}
              onClick={() => soundEngine.playPaper()}
              className={`px-3 py-1 rounded border transition-colors ${
                isInvestigate
                  ? 'border-amber-500 text-amber-300 bg-amber-500/10 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700'
              }`}
            >
              1. Crime Board
            </Link>
            <span className="text-amber-500/40">→</span>
            <Link
              to={`/case/${caseId}/accuse`}
              onClick={() => soundEngine.playPaper()}
              className={`px-3 py-1 rounded border transition-colors ${
                isAccuse
                  ? 'border-amber-500 text-amber-300 bg-amber-500/10 font-bold'
                  : 'border-slate-800 text-slate-400 hover:text-amber-300 hover:border-slate-700'
              }`}
            >
              2. Accusation
            </Link>
            <span className="text-amber-500/40">→</span>
            <span
              className={`px-3 py-1 rounded border transition-colors ${
                isResult
                  ? 'border-amber-500 text-amber-300 bg-amber-500/10 font-bold'
                  : 'border-slate-800 text-slate-600'
              }`}
            >
              3. Verdict
            </span>
          </nav>
        )}

        {/* Actions & Audio Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleToggleSound}
            className={`px-3 py-1.5 text-xs font-mono-dossier rounded border transition-all ${
              muted
                ? 'border-slate-800 text-slate-500 hover:text-slate-300 bg-slate-900/60'
                : 'border-amber-500/40 text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 shadow-sm shadow-amber-500/20'
            }`}
            title="Toggle atmospheric audio"
          >
            {muted ? 'Audio: Muted' : 'Audio: Active'}
          </button>

          <Link
            to="/create"
            onClick={() => soundEngine.playClick()}
            className="px-4 py-1.5 text-xs font-semibold rounded bg-amber-500 text-slate-950 hover:bg-amber-400 active:scale-95 transition-all shadow-md shadow-amber-500/20 font-serif-noir tracking-wider uppercase"
          >
            New Case
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
