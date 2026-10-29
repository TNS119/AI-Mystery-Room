import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { soundEngine } from '../utils/sound';
import DetectiveNotebook from '../components/DetectiveNotebook';
import ConnectingBoard from '../components/ConnectingBoard';
import EvidenceModal from '../components/EvidenceModal';
import SuspectMugshot from '../components/SuspectMugshot';
import EvidenceThumbnail from '../components/EvidenceThumbnail';

const InvestigationRoom = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCase, loading, error, fetchCase, discoverClue, requestHint } = useCase();

  const [discoveringId, setDiscoveringId] = useState(null);
  const [requestingHint, setRequestingHint] = useState(false);
  const [showHintConfirm, setShowHintConfirm] = useState(false);
  const [showAccuseWarn, setShowAccuseWarn] = useState(false);
  const [actionError, setActionError] = useState(null);

  // Active inspected clue in evidence modal
  const [inspectedClue, setInspectedClue] = useState(null);
  const [isNotebookOpen, setIsNotebookOpen] = useState(false);

  // Active suspect in the "Know the Suspect" interrogation dossier
  const [activeDossierSuspectId, setActiveDossierSuspectId] = useState(null);
  const autoScrolledRef = useRef(false);

  useEffect(() => {
    if (!currentCase || currentCase.id !== id) {
      fetchCase(id).catch((err) => {
        if (err.code === 'CASE_COMPLETED') {
          navigate(`/case/${id}/result`);
        }
      });
    }
  }, [id, currentCase, fetchCase, navigate]);

  useEffect(() => {
    if (currentCase?.suspects?.length > 0 && !activeDossierSuspectId) {
      setActiveDossierSuspectId(currentCase.suspects[0].id);
    }
  }, [currentCase, activeDossierSuspectId]);

  const totalCluesCount = currentCase?.clues?.length || 0;
  const discoveredCluesCount = currentCase?.clues?.filter((c) => c.discovered).length || 0;
  const allCluesDiscovered = totalCluesCount > 0 && discoveredCluesCount === totalCluesCount;

  // Auto-scroll to "Know the Suspect" when all clues are opened
  useEffect(() => {
    if (allCluesDiscovered && !autoScrolledRef.current) {
      autoScrolledRef.current = true;
      setTimeout(() => {
        const el = document.getElementById('know-the-suspect-section');
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 700);
    }
  }, [allCluesDiscovered]);

  // Handle clue discovery with audio
  const handleDiscover = async (clueId) => {
    soundEngine.playPaper();
    setDiscoveringId(clueId);
    setActionError(null);
    try {
      await discoverClue(clueId);
      soundEngine.playClueDiscovered();
    } catch (err) {
      setActionError(err.message || 'Failed to discover clue.');
    } finally {
      setDiscoveringId(null);
    }
  };

  // Handle hint request with audio
  const handleHintRequest = async () => {
    setShowHintConfirm(false);
    setRequestingHint(true);
    setActionError(null);
    try {
      await requestHint();
      soundEngine.playPaper();
      soundEngine.playStamp();
    } catch (err) {
      setActionError(err.message || 'Failed to request hint.');
    } finally {
      setRequestingHint(false);
    }
  };

  // Handle proceed to accusation
  const handleProceedToAccuse = () => {
    soundEngine.playClick();
    const discoveredCount = currentCase?.clues?.filter((c) => c.discovered).length || 0;
    if (discoveredCount === 0) {
      setShowAccuseWarn(true);
    } else {
      soundEngine.playDramaticChord();
      navigate(`/case/${id}/accuse`);
    }
  };

  const handleNavigateToKnowSuspect = () => {
    const el = document.getElementById('know-the-suspect-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  if (loading && !currentCase) {
    return (
      <div className="py-12 px-4 w-full space-y-8 animate-pulse room-ambient-bg min-h-[calc(100vh-4rem)]">
        <div className="h-10 bg-[#161c28] rounded w-1/3"></div>
        <div className="h-44 bg-[#121620] rounded-xl border border-amber-900/30"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-64 bg-[#121620] rounded-xl"></div>
          <div className="h-64 bg-[#121620] rounded-xl"></div>
          <div className="h-64 bg-[#121620] rounded-xl"></div>
        </div>
      </div>
    );
  }

  if (error && !currentCase) {
    return (
      <div className="py-20 px-4 w-full flex items-center justify-center room-ambient-bg min-h-[calc(100vh-4rem)]">
        <div className="bg-[#121620] border border-amber-900/40 rounded-xl p-8 shadow-2xl max-w-md w-full text-center">
          <span className="stamp-badge stamp-danger text-xs mb-3">EVIDENCE VAULT CLOSED</span>
          <h2 className="font-serif-noir text-xl text-slate-100 mb-2">Case File Inaccessible</h2>
          <p className="text-xs font-mono-dossier text-slate-400 mb-6">{error.message || 'Case could not be found.'}</p>
          <button
            onClick={() => {
              soundEngine.playClick();
              navigate('/create');
            }}
            className="px-6 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif-noir font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Commission New Case
          </button>
        </div>
      </div>
    );
  }

  if (!currentCase) return null;

  const hintsUsed = currentCase.hints?.used || 0;
  const hintsTotal = currentCase.hints?.total || 0;
  const hintsRemaining = hintsTotal - hintsUsed;

  return (
    <div className="relative min-h-[calc(100vh-4rem)] room-ambient-bg py-6 px-2 sm:px-4 md:px-6 w-full space-y-6">
      {/* Action Error Notification */}
      {actionError && (
        <div className="p-4 rounded bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono-dossier flex justify-between items-center shadow-xl">
          <span>[WARNING] {actionError}</span>
          <button
            onClick={() => setActionError(null)}
            className="text-xs text-rose-300 underline font-mono-dossier"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Case Header Command Bar */}
      <div className="bg-[#0e121a]/95 border border-amber-900/50 rounded-xl p-5 sm:p-6 backdrop-blur-md shadow-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 relative z-10">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="font-mono-dossier text-[10px] uppercase tracking-wider px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-bold">
              CASE DOCKET: {currentCase.id}
            </span>
            <span className="font-mono-dossier text-[10px] text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded bg-amber-950/30">
              {currentCase.difficulty} tier
            </span>
            <span className="font-mono-dossier text-[10px] text-emerald-400 border border-emerald-500/30 px-2 py-0.5 rounded bg-emerald-950/30">
              Active Investigation • Crime Branch Task Force
            </span>
          </div>
          <h1 className="font-serif-noir text-2xl sm:text-3xl font-extrabold text-slate-100 drop-shadow">
            {currentCase.title}
          </h1>
        </div>

        {/* HUD Score & Accuse Action */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
          <button
            onClick={() => {
              soundEngine.playPaper();
              setIsNotebookOpen(true);
            }}
            className="px-3.5 py-2 text-xs font-mono-dossier rounded border border-amber-500/40 bg-[#161c26] text-amber-300 hover:bg-[#1f2736] transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <span>Detective Journal</span>
          </button>

          <div className="text-right pl-2 border-l border-slate-800">
            <span className="text-[10px] font-mono-dossier text-slate-400 block uppercase">
              Current Rating
            </span>
            <span className="font-serif-noir text-xl font-bold text-amber-400">
              {currentCase.scorePreview ?? 0} pts
            </span>
          </div>

          <button
            onClick={handleProceedToAccuse}
            className="px-5 py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-slate-100 font-serif-noir font-bold text-xs uppercase tracking-wider transition-all shadow-lg shadow-rose-950/50 active:scale-95 border border-rose-500/40"
          >
            File Formal Accusation →
          </button>
        </div>
      </div>

      {/* 1. INTERACTIVE SIT EVIDENCE CONNECTING BOARD */}
      <section className="space-y-3">
        <ConnectingBoard
          currentCase={currentCase}
          onInspectClue={(clue) => setInspectedClue(clue)}
          onDiscoverClue={handleDiscover}
          discoveringId={discoveringId}
          onNavigateToSuspect={handleNavigateToKnowSuspect}
        />
      </section>

      {/* 2. BALANCED INVESTIGATION ROOM LOWER STAGE (ZERO EMPTY VOIDS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 relative z-10">
        {/* LEFT COLUMN (6 cols): FIR Dossier, Crime Chronology & Know the Suspect Dossier */}
        <div className="lg:col-span-6 space-y-6">
          {/* Crime Scene Briefing File */}
          <section className="bg-[#121620] border border-amber-500/30 rounded-xl p-5 sm:p-6 shadow-xl relative overflow-hidden">
            <div className="flex justify-between items-start mb-3 pb-3 border-b border-amber-900/30">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
                <h2 className="font-serif-noir text-sm sm:text-base font-bold text-amber-300 uppercase tracking-wider">
                  Crime Scene Briefing & First Information Report (FIR)
                </h2>
              </div>
              <span className="stamp-badge stamp-warning text-[9px]">CCB OFFICIAL BRIEF</span>
            </div>

            <div className="font-typewriter text-xs sm:text-sm text-slate-200 leading-relaxed whitespace-pre-line space-y-2">
              {currentCase.story}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex justify-between items-center text-[10px] font-mono-dossier text-slate-400">
              <span>FIR Registered under IPC Section 302 / BNS Forensic Protocol</span>
              <span className="text-amber-400/80">Cross-reference with digital CDR & CCTV</span>
            </div>
          </section>

          {/* Forensic Incident Timeline & Chronology */}
          <section className="bg-[#121620] border border-amber-500/30 rounded-xl p-5 shadow-xl relative">
            <div className="flex justify-between items-center mb-3 pb-2 border-b border-amber-900/30">
              <div className="flex items-center gap-2">
                <span className="pushpin"></span>
                <h2 className="font-serif-noir text-sm font-bold text-slate-100 uppercase tracking-wider">
                  Crime Scene Incident Chronology
                </h2>
              </div>
              <span className="text-[10px] font-mono-dossier text-amber-400">
                TIMECODE RECONSTRUCTION
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-1">
              <div className="bg-[#0b0e14] border border-slate-800 rounded p-2.5 text-center">
                <span className="font-mono text-amber-400 text-xs font-bold block">20:45 IST</span>
                <span className="text-[9px] font-serif-noir text-slate-300 block mt-0.5">Guest Gathering</span>
                <span className="text-[8px] text-slate-400 block">Initial Entry</span>
              </div>
              <div className="bg-[#0b0e14] border border-amber-900/40 rounded p-2.5 text-center">
                <span className="font-mono text-rose-400 text-xs font-bold block">21:15 IST</span>
                <span className="text-[9px] font-serif-noir text-slate-300 block mt-0.5">Blackout / Event</span>
                <span className="text-[8px] text-slate-400 block">Critical Window</span>
              </div>
              <div className="bg-[#0b0e14] border border-slate-800 rounded p-2.5 text-center">
                <span className="font-mono text-cyan-400 text-xs font-bold block">21:35 IST</span>
                <span className="text-[9px] font-serif-noir text-slate-300 block mt-0.5">Scream Reported</span>
                <span className="text-[8px] text-slate-400 block">Body Discovered</span>
              </div>
              <div className="bg-[#0b0e14] border border-slate-800 rounded p-2.5 text-center">
                <span className="font-mono text-emerald-400 text-xs font-bold block">21:55 IST</span>
                <span className="text-[9px] font-serif-noir text-slate-300 block mt-0.5">SIT Unit Deployed</span>
                <span className="text-[8px] text-slate-400 block">Perimeter Sealed</span>
              </div>
            </div>
          </section>

          {/* DEDICATED "KNOW THE SUSPECT: INTERROGATION & ALIBI DOSSIER" */}
          <section
            id="know-the-suspect-section"
            className={`bg-[#121620] rounded-xl p-5 sm:p-6 shadow-xl relative transition-all duration-300 ${
              allCluesDiscovered
                ? 'border-2 border-amber-400 shadow-2xl shadow-amber-500/20'
                : 'border border-amber-500/30'
            }`}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-amber-900/30 gap-2">
              <div className="flex items-center gap-2">
                <span className="pushpin"></span>
                <div>
                  <h2 className="font-serif-noir text-base font-bold text-slate-100 tracking-wide uppercase">
                    Know the Suspect: Interrogation & Alibi Dossier
                  </h2>
                  <p className="text-[10px] font-mono-dossier text-slate-400">
                    Statements recorded under section 161 Code of Criminal Procedure (CrPC)
                  </p>
                </div>
              </div>
              {allCluesDiscovered && (
                <span className="font-mono-dossier text-[10px] px-2.5 py-1 rounded bg-amber-500 text-slate-950 font-bold uppercase animate-pulse">
                  READY FOR ACCUSATION
                </span>
              )}
            </div>

            {/* Suspect Selector Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-3 mb-4 border-b border-slate-800/80">
              {currentCase.suspects?.map((suspect, idx) => {
                const isActive = (activeDossierSuspectId || currentCase.suspects[0].id) === suspect.id;
                return (
                  <button
                    key={suspect.id}
                    onClick={() => {
                      soundEngine.playPaper();
                      setActiveDossierSuspectId(suspect.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-serif-noir font-bold transition-all shrink-0 flex items-center gap-2 border ${
                      isActive
                        ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20'
                        : 'bg-[#0a0e16] text-slate-300 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <span>#{idx + 1} {suspect.name}</span>
                    <span className={`text-[9px] px-1 rounded uppercase ${
                      isActive ? 'bg-slate-950 text-amber-300' : 'bg-slate-800 text-slate-400'
                    }`}>
                      {suspect.role}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Active Selected Suspect Interrogation Dossier */}
            {(() => {
              const activeSuspect =
                currentCase.suspects?.find(
                  (s) => s.id === (activeDossierSuspectId || currentCase.suspects[0]?.id)
                ) || currentCase.suspects?.[0];

              if (!activeSuspect) return null;

              // Check how many discovered clues corroborate or implicate this suspect
              const linkedClues = (currentCase.clues || []).filter((c) => {
                if (!c.discovered || !c.text) return false;
                const txt = c.text.toLowerCase();
                const name = (activeSuspect.name || '').toLowerCase();
                const role = (activeSuspect.role || '').toLowerCase();
                const fName = name.split(' ')[0];
                return (fName.length >= 3 && txt.includes(fName)) || txt.includes(name) || (role.length >= 4 && txt.includes(role));
              });

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start">
                    {/* Suspect Mugshot Preview */}
                    <div className="sm:col-span-5">
                      <SuspectMugshot
                        suspect={activeSuspect}
                        index={currentCase.suspects.findIndex((s) => s.id === activeSuspect.id)}
                        isSelected={true}
                        showFullDetails={false}
                      />
                    </div>

                    {/* Suspect Statement & Forensic Dossier */}
                    <div className="sm:col-span-7 space-y-3">
                      <div className="bg-[#0b0e14] border border-amber-900/30 rounded-lg p-3">
                        <span className="font-mono-dossier text-[9px] text-amber-400 block font-bold uppercase mb-1">
                          Official Statement Recorded (Sec 161 CrPC)
                        </span>
                        <p className="font-typewriter text-xs text-amber-100 leading-relaxed italic">
                          "{activeSuspect.alibi || 'No formal statement submitted.'}"
                        </p>
                      </div>

                      <div className="bg-[#0b0e14] border border-slate-800 rounded-lg p-3 space-y-1.5 text-xs font-mono-dossier">
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Dossier Role:</span>
                          <span className="text-slate-200 font-bold">{activeSuspect.role}</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Corroborating Evidence:</span>
                          <span className="text-emerald-400 font-bold">
                            {linkedClues.length} Unsealed Lead{linkedClues.length !== 1 ? 's' : ''}
                          </span>
                        </div>
                        <div className="text-[10px] text-slate-400 pt-1 border-t border-slate-800">
                          {activeSuspect.description}
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          soundEngine.playDramaticChord();
                          navigate(`/case/${id}/accuse`);
                        }}
                        className="w-full py-2.5 rounded bg-rose-600 hover:bg-rose-500 text-slate-100 font-serif-noir font-bold text-xs uppercase tracking-wider transition-all shadow-md shadow-rose-950/60"
                      >
                        Indict This Suspect in Lineup →
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}
          </section>
        </div>

        {/* RIGHT COLUMN (6 cols): Evidence Vault (2-Col Grid) & Hints Vault */}
        <div className="lg:col-span-6 space-y-6">
          {/* Physical & Digital Clues Ledger (2-Column Responsive Grid) */}
          <section className="bg-[#121620] border border-amber-500/30 rounded-xl p-5 sm:p-6 shadow-xl relative">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-amber-900/30">
              <div className="flex items-center gap-2">
                <span className="pushpin"></span>
                <h2 className="font-serif-noir text-base font-bold text-slate-100 uppercase tracking-wider">
                  Evidence Vault ({discoveredCluesCount}/{totalCluesCount})
                </h2>
              </div>
              <span className="font-mono-dossier text-[11px] px-2.5 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300">
                +5 Pts Each
              </span>
            </div>

            {/* 2-Column Grid for Clues (Eliminates the vertical elongation!) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {currentCase.clues?.map((clue) => {
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

                return (
                  <div
                    key={clue.id}
                    className={`border rounded-lg p-3 transition-all relative overflow-hidden flex flex-col justify-between ${
                      clue.discovered
                        ? 'border-amber-500/40 bg-[#0d1017] shadow-md shadow-amber-500/5 cursor-pointer hover:border-amber-400'
                        : 'border-slate-800/80 bg-[#080b11]'
                    }`}
                    onClick={() => {
                      if (clue.discovered) {
                        soundEngine.playPaper();
                        setInspectedClue(clue);
                      }
                    }}
                  >
                    <div>
                      <div className="flex justify-between items-start gap-1 mb-2">
                        <span className="font-mono-dossier text-[8px] text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 font-bold uppercase truncate">
                          {clueCategory.replace('_', ' ')}
                        </span>
                        <span className="font-mono-dossier text-[8px] text-slate-400 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 shrink-0 truncate max-w-[120px]">
                          {clue.location}
                        </span>
                      </div>

                      <h3 className="font-serif-noir text-xs font-bold text-slate-200 mb-2 line-clamp-1">
                        {clue.title}
                      </h3>

                      {/* Realistic Evidence Visual Artifact */}
                      <div className="mb-2">
                        <EvidenceThumbnail
                          type={clueCategory}
                          title={clue.title}
                          isDiscovered={clue.discovered}
                        />
                      </div>
                    </div>

                    {clue.discovered ? (
                      <div className="mt-2 text-[11px] font-typewriter text-amber-100 bg-[#161a24] border border-amber-500/20 rounded p-2 leading-relaxed">
                        <div className="flex justify-between items-center mb-0.5">
                          <span className="font-mono-dossier text-[8px] text-amber-400 font-bold">
                            [ UNSEALED ]
                          </span>
                          <span className="text-[8px] font-mono-dossier text-emerald-400 underline">
                            Click to Inspect
                          </span>
                        </div>
                        <p className="line-clamp-2 text-[10px]">{clue.text}</p>
                      </div>
                    ) : (
                      <div className="mt-2 flex items-center justify-between pt-2 border-t border-slate-800/60">
                        <span className="font-mono-dossier text-[9px] text-slate-500">
                          Sealed
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDiscover(clue.id);
                          }}
                          disabled={discoveringId === clue.id}
                          className="px-2.5 py-1 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif-noir font-bold text-[10px] uppercase tracking-wider transition-all disabled:opacity-50 shadow-sm"
                        >
                          {discoveringId === clue.id ? 'Unsealing...' : 'Unseal (+5 pts)'}
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

          {/* Progressive Hint Vault */}
          <section className="bg-[#121620] border border-amber-500/30 rounded-xl p-5 sm:p-6 space-y-4 shadow-xl">
            <div className="flex justify-between items-center pb-3 border-b border-amber-900/30">
              <div>
                <h2 className="font-serif-noir text-base font-bold text-slate-100 uppercase tracking-wider">
                  SIT Classified Hints Vault
                </h2>
                <p className="text-[11px] font-mono-dossier text-slate-400">
                  Breaching confidential leads incurs a -10 point penalty.
                </p>
              </div>
              <span className="font-mono-dossier text-xs px-2.5 py-1 rounded bg-slate-800 text-amber-300 border border-slate-700">
                {currentCase.hintsRemaining ?? 0} Available
              </span>
            </div>

            {/* Revealed Hints List */}
            {currentCase.hints?.revealed?.length > 0 && (
              <div className="space-y-2.5">
                {currentCase.hints.revealed.map((hint, idx) => (
                  <div
                    key={hint.id || idx}
                    className="p-3 rounded-lg bg-[#0e1219] border border-amber-500/30 text-xs font-typewriter text-amber-100 leading-relaxed shadow-inner"
                  >
                    <span className="font-mono-dossier text-[11px] font-bold text-amber-400 block mb-1">
                      [ Bureau Lead Level #{hint.level} ]
                    </span>
                    {hint.text}
                  </div>
                ))}
              </div>
            )}

            {/* Request Next Hint Button */}
            <button
              onClick={() => {
                soundEngine.playPaper();
                setShowHintConfirm(true);
              }}
              disabled={(currentCase.hintsRemaining ?? 0) <= 0 || requestingHint}
              className="w-full py-2.5 rounded border border-amber-500/30 bg-[#0a0d14] hover:bg-[#161c28] text-amber-300 font-mono-dossier text-xs tracking-wider transition-colors disabled:opacity-40 disabled:cursor-not-allowed shadow-md"
            >
              {(currentCase.hintsRemaining ?? 0) <= 0
                ? 'All Confidential Leads Breached'
                : 'Request Classified SIT Lead (-10 pts)'}
            </button>
          </section>

          {/* Solvability Ledger & Quick Accusation Docket */}
          <div className="bg-[#0e121a] border border-amber-500/20 rounded-xl p-4 flex justify-between items-center shadow-lg">
            <div>
              <span className="font-mono-dossier text-[10px] text-slate-400 uppercase block">
                Evidence Collection Status
              </span>
              <span className="font-serif-noir text-sm font-bold text-slate-200">
                {discoveredCluesCount} of {totalCluesCount} Leads Decrypted
              </span>
            </div>
            <button
              onClick={handleProceedToAccuse}
              className="px-4 py-2 rounded bg-rose-600 hover:bg-rose-500 text-slate-100 font-serif-noir font-bold text-xs uppercase tracking-wider shadow-md shadow-rose-950/60 transition-transform active:scale-95"
            >
              Enter Accusation Room →
            </button>
          </div>
        </div>
      </div>

      {/* Bottom Action Bar */}
      <div className="flex justify-end items-center gap-4 pt-6 border-t border-slate-800">
        <button
          onClick={handleProceedToAccuse}
          className="w-full sm:w-auto px-8 py-3.5 rounded bg-rose-600 hover:bg-rose-500 text-slate-100 font-serif-noir font-bold text-xs uppercase tracking-wider transition-all shadow-xl shadow-rose-950/60 active:scale-95 border border-rose-500/40 flex items-center justify-center gap-2"
        >
          <span>Proceed to Accusation Lineup →</span>
        </button>
      </div>

      {/* Confirmation Modal for Hint */}
      {showHintConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-amber-500/50 rounded-xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <span className="stamp-badge stamp-warning text-xs">BREACH SEAL PROTOCOL</span>
            <h3 className="font-serif-noir text-lg font-bold text-slate-100">
              Confirm Lead Deduction
            </h3>
            <p className="text-xs font-typewriter text-slate-300 leading-relaxed">
              Opening this lead will permanently deduct 10 points from your total detective rating. Proceed?
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowHintConfirm(false);
                }}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-mono-dossier hover:bg-slate-700 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleHintRequest}
                className="px-4 py-2 rounded bg-amber-500 text-slate-950 text-xs font-serif-noir font-bold uppercase tracking-wider hover:bg-amber-400 transition-colors shadow-md shadow-amber-500/20"
              >
                Reveal Lead
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Warning Modal for 0 Clues Accusation */}
      {showAccuseWarn && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-rose-500/50 rounded-xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <span className="stamp-badge stamp-danger text-xs">ZERO EVIDENCE GATHERED</span>
            <h3 className="font-serif-noir text-lg font-bold text-slate-100">
              Blind Accusation Warning
            </h3>
            <p className="text-xs font-typewriter text-slate-300 leading-relaxed">
              You haven't inspected any evidence cards yet. Accusing blindly risks a complete zero score on an incorrect verdict. Are you sure you wish to proceed?
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowAccuseWarn(false);
                }}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-mono-dossier hover:bg-slate-700 transition-colors"
              >
                Resume Investigation
              </button>
              <button
                onClick={() => {
                  setShowAccuseWarn(false);
                  soundEngine.playDramaticChord();
                  navigate(`/case/${id}/accuse`);
                }}
                className="px-4 py-2 rounded bg-rose-600 text-slate-100 text-xs font-serif-noir font-bold uppercase tracking-wider hover:bg-rose-500 transition-colors shadow-md shadow-rose-900/30"
              >
                Proceed to Accuse
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Interactive Evidence Inspection Modal (WhatsApp, CCTV, CDR, UPI, etc.) */}
      <EvidenceModal
        clue={inspectedClue}
        onClose={() => setInspectedClue(null)}
      />

      {/* Slide-out Interactive Detective Field Journal */}
      <DetectiveNotebook
        caseId={id}
        suspects={currentCase.suspects || []}
        isOpen={isNotebookOpen}
        onClose={() => setIsNotebookOpen(false)}
      />
    </div>
  );
};

export default InvestigationRoom;
