import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-4">
        <span className="font-serif-noir text-6xl font-bold text-amber-500/40 block">
          404
        </span>
        <h1 className="font-serif-noir text-2xl font-bold text-slate-100">
          Dead End
        </h1>
        <p className="text-sm text-slate-400">
          This trail has gone completely cold. There are no clues or suspects at this location.
        </p>
        <div className="pt-2">
          <Link
            to="/"
            className="inline-block px-6 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-colors"
          >
            Return to Precinct
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
