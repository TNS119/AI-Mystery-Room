import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { apiService } from '../api/client';
import { useCase } from '../context/CaseContext';
import { soundEngine } from '../utils/sound';

const getDetectiveRank = (score, maxPossible) => {
  const ratio = maxPossible > 0 ? score / maxPossible : 0;
  if (ratio >= 0.9) return { title: 'CBI Joint Director / Master Sleuth', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' };
  if (ratio >= 0.75) return { title: 'Chief Superintendent of Police (SIT)', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' };
  if (ratio >= 0.5) return { title: 'Senior Crime Branch Inspector', color: 'text-sky-400 border-sky-500/40 bg-sky-500/10' };
  if (ratio > 0) return { title: 'Assistant Sub-Inspector (Probationary)', color: 'text-amber-300 border-amber-500/30 bg-amber-500/5' };
  return { title: 'Suspended Investigating Officer', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' };
};

const Results = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { clearCase } = useCase();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    apiService
      .getResult(id)
      .then((res) => {
        setResult(res.data);
        if (res.data.verdict === 'correct') {
          soundEngine.playClueDiscovered();
        } else {
          soundEngine.playDramaticChord();
        }
      })
      .catch((err) => {
        if (err.code === 'CASE_NOT_COMPLETED') {
          navigate(`/case/${id}`);
        } else {
          setError(err.message || 'Failed to load case results.');
        }
      })
      .finally(() => {
        setLoading(false);
      });
  }, [id, navigate]);

  const handleStartAnother = () => {
    soundEngine.playPaper();
    soundEngine.playClick();
    clearCase();
    navigate('/create');
  };

  if (loading) {
    return (
      <div className="py-20 px-4 w-full text-center space-y-4 room-ambient-bg min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center">
        <div className="w-14 h-14 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mx-auto"></div>
        <p className="font-typewriter text-amber-300 text-sm animate-pulse">
          Opening sealed judicial closure report...
        </p>
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="py-20 px-4 w-full flex items-center justify-center room-ambient-bg min-h-[calc(100vh-4rem)]">
        <div className="bg-[#121620] border border-amber-900/40 rounded-xl p-8 shadow-2xl max-w-md w-full text-center">
          <span className="stamp-badge stamp-danger text-xs mb-3">JUDICIAL REPORT ERROR</span>
          <h2 className="font-serif-noir text-xl text-slate-100 mb-2">Verdict Unavailable</h2>
          <p className="text-xs font-mono-dossier text-slate-400 mb-6">{error || 'Unable to retrieve verdict.'}</p>
          <button
            onClick={() => {
              soundEngine.playClick();
              navigate('/');
            }}
            className="px-6 py-2.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif-noir font-bold text-xs uppercase tracking-wider transition-colors"
          >
            Return to Bureau Headquarters
          </button>
        </div>
      </div>
    );
  }

  const isCorrect = result.verdict === 'correct';
  const rank = getDetectiveRank(result.score?.total || 0, result.score?.maxPossible || 125);

  return (
    <div className="py-8 px-2 sm:px-4 md:px-6 w-full space-y-8 room-ambient-bg min-h-[calc(100vh-4rem)]">
      {/* Formal Verdict Stamp Banner */}
      <div
        className={`rounded-xl p-8 border text-center space-y-4 shadow-2xl relative overflow-hidden ${
          isCorrect
            ? 'bg-[#0f1d17] border-emerald-500/50 shadow-emerald-950/40'
            : 'bg-[#1e1115] border-rose-500/50 shadow-rose-950/40'
        }`}
      >
        <div className="relative z-10">
          <div className="mb-3">
            <span
              className={`stamp-badge text-sm sm:text-base ${
                isCorrect ? 'stamp-solved' : 'stamp-danger'
              }`}
            >
              {isCorrect ? 'PERPETRATOR CONVICTED • CASE CLOSED' : 'WRONGFUL CHARGESHEET • CASE UNSOLVED'}
            </span>
          </div>

          <h1 className="font-serif-noir text-3xl sm:text-4xl font-extrabold text-slate-100 drop-shadow">
            {isCorrect ? 'The True Culprit Has Been Brought to Justice' : 'The Real Perpetrator Escaped Trial'}
          </h1>

          <p className="font-typewriter text-xs sm:text-sm text-slate-300 max-w-3xl mx-auto leading-relaxed mt-2">
            {isCorrect
              ? 'Your interrogation, WhatsApp chat analysis, CDR cell tower tracking, and physical evidence aligned seamlessly. The accused has made a full judicial confession.'
              : 'Your chargesheet named an innocent party. The real culprit manipulated the timeline and evaded prosecution.'}
          </p>

          {/* Detective Rank Badge */}
          <div className={`mt-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-mono-dossier uppercase tracking-wider ${rank.color}`}>
            <span className="font-bold">Investigator Cadre:</span>
            <span>{rank.title}</span>
          </div>
        </div>
      </div>

      {/* Culprit Identity & Forensic Debrief */}
      <div className="bg-[#121620] border border-amber-500/30 rounded-xl p-6 sm:p-8 space-y-6 shadow-xl relative">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-900/30 gap-2">
          <div>
            <span className="font-mono-dossier text-[10px] text-amber-400 uppercase tracking-widest block mb-1">
              Classified SIT Judicial Reconstruction
            </span>
            <h2 className="font-serif-noir text-2xl font-bold text-slate-100">
              Perpetrator: {result.culprit?.name}
            </h2>
          </div>
          <span className="font-mono-dossier text-xs text-slate-400 px-3 py-1 rounded bg-[#090c13] border border-slate-800 self-start sm:self-auto">
            Designation: {result.culprit?.role}
          </span>
        </div>

        {/* Motive, Method, Opportunity Triad */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg bg-[#090d15] border border-amber-900/40 relative">
            <span className="font-mono-dossier text-xs font-bold text-amber-400 block mb-1 uppercase">
              Forensic Motive
            </span>
            <p className="font-typewriter text-xs text-slate-300 leading-relaxed">
              {result.culprit?.motive}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#090d15] border border-amber-900/40 relative">
            <span className="font-mono-dossier text-xs font-bold text-amber-400 block mb-1 uppercase">
              Execution Method
            </span>
            <p className="font-typewriter text-xs text-slate-300 leading-relaxed">
              {result.culprit?.method}
            </p>
          </div>

          <div className="p-4 rounded-lg bg-[#090d15] border border-amber-900/40 relative">
            <span className="font-mono-dossier text-xs font-bold text-amber-400 block mb-1 uppercase">
              Time & Opportunity
            </span>
            <p className="font-typewriter text-xs text-slate-300 leading-relaxed">
              {result.culprit?.opportunity}
            </p>
          </div>
        </div>

        {/* Full Narrative Solution */}
        <div className="p-5 rounded-lg bg-[#080b11] border border-amber-500/20 space-y-2">
          <span className="font-mono-dossier text-[11px] font-bold text-amber-300 uppercase tracking-wider block">
            [ SIT Event & Timeline Reconstruction ]
          </span>
          <p className="font-typewriter text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            {result.solution?.explanation}
          </p>
        </div>

        {/* Key Solving Clues */}
        {result.solution?.keyClues?.length > 0 && (
          <div>
            <h3 className="font-serif-noir text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
              Crucial Decisive Exhibits
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {result.solution.keyClues.map((clue, idx) => (
                <div
                  key={clue.id || idx}
                  className="p-3 rounded-lg bg-[#0e1219] border border-slate-800 text-xs"
                >
                  <span className="font-serif-noir font-bold text-amber-400 block mb-1">
                    Exhibits #{idx + 1}: {clue.title}
                  </span>
                  <p className="font-typewriter text-[11px] text-slate-300">
                    {clue.text}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Official Score Ledger */}
      <div className="bg-[#121620] border border-amber-500/30 rounded-xl p-6 sm:p-8 shadow-xl">
        <h3 className="font-serif-noir text-lg font-bold text-slate-100 uppercase tracking-wider mb-4 pb-3 border-b border-amber-900/30 flex justify-between items-center">
          <span>Official Scoring Ledger</span>
          <span className="font-mono-dossier text-xs text-amber-400 font-normal">
            Max Possible: {result.score?.maxPossible} pts
          </span>
        </h3>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
          <div className="p-3 rounded bg-[#090d15] border border-slate-800">
            <span className="font-mono-dossier text-[10px] text-slate-400 block uppercase">
              Base Rating
            </span>
            <span className="font-serif-noir text-lg font-bold text-slate-200">
              {result.score?.baseScore ?? 0} pts
            </span>
          </div>

          <div className="p-3 rounded bg-[#090d15] border border-slate-800">
            <span className="font-mono-dossier text-[10px] text-slate-400 block uppercase">
              Clue Bonus
            </span>
            <span className="font-serif-noir text-lg font-bold text-emerald-400">
              +{result.score?.cluesBonus ?? 0} pts
            </span>
          </div>

          <div className="p-3 rounded bg-[#090d15] border border-slate-800">
            <span className="font-mono-dossier text-[10px] text-slate-400 block uppercase">
              Lead Deductions
            </span>
            <span className="font-serif-noir text-lg font-bold text-rose-400">
              {result.score?.hintsPenalty ?? 0} pts
            </span>
          </div>

          <div className="p-3 rounded bg-[#090d15] border border-amber-500/40 shadow-inner">
            <span className="font-mono-dossier text-[10px] text-amber-400 block uppercase font-bold">
              Final Rating
            </span>
            <span className="font-serif-noir text-xl font-bold text-amber-400">
              {result.score?.total ?? 0} pts
            </span>
          </div>
        </div>

        {/* Action Button */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 border-t border-slate-800">
          <button
            onClick={() => {
              soundEngine.playPaper();
              navigate(`/case/${id}`);
            }}
            className="w-full sm:w-auto px-6 py-3.5 rounded border border-slate-700 bg-slate-900/80 text-slate-300 hover:text-amber-300 hover:border-amber-500/50 text-xs font-mono-dossier transition-colors"
          >
            Review Crime Board & Evidence
          </button>

          <button
            onClick={handleStartAnother}
            className="w-full sm:w-auto px-8 py-3.5 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif-noir font-bold text-xs uppercase tracking-widest transition-all shadow-xl shadow-amber-500/20 active:scale-95 border border-amber-400/50"
          >
            Commission Next Investigation →
          </button>
        </div>
      </div>
    </div>
  );
};

export default Results;
