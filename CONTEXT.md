# CONTEXT.md — Architecture & File Registry

> **Notice to AI Agents:** Read this file first. Do NOT run full directory scans, global grep searches, or multi-file discovery loops. Use the file registry below with exact line numbers to navigate directly to target code blocks. Only open source files when surgical editing requires line-exact ranges.

---

## 1. System Architecture & High-Level Design
- **Core Purpose:** AI Mystery Room generates dynamic, solvable detective whodunits based on user-supplied premises and difficulty levels. It manages an interactive investigation loop (discover clues, request hints, accuse suspects) with guaranteed zero client-side solution leakage.
- **Architecture Pattern:** Decoupled Client-Server (SPA + REST JSON API)
- **Data Flow:**
  - Mystery Creation: `Client (/create) -> POST /api/cases (server/src/routes/cases.routes.js#L26-L31) -> cases.controller.js#L4-L11 -> case.service.js#L140-L177 -> gemini.service.js#L46-L140 -> mystery.validator.js#L12-L107 -> Case.js#L41-L89 -> toPublicCase()#L10-L70 -> Client (/case/:id)`
  - Clue Discovery: `Client -> POST /api/cases/:id/clues/:clueId/discover (server/src/routes/cases.routes.js#L37) -> cases.controller.js#L23-L30 -> case.service.js#L191-L229 -> Client`
  - Hint Request: `Client -> POST /api/cases/:id/hints (server/src/routes/cases.routes.js#L40) -> cases.controller.js#L32-L39 -> case.service.js#L234-L280 -> Client`
  - Accusation: `Client -> POST /api/cases/:id/accuse (server/src/routes/cases.routes.js#L43-L47) -> cases.controller.js#L41-L49 -> case.service.js#L285-L335 -> scoring.service.js#L44-L72 -> Client (/case/:id/result)`

---

## 2. File-Level Architecture Registry (Mandatory Line-Number Anchors)

| File Path & Anchor | Line Range | Role & Responsibility | Key Classes / Functions | Invariants & Constraints |
| :--- | :--- | :--- | :--- | :--- |
| `server/src/index.js` | `L1–L36` | Bootstrap & server lifecycle | `startServer()` | Graceful shutdown on `SIGINT`/`SIGTERM`. |
| `server/src/app.js` | `L1–L72` | Express application & middleware setup | `app` | Rate limiting, Helmet, CORS, 10kb body limit. |
| `server/src/config/env.js` | `L1–L23` | Zod-validated environment config | `env` | Fail-fast boot validation. |
| `server/src/config/db.js` | `L1–L27` | MongoDB connection & disconnection | `connectDB()`, `disconnectDB()` | Clean pool teardown. |
| `server/src/models/Case.js` | `L1–L89` | Mongoose Case schema with TTL | `Case` | `solution` and key clue fields have `select: false`. |
| `server/src/services/scoring.service.js` | `L1–L82` | Pure math scoring calculation | `calculateFinalScore()`, `calculateScorePreview()` | Pure functions, zero HTTP/DB dependencies. |
| `server/src/services/mystery.validator.js` | `L1–L155` | Deterministic logic validator | `validateMystery()` | Validates counts, single culprit, red herrings, secrecy. |
| `server/src/services/gemini.service.js` | `L1–L295` | Google Gemini AI integration & Multi-Genre Mystery Engine | `generateMysteryWithAI()`, `buildSystemInstruction()` | Multi-genre prompt prohibiting cookie-cutter business patterns; organic roles & motives. |
| `server/src/services/case.service.js` | `L1–L306` | Domain orchestration & DTO mappers | `toPublicCase()`, `toResult()`, `createCase()`, `discoverClue()`, `submitAccusation()` | Zero secret leakage before completed status. |
| `server/src/controllers/cases.controller.js` | `L1–L59` | REST controllers for case routes | `createCase()`, `getCase()`, `discoverClue()`, `requestHint()`, `submitAccusation()`, `getResult()` | Async handler wrapping with standard envelope. |
| `server/src/routes/cases.routes.js` | `L1–L48` | Express router for cases | `router` | 5 req/10m rate limit on `POST /cases`. |
| `server/src/routes/health.routes.js` | `L1–L15` | Health check endpoint | `router.get('/health')` | Returns DB status, uptime, and ok status. |
| `server/src/middleware/errorHandler.js` | `L1–L64` | Central error handling | `errorHandler()` | Standard JSON error envelope (§9.0). |
| `server/src/middleware/validate.js` | `L1–L11` | Zod request validation middleware | `validateBody()` | Validates and sanitizes request payloads. |
| `client/src/App.jsx` | `L1–L36` | SPA route tree & application shell | `App()` | Wraps routes in ErrorBoundary & CaseProvider. |
| `client/src/api/client.js` | `L1–L50` | Axios API client & error normalizer | `apiService` | 60s timeout for generation, interceptors. |
| `client/src/context/CaseContext.jsx` | `L1–L123` | Case state & localStorage synchronization | `CaseProvider()`, `useCase()` | Manages investigation progress & active ID. |
| `client/src/pages/Home.jsx` | `L1–L165` | Precinct entrance & case initiation | `Home()` | Manila dossier cards, case directive styling. |
| `client/src/pages/CreateMystery.jsx` | `L1–L350` | Case Dispatch & Multi-Genre Selection Matrix | `CreateMystery()` | Non-business genre chips (Arts, Academia, Sports, Heritage, Medical, Transit, Culinary). |
| `client/src/pages/InvestigationRoom.jsx` | `L1–L540` | SIT Crime Scene, Timeline & Interrogation Dossier | `InvestigationRoom()` | Balanced 6-col lower stage, auto-scroll to Know the Suspect on clue completion. |
| `client/src/components/ConnectingBoard.jsx` | `L1–L480` | Crime Wall Evidence Connecting Board | `ConnectingBoard()` | Geometric forensic constellation web figure, polygon seal, Know the Suspect banner. |
| `client/src/components/SuspectMugshot.jsx` | `L1–L80` | Realistic suspect mugshot polaroid | `SuspectMugshot()` | 1:1 square aspect ratio (`aspect-square`), centered face framing (`object-center`), and stacked multi-line name + role badge preventing text truncation/overlap. |
| `client/src/components/EvidenceThumbnail.jsx` | `L1–L175` | Realistic forensic evidence artifact visual | `EvidenceThumbnail()` | WhatsApp chat, CCTV monitor, CDR tower log, UPI slip, Crime photo. |
| `client/src/utils/suspectImages.js` | `L1–L190` | 100% Synthetic AI-Generated Indian Character Mugshot Bank | `getSuspectPortrait()`, `isSuspectFemale()` | Purely synthetic, fictional AI portraits in `client/public/portraits/` (zero real human likenesses), with stateful case rotation. |
| `client/src/components/EvidenceModal.jsx` | `L1–L190` | Realistic forensic evidence viewer | `EvidenceModal()` | WhatsApp chat, CCTV footage, CDR tower log, UPI slips. |
| `client/src/pages/Accusation.jsx` | `L1–L210` | Formal indictment & interrogation lineup | `Accusation()` | Suspect lineup in responsive grid (`sm:grid-cols-2 xl:grid-cols-3`) with prime suspect stamp and evidence docket. |
| `client/src/pages/Results.jsx` | `L1–L281` | Final verdict & detective ranking | `Results()` | Sealed vault reveal, rank badges, score ledger. |
| `client/src/components/Navbar.jsx` | `L1–L123` | Top navigation & soundscape control | `Navbar()` | Procedural audio toggle, docket stage tracker. |
| `client/src/components/DetectiveNotebook.jsx` | `L1–L152` | Interactive detective field journal | `DetectiveNotebook()` | Suspect triage tracker with portrait icons, auto-saved scratchpad. |
| `client/src/utils/sound.js` | `L1–L180` | Procedural Web Audio API soundscape | `soundEngine` | Typewriter, stamps, clues, chords, clock tick. |
| `client/src/components/ErrorBoundary.jsx` | `L1–L51` | React global error boundary | `ErrorBoundary` | Reload scene or precinct return fallback. |

---

## 3. Component Relationships & Data Contracts
- **Primary Data Models:**
  - `Case` (`server/src/models/Case.js#L41-L89`): Stores `publicId`, `premise`, `difficulty`, `status`, `title`, `story`, `suspects`, `clues`, `hints`, `solution` (`select: false`), `progress`, `accusation`, `score`, and `meta`.
  - `PublicCaseDTO` (`server/src/services/case.service.js#L10-L70`): Strips `solution`, `pointsTo`, `isKey`, and unrevealed texts.
  - `ResultDTO` (`server/src/services/case.service.js#L75-L135`): Exposes verdict, culprit, motive, method, opportunity, key clues, and score.
- **Difficulty Matrix:**
  - Easy: 3 suspects, 5 clues, 2 hints, 100 base pts, max 125 pts (`server/src/services/scoring.service.js#L2-L10`)
  - Medium: 4 suspects, 7 clues, 3 hints, 150 base pts, max 185 pts (`server/src/services/scoring.service.js#L11-L19`)
  - Hard: 5 suspects, 9 clues, 3 hints, 200 base pts, max 245 pts (`server/src/services/scoring.service.js#L20-L28`)

---

## 4. Current State & Active Milestone
- **Active Focus:** Milestone 14–15 (Production & Deployment Readiness).
- **Recent Refactors:**
  - Transitioned all suspect portraits to a **100% synthetic AI-generated character bank** stored in [`client/public/portraits/`](file:///c:/Users/nikhi/Downloads/AI_Mystery_Room/client/public/portraits). Guaranteed zero real persons or likenesses used.
  - Eliminated half-face cropping on suspect polaroids: transitioned `SuspectMugshot.jsx` from landscape height-constrained box (`h-44 sm:h-48`) to 1:1 `aspect-square` with `object-center`.
  - Stacked suspect name and role badge onto separate lines with zero truncation (`truncate` removed), preventing badge collision.
  - Standardized root directory structure, purged all verification media, and updated `.gitignore`.
  - Validated with 23 server unit & integration tests and client test suite.
