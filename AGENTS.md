# AGENTS.md — AI Mystery Room Operational Protocol

## Project Overview
AI Mystery Room is a full-stack AI-driven web application where a user provides a premise and difficulty level (Easy, Medium, Hard). The backend leverages the Gemini API (`@google/genai`) to generate a complete, logically sound, schema-validated whodunit mystery. Players investigate suspects, discover clues, request progressive hints, and submit an accusation. Solution secrecy is strictly preserved server-side until final verdict.

## Fast-Path Context Navigation
- **Stage 1 (Zero-Scan Routing):** Always consult `CONTEXT.md` first to locate the exact target file, component line ranges, and data contracts. Never execute repo-wide directory trees or multi-file exploratory reads.
- **Stage 2 (Deep Surgical Inspection):** Once the target file and line range are identified, read that specific target file before modifying it.
- **Guided Fallback Scan (When Un-indexed):** If a symbol or logic cannot be found in `CONTEXT.md`, perform a targeted search bounded by known modules. Immediately update `CONTEXT.md` with verified line numbers (`#Lxx-Lyy`).
- **Precise Modifications:** Perform surgical changes with minimal footprint and verify with unit/integration tests before completion.

## Tech Stack
- **Frontend:** React 18+ (Vite), React Router v6, Tailwind CSS, Axios
- **Backend:** Node.js (v20+), Express.js (REST JSON API)
- **Database:** MongoDB (Atlas / Mongoose) with TTL indexing
- **AI Engine:** Google Gemini API (`@google/genai`) with structured JSON schema
- **Validation:** Zod (Request schemas + AI output schemas)
- **Security:** Helmet, CORS, Express-Rate-Limit, NanoID (16 chars)
- **Testing:** Vitest / Supertest / Mocked Gemini

## Essential Commands

### Server Development & Run
```bash
cd server && npm run dev          # Start backend with nodemon on port 5000
cd server && npm start            # Start backend in production mode
```

### Client Development & Build
```bash
cd client && npm run dev          # Start Vite dev server on port 5173
cd client && npm run build        # Build React production bundle into dist/
cd client && npm run preview      # Preview production build locally
```

### Full Test Suite
```bash
cd server && npm test             # Run all backend unit and integration tests
cd client && npm test             # Run frontend component tests
```

### Single Test / Subset
```bash
cd server && npx vitest run tests/scoring.test.js
cd server && npx vitest run tests/secrecy.test.js
```

### Lint & Check
```bash
cd server && npm run lint
cd client && npm run lint
```

## Code Style & Standards

```javascript
// ✅ Good - Explicit DTO mapping, strict schema validation, pure scoring
function toPublicCase(caseDoc) {
  return {
    id: caseDoc.publicId,
    title: caseDoc.title,
    difficulty: caseDoc.difficulty,
    story: caseDoc.story,
    suspects: caseDoc.suspects.map(s => ({
      id: s.id,
      name: s.name,
      role: s.role,
      description: s.description,
      alibi: s.alibi
    })),
    clues: caseDoc.clues.map(c => ({
      id: c.id,
      title: c.title,
      location: c.location,
      discovered: caseDoc.progress.discoveredClueIds.includes(c.id),
      text: caseDoc.progress.discoveredClueIds.includes(c.id) ? c.text : undefined
    })),
    status: caseDoc.status
  };
}

// ❌ Bad - Leaking Mongoose raw document or exposing solution fields
app.get('/api/cases/:id', async (req, res) => {
  const c = await Case.findOne({ publicId: req.params.id });
  res.json(c); // DANGEROUS: Leaks solution, culpritId, and unrevealed clues
});
```

## Boundaries & Permissions

- ✅ **Always:**
  - Read `SPEC.md` and `CONTEXT.md` first before writing code.
  - Enforce server-side solution secrecy (`solution`, `pointsTo`, `isKey`, unrevealed clues/hints must never leak).
  - Implement incrementally milestone by milestone (§19) and verify each milestone.
  - Keep `CONTEXT.md` and `docs/TASKS.md` synchronized after structural changes.
  - Notify the user of markdown updates using the standard notification block.
- ⚠️ **Ask First:**
  - Adding external dependencies not listed in `SPEC.md`.
  - Modifying the scoring rubric or API route paths.
  - Git commits or branch modifications.
- 🚫 **Never:**
  - Run mutating or tracking git commands (`git add`, `git commit`, `git push`, etc.) without explicit user permission.
  - Expose solution fields, culprit identity, or undiscovered clue texts to pre-accusation API clients.
  - Hardcode API keys or secrets in source code or commit `.env`.
  - Calculate scores or validate solutions on the frontend.
  - Use emojis in UI action buttons or system menus.

## Continuous Maintenance Protocol
- **Optimal Cadence:** Sync markdown files at milestone completions, ADR additions, and bug resolutions.
- **Mid-Turn Notification:** Emit a structured `> [!NOTE]` callout whenever documentation files change.
