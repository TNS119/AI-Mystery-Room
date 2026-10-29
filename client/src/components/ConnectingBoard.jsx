import React, { useState, useEffect, useRef, useCallback } from 'react';
import { soundEngine } from '../utils/sound';
import SuspectMugshot from './SuspectMugshot';
import EvidenceThumbnail from './EvidenceThumbnail';

export const ConnectingBoard = ({
  currentCase,
  onInspectClue,
  onDiscoverClue,
  discoveringId,
  onNavigateToSuspect
}) => {
  const [selectedSuspectId, setSelectedSuspectId] = useState(null);
  const [hoveredSuspectId, setHoveredSuspectId] = useState(null);
  const [hoveredClueId, setHoveredClueId] = useState(null);
  const [pinCoords, setPinCoords] = useState({ issue: null, suspects: {}, clues: {} });
  const [hasNotifiedCompletion, setHasNotifiedCompletion] = useState(false);

  const boardRef = useRef(null);
  const svgRef = useRef(null);
  const issueCardRef = useRef(null);
  const suspectCardRefs = useRef({});
  const clueCardRefs = useRef({});

  if (!currentCase) return null;

  const suspects = currentCase.suspects || [];
  const clues = currentCase.clues || [];
  const discoveredClues = clues.filter((c) => c.discovered);
  const allCluesDiscovered = clues.length > 0 && discoveredClues.length === clues.length;

  // Sound and notice when all clues are discovered
  useEffect(() => {
    if (allCluesDiscovered && !hasNotifiedCompletion) {
      setHasNotifiedCompletion(true);
      soundEngine.playSuccess?.() || soundEngine.playChimes?.();
    }
  }, [allCluesDiscovered, hasNotifiedCompletion]);

  // Measure exact center coordinates of the card pins relative to the SVG canvas
  const updatePinCoords = useCallback(() => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();

    // Central Issue Pin: exact top center of the issue card
    let issueCoord = null;
    if (issueCardRef.current) {
      const rect = issueCardRef.current.getBoundingClientRect();
      issueCoord = {
        x: rect.left - svgRect.left + rect.width / 2,
        y: rect.top - svgRect.top + 2
      };
    }

    // Suspect Pushpin: exact top center of each suspect card
    const newSuspects = {};
    suspects.forEach((s) => {
      const cardEl = suspectCardRefs.current[s.id];
      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        newSuspects[s.id] = {
          x: rect.left - svgRect.left + rect.width / 2,
          y: rect.top - svgRect.top + 2
        };
      }
    });

    // Clue Pushpin: top-left header pin of each clue card (offset 24px from left)
    const newClues = {};
    clues.forEach((c) => {
      const cardEl = clueCardRefs.current[c.id];
      if (cardEl) {
        const rect = cardEl.getBoundingClientRect();
        newClues[c.id] = {
          x: rect.left - svgRect.left + 24,
          y: rect.top - svgRect.top + 2
        };
      }
    });

    setPinCoords({ issue: issueCoord, suspects: newSuspects, clues: newClues });
  }, [suspects, clues]);

  // Recalculate on mount, resize, and layout settlement
  useEffect(() => {
    updatePinCoords();
    const handleResize = () => updatePinCoords();
    window.addEventListener('resize', handleResize);

    const observer = new ResizeObserver(() => {
      updatePinCoords();
    });

    if (boardRef.current) {
      observer.observe(boardRef.current);
    }

    const t1 = setTimeout(updatePinCoords, 100);
    const t2 = setTimeout(updatePinCoords, 400);

    return () => {
      window.removeEventListener('resize', handleResize);
      observer.disconnect();
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [updatePinCoords]);

  const handleSuspectClick = (suspectId) => {
    soundEngine.playStamp();
    setSelectedSuspectId((prev) => (prev === suspectId ? null : suspectId));
  };

  // Helper: check if a discovered clue text mentions a suspect (case-insensitive)
  const isClueLinkedToSuspect = (clue, suspect) => {
    if (!clue.discovered || !clue.text || !suspect) return false;
    const text = clue.text.toLowerCase();
    const name = (suspect.name || '').toLowerCase();
    const role = (suspect.role || '').toLowerCase();

    const firstName = name.split(' ')[0];
    if (firstName.length >= 3 && text.includes(firstName)) return true;
    if (text.includes(name)) return true;
    if (role.length >= 4 && text.includes(role)) return true;

    return false;
  };

  const activeSuspectId = selectedSuspectId || hoveredSuspectId;

  return (
    <div
      ref={boardRef}
      className="w-full relative corkboard-texture rounded-xl border-4 border-[#241a14] p-4 sm:p-6 shadow-2xl min-h-[620px] flex flex-col justify-between"
    >
      {/* 
        ========================================================================
        RED STRINGS YARN LAYER (z-30) - MOUNTED ABOVE UNHOVERED CARDS (z-10)
        ========================================================================
      */}
      <svg
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-30 overflow-visible"
      >
        <defs>
          {/* Shadow filter to give strings physical depth casting onto the cards below */}
          <filter id="yarnShadow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="1" dy="4" stdDeviation="2.5" floodColor="#000" floodOpacity="0.85" />
          </filter>
          {/* Intense neon glow filter for active/selected connections */}
          <filter id="yarnGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#ef4444" floodOpacity="0.95" />
            <feDropShadow dx="1" dy="5" stdDeviation="3" floodColor="#000" floodOpacity="0.8" />
          </filter>
          {/* 3D Metallic Pushpin Gradient */}
          <radialGradient id="pinGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stop-color="#f87171" />
            <stop offset="45%" stop-color="#ef4444" />
            <stop offset="100%" stop-color="#7f1d1d" />
          </radialGradient>
          {/* Pin Drop Shadow */}
          <filter id="pinShadow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="1" dy="3" stdDeviation="2" floodColor="#000" floodOpacity="0.85" />
          </filter>
        </defs>

        {pinCoords.issue && (
          <>
            {/* 
              ==================================================================
              GEOMETRIC FIGURE: THE FORENSIC CONSTELLATION WEB
              ==================================================================
            */}
            {/* A. Outer Perimeter Polygon (Forms a coherent geometric diamond/facet when all clues are unsealed) */}
            {allCluesDiscovered && (() => {
              const sortedSus = suspects
                .map((s) => pinCoords.suspects[s.id])
                .filter(Boolean)
                .sort((a, b) => a.x - b.x);
              const sortedClu = discoveredClues
                .map((c) => pinCoords.clues[c.id])
                .filter(Boolean)
                .sort((a, b) => a.x - b.x);

              if (sortedSus.length >= 2 && sortedClu.length >= 2) {
                const pts = [
                  `${pinCoords.issue.x},${pinCoords.issue.y}`,
                  `${sortedSus[sortedSus.length - 1].x},${sortedSus[sortedSus.length - 1].y}`,
                  `${sortedClu[sortedClu.length - 1].x},${sortedClu[sortedClu.length - 1].y}`,
                  `${sortedClu[0].x},${sortedClu[0].y}`,
                  `${sortedSus[0].x},${sortedSus[0].y}`
                ].join(' ');

                return (
                  <polygon
                    points={pts}
                    fill="rgba(239, 68, 68, 0.05)"
                    stroke="#ef4444"
                    strokeWidth="2.0"
                    strokeDasharray="6 3"
                    filter="url(#yarnGlow)"
                    className="animate-pulse"
                  />
                );
              }
              return null;
            })()}

            {/* B. Upper Crown Chords: Horizontal links connecting adjacent suspects */}
            {(() => {
              const sortedSus = suspects
                .map((s) => ({ ...s, coord: pinCoords.suspects[s.id] }))
                .filter((s) => s.coord != null)
                .sort((a, b) => a.coord.x - b.coord.x);

              return sortedSus.slice(0, -1).map((s, i) => {
                const next = sortedSus[i + 1];
                const isHi = allCluesDiscovered || activeSuspectId === s.id || activeSuspectId === next.id;
                return (
                  <line
                    key={`crown-${s.id}-${next.id}`}
                    x1={s.coord.x}
                    y1={s.coord.y}
                    x2={next.coord.x}
                    y2={next.coord.y}
                    stroke={isHi ? '#ef4444' : '#991b1b'}
                    strokeWidth={isHi ? 2.2 : 1.4}
                    strokeDasharray={allCluesDiscovered ? 'none' : '4 3'}
                    opacity={allCluesDiscovered ? 0.9 : 0.45}
                    filter={isHi ? 'url(#yarnGlow)' : 'url(#yarnShadow)'}
                  />
                );
              });
            })()}

            {/* C. Lower Foundation Chords: Links connecting adjacent discovered clues */}
            {(() => {
              const sortedClu = discoveredClues
                .map((c) => ({ ...c, coord: pinCoords.clues[c.id] }))
                .filter((c) => c.coord != null)
                .sort((a, b) => a.coord.x - b.coord.x);

              return sortedClu.slice(0, -1).map((c, i) => {
                const next = sortedClu[i + 1];
                const isHi = allCluesDiscovered || hoveredClueId === c.id || hoveredClueId === next.id;
                return (
                  <line
                    key={`foundation-${c.id}-${next.id}`}
                    x1={c.coord.x}
                    y1={c.coord.y}
                    x2={next.coord.x}
                    y2={next.coord.y}
                    stroke={isHi ? '#f87171' : '#b91c1c'}
                    strokeWidth={isHi ? 2.4 : 1.6}
                    strokeDasharray={allCluesDiscovered ? 'none' : '4 3'}
                    opacity={allCluesDiscovered ? 0.95 : 0.5}
                    filter={isHi ? 'url(#yarnGlow)' : 'url(#yarnShadow)'}
                  />
                );
              });
            })()}

            {/* D. Lateral Perimeter Struts: Connect leftmost & rightmost suspect to clues */}
            {allCluesDiscovered && (() => {
              const sortedSus = suspects
                .map((s) => pinCoords.suspects[s.id])
                .filter(Boolean)
                .sort((a, b) => a.x - b.x);
              const sortedClu = discoveredClues
                .map((c) => pinCoords.clues[c.id])
                .filter(Boolean)
                .sort((a, b) => a.x - b.x);

              if (sortedSus.length >= 2 && sortedClu.length >= 2) {
                return (
                  <>
                    <line
                      x1={sortedSus[0].x}
                      y1={sortedSus[0].y}
                      x2={sortedClu[0].x}
                      y2={sortedClu[0].y}
                      stroke="#ef4444"
                      strokeWidth="2.2"
                      filter="url(#yarnGlow)"
                    />
                    <line
                      x1={sortedSus[sortedSus.length - 1].x}
                      y1={sortedSus[sortedSus.length - 1].y}
                      x2={sortedClu[sortedClu.length - 1].x}
                      y2={sortedClu[sortedClu.length - 1].y}
                      stroke="#ef4444"
                      strokeWidth="2.2"
                      filter="url(#yarnGlow)"
                    />
                  </>
                );
              }
              return null;
            })()}

            {/* 1. STRINGS: CENTRAL INCIDENT PIN -> ALL SUSPECT PINS */}
            {suspects.map((suspect, idx) => {
              const sCoord = pinCoords.suspects[suspect.id];
              if (!sCoord) return null;

              const isHighlighted =
                allCluesDiscovered ||
                activeSuspectId === suspect.id ||
                hoveredClueId !== null;
              const isDimmed =
                !allCluesDiscovered &&
                activeSuspectId !== null &&
                activeSuspectId !== suspect.id;

              const midX = (pinCoords.issue.x + sCoord.x) / 2;
              const midY = (pinCoords.issue.y + sCoord.y) / 2 + 15;
              const pathD = `M ${pinCoords.issue.x} ${pinCoords.issue.y} Q ${midX} ${midY} ${sCoord.x} ${sCoord.y}`;

              return (
                <path
                  key={`issue-suspect-${suspect.id}`}
                  d={pathD}
                  fill="none"
                  stroke={isHighlighted ? '#ef4444' : '#b91c1c'}
                  strokeWidth={isHighlighted ? 3.0 : 2.0}
                  strokeDasharray={allCluesDiscovered ? 'none' : isHighlighted ? 'none' : '6 3'}
                  opacity={isDimmed ? 0.2 : isHighlighted ? 1 : 0.75}
                  filter={isHighlighted ? 'url(#yarnGlow)' : 'url(#yarnShadow)'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* 2. STRINGS: CENTRAL INCIDENT PIN -> DISCOVERED EVIDENCE PINS */}
            {discoveredClues.map((clue) => {
              const cCoord = pinCoords.clues[clue.id];
              if (!cCoord) return null;

              const isHighlighted = allCluesDiscovered || hoveredClueId === clue.id;
              const isDimmed =
                !allCluesDiscovered &&
                activeSuspectId !== null &&
                !suspects.some(
                  (s) => s.id === activeSuspectId && isClueLinkedToSuspect(clue, s)
                );

              const midX = (pinCoords.issue.x + cCoord.x) / 2;
              const midY = (pinCoords.issue.y + cCoord.y) / 2 + 20;
              const pathD = `M ${pinCoords.issue.x} ${pinCoords.issue.y} Q ${midX} ${midY} ${cCoord.x} ${cCoord.y}`;

              return (
                <path
                  key={`issue-clue-${clue.id}`}
                  d={pathD}
                  fill="none"
                  stroke={isHighlighted ? '#f87171' : '#dc2626'}
                  strokeWidth={isHighlighted ? 3.0 : 2.2}
                  opacity={isDimmed ? 0.15 : isHighlighted ? 1 : 0.8}
                  filter={isHighlighted ? 'url(#yarnGlow)' : 'url(#yarnShadow)'}
                  className="transition-all duration-300"
                />
              );
            })}

            {/* 3. STRINGS: DISCOVERED EVIDENCE PINS -> IMPLICATED SUSPECT PINS */}
            {discoveredClues.map((clue) => {
              const cCoord = pinCoords.clues[clue.id];
              if (!cCoord) return null;

              return suspects.map((suspect) => {
                if (!isClueLinkedToSuspect(clue, suspect)) return null;
                const sCoord = pinCoords.suspects[suspect.id];
                if (!sCoord) return null;

                const isConnectedToActive =
                  allCluesDiscovered ||
                  activeSuspectId === suspect.id ||
                  hoveredClueId === clue.id;

                const midX = (cCoord.x + sCoord.x) / 2;
                const midY = (cCoord.y + sCoord.y) / 2 - 12;
                const pathD = `M ${cCoord.x} ${cCoord.y} Q ${midX} ${midY} ${sCoord.x} ${sCoord.y}`;

                return (
                  <path
                    key={`clue-${clue.id}-suspect-${suspect.id}`}
                    d={pathD}
                    fill="none"
                    stroke={isConnectedToActive ? '#f43f5e' : '#e11d48'}
                    strokeWidth={isConnectedToActive ? 3.4 : 2.4}
                    opacity={
                      !allCluesDiscovered && activeSuspectId !== null && !isConnectedToActive ? 0.15 : 0.95
                    }
                    filter={
                      isConnectedToActive ? 'url(#yarnGlow)' : 'url(#yarnShadow)'
                    }
                    className="transition-all duration-300"
                  />
                );
              });
            })}

            {/* 
              ==================================================================
              3D PUSHPINS RENDERED DIRECTLY AT STRING ANCHORS (100% ALIGNMENT)
              ==================================================================
            */}
            {/* Central Incident Pushpin */}
            <g
              transform={`translate(${pinCoords.issue.x}, ${pinCoords.issue.y})`}
              filter="url(#pinShadow)"
            >
              <circle cx="0" cy="0" r="7" fill="url(#pinGrad)" stroke="#7f1d1d" strokeWidth="1" />
              <circle cx="-2" cy="-2" r="2.5" fill="#ffffff" opacity="0.65" />
            </g>

            {/* Suspect Pushpins */}
            {suspects.map((s) => {
              const coord = pinCoords.suspects[s.id];
              if (!coord) return null;
              return (
                <g
                  key={`pin-suspect-${s.id}`}
                  transform={`translate(${coord.x}, ${coord.y})`}
                  filter="url(#pinShadow)"
                >
                  <circle cx="0" cy="0" r="7" fill="url(#pinGrad)" stroke="#7f1d1d" strokeWidth="1" />
                  <circle cx="-2" cy="-2" r="2.5" fill="#ffffff" opacity="0.65" />
                </g>
              );
            })}

            {/* Clue Pushpins */}
            {clues.map((c) => {
              const coord = pinCoords.clues[c.id];
              if (!coord) return null;
              return (
                <g
                  key={`pin-clue-${c.id}`}
                  transform={`translate(${coord.x}, ${coord.y})`}
                  filter="url(#pinShadow)"
                >
                  <circle cx="0" cy="0" r="7" fill="url(#pinGrad)" stroke="#7f1d1d" strokeWidth="1" />
                  <circle cx="-2" cy="-2" r="2.5" fill="#ffffff" opacity="0.65" />
                </g>
              );
            })}
          </>
        )}
      </svg>

      {/* Crime Wall Title Plaque (z-10) */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center pb-4 mb-4 border-b border-amber-900/40 gap-3 relative z-10">
        <div className="flex items-center gap-3">
          <div className="pushpin"></div>
          <div>
            <h2 className="font-serif-noir text-lg sm:text-xl font-bold text-amber-200 tracking-wider uppercase">
              Investigation Evidence Connecting Board
            </h2>
            <p className="font-mono-dossier text-[11px] text-amber-400/80">
              Red thread connections run across the board forming a forensic constellation. Hover or click any card to elevate it over connections.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs font-mono-dossier text-slate-300">
          <span className="px-2.5 py-1 rounded bg-[#0b0e14] border border-amber-500/30 text-amber-300">
            {discoveredClues.length} / {clues.length} Evidence Links Active
          </span>
        </div>
      </div>

      {/* ALL CLUES OPENED: PROCEED TO KNOW THE SUSPECT BANNER */}
      {allCluesDiscovered && (
        <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-red-950/90 via-[#181118] to-red-950/90 border-2 border-red-500/70 shadow-2xl shadow-red-950/60 flex flex-col sm:flex-row items-center justify-between gap-4 relative z-20 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center gap-3.5">
            <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping shrink-0"></span>
            <div>
              <div className="font-serif-noir text-sm sm:text-base font-extrabold text-amber-200 uppercase tracking-wider flex items-center gap-2">
                <span>Crime Constellation Sealed</span>
                <span className="font-mono-dossier text-[10px] px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/40">
                  ALL CLUES OPEN
                </span>
              </div>
              <p className="font-mono-dossier text-xs text-slate-300 mt-0.5">
                All evidence threads have formed a complete geometric forensic web. Proceed to "Know the Suspect" to review Section 161 CrPC statements & interrogation files.
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundEngine.playStamp();
              if (onNavigateToSuspect) {
                onNavigateToSuspect();
              } else {
                const el = document.getElementById('know-the-suspect-section');
                if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            }}
            className="px-5 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif-noir font-bold text-xs uppercase tracking-wider shadow-lg shadow-amber-500/30 shrink-0 transition-all hover:scale-105 active:scale-95"
          >
            Know the Suspect →
          </button>
        </div>
      )}

      {/* 
        ========================================================================
        CARDS CONTAINER (Base z-10, with hovered/active cards popping to z-50)
        ========================================================================
      */}
      <div className="space-y-8 relative z-10">
        {/* 1. CENTRAL INCIDENT (THE CRIME ISSUE) */}
        <div
          ref={issueCardRef}
          className="w-full bg-[#131824] border border-amber-500/40 rounded-xl p-5 shadow-2xl relative text-center z-10"
        >
          <span className="font-mono-dossier text-[10px] text-amber-400 font-bold uppercase tracking-widest block mb-1">
            Central Incident Under Investigation
          </span>
          <h3 className="font-serif-noir text-base sm:text-lg font-extrabold text-slate-100">
            {currentCase.title}
          </h3>
          <p className="font-typewriter text-xs text-slate-300 mt-2 line-clamp-3 leading-relaxed">
            {currentCase.story}
          </p>
        </div>

        {/* 2. SURVEILLANCE PERSONS (SUSPECTS ROW WITH REALISTIC MUGSHOTS) */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="pushpin"></span>
              <span className="font-serif-noir text-xs font-bold text-slate-200 uppercase tracking-wider">
                Persons Under Surveillance ({suspects.length})
              </span>
            </div>
            <span className="text-[10px] font-mono-dossier text-slate-400">
              (Hover/click card to elevate over connections)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {suspects.map((suspect, idx) => {
              const isSelected = selectedSuspectId === suspect.id;
              const isHovered = hoveredSuspectId === suspect.id;
              const isElevated = isSelected || isHovered;

              const linkedClues = discoveredClues.filter((c) =>
                isClueLinkedToSuspect(c, suspect)
              );

              return (
                <div
                  key={suspect.id}
                  ref={(el) => (suspectCardRefs.current[suspect.id] = el)}
                  onMouseEnter={() => setHoveredSuspectId(suspect.id)}
                  onMouseLeave={() => setHoveredSuspectId(null)}
                  className={`relative transition-all duration-200 ${
                    isElevated ? 'z-50 scale-[1.04]' : 'z-10'
                  }`}
                >
                  <SuspectMugshot
                    suspect={suspect}
                    index={idx}
                    isSelected={isSelected}
                    onClick={() => handleSuspectClick(suspect.id)}
                  />

                  {/* 
                    ELEVATED HOVER / CLICK DOSSIER POP-UP OVER CONNECTIONS 
                  */}
                  {isElevated && (
                    <div className="absolute -top-14 inset-x-0 mx-auto w-11/12 bg-[#121622] border border-amber-500/70 rounded-lg p-2 shadow-2xl shadow-black z-50 text-center animate-in fade-in zoom-in-95 duration-150">
                      <div className="flex justify-between items-center text-[9px] font-mono-dossier text-amber-300 pb-0.5 border-b border-amber-900/40">
                        <span className="font-bold">SIT SUSPECT DOSSIER</span>
                        <span className="text-emerald-400">
                          {linkedClues.length} Evidence Link{linkedClues.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                      <p className="text-[10px] font-typewriter text-slate-200 truncate pt-0.5">
                        {isSelected ? '● Active Focus: Showing Linked Yarn' : 'Click to Lock Web Focus'}
                      </p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* 3. DYNAMIC EVIDENCE & FORENSIC ARTIFACTS ROW */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <span className="pushpin"></span>
              <span className="font-serif-noir text-xs font-bold text-slate-200 uppercase tracking-wider">
                Investigative Evidence & Forensic Artifacts ({discoveredClues.length}/{clues.length})
              </span>
            </div>
            <span className="text-[10px] font-mono-dossier text-amber-400/90">
              Hover/click card to elevate over connections & inspect
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {clues.map((clue, idx) => {
              const clueCategory =
                clue.type ||
                (clue.title?.toLowerCase().includes('whatsapp')
                  ? 'whatsapp'
                  : clue.title?.toLowerCase().includes('cctv')
                  ? 'cctv'
                  : clue.title?.toLowerCase().includes('call')
                  ? 'call_log'
                  : clue.title?.toLowerCase().includes('upi')
                  ? 'upi'
                  : clue.title?.toLowerCase().includes('photo')
                  ? 'photo'
                  : 'forensic');

              const isHovered = hoveredClueId === clue.id;
              const isElevated = isHovered;

              return (
                <div
                  key={clue.id}
                  ref={(el) => (clueCardRefs.current[clue.id] = el)}
                  onMouseEnter={() => setHoveredClueId(clue.id)}
                  onMouseLeave={() => setHoveredClueId(null)}
                  className={`transition-all duration-200 ${
                    isElevated ? 'z-50 scale-[1.04]' : 'z-10'
                  }`}
                >
                  <div
                    className={`rounded-lg p-3.5 border transition-all relative flex flex-col justify-between ${
                      clue.discovered
                        ? 'bg-[#10141e] border-amber-500/50 shadow-xl shadow-black/80 hover:border-amber-400 cursor-pointer'
                        : 'bg-[#0a0d14]/90 border-slate-800/80'
                    }`}
                    onClick={() => {
                      if (clue.discovered) {
                        soundEngine.playPaper();
                        onInspectClue(clue);
                      }
                    }}
                  >
                    <div>
                      {/* Visual Evidence Artifact Card Header */}
                      <div className="mb-2">
                        <EvidenceThumbnail
                          type={clueCategory}
                          title={clue.title}
                          isDiscovered={clue.discovered}
                        />
                      </div>

                      <div className="flex justify-between items-start gap-1 pt-1 mb-1">
                        <span className="font-mono-dossier text-[9px] px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 font-bold uppercase">
                          {clueCategory.replace('_', ' ')}
                        </span>
                        <span className="font-mono-dossier text-[9px] text-slate-400 truncate max-w-[100px]">
                          {clue.location}
                        </span>
                      </div>

                      <h4 className="font-serif-noir text-xs font-bold text-slate-200 mb-1 line-clamp-1">
                        {clue.title}
                      </h4>

                      {clue.discovered ? (
                        <p className="font-typewriter text-[11px] text-amber-100/90 line-clamp-2 leading-relaxed">
                          "{clue.text}"
                        </p>
                      ) : (
                        <p className="font-mono-dossier text-[10px] text-slate-500 italic mt-1">
                          [ Sealed Forensic Evidence Pouch ]
                        </p>
                      )}
                    </div>

                    <div className="pt-2 mt-2 border-t border-slate-800/80 flex justify-between items-center">
                      {clue.discovered ? (
                        <span className="text-[10px] font-mono-dossier text-emerald-400 flex items-center gap-1">
                          <span>● Pinned & Linked</span>
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onDiscoverClue(clue.id);
                          }}
                          disabled={discoveringId === clue.id}
                          className="w-full py-1.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif-noir font-bold text-[10px] uppercase tracking-wider transition-colors disabled:opacity-50"
                        >
                          {discoveringId === clue.id ? 'Unsealing...' : 'Unseal (+5 pts)'}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* ELEVATED HOVER POP-UP OVER CONNECTIONS FOR CLUES */}
                  {isElevated && clue.discovered && (
                    <div className="absolute -top-12 inset-x-0 mx-auto w-11/12 bg-[#10141e] border border-amber-400 rounded-lg p-2 shadow-2xl z-50 text-center animate-in fade-in zoom-in-95 duration-150">
                      <span className="text-[10px] font-mono-dossier text-amber-300 font-bold block">
                        EXHIBIT READY • CLICK TO INSPECT
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Decorative Red Yarn Connections Footer Indicator */}
      <div className="mt-6 pt-3 border-t border-amber-900/30 flex flex-col sm:flex-row justify-between items-center text-[10px] font-mono-dossier text-slate-400 relative z-10 gap-2">
        <span className="flex items-center gap-2">
          <span className="w-3 h-0.5 bg-rose-500 inline-block shadow-sm shadow-rose-500/50"></span>
          <span>Red Thread Yarn: Mounted above cards connecting pins. Hover/click cards to bring over strings.</span>
        </span>
        <span className="text-amber-400/80">Interactive Crime Wall Active</span>
      </div>
    </div>
  );
};

export default ConnectingBoard;
