# Aigentless — Tour-Quality Prototype

Mobile-web prototype for an autonomous-touring redesign. The flow proves a single bet: **everything a renter types is a must-have, and the system reports what it did about each one** (checked / verify before tour / check in person).

See [`docs/wireflow.md`](./docs/wireflow.md) for screen-by-screen spec, copy, and the demo path.

## Run locally

```bash
npm run dev
```

Open http://localhost:3000 on desktop, or the `Network:` URL printed in the terminal on your phone (same Wi-Fi).

## Demo path

1. Tap mic on intake → fake transcription types in the dealbreaker
2. Tap **Search** → parse confirmation sheet
3. Tap **Looks right** → 0 results screen
4. Tap **See 3 units at $1,900** → results list (Maple Hill flagged "1 to verify")
5. Tap **Maple Hill** → unit detail
6. Tap **Email agent to confirm** → bottom-sheet email draft → **Send** → 4s later row resolves
7. Tap **Book a tour** → checklist preview
8. Tap **I'm here — start** → tap thumbs / skip through 5 items → auto-routes to memory
9. Memory screen confettis in with your captures saved per-property

## Deploy to Vercel

```bash
npx vercel       # follow prompts (interactive login + project link)
npx vercel --prod
```

## Project structure

```
src/
  app/
    page.tsx                 Screen 1 — Intake
    results/page.tsx         Screen 3 + 4 — Zero results / Results list
    units/[id]/page.tsx      Screen 5 — Unit detail
    tour/[id]/page.tsx       Screen 6 — Tour checklist (pre/on)
    memory/[id]/page.tsx     Screen 7 — Saved tour log
  components/
    parse-sheet.tsx          Screen 2 — Bottom sheet
    email-sheet.tsx          Email draft bottom sheet
    bottom-sheet.tsx         Generic sheet primitive
    toast.tsx                Top-of-screen toast
  lib/
    fixtures.ts              Hardcoded units + parse + checklist
    store.ts                 Zustand session-storage state
```

## What's mocked

- Parse: hardcoded for the demo input (any non-empty text triggers it).
- Agent email: UI-only. Production note in `docs/wireflow.md` Screen 5.
- Audio capture: fake transcription animates the demo input into the textarea.
- Fixture set engineered so 0 match at $1,800 / 3 match at $1,900.
