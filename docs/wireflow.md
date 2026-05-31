# Aigentless Tour-Quality Prototype — Wireflow

7 screens, mobile web. Hardcoded fixture data. Demo path runs end-to-end.

Visual language: keep existing (navy serif headings, sans body, off-white bg, illustrated empty states, pill chips).

---

## Fixture data (the spine of the demo)

**Renter input (hardcoded parse)**
> "Quiet enough to study, good light, dog allowed, OCD so in-unit laundry, walk-in shower please."

**Parse output — all are must-haves; grouped by what the system can do about each:**
- ✓ Checked out (data confirms): `pet_friendly`, `in_unit_laundry`
- ⓘ Verify before tour (data missing, ask agent): `walk_in_shower`
- 👁 Check in person (subjective — only the renter can judge): `good_light`, `quiet`

Note: "good light" sits in *check in person*, not *checked out*, because even confirmed window data can't tell you whether the light will feel good to *this* renter. Same for "quiet."

**Layer 1 input**
- Location: Chicago
- Budget: $1,800 / mo
- Bedrooms: 1
- Move-in: Now

**Inventory: 6 units, engineered for the demo**

| # | Name | Rent | Pet | Laundry | Walk-in shower | Match at $1,800 | Match at $1,900 |
|---|---|---|---|---|---|---|---|
| 1 | Maple Hill | $1,850 | ✓ | ✓ | ❓ unknown | — (over budget) | ✓ + verify flag |
| 2 | Lincoln Park 12 | $1,890 | ✓ | ✓ | ✓ | — | ✓ |
| 3 | Greenwich Flats | $1,895 | ✓ | ✓ | ✓ | — | ✓ |
| 4 | Post Chicago | $1,750 | ✗ | ✓ | ✓ | — (no pet) | — (no pet) |
| 5 | Audley Studio | $1,650 | ✓ | ✗ | ✓ | — (no laundry) | — (no laundry) |
| 6 | Ascent Homes | $2,100 | ✓ | ✓ | ✓ | — | — (still over) |

Result: **0 match at $1,800. 3 match at $1,900. Unit #1 has missing data → routes to verify.**

---

## Screen 1 — Intake (one scroll)

```
┌─────────────────────────────────┐
│  12:47                    62 ▼  │
│                                 │
│  Find your next place           │  ← serif H1
│                                 │
│  📍 Where                       │
│  [ Chicago                  ▾ ] │
│                                 │
│  💰 Max rent                    │
│  [ $1,800/mo                ▾ ] │
│                                 │
│  🛏 Bedrooms                    │
│  ( Studio )( 1 )( 2 )( 3 )(4+) │  ← 1 selected
│                                 │
│  📅 Move-in window              │
│  ( Now–2 wks )( 2 wks–1 mo )    │  ← segmented presets, multi-row
│  ( 1–2 mo )( 2+ mo )( Custom )  │
│  → Sep 1 – Oct 15, 2026         │  ← live computed range, caption
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Anything that would rule       │  ← serif H2, same weight as Layer 1
│  a place out?                   │
│  Optional, but we'll use it to  │  ← caption
│  protect your tour.             │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Quiet enough to study,    │ │  ← textarea, 4 lines
│  │ good light, dog allowed,  │ │
│  │ OCD so in-unit laundry,   │ │
│  │ walk-in shower please.    │ │
│  │                      🎤   │ │  ← mic, bottom-right
│  └───────────────────────────┘ │
│                                 │
│  [        Search 8 units    ]   │  ← live count, primary navy
└─────────────────────────────────┘
```

**Why this shape:** the dealbreaker textarea is given equal visual weight to Layer 1 — that *is* the IA bet. Caption explains why it matters without making it feel scary.

**Move-in window:** segmented presets cover ~95% of intent without making the renter pick a specific date they're not sure about. "Custom" opens a date-range picker for the rest. Live caption shows the computed range so the user knows what got committed.

**Audio capture:** mic in bottom-right of the textarea. Tap → "Listening..." pulse → after 3 sec, text appears typed into the field. For prototype: hardcoded transcript (deterministic for demo). If Web Speech API works reliably on the test phone, swap in real speech-to-text — but don't depend on it; the demo can't fail because of a network/permission hiccup.

**Copy locked:**
- H1: `Find your next place`
- Move-in label: `Move-in window`
- Move-in presets: `Now–2 wks` / `2 wks–1 mo` / `1–2 mo` / `2+ mo` / `Custom`
- H2: `Anything that would rule a place out?`
- Caption: `Optional, but we'll use it to protect your tour.`
- Placeholder (greyed when empty): `e.g. dog has to be allowed, in-unit laundry, quiet`
- Mic affordance: subtle pulse on idle, "Listening..." label on tap
- Button: `Search` (no count yet on first load) → `Search 3 units` (after they type, fake live count = 3)

---

## Screen 2 — Parse confirmation (bottom sheet over intake)

Appears as bottom sheet when Search is tapped. Half-height, drag to dismiss.

```
┌─────────────────────────────────┐
│  ▬▬▬                            │  ← drag handle
│                                 │
│  Here's our read on your        │  ← serif H2
│  must-haves                     │
│                                 │
│  ✓ Checked out                  │  ← small caps label, green tick
│  • Pet-friendly                 │
│  • In-unit laundry              │
│                                 │
│  ⓘ Verify before tour           │  ← tan/amber
│  • Walk-in shower               │
│   We'll email the agent to      │  ← caption
│   confirm before you tour.      │
│                                 │
│  👁 Check in person             │  ← accent color
│  • Good light                   │
│  • Quiet                        │
│   We'll add these to your tour  │  ← caption
│   checklist as reminders.       │
│                                 │
│  [  Looks right — search  ]     │  ← primary
│  [  Edit                  ]     │  ← secondary, ghost
└─────────────────────────────────┘
```

**Why a sheet, not a screen:** doesn't break the flow — feels like the app pausing to acknowledge, not a wizard step.

**Why these labels:** every line in the dealbreaker is a must-have by definition (the renter typed it as a thing that would rule a place out). The three groups describe **what the system will do about each**, not how important they are. That's the IA bet — the system reports its actions, not the renter's preferences.

**Copy locked:**
- H2: `Here's our read on your must-haves`
- Group 1: `✓ Checked out`
- Group 2: `ⓘ Verify before tour` + caption `We'll email the agent to confirm before you tour.`
- Group 3: `👁 Check in person` + caption `We'll add these to your tour checklist as reminders.`
- Primary: `Looks right — search`
- Secondary: `Edit`

**Color logic (resolved):** each group gets its own accent — green tick (confirmed), tan/amber (pending verification), accent color (in-person). Carries through to the chips on Screen 4 and the groupings on Screen 6, so the renter learns the visual language once.

---

## Screen 3 — 0 results + open-up trade

Replaces existing results screen.

```
┌─────────────────────────────────┐
│  12:43                    63 ▼  │
│                                 │
│  [🔍 Chicago         ] [Filter] │
│  0 floorplans                   │  ← existing style
│  ─────────────────────────────  │
│                                 │
│      ┌──────────────────┐       │
│      │   [illustration] │       │  ← reuse existing empty-state art
│      └──────────────────┘       │
│                                 │
│  Nothing matches in your        │  ← serif, centered
│  budget — yet                   │
│                                 │
│  ┌───────────────────────────┐ │
│  │ Stretch your budget by    │ │  ← card, off-white
│  │ $100/mo and 3 places      │ │
│  │ match all your must-haves.│ │
│  │                           │ │
│  │ ✓ Pet-friendly            │ │  ← chips, small
│  │ ✓ In-unit laundry         │ │
│  │ ✓ Walk-in shower          │ │
│  │ → protected               │ │
│  │                           │ │
│  │ [  See 3 units at $1,900 ]│ │  ← primary
│  └───────────────────────────┘ │
│                                 │
│  Or edit your search            │  ← inline text link
│                                 │
└─────────────────────────────────┘
```

**Why this shape:** the trade is *one* card with *one* CTA. Numbers are concrete ($100, 3 units). The "→ protected" line is the most important micro-copy on the whole prototype — it tells the user the system is on their side.

**Copy locked:**
- Headline: `Nothing matches in your budget — yet`
- Card body: `Stretch your budget by $100/mo and 3 places match all your must-haves.`
- Footer of card: `→ Your must-haves stay protected`
- CTA: `See 3 units at $1,900`
- Inline link: `Or edit your search`

**Animation note:** when CTA tapped, the budget input visibly ticks from $1,800 → $1,900 in the header so the user sees what the trade did.

---

## Screen 4 — Results list (post-open-up)

```
┌─────────────────────────────────┐
│  12:45                    62 ▼  │
│                                 │
│  [🔍 Chicago         ] [Filter] │
│  3 floorplans · $1,900 max      │  ← updated count + budget
│  ─────────────────────────────  │
│  Must-haves                     │  ← summary strip, small caps
│  🐾 Pet · 🫧 Laundry · 🚿 Shower│
│  + 👁 light, quiet      [Edit]  │  ← Edit reopens parse sheet
│  ─────────────────────────────  │
│                                 │
│  ┌───────────────────────────┐ │
│  │      [unit image]         │ │
│  │                           │ │
│  │ Maple Hill                │ │  ← serif H3
│  │ 2740 N Hampden Ct         │ │
│  │ 🛏 1  🛁 1  ⬚ 720 ft²    │ │
│  │                           │ │
│  │ ✓ Pet  ✓ Laundry  ⓘ 1 to │ │  ← chips, last one tan/amber
│  │   verify                  │ │
│  └───────────────────────────┘ │
│                                 │
│  ┌───────────────────────────┐ │
│  │      [unit image]         │ │
│  │ Lincoln Park 12           │ │
│  │ 853 W Blackhawk St        │ │
│  │ 🛏 1  🛁 1  ⬚ 680 ft²    │ │
│  │ ✓ Pet ✓ Laundry ✓ Shower │ │  ← all green
│  └───────────────────────────┘ │
│                                 │
│  [ Greenwich Flats card... ]   │
│                                 │
└─────────────────────────────────┘
```

**Why this shape:** existing card layout preserved; the *only* addition is the chip row showing must-have status. That's the redesign in one visual move — must-haves are now first-class on the card, not buried in details.

**Must-haves summary strip:** persistent reminder of what's shaping the results, with [Edit] tapping back into the parse sheet (Screen 2). Without this, the renter has no way to refine the dealbreaker after the fact — they'd have to start a new search. Visually compact (2 lines max) so it doesn't compete with the listings.

**Copy locked:**
- Subhead: `3 floorplans · $1,900 max` (the "$1,900 max" tag is new — reminds them the budget was stretched)
- Summary strip label: `Must-haves`
- Summary strip format: confirmed/verify items as chips, "Check in person" items prefixed with 👁 on a second line
- Edit affordance: text link `Edit`, right-aligned
- Chip when confirmed: `✓ Pet` / `✓ Laundry` / `✓ Shower`
- Chip when unknown: `ⓘ 1 to verify` (tan/amber, not red — it's an opportunity, not an error)

**Interaction:**
- Tap Maple Hill card → Screen 5
- Tap [Edit] in summary strip → re-opens Screen 2 sheet, prepopulated with current parse, editable

---

## Screen 5 — Unit detail + verify-before-tour

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│      [hero image carousel]      │
│                                 │
│  Maple Hill                     │  ← serif H1
│  2740 N Hampden Ct · Chicago    │
│  $1,850/mo · 1 bd · 1 ba · 720  │
│                                 │
│  ─────────────────────────────  │
│  YOUR MUST-HAVES                │  ← small caps label
│                                 │
│  ✓ Pet-friendly                 │
│    Confirmed from listing       │  ← caption
│                                 │
│  ✓ In-unit laundry              │
│    Confirmed from listing       │
│                                 │
│  ⓘ Walk-in shower               │  ← tan icon
│    Not in our database          │
│    [ Email agent to confirm ]   │  ← inline button
│                                 │
│  ─────────────────────────────  │
│  Details, photos, neighborhood  │  ← collapsed sections
│  ...                            │
│                                 │
│  ┌───────────────────────────┐ │
│  │  [  Book a tour       ]   │ │  ← primary, sticky bottom
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

**Interaction: tap "Email agent to confirm" → bottom sheet**

```
┌─────────────────────────────────┐
│  ▬▬▬                            │  ← drag handle
│                                 │
│  Ask Maple Hill                 │  ← serif H2
│  We'll send this on your behalf │  ← caption
│                                 │
│  ┌───────────────────────────┐ │
│  │ From  wei@aigentless.com  │ │  ← email card
│  │ To    leasing@maplehill   │ │
│  │ Subj  Quick question      │ │
│  │       before touring      │ │
│  │ ─────────────────────     │ │
│  │ Hi,                       │ │
│  │                           │ │
│  │ I'm interested in touring │ │
│  │ Maple Hill at 2740 N      │ │
│  │ Hampden Ct. Could you     │ │
│  │ confirm the unit has a    │ │
│  │ walk-in shower?           │ │
│  │                           │ │
│  │ Thanks,                   │ │
│  │ Wei                       │ │
│  │                           │ │
│  │            [Edit message] │ │
│  └───────────────────────────┘ │
│                                 │
│  Replies come to your           │  ← footnote
│  Aigentless inbox.              │
│                                 │
│  [  Send                  ]     │  ← primary
│  [  Cancel                ]     │  ← ghost
└─────────────────────────────────┘
```

1. Sheet appears with email drafted (subject, body pre-filled based on missing attribute).
2. User can tap [Edit message] to modify body inline (single text field, no full email composer).
3. Tap Send → sheet dismisses with a small confirm animation.
4. Toast on unit detail: `Sent. Agent usually replies in under an hour.`
5. After 4s (fake), the row animates to:
   `✓ Walk-in shower — Confirmed by Maple Hill mgmt, just now`
6. Book tour button styling unchanged (it was always tappable, but now the user *trusts* the tour).

**Why a bottom sheet with a draft, not a one-tap "Send" button:** the renter sees exactly what's going out under their name, can refine the question, and learns the system is acting on their behalf — not silently. Also opens the door to the in-app inbox model (replies route back into Aigentless, not the renter's personal email) — that's the value Aigentless owns as the autonomous-touring middleman.

**Production note (not for prototype):** in production, sending happens via a transactional email service (Resend on Vercel, ~1–2 weeks of infra). Replies hit a per-conversation reply-to address that routes back into the user's in-app inbox. The "From" can be either the user's signed-in email or an Aigentless-issued alias — both work; recommend Aigentless alias so the company owns the conversation thread with the property.

**Copy locked:**
- Section label: `YOUR MUST-HAVES`
- Verified caption: `Confirmed from listing`
- Unknown row: `Not in our database` + `Email agent to confirm`
- Sheet H2: `Ask Maple Hill`
- Sheet caption: `We'll send this on your behalf`
- Sheet footnote: `Replies come to your Aigentless inbox.`
- Sheet primary: `Send`
- Sheet secondary: `Cancel`
- Sheet edit affordance: `Edit message`
- Toast after send: `Sent. Agent usually replies in under an hour.`
- Resolved row: `Confirmed by Maple Hill mgmt, just now`
- CTA: `Book a tour`

---

## Screen 6 — Tour checklist (two states, same screen)

### State A: Pre-tour preview (after Book a tour)

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│  Your tour checklist            │  ← serif H1
│  Maple Hill · Tomorrow 6:00 PM  │
│                                 │
│  Built from your must-haves.    │  ← body copy
│                                 │
│  ─────────────────────────────  │
│  ✓ HANDLED BEFORE YOUR TOUR     │  ← green label
│  • Walk-in shower               │
│    Confirmed by Maple Hill mgmt │  ← caption
│                                 │
│  ─────────────────────────────  │
│  👁 ON YOUR LIST TO CHECK       │  ← accent label
│  ○ Good light                   │
│  ○ Quiet                        │
│                                 │
│  ─────────────────────────────  │
│  WE ALSO RECOMMEND              │  ← neutral label
│  ○ Floor plan matches listing   │
│  ○ Finish quality               │
│  ○ Water pressure               │
│                                 │
│  ┌───────────────────────────┐ │
│  │ [  I'm here — start    ]  │ │  ← primary, sticky
│  └───────────────────────────┘ │
└─────────────────────────────────┘
```

### State B: On-tour (interactive)

```
┌─────────────────────────────────┐
│  ←                Tour: Maple   │
│                                 │
│  2 of 5 checked                 │  ← progress (5 = renter's 2 + 3 generic)
│  ████████░░░░░░░░░░░░░░░░       │
│                                 │
│  ─────────────────────────────  │
│  👁 ON YOUR LIST TO CHECK       │
│                                 │
│  Good light                     │
│  ✓ 👎  "darker than photos"     │  ← captured w/ note
│                                 │
│  Quiet                          │
│  ✓ 👍                            │
│                                 │
│  ─────────────────────────────  │
│  WE ALSO RECOMMEND              │
│                                 │
│  Floor plan matches listing     │
│  [👍]  [👎]  [skip]    + note  │
│                                 │
│  Finish quality                 │
│  [👍]  [👎]  [skip]    + note  │
│                                 │
│  Water pressure                 │
│  [👍]  [👎]  [skip]    + note  │
│                                 │
└─────────────────────────────────┘
```

**Interaction:**
- Each row: tap 👍, 👎, or skip → row collapses to captured state
- Note field: tap "+ note" → inline single-line input (one tap to expand, not a modal)
- On the 5th tap, auto-route to Screen 7 (no "Save" button — the saving *is* the tapping)
- "Handled before your tour" section is not interactive (already resolved)

**Why this structure:** the renter's must-haves get their own section at the top, visibly separated from generic tour advice. The "Handled before your tour" section at the top is the loop closing visibly — they see what the verify-before-tour step accomplished.

**Copy locked:**
- H1: `Your tour checklist`
- Subhead: `Maple Hill · Tomorrow 6:00 PM`
- Intro: `Built from your must-haves.`
- Labels: `✓ HANDLED BEFORE YOUR TOUR` / `👁 ON YOUR LIST TO CHECK` / `WE ALSO RECOMMEND`
- Pre-tour CTA: `I'm here — start`
- Progress: `N of 5 checked`

---

## Screen 7 — Profile memory (per property)

Auto-routed to after final capture tap. Confetti micro-moment optional.

```
┌─────────────────────────────────┐
│  ←                              │
│                                 │
│  Saved to your tour log         │  ← serif H1
│                                 │
│      [small unit thumbnail]     │
│  Maple Hill                     │
│  Toured today, 6:14 PM          │
│                                 │
│  ─────────────────────────────  │
│  WHAT YOU NOTICED               │
│                                 │
│  ✓ Walk-in shower               │  ← handled pre-tour
│      Confirmed by mgmt          │
│  👎 Good light                  │  ← your must-have
│      "north-facing, dim by 4"   │
│  👍 Quiet                       │  ← your must-have
│  👍 Floor plan matches          │
│  👍 Finish quality              │
│  👎 Water pressure              │
│      "low in master bath"       │
│                                 │
│  ─────────────────────────────  │
│                                 │
│  Next time you compare units,   │  ← system message
│  we'll surface what you cared   │
│  about and what fell short.     │
│                                 │
│  [  Back to results       ]     │  ← primary
│  [  Compare tours         ]     │  ← secondary, ghost
└─────────────────────────────────┘
```

**Why this screen:** proves the loop closes. The renter sees their voice in the system days/weeks later. Also the seed for the PMC data story without needing a separate screen.

**Copy locked:**
- H1: `Saved to your tour log`
- Section label: `WHAT YOU NOTICED`
- System message: `Next time you compare units, we'll surface what you cared about and what fell short.`
- Primary: `Back to results`
- Secondary: `Compare tours`

---

## Demo voiceover (60 sec, for recording the phone walkthrough)

> "I'm looking for a place in Chicago — 1 bedroom, around $1,800. But I have non-negotiables: my dog has to be allowed, I need in-unit laundry, and a walk-in shower."
>
> *[types into dealbreaker → tap Search]*
>
> "Aigentless reads that and shows me what it heard before searching — so I know it understood."
>
> *[tap Looks right]*
>
> "Turns out nothing matches at my budget. Instead of a dead end, it offers a real trade: $100 more per month gets me 3 places that hit all my must-haves. My must-haves stay protected."
>
> *[tap See 3 units → tap Maple Hill]*
>
> "This unit has pet and laundry confirmed — but no data on walk-in shower. I can email the agent and get it verified before I burn a tour on it."
>
> *[tap Email agent → wait for confirm → tap Book a tour]*
>
> "When I arrive, the checklist starts with my must-haves — good light, quiet — plus a few practical checks. The walk-in shower is already confirmed at the top, so I don't waste tour time on it."
>
> *[tap through capture]*
>
> "And everything I noticed saves to that property. So next week when I'm comparing five tours, I won't forget that this one was dim by 4 PM."

---

## What's NOT here (and why)

- **PMC dashboard screen** — cut. Screen 7 + this line in the voiceover tells that story. A separate screen for stakeholders not in the test would be wasted prototype budget.
- **Prioritize / narrow states** of the result-set engine — out of scope. Open-up alone makes the point.
- **Real NLP** — parse is a hardcoded match-this-string-return-this-JSON.
- **Other listings** — we only build Maple Hill's detail screen in full. The other two cards are tappable but go to a "coming soon" toast. (Saves ~1 hr.)

---

## Open red-line questions

1. **Screen 5 verify button copy** — `Email agent to confirm` vs. `Ask the agent` vs. `Verify before tour`. I picked the most explicit one. Open to changes.
2. **Screen 6 "We also recommend" section** — should the system suggest generic items (floor plan / finish / water pressure), or stay strict to only what the renter typed? Strict = stronger "we listened to YOU" beat but a 2-item checklist feels thin on tour. Current: hybrid with clear separation.
3. **Screen 6 "Handled before your tour" section** — keep it visible (shows the loop closing) or collapse by default (cleaner)? Current: visible.
4. ~~Confetti on Screen 7?~~ **Resolved: yes, confetti** (subtle, brand-color particles, ~1.5 sec). Plus a scale-in on the saved card.
