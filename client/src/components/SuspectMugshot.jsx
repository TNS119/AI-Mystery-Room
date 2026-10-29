import React, { useState } from 'react';
import { getSuspectPortrait, getSuspectFallbackSvg } from '../utils/suspectImages';

export const SuspectMugshot = ({
  suspect,
  index = 0,
  isSelected = false,
  showFullDetails = true,
  onClick,
  pinRef,
  className = ''
}) => {
  const [imgError, setImgError] = useState(false);
  const portrait = getSuspectPortrait(suspect, index);
  const fallbackSvg = getSuspectFallbackSvg(suspect?.name, suspect?.role);

  return (
    <div
      onClick={onClick}
      className={`polaroid rounded-lg cursor-pointer transition-all relative overflow-hidden flex flex-col justify-between ${
        isSelected
          ? 'border-2 border-rose-500 bg-[#251820] shadow-2xl shadow-rose-950/80 scale-[1.02] z-20'
          : 'border border-slate-700/80 bg-[#161c28] hover:border-amber-400/70 hover:shadow-xl'
      } ${className}`}
    >
      {/* Red Pushpin Anchor with Ref */}
      <div
        ref={pinRef}
        className="pushpin absolute -top-1.5 left-1/2 -translate-x-1/2 z-40"
      ></div>

      {/* Mugshot Photo Frame - 1:1 Aspect Ratio with Centered Face Framing */}
      <div className="relative w-full aspect-square rounded overflow-hidden bg-[#0c1017] border border-slate-700 shadow-inner group shrink-0">
        <img
          src={imgError ? fallbackSvg : portrait.url}
          alt={suspect?.name || 'Suspect'}
          onError={() => setImgError(true)}
          className="w-full h-full object-cover object-center filter grayscale-[10%] contrast-105 brightness-100 group-hover:grayscale-0 transition-all duration-300"
          loading="eager"
        />

        {/* Selection / Accused Stamp */}
        {isSelected && (
          <div className="absolute top-2 right-2 stamp-badge stamp-danger text-[9px] z-30 animate-pulse">
            PRIME ACCUSED
          </div>
        )}
      </div>

      {/* Suspect Dossier Details */}
      {showFullDetails && (
        <div className="pt-3 pb-1 flex-1 flex flex-col justify-between">
          <div>
            {/* Suspect Name on own line + Role Badge on next line (Zero Overlap/Truncation) */}
            <div className="mb-2">
              <h3 className="font-serif-noir text-sm font-bold text-slate-100 leading-snug">
                {suspect?.name}
              </h3>
              <div className="mt-1">
                <span className="inline-block text-[9px] font-mono-dossier px-1.5 py-0.5 rounded bg-slate-800 text-amber-300 border border-slate-700 max-w-full">
                  {suspect?.role}
                </span>
              </div>
            </div>

            <p className="font-typewriter text-[11px] text-slate-300 leading-snug line-clamp-2 mb-2">
              {suspect?.description}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 text-[10px] font-typewriter text-amber-200/90 italic bg-black/30 p-1.5 rounded border border-amber-500/10">
            Alibi: "{suspect?.alibi}"
          </div>
        </div>
      )}
    </div>
  );
};

export default SuspectMugshot;
