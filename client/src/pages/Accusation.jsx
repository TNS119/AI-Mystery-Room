import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCase } from '../context/CaseContext';
import { apiService } from '../api/client';
import { soundEngine } from '../utils/sound';
import SuspectMugshot from '../components/SuspectMugshot';

const Accusation = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentCase, fetchCase } = useCase();

  const [selectedSuspectId, setSelectedSuspectId] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentCase || currentCase.id !== id) {
      fetchCase(id).catch((err) => {
        if (err.code === 'CASE_COMPLETED') {
          navigate(`/case/${id}/result`);
        }
      });
    }
  }, [id, currentCase, fetchCase, navigate]);

  if (!currentCase) return null;

  const selectedSuspect = currentCase.suspects?.find((s) => s.id === selectedSuspectId);
  const discoveredClues = currentCase.clues?.filter((c) => c.discovered) || [];

  const handleSelectSuspect = (suspectId) => {
    soundEngine.playStamp();
    setSelectedSuspectId(suspectId);
  };

  const handleConfirmSubmit = async () => {
    setShowConfirm(false);
    setSubmitting(true);
    setError(null);
    soundEngine.playDramaticChord();

    try {
      await apiService.submitAccusation(currentCase.id, selectedSuspectId);
      navigate(`/case/${currentCase.id}/result`);
    } catch (err) {
      if (err.code === 'CASE_COMPLETED') {
        navigate(`/case/${currentCase.id}/result`);
      } else {
        setError(err.message || 'Failed to submit accusation.');
        setSubmitting(false);
      }
    }
  };

  return (
    <div className="py-8 px-2 sm:px-4 md:px-6 w-full space-y-8 room-ambient-bg min-h-[calc(100vh-4rem)]">
      {/* Header Styled as Police Interrogation Lineup */}
      <div className="text-center w-full">
        <div className="inline-block px-3 py-1 rounded bg-rose-500/10 border border-rose-500/30 text-rose-300 font-mono-dossier text-xs uppercase tracking-widest mb-3">
          Special Investigation Bureau • Formal Chargesheet
        </div>
        <h1 className="font-serif-noir text-3xl sm:text-4xl font-extrabold text-slate-100 drop-shadow">
          The Suspect Interrogation Lineup
        </h1>
        <p className="mt-2 text-xs sm:text-sm font-typewriter text-amber-200/80 max-w-2xl mx-auto">
          Corroborate mobile towers, digital records, and CCTV timeline trails. Affix the formal arrest warrant to the sole perpetrator.
        </p>
      </div>

      {error && (
        <div className="p-4 rounded bg-rose-950/80 border border-rose-500/60 text-rose-200 text-xs font-mono-dossier text-center">
          {error}
        </div>
      )}

      {/* Main Grid: Suspects Lineup + Evidence Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Suspect Lineup Cards (8 cols) */}
        <div className="lg:col-span-8 space-y-4">
          <div className="flex justify-between items-center pb-2 border-b border-amber-900/30">
            <h2 className="font-serif-noir text-base font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
              Select Prime Accused for Chargesheet
            </h2>
            <span className="font-mono-dossier text-xs text-slate-400">
              Click to select suspect
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {currentCase.suspects?.map((suspect, idx) => {
              const isSelected = selectedSuspectId === suspect.id;
              return (
                <SuspectMugshot
                  key={suspect.id}
                  suspect={suspect}
                  index={idx}
                  isSelected={isSelected}
                  onClick={() => handleSelectSuspect(suspect.id)}
                  className={idx % 2 === 0 ? '-rotate-1' : 'rotate-1'}
                />
              );
            })}
          </div>
        </div>

        {/* Evidence Docket Summary (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-[#121620] border border-amber-500/30 rounded-xl p-5 shadow-xl space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-amber-900/30">
              <h3 className="font-serif-noir text-xs font-bold text-amber-300 uppercase tracking-wider">
                Gathered Proof ({discoveredClues.length})
              </h3>
              <span className="font-mono-dossier text-[10px] text-slate-400">
                FIR #{currentCase.id}
              </span>
            </div>

            {discoveredClues.length === 0 ? (
              <p className="font-typewriter text-xs text-rose-400/90 italic p-3 rounded bg-rose-950/20 border border-rose-900/30">
                No physical, CCTV, or WhatsApp clues were unsealed. You are attempting a blind chargesheet.
              </p>
            ) : (
              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {discoveredClues.map((clue, idx) => (
                  <div
                    key={clue.id}
                    className="p-2.5 rounded bg-[#090c13] border border-slate-800 text-xs"
                  >
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="font-serif-noir text-slate-200 font-bold block truncate">
                        {idx + 1}. {clue.title}
                      </span>
                      <span className="text-[9px] font-mono-dossier px-1 rounded bg-slate-800 text-amber-300 uppercase">
                        {(clue.type || 'forensic').replace('_', ' ')}
                      </span>
                    </div>
                    <span className="font-typewriter text-[11px] text-amber-200/80 block line-clamp-2">
                      {clue.text}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Suspect Action Box */}
            <div className="pt-3 border-t border-slate-800 space-y-3">
              <div className="font-mono-dossier text-xs text-slate-300">
                <span>Accused Named: </span>
                <span className="font-bold text-amber-400">
                  {selectedSuspect ? selectedSuspect.name : 'None Selected'}
                </span>
              </div>

              <button
                onClick={() => {
                  soundEngine.playPaper();
                  setShowConfirm(true);
                }}
                disabled={!selectedSuspectId || submitting}
                className="w-full py-3 rounded bg-rose-600 hover:bg-rose-500 text-slate-100 font-serif-noir font-bold text-xs uppercase tracking-widest transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-xl shadow-rose-950/60 border border-rose-500/40"
              >
                {submitting ? 'Filing Chargesheet...' : 'Affix Warrant & Indict'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {showConfirm && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#121620] border border-rose-500/50 rounded-xl p-6 sm:p-8 max-w-md w-full text-center space-y-4 shadow-2xl">
            <span className="stamp-badge stamp-danger text-xs">OFFICIAL CHARGESHEET FILING</span>
            <h3 className="font-serif-noir text-xl font-bold text-slate-100">
              Submit Formal Indictment
            </h3>
            <p className="font-typewriter text-xs text-slate-300 leading-relaxed">
              Are you certain you wish to name{' '}
              <span className="font-bold text-amber-400 underline">{selectedSuspect?.name}</span> as the true perpetrator in the official court filing?
              <br />
              The sealed solution will be unsealed and final scoring calculated.
            </p>
            <div className="flex gap-3 justify-center pt-2">
              <button
                onClick={() => {
                  soundEngine.playClick();
                  setShowConfirm(false);
                }}
                className="px-4 py-2 rounded bg-slate-800 text-slate-300 text-xs font-mono-dossier hover:bg-slate-700 transition-colors"
              >
                Re-evaluate Evidence
              </button>
              <button
                onClick={handleConfirmSubmit}
                className="px-5 py-2.5 rounded bg-rose-600 text-slate-100 text-xs font-serif-noir font-bold uppercase tracking-wider hover:bg-rose-500 transition-colors shadow-lg shadow-rose-950/60 border border-rose-500/40"
              >
                Confirm Warrant & Submit
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Accusation;
