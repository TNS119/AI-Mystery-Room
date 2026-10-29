import React from 'react';
import { soundEngine } from '../utils/sound';

export const EvidenceModal = ({ clue, onClose }) => {
  if (!clue) return null;

  // Determine clue category from clue.type or fallback to text inspection
  const clueType = clue.type || (
    clue.title?.toLowerCase().includes('whatsapp') || clue.text?.toLowerCase().includes('chat') ? 'whatsapp' :
    clue.title?.toLowerCase().includes('cctv') || clue.text?.toLowerCase().includes('camera') ? 'cctv' :
    clue.title?.toLowerCase().includes('call') || clue.text?.toLowerCase().includes('cdr') ? 'call_log' :
    clue.title?.toLowerCase().includes('upi') || clue.text?.toLowerCase().includes('pay') || clue.text?.toLowerCase().includes('bank') ? 'upi' :
    clue.title?.toLowerCase().includes('photo') || clue.text?.toLowerCase().includes('impression') ? 'photo' : 'forensic'
  );

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-[#10141e] border border-amber-500/40 rounded-xl max-w-lg w-full shadow-2xl overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-150">
        {/* Modal Top Bar */}
        <div className="p-4 bg-[#161b26] border-b border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400"></span>
            <span className="font-mono-dossier text-xs text-amber-300 uppercase tracking-wider">
              Forensic Exhibit: {clue.title}
            </span>
          </div>
          <button
            onClick={() => {
              soundEngine.playPaper();
              onClose();
            }}
            className="text-xs font-mono-dossier text-slate-400 hover:text-slate-100 px-2 py-1 rounded border border-slate-700 hover:border-slate-500 transition-colors"
          >
            Close
          </button>
        </div>

        <div className="p-6 overflow-y-auto max-h-[75vh] space-y-4">
          {/* Tag & Location */}
          <div className="flex justify-between items-center text-xs font-mono-dossier text-slate-400 pb-2 border-b border-slate-800">
            <span>Location: <strong className="text-slate-200">{clue.location}</strong></span>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-amber-400 border border-slate-700 uppercase">
              {clueType.replace('_', ' ')}
            </span>
          </div>

          {/* DYNAMIC REALISTIC EVIDENCE VIEWER */}

          {/* 1. WHATSAPP CHAT LOG */}
          {clueType === 'whatsapp' && (
            <div className="rounded-lg bg-[#0b141a] border border-[#1f2c34] p-4 text-xs font-sans shadow-inner space-y-3">
              <div className="flex items-center justify-between pb-2 border-b border-[#202c33] text-[11px] text-slate-400">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-[#00a884] flex items-center justify-center text-white text-[10px] font-bold">
                    WA
                  </div>
                  <span className="font-semibold text-slate-200">WhatsApp Forensic Extraction</span>
                </div>
                <span className="text-[10px] text-emerald-400 font-mono">ENCRYPTED BACKUP RECOVERED</span>
              </div>

              <div className="space-y-2 py-1">
                <div className="bg-[#202c33] text-slate-200 rounded-lg p-3 max-w-[90%] space-y-1">
                  <div className="text-[10px] text-[#00a884] font-semibold">Incoming Message Log</div>
                  <div className="text-xs font-normal leading-relaxed text-slate-100 whitespace-pre-line">
                    "{clue.text}"
                  </div>
                  <div className="text-[9px] text-slate-400 text-right flex items-center justify-end gap-1">
                    <span>22:47 IST</span>
                    <span className="text-[#53bdeb]">✓✓</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 2. CALL DETAIL RECORD (CDR) */}
          {clueType === 'call_log' && (
            <div className="rounded-lg bg-[#0c1017] border border-slate-700 p-4 font-mono-dossier text-xs space-y-3">
              <div className="flex justify-between items-center text-[10px] text-amber-400 pb-2 border-b border-slate-800">
                <span>TELECOM TOWER CDR SUBPOENA</span>
                <span>TRAI / SPECIAL CRIME UNIT</span>
              </div>
              <div className="space-y-2 text-[11px] text-slate-300">
                <div className="bg-[#141923] p-3 rounded border border-slate-800 space-y-1">
                  <div className="text-amber-300 font-bold">Tower Triangulation Log:</div>
                  <p className="text-slate-200 leading-relaxed whitespace-pre-line font-typewriter">
                    {clue.text}
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-2 text-[10px] text-slate-400 pt-1">
                  <div>Cell Tower: <strong className="text-slate-200">Sector-4 Tower Alpha</strong></div>
                  <div>Signal Status: <strong className="text-emerald-400">Direct Route Confirmed</strong></div>
                </div>
              </div>
            </div>
          )}

          {/* 3. CCTV SURVEILLANCE STILL */}
          {clueType === 'cctv' && (
            <div className="rounded-lg bg-black border border-emerald-500/40 p-4 space-y-3 relative overflow-hidden">
              <div className="absolute top-2 right-3 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping"></span>
                <span className="text-[10px] font-mono-dossier text-rose-400 font-bold uppercase tracking-widest">
                  [REC] CCTV FEED
                </span>
              </div>

              <div className="text-[10px] font-mono-dossier text-emerald-400 space-y-0.5">
                <div>FEED: CH-04 SURVEILLANCE MATRIX</div>
                <div>TIMECODE: 22:18:41 IST • FPS: 24</div>
              </div>

              <div className="p-3.5 bg-emerald-950/20 border border-emerald-500/30 rounded text-xs font-mono text-emerald-200 leading-relaxed whitespace-pre-line">
                {clue.text}
              </div>

              <div className="text-[10px] font-mono-dossier text-slate-500 text-right">
                Digitally Timestamped by Cyber Crime Unit
              </div>
            </div>
          )}

          {/* 4. FIELD PHOTOGRAPHY */}
          {clueType === 'photo' && (
            <div className="polaroid rounded border border-slate-700 p-4 space-y-3">
              <div className="flex justify-between items-center text-[10px] font-mono-dossier text-amber-400 pb-1 border-b border-slate-800">
                <span>EVIDENCE PHOTO NO. {clue.id.toUpperCase()}</span>
                <span className="px-1.5 py-0.5 bg-amber-500/10 rounded border border-amber-500/30">
                  MARKER [ 03 ]
                </span>
              </div>

              <div className="bg-[#0b0e14] p-4 rounded border border-slate-800 text-xs font-typewriter text-amber-100 leading-relaxed whitespace-pre-line">
                {clue.text}
              </div>

              <div className="text-[10px] font-mono-dossier text-slate-400 italic">
                * High-resolution photographic evidence captured at scene by forensic unit.
              </div>
            </div>
          )}

          {/* 5. UPI / FINANCIAL STATEMENT */}
          {clueType === 'upi' && (
            <div className="rounded-lg bg-[#0e1219] border border-blue-500/30 p-4 space-y-3 font-mono-dossier text-xs">
              <div className="flex justify-between items-center pb-2 border-b border-slate-800">
                <span className="text-blue-400 font-bold">UPI / BANKING AUDIT LOG</span>
                <span className="text-[10px] text-slate-400">NPCI / RBI VERIFIED</span>
              </div>

              <div className="bg-[#141a24] p-3.5 rounded border border-blue-500/20 text-slate-200 leading-relaxed whitespace-pre-line font-typewriter">
                {clue.text}
              </div>

              <div className="text-[10px] text-slate-400 grid grid-cols-2 gap-2 pt-1 border-t border-slate-800">
                <div>UPI Ref: <span className="text-slate-200">#40928172901</span></div>
                <div>Status: <span className="text-emerald-400">Completed (Immediate)</span></div>
              </div>
            </div>
          )}

          {/* 6. FORENSIC LAB / POST-MORTEM REPORT */}
          {clueType === 'forensic' && (
            <div className="rounded-lg bg-[#0e1118] border border-amber-500/30 p-4 space-y-3">
              <div className="flex justify-between items-center pb-2 border-b border-amber-900/30">
                <span className="font-mono-dossier text-xs font-bold text-amber-400">
                  FORENSIC SCIENCE LABORATORY (FSL) REPORT
                </span>
                <span className="stamp-badge stamp-warning text-[9px]">OFFICIAL COPY</span>
              </div>

              <div className="bg-[#141822] p-4 rounded border border-amber-900/20 text-xs font-typewriter text-slate-200 leading-relaxed whitespace-pre-line">
                {clue.text}
              </div>

              <div className="text-[10px] font-mono-dossier text-slate-400 flex justify-between">
                <span>Toxicology & Chemical Analysis Division</span>
                <span>Examined by Senior Scientific Officer</span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-3 bg-[#0d1017] border-t border-slate-800 text-center">
          <span className="text-[10px] font-mono-dossier text-slate-500">
            Case Evidence Logged in Bureau Forensic Evidence Vault
          </span>
        </div>
      </div>
    </div>
  );
};

export default EvidenceModal;

