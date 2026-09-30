# KBC SHIFT

**From personalized banking to situational banking.**

Hackathon proof of concept for KBC.

---

## Description

**Copy-paste ready for the submission form (“Give a description of your solution”):**

KBC SHIFT is a situational personalization engine for banking. Instead of building one-off features or permanently personalized dashboards, SHIFT detects meaningful life changes from combinations of customer signals, proposes a situation hypothesis, and asks the customer to confirm. Only after confirmation does the engine select existing trusted KBC capabilities from a reusable library and temporarily reorganise the banking experience around what matters now.

If action is not useful, the engine stays quiet - personalization does not mean constantly interrupting the customer.

The hero demo follows Emma (Moving): rental deposit, IKEA, Brico and Cambio form a pattern → Moving at 91% confidence → customer confirms → Standing orders, Cashflow, Home setup and Moving day are selected → temporary Moving Mode with real actions (e.g. pause old rent). Noah (First job) and Quiet Mode show that the same engine can produce different outcomes - or no outcome - without building separate products for each life event.

This scales to 2.3M+ customers through one engine, one capability library, and many situation combinations - not 2.3M custom experiences.

---

## In short

| | |
| --- | --- |
| **Problem** | Banks often personalize with static segments or isolated features. Customers in a life change need the right capabilities *now*, across products. |
| **Solution** | A reusable engine: signals → situation → confirmation → capability selection → temporary experience (or Quiet). |
| **Hero example** | Emma → Moving Mode |
| **Also shows** | Noah → First job · Quiet when no action is useful |
| **Scale** | One engine · one capability library · many situations · different temporary experiences |

---

## How it works

```
Signals
  → Situation hypothesis
    → Customer confirmation
    → Is action useful?
       ├─ Yes → Select capabilities → Temporary experience
       └─ No  → Quiet Mode
```

1. **Signals** — Several events together form a pattern (not one transaction alone).
2. **Hypothesis** — KBC proposes a situation; the customer remains the source of truth.
3. **Confirmation** — Nothing changes until the customer confirms.
4. **Capabilities** — Existing banking building blocks are selected from a shared library (payments, cash, home, services, cards, …).
5. **Temporary experience** — The bank is reorganised for this situation until it ends.
6. **Quiet** — Knowing when *not* to act is part of the product.

Moving is **one output** of the engine — not the product itself.

---

## Run

Needs [Node.js](https://nodejs.org/). No `npm install`.

```bash
node server.js
```

Open [http://localhost:3000](http://localhost:3000).

Works offline with a local deterministic fallback. When LM Studio is running, situation analysis can use the local model via `POST /api/analyze-groups`.

## LM Studio (optional)

Start LM Studio's local server with a model loaded (default expected: `google/gemma-4-e4b`). The app calls `http://127.0.0.1:1234/v1/chat/completions`. Configure:

```powershell
$env:LM_STUDIO_URL = "http://127.0.0.1:1234/v1/chat/completions"
$env:LM_STUDIO_MODEL = "google/gemma-4-e4b"
node server.js
```

`POST /api/analyze-groups` accepts `{ "customers": [{ "id": "...", "transactions": [...] }] }`. The classifier is customer-agnostic: demo names are only example input.

### Mathematical grouping model

For every customer, the server builds a feature vector (totals, averages, counts, time span, normalized signal tokens). Two customers receive a weighted distance; similarity ≥ `0.48` places them in the same group. Only the group representative is sent to the model; results are cached by SHA-256 fingerprint and reused for group members. When LM Studio is unavailable, the UI stays demonstrable via local fallback.

---

## Jury demo (60–90 seconds)

1. Emma’s account — signals on rental deposit, IKEA, Brico, Cambio
2. **See what we noticed** → Moving · 91%
3. **Are you moving?** → **Yes** (or **Not really** → Quiet)
4. Engine selects capabilities → **Moving Mode** (temporary)
5. **Pause payment** (and optionally update address)
6. Scroll to scale: Emma / Noah / Quiet — same engine, different outcomes

Optional: **Explore Noah** → his normal banking → **See what we noticed** → First Job Mode.

Demo bar: **Reset demo** · **Skip to Moving Mode** · **Explore Noah** / **Back to account**

---

## Challenge fit

| KBC challenge | What SHIFT demonstrates |
| --- | --- |
| Understand needs from signals | Multi-signal pattern → situation |
| Situation, behaviour, intent | Moving, First job, Quiet |
| Adapted personal experience | Temporary mode after confirmation |
| Across products & services | Cross-domain capability selection |
| Impact for 2.3M+ customers | One engine + reusable library |
| New approach, not a loose feature | Engine-first PoC; Moving is an example |

---

## Project structure

```
kbc-shift/
├── index.html
├── server.js              # Static server :3000 + optional /api/analyze-groups
├── css/styles.css
├── js/app.js              # UI + demo state machine
├── js/lib/
│   ├── demo-data.js
│   ├── situation-engine.js
│   └── types.js
└── vendor/                # React 18 UMD (local)
```

**Stack:** React 18 (`createElement`), vanilla CSS, deterministic JS engine + optional LM Studio, Node static server.
**Not in scope:** TypeScript, Tailwind, Framer Motion, npm runtime deps, auth, real banking APIs.

---

## Notes

- **Reset** clears demo state (including paused rent / address).
- **Exit Moving Mode** ends the temporary experience; completed actions stay until Reset.
- This is a **hackathon demo**, not production banking software.
