import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { apiService } from '../api/client';
import { soundEngine } from '../utils/sound';

const Home = () => {
  const navigate = useNavigate();
  const [activeCase, setActiveCase] = useState(null);
  const [checkingResume, setCheckingResume] = useState(true);

  useEffect(() => {
    const savedId = localStorage.getItem('amr:activeCaseId');
    if (savedId) {
      apiService
        .getCase(savedId)
        .then((res) => {
          if (res.data?.status === 'active') {
            setActiveCase(res.data);
          } else {
            localStorage.removeItem('amr:activeCaseId');
          }
        })
        .catch(() => {
          localStorage.removeItem('amr:activeCaseId');
        })
        .finally(() => {
          setCheckingResume(false);
        });
    } else {
      setCheckingResume(false);
    }
  }, []);

  return (
    <div className="relative min-h-[calc(100vh-4rem)] room-ambient-bg py-8 px-2 sm:px-4 md:px-6 w-full space-y-8 overflow-hidden">
      {/* Decorative Crime Scene Header Tag */}
      <div className="text-center space-y-5 relative z-10 w-full">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-amber-500/30 bg-[#121620] shadow-lg shadow-black/60">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
          <span className="font-mono-dossier text-xs uppercase tracking-widest text-amber-300">
            Special Investigation Bureau • Case Vault
          </span>
        </div>

        {/* Ambient Lamp Glow & Main Mystery Room Title */}
        <div className="relative">
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-96 h-40 bg-amber-500/10 blur-3xl pointer-events-none rounded-full"></div>
          <h1 className="text-4xl sm:text-6xl font-extrabold font-serif-noir tracking-wider text-slate-100 max-w-4xl mx-auto leading-tight drop-shadow-lg">
            THE AI MYSTERY ROOM
          </h1>
          <p className="mt-4 text-base sm:text-lg text-amber-200/80 max-w-2xl mx-auto font-typewriter leading-relaxed">
            Step into the investigation room. Sift through recovered chat logs, mobile CDR tower records, CCTV surveillance, financial statements, and forensic reports to identify the real culprit.
          </p>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
          <Link
            to="/create"
            onClick={() => {
              soundEngine.playPaper();
              soundEngine.playClick();
            }}
            className="w-full sm:w-auto px-8 py-4 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif-noir font-bold text-sm uppercase tracking-widest transition-all transform hover:-translate-y-0.5 active:translate-y-0 shadow-xl shadow-amber-500/25 border border-amber-400/50 flex items-center justify-center gap-2"
          >
            <span>Open New Case Investigation</span>
            <span className="font-mono-dossier">→</span>
          </Link>

          {!checkingResume && activeCase && (
            <button
              onClick={() => {
                soundEngine.playPaper();
                navigate(`/case/${activeCase.id}`);
              }}
              className="w-full sm:w-auto px-6 py-4 rounded border border-amber-500/40 bg-[#151922] hover:bg-[#1a202c] text-amber-300 font-mono-dossier text-xs tracking-wider transition-colors shadow-lg shadow-black/50"
            >
              Resume Active Investigation ({activeCase.title})
            </button>
          )}
        </div>
      </div>

      {/* Interactive Dossier Cards (Investigation Protocol) */}
      <div className="relative z-10 w-full">
        <div className="flex items-center justify-center gap-3 mb-8">
          <div className="h-px w-16 bg-amber-500/30"></div>
          <h2 className="font-serif-noir text-xl tracking-widest text-amber-300 uppercase text-center">
            Standard Investigation Protocol
          </h2>
          <div className="h-px w-16 bg-amber-500/30"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Step 1 Folder */}
          <div
            onMouseEnter={() => soundEngine.playPaper()}
            className="group relative bg-[#131722] border border-amber-500/25 rounded-lg p-6 shadow-xl hover:border-amber-400/50 transition-all hover:-translate-y-1"
          >
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono-dossier text-amber-300 uppercase tracking-widest">
              Directive 01
            </div>
            <div className="pushpin absolute top-4 right-4"></div>
            <h3 className="font-serif-noir text-lg font-bold text-slate-100 mt-2 mb-2">
              Lodge Crime Scene Brief
            </h3>
            <p className="font-typewriter text-xs text-slate-300 leading-relaxed">
              Define any crime setting or scenario. Select your complexity tier and the AI weaves an airtight, verifiable plot.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono-dossier text-amber-400/80">
              [ Authentic Setting • 1 True Culprit • Strict Logic ]
            </div>
          </div>

          {/* Step 2 Folder */}
          <div
            onMouseEnter={() => soundEngine.playPaper()}
            className="group relative bg-[#131722] border border-amber-500/25 rounded-lg p-6 shadow-xl hover:border-amber-400/50 transition-all hover:-translate-y-1"
          >
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono-dossier text-amber-300 uppercase tracking-widest">
              Directive 02
            </div>
            <div className="pushpin absolute top-4 right-4"></div>
            <h3 className="font-serif-noir text-lg font-bold text-slate-100 mt-2 mb-2">
              Examine Forensic Proof
            </h3>
            <p className="font-typewriter text-xs text-slate-300 leading-relaxed">
              Examine recovered chat logs, mobile CDR tower logs, security CCTV footage, and financial payments pinned to the Connecting Board.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono-dossier text-amber-400/80">
              [ Messages • CCTV • CDR Triangulation • Financial Audits ]
            </div>
          </div>

          {/* Step 3 Folder */}
          <div
            onMouseEnter={() => soundEngine.playPaper()}
            className="group relative bg-[#131722] border border-amber-500/25 rounded-lg p-6 shadow-xl hover:border-amber-400/50 transition-all hover:-translate-y-1"
          >
            <div className="absolute -top-3 left-6 px-3 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 text-[10px] font-mono-dossier text-amber-300 uppercase tracking-widest">
              Directive 03
            </div>
            <div className="pushpin absolute top-4 right-4"></div>
            <h3 className="font-serif-noir text-lg font-bold text-slate-100 mt-2 mb-2">
              Submit Formal Accusation
            </h3>
            <p className="font-typewriter text-xs text-slate-300 leading-relaxed">
              Interrogate suspect alibis and name the accused in the formal chargesheet. The court unseals the solution to reveal motive, method, and score.
            </p>
            <div className="mt-4 pt-3 border-t border-slate-800 text-[11px] font-mono-dossier text-amber-400/80">
              [ Sealed Court Solution • Forensic Reconstruction • Sleuth Rank ]
            </div>
          </div>
        </div>
      </div>

      {/* Case Complexity Matrix */}
      <div className="bg-[#10141e]/90 border border-amber-900/40 rounded-xl p-6 sm:p-8 shadow-2xl relative z-10 w-full">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-amber-900/30 gap-2">
          <div>
            <h2 className="font-serif-noir text-lg text-slate-100 uppercase tracking-wider">
              Investigation Complexity Tiers
            </h2>
            <p className="text-xs font-mono-dossier text-slate-400">
              Calibrated by Crime Investigation Bureau Rubric
            </p>
          </div>
          <span className="stamp-badge stamp-warning self-start sm:self-auto text-xs">
            Official Guidelines
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-6">
          <div className="border border-emerald-500/30 rounded-lg p-5 bg-[#0d1117] relative">
            <span className="font-mono-dossier text-xs font-bold text-emerald-400 uppercase tracking-wider block mb-2">
              Sub-Inspector Tier [Easy]
            </span>
            <ul className="text-xs font-typewriter space-y-2 text-slate-300">
              <li>• 3 Suspects Under Interrogation</li>
              <li>• 5 Forensic/Digital Clues</li>
              <li>• 2 Progressive Clue Leads</li>
              <li>• 100 Base Points (Max 125)</li>
            </ul>
          </div>

          <div className="border border-amber-500/30 rounded-lg p-5 bg-[#0d1117] relative">
            <span className="font-mono-dossier text-xs font-bold text-amber-400 uppercase tracking-wider block mb-2">
              Inspector Tier [Medium]
            </span>
            <ul className="text-xs font-typewriter space-y-2 text-slate-300">
              <li>• 4 Suspects Under Interrogation</li>
              <li>• 7 Clues (Includes 1 Red Herring)</li>
              <li>• 3 Progressive Clue Leads</li>
              <li>• 150 Base Points (Max 185)</li>
            </ul>
          </div>

          <div className="border border-rose-500/30 rounded-lg p-5 bg-[#0d1117] relative">
            <span className="font-mono-dossier text-xs font-bold text-rose-400 uppercase tracking-wider block mb-2">
              Chief Sleuth [Hard]
            </span>
            <ul className="text-xs font-typewriter space-y-2 text-slate-300">
              <li>• 5 Suspects Under Interrogation</li>
              <li>• 9 Clues (Multiple Red Herrings)</li>
              <li>• 3 Progressive Clue Leads</li>
              <li>• 200 Base Points (Max 245)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Home;
