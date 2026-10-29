import React from 'react';

export const EvidenceThumbnail = ({ type, title, isDiscovered }) => {
  const normType = (type || '').toLowerCase();

  if (normType.includes('whatsapp') || title?.toLowerCase().includes('whatsapp')) {
    return (
      <div className="w-full h-24 rounded bg-[#0b141a] border border-emerald-900/60 p-2 relative overflow-hidden flex flex-col justify-between font-mono-dossier text-[10px]">
        {/* WhatsApp Top Status */}
        <div className="flex items-center justify-between text-emerald-400 border-b border-emerald-900/40 pb-1">
          <span className="flex items-center gap-1 font-bold text-[9px]">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            WhatsApp Decrypted
          </span>
          <span className="text-[9px] text-slate-400">23:41 IST</span>
        </div>

        {/* Chat Balloon */}
        <div className="bg-[#1f2c34] text-slate-100 rounded px-2 py-1 text-[10px] leading-tight border-l-2 border-emerald-500 shadow-sm">
          {isDiscovered ? (
            <div className="flex items-center justify-between gap-1">
              <span className="truncate italic">"Message packet decrypted..."</span>
              <span className="text-cyan-400 shrink-0 text-[9px]">✓✓</span>
            </div>
          ) : (
            <span className="text-slate-500 italic">[Encrypted Chat File]</span>
          )}
        </div>

        <div className="text-[9px] text-emerald-500/80 flex justify-between">
          <span>Target Mobile Device</span>
          <span>End-to-End Log</span>
        </div>
      </div>
    );
  }

  if (normType.includes('cctv') || title?.toLowerCase().includes('cctv')) {
    return (
      <div className="w-full h-24 rounded bg-[#0a0f0d] border border-emerald-500/40 p-2 relative overflow-hidden flex flex-col justify-between font-mono-dossier text-[10px]">
        {/* Scanline overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_50%,rgba(0,0,0,0.5)_50%)] bg-[length:100%_4px] pointer-events-none"></div>

        <div className="flex justify-between items-center text-emerald-400 relative z-10 text-[9px]">
          <span className="flex items-center gap-1 font-bold">
            <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping"></span>
            REC ● [CAM-02]
          </span>
          <span className="text-emerald-300">01:42:15 AM</span>
        </div>

        {/* Center Frame Reticle */}
        <div className="relative z-10 flex items-center justify-center my-auto">
          <div className="w-12 h-8 border border-dashed border-emerald-500/40 rounded flex items-center justify-center bg-emerald-950/20">
            <span className="text-[8px] text-emerald-300 uppercase tracking-widest font-bold">
              {isDiscovered ? 'FEED SYNC' : 'LOCKED'}
            </span>
          </div>
        </div>

        <div className="flex justify-between text-[8px] text-emerald-500/70 relative z-10">
          <span>720P HD FEED</span>
          <span>NVR HARD DRIVE</span>
        </div>
      </div>
    );
  }

  if (normType.includes('call') || normType.includes('cdr') || title?.toLowerCase().includes('call') || title?.toLowerCase().includes('tower')) {
    return (
      <div className="w-full h-24 rounded bg-[#10141f] border border-cyan-500/40 p-2 relative overflow-hidden flex flex-col justify-between font-mono-dossier text-[10px]">
        <div className="flex justify-between items-center text-cyan-400 text-[9px] border-b border-cyan-900/40 pb-1">
          <span className="font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-cyan-400"></span>
            TELCO CDR DOCKET
          </span>
          <span className="text-slate-400">4G LAC Triangulated</span>
        </div>

        {/* Signal Waves Schematic */}
        <div className="flex items-center justify-center gap-2 my-auto">
          <div className="flex items-end gap-0.5 h-6">
            <div className="w-1 h-2 bg-cyan-500/60 rounded-t"></div>
            <div className="w-1 h-3 bg-cyan-500/80 rounded-t"></div>
            <div className="w-1 h-5 bg-cyan-400 rounded-t"></div>
            <div className="w-1 h-6 bg-cyan-300 rounded-t"></div>
          </div>
          <div className="text-[9px] text-slate-300">
            <span className="text-cyan-300 font-bold block">TOWER BTS-08</span>
            <span className="text-slate-400 block text-[8px]">Sector Azimuth 120°</span>
          </div>
        </div>

        <div className="flex justify-between text-[8px] text-cyan-400/80">
          <span>CELLULAR SUBSCRIBER</span>
          <span>04m 18s DURATION</span>
        </div>
      </div>
    );
  }

  if (normType.includes('upi') || normType.includes('bank') || title?.toLowerCase().includes('upi') || title?.toLowerCase().includes('transaction')) {
    return (
      <div className="w-full h-24 rounded bg-[#16131c] border border-amber-500/40 p-2 relative overflow-hidden flex flex-col justify-between font-mono-dossier text-[10px]">
        <div className="flex justify-between items-center text-amber-300 text-[9px] border-b border-amber-900/40 pb-1">
          <span className="font-bold flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400"></span>
            FINANCIAL TRANSACTION
          </span>
          <span className="text-emerald-400 font-bold">₹ UPI</span>
        </div>

        <div className="flex items-center justify-between my-auto px-1">
          <div>
            <span className="text-[8px] text-slate-400 block uppercase">TRANSFER REF</span>
            <span className="text-[10px] text-slate-200 font-bold font-mono">UTR: 4910283918</span>
          </div>
          <div className="w-7 h-7 bg-amber-500/10 border border-amber-500/30 rounded flex items-center justify-center text-amber-300 font-bold text-xs">
            ₹
          </div>
        </div>

        <div className="flex justify-between text-[8px] text-slate-400">
          <span className="text-emerald-400">● SETTLED</span>
          <span>NPCI GATEWAY</span>
        </div>
      </div>
    );
  }

  if (normType.includes('photo') || title?.toLowerCase().includes('photo') || title?.toLowerCase().includes('scene')) {
    return (
      <div className="w-full h-24 rounded bg-[#181a20] border border-amber-400/50 p-2 relative overflow-hidden flex flex-col justify-between font-mono-dossier text-[10px]">
        {/* Yellow Evidence Card Marker */}
        <div className="flex justify-between items-start text-[9px]">
          <span className="px-1.5 py-0.5 rounded bg-yellow-400 text-slate-950 font-bold tracking-widest text-[8px]">
            EVIDENCE A
          </span>
          <span className="text-[8px] text-slate-400">POLAROID #04</span>
        </div>

        {/* Crime Tape Stripe in Corner */}
        <div className="absolute -right-6 top-3 w-20 h-3 bg-yellow-500/80 text-black font-bold text-[6px] flex items-center justify-center rotate-45 pointer-events-none">
          POLICE LINE
        </div>

        <div className="my-auto text-center">
          <span className="text-[10px] text-amber-200 font-serif-noir font-bold block">
            CRIME SCENE PHOTO
          </span>
          <span className="text-[8px] text-slate-400 block">Focal length 35mm • Metric Scale</span>
        </div>

        <div className="flex justify-between text-[8px] text-slate-400 border-t border-slate-700/60 pt-0.5">
          <span>FORENSIC RECOVERY</span>
          <span>EXHIBIT #1</span>
        </div>
      </div>
    );
  }

  // Default Forensic / FSL Lab Evidence
  return (
    <div className="w-full h-24 rounded bg-[#14121a] border border-purple-500/40 p-2 relative overflow-hidden flex flex-col justify-between font-mono-dossier text-[10px]">
      <div className="flex justify-between items-center text-purple-300 text-[9px] border-b border-purple-900/40 pb-1">
        <span className="font-bold flex items-center gap-1">
          <span className="w-1.5 h-1.5 rounded-full bg-purple-400"></span>
          FSL FORENSIC LAB
        </span>
        <span className="text-slate-400">BIOMETRIC</span>
      </div>

      <div className="flex items-center justify-between my-auto px-1">
        <div>
          <span className="text-[8px] text-slate-400 block">CHEMICAL ANALYSIS</span>
          <span className="text-[10px] text-purple-200 font-bold">DNA / TOXICOLOGY</span>
        </div>
        <div className="font-mono text-[10px] tracking-widest text-slate-500">
          ||||| | ||||
        </div>
      </div>

      <div className="flex justify-between text-[8px] text-purple-400/80">
        <span>SEALED EVIDENCE</span>
        <span>LAB CERTIFIED</span>
      </div>
    </div>
  );
};

export default EvidenceThumbnail;

