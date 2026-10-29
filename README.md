# AI Mystery Room 🔍🎭

> An AI-driven interactive procedural whodunit where players investigate suspects, discover clues, request progressive hints, and submit an accusation. Solution secrecy is guaranteed server-side until the final verdict.

---

## 🌟 Highlights & Architecture

- **Multi-Genre Mystery Generation:** Powered by **Google Gemini** (`@google/genai`) generating airtight, logically sound whodunits across diverse genres (Arts & Classical Heritage, Academia & Scientific Research, Sports & Competitions, Medicine & Surgery, Locked Transit, and Plantations) across 3 difficulty tiers (Easy, Medium, Hard).
- **Interactive Evidence Connecting Board:** Detective corkboard equipped with procedural SVG red yarn links connecting suspect pins to evidence pins, hover elevation, and a geometric constellation web with an active suspect dossier.
- **Realistic Forensic Evidence Artifacts:** Authentic crime artifacts including encrypted WhatsApp transcripts, CCTV monitor frames, CDR cellular tower triangulation dockets, UPI bank transaction receipts, and sealed forensic laboratory reports.
- **Full-Face Indian Model Suspect Lineup:** Curated, case-scoped photographic portraits of authentic Indian models with dynamic 1:1 square framing (`aspect-square` with `crop=faces`), seed shuffling, and stateful rotation preventing face repetition across consecutive cases.
- **Interactive Interrogation & Crime Scene Timeline:** "Know the Suspect" interrogation station with recorded Section 161 CrPC statements, connected evidence tallies, and crime scene chronology.
- **Server-Enforced Solution Secrecy:** Culprit identities, key clues, motives, and unrevealed hints are strictly stripped via explicit DTO mapping (`toPublicCase`) and Mongoose `select: false`.
- **Pure Mathematical Scoring Engine:** Backend scoring awarding base points, clue discovery bonuses (+5 pts), hint deductions (-10 pts), and detective ranking certificates.
- **Procedural Soundscape:** Web Audio API procedural sound engine with typewriter clatter, police rubber stamps, metallic locks, and atmospheric ambient chords.
- **State Persistence & Resume:** Cases are persisted in MongoDB with automated TTL expiration (7 days).

---

## 📐 Difficulty Matrix

| Tier | Suspects | Clues | Hints | Base Points | Max Score |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Easy (Sub-Inspector)** | 3 | 5 | 2 | 100 | 125 |
| **Medium (Inspector)** | 4 | 7 (1 Red Herring) | 3 | 150 | 185 |
| **Hard (SIT Head Sleuth)** | 5 | 9 (2 Red Herrings) | 3 | 200 | 245 |

---

## 📂 Project Architecture

```
AI_Mystery_Room/
├── client/                     # React 18 + Vite SPA Frontend
│   ├── src/
│   │   ├── api/                # Axios client with standardized envelopes
│   │   ├── components/         # ConnectingBoard, SuspectMugshot, EvidenceThumbnail, etc.
│   │   ├── context/            # CaseContext (investigation state management)
│   │   ├── pages/              # Home, CreateMystery, InvestigationRoom, Accusation, Results
│   │   └── utils/              # SoundEngine, suspectImages, formatting helpers
│   └── tests/                  # Frontend component tests
├── server/                     # Node.js + Express REST API Backend
│   ├── src/
│   │   ├── config/             # Environment & MongoDB connection
│   │   ├── controllers/        # Cases REST controllers
│   │   ├── middleware/         # Zod validation & central error handlers
│   │   ├── models/             # Mongoose Case model with TTL indexing
│   │   ├── routes/             # Cases & Health API routes
│   │   └── services/           # Gemini AI service, case service, scoring service, validator
│   └── tests/                  # Backend unit & integration test suites
├── .gitignore                  # Production Git ignore rules
├── AGENTS.md                   # Operational guardrails & agent protocol
├── CONTEXT.md                  # File-level architecture registry
├── README.md                   # Project documentation
└── spec.md                     # Complete application specification
```

---

## 🛠️ Tech Stack

### Frontend (`client/`)
- **React 18+** with **Vite**
- **Tailwind CSS v4** for noir detective aesthetics
- **React Router v6** for multi-stage case navigation
- **Axios** with response interceptors and standardized envelopes
- **Web Audio API** for procedural sound effects
- **Vitest** for component testing

### Backend (`server/`)
- **Node.js (LTS v20+)** & **Express**
- **MongoDB Atlas** with **Mongoose** (TTL indexed)
- **@google/genai** (Google Gemini API) with structured JSON schemas
- **Zod** for API request and AI output schema validation
- **Security:** `helmet`, `cors`, `express-rate-limit`, `nanoid`
- **Vitest** & **Supertest** for automated test suites

---

## 🚀 Quickstart Guide

### Prerequisites
- Node.js ≥ 20
- MongoDB instance (local or Atlas URI)
- Google Gemini API key

### 1. Environment Configuration

#### Backend (`server/.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/ai_mystery_room
GEMINI_API_KEY=your_gemini_api_key_here
GEMINI_MODEL=gemini-2.5-flash
CLIENT_URL=http://localhost:5173
AI_TIMEOUT_MS=45000
AI_MAX_RETRIES=2
AI_VERIFY=false
AI_DAILY_CAP=500
CASE_TTL_DAYS=7
LOG_LEVEL=info
```

#### Frontend (`client/.env`):
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 2. Install & Run

```bash
# Start Backend
cd server
npm install
npm run dev

# Start Frontend (in a separate terminal)
cd client
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🧪 Test Suite

```bash
# Run all server tests (Scoring, Secrecy, Validation, Health)
cd server
npm test

# Run frontend tests
cd client
npm test
```

### Full Test Verification
- **Server:** 23 tests passing (`tests/scoring.test.js`, `tests/mystery.validator.test.js`, `tests/secrecy.test.js`, `tests/health.test.js`).
- **Client:** Component tests passing with Vite test runner.

---

## 🔒 Security & Solution Secrecy Guarantees
- Pre-accusation API endpoints **never** transmit:
  - `solution.culpritId`, `solution.explanation`, `solution.motive`, `solution.method`
  - `clues[].pointsTo`, `clues[].isKey`, `clues[].significance`
  - Clue text for undiscovered clues
  - Hint text for unrevealed hints
- Double-accusation race conditions are prevented with atomic Mongoose conditional updates (`{ status: 'active' }`).
- Rate limiting enforces 5 mystery creations per 10 minutes per IP to safeguard AI quota.

---

## 📜 License
ISC
