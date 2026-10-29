import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from '../api/client';
import { useCase } from '../context/CaseContext';
import { soundEngine } from '../utils/sound';

export const GENRE_CATEGORIES = [
  {
    id: 'arts_cinema',
    name: 'Arts & Cinema',
    icon: '🎭',
    premises: [
      'A celebrated classical sitar maestro collapses on stage during the Varanasi Ganga Mahotsav while performing with an antique 200-year-old sitar.',
      'A National Award-winning theater director in Kolkata is found dead inside the stage trapdoor during an opening dress rehearsal.',
      'A high-profile Bollywood costume designer in Bandra is found strangled in her private atelier on the eve of a prestigious film premiere.'
    ]
  },
  {
    id: 'academia_science',
    name: 'Academia & Lab',
    icon: '🔬',
    premises: [
      'The head of quantum computing research at an elite Bengaluru institute is found electrocuted in the laser laboratory on the eve of publishing a breakthrough paper.',
      'A senior archaeologist excavating a 12th-century temple vault near Hampi is found poisoned in his tent with an ancient inscribed copper plate missing.',
      'A renowned botanical geneticist at an Indian agricultural university in Pune is found dead inside the climate-controlled greenhouse.'
    ]
  },
  {
    id: 'sports_tournament',
    name: 'Sports & Arena',
    icon: '🏏',
    premises: [
      'A star cricket batsman is found asphyxiated in the private VIP locker room at Eden Gardens hours before the national tournament finals.',
      'A national chess grandmaster collapses clutching a poisoned queen during the tense final round of the Chennai International Masters.',
      'The head coach of an elite boxing academy in Rohtak is found dead inside the training ring the night before Olympic trials.'
    ]
  },
  {
    id: 'royal_heritage',
    name: 'Royal Heritage',
    icon: '👑',
    premises: [
      'The royal custodian of an ancestral desert fortress in Jaisalmer is found dead inside the sealed mirror-hall during the annual desert festival.',
      'An antique jewellery appraiser vanishes from a royal palace hotel suite in Udaipur with a legendary Nizam diamond brooch missing.',
      'The hereditary caretaker of a 300-year-old Chettinad ancestral mansion is found murdered in the central courtyard during a family reunion.'
    ]
  },
  {
    id: 'medical_forensics',
    name: 'Hospital & Surgery',
    icon: '🏥',
    premises: [
      'A celebrated cardiothoracic surgeon at a premier hospital in Hyderabad is found dead in the sterile scrub room minutes before an emergency surgery.',
      'The chief toxicologist at a government forensic research laboratory in Delhi is found poisoned with a rare synthetic alkaloid.',
      'A head ICU nurse at a hill station sanatorium in Shimla is found dead in the medicine dispensary during a severe blizzard.'
    ]
  },
  {
    id: 'luxury_transit',
    name: 'Locked Train & Transit',
    icon: '🚂',
    premises: [
      'A high-profile mystery novelist traveling aboard the luxury desert sleeper express from Jaipur to Jaisalmer is found poisoned in his locked first-class coupe.',
      'The chief engineer of an isolated lighthouse off the stormy Konkan coast is found dead inside the lantern room with radio cables severed.',
      'A rare gemstone courier traveling on an overnight heritage train through the Western Ghats is discovered dead in his private berth.'
    ]
  },
  {
    id: 'culinary_plantations',
    name: 'Plantation & Culinary',
    icon: '☕',
    premises: [
      'A master spice blender at an ancestral cardamom estate in the Munnar hills is found drowned in the curing vat with the secret generational recipe vanished.',
      'A three-star culinary master chef in Mumbai collapses in the VIP kitchen pass during an exclusive 10-course state banquet.',
      'The patriarch of a historic Darjeeling tea estate is found dead in his tasting room with the championship reserve harvest missing.'
    ]
  }
];

const ALL_PREMISES = GENRE_CATEGORIES.flatMap((g) => g.premises);

const FLAVOR_TEXTS = [
  'Deploying Special Investigation Team to the crime scene...',
  'Securing perimeter and retrieving CCTV surveillance footage...',
  'Subpoenaing mobile CDR cell tower records and forensic chats...',
  'Cross-verifying suspect alibi timelines and physical evidence...',
  'Triangulating forensic statements and sealing court docket...'
];

const CreateMystery = () => {
  const navigate = useNavigate();
  const { setCurrentCase, setActiveCaseId } = useCase();

  const [premise, setPremise] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [submitting, setSubmitting] = useState(false);
  const [flavorIndex, setFlavorIndex] = useState(0);
  const [selectedGenre, setSelectedGenre] = useState(null);
  const [error, setError] = useState(null);

  // Rotate loading flavor texts while generating
  useEffect(() => {
    let interval;
    if (submitting) {
      interval = setInterval(() => {
        setFlavorIndex((prev) => (prev + 1) % FLAVOR_TEXTS.length);
      }, 3500);
    }
    return () => clearInterval(interval);
  }, [submitting]);

  const handleSurpriseMe = () => {
    soundEngine.playPaper();
    const random = ALL_PREMISES[Math.floor(Math.random() * ALL_PREMISES.length)];
    setPremise(random);
    setSelectedGenre(null);
    setError(null);
  };

  const handleSelectGenre = (genre) => {
    soundEngine.playPaper();
    setSelectedGenre(genre.id);
    const randomPremise = genre.premises[Math.floor(Math.random() * genre.premises.length)];
    setPremise(randomPremise);
    setError(null);
  };

  const handleTextChange = (e) => {
    setPremise(e.target.value);
    soundEngine.playTypewriter();
  };

  const handleSelectDifficulty = (level) => {
    soundEngine.playClick();
    setDifficulty(level);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const trimmed = premise.trim();

    if (trimmed.length < 10) {
      setError({ message: 'Premise must be at least 10 characters long.' });
      return;
    }
    if (trimmed.length > 300) {
      setError({ message: 'Premise must not exceed 300 characters.' });
      return;
    }

    soundEngine.playDramaticChord();
    setSubmitting(true);
    setError(null);

    try {
      const res = await apiService.createCase(trimmed, difficulty);
      const caseData = res.data;
      setCurrentCase(caseData);
      setActiveCaseId(caseData.id);
      soundEngine.playStamp();
      navigate(`/case/${caseData.id}`);
    } catch (err) {
      setError(err);
      setSubmitting(false);
    }
  };

  return (
    <div className="py-8 px-2 sm:px-4 md:px-6 w-full room-ambient-bg min-h-[calc(100vh-4rem)] space-y-6">
      {/* Header */}
      <div className="text-center w-full">
        <div className="inline-block px-3 py-1 rounded bg-amber-500/10 border border-amber-500/30 text-amber-300 font-mono-dossier text-xs uppercase tracking-widest mb-3">
          Special Investigation Bureau • Case Registration
        </div>
        <h1 className="font-serif-noir text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-100">
          Commission Case Investigation
        </h1>
        <p className="mt-2 text-slate-400 font-typewriter text-xs sm:text-sm w-full">
          Provide a crime premise and setting. The procedural engine generates an authentic fair-play whodunit with digital messages, CCTV records, phone tower logs, and suspect alibis.
        </p>
      </div>

      {submitting ? (
        <div className="bg-[#10141e] border border-amber-500/40 rounded-xl p-10 sm:p-14 text-center shadow-2xl space-y-6 relative overflow-hidden w-full">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-500/5 via-transparent to-amber-500/5 animate-pulse pointer-events-none"></div>

          <div className="relative z-10">
            <div className="w-16 h-16 border-4 border-amber-500/20 border-t-amber-400 rounded-full animate-spin mx-auto mb-6"></div>
            <span className="stamp-badge stamp-warning text-xs mb-3">
              EVIDENCE ENGINE ACTIVE
            </span>
            <h2 className="font-serif-noir text-xl font-bold text-slate-100 mb-2">
              Synthesizing Case Dossier
            </h2>
            <p className="font-typewriter text-amber-300/90 text-sm animate-pulse min-h-[1.5rem]">
              {FLAVOR_TEXTS[flavorIndex]}
            </p>
            <div className="mt-6 pt-4 border-t border-slate-800 text-[11px] font-mono-dossier text-slate-500">
              Corroborating digital chat logs • Triangulating cell tower data • Sealing court vault solution
            </div>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleSubmit}
          className="bg-[#121620] border border-amber-500/25 rounded-xl p-6 sm:p-8 shadow-2xl relative"
        >
          {/* Top Folder Tab */}
          <div className="absolute -top-3 left-8 px-4 py-0.5 rounded bg-amber-500/20 border border-amber-500/40 font-mono-dossier text-[10px] text-amber-300 uppercase tracking-widest">
            Investigation Commission Docket No. SIT-2026
          </div>

          {error && (
            <div className="mb-6 p-4 rounded bg-rose-950/40 border border-rose-500/50 text-rose-200 text-xs font-mono-dossier">
              <span className="font-bold">{error.code ? `[${error.code}] ` : ''}</span>
              {error.message || 'Failed to generate mystery. Please try again.'}
            </div>
          )}

          {/* DIVERSE GENRE QUICK SELECTOR BAR */}
          <div className="mb-6 pb-4 border-b border-amber-900/30">
            <div className="flex justify-between items-center mb-2.5">
              <span className="font-serif-noir text-xs font-bold text-amber-300 uppercase tracking-wider">
                Select Investigation Genre
              </span>
              <span className="font-mono-dossier text-[10px] text-slate-400">
                Click genre to load non-business scenario
              </span>
            </div>

            <div className="flex flex-wrap gap-2">
              {GENRE_CATEGORIES.map((genre) => (
                <button
                  key={genre.id}
                  type="button"
                  onClick={() => handleSelectGenre(genre)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-serif-noir font-bold transition-all border ${
                    selectedGenre === genre.id
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/20 scale-105'
                      : 'bg-[#0a0e16] text-slate-300 border-slate-800 hover:border-amber-500/40 hover:text-amber-200'
                  }`}
                >
                  <span className="mr-1.5">{genre.icon}</span>
                  <span>{genre.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Expansive Two-Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column (7 cols): Premise Input */}
            <div className="lg:col-span-7 space-y-4">
              <div className="flex justify-between items-center">
                <label htmlFor="premise" className="font-serif-noir text-sm text-slate-200 uppercase tracking-wider font-bold">
                  Crime Premise & Setting
                </label>
                <button
                  type="button"
                  onClick={handleSurpriseMe}
                  className="font-mono-dossier text-xs text-amber-400 hover:text-amber-300 underline underline-offset-4 transition-colors"
                >
                  Surprise Cold Case (Random Genre)
                </button>
              </div>

              <textarea
                id="premise"
                rows={7}
                value={premise}
                onChange={handleTextChange}
                placeholder="e.g., A celebrated classical sitar maestro collapses on stage during the Varanasi Ganga Mahotsav while performing with an antique 200-year-old sitar..."
                className="w-full rounded-lg bg-[#090c13] border border-amber-900/40 p-4 text-amber-100 placeholder-slate-600 font-typewriter text-sm focus:outline-none focus:border-amber-500 transition-colors shadow-inner leading-relaxed"
                maxLength={300}
              />

              <div className="flex justify-between text-[11px] font-mono-dossier text-slate-400">
                <span>Minimum 10 characters required</span>
                <span className={premise.length > 280 ? 'text-amber-400 font-bold' : ''}>
                  {premise.length} / 300 Characters
                </span>
              </div>
            </div>

            {/* Right Column (5 cols): Difficulty Tier Selection & Action */}
            <div className="lg:col-span-5 space-y-6 flex flex-col justify-between">
              <div>
                <label className="font-serif-noir text-sm text-slate-200 uppercase tracking-wider font-bold block mb-3">
                  Investigation Complexity Tier
                </label>

                <div className="space-y-3">
                  {/* Easy */}
                  <label
                    onClick={() => handleSelectDifficulty('easy')}
                    className={`relative flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      difficulty === 'easy'
                        ? 'border-emerald-500 bg-emerald-950/20 shadow-md shadow-emerald-500/10'
                        : 'border-slate-800 bg-[#0c1017] hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value="easy"
                      checked={difficulty === 'easy'}
                      onChange={() => {}}
                      className="sr-only"
                    />
                    <div>
                      <span className="font-serif-noir text-sm font-bold text-emerald-400 block">
                        Sub-Inspector Tier [Easy]
                      </span>
                      <span className="font-mono-dossier text-[11px] text-slate-400">
                        3 suspects · 5 clues · 2 hints
                      </span>
                    </div>
                    <span className="font-mono-dossier text-xs text-emerald-400 font-bold">100 Base Pts</span>
                  </label>

                  {/* Medium */}
                  <label
                    onClick={() => handleSelectDifficulty('medium')}
                    className={`relative flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      difficulty === 'medium'
                        ? 'border-amber-500 bg-amber-950/20 shadow-md shadow-amber-500/10'
                        : 'border-slate-800 bg-[#0c1017] hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value="medium"
                      checked={difficulty === 'medium'}
                      onChange={() => {}}
                      className="sr-only"
                    />
                    <div>
                      <span className="font-serif-noir text-sm font-bold text-amber-400 block">
                        Inspector Tier [Medium]
                      </span>
                      <span className="font-mono-dossier text-[11px] text-slate-400">
                        4 suspects · 7 clues · 3 hints
                      </span>
                    </div>
                    <span className="font-mono-dossier text-xs text-amber-400 font-bold">150 Base Pts</span>
                  </label>

                  {/* Hard */}
                  <label
                    onClick={() => handleSelectDifficulty('hard')}
                    className={`relative flex items-center justify-between p-3.5 rounded-lg border cursor-pointer transition-all ${
                      difficulty === 'hard'
                        ? 'border-rose-500 bg-rose-950/20 shadow-md shadow-rose-500/10'
                        : 'border-slate-800 bg-[#0c1017] hover:border-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="difficulty"
                      value="hard"
                      checked={difficulty === 'hard'}
                      onChange={() => {}}
                      className="sr-only"
                    />
                    <div>
                      <span className="font-serif-noir text-sm font-bold text-rose-400 block">
                        Chief Sleuth [Hard]
                      </span>
                      <span className="font-mono-dossier text-[11px] text-slate-400">
                        5 suspects · 9 clues · 3 hints
                      </span>
                    </div>
                    <span className="font-mono-dossier text-xs text-rose-400 font-bold">200 Base Pts</span>
                  </label>
                </div>
              </div>

              {/* Submit Action */}
              <div className="space-y-3 pt-2">
                <button
                  type="submit"
                  disabled={premise.trim().length < 10}
                  className="w-full py-4 rounded bg-amber-500 hover:bg-amber-400 text-slate-950 font-serif-noir font-bold text-sm uppercase tracking-widest transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed shadow-xl shadow-amber-500/25 border border-amber-400/50"
                >
                  Commission Investigation & Enter Room →
                </button>

                <div className="text-center text-xs font-mono-dossier text-slate-500">
                  <span>Fair-Play Certified Investigation</span>
                </div>
              </div>
            </div>
          </div>
        </form>
      )}
    </div>
  );
};

export default CreateMystery;
