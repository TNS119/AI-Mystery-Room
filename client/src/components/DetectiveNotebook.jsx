import React, { useState, useEffect } from 'react';
import { soundEngine } from '../utils/sound';
import { getSuspectPortrait, getSuspectFallbackSvg } from '../utils/suspectImages';

const SUSPECT_STATUSES = [
  { id: 'unknown', label: 'Unverified', color: 'text-slate-400 border-slate-700 bg-slate-800/40' },
  { id: 'suspicious', label: 'Suspicious', color: 'text-amber-400 border-amber-500/40 bg-amber-500/10' },
  { id: 'cleared', label: 'Alibi Cleared', color: 'text-emerald-400 border-emerald-500/40 bg-emerald-500/10' },
  { id: 'prime', label: 'Prime Suspect', color: 'text-rose-400 border-rose-500/40 bg-rose-500/10' }
];

export const DetectiveNotebook = ({ caseId, suspects = [], isOpen, onClose }) => {
  const storageKey = `amr:notebook:${caseId}`;
  const [notes, setNotes] = useState('');
  const [suspectMarks, setSuspectMarks] = useState({});

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        setNotes(parsed.notes || '');
        setSuspectMarks(parsed.suspectMarks || {});
      }
    } catch {
      // Ignore parse errors
    }
  }, [storageKey]);

  const saveToStorage = (updatedNotes, updatedMarks) => {
    try {
      localStorage.setItem(
        storageKey,
        JSON.stringify({ notes: updatedNotes, suspectMarks: updatedMarks })
      );
    } catch {
      // Ignore storage errors
    }
  };

  const handleNotesChange = (e) => {
    const val = e.target.value;
    setNotes(val);
    saveToStorage(val, suspectMarks);
    soundEngine.playTypewriter();
  };

  const cycleSuspectStatus = (suspectId) => {
    const current = suspectMarks[suspectId] || 'unknown';
    const currentIndex = SUSPECT_STATUSES.findIndex((s) => s.id === current);
    const nextIndex = (currentIndex + 1) % SUSPECT_STATUSES.length;
    const nextStatus = SUSPECT_STATUSES[nextIndex].id;

    const nextMarks = { ...suspectMarks, [suspectId]: nextStatus };
    setSuspectMarks(nextMarks);
    saveToStorage(notes, nextMarks);
    soundEngine.playStamp();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 z-50 bg-[#10141e] border-l border-amber-500/30 shadow-2xl flex flex-col transform transition-transform duration-300">
      {/* Journal Header */}
      <div className="p-4 border-b border-amber-500/20 bg-[#161b26] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></div>
          <span className="font-typewriter text-sm tracking-wider text-amber-300 uppercase">
            Detective's Field Log
          </span>
        </div>
        <button
          onClick={() => {
            soundEngine.playPaper();
            onClose();
          }}
          className="text-xs text-slate-400 hover:text-slate-100 px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
        >
          Close
        </button>
      </div>

      <div className="p-4 flex-1 overflow-y-auto space-y-6">
        {/* Suspect Triage Board */}
        <div>
          <h3 className="font-serif-noir text-xs text-amber-400 uppercase tracking-widest mb-3">
            Suspect Evaluation
          </h3>
          <p className="text-[11px] text-slate-400 mb-2">
            Click any suspect to toggle status (Unverified → Suspicious → Cleared → Prime).
          </p>
          <div className="space-y-2">
            {suspects.map((suspect, idx) => {
              const statusId = suspectMarks[suspect.id] || 'unknown';
              const statusConfig = SUSPECT_STATUSES.find((s) => s.id === statusId) || SUSPECT_STATUSES[0];
              const portrait = getSuspectPortrait(suspect, idx);
              return (
                <div
                  key={suspect.id}
                  onClick={() => cycleSuspectStatus(suspect.id)}
                  className="p-2.5 rounded-lg border border-slate-800 bg-slate-900/60 hover:bg-slate-850 cursor-pointer flex items-center justify-between transition-colors gap-2"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <img
                      src={portrait.url}
                      alt={suspect.name}
                      onError={(e) => {
                        e.target.src = getSuspectFallbackSvg(suspect.name, suspect.role);
                      }}
                      className="w-7 h-7 rounded-full object-cover border border-amber-500/30 shrink-0"
                    />
                    <div className="text-xs text-slate-200 font-medium truncate">
                      {suspect.name}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full border font-mono-dossier shrink-0 ${statusConfig.color}`}
                  >
                    {statusConfig.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Freeform Deduction Notes */}
        <div className="flex-1 flex flex-col">
          <h3 className="font-serif-noir text-xs text-amber-400 uppercase tracking-widest mb-2">
            Deduction Notes
          </h3>
          <p className="text-[11px] text-slate-400 mb-2">
            Auto-saved field scratchpad. Record contradictions in alibis and weapon locations.
          </p>
          <textarea
            value={notes}
            onChange={handleNotesChange}
            placeholder="E.g., Butler claims he was in the cellar at 10 PM, but the carriage track clue suggests someone arrived at 9:45..."
            rows={10}
            className="w-full flex-1 p-3 rounded-lg border border-amber-500/20 bg-[#0a0d14] text-amber-100 font-typewriter text-xs leading-relaxed focus:outline-none focus:border-amber-500/50 resize-none shadow-inner"
          />
        </div>
      </div>

      <div className="p-3 border-t border-slate-800 bg-[#0d1017] text-center">
        <span className="text-[10px] text-slate-500 uppercase tracking-widest font-mono-dossier">
          Case Records Encrypted & Stored Locally
        </span>
      </div>
    </div>
  );
};
export default DetectiveNotebook;

